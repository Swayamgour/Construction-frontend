import mongoose from "mongoose";

/**
 * Site receiving (GRN-style) for material arriving from either a
 * StockTransfer or a Procurement. Only acceptedQuantity is credited to
 * project stock (see controllers/stockReceiptController.js). Distinct from
 * the existing GRN model, which is scoped to MaterialRequest/PurchaseOrder.
 */
const stockReceiptSchema = new mongoose.Schema(
    {
        stockRequestId: { type: mongoose.Schema.Types.ObjectId, ref: "StockRequest", required: true },
        sourceType: { type: String, enum: ["Transfer", "Procurement"], required: true },
        sourceId: { type: mongoose.Schema.Types.ObjectId, required: true }, // StockTransfer._id or Procurement._id

        projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
        materialId: { type: mongoose.Schema.Types.ObjectId, ref: "Item", required: true },

        receivedQuantity: { type: Number, required: true },
        damagedQuantity: { type: Number, default: 0 },
        rejectedQuantity: { type: Number, default: 0 },
        acceptedQuantity: { type: Number, required: true },

        receivedDate: { type: Date, default: Date.now },
        receivedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

        invoiceNumber: { type: String, default: null },
        invoiceFile: { type: String, default: null },
        deliveryChallan: { type: String, default: null },
        materialImages: [{ type: String }],

        remarks: { type: String, default: "" },
        verificationStatus: { type: String, enum: ["Verified", "Discrepancy Noted"], default: "Verified" },
    },
    { timestamps: true }
);

export default mongoose.model("StockReceipt", stockReceiptSchema);
