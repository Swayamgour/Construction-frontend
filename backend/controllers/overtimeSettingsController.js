import OvertimeSettings from "../models/OvertimeSettings.js";
import { success, fail } from "../utils/apiResponse.js";

/** GET /api/labour/overtime-settings?projectId= — effective settings (project override or company default). */
export const getOvertimeSettings = async (req, res) => {
    try {
        const { projectId } = req.query;
        const filter = projectId ? { projectId } : { projectId: null };
        const settings = await OvertimeSettings.findOne(filter);
        return success(res, 200, "Overtime settings fetched", settings || { projectId: projectId || null, isDefault: true });
    } catch (error) {
        return fail(res, 500, "Error fetching settings", error);
    }
};

/** PUT /api/labour/overtime-settings — admin/manager configures working hours. Upserts per-project or global (projectId omitted). */
export const upsertOvertimeSettings = async (req, res) => {
    try {
        const {
            projectId,
            workStartTime,
            workEndTime,
            standardWorkingHours,
            weeklyOvertimeThresholdHours,
            regularRate,
            overtimeMultiplier,
            attendanceCutoffTime,
            autoAbsentEnabled,
        } = req.body;

        const filter = { projectId: projectId || null };
        const update = {
            ...(workStartTime && { workStartTime }),
            ...(workEndTime && { workEndTime }),
            ...(standardWorkingHours !== undefined && { standardWorkingHours }),
            ...(weeklyOvertimeThresholdHours !== undefined && { weeklyOvertimeThresholdHours }),
            ...(regularRate !== undefined && { regularRate }),
            ...(overtimeMultiplier !== undefined && { overtimeMultiplier }),
            ...(attendanceCutoffTime && { attendanceCutoffTime }),
            ...(autoAbsentEnabled !== undefined && { autoAbsentEnabled }),
            updatedBy: req.user.id,
        };

        const settings = await OvertimeSettings.findOneAndUpdate(filter, update, { new: true, upsert: true, setDefaultsOnInsert: true });
        return success(res, 200, "Overtime settings saved", settings);
    } catch (error) {
        return fail(res, 500, "Error saving settings", error);
    }
};

/** POST /api/labour/auto-absent/run — manual trigger for generating automatic absent records */
export const triggerAutoAbsent = async (req, res) => {
    try {
        const { projectId, date } = req.body;
        const { generateAutoAbsent } = await import("../services/autoAbsentService.js");
        const result = await generateAutoAbsent({
            projectId: projectId || null,
            date: date || null,
            executedBy: req.user.id,
        });
        return success(res, 200, `Auto-absent generated (${result.totalGenerated} records created)`, result);
    } catch (error) {
        return fail(res, 500, "Error running auto-absent", error);
    }
};
