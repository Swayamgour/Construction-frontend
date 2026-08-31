import express from "express";
import {
    createTask,
    getProjectTasks,
    updateTask,
    deleteTask,
    bulkUpdateSortOrder,
} from "../controllers/ganttController.js";
import { auth } from "../middleware/auth.js";
import { roleCheck } from "../middleware/role.js";

const router = express.Router();

// All routes require login
router.use(auth);

// Anyone assigned to the project can view its Gantt chart
router.get("/projects/:projectId/tasks", getProjectTasks);

// Only admin/manager/supervisor can create/edit schedule tasks
router.post("/projects/:projectId/tasks", roleCheck("admin", "manager", "supervisor"), createTask);
router.put("/tasks/:taskId", roleCheck("admin", "manager", "supervisor"), updateTask);
router.put("/tasks/sort-order/bulk", roleCheck("admin", "manager", "supervisor"), bulkUpdateSortOrder);

// Only admin/manager can delete a schedule task
router.delete("/tasks/:taskId", roleCheck("admin", "manager"), deleteTask);

export default router;
