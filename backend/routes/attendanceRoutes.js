import express from "express";
import { auth } from "../middleware/auth.js";
import { roleCheck } from "../middleware/role.js";
import { selfieUpload } from "../middleware/upload.js";
import { checkProjectAccess } from "../middleware/projectAccess.js";
import { getAdminLabourAttendance } from "../controllers/adminAttendanceController.js";

import {
    markLabourAttendance,
    markBulkLabourAttendance,
    punchInLabour,
    punchOutLabour,
    approveLabourAttendance,
    approveBulkLabourAttendance,
    rejectLabourAttendance,
    getPendingLabourAttendance,
    getLabourAttendanceRecords,
    getLaboursByProject,
    getLabourTodayStatus,
    getTodaysPresentLabours,
} from "../controllers/labourAttendanceController.js";

import {
    markEmployeeAttendance,
    markBulkEmployeeAttendance,
    approveEmployeeAttendance,
    getPendingEmployeeAttendance,
    getEmployeeList,
    getEmployeeAttendanceByDate,
    employeePunchOut,
    getMyAttendance,
} from "../controllers/employeeAttendanceController.js";

import {
    getTodayAttendanceReport,
    getProjectSummaryReport,
    getMonthlyAttendanceReport,
} from "../controllers/attendanceReportController.js";

const router = express.Router();

/* ------------------------ LABOUR ATTENDANCE -------------------------- */

// Admin: all projects workforce view
router.get(
    "/labour/admin-workforce",
    auth,
    roleCheck("admin"),
    getAdminLabourAttendance
);

// Marking screen: assigned labours + today's state (Not Marked / Punched In / Completed)
router.get(
    "/labour/today-status",
    auth,
    roleCheck("admin", "manager", "supervisor"),
    checkProjectAccess(),
    getLabourTodayStatus
);

// --- Step 1: supervisor / manager marks attendance ---
router.post(
    "/labour/punch-in",
    auth,
    roleCheck("supervisor", "manager"),
    selfieUpload.single("selfie"), // optional photo
    checkProjectAccess(),
    punchInLabour
);

router.post(
    "/labour/punch-out",
    auth,
    roleCheck("supervisor", "manager"),
    checkProjectAccess(),
    punchOutLabour
);

// manual: Absent / Half-Day / manual Present
router.post(
    "/labour/mark",
    auth,
    roleCheck("supervisor", "manager"),
    checkProjectAccess(),
    markLabourAttendance
);

router.post(
    "/labour/mark-bulk",
    auth,
    roleCheck("supervisor", "manager"),
    checkProjectAccess(),
    markBulkLabourAttendance
);

// --- Step 2: ADMIN approves / rejects ---
router.post(
    "/labour/approve",
    auth,
    roleCheck("admin"),
    approveLabourAttendance
);

router.post(
    "/labour/approve-bulk",
    auth,
    roleCheck("admin"),
    approveBulkLabourAttendance
);

router.post(
    "/labour/reject",
    auth,
    roleCheck("admin"),
    rejectLabourAttendance
);

// --- Views (admin: all, manager / supervisor: own projects) ---
router.get(
    "/labour/pending",
    auth,
    roleCheck("admin", "manager", "supervisor"),
    getPendingLabourAttendance
);

router.get(
    "/labour/records",
    auth,
    roleCheck("admin", "manager", "supervisor"),
    getLabourAttendanceRecords
);

router.get(
    "/labour/list",
    auth,
    roleCheck("admin", "manager", "supervisor"),
    checkProjectAccess(),
    getLaboursByProject
);

router.get(
    "/TodaysPresentLabours/list",
    auth,
    roleCheck("admin", "manager", "supervisor"),
    getTodaysPresentLabours
);

/* ------------------------- EMPLOYEE ATTENDANCE ------------------------ */

router.post(
    "/employee/mark",
    auth,
    roleCheck("admin", "manager", "supervisor", "storekeeper", "accountant", "operator"),
    selfieUpload.single("selfie"),
    markEmployeeAttendance
);

router.post(
    "/employee/mark-bulk",
    auth,
    roleCheck("admin", "manager", "supervisor"),
    markBulkEmployeeAttendance
);

router.post(
    "/employee/approve",
    auth,
    roleCheck("admin", "manager"),
    approveEmployeeAttendance
);

router.get(
    "/employee/list",
    auth,
    roleCheck("admin", "manager", "supervisor"),
    getEmployeeList
);

// ?date=2025-12-03
router.get(
    "/employee/by-date",
    auth,
    roleCheck("admin", "manager", "supervisor"),
    getEmployeeAttendanceByDate
);

router.get("/employee/my", auth, getMyAttendance);

router.get(
    "/employee/pending",
    auth,
    roleCheck("admin", "manager"),
    getPendingEmployeeAttendance
);

router.post(
    "/employee/punch-out",
    auth,
    roleCheck("admin", "manager", "supervisor", "storekeeper", "accountant", "operator"),
    employeePunchOut
);

/* ----------------------------- REPORTS ------------------------------- */

router.get(
    "/reports/today/:projectId",
    auth,
    roleCheck("admin", "manager", "supervisor"),
    checkProjectAccess("projectId"),
    getTodayAttendanceReport
);

router.get(
    "/reports/summary/:projectId",
    auth,
    roleCheck("admin", "manager", "supervisor"),
    checkProjectAccess("projectId"),
    getProjectSummaryReport
);

router.get(
    "/reports/monthly/:projectId",
    auth,
    roleCheck("admin", "manager", "supervisor"),
    checkProjectAccess("projectId"),
    getMonthlyAttendanceReport
);

export default router;