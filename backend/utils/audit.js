import AuditLog from "../models/AuditLog.js";

/** Transaction-aware audit logger. Pass session for atomic business workflows. */
export const logAudit = async ({ module, entityId, action, performedBy, remarks = "", meta = {}, projectId = null, session = null }) => {
    const doc = { module, entityId, action, performedBy, remarks, meta, projectId };
    if (session) return AuditLog.create([doc], { session });
    return AuditLog.create(doc);
};
export const getAuditHistory = async (module, entityId) => AuditLog.find({ module, entityId }).populate("performedBy", "name role").sort({ createdAt: -1 });
