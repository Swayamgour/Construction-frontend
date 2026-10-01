import React, { useEffect, useState } from "react";
import { useGetProjectStockQuery, useGetProjectsQuery } from "../../Reduxe/Api";
import {
  Layers,
  History,
  PackageOpen,
  Truck,
  Search,
  Filter,
  RefreshCw,
  ChevronRight,
  Box,
  CheckCircle2,
  AlertCircle,
  XCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function StockPage() {
  const { data: projects = [], isLoading: loadingProjects } = useGetProjectsQuery();
  const navigate = useNavigate();

  const [projectId, setProjectId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [stockFilter, setStockFilter] = useState("all");
  const [selectedProject, setSelectedProject] = useState(null);

  const {
    data: stockData,
    isLoading: loadingStock,
    refetch: refetchStock,
  } = useGetProjectStockQuery(projectId, { skip: !projectId });

  useEffect(() => {
    if (!loadingProjects && projects?.length && !projectId) {
      const firstProject = projects[0];
      setProjectId(firstProject._id);
      setSelectedProject(firstProject);
    }
  }, [projects, loadingProjects]);

  useEffect(() => {
    if (projectId && projects.length > 0) {
      const project = projects.find((p) => p._id === projectId);
      setSelectedProject(project);
    }
  }, [projectId, projects]);

  const filteredStock =
    stockData?.stock?.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category?.toLowerCase().includes(searchTerm.toLowerCase());

      switch (stockFilter) {
        case "in-stock":
          return matchesSearch && item.qty > 10;
        case "low-stock":
          return matchesSearch && item.qty > 0 && item.qty <= 10;
        case "out-of-stock":
          return matchesSearch && item.qty <= 0;
        default:
          return matchesSearch;
      }
    }) || [];

  const stockStats = {
    total: stockData?.stock?.length || 0,
    inStock: stockData?.stock?.filter((item) => item.qty > 10).length || 0,
    lowStock: stockData?.stock?.filter((item) => item.qty > 0 && item.qty <= 10).length || 0,
    outOfStock: stockData?.stock?.filter((item) => item.qty <= 0).length || 0,
    totalQuantity: stockData?.stock?.reduce((sum, item) => sum + item.qty, 0) || 0,
  };

  useEffect(() => {
    const savedProjectId = localStorage.getItem("selectedProjectId");

    if (!loadingProjects && projects.length > 0) {
      if (savedProjectId && projects.some((p) => p._id === savedProjectId)) {
        setProjectId(savedProjectId);
        const project = projects.find((p) => p._id === savedProjectId);
        setSelectedProject(project);
      } else {
        const firstProject = projects[0];
        setProjectId(firstProject._id);
        setSelectedProject(firstProject);
      }
    }
  }, [projects, loadingProjects]);

  const getStockStatus = (qty) => {
    if (qty <= 0)
      return { label: "Out of Stock", color: "bg-red-50 text-red-700", borderColor: "border-red-200", icon: <XCircle size={14} className="text-red-600" /> };
    if (qty < 10)
      return { label: "Low Stock", color: "bg-amber-50 text-amber-700", borderColor: "border-amber-200", icon: <AlertCircle size={14} className="text-amber-600" /> };
    return { label: "In Stock", color: "bg-emerald-50 text-emerald-700", borderColor: "border-emerald-200", icon: <CheckCircle2 size={14} className="text-emerald-600" /> };
  };

  const getQuantityColor = (qty) => {
    if (qty <= 0) return "text-red-600";
    if (qty < 10) return "text-amber-600";
    return "text-emerald-600";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50/40 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-indigo-600 to-blue-600 text-white p-3.5 rounded-2xl shadow-lg shadow-indigo-900/25">
                <Box size={26} />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Project Stock Inventory</h1>
                <p className="text-gray-500 mt-1">Real-time stock tracking & management</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => navigate(`/consumption`)}
                className="px-4 py-2.5 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl font-medium flex items-center gap-2 shadow-lg shadow-red-900/20 transition-all"
              >
                <Truck size={15} /> Stock Out
              </button>
              <button
                onClick={refetchStock}
                className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium flex items-center gap-2 transition-colors"
              >
                <RefreshCw size={15} /> Refresh
              </button>
            </div>
          </div>

          {/* PROJECT INFO CARD */}
          {selectedProject && (
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100 rounded-2xl p-5 mb-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-sm font-semibold text-indigo-700 mb-1.5 uppercase tracking-wide">Currently Viewing</h2>
                  <div className="flex items-center gap-3">
                    <div className="bg-white p-2.5 rounded-xl shadow-sm">
                      <PackageOpen className="text-indigo-600" size={20} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">{selectedProject.projectName}</h3>
                      <p className="text-gray-500 text-sm">
                        {stockStats.total} items • {stockStats.totalQuantity} total units
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-3.5 shadow-sm">
                  <select
                    className="w-full p-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    value={projectId}
                    onChange={(e) => {
                      const newProjectId = e.target.value;
                      setProjectId(newProjectId);
                      localStorage.setItem("selectedProjectId", newProjectId);
                      const project = projects.find((p) => p._id === newProjectId);
                      setSelectedProject(project);
                    }}
                  >
                    {loadingProjects ? (
                      <option>Loading projects...</option>
                    ) : (
                      projects?.data?.map((p) => (
                        <option key={p._id} value={p._id}>
                          {p.projectName}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STOCK SUMMARY CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm shadow-gray-200/60 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Total Items</p>
                  <p className="text-2xl font-bold text-gray-800">{stockStats.total}</p>
                </div>
                <div className="p-3 bg-indigo-50 rounded-xl">
                  <Layers className="text-indigo-600" size={22} />
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm shadow-gray-200/60 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">In Stock</p>
                  <p className="text-2xl font-bold text-emerald-600">{stockStats.inStock}</p>
                </div>
                <div className="p-3 bg-emerald-50 rounded-xl">
                  <CheckCircle2 className="text-emerald-600" size={22} />
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm shadow-gray-200/60 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Low Stock</p>
                  <p className="text-2xl font-bold text-amber-600">{stockStats.lowStock}</p>
                </div>
                <div className="p-3 bg-amber-50 rounded-xl">
                  <AlertCircle className="text-amber-600" size={22} />
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm shadow-gray-200/60 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Out of Stock</p>
                  <p className="text-2xl font-bold text-red-600">{stockStats.outOfStock}</p>
                </div>
                <div className="p-3 bg-red-50 rounded-xl">
                  <XCircle className="text-red-600" size={22} />
                </div>
              </div>
            </div>
          </div>

          {/* FILTERS AND SEARCH */}
          <div className="bg-white rounded-2xl shadow-sm shadow-gray-200/60 border border-gray-100 p-5 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-1 flex items-center gap-2">
                  <Layers className="text-indigo-600" size={18} />
                  Stock Items
                </h2>
                <p className="text-gray-500 text-sm">Manage and track all inventory items</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search items..."
                    className="w-full sm:w-64 p-2.5 pl-10 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                </div>

                <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 px-2 rounded-xl">
                  <Filter className="text-gray-400" size={15} />
                  <select
                    className="bg-transparent p-2 focus:outline-none text-sm"
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

          {/* STOCK TABLE */}
          <div className="bg-white rounded-2xl shadow-sm shadow-gray-200/60 border border-gray-100 overflow-hidden">
            {loadingStock ? (
              <div className="text-center py-16">
                <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-indigo-500 border-t-transparent mb-4"></div>
                <p className="text-gray-500">Loading stock data...</p>
              </div>
            ) : filteredStock.length === 0 ? (
              <div className="text-center py-16 border-t border-gray-100">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Layers size={26} className="text-gray-400" />
                </div>
                <h3 className="text-gray-500 font-medium mb-1">No stock items found</h3>
                <p className="text-gray-400 text-sm">Try changing your search or filter</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50/70 text-gray-500 text-xs uppercase tracking-wide">
                    <tr>
                      <th className="p-4 text-left font-semibold">Item Details</th>
                      <th className="p-4 text-left font-semibold">Stock Status</th>
                      <th className="p-4 text-left font-semibold">Available</th>
                      <th className="p-4 text-left font-semibold">Damaged</th>
                      <th className="p-4 text-left font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredStock.map((item) => {
                      const status = getStockStatus(item.qty);
                      return (
                        <tr key={item.itemId} className="hover:bg-indigo-50/30 transition-colors">
                          <td className="p-4">
                            <div className="font-medium text-gray-800">{item.name}</div>
                            {item.category && <div className="text-sm text-gray-500 mt-0.5">{item.category}</div>}
                            {item.description && (
                              <div className="text-sm text-gray-400 mt-0.5 truncate max-w-xs">{item.description}</div>
                            )}
                          </td>
                          <td className="p-4">
                            <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full ${status.color} ${status.borderColor} border`}>
                              {status.icon}
                              <span className="font-medium text-xs">{status.label}</span>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <span className={`text-lg font-bold ${getQuantityColor(item.qty)}`}>{item.qty}</span>
                              <span className="text-gray-400 text-sm">{item.unit}</span>
                            </div>
                          </td>
                          <td className="p-4">
                            {item.damaged ? (
                              <div className="flex items-center gap-1.5">
                                <span className="text-red-600 font-medium">{item.damaged}</span>
                                <span className="text-gray-400 text-sm">{item.unit}</span>
                              </div>
                            ) : (
                              <span className="text-gray-300">-</span>
                            )}
                          </td>
                          <td className="p-4">
                            <button
                              onClick={() => navigate(`/StockHistory/${projectId}/${item.itemId}`)}
                              className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl font-medium flex items-center gap-1.5 transition-colors text-sm"
                            >
                              <History size={14} /> View History <ChevronRight size={14} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {!loadingStock && filteredStock.length > 0 && (
              <div className="bg-gray-50/70 px-6 py-4 border-t border-gray-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm">
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

          {/* QUICK ACTIONS */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => navigate(`/StockOut/${projectId}`)}
              className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-2xl p-5 hover:from-red-100 hover:to-red-200 transition-all group text-left"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-500 text-white rounded-xl group-hover:bg-red-600 transition-colors">
                  <Truck size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Issue Stock</h3>
                  <p className="text-sm text-gray-600">Transfer items to other projects</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => navigate(`/StockIn/${projectId}`)}
              className="bg-gradient-to-r from-emerald-50 to-emerald-100 border border-emerald-200 rounded-2xl p-5 hover:from-emerald-100 hover:to-emerald-200 transition-all group text-left"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-500 text-white rounded-xl group-hover:bg-emerald-600 transition-colors">
                  <PackageOpen size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Add Stock</h3>
                  <p className="text-sm text-gray-600">Receive new inventory items</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => navigate("/ConsumptionReport")}
              className="bg-gradient-to-r from-indigo-50 to-blue-100 border border-indigo-200 rounded-2xl p-5 hover:from-indigo-100 hover:to-blue-200 transition-all group text-left"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-500 text-white rounded-xl group-hover:bg-indigo-600 transition-colors">
                  <Layers size={20} />
                </div>
                <div>
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
