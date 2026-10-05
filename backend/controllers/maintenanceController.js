import MachineMaintenance from "../models/MachineMaintenance.js";
import Machine from "../models/Machine.js";
import MachineAssignment from "../models/MachineAssignment.js";
import { uploadToCloudinary } from "../utils/cloudUpload.js";
import { success, fail, getPagination, buildPagination, getDateRangeFilter } from "../utils/apiResponse.js";
import { logAudit } from "../utils/audit.js";
import { notifyRoles } from "../utils/notify.js";

export const addMaintenance = async (req, res) => {
  try {
    const { machineId, serviceDate, serviceType, description, vendorName, cost, labourCost, partsCost, nextServiceOn } = req.body;
    if (!machineId || !serviceDate || !serviceType) return res.status(400).json({ message: "Required fields missing" });

    const totalCost = (Number(cost) || 0) + (Number(labourCost) || 0) + (Number(partsCost) || 0);

    const doc = {
      machineId,
      serviceDate: new Date(serviceDate),
      serviceType,
      description,
      vendorName,
      cost: Number(cost) || totalCost,
      labourCost: Number(labourCost) || 0,
      partsCost: Number(partsCost) || 0,
      totalCost,
      nextServiceOn: nextServiceOn ? new Date(nextServiceOn) : null,
      billFile: req.file?.path || null,
      createdBy: req.user?._id || null,
      status: "Scheduled",
    };
    const rec = await MachineMaintenance.create(doc);

    // Update machine status to Under Maintenance
    const machine = await Machine.findById(machineId);
    if (machine) {
      if (doc.nextServiceOn) machine.nextServiceOn = doc.nextServiceOn;
      machine.status = "Under Maintenance";
      await machine.save();
    }

    res.status(201).json({ message: "Maintenance added", maintenance: rec });
  } catch (err) {
    res.status(500).json({ message: "Error", error: err.message });
  }
};

export const getMaintenanceHistory = async (req, res) => {
  try {
    const { machineId } = req.params;
    const history = await MachineMaintenance.find({ machineId })
      .populate("reportedBy", "name role")
      .populate("projectId", "name code")
      .sort({ serviceDate: -1 });
    res.json({ message: "History", history });
  } catch (err) {
    res.status(500).json({ message: "Error", error: err.message });
  }
};

/**
 * POST /api/machinery/:id/maintenance
 * Full maintenance record: breakdown / preventive / emergency / scheduled service.
 * Updates machine status to Breakdown or Under Maintenance.
 */
export const reportMaintenance = async (req, res) => {
  try {
    const {
      projectId,
      maintenanceType,
      issue,
      description,
      reportedDate,
      serviceDate,
      serviceProvider,
      cost,
      labourCost,
      partsCost,
      partsUsed,
      nextMaintenanceDate,
      machineMeterReading,
      nextServiceMeterReading,
      status,
      invoiceNumber,
    } = req.body;

    const machineId = req.params.id;
    const machine = await Machine.findById(machineId);
    if (!machine) return fail(res, 404, "Machine not found");

    const beforeImages = [];
    const afterImages = [];
    if (req.files?.beforeImages) {
      for (const f of req.files.beforeImages) beforeImages.push(await uploadToCloudinary(f, "machine/maintenance/before"));
    }
    if (req.files?.afterImages) {
      for (const f of req.files.afterImages) afterImages.push(await uploadToCloudinary(f, "machine/maintenance/after"));
    }
    let billFile = null;
    if (req.files?.invoice?.[0]) billFile = await uploadToCloudinary(req.files.invoice[0], "machine/maintenance/invoices");

    const calculatedTotalCost = (Number(cost) || 0) + (Number(labourCost) || 0) + (Number(partsCost) || 0);

    const record = await MachineMaintenance.create({
      machineId,
      projectId: projectId || null,
      serviceDate: serviceDate ? new Date(serviceDate) : new Date(),
      serviceType: maintenanceType || "scheduled service",
      maintenanceType: maintenanceType || "scheduled service",
      issue: issue || "",
      description: description || "",
      reportedDate: reportedDate ? new Date(reportedDate) : new Date(),
      reportedBy: req.user.id,
      serviceProvider: serviceProvider || "",
      cost: Number(cost) || calculatedTotalCost,
      labourCost: Number(labourCost) || 0,
      partsCost: Number(partsCost) || 0,
      totalCost: calculatedTotalCost,
      invoiceNumber: invoiceNumber || "",
      partsUsed: partsUsed ? (typeof partsUsed === "string" ? JSON.parse(partsUsed) : partsUsed) : [],
      billFile,
      beforeImages,
      afterImages,
      nextMaintenanceDate: nextMaintenanceDate || null,
      nextServiceOn: nextMaintenanceDate || null,
      machineMeterReading: machineMeterReading !== undefined ? Number(machineMeterReading) : machine.currentMeterReading || null,
      nextServiceMeterReading: nextServiceMeterReading !== undefined ? Number(nextServiceMeterReading) : null,
      status: status || "Reported",
      createdBy: req.user.id,
    });

    // Sync Machine status
    if (["Reported", "Scheduled", "InProgress"].includes(record.status)) {
      if (maintenanceType === "breakdown" || maintenanceType === "emergency") {
        machine.status = "Breakdown";
      } else {
        machine.status = "Under Maintenance";
      }
      if (nextServiceMeterReading) machine.nextServiceMeter = Number(nextServiceMeterReading);
      if (nextMaintenanceDate) machine.nextServiceOn = new Date(nextMaintenanceDate);
      await machine.save();
    }

    await logAudit({ module: "MachineMaintenance", entityId: record._id, action: "reported", performedBy: req.user.id, meta: { maintenanceType } });
    await notifyRoles({ roles: ["admin", "manager"], projectId: projectId || null, title: "Machine maintenance reported", message: `${machine.machineNumber}: ${issue || maintenanceType}`, module: "Machinery", referenceType: "MachineMaintenance", referenceId: record._id });

    return success(res, 201, "Maintenance record created", record);
  } catch (err) {
    return fail(res, 500, "Error creating maintenance record", err);
  }
};

/** PATCH /api/machinery/maintenance/:id/status */
export const updateMaintenanceStatus = async (req, res) => {
  try {
    const { status, cost, nextMaintenanceDate, nextServiceMeterReading } = req.body;
    const record = await MachineMaintenance.findById(req.params.id);
    if (!record) return fail(res, 404, "Maintenance record not found");

    if (status) record.status = status;
    if (cost !== undefined) record.cost = cost;
    if (nextMaintenanceDate) {
      record.nextMaintenanceDate = nextMaintenanceDate;
      record.nextServiceOn = nextMaintenanceDate;
    }
    if (nextServiceMeterReading !== undefined) {
      record.nextServiceMeterReading = Number(nextServiceMeterReading);
    }
    await record.save();

    // Check if machine status should be restored
    const machine = await Machine.findById(record.machineId);
    if (machine) {
      if (["Completed", "Cancelled"].includes(record.status)) {
        // If completed or cancelled, check if there is an active assignment
        const activeAssignment = await MachineAssignment.findOne({
          machineId: record.machineId,
          releaseDate: null,
          assignmentStatus: { $in: ["ACTIVE", "DISPATCHED"] },
        });

        machine.status = activeAssignment ? "Assigned" : "Available";
        if (record.nextMaintenanceDate) machine.nextServiceOn = record.nextMaintenanceDate;
        if (record.nextServiceMeterReading) machine.nextServiceMeter = record.nextServiceMeterReading;
        await machine.save();
      } else if (["Reported", "InProgress", "Scheduled"].includes(record.status)) {
        machine.status = record.maintenanceType === "breakdown" ? "Breakdown" : "Under Maintenance";
        await machine.save();
      }
    }

    await logAudit({ module: "MachineMaintenance", entityId: record._id, action: `status:${record.status}`, performedBy: req.user.id });
    return success(res, 200, "Maintenance record updated", record);
  } catch (err) {
    return fail(res, 500, "Error updating maintenance record", err);
  }
};

/** GET /api/machinery/maintenance/upcoming?days=15 — due by date. */
export const getUpcomingMaintenance = async (req, res) => {
  try {
    const days = Number(req.query.days) || 15;
    const today = new Date();
    const until = new Date();
    until.setDate(until.getDate() + days);

    const upcoming = await MachineMaintenance.find({
      status: { $ne: "Completed" },
      $or: [{ nextMaintenanceDate: { $gte: today, $lte: until } }, { nextServiceOn: { $gte: today, $lte: until } }],
    })
      .populate("machineId", "machineNumber machineType brand model status")
      .sort({ nextMaintenanceDate: 1 });

    return success(res, 200, "Upcoming maintenance fetched", upcoming);
  } catch (err) {
    return fail(res, 500, "Error fetching upcoming maintenance", err);
  }
};

/**
 * GET /api/machinery/maintenance/meter-due
 * Meter/hour-based maintenance due detection using cumulative Machine meter.
 */
export const getMeterBasedMaintenanceDue = async (req, res) => {
  try {
    const bufferHours = Number(req.query.bufferHours) || 200;

    // Fetch machines that have a nextServiceMeter configured
    const machinesWithMeterService = await Machine.find({
      nextServiceMeter: { $ne: null, $gt: 0 },
      active: true,
    });

    const due = [];
    for (const machine of machinesWithMeterService) {
      const currentMeter = machine.currentMeterReading || 0;
      const targetMeter = machine.nextServiceMeter;
      const remaining = targetMeter - currentMeter;

      if (remaining <= bufferHours) {
        due.push({
          machineId: machine._id,
          machine,
          currentMeter,
          nextServiceMeterReading: targetMeter,
          hoursRemaining: Number(remaining.toFixed(2)),
          status: remaining <= 0 ? "Overdue" : "Due Soon",
        });
      }
    }

    return success(res, 200, "Meter-based maintenance due fetched", due);
  } catch (err) {
    return fail(res, 500, "Error computing meter-based maintenance due", err);
  }
};

/** GET /api/machinery/:id/maintenance/full — filterable/paginated full history for a machine. */
export const getFullMaintenanceHistory = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req);
    const filter = { machineId: req.params.id };
    if (req.query.maintenanceType) filter.maintenanceType = req.query.maintenanceType;
    if (req.query.status) filter.status = req.query.status;
    Object.assign(filter, getDateRangeFilter(req, "serviceDate"));

    const [items, total] = await Promise.all([
      MachineMaintenance.find(filter)
        .populate("reportedBy", "name role")
        .populate("projectId", "name code")
        .sort({ serviceDate: -1 })
        .skip(skip)
        .limit(limit),
      MachineMaintenance.countDocuments(filter),
    ]);

    return success(res, 200, "Maintenance history fetched", items, buildPagination(page, limit, total));
  } catch (err) {
    return fail(res, 500, "Error fetching maintenance history", err);
  }
};

