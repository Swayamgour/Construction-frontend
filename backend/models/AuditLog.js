import mongoose from "mongoose";

/**
 * Generic audit trail used by all new modules (labour, stock, machinery,
 * drawings, EOD, delay). Keeps a lightweight before/after-free action log
 * so every module gets "who did what, when" without a bespoke history
 * sub-schema in every model.
 */
const auditLogSchema = new mongoose.Schema(
    {
        module: {
            type: String,
            required: true,
            enum: [
                "LabourAssignment",
                "LabourOvertime",
                "LabourAttendance",
                "StockRequest",
                "StockTransfer",
                "Procurement",
                "StockReceipt",
                "StockLedger",
                "DrawingRequest",
                "DrawingVersion",
                "MachineRequest",
                "MachineDocument",
                "MachineOperatorLog",
                "MachineMaintenance",
                "EODReport",
                "ProjectDelay",
            ],
            index: true,
        },
        entityId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
        action: { type: String, required: true }, // e.g. "created", "approved", "transferred"
        performedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        remarks: { type: String, default: "" },
        meta: { type: mongoose.Schema.Types.Mixed, default: {} },
    },
    { timestamps: true }
);

auditLogSchema.index({ module: 1, entityId: 1, createdAt: -1 });

export default mongoose.model("AuditLog", auditLogSchema);
