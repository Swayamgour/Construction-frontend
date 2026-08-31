import mongoose from "mongoose";

const projectDelaySchema = new mongoose.Schema(
    {
        projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true, index: true },
        delayDate: { type: Date, required: true },
        reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

        delayType: { type: mongoose.Schema.Types.ObjectId, ref: "DelayCategory", required: true },
        reason: { type: String, required: true },
        description: { type: String, default: "" },

        plannedResumeDate: { type: Date, default: null },
        actualResumeDate: { type: Date, default: null },

        affectedWork: { type: String, default: "" },
        affectedQuantity: { type: Number, default: 0 },

        estimatedDelayDays: { type: Number, default: 0 },
        actualDelayDays: { type: Number, default: 0 },

        financialImpact: { type: Number, default: null },
        manpowerImpact: { type: String, default: "" },
        machineryImpact: { type: String, default: "" },
        materialImpact: { type: String, default: "" },
        clientImpact: { type: String, default: "" },

        attachments: [{ type: String }],
        images: [{ type: String }],

        status: { type: String, enum: ["Active", "Resolved"], default: "Active", index: true },
        resolution: { type: String, default: "" },
        resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
        resolvedAt: { type: Date, default: null },

        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    },
    { timestamps: true }
);

export default mongoose.model("ProjectDelay", projectDelaySchema);
