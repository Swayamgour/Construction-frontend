import mongoose from "mongoose";

/**
 * Vendor procurement fulfilling a StockRequest ("Option 2" in the spec).
 * Distinct from the existing PurchaseOrder model (which is generated
 * off MaterialRequest) — kept separate so the existing MR->PO->GRN chain
 * is untouched.
 */
const procurementSchema = new mongoose.Schema(
    {
        stockRequestId: { type: mongoose.Schema.Types.ObjectId, ref: "StockRequest", required: true },

        vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", required: true },
        materialId: { type: mongoose.Schema.Types.ObjectId, ref: "Item", required: true },

        quantity: { type: Number, required: true },
        rate: { type: Number, required: true },
        tax: { type: Number, default: 0 }, // percent
        totalAmount: { type: Number, default: 0 },

        poReferenceNumber: { type: String },

        expectedDeliveryDate: { type: Date, default: null },
        actualDeliveryDate: { type: Date, default: null },

        invoiceNumber: { type: String, default: null },
        invoiceFile: { type: String, default: null },

        paymentStatus: { type: String, enum: ["Pending", "Partial", "Paid"], default: "Pending" },

        procurementStatus: {
            type: String,
            enum: ["Ordered", "Dispatched", "Delivered", "InvoiceSubmitted", "StockUpdated", "Cancelled"],
            default: "Ordered",
            index: true,
        },

        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    },
    { timestamps: true }
);

procurementSchema.pre("validate", function (next) {
    const base = this.quantity * this.rate;
    this.totalAmount = +(base + (base * (this.tax || 0)) / 100).toFixed(2);
    if (!this.poReferenceNumber) this.poReferenceNumber = `PROC-${Date.now()}`;
    next();
});

export default mongoose.model("Procurement", procurementSchema);
