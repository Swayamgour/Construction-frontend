import mongoose from "mongoose";

const maintenanceSchema = new mongoose.Schema({
  machineId: { type: mongoose.Schema.Types.ObjectId, ref: "Machine", required: true },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", default: null },
  serviceDate: { type: Date, required: true },
  serviceType: { type: String, required: true }, // regular, repair, parts, engine...
  description: { type: String },
  vendorName: { type: String },
  billFile: { type: String },       // path/url
  invoiceNumber: { type: String, default: "" },
  otherFiles: [String],
  cost: { type: Number, default: 0 },
  labourCost: { type: Number, default: 0 },
  partsCost: { type: Number, default: 0 },
  totalCost: { type: Number, default: 0 },
  nextServiceOn: { type: Date },    // optional

  // ⭐ Complete maintenance tracking (additive)
  maintenanceType: {
    type: String,
    enum: ["preventive", "breakdown", "emergency", "scheduled service"],
    default: "scheduled service",
  },
  issue: { type: String, default: "" },
  reportedDate: { type: Date, default: null },
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  serviceProvider: { type: String, default: "" },
  partsUsed: [{ name: String, quantity: Number, cost: Number }],
  beforeImages: [{ type: String }],
  afterImages: [{ type: String }],
  nextMaintenanceDate: { type: Date, default: null },
  machineMeterReading: { type: Number, default: null },
  // ⭐ Meter-based maintenance threshold (follow-up audit gap): the meter
  // reading at which the NEXT service falls due, e.g. "service again at
  // 5000 hours". Additive/optional — date-based maintenance keeps working
  // unchanged when this is left unset.
  nextServiceMeterReading: { type: Number, default: null },
  status: {
    type: String,
    enum: ["Reported", "Scheduled", "InProgress", "Completed", "Cancelled"],
    default: "Reported",
  },

  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });

export default mongoose.model("MachineMaintenance", maintenanceSchema);
