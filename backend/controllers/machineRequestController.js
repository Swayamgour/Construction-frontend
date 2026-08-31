import MachineRequest from "../models/MachineRequest.js";
import Machine from "../models/Machine.js";
import MachineAssignment from "../models/MachineAssignment.js";
import { uploadToCloudinary } from "../utils/cloudUpload.js";
import { success, fail, getPagination, buildPagination, getDateRangeFilter } from "../utils/apiResponse.js";
import { logAudit } from "../utils/audit.js";
import { notifyRoles, notifyUsers } from "../utils/notify.js";

/** POST /api/machinery/requests — Supervisor/Manager requests machinery for a project. */
export const createMachineRequest = async (req, res) => {
    try {
        const { projectId, machineType, requiredMachine, quantity, requiredFromDate, requiredToDate, reason, priority } = req.body;
        if (!projectId || !machineType || !requiredFromDate) {
            return fail(res, 400, "projectId, machineType and requiredFromDate are required");
        }

        const attachments = [];
        if (req.files?.attachments) {
            for (const f of req.files.attachments) attachments.push(await uploadToCloudinary(f, "machine-requests"));
        }

        const request = await MachineRequest.create({
            projectId,
            machineType,
            requiredMachine: requiredMachine || "",
            quantity: quantity || 1,
            requiredFromDate,
            requiredToDate: requiredToDate || null,
            reason: reason || "",
            priority: priority || "Medium",
            attachments,
            requestedBy: req.user.id,
            createdBy: req.user.id,
        });

        await logAudit({ module: "MachineRequest", entityId: request._id, action: "requested", performedBy: req.user.id });
        await notifyRoles({ roles: ["admin"], projectId, title: "New machine request", message: `${machineType} requested`, module: "Machinery", referenceType: "MachineRequest", referenceId: request._id });

        return success(res, 201, "Machine request submitted", request);
    } catch (error) {
        return fail(res, 500, "Error creating machine request", error);
    }
};

/** GET /api/machinery/requests — filterable list. */
export const listMachineRequests = async (req, res) => {
    try {
        const { page, limit, skip } = getPagination(req);
        const { projectId, status } = req.query;

        const filter = {};
        if (req.user.role === "supervisor") filter.requestedBy = req.user.id;
        if (projectId) filter.projectId = projectId;
        if (status) filter.status = status;
        Object.assign(filter, getDateRangeFilter(req));

        const [items, total] = await Promise.all([
            MachineRequest.find(filter)
                .populate("projectId", "projectName")
                .populate("requestedBy", "name role")
                .populate("machineId", "machineNumber machineType")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            MachineRequest.countDocuments(filter),
        ]);

        return success(res, 200, "Machine requests fetched", items, buildPagination(page, limit, total));
    } catch (error) {
        return fail(res, 500, "Error fetching machine requests", error);
    }
};

/** PATCH /api/machinery/requests/:id/approve */
export const approveMachineRequest = async (req, res) => {
    try {
        const request = await MachineRequest.findById(req.params.id);
        if (!request) return fail(res, 404, "Machine request not found");
        if (!["REQUESTED", "ADMIN_REVIEW"].includes(request.status)) return fail(res, 400, `Already ${request.status}`);

        request.status = "APPROVED";
        request.approvedAt = new Date();
        request.approvedBy = req.user.id;
        request.updatedBy = req.user.id;
        await request.save();

        await logAudit({ module: "MachineRequest", entityId: request._id, action: "approved", performedBy: req.user.id });
        await notifyUsers({ userIds: [request.requestedBy], title: "Machine request approved", message: request.machineType, module: "Machinery", referenceType: "MachineRequest", referenceId: request._id, projectId: request.projectId });
        return success(res, 200, "Machine request approved", request);
    } catch (error) {
        return fail(res, 500, "Error approving machine request", error);
    }
};

/** PATCH /api/machinery/requests/:id/reject */
export const rejectMachineRequest = async (req, res) => {
    try {
        const { remarks } = req.body;
        const request = await MachineRequest.findByIdAndUpdate(
            req.params.id,
            { status: "REJECTED", remarks: remarks || "", updatedBy: req.user.id },
            { new: true }
        );
        if (!request) return fail(res, 404, "Machine request not found");
        await logAudit({ module: "MachineRequest", entityId: request._id, action: "rejected", performedBy: req.user.id, remarks });
        await notifyUsers({ userIds: [request.requestedBy], title: "Machine request rejected", message: remarks || "", module: "Machinery", referenceType: "MachineRequest", referenceId: request._id, projectId: request.projectId });
        return success(res, 200, "Machine request rejected", request);
    } catch (error) {
        return fail(res, 500, "Error rejecting machine request", error);
    }
};

/** PATCH /api/machinery/requests/:id/allocate — link an actual Machine, prevents double-active-allocation. */
export const allocateMachineRequest = async (req, res) => {
    try {
        const { machineId } = req.body;
        if (!machineId) return fail(res, 400, "machineId is required");

        const request = await MachineRequest.findById(req.params.id);
        if (!request) return fail(res, 404, "Machine request not found");
        if (request.status !== "APPROVED") return fail(res, 400, `Request must be APPROVED first (currently ${request.status})`);

        const machine = await Machine.findById(machineId);
        if (!machine) return fail(res, 404, "Machine not found");

        const conflicting = await MachineAssignment.findOne({ machineId, releaseDate: null });
        if (conflicting) return fail(res, 400, "Machine is already actively assigned to another project. Release it first.");

        request.machineId = machineId;
        request.status = "ALLOCATED";
        request.allocatedAt = new Date();
        request.updatedBy = req.user.id;
        await request.save();

        await logAudit({ module: "MachineRequest", entityId: request._id, action: "allocated", performedBy: req.user.id, meta: { machineId } });
        return success(res, 200, "Machine allocated to request", request);
    } catch (error) {
        return fail(res, 500, "Error allocating machine", error);
    }
};

/** PATCH /api/machinery/requests/:id/dispatch */
export const dispatchMachineRequest = async (req, res) => {
    try {
        const { expectedSiteArrival } = req.body;
        const request = await MachineRequest.findById(req.params.id);
        if (!request) return fail(res, 404, "Machine request not found");
        if (request.status !== "ALLOCATED") return fail(res, 400, `Request must be ALLOCATED first (currently ${request.status})`);

        request.status = "DISPATCHED";
        request.dispatchedAt = new Date();
        request.dispatchedBy = req.user.id;
        request.expectedSiteArrival = expectedSiteArrival || null;
        request.updatedBy = req.user.id;
        await request.save();

        await logAudit({ module: "MachineRequest", entityId: request._id, action: "dispatched", performedBy: req.user.id });
        return success(res, 200, "Machine dispatched", request);
    } catch (error) {
        return fail(res, 500, "Error dispatching machine", error);
    }
};

/**
 * PATCH /api/machinery/requests/:id/receive
 * Manager/Supervisor confirms arrival at site. Creates the actual
 * MachineAssignment record (reusing the existing model rather than
 * duplicating it) so machineController.getMachineDetails keeps working.
 */
export const receiveMachineAtSite = async (req, res) => {
    try {
        const request = await MachineRequest.findById(req.params.id);
        if (!request) return fail(res, 404, "Machine request not found");
        if (request.status !== "DISPATCHED") return fail(res, 400, `Request must be DISPATCHED first (currently ${request.status})`);

        request.status = "RECEIVED_AT_SITE";
        request.receivedAtSite = new Date();
        request.receivedBy = req.user.id;
        request.updatedBy = req.user.id;
        await request.save();

        await MachineAssignment.create({
            machineId: request.machineId,
            projectId: String(request.projectId),
            assignedBy: req.user.id,
            assignDate: new Date(),
            notes: `Auto-created on receipt of machine request ${request.requestNumber}`,
        });

        request.status = "ACTIVE";
        await request.save();

        await logAudit({ module: "MachineRequest", entityId: request._id, action: "received_at_site", performedBy: req.user.id });
        await notifyRoles({ roles: ["manager"], projectId: request.projectId, title: "Machine received at site", message: request.machineType, module: "Machinery", referenceType: "MachineRequest", referenceId: request._id });

        return success(res, 200, "Machine received at site and now active", request);
    } catch (error) {
        return fail(res, 500, "Error receiving machine at site", error);
    }
};

/** PATCH /api/machinery/requests/:id/release */
export const releaseMachineRequest = async (req, res) => {
    try {
        const request = await MachineRequest.findById(req.params.id);
        if (!request) return fail(res, 404, "Machine request not found");

        request.status = "RELEASED";
        request.releasedAt = new Date();
        request.releasedBy = req.user.id;
        request.updatedBy = req.user.id;
        await request.save();

        if (request.machineId) {
            await MachineAssignment.updateMany(
                { machineId: request.machineId, releaseDate: null },
                { releaseDate: new Date() }
            );
        }

        await logAudit({ module: "MachineRequest", entityId: request._id, action: "released", performedBy: req.user.id });
        return success(res, 200, "Machine released", request);
    } catch (error) {
        return fail(res, 500, "Error releasing machine", error);
    }
};

/** GET /api/machinery/requests/:id/history — the full movement history is the request document itself. */
export const getMachineRequestHistory = async (req, res) => {
    try {
        const request = await MachineRequest.findById(req.params.id)
            .populate("approvedBy dispatchedBy receivedBy releasedBy requestedBy", "name role")
            .populate("machineId", "machineNumber machineType");
        if (!request) return fail(res, 404, "Machine request not found");
        return success(res, 200, "Machine request history fetched", request);
    } catch (error) {
        return fail(res, 500, "Error fetching history", error);
    }
};
