import express from "express";
import upload from "../middleware/upload.js";
import {
  addMachine,
  getAllMachines,
  getMachineDetails
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
   MACHINE ADD WITH MULTIPLE FILES (CLOUD)
-------------------------------------------- */
router.post(
  "/add",
  upload.fields([
    { name: "photo", maxCount: 1 },
    { name: "rcFile", maxCount: 1 },
    { name: "insuranceFile", maxCount: 1 }
  ]),
  addMachine
);

// upload.fields([
//   { name: "photo", maxCount: 1 },
//   { name: "rcFile", maxCount: 1 },
//   { name: "insuranceFile", maxCount: 1 }
// ])


/* -------------------------------------------
   MACHINE GET ROUTES
-------------------------------------------- */
router.get("/all", getAllMachines);
router.get("/:id", getMachineDetails);

/* -------------------------------------------
   MAINTENANCE
-------------------------------------------- */
router.post(
  "/maintenance/add",
  upload.single("billFile"),
  addMaintenance
);
router.get("/:machineId/maintenance", getMaintenanceHistory);

/* -------------------------------------------
   DAILY USAGE
-------------------------------------------- */
router.post("/usage", upsertDailyUsage);
router.get("/usage", getDailyUsage);

export default router;
