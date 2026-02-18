import express from "express";
import { auth } from "../middleware/auth.js";
import { roleCheck } from "../middleware/role.js";
import upload from "../middleware/upload.js";

import {
    markLabourAttendance,
    markBulkLabourAttendance,
    approveLabourAttendance,
    getPendingLabourAttendance,
    getLaboursByProject,
    getTodaysPresentLabours
} from "../controllers/labourAttendanceController.js";

import {
    markEmployeeAttendance,
    markBulkEmployeeAttendance,
    approveEmployeeAttendance,
    getPendingEmployeeAttendance,
    getEmployeeList,
    getEmployeeAttendanceByDate,
    employeePunchOut,
    getMyAttendance
} from "../controllers/employeeAttendanceController.js";

import {
    getTodayAttendanceReport,
    getProjectSummaryReport,
    getMonthlyAttendanceReport
} from "../controllers/attendanceReportController.js";

const router = express.Router();

/* ------------------------ LABOUR ATTENDANCE -------------------------- */

router.post(
    "/labour/mark",
    auth,
    roleCheck("supervisor", "manager"),
    markLabourAttendance
);

router.post(
    "/labour/mark-bulk",
    auth,
    roleCheck("supervisor", "manager"),
    markBulkLabourAttendance
);

router.post(
    "/labour/approve",
    auth,
    roleCheck("manager", "admin"),
    approveLabourAttendance
);

router.get(
    "/labour/pending",
    auth,
    roleCheck("manager", "admin"),
    getPendingLabourAttendance
);

router.get(
    "/labour/list",
    auth,
    roleCheck("admin", "manager", "supervisor"),
    getLaboursByProject
);

router.get(
    "/TodaysPresentLabours/list",
    auth,
    roleCheck("admin", "manager", "supervisor"),
    getTodaysPresentLabours
);


/* ------------------------- EMPLOYEE ATTENDANCE ------------------------ */



// router.post(
//     "/employee/mark",
//     auth,
//     roleCheck("admin", "manager", "supervisor"),
//     // upload.memory.single("selfie"),   // <<--- IMPORTANT
//     upload.disk.single("selfie"),
//     markEmployeeAttendance
// );

router.post(
    "/employee/mark",
    auth,
    upload.single("selfie"),
    markEmployeeAttendance
);




// optional bulk employee marking (admin/manager)
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

// get attendance by query date ?date=2025-12-03
router.get(
    "/employee/by-date",
    auth,
    roleCheck("admin", "manager", "supervisor"),
    getEmployeeAttendanceByDate
);

router.get("/employee/my", auth, getMyAttendance);


// pending employee approvals
router.get(
    "/employee/pending",
    auth,
    roleCheck("admin", "manager"),
    getPendingEmployeeAttendance
);

// employee punch-out (updates today's record)
router.post(
    "/employee/punch-out",
    auth,
    roleCheck("employee", "admin", "manager", "supervisor"),
    employeePunchOut
);


/* ----------------------------- REPORTS ------------------------------- */

router.get(
    "/reports/today/:projectId",
    auth,
    getTodayAttendanceReport
);

router.get(
    "/reports/summary/:projectId",
    auth,
    getProjectSummaryReport
);

router.get(
    "/reports/monthly/:projectId",
    auth,
    getMonthlyAttendanceReport
);

export default router;
