import Attendance from "../models/Attendance.js";
// import LabourAssign from "../models/Labour.js"; // labour assignments to project
import Labour from "../models/Labour.js"; // labour assignments to project
import mongoose from "mongoose";
import { getEffectiveOvertimeSettings, calculateWorkingTime, applyWeeklyOvertime } from "../utils/overtime.js";
import { success, fail, getPagination, buildPagination, getDateRangeFilter } from "../utils/apiResponse.js";
import { logAudit } from "../utils/audit.js";
import { notifyRoles } from "../utils/notify.js";

// import LabourAttendance from "../models/LabourAttendance.js";
// import Labour from "../models/Labour.js";


/* helper: get start-of-day Date object */
const startOfDay = (d = new Date()) => {
    const dt = new Date(d);
    dt.setHours(0, 0, 0, 0);
    return dt;
};

/* ----------------------- MARK SINGLE ATTENDANCE ------------------------ */
export const markLabourAttendance = async (req, res) => {
    try {
        const { projectId, labourId, status, timeIn, timeOut, overtimeHours } = req.body;

        if (!projectId || !labourId || !status)
            return res.status(400).json({ message: "Required fields missing" });

        const today = startOfDay();

        // check if already marked today for that labour in project
        const exists = await Attendance.findOne({ projectId, labourId, date: today });
        if (exists) return res.status(400).json({ message: "Attendance already marked today" });

        const attendance = await Attendance.create({
            projectId,
            labourId,
            status,
            timeIn: timeIn || null,
            timeOut: timeOut || null,
            overtimeHours: overtimeHours || 0,
            markedBy: req.user.id,
            date: today
        });

        res.status(201).json(attendance);

    } catch (err) {
        res.status(500).json({ message: "Marking error", error: err.message });
    }
};

/* ----------------------- MARK BULK ATTENDANCE -------------------------- */
export const markBulkLabourAttendance = async (req, res) => {
    try {
        const { projectId, attendance } = req.body;
        const markedBy = req.user.id;

        if (!projectId || !attendance || attendance.length === 0)
            return res.status(400).json({ message: "Invalid data" });

        const today = startOfDay();

        const operations = attendance.map(it => ({
            updateOne: {
                filter: {
                    projectId,
                    labourId: it.labourId,
                    date: today
                },
                update: {
                    $set: {
                        status: it.status,
                        timeIn: it.timeIn || null,
                        timeOut: it.timeOut || null,
                        overtimeHours: it.overtimeHours || 0,
                        markedBy
                    }
                },
                upsert: true   // <-- IMPORTANT
            }
        }));

        const result = await Attendance.bulkWrite(operations);

        return res.status(200).json({
            message: "Bulk attendance recorded successfully",
            matched: result.nMatched,
            modified: result.nModified,
            upserted: result.upsertedCount
        });

    } catch (err) {
        return res.status(500).json({ message: "Bulk error", error: err.message });
    }
};


/* ------------------------- APPROVE ATTENDANCE -------------------------- */
export const approveLabourAttendance = async (req, res) => {
    try {
        const { attendanceId } = req.body;

        if (!attendanceId) return res.status(400).json({ message: "attendanceId required" });

        const attendance = await Attendance.findById(attendanceId);
        if (!attendance) return res.status(404).json({ message: "Record not found" });

        if (attendance.approvedBy)
            return res.status(400).json({ message: "Already approved" });

        attendance.approvedBy = req.user.id;
        attendance.approvedAt = new Date();
        await attendance.save();

        res.status(200).json({ message: "Approved", attendance });

    } catch (err) {
        res.status(500).json({ message: "Approval error", error: err.message });
    }
};

/* ------------------------- PENDING LIST FOR MANAGER -------------------- */
export const getPendingLabourAttendance = async (req, res) => {
    try {
        const managerId = req.user.id;

        // find attendance with approvedBy null and project managed by this manager
        const pending = await Attendance.find({ approvedBy: null })
            .populate({
                path: "projectId",
                select: "projectName managerId",
                // optionally you can also `.populate("projectId.managerId", "name")` if needed
            })
            .populate("labourId", "name phone skillLevel")
            .populate("markedBy", "name")
            .sort({ createdAt: -1 });

        // filter to only projects this manager manages
        const filtered = pending.filter(p => p.projectId && String(p.projectId.managerId) === String(managerId));

        res.status(200).json({
            message: "Pending fetched",
            count: filtered.length,
            data: filtered
        });

    } catch (err) {
        res.status(500).json({ message: "Fetch error", error: err.message });
    }
};

/* --------------------------- LIST LABOURS ------------------------------- */


export const getLaboursByProject = async (req, res) => {
    try {
        const { projectId } = req.query;

        const data = await Labour.find({
            assignedProjects: projectId
        });

        return res.status(200).json(data);

    } catch (err) {
        return res.status(500).json({
            message: "Error fetching labours",
            error: err.message
        });
    }
};


/* =========================================================================
   WORKING TIME & OVERTIME ENGINE (additive — new endpoints, existing ones
   above are untouched so current attendance flows keep working)
   ========================================================================= */

/**
 * POST /api/labour/attendance
 * Records/updates a labour's full working-time entry for a date, including
 * automatic overtime calculation against configurable project working
 * hours (see utils/overtime.js). Upserts one record per labour/project/date.
 */
export const recordLabourWorkingTime = async (req, res) => {
    try {
        const { projectId, labourId, date, checkInTime, checkOutTime, status, remarks } = req.body;
        if (!projectId || !labourId || !checkInTime || !checkOutTime) {
            return fail(res, 400, "projectId, labourId, checkInTime and checkOutTime are required");
        }

        const labour = await Labour.findById(labourId);
        if (!labour) return fail(res, 404, "Labour not found");

        const settings = await getEffectiveOvertimeSettings(projectId);
        const hourlyRate = labour.wageType === "Daily" && labour.dailyWage
            ? +(labour.dailyWage / (settings.standardWorkingHours || 8)).toFixed(2)
            : settings.regularRate;

        const calc = calculateWorkingTime({ checkInTime, checkOutTime, settings, hourlyRate });

        const day = date ? new Date(date) : new Date();
        day.setHours(0, 0, 0, 0);

        // Weekly overtime threshold (configurable, see OvertimeSettings) — moves
        // hours beyond the week's threshold from regular into overtime, on top
        // of any daily overtime already computed above.
        const finalCalc = await applyWeeklyOvertime({ labourId, projectId, date: day, dailyCalc: calc, settings });

        const update = {
            projectId,
            labourId,
            date: day,
            status: status || "Present",
            checkInTime,
            checkOutTime,
            timeIn: checkInTime,
            timeOut: checkOutTime,
            ...finalCalc,
            overtimeHours: finalCalc.overtimeHours,
            overtimeApprovalStatus: finalCalc.overtimeHours > 0 ? "Pending" : "Not Applicable",
            remarks: remarks || "",
            markedBy: req.user.id,
        };

        const attendance = await Attendance.findOneAndUpdate(
            { projectId, labourId, date: day },
            { $set: update },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        await logAudit({ module: "LabourAttendance", entityId: attendance._id, action: "recorded", performedBy: req.user.id, meta: { overtimeHours: finalCalc.overtimeHours, weeklyOvertimeTriggered: !!finalCalc.weeklyOvertimeTriggered } });

        if (finalCalc.overtimeHours > 0) {
            await notifyRoles({ roles: ["manager", "admin"], projectId, title: "Overtime pending approval", message: `${labour.name} logged ${finalCalc.overtimeHours}h overtime${finalCalc.weeklyOvertimeTriggered ? " (weekly threshold)" : ""}`, module: "Labour", referenceType: "Attendance", referenceId: attendance._id });
        }

        return success(res, 200, "Working time recorded", attendance);
    } catch (err) {
        return fail(res, 500, "Error recording working time", err);
    }
};

/** PATCH /api/labour/overtime/:id/approve */
export const approveOvertime = async (req, res) => {
    try {
        const attendance = await Attendance.findById(req.params.id);
        if (!attendance) return fail(res, 404, "Attendance record not found");
        if (attendance.overtimeApprovalStatus !== "Pending") {
            return fail(res, 400, `Overtime is already ${attendance.overtimeApprovalStatus}`);
        }

        attendance.overtimeApprovalStatus = "Approved";
        attendance.isOvertimeApproved = true;
        attendance.approvedOvertimeHours = attendance.overtimeHours;
        attendance.overtimeApprovedBy = req.user.id;
        attendance.overtimeApprovedAt = new Date();
        await attendance.save();

        await logAudit({ module: "LabourOvertime", entityId: attendance._id, action: "approved", performedBy: req.user.id });
        return success(res, 200, "Overtime approved", attendance);
    } catch (err) {
        return fail(res, 500, "Error approving overtime", err);
    }
};

/** PATCH /api/labour/overtime/:id/reject */
export const rejectOvertime = async (req, res) => {
    try {
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
        attendance.totalAmount = attendance.regularAmount;
        attendance.overtimeApprovedBy = req.user.id;
        attendance.overtimeApprovedAt = new Date();
        attendance.overtimeRejectionReason = reason || "";
        await attendance.save();

        await logAudit({ module: "LabourOvertime", entityId: attendance._id, action: "rejected", performedBy: req.user.id, remarks: reason });
        return success(res, 200, "Overtime rejected", attendance);
    } catch (err) {
        return fail(res, 500, "Error rejecting overtime", err);
    }
};

/**
 * PATCH /api/labour/overtime/:id/correct
 * Manual correction of check-in/out for an already-recorded day (e.g. a
 * supervisor mis-entered a time). Recalculates hours/amounts and resets
 * approval to Pending so it goes through approval again. Fully auditable.
 */
export const correctOvertime = async (req, res) => {
    try {
        const { checkInTime, checkOutTime, remarks } = req.body;
        const attendance = await Attendance.findById(req.params.id);
        if (!attendance) return fail(res, 404, "Attendance record not found");

        const settings = await getEffectiveOvertimeSettings(attendance.projectId);
        const calc = calculateWorkingTime({
            checkInTime: checkInTime || attendance.checkInTime,
            checkOutTime: checkOutTime || attendance.checkOutTime,
            settings,
            hourlyRate: attendance.regularRate,
        });
        const finalCalc = await applyWeeklyOvertime({
            labourId: attendance.labourId,
            projectId: attendance.projectId,
            date: attendance.date,
            dailyCalc: calc,
            settings,
        });

        Object.assign(attendance, finalCalc);
        attendance.checkInTime = checkInTime || attendance.checkInTime;
        attendance.checkOutTime = checkOutTime || attendance.checkOutTime;
        attendance.overtimeApprovalStatus = finalCalc.overtimeHours > 0 ? "Pending" : "Not Applicable";
        attendance.isOvertimeApproved = false;
        attendance.overtimeApprovedBy = null;
        attendance.overtimeApprovedAt = null;
        if (remarks) attendance.remarks = remarks;
        await attendance.save();

        await logAudit({ module: "LabourOvertime", entityId: attendance._id, action: "corrected", performedBy: req.user.id, meta: finalCalc });
        return success(res, 200, "Attendance corrected", attendance);
    } catch (err) {
        return fail(res, 500, "Error correcting attendance", err);
    }
};

/** GET /api/labour/overtime — filterable list/report of overtime records. */
export const listOvertimeRecords = async (req, res) => {
    try {
        const { page, limit, skip } = getPagination(req);
        const { projectId, labourId, status } = req.query;

        const filter = { overtimeHours: { $gt: 0 } };
        if (projectId) filter.projectId = projectId;
        if (labourId) filter.labourId = labourId;
        if (status) filter.overtimeApprovalStatus = status;
        Object.assign(filter, getDateRangeFilter(req, "date"));

        const [items, total] = await Promise.all([
            Attendance.find(filter)
                .populate("labourId", "name phone category")
                .populate("projectId", "projectName projectCode")
                .populate("overtimeApprovedBy", "name")
                .sort({ date: -1 })
                .skip(skip)
                .limit(limit),
            Attendance.countDocuments(filter),
        ]);

        const summary = items.reduce(
            (acc, i) => {
                acc.totalOvertimeHours += i.overtimeHours || 0;
                acc.totalOvertimeAmount += i.overtimeAmount || 0;
                return acc;
            },
            { totalOvertimeHours: 0, totalOvertimeAmount: 0 }
        );

        return success(res, 200, "Overtime records fetched", { items, summary }, buildPagination(page, limit, total));
    } catch (err) {
        return fail(res, 500, "Error fetching overtime records", err);
    }
};

export const getTodaysPresentLabours = async (req, res) => {
    try {

        // Today start
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Tomorrow end
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const records = await Attendance.find({
            status: "Present",
            date: { $gte: today, $lt: tomorrow }
        })
            .populate("labourId")    // full labour detail
            .sort({ createdAt: -1 });

        return res.status(200).json(records);

    } catch (err) {
        return res.status(500).json({
            message: "Error fetching today's present labours",
            error: err.message
        });
    }
};



