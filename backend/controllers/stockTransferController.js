import mongoose from "mongoose";
import StockTransfer from "../models/StockTransfer.js";
import StockRequest from "../models/StockRequest.js";
import { applyStockMovement, getInventorySummary } from "../services/inventoryService.js";
import { success, fail, getPagination, buildPagination } from "../utils/apiResponse.js";
import { logAudit } from "../utils/audit.js";
import { notifyRoles, notifyUsers } from "../utils/notify.js";

/**
 * POST /api/stock/transfers
 * Admin fulfils a StockRequest by moving material from another project
 * ("Option 1" in the spec). Debits source, credits destination, and writes
 * two ledger rows atomically — never a bare quantity edit.
 */
export const createStockTransfer = async (req, res) => {
    const session = await mongoose.startSession();
    try {
        const { stockRequestId, sourceProjectId, destinationProjectId, materialId, quantity, transferredQuantity, remarks } = req.body;
        const qty = Number(transferredQuantity || quantity);

        if (!sourceProjectId || !qty || qty <= 0) {
            return fail(res, 400, "sourceProjectId and a positive quantity are required");
        }

        let targetDestId = destinationProjectId;
        let targetMatId = materialId;
        let request = null;

        if (stockRequestId) {
            request = await StockRequest.findById(stockRequestId);
            if (!request) return fail(res, 404, "Stock request not found");
            if (!["PENDING_ADMIN_REVIEW", "PARTIALLY_FULFILLED"].includes(request.status)) {
                return fail(res, 400, `Request is already ${request.status}`);
            }
            targetDestId = request.projectId;
            targetMatId = request.materialId;
        }

        if (!targetDestId || !targetMatId) {
            return fail(res, 400, "destinationProjectId and materialId are required");
        }

        if (String(sourceProjectId) === String(targetDestId)) {
            return fail(res, 400, "Source project cannot be the same as the destination project");
        }

        let transfer;
        await session.withTransaction(async () => {
            transfer = (
                await StockTransfer.create(
                    [
                        {
                            stockRequestId: stockRequestId || null,
                            sourceProjectId,
                            destinationProjectId: targetDestId,
                            materialId: targetMatId,
                            requestedQuantity: request ? request.quantity : qty,
                            transferredQuantity: qty,
                            initiatedBy: req.user.id,
                            approvedBy: req.user.id,
                            status: "InTransit",
                            remarks: remarks || "",
                        },
                    ],
                    { session }
                )
            )[0];

            const refNumber = request ? request.requestNumber : `TRF-${Date.now()}`;

            const debit = await applyStockMovement({
                projectId: sourceProjectId,
                itemId: targetMatId,
                qtyChange: -qty,
                transactionType: "TRANSFER_OUT",
                referenceId: transfer._id,
                referenceNumber,
                remarks: `Transfer out to fulfil ${refNumber}`,
                session,
            });

            const credit = await applyStockMovement({
                projectId: targetDestId,
                itemId: targetMatId,
                qtyChange: qty,
                transactionType: "TRANSFER_IN",
                referenceId: transfer._id,
                referenceNumber,
                remarks: `Transfer in fulfilling ${refNumber}`,
                session,
            });

            transfer.sourceStockBalanceAfter = debit.projectBalance;
            transfer.destinationStockBalanceAfter = credit.projectBalance;
            await transfer.save({ session });

            if (request) {
                request.status = "APPROVED_TRANSFER";
                request.updatedBy = req.user.id;
                await request.save({ session });
            }
        });

        await logAudit({ module: "StockTransfer", entityId: transfer._id, action: "initiated", performedBy: req.user.id, meta: { quantity: qty } });
        if (request) {
            await notifyUsers({ userIds: [request.requestedBy], title: "Material transfer in progress", message: `${qty} ${request.unit} of ${request.materialName} is being transferred to your project`, module: "Stock", referenceType: "StockTransfer", referenceId: transfer._id, projectId: targetDestId });
        }
        await notifyRoles({ roles: ["manager", "admin"], projectId: targetDestId, title: "Incoming stock transfer", message: `Stock transfer inbound for destination project`, module: "Stock", referenceType: "StockTransfer", referenceId: transfer._id });

        return success(res, 201, "Stock transfer created", transfer);
    } catch (error) {
        return fail(res, 500, error.message || "Error creating stock transfer", error);
    } finally {
        session.endSession();
    }
};

/**
 * PATCH /api/stock/transfers/:id/receive
 * Destination project supervisor/manager confirms physical receipt.
 * Stock balances were already credited at transfer time (see above) — this
 * only flips status and records who/when, matching the audit requirement
 * without double-crediting inventory.
 */
export const confirmTransferReceipt = async (req, res) => {
    try {
        const transfer = await StockTransfer.findById(req.params.id);
        if (!transfer) return fail(res, 404, "Transfer not found");
        if (transfer.status === "Received") return fail(res, 400, "Already received");

        transfer.status = "Received";
        transfer.receivedBy = req.user.id;
        await transfer.save();

        const request = await StockRequest.findById(transfer.stockRequestId);
        if (request) {
            const fulfilledQty = Math.min(Number(request.quantity), Number(request.fulfilledQty || 0) + Number(transfer.transferredQuantity || 0));
            request.fulfilledQty = fulfilledQty;
            request.status = fulfilledQty >= Number(request.quantity) ? "FULFILLED" : "PARTIALLY_FULFILLED";
            request.updatedBy = req.user.id;
            await request.save();
        }

        await logAudit({ module: "StockTransfer", entityId: transfer._id, action: "received", performedBy: req.user.id });
        if (request) {
            await notifyRoles({ roles: ["admin"], title: "Stock transfer received", message: `${request.materialName} received at destination project`, module: "Stock", referenceType: "StockTransfer", referenceId: transfer._id, projectId: transfer.destinationProjectId });
        }

        return success(res, 200, "Transfer marked as received", transfer);
    } catch (error) {
        return fail(res, 500, "Error confirming receipt", error);
    }
};

/**
 * PATCH /api/stock/transfers/:id/cancel
 * Compensating transaction: reverses both ledger entries (credit back the
 * source, debit back the destination) atomically, and reverts the linked
 * StockRequest so it can be re-fulfilled. Only allowed before physical
 * receipt is confirmed — once "Received", the material has already left
 * the source project's control and a transfer can no longer be undone
 * this way (would need a fresh reverse-transfer instead).
 */
export const cancelStockTransfer = async (req, res) => {
    const session = await mongoose.startSession();
    try {
        const { reason } = req.body;
        const transfer = await StockTransfer.findById(req.params.id);
        if (!transfer) return fail(res, 404, "Transfer not found");
        if (transfer.status === "Cancelled") return fail(res, 400, "Transfer already cancelled");
        if (transfer.status === "Received") return fail(res, 400, "Cannot cancel a transfer that has already been received at destination");

        let request;
        await session.withTransaction(async () => {
            // Reverse: credit back the source, debit back the destination.
            await applyStockMovement({
                projectId: transfer.sourceProjectId,
                itemId: transfer.materialId,
                qtyChange: +transfer.transferredQuantity,
                transactionType: "ADJUSTMENT",
                referenceId: transfer._id,
                referenceNumber: `CANCEL-${transfer._id}`,
                remarks: `Reversal: cancelled transfer (${reason || "no reason given"})`,
                session,
            });
            await applyStockMovement({
                projectId: transfer.destinationProjectId,
                itemId: transfer.materialId,
                qtyChange: -transfer.transferredQuantity,
                transactionType: "ADJUSTMENT",
                referenceId: transfer._id,
                referenceNumber: `CANCEL-${transfer._id}`,
                remarks: `Reversal: cancelled transfer (${reason || "no reason given"})`,
                session,
            });

            transfer.status = "Cancelled";
            transfer.remarks = `${transfer.remarks || ""} | Cancelled: ${reason || "no reason given"}`.trim();
            await transfer.save({ session });

            if (transfer.stockRequestId) {
                request = await StockRequest.findById(transfer.stockRequestId).session(session);
                if (request && ["APPROVED_TRANSFER", "PARTIALLY_FULFILLED"].includes(request.status)) {
                    request.status = "PENDING_ADMIN_REVIEW";
                    request.adminRemarks = `${request.adminRemarks || ""} | Transfer cancelled, back in queue: ${reason || ""}`.trim();
                    request.updatedBy = req.user.id;
                    await request.save({ session });
                }
            }
        });

        await logAudit({ module: "StockTransfer", entityId: transfer._id, action: "cancelled", performedBy: req.user.id, remarks: reason });
        if (request) {
            await notifyRoles({ roles: ["admin"], title: "Stock transfer cancelled", message: `${request.materialName} transfer cancelled — request re-opened`, module: "Stock", referenceType: "StockRequest", referenceId: request._id, projectId: request.projectId });
        }

        return success(res, 200, "Transfer cancelled and reversed", transfer);
    } catch (error) {
        return fail(res, 500, "Error cancelling transfer", error);
    } finally {
        session.endSession();
    }
};

/** GET /api/stock/transfers — filterable list. */
export const listStockTransfers = async (req, res) => {
    try {
        const { page, limit, skip } = getPagination(req);
        const { sourceProjectId, destinationProjectId, status } = req.query;

        const filter = {};
        if (req.user.role !== "admin" && Array.isArray(req.user.assignedProjects)) {
            filter.$or = [{ sourceProjectId: { $in: req.user.assignedProjects } }, { destinationProjectId: { $in: req.user.assignedProjects } }];
        }
        if (sourceProjectId) filter.sourceProjectId = sourceProjectId;
        if (destinationProjectId) filter.destinationProjectId = destinationProjectId;
        if (status) filter.status = status;

        const [items, total] = await Promise.all([
            StockTransfer.find(filter)
                .populate("sourceProjectId", "projectName")
                .populate("destinationProjectId", "projectName")
                .populate("materialId", "name unit")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            StockTransfer.countDocuments(filter),
        ]);

        return success(res, 200, "Stock transfers fetched", items, buildPagination(page, limit, total));
    } catch (error) {
        return fail(res, 500, "Error fetching transfers", error);
    }
};
