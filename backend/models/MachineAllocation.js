import mongoose from "mongoose";

const machineAllocationSchema = new mongoose.Schema(
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
    operatorName: { type: String, default: null }, // aage operatorId bhi rakh sakte ho
    startDate: { type: Date, required: true },
    endDate: { type: Date, default: null },

    status: {
      type: String,
      enum: ["Allocated", "Released"],
      default: "Allocated",
    },

    remarks: { type: String, default: null },

    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export default mongoose.model("MachineAllocation", machineAllocationSchema);
