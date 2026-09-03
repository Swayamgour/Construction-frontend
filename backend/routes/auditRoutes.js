import express from "express";
import { auth } from "../middleware/auth.js";
import { roleCheck } from "../middleware/role.js";
import { checkProjectAccess } from "../middleware/projectAccess.js";
import { getModuleAuditHistory, listAuditLogs } from "../controllers/auditController.js";

const router = express.Router();

router.get("/", auth, roleCheck("admin", "manager"), checkProjectAccess("projectId"), listAuditLogs);
router.get("/:module/:entityId", auth, roleCheck("admin", "manager"), getModuleAuditHistory);

export default router;
