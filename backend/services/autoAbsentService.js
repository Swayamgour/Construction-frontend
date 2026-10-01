import mongoose from "mongoose";
import Attendance from "../models/Attendance.js";
import LabourAssignment from "../models/LabourAssignment.js";
import Labour from "../models/Labour.js";
import Project from "../models/Project.js";
import User from "../models/User.js";
import OvertimeSettings from "../models/OvertimeSettings.js";
import { getEffectiveOvertimeSettings } from "../utils/overtime.js";
import { logAudit } from "../utils/audit.js";

const startOfDay = (d = new Date()) => {
    const dt = new Date(d);
    dt.setHours(0, 0, 0, 0);
    return dt;
};

/**
 * Generates automatic ABSENT attendance records for labours active on a project
 * who do not have any attendance marked for the given date.
 *
 * @param {Object} options
 * @param {string|mongoose.Types.ObjectId} [options.projectId] - Optional: specific project ID. If omitted, checks all active projects.
 * @param {Date|string} [options.date] - The attendance date (defaults to today).
 * @param {string|mongoose.Types.ObjectId} [options.executedBy] - User ID who triggered the action, or system admin ID.
 * @returns {Promise<Object>} Summary of created records.
 */
export const generateAutoAbsent = async ({ projectId, date, executedBy = null } = {}) => {
    try {
        const targetDate = date ? startOfDay(date) : startOfDay();
        const nextDay = new Date(targetDate);
        nextDay.setDate(nextDay.getDate() + 1);

        // Find fallback admin ID if executedBy is null
        let performerId = executedBy;
        if (!performerId) {
            const adminUser = await User.findOne({ role: "admin" }).select("_id");
            performerId = adminUser ? adminUser._id : null;
        }

        const projectFilter = projectId ? { _id: projectId } : {};
        const projects = await Project.find(projectFilter).select("_id projectName");

        let totalGenerated = 0;
        const details = [];

        for (const proj of projects) {
            const pId = proj._id;
            const settings = await getEffectiveOvertimeSettings(pId);

            if (settings.autoAbsentEnabled === false) {
                continue;
            }

            // Find all active assignments for this project
            const activeAssignments = await LabourAssignment.find({
                projectId: pId,
                status: "Active",
            }).populate("labourId", "name phone status dailyWage");

            if (!activeAssignments.length) continue;

            const activeLabourIds = activeAssignments
                .filter((a) => a.labourId && a.labourId.status === "Active")
                .map((a) => a.labourId._id);

            if (!activeLabourIds.length) continue;

            // Find who already has attendance today (Present, Absent, Half-Day, etc.)
            const existingRecords = await Attendance.find({
                projectId: pId,
                labourId: { $in: activeLabourIds },
                date: { $gte: targetDate, $lt: nextDay },
            }).select("labourId");

            const markedLabourIds = new Set(existingRecords.map((r) => String(r.labourId)));

            // Labours needing auto-absent
            const toCreate = [];
            for (const assignment of activeAssignments) {
                const lId = String(assignment.labourId?._id);
                if (!lId || markedLabourIds.has(lId)) continue;

                const assignedByUserId = performerId || assignment.assignedBy;
                if (!assignedByUserId) continue; // cannot save without markedBy

                toCreate.push({
                    projectId: pId,
                    labourId: assignment.labourId._id,
                    assignmentId: assignment._id,
                    date: targetDate,
                    status: "Absent",
                    markedSource: "SYSTEM",
                    absentReason: "Automatic absent generated after cutoff",
                    regularWorkingHours: 0,
                    totalWorkingHours: 0,
                    overtimeHours: 0,
                    regularAmount: 0,
                    overtimeAmount: 0,
                    totalAmount: 0,
                    dailyWageAmount: 0,
                    wageCalculated: true,
                    approvalStatus: "Approved",
                    markedBy: assignedByUserId,
                    approvedBy: assignedByUserId,
                    approvedAt: new Date(),
                });
            }

            if (toCreate.length > 0) {
                let insertedCount = 0;
                try {
                    const inserted = await Attendance.insertMany(toCreate, { ordered: false });
                    insertedCount = inserted.length;
                } catch (bulkErr) {
                    // Handle duplicate key or partial inserts gracefully
                    if (bulkErr.result?.nInserted) {
                        insertedCount = bulkErr.result.nInserted;
                    } else if (bulkErr.insertedDocs) {
                        insertedCount = bulkErr.insertedDocs.length;
                    }
                }

                if (insertedCount > 0) {
                    totalGenerated += insertedCount;
                    details.push({
                        projectId: pId,
                        projectName: proj.projectName,
                        count: insertedCount,
                    });

                    if (performerId) {
                        await logAudit({
                            module: "LabourAttendance",
                            entityId: pId,
                            action: "auto-absent-generated",
                            performedBy: performerId,
                            meta: { count: insertedCount, date: targetDate },
                        }).catch(() => {});
                    }
                }
            }
        }

        return {
            success: true,
            totalGenerated,
            date: targetDate,
            details,
        };
    } catch (error) {
        console.error("❌ Error generating auto-absent:", error);
        throw error;
    }
};

/**
 * Checks whether current time is past cutoff time ("HH:mm").
 */
export const isPastCutoff = (cutoffHHmm = "20:00") => {
    const now = new Date();
    const [cHours, cMins] = (cutoffHHmm || "20:00").split(":").map(Number);
    const cutoffDate = new Date();
    cutoffDate.setHours(cHours, cMins, 0, 0);
    return now >= cutoffDate;
};
