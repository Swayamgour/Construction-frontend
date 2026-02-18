import Attendance from "../models/Attendance.js";
import LabourAssign from "../models/Labour.js";


export const markAttendance = async (req, res) => {
    try {
        const { projectId, labourId, status, timeIn, timeOut, overtimeHours } = req.body;

        if (!projectId || !labourId || !status) {
            return res.status(400).json({ message: "Required fields missing" });
        }

        // Prevent duplicate attendance for same date
        const existing = await Attendance.findOne({
            projectId,
            labourId,
            date: new Date().setHours(0, 0, 0, 0)
        });
        if (existing) {
            return res.status(400).json({ message: "Attendance already marked today" });
        }

        const attendance = await Attendance.create({
            projectId,
            labourId,
            status,
            timeIn,
            timeOut,
            overtimeHours,
            markedBy: req.user.id
        });

        res.status(201).json({
            message: "Attendance marked successfully",
            attendance
        });

    } catch (error) {
        res.status(500).json({ message: "Error marking attendance", error: error.message });
    }
};


// import Attendance from "../models/Attendance.js";

export const approveAttendance = async (req, res) => {
    try {
        const { attendanceId } = req.body;
        const managerId = req.user.id;

        if (!attendanceId) {
            return res.status(400).json({ message: "attendanceId is required" });
        }

        // attendance check
        const attendance = await Attendance.findById(attendanceId);
        if (!attendance) {
            return res.status(404).json({ message: "Attendance record not found" });
        }

        // avoid multiple approvals
        if (attendance.approvedBy) {
            return res.status(400).json({ message: "Attendance already approved" });
        }

        attendance.approvedBy = managerId;
        await attendance.save();

        res.status(200).json({
            message: "Attendance approved successfully",
            attendance
        });

    } catch (error) {
        res.status(500).json({
            message: "Error approving attendance",
            error: error.message
        });
    }
};


export const getPendingAttendanceForManager = async (req, res) => {
    try {
        const managerId = req.user.id;

        // Fetch all attendance where approvedBy is null AND project belongs to the manager
        const pendingAttendance = await Attendance.find({
            approvedBy: null
        })
            .populate({
                path: "projectId",
                match: { managerId: managerId },          // only manager's projects
                select: "projectName"
            })
            .populate("labourId", "name phone skillType")
            .populate("markedBy", "name role")
            .sort({ createdAt: -1 });

        // Filter only records where project matched
        const filtered = pendingAttendance.filter(item => item.projectId !== null);

        res.status(200).json({
            message: "Pending attendance list fetched.",
            count: filtered.length,
            data: filtered
        });

    } catch (error) {
        res.status(500).json({
            message: "Error fetching pending attendance",
            error: error.message
        });
    }
};


export const markBulkAttendance = async (req, res) => {
    try {
        const { projectId, attendance } = req.body;
        const markedBy = req.user.id;
        console.log(projectId, attendance)

        if (!projectId || !attendance || attendance.length === 0) {
            return res.status(400).json({ message: "Invalid attendance data" });
        }

        // Insert records one by one (async parallel)
        const results = [];

        for (let item of attendance) {
            const { labourId, status, timeIn, timeOut, overtimeHours } = item;

            if (!labourId || !status) continue; // skip invalid records

            const existing = await Attendance.findOne({
                projectId,
                labourId,
                date: new Date().setHours(0, 0, 0, 0)
            });

            if (!existing) {
                const entry = await Attendance.create({
                    projectId,
                    labourId,
                    status,
                    timeIn,
                    timeOut,
                    overtimeHours,
                    markedBy
                });

                results.push(entry);
            }
        }

        res.status(201).json({
            message: "Bulk attendance marked",
            totalMarked: results.length,
            results
        });

    } catch (error) {
        res.status(500).json({ message: "Bulk attendance error", error: error.message });
    }
};

export const getLaboursByProject = async (req, res) => {
    try {
        const { projectId } = req.query;

        console.log(projectId, req)

        if (!projectId) return res.status(400).json({ message: "projectId required" });

        const data = await LabourAssign.find({ projectId })
            .populate("labourId", "name phone skillType");

        res.status(200).json({
            message: "Assigned Labour List",
            data
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching assigned labours", error: error.message });
    }
};

