import mongoose from "mongoose";
import GRN from "../models/GRN.js";
import PurchaseOrder from "../models/PurchaseOrder.js";
import StockRequest from "../models/StockRequest.js";
import StockLedger from "../models/stockLedgerSchema.js";
import { receiveStockGRN, getInventorySummary, getOrCreateCentralGodown } from "../services/inventoryService.js";
import { logAudit } from "../utils/audit.js";

/**
 * POST /api/grn/add or /api/grn — Single Receiving System.
 * Receives goods against a Purchase Order, respecting deliveryType routing.
 * Credits Usable Stock (acceptedQty) and Damaged Stock (damagedQty) via inventoryService.
 */
export const createGRN = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    const {
      purchaseOrderId,
      stockRequestId,
      deliveryChallan,
      dispatchDate,
      vehicleNumber,
      driverName,
      items,
    } = req.body;

    if (!items || !Array.isArray(items) || !items.length) {
      return res.status(400).json({ message: "At least one item is required in GRN" });
    }

    let grn;
    await session.withTransaction(async () => {
      let po = null;
      let deliveryType = "CENTRAL_GODOWN";
      let destinationProjectId = null;
      let projectId = null;

      if (purchaseOrderId) {
        po = await PurchaseOrder.findById(purchaseOrderId).session(session);
        if (!po) throw new Error("Purchase order not found");
        if (!["ORDERED", "PARTIALLY_RECEIVED"].includes(String(po.status).toUpperCase())) {
          throw new Error("PO must be in ORDERED or PARTIALLY_RECEIVED status before receiving");
        }
        deliveryType = po.deliveryType || "CENTRAL_GODOWN";
        projectId = po.projectId;

        if (deliveryType === "CENTRAL_GODOWN") {
          const godown = await getOrCreateCentralGodown(session);
          destinationProjectId = godown._id;
        } else {
          destinationProjectId = po.deliveryProject || po.projectId;
        }
      } else {
        throw new Error("purchaseOrderId is required to receive goods via GRN");
      }

      // 1. Create GRN document
      grn = new GRN({
        purchaseOrderId,
        stockRequestId: stockRequestId || po?.stockRequestId || null,
        projectId,
        deliveryType,
        destinationProjectId,
        poNumber: po?.poNumber || "",
        deliveryChallan: deliveryChallan || "",
        dispatchDate: dispatchDate || null,
        vehicleNumber: vehicleNumber || "",
        driverName: driverName || "",
        receivedBy: req.user.id,
        receivedDate: new Date(),
        status: "RECEIVED",
        items,
      });
      await grn.save({ session });

      // 2. Process stock movements through central inventoryService
      await receiveStockGRN({
        purchaseOrderId: po._id,
        stockRequestId: grn.stockRequestId,
        deliveryType,
        destinationProjectId,
        poNumber: grn.poNumber,
        deliveryChallan: grn.deliveryChallan,
        items,
        userId: req.user.id,
        session,
      });

      // 3. Update Purchase Order line receivedQty and overall status
      if (po) {
        for (const it of items) {
          const accepted = it.acceptedQty !== undefined
            ? Number(it.acceptedQty)
            : Math.max(Number(it.receivedQty || 0) - Number(it.damagedQty || 0) - Number(it.returnQty || 0), 0);

          const poLine = po.items.find((x) => String(x.itemId) === String(it.itemId));
          if (poLine) {
            poLine.receivedQty = Number(poLine.receivedQty || 0) + accepted;
          }
        }

        const allReceived = po.items.every((i) => Number(i.receivedQty || 0) >= Number(i.qty));
        const anyReceived = po.items.some((i) => Number(i.receivedQty || 0) > 0);
        po.status = allReceived ? "RECEIVED" : anyReceived ? "PARTIALLY_RECEIVED" : "ORDERED";
        po.receivedHistory.push({
          grnId: grn._id,
          receivedAt: new Date(),
          receivedBy: req.user.id,
        });
        await po.save({ session });
      }

      // 4. Update linked StockRequest if present
      const linkedSrId = grn.stockRequestId || po?.stockRequestId;
      if (linkedSrId) {
        const sr = await StockRequest.findById(linkedSrId).session(session);
        if (sr) {
          let allFulfilled = true;
          if (sr.items && sr.items.length > 0) {
            for (const srItem of sr.items) {
              const matchedGrnItem = items.find((i) => String(i.itemId) === String(srItem.itemId));
              if (matchedGrnItem) {
                const accepted = matchedGrnItem.acceptedQty !== undefined
                  ? Number(matchedGrnItem.acceptedQty)
                  : Math.max(Number(matchedGrnItem.receivedQty || 0) - Number(matchedGrnItem.damagedQty || 0), 0);
                srItem.fulfilledQty = Number(srItem.fulfilledQty || 0) + accepted;
                if (srItem.fulfilledQty >= Number(srItem.requestedQty)) {
                  srItem.fulfillmentStatus = "FULFILLED";
                } else if (srItem.fulfilledQty > 0) {
                  srItem.fulfillmentStatus = "PARTIALLY_AVAILABLE";
                  allFulfilled = false;
                } else {
                  allFulfilled = false;
                }
              } else if (Number(srItem.fulfilledQty || 0) < Number(srItem.requestedQty)) {
                allFulfilled = false;
              }
            }
          }
          sr.status = allFulfilled ? "FULFILLED" : "PARTIALLY_FULFILLED";
          sr.updatedBy = req.user.id;
          await sr.save({ session });
        }
      }

      await logAudit({
        module: "GRN",
        entityId: grn._id,
        action: "created",
        performedBy: req.user.id,
        projectId: destinationProjectId,
        meta: { deliveryType, purchaseOrderId: po?._id },
        session,
      });
    });

    res.status(201).json({ message: "GRN created successfully and stock updated", grn });
  } catch (err) {
    if (!res.headersSent) {
      res.status(400).json({ message: "GRN error", error: err.message });
    }
  } finally {
    session.endSession();
  }
};

/**
 * GET /api/grn/:id — Get GRN details.
 */
export const getGRN = async (req, res) => {
  try {
    const grn = await GRN.findById(req.params.id)
      .populate("purchaseOrderId", "poNumber status deliveryType projectId deliveryProject")
      .populate("stockRequestId", "requestNumber status")
      .populate("projectId", "projectName projectCode")
      .populate("destinationProjectId", "projectName projectCode")
      .populate("items.itemId", "name unit category")
      .populate("receivedBy", "name role");

    if (!grn) return res.status(404).json({ message: "GRN not found" });
    res.json({ message: "GRN fetched", grn });
  } catch (err) {
    res.status(500).json({ message: "Error fetching GRN", error: err.message });
  }
};

/**
 * GET /api/grn — List all GRNs.
 */
export const listGRNs = async (req, res) => {
  try {
    const filter = {};
    if (req.query.projectId) {
      filter.$or = [{ projectId: req.query.projectId }, { destinationProjectId: req.query.projectId }];
    }
    const grns = await GRN.find(filter)
      .populate("purchaseOrderId", "poNumber status deliveryType")
      .populate("destinationProjectId", "projectName projectCode")
      .populate("items.itemId", "name unit category")
      .populate("receivedBy", "name")
      .sort({ createdAt: -1 });

    res.json({ message: "GRNs fetched", grns, data: grns });
  } catch (err) {
    res.status(500).json({ message: "Error listing GRNs", error: err.message });
  }
};

/**
 * GET /api/grn/project/:projectId — Project inventory (delegates to inventoryService).
 */
export const getProjectStock = async (req, res) => {
  try {
    const { projectId } = req.params;
    const inventory = await getInventorySummary({ projectId });
    res.json({ stock: inventory });
  } catch (err) {
    res.status(500).json({ message: "Project Stock Error", error: err.message });
  }
};

/**
 * GET /api/grn/history/:itemId/:projectId — Item stock ledger history.
 */
export const getItemHistory = async (req, res) => {
  try {
    const logs = await StockLedger.find({
      itemId: req.params.itemId,
      projectId: req.params.projectId,
    }).sort({ createdAt: -1 });
    res.json({ history: logs });
  } catch (err) {
    res.status(500).json({ message: "Ledger error", error: err.message });
  }
};
