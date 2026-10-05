import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Warehouse,
  FolderKanban,
  Search,
  Filter,
  TrendingUp,
  PackageOpen,
  ListChecks,
  PlusCircle,
  Flame,
  Zap,
  Sprout,
  ClipboardList,
} from "lucide-react";
import { useGetMaterialRequestQuery, useGetProjectsQuery } from "../../Reduxe/Api";

const STATUS_STYLES = {
  pending: "bg-amber-50 text-amber-700",
  approved: "bg-emerald-50 text-emerald-700",
  rejected: "bg-red-50 text-red-700",
  completed: "bg-blue-50 text-blue-700",
};

const PRIORITY_META = {
  high: { chip: "from-red-500 to-pink-600", icon: Flame },
  medium: { chip: "from-amber-500 to-orange-500", icon: Zap },
  low: { chip: "from-emerald-500 to-teal-600", icon: Sprout },
};

const STAT_CARDS = [
  { key: "total", label: "Total Requests", chip: "from-indigo-600 to-blue-600", icon: ClipboardList },
  { key: "pending", label: "Pending", chip: "from-amber-500 to-orange-600", icon: PackageOpen },
  { key: "approved", label: "Approved", chip: "from-emerald-500 to-teal-600", icon: ListChecks },
  { key: "highPriority", label: "High Priority", chip: "from-red-500 to-rose-600", icon: Flame },
];

export default function StockOverview() {
  const navigate = useNavigate();

  const { data: requests = [], isLoading: requestsLoading } = useGetMaterialRequestQuery();
  const { data: projects = [], isLoading: projectLoading } = useGetProjectsQuery();

  const [selectedProjectId, setSelectedProjectId] = useState(
    localStorage.getItem("selectedProjectId") || ""
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  useEffect(() => {
    if (!projectLoading && projects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(projects[0]._id);
      localStorage.setItem("selectedProjectId", projects[0]._id);
    }
  }, [projects, projectLoading, selectedProjectId]);

  const handleProjectChange = (e) => {
    setSelectedProjectId(e.target.value);
    localStorage.setItem("selectedProjectId", e.target.value);
  };

  const filteredRequests = requests?.filter((req) => {
    const matchesProject = req.projectId?._id === selectedProjectId;

    const matchesSearch =
      req.items?.some((it) => it.itemId?.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      req.requestedBy?.name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || req.status === statusFilter;

    const matchesPriority = priorityFilter === "all" || req.items?.some((it) => it.priority === priorityFilter);

    return matchesProject && matchesSearch && matchesStatus && matchesPriority;
  });

  const stats = {
    total: filteredRequests?.length || 0,
    pending: filteredRequests?.filter((req) => req.status === "pending").length,
    approved: filteredRequests?.filter((req) => req.status === "approved").length,
    rejected: filteredRequests?.filter((req) => req.status === "rejected").length,
    highPriority: filteredRequests?.filter((req) => req.items.some((it) => it.priority === "high")).length || 0,
  };

  if (requestsLoading || projectLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-14 w-14 border-4 border-indigo-500 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600 text-lg">Loading stock overview...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50/40 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-6">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-indigo-900/25">
              <Warehouse size={26} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-slate-900 to-indigo-700 bg-clip-text text-transparent">
                Inventory Stock Overview
              </h1>
              <p className="text-gray-500 mt-1">Manage and track all material requests project wise</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/stock/operations?tab=inventory", { state: { selectedProjectId } })}
              className="flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-5 py-3 rounded-xl shadow-sm transition-all font-medium"
            >
              <Warehouse size={18} /> View Inventory
            </button>
            <button
              onClick={() => navigate("/stock/requests", { state: { selectedProjectId } })}
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-6 py-3 rounded-xl shadow-lg shadow-emerald-900/20 transition-all font-medium"
            >
              <PlusCircle size={18} /> Material Requests
            </button>
          </div>
        </div>

        {/* PROJECT SELECTOR */}
        <div className="bg-white rounded-2xl shadow-sm shadow-gray-200/60 border border-gray-100 p-5 sm:p-6 mb-8">
          <div className="flex flex-col lg:flex-row justify-between gap-4">
            <div className="flex items-center gap-3">
              <FolderKanban className="text-indigo-500" size={20} />
              <div>
                <label className="text-gray-800 font-semibold">Select Project</label>
                <p className="text-gray-500 text-sm">Filter data project-wise</p>
              </div>
            </div>

            <select
              value={selectedProjectId}
              onChange={handleProjectChange}
              className="px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-gray-800 transition-all"
            >
              {(Array.isArray(projects) ? projects : projects?.data || []).map((p) => (
                <option key={p._id} value={p._id}>
                  {p.projectName || p.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* STATISTICS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {STAT_CARDS.map((c) => {
            const Icon = c.icon;
            return (
              <div key={c.key} className={`bg-gradient-to-br ${c.chip} rounded-2xl p-5 text-white shadow-lg`}>
                <div className="flex items-center justify-between">
                  <p className="text-white/80 text-sm">{c.label}</p>
                  <Icon size={18} className="text-white/70" />
                </div>
                <p className="text-3xl font-bold mt-2">{stats[c.key]}</p>
              </div>
            );
          })}
        </div>

        {/* FILTERS */}
        <div className="bg-white rounded-2xl shadow-sm shadow-gray-200/60 border border-gray-100 p-5 sm:p-6 mb-6">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2 shrink-0">
              <Filter className="text-gray-400" size={18} />
              <span className="text-gray-700 font-semibold">Filters</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Search by item or requester..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>

              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              >
                <option value="all">All Priority</option>
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
            </div>
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-2xl shadow-sm shadow-gray-200/60 border border-gray-100 overflow-hidden">
          <div className="bg-gray-50/70 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-lg font-bold flex items-center gap-2 text-gray-800">
              <ListChecks className="text-indigo-500" size={18} />
              Material Requests
            </h3>
            <span className="text-gray-500 text-sm">Showing {filteredRequests.length}</span>
          </div>

          {filteredRequests.length === 0 ? (
            <div className="py-16 text-center">
              <PackageOpen className="text-gray-300 mx-auto mb-3" size={48} />
              <p className="text-gray-500">No Requests Found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50/70 text-gray-500 text-xs uppercase tracking-wide">
                  <tr>
                    <th className="px-6 py-3 font-semibold">Items</th>
                    <th className="px-6 py-3 font-semibold">Quantity</th>
                    <th className="px-6 py-3 font-semibold">Date</th>
                    <th className="px-6 py-3 font-semibold">Priority</th>
                    <th className="px-6 py-3 font-semibold">Status</th>
                    <th className="px-6 py-3 font-semibold">Requested By</th>
                    <th className="px-6 py-3 font-semibold">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {filteredRequests.map((req) => (
                    <tr key={req._id} className="hover:bg-indigo-50/30 transition-colors">
                      <td className="px-6 py-4">
                        {req.items.map((it, index) => (
                          <div key={index} className="mb-1 font-semibold text-gray-800">
                            {it.itemId?.name}
                            <span className="text-gray-400 text-xs"> ({it.unit})</span>
                          </div>
                        ))}
                      </td>

                      <td className="px-6 py-4">
                        {req.items.map((it, index) => (
                          <div key={index} className="font-medium text-gray-700">
                            {it.requestedQty} <span className="text-gray-400">{it.unit}</span>
                          </div>
                        ))}
                      </td>

                      <td className="px-6 py-4 font-medium text-gray-600">
                        {new Date(req.requiredDate).toLocaleDateString("en-US")}
                      </td>

                      <td className="px-6 py-4">
                        {req.items.map((it, index) => {
                          const meta = PRIORITY_META[it.priority] || { chip: "from-gray-400 to-gray-500", icon: ClipboardList };
                          const Icon = meta.icon;
                          return (
                            <span
                              key={index}
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-white text-xs mr-1.5 mb-1 bg-gradient-to-r ${meta.chip}`}
                            >
                              <Icon size={11} /> {it.priority}
                            </span>
                          );
                        })}
                      </td>

                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[req.status] || "bg-gray-100 text-gray-600"}`}>
                          {req.status}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center">
                            <span className="text-indigo-600 font-bold text-sm">{req.requestedBy?.name?.charAt(0)}</span>
                          </div>
                          <span className="font-medium text-gray-800">{req.requestedBy?.name}</span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <button
                          onClick={() => {
                            navigate(`/stock/requests`);
                          }}
                          className={`px-4 py-2 rounded-xl text-sm font-medium text-white transition-colors cursor-pointer shadow-md ${
                            req.status === "approved"
                              ? "bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 shadow-emerald-900/20"
                              : "bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 shadow-indigo-900/20"
                          }`}
                        >
                          {req.status === "pending"
                            ? "Review Request"
                            : req.status === "approved"
                            ? "Fulfill / Stock Check"
                            : req.status === "rejected"
                            ? "View Reason"
                            : "View Details"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* FOOTER STATS */}
        <div className="mt-8 bg-white rounded-2xl shadow-sm shadow-gray-200/60 border border-gray-100 p-5 sm:p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-800">
            <TrendingUp className="text-indigo-500" size={18} />
            Quick Insights
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex gap-3 items-center p-3.5 bg-amber-50 rounded-xl">
              <div className="w-2.5 h-2.5 bg-amber-500 rounded-full shrink-0"></div>
              <span className="text-gray-700 text-sm">
                <strong>{stats.pending}</strong> requests pending approval
              </span>
            </div>

            <div className="flex gap-3 items-center p-3.5 bg-red-50 rounded-xl">
              <div className="w-2.5 h-2.5 bg-red-500 rounded-full shrink-0"></div>
              <span className="text-gray-700 text-sm">
                <strong>{stats.highPriority}</strong> high priority requests
              </span>
            </div>

            <div className="flex gap-3 items-center p-3.5 bg-emerald-50 rounded-xl">
              <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full shrink-0"></div>
              <span className="text-gray-700 text-sm">
                <strong>{stats.approved}</strong> requests approved
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
