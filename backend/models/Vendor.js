import mongoose from "mongoose";

const vendorSchema = new mongoose.Schema(
  {
    // ===== Company & Branding =====
    companyLogo: { type: String, default: null },
    companyName: { type: String, required: true, trim: true },
    vendorType: {
      type: String,
      enum: ["Material Supplier", "Machine Supplier", "Service Provider", "Both"],
      // required: true,
    },
    businessType: { type: String, default: null },
    ownershipType: { type: String, default: null }, // Proprietorship, Pvt Ltd
    yearEstablished: { type: String, default: null },
    businessRegNumber: { type: String, default: null },

    // ===== Contact =====
    contactPerson: { type: String, required: true },
    email: { type: String, default: null },
    phone: { type: String, required: true },
    alternatePhone: { type: String, default: null },
    website: { type: String, default: null },

    // ===== Address =====
    registeredAddress: { type: String, default: null },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    country: { type: String, default: "India" },

    // ===== Legal =====
    gstNumber: { type: String, default: null },
    panNumber: { type: String, default: null },

    aadhaarCardFile: { type: String, default: null },
    panCardFile: { type: String, default: null },

    // ===== Payment Terms =====
    accountHolderName: { type: String, default: null },
    bankName: { type: String, default: null },
    accountNumber: { type: String, default: null },
    ifscCode: { type: String, default: null },
    branchName: { type: String, default: null },
    paymentTerms: { type: String, default: "Immediate" }, // e.g., 30 days credit
    creditLimit: { type: Number, default: 0 },

    // ===== Items =====
    itemsSupplied: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Item",
      }
    ],

    vendorItems: [
      {
        itemId: { type: mongoose.Schema.Types.ObjectId, ref: "Item" },
        unit: { type: String },
        rate: { type: Number },
        hsnCode: { type: String }, // Added for GST billing
        deliveryTime: { type: String },
        deliveryDate: { type: Date },
      }
    ],

    productCategories: [{ type: String }],

    // ===== Performance =====
    rating: { type: Number, min: 1, max: 5, default: 3 },
    blacklisted: { type: Boolean, default: false },

    // ===== Created =====
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.model("Vendor", vendorSchema);
