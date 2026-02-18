

import React, { useState } from "react";
import { IoIosAddCircleOutline } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import CreateProjectForm from "../components/CreateProjectForm";
import {
    FaMapMarkerAlt,
    FaEllipsisV,
    FaClock,
    FaCalendarCheck,
    FaRocket,
    FaEye,
    FaEdit,
    FaTrash,
    FaSearch,
    FaBriefcase,
    FaChartLine,
    FaCalendarAlt
} from "react-icons/fa";
import { useDeleteProjectMutation, useGetProjectsQuery } from "../Reduxe/Api";

const AttendanceLabour = () => {
    const navigate = useNavigate();
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeMenu, setActiveMenu] = useState(null);
    const { data: projects, isLoading } = useGetProjectsQuery();
    const [deleteProject] = useDeleteProjectMutation();

    const toggleDrawer = () => {
        setIsDrawerOpen(!isDrawerOpen);
    };

    const toggleMenu = (projectId) => {
        setActiveMenu(activeMenu === projectId ? null : projectId);
    };

    const handleDelete = async (projectId) => {
        if (window.confirm("Are you sure you want to delete this project?")) {
            try {
                await deleteProject(projectId).unwrap();
                setActiveMenu(null);
            } catch (error) {
                console.error("Failed to delete project:", error);
            }
        }
    };

    const handleViewDetails = (project) => {
        navigate("/DashboardProject", { state: { project } });
        setActiveMenu(null);
    };

    const handleEdit = (project) => {
        navigate("/EditProject", { state: { projectId: project } });
        setActiveMenu(null);
    };

    const getProgressColor = (progress) => {
        if (progress < 25) return "bg-gradient-to-r from-red-400 to-red-500";
        if (progress < 50) return "bg-gradient-to-r from-amber-400 to-amber-500";
        if (progress < 75) return "bg-gradient-to-r from-blue-400 to-blue-500";
        return "bg-gradient-to-r from-green-400 to-green-500";
    };

    const getProgressValue = (projectDuration) => {
        return projectDuration ? Number(projectDuration) * 10 : 0;
    };

    const getStatusConfig = (progress) => {
        if (progress >= 75) return {
            text: "Almost Done",
            color: "from-green-500 to-emerald-600",
            bg: "from-green-50 to-emerald-50",
            border: "border-green-200",
            icon: "🚀"
        };
        if (progress >= 50) return {
            text: "On Track",
            color: "from-blue-500 to-cyan-600",
            bg: "from-blue-50 to-cyan-50",
            border: "border-blue-200",
            icon: "📈"
        };
        if (progress >= 25) return {
            text: "In Progress",
            color: "from-amber-500 to-orange-600",
            bg: "from-amber-50 to-orange-50",
            border: "border-amber-200",
            icon: "🛠️"
        };
        return {
            text: "Starting",
            color: "from-red-500 to-pink-600",
            bg: "from-red-50 to-pink-50",
            border: "border-red-200",
            icon: "🎯"
        };
    };

    // Calculate summary statistics
    const summaryStats = {
        total: projects?.length || 0,
        active: projects?.filter(p => getProgressValue(p.projectDuration) > 0 && getProgressValue(p.projectDuration) < 100).length || 0,
        completed: projects?.filter(p => getProgressValue(p.projectDuration) >= 100).length || 0,
        starting: projects?.filter(p => getProgressValue(p.projectDuration) <= 25).length || 0
    };

    const filteredProjects = projects?.filter(project =>
        project.projectName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.siteLocation?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className="min-h-screen px-4 sm:px-6 py-6 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Loading projects...</p>
                    <p className="text-gray-400 text-sm mt-1">Please wait while we fetch your projects</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen px-4 sm:px-6 py-6 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-6">
                    <div className="flex-1">
                        <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-purple-700 bg-clip-text text-transparent">
                            Project Portfolio
                        </h1>
                        <p className="text-gray-600 mt-2 flex items-center">
                            <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                            Manage and track all your construction projects in one place
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                        <div className="relative w-full sm:w-64">
                            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search projects..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm bg-white/80 backdrop-blur-sm"
                            />
                        </div>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* Total Projects */}
                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 group">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 font-medium">Total Projects</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">{summaryStats.total}</p>
                            </div>
                            <div className="bg-blue-50 p-3 rounded-xl group-hover:bg-blue-100 transition-colors">
                                <FaBriefcase className="text-2xl text-blue-600" />
                            </div>
                        </div>
                    </div>

                    {/* Active Projects */}
                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 group">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 font-medium">Active</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">{summaryStats.active}</p>
                            </div>
                            <div className="bg-green-50 p-3 rounded-xl group-hover:bg-green-100 transition-colors">
                                <FaChartLine className="text-2xl text-green-600" />
                            </div>
                        </div>
                    </div>

                    {/* Completed */}
                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 group">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 font-medium">Completed</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">{summaryStats.completed}</p>
                            </div>
                            <div className="bg-purple-50 p-3 rounded-xl group-hover:bg-purple-100 transition-colors">
                                <FaCalendarCheck className="text-2xl text-purple-600" />
                            </div>
                        </div>
                    </div>

                    {/* Starting */}
                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 group">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 font-medium">Starting</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">{summaryStats.starting}</p>
                            </div>
                            <div className="bg-orange-50 p-3 rounded-xl group-hover:bg-orange-100 transition-colors">
                                <FaRocket className="text-2xl text-orange-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Projects Table */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden hover:shadow-2xl transition-all duration-300">
                    {/* Table Header */}
                    <div className="px-6 py-6 bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-200">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900">
                                    Project Overview
                                </h3>
                                <p className="text-gray-600 mt-1">
                                    {filteredProjects?.length || 0} projects found
                                </p>
                            </div>
                            {/* <button
                                onClick={() => navigate('/AddNewProject')}
                                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl shadow-lg transition-all duration-200 flex items-center justify-center gap-2 font-semibold group"
                            >
                                <IoIosAddCircleOutline size={20} className="group-hover:scale-110 transition-transform" />
                                New Project
                            </button> */}
                        </div>
                    </div>

                    {/* Table Content */}
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gradient-to-r from-slate-50 to-gray-100 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-5 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                                        Project Details
                                    </th>
                                    <th className="px-6 py-5 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                                        Timeline
                                    </th>
                                    <th className="px-6 py-5 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                                        Progress
                                    </th>
                                    <th className="px-6 py-5 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-5 text-right text-sm font-bold text-gray-700 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200/60">
                                {filteredProjects?.map((project) => {
                                    const progressValue = getProgressValue(project.projectDuration);
                                    const statusConfig = getStatusConfig(progressValue);

                                    return (
                                        <tr
                                            key={project._id}
                                            className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 transition-all duration-200 cursor-pointer group"
                                            // onClick={() => navigate("/DashboardProject", { state: { project } })}
                                            onClick={() => navigate(`/projects/${project._id}/attendance`)}
                                        >
                                            {/* Project Details */}
                                            <td className="px-6 py-5">
                                                <div className="flex items-center space-x-4">
                                                    <div className="flex-shrink-0 w-14 h-14 rounded-2xl overflow-hidden shadow-lg group-hover:shadow-xl transition-shadow">
                                                        <img
                                                            src="./images/cons.jpg"
                                                            alt={project.projectName}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                                            {project.projectName}
                                                        </h3>
                                                        <div className="flex items-center mt-2 text-gray-600 text-sm">
                                                            <FaMapMarkerAlt className="mr-2 text-blue-500 flex-shrink-0" />
                                                            <span className="truncate">{project.siteLocation}</span>
                                                        </div>
                                                        <div className="flex items-center mt-1 text-xs text-gray-500">
                                                            <FaCalendarAlt className="mr-1" />
                                                            Duration: {project.projectDuration} months
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Timeline */}
                                            <td className="px-6 py-5">
                                                <div className="space-y-3">
                                                    <div className="flex items-center">
                                                        <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center mr-3 shadow-sm">
                                                            <FaClock className="text-red-500" />
                                                        </div>
                                                        <div>
                                                            <div className="text-xs text-gray-500 uppercase font-semibold tracking-wide">Start Date</div>
                                                            <div className="font-bold text-gray-900">{project.expectedStartDate}</div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center">
                                                        <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mr-3 shadow-sm">
                                                            <FaCalendarCheck className="text-green-500" />
                                                        </div>
                                                        <div>
                                                            <div className="text-xs text-gray-500 uppercase font-semibold tracking-wide">End Date</div>
                                                            <div className="font-bold text-gray-900">{project.expectedCompletionDate}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Progress */}
                                            <td className="px-6 py-5">
                                                <div className="space-y-3">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-sm font-bold text-gray-700">Completion</span>
                                                        <span className={`text-lg font-extrabold ${progressValue >= 75 ? "text-green-600" :
                                                            progressValue >= 50 ? "text-blue-600" :
                                                                "text-amber-600"
                                                            }`}>
                                                            {progressValue}%
                                                        </span>
                                                    </div>
                                                    <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
                                                        <div
                                                            className={`h-full rounded-full ${getProgressColor(progressValue)} shadow-lg transition-all duration-1000 ease-out`}
                                                            style={{ width: `${progressValue}%` }}
                                                        ></div>
                                                    </div>
                                                    <div className="text-xs text-gray-500 text-center">
                                                        {progressValue < 100 ? `${100 - progressValue}% remaining` : "Completed!"}
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Status */}
                                            <td className="px-6 py-5">
                                                <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl bg-gradient-to-r ${statusConfig.bg} border ${statusConfig.border} shadow-sm`}>
                                                    <span className="text-lg">{statusConfig.icon}</span>
                                                    <span className={`text-sm font-bold bg-gradient-to-r ${statusConfig.color} bg-clip-text text-transparent`}>
                                                        {statusConfig.text}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Actions */}
                                            <td className="px-6 py-5 text-right">
                                                <div className="relative flex justify-end">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            toggleMenu(project._id);
                                                        }}
                                                        className="p-3 rounded-xl bg-gray-100 hover:bg-gray-200 transition-all duration-200 group/menu"
                                                    >
                                                        <FaEllipsisV className="text-gray-600 group-hover/menu:text-gray-800" />
                                                    </button>

                                                    {activeMenu === project._id && (
                                                        <div
                                                            className="absolute right-0 top-12 w-56 bg-white rounded-2xl shadow-2xl py-3 border border-gray-200 z-50 backdrop-blur-sm"
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            <button
                                                                onClick={() => handleViewDetails(project)}
                                                                className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 group/action"
                                                            >
                                                                <FaEye className="mr-3 text-blue-500 group-hover/action:scale-110 transition-transform" />
                                                                View Details
                                                            </button>
                                                            <button
                                                                onClick={() => handleEdit(project)}
                                                                className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-green-50 hover:text-green-600 transition-all duration-200 group/action"
                                                            >
                                                                <FaEdit className="mr-3 text-green-500 group-hover/action:scale-110 transition-transform" />
                                                                Edit Project
                                                            </button>
                                                            <div className="border-t border-gray-200 my-1"></div>
                                                            <button
                                                                onClick={() => handleDelete(project._id)}
                                                                className="flex items-center w-full px-4 py-3 text-sm text-red-700 hover:bg-red-50 hover:text-red-600 transition-all duration-200 group/action"
                                                            >
                                                                <FaTrash className="mr-3 text-red-500 group-hover/action:scale-110 transition-transform" />
                                                                Delete Project
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>

                        {/* Empty State */}
                        {(!filteredProjects || filteredProjects.length === 0) && (
                            <div className="text-center py-16">
                                <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center shadow-lg">
                                    <FaRocket className="text-gray-400 text-4xl" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-600 mb-3">
                                    {searchTerm ? "No projects found" : "No projects yet"}
                                </h3>
                                <p className="text-gray-500 mb-8 max-w-md mx-auto">
                                    {searchTerm
                                        ? "We couldn't find any projects matching your search. Try different keywords."
                                        : "Start building your project portfolio by creating your first project."}
                                </p>
                                <button
                                    onClick={() => navigate('/AddNewProject')}
                                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-4 rounded-xl shadow-lg transition-all duration-200 flex items-center gap-3 mx-auto text-lg font-semibold group"
                                >
                                    <IoIosAddCircleOutline size={24} className="group-hover:scale-110 transition-transform" />
                                    Create Your First Project
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Drawer Form */}
            <CreateProjectForm isOpen={isDrawerOpen} onClose={toggleDrawer} />
        </div>
    );
};

export default AttendanceLabour;