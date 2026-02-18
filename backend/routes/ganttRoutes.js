import express from "express";
import {
    createTask,
    getProjectTasks,
    updateTask,
    deleteTask,
    bulkUpdateSortOrder,
} from "../controllers/ganttController.js";
import { auth } from "../middleware/auth.js"; // jo bhi tumhara auth middleware hai

const router = express.Router();

// All routes protected (you can adjust roles later)
router.use(auth);

// Get all tasks of a project (for Gantt chart)
router.get("/projects/:projectId/tasks", getProjectTasks);

// Create task for project
router.post("/projects/:projectId/tasks", createTask);

// Update single task
router.put("/tasks/:taskId", updateTask);

// Delete single task
router.delete("/tasks/:taskId", deleteTask);

// Bulk update sort order (optional, for drag-drop)
router.put("/tasks/sort-order/bulk", bulkUpdateSortOrder);

export default router;
