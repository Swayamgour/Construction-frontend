import express from "express";
import { auth } from "../middleware/auth.js";
import { roleCheck } from "../middleware/role.js";
import upload from "../middleware/upload.js";
import { checkProjectAccess } from "../middleware/projectAccess.js";
import Attendance from "../models/Attendance.js";

// approveLabourAttendance takes attendanceId in the body, not params —
// resolve the record's projectId from there before checking access.
const approveAttendanceProject = async (req) => {
    const { attendanceId } = req.body || {};
    if (!attendanceId) return null;
    const record = await Attendance.findById(attendanceId).select("projectId");
    return record?.projectId || null;
};

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

router.post(
    "/labour/approve",
    auth,
    roleCheck("manager", "admin"),
    checkProjectAccess(approveAttendanceProject),
    approveLabourAttendance
);

router.get(
    "/labour/pending",
    auth,
    roleCheck("manager", "admin"),
    checkProjectAccess(),
    getPendingLabourAttendance
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
    checkProjectAccess(),
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
    roleCheck("admin", "manager", "supervisor", "storekeeper", "accountant", "operator"),
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
    roleCheck("admin", "manager", "supervisor", "storekeeper", "accountant", "operator"),
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
