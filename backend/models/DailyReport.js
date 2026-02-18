import mongoose from "mongoose";

const dailyReportSchema = new mongoose.Schema({
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
        required: true,
    },

    taskId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Task",
        required: true,
    },

    submittedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },

    workDescription: { type: String, required: true },

    progressPercent: { type: Number, default: 0 },

    laboursUsed: [{
        labourId: { type: mongoose.Schema.Types.ObjectId, ref: "Labour" },
        hours: Number
    }],

    machinesUsed: [{
        machineId: { type: mongoose.Schema.Types.ObjectId, ref: "Machine" },
        hours: Number
    }],

    materialsUsed: [{
        materialName: String,
        qty: Number,
        unit: String
    }],

    startTime: Date,
    endTime: Date,

    attachments: [String], // images

}, { timestamps: true });

export default mongoose.model("DailyReport", dailyReportSchema);
