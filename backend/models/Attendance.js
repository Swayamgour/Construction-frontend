import mongoose from "mongoose";

const todayStart = () => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
};

const attendanceSchema = new mongoose.Schema(
    {
        projectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Project",
            required: true,
        },

        labourId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Labour",
            required: true,
        },

        assignmentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "LabourAssignment",
            default: null,
            index: true,
        },

        // Always stored as start-of-day
        date: { type: Date, default: todayStart },

        status: {
            type: String,
            enum: ["Present", "Absent", "Half-Day", "Holiday", "Week-Off", "Leave"],
            required: true,
        },

        markedSource: {
            type: String,
            enum: ["MANUAL", "SYSTEM", "PUNCH", "BULK"],
            default: "MANUAL",
        },

        shift: {
            type: String,
            enum: ["Morning", "Evening", "Night"],
            default: "Morning",
        },

        // legacy time fields (kept in sync with checkInTime / checkOutTime)
        timeIn: { type: String },
        timeOut: { type: String },

        absentReason: { type: String, default: "" },
        remarks: { type: String, default: "" },

        // ---------------- PUNCH IN / OUT + WORKING TIME ----------------
        checkInTime: { type: String, default: null }, // "HH:mm"
        checkOutTime: { type: String, default: null }, // "HH:mm"

        regularWorkingHours: { type: Number, default: 0 },
        totalWorkingHours: { type: Number, default: 0 },

        // ---------------- OVERTIME ----------------
        overtimeHours: { type: Number, default: 0 },
        isOvertimeApproved: { type: Boolean, default: false },
        approvedOvertimeHours: { type: Number, default: 0 },
        overtimeApprovalStatus: {
            type: String,
            enum: ["Not Applicable", "Pending", "Approved", "Rejected"],
            default: "Not Applicable",
        },
        overtimeApprovedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
        overtimeApprovedAt: { type: Date, default: null },
        overtimeRejectionReason: { type: String, default: "" },

        // ---------------- WAGES (final values are set on admin approval) ----------------
        regularRate: { type: Number, default: 0 },
        overtimeRate: { type: Number, default: 0 },
        regularAmount: { type: Number, default: 0 },
        overtimeAmount: { type: Number, default: 0 },
        totalAmount: { type: Number, default: 0 },
        dailyWageAmount: { type: Number, default: 0 },
        wageCalculated: { type: Boolean, default: false },

        // ---------------- WHO MARKED ----------------
        markedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        // ---------------- ADMIN APPROVAL ----------------
        approvalStatus: {
            type: String,
            enum: ["Pending", "Approved", "Rejected"],
            default: "Pending",
        },
        approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
        approvedAt: { type: Date, default: null },
        rejectedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
        rejectedAt: { type: Date, default: null },
        rejectionReason: { type: String, default: "" },

        // ---------------- SELFIE + LOCATION (punch-in) ----------------
        latitude: { type: Number },
        longitude: { type: Number },
        selfie: { type: String },
        timestamp: { type: Date },

        attendanceToday: { type: Boolean, default: true },
    },
    { timestamps: true }
);

// One record per labour / project / day (also stops duplicate records from
// double clicks or parallel requests).
attendanceSchema.index({ projectId: 1, labourId: 1, date: 1 }, { unique: true });
attendanceSchema.index({ labourId: 1, assignmentId: 1, date: 1 });
attendanceSchema.index({ assignmentId: 1, date: -1 });
attendanceSchema.index({ projectId: 1, date: -1 });
attendanceSchema.index({ approvalStatus: 1, projectId: 1 });

export default mongoose.model("Attendance", attendanceSchema);