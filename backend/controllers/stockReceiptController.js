import mongoose from "mongoose";
import StockReceipt from "../models/StockReceipt.js";
import StockRequest from "../models/StockRequest.js";
import Procurement from "../models/Procurement.js";
import { uploadToCloudinary } from "../utils/cloudUpload.js";
import { applyStockLedgerEntry, getProjectInventory } from "../utils/inventory.js";
import StockLedger from "../models/stockLedgerSchema.js";
import { success, fail, getPagination, buildPagination } from "../utils/apiResponse.js";
import { logAudit } from "../utils/audit.js";
import { notifyRoles } from "../utils/notify.js";

/**
 * POST /api/stock/receipts
 * Supervisor/Manager confirms material physically arrived at site (from a
 * Procurement — vendor delivery). Only acceptedQuantity is credited to
 * project stock; damaged/rejected quantities are recorded but never added.
 * (Inter-project StockTransfer receiving is confirmed separately via
 * stockTransferController.confirmTransferReceipt since that stock was
 * already credited at transfer time.)
 */
export const createStockReceipt = async (req, res) => {
    const session = await mongoose.startSession();
    try {
        const { stockRequestId, sourceType, sourceId, receivedQuantity, damagedQuantity, rejectedQuantity, invoiceNumber, remarks } = req.body;

        if (!stockRequestId || sourceType !== "Procurement" || !sourceId || receivedQuantity === undefined) {
            return fail(res, 400, "stockRequestId, sourceType='Procurement', sourceId and receivedQuantity are required");
        }

        const request = await StockRequest.findById(stockRequestId);
        if (!request) return fail(res, 404, "Stock request not found");

        const procurement = await Procurement.findById(sourceId);
        if (!procurement) return fail(res, 404, "Procurement record not found");

        const damaged = Number(damagedQuantity || 0);
        const rejected = Number(rejectedQuantity || 0);
        const received = Number(receivedQuantity);
        const accepted = Math.max(received - damaged - rejected, 0);

        const materialImages = [];
        if (req.files?.materialImages) {
            for (const f of req.files.materialImages) materialImages.push(await uploadToCloudinary(f, "stock-receipts/images"));
        }
        let invoiceFile = null;
        if (req.files?.invoiceFile?.[0]) invoiceFile = await uploadToCloudinary(req.files.invoiceFile[0], "stock-receipts/invoices");
        let deliveryChallan = null;
        if (req.files?.deliveryChallan?.[0]) deliveryChallan = await uploadToCloudinary(req.files.deliveryChallan[0], "stock-receipts/challans");

        let receipt;
        await session.withTransaction(async () => {
            receipt = (
                await StockReceipt.create(
                    [
                        {
                            stockRequestId,
                            sourceType,
                            sourceId,
                            projectId: request.projectId,
                            materialId: request.materialId,
                            receivedQuantity: received,
                            damagedQuantity: damaged,
                            rejectedQuantity: rejected,
                            acceptedQuantity: accepted,
                            receivedBy: req.user.id,
                            invoiceNumber: invoiceNumber || null,
                            invoiceFile,
                            deliveryChallan,
                            materialImages,
                            remarks: remarks || "",
                            verificationStatus: damaged || rejected ? "Discrepancy Noted" : "Verified",
                        },
                    ],
                    { session }
                )
            )[0];

            if (accepted > 0) {
                await applyStockLedgerEntry({
                    projectId: request.projectId,
                    itemId: request.materialId,
                    qtyChange: accepted,
                    transactionType: "PROCUREMENT_RECEIPT",
                    referenceId: receipt._id,
                    referenceNumber: request.requestNumber,
                    remarks: `Site receipt for ${request.requestNumber}`,
                    session,
                });
            }

            procurement.procurementStatus = "StockUpdated";
            procurement.actualDeliveryDate = procurement.actualDeliveryDate || new Date();
            await procurement.save({ session });

            request.status = accepted >= request.quantity ? "FULFILLED" : "PARTIALLY_FULFILLED";
            request.updatedBy = req.user.id;
            await request.save({ session });
        });

        await logAudit({ module: "StockReceipt", entityId: receipt._id, action: "received", performedBy: req.user.id, meta: { accepted, damaged, rejected } });
        await notifyRoles({ roles: ["admin"], title: "Material received at site", message: `${request.materialName}: ${accepted} accepted, ${damaged} damaged, ${rejected} rejected`, module: "Stock", referenceType: "StockReceipt", referenceId: receipt._id, projectId: request.projectId });

        return success(res, 201, "Stock receipt recorded", receipt);
    } catch (error) {
        return fail(res, 500, "Error recording stock receipt", error);
    } finally {
        session.endSession();
    }
};

/** GET /api/stock/receipts — filterable list. */
export const listStockReceipts = async (req, res) => {
    try {
        const { page, limit, skip } = getPagination(req);
        const { projectId, verificationStatus } = req.query;

        const filter = {};
        if (projectId) filter.projectId = projectId;
        if (verificationStatus) filter.verificationStatus = verificationStatus;

        const [items, total] = await Promise.all([
            StockReceipt.find(filter)
                .populate("projectId", "projectName")
                .populate("materialId", "name unit")
                .populate("receivedBy", "name")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            StockReceipt.countDocuments(filter),
        ]);

        return success(res, 200, "Stock receipts fetched", items, buildPagination(page, limit, total));
    } catch (error) {
        return fail(res, 500, "Error fetching receipts", error);
    }
};

/** GET /api/stock/inventory/:projectId — full project-wise inventory (current balances). */
export const getInventory = async (req, res) => {
    try {
        const inventory = await getProjectInventory(req.params.projectId);
        return success(res, 200, "Inventory fetched", inventory);
    } catch (error) {
        return fail(res, 500, "Error fetching inventory", error);
    }
};

/** GET /api/stock/ledger/project/:projectId?itemId= — project-wise stock ledger (audit trail of every quantity change). */
export const getProjectLedger = async (req, res) => {
    try {
        const { page, limit, skip } = getPagination(req);
        const filter = { projectId: req.params.projectId };
        if (req.query.itemId) filter.itemId = req.query.itemId;

        const [items, total] = await Promise.all([
            StockLedger.find(filter).populate("itemId", "name unit").sort({ createdAt: -1 }).skip(skip).limit(limit),
            StockLedger.countDocuments(filter),
        ]);

        return success(res, 200, "Ledger fetched", items, buildPagination(page, limit, total));
    } catch (error) {
        return fail(res, 500, "Error fetching ledger", error);
    }
};
