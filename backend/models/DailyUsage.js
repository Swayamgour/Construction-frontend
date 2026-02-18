import mongoose from "mongoose";

const usageSchema = new mongoose.Schema({
  machineId: { type: mongoose.Schema.Types.ObjectId, ref: "Machine", required: true },
  projectId: { type: String },
  operatorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  date: { type: Date, required: true },
  hoursRun: { type: Number, default: 0 },
  fuelUsed: { type: Number, default: 0 }, // liters
  breakdown: { type: Boolean, default: false },
  notes: String
}, { timestamps: true });


usageSchema.index({ machineId: 1, date: 1 }, { unique: true }); // one DMR per machine per day

export default mongoose.model("DailyUsage", usageSchema);
