import express from "express";
import { auth } from "../middleware/auth.js";
import { roleCheck } from "../middleware/role.js";
import { uploadValidated } from "../middleware/uploadValidated.js";
import { checkProjectAccess } from "../middleware/projectAccess.js";
import { reportDelay, listProjectDelays } from "../controllers/delayController.js";

const router = express.Router();

router.post(
    "/:projectId/delays",
    auth,
    roleCheck("admin", "manager"),
    checkProjectAccess("projectId"),
    uploadValidated.fields([{ name: "images", maxCount: 6 }, { name: "attachments", maxCount: 4 }]),
    reportDelay
);
router.get("/:projectId/delays", auth, roleCheck("admin", "manager", "supervisor"), checkProjectAccess("projectId"), listProjectDelays);

export default router;
