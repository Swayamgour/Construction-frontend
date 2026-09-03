

import mongoose from "mongoose";

// ⭐ One entry per operator-assignment event on this machine assignment.
// Nothing is ever removed or overwritten here — assignOperator/changeOperator/
// removeOperator in controllers/machineOperatorController.js always PUSH a
// new entry rather than editing an old one, so "who operated this machine,
// on this project, and when" stays a complete, permanent trail.
const operatorHistoryEntrySchema = new mongoose.Schema(
  {
    action: { type: String, enum: ["Assigned", "Changed", "Removed"], required: true },
    previousOperatorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    newOperatorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    reason: { type: String, default: "" },
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    changedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const assignmentSchema = new mongoose.Schema({
  machineId: { type: mongoose.Schema.Types.ObjectId, ref: "Machine", required: true },
  projectId: { type: String, required: true },       // Project ID or Name
  operatorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Optional, current operator
  operatorHistory: { type: [operatorHistoryEntrySchema], default: [] },
  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Who assigned
  assignDate: { type: Date, default: () => new Date() },
  releaseDate: { type: Date, default: null },
  notes: String,
}, { timestamps: true });

export default mongoose.model("MachineAssignment", assignmentSchema);

