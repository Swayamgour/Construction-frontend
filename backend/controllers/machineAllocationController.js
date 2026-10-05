/**
 * DEPRECATED & DECOMMISSIONED
 * Legacy MachineAllocation controller replaced by assignmentController.js
 */
export const allocateMachine = (req, res) => res.status(410).json({ message: "Endpoint deprecated. Use /api/assignments/assign" });
export const releaseAllocation = (req, res) => res.status(410).json({ message: "Endpoint deprecated. Use /api/assignments/release" });
export const getAllAllocations = (req, res) => res.status(410).json({ message: "Endpoint deprecated. Use /api/assignments/active" });
