import mongoose from "mongoose";

const assignWorkSchema = new mongoose.Schema({
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
        required: true
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // or Labour, depends on your system
        required: true
    },
    assignedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: String,

    priority: {
        type: String,
        enum: ["low", "medium", "high", "urgent"],
        default: "medium"
    },

    startDate: Date,
    endDate: Date,

    status: {
        type: String,
        enum: ["assigned", "in-progress", "completed", "on-hold"],
        default: "assigned"
    }
}, { timestamps: true });

export default mongoose.model("AssignWork", assignWorkSchema);
