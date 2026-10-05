import mongoose from "mongoose";
import Attendance from "../models/Attendance.js";
import Labour from "../models/Labour.js";
import LabourAssignment from "../models/LabourAssignment.js";
import Project from "../models/Project.js";
import {
    getEffectiveOvertimeSettings,
    calculateWorkingTime,
    applyWeeklyOvertime,
} from "../utils/overtime.js";
import {
    success,
    fail,
    getPagination,
    buildPagination,
    getDateRangeFilter,
} from "../utils/apiResponse.js";
import { logAudit } from "../utils/audit.js";
import { notifyRoles } from "../utils/notify.js";

/* =========================================================================
   WORKFLOW
   1. Manager assigns labour to project   (Project.labours + Labour.assignedProjects)
   2. Supervisor / Manager: punch-in  -> punch-out  (overtime auto-calculated)
   3. Record goes to "Pending"  ->  ADMIN approves / rejects (attendance + overtime)
   4. On approval wages are calculated and the record is LOCKED
   5. Admin sees everything, manager sees own projects, supervisor sees own projects
   ========================================================================= */

const VALID_STATUS = ["Present", "Absent", "Half-Day"];

/* ----------------------------- helpers -------------------------------- */

const startOfDay = (d = new Date()) => {
    const dt = new Date(d);
    dt.setHours(0, 0, 0, 0);
    return dt;
};

const nowHHmm = () => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

const isValidTime = (t) => /^([01]\d|2[0-3]):[0-5]\d$/.test(t);
const isObjId = (id) => mongoose.Types.ObjectId.isValid(id);
const round2 = (n) => Math.round((Number(n) || 0) * 100) / 100;

const httpError = (status, message) => Object.assign(new Error(message), { status });

const sendError = (res, err, fallbackMessage) =>
    res.status(err.status || 500).json({
        message: err.status ? err.message : fallbackMessage,
        error: err.message,
    });

const isLocked = (att) => att.approvalStatus === "Approved" || Boolean(att.approvedBy);

/** Labour must exist, be Active and be assigned to this project. */
const getAssignedLabour = async (projectId, labourId) => {
    if (!isObjId(projectId) || !isObjId(labourId)) {
        throw httpError(400, "Invalid projectId or labourId");
    }

    const labour = await Labour.findById(labourId);
    if (!labour) throw httpError(404, "Labour not found");
    if (labour.status !== "Active") throw httpError(400, `Labour is ${labour.status}`);

    let activeAssignment = await LabourAssignment.findOne({
        labourId,
        projectId,
        status: "Active",
    });

    let assigned = (labour.assignedProjects || []).some(
        (p) => String(p) === String(projectId)
    );

    if (activeAssignment && !assigned) {
        await Labour.findByIdAndUpdate(labourId, {
            $addToSet: { assignedProjects: projectId },
        });
        assigned = true;
    }

    if (!assigned && !activeAssignment) {
        throw httpError(400, "Labour is not assigned to this project");
    }

    return { labour, assignmentId: activeAssignment?._id || null };
};

/** A labour cannot be paid in two projects for the same day. */
const ensureNotMarkedElsewhere = async (labourId, projectId, day) => {
    const other = await Attendance.findOne({
        labourId,
        date: day,
        projectId: { $ne: projectId },
        status: { $in: ["Present", "Half-Day"] },
    }).populate("projectId", "projectName");

    if (other) {
        throw httpError(
            400,
            `Labour is already marked ${other.status} today in ${other.projectId?.projectName || "another project"}`
        );
    }
};

/** null = admin (all projects), otherwise array of project ids the user can see. */
const getScopedProjectIds = async (user) => {
    if (user.role === "admin") return null;

    const query =
        user.role === "manager"
            ? { managerId: user.id }
            : { $or: [{ supervisors: user.id }, { projectIncharge: user.id }] };

    const projects = await Project.find(query).select("_id");
    return projects.map((p) => p._id);
};

/** Adds projectId filter. Returns false when user may not see that project. */
const applyProjectScope = (filter, scopedIds, projectId) => {
    if (projectId) {
        if (!isObjId(projectId)) return false;
        if (scopedIds && !scopedIds.some((id) => String(id) === String(projectId))) return false;
        filter.projectId = new mongoose.Types.ObjectId(projectId);
    } else if (scopedIds) {
        filter.projectId = { $in: scopedIds };
    }
    return true;
};

/** Regular + overtime calculation from punch times (see utils/overtime.js). */
const buildWorkingTimeUpdate = async ({ projectId, labour, date, checkInTime, checkOutTime }) => {
    const settings = await getEffectiveOvertimeSettings(projectId);

    const hourlyRate =
        labour.wageType === "Daily" && labour.dailyWage
            ? +(labour.dailyWage / (settings.standardWorkingHours || 8)).toFixed(2)
            : settings.regularRate;

    const calc = calculateWorkingTime({ checkInTime, checkOutTime, settings, hourlyRate });

    const finalCalc = await applyWeeklyOvertime({
        labourId: labour._id,
        projectId,
        date,
        dailyCalc: calc,
        settings,
    });

    return {
        ...finalCalc,
        checkInTime,
        checkOutTime,
        timeIn: checkInTime,
        timeOut: checkOutTime,
        overtimeApprovalStatus: finalCalc.overtimeHours > 0 ? "Pending" : "Not Applicable",
        isOvertimeApproved: false,
        approvedOvertimeHours: 0,
        overtimeApprovedBy: null,
        overtimeApprovedAt: null,
    };
};

/** Final payable amount. Overtime is paid only after admin approved it. */
const recalcPayable = (att, labour) => {
    const daily =
        labour?.wageType === "Monthly"
            ? (labour.monthlySalary || 0) / 26
            : labour?.dailyWage || 0;

    const hasPunchCalc = Boolean(att.checkOutTime);
    let regular = 0;

    if (att.status === "Present") regular = hasPunchCalc ? att.regularAmount : daily;
    else if (att.status === "Half-Day") regular = hasPunchCalc ? att.regularAmount : daily / 2;

    const overtime = att.overtimeApprovalStatus === "Approved" ? att.overtimeAmount || 0 : 0;

    att.regularAmount = round2(regular);
    att.dailyWageAmount = round2(regular + overtime);
    att.totalAmount = att.dailyWageAmount;
    att.wageCalculated = true;
};

const markOvertimeApproved = (att, adminId) => {
    att.overtimeApprovalStatus = "Approved";
    att.isOvertimeApproved = true;
    att.approvedOvertimeHours = att.overtimeHours;
    att.overtimeApprovedBy = adminId;
    att.overtimeApprovedAt = new Date();
    att.overtimeRejectionReason = "";
};

/** Approve one attendance record (admin only - checked by the caller). */
const approveOne = async (record, adminId, { approveOvertime = false } = {}) => {
    if (isLocked(record)) throw httpError(400, "Already approved");

    if (record.status !== "Absent" && record.checkInTime && !record.checkOutTime) {
        throw httpError(400, "Labour has not punched out yet");
    }

    if (approveOvertime && record.overtimeApprovalStatus === "Pending") {
        markOvertimeApproved(record, adminId);
    }

    const labour = await Labour.findById(record.labourId);
    recalcPayable(record, labour);

    record.approvalStatus = "Approved";
    record.approvedBy = adminId;
    record.approvedAt = new Date();
    record.rejectedBy = null;
    record.rejectedAt = null;
    record.rejectionReason = "";
    await record.save();

    await logAudit({
        module: "LabourAttendance",
        entityId: record._id,
        action: "approved",
        performedBy: adminId,
        meta: { payable: record.dailyWageAmount },
    });

    return record;
};

const adminOnly = (req) => {
    if (req.user.role !== "admin") throw httpError(403, "Only admin can perform this action");
};

/* ===================== PUNCH IN ======================================== */
/**
 * POST body: { projectId, labourId, checkInTime? "HH:mm", latitude?, longitude?, shift? }
 * optional multipart file field: selfie
 */
export const punchInLabour = async (req, res) => {
    try {
        const { projectId, labourId, checkInTime, latitude, longitude, shift } = req.body;

        if (!projectId || !labourId) {
            throw httpError(400, "projectId and labourId are required");
        }

        const time = checkInTime || nowHHmm();
        if (!isValidTime(time)) throw httpError(400, "checkInTime must be HH:mm");

        const { labour, assignmentId } = await getAssignedLabour(projectId, labourId);

        const today = startOfDay();

        if (await Attendance.findOne({ projectId, labourId, date: today })) {
            throw httpError(400, "Attendance already marked today");
        }
        await ensureNotMarkedElsewhere(labourId, projectId, today);

        const attendance = await Attendance.create({
            projectId,
            labourId,
            assignmentId,
            date: today,
            status: "Present",
            shift: shift || "Morning",
            checkInTime: time,
            timeIn: time,
            latitude: latitude ? Number(latitude) : undefined,
            longitude: longitude ? Number(longitude) : undefined,
            selfie: req.file ? `/uploads/attendance/selfies/${req.file.filename}` : undefined,
            timestamp: new Date(),
            approvalStatus: "Pending",
            markedBy: req.user.id,
        });

        await logAudit({
            module: "LabourAttendance",
            entityId: attendance._id,
            action: "punch-in",
            performedBy: req.user.id,
        });

        return res.status(201).json({ message: "Punched in", attendance });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ message: "Attendance already marked today" });
        }
        return sendError(res, err, "Punch-in error");
    }
};

/* ===================== PUNCH OUT ======================================= */
/**
 * POST body: { projectId, labourId, checkOutTime? "HH:mm", date? "YYYY-MM-DD" }
 * `date` is optional so a forgotten punch-out of an earlier day can be completed.
 */
export const punchOutLabour = async (req, res) => {
    try {
        const { projectId, labourId, checkOutTime, date } = req.body;

        if (!projectId || !labourId) {
            throw httpError(400, "projectId and labourId are required");
        }

        const time = checkOutTime || nowHHmm();
        if (!isValidTime(time)) throw httpError(400, "checkOutTime must be HH:mm");

        const { labour } = await getAssignedLabour(projectId, labourId);
        const day = date ? startOfDay(date) : startOfDay();

        const record = await Attendance.findOne({ projectId, labourId, date: day });
        if (!record) throw httpError(404, "No punch-in found for this day");
        if (isLocked(record)) throw httpError(400, "Record is already approved and locked");
        if (!record.checkInTime) throw httpError(400, "This record has no punch-in time");
        if (record.checkOutTime) throw httpError(400, "Already punched out");

        const update = await buildWorkingTimeUpdate({
            projectId,
            labour,
            date: day,
            checkInTime: record.checkInTime,
            checkOutTime: time,
        });

        Object.assign(record, update);
        record.approvalStatus = "Pending";
        await record.save();

        await logAudit({
            module: "LabourAttendance",
            entityId: record._id,
            action: "punch-out",
            performedBy: req.user.id,
            meta: { overtimeHours: record.overtimeHours },
        });

        if (record.overtimeHours > 0) {
            await notifyRoles({
                roles: ["admin"],
                projectId,
                title: "Overtime pending approval",
                message: `${labour.name} logged ${record.overtimeHours}h overtime`,
                module: "Labour",
                referenceType: "Attendance",
                referenceId: record._id,
            });
        }

        return res.status(200).json({ message: "Punched out", attendance: record });
    } catch (err) {
        return sendError(res, err, "Punch-out error");
    }
};

/* ===================== MARK SINGLE (manual) ============================ */
/**
 * Used for Absent / Half-Day / manual Present.
 * Overtime is NOT accepted as a typed value - it is calculated only when both
 * timeIn and timeOut are given (or via punch-in / punch-out).
 */
export const markLabourAttendance = async (req, res) => {
    try {
        const { projectId, labourId, status, timeIn, timeOut, absentReason, remarks, shift } = req.body;

        if (!projectId || !labourId || !status) {
            throw httpError(400, "Required fields missing");
        }
        if (!VALID_STATUS.includes(status)) {
            throw httpError(400, `status must be one of: ${VALID_STATUS.join(", ")}`);
        }
        if ((timeIn && !isValidTime(timeIn)) || (timeOut && !isValidTime(timeOut))) {
            throw httpError(400, "Times must be in HH:mm format");
        }

        const { labour, assignmentId } = await getAssignedLabour(projectId, labourId);
        const today = startOfDay();

        if (await Attendance.findOne({ projectId, labourId, date: today })) {
            throw httpError(400, "Attendance already marked today");
        }
        if (status !== "Absent") await ensureNotMarkedElsewhere(labourId, projectId, today);

        let timeFields = {};
        if (status !== "Absent") {
            if (timeIn && timeOut) {
                timeFields = await buildWorkingTimeUpdate({
                    projectId,
                    labour,
                    date: today,
                    checkInTime: timeIn,
                    checkOutTime: timeOut,
                });
            } else if (timeIn) {
                timeFields = { checkInTime: timeIn, timeIn };
            }
        }

        const attendance = await Attendance.create({
            projectId,
            labourId,
            assignmentId,
            date: today,
            status,
            shift: shift || "Morning",
            absentReason: status === "Absent" ? absentReason || "" : "",
            remarks: remarks || "",
            ...timeFields,
            approvalStatus: "Pending",
            markedBy: req.user.id,
        });

        return res.status(201).json(attendance);
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ message: "Attendance already marked today" });
        }
        return sendError(res, err, "Marking error");
    }
};

/* ===================== MARK BULK (manual) ============================== */
export const markBulkLabourAttendance = async (req, res) => {
    try {
        const { projectId, attendance } = req.body;
        const markedBy = req.user.id;

        if (!projectId || !isObjId(projectId) || !Array.isArray(attendance) || attendance.length === 0) {
            throw httpError(400, "Invalid data");
        }

        const today = startOfDay();
        const skipped = [];

        // Only active labours assigned to this project
        const labourIds = attendance.map((a) => a.labourId).filter(isObjId);

        const activeAssignments = await LabourAssignment.find({
            labourId: { $in: labourIds },
            projectId,
            status: "Active",
        }).select("labourId _id");
        const assignmentMap = new Map(activeAssignments.map((a) => [String(a.labourId), a._id]));

        const validLabours = await Labour.find({
            _id: { $in: labourIds },
            status: "Active",
            $or: [
                { assignedProjects: projectId },
                { _id: { $in: activeAssignments.map((a) => a.labourId) } },
            ],
        }).select("_id");
        const validSet = new Set(validLabours.map((l) => String(l._id)));

        // Approved records are locked
        const locked = await Attendance.find({
            projectId,
            date: today,
            labourId: { $in: labourIds },
            approvalStatus: "Approved",
        }).select("labourId");
        const lockedSet = new Set(locked.map((l) => String(l.labourId)));

        const operations = [];

        for (const it of attendance) {
            const id = String(it.labourId);

            if (!validSet.has(id)) {
                skipped.push({ labourId: it.labourId, reason: "Not an active labour of this project" });
                continue;
            }
            if (!VALID_STATUS.includes(it.status)) {
                skipped.push({ labourId: it.labourId, reason: "Invalid status" });
                continue;
            }
            if (lockedSet.has(id)) {
                skipped.push({ labourId: it.labourId, reason: "Already approved" });
                continue;
            }
            if ((it.timeIn && !isValidTime(it.timeIn)) || (it.timeOut && !isValidTime(it.timeOut))) {
                skipped.push({ labourId: it.labourId, reason: "Invalid time format (HH:mm)" });
                continue;
            }

            const assignmentId = assignmentMap.get(id) || null;

            operations.push({
                updateOne: {
                    filter: { projectId, labourId: it.labourId, date: today },
                    update: {
                        $set: {
                            assignmentId,
                            status: it.status,
                            checkInTime: it.timeIn || null,
                            checkOutTime: it.timeOut || null,
                            timeIn: it.timeIn || null,
                            timeOut: it.timeOut || null,
                            absentReason: it.status === "Absent" ? it.absentReason || "" : "",
                            approvalStatus: "Pending",
                            markedBy,
                        },
                    },
                    upsert: true,
                },
            });
        }

        if (operations.length === 0) {
            return res.status(400).json({ message: "Nothing to save", skipped });
        }

        const result = await Attendance.bulkWrite(operations);

        return res.status(200).json({
            message: "Bulk attendance recorded successfully",
            matched: result.matchedCount,
            modified: result.modifiedCount,
            upserted: result.upsertedCount,
            skipped,
        });
    } catch (err) {
        return sendError(res, err, "Bulk error");
    }
};

/* ===================== ADMIN: APPROVE / REJECT ========================= */
/** body: { attendanceId, approveOvertime?: boolean } */
export const approveLabourAttendance = async (req, res) => {
    try {
        adminOnly(req);

        const { attendanceId, approveOvertime } = req.body;
        if (!attendanceId || !isObjId(attendanceId)) {
            throw httpError(400, "attendanceId required");
        }

        const record = await Attendance.findById(attendanceId);
        if (!record) throw httpError(404, "Record not found");

        await approveOne(record, req.user.id, { approveOvertime: Boolean(approveOvertime) });

        return res.status(200).json({ message: "Approved", attendance: record });
    } catch (err) {
        return sendError(res, err, "Approval error");
    }
};

/** body: { attendanceIds: [], approveOvertime?: boolean } */
export const approveBulkLabourAttendance = async (req, res) => {
    try {
        adminOnly(req);

        const { attendanceIds, approveOvertime } = req.body;
        if (!Array.isArray(attendanceIds) || attendanceIds.length === 0) {
            throw httpError(400, "attendanceIds array required");
        }

        const approved = [];
        const failed = [];

        for (const id of attendanceIds) {
            try {
                if (!isObjId(id)) throw httpError(400, "Invalid id");
                const record = await Attendance.findById(id);
                if (!record) throw httpError(404, "Record not found");
                await approveOne(record, req.user.id, { approveOvertime: Boolean(approveOvertime) });
                approved.push(id);
            } catch (e) {
                failed.push({ id, reason: e.message });
            }
        }

        return res.status(200).json({
            message: `${approved.length} approved, ${failed.length} failed`,
            approved,
            failed,
        });
    } catch (err) {
        return sendError(res, err, "Bulk approval error");
    }
};

/** body: { attendanceId, reason } - sends it back to the manager for correction */
export const rejectLabourAttendance = async (req, res) => {
    try {
        adminOnly(req);

        const { attendanceId, reason } = req.body;
        if (!attendanceId || !isObjId(attendanceId)) throw httpError(400, "attendanceId required");
        if (!reason || !String(reason).trim()) throw httpError(400, "Rejection reason is required");

        const record = await Attendance.findById(attendanceId);
        if (!record) throw httpError(404, "Record not found");
        if (isLocked(record)) throw httpError(400, "Approved record cannot be rejected");

        record.approvalStatus = "Rejected";
        record.rejectedBy = req.user.id;
        record.rejectedAt = new Date();
        record.rejectionReason = String(reason).trim();
        await record.save();

        await logAudit({
            module: "LabourAttendance",
            entityId: record._id,
            action: "rejected",
            performedBy: req.user.id,
            remarks: record.rejectionReason,
        });

        await notifyRoles({
            roles: ["manager"],
            projectId: record.projectId,
            title: "Attendance rejected",
            message: record.rejectionReason,
            module: "Labour",
            referenceType: "Attendance",
            referenceId: record._id,
        });

        return res.status(200).json({ message: "Rejected", attendance: record });
    } catch (err) {
        return sendError(res, err, "Reject error");
    }
};

/* ===================== PENDING LIST (role scoped) ====================== */
/** admin: all projects | manager / supervisor: only their projects */
export const getPendingLabourAttendance = async (req, res) => {
    try {
        const scopedIds = await getScopedProjectIds(req.user);
        const filter = { approvalStatus: "Pending" };

        if (!applyProjectScope(filter, scopedIds, req.query.projectId)) {
            return res.status(403).json({ message: "Access denied for this project" });
        }

        const pending = await Attendance.find(filter)
            .populate("projectId", "projectName projectCode managerId")
            .populate("labourId", "labourId name phone skillLevel category")
            .populate("markedBy", "name")
            .sort({ date: -1, createdAt: -1 })
            .lean();

        const data = pending.map((p) => ({
            ...p,
            awaitingPunchOut: p.status !== "Absent" && Boolean(p.checkInTime) && !p.checkOutTime,
        }));

        return res.status(200).json({
            message: "Pending fetched",
            count: data.length,
            data,
        });
    } catch (err) {
        return sendError(res, err, "Fetch error");
    }
};

/* ===================== ALL RECORDS (history / report) ================== */
/**
 * GET ?projectId&labourId&status&approvalStatus&overtimeStatus&from&to&page&limit
 * admin: everything | manager & supervisor: own projects only
 */
export const getLabourAttendanceRecords = async (req, res) => {
    try {
        const { page, limit, skip } = getPagination(req);
        const { projectId, labourId, status, approvalStatus, overtimeStatus } = req.query;

        const scopedIds = await getScopedProjectIds(req.user);
        const filter = {};

        if (!applyProjectScope(filter, scopedIds, projectId)) {
            return fail(res, 403, "Access denied for this project");
        }
        if (labourId && isObjId(labourId)) filter.labourId = new mongoose.Types.ObjectId(labourId);
        if (status) filter.status = status;
        if (approvalStatus) filter.approvalStatus = approvalStatus;
        if (overtimeStatus) filter.overtimeApprovalStatus = overtimeStatus;
        Object.assign(filter, getDateRangeFilter(req, "date"));

        const [items, total, agg] = await Promise.all([
            Attendance.find(filter)
                .populate("projectId", "projectName projectCode")
                .populate("labourId", "labourId name phone category skillLevel labourType dailyWage fatherName")
                .populate("markedBy", "name")
                .populate("approvedBy", "name")
                .sort({ date: -1, createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Attendance.countDocuments(filter),
            Attendance.aggregate([
                { $match: filter },
                {
                    $group: {
                        _id: null,
                        present: { $sum: { $cond: [{ $eq: ["$status", "Present"] }, 1, 0] } },
                        halfDay: { $sum: { $cond: [{ $eq: ["$status", "Half-Day"] }, 1, 0] } },
                        absent: { $sum: { $cond: [{ $eq: ["$status", "Absent"] }, 1, 0] } },
                        pendingApproval: { $sum: { $cond: [{ $eq: ["$approvalStatus", "Pending"] }, 1, 0] } },
                        overtimeHours: { $sum: "$overtimeHours" },
                        approvedOvertimeHours: { $sum: "$approvedOvertimeHours" },
                        approvedWages: {
                            $sum: { $cond: [{ $eq: ["$approvalStatus", "Approved"] }, "$dailyWageAmount", 0] },
                        },
                    },
                },
            ]),
        ]);

        const summary = agg[0] || {
            present: 0,
            halfDay: 0,
            absent: 0,
            pendingApproval: 0,
            overtimeHours: 0,
            approvedOvertimeHours: 0,
            approvedWages: 0,
        };
        delete summary._id;

        return success(res, 200, "Attendance records fetched", { items, summary }, buildPagination(page, limit, total));
    } catch (err) {
        return fail(res, 500, "Error fetching attendance records", err);
    }
};

/* ===================== PROJECT LABOUR LIST ============================= */
/** Active labours assigned to the project */
export const getLaboursByProject = async (req, res) => {
    try {
        const { projectId } = req.query;
        if (!projectId || !isObjId(projectId)) {
            return res.status(400).json({ message: "Valid projectId is required" });
        }

        const data = await Labour.find({ assignedProjects: projectId, status: "Active" });
        return res.status(200).json(data);
    } catch (err) {
        return sendError(res, err, "Error fetching labours");
    }
};

/** Marking screen: every assigned labour + today's attendance (or null) */
export const getLabourTodayStatus = async (req, res) => {
    try {
        const { projectId } = req.query;
        if (!projectId || !isObjId(projectId)) {
            return fail(res, 400, "Valid projectId is required");
        }

        const today = startOfDay();

        const [labours, records] = await Promise.all([
            Labour.find({ assignedProjects: projectId, status: "Active" })
                .select("name phone category skillLevel wageType dailyWage")
                .lean(),
            Attendance.find({ projectId, date: today }).lean(),
        ]);

        const byLabour = new Map(records.map((r) => [String(r.labourId), r]));

        const data = labours.map((l) => {
            const att = byLabour.get(String(l._id)) || null;
            let state = "Not Marked";
            if (att) {
                if (att.status === "Absent") state = "Absent";
                else if (att.checkInTime && !att.checkOutTime) state = "Punched In";
                else state = "Completed";
            }
            return { labour: l, attendance: att, state };
        });

        return success(res, 200, "Today's status fetched", data);
    } catch (err) {
        return fail(res, 500, "Error fetching today's status", err);
    }
};

/** Today's present labours - now filtered by project / role scope */
export const getTodaysPresentLabours = async (req, res) => {
    try {
        const today = startOfDay();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const scopedIds = await getScopedProjectIds(req.user);
        const filter = { status: "Present", date: { $gte: today, $lt: tomorrow } };

        if (!applyProjectScope(filter, scopedIds, req.query.projectId)) {
            return res.status(403).json({ message: "Access denied for this project" });
        }

        const records = await Attendance.find(filter)
            .populate("labourId")
            .sort({ createdAt: -1 });

        return res.status(200).json(records);
    } catch (err) {
        return sendError(res, err, "Error fetching today's present labours");
    }
};

/* =========================================================================
   WORKING TIME & OVERTIME ENGINE (existing exports, now with locks + checks)
   ========================================================================= */

/** Full working-time entry for any date (upsert). Locked once approved. */
export const recordLabourWorkingTime = async (req, res) => {
    try {
        const { projectId, labourId, date, checkInTime, checkOutTime, status, remarks } = req.body;

        if (!projectId || !labourId || !checkInTime || !checkOutTime) {
            return fail(res, 400, "projectId, labourId, checkInTime and checkOutTime are required");
        }
        if (!isValidTime(checkInTime) || !isValidTime(checkOutTime)) {
            return fail(res, 400, "Times must be in HH:mm format");
        }

        const { labour, assignmentId } = await getAssignedLabour(projectId, labourId);

        const day = startOfDay(date || new Date());

        const existing = await Attendance.findOne({ projectId, labourId, date: day });
        if (existing && isLocked(existing)) {
            return fail(res, 400, "Record is already approved and locked");
        }

        const update = await buildWorkingTimeUpdate({
            projectId,
            labour,
            date: day,
            checkInTime,
            checkOutTime,
        });

        const attendance = await Attendance.findOneAndUpdate(
            { projectId, labourId, date: day },
            {
                $set: {
                    ...update,
                    projectId,
                    labourId,
                    assignmentId,
                    date: day,
                    status: status || "Present",
                    remarks: remarks || "",
                    approvalStatus: "Pending",
                    markedBy: req.user.id,
                },
            },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        await logAudit({
            module: "LabourAttendance",
            entityId: attendance._id,
            action: "recorded",
            performedBy: req.user.id,
            meta: { overtimeHours: attendance.overtimeHours },
        });

        if (attendance.overtimeHours > 0) {
            await notifyRoles({
                roles: ["admin"],
                projectId,
                title: "Overtime pending approval",
                message: `${labour.name} logged ${attendance.overtimeHours}h overtime`,
                module: "Labour",
                referenceType: "Attendance",
                referenceId: attendance._id,
            });
        }

        return success(res, 200, "Working time recorded", attendance);
    } catch (err) {
        if (err.status) return fail(res, err.status, err.message);
        return fail(res, 500, "Error recording working time", err);
    }
};

/** PATCH /overtime/:id/approve  (admin only) */
export const approveOvertime = async (req, res) => {
    try {
        adminOnly(req);

        const attendance = await Attendance.findById(req.params.id);
        if (!attendance) return fail(res, 404, "Attendance record not found");
        if (attendance.overtimeApprovalStatus !== "Pending") {
            return fail(res, 400, `Overtime is already ${attendance.overtimeApprovalStatus}`);
        }

        markOvertimeApproved(attendance, req.user.id);

        // Attendance already approved earlier -> refresh the payable amount
        if (attendance.wageCalculated) {
            recalcPayable(attendance, await Labour.findById(attendance.labourId));
        }
        await attendance.save();

        await logAudit({
            module: "LabourOvertime",
            entityId: attendance._id,
            action: "approved",
            performedBy: req.user.id,
        });

        return success(res, 200, "Overtime approved", attendance);
    } catch (err) {
        if (err.status) return fail(res, err.status, err.message);
        return fail(res, 500, "Error approving overtime", err);
    }
};

/** PATCH /overtime/:id/reject  (admin only) */
export const rejectOvertime = async (req, res) => {
    try {
        adminOnly(req);

        const { reason } = req.body;
        const attendance = await Attendance.findById(req.params.id);
        if (!attendance) return fail(res, 404, "Attendance record not found");
        if (attendance.overtimeApprovalStatus !== "Pending") {
            return fail(res, 400, `Overtime is already ${attendance.overtimeApprovalStatus}`);
        }

        attendance.overtimeApprovalStatus = "Rejected";
        attendance.isOvertimeApproved = false;
        attendance.approvedOvertimeHours = 0;
        attendance.overtimeAmount = 0;
        attendance.overtimeApprovedBy = req.user.id;
        attendance.overtimeApprovedAt = new Date();
        attendance.overtimeRejectionReason = reason || "";

        if (attendance.wageCalculated) {
            recalcPayable(attendance, await Labour.findById(attendance.labourId));
        } else {
            attendance.totalAmount = attendance.regularAmount;
        }
        await attendance.save();

        await logAudit({
            module: "LabourOvertime",
            entityId: attendance._id,
            action: "rejected",
            performedBy: req.user.id,
            remarks: reason,
        });

        return success(res, 200, "Overtime rejected", attendance);
    } catch (err) {
        if (err.status) return fail(res, err.status, err.message);
        return fail(res, 500, "Error rejecting overtime", err);
    }
};

/**
 * PATCH /overtime/:id/correct
 * Fix a wrong check-in/out. Manager can correct only until admin approves;
 * admin can correct anytime (record goes back to Pending).
 */
export const correctOvertime = async (req, res) => {
    try {
        const { checkInTime, checkOutTime, remarks } = req.body;

        if ((checkInTime && !isValidTime(checkInTime)) || (checkOutTime && !isValidTime(checkOutTime))) {
            return fail(res, 400, "Times must be in HH:mm format");
        }

        const attendance = await Attendance.findById(req.params.id);
        if (!attendance) return fail(res, 404, "Attendance record not found");

        if (isLocked(attendance) && req.user.role !== "admin") {
            return fail(res, 403, "Approved record can only be corrected by admin");
        }

        const labour = await Labour.findById(attendance.labourId);

        const update = await buildWorkingTimeUpdate({
            projectId: attendance.projectId,
            labour,
            date: attendance.date,
            checkInTime: checkInTime || attendance.checkInTime,
            checkOutTime: checkOutTime || attendance.checkOutTime,
        });

        Object.assign(attendance, update);

        // Back to review
        attendance.approvalStatus = "Pending";
        attendance.approvedBy = null;
        attendance.approvedAt = null;
        attendance.wageCalculated = false;
        attendance.dailyWageAmount = 0;
        if (remarks) attendance.remarks = remarks;
        await attendance.save();

        await logAudit({
            module: "LabourOvertime",
            entityId: attendance._id,
            action: "corrected",
            performedBy: req.user.id,
            meta: { checkInTime: attendance.checkInTime, checkOutTime: attendance.checkOutTime },
        });

        return success(res, 200, "Attendance corrected", attendance);
    } catch (err) {
        return fail(res, 500, "Error correcting attendance", err);
    }
};

/** GET /overtime - role scoped overtime list / report */
export const listOvertimeRecords = async (req, res) => {
    try {
        const { page, limit, skip } = getPagination(req);
        const { projectId, labourId, status } = req.query;

        const scopedIds = await getScopedProjectIds(req.user);
        const filter = { overtimeHours: { $gt: 0 } };

        if (!applyProjectScope(filter, scopedIds, projectId)) {
            return fail(res, 403, "Access denied for this project");
        }
        if (labourId && isObjId(labourId)) filter.labourId = new mongoose.Types.ObjectId(labourId);
        if (status) filter.overtimeApprovalStatus = status;
        Object.assign(filter, getDateRangeFilter(req, "date"));

        const [items, total, agg] = await Promise.all([
            Attendance.find(filter)
                .populate("labourId", "labourId name phone category")
                .populate("projectId", "projectName projectCode")
                .populate("overtimeApprovedBy", "name")
                .sort({ date: -1 })
                .skip(skip)
                .limit(limit),
            Attendance.countDocuments(filter),
            Attendance.aggregate([
                { $match: filter },
                {
                    $group: {
                        _id: null,
                        totalOvertimeHours: { $sum: "$overtimeHours" },
                        totalOvertimeAmount: { $sum: "$overtimeAmount" },
                        approvedOvertimeAmount: {
                            $sum: {
                                $cond: [{ $eq: ["$overtimeApprovalStatus", "Approved"] }, "$overtimeAmount", 0],
                            },
                        },
                    },
                },
            ]),
        ]);

        const summary = agg[0] || {
            totalOvertimeHours: 0,
            totalOvertimeAmount: 0,
            approvedOvertimeAmount: 0,
        };
        delete summary._id;

        return success(res, 200, "Overtime records fetched", { items, summary }, buildPagination(page, limit, total));
    } catch (err) {
        return fail(res, 500, "Error fetching overtime records", err);
    }
};