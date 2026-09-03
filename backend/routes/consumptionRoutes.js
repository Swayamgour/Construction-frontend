import express from "express";
import { auth } from "../middleware/auth.js";
import { roleCheck } from "../middleware/role.js";
import { checkProjectAccess } from "../middleware/projectAccess.js";

import {
    addConsumptionMultiple,
    getTodayConsumption,
    getProjectConsumption,
    filterConsumption
} from "../controllers/consumptionController.js";

const router = express.Router();

// Add multiple items at once
router.post("/add-multiple", auth, roleCheck("manager", "supervisor", "admin"), checkProjectAccess(), addConsumptionMultiple);

// Today report
router.get("/today", auth, getTodayConsumption);

// Project-wise report
router.get("/project/:projectId", auth, checkProjectAccess("projectId"), getProjectConsumption);

// Filter (today/week/month)
router.get("/filter", auth, checkProjectAccess("projectId"), filterConsumption);

export default router;
