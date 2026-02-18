import express from "express";
import { auth } from "../middleware/auth.js";
import { roleCheck } from "../middleware/role.js";

import {
  assignTask,
  getTasks,
  updateTaskStatus,
  deleteTask,
  assignTaskAccept,
  assignTaskReject,
  updateTaskProgress,
  submitTaskCompletion,
  approveCompletedTask,
  addTaskComment,
  getTaskActivity,
  updateTaskPriority,
  updateTaskDependencies,
  getMyTasks,
  getTasksByProject
} from "../controllers/taskController.js";

const router = express.Router();

// ✔ Assign task
router.post("/assign", auth, roleCheck("admin", "manager"), assignTask);

// ✔ Get all tasks
router.get("/all", auth, getTasks);

// ✔ Get tasks by projectId
router.get("/project/:projectId", auth, getTasksByProject);


// ✔ User's own tasks
router.get("/my-tasks", auth, getMyTasks);

// ✔ Update general task status
router.put("/status/:id", auth, updateTaskStatus);

// ✔ Accept task
router.put("/accept/:id", auth, assignTaskAccept);

// ✔ Reject task
router.put("/reject/:id", auth, assignTaskReject);

// ✔ Update Progress
router.put("/progress/:id", auth, updateTaskProgress);

// ✔ Worker submits completed task
router.put("/submit-completion/:id", auth, submitTaskCompletion);

// ✔ Manager approves completion
router.put("/approve/:id", auth, roleCheck("admin", "manager"), approveCompletedTask);

// ✔ Add comment / activity log
router.post("/comment/:id", auth, addTaskComment);

// ✔ Get activity log
router.get("/activity/:id", auth, getTaskActivity);

// ✔ Update priority
router.put("/priority/:id", auth, roleCheck("admin", "manager"), updateTaskPriority);

// ✔ Update dependencies
router.put("/dependencies/:id", auth, roleCheck("admin", "manager"), updateTaskDependencies);

// ✔ Delete task
router.delete("/:id", auth, roleCheck("admin", "manager"), deleteTask);

export default router;
