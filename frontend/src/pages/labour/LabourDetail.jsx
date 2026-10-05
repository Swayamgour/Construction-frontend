import React, { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  useGetLabourByIdQuery,
  useGetLabourFullHistoryQuery,
  useGetProjectsQuery,
  useAssignLabourToProjectMutation,
  useTransferLabourMutation,
  useReleaseLabourMutation,
} from "../../Reduxe/Api";
import { CheckRole } from "../../helper/CheckRole";
import LabourForm from "./LabourForm";
import {
  ArrowLeft,
  Edit,
  User,
  Briefcase,
  Calendar,
  Clock,
  MapPin,
  Phone,
  IdCard,
  Download,
  Filter,
  CheckCircle,
  XCircle,
  PlayCircle,
  Square,
  Timer,
  Building2,
  Inbox,
  ArrowRightLeft,
  LogOut,
  UserPlus,
  FileText,
  CreditCard,
  History as HistoryIcon,
  DollarSign,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Check,
  X,
  Loader2,
  CalendarDays,
} from "lucide-react";
import { BiRupee } from "react-icons/bi";
import { getInitials, getAvatarGradient } from "../../helper/avatar";

const formatTime = (value) => {
  if (!value) return "—";
  if (/^\d{1,2}:\d{2}$/.test(value)) return value;
  const d = new Date(value);
  if (isNaN(d.getTime())) return value;
  return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
};

const formatDate = (value) => {
  if (!value) return "—";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const formatDateTime = (value) => {
  if (!value) return "—";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const toCsvValue = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;

const TABS = [
  { id: "overview", label: "Overview", icon: User },
  { id: "attendance", label: "Attendance", icon: Clock },
  { id: "assignments", label: "Assignments", icon: ArrowRightLeft },
  { id: "overtime", label: "Overtime", icon: Timer },
  { id: "wages", label: "Wages & Earnings", icon: DollarSign },
  { id: "documents", label: "Documents", icon: FileText },
  { id: "activity", label: "Activity History", icon: HistoryIcon },
];

const ITEMS_PER_PAGE = 10;

const LabourDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { role } = CheckRole();

  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // Modals
  const [modalMode, setModalMode] = useState(null); // "assign" | "transfer" | "release" | null
  const [modalForm, setModalForm] = useState({
    projectId: "",
    toProjectId: "",
    assignmentDate: new Date().toISOString().split("T")[0],
    reason: "",
    remarks: "",
  });

  // Attendance table filters & pagination
  const [projectFilter, setProjectFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [approvalFilter, setApprovalFilter] = useState("all");
  const [fromDateFilter, setFromDateFilter] = useState("");
  const [toDateFilter, setToDateFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // API queries & mutations
  const { data: directLabourData, isLoading: loadingLabour } = useGetLabourByIdQuery(id);
  const {
    data: historyResp,
    isLoading: loadingHistory,
    refetch: refetchHistory,
  } = useGetLabourFullHistoryQuery(id);

  const { data: projectsResp } = useGetProjectsQuery();
  const projects = projectsResp?.data || projectsResp || [];

  const [assignLabour, { isLoading: assigning }] = useAssignLabourToProjectMutation();
  const [transferLabour, { isLoading: transferring }] = useTransferLabourMutation();
  const [releaseLabour, { isLoading: releasing }] = useReleaseLabourMutation();

  const historyData = historyResp?.data || historyResp || {};
  const labour = historyData?.labour || directLabourData;
  const currentAssignment = historyData?.currentAssignment || null;
  const assignments = historyData?.assignments || [];
  const attendanceList = historyData?.attendance || labour?.attendanceHistory || [];
  const overtimeList = historyData?.overtime || [];
  const activitiesList = historyData?.activities || [];
  const summary = historyData?.summary || {};

  // Status computation
  const isAssigned = !!currentAssignment && currentAssignment.status === "Active";
  const currentProject = currentAssignment?.projectId;

  // Project map for quick name resolution
  const projectNameById = useMemo(() => {
    const map = new Map();
    (projects || []).forEach((p) => map.set(p._id, p.projectName));
    (labour?.assignedProjects || []).forEach((p) => {
      if (typeof p === "object" && p._id) map.set(p._id, p.projectName);
    });
    return map;
  }, [projects, labour]);

  // Filtered attendance records
  const filteredAttendance = useMemo(() => {
    return (attendanceList || []).filter((h) => {
      const pId = typeof h.projectId === "object" ? h.projectId?._id : h.projectId;
      if (projectFilter !== "all" && pId !== projectFilter) return false;
      if (statusFilter !== "all" && h.status !== statusFilter) return false;
      if (approvalFilter !== "all" && h.approvalStatus !== approvalFilter) return false;
      if (fromDateFilter && new Date(h.date) < new Date(fromDateFilter)) return false;
      if (toDateFilter) {
        const toEnd = new Date(toDateFilter);
        toEnd.setHours(23, 59, 59, 999);
        if (new Date(h.date) > toEnd) return false;
      }
      return true;
    });
  }, [attendanceList, projectFilter, statusFilter, approvalFilter, fromDateFilter, toDateFilter]);

  // Paginated attendance
  const totalPages = Math.ceil(filteredAttendance.length / ITEMS_PER_PAGE) || 1;
  const paginatedAttendance = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAttendance.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredAttendance, currentPage]);

  // CSV download for attendance
  const downloadCsv = () => {
    const header = [
      "Date",
      "Project",
      "Status",
      "Punch In",
      "Punch Out",
      "Regular Hours",
      "Overtime Hours",
      "Approval Status",
      "Marked Source",
    ];
    const rows = filteredAttendance.map((h) => [
      formatDate(h.date),
      (typeof h.projectId === "object" ? h.projectId?.projectName : projectNameById.get(h.projectId)) || "Unknown",
      h.status,
      formatTime(h.checkInTime || h.timeIn),
      formatTime(h.checkOutTime || h.timeOut),
      h.regularWorkingHours || 0,
      h.overtimeHours || 0,
      h.approvalStatus || "Pending",
      h.markedSource || "MANUAL",
    ]);
    const csv = [header, ...rows].map((r) => r.map(toCsvValue).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${labour?.name || "labour"}-attendance.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Handle modal submit
  const handleModalSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modalMode === "assign") {
        if (!modalForm.projectId) return toast.error("Please select a project");
        await assignLabour({
          labourId: id,
          projectId: modalForm.projectId,
          assignmentDate: modalForm.assignmentDate,
          remarks: modalForm.remarks,
        }).unwrap();
        toast.success("Labour assigned to project successfully");
      } else if (modalMode === "transfer") {
        if (!modalForm.toProjectId) return toast.error("Please select the target project");
        await transferLabour({
          labourId: id,
          toProjectId: modalForm.toProjectId,
          transferReason: modalForm.reason,
          remarks: modalForm.remarks,
        }).unwrap();
        toast.success("Labour transferred successfully");
      } else if (modalMode === "release") {
        await releaseLabour({
          labourId: id,
          releaseReason: modalForm.reason,
          remarks: modalForm.remarks,
        }).unwrap();
        toast.success("Labour released successfully");
      }
      setModalMode(null);
      setModalForm({
        projectId: "",
        toProjectId: "",
        assignmentDate: new Date().toISOString().split("T")[0],
        reason: "",
        remarks: "",
      });
      refetchHistory();
    } catch (err) {
      toast.error(err?.data?.message || err?.message || "Operation failed");
    }
  };

  if (loadingLabour && !labour) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading labour profile & history...</p>
        </div>
      </div>
    );
  }

  if (!labour) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center text-red-600">
          <XCircle className="w-16 h-16 mx-auto mb-4" />
          <p className="text-lg font-semibold mb-2">Labour not found</p>
          <button onClick={() => navigate(-1)} className="text-indigo-600 hover:text-indigo-700 underline font-medium">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (isEditing) {
    return <LabourForm labourId={id} onClose={() => setIsEditing(false)} onSave={() => setIsEditing(false)} />;
  }

  const getWageDisplay = () => {
    if (labour.wageType === "Daily") return `₹${labour.dailyWage || 0}/day`;
    return `₹${labour.monthlySalary || 0}/month`;
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Present":
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200"><CheckCircle size={12} /> Present</span>;
      case "Absent":
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200"><XCircle size={12} /> Absent</span>;
      case "Half-Day":
      case "Half Day":
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200"><Clock size={12} /> Half Day</span>;
      case "Holiday":
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">Holiday</span>;
      case "Leave":
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">Leave</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">{status || "—"}</span>;
    }
  };

  const getApprovalBadge = (approvalStatus) => {
    switch (approvalStatus) {
      case "Approved":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800"><ShieldCheck size={12} /> Approved</span>;
      case "Rejected":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-800"><AlertCircle size={12} /> Rejected</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800"><Clock size={12} /> Pending</span>;
    }
  };

  const canManageAssignments = role === "admin" || role === "manager";

  return (
    <div className="min-h-screen bg-slate-50/50 py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Navigation & Breadcrumb */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3.5 py-2 rounded-xl shadow-sm hover:bg-slate-50 transition-all"
          >
            <ArrowLeft size={16} />
            Back to Labour List
          </button>

          <div className="flex items-center gap-2">
            {labour.labourId && (
              <span className="text-xs font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-1 rounded-lg shadow-sm">
                Labour ID: {labour.labourId}
              </span>
            )}
            <span className="text-xs text-slate-400 font-mono">DB: {labour._id}</span>
          </div>
        </div>

        {/* Header Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="flex items-start sm:items-center gap-5 sm:gap-6">
              <div className="relative shrink-0">
                <div
                  className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl text-white text-3xl flex items-center justify-center font-bold shadow-md bg-gradient-to-br ${getAvatarGradient(
                    labour.name
                  )}`}
                >
                  {getInitials(labour.name)}
                </div>
                <div
                  className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-white ${
                    labour.status === "Active" ? "bg-emerald-500" : "bg-slate-400"
                  }`}
                  title={`Status: ${labour.status || "Active"}`}
                >
                  {labour.status === "Active" ? <Check size={12} /> : <X size={12} />}
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    {labour.name}
                  </h1>
                  {labour.labourId && (
                    <span className="px-2.5 py-1 rounded-xl text-xs font-mono font-bold bg-indigo-100 text-indigo-800 border border-indigo-200 shadow-sm">
                      {labour.labourId}
                    </span>
                  )}
                  {labour.fatherName && (
                    <span className="text-sm text-slate-500 font-medium">
                      (S/o {labour.fatherName})
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="px-3 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-full text-xs font-semibold">
                    {labour.category || "Labour"}
                  </span>
                  <span className="px-3 py-1 bg-blue-50 border border-blue-200 text-blue-700 rounded-full text-xs font-semibold">
                    {labour.labourType || "Permanent"}
                  </span>
                  <span className="px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-full text-xs font-semibold flex items-center gap-0.5">
                    <BiRupee className="text-sm" />
                    {getWageDisplay()}
                  </span>
                  <span className="px-3 py-1 bg-purple-50 border border-purple-200 text-purple-700 rounded-full text-xs font-semibold">
                    {labour.skillLevel || "Skilled"}
                  </span>
                </div>

                {/* Assignment Status Pill */}
                <div className="pt-2 flex items-center gap-2">
                  <span className="text-xs font-medium text-slate-500">Current Assignment:</span>
                  {isAssigned ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-300">
                      <Building2 size={13} className="text-emerald-600" />
                      {currentProject?.projectName || "Assigned Project"}
                      {currentAssignment?.assignmentDate && (
                        <span className="text-emerald-600 font-normal">
                          (since {formatDate(currentAssignment.assignmentDate)})
                        </span>
                      )}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-300">
                      <AlertCircle size={13} className="text-amber-600" />
                      UNASSIGNED
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Header Action Buttons */}
            <div className="flex flex-wrap sm:flex-nowrap gap-2.5 w-full lg:w-auto">
              <button
                onClick={() => setIsEditing(true)}
                className="flex-1 sm:flex-none px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <Edit size={16} /> Edit Profile
              </button>

              {canManageAssignments && (
                <>
                  {!isAssigned ? (
                    <button
                      onClick={() => {
                        setModalMode("assign");
                        setModalForm({
                          projectId: "",
                          toProjectId: "",
                          assignmentDate: new Date().toISOString().split("T")[0],
                          reason: "",
                          remarks: "",
                        });
                      }}
                      className="flex-1 sm:flex-none px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 shadow-sm shadow-emerald-500/20 transition-all"
                    >
                      <UserPlus size={16} /> Assign to Project
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setModalMode("transfer");
                          setModalForm({
                            projectId: currentProject?._id || "",
                            toProjectId: "",
                            assignmentDate: new Date().toISOString().split("T")[0],
                            reason: "",
                            remarks: "",
                          });
                        }}
                        className="flex-1 sm:flex-none px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 shadow-sm shadow-indigo-500/20 transition-all"
                      >
                        <ArrowRightLeft size={16} /> Transfer
                      </button>
                      <button
                        onClick={() => {
                          setModalMode("release");
                          setModalForm({
                            projectId: currentProject?._id || "",
                            toProjectId: "",
                            assignmentDate: new Date().toISOString().split("T")[0],
                            reason: "",
                            remarks: "",
                          });
                        }}
                        className="flex-1 sm:flex-none px-4 py-2.5 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 shadow-sm shadow-rose-500/20 transition-all"
                      >
                        <LogOut size={16} /> Release
                      </button>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Summary Metric Cards (Section 21 Requirements) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Working Days</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{summary.totalWorkingDays ?? 0}</p>
            <p className="text-xs text-slate-400 mt-0.5">Total Days</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-emerald-200/80 shadow-sm bg-gradient-to-br from-white to-emerald-50/30">
            <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">Present</p>
            <p className="text-2xl font-bold text-emerald-800 mt-1">{summary.presentDays ?? 0}</p>
            <p className="text-xs text-emerald-600 mt-0.5">Full Days</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-rose-200/80 shadow-sm bg-gradient-to-br from-white to-rose-50/30">
            <p className="text-xs font-semibold text-rose-700 uppercase tracking-wide">Absent</p>
            <p className="text-2xl font-bold text-rose-800 mt-1">{summary.absentDays ?? 0}</p>
            <p className="text-xs text-rose-600 mt-0.5">Total Absents</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-amber-200/80 shadow-sm bg-gradient-to-br from-white to-amber-50/30">
            <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide">Half Days</p>
            <p className="text-2xl font-bold text-amber-800 mt-1">{summary.halfDays ?? 0}</p>
            <p className="text-xs text-amber-600 mt-0.5">0.5 Shifts</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-blue-200/80 shadow-sm bg-gradient-to-br from-white to-blue-50/30">
            <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Total Hours</p>
            <p className="text-2xl font-bold text-blue-800 mt-1">{summary.totalHours ?? 0}h</p>
            <p className="text-xs text-blue-600 mt-0.5">Working Time</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-purple-200/80 shadow-sm bg-gradient-to-br from-white to-purple-50/30">
            <p className="text-xs font-semibold text-purple-700 uppercase tracking-wide">Overtime</p>
            <p className="text-2xl font-bold text-purple-800 mt-1">{summary.overtimeHours ?? 0}h</p>
            <p className="text-xs text-purple-600 mt-0.5">Extra Time</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-teal-200/80 shadow-sm bg-gradient-to-br from-white to-teal-50/30 col-span-2 sm:col-span-1">
            <p className="text-xs font-semibold text-teal-700 uppercase tracking-wide">Earnings</p>
            <p className="text-2xl font-bold text-teal-800 mt-1 flex items-center">
              <BiRupee className="text-xl" />
              {Number(summary.totalEarnings || 0).toLocaleString("en-IN")}
            </p>
            <p className="text-xs text-teal-600 mt-0.5">Approved Wages</p>
          </div>
        </div>

        {/* 7 Navigation Tabs (Section 22 Requirements) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="flex border-b border-slate-200 overflow-x-auto scrollbar-none bg-slate-50/70">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-3.5 px-5 text-sm font-semibold transition-all whitespace-nowrap border-b-2 ${
                    isActive
                      ? "text-indigo-600 border-indigo-600 bg-white"
                      : "text-slate-600 border-transparent hover:text-slate-900 hover:bg-white/60"
                  }`}
                >
                  <Icon size={16} className={isActive ? "text-indigo-600" : "text-slate-400"} />
                  {tab.label}
                  {tab.id === "attendance" && (
                    <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-slate-200/70 text-slate-700">
                      {attendanceList.length}
                    </span>
                  )}
                  {tab.id === "assignments" && (
                    <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-slate-200/70 text-slate-700">
                      {assignments.length}
                    </span>
                  )}
                  {tab.id === "overtime" && overtimeList.length > 0 && (
                    <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                      {overtimeList.length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* TAB CONTENTS */}
          <div className="p-6">
            {/* TAB 1: OVERVIEW */}
            {activeTab === "overview" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Personal Information */}
                <div className="bg-slate-50/70 rounded-2xl p-5 border border-slate-200">
                  <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <User size={18} className="text-indigo-600" />
                    Personal Information
                  </h3>
                  <div className="space-y-3 text-sm">
                    {labour.labourId && (
                      <div className="bg-gradient-to-r from-indigo-50/80 to-blue-50/60 p-3 rounded-xl border border-indigo-200/80 flex items-center justify-between">
                        <div>
                          <span className="text-[11px] text-indigo-700 font-semibold block uppercase tracking-wider">Labour Unique ID</span>
                          <span className="font-mono font-bold text-base text-indigo-950">{labour.labourId}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-200/60 text-indigo-800 border border-indigo-300 uppercase">
                          Serial
                        </span>
                      </div>
                    )}
                    <div className="bg-white p-3 rounded-xl border border-slate-200/80">
                      <span className="text-xs text-slate-400 block">Full Name</span>
                      <span className="font-semibold text-slate-800">{labour.name}</span>
                    </div>
                    {labour.fatherName && (
                      <div className="bg-white p-3 rounded-xl border border-slate-200/80">
                        <span className="text-xs text-slate-400 block">Father's Name</span>
                        <span className="font-semibold text-slate-800">{labour.fatherName}</span>
                      </div>
                    )}
                    <div className="bg-white p-3 rounded-xl border border-slate-200/80">
                      <span className="text-xs text-slate-400 block">Primary Phone</span>
                      <span className="font-semibold text-slate-800">{labour.phone || "—"}</span>
                    </div>
                    {labour.alternatePhone && (
                      <div className="bg-white p-3 rounded-xl border border-slate-200/80">
                        <span className="text-xs text-slate-400 block">Alternate Phone</span>
                        <span className="font-semibold text-slate-800">{labour.alternatePhone}</span>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white p-3 rounded-xl border border-slate-200/80">
                        <span className="text-xs text-slate-400 block">Gender</span>
                        <span className="font-semibold text-slate-800">{labour.gender || "Not specified"}</span>
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-slate-200/80">
                        <span className="text-xs text-slate-400 block">Age</span>
                        <span className="font-semibold text-slate-800">{labour.age ? `${labour.age} yrs` : "—"}</span>
                      </div>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-slate-200/80">
                      <span className="text-xs text-slate-400 block">Address</span>
                      <span className="font-semibold text-slate-800">{labour.address || "—"}</span>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-slate-200/80">
                      <span className="text-xs text-slate-400 block">Aadhaar Number</span>
                      <span className="font-semibold text-slate-800">{labour.aadhaarNumber || "—"}</span>
                    </div>
                  </div>
                </div>

                {/* Employment & Wages */}
                <div className="bg-slate-50/70 rounded-2xl p-5 border border-slate-200">
                  <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Briefcase size={18} className="text-emerald-600" />
                    Employment & Wage Details
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white p-3 rounded-xl border border-slate-200/80">
                        <span className="text-xs text-slate-400 block">Category</span>
                        <span className="font-semibold text-slate-800">{labour.category || "Labour"}</span>
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-slate-200/80">
                        <span className="text-xs text-slate-400 block">Labour Type</span>
                        <span className="font-semibold text-slate-800">{labour.labourType || "Permanent"}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white p-3 rounded-xl border border-slate-200/80">
                        <span className="text-xs text-slate-400 block">Skill Level</span>
                        <span className="font-semibold text-slate-800">{labour.skillLevel || "Skilled"}</span>
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-slate-200/80">
                        <span className="text-xs text-slate-400 block">Wage Type</span>
                        <span className="font-semibold text-slate-800">{labour.wageType || "Daily"}</span>
                      </div>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-slate-200/80">
                      <span className="text-xs text-slate-400 block">Configured Wage Rate</span>
                      <span className="font-bold text-emerald-700 text-base flex items-center">
                        <BiRupee className="text-lg" />
                        {getWageDisplay()}
                      </span>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-slate-200/80">
                      <span className="text-xs text-slate-400 block">Employment Status</span>
                      <span className="inline-flex items-center gap-1.5 font-semibold text-slate-800 mt-0.5">
                        <span
                          className={`w-2.5 h-2.5 rounded-full ${
                            labour.status === "Active" ? "bg-emerald-500" : "bg-slate-400"
                          }`}
                        />
                        {labour.status || "Active"}
                      </span>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-slate-200/80">
                      <span className="text-xs text-slate-400 block">Joining Date</span>
                      <span className="font-semibold text-slate-800">
                        {formatDate(labour.joiningDate || labour.joinDate || labour.createdAt)}
                      </span>
                    </div>
                    {labour.contractorName && (
                      <div className="bg-white p-3 rounded-xl border border-slate-200/80">
                        <span className="text-xs text-slate-400 block">Contractor / Agency</span>
                        <span className="font-semibold text-slate-800">{labour.contractorName}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Assignment & Emergency */}
                <div className="space-y-6">
                  {/* Current Assignment Card */}
                  <div className="bg-slate-50/70 rounded-2xl p-5 border border-slate-200">
                    <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <Building2 size={18} className="text-blue-600" />
                      Current Project Assignment
                    </h3>
                    {isAssigned ? (
                      <div className="bg-white p-4 rounded-xl border border-emerald-200/80 space-y-2.5 text-sm">
                        <div>
                          <span className="text-xs text-slate-400 block">Active Project</span>
                          <span className="text-base font-bold text-emerald-800">
                            {currentProject?.projectName || "Assigned Project"}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-slate-400 block">Assigned Date</span>
                            <span className="font-semibold text-slate-700">
                              {formatDate(currentAssignment.assignmentDate)}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 block">Assigned By</span>
                            <span className="font-semibold text-slate-700">
                              {currentAssignment.assignedBy?.name || "System / Admin"}
                            </span>
                          </div>
                        </div>
                        {currentAssignment.remarks && (
                          <div className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg">
                            <span className="font-semibold text-slate-500">Remarks:</span> {currentAssignment.remarks}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="bg-white p-4 rounded-xl border border-dashed border-amber-300 text-center space-y-2">
                        <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
                        <p className="text-sm font-semibold text-amber-800">Worker is currently unassigned</p>
                        <p className="text-xs text-slate-500">
                          Worker is not active on any project. Assign to a project to begin marking attendance.
                        </p>
                        {canManageAssignments && (
                          <button
                            onClick={() => {
                              setModalMode("assign");
                              setModalForm({
                                projectId: "",
                                toProjectId: "",
                                assignmentDate: new Date().toISOString().split("T")[0],
                                reason: "",
                                remarks: "",
                              });
                            }}
                            className="mt-2 inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 shadow-sm"
                          >
                            <UserPlus size={14} /> Assign Now
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Emergency Contact */}
                  <div className="bg-slate-50/70 rounded-2xl p-5 border border-slate-200">
                    <h3 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
                      <Phone size={18} className="text-rose-600" />
                      Emergency Contact
                    </h3>
                    <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 text-sm space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-xs text-slate-400">Name</span>
                        <span className="font-semibold text-slate-800">
                          {labour.emergencyContact?.name || "Not provided"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-slate-400">Relationship</span>
                        <span className="font-semibold text-slate-800">
                          {labour.emergencyContact?.relationship || "—"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-slate-400">Phone</span>
                        <span className="font-semibold text-slate-800">
                          {labour.emergencyContact?.phone || "—"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Skills & Notes */}
                  {(labour.skills?.length > 0 || labour.notes) && (
                    <div className="bg-slate-50/70 rounded-2xl p-5 border border-slate-200 text-sm space-y-3">
                      {labour.skills?.length > 0 && (
                        <div>
                          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-2">
                            Skills & Capabilities
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {labour.skills.map((skill, idx) => (
                              <span
                                key={idx}
                                className="px-2.5 py-1 bg-white border border-slate-200 text-slate-700 text-xs rounded-lg font-medium"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {labour.notes && (
                        <div>
                          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1">
                            Notes / Remarks
                          </span>
                          <p className="text-xs text-slate-700 bg-white p-2.5 rounded-xl border border-slate-200/80 whitespace-pre-wrap">
                            {labour.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: ATTENDANCE (Section 22 Requirements) */}
            {activeTab === "attendance" && (
              <div className="space-y-4">
                {/* Filters Row */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                    <Filter size={14} /> Filter:
                  </div>

                  {/* Date Range */}
                  <div className="flex items-center gap-1 text-xs">
                    <input
                      type="date"
                      value={fromDateFilter}
                      onChange={(e) => {
                        setFromDateFilter(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
                      title="From Date"
                    />
                    <span className="text-slate-400">to</span>
                    <input
                      type="date"
                      value={toDateFilter}
                      onChange={(e) => {
                        setToDateFilter(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
                      title="To Date"
                    />
                  </div>

                  {/* Project Selector */}
                  <select
                    value={projectFilter}
                    onChange={(e) => {
                      setProjectFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:ring-1 focus:ring-indigo-500 outline-none"
                  >
                    <option value="all">All Projects</option>
                    {projects.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.projectName}
                      </option>
                    ))}
                  </select>

                  {/* Status Selector */}
                  <select
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:ring-1 focus:ring-indigo-500 outline-none"
                  >
                    <option value="all">All Statuses</option>
                    <option value="Present">Present</option>
                    <option value="Absent">Absent</option>
                    <option value="Half-Day">Half Day</option>
                    <option value="Holiday">Holiday</option>
                    <option value="Leave">Leave</option>
                  </select>

                  {/* Approval Selector */}
                  <select
                    value={approvalFilter}
                    onChange={(e) => {
                      setApprovalFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:ring-1 focus:ring-indigo-500 outline-none"
                  >
                    <option value="all">All Approvals</option>
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                  </select>

                  {(projectFilter !== "all" ||
                    statusFilter !== "all" ||
                    approvalFilter !== "all" ||
                    fromDateFilter ||
                    toDateFilter) && (
                    <button
                      onClick={() => {
                        setProjectFilter("all");
                        setStatusFilter("all");
                        setApprovalFilter("all");
                        setFromDateFilter("");
                        setToDateFilter("");
                        setCurrentPage(1);
                      }}
                      className="text-xs text-rose-600 hover:text-rose-800 font-medium underline ml-auto"
                    >
                      Clear Filters
                    </button>
                  )}

                  <button
                    onClick={downloadCsv}
                    disabled={filteredAttendance.length === 0}
                    className="ml-auto inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-40 text-slate-700 shadow-sm transition-all"
                  >
                    <Download size={14} /> Export CSV
                  </button>
                </div>

                {/* Table */}
                {filteredAttendance.length === 0 ? (
                  <div className="text-center py-16 bg-slate-50/50 rounded-2xl border border-dashed border-slate-300">
                    <Inbox className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-600 font-semibold">No attendance records found</p>
                    <p className="text-xs text-slate-400 mt-1">Adjust filters or mark new attendance.</p>
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto rounded-2xl border border-slate-200">
                      <table className="w-full text-xs sm:text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold border-b border-slate-200">
                          <tr>
                            <th className="px-4 py-3">Date</th>
                            <th className="px-4 py-3">Project</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3">Punch In</th>
                            <th className="px-4 py-3">Punch Out</th>
                            <th className="px-4 py-3">Hours</th>
                            <th className="px-4 py-3">Overtime</th>
                            <th className="px-4 py-3">Approval</th>
                            <th className="px-4 py-3">Source</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {paginatedAttendance.map((rec) => {
                            const pName =
                              (typeof rec.projectId === "object"
                                ? rec.projectId?.projectName
                                : projectNameById.get(rec.projectId)) || "Unknown";
                            const inTime = rec.checkInTime || rec.timeIn;
                            const outTime = rec.checkOutTime || rec.timeOut;
                            const hours = rec.totalWorkingHours || rec.regularWorkingHours || 0;
                            const ot = rec.approvedOvertimeHours ?? rec.overtimeHours ?? 0;

                            return (
                              <tr key={rec._id} className="hover:bg-slate-50/80 transition-colors">
                                <td className="px-4 py-3 whitespace-nowrap font-medium text-slate-800">
                                  {formatDate(rec.date)}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <span className="inline-flex items-center gap-1 text-slate-700 font-medium">
                                    <Building2 size={13} className="text-slate-400" />
                                    {pName}
                                  </span>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">{getStatusBadge(rec.status)}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-slate-600 font-mono text-xs">
                                  {formatTime(inTime)}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-slate-600 font-mono text-xs">
                                  {formatTime(outTime)}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-slate-700 font-medium">
                                  {hours > 0 ? `${hours}h` : "—"}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                  {ot > 0 ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                                      <Timer size={11} /> {ot}h
                                    </span>
                                  ) : (
                                    <span className="text-slate-400">—</span>
                                  )}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                  {getApprovalBadge(rec.approvalStatus)}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-500 font-mono">
                                  <span
                                    className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                                      rec.markedSource === "SYSTEM"
                                        ? "bg-rose-50 text-rose-700 border border-rose-200"
                                        : "bg-slate-100 text-slate-600"
                                    }`}
                                  >
                                    {rec.markedSource || "MANUAL"}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination Bar */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-xs text-slate-500">
                          Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
                          {Math.min(currentPage * ITEMS_PER_PAGE, filteredAttendance.length)} of{" "}
                          {filteredAttendance.length} records
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40"
                          >
                            <ChevronLeft size={16} />
                          </button>
                          <span className="text-xs font-semibold px-2 text-slate-700">
                            Page {currentPage} of {totalPages}
                          </span>
                          <button
                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40"
                          >
                            <ChevronRight size={16} />
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* TAB 3: ASSIGNMENTS (Section 22 Requirements) */}
            {activeTab === "assignments" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <ArrowRightLeft size={18} className="text-indigo-600" />
                    Project Assignment Lifecycle & History
                  </h3>
                  {canManageAssignments && !isAssigned && (
                    <button
                      onClick={() => {
                        setModalMode("assign");
                        setModalForm({
                          projectId: "",
                          toProjectId: "",
                          assignmentDate: new Date().toISOString().split("T")[0],
                          reason: "",
                          remarks: "",
                        });
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 shadow-sm"
                    >
                      <UserPlus size={14} /> Assign to Project
                    </button>
                  )}
                </div>

                {assignments.length === 0 ? (
                  <div className="text-center py-16 bg-slate-50/50 rounded-2xl border border-dashed border-slate-300">
                    <ArrowRightLeft className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-600 font-semibold">No assignment history found</p>
                    <p className="text-xs text-slate-400 mt-1">Worker has not yet been assigned to any project.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-2xl border border-slate-200">
                    <table className="w-full text-xs sm:text-sm text-left">
                      <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold border-b border-slate-200">
                        <tr>
                          <th className="px-4 py-3">Project</th>
                          <th className="px-4 py-3">From Project</th>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3">Start Date</th>
                          <th className="px-4 py-3">End / Release Date</th>
                          <th className="px-4 py-3">Assigned By</th>
                          <th className="px-4 py-3">Transferred / Released By</th>
                          <th className="px-4 py-3">Reason / Remarks</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {assignments.map((asgn) => {
                          const pName = asgn.projectId?.projectName || "Unknown Project";
                          const prevPName = asgn.previousProjectId?.projectName || "—";
                          const isCurrentActive = asgn.status === "Active";

                          return (
                            <tr
                              key={asgn._id}
                              className={`transition-colors ${
                                isCurrentActive ? "bg-emerald-50/30 hover:bg-emerald-50/50" : "hover:bg-slate-50/80"
                              }`}
                            >
                              <td className="px-4 py-3 whitespace-nowrap font-bold text-slate-800">
                                <span className="flex items-center gap-1.5">
                                  <Building2
                                    size={14}
                                    className={isCurrentActive ? "text-emerald-600" : "text-slate-400"}
                                  />
                                  {pName}
                                </span>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-slate-600 font-medium">
                                {prevPName}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <span
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                    asgn.status === "Active"
                                      ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                                      : asgn.status === "Transferred"
                                      ? "bg-blue-100 text-blue-800 border border-blue-300"
                                      : "bg-slate-100 text-slate-700 border border-slate-300"
                                  }`}
                                >
                                  {asgn.status}
                                </span>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-slate-700">
                                {formatDate(asgn.assignmentDate)}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-slate-600">
                                {asgn.releaseDate ? formatDate(asgn.releaseDate) : isCurrentActive ? "Current" : "—"}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-slate-600">
                                {asgn.assignedBy?.name || "System"}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-slate-600">
                                {asgn.transferredBy?.name || asgn.releasedBy?.name || "—"}
                              </td>
                              <td className="px-4 py-3 text-slate-600 max-w-xs truncate">
                                {asgn.transferReason || asgn.releaseReason || asgn.remarks || "—"}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: OVERTIME (Section 22 Requirements) */}
            {activeTab === "overtime" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Timer size={18} className="text-purple-600" />
                    Overtime Records & Approvals
                  </h3>
                  <span className="text-xs text-slate-500">
                    Total Overtime: <strong className="text-purple-700">{summary.overtimeHours ?? 0} hrs</strong>
                  </span>
                </div>

                {overtimeList.length === 0 ? (
                  <div className="text-center py-16 bg-slate-50/50 rounded-2xl border border-dashed border-slate-300">
                    <Timer className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-600 font-semibold">No overtime records</p>
                    <p className="text-xs text-slate-400 mt-1">This worker has zero recorded overtime shifts.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-2xl border border-slate-200">
                    <table className="w-full text-xs sm:text-sm text-left">
                      <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold border-b border-slate-200">
                        <tr>
                          <th className="px-4 py-3">Date</th>
                          <th className="px-4 py-3">Project</th>
                          <th className="px-4 py-3">Regular Hours</th>
                          <th className="px-4 py-3">OT Hours</th>
                          <th className="px-4 py-3">OT Rate</th>
                          <th className="px-4 py-3">OT Amount</th>
                          <th className="px-4 py-3">Approval Status</th>
                          <th className="px-4 py-3">Approved By</th>
                          <th className="px-4 py-3">Rejection Reason</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {overtimeList.map((ot) => {
                          const pName =
                            (typeof ot.projectId === "object"
                              ? ot.projectId?.projectName
                              : projectNameById.get(ot.projectId)) || "Unknown";
                          const hours = ot.approvedOvertimeHours ?? ot.overtimeHours ?? 0;

                          return (
                            <tr key={ot._id} className="hover:bg-slate-50/80 transition-colors">
                              <td className="px-4 py-3 whitespace-nowrap font-medium text-slate-800">
                                {formatDate(ot.date)}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-slate-700 font-medium">
                                {pName}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-slate-600">
                                {ot.regularWorkingHours || 8}h
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap font-bold text-purple-700">
                                {hours}h
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-slate-600">
                                ₹{ot.overtimeRate || 0}/hr
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap font-semibold text-emerald-700">
                                ₹{ot.overtimeAmount || 0}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                {getApprovalBadge(ot.overtimeApprovalStatus || ot.approvalStatus)}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-slate-600">
                                {ot.overtimeApprovedBy?.name || ot.approvedBy?.name || "—"}
                              </td>
                              <td className="px-4 py-3 text-rose-600 max-w-xs truncate">
                                {ot.overtimeRejectionReason || ot.rejectionReason || "—"}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* TAB 5: WAGES & EARNINGS (Section 22 Requirements) */}
            {activeTab === "wages" && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-emerald-50 to-teal-50 p-4 rounded-2xl border border-emerald-200">
                  <div>
                    <h3 className="text-base font-bold text-emerald-950 flex items-center gap-2">
                      <DollarSign size={18} className="text-emerald-700" />
                      Wages & Total Earnings
                    </h3>
                    <p className="text-xs text-emerald-700 mt-0.5">
                      Authoritative wages calculated strictly by backend from daily wage rates and overtime formulas.
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-emerald-800 uppercase tracking-wide block font-semibold">
                      Total Approved Earnings
                    </span>
                    <span className="text-2xl font-black text-emerald-900 flex items-center justify-end">
                      <BiRupee className="text-2xl" />
                      {Number(summary.totalEarnings || 0).toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                {attendanceList.filter((a) => a.status === "Present" || a.status === "Half-Day").length === 0 ? (
                  <div className="text-center py-16 bg-slate-50/50 rounded-2xl border border-dashed border-slate-300">
                    <DollarSign className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-600 font-semibold">No wage records available</p>
                    <p className="text-xs text-slate-400 mt-1">Earnings appear once attendance is submitted and verified.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-2xl border border-slate-200">
                    <table className="w-full text-xs sm:text-sm text-left">
                      <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold border-b border-slate-200">
                        <tr>
                          <th className="px-4 py-3">Date</th>
                          <th className="px-4 py-3">Project</th>
                          <th className="px-4 py-3">Attendance</th>
                          <th className="px-4 py-3">Daily Wage Rate</th>
                          <th className="px-4 py-3">Regular Wage</th>
                          <th className="px-4 py-3">OT Wage</th>
                          <th className="px-4 py-3">Total Payable</th>
                          <th className="px-4 py-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {attendanceList
                          .filter((a) => a.status === "Present" || a.status === "Half-Day")
                          .map((att) => {
                            const pName =
                              (typeof att.projectId === "object"
                                ? att.projectId?.projectName
                                : projectNameById.get(att.projectId)) || "Unknown";
                            const regular =
                              att.regularAmount ||
                              (att.status === "Half-Day" ? (labour.dailyWage || 0) / 2 : labour.dailyWage || 0);
                            const ot = att.overtimeAmount || 0;
                            const total = att.totalAmount || att.dailyWageAmount || regular + ot;

                            return (
                              <tr key={att._id} className="hover:bg-slate-50/80 transition-colors">
                                <td className="px-4 py-3 whitespace-nowrap font-medium text-slate-800">
                                  {formatDate(att.date)}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-slate-700 font-medium">{pName}</td>
                                <td className="px-4 py-3 whitespace-nowrap">{getStatusBadge(att.status)}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-slate-600">
                                  ₹{att.regularRate || labour.dailyWage || 0}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-slate-800 font-medium">₹{regular}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-purple-700 font-medium">
                                  {ot > 0 ? `+₹${ot}` : "—"}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap font-bold text-emerald-700">₹{total}</td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                  {getApprovalBadge(att.approvalStatus)}
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* TAB 6: DOCUMENTS (Section 22 Requirements) */}
            {activeTab === "documents" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Identity Documents Card */}
                  <div className="bg-slate-50/70 p-5 rounded-2xl border border-slate-200 space-y-4">
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <IdCard size={18} className="text-indigo-600" />
                      Identification Documents
                    </h3>

                    <div className="space-y-3">
                      <div className="bg-white p-4 rounded-xl border border-slate-200/80 flex items-center justify-between">
                        <div>
                          <span className="text-xs text-slate-400 block">Aadhaar Card</span>
                          <span className="font-semibold text-slate-800">
                            {labour.aadhaarNumber || "Not recorded"}
                          </span>
                        </div>
                        {labour.documents?.aadhaar && (
                          <a
                            href={labour.documents.aadhaar}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-semibold hover:bg-indigo-100"
                          >
                            <FileText size={14} /> View File
                          </a>
                        )}
                      </div>

                      <div className="bg-white p-4 rounded-xl border border-slate-200/80 flex items-center justify-between">
                        <div>
                          <span className="text-xs text-slate-400 block">PAN Card</span>
                          <span className="font-semibold text-slate-800">
                            {labour.documents?.pan ? "PAN on file" : "Not submitted"}
                          </span>
                        </div>
                        {labour.documents?.pan && (
                          <a
                            href={labour.documents.pan}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-semibold hover:bg-indigo-100"
                          >
                            <FileText size={14} /> View File
                          </a>
                        )}
                      </div>

                      <div className="bg-white p-4 rounded-xl border border-slate-200/80 flex items-center justify-between">
                        <div>
                          <span className="text-xs text-slate-400 block">Profile Photo</span>
                          <span className="font-semibold text-slate-800">
                            {labour.profilePhoto || labour.documents?.photo ? "Uploaded" : "Default avatar used"}
                          </span>
                        </div>
                        {(labour.profilePhoto || labour.documents?.photo) && (
                          <a
                            href={labour.profilePhoto || labour.documents?.photo}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-semibold hover:bg-indigo-100"
                          >
                            <FileText size={14} /> View Photo
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Bank Details Card */}
                  <div className="bg-slate-50/70 p-5 rounded-2xl border border-slate-200 space-y-4">
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <CreditCard size={18} className="text-emerald-600" />
                      Bank Account Details
                    </h3>

                    <div className="bg-white p-5 rounded-xl border border-slate-200/80 space-y-3.5 text-sm">
                      <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                        <span className="text-slate-400 text-xs">Bank Name</span>
                        <span className="font-semibold text-slate-800">{labour.bankName || "—"}</span>
                      </div>
                      <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                        <span className="text-slate-400 text-xs">Account Number</span>
                        <span className="font-mono font-semibold text-slate-800">
                          {labour.accountNumber || "—"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 text-xs">IFSC Code</span>
                        <span className="font-mono font-semibold text-slate-800">{labour.ifscCode || "—"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 7: ACTIVITY HISTORY / AUDIT LOG (Section 22 Requirements) */}
            {activeTab === "activity" && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <HistoryIcon size={18} className="text-blue-600" />
                  Audit Trail & Activity Log
                </h3>

                {activitiesList.length === 0 ? (
                  <div className="text-center py-16 bg-slate-50/50 rounded-2xl border border-dashed border-slate-300">
                    <HistoryIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-600 font-semibold">No activity recorded yet</p>
                    <p className="text-xs text-slate-400 mt-1">Audit logs will appear here for all actions.</p>
                  </div>
                ) : (
                  <div className="relative border-l-2 border-slate-200 ml-4 pl-6 space-y-6">
                    {activitiesList.map((act) => (
                      <div key={act._id} className="relative group">
                        <div className="absolute -left-[31px] top-1.5 w-3.5 h-3.5 rounded-full bg-white border-2 border-indigo-600 group-hover:scale-125 transition-transform" />
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 hover:border-indigo-200 transition-colors">
                          <div className="flex items-center justify-between gap-3 mb-1">
                            <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 px-2 py-0.5 rounded bg-indigo-50 border border-indigo-200">
                              {act.action || "Action"}
                            </span>
                            <span className="text-xs text-slate-400">
                              {formatDateTime(act.timestamp || act.createdAt)}
                            </span>
                          </div>
                          <p className="text-sm font-semibold text-slate-800">
                            {act.performedBy?.name || "System"} ({act.performedBy?.role || "System"})
                          </p>
                          {act.meta && (
                            <p className="text-xs text-slate-600 mt-1 font-mono bg-white p-2 rounded-lg border border-slate-200/80">
                              {JSON.stringify(act.meta)}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* System Meta Footer */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 text-xs text-slate-500 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CalendarDays size={14} className="text-slate-400" />
            <span>Profile Created: {formatDateTime(labour.createdAt)}</span>
          </div>
          <div>
            <span>Last Updated: {formatDateTime(labour.updatedAt)}</span>
          </div>
        </div>
      </div>

      {/* ASSIGN / TRANSFER / RELEASE ACTION MODAL */}
      {modalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                {modalMode === "assign" && <UserPlus size={20} className="text-emerald-600" />}
                {modalMode === "transfer" && <ArrowRightLeft size={20} className="text-indigo-600" />}
                {modalMode === "release" && <LogOut size={20} className="text-rose-600" />}
                {modalMode === "assign"
                  ? "Assign Labour to Project"
                  : modalMode === "transfer"
                  ? "Transfer Labour to New Project"
                  : "Release Labour from Project"}
              </h3>
              <button
                onClick={() => setModalMode(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleModalSubmit} className="space-y-4 text-sm">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
                <span className="font-semibold text-slate-800">{labour.name}</span> ({labour.category} -{" "}
                {labour.labourType})
                {isAssigned && currentProject && (
                  <span className="block mt-0.5 text-indigo-700">
                    Currently assigned to: <strong>{currentProject.projectName}</strong>
                  </span>
                )}
              </div>

              {/* Mode: ASSIGN */}
              {modalMode === "assign" && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Target Project <span className="text-rose-500">*</span>
                    </label>
                    <select
                      required
                      value={modalForm.projectId}
                      onChange={(e) => setModalForm({ ...modalForm, projectId: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                    >
                      <option value="">Select a project...</option>
                      {projects.map((p) => (
                        <option key={p._id} value={p._id}>
                          {p.projectName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Assignment Date</label>
                    <input
                      type="date"
                      value={modalForm.assignmentDate}
                      onChange={(e) => setModalForm({ ...modalForm, assignmentDate: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                </>
              )}

              {/* Mode: TRANSFER */}
              {modalMode === "transfer" && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      New Destination Project <span className="text-rose-500">*</span>
                    </label>
                    <select
                      required
                      value={modalForm.toProjectId}
                      onChange={(e) => setModalForm({ ...modalForm, toProjectId: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                      <option value="">Select new project...</option>
                      {projects
                        .filter((p) => p._id !== currentProject?._id)
                        .map((p) => (
                          <option key={p._id} value={p._id}>
                            {p.projectName}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Transfer Reason <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Structural phase completed; required at Site B"
                      value={modalForm.reason}
                      onChange={(e) => setModalForm({ ...modalForm, reason: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                </>
              )}

              {/* Mode: RELEASE */}
              {modalMode === "release" && (
                <>
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800">
                    Labour will be released from <strong>{currentProject?.projectName}</strong> and become
                    <strong> UNASSIGNED</strong>. Historical attendance will remain intact.
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Release Reason</label>
                    <input
                      type="text"
                      placeholder="e.g. Project phase concluded / work completed"
                      value={modalForm.reason}
                      onChange={(e) => setModalForm({ ...modalForm, reason: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-rose-500 outline-none"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Additional Remarks (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="Optional notes..."
                  value={modalForm.remarks}
                  onChange={(e) => setModalForm({ ...modalForm, remarks: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalMode(null)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 text-sm font-semibold rounded-xl hover:bg-slate-100 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={assigning || transferring || releasing}
                  className={`px-5 py-2 text-white text-sm font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 ${
                    modalMode === "assign"
                      ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20"
                      : modalMode === "transfer"
                      ? "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/20"
                      : "bg-rose-600 hover:bg-rose-700 shadow-rose-500/20"
                  } disabled:opacity-50`}
                >
                  {(assigning || transferring || releasing) && <Loader2 size={15} className="animate-spin" />}
                  {modalMode === "assign" ? "Confirm Assignment" : modalMode === "transfer" ? "Confirm Transfer" : "Confirm Release"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LabourDetail;
