import Machine from "../models/Machine.js";
import MachineAllocation from "../models/MachineAllocation.js";

// ALLOCATE MACHINE TO PROJECT
export const allocateMachine = async (req, res) => {
  try {
    const { machineId, projectId, operatorName, startDate, remarks } = req.body;

    if (!machineId || !projectId || !startDate) {
      return res.status(400).json({ message: "machineId, projectId & startDate are required" });
    }

    const machine = await Machine.findById(machineId);
    if (!machine) return res.status(404).json({ message: "Machine not found" });

    // check if already allocated active wise
    const activeAllocation = await MachineAllocation.findOne({
      machineId,
      status: "Allocated",
    });

    if (activeAllocation) {
      return res
        .status(400)
        .json({ message: "Machine already allocated to a project. Release first." });
    }

    const allocation = await MachineAllocation.create({
      machineId,
      projectId,
      operatorName,
      startDate,
      remarks,
      assignedBy: req.user?.id || null,
    });

    // update machine currentProjectId
    machine.currentProjectId = projectId;
    await machine.save();

    res.status(201).json({ message: "Machine allocated successfully", data: allocation });
  } catch (error) {
    console.error("Allocate Machine Error:", error);
    res.status(500).json({ message: "Error allocating machine", error: error.message });
  }
};

// RELEASE MACHINE FROM PROJECT
export const releaseMachine = async (req, res) => {
  try {
    const { allocationId, endDate, remarks } = req.body;

    const allocation = await MachineAllocation.findById(allocationId);
    if (!allocation) return res.status(404).json({ message: "Allocation not found" });

    if (allocation.status === "Released") {
      return res.status(400).json({ message: "Machine already released" });
    }

    allocation.status = "Released";
    allocation.endDate = endDate || new Date();
    if (remarks) allocation.remarks = remarks;
    await allocation.save();

    // Clear machine currentProjectId
    await Machine.findByIdAndUpdate(allocation.machineId, { currentProjectId: null });

    res.status(200).json({ message: "Machine released from project", data: allocation });
  } catch (error) {
    res.status(500).json({ message: "Error releasing machine", error: error.message });
  }
};

// GET ALLOCATIONS (optional filter by project or machine)
export const getAllocations = async (req, res) => {
  try {
    const { projectId, machineId, status } = req.query;
    const filter = {};

    if (projectId) filter.projectId = projectId;
    if (machineId) filter.machineId = machineId;
    if (status) filter.status = status;

    const allocations = await MachineAllocation.find(filter)
      .populate("machineId", "name machineType ownership")
      .populate("projectId", "projectName projectCode")
      .sort({ createdAt: -1 });

    res.status(200).json({ message: "Machine allocations", data: allocations });
  } catch (error) {
    res.status(500).json({ message: "Error fetching allocations", error: error.message });
  }
};
