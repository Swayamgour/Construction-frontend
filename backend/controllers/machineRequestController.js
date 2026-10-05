import MachineRequest from "../models/MachineRequest.js";
import Machine from "../models/Machine.js";
import MachineAssignment from "../models/MachineAssignment.js";
import { uploadToCloudinary } from "../utils/cloudUpload.js";
import { success, fail, getPagination, buildPagination, getDateRangeFilter } from "../utils/apiResponse.js";
import { logAudit } from "../utils/audit.js";
import { notifyRoles, notifyUsers } from "../utils/notify.js";
import { checkMachineAvailability } from "../services/machineAvailabilityService.js";

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
                .populate("projectId", "name code projectName")
                .populate("requestedBy", "name role")
                .populate("machineId", "machineNumber machineType brand model status currentMeterReading currentFuelLevel")
                .populate("vendorId", "name contactPerson phone")
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

/** PATCH /api/machinery/requests/:id/allocate — link an actual Machine with centralized availability check. */
export const allocateMachineRequest = async (req, res) => {
    try {
        const { machineId } = req.body;
        if (!machineId) return fail(res, 400, "machineId is required");

        const request = await MachineRequest.findById(req.params.id);
        if (!request) return fail(res, 404, "Machine request not found");
        if (request.status !== "APPROVED") return fail(res, 400, `Request must be APPROVED first (currently ${request.status})`);

        // Centralized Availability & Overlap Check
        const availCheck = await checkMachineAvailability({
            machineId,
            requiredFrom: request.requiredFromDate,
            requiredTo: request.requiredToDate,
            excludeRequestId: request._id,
        });

        if (!availCheck.available) {
            return fail(res, 409, availCheck.reason, { conflict: availCheck.conflict });
        }

        const machine = availCheck.machine;

        request.machineId = machineId;
        request.status = "ALLOCATED";
        request.allocatedAt = new Date();
        request.updatedBy = req.user.id;
        await request.save();

        // Mark machine as Assigned
        machine.status = "Assigned";
        await machine.save();

        await logAudit({ module: "MachineRequest", entityId: request._id, action: "allocated", performedBy: req.user.id, meta: { machineId } });
        return success(res, 200, "Machine allocated to request", request);
    } catch (error) {
        return fail(res, 500, "Error allocating machine", error);
    }
};

/**
 * PATCH /api/machinery/requests/:id/vendor-procure
 * External machine procurement when internal fleet is unavailable
 */
export const procureVendorMachine = async (req, res) => {
    try {
        const {
            vendorId,
            vendorMachineNumber,
            machineType,
            brand,
            model,
            rentalRate,
            rateType,
            contractStart,
            contractEnd,
            securityDeposit,
            transportCost,
            operatorProvidedBy,
            vendorRemarks,
        } = req.body;

        if (!vendorId || !vendorMachineNumber) {
            return fail(res, 400, "vendorId and vendorMachineNumber are required");
        }

        const request = await MachineRequest.findById(req.params.id);
        if (!request) return fail(res, 404, "Machine request not found");
        if (!["REQUESTED", "ADMIN_REVIEW", "APPROVED"].includes(request.status)) {
            return fail(res, 400, `Cannot procure vendor machine for request in ${request.status} status`);
        }

        // Find or create external rented machine in Machine Master
        let machine = await Machine.findOne({ machineNumber: vendorMachineNumber });
        if (!machine) {
            machine = await Machine.create({
                machineNumber: vendorMachineNumber,
                machineType: machineType || request.machineType,
                brand: brand || "",
                model: model || "",
                ownedOrRented: "Rented",
                vendorId,
                status: "Assigned",
                hourlyRate: rateType === "PER_HOUR" ? Number(rentalRate) || 0 : 0,
                dailyRate: rateType === "PER_DAY" ? Number(rentalRate) || 0 : 0,
                monthlyRate: rateType === "PER_MONTH" ? Number(rentalRate) || 0 : 0,
                rentalDetails: {
                    vendorId,
                    contractStart: contractStart ? new Date(contractStart) : null,
                    contractEnd: contractEnd ? new Date(contractEnd) : null,
                    rateType: rateType || "PER_DAY",
                    rentalRate: Number(rentalRate) || 0,
                    securityDeposit: Number(securityDeposit) || 0,
                    transportCost: Number(transportCost) || 0,
                    operatorProvidedBy: operatorProvidedBy || "VENDOR",
                },
                notes: `Procured for Request #${request.requestNumber}`,
            });
        } else {
            machine.status = "Assigned";
            machine.vendorId = vendorId;
            machine.ownedOrRented = "Rented";
            await machine.save();
        }

        request.isVendorProcured = true;
        request.vendorId = vendorId;
        request.vendorMachineNumber = vendorMachineNumber;
        request.rentalRate = Number(rentalRate) || 0;
        request.rateType = rateType || "PER_DAY";
        request.contractStart = contractStart ? new Date(contractStart) : null;
        request.contractEnd = contractEnd ? new Date(contractEnd) : null;
        request.securityDeposit = Number(securityDeposit) || 0;
        request.transportCost = Number(transportCost) || 0;
        request.operatorProvidedBy = operatorProvidedBy || "VENDOR";
        request.vendorRemarks = vendorRemarks || "";
        request.machineId = machine._id;
        request.status = "ALLOCATED";
        request.allocatedAt = new Date();
        request.updatedBy = req.user.id;
        await request.save();

        await logAudit({ module: "MachineRequest", entityId: request._id, action: "vendor_procured", performedBy: req.user.id, meta: { vendorId, machineId: machine._id } });
        return success(res, 200, "Vendor machine procured and allocated", request);
    } catch (error) {
        return fail(res, 500, "Error procuring vendor machine", error);
    }
};

/** PATCH /api/machinery/requests/:id/dispatch */
export const dispatchMachineRequest = async (req, res) => {
    try {
        const { expectedSiteArrival, transportDetails, driverName, driverPhone, vehicleNumber, remarks } = req.body;
        const request = await MachineRequest.findById(req.params.id);
        if (!request) return fail(res, 404, "Machine request not found");
        if (request.status !== "ALLOCATED") return fail(res, 400, `Request must be ALLOCATED first (currently ${request.status})`);

        const machine = await Machine.findById(request.machineId);
        if (machine) {
            if (machine.status === "Breakdown" || machine.status === "Under Maintenance") {
                return fail(res, 400, `Cannot dispatch machine while in ${machine.status} status`);
            }
            machine.status = "In Transit";
            await machine.save();
        }

        request.status = "DISPATCHED";
        request.dispatchedAt = new Date();
        request.dispatchedBy = req.user.id;
        request.expectedSiteArrival = expectedSiteArrival || null;
        request.dispatchDetails = {
            transportDetails: transportDetails || "",
            driverName: driverName || "",
            driverPhone: driverPhone || "",
            vehicleNumber: vehicleNumber || "",
            remarks: remarks || "",
        };
        request.updatedBy = req.user.id;
        await request.save();

        await logAudit({ module: "MachineRequest", entityId: request._id, action: "dispatched", performedBy: req.user.id });
        return success(res, 200, "Machine dispatched to site", request);
    } catch (error) {
        return fail(res, 500, "Error dispatching machine", error);
    }
};

/**
 * PATCH /api/machinery/requests/:id/receive
 * Site Inspection & Acceptance Process
 * Records opening meter, fuel, condition, and creates active MachineAssignment.
 */
export const receiveMachineAtSite = async (req, res) => {
    try {
        const { openingMeterReading, fuelLevel, machineCondition, documentsChecked, remarks } = req.body;
        const request = await MachineRequest.findById(req.params.id);
        if (!request) return fail(res, 404, "Machine request not found");
        if (request.status !== "DISPATCHED") return fail(res, 400, `Request must be DISPATCHED first (currently ${request.status})`);

        const arrivalPhotos = [];
        if (req.files?.arrivalPhotos) {
            for (const f of req.files.arrivalPhotos) {
                arrivalPhotos.push(await uploadToCloudinary(f, "machine/site-arrival"));
            }
        }

        const machine = await Machine.findById(request.machineId);

        // Update Request with Arrival details
        request.status = "ACTIVE";
        request.receivedAtSite = new Date();
        request.receivedBy = req.user.id;
        request.arrivalMeterReading = openingMeterReading !== undefined ? Number(openingMeterReading) : machine?.currentMeterReading || 0;
        request.arrivalFuelLevel = fuelLevel !== undefined ? Number(fuelLevel) : machine?.currentFuelLevel || 0;
        request.arrivalCondition = machineCondition || "Good";
        request.arrivalRemarks = remarks || "";
        request.documentsChecked = !!documentsChecked;
        if (arrivalPhotos.length > 0) request.arrivalPhotos = arrivalPhotos;
        request.updatedBy = req.user.id;
        await request.save();

        // Create Canonical MachineAssignment
        const assignment = await MachineAssignment.create({
            machineId: request.machineId,
            projectId: request.projectId,
            requestId: request._id,
            assignmentStatus: "ACTIVE",
            assignedFrom: new Date(),
            assignedTo: request.requiredToDate || null,
            dispatchDate: request.dispatchedAt,
            siteReceivedDate: new Date(),
            assignedBy: req.user.id,
            notes: remarks || `Received from machine request #${request.requestNumber}`,
        });

        // Update Machine Master with latest meter, fuel, and status
        if (machine) {
            machine.status = "Assigned";
            if (openingMeterReading !== undefined) {
                machine.currentMeterReading = Math.max(machine.currentMeterReading || 0, Number(openingMeterReading));
            }
            if (fuelLevel !== undefined) {
                machine.currentFuelLevel = Number(fuelLevel);
            }
            await machine.save();
        }

        await logAudit({ module: "MachineRequest", entityId: request._id, action: "received_at_site", performedBy: req.user.id, meta: { assignmentId: assignment._id } });
        await notifyRoles({ roles: ["manager", "admin"], projectId: request.projectId, title: "Machine accepted at site", message: `${request.machineType} received and active`, module: "Machinery", referenceType: "MachineRequest", referenceId: request._id });

        return success(res, 200, "Machine accepted at site and assignment is now active", { request, assignment });
    } catch (error) {
        return fail(res, 500, "Error receiving machine at site", error);
    }
};

/**
 * PATCH /api/machinery/requests/:id/site-reject
 * Site inspection failure / rejection flow
 */
export const rejectMachineAtSite = async (req, res) => {
    try {
        const { reason, remarks } = req.body;
        if (!reason) return fail(res, 400, "A reason is required to reject machine arrival");

        const request = await MachineRequest.findById(req.params.id);
        if (!request) return fail(res, 404, "Machine request not found");
        if (request.status !== "DISPATCHED") return fail(res, 400, `Only dispatched requests can be rejected at site (currently ${request.status})`);

        request.status = "SITE_REJECTED";
        request.siteRejectionReason = reason;
        request.siteRejectedBy = req.user.id;
        request.siteRejectedAt = new Date();
        request.remarks = remarks ? `${request.remarks || ""}\nSite Rejection: ${remarks}` : request.remarks;
        request.updatedBy = req.user.id;
        await request.save();

        // Release machine back
        const machine = await Machine.findById(request.machineId);
        if (machine) {
            // If rejected due to damage or mechanical issue, flag machine as Breakdown
            if (reason.toLowerCase().includes("damage") || reason.toLowerCase().includes("mechanical") || reason.toLowerCase().includes("unsafe")) {
                machine.status = "Breakdown";
            } else {
                machine.status = "Available";
            }
            await machine.save();
        }

        await logAudit({ module: "MachineRequest", entityId: request._id, action: "site_rejected", performedBy: req.user.id, remarks: reason });
        await notifyRoles({ roles: ["admin", "manager"], projectId: request.projectId, title: "Machine rejected at site arrival", message: `Reason: ${reason}`, module: "Machinery", referenceType: "MachineRequest", referenceId: request._id });

        return success(res, 200, "Machine arrival rejected at site", request);
    } catch (error) {
        return fail(res, 500, "Error rejecting machine at site", error);
    }
};

/** PATCH /api/machinery/requests/:id/cancel */
export const cancelMachineRequest = async (req, res) => {
    try {
        const request = await MachineRequest.findById(req.params.id);
        if (!request) return fail(res, 404, "Machine request not found");

        if (["DISPATCHED", "RECEIVED_AT_SITE", "ACTIVE"].includes(request.status)) {
            return fail(res, 400, `Cannot cancel request in ${request.status} status. Use release instead.`);
        }

        request.status = "CANCELLED";
        request.updatedBy = req.user.id;
        await request.save();

        // If a machine was allocated, reset its status to Available
        if (request.machineId) {
            await Machine.findByIdAndUpdate(request.machineId, { status: "Available" });
        }

        await logAudit({ module: "MachineRequest", entityId: request._id, action: "cancelled", performedBy: req.user.id });
        return success(res, 200, "Machine request cancelled", request);
    } catch (error) {
        return fail(res, 500, "Error cancelling machine request", error);
    }
};

/** PATCH /api/machinery/requests/:id/release */
export const releaseMachineRequest = async (req, res) => {
    try {
        const { reason } = req.body;
        const request = await MachineRequest.findById(req.params.id);
        if (!request) return fail(res, 404, "Machine request not found");

        request.status = "RELEASED";
        request.releasedAt = new Date();
        request.releasedBy = req.user.id;
        request.updatedBy = req.user.id;
        await request.save();

        if (request.machineId) {
            // Close active assignments
            await MachineAssignment.updateMany(
                { machineId: request.machineId, releaseDate: null },
                {
                    releaseDate: new Date(),
                    assignmentStatus: "RELEASED",
                    releasedBy: req.user.id,
                    releaseReason: reason || "Released from machine request",
                }
            );

            // Reset machine status
            const machine = await Machine.findById(request.machineId);
            if (machine) {
                machine.status = machine.ownedOrRented === "Rented" ? "Available" : "Available";
                await machine.save();
            }
        }

        await logAudit({ module: "MachineRequest", entityId: request._id, action: "released", performedBy: req.user.id });
        return success(res, 200, "Machine released", request);
    } catch (error) {
        return fail(res, 500, "Error releasing machine", error);
    }
};

/** GET /api/machinery/requests/:id/history */
export const getMachineRequestHistory = async (req, res) => {
    try {
        const request = await MachineRequest.findById(req.params.id)
            .populate("approvedBy dispatchedBy receivedBy releasedBy requestedBy siteRejectedBy", "name role")
            .populate("machineId", "machineNumber machineType brand model status")
            .populate("vendorId", "name contactPerson phone");
        if (!request) return fail(res, 404, "Machine request not found");
        return success(res, 200, "Machine request history fetched", request);
    } catch (error) {
        return fail(res, 500, "Error fetching history", error);
    }
};

