import Notification from "../models/Notification.js";
import { success, fail, getPagination, buildPagination } from "../utils/apiResponse.js";

export const getMyNotifications = async (req, res) => {
    try {
        const { page, limit, skip } = getPagination(req);
        const filter = { recipient: req.user.id };
        if (req.query.isRead !== undefined) filter.isRead = req.query.isRead === "true";
        if (req.query.module) filter.module = req.query.module;

        const [items, total, unreadCount] = await Promise.all([
            Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
            Notification.countDocuments(filter),
            Notification.countDocuments({ recipient: req.user.id, isRead: false }),
        ]);

        return success(res, 200, "Notifications fetched", { items, unreadCount }, buildPagination(page, limit, total));
    } catch (err) {
        return fail(res, 500, "Error fetching notifications", err);
    }
};

export const markNotificationRead = async (req, res) => {
    try {
        const notif = await Notification.findOneAndUpdate(
            { _id: req.params.id, recipient: req.user.id },
            { isRead: true, readAt: new Date() },
            { new: true }
        );
        if (!notif) return fail(res, 404, "Notification not found");
        return success(res, 200, "Marked as read", notif);
    } catch (err) {
        return fail(res, 500, "Error updating notification", err);
    }
};

export const markAllNotificationsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { recipient: req.user.id, isRead: false },
            { isRead: true, readAt: new Date() }
        );
        return success(res, 200, "All notifications marked as read");
    } catch (err) {
        return fail(res, 500, "Error updating notifications", err);
    }
};
