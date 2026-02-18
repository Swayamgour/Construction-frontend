import React, { useState, useMemo } from "react";
import {
    FiFilter,
    FiUsers,
    FiCalendar,
    FiMapPin,
    FiClipboard,
    FiSearch,
    // FiPlus,
    FiTrendingUp,
    FiBarChart2,
    // FiDollarSign,
    FiClock
} from "react-icons/fi";
import {
    FaIndustry,
    FaHardHat,
    FaTools,
    FaBuilding
} from "react-icons/fa";
import { MdConstruction, MdAttachMoney, MdCurrencyRupee } from "react-icons/md";
import ProgressBar from "../components/ProgressBar";
import { useNavigate } from "react-router-dom";

const WorkDashboard = () => {
    const projectsData = [
        {
            id: 1,
            name: "Cement Warehouse Construction",
            address: "Delhi Industrial Area, Sector 18",
            startDate: "2025-02-01",
            endDate: "2025-08-20",
            category: "Cement",
            vendors: ["Sharma Traders", "Patel Cement Works"],
            materials: ["Ultratech", "Ambuja"],
            progress: 75,
            budget: "4.2 Cr",
            spent: "₹3.1 Cr",
            status: "On Track",
            workers: 45,
            priority: "High"
        },
        {
            id: 2,
            name: "Steel Reinforcement Work",
            address: "Noida Site 14, Block B",
            startDate: "2025-03-01",
            endDate: "2025-09-10",
            category: "Steel",
            vendors: ["Tata Distributors", "Singh Metals"],
            materials: ["JSW", "Tata Steel"],
            progress: 45,
            budget: "3.8 Cr",
            spent: "₹1.7 Cr",
            status: "Delayed",
            workers: 32,
            priority: "Medium"
        },
        {
            id: 3,
            name: "Electrical Wiring Setup",
            address: "Ghaziabad Project Zone A, Tower 2",
            startDate: "2025-04-05",
            endDate: "2025-12-15",
            category: "Electrical",
            vendors: ["Verma Electric Works", "Modern Electricals"],
            materials: ["Polycab Wires", "Anchor Switches", "Havells"],
            progress: 30,
            budget: "2.1 Cr",
            spent: "₹63 L",
            status: "On Track",
            workers: 28,
            priority: "Low"
        },
        {
            id: 4,
            name: "Commercial Complex Foundation",
            address: "Gurugram Sector 45",
            startDate: "2025-01-15",
            endDate: "2025-11-30",
            category: "Civil",
            vendors: ["Ganga Constructions", "Metro Builders"],
            materials: ["ACC Cement", "Jindal Steel", "Birla Tiles"],
            progress: 85,
            budget: "8.5 Cr",
            spent: "₹7.2 Cr",
            status: "Ahead of Schedule",
            workers: 68,
            priority: "High"
        }
    ];

    const [selectedProject, setSelectedProject] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedVendor, setSelectedVendor] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [viewMode] = useState("grid"); // grid or list

    // Filtered project list
    const filteredProjects = useMemo(() => {
        return projectsData.filter((p) => {
            return (
                (!selectedProject || p.name === selectedProject) &&
                (!selectedCategory || p.category === selectedCategory) &&
                (!selectedVendor || p.vendors.includes(selectedVendor)) &&
                (!selectedStatus || p.status === selectedStatus) &&
                (!searchTerm ||
                    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    p.address.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        });
    }, [projectsData, selectedProject, selectedCategory, selectedVendor, selectedStatus, searchTerm]);

    const navigate = useNavigate();

    // const getStatusColor = (status) => {
    //     switch (status) {
    //         case "On Track": return "bg-green-100 text-green-800";
    //         case "Delayed": return "bg-red-100 text-red-800";
    //         case "Ahead of Schedule": return "bg-blue-100 text-blue-800";
    //         default: return "bg-gray-100 text-gray-800";
    //     }
    // };

    // const getPriorityColor = (priority) => {
    //     switch (priority) {
    //         case "High": return "bg-red-100 text-red-800 border-red-200";
    //         case "Medium": return "bg-yellow-100 text-yellow-800 border-yellow-200";
    //         case "Low": return "bg-green-100 text-green-800 border-green-200";
    //         default: return "bg-gray-100 text-gray-800";
    //     }
    // };

    const getCategoryIcon = (category) => {
        switch (category) {
            case "Cement": return <FaHardHat className="text-orange-500" />;
            case "Steel": return <MdConstruction className="text-gray-600" />;
            case "Electrical": return <FaTools className="text-yellow-500" />;
            case "Civil": return <FaBuilding className="text-blue-500" />;
            default: return <FaIndustry className="text-gray-500" />;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
                <div>
                    {/* <h1 className="text-4xl font-bold text-gray-900 mb-2">
                        🏗 Work Management Dashboard
                    </h1> */}
                    <h1 className="text-xl sm:text-2xl font-semibold bg-gradient-to-r from-slate-900 via-blue-800 to-purple-700 bg-clip-text text-transparent">
                        Work Management Dashboard
                    </h1>
                    <p className="text-gray-600 text-lg">
                        Monitor and manage all your construction projects in one place
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {/* <button className="flex items-center gap-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl">
                        <FiPlus className="text-lg" />
                        <span className="font-semibold">Add New Project</span>
                    </button> */}
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-blue-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm font-medium">Total Projects</p>
                            <h3 className="text-3xl font-bold text-gray-900 mt-1">{projectsData.length}</h3>
                        </div>
                        <div className="bg-blue-100 p-3 rounded-xl">
                            <FiClipboard className="text-blue-600 text-2xl" />
                        </div>
                    </div>
                    <div className="flex items-center gap-1 mt-3">
                        <FiTrendingUp className="text-green-500" />
                        <span className="text-green-600 text-sm font-medium">+12% this month</span>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-green-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm font-medium">Active Workers</p>
                            <h3 className="text-3xl font-bold text-gray-900 mt-1">
                                {projectsData.reduce((a, b) => a + b.workers, 0)}
                            </h3>
                        </div>
                        <div className="bg-green-100 p-3 rounded-xl">
                            <FiUsers className="text-green-600 text-2xl" />
                        </div>
                    </div>
                    <div className="text-gray-500 text-sm mt-3">Across all sites</div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-purple-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm font-medium">Budget Utilization</p>
                            <h3 className="text-3xl font-bold text-gray-900 mt-1">
                                {Math.round(
                                    projectsData.reduce((a, b) => a + b.progress, 0) / projectsData.length
                                )}%
                            </h3>
                        </div>
                        <div className="bg-purple-100 p-3 rounded-xl">
                            <FiBarChart2 className="text-purple-600 text-2xl" />
                        </div>
                    </div>
                    <div className="text-gray-500 text-sm mt-3">Average progress</div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-orange-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm font-medium">Total Budget</p>
                            <h3 className="text-3xl font-bold text-gray-900 mt-1">₹18.6 Cr</h3>
                        </div>
                        <div className="bg-orange-100 p-3 rounded-xl">
                            <MdAttachMoney className="text-orange-600 text-2xl" />
                        </div>
                    </div>
                    <div className="text-gray-500 text-sm mt-3">Across all projects</div>
                </div>
            </div>

            {/* Filter Section */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
                <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <FiFilter className="text-blue-600" />
                        Filter Projects
                    </h2>

                    <div className="flex gap-3  ">
                        <div className="relative ">
                            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search projects..."
                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>


                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <select
                        className="border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={selectedProject}
                        onChange={(e) => setSelectedProject(e.target.value)}
                    >
                        <option value="">All Projects</option>
                        {projectsData.map((p) => (
                            <option key={p.name} value={p.name}>
                                {p.name}
                            </option>
                        ))}
                    </select>

                    <select
                        className="border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                        <option value="">All Categories</option>
                        {[...new Set(projectsData.map((p) => p.category))].map((cat) => (
                            <option key={cat}>{cat}</option>
                        ))}
                    </select>

                    <select
                        className="border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={selectedVendor}
                        onChange={(e) => setSelectedVendor(e.target.value)}
                    >
                        <option value="">All Vendors</option>
                        {[...new Set(projectsData.flatMap((p) => p.vendors))].map((v) => (
                            <option key={v}>{v}</option>
                        ))}
                    </select>

                    <select
                        className="border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                    >
                        <option value="">All Status</option>
                        {[...new Set(projectsData.map((p) => p.status))].map((status) => (
                            <option key={status}>{status}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Work Cards Section */}
            {viewMode === "grid" ? (
                <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                    {filteredProjects.map((work) => (
                        <div
                            key={work.id}
                            className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-blue-200 cursor-pointer transform hover:-translate-y-1"
                            onClick={() => navigate('/ProjectDetail')}
                        >
                            {/* Project Header */}
                            <div className="p-6 border-b border-gray-100">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-3">
                                        {getCategoryIcon(work.category)}
                                        <div>
                                            <h2 className="font-bold text-xl text-gray-900 line-clamp-1">
                                                {work.name}
                                            </h2>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ₹{getStatusColor(work.status)}`}>
                                                    {work.status}
                                                </span>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium border ₹{getPriorityColor(work.priority)}`}>
                                                    {work.priority} Priority
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">
                                        #{work.id}
                                    </span>
                                </div>

                                <div className="space-y-2 text-gray-600 text-sm">
                                    <div className="flex items-center gap-2">
                                        <FiMapPin className="text-blue-600 flex-shrink-0" />
                                        <span className="line-clamp-1">{work.address}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <FiCalendar className="text-blue-600 flex-shrink-0" />
                                        <span>{work.startDate} → {work.endDate}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Project Details */}
                            <div className="p-6">
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div className="text-center p-3 bg-blue-50 rounded-xl">
                                        <FiUsers className="text-blue-600 mx-auto mb-1" />
                                        <div className="text-sm font-semibold text-gray-900">{work.workers}</div>
                                        <div className="text-xs text-gray-600">Workers</div>
                                    </div>
                                    <div className="text-center p-3 bg-green-50 rounded-xl">
                                        <MdCurrencyRupee className="text-green-600 mx-auto mb-1" />
                                        <div className="text-sm font-semibold text-gray-900">{work.budget}</div>
                                        <div className="text-xs text-gray-600">Budget</div>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <div className="flex justify-between text-sm text-gray-700 mb-2">
                                        <span className="font-medium">Project Progress</span>
                                        <span className="font-semibold">{work.progress}%</span>
                                    </div>
                                    <ProgressBar progress={work.progress} />
                                </div>

                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Vendors:</span>
                                        <span className="text-gray-900 font-medium">{work.vendors.length}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Materials:</span>
                                        <span className="text-gray-900 font-medium">{work.materials.length}</span>
                                    </div>
                                </div>

                                <div className="flex justify-between mt-6 pt-4 border-t border-gray-100">
                                    <button className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center gap-1 transition-colors">
                                        View Details
                                    </button>
                                    <button className="text-green-600 hover:text-green-800 font-medium text-sm flex items-center gap-1 transition-colors">
                                        Update Progress
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                /* List View */
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="text-left p-4 font-semibold text-gray-700">Project</th>
                                <th className="text-left p-4 font-semibold text-gray-700">Progress</th>
                                <th className="text-left p-4 font-semibold text-gray-700">Status</th>
                                <th className="text-left p-4 font-semibold text-gray-700">Budget</th>
                                <th className="text-left p-4 font-semibold text-gray-700">Workers</th>
                                <th className="text-left p-4 font-semibold text-gray-700">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProjects.map((work) => (
                                <tr
                                    key={work.id}
                                    className="border-b border-gray-100 hover:bg-blue-50 cursor-pointer transition-colors"
                                    onClick={() => navigate('/ProjectDetail')}
                                >
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            {getCategoryIcon(work.category)}
                                            <div>
                                                <div className="font-semibold text-gray-900">{work.name}</div>
                                                <div className="text-sm text-gray-600 flex items-center gap-1">
                                                    <FiMapPin className="text-xs" />
                                                    {work.address}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="w-32">
                                            <ProgressBar progress={work.progress} />
                                        </div>
                                        <div className="text-sm text-gray-600 mt-1">{work.progress}%</div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ₹{getStatusColor(work.status)}`}>
                                            {work.status}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="font-semibold text-gray-900">{work.budget}</div>
                                        <div className="text-sm text-gray-600">Spent: {work.spent}</div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <FiUsers className="text-gray-400" />
                                            <span className="font-semibold">{work.workers}</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex gap-2">
                                            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                                                View
                                            </button>
                                            <button className="text-green-600 hover:text-green-800 text-sm font-medium">
                                                Update
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Empty State */}
            {filteredProjects.length === 0 && (
                <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
                    <div className="text-gray-400 text-6xl mb-4">🏗</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No projects found</h3>
                    <p className="text-gray-600 mb-6">Try adjusting your filters or search terms</p>
                    <button
                        onClick={() => {
                            setSelectedProject("");
                            setSelectedCategory("");
                            setSelectedVendor("");
                            setSelectedStatus("");
                            setSearchTerm("");
                        }}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Clear all filters
                    </button>
                </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all group">
                        <div className="bg-blue-100 p-3 rounded-lg group-hover:bg-blue-200 transition-colors">
                            <FiClock className="text-blue-600 text-xl" />
                        </div>
                        <div className="text-left">
                            <div className="font-semibold text-gray-900">Daily Reports</div>
                            <div className="text-sm text-gray-600">Submit progress updates</div>
                        </div>
                    </button>

                    <button className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl hover:border-green-300 hover:bg-green-50 transition-all group">
                        <div className="bg-green-100 p-3 rounded-lg group-hover:bg-green-200 transition-colors">
                            <FiUsers className="text-green-600 text-xl" />
                        </div>
                        <div className="text-left">
                            <div className="font-semibold text-gray-900">Team Management</div>
                            <div className="text-sm text-gray-600">Manage workers & vendors</div>
                        </div>
                    </button>

                    <button className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl hover:border-purple-300 hover:bg-purple-50 transition-all group">
                        <div className="bg-purple-100 p-3 rounded-lg group-hover:bg-purple-200 transition-colors">
                            <FiBarChart2 className="text-purple-600 text-xl" />
                        </div>
                        <div className="text-left">
                            <div className="font-semibold text-gray-900">Analytics</div>
                            <div className="text-sm text-gray-600">View project insights</div>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WorkDashboard;