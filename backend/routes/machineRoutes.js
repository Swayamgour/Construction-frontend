import express from "express";
import upload from "../middleware/upload.js";
import { auth } from "../middleware/auth.js";
import { roleCheck } from "../middleware/role.js";
import {
  addMachine,
  getAllMachines,
  getMachineDetails,
  updateMachine,
  deleteMachine
} from "../controllers/machineController.js";

import {
  addMaintenance,
  getMaintenanceHistory
} from "../controllers/maintenanceController.js";

import {
  upsertDailyUsage,
  getDailyUsage
} from "../controllers/usageController.js";

const router = express.Router();

/* -------------------------------------------
   🔒 SECURITY FIX: is poori file me pehle koi
   `auth` middleware hi nahi tha — matlab bina
   login kiye bhi machine add/view/maintenance
   sab kuch access ho sakta tha. Ab har route
   auth + role protected hai.
-------------------------------------------- */

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
   MACHINE UPDATE / DELETE — added to close a frontend gap
   (Add/Edit Machine form had no matching backend route before this).
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

/* -------------------------------------------
   DAILY USAGE (operator logs their own machine usage)
-------------------------------------------- */
router.post(
  "/usage",
  auth,
  roleCheck("admin", "manager", "supervisor", "operator"),
  upsertDailyUsage
);

router.get(
  "/usage",
  auth,
  roleCheck("admin", "manager", "supervisor", "operator"),
  getDailyUsage
);

export default router;
