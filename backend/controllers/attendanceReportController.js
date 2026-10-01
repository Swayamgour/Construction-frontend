import Attendance from "../models/Attendance.js";
import EmployeeAttendance from "../models/EmployeeAttendance.js";
import Labour from "../models/Labour.js";
import LabourAssignment from "../models/LabourAssignment.js";

const startOfDay = (d = new Date()) => {
    const dt = new Date(d);
    dt.setHours(0, 0, 0, 0);
    return dt;
};

const nextDay = (d) => {
    const dt = new Date(d);
    dt.setDate(dt.getDate() + 1);
    return dt;
};

/* ======================================================
   1) TODAY / DAILY ATTENDANCE REPORT (Labour + Employee)
   ====================================================== */
export const getTodayAttendanceReport = async (req, res) => {
    try {
        const { projectId } = req.params;
        const selectedDate = req.query.date ? new Date(req.query.date) : new Date();
        const targetDay = startOfDay(selectedDate);
        const dateRange = { $gte: targetDay, $lt: nextDay(targetDay) };

        const labourAttendance = await Attendance.find({ projectId, date: dateRange })
            .populate("labourId", "name phone skillLevel category labourType dailyWage fatherName")
            .populate("assignmentId", "assignmentDate releaseDate status")
            .populate("markedBy", "name")
            .populate("approvedBy", "name");

        // Employees are not project-scoped, so only admin/manager get them
        let employeeAttendance = [];
        if (["admin", "manager"].includes(req.user.role)) {
            employeeAttendance = await EmployeeAttendance.find({ date: dateRange })
                .populate("employeeId", "name phone role")
                .populate("markedBy", "name")
                .populate("approvedBy", "name");
        }

        return res.status(200).json({
            message: "Daily attendance report",
            date: targetDay,
            labourAttendance,
            employeeAttendance,
        });
    } catch (error) {
        return res.status(500).json({ message: "Error fetching report", error: error.message });
    }
};

/* ======================================================
   2) PROJECT SUMMARY REPORT
   ====================================================== */
export const getProjectSummaryReport = async (req, res) => {
    try {
        const { projectId } = req.params;
        const selectedDate = req.query.date ? new Date(req.query.date) : new Date();
        const targetDay = startOfDay(selectedDate);

        const [dayAttendance, assignmentCount, legacyCount] = await Promise.all([
            Attendance.find({ projectId, date: { $gte: targetDay, $lt: nextDay(targetDay) } }),
            LabourAssignment.countDocuments({ projectId, status: "Active" }),
            Labour.countDocuments({ assignedProjects: projectId, status: "Active" }),
        ]);

        const totalLabours = Math.max(assignmentCount, legacyCount);
        const count = (fn) => dayAttendance.filter(fn).length;

        const present = count((a) => a.status === "Present");
        const absent = count((a) => a.status === "Absent");
        const halfDay = count((a) => a.status === "Half-Day");

        return res.status(200).json({
            projectId,
            date: targetDay,
            summary: {
                totalLabours,
                present,
                absent,
                halfDay,
                notMarked: Math.max(totalLabours - dayAttendance.length, 0),
                punchedInOnly: count((a) => a.checkInTime && !a.checkOutTime && a.status !== "Absent"),
                pendingApproval: count((a) => a.approvalStatus === "Pending"),
                approved: count((a) => a.approvalStatus === "Approved"),
                rejected: count((a) => a.approvalStatus === "Rejected"),
                overtimeHours: dayAttendance.reduce((s, a) => s + (a.overtimeHours || 0), 0),
                totalLabourCost: dayAttendance.reduce((s, a) => s + (a.dailyWageAmount || a.totalAmount || 0), 0),
            },
        });
    } catch (error) {
        return res.status(500).json({ message: "Summary error", error: error.message });
    }
};

/* ======================================================
   3) MONTHLY ATTENDANCE REPORT  ?month=12&year=2025
   ====================================================== */
export const getMonthlyAttendanceReport = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { month, year } = req.query;

        if (!month || !year) {
            return res.status(400).json({ message: "month & year are required" });
        }

        const startDate = new Date(Number(year), Number(month) - 1, 1);
        const endDate = new Date(Number(year), Number(month), 1); // exclusive

        const records = await Attendance.find({
            projectId,
            date: { $gte: startDate, $lt: endDate },
        })
            .populate("labourId", "name phone skillLevel")
            .sort({ date: 1 });

        // Per-labour totals (wages only from admin-approved records)
        const perLabour = {};
        for (const r of records) {
            const key = String(r.labourId?._id || r.labourId);
            const row = (perLabour[key] ||= {
                labour: r.labourId,
                present: 0,
                halfDay: 0,
                absent: 0,
                overtimeHours: 0,
                approvedOvertimeHours: 0,
                approvedWages: 0,
                pendingRecords: 0,
            });

            if (r.status === "Present") row.present++;
            else if (r.status === "Half-Day") row.halfDay++;
            else row.absent++;

            row.overtimeHours += r.overtimeHours || 0;
            row.approvedOvertimeHours += r.approvedOvertimeHours || 0;

            if (r.approvalStatus === "Approved") row.approvedWages += r.dailyWageAmount || 0;
            else row.pendingRecords++;
        }

        return res.status(200).json({
            projectId,
            month,
            year,
            totalRecords: records.length,
            summary: Object.values(perLabour),
            records,
        });
    } catch (error) {
        return res.status(500).json({ message: "Monthly report error", error: error.message });
    }
};