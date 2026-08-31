import express from "express";
import { auth } from "../middleware/auth.js";
import { roleCheck } from "../middleware/role.js";
import { getProjectActiveLabour } from "../controllers/labourAssignmentController.js";

const router = express.Router();

// GET /api/projects/:projectId/labour — currently active labour on a project
router.get("/:projectId/labour", auth, roleCheck("admin", "manager", "supervisor"), getProjectActiveLabour);

export default router;
