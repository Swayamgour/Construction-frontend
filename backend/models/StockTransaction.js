import mongoose from "mongoose";

const stockTransactionSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: "Item", required: true },

  type: {
    type: String,
    enum: ["IN", "OUT", "RETURN", "TRANSFER"],
    required: true,
  },

  qty: { type: Number, required: true },
  unit: { type: String },

  // For transfer
  fromProject: { type: mongoose.Schema.Types.ObjectId, ref: "Project", default: null },
  toProject: { type: mongoose.Schema.Types.ObjectId, ref: "Project", default: null },

  // Links
  materialRequestId: { type: mongoose.Schema.Types.ObjectId, ref: "MaterialRequest", default: null },
  purchaseOrderId: { type: mongoose.Schema.Types.ObjectId, ref: "PurchaseOrder", default: null },

  reason: { type: String },

  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
}, { timestamps: true });

export default mongoose.model("StockTransaction", stockTransactionSchema);
