import mongoose from "mongoose";
import Procurement from "../models/Procurement.js";
import PurchaseOrder from "../models/PurchaseOrder.js";
import StockRequest from "../models/StockRequest.js";
import { uploadToCloudinary } from "../utils/cloudUpload.js";
import { success, fail, getPagination, buildPagination } from "../utils/apiResponse.js";
import { logAudit } from "../utils/audit.js";
import { notifyUsers, notifyRoles } from "../utils/notify.js";

/**
 * POST /api/stock/procurement
 * Admin fulfils a StockRequest by ordering from a vendor ("Option 2").
 * Workflow: Ordered -> Dispatched -> Delivered -> InvoiceSubmitted ->
 * StockUpdated (stock is only credited once the material is physically
 * received via stockReceiptController, matching the "only accepted qty
 * counts" rule).
 */
export const createProcurement = async (req, res) => {
    const session = await mongoose.startSession();
    try {
        const { stockRequestId, vendorId, quantity, rate, tax, expectedDeliveryDate, createPurchaseOrder = true } = req.body;
        if (!stockRequestId || !vendorId || !quantity || !rate) return fail(res, 400, "stockRequestId, vendorId, quantity and rate are required");
        let procurement, po;
        await session.withTransaction(async () => {
            const request = await StockRequest.findById(stockRequestId).session(session);
            if (!request) throw new Error("Stock request not found");
            if (!["APPROVED_PROCUREMENT", "PENDING_ADMIN_REVIEW", "PARTIALLY_FULFILLED"].includes(request.status)) throw new Error(`Request is already ${request.status}`);
            if (Number(quantity) > Math.max(0, Number(request.quantity) - Number(request.fulfilledQty || 0))) throw new Error("Procurement quantity exceeds remaining request quantity");
            procurement = (await Procurement.create([{ stockRequestId, vendorId, materialId: request.materialId, quantity:Number(quantity), rate:Number(rate), tax:tax||0, expectedDeliveryDate:expectedDeliveryDate||null, createdBy:req.user.id }], {session}))[0];
            if (createPurchaseOrder !== false) {
                const amount=Number(quantity)*Number(rate), taxAmount=amount*Number(tax||0)/100;
                po=(await PurchaseOrder.create([{ projectId:request.projectId, vendorId, items:[{itemId:request.materialId,qty:Number(quantity),unit:request.unit,rate:Number(rate),amount,tax:Number(tax||0),taxAmount,total:amount+taxAmount,receivedQty:0}], subtotal:amount,taxTotal:taxAmount,discountTotal:0,grandTotal:amount+taxAmount,status:"ORDERED",createdBy:req.user.id,orderedAt:new Date(),orderedBy:req.user.id }],{session}))[0];
                procurement.purchaseOrderId=po._id; procurement.poReferenceNumber=String(po._id); await procurement.save({session});
            }
            request.status="APPROVED_PROCUREMENT"; request.updatedBy=req.user.id; await request.save({session});
            await logAudit({module:"Procurement",entityId:procurement._id,action:"ordered",performedBy:req.user.id,projectId:request.projectId,meta:{quantity,rate,purchaseOrderId:po?._id},session});
        });
        return success(res,201,"Procurement order created",{procurement,purchaseOrder:po||null});
    } catch (error) { return fail(res,400,"Error creating procurement",error); } finally { session.endSession(); }
};

/** PATCH /api/stock/procurement/:id/status — advance workflow (dispatch/deliver/invoice). */
export const updateProcurementStatus = async (req, res) => {
    try {
        const { procurementStatus, actualDeliveryDate, invoiceNumber, paymentStatus } = req.body;
        const procurement = await Procurement.findById(req.params.id);
        if (!procurement) return fail(res, 404, "Procurement not found");

        const validOrder = ["Ordered", "Dispatched", "Delivered", "InvoiceSubmitted", "StockUpdated"];
        if (procurementStatus && !validOrder.includes(procurementStatus) && procurementStatus !== "Cancelled") {
            return fail(res, 400, "Invalid procurement status");
        }

        if (procurementStatus) procurement.procurementStatus = procurementStatus;
        if (actualDeliveryDate) procurement.actualDeliveryDate = actualDeliveryDate;
        if (invoiceNumber) procurement.invoiceNumber = invoiceNumber;
        if (paymentStatus) procurement.paymentStatus = paymentStatus;

        if (req.file) {
            procurement.invoiceFile = await uploadToCloudinary(req.file, "stock/procurement-invoices");
        }

        procurement.updatedBy = req.user.id;
        await procurement.save();

        await logAudit({ module: "Procurement", entityId: procurement._id, action: `status:${procurement.procurementStatus}`, performedBy: req.user.id });

        if (procurement.procurementStatus === "Delivered") {
            const request = await StockRequest.findById(procurement.stockRequestId);
            if (request) {
                await notifyUsers({ userIds: [request.requestedBy], title: "Material delivered", message: `${request.materialName} delivered — please confirm receipt`, module: "Stock", referenceType: "Procurement", referenceId: procurement._id, projectId: request.projectId });
            }
        }

        return success(res, 200, "Procurement updated", procurement);
    } catch (error) {
        return fail(res, 500, "Error updating procurement", error);
    }
};

/**
 * PATCH /api/stock/procurement/:id/cancel
 * Compensating transaction for the vendor-procurement fulfilment path.
 * Since stock is only credited at the site-receiving step (StockReceipt),
 * cancelling before that point never touched inventory — so this only
 * needs to flip status and re-open the linked StockRequest. Once stock has
 * already been updated (status "StockUpdated", i.e. a StockReceipt already
 * exists), cancellation is blocked — use a return/damage adjustment
 * instead of reversing a physical delivery that already happened.
 */
export const cancelProcurement = async (req, res) => {
    try {
        const { reason } = req.body;
        const procurement = await Procurement.findById(req.params.id);
        if (!procurement) return fail(res, 404, "Procurement not found");
        if (procurement.procurementStatus === "Cancelled") return fail(res, 400, "Already cancelled");
        if (procurement.procurementStatus === "StockUpdated") {
            return fail(res, 400, "Cannot cancel — material has already been received and credited to stock. Use a stock adjustment instead.");
        }

        procurement.procurementStatus = "Cancelled";
        procurement.updatedBy = req.user.id;
        await procurement.save();

        const request = await StockRequest.findById(procurement.stockRequestId);
        if (request && request.status === "APPROVED_PROCUREMENT") {
            request.status = "PENDING_ADMIN_REVIEW";
            request.adminRemarks = `${request.adminRemarks || ""} | Procurement cancelled, back in queue: ${reason || ""}`.trim();
            request.updatedBy = req.user.id;
            await request.save();
        }

        await logAudit({ module: "Procurement", entityId: procurement._id, action: "cancelled", performedBy: req.user.id, remarks: reason });
        if (request) {
            await notifyRoles({ roles: ["admin"], title: "Procurement cancelled", message: `${request.materialName} order cancelled — request re-opened`, module: "Stock", referenceType: "StockRequest", referenceId: request._id, projectId: request.projectId });
        }

        return success(res, 200, "Procurement cancelled", procurement);
    } catch (error) {
        return fail(res, 500, "Error cancelling procurement", error);
    }
};

/** GET /api/stock/procurement — filterable list. */
export const listProcurements = async (req, res) => {
    try {
        const { page, limit, skip } = getPagination(req);
        const { procurementStatus, vendorId, stockRequestId } = req.query;

        const filter = {};
        if (req.user.role !== "admin" && Array.isArray(req.user.assignedProjects)) {
            const ids = await StockRequest.find({ projectId: { $in: req.user.assignedProjects } }).distinct("_id");
            filter.stockRequestId = { $in: ids };
        }
        if (procurementStatus) filter.procurementStatus = procurementStatus;
        if (vendorId) filter.vendorId = vendorId;
        if (stockRequestId) filter.stockRequestId = stockRequestId;

        const [items, total] = await Promise.all([
            Procurement.find(filter)
                .populate("vendorId", "companyName phone")
                .populate("materialId", "name unit")
                .populate("stockRequestId", "requestNumber projectId")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Procurement.countDocuments(filter),
        ]);

        return success(res, 200, "Procurements fetched", items, buildPagination(page, limit, total));
    } catch (error) {
        return fail(res, 500, "Error fetching procurements", error);
    }
};
