import express from "express";
import { auth } from "../middleware/auth.js";
import { roleCheck } from "../middleware/role.js";
import { uploadValidated } from "../middleware/uploadValidated.js";
import {
    submitEOD,
    listEODReports,
    getEODReport,
    updateEODReport,
    approveEODReport,
    rejectEODReport,
} from "../controllers/eodController.js";

const router = express.Router();

router.post("/", auth, roleCheck("admin", "manager", "supervisor"), uploadValidated.fields([{ name: "images", maxCount: 20 }]), submitEOD);
router.get("/", auth, roleCheck("admin", "manager", "supervisor"), listEODReports);
router.get("/:id", auth, roleCheck("admin", "manager", "supervisor"), getEODReport);
router.patch("/:id", auth, roleCheck("admin", "manager", "supervisor"), uploadValidated.fields([{ name: "images", maxCount: 20 }]), updateEODReport);
router.patch("/:id/approve", auth, roleCheck("admin", "manager"), approveEODReport);
router.patch("/:id/reject", auth, roleCheck("admin", "manager"), rejectEODReport);

export default router;
