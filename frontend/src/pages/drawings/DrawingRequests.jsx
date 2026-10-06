import React, { useState, useMemo } from "react";
import toast from "react-hot-toast";
import {
  FileText,
  Upload,
  Eye,
  History,
  Plus,
  Clock,
  CheckCircle2,
  FolderKanban,
  Search,
  Filter,
  X,
  ExternalLink,
  Download,
  AlertCircle,
  FileCheck,
  Calendar,
  Layers,
  ShieldCheck,
  User,
  Tag,
  Loader2,
} from "lucide-react";
import {
  useGetDrawingRequestsQuery,
  useCreateDrawingRequestMutation,
  useUploadDrawingVersionMutation,
  useGetDrawingVersionsQuery,
  useGetProjectsQuery,
} from "../../Reduxe/Api";
import CheckRole from "../../helper/CheckRole";
import { getPermissions } from "../../helper/permissions";

const STATUS_CONFIG = {
  REQUESTED: {
    label: "Pending Upload",
    badge: "bg-amber-50 text-amber-700 border-amber-200",
    icon: Clock,
  },
  UNDER_REVIEW: {
    label: "Under Review",
    badge: "bg-blue-50 text-blue-700 border-blue-200",
    icon: Clock,
  },
  UPLOADED: {
    label: "Drawing Uploaded",
    badge: "bg-indigo-50 text-indigo-700 border-indigo-200",
    icon: FileCheck,
  },
  APPROVED: {
    label: "Approved",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: CheckCircle2,
  },
  REJECTED: {
    label: "Rejected",
    badge: "bg-rose-50 text-rose-700 border-rose-200",
    icon: AlertCircle,
  },
  DELIVERED: {
    label: "Delivered to Site",
    badge: "bg-teal-50 text-teal-700 border-teal-200",
    icon: CheckCircle2,
  },
};

const CATEGORIES = [
  "All",
  "Architectural",
  "Structural",
  "MEP",
  "Electrical",
  "Plumbing",
  "HVAC",
  "Civil & Foundation",
  "Interior / Finishing",
  "Landscape",
];

const DrawingRequests = () => {
  // Role & Permissions
  const { role, user } = CheckRole();
  const permissions = useMemo(() => getPermissions(role), [role]);

  const rawRole = String(role || "").toLowerCase();
  const isAdmin = rawRole === "admin";
  const isManager = rawRole === "manager";
  const isSupervisor = rawRole === "supervisor";
  const isDrawing =
    rawRole === "drawing_manager" ||
    rawRole === "drawing" ||
    rawRole === "drawing_supervisor" ||
    rawRole.includes("drawing");

  // Strict RBAC as required:
  // 1. Manager & Supervisor can request drawings
  const canRequest = isManager || isSupervisor;
  // 2. ONLY Drawing Manager can upload drawings
  const canUpload = isDrawing;
  // 3. Admin only views

  // Modals state
  const [showCreate, setShowCreate] = useState(false);
  const [versionsModal, setVersionsModal] = useState(null);
  const [uploadModal, setUploadModal] = useState(null);
  const [previewFile, setPreviewFile] = useState(null);

  // Filters state
  const [search, setSearch] = useState("");
  const [projectFilter, setProjectFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  // API Queries
  const { data, isLoading, refetch } = useGetDrawingRequestsQuery({});
  const { data: projectResp } = useGetProjectsQuery();

  const [createDrawingRequest, { isLoading: creating }] = useCreateDrawingRequestMutation();
  const [uploadVersion, { isLoading: uploading }] = useUploadDrawingVersionMutation();
  const { data: versionsResp, isLoading: loadingVersions } = useGetDrawingVersionsQuery(
    versionsModal?._id,
    { skip: !versionsModal }
  );

  const requests = data?.data || [];
  const projects = projectResp?.data || projectResp || [];

  // Form state for creating request
  const [form, setForm] = useState({
    projectId: "",
    drawingCategory: "Structural",
    drawingTitle: "",
    description: "",
    requiredDate: "",
    priority: "Medium",
    remarks: "",
  });

  // Handle Create Request (Manager & Supervisor)
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.projectId || !form.drawingCategory || !form.drawingTitle) {
      return toast.error("Please fill all required fields (Project, Category, Title)");
    }
    try {
      await createDrawingRequest(form).unwrap();
      toast.success("Drawing request submitted successfully!");
      setShowCreate(false);
      setForm({
        projectId: "",
        drawingCategory: "Structural",
        drawingTitle: "",
        description: "",
        requiredDate: "",
        priority: "Medium",
        remarks: "",
      });
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || "Failed to create drawing request");
    }
  };

  // Handle Upload Version (Drawing Role Only)
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadModal) return;
    const fd = new FormData(e.target);
    try {
      await uploadVersion({ id: uploadModal._id, formData: fd }).unwrap();
      toast.success("Drawing uploaded and published successfully!");
      setUploadModal(null);
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || "Error uploading drawing");
    }
  };

  // Helper to open drawing file
  const handleViewDrawing = (row) => {
    if (row.fileUrl) {
      window.open(row.fileUrl, "_blank", "noopener,noreferrer");
    } else {
      // If direct fileUrl not in row, open versions modal so they can see uploaded versions
      setVersionsModal(row);
    }
  };

  // Filtered requests list
  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      const matchSearch =
        !search ||
        r.drawingTitle?.toLowerCase().includes(search.toLowerCase()) ||
        r.requestNumber?.toLowerCase().includes(search.toLowerCase()) ||
        r.projectId?.projectName?.toLowerCase().includes(search.toLowerCase());

      const matchProject = !projectFilter || String(r.projectId?._id || r.projectId) === String(projectFilter);

      const matchCat =
        categoryFilter === "All" ||
        r.drawingCategory?.toLowerCase() === categoryFilter.toLowerCase();

      const matchStatus =
        statusFilter === "All" ||
        r.status?.toUpperCase() === statusFilter.toUpperCase();

      return matchSearch && matchProject && matchCat && matchStatus;
    });
  }, [requests, search, projectFilter, categoryFilter, statusFilter]);

  // Quick stats
  const totalCount = requests.length;
  const pendingCount = requests.filter(
    (r) => !r.latestVersionNumber && (r.status === "REQUESTED" || r.status === "UNDER_REVIEW")
  ).length;
  const uploadedCount = requests.filter(
    (r) => r.latestVersionNumber > 0 || r.status === "UPLOADED" || r.status === "APPROVED" || r.status === "DELIVERED"
  ).length;
  const urgentCount = requests.filter((r) => r.priority === "Urgent" || r.priority === "High").length;

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 min-h-screen pb-24">
      {/* 1. Header & Role Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-gray-100 shadow-sm shadow-gray-200/60">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-600 flex items-center justify-center text-white shadow-md shadow-indigo-900/20 shrink-0">
            <FileText size={22} />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                Drawing & Site Documents
              </h1>
              {isAdmin && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1">
                  <ShieldCheck size={12} /> Admin Monitor (View Only)
                </span>
              )}
              {isManager && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                  <User size={12} /> Project Manager (Request Drawings)
                </span>
              )}
              {isSupervisor && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200 flex items-center gap-1">
                  <User size={12} /> Site Supervisor (Request Drawings)
                </span>
              )}
              {isDrawing && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1">
                  <Upload size={12} /> Drawing Department (Upload & Revisions)
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              {isAdmin
                ? "Central monitor for all project drawing requests, revisions, and site document logs."
                : canRequest
                ? "Request architectural & structural drawings for your sites and view uploaded files."
                : "Review drawing requests from site supervisors/managers and upload official files."}
            </p>
          </div>
        </div>

        {/* Action Button: ONLY for Manager & Supervisor */}
        {canRequest && (
          <button
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-indigo-900/20 transition-all shrink-0"
          >
            <Plus size={16} /> New Drawing Request
          </button>
        )}
      </div>

      {/* 2. KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white border border-gray-100 shadow-sm shadow-gray-200/50">
          <span className="text-xs font-medium text-gray-500 block">Total Requests</span>
          <span className="text-2xl font-bold text-gray-800">{totalCount}</span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-gray-100 shadow-sm shadow-gray-200/50">
          <span className="text-xs font-medium text-amber-600 flex items-center gap-1">
            <Clock size={13} /> Pending Upload
          </span>
          <span className="text-2xl font-bold text-amber-700">{pendingCount}</span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-gray-100 shadow-sm shadow-gray-200/50">
          <span className="text-xs font-medium text-emerald-600 flex items-center gap-1">
            <CheckCircle2 size={13} /> Uploaded & Ready
          </span>
          <span className="text-2xl font-bold text-emerald-700">{uploadedCount}</span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-gray-100 shadow-sm shadow-gray-200/50">
          <span className="text-xs font-medium text-rose-600 flex items-center gap-1">
            <AlertCircle size={13} /> Urgent / High Priority
          </span>
          <span className="text-2xl font-bold text-rose-700">{urgentCount}</span>
        </div>
      </div>

      {/* 3. Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm shadow-gray-200/60 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title, number, project…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            />
          </div>

          {/* Project filter */}
          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
          >
            <option value="">All Projects</option>
            {projects.map((p) => (
              <option key={p._id} value={p._id}>
                {p.projectName || p.name}
              </option>
            ))}
          </select>

          {/* Category filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat === "All" ? "All Categories" : cat}
              </option>
            ))}
          </select>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
          >
            <option value="All">All Statuses</option>
            <option value="REQUESTED">Pending Upload</option>
            <option value="UPLOADED">Uploaded</option>
            <option value="APPROVED">Approved</option>
            <option value="DELIVERED">Delivered</option>
          </select>
        </div>

        {(search || projectFilter || categoryFilter !== "All" || statusFilter !== "All") && (
          <button
            onClick={() => {
              setSearch("");
              setProjectFilter("");
              setCategoryFilter("All");
              setStatusFilter("All");
            }}
            className="text-xs font-semibold text-rose-600 hover:text-rose-700 px-2 py-1 rounded-lg hover:bg-rose-50"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* 4. Requests Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm shadow-gray-200/60 overflow-hidden">
        {isLoading ? (
          <div className="py-20 text-center text-gray-400">
            <Loader2 size={24} className="animate-spin inline-block mr-2 text-indigo-600" />
            Loading drawing requests…
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="py-16 text-center text-gray-400 space-y-2">
            <FileText size={36} className="mx-auto text-gray-300" />
            <p className="text-sm font-medium text-gray-600">No drawing requests found</p>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              {canRequest
                ? "Click '+ New Drawing Request' above to submit an architectural or structural drawing requirement."
                : "Drawing requests created by managers or supervisors will appear here."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50/75 border-b border-gray-100 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Request # & Date</th>
                  <th className="py-3 px-4">Project</th>
                  <th className="py-3 px-4">Drawing Title & Scope</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Requested By</th>
                  <th className="py-3 px-4 text-center">Version</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredRequests.map((row) => {
                  const isUploaded =
                    Number(row.latestVersionNumber || 0) > 0 ||
                    row.status === "UPLOADED" ||
                    row.status === "APPROVED" ||
                    row.status === "DELIVERED" ||
                    Boolean(row.fileUrl);

                  const statusCfg = STATUS_CONFIG[row.status] || {
                    label: row.status,
                    badge: "bg-gray-100 text-gray-700",
                    icon: Tag,
                  };
                  const StatusIcon = statusCfg.icon;

                  return (
                    <tr key={row._id} className="hover:bg-gray-50/70 transition-colors">
                      {/* Request # & Date */}
                      <td className="py-3.5 px-4 font-medium text-gray-800">
                        <span className="font-semibold text-slate-900 block font-mono text-xs">
                          {row.requestNumber || row._id.slice(-8).toUpperCase()}
                        </span>
                        <span className="text-[11px] text-gray-400 block">
                          {row.createdAt ? new Date(row.createdAt).toLocaleDateString() : "-"}
                        </span>
                      </td>

                      {/* Project */}
                      <td className="py-3.5 px-4">
                        <span className="font-medium text-slate-800 block">
                          {row.projectId?.projectName || "Direct Site"}
                        </span>
                        {row.priority && (
                          <span
                            className={`inline-block mt-0.5 px-1.5 py-0.2 rounded text-[10px] font-semibold uppercase tracking-wider ${
                              row.priority === "Urgent"
                                ? "bg-rose-100 text-rose-700"
                                : row.priority === "High"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {row.priority}
                          </span>
                        )}
                      </td>

                      {/* Title & Description */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <span className="font-semibold text-slate-900 block">{row.drawingTitle}</span>
                        {row.description && (
                          <p className="text-xs text-gray-500 line-clamp-1 truncate">{row.description}</p>
                        )}
                        {row.requiredDate && (
                          <span className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                            <Calendar size={11} /> Due: {new Date(row.requiredDate).toLocaleDateString()}
                          </span>
                        )}
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-lg text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                          {row.drawingCategory || "General"}
                        </span>
                      </td>

                      {/* Requested By */}
                      <td className="py-3.5 px-4">
                        <span className="font-medium text-slate-800 block text-xs">
                          {row.requestedBy?.name || "Team"}
                        </span>
                        <span className="text-[11px] text-gray-400 capitalize">
                          {row.requestedBy?.role || "Site"}
                        </span>
                      </td>

                      {/* Version badge */}
                      <td className="py-3.5 px-4 text-center">
                        {isUploaded ? (
                          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                            v{row.latestVersionNumber || 1}
                          </span>
                        ) : (
                          <span className="text-[11px] text-gray-400 italic">None yet</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${statusCfg.badge}`}
                        >
                          <StatusIcon size={12} />
                          {statusCfg.label}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          {/* Case 1: Drawing IS uploaded -> ALL ROLES see "View Drawing" & "Versions" */}
                          {isUploaded ? (
                            <>
                              <button
                                onClick={() => handleViewDrawing(row)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
                                title="Open & View Drawing"
                              >
                                <Eye size={13} /> View Drawing
                              </button>

                              <button
                                onClick={() => setVersionsModal(row)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold transition-all border border-gray-200"
                                title="View Version History"
                              >
                                <History size={13} /> Versions (v{row.latestVersionNumber || 1})
                              </button>

                              {/* Drawing Manager can also upload a newer revision (v2, v3) */}
                              {canUpload && (
                                <button
                                  onClick={() => setUploadModal(row)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-semibold transition-all"
                                  title="Upload New Revision"
                                >
                                  <Upload size={13} /> + Revision
                                </button>
                              )}
                            </>
                          ) : (
                            /* Case 2: Drawing NOT uploaded yet */
                            <>
                              {/* ONLY Drawing Role can upload */}
                              {canUpload ? (
                                <button
                                  onClick={() => setUploadModal(row)}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
                                >
                                  <Upload size={13} /> Upload Drawing
                                </button>
                              ) : (
                                /* Manager, Supervisor, and Admin see waiting state */
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                                  <Clock size={11} /> Awaiting Upload (Drawing Dept)
                                </span>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* =========================================================================
          5. MODAL: CREATE DRAWING REQUEST (Manager & Supervisor Only)
          ========================================================================= */}
      {showCreate && canRequest && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-6 sm:p-7 border border-gray-100 relative">
            <button
              onClick={() => setShowCreate(false)}
              className="absolute right-5 top-5 p-1 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <FileText size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">New Drawing Request</h3>
                <p className="text-xs text-gray-500">
                  Request architectural or structural drawings from the drawing department.
                </p>
              </div>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Project *
                </label>
                <select
                  value={form.projectId}
                  onChange={(e) => setForm({ ...form, projectId: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none px-3.5 py-2.5 text-sm"
                  required
                >
                  <option value="">-- Select Project --</option>
                  {projects.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.projectName || p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Drawing Category *
                  </label>
                  <select
                    value={form.drawingCategory}
                    onChange={(e) => setForm({ ...form, drawingCategory: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none px-3 py-2 text-sm"
                    required
                  >
                    {CATEGORIES.filter((c) => c !== "All").map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none px-3 py-2 text-sm"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Drawing Title / Scope *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ground Floor Structural Slab & Column Layout"
                  value={form.drawingTitle}
                  onChange={(e) => setForm({ ...form, drawingTitle: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none px-3.5 py-2.5 text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Required Date
                </label>
                <input
                  type="date"
                  value={form.requiredDate}
                  onChange={(e) => setForm({ ...form, requiredDate: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Description / Specific Requirements
                </label>
                <textarea
                  rows={3}
                  placeholder="Include specific grid lines, levels, or architectural notes..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none px-3 py-2 text-sm"
                />
              </div>

              <div className="flex gap-2 justify-end pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-indigo-900/20 disabled:opacity-60 transition-all flex items-center gap-1.5"
                >
                  {creating && <Loader2 size={15} className="animate-spin" />}
                  {creating ? "Submitting…" : "Submit Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          6. MODAL: UPLOAD DRAWING (Drawing Role Only)
          ========================================================================= */}
      {uploadModal && canUpload && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 sm:p-7 border border-gray-100 relative">
            <button
              onClick={() => setUploadModal(null)}
              className="absolute right-5 top-5 p-1 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                <Upload size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {uploadModal.latestVersionNumber > 0 ? "Upload New Revision" : "Upload Official Drawing"}
                </h3>
                <p className="text-xs text-gray-500 font-medium truncate max-w-xs">
                  {uploadModal.drawingTitle} ({uploadModal.drawingCategory})
                </p>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 mb-4 text-xs text-slate-700 space-y-1">
              <p>
                <span className="font-semibold text-slate-900">Project:</span>{" "}
                {uploadModal.projectId?.projectName || "-"}
              </p>
              <p>
                <span className="font-semibold text-slate-900">Requested By:</span>{" "}
                {uploadModal.requestedBy?.name || "Team"}
              </p>
              <p>
                <span className="font-semibold text-slate-900">Current Version:</span>{" "}
                v{uploadModal.latestVersionNumber || 0}
              </p>
            </div>

            <form onSubmit={handleUpload} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Drawing File (PDF, DWG, DXF, PNG, JPG) *
                </label>
                <input
                  name="file"
                  type="file"
                  accept="image/*,.pdf,.dwg,.dxf"
                  className="w-full text-sm file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 border border-gray-200 rounded-xl p-1 bg-gray-50 cursor-pointer"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Revision #
                  </label>
                  <input
                    name="revisionNumber"
                    type="text"
                    placeholder={`e.g. Rev-${(uploadModal.latestVersionNumber || 0) + 1}`}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Drawing Number
                  </label>
                  <input
                    name="drawingNumber"
                    type="text"
                    placeholder="e.g. STR-001"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Remarks / Notes from Drawing Team
                </label>
                <input
                  name="remarks"
                  type="text"
                  placeholder="e.g. Issued for site execution as per consultant approval"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none px-3 py-2 text-sm"
                />
              </div>

              <div className="flex gap-2 justify-end pt-3">
                <button
                  type="button"
                  onClick={() => setUploadModal(null)}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-indigo-900/20 disabled:opacity-60 transition-all flex items-center gap-1.5"
                >
                  {uploading && <Loader2 size={15} className="animate-spin" />}
                  {uploading ? "Uploading…" : "Upload & Publish"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          7. MODAL: VERSIONS HISTORY & VIEWER (All Roles)
          ========================================================================= */}
      {versionsModal && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200"
          onClick={() => setVersionsModal(null)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl p-6 sm:p-7 border border-gray-100 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setVersionsModal(null)}
              className="absolute right-5 top-5 p-1 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                <Layers size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Version History — {versionsModal.drawingTitle}
                </h3>
                <p className="text-xs text-gray-500">
                  Category: {versionsModal.drawingCategory} &bull; Project:{" "}
                  {versionsModal.projectId?.projectName || "-"}
                </p>
              </div>
            </div>

            <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
              {loadingVersions ? (
                <div className="py-12 text-center text-gray-400">
                  <Loader2 size={20} className="animate-spin inline mr-2 text-indigo-600" />
                  Loading version files…
                </div>
              ) : (versionsResp?.data || []).length === 0 ? (
                <div className="py-12 text-center text-gray-400">
                  <FileText size={32} className="mx-auto text-gray-300 mb-2" />
                  <p className="text-sm font-medium text-gray-600">No versions uploaded yet</p>
                  <p className="text-xs text-gray-400">
                    The drawing department has not yet uploaded files for this request.
                  </p>
                </div>
              ) : (
                (versionsResp?.data || []).map((v) => (
                  <div
                    key={v._id}
                    className="p-4 rounded-2xl border border-gray-200 bg-gray-50/50 hover:bg-white hover:border-indigo-200 transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800">
                          v{v.versionNumber}
                        </span>
                        {v.revisionNumber && (
                          <span className="text-xs font-semibold text-gray-700">
                            {v.revisionNumber}
                          </span>
                        )}
                        {v.drawingNumber && (
                          <span className="text-xs text-gray-500 font-mono">
                            [{v.drawingNumber}]
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-semibold text-gray-900 mt-1 truncate max-w-md">
                        {v.fileName || "Drawing Document"}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Uploaded by: <span className="font-medium text-gray-700">{v.uploadedBy?.name || "Drawing Specialist"}</span> &bull;{" "}
                        {v.createdAt ? new Date(v.createdAt).toLocaleString() : "-"}
                      </p>
                      {v.remarks && (
                        <p className="text-xs text-gray-600 mt-1 italic">
                          "{v.remarks}"
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <a
                        href={v.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
                      >
                        <Eye size={13} /> View File
                      </a>
                      <a
                        href={v.fileUrl}
                        download={v.fileName || "drawing"}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold border border-gray-200 transition-all"
                      >
                        <Download size={13} /> Download
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setVersionsModal(null)}
                className="px-5 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DrawingRequests;
