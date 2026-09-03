import mongoose from "mongoose";

const purchaseOrderSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", required: true },

  items: [
    {
      itemId: { type: mongoose.Schema.Types.ObjectId, ref: "Item", required: true },
      qty: { type: Number, required: true },
      unit: String,
      rate: Number,
      amount: Number,
      tax: { type: Number, default: 0 },
      discount: { type: Number, default: 0 },
      discountAmount: { type: Number, default: 0 },
      taxAmount: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
      materialRequestId: { type: mongoose.Schema.Types.ObjectId, ref: "MaterialRequest", default: null },
      receivedQty: { type: Number, default: 0, min: 0 },
    },
  ],

  status: {
    type: String,
    enum: ["DRAFT", "SUBMITTED", "APPROVED", "ORDERED", "PARTIALLY_RECEIVED", "RECEIVED", "CLOSED", "CANCELLED", "draft", "sent", "partially_received", "completed", "cancelled"],
    default: "DRAFT",
  },

  subtotal: { type: Number, default: 0 },
  taxTotal: { type: Number, default: 0 },
  discountTotal: { type: Number, default: 0 },
  grandTotal: { type: Number, default: 0 },

  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  orderedAt: { type: Date, default: null },
  orderedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  receivedHistory: [{ grnId: { type: mongoose.Schema.Types.ObjectId, ref: "GRN" }, receivedAt: Date, receivedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" } }],
}, { timestamps: true });

export default mongoose.model("PurchaseOrder", purchaseOrderSchema);
