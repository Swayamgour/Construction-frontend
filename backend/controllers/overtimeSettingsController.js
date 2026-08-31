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
        const { projectId, workStartTime, workEndTime, standardWorkingHours, weeklyOvertimeThresholdHours, regularRate, overtimeMultiplier } = req.body;

        const filter = { projectId: projectId || null };
        const update = {
            ...(workStartTime && { workStartTime }),
            ...(workEndTime && { workEndTime }),
            ...(standardWorkingHours !== undefined && { standardWorkingHours }),
            ...(weeklyOvertimeThresholdHours !== undefined && { weeklyOvertimeThresholdHours }),
            ...(regularRate !== undefined && { regularRate }),
            ...(overtimeMultiplier !== undefined && { overtimeMultiplier }),
            updatedBy: req.user.id,
        };

        const settings = await OvertimeSettings.findOneAndUpdate(filter, update, { new: true, upsert: true, setDefaultsOnInsert: true });
        return success(res, 200, "Overtime settings saved", settings);
    } catch (error) {
        return fail(res, 500, "Error saving settings", error);
    }
};
