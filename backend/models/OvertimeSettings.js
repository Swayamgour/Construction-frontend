import mongoose from "mongoose";

/**
 * Configurable working-hours / overtime rules. A doc with projectId: null
 * is the company-wide default; a doc with a projectId overrides it for
 * that project. Read via getEffectiveOvertimeSettings() in
 * utils/overtime.js so callers never hard-code 09:00-18:00 anywhere.
 */
const overtimeSettingsSchema = new mongoose.Schema(
    {
        projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", default: null, unique: true, sparse: true },

        // 24h "HH:mm" strings
        workStartTime: { type: String, default: "09:00" },
        workEndTime: { type: String, default: "18:00" },

        standardWorkingHours: { type: Number, default: 9 },
        weeklyOvertimeThresholdHours: { type: Number, default: 48 },

        regularRate: { type: Number, default: 0 }, // per-hour, fallback if labour has no dailyWage
        overtimeMultiplier: { type: Number, default: 1.5 }, // OT rate = regularRate * multiplier

        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    },
    { timestamps: true }
);

export default mongoose.model("OvertimeSettings", overtimeSettingsSchema);
