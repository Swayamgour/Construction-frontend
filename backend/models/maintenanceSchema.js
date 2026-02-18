import mongoose from "mongoose";

const maintenanceSchema = new mongoose.Schema(
  {
    machineId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Machine",
      required: true,
    },
    lastServiceDate: { type: Date, required: true },
    nextServiceDate: { type: Date, required: true },
    serviceCost: { type: Number, default: 0 },
    technician: { type: String },
    remark: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("Maintenance", maintenanceSchema);
