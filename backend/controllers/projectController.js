import fs from "fs";
import mongoose from "mongoose";
import Project from "../models/Project.js";
import User from "../models/User.js";
import { success, getPagination, buildPagination } from "../utils/apiResponse.js";
import { getOrCreateCentralGodown } from "../services/inventoryService.js";

/**
 * All attachment fields accepted by the Project API.
 * Each field can contain multiple files.
 */
const PROJECT_FILE_FIELDS = [
    "workOrderFile",
    "siteLayoutFile",
    "drawingsFile",
    "clientKycFile",
    "projectPhotosFile",
    "notesFile",
];

/**
 * Convert multer's req.files (disk storage) into the Project.files shape.
 *
 * req.files:
 * {
 *   workOrderFile: [{ filename: "123-abc.png", path: "C:\\...\\123-abc.png" }]
 * }
 *
 * result (stored in DB, served by express.static("/uploads")):
 * {
 *   workOrderFile: ["/uploads/projects/workOrderFile/123-abc.png"]
 * }
 */
const getUploadedFilePaths = (files = {}) => {
    const uploadedFiles = {};

    PROJECT_FILE_FIELDS.forEach((field) => {
        uploadedFiles[field] = (files[field] || []).map(
            (file) => `/uploads/projects/${field}/${file.filename}`
        );
    });

    return uploadedFiles;
};

/**
 * Delete files that multer already saved to disk.
 * Used when the request fails after upload, so no orphan files remain.
 */
const cleanupUploadedFiles = (files = {}) => {
    Object.values(files || {})
        .flat()
        .forEach((file) => {
            if (file?.path) {
                fs.unlink(file.path, (err) => {
                    if (err && err.code !== "ENOENT") {
                        console.error("Cleanup failed:", file.path, err.message);
                    }
                });
            }
        });
};

/**
 * Normalize existing attachment data so old records that contain a
 * single string remain compatible with the array schema.
 */
const normalizeFileArray = (value) => {
    if (!value) return [];
    if (Array.isArray(value)) return value.filter(Boolean);
    return [value];
};

const validateUserByRole = async (userId, allowedRoles, fieldName) => {
    if (!userId) return null;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error(`${fieldName} contains an invalid user ID`);
    }

    const user = await User.findById(userId).select(
        "_id name email role status"
    );

    if (!user) {
        throw new Error(`${fieldName} user not found`);
    }

    if (user.status !== true) {
        throw new Error(`${fieldName} user is inactive`);
    }

    if (!allowedRoles.includes(user.role?.toLowerCase())) {
        throw new Error(
            `${fieldName} must have role: ${allowedRoles.join(", ")}`
        );
    }

    return user;
};

/**
 * Parse multipart values.
 * supervisors / labours are sent from the frontend as JSON strings.
 */
const parseProjectBody = (body = {}) => {
    const parsed = { ...body };

    // Never accept system fields
    delete parsed._id;
    delete parsed.createdBy;
    delete parsed.createdAt;
    delete parsed.updatedAt;
    delete parsed.__v;
    delete parsed.files;

    // JSON strings -> arrays
    ["supervisors", "labours"].forEach((key) => {
        if (typeof parsed[key] === "string") {
            try {
                parsed[key] = JSON.parse(parsed[key]);
            } catch (error) {
                throw new Error(`Invalid ${key} JSON format`);
            }
        }

        parsed[key] = Array.isArray(parsed[key]) ? parsed[key] : [];

        // Object -> ID
        parsed[key] = parsed[key]
            .map((item) =>
                typeof item === "object" ? item?._id || item?.id : item
            )
            .filter(Boolean);
    });

    return parsed;
};

// ----------------------------
// CREATE PROJECT
// ----------------------------
export const createProject = async (req, res) => {
    try {
        console.log("🚀 CREATE PROJECT by:", req.user?.id);
        console.log("📁 Files:", Object.keys(req.files || {}));

        const body = parseProjectBody(req.body);

        // Validate manager
        if (body.managerId) {
            await validateUserByRole(
                body.managerId,
                ["manager"],
                "Project Manager"
            );
        }

        // Validate project in-charge
        if (body.projectIncharge) {
            await validateUserByRole(
                body.projectIncharge,
                ["supervisor"],
                "Project In-Charge"
            );
        }

        // Validate supervisors
        for (const supervisorId of body.supervisors) {
            await validateUserByRole(
                supervisorId,
                ["supervisor"],
                "Supervisor"
            );
        }

        // Validate labours
        for (const labourId of body.labours) {
            if (!mongoose.Types.ObjectId.isValid(labourId)) {
                cleanupUploadedFiles(req.files);
                return res.status(400).json({
                    message: "Invalid labour ID",
                    labourId,
                });
            }
        }

        // Validate consultant / architect
        if (body.consultantArchitect) {
            await validateUserByRole(
                body.consultantArchitect,
                ["consultant", "architect"],
                "Consultant / Architect"
            );
        }

        // Validate vendor / subcontractor
        if (body.subcontractorVendor) {
            await validateUserByRole(
                body.subcontractorVendor,
                ["vendor", "subcontractor"],
                "Subcontractor / Vendor"
            );
        }

        // Files (already saved to disk by multer)
        const uploadedFiles = getUploadedFilePaths(req.files);

        const project = await Project.create({
            ...body,
            createdBy: req.user.id,
            files: uploadedFiles,
        });

        console.log("✅ PROJECT CREATED:", project._id);

        return res.status(201).json({
            message: "Project created successfully",
            project,
        });
    } catch (error) {
        console.error("❌ CREATE PROJECT ERROR:", error);

        // Project was not created, so remove uploaded files
        cleanupUploadedFiles(req.files);

        if (error.name === "ValidationError") {
            return res.status(400).json({
                message: "Project validation failed",
                error: error.message,
            });
        }

        if (error.name === "CastError") {
            return res.status(400).json({
                message: "Invalid project data",
                field: error.path,
                value: error.value,
                error: error.message,
            });
        }

        return res.status(500).json({
            message: "Failed to create project",
            error: error.message,
        });
    }
};

// ----------------------------
// GET ALL PROJECTS
// ----------------------------
export const getAllProjects = async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;

        // Ensure Central Godown project exists
        try {
            await getOrCreateCentralGodown();
        } catch (_) {}

        const query = {};
        const conditions = [];

        if (userRole === "manager") {
            conditions.push({
                $or: [
                    { managerId: userId },
                    { isGodown: true },
                    { projectType: "Godown" },
                    { projectCode: "GODOWN-MAIN" },
                    { projectName: /Central Godown/i },
                ],
            });
        } else if (userRole === "supervisor") {
            conditions.push({
                $or: [
                    { supervisors: userId },
                    { isGodown: true },
                    { projectType: "Godown" },
                    { projectCode: "GODOWN-MAIN" },
                    { projectName: /Central Godown/i },
                ],
            });
        }

        const { page, limit, skip } = getPagination(req);
        const { search } = req.query;

        if (search) {
            conditions.push({
                $or: [
                    { projectName: { $regex: search, $options: "i" } },
                    { projectCode: { $regex: search, $options: "i" } },
                ],
            });
        }

        if (conditions.length > 0) {
            query.$and = conditions;
        }

        const [projects, total] = await Promise.all([
            Project.find(query)
                .populate("managerId", "name email phone role")
                .populate("projectIncharge", "name email phone role")
                .populate("createdBy", "name email")
                .populate("supervisors", "name email phone role")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),

            Project.countDocuments(query),
        ]);

        return success(
            res,
            200,
            "Projects fetched",
            projects,
            buildPagination(page, limit, total)
        );
    } catch (error) {
        return res.status(500).json({
            message: "Error fetching projects",
            error: error.message,
        });
    }
};

// ----------------------------
// GET SINGLE PROJECT
// ----------------------------
export const getProjectById = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id)
            .populate("managerId", "name email phone role")
            .populate("projectIncharge", "name email phone role")
            .populate("createdBy", "name email")
            .populate("supervisors", "name email phone role")
            .populate("labours");

        if (!project) {
            return res.status(404).json({
                message: "Project Not Found",
            });
        }

        return res.status(200).json(project);
    } catch (error) {
        return res.status(500).json({
            message: "Error fetching project",
            error: error.message,
        });
    }
};

// ----------------------------
// GET SUPERVISOR PROJECTS
// ----------------------------
export const getSupervisorProjects = async (req, res) => {
    try {
        const supervisorId = req.user.id;

        const projects = await Project.find({
            supervisors: supervisorId,
        })
            .populate("managerId", "name email phone role")
            .populate("projectIncharge", "name email phone role")
            .populate("supervisors", "name email phone role");

        return res.status(200).json(projects);
    } catch (error) {
        return res.status(500).json({
            message: "Error fetching supervisor projects",
            error: error.message,
        });
    }
};

// ----------------------------
// GET CURRENT USER PROJECTS
// ----------------------------
export const getMyProjects = async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;

        let query = {};

        if (userRole === "manager") {
            query = { managerId: userId };
        } else if (userRole === "supervisor") {
            query = { supervisors: userId };
        } else if (userRole === "admin") {
            query = {};
        } else {
            return res.status(403).json({
                message: "Access denied for this role",
            });
        }

        const projects = await Project.find(query)
            .populate("managerId", "name email phone role")
            .populate("projectIncharge", "name email phone role")
            .populate("supervisors", "name email phone role")
            .populate("createdBy", "name email");

        return res.status(200).json(projects);
    } catch (error) {
        return res.status(500).json({
            message: "Failed to fetch projects",
            error: error.message,
        });
    }
};

// ----------------------------
// ASSIGN MANAGER
// ----------------------------
export const assignManager = async (req, res) => {
    try {
        const { projectId, managerId } = req.body;

        const project = await Project.findByIdAndUpdate(
            projectId,
            { managerId },
            { new: true, runValidators: true }
        ).populate("managerId", "name email phone role");

        if (!project) {
            return res.status(404).json({
                message: "Project Not Found",
            });
        }

        return res.status(200).json({
            message: "Manager Assigned Successfully",
            project,
        });
    } catch (error) {
        return res.status(500).json({
            message: "Error assigning manager",
            error: error.message,
        });
    }
};

// ----------------------------
// UPDATE PROJECT
// ----------------------------
export const updateProject = async (req, res) => {
    try {
        const projectId = req.params.id;

        // Find existing project
        const project = await Project.findById(projectId);

        if (!project) {
            cleanupUploadedFiles(req.files);
            return res.status(404).json({
                message: "Project not found",
            });
        }

        // Parse body (removes read-only fields, parses supervisors/labours)
        let updateData;
        try {
            updateData = parseProjectBody(req.body);
        } catch (error) {
            cleanupUploadedFiles(req.files);
            return res.status(400).json({ message: error.message });
        }

        // Handle files: keep old files + append new ones
        const existingFiles = project.files
            ? project.files.toObject
                ? project.files.toObject()
                : project.files
            : {};

        const newUploaded = getUploadedFilePaths(req.files);
        const updatedFiles = {};

        for (const field of PROJECT_FILE_FIELDS) {
            updatedFiles[field] = [
                ...normalizeFileArray(existingFiles[field]),
                ...newUploaded[field],
            ];
        }

        // Update project
        const updatedProject = await Project.findByIdAndUpdate(
            projectId,
            {
                $set: {
                    ...updateData,
                    files: updatedFiles,
                },
            },
            {
                new: true,
                runValidators: true,
            }
        )
            .populate("managerId", "name email phone role")
            .populate("projectIncharge", "name email phone role")
            .populate("createdBy", "name email")
            .populate("supervisors", "name email phone role")
            .populate("labours");

        return res.status(200).json({
            message: "Project updated successfully",
            project: updatedProject,
        });
    } catch (error) {
        console.error("UPDATE PROJECT ERROR:", error);

        // Update failed, so remove newly uploaded files
        cleanupUploadedFiles(req.files);

        if (error.name === "ValidationError" || error.name === "CastError") {
            return res.status(400).json({
                message: "Invalid project data",
                error: error.message,
            });
        }

        return res.status(500).json({
            message: "Error updating project",
            error: error.message,
        });
    }
};

// ----------------------------
// DELETE PROJECT
// ----------------------------
export const deleteProject = async (req, res) => {
    try {
        const deleted = await Project.findByIdAndDelete(req.params.id);

        if (!deleted) {
            return res.status(404).json({
                message: "Project Not Found",
            });
        }

        return res.status(200).json({
            message: "Project deleted successfully",
        });
    } catch (error) {
        return res.status(500).json({
            message: "Error deleting project",
            error: error.message,
        });
    }
};

// ----------------------------
// GET MANAGER PROJECTS
// ----------------------------
export const getManagerProjects = async (req, res) => {
    try {
        const managerId = req.user.id;

        const projects = await Project.find({ managerId })
            .populate("managerId", "name email phone role")
            .populate("projectIncharge", "name email phone role")
            .populate("createdBy", "name email")
            .populate("supervisors", "name email phone role");

        return res.status(200).json(projects);
    } catch (error) {
        return res.status(500).json({
            message: "Error fetching manager projects",
            error: error.message,
        });
    }
};

// ----------------------------
// ASSIGN SUPERVISOR
// ----------------------------
export const assignSupervisor = async (req, res) => {
    try {
        const { projectId, supervisorId } = req.body;

        const project = await Project.findById(projectId);

        if (!project) {
            return res.status(404).json({
                message: "Project not found",
            });
        }

        // Existing business rule: keep only one supervisor.
        project.supervisors = supervisorId ? [supervisorId] : [];

        await project.save();

        const populatedProject = await Project.findById(projectId)
            .populate("managerId", "name email phone role")
            .populate("projectIncharge", "name email phone role")
            .populate("createdBy", "name email")
            .populate("supervisors", "name email phone role");

        return res.status(200).json({
            message: "Supervisor assigned successfully",
            project: populatedProject,
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to assign supervisor",
            error: error.message,
        });
    }
};

// ----------------------------
// ASSIGN LABOUR
// ----------------------------
export const assignLabour = async (req, res) => {
    try {
        const { projectId, labourId } = req.body;

        const project = await Project.findById(projectId);

        if (!project) {
            return res.status(404).json({
                message: "Project not found",
            });
        }

        if (project.labours.some((id) => String(id) === String(labourId))) {
            return res.status(400).json({
                message: "Labour already assigned",
            });
        }

        project.labours.push(labourId);
        await project.save();

        return res.status(200).json({
            message: "Labour assigned successfully",
            project,
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to assign labour",
            error: error.message,
        });
    }
};