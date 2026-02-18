import express from "express";
import {
  allocateMachine,
  releaseMachine,
  getAllocations,
} from "../controllers/machineAllocationController.js";
import { auth } from "../middleware/auth.js";
import { roleCheck } from "../middleware/role.js";

const router = express.Router();

// Allocate machine
router.post(
  "/allocate",
  auth,
  roleCheck("admin", "manager"),
  allocateMachine
);

// Release machine
router.post(
  "/release",
  auth,
  roleCheck("admin", "manager"),
  releaseMachine
);

// Get allocations
router.get(
  "/all",
  auth,
  roleCheck("admin", "manager", "supervisor"),
  getAllocations
);

export default router;
