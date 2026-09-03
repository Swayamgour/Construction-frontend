import mongoose from "mongoose";

/**
 * New module: Supervisor/Manager-raised material requests, with image
 * evidence, that Admin reviews and fulfils either via inter-project
 * transfer (StockTransfer) or vendor procurement (Procurement).
 * This is distinct from the existing MaterialRequest model, which is a
 * single-vendor-PO-generation flow with no image support and no
 * transfer-vs-procure decision step — kept untouched for backward
 * compatibility, existing MR/GRN/PO screens keep working as-is.
 */
const stockRequestSchema = new mongoose.Schema(
    {
        requestNumber: { type: String, unique: true, index: true },

        projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true, index: true },

        requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        requestedByRole: { type: String, required: true },

        materialId: { type: mongoose.Schema.Types.ObjectId, ref: "Item", required: true },
        materialName: { type: String, required: true }, // denormalized snapshot at request time
        category: { type: String, default: "" },

        quantity: { type: Number, required: true, min: 0.01 },
        fulfilledQty: { type: Number, default: 0, min: 0 },
        unit: { type: String, required: true },

        requiredDate: { type: Date, required: true },
        priority: { type: String, enum: ["Low", "Medium", "High", "Urgent"], default: "Medium" },

        purpose: { type: String, default: "" },
        description: { type: String, default: "" },

        images: [{ type: String }],
        attachments: [{ type: String }],

        status: {
            type: String,
            enum: [
                "PENDING_ADMIN_REVIEW",
                "APPROVED_TRANSFER",
                "APPROVED_PROCUREMENT",
                "PARTIALLY_FULFILLED",
                "FULFILLED",
                "REJECTED",
                "CANCELLED",
            ],
            default: "PENDING_ADMIN_REVIEW",
            index: true,
        },

        adminRemarks: { type: String, default: "" },
        reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
        reviewedAt: { type: Date, default: null },

        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    },
    { timestamps: true }
);

stockRequestSchema.pre("validate", async function (next) {
    if (!this.requestNumber) {
        this.requestNumber = `SR-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    }
    next();
});

export default mongoose.model("StockRequest", stockRequestSchema);
