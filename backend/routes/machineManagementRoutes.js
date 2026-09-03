import express from "express";
import { auth } from "../middleware/auth.js";
import { roleCheck } from "../middleware/role.js";
import { uploadValidated } from "../middleware/uploadValidated.js";
import { checkProjectAccess, resolveProjectFrom } from "../middleware/projectAccess.js";
import MachineRequest from "../models/MachineRequest.js";
import MachineAssignment from "../models/MachineAssignment.js";

import {
    createMachineRequest,
    listMachineRequests,
    approveMachineRequest,
    rejectMachineRequest,
    allocateMachineRequest,
    dispatchMachineRequest,
    receiveMachineAtSite,
    releaseMachineRequest,
    getMachineRequestHistory,
} from "../controllers/machineRequestController.js";

import {
    addMachineDocument,
    listMachineDocuments,
    verifyMachineDocument,
    getExpiringDocuments,
} from "../controllers/machineDocumentController.js";

import {
    logMachineOperatorDay,
    listMachineOperatorLogs,
    approveOperatorLog,
    assignOperatorToMachine,
    changeOperator,
    removeOperator,
    getOperatorAssignmentHistory,
} from "../controllers/machineOperatorController.js";

import {
    reportMaintenance,
    updateMaintenanceStatus,
    getUpcomingMaintenance,
    getMeterBasedMaintenanceDue,
    getFullMaintenanceHistory,
} from "../controllers/maintenanceController.js";

const router = express.Router();

// /requests/:id/* only carry the MachineRequest's own _id — resolve its
// projectId before checking access. (roleCheck("admin") routes below
// don't strictly need this, since admins bypass checkProjectAccess
// anyway, but it's included so a future role change to those routes
// doesn't silently reopen the gap.)
const machineRequestProject = resolveProjectFrom(MachineRequest, { param: "id", field: "projectId" });
// MachineAssignment.projectId is stored as a String (ObjectId text) —
// resolveProjectFrom() works fine for that; a resolver is used here (not
// the plain string form) because the assignment's own _id, not a
// projectId, is what's in the URL.
const machineAssignmentProject = resolveProjectFrom(MachineAssignment, { param: "assignmentId", field: "projectId" });

/* ------------------------------ REQUESTS -------------------------------- */
router.post(
    "/requests",
    auth,
    roleCheck("admin", "manager", "supervisor"),
    checkProjectAccess(),
    uploadValidated.fields([{ name: "attachments", maxCount: 4 }]),
    createMachineRequest
);
router.get("/requests", auth, roleCheck("admin", "manager", "supervisor"), listMachineRequests);
router.get("/requests/:id/history", auth, roleCheck("admin", "manager", "supervisor"), checkProjectAccess(machineRequestProject), getMachineRequestHistory);
router.patch("/requests/:id/approve", auth, roleCheck("admin"), checkProjectAccess(machineRequestProject), approveMachineRequest);
router.patch("/requests/:id/reject", auth, roleCheck("admin"), checkProjectAccess(machineRequestProject), rejectMachineRequest);
router.patch("/requests/:id/allocate", auth, roleCheck("admin"), checkProjectAccess(machineRequestProject), allocateMachineRequest);
router.patch("/requests/:id/dispatch", auth, roleCheck("admin"), checkProjectAccess(machineRequestProject), dispatchMachineRequest);
router.patch("/requests/:id/receive", auth, roleCheck("admin", "manager", "supervisor"), checkProjectAccess(machineRequestProject), receiveMachineAtSite);
router.patch("/requests/:id/release", auth, roleCheck("admin", "manager"), checkProjectAccess(machineRequestProject), releaseMachineRequest);

/* ------------------------------ DOCUMENTS -------------------------------- */
router.post("/:id/documents", auth, roleCheck("admin", "manager"), uploadValidated.single("file"), addMachineDocument);
router.get("/:id/documents", auth, roleCheck("admin", "manager", "supervisor", "operator"), listMachineDocuments);
router.patch("/documents/:docId/verify", auth, roleCheck("admin", "manager"), verifyMachineDocument);
router.get("/documents/expiring", auth, roleCheck("admin", "manager"), getExpiringDocuments);

/* ------------------------------ OPERATOR LOGS ----------------------------- */
router.post("/:id/operator", auth, roleCheck("admin", "manager", "supervisor", "operator"), logMachineOperatorDay);
router.get("/:id/operator-logs", auth, roleCheck("admin", "manager", "supervisor"), listMachineOperatorLogs);
router.patch("/operator-logs/:logId/approve", auth, roleCheck("admin", "manager"), approveOperatorLog);

/* ---------------------- OPERATOR ASSIGNMENT LIFECYCLE -------------------- */
router.post("/assignments/:assignmentId/operator", auth, roleCheck("admin", "manager"), checkProjectAccess(machineAssignmentProject), assignOperatorToMachine);
router.patch("/assignments/:assignmentId/operator/change", auth, roleCheck("admin", "manager"), checkProjectAccess(machineAssignmentProject), changeOperator);
router.patch("/assignments/:assignmentId/operator/remove", auth, roleCheck("admin", "manager"), checkProjectAccess(machineAssignmentProject), removeOperator);
router.get("/assignments/:assignmentId/operator/history", auth, roleCheck("admin", "manager", "supervisor"), checkProjectAccess(machineAssignmentProject), getOperatorAssignmentHistory);

/* ------------------------------ MAINTENANCE ------------------------------- */
router.post(
    "/:id/maintenance",
    auth,
    roleCheck("admin", "manager", "supervisor"),
    uploadValidated.fields([{ name: "beforeImages", maxCount: 4 }, { name: "afterImages", maxCount: 4 }, { name: "invoice", maxCount: 1 }]),
    reportMaintenance
);
router.get("/:id/maintenance/full", auth, roleCheck("admin", "manager", "supervisor", "operator"), getFullMaintenanceHistory);
router.patch("/maintenance/:id/status", auth, roleCheck("admin", "manager"), updateMaintenanceStatus);
router.get("/maintenance/upcoming", auth, roleCheck("admin", "manager"), getUpcomingMaintenance);
router.get("/maintenance/meter-due", auth, roleCheck("admin", "manager"), getMeterBasedMaintenanceDue);

export default router;
