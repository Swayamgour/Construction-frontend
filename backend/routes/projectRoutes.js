import express from "express";
import {
    createProject,
    assignManager,
    getAllProjects,
    getProjectById,
    deleteProject,
    getManagerProjects,
    assignSupervisor,
    assignLabour,
    getSupervisorProjects,
    updateProject,
    getMyProjects
} from "../controllers/projectController.js";

import { auth } from "../middleware/auth.js";
import { roleCheck } from "../middleware/role.js";
import upload from "../middleware/upload.js";


const router = express.Router();

// CREATE PROJECT (admin only)
// router.post("/create", auth, roleCheck("admin"), createProject);
router.post(
    "/create",
    auth,
    roleCheck("admin"),
    upload.fields([
        { name: "workOrderFile" },
        { name: "siteLayoutFile" },
        { name: "drawingsFile" },
        { name: "clientKycFile" },
        { name: "projectPhotosFile" },
        { name: "notesFile" },
    ]),
    createProject
);


// UPDATE PROJECT (admin + manager)
router.put("/update/:id", auth, roleCheck("admin", "manager"), updateProject);

// ASSIGN MANAGER (admin only)
router.post("/assign-manager", auth, roleCheck("admin"), assignManager);

// OPTIONAL (manager or admin)
router.get("/", auth, roleCheck("admin", "manager", "supervisor"), getAllProjects);

// Get Manager Projects
router.get("/my-projects", auth, getManagerProjects);

// Get Supervisor Projects
router.get("/my-supervisor-projects", auth, getSupervisorProjects);

router.get("/assign/my", auth, getMyProjects);


// GET SINGLE PROJECT
router.get("/:id", auth, getProjectById);

// DELETE PROJECT (admin only)
router.delete("/:id", auth, roleCheck("admin"), deleteProject);

// ASSIGN SUPERVISOR
router.post(
    "/assign-supervisor",
    auth,
    roleCheck("admin", "manager"),
    assignSupervisor
);

// ASSIGN LABOUR


export default router;
