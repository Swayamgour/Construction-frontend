import express from "express";
import { auth } from "../middleware/auth.js";
import { roleCheck } from "../middleware/role.js";
import { uploadValidated } from "../middleware/uploadValidated.js";
import { checkProjectAccess, resolveProjectFrom } from "../middleware/projectAccess.js";
import EODReport from "../models/EODReport.js";
import {
    submitEOD,
    listEODReports,
    getEODReport,
    updateEODReport,
    approveEODReport,
    rejectEODReport,
} from "../controllers/eodController.js";

const router = express.Router();

// /:id/approve, /:id/reject and /:id (update) only carry the EOD report's
// own _id — resolve its projectId before checking access.
const eodProject = resolveProjectFrom(EODReport, { param: "id", field: "projectId" });

router.post("/", auth, roleCheck("admin", "manager", "supervisor"), uploadValidated.fields([{ name: "images", maxCount: 20 }]), checkProjectAccess(), submitEOD);
router.get("/", auth, roleCheck("admin", "manager", "supervisor"), listEODReports);
router.get("/:id", auth, roleCheck("admin", "manager", "supervisor"), checkProjectAccess(eodProject), getEODReport);
router.patch("/:id", auth, roleCheck("admin", "manager", "supervisor"), checkProjectAccess(eodProject), uploadValidated.fields([{ name: "images", maxCount: 20 }]), updateEODReport);
router.patch("/:id/approve", auth, roleCheck("admin", "manager"), checkProjectAccess(eodProject), approveEODReport);
router.patch("/:id/reject", auth, roleCheck("admin", "manager"), checkProjectAccess(eodProject), rejectEODReport);

export default router;
