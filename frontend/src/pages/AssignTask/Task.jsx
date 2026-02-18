import React, { useState } from "react";
import {
    useGetTasksQuery,
    useUpdateTaskStatusMutation,
    useDeleteTaskMutation,
} from "../../Reduxe/Api";
import { 
    FiTrash2, 
    FiRefreshCw, 
    FiCheckCircle, 
    FiPlus, 
    FiCalendar,
    FiUser,
    FiFolder,
    FiFilter,
    FiSearch,
    FiClock,
    FiAlertCircle
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";

export default function Tasks() {
    const { data, isLoading, refetch } = useGetTasksQuery();
    const [updateStatus] = useUpdateTaskStatusMutation();
    const [deleteTask] = useDeleteTaskMutation();
    const [filter, setFilter] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const navigate = useNavigate();

    const userRole = localStorage.getItem("role");

    const handleStatus = async (task, status) => {
        await updateStatus({ id: task._id, status });
        refetch();
    };

    const handleDelete = async (task) => {
        if (window.confirm(`Are you sure you want to delete "${task.title}"?`)) {
            await deleteTask(task._id);
            refetch();
        }
    };

    // Filter and search tasks
    const filteredTasks = data?.data?.filter(task => {
        const matchesFilter = filter === "all" || task.status === filter;
        const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            task.projectId?.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            task.assignedTo?.name.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

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
            case "High": return "border-l-red-500";
            case "Medium": return "border-l-orange-500";
            case "Low": return "border-l-green-500";
            default: return "border-l-gray-500";
        }
    };

    const getDaysRemaining = (deadline) => {
        const today = new Date();
        const deadlineDate = new Date(deadline);
        const diffTime = deadlineDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) return { text: "Overdue", color: "text-red-500" };
        if (diffDays === 0) return { text: "Due today", color: "text-orange-500" };
        if (diffDays <= 3) return { text: `${diffDays} days left`, color: "text-orange-500" };
        return { text: `${diffDays} days left`, color: "text-green-500" };
    };

    if (isLoading) return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
            {/* Header Section */}
            <div className="mb-8">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-700 bg-clip-text text-transparent">
                            📋 Task Management
                        </h1>
                        <p className="text-gray-600 mt-2">
                            Manage and track all project tasks in one place
                        </p>
                    </div>
                    
                    <button 
                        onClick={() => navigate('/AssignTask')}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                    >
                        <FiPlus size={20} />
                        Assign New Task
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <StatCard 
                        title="Total Tasks" 
                        value={data?.data?.length || 0} 
                        color="from-blue-500 to-cyan-500"
                    />
                    <StatCard 
                        title="Completed" 
                        value={data?.data?.filter(t => t.status === "Completed").length || 0} 
                        color="from-green-500 to-emerald-500"
                    />
                    <StatCard 
                        title="In Progress" 
                        value={data?.data?.filter(t => t.status === "In Progress").length || 0} 
                        color="from-amber-500 to-orange-500"
                    />
                    <StatCard 
                        title="Pending" 
                        value={data?.data?.filter(t => t.status === "Pending").length || 0} 
                        color="from-red-500 to-pink-500"
                    />
                </div>

                {/* Filters and Search */}
                <div className="bg-white rounded-2xl shadow-sm border p-4 mb-6">
                    <div className="flex flex-col lg:flex-row gap-4 items-center">
                        {/* Search */}
                        <div className="flex-1 relative w-full">
                            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search tasks, projects, or assignees..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        {/* Filter */}
                        <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-xl">
                            {["all", "Pending", "In Progress", "Completed"].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setFilter(status)}
                                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                                        filter === status
                                            ? "bg-white text-blue-600 shadow-sm"
                                            : "text-gray-600 hover:text-gray-800"
                                    }`}
                                >
                                    {status === "all" ? "All Tasks" : status}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Tasks Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredTasks?.map((task) => {
                    const daysRemaining = getDaysRemaining(task.deadline);
                    return (
                        <div 
                            key={task._id}
                            className={`bg-white rounded-2xl shadow-lg border-l-4 ${getPriorityColor(task.priority)} hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}
                        >
                            <div className="p-6">
                                {/* Task Header */}
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="font-bold text-lg text-gray-900 line-clamp-2">
                                        {task.title}
                                    </h3>
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(task.status)}`}>
                                        {task.status}
                                    </span>
                                </div>

                                {/* Task Description */}
                                {task.description && (
                                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                        {task.description}
                                    </p>
                                )}

                                {/* Task Meta Information */}
                                <div className="space-y-3 mb-4">
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <FiFolder className="text-blue-500" />
                                        <span className="font-medium">Project:</span>
                                        <span>{task.projectId?.projectName || "No Project"}</span>
                                    </div>
                                    
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <FiUser className="text-green-500" />
                                        <span className="font-medium">Assigned to:</span>
                                        <span>{task.assignedTo?.name || "Unassigned"}</span>
                                    </div>
                                    
                                    <div className="flex items-center gap-2 text-sm">
                                        <FiCalendar className="text-purple-500" />
                                        <span className="font-medium text-gray-600">Deadline:</span>
                                        <span className={`font-semibold ${daysRemaining.color}`}>
                                            {daysRemaining.text}
                                        </span>
                                        <span className="text-gray-500">
                                            ({new Date(task.deadline).toLocaleDateString()})
                                        </span>
                                    </div>

                                    {task.priority && (
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <FiAlertCircle className={
                                                task.priority === "High" ? "text-red-500" :
                                                task.priority === "Medium" ? "text-orange-500" : "text-green-500"
                                            } />
                                            <span className="font-medium">Priority:</span>
                                            <span className={
                                                task.priority === "High" ? "text-red-600 font-semibold" :
                                                task.priority === "Medium" ? "text-orange-600 font-semibold" : "text-green-600 font-semibold"
                                            }>
                                                {task.priority}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Action Buttons */}
                                <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                                    <div className="flex gap-2">
                                        {task.status !== "Completed" && (
                                            <>
                                                <button
                                                    onClick={() => handleStatus(task, "In Progress")}
                                                    className="flex items-center gap-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                                                >
                                                    <FiRefreshCw size={14} />
                                                    Start
                                                </button>
                                                <button
                                                    onClick={() => handleStatus(task, "Completed")}
                                                    className="flex items-center gap-1 px-3 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium"
                                                >
                                                    <FiCheckCircle size={14} />
                                                    Complete
                                                </button>
                                            </>
                                        )}
                                    </div>

                                    {(userRole === "admin" || userRole === "manager") && (
                                        <button
                                            onClick={() => handleDelete(task)}
                                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Delete Task"
                                        >
                                            <FiTrash2 size={16} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Empty State */}
            {filteredTasks?.length === 0 && (
                <div className="text-center py-12">
                    <div className="bg-white rounded-2xl shadow-sm border p-8 max-w-md mx-auto">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FiFolder className="text-gray-400 text-2xl" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            No tasks found
                        </h3>
                        <p className="text-gray-600 mb-4">
                            {searchTerm || filter !== "all" 
                                ? "Try adjusting your search or filter criteria"
                                : "Get started by assigning your first task"
                            }
                        </p>
                        {(userRole === "admin" || userRole === "manager") && (
                            <button 
                                onClick={() => navigate('/AssignTask')}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Assign New Task
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

// Stat Card Component
const StatCard = ({ title, value, color }) => (
    <div className="bg-white rounded-xl shadow-sm border p-4">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-gray-600">{title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
            </div>
            <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${color} flex items-center justify-center`}>
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center bg-opacity-20">
                    <div className="text-white font-bold text-sm">{value}</div>
                </div>
            </div>
        </div>
    </div>
);

