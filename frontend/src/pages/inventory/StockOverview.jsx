import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  useGetMaterialRequestQuery,
  useGetProjectsQuery,
} from "../../Reduxe/Api";

import {
  FiMinusCircle,
  FiPlusCircle,
  FiFilter,
  FiDownload,
  FiSearch,
  FiTrendingUp,
  FiPackage,
} from "react-icons/fi";

import {
  FaBoxOpen,
  FaTruckLoading,
  FaList,
  FaWarehouse,
  FaProjectDiagram,
} from "react-icons/fa";

import { IoStatsChart } from "react-icons/io5";

export default function StockOverview() {
  const navigate = useNavigate();

  const { data: requests = [], isLoading: requestsLoading } = useGetMaterialRequestQuery();
  const { data: projects = [], isLoading: projectLoading } = useGetProjectsQuery();


  // console.log(requests, projects)

  const [selectedProjectId, setSelectedProjectId] = useState(
    localStorage.getItem("selectedProjectId") || ""
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  // Auto-select first project
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

  // ===================
  // FILTER ALL REQUESTS
  // ===================
  const filteredRequests = requests?.filter((req) => {
    const matchesProject = req.projectId?._id === selectedProjectId;

    // MULTI-ITEM SEARCH
    const matchesSearch =
      req.items?.some((it) =>
        it.itemId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      ) ||
      req.requestedBy?.name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || req.status === statusFilter;

    const matchesPriority =
      priorityFilter === "all" ||
      req.items?.some((it) => it.priority === priorityFilter);

    return matchesProject && matchesSearch && matchesStatus && matchesPriority;
  });

  // ===================
  // STATISTICS
  // ===================
  const stats = {
    total: filteredRequests?.length || 0,
    pending: filteredRequests?.filter((req) => req.status === "pending").length,
    approved: filteredRequests?.filter((req) => req.status === "approved").length,
    rejected: filteredRequests?.filter((req) => req.status === "rejected").length,
    highPriority:
      filteredRequests?.filter((req) =>
        req.items.some((it) => it.priority === "high")
      ).length || 0,
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-orange-500";
      case "approved":
        return "bg-green-500";
      case "rejected":
        return "bg-red-500";
      case "completed":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "bg-gradient-to-r from-red-500 to-pink-600";
      case "medium":
        return "bg-gradient-to-r from-amber-500 to-orange-500";
      case "low":
        return "bg-gradient-to-r from-green-500 to-emerald-600";
      default:
        return "bg-gradient-to-r from-gray-500 to-gray-600";
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case "high":
        return "🔥";
      case "medium":
        return "⚡";
      case "low":
        return "🌱";
      default:
        return "📋";
    }
  };

  if (requestsLoading || projectLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-lg">Loading stock overview...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">

        {/* ================= HEADER ================= */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-6">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500 rounded-2xl blur-lg opacity-30"></div>
              <div className="relative bg-blue-600 rounded-2xl p-3 shadow-2xl">
                <FaWarehouse className="text-white text-2xl" />
              </div>
            </div>

            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Inventory Stock Overview
              </h1>
              <p className="text-gray-600 mt-1">
                Manage and track all material requests project wise
              </p>
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() =>
                navigate("/MaterialRequest", { state: { selectedProjectId } })
              }
              className="flex items-center gap-3 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg hover:scale-105 transition"
            >
              <FiPlusCircle className="text-xl" />
              Add Stock
            </button>

            {/* <button
              onClick={() =>
                navigate("/StockOutCreate", { state: { selectedProjectId } })
              }
              className="flex items-center gap-3 bg-red-500 text-white px-6 py-3 rounded-xl shadow-lg hover:scale-105 transition"
            >
              <FiMinusCircle className="text-xl" />
              Stock Assign
            </button> */}
          </div>
        </div>

        {/* ================= PROJECT SELECTOR ================= */}
        <div className="bg-white rounded-2xl shadow-xl border p-6 mb-8">
          <div className="flex flex-col lg:flex-row justify-between gap-4">
            <div className="flex items-center gap-3">
              <FaProjectDiagram className="text-blue-500 text-xl" />
              <div>
                <label className="text-gray-800 font-semibold text-lg">Select Project</label>
                <p className="text-gray-600 text-sm">Filter data project-wise</p>
              </div>
            </div>

            <select
              value={selectedProjectId}
              onChange={handleProjectChange}
              className="px-4 py-3 border-2 rounded-xl bg-gray-50 text-gray-800"
            >
              {projects?.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.projectName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ================= STATISTICS ================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

          <div className="bg-blue-600 rounded-2xl p-6 text-white shadow-xl">
            <p className="text-blue-100 text-sm">Total Requests</p>
            <p className="text-3xl font-bold mt-2">{stats.total}</p>
          </div>

          <div className="bg-amber-500 rounded-2xl p-6 text-white shadow-xl">
            <p className="text-amber-100 text-sm">Pending</p>
            <p className="text-3xl font-bold mt-2">{stats.pending}</p>
          </div>

          <div className="bg-green-600 rounded-2xl p-6 text-white shadow-xl">
            <p className="text-green-100 text-sm">Approved</p>
            <p className="text-3xl font-bold mt-2">{stats.approved}</p>
          </div>

          <div className="bg-red-600 rounded-2xl p-6 text-white shadow-xl">
            <p className="text-red-100 text-sm">High Priority</p>
            <p className="text-3xl font-bold mt-2">{stats.highPriority}</p>
          </div>

        </div>

        {/* ================= FILTERS ================= */}
        <div className="bg-white rounded-2xl shadow-xl border p-6 mb-6">

          <div className="flex flex-col lg:flex-row justify-between items-center gap-4">

            <div className="flex items-center gap-3">
              <FiFilter className="text-gray-500 text-xl" />
              <span className="text-gray-700 font-semibold">Filters</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full">

              {/* SEARCH */}
              <div className="relative flex-1">
                <FiSearch className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by item or requester..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 py-3 border-2 rounded-xl bg-gray-50"
                />
              </div>

              {/* STATUS */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 border-2 rounded-xl bg-gray-50"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>

              {/* PRIORITY */}
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-4 py-3 border-2 rounded-xl bg-gray-50"
              >
                <option value="all">All Priority</option>
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>

            </div>
          </div>
        </div>

        {/* ================= TABLE ================= */}
        <div className="bg-white rounded-2xl shadow-xl border overflow-hidden">

          {/* HEADER */}
          <div className="bg-blue-50 px-6 py-4 border-b">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <FaList className="text-blue-500" />
                Material Requests
              </h3>

              <span className="text-gray-600">
                Showing {filteredRequests.length}
              </span>
            </div>
          </div>

          {/* TABLE CONTENT */}
          {filteredRequests.length === 0 ? (
            <div className="py-16 text-center">
              <FaBoxOpen className="text-gray-300 text-6xl mx-auto mb-3" />
              <p className="text-gray-500">No Requests Found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">

                <thead className="bg-gray-100 text-gray-600 text-sm uppercase">
                  <tr>
                    <th className="px-6 py-4">Items</th>
                    <th className="px-6 py-4">Quantity</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Priority</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Requested By</th>
                    <th className="px-6 py-4">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y">

                  {filteredRequests.map((req) => (
                    <tr
                      key={req._id}
                      className="hover:bg-blue-50 cursor-pointer transition"
                    >

                      {/* ITEM NAMES */}
                      <td className="px-6 py-4">
                        {req.items.map((it, index) => (
                          <div key={index} className="mb-1 font-semibold">
                            {it.itemId?.name}
                            <span className="text-gray-500 text-sm"> ({it.unit})</span>
                          </div>
                        ))}
                      </td>

                      {/* QUANTITY */}
                      <td className="px-6 py-4">
                        {req.items.map((it, index) => (
                          <div key={index} className="font-medium">
                            {it.requestedQty}{" "}
                            <span className="text-gray-500">{it.unit}</span>
                          </div>
                        ))}
                      </td>

                      {/* REQUIRED DATE */}
                      <td className="px-6 py-4">
                        <span className="font-medium">
                          {new Date(req.requiredDate).toLocaleDateString("en-US")}
                        </span>
                      </td>

                      {/* PRIORITY */}
                      <td className="px-6 py-4">
                        {req.items.map((it, index) => (
                          <span
                            key={index}
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-white mr-2 ${getPriorityColor(
                              it.priority
                            )}`}
                          >
                            {getPriorityIcon(it.priority)}
                            {it.priority}
                          </span>
                        ))}
                      </td>

                      {/* STATUS */}
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-white text-sm ${getStatusColor(
                            req.status
                          )}`}
                        >
                          {req.status}
                        </span>
                      </td>

                      {/* REQUESTED BY */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                            <span className="text-purple-600 font-bold">
                              {req.requestedBy?.name?.charAt(0)}
                            </span>
                          </div>
                          <span className="font-medium text-gray-800">
                            {req.requestedBy?.name}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <button
                          disabled={req.status !== "approved"}
                          onClick={() => {
                            if (req.status === "approved") navigate(`/GRNCreate/${req._id}`);
                          }}
                          className={`px-4 py-2 rounded-lg text-white
                               ${req.status === "approved"
                              ? "bg-green-600 hover:bg-green-700 cursor-pointer"
                              : "bg-gray-400 cursor-not-allowed"
                            }
                        `}
                        >
                          {req.status === "pending"
                            ? "Wait for Approval"
                            : req.status === "approved"
                              ? "GRN Create"
                              : req.status === "ordered"
                                ? "Already Created"
                                : "completed"}
                        </button>

                      </td>

                    </tr>
                  ))}

                </tbody>

              </table>
            </div>
          )}
        </div>

        {/* ================= FOOTER STATS ================= */}
        <div className="mt-8 bg-white rounded-2xl shadow-xl p-6">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <FiTrendingUp className="text-blue-500" />
            Quick Insights
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            <div className="flex gap-3 items-center p-3 bg-blue-50 rounded-xl">
              <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
              <span className="text-gray-700">
                <strong>{stats.pending}</strong> requests pending approval
              </span>
            </div>

            <div className="flex gap-3 items-center p-3 bg-amber-50 rounded-xl">
              <div className="w-3 h-3 bg-amber-600 rounded-full"></div>
              <span className="text-gray-700">
                <strong>{stats.highPriority}</strong> high priority requests
              </span>
            </div>

            <div className="flex gap-3 items-center p-3 bg-green-50 rounded-xl">
              <div className="w-3 h-3 bg-green-600 rounded-full"></div>
              <span className="text-gray-700">
                <strong>{stats.approved}</strong> requests approved
              </span>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
