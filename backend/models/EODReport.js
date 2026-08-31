import mongoose from "mongoose";

/**
 * Rich daily End-Of-Day report. The existing DailyReport model is tied to
 * a single Task and has no labour/machinery/material breakdown or
 * image metadata — left untouched for backward compatibility. This is a
 * new, richer model used by the /api/eod endpoints.
 */
const workItemSchema = new mongoose.Schema(
    {
        workCategory: { type: String, required: true },
        workDescription: { type: String, default: "" },
        location: { type: String, default: "" },
        plannedQuantity: { type: Number, default: 0 },
        completedQuantity: { type: Number, default: 0 },
        unit: { type: String, default: "" },
        percentageCompleted: { type: Number, default: 0 },
        startTime: { type: String, default: null },
        endTime: { type: String, default: null },
        manpowerUsed: { type: Number, default: 0 },
        machineryUsed: [{ type: String }],
        materialsUsed: [{ materialName: String, qty: Number, unit: String }],
        remarks: { type: String, default: "" },
    },
    { _id: false }
);

const eodImageSchema = new mongoose.Schema(
    {
        url: { type: String, required: true },
        category: { type: String, enum: ["progress", "work", "material", "machinery", "safety", "issue"], default: "progress" },
        caption: { type: String, default: "" },
        location: { type: String, default: "" },
        uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        timestamp: { type: Date, default: Date.now },
    },
    { _id: false }
);

const eodIssueSchema = new mongoose.Schema(
    {
        issue: { type: String, required: true },
        severity: { type: String, enum: ["Low", "Medium", "High", "Critical"], default: "Medium" },
        description: { type: String, default: "" },
        image: { type: String, default: null },
        impact: { type: String, default: "" },
        actionTaken: { type: String, default: "" },
        responsiblePerson: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
        status: { type: String, enum: ["Open", "In Progress", "Resolved"], default: "Open" },
    },
    { _id: false }
);

const eodReportSchema = new mongoose.Schema(
    {
        projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true, index: true },
        date: { type: Date, required: true },
        submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

        weather: { type: String, default: "" },
        workingShift: { type: String, default: "" },
        siteStatus: { type: String, default: "" },

        workItems: [workItemSchema],

        labourDetails: {
            totalLabour: { type: Number, default: 0 },
            skilledLabour: { type: Number, default: 0 },
            unskilledLabour: { type: Number, default: 0 },
            supervisors: { type: Number, default: 0 },
            operators: { type: Number, default: 0 },
            overtimeHours: { type: Number, default: 0 },
            absentLabour: { type: Number, default: 0 },
        },

        machineryDetails: [
            {
                machineId: { type: mongoose.Schema.Types.ObjectId, ref: "Machine" },
                operatingHours: { type: Number, default: 0 },
                idleHours: { type: Number, default: 0 },
                overtimeHours: { type: Number, default: 0 },
                operatorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
            },
        ],

        materialConsumption: [
            {
                materialId: { type: mongoose.Schema.Types.ObjectId, ref: "Item" },
                materialName: String,
                openingQuantity: { type: Number, default: 0 },
                receivedQuantity: { type: Number, default: 0 },
                consumedQuantity: { type: Number, default: 0 },
                closingQuantity: { type: Number, default: 0 },
                unit: String,
            },
        ],

        images: [eodImageSchema],
        issues: [eodIssueSchema],

        status: {
            type: String,
            enum: ["Submitted", "Approved", "Rejected"],
            default: "Submitted",
            index: true,
        },
        approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
        approvedAt: { type: Date, default: null },
        rejectionReason: { type: String, default: "" },

        editHistory: [
            {
                editedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
                editedAt: { type: Date, default: Date.now },
            },
        ],

        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    },
    { timestamps: true }
);

// One EOD per project per day (spec rule #10) — editing an existing one is allowed via PATCH, not a second POST.
eodReportSchema.index({ projectId: 1, date: 1 }, { unique: true });

export default mongoose.model("EODReport", eodReportSchema);
