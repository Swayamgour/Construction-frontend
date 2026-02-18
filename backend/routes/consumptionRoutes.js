import express from "express";
import { auth } from "../middleware/auth.js";
import { roleCheck } from "../middleware/role.js";

import {
    addConsumptionMultiple,
    getTodayConsumption,
    getProjectConsumption,
    filterConsumption
} from "../controllers/consumptionController.js";

const router = express.Router();

// Add multiple items at once
router.post("/add-multiple", auth, roleCheck("manager", "supervisor", "admin"), addConsumptionMultiple);

// Today report
router.get("/today", auth, getTodayConsumption);

// Project-wise report
router.get("/project/:projectId", auth, getProjectConsumption);

// Filter (today/week/month)
router.get("/filter", auth, filterConsumption);

export default router;
