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
        assignmentId: { type: mongoose.Schema.Types.ObjectId, ref: "MachineAssignment", default: null, index: true },
        operatorId: { type: mongoose.Schema.Types.ObjectId, ref: "Labour", required: true, index: true },
        projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true, index: true },

        date: { type: Date, required: true },
        shift: { type: String, enum: ["Morning", "Evening", "Night"], default: "Morning" },
        workType: { type: String, default: "General Site Work" },

        checkInTime: { type: String, default: null },
        checkOutTime: { type: String, default: null },

        normalHours: { type: Number, default: 0 },
        overtimeHours: { type: Number, default: 0 },
        totalHours: { type: Number, default: 0 },

        operatorRate: { type: Number, default: 0 },
        overtimeAmount: { type: Number, default: 0 },

        // Machine hour meter (opening/closing) — cumulative machine working hours
        openingMeterReading: { type: Number, required: true },
        closingMeterReading: { type: Number, required: true },
        workingHours: { type: Number, default: 0 }, // calculated: closing - opening

        // Fuel Lifecycle: Opening + Added - Closing
        fuelOpening: { type: Number, default: 0 },
        fuelAdded: { type: Number, default: 0 },
        fuelClosing: { type: Number, default: 0 },
        fuelConsumed: { type: Number, default: 0 }, // calculated: fuelOpening + fuelAdded - fuelClosing
        fuelEfficiency: { type: Number, default: 0 }, // fuelConsumed / workingHours (L/hr)
        fuelRate: { type: Number, default: 0 },
        fuelCost: { type: Number, default: 0 }, // fuelConsumed * fuelRate

        // Machine Operational Costing
        machineHourlyRate: { type: Number, default: 0 },
        machineUsageCost: { type: Number, default: 0 }, // workingHours * machineHourlyRate
        totalDayCost: { type: Number, default: 0 }, // machineUsageCost + fuelCost + overtimeAmount

        approvalStatus: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" },
        approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },

        remarks: { type: String, default: "" },
        assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    },
    { timestamps: true }
);

machineOperatorLogSchema.index({ machineId: 1, date: 1 });
machineOperatorLogSchema.index({ projectId: 1, date: 1 });

export default mongoose.model("MachineOperatorLog", machineOperatorLogSchema);
