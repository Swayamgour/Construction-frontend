import Attendance from "../models/Attendance.js";
// import LabourAssign from "../models/Labour.js"; // labour assignments to project
import Labour from "../models/Labour.js"; // labour assignments to project
import mongoose from "mongoose";

// import LabourAttendance from "../models/LabourAttendance.js";
// import Labour from "../models/Labour.js";


/* helper: get start-of-day Date object */
const startOfDay = (d = new Date()) => {
    const dt = new Date(d);
    dt.setHours(0, 0, 0, 0);
    return dt;
};

/* ----------------------- MARK SINGLE ATTENDANCE ------------------------ */
export const markLabourAttendance = async (req, res) => {
    try {
        const { projectId, labourId, status, timeIn, timeOut, overtimeHours } = req.body;

        if (!projectId || !labourId || !status)
            return res.status(400).json({ message: "Required fields missing" });

        const today = startOfDay();

        // check if already marked today for that labour in project
        const exists = await Attendance.findOne({ projectId, labourId, date: today });
        if (exists) return res.status(400).json({ message: "Attendance already marked today" });

        const attendance = await Attendance.create({
            projectId,
            labourId,
            status,
            timeIn: timeIn || null,
            timeOut: timeOut || null,
            overtimeHours: overtimeHours || 0,
            markedBy: req.user.id,
            date: today
        });

        res.status(201).json(attendance);

    } catch (err) {
        res.status(500).json({ message: "Marking error", error: err.message });
    }
};

/* ----------------------- MARK BULK ATTENDANCE -------------------------- */
export const markBulkLabourAttendance = async (req, res) => {
    try {
        const { projectId, attendance } = req.body;
        const markedBy = req.user.id;

        if (!projectId || !attendance || attendance.length === 0)
            return res.status(400).json({ message: "Invalid data" });

        const today = startOfDay();

        const operations = attendance.map(it => ({
            updateOne: {
                filter: {
                    projectId,
                    labourId: it.labourId,
                    date: today
                },
                update: {
                    $set: {
                        status: it.status,
                        timeIn: it.timeIn || null,
                        timeOut: it.timeOut || null,
                        overtimeHours: it.overtimeHours || 0,
                        markedBy
                    }
                },
                upsert: true   // <-- IMPORTANT
            }
        }));

        const result = await Attendance.bulkWrite(operations);

        return res.status(200).json({
            message: "Bulk attendance recorded successfully",
            matched: result.nMatched,
            modified: result.nModified,
            upserted: result.upsertedCount
        });

    } catch (err) {
        return res.status(500).json({ message: "Bulk error", error: err.message });
    }
};


/* ------------------------- APPROVE ATTENDANCE -------------------------- */
export const approveLabourAttendance = async (req, res) => {
    try {
        const { attendanceId } = req.body;

        if (!attendanceId) return res.status(400).json({ message: "attendanceId required" });

        const attendance = await Attendance.findById(attendanceId);
        if (!attendance) return res.status(404).json({ message: "Record not found" });

        if (attendance.approvedBy)
            return res.status(400).json({ message: "Already approved" });

        attendance.approvedBy = req.user.id;
        attendance.approvedAt = new Date();
        await attendance.save();

        res.status(200).json({ message: "Approved", attendance });

    } catch (err) {
        res.status(500).json({ message: "Approval error", error: err.message });
    }
};

/* ------------------------- PENDING LIST FOR MANAGER -------------------- */
export const getPendingLabourAttendance = async (req, res) => {
    try {
        const managerId = req.user.id;

        // find attendance with approvedBy null and project managed by this manager
        const pending = await Attendance.find({ approvedBy: null })
            .populate({
                path: "projectId",
                select: "projectName managerId",
                // optionally you can also `.populate("projectId.managerId", "name")` if needed
            })
            .populate("labourId", "name phone skillLevel")
            .populate("markedBy", "name")
            .sort({ createdAt: -1 });

        // filter to only projects this manager manages
        const filtered = pending.filter(p => p.projectId && String(p.projectId.managerId) === String(managerId));

        res.status(200).json({
            message: "Pending fetched",
            count: filtered.length,
            data: filtered
        });

    } catch (err) {
        res.status(500).json({ message: "Fetch error", error: err.message });
    }
};

/* --------------------------- LIST LABOURS ------------------------------- */


export const getLaboursByProject = async (req, res) => {
    try {
        const { projectId } = req.query;

        const data = await Labour.find({
            assignedProjects: projectId
        });

        return res.status(200).json(data);

    } catch (err) {
        return res.status(500).json({
            message: "Error fetching labours",
            error: err.message
        });
    }
};


export const getTodaysPresentLabours = async (req, res) => {
    try {

        // Today start
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Tomorrow end
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const records = await Attendance.find({
            status: "Present",
            date: { $gte: today, $lt: tomorrow }
        })
            .populate("labourId")    // full labour detail
            .sort({ createdAt: -1 });

        return res.status(200).json(records);

    } catch (err) {
        return res.status(500).json({
            message: "Error fetching today's present labours",
            error: err.message
        });
    }
};



