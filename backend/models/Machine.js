import mongoose from "mongoose";

const machineSchema = new mongoose.Schema({
  machineNumber: { type: String, required: true, unique: true }, // unique id / plate
  engineNumber: { type: String },
  chassisNumber: { type: String },
  machineType: { type: String }, // e.g., Excavator, Truck
  ownedOrRented: { type: String, enum: ["owned","rented"], default: "owned" },

  // file paths / urls
  photo: { type: String },        // local path or cloud URL
  rcFile: { type: String },
  insuranceFile: { type: String },

  // document expiry useful for reminders
  rcExpiry: { type: Date },
  insuranceExpiry: { type: Date },

  notes: { type: String },

  // status
  active: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model("Machine", machineSchema);
