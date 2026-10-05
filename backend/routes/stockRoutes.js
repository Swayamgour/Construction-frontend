import express from "express";
import { auth } from "../middleware/auth.js";
import { roleCheck } from "../middleware/role.js";
import { uploadValidated } from "../middleware/uploadValidated.js";
import upload from "../middleware/upload.js";

import { checkProjectAccess, resolveProjectFrom } from "../middleware/projectAccess.js";
import StockRequest from "../models/StockRequest.js";
import StockTransfer from "../models/StockTransfer.js";
import StockLedger from "../models/stockLedgerSchema.js";
import { getInventorySummary } from "../services/inventoryService.js";
import { success, fail, getPagination, buildPagination } from "../utils/apiResponse.js";
import {
  getProjectStock,
  receiveMaterial,
  transferMaterial,
  returnMaterial,
  getProjectTransactions,
  getItemLedger,
  createStockIssue,
  getProjectIssues,
} from "../controllers/stockController.js";

import {
  createStockRequest,
  listStockRequests,
  getStockRequest,
  reviewStockRequest,
  approveStockRequest,
  rejectStockRequest,
  checkRequestStock,
} from "../controllers/stockRequestController.js";

import {
  createStockTransfer,
  listStockTransfers,
  confirmTransferReceipt,
  cancelStockTransfer,
} from "../controllers/stockTransferController.js";

import {
  damageInventory,
  adjustInventory,
  openingStock,
} from "../controllers/inventoryAdjustmentController.js";

const router = express.Router();

const legacyTransferProjectIds = (req) => [req.body?.fromProjectId, req.body?.toProjectId].filter(Boolean);
const stockRequestProject = resolveProjectFrom(StockRequest, { param: "id", field: "projectId" });

const stockTransferProjects = async (req) => {
  const transfer = await StockTransfer.findById(req.params.id).select("sourceProjectId destinationProjectId");
  if (!transfer) return null;
  req._accessCheckedDoc = transfer;
  return [transfer.sourceProjectId, transfer.destinationProjectId].filter(Boolean);
};

/* =========================================================================
   CANONICAL STOCK REQUESTS & APPROVALS
   Manager / Supervisor creates -> Admin Approves (Stock Check) or Rejects
   ========================================================================= */

router.post(
  "/requests",
  auth,
  roleCheck("admin", "manager", "supervisor"),
  upload.fields([{ name: "images", maxCount: 6 }, { name: "attachments", maxCount: 4 }]),
  checkProjectAccess(),
  createStockRequest
);

router.get("/requests", auth, roleCheck("admin", "manager", "supervisor", "storekeeper"), listStockRequests);
router.get("/requests/:id", auth, roleCheck("admin", "manager", "supervisor", "storekeeper"), checkProjectAccess(stockRequestProject), getStockRequest);
router.get("/requests/:id/stock-check", auth, roleCheck("admin", "manager", "storekeeper"), checkProjectAccess(stockRequestProject), checkRequestStock);
router.patch("/requests/:id/approve", auth, roleCheck("admin"), checkProjectAccess(stockRequestProject), approveStockRequest);
router.patch("/requests/:id/reject", auth, roleCheck("admin"), checkProjectAccess(stockRequestProject), rejectStockRequest);
router.patch("/requests/:id/review", auth, roleCheck("admin"), checkProjectAccess(stockRequestProject), reviewStockRequest);

/* =========================================================================
   CANONICAL STOCK TRANSFERS (Inter-Project / Godown)
   ========================================================================= */

router.post("/transfers", auth, roleCheck("admin", "manager", "storekeeper"), createStockTransfer);
router.get("/transfers", auth, roleCheck("admin", "manager", "storekeeper"), listStockTransfers);
router.patch("/transfers/:id/receive", auth, roleCheck("admin", "manager", "supervisor"), checkProjectAccess(stockTransferProjects), confirmTransferReceipt);
router.patch("/transfers/:id/cancel", auth, roleCheck("admin"), checkProjectAccess(stockTransferProjects), cancelStockTransfer);

/* =========================================================================
   CONTROLLED INVENTORY ADJUSTMENTS (Damage, Adjustment, Opening)
   ========================================================================= */

router.post("/damage", auth, roleCheck("admin", "manager", "storekeeper"), checkProjectAccess(), damageInventory);
router.post("/adjustment", auth, roleCheck("admin", "manager", "storekeeper"), checkProjectAccess(), adjustInventory);
router.post("/opening", auth, roleCheck("admin", "manager", "storekeeper"), checkProjectAccess(), openingStock);

/* =========================================================================
   CANONICAL INVENTORY & STOCK LEDGER
   ========================================================================= */

// Canonical Project Inventory Summary (shows Usable, Issued Buffer, Damaged)
router.get(
  "/inventory/:projectId",
  auth,
  roleCheck("admin", "manager", "supervisor", "storekeeper"),
  checkProjectAccess("projectId"),
  async (req, res) => {
    try {
      const inventory = await getInventorySummary({ projectId: req.params.projectId });
      return success(res, 200, "Inventory fetched", inventory);
    } catch (error) {
      return fail(res, 500, "Error fetching inventory", error);
    }
  }
);

// Canonical Immutable Stock Ledger
router.get(
  "/ledger/project/:projectId",
  auth,
  roleCheck("admin", "manager", "storekeeper", "accountant"),
  checkProjectAccess("projectId"),
  async (req, res) => {
    try {
      const { page, limit, skip } = getPagination(req);
      const filter = { projectId: req.params.projectId };
      if (req.query.itemId) filter.itemId = req.query.itemId;

      const [items, total] = await Promise.all([
        StockLedger.find(filter)
          .populate("itemId", "name unit category")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        StockLedger.countDocuments(filter),
      ]);

      return success(res, 200, "Ledger fetched", items, buildPagination(page, limit, total));
    } catch (error) {
      return fail(res, 500, "Error fetching ledger", error);
    }
  }
);

router.get("/project/:projectId", auth, roleCheck("admin", "manager", "supervisor", "storekeeper"), checkProjectAccess("projectId"), getProjectStock);

/* =========================================================================
   OPERATIONS: ISSUE, TRANSFER, RETURN, RECEIVE
   ========================================================================= */

// Storekeeper issues stock to site/contractor (Debits Usable Stock, Credits Issued Buffer)
router.post("/issue", auth, roleCheck("admin", "manager", "supervisor", "storekeeper"), checkProjectAccess(), createStockIssue);
router.get("/issue/:projectId", auth, roleCheck("admin", "manager", "supervisor", "storekeeper"), checkProjectAccess("projectId"), getProjectIssues);

// Direct receive into stock
router.post("/receive", auth, roleCheck("admin", "manager", "storekeeper"), checkProjectAccess(), receiveMaterial);

// Atomic transfer between projects
router.post("/transfer", auth, roleCheck("admin", "manager", "storekeeper"), checkProjectAccess(legacyTransferProjectIds), transferMaterial);

// Return material from site back to Central Godown
router.post("/return", auth, roleCheck("admin", "manager", "supervisor", "storekeeper"), checkProjectAccess(), returnMaterial);

// Transactions & Item Ledger
router.get("/transactions/:projectId", auth, roleCheck("admin", "manager", "storekeeper", "accountant"), checkProjectAccess("projectId"), getProjectTransactions);
router.get("/ledger/:itemId", auth, roleCheck("admin", "manager", "storekeeper", "accountant"), getItemLedger);

export default router;
