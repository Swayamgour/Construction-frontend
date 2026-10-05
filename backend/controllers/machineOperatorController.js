import MachineOperatorLog from "../models/MachineOperatorLog.js";
import MachineAssignment from "../models/MachineAssignment.js";
import Machine from "../models/Machine.js";
import { getEffectiveOvertimeSettings, calculateWorkingTime } from "../utils/overtime.js";
import { success, fail, getPagination, buildPagination, getDateRangeFilter } from "../utils/apiResponse.js";
import { logAudit } from "../utils/audit.js";
import { notifyRoles } from "../utils/notify.js";
import { validateMeterReading, calculateFuelAndCost } from "../services/machineAvailabilityService.js";

/**
 * ============================================================
 *  OPERATOR ASSIGNMENT LIFECYCLE
 * ============================================================
 * Standardized operator model: operatorId references Labour
 * (with category: "Operator" and unique serial IDs).
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
            reason: reason || "Initial assignment",
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
            reason: reason || "Operator removed",
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
            .populate("operatorHistory.previousOperatorId", "name labourId category phone")
            .populate("operatorHistory.newOperatorId", "name labourId category phone")
            .populate("operatorHistory.changedBy", "name role")
            .populate("machineId", "machineNumber machineType brand model")
            .populate("operatorId", "name labourId category phone");
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
 * Logs one operator's daily working log on a machine.
 * Validates cumulative meter, calculates working hours, fuel lifecycle, and machine costing.
 */
export const logMachineOperatorDay = async (req, res) => {
    try {
        const machineId = req.params.id;
        const {
            operatorId,
            projectId,
            assignmentId,
            date,
            shift,
            workType,
            checkInTime,
            checkOutTime,
            operatorRate,
            openingMeterReading,
            closingMeterReading,
            fuelOpening,
            fuelAdded,
            fuelClosing,
            fuelRate,
            machineHourlyRate,
            remarks,
        } = req.body;

        if (!operatorId || !projectId || !date) {
            return fail(res, 400, "operatorId, projectId, and date are required");
        }

        if (openingMeterReading === undefined || closingMeterReading === undefined) {
            return fail(res, 400, "Both openingMeterReading and closingMeterReading are required");
        }

        const machine = await Machine.findById(machineId);
        if (!machine) return fail(res, 404, "Machine not found");

        // 1. Meter Validation
        const meterVal = validateMeterReading({
            currentMachineMeter: machine.currentMeterReading || 0,
            openingMeterReading,
            closingMeterReading,
        });

        if (!meterVal.valid) {
            return fail(res, 400, meterVal.error);
        }

        const workingHours = meterVal.workingHours;

        // 2. Overtime calculation using utils/overtime.js
        const settings = await getEffectiveOvertimeSettings(projectId);
        const calc = checkInTime && checkOutTime
            ? calculateWorkingTime({ checkInTime, checkOutTime, settings, hourlyRate: operatorRate || settings.regularRate })
            : { regularWorkingHours: 0, overtimeHours: 0, totalWorkingHours: 0, overtimeAmount: 0 };

        // 3. Fuel Lifecycle and Costing
        const effHourlyRate = machineHourlyRate !== undefined ? Number(machineHourlyRate) : (machine.hourlyRate || 0);
        const costCalc = calculateFuelAndCost({
            workingHours,
            hourlyRate: effHourlyRate,
            fuelOpening: fuelOpening !== undefined ? Number(fuelOpening) : machine.currentFuelLevel || 0,
            fuelAdded: fuelAdded !== undefined ? Number(fuelAdded) : 0,
            fuelClosing: fuelClosing !== undefined ? Number(fuelClosing) : 0,
            fuelRate: fuelRate !== undefined ? Number(fuelRate) : 0,
            overtimeAmount: calc.overtimeAmount,
        });

        // Resolve active assignment if not provided
        let resolvedAssignmentId = assignmentId || null;
        if (!resolvedAssignmentId) {
            const activeAssign = await MachineAssignment.findOne({
                machineId,
                projectId,
                releaseDate: null,
            });
            if (activeAssign) resolvedAssignmentId = activeAssign._id;
        }

        const log = await MachineOperatorLog.create({
            machineId,
            assignmentId: resolvedAssignmentId,
            operatorId,
            projectId,
            date: new Date(date),
            shift: shift || "Morning",
            workType: workType || "General Site Work",
            checkInTime: checkInTime || null,
            checkOutTime: checkOutTime || null,
            normalHours: calc.regularWorkingHours,
            overtimeHours: calc.overtimeHours,
            totalHours: calc.totalWorkingHours,
            operatorRate: operatorRate || settings.regularRate,
            overtimeAmount: calc.overtimeAmount,
            openingMeterReading: Number(openingMeterReading),
            closingMeterReading: Number(closingMeterReading),
            workingHours,
            fuelOpening: fuelOpening !== undefined ? Number(fuelOpening) : machine.currentFuelLevel || 0,
            fuelAdded: fuelAdded !== undefined ? Number(fuelAdded) : 0,
            fuelClosing: fuelClosing !== undefined ? Number(fuelClosing) : 0,
            fuelConsumed: costCalc.fuelConsumed,
            fuelEfficiency: costCalc.fuelEfficiency,
            fuelRate: Number(fuelRate) || 0,
            fuelCost: costCalc.fuelCost,
            machineHourlyRate: effHourlyRate,
            machineUsageCost: costCalc.machineUsageCost,
            totalDayCost: costCalc.totalDayCost,
            remarks: remarks || "",
            assignedBy: req.user.id,
        });

        // 4. Update Machine Master with latest cumulative meter and fuel level
        machine.currentMeterReading = Number(closingMeterReading);
        if (fuelClosing !== undefined) {
            machine.currentFuelLevel = Number(fuelClosing);
        }
        await machine.save();

        await logAudit({ module: "MachineOperatorLog", entityId: log._id, action: "logged", performedBy: req.user.id });
        return success(res, 201, "Operator log recorded successfully", log);
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
                .populate("operatorId", "name labourId category phone")
                .populate("projectId", "name code projectName")
                .populate("assignedBy", "name role")
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

