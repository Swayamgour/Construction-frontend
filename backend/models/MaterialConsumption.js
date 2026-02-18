import mongoose from "mongoose";

const MaterialConsumptionSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    required: true
  },
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Item",
    required: true
  },
  qtyUsed: {
    type: Number,
    required: true
  },
  unit: { type: String },
  remarks: String,

  usedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  usedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

export default mongoose.model("MaterialConsumption", MaterialConsumptionSchema);
