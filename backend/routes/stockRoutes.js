import express from "express";
import { auth } from "../middleware/auth.js";
import { roleCheck } from "../middleware/role.js";
import { uploadValidated } from "../middleware/uploadValidated.js";
import { checkProjectAccess, resolveProjectFrom } from "../middleware/projectAccess.js";
import StockRequest from "../models/StockRequest.js";
import StockTransfer from "../models/StockTransfer.js";
import {
  getProjectStock,
  receiveMaterial,
  transferMaterial,
  returnMaterial,
  getProjectTransactions,
  getItemLedger,
  createStockIssue,
  getProjectIssues
} from "../controllers/stockController.js";

import {
  createStockRequest,
  listStockRequests,
  getStockRequest,
  reviewStockRequest,
} from "../controllers/stockRequestController.js";
import { createStockTransfer, listStockTransfers, confirmTransferReceipt, cancelStockTransfer } from "../controllers/stockTransferController.js";
import { createProcurement, updateProcurementStatus, listProcurements, cancelProcurement } from "../controllers/procurementController.js";
import { createStockReceipt, listStockReceipts, getInventory, getProjectLedger } from "../controllers/stockReceiptController.js";
import { damageInventory, adjustInventory, openingStock } from "../controllers/inventoryAdjustmentController.js";

const router = express.Router();

// Legacy /transfer carries fromProjectId + toProjectId — caller must be
// scoped to both ends of the move, same rule as the new /transfers flow.
const legacyTransferProjectIds = (req) => [req.body?.fromProjectId, req.body?.toProjectId].filter(Boolean);
// /requests/:id/review only carries the request's own _id — resolve
// projectId before checking access.
const stockRequestProject = resolveProjectFrom(StockRequest, { param: "id", field: "projectId" });

// A StockTransfer has two projects (source + destination) — the caller
// acting on it (receive/cancel) must be scoped to both.
const stockTransferProjects = async (req) => {
  const transfer = await StockTransfer.findById(req.params.id).select("sourceProjectId destinationProjectId");
  if (!transfer) return null;
  req._accessCheckedDoc = transfer;
  return [transfer.sourceProjectId, transfer.destinationProjectId].filter(Boolean);
};

/* =========================================================================
   NEW: Stock Request -> Admin Review -> Transfer/Procurement -> Receiving
   -> Inventory Ledger. Mounted under the same /api/stock prefix as the
   existing routes below; paths are namespaced (/requests, /transfers,
   /procurement, /receipts, /inventory, /ledger/project) so nothing here
   collides with the pre-existing endpoints further down this file.
   ========================================================================= */

// --- Stock Requests (Supervisor/Manager raise, Admin reviews) ---
router.post(
  "/requests",
  auth,
  roleCheck("admin", "manager", "supervisor"),
  checkProjectAccess(),
  uploadValidated.fields([{ name: "images", maxCount: 6 }, { name: "attachments", maxCount: 4 }]),
  createStockRequest
);
router.get("/requests", auth, roleCheck("admin", "manager", "supervisor", "storekeeper"), listStockRequests);
router.get("/requests/:id", auth, roleCheck("admin", "manager", "supervisor", "storekeeper"), checkProjectAccess(stockRequestProject), getStockRequest);
router.patch("/requests/:id/review", auth, roleCheck("admin"), checkProjectAccess(stockRequestProject), reviewStockRequest);

// --- Stock Transfers (inter-project fulfilment) ---
router.post("/transfers", auth, roleCheck("admin"), createStockTransfer);
router.get("/transfers", auth, roleCheck("admin", "manager", "storekeeper"), listStockTransfers);
router.patch("/transfers/:id/receive", auth, roleCheck("admin", "manager", "supervisor"), checkProjectAccess(stockTransferProjects), confirmTransferReceipt);
router.patch("/transfers/:id/cancel", auth, roleCheck("admin"), checkProjectAccess(stockTransferProjects), cancelStockTransfer);

// --- Vendor Procurement (fulfilment when no other site has stock) ---
router.post("/procurement", auth, roleCheck("admin"), createProcurement);
router.patch(
  "/procurement/:id/status",
  auth,
  roleCheck("admin", "accountant"),
  uploadValidated.single("invoiceFile"),
  updateProcurementStatus
);
router.get("/procurement", auth, roleCheck("admin", "manager", "accountant", "storekeeper"), listProcurements);
router.patch("/procurement/:id/cancel", auth, roleCheck("admin"), cancelProcurement);

// --- Site Stock Receiving (GRN-style, only accepted qty hits inventory) ---
router.post(
  "/receipts",
  auth,
  roleCheck("admin", "manager", "supervisor", "storekeeper"),
  uploadValidated.fields([
    { name: "materialImages", maxCount: 6 },
    { name: "invoiceFile", maxCount: 1 },
    { name: "deliveryChallan", maxCount: 1 },
  ]),
  createStockReceipt
);
router.get("/receipts", auth, roleCheck("admin", "manager", "supervisor", "storekeeper"), listStockReceipts);

// --- Controlled inventory damage/adjustment/opening ---
router.post("/damage", auth, roleCheck("admin", "manager", "storekeeper"), checkProjectAccess(), damageInventory);
router.post("/adjustment", auth, roleCheck("admin", "manager", "storekeeper"), checkProjectAccess(), adjustInventory);
router.post("/opening", auth, roleCheck("admin", "manager", "storekeeper"), checkProjectAccess(), openingStock);

// --- Inventory & Ledger ---
router.get("/inventory/:projectId", auth, roleCheck("admin", "manager", "supervisor", "storekeeper"), checkProjectAccess("projectId"), getInventory);
router.get("/ledger/project/:projectId", auth, roleCheck("admin", "manager", "storekeeper", "accountant"), checkProjectAccess("projectId"), getProjectLedger);

// Project ka stock — admin/manager/supervisor/storekeeper sab dekh sakte hain
router.get("/project/:projectId", auth, roleCheck("admin", "manager", "supervisor", "storekeeper"), checkProjectAccess("projectId"), getProjectStock);

// Receive material into stock (GRN entry point) — storekeeper's core job
router.post("/receive", auth, roleCheck("admin", "manager", "storekeeper"), checkProjectAccess(), receiveMaterial);

// Transfer stock between projects — needs manager/admin sign-off, storekeeper executes.
// Body carries fromProjectId/toProjectId, not projectId — caller must be
// scoped to both ends of the move.
router.post("/transfer", auth, roleCheck("admin", "manager", "storekeeper"), checkProjectAccess(legacyTransferProjectIds), transferMaterial);

// Return material from site back to store
router.post("/return", auth, roleCheck("admin", "manager", "supervisor", "storekeeper"), checkProjectAccess(), returnMaterial);

// Full transaction history — admin/manager oversight + storekeeper + accountant (for reconciliation)
router.get("/transactions/:projectId", auth, roleCheck("admin", "manager", "storekeeper", "accountant"), checkProjectAccess("projectId"), getProjectTransactions);

// Item-wise ledger — not project-scoped (keyed by item, not project); left
// as role-only, consistent with how the existing code models this route.
router.get("/ledger/:itemId", auth, roleCheck("admin", "manager", "storekeeper", "accountant"), getItemLedger);

// Issue stock to a task/site — storekeeper hands it out, supervisor/manager can too
router.post("/issue", auth, roleCheck("admin", "manager", "supervisor", "storekeeper"), checkProjectAccess(), createStockIssue);

router.get("/issue/:projectId", auth, roleCheck("admin", "manager", "supervisor", "storekeeper"), checkProjectAccess("projectId"), getProjectIssues);

export default router;
