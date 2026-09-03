import ProjectDelay from "../models/ProjectDelay.js";
import DelayCategory from "../models/DelayCategory.js";
import { uploadToCloudinary } from "../utils/cloudUpload.js";
import { success, fail, getPagination, buildPagination, getDateRangeFilter } from "../utils/apiResponse.js";
import { logAudit } from "../utils/audit.js";
import { notifyRoles } from "../utils/notify.js";

/** GET /api/delay-categories */
export const listDelayCategories = async (req, res) => {
    try {
        const categories = await DelayCategory.find({ isActive: true }).sort({ name: 1 });
        return success(res, 200, "Delay categories fetched", categories);
    } catch (error) {
        return fail(res, 500, "Error fetching delay categories", error);
    }
};

/** POST /api/delay-categories — admin adds a custom category. */
export const createDelayCategory = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) return fail(res, 400, "name is required");
        const category = await DelayCategory.create({ name });
        return success(res, 201, "Delay category created", category);
    } catch (error) {
        if (error.code === 11000) return fail(res, 400, "Category already exists");
        return fail(res, 500, "Error creating delay category", error);
    }
};

/** POST /api/projects/:projectId/delays — Manager reports a delay. */
export const reportDelay = async (req, res) => {
    try {
        const { projectId } = req.params;
        const {
            delayDate, delayType, reason, description, plannedResumeDate,
            affectedWork, affectedQuantity, estimatedDelayDays, financialImpact,
            manpowerImpact, machineryImpact, materialImpact, clientImpact,
        } = req.body;

        if (!delayDate || !delayType || !reason) {
            return fail(res, 400, "delayDate, delayType and reason are required");
        }

        const category = await DelayCategory.findById(delayType);
        if (!category) return fail(res, 404, "Delay category not found");

        const images = [];
        const attachments = [];
        if (req.files?.images) {
            for (const f of req.files.images) images.push(await uploadToCloudinary(f, "delays/images"));
        }
        if (req.files?.attachments) {
            for (const f of req.files.attachments) attachments.push(await uploadToCloudinary(f, "delays/attachments"));
        }

        const delay = await ProjectDelay.create({
            projectId,
            delayDate,
            reportedBy: req.user.id,
            delayType,
            reason,
            description: description || "",
            plannedResumeDate: plannedResumeDate || null,
            affectedWork: affectedWork || "",
            affectedQuantity: affectedQuantity || 0,
            estimatedDelayDays: estimatedDelayDays || 0,
            financialImpact: financialImpact ?? null,
            manpowerImpact: manpowerImpact || "",
            machineryImpact: machineryImpact || "",
            materialImpact: materialImpact || "",
            clientImpact: clientImpact || "",
            images,
            attachments,
            createdBy: req.user.id,
        });

        await logAudit({ module: "ProjectDelay", entityId: delay._id, action: "created", performedBy: req.user.id });
        await notifyRoles({ roles: ["admin", "manager"], projectId, title: "Project delay reported", message: `${category.name}: ${reason}`, module: "Delay", referenceType: "ProjectDelay", referenceId: delay._id });

        return success(res, 201, "Delay reported", delay);
    } catch (error) {
        return fail(res, 500, "Error reporting delay", error);
    }
};

/** GET /api/projects/:projectId/delays — filterable list scoped to a project. */
export const listProjectDelays = async (req, res) => {
    try {
        const { page, limit, skip } = getPagination(req);
        const { status, delayType } = req.query;

        const filter = { projectId: req.params.projectId };
        if (status) filter.status = status;
        if (delayType) filter.delayType = delayType;
        Object.assign(filter, getDateRangeFilter(req, "delayDate"));

        const [items, total] = await Promise.all([
            ProjectDelay.find(filter)
                .populate("delayType", "name")
                .populate("reportedBy", "name role")
                .sort({ delayDate: -1 })
                .skip(skip)
                .limit(limit),
            ProjectDelay.countDocuments(filter),
        ]);

        return success(res, 200, "Project delays fetched", items, buildPagination(page, limit, total));
    } catch (error) {
        return fail(res, 500, "Error fetching project delays", error);
    }
};

/** GET /api/delays — global list across all projects (admin/management view), with project filter. */
export const listAllDelays = async (req, res) => {
    try {
        const { page, limit, skip } = getPagination(req);
        const { projectId, status, delayType } = req.query;

        const filter = {};
        // ⭐ Module 17: checkProjectAccess() on this route already rejects an
        // explicit ?projectId= outside the caller's scope. When no
        // projectId is given at all, a non-admin must still only see their
        // own assigned projects — otherwise this endpoint would leak every
        // project's delays to any manager/supervisor.
        if (projectId) {
            filter.projectId = projectId;
        } else if (req.user?.role !== "admin") {
            filter.projectId = { $in: req.user?.assignedProjects || [] };
        }
        if (status) filter.status = status;
        if (delayType) filter.delayType = delayType;
        Object.assign(filter, getDateRangeFilter(req, "delayDate"));

        const [items, total] = await Promise.all([
            ProjectDelay.find(filter)
                .populate("projectId", "projectName")
                .populate("delayType", "name")
                .populate("reportedBy", "name role")
                .sort({ delayDate: -1 })
                .skip(skip)
                .limit(limit),
            ProjectDelay.countDocuments(filter),
        ]);

        return success(res, 200, "Delays fetched", items, buildPagination(page, limit, total));
    } catch (error) {
        return fail(res, 500, "Error fetching delays", error);
    }
};

/** PATCH /api/delays/:id — update fields while active (dates/impact estimates). */
export const updateDelay = async (req, res) => {
    try {
        const delay = await ProjectDelay.findById(req.params.id);
        if (!delay) return fail(res, 404, "Delay not found");
        if (delay.status === "Resolved") return fail(res, 400, "Cannot edit a resolved delay");

        const editable = [
            "reason", "description", "plannedResumeDate", "affectedWork", "affectedQuantity",
            "estimatedDelayDays", "financialImpact", "manpowerImpact", "machineryImpact", "materialImpact", "clientImpact",
        ];
        for (const field of editable) {
            if (req.body[field] !== undefined) delay[field] = req.body[field];
        }
        delay.updatedBy = req.user.id;
        await delay.save();

        await logAudit({ module: "ProjectDelay", entityId: delay._id, action: "updated", performedBy: req.user.id });
        return success(res, 200, "Delay updated", delay);
    } catch (error) {
        return fail(res, 500, "Error updating delay", error);
    }
};

/**
 * POST /api/delays/:id/resolve
 * Rule #11: a delay cannot be resolved before it's created — enforced
 * implicitly since resolution always operates on an existing document;
 * additionally actualResumeDate can never precede delayDate.
 */
export const resolveDelay = async (req, res) => {
    try {
        const { resolution, actualResumeDate } = req.body;
        const delay = await ProjectDelay.findById(req.params.id);
        if (!delay) return fail(res, 404, "Delay not found");
        if (delay.status === "Resolved") return fail(res, 400, "Delay already resolved");

        const resumeDate = actualResumeDate ? new Date(actualResumeDate) : new Date();
        if (resumeDate < delay.delayDate) return fail(res, 400, "actualResumeDate cannot be before delayDate");

        delay.status = "Resolved";
        delay.resolution = resolution || "";
        delay.actualResumeDate = resumeDate;
        delay.actualDelayDays = Math.max(Math.round((resumeDate - delay.delayDate) / (1000 * 60 * 60 * 24)), 0);
        delay.resolvedBy = req.user.id;
        delay.resolvedAt = new Date();
        await delay.save();

        await logAudit({ module: "ProjectDelay", entityId: delay._id, action: "resolved", performedBy: req.user.id });
        await notifyRoles({ roles: ["admin", "manager"], projectId: delay.projectId, title: "Project delay resolved", message: delay.reason, module: "Delay", referenceType: "ProjectDelay", referenceId: delay._id });

        return success(res, 200, "Delay resolved", delay);
    } catch (error) {
        return fail(res, 500, "Error resolving delay", error);
    }
};
