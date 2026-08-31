import Notification from "../models/Notification.js";
import User from "../models/User.js";

/**
 * notifyUsers - create notifications for an explicit list of user ids.
 * notifyRoles  - create notifications for every active user with one of the given roles
 *                (optionally scoped to a project via projectId on the User doc).
 * Both are fire-and-forget: failures are logged, never thrown, so a
 * notification problem can never fail the parent business transaction.
 */
export const notifyUsers = async ({ userIds = [], title, message, module = "General", referenceType = null, referenceId = null, projectId = null }) => {
    try {
        const ids = [...new Set(userIds.filter(Boolean).map(String))];
        if (!ids.length) return;
        await Notification.insertMany(
            ids.map((recipient) => ({
                recipient, title, message, module, referenceType, referenceId, projectId,
            }))
        );
    } catch (err) {
        console.error("notifyUsers failed:", err.message);
    }
};

export const notifyRoles = async ({ roles = [], projectId = null, title, message, module = "General", referenceType = null, referenceId = null }) => {
    try {
        const query = { role: { $in: roles }, status: true };
        // If a projectId is given, prefer users tied to that project, but always
        // include admins (admins have no fixed projectId in the User model).
        const users = await User.find(query).select("_id role projectId");
        const targets = users.filter((u) => u.role === "admin" || !projectId || String(u.projectId) === String(projectId));
        await notifyUsers({
            userIds: targets.map((u) => u._id),
            title, message, module, referenceType, referenceId, projectId,
        });
    } catch (err) {
        console.error("notifyRoles failed:", err.message);
    }
};
