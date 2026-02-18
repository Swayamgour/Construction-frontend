import express from "express";
import { assignMachine, releaseMachine, getActiveAssignments, getAssignmentHistory } from "../controllers/assignmentController.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

router.post("/assign", auth, assignMachine);
router.post("/release", auth, releaseMachine);
router.get("/active", auth, getActiveAssignments);
router.get("/history/:machineId", auth, getAssignmentHistory);

export default router;
