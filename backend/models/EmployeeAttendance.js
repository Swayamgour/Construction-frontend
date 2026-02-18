import mongoose from "mongoose";

const employeeAttendanceSchema = new mongoose.Schema({
    employeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Employee",
        required: true
    },

    date: {
        type: Date,
        default: () => new Date().setHours(0, 0, 0, 0)
    },

    status: {
        type: String,
        enum: ["Present", "Absent", "Half-Day", "Leave"],
        required: true
    },

    timeIn: { type: Date, default: null },
    timeOut: { type: Date, default: null },
    workHours: { type: Number, default: 0 },

    // ⭐⭐⭐ NEW FIELDS (IMPORTANT)
    selfie: { type: String },        // selfie file path
    latitude: { type: Number },      // GPS
    longitude: { type: Number },     // GPS
    timestamp: { type: Date },       // exact punch-in time

    markedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    }

}, { timestamps: true });

export default mongoose.model("EmployeeAttendance", employeeAttendanceSchema);
