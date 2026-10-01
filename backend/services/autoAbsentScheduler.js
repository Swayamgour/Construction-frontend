import { generateAutoAbsent, isPastCutoff } from "./autoAbsentService.js";
import OvertimeSettings from "../models/OvertimeSettings.js";
import Project from "../models/Project.js";

let intervalHandle = null;
let lastRunDateString = null; // YYYY-MM-DD

const getTodayDateString = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

/**
 * Checks all active projects (or default settings) and triggers automatic absent records
 * if current time has passed the configured cutoff time and hasn't already been run today.
 */
export const checkAndRunAutoAbsent = async () => {
    try {
        const todayStr = getTodayDateString();

        // Fetch company-wide default settings
        const defaultSettings = await OvertimeSettings.findOne({ projectId: null });
        const defaultCutoff = defaultSettings?.attendanceCutoffTime || "20:00";
        const autoAbsentEnabled = defaultSettings?.autoAbsentEnabled ?? true;

        if (!autoAbsentEnabled) {
            return;
        }

        // Check if current time is past cutoff
        if (isPastCutoff(defaultCutoff)) {
            if (lastRunDateString === todayStr) {
                // Already ran today
                return;
            }

            console.log(`⏱️ [AutoAbsentScheduler] Cutoff (${defaultCutoff}) reached for date ${todayStr}. Generating auto-absent...`);
            const result = await generateAutoAbsent();
            lastRunDateString = todayStr;
            console.log(`✅ [AutoAbsentScheduler] Generated ${result.totalGenerated} auto-absent records across projects.`);
        }
    } catch (err) {
        console.error("❌ [AutoAbsentScheduler] Error during execution:", err.message);
    }
};

/**
 * Starts the background auto-absent interval checker.
 * Default check frequency: every 10 minutes.
 */
export const startAutoAbsentScheduler = (intervalMs = 10 * 60 * 1000) => {
    if (intervalHandle) {
        clearInterval(intervalHandle);
    }

    console.log("🚀 [AutoAbsentScheduler] Auto-absent scheduler initialized (check interval: 10 mins).");

    // Run check shortly after boot (e.g. 15s) in case server restarted after cutoff
    setTimeout(() => {
        checkAndRunAutoAbsent();
    }, 15000);

    intervalHandle = setInterval(() => {
        checkAndRunAutoAbsent();
    }, intervalMs);
};

export const stopAutoAbsentScheduler = () => {
    if (intervalHandle) {
        clearInterval(intervalHandle);
        intervalHandle = null;
        console.log("🛑 [AutoAbsentScheduler] Auto-absent scheduler stopped.");
    }
};
