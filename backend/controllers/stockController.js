import mongoose from "mongoose";
import Stock from "../models/Stock.js";
import StockLedger from "../models/stockLedgerSchema.js";
import StockIssue from "../models/StockIssue.js";
import StockTransaction from "../models/StockTransaction.js";
import { applyStockLedgerEntry } from "../utils/inventory.js";
import { logAudit } from "../utils/audit.js";

// ⚠️ NOTE ON A BUG FOUND & FIXED HERE (follow-up audit):
// controllers/stockHelpers.js's adjustStock() queried
// Stock.findOne({ projectId, itemId }) and Stock.create({ projectId, itemId,
// qty, unit }) — but models/Stock.js has NO projectId or qty field at the
// top level; real per-project balances live in Stock.projectBalances[],
// and the total field is `quantity`, not `qty`. Every call to adjustStock
// therefore missed all existing stock and (since Mongoose strips fields
// not in the schema by default) created a throwaway, empty Stock document
// instead of actually moving inventory. receiveMaterial/transferMaterial/
// returnMaterial below looked like they worked (200/201 responses,
// "stock" in the payload) but never touched real balances.
// Fixed by routing all four functions through the same
// applyStockLedgerEntry() choke-point the newer Stock Request/Transfer
// modules already use, which operates on the real schema and is the
// single place stock quantities are allowed to change from.

// ===================================================
// 1️⃣ RECEIVE MATERIAL (GRN)
// ===================================================
export const receiveMaterial = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    const { projectId, itemId, qty, unit, reason, materialRequestId, purchaseOrderId } = req.body;
    const n = Number(qty);

    if (!projectId || !itemId || !Number.isFinite(n) || n <= 0) {
      return res.status(400).json({ message: "projectId, itemId and a positive qty are required" });
    }

    let stock, txn;
    await session.withTransaction(async () => {
      ({ stock } = await applyStockLedgerEntry({
        projectId, itemId, qtyChange: n, transactionType: "GRN",
        remarks: reason || "Material received", session,
      }));

      [txn] = await StockTransaction.create([{
        projectId, itemId, type: "IN", qty: n, unit,
        reason: reason || "Material received",
        materialRequestId: materialRequestId || null,
        purchaseOrderId: purchaseOrderId || null,
        createdBy: req.user.id,
      }], { session });

      await logAudit({
        module: "Inventory", entityId: txn._id, action: "receive",
        performedBy: req.user.id, remarks: reason || "",
        meta: { projectId, itemId, qty: n }, projectId, session,
      });
    });

    return res.status(201).json({
      message: "Material received & stock updated",
      stock,
      transaction: txn,
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
// 2️⃣ USE MATERIAL (STOCK OUT)
// ===================================================
export const createStockIssue = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    const { projectId, items } = req.body;
    const issuedBy = req.user.id;

    if (!projectId || !items?.length) {
      return res.status(400).json({ message: "Invalid data" });
    }
    for (const it of items) {
      const q = Number(it.qty);
      if (!it.itemId || !Number.isFinite(q) || q <= 0) {
        return res.status(400).json({ message: `Invalid item/qty in issue payload: ${JSON.stringify(it)}` });
      }
    }

    let issue;
    await session.withTransaction(async () => {
      [issue] = await StockIssue.create([{ projectId, issuedBy, items }], { session });

      for (const it of items) {
        const qty = Number(it.qty);
        const { ledgerEntry } = await applyStockLedgerEntry({
          projectId, itemId: it.itemId, qtyChange: -qty, transactionType: "ISSUE",
          referenceId: issue._id, referenceNumber: `ISS-${issue._id}`,
          remarks: it.remarks || "Issued to project", session,
        });
        await logAudit({
          module: "Inventory", entityId: ledgerEntry._id, action: "issue",
          performedBy: issuedBy, meta: { projectId, itemId: it.itemId, qty }, projectId, session,
        });
      }
    });

    res.status(201).json({ message: "Stock issued successfully", issue });

  } catch (err) {
    res.status(400).json({ message: "Issue error", error: err.message });
  } finally {
    session.endSession();
  }
};




// ===================================================
// 3️⃣ TRANSFER MATERIAL
// ===================================================
export const transferMaterial = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    const { fromProjectId, toProjectId, itemId, qty, unit, reason } = req.body;
    const n = Number(qty);

    if (!fromProjectId || !toProjectId || !itemId || !Number.isFinite(n) || n <= 0) {
      return res.status(400).json({ message: "fromProjectId, toProjectId, itemId and a positive qty are required" });
    }
    if (String(fromProjectId) === String(toProjectId)) {
      return res.status(400).json({ message: "fromProjectId and toProjectId must be different" });
    }

    let fromStock, toStock, txn;
    await session.withTransaction(async () => {
      // Debit source first — applyStockLedgerEntry throws if this would go
      // negative, which aborts the whole transaction (nothing partially
      // applied), satisfying the "source and destination succeed together
      // or not at all" rule.
      ({ stock: fromStock } = await applyStockLedgerEntry({
        projectId: fromProjectId, itemId, qtyChange: -n, transactionType: "TRANSFER_OUT",
        remarks: reason || "Material transferred", session,
      }));
      ({ stock: toStock } = await applyStockLedgerEntry({
        projectId: toProjectId, itemId, qtyChange: n, transactionType: "TRANSFER_IN",
        remarks: reason || "Material transferred", session,
      }));

      [txn] = await StockTransaction.create([{
        itemId, type: "TRANSFER", qty: n, unit,
        fromProject: fromProjectId, toProject: toProjectId,
        reason: reason || "Material transferred", createdBy: req.user.id,
      }], { session });

      await logAudit({
        module: "Inventory", entityId: txn._id, action: "transfer",
        performedBy: req.user.id, meta: { fromProjectId, toProjectId, itemId, qty: n },
        session,
      });
    });

    return res.status(200).json({
      message: "Material transferred",
      fromStock,
      toStock,
      transaction: txn
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
// 4️⃣ RETURN MATERIAL (SITE → GODOWN / VENDOR)
// ===================================================
export const returnMaterial = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    const { projectId, itemId, qty, unit, reason } = req.body;
    const n = Number(qty);

    if (!projectId || !itemId || !Number.isFinite(n) || n <= 0) {
      return res.status(400).json({ message: "projectId, itemId and a positive qty are required" });
    }

    let stock, txn;
    await session.withTransaction(async () => {
      ({ stock } = await applyStockLedgerEntry({
        projectId, itemId, qtyChange: -n, transactionType: "RETURN",
        remarks: reason || "Material returned", session,
      }));

      [txn] = await StockTransaction.create([{
        projectId, itemId, type: "RETURN", qty: n, unit,
        reason: reason || "Material returned", createdBy: req.user.id,
      }], { session });

      await logAudit({
        module: "Inventory", entityId: txn._id, action: "return",
        performedBy: req.user.id, meta: { projectId, itemId, qty: n }, projectId, session,
      });
    });

    return res.status(201).json({
      message: "Material returned",
      stock,
      transaction: txn,
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
// 5️⃣ ALL TRANSACTIONS OF A PROJECT
// ===================================================
export const getProjectTransactions = async (req, res) => {
  try {
    const { projectId } = req.params;

    const txns = await StockTransaction.find({
      $or: [
        { projectId },
        { fromProject: projectId },
        { toProject: projectId },
      ]
    })
      .populate("itemId", "name unit")
      .populate("createdBy", "name role")
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
// 6️⃣ PROJECT-WISE STOCK
// ===================================================
export const getProjectStock = async (req, res) => {
  try {
    const { projectId } = req.params;

    const allStock = await Stock.find().populate("itemId", "name unit");

    const filtered = allStock.map((st) => {
      const pb = st.projectBalances.find(
        (p) => String(p.projectId) === String(projectId)
      );

      return {
        itemId: st.itemId._id,
        name: st.itemId.name,
        unit: st.itemId.unit,
        qty: pb?.qty || 0,
        damaged: st.damaged,
      };
    });

    res.status(200).json({ stock: filtered });

  } catch (err) {
    res.status(500).json({ message: "Stock error", error: err.message });
  }
};



// ===================================================
// 7️⃣ ITEM LEDGER
// ===================================================
export const getItemLedger = async (req, res) => {
  try {
    const { itemId } = req.params;

    const ledger = await StockLedger.find({ itemId })
      .populate("projectId", "projectName")
      .sort({ createdAt: -1 });

    res.status(200).json(ledger);

  } catch (err) {
    res.status(500).json({ message: "Ledger error", error: err.message });
  }
};



// ===================================================
// 8️⃣ GET ALL ISSUES OF A PROJECT
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
