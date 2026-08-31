import mongoose from "mongoose";

/**
 * Project-level request for machinery, with a full staged-timestamp
 * movement history (spec explicitly requires separate dates for approval
 * vs dispatch vs site arrival — never a single collapsed date).
 */
const machineRequestSchema = new mongoose.Schema(
    {
        requestNumber: { type: String, unique: true, index: true },
        projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true, index: true },

        machineType: { type: String, required: true },
        requiredMachine: { type: String, default: "" }, // free-text spec, e.g. "20-ton excavator"
        quantity: { type: Number, default: 1, min: 1 },

        requiredFromDate: { type: Date, required: true },
        requiredToDate: { type: Date, default: null },

        reason: { type: String, default: "" },
        priority: { type: String, enum: ["Low", "Medium", "High", "Urgent"], default: "Medium" },
        attachments: [{ type: String }],

        requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

        status: {
            type: String,
            enum: ["REQUESTED", "ADMIN_REVIEW", "APPROVED", "REJECTED", "ALLOCATED", "DISPATCHED", "RECEIVED_AT_SITE", "ACTIVE", "RELEASED"],
            default: "REQUESTED",
            index: true,
        },

        // machine linked once allocated
        machineId: { type: mongoose.Schema.Types.ObjectId, ref: "Machine", default: null },

        // ⭐ Separate movement timestamps — never collapsed into one "date" field
        requestedAt: { type: Date, default: Date.now },
        approvedAt: { type: Date, default: null },
        approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
        allocatedAt: { type: Date, default: null },
        dispatchedAt: { type: Date, default: null },
        dispatchedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
        expectedSiteArrival: { type: Date, default: null },
        receivedAtSite: { type: Date, default: null },
        receivedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
        releasedAt: { type: Date, default: null },
        releasedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },

        remarks: { type: String, default: "" },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    },
    { timestamps: true }
);

machineRequestSchema.pre("validate", function (next) {
    if (!this.requestNumber) this.requestNumber = `MR-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    next();
});

export default mongoose.model("MachineRequest", machineRequestSchema);
