import express from "express";
import {
    registerUser,
    createUserByAdmin,
    loginUser,
    getAllUser,
    addLabour,
    updateLabour,
    getManagersAndSupervisors,
    getManagerDetails,
    getLabours,
    getLaboursById,
    updateUserStatus,
    deleteUser
} from "../controllers/authController.js";

import { auth } from "../middleware/auth.js";
import { roleCheck } from "../middleware/role.js";
import User from "../models/User.js";

const router = express.Router();

/* --------------------------- PUBLIC ROUTES --------------------------- */
// Public self-signup — role is ALWAYS forced to "labour" inside the controller.
router.post("/register", registerUser);
router.post("/login", loginUser);

/* ------------------------- ADMIN ONLY ROUTES -------------------------- */
// Only admin can create privileged users (manager/supervisor/storekeeper/accountant/operator/admin)
router.post("/create-user", auth, roleCheck("admin"), createUserByAdmin);

router.get("/", auth, roleCheck("admin"), getAllUser);

router.delete("/delete-user/:id", auth, roleCheck("admin"), deleteUser);

/* --------------------- ADMIN + MANAGER + SUPERVISOR -------------------- */
router.get(
    "/managers-supervisors",
    auth,
    roleCheck("admin", "manager", "supervisor"),
    getManagersAndSupervisors
);

// Activate/deactivate a user account. Kept broad (admin/manager/supervisor)
// to match existing app behaviour, but supervisor should only ever be
// toggling labour under their own site in the frontend.
router.put(
    "/update-status",
    auth,
    roleCheck("admin", "manager"),
    updateUserStatus
);

router.get(
    "/manager/:id",
    auth,
    roleCheck("admin", "manager", "supervisor"),
    getManagerDetails
);

router.get(
    "/labours",
    auth,
    roleCheck("admin", "manager", "supervisor"),
    getLabours
);

router.get(
    "/labours/:id",
    auth,
    roleCheck("admin", "manager", "supervisor"),
    getLaboursById
);

router.post(
    "/add-labour",
    auth,
    roleCheck("admin", "manager", "supervisor"),
    addLabour
);

router.put(
    "/labours/:id",
    auth,
    roleCheck("admin", "manager", "supervisor"),
    updateLabour
);

/* ------------------------------ SELF (ANY LOGGED-IN USER) -------------- */
router.get("/check-login", auth, (req, res) => {
    res.json({
        success: true,
        message: "Token is valid",
        user: req.user
    });
});

router.get("/me", auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        res.json({
            success: true,
            message: "User details fetched successfully",
            user,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Something went wrong",
            error: error.message,
        });
    }
});

export default router;
