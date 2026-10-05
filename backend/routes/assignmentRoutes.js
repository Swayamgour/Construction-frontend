import express from "express";
import {
  assignMachine,
  releaseMachine,
  transferMachine,
  getActiveAssignments,
  getAssignmentHistory
} from "../controllers/assignmentController.js";
import { auth } from "../middleware/auth.js";
import { roleCheck } from "../middleware/role.js";

const router = express.Router();

router.post("/assign", auth, roleCheck("admin", "manager"), assignMachine);
router.post("/release", auth, roleCheck("admin", "manager"), releaseMachine);
router.post("/transfer", auth, roleCheck("admin", "manager"), transferMachine);
router.get("/active", auth, roleCheck("admin", "manager", "supervisor", "operator"), getActiveAssignments);
router.get("/history/:machineId", auth, roleCheck("admin", "manager", "supervisor", "operator"), getAssignmentHistory);

export default router;
