import express from "express";
import { auth } from "../middleware/auth.js";
import { roleCheck } from "../middleware/role.js";
import {
  getProjectStock,
  receiveMaterial,
  // useMaterial,
  transferMaterial,
  returnMaterial,
  getProjectTransactions,
  // getAllStock,
  getItemLedger,
  createStockIssue,
  getProjectIssues
} from "../controllers/stockController.js";


const router = express.Router();

// Project ka stock
router.get("/project/:projectId", auth, roleCheck("admin", "manager", "supervisor"), getProjectStock);

// router.get("/all", auth, roleCheck("admin", "manager"), getAllStock);


// Receive material (mostly manager/admin)
router.post("/receive", auth, roleCheck("admin", "manager"), receiveMaterial);

// Use / consume (supervisor + manager + admin)
// router.post("/use", auth, roleCheck("supervisor", "manager", "admin"), useMaterial);

// Transfer between projects (admin/manager)
router.post("/transfer", auth, roleCheck("admin", "manager"), transferMaterial);

// Return material from site
router.post("/return", auth, roleCheck("supervisor", "manager", "admin"), returnMaterial);

// Transaction history
router.get("/transactions/:projectId", auth, roleCheck("admin", "manager"), getProjectTransactions);


// stockRoutes.js
// router.get("/project/:projectId", auth, getProjectStock);
router.get("/ledger/:itemId", auth, getItemLedger);
router.post("/issue", auth, roleCheck("manager", "admin", "supervisor"), createStockIssue);
router.get("/issue/:projectId", auth, getProjectIssues);


export default router;
