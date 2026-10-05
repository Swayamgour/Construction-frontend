import mongoose from "mongoose";

const grnItemSchema = new mongoose.Schema({
    itemId: { type: mongoose.Schema.Types.ObjectId, ref: "Item", required: true },

    orderedQty: { type: Number, default: 0, min: 0 },
    receivedQty: { type: Number, default: 0, min: 0 },
    shortQty: { type: Number, default: 0, min: 0 },
    excessQty: { type: Number, default: 0, min: 0 },
    damagedQty: { type: Number, default: 0, min: 0 },
    acceptedQty: { type: Number, default: 0, min: 0 },
    returnQty: { type: Number, default: 0, min: 0 },

    remarks: { type: String, default: "" },
    unit: { type: String, default: "" },
});

const grnSchema = new mongoose.Schema({
    grnNumber: { type: String, unique: true, index: true },
    purchaseOrderId: { type: mongoose.Schema.Types.ObjectId, ref: "PurchaseOrder", default: null, index: true },
    stockRequestId: { type: mongoose.Schema.Types.ObjectId, ref: "StockRequest", default: null, index: true },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", default: null, index: true },

    // Delivery destination routing
    deliveryType: {
        type: String,
        enum: ["CENTRAL_GODOWN", "DIRECT_PROJECT_SITE"],
        default: "CENTRAL_GODOWN",
    },
    destinationProjectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", default: null },

    status: {
        type: String,
        enum: ["RECEIVED", "VERIFIED", "CANCELLED"],
        default: "RECEIVED",
    },

    poNumber: { type: String, default: "" },
    deliveryChallan: { type: String, default: "" },
    dispatchDate: { type: Date, default: null },
    vehicleNumber: { type: String, default: "" },
    driverName: { type: String, default: "" },

    receivedDate: { type: Date, default: Date.now },
    receivedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    items: [grnItemSchema],
}, { timestamps: true });

grnSchema.pre("validate", function (next) {
    if (!this.grnNumber) {
        this.grnNumber = `GRN-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    }
    next();
});

export default mongoose.model("GRN", grnSchema);
