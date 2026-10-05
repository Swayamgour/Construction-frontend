import mongoose from "mongoose";
import StockRequest from "../models/StockRequest.js";
import MaterialRequest from "../models/MaterialRequest.js";
import PurchaseOrder from "../models/PurchaseOrder.js";
import Procurement from "../models/Procurement.js";
import GRN from "../models/GRN.js";
import StockReceipt from "../models/StockReceipt.js";
import StockLedger from "../models/stockLedgerSchema.js";
import StockTransaction from "../models/StockTransaction.js";

/**
 * Historical Data Migration:
 * Consolidates old/duplicate collections into single canonical models:
 * - MaterialRequest -> StockRequest
 * - Procurement -> PurchaseOrder
 * - StockReceipt -> GRN
 * - StockTransaction -> StockLedger
 */
export const runInventoryDataMigration = async () => {
  const stats = {
    materialRequestsMigrated: 0,
    procurementsMigrated: 0,
    stockReceiptsMigrated: 0,
    stockTransactionsMigrated: 0,
  };

  try {
    // 1. Migrate MaterialRequest -> StockRequest
    const oldMRs = await MaterialRequest.find();
    for (const mr of oldMRs) {
      const existingSR = await StockRequest.findOne({
        $or: [
          { requestNumber: mr.requestNumber },
          { _id: mr._id },
        ],
      });

      if (!existingSR) {
        const items = (mr.items || []).map((it) => ({
          itemId: it.itemId,
          materialName: "",
          unit: it.unit || "",
          requestedQty: Number(it.requestedQty || 1),
          approvedQty: mr.status === "approved" ? Number(it.requestedQty || 1) : 0,
          availableQty: 0,
          shortageQty: Number(it.requestedQty || 1),
          fulfilledQty: Number(it.fulfilledQty || 0),
          fulfillmentStatus: mr.status === "approved" ? "ORDERED" : "PENDING",
          purpose: it.purpose || mr.purpose || "",
        }));

        let mappedStatus = "PENDING_APPROVAL";
        if (mr.status === "approved") mappedStatus = "APPROVED";
        else if (mr.status === "rejected") mappedStatus = "REJECTED";
        else if (mr.status === "completed" || mr.status === "fulfilled") mappedStatus = "FULFILLED";
        else if (mr.status === "partially_fulfilled") mappedStatus = "PARTIALLY_FULFILLED";

        await StockRequest.create({
          _id: mr._id,
          requestNumber: mr.requestNumber || `MR-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          projectId: mr.projectId,
          requestedBy: mr.requestedBy,
          requestedByRole: mr.requestedByRole || "manager",
          items: items.length > 0 ? items : [{
            itemId: mr.itemId || new mongoose.Types.ObjectId(),
            requestedQty: 1,
            unit: "unit",
          }],
          requiredDate: mr.requiredDate || mr.createdAt,
          priority: mr.priority || "Medium",
          purpose: mr.purpose || "",
          description: mr.description || "",
          status: mappedStatus,
          approvedBy: mr.approvedBy || null,
          approvedAt: mr.approvalDate || null,
          adminRemarks: mr.adminRemarks || "",
          createdBy: mr.requestedBy,
          createdAt: mr.createdAt,
          updatedAt: mr.updatedAt,
        });
        stats.materialRequestsMigrated++;
      }
    }

    // 2. Migrate Procurement -> PurchaseOrder
    const oldProcurements = await Procurement.find();
    for (const proc of oldProcurements) {
      if (!proc.purchaseOrderId) {
        const existingPO = await PurchaseOrder.findOne({
          stockRequestId: proc.stockRequestId,
          vendorId: proc.vendorId,
        });

        if (!existingPO) {
          const sr = await StockRequest.findById(proc.stockRequestId);
          const base = Number(proc.quantity) * Number(proc.rate);
          const taxAmt = (base * (proc.tax || 0)) / 100;
          const total = base + taxAmt;

          const createdPo = await PurchaseOrder.create({
            projectId: sr ? sr.projectId : new mongoose.Types.ObjectId(),
            vendorId: proc.vendorId,
            deliveryType: "CENTRAL_GODOWN",
            stockRequestId: proc.stockRequestId,
            items: [
              {
                itemId: proc.materialId,
                qty: proc.quantity,
                unit: sr ? sr.unit : "",
                rate: proc.rate,
                amount: base,
                tax: proc.tax || 0,
                taxAmount: taxAmt,
                discount: 0,
                discountAmount: 0,
                total,
                receivedQty: proc.procurementStatus === "StockUpdated" ? proc.quantity : 0,
              },
            ],
            subtotal: base,
            taxTotal: taxAmt,
            discountTotal: 0,
            grandTotal: total,
            status: proc.procurementStatus === "StockUpdated" ? "RECEIVED" : "ORDERED",
            createdBy: proc.createdBy,
            orderedAt: proc.createdAt,
            orderedBy: proc.createdBy,
            createdAt: proc.createdAt,
            updatedAt: proc.updatedAt,
          });

          proc.purchaseOrderId = createdPo._id;
          await proc.save();
          stats.procurementsMigrated++;
        }
      }
    }

    // 3. Migrate StockReceipt -> GRN
    const oldReceipts = await StockReceipt.find();
    for (const r of oldReceipts) {
      const existingGRN = await GRN.findOne({
        $or: [
          { _id: r._id },
          { deliveryChallan: r.deliveryChallan, projectId: r.projectId },
        ],
      });

      if (!existingGRN) {
        await GRN.create({
          _id: r._id,
          stockRequestId: r.stockRequestId,
          projectId: r.projectId,
          deliveryType: "DIRECT_PROJECT_SITE",
          destinationProjectId: r.projectId,
          deliveryChallan: r.deliveryChallan || "",
          driverName: "",
          vehicleNumber: "",
          receivedDate: r.receivedDate || r.createdAt,
          receivedBy: r.receivedBy,
          status: "RECEIVED",
          items: [
            {
              itemId: r.materialId,
              orderedQty: r.receivedQuantity,
              receivedQty: r.receivedQuantity,
              acceptedQty: r.acceptedQuantity,
              damagedQty: r.damagedQuantity || 0,
              returnQty: r.rejectedQuantity || 0,
              remarks: r.remarks || "",
            },
          ],
          createdAt: r.createdAt,
          updatedAt: r.updatedAt,
        });
        stats.stockReceiptsMigrated++;
      }
    }

    // 4. Migrate StockTransaction -> StockLedger
    const oldTxns = await StockTransaction.find();
    for (const txn of oldTxns) {
      const existingLedger = await StockLedger.findOne({
        referenceId: txn._id,
      });

      if (!existingLedger && txn.projectId) {
        let tType = "GRN";
        if (txn.type === "OUT") tType = "ISSUE";
        else if (txn.type === "TRANSFER") tType = "TRANSFER_OUT";
        else if (txn.type === "RETURN") tType = "RETURN";

        await StockLedger.create({
          itemId: txn.itemId,
          projectId: txn.projectId,
          transactionType: tType,
          referenceId: txn._id,
          referenceNumber: txn.reason || "Legacy txn",
          qtyIn: txn.type === "IN" ? txn.qty : 0,
          qtyOut: txn.type !== "IN" ? txn.qty : 0,
          balanceQty: 0,
          remarks: txn.reason || `Migrated from legacy transaction ${txn._id}`,
          createdAt: txn.createdAt,
          updatedAt: txn.updatedAt,
        });
        stats.stockTransactionsMigrated++;
      }
    }

    console.log("✅ Inventory Data Migration Completed:", stats);
    return stats;
  } catch (err) {
    console.error("❌ Inventory Data Migration Error:", err.message);
    throw err;
  }
};
