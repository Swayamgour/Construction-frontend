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
    getMyProjects,
} from "../controllers/projectController.js";

import { auth } from "../middleware/auth.js";
import { roleCheck } from "../middleware/role.js";
import { checkProjectAccess } from "../middleware/projectAccess.js";
import upload from "../middleware/upload.js";

import mongoose from "mongoose";
import User from "../models/User.js";
import Project from "../models/Project.js";

const router = express.Router();

const isValidObjectId = (id) => {
    return mongoose.Types.ObjectId.isValid(id);
};
/**
 * ============================================================
 * PROJECT FILE UPLOAD CONFIGURATION
 * ============================================================
 *
 * Frontend must send exactly these field names.
 *
 * Multiple files are supported for every field.
 */
const projectFileFields = [
    {
        name: "workOrderFile",
        maxCount: 20,
    },
    {
        name: "siteLayoutFile",
        maxCount: 20,
    },
    {
        name: "drawingsFile",
        maxCount: 20,
    },
    {
        name: "clientKycFile",
        maxCount: 20,
    },
    {
        name: "projectPhotosFile",
        maxCount: 50,
    },
    {
        name: "notesFile",
        maxCount: 20,
    },
];


/**
 * ============================================================
 * CREATE PROJECT
 * ============================================================
 *
 * Only admin can create project.
 *
 * multer must execute BEFORE createProject controller.
 */
router.post(
    "/create",
    auth,
    roleCheck("admin"),
    upload.fields(projectFileFields),
    createProject
);


/**
 * ============================================================
 * UPDATE PROJECT
 * ============================================================
 *
 * Admin + Manager can update.
 *
 * Existing files are preserved by controller.
 * New files are appended.
 */
router.put(
    "/update/:id",
    auth,
    roleCheck("admin", "manager"),
    upload.fields(projectFileFields),
    updateProject
);


/**
 * ============================================================
 * ASSIGN MANAGER
 * ============================================================
 *
 * Admin only.
 */
router.post(
    "/assign-manager",
    auth,
    roleCheck("admin"),
    assignManager
);


/**
 * ============================================================
 * GET ALL PROJECTS
 * ============================================================
 *
 * Admin:
 *   all projects
 *
 * Manager:
 *   only own projects
 *
 * Supervisor:
 *   projects where supervisor is assigned
 */
router.get(
    "/",
    auth,
    roleCheck("admin", "manager", "supervisor"),
    getAllProjects
);


/**
 * ============================================================
 * MANAGER PROJECTS
 * ============================================================
 */
router.get(
    "/my-projects",
    auth,
    roleCheck("manager"),
    getManagerProjects
);


/**
 * ============================================================
 * SUPERVISOR PROJECTS
 * ============================================================
 */
router.get(
    "/my-supervisor-projects",
    auth,
    roleCheck("supervisor"),
    getSupervisorProjects
);


/**
 * ============================================================
 * CURRENT USER PROJECTS
 * ============================================================
 *
 * Admin / Manager / Supervisor
 */
router.get(
    "/assign/my",
    auth,
    roleCheck("admin", "manager", "supervisor"),
    getMyProjects
);


/**
 * ============================================================
 * ASSIGN SUPERVISOR
 * ============================================================
 *
 * Admin + Manager.
 */
router.post(
    "/assign-supervisor",
    auth,
    roleCheck("admin", "manager"),
    assignSupervisor
);


/**
 * ============================================================
 * ASSIGN LABOUR
 * ============================================================
 *
 * Admin + Manager + Supervisor.
 */
router.post(
    "/assign-labour",
    auth,
    roleCheck("admin", "manager", "supervisor"),
    assignLabour
);


/**
 * ============================================================
 * GET SINGLE PROJECT
 * ============================================================
 *
 * Access is checked by projectAccess middleware.
 */
router.get(
    "/:id",
    auth,
    checkProjectAccess("id"),
    getProjectById
);


/**
 * ============================================================
 * DELETE PROJECT
 * ============================================================
 *
 * Admin only.
 */
router.delete(
    "/:id",
    auth,
    roleCheck("admin"),
    deleteProject
);


export default router;