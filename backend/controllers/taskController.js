import Task from "../models/Task.js";

// 🆕 ASSIGN TASK
export const assignTask = async (req, res) => {
    try {
        const { title, description, projectId, assignedTo, priority, deadline } = req.body;
        if (!title || !projectId || !assignedTo || !deadline) {
            return res.status(400).json({ message: "Required fields missing" });
        }

        const task = await Task.create({
            title,
            description,
            projectId,
            assignedTo,
            priority,
            deadline,
            assignedBy: req.user.id, // automatically logged-in user
        });

        res.status(201).json({ message: "Task Assigned Successfully", data: task });
    } catch (error) {
        res.status(500).json({ message: "Task Error", error: error.message });
    }
};


export const getTasksByProject = async (req, res) => {
    try {
        const { projectId } = req.params;

        if (!projectId) {
            return res.status(400).json({
                message: "Project ID is required"
            });
        }

        const tasks = await Task.find({ projectId })
            .populate("assignedTo", "name role")
            .populate("assignedBy", "name role")
            .populate("dependencies", "title status")  // ⭐ Now this works
            .sort({ createdAt: -1 });

        res.status(200).json({
            message: "Tasks fetched successfully",
            count: tasks.length,
            data: tasks
        });

    } catch (error) {
        res.status(500).json({
            message: "Error fetching project tasks",
            error: error.message,
        });
    }
};




// 📋 GET TASKS (ROLE-BASED LOGIC)
export const getTasks = async (req, res) => {
    try {
        const { projectId, assignedTo, status } = req.query;
        let filter = {};

        // =========== ROLE RESTRICTION ============
        if (
            req.user.role === "supervisor" ||
            req.user.role === "engineer" ||
            req.user.role === "storekeeper"
        ) {
            filter.assignedTo = req.user.id; // only his tasks
        }

        // Admin/Manager can filter any user's task
        if (
            assignedTo &&
            (req.user.role === "admin" || req.user.role === "manager")
        ) {
            filter.assignedTo = assignedTo;
        }

        if (projectId) filter.projectId = projectId;
        if (status) filter.status = status;

        const tasks = await Task.find(filter)
            .populate("projectId", "projectName projectCode")
            .populate("assignedTo", "name role")
            .populate("assignedBy", "name role")
            .sort({ createdAt: -1 });

        res.status(200).json({ message: "Tasks fetched", data: tasks });
    } catch (error) {
        res.status(500).json({ message: "Error fetching tasks", error: error.message });
    }
};

// 🔄 UPDATE TASK STATUS
export const updateTaskStatus = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ message: "Task not found" });

        // ❌ Supervisor cannot update someone else task
        if (
            req.user.role !== "admin" &&
            req.user.role !== "manager" &&
            task.assignedTo.toString() !== req.user.id
        ) {
            return res.status(403).json({ message: "You cannot update this task" });
        }

        task.status = req.body.status;
        task.remarks = req.body.remarks || task.remarks;

        await task.save();

        res.status(200).json({ message: "Status Updated", data: task });
    } catch (error) {
        res.status(500).json({ message: "Error updating status", error: error.message });
    }
};


// 🗑️ DELETE TASK
export const deleteTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) return res.status(404).json({ message: "Task not found" });

        await Task.findByIdAndDelete(req.params.id);

        res.status(200).json({ message: "Task deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting task", error: error.message });
    }
};




// ===========================
// ACCEPT TASK
// ===========================
export const assignTaskAccept = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ message: "Task not found" });

        if (task.assignedTo.toString() !== req.user.id)
            return res.status(403).json({ message: "This is not your task" });

        task.status = "accepted";
        task.activity.push({
            message: "Task accepted",
            user: req.user.id,
        });

        await task.save();
        res.status(200).json({ message: "Task accepted successfully", data: task });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



// ===========================
// REJECT TASK
// ===========================
export const assignTaskReject = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ message: "Task not found" });

        if (task.assignedTo.toString() !== req.user.id)
            return res.status(403).json({ message: "This is not your task" });

        task.status = "rejected";
        task.activity.push({
            message: `Task rejected: ${req.body.reason || "no reason"}`,
            user: req.user.id,
        });

        await task.save();
        res.status(200).json({ message: "Task rejected", data: task });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



// ===========================
// UPDATE PROGRESS (%)
// ===========================
export const updateTaskProgress = async (req, res) => {
    try {
        const { progress } = req.body;

        if (progress < 0 || progress > 100)
            return res.status(400).json({ message: "Progress should be 0–100" });

        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ message: "Task not found" });

        if (task.assignedTo.toString() !== req.user.id)
            return res.status(403).json({ message: "Not allowed to update" });

        task.progress = progress;
        task.status = progress === 100 ? "completed" : "in-progress";

        task.activity.push({
            message: `Progress updated to ${progress}%`,
            user: req.user.id,
        });

        await task.save();
        res.status(200).json({ message: "Progress updated", data: task });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



// ===========================
// WORKER SUBMITS COMPLETION REQUEST
// ===========================
export const submitTaskCompletion = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ message: "Task not found" });

        if (task.assignedTo.toString() !== req.user.id)
            return res.status(403).json({ message: "Not allowed" });

        task.status = "submitted";
        task.activity.push({
            message: "Task submitted for approval",
            user: req.user.id,
        });

        await task.save();
        res.status(200).json({ message: "Task submitted", data: task });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



// ===========================
// MANAGER APPROVES COMPLETION
// ===========================
export const approveCompletedTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ message: "Task not found" });

        task.status = "approved";
        task.progress = 100;
        task.activity.push({
            message: "Task approved & closed",
            user: req.user.id,
        });

        await task.save();
        res.status(200).json({ message: "Task approved", data: task });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



// ===========================
// UPDATE PRIORITY
// ===========================
export const updateTaskPriority = async (req, res) => {
    try {
        const { priority } = req.body;

        const task = await Task.findByIdAndUpdate(
            req.params.id,
            { priority },
            { new: true }
        );

        if (!task) return res.status(404).json({ message: "Task not found" });

        res.status(200).json({ message: "Priority updated", data: task });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



// ===========================
// UPDATE DEPENDENCIES
// ===========================
export const updateTaskDependencies = async (req, res) => {
    try {
        const { dependencies } = req.body;

        const task = await Task.findByIdAndUpdate(
            req.params.id,
            { dependencies },
            { new: true }
        );

        if (!task) return res.status(404).json({ message: "Task not found" });

        res.status(200).json({ message: "Dependencies updated", data: task });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



// ===========================
// ADD COMMENT / ACTIVITY LOG
// ===========================
export const addTaskComment = async (req, res) => {
    try {
        const { comment } = req.body;

        if (!comment)
            return res.status(400).json({ message: "Comment cannot be empty" });

        const task = await Task.findById(req.params.id);

        task.activity.push({
            message: comment,
            user: req.user.id
        });

        await task.save();

        res.status(200).json({ message: "Comment added", data: task });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



// ===========================
// GET ACTIVITY LOG
// ===========================
export const getTaskActivity = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id).populate("activity.user", "name role");

        if (!task) return res.status(404).json({ message: "Task not found" });

        res.status(200).json({ message: "Activity fetched", data: task.activity });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



// ===========================
// GET TASKS ASSIGNED TO LOGGED-IN USER
// ===========================
export const getMyTasks = async (req, res) => {
    try {
        const tasks = await Task.find({ assignedTo: req.user.id })
            .populate("projectId", "projectName projectCode")
            .sort({ createdAt: -1 });

        res.status(200).json({ message: "My tasks fetched", data: tasks });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
