import mongoose from "mongoose";

const maintenanceSchema = new mongoose.Schema({
  machineId: { type: mongoose.Schema.Types.ObjectId, ref: "Machine", required: true },
  serviceDate: { type: Date, required: true },
  serviceType: { type: String, required: true }, // regular, repair, parts, engine...
  description: { type: String },
  vendorName: { type: String },
  billFile: { type: String },       // path/url
  otherFiles: [String],
  cost: { type: Number, default: 0 },
  nextServiceOn: { type: Date },    // optional
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });

export default mongoose.model("MachineMaintenance", maintenanceSchema);
