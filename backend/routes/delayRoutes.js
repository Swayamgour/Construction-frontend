import express from "express";
import { auth } from "../middleware/auth.js";
import { roleCheck } from "../middleware/role.js";
import { uploadValidated } from "../middleware/uploadValidated.js";
import { checkProjectAccess, resolveProjectFrom } from "../middleware/projectAccess.js";
import ProjectDelay from "../models/ProjectDelay.js";
import {
    listDelayCategories,
    createDelayCategory,
    listAllDelays,
    updateDelay,
    resolveDelay,
} from "../controllers/delayController.js";

const router = express.Router();

// /:id and /:id/resolve only carry the delay record's own _id — resolve
// its projectId before checking access.
const delayProject = resolveProjectFrom(ProjectDelay, { param: "id", field: "projectId" });

router.get("/categories", auth, listDelayCategories);
router.post("/categories", auth, roleCheck("admin"), createDelayCategory);

router.get("/", auth, roleCheck("admin", "manager"), checkProjectAccess("projectId"), listAllDelays);
router.patch("/:id", auth, roleCheck("admin", "manager"), checkProjectAccess(delayProject), updateDelay);
router.post(
    "/:id/resolve",
    auth,
    roleCheck("admin", "manager"),
    checkProjectAccess(delayProject),
    resolveDelay
);

export default router;
