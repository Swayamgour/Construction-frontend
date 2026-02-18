import mongoose from "mongoose";

const labourSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true, unique: true },

    gender: { type: String, enum: ["Male", "Female", "Other"], default: null },
    age: { type: Number, default: null },

    // Labour / Mistri / Operator Type
    labourType: {
        type: String,
        enum: [
            "Permanent Labour",
            "Permanent Mistri",
            "Contract Labour",
            "Contract Mistri",
            "Permanent Operator",     // ✔ Added
            "Contract Operator"       // ✔ Added
        ],
        required: true
    },

    // Category
    category: {
        type: String,
        enum: ["Labour", "Mistri", "Operator"],  // ✔ Added Operator
        required: true
    },

    skillLevel: {
        type: String,
        enum: ["Unskilled", "Semi-skilled", "Skilled"],
        required: true
    },

    wageType: { type: String, enum: ["Daily", "Monthly"], required: true },

    dailyWage: { type: Number, default: null },
    monthlySalary: { type: Number, default: null },

    aadhaarNumber: { type: String, default: null },
    address: { type: String, required: true },

    status: { type: String, enum: ["Active", "Inactive", "Left"], default: "Active" },

    assignedProjects: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project"
    }],

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    bankName: { type: String },
    accountNumber: { type: String },
    ifscCode: { type: String },
    joinDate: { type: Date },

    contractorName: { type: String },

    emergencyContact: {
        name: String,
        phone: String
    },

    documents: {
        aadhaar: String,
        pan: String,
        photo: String
    }

}, { timestamps: true });

export default mongoose.model("Labour", labourSchema);
