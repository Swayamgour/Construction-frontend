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
import { checkProjectAccess, resolveProjectFrom } from "../middleware/projectAccess.js";
import Task from "../models/Task.js";

const router = express.Router();

// All routes require login
router.use(auth);

// /tasks/:taskId routes only carry the task's own _id — resolve its
// projectId before checking access.
const taskProject = resolveProjectFrom(Task, { param: "taskId", field: "projectId" });

// Anyone assigned to the project can view its Gantt chart
router.get("/projects/:projectId/tasks", checkProjectAccess("projectId"), getProjectTasks);

// Only admin/manager/supervisor can create/edit schedule tasks
router.post("/projects/:projectId/tasks", roleCheck("admin", "manager", "supervisor"), checkProjectAccess("projectId"), createTask);
router.put("/tasks/:taskId", roleCheck("admin", "manager", "supervisor"), checkProjectAccess(taskProject), updateTask);
router.put("/tasks/sort-order/bulk", roleCheck("admin", "manager", "supervisor"), bulkUpdateSortOrder);

// Only admin/manager can delete a schedule task
router.delete("/tasks/:taskId", roleCheck("admin", "manager"), checkProjectAccess(taskProject), deleteTask);

export default router;
