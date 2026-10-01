import React, { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Users2,
  FolderKanban,
  UserPlus,
  CalendarCheck,
  ArrowRightLeft,
  UserMinus,
  Eye,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  X,
  Phone,
  ShieldCheck,
  Building2,
  Timer,
} from "lucide-react";
import {
  useGetProjectsQuery,
  useGetProjectActiveLabourQuery,
  useTransferLabourMutation,
  useReleaseLabourMutation,
} from "../../Reduxe/Api";
import { CheckRole } from "../../helper/CheckRole";
import toast from "react-hot-toast";

const PAGE_SIZE = 15;

export default function ProjectActiveLabour() {
  const navigate = useNavigate();
  const { role, user } = CheckRole();
  const isAdminOrManager = ["admin", "manager"].includes(role?.toLowerCase());

  const { data: projectResp } = useGetProjectsQuery();
  const projects = projectResp?.data || projectResp || [];

  const [projectId, setProjectId] = useState("");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [labourTypeFilter, setLabourTypeFilter] = useState("");

  // Modals state
  const [transferTarget, setTransferTarget] = useState(null);
  const [releaseTarget, setReleaseTarget] = useState(null);

  const [transferForm, setTransferForm] = useState({
    toProjectId: "",
    transferDate: new Date().toISOString().split("T")[0],
    reason: "",
    remarks: "",
  });

  const [releaseForm, setReleaseForm] = useState({
    releaseDate: new Date().toISOString().split("T")[0],
    releaseReason: "",
    remarks: "",
  });

  const [transferLabour, { isLoading: isTransferring }] = useTransferLabourMutation();
  const [releaseLabour, { isLoading: isReleasing }] = useReleaseLabourMutation();

  const { data, isFetching, refetch } = useGetProjectActiveLabourQuery(
    { projectId, page, limit: PAGE_SIZE },
    { skip: !projectId }
  );

  const assignments = data?.data || [];
  const pagination = data?.pagination || {};
  const totalPages = pagination.totalPages || (pagination.total ? Math.ceil(pagination.total / PAGE_SIZE) : 1);

  const selectedProject = projects.find((p) => p._id === projectId);

  // Client-side quick filter on name / phone / category
  const filteredAssignments = useMemo(() => {
    return assignments.filter((item) => {
      const labour = item.labourId || {};
      const matchesSearch =
        !search ||
        labour.name?.toLowerCase().includes(search.toLowerCase()) ||
        labour.phone?.includes(search);
      const matchesCategory = !categoryFilter || labour.category === categoryFilter;
      const matchesType = !labourTypeFilter || labour.labourType === labourTypeFilter;
      return matchesSearch && matchesCategory && matchesType;
    });
  }, [assignments, search, categoryFilter, labourTypeFilter]);

  // Today stats summary derived from project active labour
  const stats = useMemo(() => {
    let present = 0;
    let absent = 0;
    let halfDay = 0;
    let otHours = 0;
    let totalWorkHours = 0;

    assignments.forEach((a) => {
      const att = a.todayAttendance;
      if (att) {
        if (att.status === "Present") present++;
        else if (att.status === "Absent") absent++;
        else if (att.status === "Half-Day") halfDay++;

        otHours += Number(att.overtimeHours || 0);
        totalWorkHours += Number(att.totalWorkingHours || att.regularWorkingHours || 0);
      }
    });

    return {
      total: pagination.total || assignments.length,
      present,
      absent,
      halfDay,
      notMarked: Math.max(0, (pagination.total || assignments.length) - (present + absent + halfDay)),
      otHours: Math.round(otHours * 10) / 10,
      totalWorkHours: Math.round(totalWorkHours * 10) / 10,
    };
  }, [assignments, pagination.total]);

  // Handle Transfer Submit
  const handleTransferSubmit = async (e) => {
    e.preventDefault();
    if (!transferTarget) return;

    if (!transferForm.toProjectId) {
      toast.error("Please select a target destination project");
      return;
    }
    if (!transferForm.reason.trim()) {
      toast.error("Please provide a transfer reason");
      return;
    }

    try {
      await transferLabour({
        labourId: transferTarget.labourId?._id || transferTarget.labourId,
        toProjectId: transferForm.toProjectId,
        transferDate: transferForm.transferDate,
        reason: transferForm.reason,
        remarks: transferForm.remarks,
      }).unwrap();

      toast.success("Labour transferred successfully");
      setTransferTarget(null);
      setTransferForm({
        toProjectId: "",
        transferDate: new Date().toISOString().split("T")[0],
        reason: "",
        remarks: "",
      });
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || err?.message || "Failed to transfer labour");
    }
  };

  // Handle Release Submit
  const handleReleaseSubmit = async (e) => {
    e.preventDefault();
    if (!releaseTarget) return;

    try {
      await releaseLabour({
        labourId: releaseTarget.labourId?._id || releaseTarget.labourId,
        releaseDate: releaseForm.releaseDate,
        releaseReason: releaseForm.releaseReason,
        remarks: releaseForm.remarks,
      }).unwrap();

      toast.success("Labour released successfully (now Unassigned)");
      setReleaseTarget(null);
      setReleaseForm({
        releaseDate: new Date().toISOString().split("T")[0],
        releaseReason: "",
        remarks: "",
      });
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || err?.message || "Failed to release labour");
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-lg shadow-indigo-900/20">
            <Users2 size={24} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Project Labour Workforce</h1>
            <p className="text-sm text-slate-500">
              Active assigned workers, daily attendance, working hours, and deployment actions
            </p>
          </div>
        </div>

        {/* Global Quick Action Buttons */}
        <div className="flex items-center gap-2">
          {projectId && (
            <Link
              to={`/projects/${projectId}/attendance`}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 rounded-xl text-sm font-semibold transition-all shadow-sm"
            >
              <CalendarCheck size={16} />
              <span>Mark / View Attendance</span>
            </Link>
          )}

          {isAdminOrManager && (
            <Link
              to="/labour/unassigned"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-indigo-600/20"
            >
              <UserPlus size={16} />
              <span>Assign Labour</span>
            </Link>
          )}
        </div>
      </div>

      {/* Project Selector Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 sm:p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
              Select Active Project
            </label>
            <div className="relative">
              <FolderKanban size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <select
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm font-medium text-slate-800 transition-all cursor-pointer"
                value={projectId}
                onChange={(e) => {
                  setProjectId(e.target.value);
                  setPage(1);
                  setSearch("");
                }}
              >
                <option value="">-- Choose a Project --</option>
                {projects.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.projectName} {p.projectCode ? `(${p.projectCode})` : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {selectedProject && (
            <div className="flex items-center gap-4 text-xs text-slate-500 bg-slate-50 px-4 py-3 rounded-xl border border-slate-200/80">
              <div>
                <span className="text-slate-400 block">Project Code:</span>
                <span className="font-semibold text-slate-700">{selectedProject.projectCode || "N/A"}</span>
              </div>
              <div className="border-l border-slate-200 pl-4">
                <span className="text-slate-400 block">Location:</span>
                <span className="font-semibold text-slate-700">{selectedProject.location || "On Site"}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {!projectId ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
            <Building2 size={32} />
          </div>
          <h3 className="text-lg font-bold text-slate-800">No Project Selected</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto mt-1">
            Choose a construction project from the dropdown above to view actively assigned labour, today's attendance status, and manage transfers.
          </p>
        </div>
      ) : isFetching ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-500 bg-white rounded-3xl border border-slate-200">
          <Loader2 className="animate-spin text-indigo-600" size={32} />
          <p className="text-sm font-medium">Loading project labour roster...</p>
        </div>
      ) : (
        <>
          {/* KPI Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Labour</span>
              <p className="text-2xl font-black text-slate-900 mt-1">{stats.total}</p>
              <span className="text-[11px] text-slate-400">Deployed at site</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-emerald-200/80 shadow-sm bg-gradient-to-br from-white to-emerald-50/30">
              <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Present Today</span>
              <p className="text-2xl font-black text-emerald-800 mt-1">{stats.present}</p>
              <span className="text-[11px] text-emerald-600">Marked present</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-amber-200/80 shadow-sm bg-gradient-to-br from-white to-amber-50/30">
              <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">Half Day</span>
              <p className="text-2xl font-black text-amber-800 mt-1">{stats.halfDay}</p>
              <span className="text-[11px] text-amber-600">Partial shift</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-rose-200/80 shadow-sm bg-gradient-to-br from-white to-rose-50/30">
              <span className="text-xs font-semibold text-rose-700 uppercase tracking-wider">Absent Today</span>
              <p className="text-2xl font-black text-rose-800 mt-1">{stats.absent}</p>
              <span className="text-[11px] text-rose-600">Direct or auto-absent</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-purple-200/80 shadow-sm bg-gradient-to-br from-white to-purple-50/30">
              <span className="text-xs font-semibold text-purple-700 uppercase tracking-wider">Overtime Today</span>
              <p className="text-2xl font-black text-purple-800 mt-1">{stats.otHours} hrs</p>
              <span className="text-[11px] text-purple-600">Beyond regular shift</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-blue-200/80 shadow-sm bg-gradient-to-br from-white to-blue-50/30">
              <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider">Not Marked</span>
              <p className="text-2xl font-black text-blue-800 mt-1">{stats.notMarked}</p>
              <span className="text-[11px] text-blue-600">Pending submission</span>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search worker by name, phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Categories</option>
                <option value="Labour">Labour</option>
                <option value="Mistri">Mistri</option>
                <option value="Operator">Operator</option>
                <option value="Helper">Helper</option>
              </select>

              <select
                value={labourTypeFilter}
                onChange={(e) => setLabourTypeFilter(e.target.value)}
                className="px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Types</option>
                <option value="Permanent Labour">Permanent Labour</option>
                <option value="Contract Labour">Contract Labour</option>
                <option value="Permanent Mistri">Permanent Mistri</option>
                <option value="Contract Mistri">Contract Mistri</option>
                <option value="Permanent Operator">Permanent Operator</option>
                <option value="Contract Operator">Contract Operator</option>
              </select>

              {(search || categoryFilter || labourTypeFilter) && (
                <button
                  onClick={() => {
                    setSearch("");
                    setCategoryFilter("");
                    setLabourTypeFilter("");
                  }}
                  className="px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl border border-rose-200"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          {/* Main Table */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/70 text-xs font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-4 px-5">Labour Worker</th>
                    <th className="py-4 px-4">Category & Type</th>
                    <th className="py-4 px-4">Assigned Since</th>
                    <th className="py-4 px-4">Status</th>
                    <th className="py-4 px-4">Attendance Today</th>
                    <th className="py-4 px-4">Hours / OT</th>
                    <th className="py-4 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filteredAssignments.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        <Users2 className="mx-auto text-slate-300 mb-2" size={32} />
                        <p className="font-semibold text-slate-600">No active labour found</p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {search || categoryFilter || labourTypeFilter
                            ? "No workers match the selected filters."
                            : "No labour is actively assigned to this project."}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredAssignments.map((row) => {
                      const labour = row.labourId || {};
                      const att = row.todayAttendance;
                      const assignedDateStr = row.assignmentDate
                        ? new Date(row.assignmentDate).toLocaleDateString()
                        : "—";

                      return (
                        <tr key={row._id} className="hover:bg-slate-50/70 transition-colors">
                          {/* Worker */}
                          <td className="py-4 px-5">
                            <div className="flex items-center gap-3">
                              {labour.profilePhoto ? (
                                <img
                                  src={labour.profilePhoto}
                                  alt={labour.name}
                                  className="w-10 h-10 rounded-full object-cover border border-slate-200"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                                  {labour.name ? labour.name.charAt(0).toUpperCase() : "L"}
                                </div>
                              )}
                              <div>
                                <Link
                                  to={`/LabourDetail/${labour._id}`}
                                  className="font-bold text-slate-900 hover:text-indigo-600 transition-colors block"
                                >
                                  {labour.name || "Unnamed"}
                                </Link>
                                <span className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                                  <Phone size={12} className="text-slate-400" />
                                  {labour.phone || "No phone"}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Category & Type */}
                          <td className="py-4 px-4">
                            <div className="flex flex-col gap-1 items-start">
                              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                                {labour.category || "Labour"}
                              </span>
                              <span className="text-[11px] text-slate-500">{labour.labourType || "General"}</span>
                            </div>
                          </td>

                          {/* Assigned Since */}
                          <td className="py-4 px-4 text-xs text-slate-600">
                            <span className="font-semibold block text-slate-800">{assignedDateStr}</span>
                            <span className="text-slate-400">{row.remarks || "Assigned by Admin"}</span>
                          </td>

                          {/* Assignment Status */}
                          <td className="py-4 px-4">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              Active
                            </span>
                          </td>

                          {/* Attendance Today */}
                          <td className="py-4 px-4">
                            {!att ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                                <Clock size={12} className="text-slate-400" />
                                Not Marked
                              </span>
                            ) : att.status === "Present" ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                <CheckCircle2 size={12} className="text-emerald-600" />
                                Present
                              </span>
                            ) : att.status === "Half-Day" ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                                <AlertCircle size={12} className="text-amber-600" />
                                Half Day
                              </span>
                            ) : att.status === "Absent" ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
                                <XCircle size={12} className="text-rose-600" />
                                Absent
                              </span>
                            ) : (
                              <span className="text-xs text-slate-600">{att.status}</span>
                            )}
                          </td>

                          {/* Working Hours & Overtime */}
                          <td className="py-4 px-4 text-xs">
                            {att ? (
                              <div>
                                <span className="font-semibold text-slate-800">
                                  {att.totalWorkingHours || att.regularWorkingHours || 0} hrs
                                </span>
                                {att.overtimeHours > 0 && (
                                  <span className="ml-1.5 px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 font-bold text-[10px]">
                                    +{att.overtimeHours}h OT
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="py-4 px-5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* View Profile */}
                              <Link
                                to={`/LabourDetail/${labour._id}`}
                                title="View Complete Labour Profile & History"
                                className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
                              >
                                <Eye size={16} />
                              </Link>

                              {/* Transfer - Admin / Manager */}
                              {isAdminOrManager && (
                                <button
                                  onClick={() => {
                                    setTransferTarget(row);
                                    setTransferForm({
                                      toProjectId: "",
                                      transferDate: new Date().toISOString().split("T")[0],
                                      reason: "",
                                      remarks: "",
                                    });
                                  }}
                                  title="Transfer Labour to Another Project"
                                  className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                                >
                                  <ArrowRightLeft size={16} />
                                </button>
                              )}

                              {/* Release - Admin / Manager */}
                              {isAdminOrManager && (
                                <button
                                  onClick={() => {
                                    setReleaseTarget(row);
                                    setReleaseForm({
                                      releaseDate: new Date().toISOString().split("T")[0],
                                      releaseReason: "",
                                      remarks: "",
                                    });
                                  }}
                                  title="Release Labour from Project"
                                  className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                                >
                                  <UserMinus size={16} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between text-xs text-slate-500 px-5 py-4 border-t border-slate-100 bg-slate-50/50">
              <span>
                Showing {filteredAssignments.length} of {pagination.total || assignments.length} active workers
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 transition-colors"
                >
                  <ChevronLeft size={14} />
                </button>
                <span className="font-semibold text-slate-700">
                  Page {page} of {totalPages || 1}
                </span>
                <button
                  onClick={() => setPage((p) => (totalPages ? Math.min(totalPages, p + 1) : p + 1))}
                  disabled={totalPages ? page >= totalPages : assignments.length < PAGE_SIZE}
                  className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 transition-colors"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* TRANSFER MODAL */}
      {transferTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <ArrowRightLeft size={20} className="text-blue-600" />
                Transfer Labour Worker
              </h3>
              <button
                onClick={() => setTransferTarget(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleTransferSubmit} className="space-y-4 text-sm">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
                Worker: <strong className="text-slate-800">{transferTarget.labourId?.name}</strong> (
                {transferTarget.labourId?.category} - {transferTarget.labourId?.labourType})
                <span className="block mt-1 text-indigo-700">
                  Current Project: <strong>{selectedProject?.projectName}</strong>
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Destination Project <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={transferForm.toProjectId}
                  onChange={(e) => setTransferForm({ ...transferForm, toProjectId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">Select target project...</option>
                  {projects
                    .filter((p) => p._id !== projectId)
                    .map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.projectName} {p.projectCode ? `(${p.projectCode})` : ""}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Effective Transfer Date</label>
                <input
                  type="date"
                  required
                  value={transferForm.transferDate}
                  onChange={(e) => setTransferForm({ ...transferForm, transferDate: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Transfer Reason <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Masonry requirements at Site B"
                  value={transferForm.reason}
                  onChange={(e) => setTransferForm({ ...transferForm, reason: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Additional Notes</label>
                <textarea
                  rows={2}
                  placeholder="Optional deployment instructions..."
                  value={transferForm.remarks}
                  onChange={(e) => setTransferForm({ ...transferForm, remarks: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setTransferTarget(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isTransferring}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/20 disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isTransferring && <Loader2 size={14} className="animate-spin" />}
                  Confirm Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RELEASE MODAL */}
      {releaseTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <UserMinus size={20} className="text-rose-600" />
                Release Labour Worker
              </h3>
              <button
                onClick={() => setReleaseTarget(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleReleaseSubmit} className="space-y-4 text-sm">
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800">
                <p>
                  Worker <strong>{releaseTarget.labourId?.name}</strong> will be released from{" "}
                  <strong>{selectedProject?.projectName}</strong>.
                </p>
                <p className="mt-1 text-[11px] text-rose-600">
                  Their project assignment status will become <strong>UNASSIGNED</strong>. Historical attendance
                  records remain permanently intact on this project.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Release Date</label>
                <input
                  type="date"
                  required
                  value={releaseForm.releaseDate}
                  onChange={(e) => setReleaseForm({ ...releaseForm, releaseDate: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-rose-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Release Reason <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Project phase completed / contract tenure ended"
                  value={releaseForm.releaseReason}
                  onChange={(e) => setReleaseForm({ ...releaseForm, releaseReason: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-rose-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Remarks</label>
                <textarea
                  rows={2}
                  placeholder="Optional closing remarks..."
                  value={releaseForm.remarks}
                  onChange={(e) => setReleaseForm({ ...releaseForm, remarks: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-rose-500 outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setReleaseTarget(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isReleasing}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-600/20 disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isReleasing && <Loader2 size={14} className="animate-spin" />}
                  Confirm Release
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
