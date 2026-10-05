

import mongoose from "mongoose";

// ⭐ One entry per operator-assignment event on this machine assignment.
// Nothing is ever removed or overwritten here — assignOperator/changeOperator/
// removeOperator in controllers/machineOperatorController.js always PUSH a
// new entry rather than editing an old one, so "who operated this machine,
// on this project, and when" stays a complete, permanent trail.
// ⭐ Canonical operator history — operators are tracked via the Labour model (category: "Operator")
const operatorHistoryEntrySchema = new mongoose.Schema(
  {
    action: { type: String, enum: ["Assigned", "Changed", "Removed"], required: true },
    previousOperatorId: { type: mongoose.Schema.Types.ObjectId, ref: "Labour", default: null },
    newOperatorId: { type: mongoose.Schema.Types.ObjectId, ref: "Labour", default: null },
    reason: { type: String, default: "" },
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    changedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const assignmentSchema = new mongoose.Schema({
  machineId: { type: mongoose.Schema.Types.ObjectId, ref: "Machine", required: true, index: true },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true, index: true },
  requestId: { type: mongoose.Schema.Types.ObjectId, ref: "MachineRequest", default: null },

  // Canonical Operator: references Labour (category "Operator")
  operatorId: { type: mongoose.Schema.Types.ObjectId, ref: "Labour", default: null, index: true },
  operatorHistory: { type: [operatorHistoryEntrySchema], default: [] },

  // Assignment lifecycle status
  assignmentStatus: {
    type: String,
    enum: ["PENDING", "DISPATCHED", "ACTIVE", "TRANSFERRED", "RELEASED"],
    default: "ACTIVE",
    index: true,
  },

  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  assignDate: { type: Date, default: () => new Date() },
  assignedFrom: { type: Date, default: () => new Date() },
  assignedTo: { type: Date, default: null },

  dispatchDate: { type: Date, default: null },
  siteReceivedDate: { type: Date, default: null },

  releaseDate: { type: Date, default: null, index: true },
  releasedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  releaseReason: { type: String, default: "" },

  // Transfer tracking
  transferDetails: {
    fromProjectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", default: null },
    toProjectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", default: null },
    transferDate: { type: Date, default: null },
    transferReason: { type: String, default: "" },
  },

  notes: { type: String, default: "" },
}, { timestamps: true });

export default mongoose.model("MachineAssignment", assignmentSchema);

