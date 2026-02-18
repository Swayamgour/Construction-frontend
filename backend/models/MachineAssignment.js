

import mongoose from "mongoose";

const assignmentSchema = new mongoose.Schema({
  machineId: { type: mongoose.Schema.Types.ObjectId, ref: "Machine", required: true },
  projectId: { type: String, required: true },       // Project ID or Name
  operatorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Optional
  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Who assigned
  assignDate: { type: Date, default: () => new Date() },
  releaseDate: { type: Date, default: null },
  notes: String,
}, { timestamps: true });

export default mongoose.model("MachineAssignment", assignmentSchema);

