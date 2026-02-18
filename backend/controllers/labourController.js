import Project from "../models/Project.js";
import Labour from "../models/Labour.js";
import Attendance from "../models/Attendance.js";
// import Project from "../models/Project.js";

export const assignLabour = async (req, res) => {
    try {
        const { projectId, labourIds } = req.body;

        // Check Project Exists
        const project = await Project.findById(projectId);
        if (!project) return res.status(404).json({ message: "Project not found" });

        // 📌 Convert to string for accurate matching
        const alreadyAssigned = project.labours.map(id => id.toString());

        // 📌 Filter new labours (avoid duplicate assign)
        const newLabours = labourIds.filter(id => !alreadyAssigned.includes(id));

        // 📌 If all are already assigned
        if (newLabours.length === 0) {
            return res.status(400).json({
                message: "All selected labours are already assigned to this project",
                alreadyAssigned: labourIds,
            });
        }

        // 📌 Push new unique labours into project
        project.labours.push(...newLabours);
        await project.save();

        // 📌 Update labour document -> assign project
        await Labour.updateMany(
            { _id: { $in: newLabours } },
            { $addToSet: { assignedProjects: projectId } }  // Prevent duplicates
        );

        return res.status(200).json({
            message: "Labour assigned successfully",
            assigned: newLabours,
            project,
        });

    } catch (error) {
        res.status(500).json({
            message: "Error assigning labour",
            error: error.message
        });
    }
};



export const getLaboursByProject = async (req, res) => {
    try {
        const { projectId } = req.query;

        if (!projectId)
            return res.status(400).json({ message: "projectId required" });

        const project = await Project.findById(projectId).populate("labours");

        if (!project)
            return res.status(404).json({ message: "Project not found" });

        const labourList = project.labours;

        // Aaj ka date
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        // Aaj ki attendance
        const attendanceRecords = await Attendance.find({
            projectId,
            date: { $gte: todayStart, $lte: todayEnd }
        });

        // Map for fast lookup
        const attendanceMap = {};
        attendanceRecords.forEach((att) => {
            attendanceMap[att.labourId.toString()] = {
                attendanceToday: true,
                status: att.status,
                timeIn: att.timeIn,
                timeOut: att.timeOut
            };
        });

        // Merge labour + attendance
        const response = labourList.map((lab) => {
            const att = attendanceMap[lab._id.toString()] || {
                attendanceToday: false,
                status: "Not Marked",
                timeIn: null,
                timeOut: null
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





export const unassignLabour = async (req, res) => {
    try {
        const { labourId, projectId } = req.body;

        if (!labourId || !projectId)
            return res.status(400).json({ message: "labourId and projectId required" });

        const labour = await Labour.findById(labourId);
        if (!labour) return res.status(404).json({ message: "Labour not found" });

        const project = await Project.findById(projectId);
        if (!project) return res.status(404).json({ message: "Project not found" });

        // 1) Remove project from labour
        labour.assignedProjects = labour.assignedProjects.filter(
            (p) => p.toString() !== projectId
        );
        await labour.save();

        // 2) Remove labour from project
        project.labours = project.labours.filter(
            (l) => l.toString() !== labourId
        );
        await project.save();

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



export const reassignLabour = async (req, res) => {
    try {
        const { labourId, oldProjectId, newProjectId } = req.body;

        if (!labourId || !oldProjectId || !newProjectId)
            return res.status(400).json({ message: "Missing fields" });

        const labour = await Labour.findById(labourId);
        const oldProject = await Project.findById(oldProjectId);
        const newProject = await Project.findById(newProjectId);

        if (!labour) return res.status(404).json({ message: "Labour not found" });
        if (!oldProject) return res.status(404).json({ message: "Old project not found" });
        if (!newProject) return res.status(404).json({ message: "New project not found" });

        // 1) Remove from labour
        labour.assignedProjects = labour.assignedProjects.filter(
            (p) => p.toString() !== oldProjectId
        );

        // 2) Add new project
        if (!labour.assignedProjects.includes(newProjectId)) {
            labour.assignedProjects.push(newProjectId);
        }
        await labour.save();

        // 3) Remove labour from old project
        oldProject.labours = oldProject.labours.filter(
            (l) => l.toString() !== labourId
        );
        await oldProject.save();

        // 4) Add labour to new project
        if (!newProject.labours.includes(labourId)) {
            newProject.labours.push(labourId);
        }
        await newProject.save();

        return res.status(200).json({
            message: "Labour reassigned successfully",
            labour
        });

    } catch (error) {
        return res.status(500).json({
            message: "Error reassigning labour",
            error: error.message
        });
    }
};

