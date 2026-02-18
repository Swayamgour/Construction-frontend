import mongoose from "mongoose";

// ⭐ Each item inside Material Request
const itemSchema = new mongoose.Schema({
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Item",
    required: true
  },

  requestedQty: { type: Number, required: true },

  unit: { type: String },

  priority: {
    type: String,
    enum: ["low", "medium", "high"],
    default: "medium"
  },

  purpose: { type: String, default: "" },

  // ⭐ When approving MR (PO Creation)
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vendor",
    default: null
  },

  unitPrice: { type: Number, default: 0 },
  gst: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  amount: { type: Number, default: 0 }  // final amount for each item
});


// ⭐ Full MR Schema
const materialRequestSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true
    },

    items: [itemSchema],

    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "ordered", "completed"],
      default: "pending"
    },

    requiredDate: { type: Date },

    // ⭐ Single Vendor Mode
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      default: null
    },

    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },

    approvalDate: { type: Date, default: null },

    // ⭐ PO Mode (important)
    poMode: {
      type: String,
      enum: ["single", "itemwise", "group", "manual"],
      default: "single"
    },

    totalAmount: { type: Number, default: 0 },

    deliveryDate: { type: Date },
    paymentTerms: { type: String },

    poNumber: { type: String }
  },
  { timestamps: true }
);

export default mongoose.model("MaterialRequest", materialRequestSchema);
