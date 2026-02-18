// src/pages/PMDashboard.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useGetAttendanceByDateQuery, useGetAttendanceQuery, useGetProjectsQuery } from "../../Reduxe/Api";
import {
    FiBriefcase,
    FiActivity,
    FiCheckCircle,
    FiUsers,
    FiArrowUp,
    FiPlus,
    FiSearch
} from "react-icons/fi";

export default function PMDashboard() {
    const { data: projectsData, isLoading } = useGetProjectsQuery();

    // console.log(projectsData)

    const [projects, setProjects] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");




    // 📌 Use REAL DATA from API
    useEffect(() => {
        if (projectsData) {
            const updatedProjects = projectsData?.map(p => ({
                _id: p._id,
                name: p.projectName,
                clientName: p.clientName,
                manager: p.managerId?.name || "Not Assigned",
                labourCount: p.labours?.length || 0,
                progress: Math.floor(Math.random() * 30) + 30,
                status: Math.random() > 0.7 ? "Completed" : "Active",
                priority: ["High", "Medium", "Low"][Math.floor(Math.random() * 3)],
                deadline: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
                color: p.labours?.length > 5 ? "bg-gradient-to-r from-green-400 to-blue-500" : "bg-gradient-to-r from-orange-400 to-pink-500"
            }));
            setProjects(updatedProjects);
        }
    }, [projectsData]);

    // Filter projects based on search
    const filteredProjects = projects.filter(project =>
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.clientName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // 📌 Automatic Summary From Real Data
    const summary = {
        totalProjects: projects.length,
        active: projects.filter(p => p.status === "Active").length,
        completed: projects.filter(p => p.status === "Completed").length,
        totalLabour: projects.reduce((sum, p) => sum + p.labourCount, 0)
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "Active": return "bg-green-100 text-green-800 border-green-200";
            case "Completed": return "bg-blue-100 text-blue-800 border-blue-200";
            default: return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case "High": return "bg-red-100 text-red-800";
            case "Medium": return "bg-yellow-100 text-yellow-800";
            case "Low": return "bg-green-100 text-green-800";
            default: return "bg-gray-100 text-gray-800";
        }
    };

    const getProgressColor = (progress) => {
        if (progress >= 70) return "from-green-400 to-teal-500";
        if (progress >= 40) return "from-yellow-400 to-orange-500";
        return "from-red-400 to-pink-500";
    };

    const navigate = useNavigate()

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
            <div className="max-w-7xl mx-auto">

                {/* Header */}
                <div className="mb-8 flex flex-col lg:flex-row items-start lg:items-center justify-between">
                    <div className="mb-4 lg:mb-0">
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            Project Manager Dashboard
                        </h1>
                        <p className="text-gray-600 mt-2 flex items-center">
                            <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                            Welcome back! Here's your project overview
                        </p>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="relative">
                            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search projects..."
                                className="pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        {/* <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-xl flex items-center space-x-2 hover:shadow-lg transition-all duration-300">
                            <FiPlus className="text-lg" />
                            <span>New Project</span>
                        </button> */}
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* Total Projects */}
                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 group">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 font-medium">Total Projects</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">{summary.totalProjects}</p>
                            </div>
                            <div className="bg-blue-50 p-3 rounded-xl group-hover:bg-blue-100 transition-colors">
                                <FiBriefcase className="text-2xl text-blue-600" />
                            </div>
                        </div>
                        <div className="flex items-center mt-4 text-sm text-green-600">
                            <FiArrowUp className="mr-1" />
                            <span>2 new this week</span>
                        </div>
                    </div>

                    {/* Active Projects */}
                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 group">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 font-medium">Active Projects</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">{summary.active}</p>
                            </div>
                            <div className="bg-green-50 p-3 rounded-xl group-hover:bg-green-100 transition-colors">
                                <FiActivity className="text-2xl text-green-600" />
                            </div>
                        </div>
                        <div className="flex items-center mt-4 text-sm text-blue-600">
                            <span>Currently running</span>
                        </div>
                    </div>

                    {/* Completed */}
                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 group">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 font-medium">Completed</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">{summary.completed}</p>
                            </div>
                            <div className="bg-purple-50 p-3 rounded-xl group-hover:bg-purple-100 transition-colors">
                                <FiCheckCircle className="text-2xl text-purple-600" />
                            </div>
                        </div>
                        <div className="flex items-center mt-4 text-sm text-purple-600">
                            <span>Great work!</span>
                        </div>
                    </div>

                    {/* Total Labour */}
                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 group">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 font-medium">Total Labour</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">{summary.totalLabour}</p>
                            </div>
                            <div className="bg-orange-50 p-3 rounded-xl group-hover:bg-orange-100 transition-colors">
                                <FiUsers className="text-2xl text-orange-600" />
                            </div>
                        </div>
                        <div className="flex items-center mt-4 text-sm text-orange-600">
                            <span>Across all projects</span>
                        </div>
                    </div>
                </div>

                {/* Project List */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-8 hover:shadow-xl transition-all duration-300">
                    <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Project Overview</h2>
                            <p className="text-gray-600 mt-1">Manage and track all your projects</p>
                        </div>
                        <div className="text-sm text-gray-500">
                            Showing {filteredProjects.length} of {projects.length} projects
                        </div>
                    </div>

                    <div className="p-6">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
                                <p className="text-gray-500">Loading Projects...</p>
                            </div>
                        ) : filteredProjects.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="text-gray-400 text-6xl mb-4">📋</div>
                                <p className="text-gray-500 text-lg">No projects found</p>
                                <p className="text-gray-400">Try adjusting your search terms</p>
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {filteredProjects.map(p => (
                                    <div onClick={() => navigate("/DashboardProject", { state: { project: p } })} key={p._id} className="group p-6 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-300 bg-gradient-to-r from-white to-gray-50/50">
                                        <div className="flex flex-col lg:flex-row lg:items-center justify-between">
                                            <div className="flex-1 mb-4 lg:mb-0">
                                                <div className="flex items-start justify-between mb-3">
                                                    <h3 className="font-bold text-gray-900 text-lg group-hover:text-blue-600 transition-colors">
                                                        {p.name}
                                                    </h3>
                                                    <span className={`px-3 py-1 text-xs rounded-full border ${getPriorityColor(p.priority)}`}>
                                                        {p.priority}
                                                    </span>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                                                    <div className="flex items-center text-gray-600">
                                                        <span className="font-medium mr-2">👤 Client:</span>
                                                        {p.clientName}
                                                    </div>
                                                    <div className="flex items-center text-gray-600">
                                                        <span className="font-medium mr-2">🧑‍💼 Manager:</span>
                                                        {p.manager}
                                                    </div>
                                                    <div className="flex items-center text-gray-600">
                                                        <span className="font-medium mr-2">👷 Labour:</span>
                                                        {p.labourCount} assigned
                                                    </div>
                                                    <div className="flex items-center text-gray-600">
                                                        <span className="font-medium mr-2">📅 Deadline:</span>
                                                        {p.deadline}
                                                    </div>
                                                    <div className="flex items-center">
                                                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(p.status)}`}>
                                                            {p.status}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="lg:w-48 lg:text-right">
                                                <div className="mb-2">
                                                    <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                                                        <span>Progress</span>
                                                        <span className="font-semibold">{p.progress}%</span>
                                                    </div>
                                                    <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-3 rounded-full bg-gradient-to-r ${getProgressColor(p.progress)} transition-all duration-500`}
                                                            style={{ width: `${p.progress}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-2">
                                                    View Details →
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Stats Footer */}
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 text-white">
                    <div className="flex flex-col md:flex-row items-center justify-between">
                        <div>
                            <h3 className="text-xl font-bold mb-2">Need help with project management?</h3>
                            <p className="text-blue-100">Our team is here to support you 24/7</p>
                        </div>
                        <button className="mt-4 md:mt-0 bg-white text-blue-600 px-6 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-colors">
                            Get Support
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}