import Machine from "../models/Machine.js";
import MachineUsage from "../models/MachineUsage.js";

export const addMachineUsage = async (req, res) => {
  try {
    const {
      machineId,
      projectId,
      usageDate,
      workingHours,
      idleHours,
      breakdownHours,
      remarks,
    } = req.body;

    if (!machineId || !projectId || !usageDate) {
      return res.status(400).json({ message: "machineId, projectId & usageDate are required" });
    }

    const machine = await Machine.findById(machineId);
    if (!machine) return res.status(404).json({ message: "Machine not found" });

    const usage = await MachineUsage.create({
      machineId,
      projectId,
      usageDate,
      workingHours: workingHours || 0,
      idleHours: idleHours || 0,
      breakdownHours: breakdownHours || 0,
      remarks,
      enteredBy: req.user?.id || null,
    });

    res.status(201).json({ message: "Usage entry added", data: usage });
  } catch (error) {
    res.status(500).json({ message: "Error adding usage", error: error.message });
  }
};

export const getMachineUsage = async (req, res) => {
  try {
    const { projectId, machineId, fromDate, toDate } = req.query;

    const filter = {};
    if (projectId) filter.projectId = projectId;
    if (machineId) filter.machineId = machineId;

    if (fromDate || toDate) {
      filter.usageDate = {};
      if (fromDate) filter.usageDate.$gte = new Date(fromDate);
      if (toDate) filter.usageDate.$lte = new Date(toDate);
    }

    const entries = await MachineUsage.find(filter)
      .populate("machineId", "name machineType ownership")
      .populate("projectId", "projectName projectCode")
      .sort({ usageDate: -1 });

    res.status(200).json({ message: "Machine usage entries", data: entries });
  } catch (error) {
    res.status(500).json({ message: "Error fetching usage", error: error.message });
  }
};
