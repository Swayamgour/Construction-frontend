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
      materialRequestId: { type: mongoose.Schema.Types.ObjectId, ref: "MaterialRequest", default: null },
    },
  ],

  status: {
    type: String,
    enum: ["draft", "sent", "partially_received", "completed", "cancelled"],
    default: "draft",
  },

  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
}, { timestamps: true });

export default mongoose.model("PurchaseOrder", purchaseOrderSchema);
