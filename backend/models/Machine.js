import mongoose from "mongoose";

const machineSchema = new mongoose.Schema({
  machineNumber: { type: String, required: true, unique: true }, // unique id / plate
  brand: { type: String, default: "" },
  model: { type: String, default: "" },
  engineNumber: { type: String },
  chassisNumber: { type: String },
  machineType: { type: String }, // e.g., Excavator, Truck
  ownedOrRented: { type: String, enum: ["owned", "rented"], lowercase: true, default: "owned" },

  // Rates & Costing
  hourlyRate: { type: Number, default: 0 },
  dailyRate: { type: Number, default: 0 },
  monthlyRate: { type: Number, default: 0 },

  // Hour meter & fuel
  currentMeterReading: { type: Number, default: 0 },
  currentFuelLevel: { type: Number, default: 0 }, // in Liters

  // Vendor / Rental information (if rented)
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", default: null },
  rentalDetails: {
    rentalRate: { type: Number, default: 0 },
    rateType: { type: String, enum: ["PER_HOUR", "PER_DAY", "PER_MONTH", "FIXED_CONTRACT"], default: "PER_DAY" },
    contractStart: { type: Date, default: null },
    contractEnd: { type: Date, default: null },
    securityDeposit: { type: Number, default: 0 },
    transportCost: { type: Number, default: 0 },
    operatorProvidedBy: {
      type: String,
      enum: ["Company", "Vendor"],
      default: "Company",
      set: (v) => (!v ? "Company" : String(v).toUpperCase() === "COMPANY" ? "Company" : "Vendor"),
    },
    vendorRemarks: { type: String, default: "" },
  },

  purchaseDate: { type: Date },

  // Operational status
  status: {
    type: String,
    enum: ["Available", "Assigned", "Under Maintenance", "Breakdown", "In Transit", "Decommissioned"],
    default: "Available",
    index: true,
  },

  // file paths / urls
  photo: { type: String },        // local path or cloud URL
  rcFile: { type: String },
  insuranceFile: { type: String },

  // document expiry useful for reminders
  rcExpiry: { type: Date },
  insuranceExpiry: { type: Date },

  notes: { type: String },

  // status
  active: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model("Machine", machineSchema);
