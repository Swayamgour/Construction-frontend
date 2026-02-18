import express from "express";
import {
    registerUser,
    loginUser,
    getAllUser,
    addLabour,
    getManagersAndSupervisors,
    getManagerDetails,
    getLabours,
    getLaboursById,
    updateUserStatus
} from "../controllers/authController.js";

// import { registerUser } from "../controllers/authController.js";
import { auth } from "../middleware/auth.js";
import { roleCheck } from "../middleware/role.js";
import User from "../models/User.js";

import Attendance from "../models/Attendance.js";


const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

router.post(
    "/create-user",
    auth,
    roleCheck("admin"),
    registerUser
);

// router.get("/", auth, getAllUser)

router.get(
    "/managers-supervisors",
    auth,
    roleCheck("admin", "manager", "supervisor"),
    getManagersAndSupervisors
);


router.put(
    "/update-status",
    auth,
    roleCheck("admin", "manager", "supervisor"),
    updateUserStatus
);


router.get("/", auth, roleCheck("admin"), getAllUser);


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

router.get("/check-login", auth, (req, res) => {
    res.json({
        success: true,
        message: "Token is valid",
        user: req.user
    });
});


// import User from "../models/User.js"; // 👈 add this

router.get(
    "/me",
    auth,
    roleCheck("admin", "manager", "supervisor", "labour"),
    async (req, res) => {
        try {
            const user = await User.findById(req.user.id).select("-password");
            // console.log(req.user)

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
    }
);



export default router;
