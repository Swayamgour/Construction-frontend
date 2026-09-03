import express from "express";
import { auth } from "../middleware/auth.js";
import { roleCheck } from "../middleware/role.js";
import { uploadValidated } from "../middleware/uploadValidated.js";
import { checkProjectAccess } from "../middleware/projectAccess.js";

import {
    createDrawingRequest,
    listDrawingRequests,
    updateDrawingRequestStatus,
    uploadDrawingVersion,
    uploadDrawingRevision,
    listDrawingVersions,
} from "../controllers/drawingController.js";

const router = express.Router();

// Requesting a drawing: Supervisor/Manager (site side), Admin. A
// supervisor/manager must be assigned to the project they're requesting
// a drawing for.
router.post("/requests", auth, roleCheck("admin", "manager", "supervisor"), checkProjectAccess(), createDrawingRequest);
router.get("/requests", auth, roleCheck("admin", "manager", "supervisor", "drawing_manager"), listDrawingRequests);

// Reviewing & uploading: the dedicated Drawing Manager role (+ admin
// override). NOT project-scoped here — drawing_manager is treated as a
// cross-project reviewer role per the spec ("Drawing Manager should
// control drawing workflows"). If drawing managers should instead be
// scoped per-project, give them an assignedProjects list and add
// checkProjectAccess(resolveProjectFrom(DrawingRequest, {field:"projectId"}))
// to these three routes the same way EOD/Delay were wired.
router.patch("/requests/:id/status", auth, roleCheck("admin", "drawing_manager"), updateDrawingRequestStatus);
router.post("/requests/:id/upload", auth, roleCheck("admin", "drawing_manager"), uploadValidated.single("file"), uploadDrawingVersion);
router.post("/:id/revision", auth, roleCheck("admin", "drawing_manager"), uploadValidated.single("file"), uploadDrawingRevision);

router.get("/:id/versions", auth, roleCheck("admin", "manager", "supervisor", "drawing_manager"), listDrawingVersions);

export default router;
