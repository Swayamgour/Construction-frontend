import Attendance from "../models/Attendance.js";
import Labour from "../models/Labour.js";
import Project from "../models/Project.js";


export const getAdminLabourAttendance = async (req, res) => {
    try {
        const {
            projectId,
            date,
            status = "",
            search = "",
            page = 1,
            limit = 25,
        } = req.query;

        // ----------------------------------------
        // VALIDATION
        // ----------------------------------------

        if (!projectId) {
            return res.status(400).json({
                success: false,
                message: "Project is required",
            });
        }

        if (!date) {
            return res.status(400).json({
                success: false,
                message: "Date is required",
            });
        }

        // ----------------------------------------
        // PAGINATION
        // ----------------------------------------

        const currentPage = Math.max(1, Number(page) || 1);
        const pageLimit = Math.min(
            100,
            Math.max(1, Number(limit) || 25)
        );

        const skip = (currentPage - 1) * pageLimit;

        // ----------------------------------------
        // VALIDATE DATE
        // ----------------------------------------

        const selectedDate = new Date(`${date}T00:00:00`);

        if (Number.isNaN(selectedDate.getTime())) {
            return res.status(400).json({
                success: false,
                message: "Invalid date",
            });
        }

        const startDate = new Date(selectedDate);
        startDate.setHours(0, 0, 0, 0);

        const endDate = new Date(selectedDate);
        endDate.setHours(23, 59, 59, 999);

        // ----------------------------------------
        // CHECK PROJECT
        // ----------------------------------------

        const project = await Project.findById(projectId)
            .select("_id projectName projectCode manager projectIncharge supervisors")
            // .populate("manager", "name email")
            .populate("projectIncharge", "name email")
            .populate("supervisors", "name email");

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found",
            });
        }

        // ----------------------------------------
        // LABOUR FILTER
        // ----------------------------------------

        const labourFilter = {
            assignedProjects: projectId,
            status: {
                $ne: "Left",
            },
        };

        if (search.trim()) {
            const searchRegex = new RegExp(search.trim(), "i");

            labourFilter.$or = [
                { name: searchRegex },
                { labourId: searchRegex },
                { phone: searchRegex },
            ];
        }

        // ----------------------------------------
        // GET TOTAL LABOUR COUNT
        // ----------------------------------------

        const total = await Labour.countDocuments(labourFilter);

        // ----------------------------------------
        // GET PROJECT LABOUR
        // ----------------------------------------

        const labours = await Labour.find(labourFilter)
            .populate(
                "assignedProjects",
                "projectName projectCode"
            )
            .sort({ name: 1 })
            .skip(skip)
            .limit(pageLimit);

        // ----------------------------------------
        // LABOUR IDS
        // ----------------------------------------

        const labourIds = labours.map(
            (labour) => labour._id
        );

        // ----------------------------------------
        // ATTENDANCE FILTER
        // ----------------------------------------

        const attendanceFilter = {
            projectId,
            labourId: {
                $in: labourIds,
            },
            date: {
                $gte: startDate,
                $lte: endDate,
            },
        };

        // ----------------------------------------
        // GET ATTENDANCE
        // ----------------------------------------

        const attendanceRecords =
            await Attendance.find(attendanceFilter)
                .populate(
                    "labourId",
                    "name labourId phone labourType skillLevel"
                )
                .populate(
                    "projectId",
                    "projectName projectCode"
                )
                .populate(
                    "markedBy",
                    "name email"
                )
                .sort({ date: -1 });

        // ----------------------------------------
        // MAP ATTENDANCE BY LABOUR
        // ----------------------------------------

        const attendanceMap = new Map();

        attendanceRecords.forEach((record) => {
            const labourId = String(
                record.labourId?._id || record.labourId
            );

            attendanceMap.set(labourId, record);
        });

        // ----------------------------------------
        // BUILD FINAL ROWS
        // ----------------------------------------

        let rows = labours.map((labour) => {
            const attendance = attendanceMap.get(
                String(labour._id)
            );

            return {
                labour: {
                    _id: labour._id,
                    labourId: labour.labourId,
                    name: labour.name,
                    phone: labour.phone,
                    labourType: labour.labourType,
                    skillLevel: labour.skillLevel,
                    status: labour.status,
                },

                project: {
                    _id: project._id,
                    projectName: project.projectName,
                    projectCode: project.projectCode,
                },

                attendance: attendance || null,

                attendanceStatus:
                    attendance?.status || "Pending",
            };
        });

        // ----------------------------------------
        // STATUS FILTER
        // ----------------------------------------

        if (status) {
            rows = rows.filter(
                (row) =>
                    row.attendanceStatus === status
            );
        }

        // ----------------------------------------
        // STATISTICS
        // ----------------------------------------

        const stats = {
            totalExpected: total,
            Present: 0,
            Absent: 0,
            "Half-Day": 0,
            Pending: 0,
            marked: 0,
            percentage: 0,
        };

        // Important:
        // Stats should represent ALL project labour,
        // not only current pagination page.
        const allProjectLabours =
            await Labour.find(labourFilter)
                .select("_id");

        const allLabourIds =
            allProjectLabours.map(
                (item) => item._id
            );

        const allAttendance =
            await Attendance.find({
                projectId,
                labourId: {
                    $in: allLabourIds,
                },
                date: {
                    $gte: startDate,
                    $lte: endDate,
                },
            }).select("labourId status");

        const attendanceStatusMap =
            new Map();

        allAttendance.forEach((record) => {
            attendanceStatusMap.set(
                String(record.labourId),
                record.status
            );
        });

        allProjectLabours.forEach((labour) => {
            const attendanceStatus =
                attendanceStatusMap.get(
                    String(labour._id)
                );

            if (
                attendanceStatus === "Present"
            ) {
                stats.Present++;
            } else if (
                attendanceStatus === "Absent"
            ) {
                stats.Absent++;
            } else if (
                attendanceStatus === "Half-Day"
            ) {
                stats["Half-Day"]++;
            } else {
                stats.Pending++;
            }
        });

        stats.marked =
            stats.Present +
            stats.Absent +
            stats["Half-Day"];

        stats.percentage =
            stats.totalExpected > 0
                ? Math.round(
                    (stats.marked /
                        stats.totalExpected) *
                    100
                )
                : 0;

        // ----------------------------------------
        // RESPONSE
        // ----------------------------------------

        return res.status(200).json({
            success: true,

            data: rows,

            project: {
                _id: project._id,
                projectName: project.projectName,
                projectCode: project.projectCode,
            },

            date,

            stats,

            pagination: {
                page: currentPage,
                limit: pageLimit,
                total,
                totalPages: Math.ceil(
                    total / pageLimit
                ),
            },
        });
    } catch (error) {
        console.error(
            "❌ Admin Labour Attendance Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Failed to load labour attendance",
        });
    }
};