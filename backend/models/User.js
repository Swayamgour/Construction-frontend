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

    // ⭐ Module 17 — Project-Level Authorization.
    // projectId above stays as-is for backward compatibility (a user's
    // single "home" project, used wherever existing code already reads
    // req.user.projectId or user.projectId). assignedProjects is additive:
    // it lets a manager/supervisor be scoped to MORE THAN ONE project
    // without breaking anything that only knows about the single field.
    // middleware/projectAccess.js treats the *union* of projectId and
    // assignedProjects as the user's accessible-project set.
    assignedProjects: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
    }],

    status: {
        type: Boolean,
        default: true   // true = active, false = inactive
    }

}, { timestamps: true });

export default mongoose.model("User", userSchema);
