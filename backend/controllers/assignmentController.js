import MachineAssignment from "../models/MachineAssignment.js";
import Machine from "../models/Machine.js";
import { checkMachineAvailability } from "../services/machineAvailabilityService.js";

// --------------------------
// 1️⃣ Assign Machine
// --------------------------
export const assignMachine = async (req, res) => {
  try {
    const { machineId, projectId, operatorId, assignedFrom, assignedTo, notes } = req.body;

    if (!machineId || !projectId) {
      return res.status(400).json({ message: "Machine ID & Project ID are required" });
    }

    // Centralized Availability Check (checks maintenance, breakdown, existing assignments, and expired docs)
    const availCheck = await checkMachineAvailability({
      machineId,
      requiredFrom: assignedFrom || new Date(),
      requiredTo: assignedTo || null,
    });

    if (!availCheck.available) {
      return res.status(409).json({
        message: availCheck.reason,
        conflict: availCheck.conflict,
      });
    }

    const machine = availCheck.machine;

    const record = await MachineAssignment.create({
      machineId,
      projectId,
      operatorId: operatorId || null,
      assignmentStatus: "ACTIVE",
      assignedFrom: assignedFrom ? new Date(assignedFrom) : new Date(),
      assignedTo: assignedTo ? new Date(assignedTo) : null,
      notes: notes || "",
      assignedBy: req.user?._id || req.user?.id || null,
      operatorHistory: operatorId
        ? [
            {
              action: "Assigned",
              previousOperatorId: null,
              newOperatorId: operatorId,
              reason: "Initial assignment",
              changedBy: req.user?._id || req.user?.id,
              changedAt: new Date(),
            },
          ]
        : [],
    });

    // Update machine status
    machine.status = "Assigned";
    await machine.save();

    return res.status(201).json({
      message: "Machine assigned successfully",
      assignment: record,
    });
  } catch (error) {
    return res.status(500).json({ message: "Error assigning machine", error: error.message });
  }
};

// --------------------------
// 2️⃣ Release Machine
// --------------------------
export const releaseMachine = async (req, res) => {
  try {
    const { machineId, assignmentId, reason } = req.body;

    const query = assignmentId
      ? { _id: assignmentId }
      : { machineId, releaseDate: null };

    const active = await MachineAssignment.findOne(query);

    if (!active) {
      return res.status(404).json({ message: "Active machine assignment not found" });
    }

    active.releaseDate = new Date();
    active.assignmentStatus = "RELEASED";
    active.releasedBy = req.user?._id || req.user?.id || null;
    active.releaseReason = reason || "Project completed";
    await active.save();

    // Reset machine status to Available
    await Machine.findByIdAndUpdate(active.machineId, { status: "Available" });

    return res.status(200).json({
      message: "Machine released successfully",
      assignment: active,
    });
  } catch (error) {
    return res.status(500).json({ message: "Error releasing machine", error: error.message });
  }
};

// --------------------------
// 3️⃣ Transfer Machine Between Projects
// --------------------------
export const transferMachine = async (req, res) => {
  try {
    const { machineId, assignmentId, toProjectId, reason, notes } = req.body;

    if (!toProjectId) {
      return res.status(400).json({ message: "Target project ID (toProjectId) is required" });
    }

    const query = assignmentId
      ? { _id: assignmentId }
      : { machineId, releaseDate: null };

    const currentAssignment = await MachineAssignment.findOne(query).populate("projectId", "name code");

    if (!currentAssignment) {
      return res.status(404).json({ message: "Active assignment for machine not found" });
    }

    if (String(currentAssignment.projectId._id || currentAssignment.projectId) === String(toProjectId)) {
      return res.status(400).json({ message: "Cannot transfer machine to the same project" });
    }

    const prevProjectName = currentAssignment.projectId?.name || "Previous Project";

    // 1. Close current assignment as TRANSFERRED
    currentAssignment.releaseDate = new Date();
    currentAssignment.assignmentStatus = "TRANSFERRED";
    currentAssignment.releasedBy = req.user?._id || req.user?.id || null;
    currentAssignment.releaseReason = `Transferred to new project: ${reason || "Reallocation"}`;
    currentAssignment.transferDetails = {
      targetProjectId: toProjectId,
      transferredAt: new Date(),
      remarks: reason || "",
    };
    await currentAssignment.save();

    // 2. Create new assignment for target project
    const newAssignment = await MachineAssignment.create({
      machineId: currentAssignment.machineId,
      projectId: toProjectId,
      operatorId: currentAssignment.operatorId || null,
      assignmentStatus: "ACTIVE",
      assignedFrom: new Date(),
      assignedTo: null,
      notes: notes || `Transferred from ${prevProjectName}. Reason: ${reason || "Reallocation"}`,
      assignedBy: req.user?._id || req.user?.id || null,
      operatorHistory: currentAssignment.operatorId
        ? [
            {
              action: "Assigned",
              previousOperatorId: null,
              newOperatorId: currentAssignment.operatorId,
              reason: `Carried over from transfer from ${prevProjectName}`,
              changedBy: req.user?._id || req.user?.id,
              changedAt: new Date(),
            },
          ]
        : [],
    });

    return res.status(200).json({
      message: "Machine transferred successfully",
      previousAssignment: currentAssignment,
      newAssignment,
    });
  } catch (error) {
    return res.status(500).json({ message: "Error transferring machine", error: error.message });
  }
};

// --------------------------
// 4️⃣ Get Active Assigned Machines
// --------------------------
export const getActiveAssignments = async (req, res) => {
  try {
    const active = await MachineAssignment.find({
      releaseDate: null,
      assignmentStatus: { $in: ["ACTIVE", "DISPATCHED"] },
    })
      .populate("machineId", "machineNumber machineType brand model status currentMeterReading currentFuelLevel hourlyRate dailyRate")
      .populate("projectId", "name code")
      .populate("operatorId", "name labourId phone category")
      .populate("assignedBy", "name role");

    return res.status(200).json({ active });
  } catch (error) {
    return res.status(500).json({ message: "Error fetching active assignments", error: error.message });
  }
};

// --------------------------
// 5️⃣ Assignment History
// --------------------------
export const getAssignmentHistory = async (req, res) => {
  try {
    const { machineId } = req.params;

    const history = await MachineAssignment.find({ machineId })
      .sort({ createdAt: -1 })
      .populate("machineId", "machineNumber machineType brand model")
      .populate("projectId", "name code")
      .populate("operatorId", "name labourId phone category")
      .populate("assignedBy", "name role")
      .populate("releasedBy", "name role")
      .populate("transferDetails.targetProjectId", "name code")
      .populate("operatorHistory.previousOperatorId", "name labourId category")
      .populate("operatorHistory.newOperatorId", "name labourId category");

    return res.status(200).json({ history });
  } catch (error) {
    return res.status(500).json({ message: "Error getting history", error: error.message });
  }
};

