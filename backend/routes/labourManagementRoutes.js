import express from "express";
import { auth } from "../middleware/auth.js";
import { roleCheck } from "../middleware/role.js";

import {
    assignLabourToProject,
    transferLabour,
    releaseLabour,
    getLabourAssignmentHistory,
    getProjectActiveLabour,
    listLabourAssignments,
} from "../controllers/labourAssignmentController.js";

import {
    recordLabourWorkingTime,
    approveOvertime,
    rejectOvertime,
    correctOvertime,
    listOvertimeRecords,
} from "../controllers/labourAttendanceController.js";

import {
    getOvertimeSettings,
    upsertOvertimeSettings,
} from "../controllers/overtimeSettingsController.js";

const router = express.Router();

/* --------------------------- ASSIGNMENT & TRANSFER --------------------- */
router.post("/assign", auth, roleCheck("admin", "manager", "supervisor"), assignLabourToProject);
router.post("/transfer", auth, roleCheck("admin", "manager"), transferLabour);
router.post("/release", auth, roleCheck("admin", "manager", "supervisor"), releaseLabour);
router.get("/assignments", auth, roleCheck("admin", "manager", "supervisor"), listLabourAssignments);
router.get("/:id/history", auth, roleCheck("admin", "manager", "supervisor"), getLabourAssignmentHistory);

/* --------------------------- WORKING TIME & OVERTIME -------------------- */
router.post("/attendance", auth, roleCheck("admin", "manager", "supervisor"), recordLabourWorkingTime);
router.post("/overtime", auth, roleCheck("admin", "manager", "supervisor"), recordLabourWorkingTime);
router.get("/overtime", auth, roleCheck("admin", "manager", "supervisor"), listOvertimeRecords);
router.patch("/overtime/:id/approve", auth, roleCheck("admin", "manager"), approveOvertime);
router.patch("/overtime/:id/reject", auth, roleCheck("admin", "manager"), rejectOvertime);
router.patch("/overtime/:id/correct", auth, roleCheck("admin", "manager", "supervisor"), correctOvertime);

/* --------------------------- CONFIGURABLE WORKING HOURS ------------------ */
router.get("/overtime-settings", auth, roleCheck("admin", "manager"), getOvertimeSettings);
router.put("/overtime-settings", auth, roleCheck("admin", "manager"), upsertOvertimeSettings);

export default router;
