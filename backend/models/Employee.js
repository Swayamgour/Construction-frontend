import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true, unique: true },

    role: {
        type: String,
        enum: ["Admin", "Manager", "Supervisor", "Engineer", "Accountant", "Staff"],
        required: true
    },

    email: { type: String },
    department: { type: String, default: null },
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }

}, { timestamps: true });

export default mongoose.model("Employee", employeeSchema);
