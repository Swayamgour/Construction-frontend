// controllers/reportController.js
import DailyReport from "../models/DailyReport.js";
import Task from "../models/Task.js";
import mongoose from "mongoose";

/**
 * Create / Submit Daily Report
 * POST /api/report
 */
export const submitDailyReport = async (req, res) => {
    try {
        const {
            projectId,
            taskId,
            workDescription,
            progressPercent = 0,
            laboursUsed = [],
            machinesUsed = [],
            materialsUsed = [],
            startTime,
            endTime,
            attachments = []
        } = req.body;

        // basic validation
        if (!projectId || !taskId || !workDescription) {
            return res.status(400).json({ message: "projectId, taskId and workDescription are required" });
        }

        // optional: ensure task belongs to project (best practice)
        const task = await Task.findById(taskId).select("projectId");
        if (!task) return res.status(404).json({ message: "Task not found" });
        if (task.projectId.toString() !== projectId.toString()) {
            return res.status(400).json({ message: "Task does not belong to provided project" });
        }

        const report = await DailyReport.create({
            projectId,
            taskId,
            submittedBy: req.user.id,
            workDescription,
            progressPercent,
            laboursUsed,
            machinesUsed,
            materialsUsed,
            startTime,
            endTime,
            attachments
        });

        return res.status(201).json({ message: "Daily report submitted", data: report });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error submitting daily report", error: error.message });
    }
};

/**
 * Get single report by id
 * GET /api/report/:id
 */
export const getDailyReport = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: "Invalid id" });

        const report = await DailyReport.findById(id)
            .populate("projectId", "projectName projectCode")
            .populate("taskId", "title")
            .populate("submittedBy", "name role")
            .populate("approvedBy", "name role");

        if (!report) return res.status(404).json({ message: "Report not found" });
        return res.status(200).json({ message: "Report fetched", data: report });

    } catch (error) {
        return res.status(500).json({ message: "Error fetching report", error: error.message });
    }
};

/**
 * Get reports list (filters + pagination)
 * GET /api/report?projectId=&taskId=&submittedBy=&status=&page=&limit=
 */
export const listDailyReports = async (req, res) => {
    try {
        const { projectId, taskId, submittedBy, status, page = 1, limit = 20 } = req.query;
        const filter = {};

        if (projectId) filter.projectId = projectId;
        if (taskId) filter.taskId = taskId;
        if (submittedBy) filter.submittedBy = submittedBy;
        if (status) filter.status = status;

        // role-based: if regular user, only show their reports (optional)
        if (req.user.role === "supervisor" || req.user.role === "engineer") {
            filter.submittedBy = req.user.id;
        }

        const skip = (Number(page) - 1) * Number(limit);

        const [total, data] = await Promise.all([
            DailyReport.countDocuments(filter),
            DailyReport.find(filter)
                .populate("projectId", "projectName projectCode")
                .populate("taskId", "title")
                .populate("submittedBy", "name role")
                .populate("approvedBy", "name role")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit))
        ]);

        return res.status(200).json({
            message: "Reports fetched",
            meta: { total, page: Number(page), limit: Number(limit) },
            data
        });

    } catch (error) {
        return res.status(500).json({ message: "Error fetching reports", error: error.message });
    }
};

/**
 * Update report (only author or admin/manager)
 * PUT /api/report/:id
 */
export const updateDailyReport = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: "Invalid id" });

        const report = await DailyReport.findById(id);
        if (!report) return res.status(404).json({ message: "Report not found" });

        // only author or admin/manager can update, and updating only if not approved
        if (report.submittedBy.toString() !== req.user.id && !["admin", "manager"].includes(req.user.role)) {
            return res.status(403).json({ message: "Forbidden" });
        }
        if (report.status === "Approved") {
            return res.status(400).json({ message: "Approved reports cannot be edited" });
        }

        // update allowed fields
        const updatable = [
            "workDescription", "progressPercent", "laboursUsed", "machinesUsed",
            "materialsUsed", "startTime", "endTime", "attachments", "remarks"
        ];
        updatable.forEach(field => {
            if (req.body[field] !== undefined) report[field] = req.body[field];
        });

        await report.save();
        return res.status(200).json({ message: "Report updated", data: report });

    } catch (error) {
        return res.status(500).json({ message: "Error updating report", error: error.message });
    }
};

/**
 * Delete report (author or admin)
 * DELETE /api/report/:id
 */
export const deleteDailyReport = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: "Invalid id" });

        const report = await DailyReport.findById(id);
        if (!report) return res.status(404).json({ message: "Report not found" });

        if (report.submittedBy.toString() !== req.user.id && req.user.role !== "admin") {
            return res.status(403).json({ message: "Forbidden" });
        }

        await report.remove();
        return res.status(200).json({ message: "Report deleted" });

    } catch (error) {
        return res.status(500).json({ message: "Error deleting report", error: error.message });
    }
};

/**
 * Approve / Reject report (manager/admin)
 * PATCH /api/report/:id/approve
 * body: { action: "approve" | "reject", remarks: "..." }
 */
export const approveDailyReport = async (req, res) => {
    try {
        const { id } = req.params;
        const { action, remarks } = req.body;

        if (!["approve", "reject"].includes(action)) {
            return res.status(400).json({ message: "Invalid action" });
        }

        const report = await DailyReport.findById(id);
        if (!report) return res.status(404).json({ message: "Report not found" });

        if (!["admin", "manager"].includes(req.user.role)) {
            return res.status(403).json({ message: "Only manager or admin can approve" });
        }

        report.status = action === "approve" ? "Approved" : "Rejected";
        report.approvedBy = req.user.id;
        report.approvedAt = new Date();
        if (remarks) report.remarks = remarks;

        await report.save();

        return res.status(200).json({ message: `Report ${report.status.toLowerCase()}`, data: report });

    } catch (error) {
        return res.status(500).json({ message: "Error approving report", error: error.message });
    }
};
