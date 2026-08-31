import express from "express";
import {
    addVendor,
    updateVendor,
    getAllVendors,
    assignItemsToVendor,
    assignItemsWithDetails,
    getVendorDetails
} from "../controllers/vendorController.js";

import { auth } from "../middleware/auth.js";
import { roleCheck } from "../middleware/role.js";
import upload from "../middleware/upload.js";

const router = express.Router();

router.get("/all", auth, roleCheck("admin", "manager", "supervisor", "storekeeper", "accountant"), getAllVendors);

// 🔒 Vendor onboarding (KYC docs) — restricted to admin/manager/accountant
router.post(
    "/add",
    auth,
    roleCheck("admin", "manager", "accountant"),
    upload.fields([
        { name: "aadhaarCardFile" },
        { name: "panCardFile" }
    ]),
    addVendor
);

router.post("/assign-items", auth, roleCheck("admin", "manager", "storekeeper"), assignItemsToVendor);

router.put(
    "/:id",
    auth,
    roleCheck("admin", "manager", "accountant"),
    upload.fields([
        { name: "aadhaarCardFile" },
        { name: "panCardFile" }
    ]),
    updateVendor
);

router.post("/assign-items-details", auth, roleCheck("admin", "manager", "storekeeper"), assignItemsWithDetails);

router.get("/:id", auth, roleCheck("admin", "manager", "accountant", "storekeeper"), getVendorDetails);

export default router;
