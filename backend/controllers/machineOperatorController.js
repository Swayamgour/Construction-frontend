import MachineOperatorLog from "../models/MachineOperatorLog.js";
import MachineAssignment from "../models/MachineAssignment.js";
import { getEffectiveOvertimeSettings, calculateWorkingTime } from "../utils/overtime.js";
import { success, fail, getPagination, buildPagination, getDateRangeFilter } from "../utils/apiResponse.js";
import { logAudit } from "../utils/audit.js";
import { notifyRoles } from "../utils/notify.js";

/**
 * ============================================================
 *  OPERATOR ASSIGNMENT LIFECYCLE
 * ============================================================
 * MachineOperatorLog (below) records individual WORKING DAYS. These four
 * functions are the separate, higher-level "who is the assigned operator
 * on this machine assignment right now" lifecycle the spec asks for:
 * assign / change / remove, each preserving a permanent history entry —
 * matching the same pattern used for Labour transfer history.
 * All four act on a MachineAssignment record (found by :assignmentId).
 * ============================================================
 */

/** POST /api/machinery/assignments/:assignmentId/operator */
export const assignOperatorToMachine = async (req, res) => {
    try {
        const { operatorId, reason } = req.body;
        if (!operatorId) return fail(res, 400, "operatorId is required");

        const assignment = await MachineAssignment.findById(req.params.assignmentId);
        if (!assignment) return fail(res, 404, "Machine assignment not found");
        if (assignment.releaseDate) return fail(res, 400, "This machine assignment has already been released");
        if (assignment.operatorId) {
            return fail(res, 400, "This machine already has an operator assigned. Use the change-operator endpoint to replace them.");
        }

        assignment.operatorId = operatorId;
        assignment.operatorHistory.push({
            action: "Assigned",
            previousOperatorId: null,
            newOperatorId: operatorId,
            reason: reason || "",
            changedBy: req.user.id,
            changedAt: new Date(),
        });
        await assignment.save();

        await logAudit({ module: "MachineOperatorLog", entityId: assignment._id, action: "operator_assigned", performedBy: req.user.id, remarks: reason || "" });
        await notifyRoles({ roles: ["admin", "manager"], title: "Operator assigned to machine", message: `Operator assigned on machine assignment ${assignment._id}`, module: "Machinery", referenceType: "MachineAssignment", referenceId: assignment._id });

        return success(res, 200, "Operator assigned", assignment);
    } catch (error) {
        return fail(res, 500, "Error assigning operator", error);
    }
};

/** PATCH /api/machinery/assignments/:assignmentId/operator/change */
export const changeOperator = async (req, res) => {
    try {
        const { operatorId, reason } = req.body;
        if (!operatorId) return fail(res, 400, "operatorId (new operator) is required");
        if (!reason || !String(reason).trim()) return fail(res, 400, "A reason is required when changing the operator");

        const assignment = await MachineAssignment.findById(req.params.assignmentId);
        if (!assignment) return fail(res, 404, "Machine assignment not found");
        if (assignment.releaseDate) return fail(res, 400, "This machine assignment has already been released");
        if (String(assignment.operatorId) === String(operatorId)) {
            return fail(res, 400, "New operator is the same as the current operator");
        }

        const previousOperatorId = assignment.operatorId || null;
        assignment.operatorId = operatorId;
        assignment.operatorHistory.push({
            action: "Changed",
            previousOperatorId,
            newOperatorId: operatorId,
            reason,
            changedBy: req.user.id,
            changedAt: new Date(),
        });
        await assignment.save();

        await logAudit({ module: "MachineOperatorLog", entityId: assignment._id, action: "operator_changed", performedBy: req.user.id, remarks: reason });
        await notifyRoles({ roles: ["admin", "manager"], title: "Machine operator changed", message: reason, module: "Machinery", referenceType: "MachineAssignment", referenceId: assignment._id });

        return success(res, 200, "Operator changed", assignment);
    } catch (error) {
        return fail(res, 500, "Error changing operator", error);
    }
};

/** PATCH /api/machinery/assignments/:assignmentId/operator/remove */
export const removeOperator = async (req, res) => {
    try {
        const { reason } = req.body;
        const assignment = await MachineAssignment.findById(req.params.assignmentId);
        if (!assignment) return fail(res, 404, "Machine assignment not found");
        if (!assignment.operatorId) return fail(res, 400, "This machine assignment has no operator to remove");

        const previousOperatorId = assignment.operatorId;
        assignment.operatorId = null;
        assignment.operatorHistory.push({
            action: "Removed",
            previousOperatorId,
            newOperatorId: null,
            reason: reason || "",
            changedBy: req.user.id,
            changedAt: new Date(),
        });
        await assignment.save();

        await logAudit({ module: "MachineOperatorLog", entityId: assignment._id, action: "operator_removed", performedBy: req.user.id, remarks: reason || "" });

        return success(res, 200, "Operator removed", assignment);
    } catch (error) {
        return fail(res, 500, "Error removing operator", error);
    }
};

/** GET /api/machinery/assignments/:assignmentId/operator/history */
export const getOperatorAssignmentHistory = async (req, res) => {
    try {
        const assignment = await MachineAssignment.findById(req.params.assignmentId)
            .populate("operatorHistory.previousOperatorId", "name role")
            .populate("operatorHistory.newOperatorId", "name role")
            .populate("operatorHistory.changedBy", "name role")
            .populate("machineId", "machineNumber machineType")
            .populate("operatorId", "name role");
        if (!assignment) return fail(res, 404, "Machine assignment not found");

        return success(res, 200, "Operator assignment history fetched", {
            machineId: assignment.machineId,
            projectId: assignment.projectId,
            currentOperator: assignment.operatorId,
            history: assignment.operatorHistory,
        });
    } catch (error) {
        return fail(res, 500, "Error fetching operator assignment history", error);
    }
};

/**
 * POST /api/machinery/:id/operator
 * Logs one operator's working day on a machine, reusing the same
 * overtime engine as Labour (utils/overtime.js) so both use one
 * configurable-hours source of truth. If a different operator is logged
 * for the same machine/date than a prior entry, both remain in history —
 * nothing is overwritten (spec: "if operator changes, previous assignment
 * must remain in history").
 */
export const logMachineOperatorDay = async (req, res) => {
    try {
        const { operatorId, projectId, date, shift, checkInTime, checkOutTime, operatorRate, openingMeterReading, closingMeterReading, fuelUsed, remarks } = req.body;
        if (!operatorId || !projectId || !date) return fail(res, 400, "operatorId, projectId and date are required");

        const settings = await getEffectiveOvertimeSettings(projectId);
        const calc = checkInTime && checkOutTime
            ? calculateWorkingTime({ checkInTime, checkOutTime, settings, hourlyRate: operatorRate || settings.regularRate })
            : { regularWorkingHours: 0, overtimeHours: 0, totalWorkingHours: 0, overtimeAmount: 0 };

        const log = await MachineOperatorLog.create({
            machineId: req.params.id,
            operatorId,
            projectId,
            date,
            shift: shift || "Morning",
            checkInTime: checkInTime || null,
            checkOutTime: checkOutTime || null,
            normalHours: calc.regularWorkingHours,
            overtimeHours: calc.overtimeHours,
            totalHours: calc.totalWorkingHours,
            operatorRate: operatorRate || settings.regularRate,
            overtimeAmount: calc.overtimeAmount,
            openingMeterReading: openingMeterReading ?? null,
            closingMeterReading: closingMeterReading ?? null,
            fuelUsed: fuelUsed || 0,
            remarks: remarks || "",
            assignedBy: req.user.id,
        });

        await logAudit({ module: "MachineOperatorLog", entityId: log._id, action: "logged", performedBy: req.user.id });
        return success(res, 201, "Operator log recorded", log);
    } catch (error) {
        return fail(res, 500, "Error logging operator day", error);
    }
};

/** GET /api/machinery/:id/operator-logs — history for a machine, newest first. */
export const listMachineOperatorLogs = async (req, res) => {
    try {
        const { page, limit, skip } = getPagination(req);
        const filter = { machineId: req.params.id };
        Object.assign(filter, getDateRangeFilter(req, "date"));

        const [items, total] = await Promise.all([
            MachineOperatorLog.find(filter)
                .populate("operatorId", "name")
                .populate("projectId", "projectName")
                .sort({ date: -1 })
                .skip(skip)
                .limit(limit),
            MachineOperatorLog.countDocuments(filter),
        ]);

        return success(res, 200, "Operator logs fetched", items, buildPagination(page, limit, total));
    } catch (error) {
        return fail(res, 500, "Error fetching operator logs", error);
    }
};

/** PATCH /api/machinery/operator-logs/:logId/approve */
export const approveOperatorLog = async (req, res) => {
    try {
        const log = await MachineOperatorLog.findByIdAndUpdate(
            req.params.logId,
            { approvalStatus: "Approved", approvedBy: req.user.id },
            { new: true }
        );
        if (!log) return fail(res, 404, "Operator log not found");
        await logAudit({ module: "MachineOperatorLog", entityId: log._id, action: "approved", performedBy: req.user.id });
        return success(res, 200, "Operator log approved", log);
    } catch (error) {
        return fail(res, 500, "Error approving operator log", error);
    }
};
