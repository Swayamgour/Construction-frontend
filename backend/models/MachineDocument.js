import mongoose from "mongoose";

/**
 * Structured per-machine document store (RC, Fitness, PUC, Insurance,
 * Permit, etc.) — replaces the flat single-file-per-type fields on Machine
 * (photo/rcFile/insuranceFile) for anything beyond those two, without
 * removing them (Machine.js untouched, existing addMachine flow keeps
 * working). New uploads always go here.
 */
const machineDocumentSchema = new mongoose.Schema(
    {
        machineId: { type: mongoose.Schema.Types.ObjectId, ref: "Machine", required: true, index: true },

        type: {
            type: String,
            enum: ["RC", "Fitness Certificate", "PUC", "Pollution Certificate", "Insurance", "Permit", "Registration", "Other"],
            required: true,
        },

        fileUrl: { type: String, required: true },
        documentNumber: { type: String, default: "" },
        issueDate: { type: Date, default: null },
        expiryDate: { type: Date, default: null },

        uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

        verificationStatus: { 
            type: String, 
            enum: ["Pending", "Verified", "Rejected", "Expiring Soon", "Expired"], 
            default: "Pending" 
        },
        verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
        verifiedAt: { type: Date, default: null },
        remarks: { type: String, default: "" },
    },
    { timestamps: true }
);

machineDocumentSchema.index({ machineId: 1, type: 1 });

export default mongoose.model("MachineDocument", machineDocumentSchema);
