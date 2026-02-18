import ProjectTask from "../models/ProjectTask.js";
import mongoose from "mongoose";

// Helper: validate ObjectId
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// 1️⃣ Create task
export const createTask = async (req, res) => {
  try {
    const { projectId } = req.params;
    const {
      name,
      description,
      startDate,
      endDate,
      progress,
      status,
      parentTask,
      dependencies,
      sortOrder,
    } = req.body;

    if (!projectId || !isValidId(projectId)) {
      return res.status(400).json({ message: "Valid projectId is required" });
    }
    if (!name || !startDate || !endDate) {
      return res
        .status(400)
        .json({ message: "name, startDate & endDate are required" });
    }

    const task = await ProjectTask.create({
      projectId,
      name,
      description,
      startDate,
      endDate,
      progress: progress ?? 0,
      status: status || "Planned",
      parentTask: parentTask || null,
      dependencies: dependencies || [],
      sortOrder: sortOrder ?? 0,
      createdBy: req.user?.id || null,
    });

    return res.status(201).json({
      message: "Task created",
      task,
    });
  } catch (error) {
    console.error("createTask error:", error);
    return res.status(500).json({
      message: "Error creating task",
      error: error.message,
    });
  }
};

// 2️⃣ Get all tasks for a project (for Gantt)
export const getProjectTasks = async (req, res) => {
  try {
    const { projectId } = req.params;

    if (!projectId || !isValidId(projectId)) {
      return res.status(400).json({ message: "Valid projectId is required" });
    }

    const tasks = await ProjectTask.find({ projectId })
      .populate("dependencies", "name startDate endDate")
      .populate("parentTask", "name")
      .sort({ sortOrder: 1, startDate: 1 });

    return res.status(200).json({
      message: "Project tasks fetched",
      tasks,
    });
  } catch (error) {
    console.error("getProjectTasks error:", error);
    return res.status(500).json({
      message: "Error fetching tasks",
      error: error.message,
    });
  }
};

// 3️⃣ Update task
export const updateTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    if (!taskId || !isValidId(taskId)) {
      return res.status(400).json({ message: "Valid taskId is required" });
    }

    const updates = {
      ...req.body,
      updatedBy: req.user?.id || null,
    };

    const task = await ProjectTask.findByIdAndUpdate(taskId, updates, {
      new: true,
      runValidators: true,
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    return res.status(200).json({
      message: "Task updated",
      task,
    });
  } catch (error) {
    console.error("updateTask error:", error);
    return res.status(500).json({
      message: "Error updating task",
      error: error.message,
    });
  }
};

// 4️⃣ Delete task
export const deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    if (!taskId || !isValidId(taskId)) {
      return res.status(400).json({ message: "Valid taskId is required" });
    }

    const task = await ProjectTask.findByIdAndDelete(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Optionally: also remove this from others' dependencies
    await ProjectTask.updateMany(
      { dependencies: taskId },
      { $pull: { dependencies: taskId } }
    );

    return res.status(200).json({
      message: "Task deleted",
    });
  } catch (error) {
    console.error("deleteTask error:", error);
    return res.status(500).json({
      message: "Error deleting task",
      error: error.message,
    });
  }
};

// 5️⃣ Bulk update sortOrder (for drag-drop reorder on Gantt)
export const bulkUpdateSortOrder = async (req, res) => {
  try {
    const { tasks } = req.body; // [{ taskId, sortOrder }, ...]

    if (!Array.isArray(tasks) || tasks.length === 0) {
      return res.status(400).json({ message: "tasks array is required" });
    }

    const bulkOps = tasks.map((t) => ({
      updateOne: {
        filter: { _id: t.taskId },
        update: { sortOrder: t.sortOrder },
      },
    }));

    await ProjectTask.bulkWrite(bulkOps);

    return res.status(200).json({
      message: "Sort order updated",
    });
  } catch (error) {
    console.error("bulkUpdateSortOrder error:", error);
    return res.status(500).json({
      message: "Error updating sort order",
      error: error.message,
    });
  }
};
