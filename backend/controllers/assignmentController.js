import MachineAssignment from "../models/MachineAssignment.js";
import Machine from "../models/Machine.js";

// --------------------------
// 1️⃣ Assign Machine
// --------------------------
export const assignMachine = async (req, res) => {
  try {
    const { machineId, projectId, operatorId, notes } = req.body;

    if (!machineId || !projectId) {
      return res.status(400).json({ message: "Machine ID & Project ID required" });
    }

    // Check if already active assignment exists
    const active = await MachineAssignment.findOne({
      machineId,
      releaseDate: null,
    });

    if (active) {
      return res.status(400).json({ message: "Machine already assigned to another project" });
    }

    const record = await MachineAssignment.create({
      machineId,
      projectId,
      operatorId,
      notes,
      assignedBy: req.user?._id || null,
      assignDate: new Date(),
    });

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
    const { machineId } = req.body;

    if (!machineId) return res.status(400).json({ message: "machineId required" });

    const active = await MachineAssignment.findOne({
      machineId,
      releaseDate: null,
    });

    if (!active) {
      return res.status(404).json({ message: "Machine is not assigned to any project" });
    }

    active.releaseDate = new Date();
    await active.save();

    return res.status(200).json({
      message: "Machine released successfully",
      assignment: active,
    });

  } catch (error) {
    return res.status(500).json({ message: "Error releasing machine", error: error.message });
  }
};


// --------------------------
// 3️⃣ Get Active Assigned Machines
// --------------------------
export const getActiveAssignments = async (req, res) => {
  try {
    const active = await MachineAssignment.find({ releaseDate: null })
      .populate("machineId", "machineNumber machineType")
      .populate("operatorId", "name phone")
      .populate("assignedBy", "name");

    return res.status(200).json({ active });
  } catch (error) {
    return res.status(500).json({ message: "Error fetching active assignments", error: error.message });
  }
};


// --------------------------
// 4️⃣ Assignment History
// --------------------------
export const getAssignmentHistory = async (req, res) => {
  try {
    const { machineId } = req.params;

    const history = await MachineAssignment.find({ machineId })
      .sort({ assignDate: -1 })
      .populate("operatorId", "name phone")
      .populate("assignedBy", "name");

    return res.status(200).json({ history });

  } catch (error) {
    return res.status(500).json({ message: "Error getting history", error: error.message });
  }
};
