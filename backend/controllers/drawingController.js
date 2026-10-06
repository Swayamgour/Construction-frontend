import DrawingRequest from "../models/DrawingRequest.js";
import DrawingVersion from "../models/DrawingVersion.js";
import { uploadToCloudinary } from "../utils/cloudUpload.js";
import { success, fail, getPagination, buildPagination, getDateRangeFilter } from "../utils/apiResponse.js";
import { logAudit } from "../utils/audit.js";
import { notifyRoles, notifyUsers } from "../utils/notify.js";

/** POST /api/drawings/requests — Supervisor/Manager requests a drawing/document. */
export const createDrawingRequest = async (req, res) => {
    try {
        const { projectId, drawingCategory, drawingTitle, description, requiredDate, priority, remarks } = req.body;
        if (!projectId || !drawingCategory || !drawingTitle) {
            return fail(res, 400, "projectId, drawingCategory and drawingTitle are required");
        }

        const request = await DrawingRequest.create({
            projectId,
            requestedBy: req.user.id,
            drawingCategory,
            drawingTitle,
            description: description || "",
            requiredDate: requiredDate || null,
            priority: priority || "Medium",
            remarks: remarks || "",
            createdBy: req.user.id,
        });

        await logAudit({ module: "DrawingRequest", entityId: request._id, action: "created", performedBy: req.user.id });
        await notifyRoles({ roles: ["admin", "drawing_manager"], projectId, title: "New drawing request", message: drawingTitle, module: "Drawing", referenceType: "DrawingRequest", referenceId: request._id });

        return success(res, 201, "Drawing request submitted", request);
    } catch (error) {
        return fail(res, 500, "Error creating drawing request", error);
    }
};

/** GET /api/drawings/requests — filterable list. */
export const listDrawingRequests = async (req, res) => {
    try {
        const { page, limit, skip } = getPagination(req);
        const { projectId, status, drawingCategory } = req.query;

        const filter = {};
        if (req.user.role === "supervisor") filter.requestedBy = req.user.id;
        if (projectId) filter.projectId = projectId;
        if (status) filter.status = status;
        if (drawingCategory) filter.drawingCategory = drawingCategory;
        Object.assign(filter, getDateRangeFilter(req));

        const [items, total] = await Promise.all([
            DrawingRequest.find(filter)
                .populate("projectId", "projectName")
                .populate("requestedBy", "name role")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            DrawingRequest.countDocuments(filter),
        ]);

        const requestIds = items.map((i) => i._id);
        const versions = await DrawingVersion.find({ drawingRequestId: { $in: requestIds } })
            .sort({ versionNumber: -1 })
            .lean();

        const latestVersionMap = {};
        for (const v of versions) {
            const reqIdStr = String(v.drawingRequestId);
            if (!latestVersionMap[reqIdStr]) {
                latestVersionMap[reqIdStr] = v;
            }
        }

        const enrichedItems = items.map((item) => {
            const plain = item.toObject ? item.toObject() : item;
            const lv = latestVersionMap[String(item._id)] || null;
            return {
                ...plain,
                latestVersion: lv,
                fileUrl: lv ? lv.fileUrl : null,
                fileName: lv ? lv.fileName : null,
            };
        });

        return success(res, 200, "Drawing requests fetched", enrichedItems, buildPagination(page, limit, total));
    } catch (error) {
        return fail(res, 500, "Error fetching drawing requests", error);
    }
};

/** PATCH /api/drawings/requests/:id/status — move through REQUESTED -> UNDER_REVIEW -> APPROVED/REJECTED -> DELIVERED. */
export const updateDrawingRequestStatus = async (req, res) => {
    try {
        const { status, remarks } = req.body;
        const allowed = ["UNDER_REVIEW", "APPROVED", "REJECTED", "DELIVERED"];
        if (!allowed.includes(status)) return fail(res, 400, `status must be one of ${allowed.join(", ")}`);

        const request = await DrawingRequest.findById(req.params.id);
        if (!request) return fail(res, 404, "Drawing request not found");

        request.status = status;
        if (remarks) request.remarks = remarks;
        request.assignedTo = request.assignedTo || req.user.id;
        request.updatedBy = req.user.id;
        await request.save();

        await logAudit({ module: "DrawingRequest", entityId: request._id, action: `status:${status}`, performedBy: req.user.id, remarks });
        await notifyUsers({ userIds: [request.requestedBy], title: `Drawing request ${status}`, message: request.drawingTitle, module: "Drawing", referenceType: "DrawingRequest", referenceId: request._id, projectId: request.projectId });

        return success(res, 200, "Drawing request updated", request);
    } catch (error) {
        return fail(res, 500, "Error updating drawing request", error);
    }
};

/**
 * POST /api/drawings/requests/:id/upload
 * Drawing Manager (or admin) uploads a NEW version — never overwrites
 * prior versions. Bumps latestVersionNumber and moves status to UPLOADED.
 */
export const uploadDrawingVersion = async (req, res) => {
    try {
        const { revisionNumber, drawingNumber, remarks } = req.body;
        if (!req.file) return fail(res, 400, "A file is required");

        const request = await DrawingRequest.findById(req.params.id);
        if (!request) return fail(res, 404, "Drawing request not found");

        const fileUrl = await uploadToCloudinary(req.file, "drawings");
        const nextVersion = request.latestVersionNumber + 1;
        const ext = (req.file.originalname.split(".").pop() || "").toLowerCase();
        const fileType = ["dwg", "dxf"].includes(ext) ? ext : req.file.mimetype;

        const version = await DrawingVersion.create({
            drawingRequestId: request._id,
            versionNumber: nextVersion,
            revisionNumber: revisionNumber || `Rev-${nextVersion}`,
            drawingNumber: drawingNumber || "",
            fileUrl,
            fileName: req.file.originalname,
            fileType,
            uploadedBy: req.user.id,
            remarks: remarks || "",
        });

        request.latestVersionNumber = nextVersion;
        request.status = "UPLOADED";
        request.updatedBy = req.user.id;
        await request.save();

        await logAudit({ module: "DrawingVersion", entityId: version._id, action: "uploaded", performedBy: req.user.id, meta: { versionNumber: nextVersion } });
        await notifyUsers({ userIds: [request.requestedBy], title: "Drawing uploaded", message: `${request.drawingTitle} — version ${nextVersion} available`, module: "Drawing", referenceType: "DrawingVersion", referenceId: version._id, projectId: request.projectId });

        return success(res, 201, "Drawing version uploaded", version);
    } catch (error) {
        return fail(res, 500, "Error uploading drawing version", error);
    }
};

/** POST /api/drawings/:id/revision — alias of upload for a NEW revision on an already-uploaded drawing. */
export const uploadDrawingRevision = uploadDrawingVersion;

/** GET /api/drawings/:id/versions — every version ever uploaded, oldest to newest. */
export const listDrawingVersions = async (req, res) => {
    try {
        const versions = await DrawingVersion.find({ drawingRequestId: req.params.id })
            .populate("uploadedBy", "name role")
            .sort({ versionNumber: 1 });
        return success(res, 200, "Drawing versions fetched", versions);
    } catch (error) {
        return fail(res, 500, "Error fetching versions", error);
    }
};
