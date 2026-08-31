import express from "express";
import {
    addMaterialRequest,
    getMaterialRequests,
    getPendingRequests,
    approveMaterialRequest,
    rejectMaterialRequest,
    getPurchaseOrder,
    getSingleMaterialRequest
} from "../controllers/materialRequestController.js";
import { auth } from "../middleware/auth.js";
import { roleCheck } from "../middleware/role.js";

const router = express.Router();

// Supervisor raises material request, manager/admin can too
router.post("/add", auth, roleCheck("supervisor", "manager", "admin"), addMaterialRequest);

// Admin + manager + supervisor + storekeeper can view all requests
router.get("/all", auth, roleCheck("manager", "admin", "supervisor", "storekeeper"), getMaterialRequests);

router.get("/pending", auth, roleCheck("manager", "admin"), getPendingRequests);

router.put("/approve/:id", auth, roleCheck("manager", "admin"), approveMaterialRequest);

router.put("/reject/:id", auth, roleCheck("manager", "admin"), rejectMaterialRequest);

// Purchase order generated from an approved request — accountant needs this for payment processing
router.get("/po/:id", auth, roleCheck("manager", "admin", "supervisor", "storekeeper", "accountant"), getPurchaseOrder);

router.get("/material-request/:id", auth, roleCheck("manager", "admin", "supervisor", "storekeeper"), getSingleMaterialRequest);

export default router;
