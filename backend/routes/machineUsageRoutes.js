import express from "express";
import { addMachineUsage, getMachineUsage } from "../controllers/machineUsageController.js";
import { auth } from "../middleware/auth.js";
import { roleCheck } from "../middleware/role.js";

const router = express.Router();

// Add usage entry
router.post(
  "/add",
  auth,
  roleCheck("admin", "manager", "supervisor"),
  addMachineUsage
);

// Get usage
router.get(
  "/all",
  auth,
  roleCheck("admin", "manager", "supervisor"),
  getMachineUsage
);

export default router;
