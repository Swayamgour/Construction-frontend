import express from "express";
import { auth } from "../middleware/auth.js";
import { roleCheck } from "../middleware/role.js";
import { getModuleAuditHistory } from "../controllers/auditController.js";

const router = express.Router();

router.get("/:module/:entityId", auth, roleCheck("admin", "manager"), getModuleAuditHistory);

export default router;
