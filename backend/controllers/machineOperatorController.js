import MachineOperatorLog from "../models/MachineOperatorLog.js";
import { getEffectiveOvertimeSettings, calculateWorkingTime } from "../utils/overtime.js";
import { success, fail, getPagination, buildPagination, getDateRangeFilter } from "../utils/apiResponse.js";
import { logAudit } from "../utils/audit.js";

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
