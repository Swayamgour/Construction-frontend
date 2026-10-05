/**
 * DEPRECATED & DECOMMISSIONED
 * Legacy usageController.js replaced by machineOperatorController.js
 */
export const upsertDailyUsage = (req, res) => res.status(410).json({ message: "Deprecated. Use /api/machinery/:id/operator" });
export const getDailyUsage = (req, res) => res.status(410).json({ message: "Deprecated. Use /api/machinery/:id/operator-logs" });
