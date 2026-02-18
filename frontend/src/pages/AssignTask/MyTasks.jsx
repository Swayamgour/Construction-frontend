import React, { useState } from "react";
import {
    useGetTaskByIdQuery,
    useUpdateTaskStatusMutation,
} from "../../Reduxe/Api";
import {
    FiCheckCircle,
    FiRefreshCw,
    FiCalendar,
    FiFlag,
    FiClock,
    FiAlertTriangle,
    FiCheck,
    FiX,
    FiFileText,
    FiUser,
    FiFolder
} from "react-icons/fi";
import { useParams } from "react-router-dom";

export default function MyTasks() {

    const { id } = useParams()
    const { data, isLoading, refetch, isSuccess } = useGetTaskByIdQuery(id);

    // console.log(data?.data)

    const [updateStatus, { isLoading: updating }] = useUpdateTaskStatusMutation();

    const [remark, setRemark] = useState("");
    const [selectedTask, setSelectedTask] = useState(null);
    const [filter, setFilter] = useState("all");

    const loggedUserId = localStorage.getItem("userId"); // Assuming you store user ID

    if (isLoading) return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );

    // Filter tasks for current user and by status
    const myTasks = data?.data

    // console.log(data?.data);

    const filteredTasks = data?.data

    const handleStatusUpdate = async (taskId, status, remarks = "") => {
        try {
            await updateStatus({ id: taskId, status, remarks }).unwrap();
            refetch();
            setSelectedTask(null);
            setRemark("");
        } catch (error) {
            console.error("Failed to update task status:", error);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "Completed": return "bg-green-100 text-green-800 border-green-200";
            case "In Progress": return "bg-blue-100 text-blue-800 border-blue-200";
            case "Pending": return "bg-amber-100 text-amber-800 border-amber-200";
            default: return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case "High": return "text-red-500";
            case "Medium": return "text-orange-500";
            case "Low": return "text-green-500";
            default: return "text-gray-500";
        }
    };

    const getDaysRemaining = (deadline) => {
        const today = new Date();
        const deadlineDate = new Date(deadline);
        const diffTime = deadlineDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return { text: "Overdue", color: "text-red-500 bg-red-50 border-red-200" };
        if (diffDays === 0) return { text: "Due today", color: "text-orange-500 bg-orange-50 border-orange-200" };
        if (diffDays <= 3) return { text: `${diffDays} days left`, color: "text-orange-500 bg-orange-50 border-orange-200" };
        return { text: `${diffDays} days left`, color: "text-green-500 bg-green-50 border-green-200" };
    };

    const getTaskStats = () => {
        const total = myTasks?.length;
        const completed = myTasks?.filter(t => t.status === "Completed").length;
        const inProgress = myTasks?.filter(t => t.status === "In Progress").length;
        const pending = myTasks?.filter(t => t.status === "Pending").length;

        return { total, completed, inProgress, pending };
    };

    const stats = getTaskStats();

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8 text-center">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-700 via-purple-700 to-cyan-700 bg-clip-text text-transparent mb-3">
                        🎯 My Tasks
                    </h1>
                    <p className="text-gray-600 text-lg">
                        Manage and track your assigned tasks
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <StatCard
                        title="Total Tasks"
                        value={stats.total}
                        color="from-blue-500 to-cyan-500"
                        icon="📋"
                    />
                    <StatCard
                        title="Completed"
                        value={stats.completed}
                        color="from-green-500 to-emerald-500"
                        icon="✅"
                    />
                    <StatCard
                        title="In Progress"
                        value={stats.inProgress}
                        color="from-amber-500 to-orange-500"
                        icon="🔄"
                    />
                    <StatCard
                        title="Pending"
                        value={stats.pending}
                        color="from-red-500 to-pink-500"
                        icon="⏳"
                    />
                </div>

                {/* Filters */}
                {/* <div className="bg-white rounded-2xl shadow-sm border p-4 mb-6">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        <h3 className="font-semibold text-gray-800">Filter Tasks:</h3>
                        <div className="flex flex-wrap gap-2">
                            {["all", "Pending", "In Progress", "Completed"].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setFilter(status)}
                                    className={`px-4 py-2 rounded-xl font-medium transition-all ${filter === status
                                        ? "bg-blue-600 text-white shadow-md"
                                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                        }`}
                                >
                                    {status === "all" ? "All Tasks" : status}
                                </button>
                            ))}
                        </div>
                    </div>
                </div> */}

                {/* Tasks Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {/* {console.log(filteredTasks)} */}
                    {data?.data?.map((task) => {
                        const daysRemaining = getDaysRemaining(task.deadline);
                        return (
                            <div
                                key={task._id}
                                className="bg-white rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                            >
                                <div className="p-6">
                                    {/* Task Header */}
                                    <div className="flex justify-between items-start mb-4">
                                        <h3 className="font-bold text-lg text-gray-900 line-clamp-2 flex-1 mr-2">
                                            {task.title}
                                        </h3>
                                        <FiFlag className={`text-lg ${getPriorityColor(task.priority)}`} />
                                    </div>

                                    {/* Task Description */}
                                    {task.description && (
                                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                            {task.description}
                                        </p>
                                    )}

                                    {/* Task Meta */}
                                    <div className="space-y-3 mb-4">
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <FiFolder className="text-blue-500" />
                                            <span className="font-medium">Project:</span>
                                            <span className="truncate">{task.projectId?.projectName || "No Project"}</span>
                                        </div>

                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <FiCalendar className="text-purple-500" />
                                            <span className="font-medium">Deadline:</span>
                                            <span>{new Date(task.deadline).toLocaleDateString()}</span>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-sm">
                                                <FiClock className="text-amber-500" />
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${daysRemaining.color}`}>
                                                    {daysRemaining.text}
                                                </span>
                                            </div>

                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(task.status)}`}>
                                                {task.status}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    {task.status !== "Completed" && (
                                        <div className="flex gap-3 pt-4 border-t border-gray-100">
                                            <button
                                                onClick={() => handleStatusUpdate(task._id, "In Progress")}
                                                disabled={updating}
                                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 disabled:opacity-50 transition-colors font-medium"
                                            >
                                                <FiRefreshCw size={16} />
                                                Start
                                            </button>
                                            <button
                                                onClick={() => setSelectedTask(task)}
                                                disabled={updating}
                                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 disabled:opacity-50 transition-colors font-medium"
                                            >
                                                <FiCheckCircle size={16} />
                                                Complete
                                            </button>
                                        </div>
                                    )}

                                    {/* Completed Badge */}
                                    {task.status === "Completed" && (
                                        <div className="pt-4 border-t border-gray-100">
                                            <div className="flex items-center justify-center gap-2 text-green-600 bg-green-50 rounded-xl py-2">
                                                <FiCheck size={16} />
                                                <span className="font-medium">Task Completed</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Empty State */}
                {filteredTasks.length === 0 && (
                    <div className="text-center py-16">
                        <div className="bg-white rounded-2xl shadow-sm border p-12 max-w-md mx-auto">
                            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <FiFileText className="text-gray-400 text-3xl" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">
                                {myTasks?.length === 0 ? "No Tasks Assigned" : "No Tasks Found"}
                            </h3>
                            <p className="text-gray-600 mb-6">
                                {myTasks?.length === 0
                                    ? "You don't have any tasks assigned to you yet."
                                    : "No tasks match your current filter criteria."
                                }
                            </p>
                            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto"></div>
                        </div>
                    </div>
                )}

                {/* Completion Modal */}
                {selectedTask && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all duration-300 scale-100">
                            {/* Modal Header */}
                            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 rounded-t-2xl">
                                <div className="flex items-center gap-3 text-white">
                                    <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                                        <FiCheckCircle size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold">Complete Task</h3>
                                        <p className="text-green-100 opacity-90">Add your completion remarks</p>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Body */}
                            <div className="p-6">
                                <div className="mb-4">
                                    <h4 className="font-semibold text-gray-800 mb-2">{selectedTask.title}</h4>
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <FiCalendar className="text-purple-500" />
                                        Deadline: {new Date(selectedTask.deadline).toLocaleDateString()}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                        <FiFileText className="text-amber-500" />
                                        Completion Remarks *
                                    </label>
                                    <textarea
                                        placeholder="Describe the work completed, any challenges faced, or additional details..."
                                        value={remark}
                                        onChange={(e) => setRemark(e.target.value)}
                                        rows="4"
                                        className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none"
                                        required
                                    />
                                    <p className="text-xs text-gray-500">
                                        Provide details about the completed work for better tracking.
                                    </p>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="flex gap-3 p-6 border-t border-gray-200">
                                <button
                                    onClick={() => {
                                        setSelectedTask(null);
                                        setRemark("");
                                    }}
                                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium flex items-center justify-center gap-2"
                                >
                                    <FiX size={18} />
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleStatusUpdate(selectedTask._id, "Completed", remark)}
                                    disabled={!remark.trim() || updating}
                                    className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 transition-all font-medium flex items-center justify-center gap-2"
                                >
                                    {updating ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            Submitting...
                                        </>
                                    ) : (
                                        <>
                                            <FiCheck size={18} />
                                            Complete Task
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// Stat Card Component
const StatCard = ({ title, value, color, icon }) => (
    <div className="bg-white rounded-2xl shadow-sm border p-6 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
                <p className="text-3xl font-bold text-gray-900">{value}</p>
            </div>
            <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${color} flex items-center justify-center text-2xl`}>
                {icon}
            </div>
        </div>
    </div>
);

// Add CSS for line clamping
