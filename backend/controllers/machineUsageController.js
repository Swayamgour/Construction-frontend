/**
 * DEPRECATED & DECOMMISSIONED
 * Legacy machineUsageController.js replaced by machineOperatorController.js
 */
export const addMachineUsage = (req, res) => res.status(410).json({ message: "Deprecated. Use /api/machinery/:id/operator" });
export const getMachineUsage = (req, res) => res.status(410).json({ message: "Deprecated. Use /api/machinery/:id/operator-logs" });
