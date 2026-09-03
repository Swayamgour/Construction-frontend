import AuditLog from "../models/AuditLog.js";
import { getAuditHistory } from "../utils/audit.js";
import { success, fail, getPagination, buildPagination, getDateRangeFilter } from "../utils/apiResponse.js";

/** GET /api/audit/:module/:entityId — generic history endpoint reused by every new module. */
export const getModuleAuditHistory = async (req, res) => {
    try {
        const { module, entityId } = req.params;
        const history = await getAuditHistory(module, entityId);
        return success(res, 200, "Audit history fetched", history);
    } catch (error) {
        return fail(res, 500, "Error fetching audit history", error);
    }
};

/**
 * GET /api/audit — admin/manager oversight screen. Previously there was
 * no way to browse the audit trail at all except one entity at a time
 * (getModuleAuditHistory above); this is the paginated/filterable global
 * list the follow-up audit's "Major APIs" pagination checklist expects.
 * Supports ?page&limit&module&action&performedBy&projectId&entityId&fromDate&toDate
 */
export const listAuditLogs = async (req, res) => {
    try {
        const { page, limit, skip } = getPagination(req);
        const { module, action, performedBy, projectId, entityId } = req.query;

        const filter = {};
        if (module) filter.module = module;
        if (action) filter.action = action;
        if (performedBy) filter.performedBy = performedBy;
        if (entityId) filter.entityId = entityId;
        // Non-admin callers (manager) only see their own assigned projects'
        // audit entries, same rule as every other module-17-scoped listing.
        if (projectId) {
            filter.projectId = projectId;
        } else if (req.user?.role !== "admin") {
            filter.projectId = { $in: req.user?.assignedProjects || [] };
        }
        Object.assign(filter, getDateRangeFilter(req, "createdAt"));

        const [items, total] = await Promise.all([
            AuditLog.find(filter)
                .populate("performedBy", "name role")
                .populate("projectId", "projectName")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            AuditLog.countDocuments(filter),
        ]);

        return success(res, 200, "Audit logs fetched", items, buildPagination(page, limit, total));
    } catch (error) {
        return fail(res, 500, "Error fetching audit logs", error);
    }
};
