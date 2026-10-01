import mongoose from "mongoose";

// Item line inside Material Request
const mrItemSchema = new mongoose.Schema({
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Item",
    required: true,
  },
  requestedQty: { type: Number, required: true, min: 0.01 },
  fulfilledQty: { type: Number, default: 0, min: 0 },
  unit: { type: String, default: "" },
  priority: {
    type: String,
    enum: ["low", "medium", "high", "urgent", "Low", "Medium", "High", "Urgent"],
    default: "Medium",
  },
  purpose: { type: String, default: "" },

  // Optional PO pricing if created for vendor
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vendor",
    default: null,
  },
  unitPrice: { type: Number, default: 0 },
  gst: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  amount: { type: Number, default: 0 },
});

// Full Consolidated Material Request Schema
const materialRequestSchema = new mongoose.Schema(
  {
    requestNumber: { type: String, unique: true, sparse: true, index: true },

    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },

    items: [mrItemSchema],

    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    requestedByRole: { type: String, default: "supervisor" },

    status: {
      type: String,
      enum: [
        "draft", "DRAFT",
        "pending", "PENDING_APPROVAL", "PENDING_ADMIN_REVIEW",
        "approved", "APPROVED",
        "APPROVED_TRANSFER", "APPROVED_PROCUREMENT",
        "ordered", "ORDERED",
        "partially_fulfilled", "PARTIALLY_FULFILLED",
        "completed", "fulfilled", "FULFILLED",
        "rejected", "REJECTED",
        "cancelled", "CANCELLED",
      ],
      default: "pending",
      index: true,
    },

    requiredDate: { type: Date, required: true },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent", "Low", "Medium", "High", "Urgent"],
      default: "Medium",
    },

    purpose: { type: String, default: "" },
    description: { type: String, default: "" },
    images: [{ type: String }],
    attachments: [{ type: String }],

    // Approval / Review
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    approvalDate: { type: Date, default: null },
    adminRemarks: { type: String, default: "" },
    rejectionReason: { type: String, default: "" },

    // Linked Fulfilment Documents
    stockTransferId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StockTransfer",
      default: null,
    },
    purchaseOrderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PurchaseOrder",
      default: null,
    },

    // Legacy fields for backward compatibility with PO generation
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      default: null,
    },
    poMode: {
      type: String,
      enum: ["single", "itemwise", "group", "manual"],
      default: "single",
    },
    totalAmount: { type: Number, default: 0 },
    deliveryDate: { type: Date },
    paymentTerms: { type: String },
    poNumber: { type: String },
  },
  { timestamps: true }
);

materialRequestSchema.pre("validate", function (next) {
  if (!this.requestNumber) {
    this.requestNumber = `MR-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }
  next();
});

export default mongoose.model("MaterialRequest", materialRequestSchema);
