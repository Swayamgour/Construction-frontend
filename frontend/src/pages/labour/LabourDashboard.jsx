import React, { useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  HardHat,
  Wrench,
  Phone,
  Plus,
  Users,
  AlertCircle,
  Search,
  Filter,
  Eye,
  Edit,
  ArrowRightLeft,
  UserPlus,
  UserMinus,
  CheckCircle,
  XCircle,
  Building2,
  Calendar,
  Layers,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  FileText,
  UserX,
  Clock,
  LayoutGrid,
  List,
  ShieldCheck,
  X,
  Loader2,
  Power
} from "lucide-react";
import {
  useGetLabourQuery,
  useGetProjectsQuery,
  useUpdateLabourMutation,
  useAssignLabourToProjectMutation,
  useTransferLabourMutation,
  useReleaseLabourMutation
} from "../../Reduxe/Api";
import { getInitials, getAvatarGradient } from "../../helper/avatar";
import { CheckRole } from "../../helper/CheckRole";
import toast from "react-hot-toast";

const STAT_STYLES = {
  "Permanent Labour": { chip: "from-blue-500 to-indigo-600", text: "text-blue-700", bg: "bg-blue-50" },
  "Permanent Mistri": { chip: "from-indigo-500 to-violet-600", text: "text-indigo-700", bg: "bg-indigo-50" },
  "Permanent Operator": { chip: "from-purple-500 to-pink-600", text: "text-purple-700", bg: "bg-purple-50" },
  "Contract Labour": { chip: "from-emerald-500 to-teal-600", text: "text-emerald-700", bg: "bg-emerald-50" },
  "Contract Mistri": { chip: "from-orange-500 to-amber-600", text: "text-orange-700", bg: "bg-orange-50" },
  "Contract Operator": { chip: "from-rose-500 to-red-600", text: "text-rose-700", bg: "bg-rose-50" },
};

const PAGE_SIZE_OPTIONS = [10, 20, 50];

export default function LabourDashboard() {
  const navigate = useNavigate();
  const { role } = CheckRole();
  const isSuperOrAdmin = ["admin", "manager"].includes(role?.toLowerCase());

  // Data fetching
  const { data: labourData, isLoading, isError, refetch } = useGetLabourQuery();
  const labours = useMemo(() => labourData?.data || labourData || [], [labourData]);

  const { data: projectResp } = useGetProjectsQuery();
  const projects = useMemo(() => projectResp?.data || projectResp || [], [projectResp]);

  // Mutations
  const [updateLabour, { isLoading: isUpdating }] = useUpdateLabourMutation();
  const [assignLabourToProject, { isLoading: isAssigning }] = useAssignLabourToProjectMutation();
  const [transferLabour, { isLoading: isTransferring }] = useTransferLabourMutation();
  const [releaseLabour, { isLoading: isReleasing }] = useReleaseLabourMutation();

  // View state
  const [viewMode, setViewMode] = useState("table"); // 'table' | 'cards'
  const [activeTypeTab, setActiveTypeTab] = useState("All");

  // Filters state
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [assignmentFilter, setAssignmentFilter] = useState("All");
  const [projectFilter, setProjectFilter] = useState("All");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Action Modals state
  const [assignModalLabour, setAssignModalLabour] = useState(null);
  const [assignProjectId, setAssignProjectId] = useState("");
  const [assignDate, setAssignDate] = useState(new Date().toISOString().split("T")[0]);
  const [assignNotes, setAssignNotes] = useState("");

  const [transferModalLabour, setTransferModalLabour] = useState(null);
  const [transferToProjectId, setTransferToProjectId] = useState("");
  const [transferDate, setTransferDate] = useState(new Date().toISOString().split("T")[0]);
  const [transferReason, setTransferReason] = useState("");
  const [transferNotes, setTransferNotes] = useState("");

  const [releaseModalLabour, setReleaseModalLabour] = useState(null);
  const [releaseDate, setReleaseDate] = useState(new Date().toISOString().split("T")[0]);
  const [releaseReason, setReleaseReason] = useState("");
  const [releaseNotes, setReleaseNotes] = useState("");

  // KPIs
  const stats = useMemo(() => {
    const total = labours.length;
    const active = labours.filter((l) => l.status === "Active").length;
    const inactive = labours.filter((l) => l.status === "Inactive").length;
    const assigned = labours.filter((l) => l.projectAssigned || l.assignmentStatus === "Assigned").length;
    const unassigned = total - assigned;
    return { total, active, inactive, assigned, unassigned };
  }, [labours]);

  // Filtered List
  const filteredLabours = useMemo(() => {
    return labours.filter((l) => {
      // Search
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const nameMatch = l.name?.toLowerCase().includes(q);
        const phoneMatch = l.phone?.includes(q);
        const fatherMatch = l.fatherName?.toLowerCase().includes(q);
        if (!nameMatch && !phoneMatch && !fatherMatch) return false;
      }

      // Category
      if (categoryFilter !== "All" && l.category !== categoryFilter) return false;

      // Type Filter
      if (typeFilter !== "All" && l.labourType !== typeFilter) return false;

      // Tab in card mode
      if (viewMode === "cards" && activeTypeTab !== "All" && l.labourType !== activeTypeTab) return false;

      // Status Filter
      if (statusFilter !== "All" && l.status !== statusFilter) return false;

      // Assignment Filter
      const isAssigned = !!(l.projectAssigned || l.assignmentStatus === "Assigned");
      if (assignmentFilter === "Assigned" && !isAssigned) return false;
      if (assignmentFilter === "Unassigned" && isAssigned) return false;

      // Project Filter
      if (projectFilter !== "All") {
        const pId = l.projectAssigned?._id || l.projectAssigned;
        if (pId !== projectFilter) return false;
      }

      return true;
    });
  }, [labours, searchTerm, categoryFilter, typeFilter, activeTypeTab, viewMode, statusFilter, assignmentFilter, projectFilter]);

  // Paginated List
  const totalPages = Math.ceil(filteredLabours.length / pageSize) || 1;
  const paginatedLabours = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredLabours.slice(start, start + pageSize);
  }, [filteredLabours, currentPage, pageSize]);

  // Handlers
  const handleToggleStatus = async (labour) => {
    const newStatus = labour.status === "Active" ? "Inactive" : "Active";
    const confirmMsg = `Are you sure you want to mark ${labour.name} as ${newStatus}?`;
    if (!window.confirm(confirmMsg)) return;

    try {
      await updateLabour({ id: labour._id, status: newStatus }).unwrap();
      toast.success(`${labour.name} is now ${newStatus}`);
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || "Failed to update status");
    }
  };

  const handleOpenAssignModal = (labour) => {
    setAssignModalLabour(labour);
    setAssignProjectId(projects[0]?._id || "");
    setAssignDate(new Date().toISOString().split("T")[0]);
    setAssignNotes("");
  };

  const handleOpenTransferModal = (labour) => {
    setTransferModalLabour(labour);
    // Default to first project that isn't their current project
    const currentPId = labour.projectAssigned?._id || labour.projectAssigned;
    const targetP = projects.find((p) => p._id !== currentPId);
    setTransferToProjectId(targetP?._id || "");
    setTransferDate(new Date().toISOString().split("T")[0]);
    setTransferReason("");
    setTransferNotes("");
  };

  const handleOpenReleaseModal = (labour) => {
    setReleaseModalLabour(labour);
    setReleaseDate(new Date().toISOString().split("T")[0]);
    setReleaseReason("");
    setReleaseNotes("");
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!assignProjectId) {
      toast.error("Please select a target project");
      return;
    }
    try {
      await assignLabourToProject({
        id: assignModalLabour._id,
        projectId: assignProjectId,
        assignmentDate: assignDate,
        notes: assignNotes
      }).unwrap();
      toast.success(`${assignModalLabour.name} successfully assigned to project`);
      setAssignModalLabour(null);
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || "Failed to assign labour");
    }
  };

  const handleTransferSubmit = async (e) => {
    e.preventDefault();
    if (!transferToProjectId) {
      toast.error("Please select a new target project");
      return;
    }
    try {
      await transferLabour({
        labourId: transferModalLabour._id,
        newProjectId: transferToProjectId,
        transferDate,
        transferReason: transferReason || "Operational transfer",
        notes: transferNotes
      }).unwrap();
      toast.success(`${transferModalLabour.name} transferred successfully`);
      setTransferModalLabour(null);
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || "Failed to transfer labour");
    }
  };

  const handleReleaseSubmit = async (e) => {
    e.preventDefault();
    try {
      await releaseLabour({
        labourId: releaseModalLabour._id,
        releaseDate,
        releaseReason: releaseReason || "Project work completed",
        notes: releaseNotes
      }).unwrap();
      toast.success(`${releaseModalLabour.name} released back to Unassigned pool`);
      setReleaseModalLabour(null);
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || "Failed to release labour");
    }
  };

  if (isLoading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center min-h-[60vh] gap-3 text-slate-500">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
        <p className="font-medium text-slate-600">Loading Workforce Master...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-12 flex flex-col items-center justify-center min-h-[60vh] gap-3 text-rose-600">
        <AlertCircle size={36} />
        <p className="font-semibold">Failed to load labour directory</p>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-rose-50 text-rose-700 rounded-xl hover:bg-rose-100 font-medium text-sm transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Banner & Quick Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100">
              Workforce Intelligence
            </span>
            <span className="text-xs text-slate-400">• {labours.length} Total Workers</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Labour & Worker Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Centralized Labour Directory with verified project assignment lifecycle, transfers, and status tracking.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {isSuperOrAdmin && (
            <button
              onClick={() => navigate("/LabourForm")}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-xl font-semibold shadow-md shadow-indigo-600/20 text-sm transition active:scale-95"
            >
              <Plus size={16} /> Add Worker
            </button>
          )}
          <Link
            to="/labour/unassigned"
            className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-xl font-medium border border-amber-200/80 text-sm transition"
          >
            <UserX size={16} /> Unassigned ({stats.unassigned})
          </Link>
          <Link
            to="/labour/project-active"
            className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 rounded-xl font-medium border border-emerald-200/80 text-sm transition"
          >
            <Building2 size={16} /> Project Active ({stats.assigned})
          </Link>
          <Link
            to="/labour/reports"
            className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-900 rounded-xl font-medium border border-blue-200/80 text-sm transition"
          >
            <FileText size={16} /> Reports
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div
          onClick={() => {
            setStatusFilter("All");
            setAssignmentFilter("All");
          }}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-300 transition cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total</span>
            <Users size={16} className="text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
          <p className="text-xs text-slate-400 mt-1">Master registered</p>
        </div>

        <div
          onClick={() => {
            setStatusFilter("Active");
            setAssignmentFilter("All");
          }}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:border-emerald-300 transition cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Active</span>
            <CheckCircle size={16} className="text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-600">{stats.active}</div>
          <p className="text-xs text-slate-400 mt-1">Eligible for work</p>
        </div>

        <div
          onClick={() => {
            setAssignmentFilter("Assigned");
            setStatusFilter("All");
          }}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-300 transition cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Assigned</span>
            <Building2 size={16} className="text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-blue-600">{stats.assigned}</div>
          <p className="text-xs text-slate-400 mt-1">On active sites</p>
        </div>

        <div
          onClick={() => {
            setAssignmentFilter("Unassigned");
            setStatusFilter("Active");
          }}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:border-amber-300 transition cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Unassigned</span>
            <UserX size={16} className="text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-600">{stats.unassigned}</div>
          <p className="text-xs text-slate-400 mt-1">Ready for deployment</p>
        </div>

        <div
          onClick={() => {
            setStatusFilter("Inactive");
            setAssignmentFilter("All");
          }}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:border-rose-300 transition cursor-pointer col-span-2 sm:col-span-1"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Inactive</span>
            <XCircle size={16} className="text-rose-600" />
          </div>
          <div className="text-2xl font-bold text-rose-600">{stats.inactive}</div>
          <p className="text-xs text-slate-400 mt-1">Deactivated / Left</p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[240px]">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search labour name, phone, father's name..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 focus:bg-white transition"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2 self-end lg:self-auto">
            <span className="text-xs text-slate-500 font-medium hidden sm:inline">View:</span>
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setViewMode("table")}
                className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                  viewMode === "table" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <List size={15} /> Table
              </button>
              <button
                onClick={() => setViewMode("cards")}
                className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                  viewMode === "cards" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <LayoutGrid size={15} /> Cards
              </button>
            </div>
          </div>
        </div>

        {/* Dropdown Filters Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 pt-2 border-t border-slate-100">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
            >
              <option value="All">All Categories</option>
              <option value="Labour">Labour</option>
              <option value="Mistri">Mistri</option>
              <option value="Operator">Operator</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Labour Type</label>
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
            >
              <option value="All">All Types</option>
              <option value="Permanent Labour">Permanent Labour</option>
              <option value="Permanent Mistri">Permanent Mistri</option>
              <option value="Permanent Operator">Permanent Operator</option>
              <option value="Contract Labour">Contract Labour</option>
              <option value="Contract Mistri">Contract Mistri</option>
              <option value="Contract Operator">Contract Operator</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Assignment</label>
            <select
              value={assignmentFilter}
              onChange={(e) => {
                setAssignmentFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
            >
              <option value="All">All Assignment</option>
              <option value="Assigned">Assigned on Site</option>
              <option value="Unassigned">Unassigned Pool</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Project Site</label>
            <select
              value={projectFilter}
              onChange={(e) => {
                setProjectFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
            >
              <option value="All">All Sites</option>
              {projects.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.projectName || p.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Results summary & reset */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
          <span>
            Showing <strong className="text-slate-800">{filteredLabours.length}</strong> matching workers
          </span>
          {(searchTerm || categoryFilter !== "All" || typeFilter !== "All" || statusFilter !== "All" || assignmentFilter !== "All" || projectFilter !== "All") && (
            <button
              onClick={() => {
                setSearchTerm("");
                setCategoryFilter("All");
                setTypeFilter("All");
                setStatusFilter("All");
                setAssignmentFilter("All");
                setProjectFilter("All");
                setCurrentPage(1);
              }}
              className="text-indigo-600 hover:text-indigo-800 font-semibold"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      {viewMode === "table" ? (
        /* TABLE VIEW */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead className="bg-slate-50/80 text-slate-700 text-xs font-semibold border-b border-slate-200 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Labour Name</th>
                  <th className="py-3.5 px-4">Category & Type</th>
                  <th className="py-3.5 px-4">Current Site</th>
                  <th className="py-3.5 px-4">Wage / Rate</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedLabours.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      <Users className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                      <p className="font-semibold text-slate-600">No labour matches current filters</p>
                      <p className="text-xs text-slate-400 mt-1">Try resetting your search query or filters</p>
                    </td>
                  </tr>
                ) : (
                  paginatedLabours.map((labour) => {
                    const isAssigned = !!(labour.projectAssigned || labour.assignmentStatus === "Assigned");
                    const assignedProjectName =
                      labour.projectAssigned?.projectName ||
                      projects.find((p) => p._id === (labour.projectAssigned?._id || labour.projectAssigned))?.projectName ||
                      (isAssigned ? "Assigned" : "Unassigned");

                    return (
                      <tr key={labour._id} className="hover:bg-slate-50/80 transition group">
                        {/* Labour Profile */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-sm bg-gradient-to-br ${getAvatarGradient(
                                labour.name
                              )}`}
                            >
                              {getInitials(labour.name)}
                            </div>
                            <div className="min-w-0">
                              <Link
                                to={`/LabourDetail/${labour._id}`}
                                className="font-semibold text-slate-900 hover:text-indigo-600 transition flex items-center gap-1.5"
                              >
                                {labour.name}
                              </Link>
                              <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                                {labour.fatherName && <span>S/O {labour.fatherName}</span>}
                                {labour.phone && (
                                  <span className="flex items-center gap-1 text-slate-500">
                                    <Phone size={11} /> {labour.phone}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Category & Type */}
                        <td className="py-3.5 px-4">
                          <div className="flex flex-col gap-1">
                            <span className="font-medium text-slate-800">{labour.category || "Labour"}</span>
                            <span className="text-xs text-slate-500">{labour.labourType || "Permanent Labour"}</span>
                          </div>
                        </td>

                        {/* Current Site */}
                        <td className="py-3.5 px-4">
                          {isAssigned ? (
                            <div className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-emerald-500" />
                              <span className="font-medium text-slate-800 text-xs truncate max-w-[180px]">
                                {assignedProjectName}
                              </span>
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                              Unassigned Pool
                            </span>
                          )}
                        </td>

                        {/* Wage / Rate */}
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-900">
                            ₹{labour.dailyWage || labour.monthlySalary || 0}
                          </div>
                          <span className="text-[11px] text-slate-400">
                            {labour.wageType === "Daily" ? "/ day" : "/ month"}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              labour.status === "Active"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-rose-50 text-rose-700 border border-rose-200"
                            }`}
                          >
                            {labour.status}
                          </span>
                        </td>

                        {/* Action Buttons */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* View Details */}
                            <Link
                              to={`/LabourDetail/${labour._id}`}
                              title="View Full Profile"
                              className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                            >
                              <Eye size={16} />
                            </Link>

                            {/* Edit */}
                            {isSuperOrAdmin && (
                              <button
                                onClick={() => navigate(`/LabourForm?id=${labour._id}`)}
                                title="Edit Labour"
                                className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                              >
                                <Edit size={16} />
                              </button>
                            )}

                            {/* Assign (if unassigned) */}
                            {isSuperOrAdmin && !isAssigned && labour.status === "Active" && (
                              <button
                                onClick={() => handleOpenAssignModal(labour)}
                                title="Assign to Site"
                                className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-semibold transition"
                              >
                                <UserPlus size={13} /> Assign
                              </button>
                            )}

                            {/* Transfer (if assigned) */}
                            {isSuperOrAdmin && isAssigned && (
                              <button
                                onClick={() => handleOpenTransferModal(labour)}
                                title="Transfer to Another Site"
                                className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"
                              >
                                <ArrowRightLeft size={16} />
                              </button>
                            )}

                            {/* Release (if assigned) */}
                            {isSuperOrAdmin && isAssigned && (
                              <button
                                onClick={() => handleOpenReleaseModal(labour)}
                                title="Release back to Unassigned"
                                className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                              >
                                <UserMinus size={16} />
                              </button>
                            )}

                            {/* Deactivate / Activate */}
                            {isSuperOrAdmin && (
                              <button
                                onClick={() => handleToggleStatus(labour)}
                                title={labour.status === "Active" ? "Deactivate" : "Activate"}
                                className={`p-1.5 rounded-lg transition ${
                                  labour.status === "Active"
                                    ? "text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                                    : "text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"
                                }`}
                              >
                                <Power size={15} />
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

          {/* Table Pagination Footer */}
          <div className="p-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600 bg-slate-50/50">
            <div className="flex items-center gap-2">
              <span>Show</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-indigo-500"
              >
                {PAGE_SIZE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <span>per page</span>
              <span className="text-slate-400 ml-2">
                (Page {currentPage} of {totalPages})
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft size={14} /> Previous
              </button>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* CARDS VIEW */
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {["All", "Permanent Labour", "Permanent Mistri", "Contract Labour", "Contract Mistri"].map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTypeTab(tab);
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
                  activeTypeTab === tab
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedLabours.map((labour) => {
              const isAssigned = !!(labour.projectAssigned || labour.assignmentStatus === "Assigned");
              return (
                <div
                  key={labour._id}
                  onClick={() => navigate(`/LabourDetail/${labour._id}`)}
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-11 h-11 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm bg-gradient-to-br ${getAvatarGradient(
                            labour.name
                          )}`}
                        >
                          {labour.labourType?.includes("Mistri") ? <Wrench size={18} /> : <HardHat size={18} />}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-bold text-slate-900 truncate">{labour.name}</h3>
                          <p className="text-xs text-slate-400">{labour.labourType}</p>
                        </div>
                      </div>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-semibold shrink-0 ${
                          labour.status === "Active"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-rose-50 text-rose-700 border border-rose-200"
                        }`}
                      >
                        {labour.status}
                      </span>
                    </div>

                    <div className="mt-4 space-y-1.5 text-xs text-slate-500">
                      {labour.phone && (
                        <p className="flex items-center gap-1.5">
                          <Phone size={13} className="text-slate-400" /> {labour.phone}
                        </p>
                      )}
                      <p className="flex items-center gap-1.5">
                        <Building2 size={13} className="text-slate-400" />
                        {isAssigned ? (
                          <span className="text-emerald-700 font-medium">Assigned to Site</span>
                        ) : (
                          <span className="text-amber-700 font-medium">Unassigned Pool</span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 text-sm">
                      ₹{labour.dailyWage || labour.monthlySalary || 0}{" "}
                      <span className="text-xs font-normal text-slate-400">
                        {labour.wageType === "Daily" ? "/ day" : "/ mo"}
                      </span>
                    </span>
                    <span className="text-indigo-600 font-medium flex items-center gap-1">
                      View Profile <ChevronRight size={14} />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ACTION MODAL: ASSIGN TO PROJECT                                          */}
      {/* ========================================================================= */}
      {assignModalLabour && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden border border-slate-200"
          >
            <div className="p-5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white flex justify-between items-center">
              <div>
                <h3 className="font-bold text-base">Assign Worker to Project</h3>
                <p className="text-xs text-indigo-100 mt-0.5">{assignModalLabour.name}</p>
              </div>
              <button
                onClick={() => setAssignModalLabour(null)}
                className="text-white/80 hover:text-white p-1 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAssignSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Target Project Site *</label>
                <select
                  value={assignProjectId}
                  onChange={(e) => setAssignProjectId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  required
                >
                  <option value="">Select Target Project</option>
                  {projects.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.projectName || p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Assignment Date *</label>
                <input
                  type="date"
                  value={assignDate}
                  onChange={(e) => setAssignDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Assignment Notes / Role</label>
                <textarea
                  value={assignNotes}
                  onChange={(e) => setAssignNotes(e.target.value)}
                  placeholder="Optional site deployment remarks..."
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAssignModalLabour(null)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAssigning}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-indigo-600/20 disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isAssigning && <Loader2 size={14} className="animate-spin" />}
                  Confirm Assignment
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ACTION MODAL: TRANSFER LABOUR                                            */}
      {/* ========================================================================= */}
      {transferModalLabour && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden border border-slate-200"
          >
            <div className="p-5 bg-gradient-to-r from-amber-600 to-orange-600 text-white flex justify-between items-center">
              <div>
                <h3 className="font-bold text-base">Transfer Worker</h3>
                <p className="text-xs text-amber-100 mt-0.5">{transferModalLabour.name}</p>
              </div>
              <button
                onClick={() => setTransferModalLabour(null)}
                className="text-white/80 hover:text-white p-1 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleTransferSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">New Target Project *</label>
                <select
                  value={transferToProjectId}
                  onChange={(e) => setTransferToProjectId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                  required
                >
                  <option value="">Select Destination Project</option>
                  {projects.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.projectName || p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Transfer Date *</label>
                <input
                  type="date"
                  value={transferDate}
                  onChange={(e) => setTransferDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Transfer Reason *</label>
                <input
                  type="text"
                  placeholder="e.g. Requirement at Site B, Special masonry task"
                  value={transferReason}
                  onChange={(e) => setTransferReason(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Additional Remarks</label>
                <textarea
                  value={transferNotes}
                  onChange={(e) => setTransferNotes(e.target.value)}
                  placeholder="Optional transition notes..."
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setTransferModalLabour(null)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isTransferring}
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-amber-600/20 disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isTransferring && <Loader2 size={14} className="animate-spin" />}
                  Confirm Transfer
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ACTION MODAL: RELEASE LABOUR                                             */}
      {/* ========================================================================= */}
      {releaseModalLabour && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden border border-slate-200"
          >
            <div className="p-5 bg-gradient-to-r from-rose-600 to-red-600 text-white flex justify-between items-center">
              <div>
                <h3 className="font-bold text-base">Release Worker from Project</h3>
                <p className="text-xs text-rose-100 mt-0.5">{releaseModalLabour.name}</p>
              </div>
              <button
                onClick={() => setReleaseModalLabour(null)}
                className="text-white/80 hover:text-white p-1 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleReleaseSubmit} className="p-6 space-y-4">
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800">
                Releasing this worker closes their active assignment and returns them to the <strong>Unassigned Pool</strong>.
                Historical attendance and wage records remain permanently preserved.
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Release Date *</label>
                <input
                  type="date"
                  value={releaseDate}
                  onChange={(e) => setReleaseDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-rose-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Release Reason *</label>
                <input
                  type="text"
                  placeholder="e.g. Project phase completed, demobilization"
                  value={releaseReason}
                  onChange={(e) => setReleaseReason(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-rose-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Additional Remarks</label>
                <textarea
                  value={releaseNotes}
                  onChange={(e) => setReleaseNotes(e.target.value)}
                  placeholder="Optional notes..."
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-rose-500 outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setReleaseModalLabour(null)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isReleasing}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-rose-600/20 disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isReleasing && <Loader2 size={14} className="animate-spin" />}
                  Confirm Release
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
