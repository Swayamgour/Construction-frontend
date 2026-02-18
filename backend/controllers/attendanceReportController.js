import Attendance from "../models/Attendance.js";
import EmployeeAttendance from "../models/EmployeeAttendance.js";
import Labour from "../models/Labour.js";

/* helper */
const startOfDay = (d = new Date()) => {
    const dt = new Date(d);
    dt.setHours(0, 0, 0, 0);
    return dt;
};

/* ======================================================
   1️⃣ TODAY ATTENDANCE REPORT  (Labour + Employee Both)
   ====================================================== */
export const getTodayAttendanceReport = async (req, res) => {
    try {
        const { projectId } = req.params;
        const today = startOfDay();

        // 🔹 Labour attendance (for project)
        const labourAttendance = await Attendance.find({
            projectId,
            date: today
        })
            .populate("labourId", "name phone skillLevel")
            .populate("markedBy", "name")
            .populate("approvedBy", "name");

        // 🔹 Employee attendance (if employees are not project-scoped we return all for today)
        const employeeAttendance = await EmployeeAttendance.find({
            date: today
        })
            .populate("employeeId", "name phone role")
            .populate("markedBy", "name")
            .populate("approvedBy", "name");

        return res.status(200).json({
            message: "Today's attendance report",
            labourAttendance,
            employeeAttendance
        });

    } catch (error) {
        return res.status(500).json({ message: "Error fetching report", error: error.message });
    }
};


/* ======================================================
   2️⃣ PROJECT SUMMARY REPORT (Counts + Status Summary)
   ====================================================== */
export const getProjectSummaryReport = async (req, res) => {
    try {
        const { projectId } = req.params;
        const today = startOfDay();

        const todayAttendance = await Attendance.find({
            projectId,
            date: today
        }).populate("labourId", "name");

        const present = todayAttendance.filter(a => a.status === "Present").length;
        const absent = todayAttendance.filter(a => a.status === "Absent").length;
        const halfDay = todayAttendance.filter(a => a.status === "Half-Day").length;

        const totalLabours = await Labour.countDocuments({ projectId });

        return res.status(200).json({
            projectId,
            date: today,
            summary: {
                totalLabours,
                present,
                absent,
                halfDay
            }
        });

    } catch (error) {
        return res.status(500).json({ message: "Summary error", error: error.message });
    }
};


/* ======================================================
   3️⃣ MONTHLY ATTENDANCE REPORT
   query ?month=12&year=2025
   ====================================================== */
export const getMonthlyAttendanceReport = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { month, year } = req.query;

        if (!month || !year) {
            return res.status(400).json({ message: "month & year are required" });
        }

        const start = new Date(year, month - 1, 1);
        const end = new Date(year, month, 0);

        const startDate = startOfDay(start);
        const endDate = new Date(end);
        endDate.setHours(23, 59, 59, 999);

        const records = await Attendance.find({
            projectId,
            date: {
                $gte: startDate,
                $lte: endDate
            }
        })
            .populate("labourId", "name phone skillLevel")
            .sort({ date: 1 });

        return res.status(200).json({
            projectId,
            month,
            year,
            totalRecords: records.length,
            records
        });

    } catch (error) {
        return res.status(500).json({ message: "Monthly report error", error: error.message });
    }
};
