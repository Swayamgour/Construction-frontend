import express from "express";
import { auth } from "../middleware/auth.js";
import { roleCheck } from "../middleware/role.js";
import {
    labourOvertimeReport,
    stockReport,
    machineryReport,
    projectDelaysReport,
    eodReportSummary,
    projectDashboard,
} from "../controllers/erpReportsController.js";

const router = express.Router();

router.get("/labour-overtime", auth, roleCheck("admin", "manager"), labourOvertimeReport);
router.get("/stock", auth, roleCheck("admin", "manager", "storekeeper", "accountant"), stockReport);
router.get("/machinery", auth, roleCheck("admin", "manager"), machineryReport);
router.get("/project-delays", auth, roleCheck("admin", "manager"), projectDelaysReport);
router.get("/eod", auth, roleCheck("admin", "manager"), eodReportSummary);
router.get("/project-dashboard/:projectId", auth, roleCheck("admin", "manager", "supervisor"), projectDashboard);

export default router;
