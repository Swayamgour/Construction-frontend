import mongoose from "mongoose";

/**
 * Daily working-time log per machine/operator, separate from
 * MachineAssignment (which tracks the assignment PERIOD — start/end date).
 * This tracks each individual working DAY within that period, mirroring
 * the Labour attendance/overtime engine (utils/overtime.js is reused here).
 */
const machineOperatorLogSchema = new mongoose.Schema(
    {
        machineId: { type: mongoose.Schema.Types.ObjectId, ref: "Machine", required: true, index: true },
        operatorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },

        date: { type: Date, required: true },
        shift: { type: String, enum: ["Morning", "Evening", "Night"], default: "Morning" },

        checkInTime: { type: String, default: null },
        checkOutTime: { type: String, default: null },

        normalHours: { type: Number, default: 0 },
        overtimeHours: { type: Number, default: 0 },
        totalHours: { type: Number, default: 0 },

        operatorRate: { type: Number, default: 0 },
        overtimeAmount: { type: Number, default: 0 },

        // Machine hour meter (opening/closing) — feeds maintenance-due-by-usage calculations
        openingMeterReading: { type: Number, default: null },
        closingMeterReading: { type: Number, default: null },
        fuelUsed: { type: Number, default: 0 },

        approvalStatus: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" },
        approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },

        remarks: { type: String, default: "" },
        assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    },
    { timestamps: true }
);

machineOperatorLogSchema.index({ machineId: 1, date: 1 });

export default mongoose.model("MachineOperatorLog", machineOperatorLogSchema);
