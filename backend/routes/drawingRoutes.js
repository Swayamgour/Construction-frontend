import express from "express";
import { auth } from "../middleware/auth.js";
import { roleCheck } from "../middleware/role.js";
import { uploadValidated } from "../middleware/uploadValidated.js";
import {
    createDrawingRequest,
    listDrawingRequests,
    updateDrawingRequestStatus,
    uploadDrawingVersion,
    uploadDrawingRevision,
    listDrawingVersions,
} from "../controllers/drawingController.js";

const router = express.Router();

// Requesting a drawing: Supervisor/Manager (site side), Admin.
router.post("/requests", auth, roleCheck("admin", "manager", "supervisor"), createDrawingRequest);
router.get("/requests", auth, roleCheck("admin", "manager", "supervisor", "drawing_manager"), listDrawingRequests);

// Reviewing & uploading: the dedicated Drawing Manager role (+ admin override).
router.patch("/requests/:id/status", auth, roleCheck("admin", "drawing_manager"), updateDrawingRequestStatus);
router.post("/requests/:id/upload", auth, roleCheck("admin", "drawing_manager"), uploadValidated.single("file"), uploadDrawingVersion);
router.post("/:id/revision", auth, roleCheck("admin", "drawing_manager"), uploadValidated.single("file"), uploadDrawingRevision);

router.get("/:id/versions", auth, roleCheck("admin", "manager", "supervisor", "drawing_manager"), listDrawingVersions);

export default router;
