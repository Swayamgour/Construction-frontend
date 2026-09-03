import express from "express";
import { auth } from "../middleware/auth.js";
import { roleCheck } from "../middleware/role.js";
import { checkProjectAccess, resolveProjectFrom } from "../middleware/projectAccess.js";
import Attendance from "../models/Attendance.js";

import {
    assignLabourToProject,
    transferLabour,
    releaseLabour,
    getLabourAssignmentHistory,
    getLabourFullHistory,
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

// Labour transfer touches two projects at once — the caller must be
// scoped to BOTH the source and the destination, not just one.
const transferProjectIds = (req) => [req.body?.fromProjectId, req.body?.toProjectId].filter(Boolean);

// Overtime approve/reject/correct only carry an Attendance _id in the
// URL — resolve the record's projectId before checking access.
const attendanceProject = resolveProjectFrom(Attendance, { param: "id", field: "projectId" });

/* --------------------------- ASSIGNMENT & TRANSFER --------------------- */
router.post("/assign", auth, roleCheck("admin", "manager", "supervisor"), checkProjectAccess(), assignLabourToProject);
router.post("/transfer", auth, roleCheck("admin", "manager"), checkProjectAccess(transferProjectIds), transferLabour);
router.post("/release", auth, roleCheck("admin", "manager", "supervisor"), checkProjectAccess(), releaseLabour);
router.get("/assignments", auth, roleCheck("admin", "manager", "supervisor"), checkProjectAccess(), listLabourAssignments);
router.get("/:id/history", auth, roleCheck("admin", "manager", "supervisor"), getLabourAssignmentHistory);
router.get("/:id/full-history", auth, roleCheck("admin", "manager", "supervisor"), getLabourFullHistory);

/* --------------------------- WORKING TIME & OVERTIME -------------------- */
router.post("/attendance", auth, roleCheck("admin", "manager", "supervisor"), checkProjectAccess(), recordLabourWorkingTime);
router.post("/overtime", auth, roleCheck("admin", "manager", "supervisor"), checkProjectAccess(), recordLabourWorkingTime);
router.get("/overtime", auth, roleCheck("admin", "manager", "supervisor"), listOvertimeRecords);
router.patch("/overtime/:id/approve", auth, roleCheck("admin", "manager"), checkProjectAccess(attendanceProject), approveOvertime);
router.patch("/overtime/:id/reject", auth, roleCheck("admin", "manager"), checkProjectAccess(attendanceProject), rejectOvertime);
router.patch("/overtime/:id/correct", auth, roleCheck("admin", "manager", "supervisor"), checkProjectAccess(attendanceProject), correctOvertime);

/* --------------------------- CONFIGURABLE WORKING HOURS ------------------ */
router.get("/overtime-settings", auth, roleCheck("admin", "manager"), getOvertimeSettings);
router.put("/overtime-settings", auth, roleCheck("admin", "manager"), upsertOvertimeSettings);

export default router;
