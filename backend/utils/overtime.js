import OvertimeSettings from "../models/OvertimeSettings.js";
import Attendance from "../models/Attendance.js";

/** Project settings override the company-wide default (projectId: null). */
export const getEffectiveOvertimeSettings = async (projectId) => {
    const [projectSettings, defaultSettings] = await Promise.all([
        projectId ? OvertimeSettings.findOne({ projectId }) : null,
        OvertimeSettings.findOne({ projectId: null }),
    ]);
    return (
        projectSettings ||
        defaultSettings || {
            workStartTime: "09:00",
            workEndTime: "18:00",
            standardWorkingHours: 9,
            regularRate: 0,
            overtimeMultiplier: 1.5,
        }
    );
};

const toMinutes = (hhmm) => {
    const [h, m] = hhmm.split(":").map(Number);
    return h * 60 + m;
};

/**
 * Computes regular/overtime hours + amounts for a single day from
 * checkInTime/checkOutTime ("HH:mm") against the configured standard
 * working window. Overtime = any time worked past workEndTime.
 * Never hard-codes hours — always driven by OvertimeSettings.
 */
export const calculateWorkingTime = ({ checkInTime, checkOutTime, settings, hourlyRate }) => {
    if (!checkInTime || !checkOutTime) {
        return {
            regularWorkingHours: 0,
            overtimeHours: 0,
            totalWorkingHours: 0,
            regularAmount: 0,
            overtimeAmount: 0,
            totalAmount: 0,
        };
    }

    const inMin = toMinutes(checkInTime);
    let outMin = toMinutes(checkOutTime);
    if (outMin <= inMin) outMin += 24 * 60; // crossed midnight

    const totalMinutes = outMin - inMin;
    const standardMinutes = settings.standardWorkingHours * 60;
    const workEndMinutes = toMinutes(settings.workEndTime);

    // Overtime is time worked beyond the configured end-of-day, capped so
    // regular hours never exceed the standard shift length.
    const overtimeMinutes = outMin > workEndMinutes ? Math.min(outMin - Math.max(inMin, workEndMinutes), totalMinutes) : 0;
    const regularMinutes = Math.min(totalMinutes - overtimeMinutes, standardMinutes);

    const regularWorkingHours = +(regularMinutes / 60).toFixed(2);
    const overtimeHours = +(overtimeMinutes / 60).toFixed(2);
    const totalWorkingHours = +((regularMinutes + overtimeMinutes) / 60).toFixed(2);

    const regularRate = hourlyRate || settings.regularRate || 0;
    const overtimeRate = +(regularRate * (settings.overtimeMultiplier || 1.5)).toFixed(2);

    const regularAmount = +(regularWorkingHours * regularRate).toFixed(2);
    const overtimeAmount = +(overtimeHours * overtimeRate).toFixed(2);

    return {
        regularWorkingHours,
        overtimeHours,
        totalWorkingHours,
        regularRate,
        overtimeRate,
        regularAmount,
        overtimeAmount,
        totalAmount: +(regularAmount + overtimeAmount).toFixed(2),
    };
};

/* =========================================================================
   WEEKLY OVERTIME
   ========================================================================= */

const getWeekRange = (date) => {
    const d = new Date(date);
    const day = d.getDay(); // 0=Sun..6=Sat
    const diffToMonday = (day === 0 ? -6 : 1) - day;
    const weekStart = new Date(d);
    weekStart.setHours(0, 0, 0, 0);
    weekStart.setDate(d.getDate() + diffToMonday);
    return { weekStart };
};

/**
 * Applies the configurable weekly overtime threshold on top of the daily
 * calculation from calculateWorkingTime(). If the labour's cumulative
 * REGULAR hours for the week (Mon-Sun, prior days + today) exceed
 * settings.weeklyOvertimeThresholdHours, the excess is moved from
 * regularWorkingHours into overtimeHours/overtimeAmount for today's
 * record — in addition to any daily overtime already computed. A
 * threshold of 0/falsy disables weekly overtime (daily-only, unchanged
 * behaviour).
 */
export const applyWeeklyOvertime = async ({ labourId, projectId, date, dailyCalc, settings }) => {
    const threshold = settings.weeklyOvertimeThresholdHours;
    if (!threshold || dailyCalc.regularWorkingHours <= 0) return dailyCalc;

    const { weekStart } = getWeekRange(date);
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);

    const priorRecords = await Attendance.find({
        labourId,
        projectId,
        date: { $gte: weekStart, $lt: dayStart },
    }).select("regularWorkingHours");

    const priorWeeklyRegular = priorRecords.reduce((sum, r) => sum + (r.regularWorkingHours || 0), 0);
    const totalWithToday = priorWeeklyRegular + dailyCalc.regularWorkingHours;

    if (totalWithToday <= threshold) return dailyCalc;

    const excess = +Math.min(dailyCalc.regularWorkingHours, totalWithToday - threshold).toFixed(2);
    if (excess <= 0) return dailyCalc;

    const regularWorkingHours = +(dailyCalc.regularWorkingHours - excess).toFixed(2);
    const overtimeHours = +(dailyCalc.overtimeHours + excess).toFixed(2);
    const regularAmount = +(regularWorkingHours * dailyCalc.regularRate).toFixed(2);
    const overtimeAmount = +(dailyCalc.overtimeAmount + excess * dailyCalc.overtimeRate).toFixed(2);

    return {
        ...dailyCalc,
        regularWorkingHours,
        overtimeHours,
        regularAmount,
        overtimeAmount,
        totalAmount: +(regularAmount + overtimeAmount).toFixed(2),
        weeklyOvertimeTriggered: true,
    };
};
