import express from "express";
import upload from "../middleware/upload.js";
import { auth } from "../middleware/auth.js";
import { roleCheck } from "../middleware/role.js";
import {
  addMachine,
  getAllMachines,
  getMachineDetails,
  updateMachine,
  deleteMachine,
  getMachineDashboardStats,
} from "../controllers/machineController.js";

import {
  addMaintenance,
  getMaintenanceHistory
} from "../controllers/maintenanceController.js";

const router = express.Router();

/* -------------------------------------------
   MACHINE ADD WITH MULTIPLE FILES (CLOUD)
-------------------------------------------- */
router.post(
  "/add",
  auth,
  roleCheck("admin", "manager"),
  upload.fields([
    { name: "photo", maxCount: 1 },
    { name: "rcFile", maxCount: 1 },
    { name: "insuranceFile", maxCount: 1 }
  ]),
  addMachine
);

/* -------------------------------------------
   MACHINE DASHBOARD STATS
-------------------------------------------- */
router.get(
  "/dashboard/stats",
  auth,
  roleCheck("admin", "manager", "supervisor"),
  getMachineDashboardStats
);

/* -------------------------------------------
   MACHINE GET ROUTES (any logged-in staff can view)
-------------------------------------------- */
router.get(
  "/all",
  auth,
  roleCheck("admin", "manager", "supervisor", "operator"),
  getAllMachines
);

router.get(
  "/:id",
  auth,
  roleCheck("admin", "manager", "supervisor", "operator"),
  getMachineDetails
);

/* -------------------------------------------
   MACHINE UPDATE / DELETE
-------------------------------------------- */
router.put(
  "/:id",
  auth,
  roleCheck("admin", "manager"),
  upload.fields([
    { name: "photo", maxCount: 1 },
    { name: "rcFile", maxCount: 1 },
    { name: "insuranceFile", maxCount: 1 }
  ]),
  updateMachine
);

router.delete(
  "/:id",
  auth,
  roleCheck("admin"),
  deleteMachine
);

/* -------------------------------------------
   MAINTENANCE (admin/manager log service, all can view)
-------------------------------------------- */
router.post(
  "/maintenance/add",
  auth,
  roleCheck("admin", "manager"),
  upload.single("billFile"),
  addMaintenance
);

router.get(
  "/:machineId/maintenance",
  auth,
  roleCheck("admin", "manager", "supervisor", "operator"),
  getMaintenanceHistory
);

export default router;
