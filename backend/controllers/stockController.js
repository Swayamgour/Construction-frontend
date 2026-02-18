import Stock from "../models/Stock.js";
import StockLedger from "../models/stockLedgerSchema.js";
import StockIssue from "../models/StockIssue.js";
import StockTransaction from "../models/StockTransaction.js";

// import MaterialRequest from "../models/materialRequestSchema.js";
// import GRN from "../models/grnSchema.js";

// import { adjustStock } from "./stockHelpers.js";


import { adjustStock } from "./stockHelpers.js";


// ===================================================
// 1️⃣ RECEIVE MATERIAL (GRN)
// ===================================================
export const receiveMaterial = async (req, res) => {
  try {
    const { projectId, itemId, qty, unit, reason, materialRequestId, purchaseOrderId } = req.body;

    if (!projectId || !itemId || !qty) {
      return res.status(400).json({ message: "projectId, itemId, qty required" });
    }

    const stock = await adjustStock({
      projectId,
      itemId,
      unit,
      qtyChange: +qty,
    });

    const txn = await StockTransaction.create({
      projectId,
      itemId,
      type: "IN",
      qty,
      unit,
      reason: reason || "Material received",
      materialRequestId: materialRequestId || null,
      purchaseOrderId: purchaseOrderId || null,
      createdBy: req.user.id,
    });

    return res.status(201).json({
      message: "Material received & stock updated",
      stock,
      transaction: txn,
    });

  } catch (error) {
    return res.status(500).json({
      message: "Error receiving material",
      error: error.message,
    });
  }
};



// ===================================================
// 2️⃣ USE MATERIAL (STOCK OUT)
// ===================================================
export const createStockIssue = async (req, res) => {
  try {
    const { projectId, items } = req.body;
    const issuedBy = req.user.id;   // ⭐ FIXED HERE

    if (!projectId || !items?.length) {
      return res.status(400).json({ message: "Invalid data" });
    }

    const issue = await StockIssue.create({
      projectId,
      issuedBy,
      items
    });

    for (const it of items) {
      const qty = Number(it.qty);

      let stock = await Stock.findOne({ itemId: it.itemId });
      if (!stock) continue;

      stock.quantity -= qty;

      const idx = stock.projectBalances.findIndex(
        (pb) => String(pb.projectId) === String(projectId)
      );

      if (idx >= 0) {
        stock.projectBalances[idx].qty -= qty;
      }

      await stock.save();

      const lastEntry = await StockLedger.findOne({ itemId: it.itemId })
        .sort({ createdAt: -1 });

      const prevBalance = lastEntry ? lastEntry.balanceQty : 0;

      await StockLedger.create({
        itemId: it.itemId,
        projectId,
        transactionType: "ISSUE",
        referenceId: issue._id,
        referenceNumber: `ISS-${issue._id}`,
        qtyIn: 0,
        qtyOut: qty,
        balanceQty: prevBalance - qty,
        remarks: it.remarks || "Issued to project",
      });
    }

    res.status(201).json({ message: "Stock issued successfully", issue });

  } catch (err) {
    res.status(500).json({ message: "Issue error", error: err.message });
  }
};




// ===================================================
// 3️⃣ TRANSFER MATERIAL
// ===================================================
export const transferMaterial = async (req, res) => {
  try {
    const { fromProjectId, toProjectId, itemId, qty, unit, reason } = req.body;

    if (!fromProjectId || !toProjectId || !itemId || !qty) {
      return res.status(400).json({ message: "fromProjectId, toProjectId, itemId, qty required" });
    }

    const fromStock = await adjustStock({
      projectId: fromProjectId,
      itemId,
      unit,
      qtyChange: -qty,
    });

    const toStock = await adjustStock({
      projectId: toProjectId,
      itemId,
      unit,
      qtyChange: +qty,
    });

    const txn = await StockTransaction.create({
      itemId,
      type: "TRANSFER",
      qty,
      unit,
      fromProject: fromProjectId,
      toProject: toProjectId,
      reason: reason || "Material transferred",
      createdBy: req.user.id,
    });

    return res.status(200).json({
      message: "Material transferred",
      fromStock,
      toStock,
      transaction: txn
    });

  } catch (error) {
    return res.status(500).json({
      message: "Error transferring material",
      error: error.message,
    });
  }
};



// ===================================================
// 4️⃣ RETURN MATERIAL (SITE → GODOWN / VENDOR)
// ===================================================
export const returnMaterial = async (req, res) => {
  try {
    const { projectId, itemId, qty, unit, reason } = req.body;

    if (!projectId || !itemId || !qty) {
      return res.status(400).json({ message: "projectId, itemId, qty required" });
    }

    const stock = await adjustStock({
      projectId,
      itemId,
      unit,
      qtyChange: -qty,
    });

    const txn = await StockTransaction.create({
      projectId,
      itemId,
      type: "RETURN",
      qty,
      unit,
      reason: reason || "Material returned",
      createdBy: req.user.id,
    });

    return res.status(201).json({
      message: "Material returned",
      stock,
      transaction: txn,
    });

  } catch (error) {
    return res.status(500).json({
      message: "Error returning material",
      error: error.message,
    });
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
