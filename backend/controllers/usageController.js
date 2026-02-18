import DailyUsage from "../models/DailyUsage.js";
import mongoose from "mongoose";

/* add or update daily usage (one per machine per day) */
export const upsertDailyUsage = async (req, res) => {
  try {
    const { machineId, projectId, operatorId, date, hoursRun, fuelUsed, breakdown, notes } = req.body;
    if (!machineId || !date) return res.status(400).json({ message: "machineId and date required" });

    const d = new Date(date);
    d.setHours(0,0,0,0);

    const upd = {
      machineId, projectId, operatorId, date: d,
      hoursRun: hoursRun ?? 0,
      fuelUsed: fuelUsed ?? 0,
      breakdown: !!breakdown,
      notes
    };

    const usage = await DailyUsage.findOneAndUpdate(
      { machineId: mongoose.Types.ObjectId(machineId), date: d },
      { $set: upd },
      { upsert: true, new: true }
    );

    res.json({ message: "Daily usage saved", usage });
  } catch (err) {
    res.status(500).json({ message: "Error", error: err.message });
  }
};

export const getDailyUsage = async (req, res) => {
  try {
    const { machineId, date } = req.query;
    const q = {};
    if (machineId) q.machineId = machineId;
    if (date) {
      const d = new Date(date); d.setHours(0,0,0,0);
      const d2 = new Date(d); d2.setDate(d2.getDate()+1);
      q.date = { $gte: d, $lt: d2 };
    }
    const list = await DailyUsage.find(q).sort({ date: -1 });
    res.json({ message: "Daily usage", list });
  } catch (err) {
    res.status(500).json({ message: "Error", error: err.message });
  }
};
