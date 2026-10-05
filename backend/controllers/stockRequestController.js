import StockRequest from "../models/StockRequest.js";
import Item from "../models/Item.js";
import { uploadToCloudinary } from "../utils/cloudUpload.js";
import { success, fail, getPagination, buildPagination, getDateRangeFilter } from "../utils/apiResponse.js";
import { logAudit } from "../utils/audit.js";
import { notifyRoles, notifyUsers } from "../utils/notify.js";
import { checkStockAvailability } from "../services/inventoryService.js";

/**
 * POST /api/stock/requests — Manager / Supervisor raises a material request (multi-item).
 */
export const createStockRequest = async (req, res) => {
    try {
        const {
            projectId,
            requiredDate,
            priority,
            purpose,
            description,
            items: rawItems,
            materialId,
            quantity,
            unit,
        } = req.body;

        if (!projectId || !requiredDate) {
            return fail(res, 400, "projectId and requiredDate are required");
        }

        // Format and validate items
        let items = [];
        if (Array.isArray(rawItems) && rawItems.length > 0) {
            items = rawItems;
        } else if (typeof rawItems === "string") {
            try {
                items = JSON.parse(rawItems);
            } catch (e) {
                items = [];
            }
        }

        // Fallback for single-item form submission
        if ((!items || items.length === 0) && materialId && quantity) {
            items = [
                {
                    itemId: materialId,
                    requestedQty: Number(quantity),
                    unit: unit || "",
                    purpose: purpose || "",
                },
            ];
        }

        if (!items || items.length === 0) {
            return fail(res, 400, "At least one item is required in the request");
        }

        // Validate each item and populate materialName if missing
        const formattedItems = [];
        for (const it of items) {
            const iId = it.itemId || it.materialId;
            const reqQty = Number(it.requestedQty || it.quantity || 0);
            if (!iId || reqQty <= 0) {
                return fail(res, 400, "Each item must have a valid itemId and positive requestedQty");
            }
            const itemDoc = await Item.findById(iId);
            if (!itemDoc) {
                return fail(res, 404, `Material/Item not found: ${iId}`);
            }
            formattedItems.push({
                itemId: itemDoc._id,
                materialName: itemDoc.name,
                unit: it.unit || itemDoc.unit || "",
                requestedQty: reqQty,
                approvedQty: 0,
                availableQty: 0,
                shortageQty: reqQty,
                fulfilledQty: 0,
                fulfillmentStatus: "PENDING",
                purpose: it.purpose || purpose || "",
                remarks: it.remarks || "",
            });
        }

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
            requestedByRole: req.user.role || "manager",
            items: formattedItems,
            materialId: formattedItems[0].itemId,
            materialName: formattedItems[0].materialName,
            quantity: formattedItems.reduce((s, i) => s + i.requestedQty, 0),
            unit: formattedItems[0].unit,
            requiredDate,
            priority: priority || "Medium",
            purpose: purpose || "",
            description: description || "",
            images,
            attachments,
            status: "PENDING_APPROVAL",
            createdBy: req.user.id,
        });

        await logAudit({
            module: "StockRequest",
            entityId: request._id,
            action: "created",
            performedBy: req.user.id,
            projectId,
        });

        await notifyRoles({
            roles: ["admin"],
            title: "New Material Request",
            message: `Material Request #${request.requestNumber} with ${formattedItems.length} item(s) submitted for approval`,
            module: "Stock",
            referenceType: "StockRequest",
            referenceId: request._id,
            projectId,
        });

        return success(res, 201, "Material request submitted for approval", request);
    } catch (error) {
        return fail(res, 500, "Error creating material request", error);
    }
};

/**
 * GET /api/stock/requests — List material requests with filtering and pagination.
 */
export const listStockRequests = async (req, res) => {
    try {
        const { page, limit, skip } = getPagination(req);
        const { projectId, status, priority, materialId } = req.query;

        const filter = {};
        if (req.user.role === "supervisor") filter.requestedBy = req.user.id;
        if (req.user.role !== "admin" && Array.isArray(req.user.assignedProjects) && req.user.assignedProjects.length) {
            filter.projectId = { $in: req.user.assignedProjects };
        }
        if (projectId) {
            if (filter.projectId?.$in && !filter.projectId.$in.map(String).includes(String(projectId))) {
                return fail(res, 403, "Access denied for this project");
            }
            filter.projectId = projectId;
        }
        if (status && status !== "all") {
            // Handle aliases
            if (status === "PENDING_APPROVAL" || status === "PENDING_ADMIN_REVIEW" || status === "pending") {
                filter.status = { $in: ["PENDING_APPROVAL", "PENDING_ADMIN_REVIEW", "SUBMITTED"] };
            } else {
                filter.status = status;
            }
        }
        if (priority && priority !== "all") filter.priority = priority;
        if (materialId) {
            filter.$or = [{ materialId }, { "items.itemId": materialId }];
        }
        Object.assign(filter, getDateRangeFilter(req));

        const [items, total] = await Promise.all([
            StockRequest.find(filter)
                .populate("projectId", "projectName projectCode")
                .populate("requestedBy", "name role")
                .populate("items.itemId", "name unit category")
                .populate("materialId", "name unit category")
                .populate("approvedBy", "name role")
                .populate("reviewedBy", "name role")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            StockRequest.countDocuments(filter),
        ]);

        return success(res, 200, "Material requests fetched", items, buildPagination(page, limit, total));
    } catch (error) {
        return fail(res, 500, "Error fetching material requests", error);
    }
};

/**
 * GET /api/stock/requests/:id — Single material request detail.
 */
export const getStockRequest = async (req, res) => {
    try {
        const request = await StockRequest.findById(req.params.id)
            .populate("projectId", "projectName projectCode")
            .populate("requestedBy", "name role phone")
            .populate("items.itemId", "name unit category")
            .populate("materialId", "name unit category")
            .populate("approvedBy", "name role")
            .populate("reviewedBy", "name role");

        if (!request) return fail(res, 404, "Material request not found");
        return success(res, 200, "Material request fetched", request);
    } catch (error) {
        return fail(res, 500, "Error fetching material request", error);
    }
};

/**
 * GET /api/stock/requests/:id/stock-check — Perform real-time stock check for request items.
 */
export const checkRequestStock = async (req, res) => {
    try {
        const request = await StockRequest.findById(req.params.id);
        if (!request) return fail(res, 404, "Material request not found");

        const itemsToCheck = request.items && request.items.length > 0
            ? request.items
            : [{ itemId: request.materialId, requestedQty: request.quantity, unit: request.unit, materialName: request.materialName }];

        const stockCheck = await checkStockAvailability({
            projectId: request.projectId,
            items: itemsToCheck,
        });

        return success(res, 200, "Stock check completed", stockCheck);
    } catch (error) {
        return fail(res, 500, "Error checking stock availability", error);
    }
};

/**
 * PATCH /api/stock/requests/:id/approve
 * Admin APPROVES Material Request:
 * 1. Automatically runs backend Stock Check for every item.
 * 2. Calculates item-wise availableQty, shortageQty, and fulfillmentStatus.
 * 3. Status flips to APPROVED.
 */
export const approveStockRequest = async (req, res) => {
    try {
        const { adminRemarks } = req.body;
        const request = await StockRequest.findById(req.params.id);
        if (!request) return fail(res, 404, "Material request not found");

        if (["APPROVED", "REJECTED", "CANCELLED", "FULFILLED"].includes(request.status)) {
            return fail(res, 400, `Request is already ${request.status}`);
        }

        // Automatic Backend Stock Check for all items
        const itemsToCheck = request.items && request.items.length > 0
            ? request.items
            : [{ itemId: request.materialId, requestedQty: request.quantity, unit: request.unit, materialName: request.materialName }];

        const stockCheck = await checkStockAvailability({
            projectId: request.projectId,
            items: itemsToCheck,
        });

        // Update items with availability calculations
        if (request.items && request.items.length > 0) {
            request.items = request.items.map((it, idx) => {
                const check = stockCheck.items[idx];
                return {
                    ...it.toObject(),
                    approvedQty: it.requestedQty,
                    availableQty: check ? check.availableQty : 0,
                    shortageQty: check ? check.shortageQty : it.requestedQty,
                    fulfillmentStatus: check ? check.fulfillmentStatus : "SHORTAGE",
                };
            });
        }

        request.status = "APPROVED";
        request.adminRemarks = adminRemarks || request.adminRemarks || "Approved by Admin";
        request.approvedBy = req.user.id;
        request.approvedAt = new Date();
        request.reviewedBy = req.user.id;
        request.reviewedAt = new Date();
        request.updatedBy = req.user.id;
        await request.save();

        await logAudit({
            module: "StockRequest",
            entityId: request._id,
            action: "approved",
            performedBy: req.user.id,
            remarks: adminRemarks,
            projectId: request.projectId,
        });

        await notifyUsers({
            userIds: [request.requestedBy],
            title: "Material Request Approved",
            message: `Request #${request.requestNumber} was approved. Stock check: ${stockCheck.overallStatus}`,
            module: "Stock",
            referenceType: "StockRequest",
            referenceId: request._id,
            projectId: request.projectId,
        });

        return success(res, 200, "Material request approved and stock check completed", {
            request,
            stockCheck,
        });
    } catch (error) {
        return fail(res, 500, "Error approving material request", error);
    }
};

/**
 * PATCH /api/stock/requests/:id/reject
 * Admin REJECTS Material Request with required remarks.
 */
export const rejectStockRequest = async (req, res) => {
    try {
        const { rejectionReason, adminRemarks } = req.body;
        const reason = rejectionReason || adminRemarks;
        if (!reason || !reason.trim()) {
            return fail(res, 400, "Rejection remarks are mandatory");
        }

        const request = await StockRequest.findById(req.params.id);
        if (!request) return fail(res, 404, "Material request not found");

        if (["APPROVED", "REJECTED", "CANCELLED", "FULFILLED"].includes(request.status)) {
            return fail(res, 400, `Request is already ${request.status}`);
        }

        request.status = "REJECTED";
        request.adminRemarks = reason;
        request.rejectionReason = reason;
        request.reviewedBy = req.user.id;
        request.reviewedAt = new Date();
        request.updatedBy = req.user.id;
        await request.save();

        await logAudit({
            module: "StockRequest",
            entityId: request._id,
            action: "rejected",
            performedBy: req.user.id,
            remarks: reason,
            projectId: request.projectId,
        });

        await notifyUsers({
            userIds: [request.requestedBy],
            title: "Material Request Rejected",
            message: `Request #${request.requestNumber} was rejected: ${reason}`,
            module: "Stock",
            referenceType: "StockRequest",
            referenceId: request._id,
            projectId: request.projectId,
        });

        return success(res, 200, "Material request rejected", request);
    } catch (error) {
        return fail(res, 500, "Error rejecting material request", error);
    }
};

/**
 * PATCH /api/stock/requests/:id/review — Backward compatibility review dispatcher.
 */
export const reviewStockRequest = async (req, res) => {
    const { decision, adminRemarks } = req.body;
    if (decision === "reject") {
        return rejectStockRequest(req, res);
    }
    return approveStockRequest(req, res);
};
