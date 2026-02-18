import React, { useEffect, useState } from "react";
import {
    useGetProjectStockQuery,
    useGetProjectsQuery,
} from "../../Reduxe/Api";

import {
    FaLayerGroup,
    FaHistory,
    FaBoxOpen,
    FaTruckLoading,
    FaSearch
} from "react-icons/fa";
import {
    IoCube,
    IoAlertCircle,
    IoCheckmarkCircle,
    IoCloseCircle,
    IoFilter
} from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { FiRefreshCw, FiChevronRight } from "react-icons/fi";

export default function StockPage() {
    const { data: projects = [], isLoading: loadingProjects } = useGetProjectsQuery();
    const navigate = useNavigate();

    // selected project
    const [projectId, setProjectId] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [stockFilter, setStockFilter] = useState("all"); // all, in-stock, low-stock, out-of-stock
    const [selectedProject, setSelectedProject] = useState(null);

    // fetch stock for selected project
    const {
        data: stockData,
        isLoading: loadingStock,
        refetch: refetchStock
    } = useGetProjectStockQuery(projectId, { skip: !projectId });

    // auto select project on first load
    useEffect(() => {
        if (!loadingProjects && projects?.length && !projectId) {
            const firstProject = projects[0];
            setProjectId(firstProject._id);
            setSelectedProject(firstProject);
        }
    }, [projects, loadingProjects]);

    // Update selected project when projectId changes
    useEffect(() => {
        if (projectId && projects.length > 0) {
            const project = projects.find(p => p._id === projectId);
            setSelectedProject(project);
        }
    }, [projectId, projects]);

    // Filter stock based on search and filter
    const filteredStock = stockData?.stock?.filter(item => {
        // Search filter
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.category?.toLowerCase().includes(searchTerm.toLowerCase());

        // Stock status filter
        switch (stockFilter) {
            case 'in-stock':
                return matchesSearch && item.qty > 10;
            case 'low-stock':
                return matchesSearch && item.qty > 0 && item.qty <= 10;
            case 'out-of-stock':
                return matchesSearch && item.qty <= 0;
            default:
                return matchesSearch;
        }
    }) || [];

    // Calculate stock statistics
    const stockStats = {
        total: stockData?.stock?.length || 0,
        inStock: stockData?.stock?.filter(item => item.qty > 10).length || 0,
        lowStock: stockData?.stock?.filter(item => item.qty > 0 && item.qty <= 10).length || 0,
        outOfStock: stockData?.stock?.filter(item => item.qty <= 0).length || 0,
        totalQuantity: stockData?.stock?.reduce((sum, item) => sum + item.qty, 0) || 0,
    };

    useEffect(() => {
        const savedProjectId = localStorage.getItem("selectedProjectId");

        if (!loadingProjects && projects.length > 0) {
            if (savedProjectId && projects.some(p => p._id === savedProjectId)) {
                // ⭐ Restore last selected project
                setProjectId(savedProjectId);

                const project = projects.find(p => p._id === savedProjectId);
                setSelectedProject(project);
            } else {
                // First project fallback
                const firstProject = projects[0];
                setProjectId(firstProject._id);
                setSelectedProject(firstProject);
            }
        }
    }, [projects, loadingProjects]);


    // Get stock status badge
    const getStockStatus = (qty) => {
        if (qty <= 0) return {
            label: "Out of Stock",
            color: "bg-red-100 text-red-700",
            borderColor: "border-red-200",
            icon: <IoCloseCircle className="text-red-600" />
        };
        if (qty < 10) return {
            label: "Low Stock",
            color: "bg-yellow-100 text-yellow-700",
            borderColor: "border-yellow-200",
            icon: <IoAlertCircle className="text-yellow-600" />
        };
        return {
            label: "In Stock",
            color: "bg-green-100 text-green-700",
            borderColor: "border-green-200",
            icon: <IoCheckmarkCircle className="text-green-600" />
        };
    };

    // Get stock status color for quantity display
    const getQuantityColor = (qty) => {
        if (qty <= 0) return "text-red-600";
        if (qty < 10) return "text-yellow-600";
        return "text-green-600";
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-6">
            <div className="max-w-7xl mx-auto">
                {/* ===================== HEADER ===================== */}
                <div className="mb-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                        <div className="flex items-center gap-4">
                            <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white p-3 md:p-4 rounded-xl shadow-lg">
                                <IoCube className="text-2xl md:text-3xl" />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                                    Project Stock Inventory
                                </h1>
                                <p className="text-gray-600 mt-1">Real-time stock tracking & management</p>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <button
                                onClick={() => navigate(`/consumption`)}
                                className="px-4 py-2.5 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl font-medium flex items-center gap-2 shadow-sm transition-all hover:shadow"
                            >
                                <FaTruckLoading />  Stock Out
                            </button>
                            {/* <button
                                onClick={() => navigate(`/StockOut/${projectId}`)}
                                className="px-4 py-2.5 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl font-medium flex items-center gap-2 shadow-sm transition-all hover:shadow"
                            >
                                <FaTruckLoading /> Issue Stock
                            </button> */}
                            <button
                                onClick={refetchStock}
                                className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium flex items-center gap-2 transition-colors"
                            >
                                <FiRefreshCw /> Refresh
                            </button>
                        </div>
                    </div>

                    {/* ===================== PROJECT INFO CARD ===================== */}
                    {selectedProject && (
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5 mb-6">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <h2 className="text-lg font-semibold text-blue-800 mb-1">
                                        Currently Viewing
                                    </h2>
                                    <div className="flex items-center gap-3">
                                        <div className="bg-white p-3 rounded-lg shadow-sm">
                                            <FaBoxOpen className="text-blue-600" size={20} />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-800">
                                                {selectedProject.projectName}
                                            </h3>
                                            <p className="text-gray-600">
                                                {stockStats.total} items • {stockStats.totalQuantity} total units
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-lg p-4 shadow-sm">
                                    <select
                                        className="w-full p-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        value={projectId}
                                        onChange={(e) => {
                                            const newProjectId = e.target.value;
                                            setProjectId(newProjectId);

                                            // ⭐ Save selected project in localStorage
                                            localStorage.setItem("selectedProjectId", newProjectId);

                                            const project = projects.find(p => p._id === newProjectId);
                                            setSelectedProject(project);
                                        }}

                                    >
                                        {loadingProjects ? (
                                            <option>Loading projects...</option>
                                        ) : projects.map((p) => (
                                            <option key={p._id} value={p._id}>
                                                {p.projectName}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ===================== STOCK SUMMARY CARDS ===================== */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow transition-shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Total Items</p>
                                    <p className="text-2xl font-bold text-gray-800">{stockStats.total}</p>
                                </div>
                                <div className="p-3 bg-blue-50 rounded-lg">
                                    <FaLayerGroup className="text-blue-600" size={24} />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow transition-shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">In Stock</p>
                                    <p className="text-2xl font-bold text-green-600">{stockStats.inStock}</p>
                                </div>
                                <div className="p-3 bg-green-50 rounded-lg">
                                    <IoCheckmarkCircle className="text-green-600" size={24} />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow transition-shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Low Stock</p>
                                    <p className="text-2xl font-bold text-yellow-600">{stockStats.lowStock}</p>
                                </div>
                                <div className="p-3 bg-yellow-50 rounded-lg">
                                    <IoAlertCircle className="text-yellow-600" size={24} />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow transition-shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Out of Stock</p>
                                    <p className="text-2xl font-bold text-red-600">{stockStats.outOfStock}</p>
                                </div>
                                <div className="p-3 bg-red-50 rounded-lg">
                                    <IoCloseCircle className="text-red-600" size={24} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ===================== FILTERS AND SEARCH ===================== */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-6">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                            <div>
                                <h2 className="text-xl font-semibold text-gray-800 mb-2 flex items-center gap-2">
                                    <FaLayerGroup className="text-blue-600" />
                                    Stock Items
                                </h2>
                                <p className="text-gray-600">Manage and track all inventory items</p>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3">
                                {/* Search */}
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search items..."
                                        className="w-full sm:w-64 p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                    <FaSearch className="absolute left-3 top-3.5 text-gray-400" />
                                </div>

                                {/* Filter */}
                                <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-lg">
                                    <IoFilter className="text-gray-500 ml-2" />
                                    <select
                                        className="bg-transparent p-2 focus:outline-none"
                                        value={stockFilter}
                                        onChange={(e) => setStockFilter(e.target.value)}
                                    >
                                        <option value="all">All Items</option>
                                        <option value="in-stock">In Stock</option>
                                        <option value="low-stock">Low Stock</option>
                                        <option value="out-of-stock">Out of Stock</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ===================== STOCK TABLE ===================== */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        {loadingStock ? (
                            <div className="text-center py-16">
                                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                                <p className="text-gray-500">Loading stock data...</p>
                            </div>
                        ) : filteredStock.length === 0 ? (
                            <div className="text-center py-16 border-t">
                                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                    <FaLayerGroup size={28} className="text-gray-400" />
                                </div>
                                <h3 className="text-gray-500 font-medium mb-2">No stock items found</h3>
                                <p className="text-gray-400">Try changing your search or filter</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="p-4 text-left font-semibold text-gray-700 border-b">Item Details</th>
                                            <th className="p-4 text-left font-semibold text-gray-700 border-b">Stock Status</th>
                                            <th className="p-4 text-left font-semibold text-gray-700 border-b">Available</th>
                                            <th className="p-4 text-left font-semibold text-gray-700 border-b">Damaged</th>
                                            <th className="p-4 text-left font-semibold text-gray-700 border-b">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredStock.map((item) => {
                                            const status = getStockStatus(item.qty);
                                            return (
                                                <tr
                                                    key={item.itemId}
                                                    className="border-b hover:bg-blue-50 transition-colors"
                                                >
                                                    <td className="p-4">
                                                        <div>
                                                            <div className="font-medium text-gray-800">{item.name}</div>
                                                            {item.category && (
                                                                <div className="text-sm text-gray-500 mt-1">
                                                                    {item.category}
                                                                </div>
                                                            )}
                                                            {item.description && (
                                                                <div className="text-sm text-gray-400 mt-1 truncate max-w-xs">
                                                                    {item.description}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${status.color} ${status.borderColor} border`}>
                                                            {status.icon}
                                                            <span className="font-medium">{status.label}</span>
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex items-center gap-2">
                                                            <span className={`text-xl font-bold ${getQuantityColor(item.qty)}`}>
                                                                {item.qty}
                                                            </span>
                                                            <span className="text-gray-500">{item.unit}</span>
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        {item.damaged ? (
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-red-600 font-medium">
                                                                    {item.damaged}
                                                                </span>
                                                                <span className="text-gray-500">{item.unit}</span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-gray-400">-</span>
                                                        )}
                                                    </td>
                                                    <td className="p-4">
                                                        <button
                                                            onClick={() => navigate(`/StockHistory/${projectId}/${item.itemId}`)}
                                                            className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg font-medium flex items-center gap-2 transition-colors"
                                                        >
                                                            <FaHistory />
                                                            View History
                                                            <FiChevronRight />
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* TABLE FOOTER */}
                        {!loadingStock && filteredStock.length > 0 && (
                            <div className="bg-gray-50 px-6 py-4 border-t">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="text-gray-600">
                                        Showing <span className="font-semibold">{filteredStock.length}</span> of{" "}
                                        <span className="font-semibold">{stockData?.stock?.length || 0}</span> items
                                    </div>
                                    <div className="text-gray-600">
                                        <span className="font-semibold">{stockStats.totalQuantity}</span> total units available
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ===================== QUICK ACTIONS ===================== */}
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <button
                            onClick={() => navigate(`/StockOut/${projectId}`)}
                            className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-xl p-5 hover:from-red-100 hover:to-red-200 transition-all group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-red-500 text-white rounded-lg group-hover:bg-red-600 transition-colors">
                                    <FaTruckLoading size={20} />
                                </div>
                                <div className="text-left">
                                    <h3 className="font-semibold text-gray-800">Issue Stock</h3>
                                    <p className="text-sm text-gray-600">Transfer items to other projects</p>
                                </div>
                            </div>
                        </button>

                        <button
                            onClick={() => navigate(`/StockIn/${projectId}`)}
                            className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-xl p-5 hover:from-green-100 hover:to-green-200 transition-all group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-green-500 text-white rounded-lg group-hover:bg-green-600 transition-colors">
                                    <FaBoxOpen size={20} />
                                </div>
                                <div className="text-left">
                                    <h3 className="font-semibold text-gray-800">Add Stock</h3>
                                    <p className="text-sm text-gray-600">Receive new inventory items</p>
                                </div>
                            </div>
                        </button>

                        <button
                            onClick={() => navigate("/ConsumptionReport")}
                            className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-5 hover:from-blue-100 hover:to-blue-200 transition-all group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-500 text-white rounded-lg group-hover:bg-blue-600 transition-colors">
                                    <FaLayerGroup size={20} />
                                </div>
                                <div className="text-left">
                                    <h3 className="font-semibold text-gray-800">View Reports</h3>
                                    <p className="text-sm text-gray-600">Check consumption & usage reports</p>
                                </div>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}