import mongoose from "mongoose";
import Attendance from "../models/Attendance.js";
import StockLedger from "../models/stockLedgerSchema.js";
import MachineOperatorLog from "../models/MachineOperatorLog.js";
import MachineMaintenance from "../models/MachineMaintenance.js";
import ProjectDelay from "../models/ProjectDelay.js";
import EODReport from "../models/EODReport.js";
import { success, fail, getPagination, buildPagination, getDateRangeFilter } from "../utils/apiResponse.js";

/** GET /api/reports/labour-overtime?project&dateFrom&dateTo&labour&status */
export const labourOvertimeReport = async (req, res) => {
    try {
        const { page, limit, skip } = getPagination(req);
        const { project, labour, status } = req.query;

        const filter = { overtimeHours: { $gt: 0 } };
        if (project) filter.projectId = project;
        if (labour) filter.labourId = labour;
        if (status) filter.overtimeApprovalStatus = status;
        Object.assign(filter, getDateRangeFilter(req, "date"));

        const [items, total, agg] = await Promise.all([
            Attendance.find(filter).populate("labourId", "name phone category labourType dailyWage").populate("projectId", "projectName").sort({ date: -1 }).skip(skip).limit(limit),
            Attendance.countDocuments(filter),
            Attendance.aggregate([
                { $match: filter },
                { $group: { _id: null, totalOvertimeHours: { $sum: "$overtimeHours" }, totalOvertimeAmount: { $sum: "$overtimeAmount" } } },
            ]),
        ]);

        return success(res, 200, "Labour overtime report", { items, summary: agg[0] || { totalOvertimeHours: 0, totalOvertimeAmount: 0 } }, buildPagination(page, limit, total));
    } catch (error) {
        return fail(res, 500, "Error generating labour overtime report", error);
    }
};

/** GET /api/reports/stock?project&material&dateFrom&dateTo */
export const stockReport = async (req, res) => {
    try {
        const { page, limit, skip } = getPagination(req);
        const { project, material } = req.query;

        const filter = {};
        if (project) filter.projectId = project;
        if (material) filter.itemId = material;
        Object.assign(filter, getDateRangeFilter(req));

        const [items, total, agg] = await Promise.all([
            StockLedger.find(filter).populate("itemId", "name unit").populate("projectId", "projectName").sort({ createdAt: -1 }).skip(skip).limit(limit),
            StockLedger.countDocuments(filter),
            StockLedger.aggregate([{ $match: filter }, { $group: { _id: "$transactionType", totalIn: { $sum: "$qtyIn" }, totalOut: { $sum: "$qtyOut" } } }]),
        ]);

        return success(res, 200, "Stock report", { items, summaryByType: agg }, buildPagination(page, limit, total));
    } catch (error) {
        return fail(res, 500, "Error generating stock report", error);
    }
};

/** GET /api/reports/machinery?project&machine&dateFrom&dateTo */
export const machineryReport = async (req, res) => {
    try {
        const { page, limit, skip } = getPagination(req);
        const { project, machine } = req.query;

        const usageFilter = {};
        if (project) usageFilter.projectId = project;
        if (machine) usageFilter.machineId = machine;
        Object.assign(usageFilter, getDateRangeFilter(req, "date"));

        const [operatorLogs, total, maintenanceCosts] = await Promise.all([
            MachineOperatorLog.find(usageFilter).populate("machineId", "machineNumber machineType").populate("operatorId", "name").sort({ date: -1 }).skip(skip).limit(limit),
            MachineOperatorLog.countDocuments(usageFilter),
            MachineMaintenance.aggregate([
                ...(machine ? [{ $match: { machineId: new mongoose.Types.ObjectId(machine) } }] : []),
                { $group: { _id: null, totalMaintenanceCost: { $sum: "$cost" } } },
            ]),
        ]);

        return success(
            res, 200, "Machinery report",
            { operatorLogs, totalMaintenanceCost: maintenanceCosts[0]?.totalMaintenanceCost || 0 },
            buildPagination(page, limit, total)
        );
    } catch (error) {
        return fail(res, 500, "Error generating machinery report", error);
    }
};

/** GET /api/reports/project-delays?project&delayType&status&dateFrom&dateTo */
export const projectDelaysReport = async (req, res) => {
    try {
        const { page, limit, skip } = getPagination(req);
        const { project, delayType, status } = req.query;

        const filter = {};
        if (project) filter.projectId = project;
        if (delayType) filter.delayType = delayType;
        if (status) filter.status = status;
        Object.assign(filter, getDateRangeFilter(req, "delayDate"));

        const [items, total, agg] = await Promise.all([
            ProjectDelay.find(filter).populate("projectId", "projectName").populate("delayType", "name").sort({ delayDate: -1 }).skip(skip).limit(limit),
            ProjectDelay.countDocuments(filter),
            ProjectDelay.aggregate([{ $match: filter }, { $group: { _id: "$status", count: { $sum: 1 }, totalEstimatedDays: { $sum: "$estimatedDelayDays" }, totalActualDays: { $sum: "$actualDelayDays" } } }]),
        ]);

        return success(res, 200, "Project delays report", { items, summary: agg }, buildPagination(page, limit, total));
    } catch (error) {
        return fail(res, 500, "Error generating delays report", error);
    }
};

/** GET /api/reports/eod?project&manager&dateFrom&dateTo */
export const eodReportSummary = async (req, res) => {
    try {
        const { page, limit, skip } = getPagination(req);
        const { project, manager, status } = req.query;

        const filter = {};
        if (project) filter.projectId = project;
        if (manager) filter.submittedBy = manager;
        if (status) filter.status = status;
        Object.assign(filter, getDateRangeFilter(req, "date"));

        const [items, total] = await Promise.all([
            EODReport.find(filter).populate("projectId", "projectName").populate("submittedBy", "name role").sort({ date: -1 }).skip(skip).limit(limit),
            EODReport.countDocuments(filter),
        ]);

        return success(res, 200, "EOD report summary", items, buildPagination(page, limit, total));
    } catch (error) {
        return fail(res, 500, "Error generating EOD report", error);
    }
};

/**
 * GET /api/reports/project-dashboard/:projectId
 * Composes existing data (active delays, EOD progress, labour/machinery
 * availability) into one dashboard payload — never duplicates the
 * underlying records, only aggregates references to them (spec rule #19).
 */
export const projectDashboard = async (req, res) => {
    try {
        const { projectId } = req.params;
        const LabourAssignment = (await import("../models/LabourAssignment.js")).default;
        const MachineRequest = (await import("../models/MachineRequest.js")).default;
        const StockRequest = (await import("../models/StockRequest.js")).default;

        const [activeDelays, resolvedDelaysCount, latestEOD, activeLabourCount, activeMachineCount, materialShortages] = await Promise.all([
            ProjectDelay.find({ projectId, status: "Active" }).populate("delayType", "name").sort({ delayDate: -1 }),
            ProjectDelay.countDocuments({ projectId, status: "Resolved" }),
            EODReport.findOne({ projectId }).sort({ date: -1 }),
            LabourAssignment.countDocuments({ projectId, status: "Active" }),
            MachineRequest.countDocuments({ projectId, status: "ACTIVE" }),
            // ⭐ "materialShortages" from the follow-up audit's expected dashboard
            // shape — stock requests on this project that are still waiting
            // on material (not yet fully fulfilled) are the closest existing
            // signal for "shortage" without inventing a new demand-planning
            // model that doesn't exist in this schema.
            StockRequest.find({ projectId, status: { $in: ["PENDING_ADMIN_REVIEW", "APPROVED_TRANSFER", "APPROVED_PROCUREMENT", "PARTIALLY_FULFILLED"] } })
                .select("materialName quantity fulfilledQty status")
                .sort({ createdAt: -1 }),
        ]);

        const totalDelayDays = activeDelays.reduce((sum, d) => sum + (d.estimatedDelayDays || 0), 0);

        return success(res, 200, "Project dashboard fetched", {
            activeDelays,
            resolvedDelaysCount,
            totalActiveDelayDays: totalDelayDays,
            delayDays: totalDelayDays,
            criticalIssues: activeDelays.length,
            latestEODStatus: latestEOD ? { date: latestEOD.date, status: latestEOD.status, issues: latestEOD.issues } : null,
            labourAvailable: activeLabourCount,
            activeLabourCount,
            machinesAvailable: activeMachineCount,
            activeMachineCount,
            materialShortages,
        });
    } catch (error) {
        return fail(res, 500, "Error building project dashboard", error);
    }
};
