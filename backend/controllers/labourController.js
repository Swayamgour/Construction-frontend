import mongoose from "mongoose";
import Project from "../models/Project.js";
import Labour from "../models/Labour.js";
import Attendance from "../models/Attendance.js";
import LabourAssignment from "../models/LabourAssignment.js";
import { logAudit } from "../utils/audit.js";

/**
 * Assigns one or more labours to a project.
 * Synchronizes LabourAssignment (Single Source of Truth), Project.labours, and Labour.assignedProjects.
 */
export const assignLabour = async (req, res) => {
    try {
        const { projectId, labourIds } = req.body;

        if (!projectId || !Array.isArray(labourIds) || labourIds.length === 0) {
            return res.status(400).json({ message: "projectId and labourIds array required" });
        }

        const project = await Project.findById(projectId);
        if (!project) return res.status(404).json({ message: "Project not found" });

        const assigned = [];
        const skipped = [];
        const assignedById = req.user?.id || project.createdBy;

        for (const labourId of labourIds) {
            const labour = await Labour.findById(labourId);
            if (!labour) {
                skipped.push({ labourId, reason: "Labour not found" });
                continue;
            }

            // Check if already actively assigned
            const existingActive = await LabourAssignment.findOne({ labourId, status: "Active" });
            if (existingActive) {
                if (String(existingActive.projectId) === String(projectId)) {
                    skipped.push({ labourId, reason: "Already active on this project" });
                } else {
                    skipped.push({ labourId, reason: `Active on project ${existingActive.projectId}. Use transfer instead.` });
                }
                continue;
            }

            // Create authoritative LabourAssignment record
            const assignment = await LabourAssignment.create({
                labourId,
                projectId,
                assignmentDate: new Date(),
                assignedBy: assignedById,
                status: "Active",
            });

            // Keep derived arrays synchronized
            await Labour.updateOne({ _id: labourId }, { $addToSet: { assignedProjects: projectId } });
            await Project.updateOne({ _id: projectId }, { $addToSet: { labours: labourId } });

            assigned.push(labourId);

            await logAudit({
                module: "LabourAssignment",
                entityId: assignment._id,
                action: "assigned",
                performedBy: assignedById,
                meta: { labourId, projectId },
            });
        }

        if (assigned.length === 0 && skipped.length > 0) {
            return res.status(400).json({
                message: "No labours could be assigned",
                skipped,
            });
        }

        return res.status(200).json({
            message: "Labour assigned successfully",
            assigned,
            skipped,
        });

    } catch (error) {
        return res.status(500).json({
            message: "Error assigning labour",
            error: error.message
        });
    }
};

/**
 * Returns project labours with today's attendance status.
 */
export const getLaboursByProject = async (req, res) => {
    try {
        const { projectId } = req.query;

        if (!projectId)
            return res.status(400).json({ message: "projectId required" });

        const project = await Project.findById(projectId);
        if (!project)
            return res.status(404).json({ message: "Project not found" });

        // Query active assignments from source of truth
        const activeAssignments = await LabourAssignment.find({
            projectId,
            status: "Active",
        }).populate("labourId");

        const labourList = activeAssignments
            .map((a) => a.labourId)
            .filter((l) => l && l.status === "Active");

        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        const attendanceRecords = await Attendance.find({
            projectId,
            date: { $gte: todayStart, $lte: todayEnd }
        });

        const attendanceMap = {};
        attendanceRecords.forEach((att) => {
            attendanceMap[att.labourId.toString()] = {
                attendanceToday: true,
                status: att.status,
                timeIn: att.checkInTime || att.timeIn,
                timeOut: att.checkOutTime || att.timeOut,
                approvalStatus: att.approvalStatus,
                overtimeHours: att.overtimeHours || 0,
            };
        });

        const response = labourList.map((lab) => {
            const att = attendanceMap[lab._id.toString()] || {
                attendanceToday: false,
                status: "Not Marked",
                timeIn: null,
                timeOut: null,
                approvalStatus: null,
                overtimeHours: 0,
            };

            return {
                ...lab.toObject(),
                ...att
            };
        });

        res.status(200).json({
            message: "Labours with attendance status",
            data: response,
        });

    } catch (error) {
        res.status(500).json({
            message: "Error fetching labours",
            error: error.message,
        });
    }
};

/**
 * Unassigns/releases labour from a project.
 * Updates LabourAssignment to "Released" and updates derived arrays.
 */
export const unassignLabour = async (req, res) => {
    try {
        const { labourId, projectId, reason } = req.body;

        if (!labourId || !projectId)
            return res.status(400).json({ message: "labourId and projectId required" });

        const labour = await Labour.findById(labourId);
        if (!labour) return res.status(404).json({ message: "Labour not found" });

        const project = await Project.findById(projectId);
        if (!project) return res.status(404).json({ message: "Project not found" });

        // Close active assignment
        const activeAssignment = await LabourAssignment.findOne({ labourId, projectId, status: "Active" });
        if (activeAssignment) {
            activeAssignment.status = "Released";
            activeAssignment.releaseDate = new Date();
            activeAssignment.releasedBy = req.user?.id || null;
            activeAssignment.releaseReason = reason || "Unassigned from project";
            await activeAssignment.save();

            await logAudit({
                module: "LabourAssignment",
                entityId: activeAssignment._id,
                action: "released",
                performedBy: req.user?.id,
                meta: { labourId, projectId, reason },
            });
        }

        // Remove from derived arrays
        await Labour.updateOne({ _id: labourId }, { $pull: { assignedProjects: projectId } });
        await Project.updateOne({ _id: projectId }, { $pull: { labours: labourId } });

        return res.status(200).json({
            message: "Labour unassigned successfully",
            labour,
            project
        });

    } catch (error) {
        return res.status(500).json({
            message: "Error removing labour",
            error: error.message
        });
    }
};

/**
 * Transfers/reassigns labour from old project to new project.
 * Closes old assignment (Transferred), opens new assignment (Active), links previousAssignmentId.
 */
export const reassignLabour = async (req, res) => {
    try {
        const { labourId, oldProjectId, newProjectId, transferReason } = req.body;

        if (!labourId || !oldProjectId || !newProjectId)
            return res.status(400).json({ message: "Missing fields" });

        const [labour, oldProject, newProject] = await Promise.all([
            Labour.findById(labourId),
            Project.findById(oldProjectId),
            Project.findById(newProjectId),
        ]);

        if (!labour) return res.status(404).json({ message: "Labour not found" });
        if (!oldProject) return res.status(404).json({ message: "Old project not found" });
        if (!newProject) return res.status(404).json({ message: "New project not found" });

        const when = new Date();
        const activeAssignment = await LabourAssignment.findOne({ labourId, projectId: oldProjectId, status: "Active" });

        let previousAssignmentId = null;
        if (activeAssignment) {
            activeAssignment.status = "Transferred";
            activeAssignment.releaseDate = when;
            activeAssignment.transferDate = when;
            activeAssignment.transferredBy = req.user?.id || null;
            activeAssignment.transferReason = transferReason || "Reassigned";
            await activeAssignment.save();
            previousAssignmentId = activeAssignment._id;
        }

        // Create new active assignment
        const newAssignment = await LabourAssignment.create({
            labourId,
            projectId: newProjectId,
            previousProjectId: oldProjectId,
            previousAssignmentId,
            assignmentDate: when,
            assignedBy: req.user?.id || oldProject.createdBy,
            transferredBy: req.user?.id || null,
            transferReason: transferReason || "Reassigned",
            status: "Active",
        });

        // Sync derived arrays
        await Labour.updateOne({ _id: labourId }, {
            $pull: { assignedProjects: oldProjectId },
            $addToSet: { assignedProjects: newProjectId }
        });
        await Project.updateOne({ _id: oldProjectId }, { $pull: { labours: labourId } });
        await Project.updateOne({ _id: newProjectId }, { $addToSet: { labours: labourId } });

        await logAudit({
            module: "LabourAssignment",
            entityId: newAssignment._id,
            action: "transferred",
            performedBy: req.user?.id,
            meta: { labourId, oldProjectId, newProjectId },
        });

        return res.status(200).json({
            message: "Labour reassigned successfully",
            assignment: newAssignment,
            labour,
        });

    } catch (error) {
        return res.status(500).json({
            message: "Error reassigning labour",
            error: error.message
        });
    }
};
