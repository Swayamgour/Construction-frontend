import express from "express";
import { auth } from "../middleware/auth.js";
import { roleCheck } from "../middleware/role.js";
import { uploadValidated } from "../middleware/uploadValidated.js";
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

const router = express.Router();

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
  uploadValidated.fields([{ name: "images", maxCount: 6 }, { name: "attachments", maxCount: 4 }]),
  createStockRequest
);
router.get("/requests", auth, roleCheck("admin", "manager", "supervisor", "storekeeper"), listStockRequests);
router.get("/requests/:id", auth, roleCheck("admin", "manager", "supervisor", "storekeeper"), getStockRequest);
router.patch("/requests/:id/review", auth, roleCheck("admin"), reviewStockRequest);

// --- Stock Transfers (inter-project fulfilment) ---
router.post("/transfers", auth, roleCheck("admin"), createStockTransfer);
router.get("/transfers", auth, roleCheck("admin", "manager", "storekeeper"), listStockTransfers);
router.patch("/transfers/:id/receive", auth, roleCheck("admin", "manager", "supervisor"), confirmTransferReceipt);
router.patch("/transfers/:id/cancel", auth, roleCheck("admin"), cancelStockTransfer);

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

// --- Inventory & Ledger ---
router.get("/inventory/:projectId", auth, roleCheck("admin", "manager", "supervisor", "storekeeper"), getInventory);
router.get("/ledger/project/:projectId", auth, roleCheck("admin", "manager", "storekeeper", "accountant"), getProjectLedger);

// Project ka stock — admin/manager/supervisor/storekeeper sab dekh sakte hain
router.get("/project/:projectId", auth, roleCheck("admin", "manager", "supervisor", "storekeeper"), getProjectStock);

// Receive material into stock (GRN entry point) — storekeeper's core job
router.post("/receive", auth, roleCheck("admin", "manager", "storekeeper"), receiveMaterial);

// Transfer stock between projects — needs manager/admin sign-off, storekeeper executes
router.post("/transfer", auth, roleCheck("admin", "manager", "storekeeper"), transferMaterial);

// Return material from site back to store
router.post("/return", auth, roleCheck("admin", "manager", "supervisor", "storekeeper"), returnMaterial);

// Full transaction history — admin/manager oversight + storekeeper + accountant (for reconciliation)
router.get("/transactions/:projectId", auth, roleCheck("admin", "manager", "storekeeper", "accountant"), getProjectTransactions);

// Item-wise ledger
router.get("/ledger/:itemId", auth, roleCheck("admin", "manager", "storekeeper", "accountant"), getItemLedger);

// Issue stock to a task/site — storekeeper hands it out, supervisor/manager can too
router.post("/issue", auth, roleCheck("admin", "manager", "supervisor", "storekeeper"), createStockIssue);

router.get("/issue/:projectId", auth, roleCheck("admin", "manager", "supervisor", "storekeeper"), getProjectIssues);

export default router;
