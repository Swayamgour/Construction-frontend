import express from "express";
import {
    addVendor,
    getAllVendors,
    assignItemsToVendor,
    assignItemsWithDetails,
    getVendorDetails
} from "../controllers/vendorController.js";

import { auth } from "../middleware/auth.js";
import { roleCheck } from "../middleware/role.js";
import upload from "../middleware/upload.js";

const router = express.Router();

router.get("/all", auth, roleCheck("admin", "manager", "supervisor"), getAllVendors);

// router.post("/add", auth, roleCheck("admin", "manager"), addVendor);

router.post(
    "/add",
    auth,
    upload.fields([
        { name: "aadhaarCardFile" },
        { name: "panCardFile" }
    ]),
    addVendor
);


router.post("/assign-items", auth, roleCheck("admin", "manager"), assignItemsToVendor);

router.post("/assign-items-details", auth, roleCheck("admin", "manager"), assignItemsWithDetails);

router.get("/:id", auth, roleCheck("admin", "manager"), getVendorDetails);

export default router;
