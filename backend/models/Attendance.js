import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema({
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
        required: true
    },

    labourId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Labour",
        required: true
    },

    date: {
        type: Date,
        default: () => new Date().setHours(0, 0, 0, 0)
    },

    status: {
        type: String,
        enum: ["Present", "Absent", "Half-Day"],
        required: true
    },

    shift: {
        type: String,
        enum: ["Morning", "Evening", "Night"],
        default: "Morning"
    },

    timeIn: { type: String },
    timeOut: { type: String },

    overtimeHours: { type: Number, default: 0 },
    isOvertimeApproved: { type: Boolean, default: false },
    approvedOvertimeHours: { type: Number, default: 0 },

    absentReason: { type: String, default: "" },

    dailyWageAmount: { type: Number, default: 0 },
    wageCalculated: { type: Boolean, default: false },

    remarks: { type: String, default: "" },

    markedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    },

    // ⭐ NEW FIELDS FOR SELFIE + LOCATION
    latitude: { type: Number },
    longitude: { type: Number },
    selfie: { type: String },
    timestamp: { type: Date },
    attendanceToday: {
        type: Boolean, default: true
    }

}, { timestamps: true });

export default mongoose.model("Attendance", attendanceSchema);
