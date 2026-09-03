import StockRequest from "../models/StockRequest.js";
import Item from "../models/Item.js";
import { uploadToCloudinary } from "../utils/cloudUpload.js";
import { success, fail, getPagination, buildPagination, getDateRangeFilter } from "../utils/apiResponse.js";
import { logAudit } from "../utils/audit.js";
import { notifyRoles, notifyUsers } from "../utils/notify.js";

/** POST /api/stock/requests — Supervisor/Manager raises a material request with optional images/attachments. */
export const createStockRequest = async (req, res) => {
    try {
        const { projectId, materialId, quantity, unit, requiredDate, priority, purpose, description } = req.body;
        if (!projectId || !materialId || !quantity || !unit || !requiredDate) {
            return fail(res, 400, "projectId, materialId, quantity, unit and requiredDate are required");
        }

        const item = await Item.findById(materialId);
        if (!item) return fail(res, 404, "Material/Item not found");

        const images = [];
        const attachments = [];
        if (req.files?.images) {
            for (const f of req.files.images) images.push(await uploadToCloudinary(f, "stock-requests/images"));
        }
        if (req.files?.attachments) {
            for (const f of req.files.attachments) attachments.push(await uploadToCloudinary(f, "stock-requests/attachments"));
        }

        const request = await StockRequest.create({
            projectId,
            requestedBy: req.user.id,
            requestedByRole: req.user.role,
            materialId,
            materialName: item.name,
            category: item.category,
            quantity,
            unit,
            requiredDate,
            priority: priority || "Medium",
            purpose: purpose || "",
            description: description || "",
            images,
            attachments,
            createdBy: req.user.id,
        });

        await logAudit({ module: "StockRequest", entityId: request._id, action: "created", performedBy: req.user.id });
        await notifyRoles({ roles: ["admin"], title: "New stock request", message: `${item.name} x${quantity} requested`, module: "Stock", referenceType: "StockRequest", referenceId: request._id, projectId });

        return success(res, 201, "Stock request submitted", request);
    } catch (error) {
        return fail(res, 500, "Error creating stock request", error);
    }
};

/** GET /api/stock/requests — filterable/paginated list. Supervisors see only their own. */
export const listStockRequests = async (req, res) => {
    try {
        const { page, limit, skip } = getPagination(req);
        const { projectId, status, priority, materialId } = req.query;

        const filter = {};
        if (req.user.role === "supervisor") filter.requestedBy = req.user.id;
        if (req.user.role !== "admin" && Array.isArray(req.user.assignedProjects) && req.user.assignedProjects.length) filter.projectId = { $in: req.user.assignedProjects };
        if (projectId) {
            if (filter.projectId?.$in && !filter.projectId.$in.map(String).includes(String(projectId))) return fail(res, 403, "Access denied for this project");
            filter.projectId = projectId;
        }
        if (status) filter.status = status;
        if (priority) filter.priority = priority;
        if (materialId) filter.materialId = materialId;
        Object.assign(filter, getDateRangeFilter(req));

        const [items, total] = await Promise.all([
            StockRequest.find(filter)
                .populate("projectId", "projectName projectCode")
                .populate("requestedBy", "name role")
                .populate("materialId", "name unit category")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            StockRequest.countDocuments(filter),
        ]);

        return success(res, 200, "Stock requests fetched", items, buildPagination(page, limit, total));
    } catch (error) {
        return fail(res, 500, "Error fetching stock requests", error);
    }
};

/** GET /api/stock/requests/:id */
export const getStockRequest = async (req, res) => {
    try {
        const request = await StockRequest.findById(req.params.id)
            .populate("projectId", "projectName projectCode")
            .populate("requestedBy", "name role phone")
            .populate("materialId", "name unit category")
            .populate("reviewedBy", "name role");

        if (!request) return fail(res, 404, "Stock request not found");
        return success(res, 200, "Stock request fetched", request);
    } catch (error) {
        return fail(res, 500, "Error fetching stock request", error);
    }
};

/**
 * PATCH /api/stock/requests/:id/review
 * Admin decides fulfilment path. Only marks the decision here — the actual
 * StockTransfer or Procurement record is created via its own endpoint
 * (stockTransferController / procurementController), which then flips the
 * status to APPROVED_TRANSFER / APPROVED_PROCUREMENT / FULFILLED.
 */
export const reviewStockRequest = async (req, res) => {
    try {
        const { decision, adminRemarks } = req.body; // reject | transfer | procurement
        const request = await StockRequest.findById(req.params.id);
        if (!request) return fail(res, 404, "Stock request not found");
        if (request.status !== "PENDING_ADMIN_REVIEW") return fail(res, 400, `Request already ${request.status}`);
        const map = { reject: "REJECTED", transfer: "APPROVED_TRANSFER", procurement: "APPROVED_PROCUREMENT" };
        if (!map[decision]) return fail(res, 400, "decision must be reject, transfer or procurement");
        request.status = map[decision];
        request.adminRemarks = adminRemarks || ""; request.reviewedBy=req.user.id; request.reviewedAt=new Date(); request.updatedBy=req.user.id;
        await request.save();
        await logAudit({ module:"StockRequest", entityId:request._id, action:`review:${decision}`, performedBy:req.user.id, remarks:adminRemarks });
        await notifyUsers({ userIds:[request.requestedBy], title:`Stock request ${request.status}`, message:`Your request for ${request.materialName} was ${request.status.toLowerCase()}`, module:"Stock", referenceType:"StockRequest", referenceId:request._id, projectId:request.projectId });
        return success(res,200,"Stock request reviewed",request);
    } catch(error){ return fail(res,500,"Error reviewing stock request",error); }
};
