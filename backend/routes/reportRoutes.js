import express from "express";
import {
    submitDailyReport,
    getDailyReport,
    listDailyReports,
    updateDailyReport,
    deleteDailyReport,
    approveDailyReport
} from "../controllers/reportController.js";
import { auth } from "../middleware/auth.js";
import { roleCheck } from "../middleware/role.js";

const router = express.Router();

// Site level daily reports — submitted by supervisor/manager, approved by manager/admin.
router.post("/", auth, roleCheck("admin", "manager", "supervisor"), submitDailyReport);
router.get("/", auth, listDailyReports);                 // list + filters (controller auto-scopes supervisor to own reports)
router.get("/:id", auth, getDailyReport);                // single
router.put("/:id", auth, updateDailyReport);              // controller checks ownership / admin+manager
router.delete("/:id", auth, roleCheck("admin", "manager"), deleteDailyReport);
router.patch("/:id/approve", auth, roleCheck("admin", "manager"), approveDailyReport);

export default router;
