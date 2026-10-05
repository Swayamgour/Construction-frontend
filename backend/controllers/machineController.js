import Machine from "../models/Machine.js";
import MachineMaintenance from "../models/MachineMaintenance.js";
import MachineAssignment from "../models/MachineAssignment.js";
import MachineOperatorLog from "../models/MachineOperatorLog.js";
import MachineDocument from "../models/MachineDocument.js";
import MachineRequest from "../models/MachineRequest.js";
import mongoose from "mongoose";
import { uploadToCloudinary } from "../utils/cloudUpload.js";

export const addMachine = async (req, res) => {
  try {
    const {
      machineNumber,
      brand,
      model,
      engineNumber,
      chassisNumber,
      machineType,
      ownedOrRented,
      hourlyRate,
      dailyRate,
      monthlyRate,
      currentMeterReading,
      currentFuelLevel,
      status,
      purchaseDate,
      rcExpiry,
      insuranceExpiry,
      notes,
      vendorId,
      rentalDetails,
    } = req.body;

    const doc = {
      machineNumber,
      brand: brand || "",
      model: model || "",
      engineNumber,
      chassisNumber,
      machineType,
      ownedOrRented: (ownedOrRented || "owned").toLowerCase(),
      hourlyRate: Number(hourlyRate) || 0,
      dailyRate: Number(dailyRate) || 0,
      monthlyRate: Number(monthlyRate) || 0,
      currentMeterReading: Number(currentMeterReading) || 0,
      currentFuelLevel: Number(currentFuelLevel) || 0,
      status: status || "Available",
      notes: notes || "",
    };

    if (purchaseDate) doc.purchaseDate = new Date(purchaseDate);
    if (rcExpiry) doc.rcExpiry = new Date(rcExpiry);
    if (insuranceExpiry) doc.insuranceExpiry = new Date(insuranceExpiry);
    if (vendorId && mongoose.isValidObjectId(vendorId)) doc.vendorId = vendorId;
    if (rentalDetails) {
      try {
        doc.rentalDetails = typeof rentalDetails === "string" ? JSON.parse(rentalDetails) : rentalDetails;
      } catch (_) {}
    }

    // 📌 Upload photo to Cloudinary
    if (req.files?.photo) {
      doc.photo = await uploadToCloudinary(req.files.photo[0], "machine/photos");
    }

    // 📌 Upload RC file
    if (req.files?.rcFile) {
      doc.rcFile = await uploadToCloudinary(req.files.rcFile[0], "machine/rc");
    }

    // 📌 Upload insurance file
    if (req.files?.insuranceFile) {
      doc.insuranceFile = await uploadToCloudinary(req.files.insuranceFile[0], "machine/insurance");
    }

    const machine = await Machine.create(doc);

    res.status(201).json({
      message: "Machine added successfully",
      machine,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        message: `Machine with number '${req.body.machineNumber}' already exists`,
        error: err.message,
      });
    }
    res.status(500).json({
      message: "Error adding machine",
      error: err.message,
    });
  }
};

export const getAllMachines = async (req, res) => {
  try {
    const machines = await Machine.find().sort({ createdAt: -1 });

    // Populate active assignments
    const activeAssignments = await MachineAssignment.find({
      assignmentStatus: { $in: ["ACTIVE", "DISPATCHED"] },
      releaseDate: null,
    })
      .populate("projectId", "name code")
      .populate("operatorId", "name labourId phone category");

    const assignmentMap = new Map();
    activeAssignments.forEach((a) => {
      assignmentMap.set(String(a.machineId), a);
    });

    const enrichedMachines = machines.map((m) => {
      const activeAssign = assignmentMap.get(String(m._id));
      const obj = m.toObject();
      obj.isAssigned = !!activeAssign;
      obj.activeAssignment = activeAssign || null;
      return obj;
    });

    res.json({ message: "Machines fetched", machines: enrichedMachines });
  } catch (err) {
    res.status(500).json({ message: "Error fetching machines", error: err.message });
  }
};

/* get single machine + complete 360° history summary */
export const getMachineDetails = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: "Invalid id" });

    const machine = await Machine.findById(id).populate("vendorId", "name contactPerson phone");
    if (!machine) return res.status(404).json({ message: "Machine not found" });

    const [maintenance, assignments, logs, documents] = await Promise.all([
      MachineMaintenance.find({ machineId: id })
        .populate("reportedBy", "name role")
        .populate("projectId", "name code")
        .sort({ serviceDate: -1 }),
      MachineAssignment.find({ machineId: id })
        .populate("projectId", "name code")
        .populate("operatorId", "name labourId phone category")
        .populate("assignedBy", "name role")
        .populate("releasedBy", "name role")
        .populate("operatorHistory.previousOperatorId", "name labourId category")
        .populate("operatorHistory.newOperatorId", "name labourId category")
        .populate("operatorHistory.changedBy", "name role")
        .sort({ createdAt: -1 }),
      MachineOperatorLog.find({ machineId: id })
        .populate("operatorId", "name labourId phone category")
        .populate("projectId", "name code")
        .sort({ date: -1 })
        .limit(50),
      MachineDocument.find({ machineId: id })
        .populate("uploadedBy", "name role")
        .populate("verifiedBy", "name role")
        .sort({ createdAt: -1 }),
    ]);

    // Calculate aggregated metrics
    const totalWorkingHours = logs.reduce((sum, l) => sum + (l.workingHours || 0), 0);
    const totalFuelConsumed = logs.reduce((sum, l) => sum + (l.fuelConsumed || 0), 0);
    const totalFuelCost = logs.reduce((sum, l) => sum + (l.fuelCost || 0), 0);
    const totalUsageCost = logs.reduce((sum, l) => sum + (l.machineUsageCost || 0), 0);
    const totalMaintenanceCost = maintenance.reduce((sum, m) => sum + (m.cost || m.totalCost || 0), 0);
    const totalOperationalCost = totalUsageCost + totalFuelCost + totalMaintenanceCost;

    const summary = {
      totalWorkingHours: Number(totalWorkingHours.toFixed(2)),
      totalFuelConsumed: Number(totalFuelConsumed.toFixed(2)),
      totalFuelCost: Number(totalFuelCost.toFixed(2)),
      totalUsageCost: Number(totalUsageCost.toFixed(2)),
      totalMaintenanceCost: Number(totalMaintenanceCost.toFixed(2)),
      totalOperationalCost: Number(totalOperationalCost.toFixed(2)),
    };

    // Active assignment
    const activeAssignment = assignments.find((a) => !a.releaseDate && ["ACTIVE", "DISPATCHED"].includes(a.assignmentStatus)) || null;

    res.json({
      message: "Machine details",
      machine,
      activeAssignment,
      maintenance,
      assignments,
      logs,
      documents,
      summary,
      totalMaintenanceCost,
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching machine details", error: err.message });
  }
};

/**
 * PUT /api/machines/:id
 */
export const updateMachine = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: "Invalid id" });

    const machine = await Machine.findById(id);
    if (!machine) return res.status(404).json({ message: "Machine not found" });

    const {
      machineNumber,
      brand,
      model,
      engineNumber,
      chassisNumber,
      machineType,
      ownedOrRented,
      hourlyRate,
      dailyRate,
      monthlyRate,
      currentMeterReading,
      currentFuelLevel,
      status,
      purchaseDate,
      rcExpiry,
      insuranceExpiry,
      notes,
      active,
      vendorId,
      rentalDetails,
    } = req.body;

    if (machineNumber !== undefined) machine.machineNumber = machineNumber;
    if (brand !== undefined) machine.brand = brand;
    if (model !== undefined) machine.model = model;
    if (engineNumber !== undefined) machine.engineNumber = engineNumber;
    if (chassisNumber !== undefined) machine.chassisNumber = chassisNumber;
    if (machineType !== undefined) machine.machineType = machineType;
    if (ownedOrRented !== undefined) machine.ownedOrRented = ownedOrRented.toLowerCase();
    if (hourlyRate !== undefined) machine.hourlyRate = Number(hourlyRate);
    if (dailyRate !== undefined) machine.dailyRate = Number(dailyRate);
    if (monthlyRate !== undefined) machine.monthlyRate = Number(monthlyRate);
    if (currentMeterReading !== undefined) machine.currentMeterReading = Number(currentMeterReading);
    if (currentFuelLevel !== undefined) machine.currentFuelLevel = Number(currentFuelLevel);
    if (status !== undefined) machine.status = status;
    if (purchaseDate) machine.purchaseDate = new Date(purchaseDate);
    if (rcExpiry) machine.rcExpiry = new Date(rcExpiry);
    if (insuranceExpiry) machine.insuranceExpiry = new Date(insuranceExpiry);
    if (notes !== undefined) machine.notes = notes;
    if (active !== undefined) machine.active = active;
    if (vendorId !== undefined) {
      machine.vendorId = (vendorId && mongoose.isValidObjectId(vendorId)) ? vendorId : null;
    }
    if (rentalDetails) {
      try {
        machine.rentalDetails = typeof rentalDetails === "string" ? JSON.parse(rentalDetails) : rentalDetails;
      } catch (_) {}
    }

    if (req.files?.photo) machine.photo = await uploadToCloudinary(req.files.photo[0], "machine/photos");
    if (req.files?.rcFile) machine.rcFile = await uploadToCloudinary(req.files.rcFile[0], "machine/rc");
    if (req.files?.insuranceFile) machine.insuranceFile = await uploadToCloudinary(req.files.insuranceFile[0], "machine/insurance");

    await machine.save();

    res.status(200).json({ message: "Machine updated successfully", data: machine, machine });
  } catch (err) {
    res.status(500).json({ message: "Error updating machine", error: err.message });
  }
};

/**
 * DELETE /api/machines/:id
 */
export const deleteMachine = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: "Invalid id" });

    const activeAssignment = await MachineAssignment.findOne({ machineId: id, releaseDate: null });
    if (activeAssignment) {
      return res.status(400).json({ message: "Cannot delete a machine with an active project assignment. Release it first." });
    }

    const machine = await Machine.findByIdAndDelete(id);
    if (!machine) return res.status(404).json({ message: "Machine not found" });

    res.status(200).json({ message: "Machine deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting machine", error: err.message });
  }
};

/**
 * GET /api/machines/dashboard/stats
 * Real aggregated Machine Dashboard KPIs
 */
export const getMachineDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    const thirtyDaysLater = new Date();
    thirtyDaysLater.setDate(today.getDate() + 30);

    const [
      totalMachines,
      availableMachines,
      assignedMachines,
      maintenanceMachines,
      breakdownMachines,
      rentedMachines,
      expiringDocsCount,
      activeAssignmentsCount,
      openRequestsCount,
      operatorLogsAgg,
      maintenanceAgg,
    ] = await Promise.all([
      Machine.countDocuments(),
      Machine.countDocuments({ status: "Available", active: true }),
      Machine.countDocuments({ status: "Assigned", active: true }),
      Machine.countDocuments({ status: "Under Maintenance" }),
      Machine.countDocuments({ status: "Breakdown" }),
      Machine.countDocuments({ ownedOrRented: "Rented" }),
      MachineDocument.countDocuments({ expiryDate: { $gte: today, $lte: thirtyDaysLater } }),
      MachineAssignment.countDocuments({ releaseDate: null, assignmentStatus: { $in: ["ACTIVE", "DISPATCHED"] } }),
      MachineRequest.countDocuments({ status: { $in: ["REQUESTED", "ADMIN_REVIEW", "APPROVED"] } }),
      MachineOperatorLog.aggregate([
        {
          $group: {
            _id: null,
            totalHours: { $sum: "$workingHours" },
            totalFuelConsumed: { $sum: "$fuelConsumed" },
            totalUsageCost: { $sum: "$machineUsageCost" },
            totalFuelCost: { $sum: "$fuelCost" },
          },
        },
      ]),
      MachineMaintenance.aggregate([
        {
          $group: {
            _id: null,
            totalMaintenanceCost: { $sum: { $ifNull: ["$cost", "$totalCost"] } },
          },
        },
      ]),
    ]);

    const totalUsageCost = operatorLogsAgg[0]?.totalUsageCost || 0;
    const totalFuelCost = operatorLogsAgg[0]?.totalFuelCost || 0;
    const totalMaintenanceCost = maintenanceAgg[0]?.totalMaintenanceCost || 0;
    const totalOperationalCost = totalUsageCost + totalFuelCost + totalMaintenanceCost;

    return res.status(200).json({
      success: true,
      stats: {
        totalMachines,
        available: availableMachines,
        assigned: assignedMachines,
        active: activeAssignmentsCount,
        maintenance: maintenanceMachines,
        breakdown: breakdownMachines,
        rented: rentedMachines,
        documentsExpiring: expiringDocsCount,
        activeAssignments: activeAssignmentsCount,
        openRequests: openRequestsCount,
        totalWorkingHours: Number((operatorLogsAgg[0]?.totalHours || 0).toFixed(2)),
        totalFuelConsumed: Number((operatorLogsAgg[0]?.totalFuelConsumed || 0).toFixed(2)),
        totalUsageCost: Number(totalUsageCost.toFixed(2)),
        totalFuelCost: Number(totalFuelCost.toFixed(2)),
        totalMaintenanceCost: Number(totalMaintenanceCost.toFixed(2)),
        totalOperationalCost: Number(totalOperationalCost.toFixed(2)),
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching dashboard stats", error: err.message });
  }
};

