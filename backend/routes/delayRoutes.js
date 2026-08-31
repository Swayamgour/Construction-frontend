import express from "express";
import { auth } from "../middleware/auth.js";
import { roleCheck } from "../middleware/role.js";
import { uploadValidated } from "../middleware/uploadValidated.js";
import {
    listDelayCategories,
    createDelayCategory,
    listAllDelays,
    updateDelay,
    resolveDelay,
} from "../controllers/delayController.js";

const router = express.Router();

router.get("/categories", auth, listDelayCategories);
router.post("/categories", auth, roleCheck("admin"), createDelayCategory);

router.get("/", auth, roleCheck("admin", "manager"), listAllDelays);
router.patch("/:id", auth, roleCheck("admin", "manager"), updateDelay);
router.post(
    "/:id/resolve",
    auth,
    roleCheck("admin", "manager"),
    resolveDelay
);

export default router;
