import AuditLog from "../models/AuditLog.js";

/**
 * Fire-and-forget audit logger. Never throws — a logging failure must
 * never break the primary business operation that called it.
 */
export const logAudit = async ({ module, entityId, action, performedBy, remarks = "", meta = {} }) => {
    try {
        await AuditLog.create({ module, entityId, action, performedBy, remarks, meta });
    } catch (err) {
        console.error("Audit log failed:", err.message);
    }
};

export const getAuditHistory = async (module, entityId) => {
    return AuditLog.find({ module, entityId })
        .populate("performedBy", "name role")
        .sort({ createdAt: -1 });
};
