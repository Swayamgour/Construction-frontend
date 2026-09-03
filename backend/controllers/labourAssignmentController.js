import mongoose from "mongoose";
import Labour from "../models/Labour.js";
import Project from "../models/Project.js";
import LabourAssignment from "../models/LabourAssignment.js";
import Attendance from "../models/Attendance.js";
import { success, fail, getPagination, buildPagination, getDateRangeFilter } from "../utils/apiResponse.js";
import { logAudit } from "../utils/audit.js";
import { notifyRoles } from "../utils/notify.js";

/**
 * POST /api/labour/assign
 * Assigns a labour to a project for the first time (or after being fully
 * released with no active assignment). Keeps Labour.assignedProjects /
 * Project.labours in sync so existing screens built on labourController.js
 * keep working unchanged.
 */
export const assignLabourToProject = async (req, res) => {
    const session = await mongoose.startSession();
    try {
        const { labourId, projectId, assignmentDate, remarks } = req.body;
        if (!labourId || !projectId) return fail(res, 400, "labourId and projectId are required");

        const [labour, project, existingActive] = await Promise.all([
            Labour.findById(labourId),
            Project.findById(projectId),
            LabourAssignment.findOne({ labourId, status: "Active" }),
        ]);

        if (!labour) return fail(res, 404, "Labour not found");
        if (!project) return fail(res, 404, "Project not found");
        if (existingActive) {
            return fail(res, 400, `Labour already has an active assignment on project ${existingActive.projectId}. Use /transfer instead.`);
        }

        let assignment;
        await session.withTransaction(async () => {
            assignment = (
                await LabourAssignment.create(
                    [
                        {
                            labourId,
                            projectId,
                            assignmentDate: assignmentDate ? new Date(assignmentDate) : new Date(),
                            assignedBy: req.user.id,
                            remarks: remarks || "",
                            status: "Active",
                        },
                    ],
                    { session }
                )
            )[0];

            await Labour.updateOne({ _id: labourId }, { $addToSet: { assignedProjects: projectId } }, { session });
            await Project.updateOne({ _id: projectId }, { $addToSet: { labours: labourId } }, { session });
        });

        await logAudit({ module: "LabourAssignment", entityId: assignment._id, action: "assigned", performedBy: req.user.id, meta: { labourId, projectId } });
        await notifyRoles({ roles: ["manager", "admin"], projectId, title: "Labour assigned", message: `${labour.name} assigned to project`, module: "Labour", referenceType: "LabourAssignment", referenceId: assignment._id });

        return success(res, 201, "Labour assigned successfully", assignment);
    } catch (error) {
        return fail(res, 500, "Error assigning labour", error);
    } finally {
        session.endSession();
    }
};

/**
 * POST /api/labour/transfer
 * Project A -> Project B. Closes the active assignment in A (status:
 * "Transferred", releaseDate/transferDate set) and opens a new "Active"
 * one in B, linked via previousAssignmentId so full history is walkable.
 * Attendance/overtime records already carry their own projectId+date, so
 * they remain correctly attributed to whichever project was active on
 * that date — no backfilling needed.
 */
export const transferLabour = async (req, res) => {
    const session = await mongoose.startSession();
    try {
        const { labourId, toProjectId, transferDate, transferReason, remarks } = req.body;
        if (!labourId || !toProjectId) return fail(res, 400, "labourId and toProjectId are required");

        const [labour, toProject, currentAssignment] = await Promise.all([
            Labour.findById(labourId),
            Project.findById(toProjectId),
            LabourAssignment.findOne({ labourId, status: "Active" }),
        ]);

        if (!labour) return fail(res, 404, "Labour not found");
        if (!toProject) return fail(res, 404, "Destination project not found");
        if (!currentAssignment) return fail(res, 400, "Labour has no active assignment to transfer from. Use /assign instead.");
        if (String(currentAssignment.projectId) === String(toProjectId)) {
            return fail(res, 400, "Labour is already assigned to this project");
        }

        const when = transferDate ? new Date(transferDate) : new Date();
        const fromProjectId = currentAssignment.projectId;

        let newAssignment;
        await session.withTransaction(async () => {
            // 1. Close current assignment in Project A
            currentAssignment.status = "Transferred";
            currentAssignment.releaseDate = when;
            currentAssignment.transferDate = when;
            currentAssignment.transferredBy = req.user.id;
            currentAssignment.transferReason = transferReason || "";
            if (remarks) currentAssignment.remarks = remarks;
            await currentAssignment.save({ session });

            // 2. Open new assignment in Project B
            newAssignment = (
                await LabourAssignment.create(
                    [
                        {
                            labourId,
                            projectId: toProjectId,
                            previousProjectId: fromProjectId,
                            previousAssignmentId: currentAssignment._id,
                            assignmentDate: when,
                            assignedBy: req.user.id,
                            transferredBy: req.user.id,
                            transferReason: transferReason || "",
                            remarks: remarks || "",
                            status: "Active",
                        },
                    ],
                    { session }
                )
            )[0];

            // 3. Keep Labour.assignedProjects / Project.labours in sync (current-state view)
            await Labour.updateOne(
                { _id: labourId },
                { $pull: { assignedProjects: fromProjectId } },
                { session }
            );
            await Labour.updateOne(
                { _id: labourId },
                { $addToSet: { assignedProjects: toProjectId } },
                { session }
            );
            await Project.updateOne({ _id: fromProjectId }, { $pull: { labours: labourId } }, { session });
            await Project.updateOne({ _id: toProjectId }, { $addToSet: { labours: labourId } }, { session });
        });

        await logAudit({ module: "LabourAssignment", entityId: newAssignment._id, action: "transferred", performedBy: req.user.id, meta: { labourId, fromProjectId, toProjectId, transferReason } });
        await notifyRoles({ roles: ["manager", "admin"], projectId: toProjectId, title: "Labour transferred in", message: `${labour.name} transferred to this project`, module: "Labour", referenceType: "LabourAssignment", referenceId: newAssignment._id });
        await notifyRoles({ roles: ["manager", "admin"], projectId: fromProjectId, title: "Labour transferred out", message: `${labour.name} transferred out of this project`, module: "Labour", referenceType: "LabourAssignment", referenceId: currentAssignment._id });

        return success(res, 200, "Labour transferred successfully", { closedAssignment: currentAssignment, newAssignment });
    } catch (error) {
        return fail(res, 500, "Error transferring labour", error);
    } finally {
        session.endSession();
    }
};

/**
 * POST /api/labour/release
 * Releases a labour from their current active project without transferring
 * to a new one (e.g. contract ended).
 */
export const releaseLabour = async (req, res) => {
    try {
        const { labourId, releaseDate, remarks } = req.body;
        if (!labourId) return fail(res, 400, "labourId is required");

        const currentAssignment = await LabourAssignment.findOne({ labourId, status: "Active" });
        if (!currentAssignment) return fail(res, 400, "Labour has no active assignment");

        currentAssignment.status = "Released";
        currentAssignment.releaseDate = releaseDate ? new Date(releaseDate) : new Date();
        if (remarks) currentAssignment.remarks = remarks;
        await currentAssignment.save();

        await Labour.updateOne({ _id: labourId }, { $pull: { assignedProjects: currentAssignment.projectId } });
        await Project.updateOne({ _id: currentAssignment.projectId }, { $pull: { labours: labourId } });

        await logAudit({ module: "LabourAssignment", entityId: currentAssignment._id, action: "released", performedBy: req.user.id });

        return success(res, 200, "Labour released", currentAssignment);
    } catch (error) {
        return fail(res, 500, "Error releasing labour", error);
    }
};

/** GET /api/labour/:id/history — complete assignment/transfer history for one labour. */
export const getLabourAssignmentHistory = async (req, res) => {
    try {
        const history = await LabourAssignment.find({ labourId: req.params.id })
            .populate("projectId", "projectName projectCode")
            .populate("previousProjectId", "projectName projectCode")
            .populate("assignedBy", "name role")
            .populate("transferredBy", "name role")
            .sort({ assignmentDate: -1 });

        return success(res, 200, "Labour assignment history fetched", history);
    } catch (error) {
        return fail(res, 500, "Error fetching history", error);
    }
};

/**
 * GET /api/labour/:id/full-history
 * Single aggregate endpoint requested in the spec — everything about one
 * labour in one call instead of the frontend having to stitch together
 * /history, an attendance query and an overtime query itself.
 * Response shape: { labour, assignments, transfers, attendance, overtime }
 */
export const getLabourFullHistory = async (req, res) => {
    try {
        const labourId = req.params.id;

        const labour = await Labour.findById(labourId).populate("assignedProjects", "projectName projectCode");
        if (!labour) return fail(res, 404, "Labour not found");

        const [allAssignments, attendance] = await Promise.all([
            LabourAssignment.find({ labourId })
                .populate("projectId", "projectName projectCode")
                .populate("previousProjectId", "projectName projectCode")
                .populate("assignedBy", "name role")
                .populate("transferredBy", "name role")
                .sort({ assignmentDate: -1 }),
            Attendance.find({ labourId })
                .populate("projectId", "projectName projectCode")
                .sort({ date: -1 }),
        ]);

        // "assignments" = every assignment record (the full timeline);
        // "transfers" = the subset of that timeline that a transfer
        // touched — both the record it closed (status "Transferred") and
        // the record it opened (transferredBy set) — so a transfer shows
        // up as a matched pair rather than being lost inside a flat list.
        const transfers = allAssignments.filter(
            (a) => a.status === "Transferred" || a.transferredBy
        );

        // "overtime" = the attendance records that actually carry an
        // overtime component, pulled from the same Attendance collection
        // (overtime isn't a separate model in this schema — it's fields
        // on each attendance record).
        const overtime = attendance.filter(
            (a) => (a.overtimeHours && a.overtimeHours > 0) || a.overtimeApprovalStatus
        );

        return success(res, 200, "Labour full history fetched", {
            labour,
            assignments: allAssignments,
            transfers,
            attendance,
            overtime,
        });
    } catch (error) {
        return fail(res, 500, "Error fetching labour full history", error);
    }
};

/** GET /api/projects/:projectId/labour — labour currently active on a project, with pagination/search. */
export const getProjectActiveLabour = async (req, res) => {
    try {
        const { page, limit, skip } = getPagination(req);
        const filter = { projectId: req.params.projectId, status: "Active" };

        const [assignments, total] = await Promise.all([
            LabourAssignment.find(filter)
                .populate({ path: "labourId", select: "name phone labourType category skillLevel status" })
                .sort({ assignmentDate: -1 })
                .skip(skip)
                .limit(limit),
            LabourAssignment.countDocuments(filter),
        ]);

        return success(res, 200, "Project labour fetched", assignments, buildPagination(page, limit, total));
    } catch (error) {
        return fail(res, 500, "Error fetching project labour", error);
    }
};

/** GET /api/labour/assignments — admin/manager listing with filters (project, status, date range). */
export const listLabourAssignments = async (req, res) => {
    try {
        const { page, limit, skip } = getPagination(req);
        const { projectId, status, labourId } = req.query;

        const filter = {};
        if (projectId) filter.projectId = projectId;
        if (status) filter.status = status;
        if (labourId) filter.labourId = labourId;
        Object.assign(filter, getDateRangeFilter(req, "assignmentDate"));

        const [items, total] = await Promise.all([
            LabourAssignment.find(filter)
                .populate("labourId", "name phone")
                .populate("projectId", "projectName projectCode")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            LabourAssignment.countDocuments(filter),
        ]);

        return success(res, 200, "Labour assignments fetched", items, buildPagination(page, limit, total));
    } catch (error) {
        return fail(res, 500, "Error fetching assignments", error);
    }
};
