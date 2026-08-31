import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    role: {
        type: String,
        // ⭐ Added "drawing_manager" (additive) for the Drawing/Document
        // request module — reviews requests and uploads drawing versions.
        enum: ["admin", "manager", "supervisor", "storekeeper", "accountant", "operator", "labour", "drawing_manager"],
        default: "labour"
    },

    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
        default: null
    },

    status: {
        type: Boolean,
        default: true   // true = active, false = inactive
    }

}, { timestamps: true });

export default mongoose.model("User", userSchema);
