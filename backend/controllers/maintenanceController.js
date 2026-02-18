import MachineMaintenance from "../models/MachineMaintenance.js";
import Machine from "../models/Machine.js";

export const addMaintenance = async (req, res) => {
  try {
    const { machineId, serviceDate, serviceType, description, vendorName, cost, nextServiceOn } = req.body;
    if (!machineId || !serviceDate || !serviceType) return res.status(400).json({ message: "Required fields missing" });

    const doc = {
      machineId, serviceDate: new Date(serviceDate), serviceType, description, vendorName,
      cost: cost ? Number(cost) : 0, nextServiceOn: nextServiceOn ? new Date(nextServiceOn) : null,
      billFile: req.file?.path || null,
      createdBy: req.user?._id || null
    };
    const rec = await MachineMaintenance.create(doc);

    // optional: update machine nextService reminder field (if you want)
    if (doc.nextServiceOn) {
      await Machine.findByIdAndUpdate(machineId, { $set: { nextServiceOn: doc.nextServiceOn } });
    }

    res.status(201).json({ message: "Maintenance added", maintenance: rec });
  } catch (err) {
    res.status(500).json({ message: "Error", error: err.message });
  }
};

export const getMaintenanceHistory = async (req, res) => {
  try {
    const { machineId } = req.params;
    const history = await MachineMaintenance.find({ machineId }).sort({ serviceDate: -1 });
    res.json({ message: "History", history });
  } catch (err) {
    res.status(500).json({ message: "Error", error: err.message });
  }
};
