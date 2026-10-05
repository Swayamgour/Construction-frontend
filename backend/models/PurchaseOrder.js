import mongoose from "mongoose";

const purchaseOrderSchema = new mongoose.Schema(
  {
    poNumber: { type: String, unique: true, index: true },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true, index: true },
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", required: true, index: true },

    // Delivery routing: Central Godown vs Direct Site
    deliveryType: {
      type: String,
      enum: ["CENTRAL_GODOWN", "DIRECT_PROJECT_SITE"],
      default: "CENTRAL_GODOWN",
      required: true,
    },
    deliveryProject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      default: null,
    },

    stockRequestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StockRequest",
      default: null,
      index: true,
    },

    items: [
      {
        itemId: { type: mongoose.Schema.Types.ObjectId, ref: "Item", required: true },
        qty: { type: Number, required: true, min: 0.01 },
        unit: { type: String, default: "" },
        rate: { type: Number, default: 0 },
        amount: { type: Number, default: 0 },
        tax: { type: Number, default: 0 },
        discount: { type: Number, default: 0 },
        discountAmount: { type: Number, default: 0 },
        taxAmount: { type: Number, default: 0 },
        total: { type: Number, default: 0 },
        receivedQty: { type: Number, default: 0, min: 0 },
      },
    ],

    status: {
      type: String,
      enum: [
        "DRAFT",
        "SUBMITTED",
        "APPROVED",
        "ORDERED",
        "PARTIALLY_RECEIVED",
        "RECEIVED",
        "CLOSED",
        "CANCELLED",
      ],
      default: "DRAFT",
      index: true,
    },

    subtotal: { type: Number, default: 0 },
    taxTotal: { type: Number, default: 0 },
    discountTotal: { type: Number, default: 0 },
    grandTotal: { type: Number, default: 0 },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    orderedAt: { type: Date, default: null },
    orderedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    receivedHistory: [
      {
        grnId: { type: mongoose.Schema.Types.ObjectId, ref: "GRN" },
        receivedAt: { type: Date, default: Date.now },
        receivedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      },
    ],
  },
  { timestamps: true }
);

purchaseOrderSchema.pre("validate", function (next) {
  if (!this.poNumber) {
    this.poNumber = `PO-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }
  if (this.deliveryType === "DIRECT_PROJECT_SITE" && !this.deliveryProject) {
    this.deliveryProject = this.projectId;
  }
  next();
});

export default mongoose.model("PurchaseOrder", purchaseOrderSchema);
