import mongoose from "mongoose";
import Stock from "../models/Stock.js";
import StockLedger from "../models/stockLedgerSchema.js";
import StockIssue from "../models/StockIssue.js";
import {
  issueStock,
  transferStock,
  returnStock,
  receiveStockGRN,
  applyStockMovement,
  getInventorySummary,
  getOrCreateCentralGodown,
} from "../services/inventoryService.js";
import { logAudit } from "../utils/audit.js";

// ===================================================
// 1. RECEIVE MATERIAL INTO STOCK
// ===================================================
export const receiveMaterial = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    const { projectId, itemId, qty, unit, reason, purchaseOrderId } = req.body;
    const n = Number(qty);

    if (!projectId || !itemId || !Number.isFinite(n) || n <= 0) {
      return res.status(400).json({ message: "projectId, itemId and a positive qty are required" });
    }

    let result;
    await session.withTransaction(async () => {
      result = await applyStockMovement({
        projectId,
        itemId,
        qtyChange: n,
        transactionType: "GRN",
        referenceId: purchaseOrderId || null,
        remarks: reason || "Material received directly into stock",
        userId: req.user.id,
        session,
      });

      await logAudit({
        module: "Inventory",
        entityId: result.ledgerEntry._id,
        action: "receive",
        performedBy: req.user.id,
        remarks: reason || "",
        meta: { projectId, itemId, qty: n },
        projectId,
        session,
      });
    });

    return res.status(201).json({
      message: "Material received & stock updated",
      stock: result.stock,
      ledgerEntry: result.ledgerEntry,
    });
  } catch (error) {
    return res.status(400).json({
      message: "Error receiving material",
      error: error.message,
    });
  } finally {
    session.endSession();
  }
};

// ===================================================
// 2. ISSUE MATERIAL (Store -> Site Task/Contractor)
// CRITICAL: Debits Project Usable Stock, Credits Issued Buffer
// ===================================================
export const createStockIssue = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    const { projectId, items: rawItems, itemId, qty, quantity, purpose, issuedTo, remarks } = req.body;
    const issuedBy = req.user?.id || req.user?._id;

    let items = Array.isArray(rawItems) ? rawItems : [];
    if (!items.length && itemId) {
      const q = Number(quantity !== undefined ? quantity : qty);
      items = [{ itemId, qty: q, purpose: purpose || "", issuedTo: issuedTo || "", remarks: remarks || "" }];
    }

    if (!projectId || !items.length) {
      return res.status(400).json({ message: "Invalid data: projectId and items required" });
    }
    for (const it of items) {
      const q = Number(it.qty !== undefined ? it.qty : it.quantity);
      if (!it.itemId || !Number.isFinite(q) || q <= 0) {
        return res.status(400).json({ message: `Invalid item/qty in issue payload: ${JSON.stringify(it)}` });
      }
      it.qty = q;
    }

    let issue;
    await session.withTransaction(async () => {
      [issue] = await StockIssue.create([{ projectId, issuedBy, items }], { session });

      for (const it of items) {
        const qtyToIssue = Number(it.qty);
        const { ledgerEntry } = await issueStock({
          projectId,
          itemId: it.itemId,
          qty: qtyToIssue,
          referenceId: issue._id,
          referenceNumber: `ISS-${issue._id}`,
          remarks: it.remarks || "Issued to site (added to issued buffer)",
          userId: issuedBy,
          session,
        });

        await logAudit({
          module: "Inventory",
          entityId: ledgerEntry._id,
          action: "issue",
          performedBy: issuedBy,
          meta: { projectId, itemId: it.itemId, qty: qtyToIssue },
          projectId,
          session,
        });
      }
    });

    res.status(201).json({
      message: "Stock issued successfully (Usable Stock reduced, Issued Buffer credited)",
      issue,
    });
  } catch (err) {
    res.status(400).json({ message: "Issue error", error: err.message });
  } finally {
    session.endSession();
  }
};

// ===================================================
// 3. TRANSFER MATERIAL (Inter-Project / Godown)
// ===================================================
export const transferMaterial = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    const { fromProjectId, toProjectId, itemId, qty, quantity, reason } = req.body;
    const rawQty = quantity !== undefined ? quantity : qty;
    const n = Number(rawQty);

    if (!fromProjectId || !toProjectId || !itemId || !Number.isFinite(n) || n <= 0) {
      return res.status(400).json({ message: "fromProjectId, toProjectId, itemId and a positive qty are required" });
    }
    if (String(fromProjectId) === String(toProjectId)) {
      return res.status(400).json({ message: "fromProjectId and toProjectId must be different" });
    }

    const userId = req.user?.id || req.user?._id;

    let transferResult;
    await session.withTransaction(async () => {
      transferResult = await transferStock({
        sourceProjectId: fromProjectId,
        destinationProjectId: toProjectId,
        itemId,
        quantity: n,
        remarks: reason || "Material transferred between projects",
        userId,
        session,
      });

      await logAudit({
        module: "Inventory",
        entityId: transferResult.debit.ledgerEntry._id,
        action: "transfer",
        performedBy: userId,
        meta: { fromProjectId, toProjectId, itemId, qty: n },
        session,
      });
    });

    return res.status(200).json({
      message: "Material transferred atomically",
      fromStock: transferResult.debit.stock,
      toStock: transferResult.credit.stock,
      sourceBalance: transferResult.sourceBalance,
      destinationBalance: transferResult.destinationBalance,
    });
  } catch (error) {
    return res.status(400).json({
      message: "Error transferring material",
      error: error.message,
    });
  } finally {
    session.endSession();
  }
};

// ===================================================
// 4. RETURN MATERIAL (Site -> Central Godown)
// ===================================================
export const returnMaterial = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    const { projectId, toProjectId, destinationProjectId, itemId, qty, quantity, reason } = req.body;
    const rawQty = quantity !== undefined ? quantity : qty;
    const n = Number(rawQty);

    if (!projectId || !itemId || !Number.isFinite(n) || n <= 0) {
      return res.status(400).json({ message: "projectId, itemId and a positive qty are required" });
    }

    const destId = toProjectId || destinationProjectId;

    const userId = req.user?.id || req.user?._id;

    let result;
    await session.withTransaction(async () => {
      result = await returnStock({
        sourceProjectId: projectId,
        destinationProjectId: destId,
        itemId,
        quantity: n,
        reason: reason || "Return material to central godown",
        userId,
        session,
      });

      await logAudit({
        module: "Inventory",
        entityId: result.debit.ledgerEntry._id,
        action: "return",
        performedBy: userId,
        meta: { projectId, toProjectId: destId, itemId, qty: n },
        projectId,
        session,
      });
    });

    return res.status(201).json({
      message: "Material returned and credited to central godown",
      debit: result.debit,
      credit: result.credit,
    });
  } catch (error) {
    return res.status(400).json({
      message: "Error returning material",
      error: error.message,
    });
  } finally {
    session.endSession();
  }
};

// ===================================================
// 5. ALL TRANSACTIONS / LEDGER OF A PROJECT
// ===================================================
export const getProjectTransactions = async (req, res) => {
  try {
    const { projectId } = req.params;

    const txns = await StockLedger.find({ projectId })
      .populate("itemId", "name unit category")
      .sort({ createdAt: -1 });

    return res.status(200).json(txns);
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching transactions",
      error: error.message,
    });
  }
};

// ===================================================
// 6. PROJECT-WISE STOCK (Usable, Issued Buffer, Damaged)
// ===================================================
export const getProjectStock = async (req, res) => {
  try {
    const { projectId } = req.params;
    const inventory = await getInventorySummary({ projectId });
    res.status(200).json({ stock: inventory });
  } catch (err) {
    res.status(500).json({ message: "Stock error", error: err.message });
  }
};

// ===================================================
// 7. ITEM LEDGER
// ===================================================
export const getItemLedger = async (req, res) => {
  try {
    const { itemId } = req.params;

    const ledger = await StockLedger.find({ itemId })
      .populate("projectId", "projectName projectCode")
      .sort({ createdAt: -1 });

    res.status(200).json(ledger);
  } catch (err) {
    res.status(500).json({ message: "Ledger error", error: err.message });
  }
};

// ===================================================
// 8. GET ALL ISSUES OF A PROJECT
// ===================================================
export const getProjectIssues = async (req, res) => {
  try {
    const { projectId } = req.params;

    const issues = await StockIssue.find({ projectId })
      .populate("issuedBy", "name")
      .populate("items.itemId", "name unit");

    res.status(200).json(issues);
  } catch (err) {
    res.status(500).json({ message: "Issue fetch error", error: err.message });
  }
};
