import mongoose from "mongoose";

const stockRequestItemSchema = new mongoose.Schema({
    itemId: { type: mongoose.Schema.Types.ObjectId, ref: "Item", required: true },
    materialName: { type: String, default: "" },
    unit: { type: String, default: "" },
    requestedQty: { type: Number, required: true, min: 0.01 },
    approvedQty: { type: Number, default: 0, min: 0 },
    availableQty: { type: Number, default: 0, min: 0 },
    shortageQty: { type: Number, default: 0, min: 0 },
    fulfilledQty: { type: Number, default: 0, min: 0 },
    fulfillmentStatus: {
        type: String,
        enum: ["PENDING", "AVAILABLE", "PARTIALLY_AVAILABLE", "SHORTAGE", "TRANSFERRED", "ORDERED", "FULFILLED"],
        default: "PENDING"
    },
    purpose: { type: String, default: "" },
    remarks: { type: String, default: "" },
});

const stockRequestSchema = new mongoose.Schema(
    {
        requestNumber: { type: String, unique: true, index: true },
        projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true, index: true },

        requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        requestedByRole: { type: String, default: "manager" },

        // Multi-item support (canonical)
        items: [stockRequestItemSchema],

        // Single-item fallback fields for backward compatibility with existing records
        materialId: { type: mongoose.Schema.Types.ObjectId, ref: "Item" },
        materialName: { type: String },
        category: { type: String, default: "" },
        quantity: { type: Number },
        fulfilledQty: { type: Number, default: 0 },
        unit: { type: String },

        requiredDate: { type: Date, required: true },
        priority: { type: String, enum: ["Low", "Medium", "High", "Urgent", "low", "medium", "high", "urgent"], default: "Medium" },

        purpose: { type: String, default: "" },
        description: { type: String, default: "" },

        images: [{ type: String }],
        attachments: [{ type: String }],

        status: {
            type: String,
            enum: [
                "DRAFT",
                "SUBMITTED",
                "PENDING_APPROVAL",
                "PENDING_ADMIN_REVIEW", // legacy alias
                "APPROVED",
                "APPROVED_TRANSFER",
                "APPROVED_PROCUREMENT",
                "PARTIALLY_FULFILLED",
                "FULFILLED",
                "REJECTED",
                "CANCELLED",
            ],
            default: "PENDING_APPROVAL",
            index: true,
        },

        adminRemarks: { type: String, default: "" },
        rejectionReason: { type: String, default: "" },
        approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
        approvedAt: { type: Date, default: null },
        reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
        reviewedAt: { type: Date, default: null },

        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    },
    { timestamps: true }
);

stockRequestSchema.pre("validate", function (next) {
    if (!this.requestNumber) {
        this.requestNumber = `SR-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    }
    // If items array is provided, sync aggregate and top-level fields for backwards compatibility
    if (this.items && this.items.length > 0) {
        if (!this.materialId && this.items[0]?.itemId) {
            this.materialId = this.items[0].itemId;
            this.materialName = this.items[0].materialName || "";
            this.quantity = this.items.reduce((s, i) => s + (Number(i.requestedQty) || 0), 0);
            this.unit = this.items[0].unit || "";
        }
    } else if (this.materialId) {
        // If legacy single-item fields were provided, populate items array
        this.items = [{
            itemId: this.materialId,
            materialName: this.materialName || "",
            unit: this.unit || "",
            requestedQty: this.quantity || 1,
            approvedQty: 0,
            availableQty: 0,
            shortageQty: this.quantity || 1,
            fulfilledQty: this.fulfilledQty || 0,
            fulfillmentStatus: "PENDING",
            purpose: this.purpose || "",
        }];
    }
    next();
});

export default mongoose.model("StockRequest", stockRequestSchema);
