import mongoose from "mongoose";

/**
 * Lightweight in-app notification system. The existing backend has no
 * notification model (only a cron email-reminder stub in utils/reminder.js
 * for machine document expiry) — this is a new, minimal system reused by
 * every new module rather than each module inventing its own.
 */
const notificationSchema = new mongoose.Schema(
    {
        recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
        title: { type: String, required: true },
        message: { type: String, required: true },

        module: {
            type: String,
            enum: [
                "Labour", "Stock", "Drawing", "Machinery", "EOD", "Delay", "General",
            ],
            default: "General",
        },

        // Generic reference so the frontend can deep-link without a dozen optional fields
        referenceType: { type: String, default: null }, // e.g. "StockRequest"
        referenceId: { type: mongoose.Schema.Types.ObjectId, default: null },

        projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", default: null },

        isRead: { type: Boolean, default: false },
        readAt: { type: Date, default: null },
    },
    { timestamps: true }
);

notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

export default mongoose.model("Notification", notificationSchema);
