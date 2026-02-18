import Machine from "../models/Machine.js";
import MachineMaintenance from "../models/MachineMaintenance.js";
import MachineAssignment from "../models/MachineAssignment.js";
import DailyUsage from "../models/DailyUsage.js";
import mongoose from "mongoose";
/* get all machines */
// import MachineAssignment from "../models/MachineAssignment.js";
// import Machine from "../models/Machine.js";

// import Machine from "../models/Machine.js";
import { uploadToCloudinary } from "../utils/cloudUpload.js";

export const addMachine = async (req, res) => {
  try {
    const {
      machineNumber,
      engineNumber,
      chassisNumber,
      machineType,
      ownedOrRented,
      rcExpiry,
      insuranceExpiry,
      notes
    } = req.body;

    const doc = {
      machineNumber,
      engineNumber,
      chassisNumber,
      machineType,
      ownedOrRented,
      notes
    };

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

    if (rcExpiry) doc.rcExpiry = new Date(rcExpiry);
    if (insuranceExpiry) doc.insuranceExpiry = new Date(insuranceExpiry);

    const machine = await Machine.create(doc);

    res.status(201).json({
      message: "Machine added successfully",
      machine,
    });

  } catch (err) {
    res.status(500).json({
      message: "Error adding machine",
      error: err.message,
    });
  }
};




export const getAllMachines = async (req, res) => {
  try {
    const machines = await Machine.aggregate([
      // Join MachineAssignment table
      {
        $lookup: {
          from: "machineassignments",
          localField: "_id",
          foreignField: "machineId",
          as: "assignments"
        }
      },

      // isAssigned = true only if assignment exists with releaseDate = null
      {
        $addFields: {
          isAssigned: {
            $gt: [
              {
                $size: {
                  $filter: {
                    input: "$assignments",
                    as: "a",
                    cond: { $eq: ["$$a.releaseDate", null] } // Active assignment
                  }
                }
              },
              0
            ]
          },

          // Active assignment details
          activeAssignment: {
            $arrayElemAt: [
              {
                $filter: {
                  input: "$assignments",
                  as: "a",
                  cond: { $eq: ["$$a.releaseDate", null] }
                }
              },
              0
            ]
          }
        }
      },

      { $sort: { createdAt: -1 } }
    ]);

    res.json({ message: "Machines fetched", machines });

  } catch (err) {
    res.status(500).json({ message: "Error", error: err.message });
  }
};



/* get single machine + history summary */
export const getMachineDetails = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: "Invalid id" });

    const machine = await Machine.findById(id);
    if (!machine) return res.status(404).json({ message: "Not found" });

    const maintenance = await MachineMaintenance.find({ machineId: id }).sort({ serviceDate: -1 });
    const assignments = await MachineAssignment.find({ machineId: id }).sort({ assignDate: -1 });
    const usage = await DailyUsage.find({ machineId: id }).sort({ date: -1 }).limit(30);

    // total maintenance cost (example)
    const totalCost = maintenance.reduce((s, m) => s + (m.cost || 0), 0);

    res.json({ message: "Machine details", machine, maintenance, assignments, usage, totalMaintenanceCost: totalCost });
  } catch (err) {
    res.status(500).json({ message: "Error", error: err.message });
  }
};
