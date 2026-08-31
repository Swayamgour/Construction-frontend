import express from "express";
import { auth } from "../middleware/auth.js";
import {
    getMyNotifications,
    markNotificationRead,
    markAllNotificationsRead,
} from "../controllers/notificationController.js";

const router = express.Router();

router.get("/", auth, getMyNotifications);
router.patch("/:id/read", auth, markNotificationRead);
router.patch("/read-all", auth, markAllNotificationsRead);

export default router;
