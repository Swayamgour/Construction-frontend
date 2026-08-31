import express from "express";
import { auth } from "../middleware/auth.js";
import { roleCheck } from "../middleware/role.js";
import { uploadValidated } from "../middleware/uploadValidated.js";

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
} from "../controllers/machineOperatorController.js";

import {
    reportMaintenance,
    updateMaintenanceStatus,
    getUpcomingMaintenance,
    getFullMaintenanceHistory,
} from "../controllers/maintenanceController.js";

const router = express.Router();

/* ------------------------------ REQUESTS -------------------------------- */
router.post(
    "/requests",
    auth,
    roleCheck("admin", "manager", "supervisor"),
    uploadValidated.fields([{ name: "attachments", maxCount: 4 }]),
    createMachineRequest
);
router.get("/requests", auth, roleCheck("admin", "manager", "supervisor"), listMachineRequests);
router.get("/requests/:id/history", auth, roleCheck("admin", "manager", "supervisor"), getMachineRequestHistory);
router.patch("/requests/:id/approve", auth, roleCheck("admin"), approveMachineRequest);
router.patch("/requests/:id/reject", auth, roleCheck("admin"), rejectMachineRequest);
router.patch("/requests/:id/allocate", auth, roleCheck("admin"), allocateMachineRequest);
router.patch("/requests/:id/dispatch", auth, roleCheck("admin"), dispatchMachineRequest);
router.patch("/requests/:id/receive", auth, roleCheck("admin", "manager", "supervisor"), receiveMachineAtSite);
router.patch("/requests/:id/release", auth, roleCheck("admin", "manager"), releaseMachineRequest);

/* ------------------------------ DOCUMENTS -------------------------------- */
router.post("/:id/documents", auth, roleCheck("admin", "manager"), uploadValidated.single("file"), addMachineDocument);
router.get("/:id/documents", auth, roleCheck("admin", "manager", "supervisor", "operator"), listMachineDocuments);
router.patch("/documents/:docId/verify", auth, roleCheck("admin", "manager"), verifyMachineDocument);
router.get("/documents/expiring", auth, roleCheck("admin", "manager"), getExpiringDocuments);

/* ------------------------------ OPERATOR LOGS ----------------------------- */
router.post("/:id/operator", auth, roleCheck("admin", "manager", "supervisor", "operator"), logMachineOperatorDay);
router.get("/:id/operator-logs", auth, roleCheck("admin", "manager", "supervisor"), listMachineOperatorLogs);
router.patch("/operator-logs/:logId/approve", auth, roleCheck("admin", "manager"), approveOperatorLog);

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

export default router;
