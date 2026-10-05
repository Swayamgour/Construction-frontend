import express from "express";

import { auth } from "../middleware/auth.js";
import { roleCheck } from "../middleware/role.js";
import { checkProjectAccess } from "../middleware/projectAccess.js";
import upload from "../middleware/upload.js";

import {
    createDrawingRequest,
    listDrawingRequests,
    updateDrawingRequestStatus,
    uploadDrawingVersion,
    uploadDrawingRevision,
    listDrawingVersions,
} from "../controllers/drawingController.js";

const router = express.Router();

/**
 * ============================================================
 * DRAWING REQUEST
 * ============================================================
 *
 * Admin / Manager / Supervisor can request a drawing.
 *
 * Manager and Supervisor must have access to the project.
 */
router.post(
    "/requests",
    auth,
    roleCheck("admin", "manager", "supervisor"),
    checkProjectAccess(),
    createDrawingRequest
);


/**
 * ============================================================
 * LIST DRAWING REQUESTS
 * ============================================================
 *
 * Admin / Manager / Supervisor / Drawing Manager
 */
router.get(
    "/requests",
    auth,
    roleCheck(
        "admin",
        "manager",
        "supervisor",
        "drawing_manager"
    ),
    listDrawingRequests
);


/**
 * ============================================================
 * UPDATE DRAWING REQUEST STATUS
 * ============================================================
 *
 * Admin + Drawing Manager
 *
 * No file upload required.
 */
router.patch(
    "/requests/:id/status",
    auth,
    roleCheck("admin", "drawing_manager"),
    updateDrawingRequestStatus
);


/**
 * ============================================================
 * UPLOAD DRAWING VERSION
 * ============================================================
 *
 * Admin + Drawing Manager
 *
 * File field name:
 *     file
 *
 * Frontend:
 *     formData.append("file", selectedFile)
 *
 * File will be handled by the common upload middleware.
 */
router.post(
    "/requests/:id/upload",
    auth,
    roleCheck("admin", "drawing_manager"),
    upload.single("file"),
    uploadDrawingVersion
);


/**
 * ============================================================
 * UPLOAD DRAWING REVISION
 * ============================================================
 *
 * Admin + Drawing Manager
 *
 * File field name:
 *     file
 *
 * Frontend:
 *     formData.append("file", selectedFile)
 */
router.post(
    "/:id/revision",
    auth,
    roleCheck("admin", "drawing_manager"),
    upload.single("file"),
    uploadDrawingRevision
);


/**
 * ============================================================
 * LIST DRAWING VERSIONS / REVISIONS
 * ============================================================
 *
 * Admin / Manager / Supervisor / Drawing Manager
 */
router.get(
    "/:id/versions",
    auth,
    roleCheck(
        "admin",
        "manager",
        "supervisor",
        "drawing_manager"
    ),
    listDrawingVersions
);


export default router;