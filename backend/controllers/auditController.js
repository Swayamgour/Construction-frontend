import { getAuditHistory } from "../utils/audit.js";
import { success, fail } from "../utils/apiResponse.js";

/** GET /api/audit/:module/:entityId — generic history endpoint reused by every new module. */
export const getModuleAuditHistory = async (req, res) => {
    try {
        const { module, entityId } = req.params;
        const history = await getAuditHistory(module, entityId);
        return success(res, 200, "Audit history fetched", history);
    } catch (error) {
        return fail(res, 500, "Error fetching audit history", error);
    }
};
