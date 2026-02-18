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
    unit: { type: String },

    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor" }
});

const grnSchema = new mongoose.Schema({
    materialRequestId: { type: mongoose.Schema.Types.ObjectId, ref: "MaterialRequest", required: true },

    poNumber: String,
    deliveryChallan: String,
    dispatchDate: Date,
    vehicleNumber: String,
    driverName: String,

    receivedDate: { type: Date, default: Date.now },
    receivedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    items: [grnItemSchema]

}, { timestamps: true });

export default mongoose.model("GRN", grnSchema);
