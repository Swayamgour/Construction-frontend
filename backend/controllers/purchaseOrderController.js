import PurchaseOrder from "../models/PurchaseOrder.js";
import Vendor from "../models/Vendor.js";
import Item from "../models/Item.js";
import Project from "../models/Project.js";
import StockRequest from "../models/StockRequest.js";
import { logAudit } from "../utils/audit.js";
import { getOrCreateCentralGodown } from "../services/inventoryService.js";

export const PURCHASE_ORDER_TRANSITIONS = {
  DRAFT: ["SUBMITTED", "CANCELLED"],
  SUBMITTED: ["APPROVED", "CANCELLED"],
  APPROVED: ["ORDERED", "CANCELLED"],
  ORDERED: ["PARTIALLY_RECEIVED", "RECEIVED", "CLOSED", "CANCELLED"],
  PARTIALLY_RECEIVED: ["RECEIVED", "CLOSED", "CANCELLED"],
  RECEIVED: ["CLOSED"],
  CLOSED: [],
  CANCELLED: [],
};

const normalize = (s) => String(s || "DRAFT").toUpperCase();

function calc(items = []) {
  return items.map((i) => {
    const qty = Number(i.qty || 0);
    const rate = Number(i.rate || 0);
    const discount = Number(i.discount || 0);
    const tax = Number(i.tax || 0);

    if (qty <= 0 || rate < 0) {
      throw new Error("Invalid PO item quantity or rate");
    }

    const amount = qty * rate;
    const discountAmount = discount > 0 && discount <= 100 ? (amount * discount) / 100 : discount;
    const taxable = Math.max(0, amount - discountAmount);
    const taxAmount = tax > 0 && tax <= 100 ? (taxable * tax) / 100 : tax;

    return {
      ...i,
      qty,
      rate,
      amount,
      tax,
      discount,
      discountAmount,
      taxAmount,
      total: taxable + taxAmount,
    };
  });
}

function totals(items) {
  const subtotal = items.reduce((s, i) => s + Number(i.amount || 0), 0);
  const discountTotal = items.reduce((s, i) => s + Number(i.discountAmount || 0), 0);
  const taxTotal = items.reduce((s, i) => s + Number(i.taxAmount || 0), 0);
  return {
    subtotal,
    discountTotal,
    taxTotal,
    grandTotal: subtotal - discountTotal + taxTotal,
  };
}

async function validateItems(items) {
  for (const i of items) {
    if (!i.itemId || !(await Item.exists({ _id: i.itemId }))) {
      throw new Error(`Item not found: ${i.itemId}`);
    }
  }
}

/**
 * POST /api/purchase-orders — Create a new Purchase Order.
 */
export const createPurchaseOrder = async (req, res) => {
  try {
    const {
      projectId,
      vendorId,
      deliveryType = "CENTRAL_GODOWN",
      deliveryProject = null,
      stockRequestId = null,
      items = [],
    } = req.body;

    if (!projectId || !vendorId || !Array.isArray(items) || !items.length) {
      return res.status(400).json({
        success: false,
        message: "projectId, vendorId, and items are required",
      });
    }

    if (!(await Vendor.exists({ _id: vendorId }))) {
      return res.status(404).json({ success: false, message: "Vendor not found" });
    }

    let targetDeliveryProject = deliveryProject;
    if (deliveryType === "CENTRAL_GODOWN") {
      const godown = await getOrCreateCentralGodown();
      targetDeliveryProject = godown._id;
    } else if (!targetDeliveryProject) {
      targetDeliveryProject = projectId;
    }

    await validateItems(items);
    const normalizedItems = calc(items);

    const po = await PurchaseOrder.create({
      projectId,
      vendorId,
      deliveryType,
      deliveryProject: targetDeliveryProject,
      stockRequestId: stockRequestId || null,
      items: normalizedItems,
      ...totals(normalizedItems),
      status: "DRAFT",
      createdBy: req.user.id,
    });

    // If linked to StockRequest, update item fulfillment status
    if (stockRequestId) {
      const request = await StockRequest.findById(stockRequestId);
      if (request) {
        request.status = "APPROVED_PROCUREMENT";
        request.updatedBy = req.user.id;
        await request.save();
      }
    }

    await logAudit({
      module: "PurchaseOrder",
      entityId: po._id,
      action: "created",
      performedBy: req.user.id,
      projectId,
      meta: { deliveryType, grandTotal: po.grandTotal },
    });

    res.status(201).json({ success: true, data: po });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
};

/**
 * GET /api/purchase-orders — List Purchase Orders with filtering and pagination.
 */
export const listPurchaseOrders = async (req, res) => {
  try {
    const { projectId, status, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (projectId) {
      if (
        req.user.role !== "admin" &&
        Array.isArray(req.user.assignedProjects) &&
        !req.user.assignedProjects.map(String).includes(String(projectId))
      ) {
        return res.status(403).json({ success: false, message: "Access denied for this project" });
      }
      filter.projectId = projectId;
    } else if (req.user.role !== "admin" && Array.isArray(req.user.assignedProjects) && req.user.assignedProjects.length) {
      filter.projectId = { $in: req.user.assignedProjects };
    }

    if (status) filter.status = normalize(status);

    const p = Math.max(1, Number(page));
    const l = Math.min(100, Math.max(1, Number(limit)));

    const [data, total] = await Promise.all([
      PurchaseOrder.find(filter)
        .populate("vendorId", "name companyName phone email")
        .populate("projectId", "projectName projectCode")
        .populate("deliveryProject", "projectName projectCode")
        .populate("stockRequestId", "requestNumber")
        .populate("items.itemId", "name unit category")
        .sort({ createdAt: -1 })
        .skip((p - 1) * l)
        .limit(l),
      PurchaseOrder.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data,
      pagination: { page: p, limit: l, total, totalPages: Math.ceil(total / l) },
    });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

/**
 * GET /api/purchase-orders/:id — Single Purchase Order.
 */
export const getPurchaseOrder = async (req, res) => {
  try {
    const po = await PurchaseOrder.findById(req.params.id)
      .populate("vendorId")
      .populate("projectId", "projectName projectCode")
      .populate("deliveryProject", "projectName projectCode")
      .populate("stockRequestId", "requestNumber requiredDate")
      .populate("items.itemId", "name unit category")
      .populate("createdBy", "name role")
      .populate("orderedBy", "name role");

    if (!po) return res.status(404).json({ success: false, message: "Purchase order not found" });
    res.json({ success: true, data: po });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

/**
 * PATCH /api/purchase-orders/:id — Edit draft Purchase Order.
 */
export const updatePurchaseOrder = async (req, res) => {
  try {
    const po = await PurchaseOrder.findById(req.params.id);
    if (!po) return res.status(404).json({ success: false, message: "Purchase order not found" });

    if (normalize(po.status) !== "DRAFT") {
      return res.status(400).json({ success: false, message: "Only DRAFT purchase orders can be edited" });
    }

    if (req.body.items) {
      await validateItems(req.body.items);
      const items = calc(req.body.items);
      po.items = items;
      Object.assign(po, totals(items));
    }
    if (req.body.vendorId) {
      if (!(await Vendor.exists({ _id: req.body.vendorId }))) {
        return res.status(404).json({ success: false, message: "Vendor not found" });
      }
      po.vendorId = req.body.vendorId;
    }
    if (req.body.deliveryType) {
      po.deliveryType = req.body.deliveryType;
      if (req.body.deliveryType === "CENTRAL_GODOWN") {
        const godown = await getOrCreateCentralGodown();
        po.deliveryProject = godown._id;
      } else if (req.body.deliveryProject) {
        po.deliveryProject = req.body.deliveryProject;
      }
    }

    await po.save();
    await logAudit({
      module: "PurchaseOrder",
      entityId: po._id,
      action: "updated",
      performedBy: req.user.id,
    });

    res.json({ success: true, data: po });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
};

/**
 * Centralized status transition handler.
 */
export const changePurchaseOrderStatus = (target) => async (req, res) => {
  try {
    const po = await PurchaseOrder.findById(req.params.id);
    if (!po) return res.status(404).json({ success: false, message: "Purchase order not found" });

    const current = normalize(po.status);
    const next = normalize(target);

    if (!PURCHASE_ORDER_TRANSITIONS[current]?.includes(next)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status transition: ${current} -> ${next}`,
      });
    }

    po.status = next;
    if (next === "ORDERED") {
      po.orderedAt = new Date();
      po.orderedBy = req.user.id;
    }
    await po.save();

    await logAudit({
      module: "PurchaseOrder",
      entityId: po._id,
      action: next.toLowerCase(),
      performedBy: req.user.id,
      projectId: po.projectId,
    });

    res.json({ success: true, data: po });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

export const submitPurchaseOrder = changePurchaseOrderStatus("SUBMITTED");
export const approvePurchaseOrder = changePurchaseOrderStatus("APPROVED");
export const orderPurchaseOrder = changePurchaseOrderStatus("ORDERED");
export const cancelPurchaseOrder = changePurchaseOrderStatus("CANCELLED");
export const closePurchaseOrder = changePurchaseOrderStatus("CLOSED");
