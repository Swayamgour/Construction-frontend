import mongoose from "mongoose";
import { recordDamage, adjustStock, recordOpeningStock } from "../services/inventoryService.js";
import { logAudit } from "../utils/audit.js";

/**
 * POST /api/stock/damage — Record damaged material.
 * Reduces Usable Stock, increases Damaged Stock, records StockLedger DAMAGE entry.
 */
export const damageInventory = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    const { projectId, itemId, qty, quantity, reason } = req.body;
    const rawQty = quantity !== undefined ? quantity : qty;
    const n = Number(rawQty);
    if (!projectId || !itemId || !Number.isFinite(n) || n <= 0) {
      return res.status(400).json({ success: false, message: "projectId, itemId and positive qty are required" });
    }

    let result;
    await session.withTransaction(async () => {
      result = await recordDamage({
        projectId,
        itemId,
        quantity: n,
        reason: reason || "Damaged material",
        userId: req.user.id,
        session,
      });

      await logAudit({
        module: "Inventory",
        entityId: result.ledgerEntry._id,
        action: "damage",
        performedBy: req.user.id,
        remarks: reason || "",
        meta: { projectId, itemId, qty: n },
        projectId,
        session,
      });
    });

    return res.status(201).json({
      success: true,
      message: "Damage recorded successfully",
      data: result,
    });
  } catch (e) {
    return res.status(400).json({ success: false, message: e.message });
  } finally {
    session.endSession();
  }
};

/**
 * POST /api/stock/adjustment — Audit physical count discrepancy.
 * Requires authorized reason and creates StockLedger ADJUSTMENT entry.
 */
export const adjustInventory = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    const { projectId, itemId, qty, quantity, reason, adjustmentType } = req.body;
    const rawQty = quantity !== undefined ? quantity : qty;
    const n = Number(rawQty);
    if (!projectId || !itemId || !Number.isFinite(n) || n === 0) {
      return res.status(400).json({ success: false, message: "projectId, itemId and non-zero qty are required" });
    }
    if (!reason || !reason.trim()) {
      return res.status(400).json({ success: false, message: "Adjustment reason is mandatory" });
    }

    const delta = String(adjustmentType).toUpperCase() === "POSITIVE" ? Math.abs(n) : -Math.abs(n);

    let result;
    await session.withTransaction(async () => {
      result = await adjustStock({
        projectId,
        itemId,
        qtyChange: delta,
        reason,
        userId: req.user.id,
        session,
      });

      await logAudit({
        module: "Inventory",
        entityId: result.ledgerEntry._id,
        action: "adjustment",
        performedBy: req.user.id,
        remarks: reason,
        meta: { projectId, itemId, delta },
        projectId,
        session,
      });
    });

    return res.status(201).json({
      success: true,
      message: "Adjustment recorded successfully",
      data: result,
    });
  } catch (e) {
    return res.status(400).json({ success: false, message: e.message });
  } finally {
    session.endSession();
  }
};

/**
 * POST /api/stock/opening — One-time opening stock entry per (projectId, itemId).
 */
export const openingStock = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    const { projectId, itemId, quantity, qty, rate, date, remarks } = req.body;
    const rawQty = quantity !== undefined ? quantity : qty;
    const n = Number(rawQty);
    if (!projectId || !itemId || !Number.isFinite(n) || n <= 0) {
      return res.status(400).json({ success: false, message: "projectId, itemId and positive quantity are required" });
    }

    let result;
    await session.withTransaction(async () => {
      result = await recordOpeningStock({
        projectId,
        itemId,
        quantity: n,
        rate,
        date,
        remarks: remarks || "Opening stock",
        userId: req.user.id,
        session,
      });

      await logAudit({
        module: "Inventory",
        entityId: result.ledgerEntry._id,
        action: "opening_stock",
        performedBy: req.user.id,
        remarks: remarks || "",
        meta: { projectId, itemId, quantity: n, rate: rate || null },
        projectId,
        session,
      });
    });

    return res.status(201).json({
      success: true,
      message: "Opening stock recorded successfully",
      data: result,
    });
  } catch (e) {
    return res.status(400).json({ success: false, message: e.message });
  } finally {
    session.endSession();
  }
};
