import mongoose from "mongoose";

const machineUsageSchema = new mongoose.Schema(
  {
    machineId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Machine",
      required: true,
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    usageDate: { type: Date, required: true },

    workingHours: { type: Number, default: 0 },   // OR kms / trips according to type
    idleHours: { type: Number, default: 0 },
    breakdownHours: { type: Number, default: 0 },

    remarks: { type: String, default: null },

    enteredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export default mongoose.model("MachineUsage", machineUsageSchema);
