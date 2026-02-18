import express from "express";
import { auth } from "../middleware/auth.js";
import { roleCheck } from "../middleware/role.js";
import {
    markEmployeeAttendance,
    approveEmployeeAttendance,
    getPendingEmployeeAttendance,
    markBulkEmployeeAttendance,
    getAllEmployees
} from "../controllers/employeeAttendanceController.js";

const router = express.Router();

// Mark attendance
router.post("/mark",
    auth,
    roleCheck("admin", "manager", "supervisor"),
    markEmployeeAttendance
);

// Bulk attendance
router.post("/mark-bulk",
    auth,
    roleCheck("admin", "manager"),
    markBulkEmployeeAttendance
);

// Approve attendance
router.post("/approve",
    auth,
    roleCheck("manager", "admin"),
    approveEmployeeAttendance
);

// Pending approvals
router.get("/pending",
    auth,
    roleCheck("manager", "admin"),
    getPendingEmployeeAttendance
);

// All employees list
router.get("/employees",
    auth,
    roleCheck("admin", "manager", "supervisor"),
    getAllEmployees
);

export default router;
