import EmployeeAttendance from "../models/EmployeeAttendance.js";
import Employee from "../models/Employee.js";
import User from "../models/User.js";
import mongoose from "mongoose";
import cloudinary from "../config/cloudinary.js"

/* helper start of day */
const startOfDay = (d = new Date()) => {
    const dt = new Date(d);
    dt.setHours(0, 0, 0, 0);
    return dt;
};

// ----------------------------------
// 1️⃣ Mark Single Employee Attendance (Punch-in)
// Accepts body: { employeeId, status } OR form-data with file selfie (optional)
// ----------------------------------
export const markEmployeeAttendance = async (req, res) => {


    try {
        const {
            employeeId,
            status,
            timeIn,
            timeOut,
            workHours,
            latitude,
            longitude,
            timestamp
        } = req.body;

        if (!employeeId || !status) {
            return res.status(400).json({ message: "Required fields missing" });
        }

        const today = new Date().setHours(0, 0, 0, 0);

        const existing = await EmployeeAttendance.findOne({ employeeId, date: today });
        if (existing) {
            return res.status(400).json({ message: "Attendance already marked today" });
        }

        // ⭐ Upload to cloudinary
        let selfiePath = null;


        if (req.file) {
            const base64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;

            const uploadRes = await cloudinary.uploader.upload(base64, {
                folder: "attendance/selfies"
            });

            selfiePath = uploadRes.secure_url;
        }

        const record = await EmployeeAttendance.create({
            employeeId,
            status,
            selfie: selfiePath,

            latitude: latitude ? Number(latitude) : null,
            longitude: longitude ? Number(longitude) : null,
            timestamp: timestamp ? new Date(timestamp) : new Date(),

            timeIn: timeIn ? new Date(timeIn) : new Date(),
            timeOut: timeOut ? new Date(timeOut) : null,
            workHours: workHours || 0,

            markedBy: req.user.id,
            date: today
        });

        return res.status(201).json({
            message: "Employee attendance marked",
            attendance: record
        });

    } catch (error) {
        return res.status(500).json({
            message: "Error",
            error: error.message
        });
    }
};




// ----------------------------------
// Bulk Employee Attendance (admin/manager)
// body: { attendance: [{ employeeId, status, timeIn, timeOut, workHours }, ...] }
// ----------------------------------
export const markBulkEmployeeAttendance = async (req, res) => {
    try {
        const { attendance } = req.body;
        const markedBy = req.user.id;

        if (!attendance || attendance.length === 0) {
            return res.status(400).json({ message: "Attendance list is empty" });
        }

        const today = startOfDay();

        const employeeIds = attendance.map(it => it.employeeId);

        const existing = await EmployeeAttendance.find({
            employeeId: { $in: employeeIds },
            date: today
        }).select("employeeId");

        const existingSet = new Set(existing.map(e => String(e.employeeId)));

        const docs = attendance
            .filter(it => it.employeeId && it.status && !existingSet.has(String(it.employeeId)))
            .map(it => ({
                employeeId: it.employeeId,
                status: it.status,
                timeIn: it.timeIn || null,
                timeOut: it.timeOut || null,
                workHours: it.workHours || 0,
                markedBy,
                date: today
            }));

        let inserted = [];
        if (docs.length > 0) {
            inserted = await EmployeeAttendance.insertMany(docs, { ordered: false });
        }

        return res.status(201).json({
            message: "Bulk employee attendance saved",
            totalRequested: attendance.length,
            totalInserted: inserted.length
        });

    } catch (error) {
        return res.status(500).json({ message: "Error", error: error.message });
    }
};

// ----------------------------------
// 3️⃣ Approve Attendance
// body: { attendanceId }
// ----------------------------------
export const approveEmployeeAttendance = async (req, res) => {
    try {
        const attendanceId = req.body.attendanceId?.attendanceId;
        const managerId = req.user.id;

        if (!attendanceId) return res.status(400).json({ message: "attendanceId is required" });

        const record = await EmployeeAttendance.findById(attendanceId);
        if (!record) return res.status(404).json({ message: "Record not found" });

        if (record.approvedBy) {
            return res.status(400).json({ message: "Already approved" });
        }

        record.approvedBy = managerId;
        record.approvedAt = new Date();
        await record.save();

        return res.status(200).json({
            message: "Attendance approved",
            attendance: record
        });

    } catch (error) {
        return res.status(500).json({ message: "Error", error: error.message });
    }
};

// ----------------------------------
// 4️⃣ Pending Approvals
// ----------------------------------
export const getPendingEmployeeAttendance = async (req, res) => {
    try {
        const pending = await EmployeeAttendance.find({ approvedBy: null })
            .populate("employeeId", "name phone role")
            .populate("markedBy", "name")
            .sort({ createdAt: -1 });

        return res.status(200).json({ pending });

    } catch (error) {
        return res.status(500).json({ message: "Error", error: error.message });
    }
};

// ----------------------------------
// 5️⃣ Get All Employees (or filtered)
// ----------------------------------
export const getEmployeeList = async (req, res) => {
    try {
        const { role } = req.query;

        const filter = {
            status: { $regex: /^Present$/i }
        };

        const query = EmployeeAttendance.find(filter)
            .populate("employeeId", "name phone role")  // 👈 Important
            .sort({ createdAt: -1 }); // better sorting

        if (role) {
            query.populate({
                path: "employeeId",
                match: { role: { $regex: new RegExp(`^${role}$`, "i") } },
                select: "name phone role"
            })
        }

        const employees = await query.exec();

        return res.status(200).json({
            message: "Employee list fetched",
            employees
        });

    } catch (error) {
        return res.status(500).json({
            message: "Error fetching employee list",
            error: error.message
        });
    }
};


// ----------------------------------
// 7️⃣ Get Attendance By Date
// query ?date=YYYY-MM-DD
// ----------------------------------


export const getEmployeeAttendanceByDate = async (req, res) => {
    try {
        const { date } = req.query;

        if (!date) {
            return res.status(400).json({ message: "Date is required" });
        }

        const start = new Date(date);
        start.setHours(0, 0, 0, 0);

        const end = new Date(start);
        end.setDate(end.getDate() + 1);

        const filter = {
            date: { $gte: start, $lt: end }
        };

        // 👉 If login user is employee → show only his attendance
        if (req.user.role === "employee") {
            filter.employeeId = new mongoose.Types.ObjectId(req.user._id);
        }

        const records = await EmployeeAttendance.find(filter)
            .populate("employeeId", "name phone role")
            .populate("markedBy", "name")
            .populate("approvedBy", "name")
            .sort({ createdAt: -1 });

        return res.status(200).json(
            records
        );

    } catch (error) {
        return res.status(500).json({
            message: "Error fetching attendance",
            error: error.message
        });
    }
};


export const getMyAttendance = async (req, res) => {
    try {

        // const userId = req.user._id;   // logged-in user

        const userId = req.user._id || req.user.id;

        // console.log("Logged in userId:", userId);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const filter = {
            employeeId: userId,
            date: { $gte: today, $lt: tomorrow }
        };

        const record = await EmployeeAttendance.findOne(filter)
            .populate("employeeId", "name phone role")
            .populate("markedBy", "name")
            .populate("approvedBy", "name");

        return res.status(200).json({
            record: record

        }
        );

    } catch (error) {
        return res.status(500).json({
            message: "Error fetching my attendance",
            error: error.message
        });
    }
};




// ----------------------------------
// Employee punch-out (updates existing record for today)
// body: { employeeId, timeOut }
// ----------------------------------
export const employeePunchOut = async (req, res) => {
    try {
        const { employeeId, timeOut } = req.body;
        if (!employeeId) return res.status(400).json({ message: "employeeId required" });

        const today = startOfDay();
        const record = await EmployeeAttendance.findOne({ employeeId, date: today });
        if (!record) return res.status(404).json({ message: "No punch-in found for today" });

        if (record.timeOut) return res.status(400).json({ message: "Already punched out" });

        record.timeOut = timeOut ? new Date(timeOut) : new Date();
        if (record.timeIn) {
            const diffMs = new Date(record.timeOut) - new Date(record.timeIn);
            const hours = diffMs > 0 ? diffMs / (1000 * 60 * 60) : 0;
            record.workHours = Math.round(hours * 100) / 100;
        }
        await record.save();

        return res.status(200).json({ message: "Punched out", attendance: record });

    } catch (error) {
        return res.status(500).json({ message: "Error", error: error.message });
    }
};
