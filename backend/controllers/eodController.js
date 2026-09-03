import EODReport from "../models/EODReport.js";
import { uploadToCloudinary } from "../utils/cloudUpload.js";
import { success, fail, getPagination, buildPagination, getDateRangeFilter } from "../utils/apiResponse.js";
import { logAudit } from "../utils/audit.js";
import { notifyRoles } from "../utils/notify.js";

const startOfDay = (d) => {
    const dt = new Date(d);
    dt.setHours(0, 0, 0, 0);
    return dt;
};

/** POST /api/eod — one submission per project/date (spec rule #10); reject a duplicate rather than silently overwrite. */
export const submitEOD = async (req, res) => {
    try {
        const { projectId, date } = req.body;
        if (!projectId || !date) return fail(res, 400, "projectId and date are required");

        const day = startOfDay(date);
        const existing = await EODReport.findOne({ projectId, date: day });
        if (existing) return fail(res, 400, "An EOD report already exists for this project/date. Use PATCH to edit it.");

        const body = { ...req.body, date: day };

        // Parse JSON-encoded array fields sent via multipart form-data
        for (const field of ["workItems", "labourDetails", "machineryDetails", "materialConsumption", "issues"]) {
            if (typeof body[field] === "string") {
                try { body[field] = JSON.parse(body[field]); } catch { /* leave as-is, validation below */ }
            }
        }

        const images = [];
        if (req.files?.images) {
            for (const f of req.files.images) {
                images.push({ url: await uploadToCloudinary(f, "eod/images"), uploadedBy: req.user.id });
            }
        }

        const report = await EODReport.create({
            ...body,
            images,
            submittedBy: req.user.id,
            createdBy: req.user.id,
        });

        await logAudit({ module: "EODReport", entityId: report._id, action: "submitted", performedBy: req.user.id });
        await notifyRoles({ roles: ["admin", "manager"], projectId, title: "EOD report submitted", message: `EOD for ${day.toDateString()}`, module: "EOD", referenceType: "EODReport", referenceId: report._id });

        return success(res, 201, "EOD report submitted", report);
    } catch (error) {
        if (error.code === 11000) return fail(res, 400, "An EOD report already exists for this project/date");
        return fail(res, 500, "Error submitting EOD report", error);
    }
};

/** GET /api/eod — filterable list. Supervisors see only their own submissions. */
export const listEODReports = async (req, res) => {
    try {
        const { page, limit, skip } = getPagination(req);
        const { projectId, status } = req.query;

        const filter = {};
        if (req.user.role === "supervisor") filter.submittedBy = req.user.id;
        if (projectId) filter.projectId = projectId;
        if (status) filter.status = status;
        Object.assign(filter, getDateRangeFilter(req, "date"));

        const [items, total] = await Promise.all([
            EODReport.find(filter)
                .populate("projectId", "projectName")
                .populate("submittedBy", "name role")
                .sort({ date: -1 })
                .skip(skip)
                .limit(limit),
            EODReport.countDocuments(filter),
        ]);

        return success(res, 200, "EOD reports fetched", items, buildPagination(page, limit, total));
    } catch (error) {
        return fail(res, 500, "Error fetching EOD reports", error);
    }
};

/** GET /api/eod/:id */
export const getEODReport = async (req, res) => {
    try {
        const report = await EODReport.findById(req.params.id)
            .populate("projectId", "projectName")
            .populate("submittedBy", "name role")
            .populate("approvedBy", "name role");
        if (!report) return fail(res, 404, "EOD report not found");
        return success(res, 200, "EOD report fetched", report);
    } catch (error) {
        return fail(res, 500, "Error fetching EOD report", error);
    }
};

/** PATCH /api/eod/:id — edit; owner (until approved) or admin/manager. Keeps an edit trail. */
export const updateEODReport = async (req, res) => {
    try {
        const report = await EODReport.findById(req.params.id);
        if (!report) return fail(res, 404, "EOD report not found");

        const isOwner = String(report.submittedBy) === String(req.user.id);
        const isPrivileged = ["admin", "manager"].includes(req.user.role);
        if (!isOwner && !isPrivileged) return fail(res, 403, "Not authorized to edit this report");
        if (report.status === "Approved") return fail(res, 400, "Approved reports are locked and cannot be edited");

        const editableFields = ["weather", "workingShift", "siteStatus", "workItems", "labourDetails", "machineryDetails", "materialConsumption", "issues"];
        for (const field of editableFields) {
            if (req.body[field] !== undefined) {
                report[field] = typeof req.body[field] === "string" ? JSON.parse(req.body[field]) : req.body[field];
            }
        }

        if (req.files?.images) {
            for (const f of req.files.images) {
                report.images.push({ url: await uploadToCloudinary(f, "eod/images"), uploadedBy: req.user.id });
            }
        }

        report.editHistory.push({ editedBy: req.user.id });
        report.updatedBy = req.user.id;
        await report.save();

        await logAudit({ module: "EODReport", entityId: report._id, action: "edited", performedBy: req.user.id });
        return success(res, 200, "EOD report updated", report);
    } catch (error) {
        return fail(res, 500, "Error updating EOD report", error);
    }
};

/** PATCH /api/eod/:id/approve */
export const approveEODReport = async (req, res) => {
    try {
        const report = await EODReport.findByIdAndUpdate(
            req.params.id,
            { status: "Approved", approvedBy: req.user.id, approvedAt: new Date() },
            { new: true }
        );
        if (!report) return fail(res, 404, "EOD report not found");
        await logAudit({ module: "EODReport", entityId: report._id, action: "approved", performedBy: req.user.id });
        await notifyRoles({ roles: ["admin", "manager", "supervisor"], projectId: report.projectId, title: "EOD report approved", message: `EOD for ${new Date(report.date).toDateString()} was approved`, module: "EOD", referenceType: "EODReport", referenceId: report._id });
        return success(res, 200, "EOD report approved", report);
    } catch (error) {
        return fail(res, 500, "Error approving EOD report", error);
    }
};

/** PATCH /api/eod/:id/reject */
export const rejectEODReport = async (req, res) => {
    try {
        const { reason } = req.body;
        if (!reason || !String(reason).trim()) return fail(res, 400, "Rejection reason is required");
        const existing = await EODReport.findById(req.params.id);
        if (!existing) return fail(res, 404, "EOD report not found");
        if (existing.status === "Approved") return fail(res, 400, "Approved EOD cannot be rejected");
        const report = await EODReport.findByIdAndUpdate(
            req.params.id,
            { status: "Rejected", rejectionReason: reason || "", approvedBy: req.user.id, approvedAt: new Date() },
            { new: true }
        );
        if (!report) return fail(res, 404, "EOD report not found");
        await logAudit({ module: "EODReport", entityId: report._id, action: "rejected", performedBy: req.user.id, remarks: reason });
        await notifyRoles({ roles: ["admin", "manager", "supervisor"], projectId: report.projectId, title: "EOD report rejected", message: reason, module: "EOD", referenceType: "EODReport", referenceId: report._id });
        return success(res, 200, "EOD report rejected", report);
    } catch (error) {
        return fail(res, 500, "Error rejecting EOD report", error);
    }
};
