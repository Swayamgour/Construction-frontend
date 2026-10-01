import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
    Calendar,
    Users,
    Clock,
    DollarSign,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Filter,
    Download,
    RefreshCw,
    Building2,
    FileText,
    ArrowUpRight,
    TrendingUp,
    Check,
    Search,
    History,
    ShieldAlert,
    Briefcase
} from "lucide-react";
import {
    useGetProjectsQuery,
    useGetLabourQuery,
    useTodayReportQuery,
    useSummaryReportQuery,
    useGetLabourAttendanceRecordsQuery,
    useGetLabourOvertimeReportQuery,
    useGetLabourFullHistoryQuery
} from "../../Reduxe/Api";

const formatCurrency = (val) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(val || 0);

const formatDate = (val) => {
    if (!val) return "—";
    const d = new Date(val);
    return isNaN(d.getTime()) ? val : d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const getStatusBadge = (status) => {
    switch (status) {
        case "Present":
            return "bg-emerald-50 text-emerald-700 border-emerald-200";
        case "Half-Day":
            return "bg-amber-50 text-amber-700 border-amber-200";
        case "Absent":
            return "bg-rose-50 text-rose-700 border-rose-200";
        default:
            return "bg-slate-100 text-slate-700 border-slate-200";
    }
};

const getApprovalBadge = (status) => {
    switch (status) {
        case "Approved":
            return "bg-emerald-100 text-emerald-800";
        case "Rejected":
            return "bg-rose-100 text-rose-800";
        case "Pending":
        default:
            return "bg-amber-100 text-amber-800";
    }
};

export default function LabourReports({ initialTab = "daily" }) {
    const [activeTab, setActiveTab] = useState(initialTab);

    // Common Filters
    const { data: projectsData, isLoading: loadingProjects } = useGetProjectsQuery();
    const projects = useMemo(() => projectsData?.data || projectsData || [], [projectsData]);

    const { data: labourMasterData } = useGetLabourQuery();
    const labours = useMemo(() => labourMasterData?.data || labourMasterData || [], [labourMasterData]);

    const [selectedProjectId, setSelectedProjectId] = useState(
        () => localStorage.getItem("projectId") || ""
    );

    // If no project selected yet and projects loaded, pick first
    React.useEffect(() => {
        if (!selectedProjectId && projects.length > 0) {
            setSelectedProjectId(projects[0]._id);
        }
    }, [projects, selectedProjectId]);

    // Export to CSV helper
    const downloadCSV = (filename, rows) => {
        if (!rows || rows.length === 0) return;
        const headers = Object.keys(rows[0]);
        const csvContent =
            "data:text/csv;charset=utf-8," +
            [headers.join(","), ...rows.map((e) => headers.map((h) => `"${String(e[h] || "").replace(/"/g, '""')}"`).join(","))].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="min-h-screen bg-slate-50/70 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider bg-blue-100 text-blue-800 rounded-full">
                            Workforce Intelligence
                        </span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">Labour & Workforce Reports</h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Authoritative reporting for daily attendance, project workforce cost, individual labour history, and overtime audits.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Link
                        to="/project-labour"
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                    >
                        <Users className="w-4 h-4" />
                        Project Labour
                    </Link>
                    <Link
                        to="/labour-pending-approvals"
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition"
                    >
                        <ShieldAlert className="w-4 h-4" />
                        Approvals
                    </Link>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
                {[
                    { id: "daily", label: "Daily Workforce Report", icon: Calendar },
                    { id: "project", label: "Project Summary Report", icon: Building2 },
                    { id: "attendance", label: "Attendance Master Report", icon: FileText },
                    { id: "overtime", label: "Overtime Audit Report", icon: Clock },
                    { id: "history", label: "Labour History Report", icon: History }
                ].map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl transition-all ${
                                isActive
                                    ? "bg-blue-600 text-white shadow-sm"
                                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                            }`}
                        >
                            <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* TAB CONTENTS */}
            {activeTab === "daily" && (
                <DailyWorkforceReport
                    projects={projects}
                    selectedProjectId={selectedProjectId}
                    setSelectedProjectId={setSelectedProjectId}
                    downloadCSV={downloadCSV}
                />
            )}

            {activeTab === "project" && (
                <ProjectWorkforceReport
                    projects={projects}
                    selectedProjectId={selectedProjectId}
                    setSelectedProjectId={setSelectedProjectId}
                    downloadCSV={downloadCSV}
                />
            )}

            {activeTab === "attendance" && (
                <AttendanceMasterReport
                    projects={projects}
                    labours={labours}
                    selectedProjectId={selectedProjectId}
                    setSelectedProjectId={setSelectedProjectId}
                    downloadCSV={downloadCSV}
                />
            )}

            {activeTab === "overtime" && (
                <OvertimeAuditReport
                    projects={projects}
                    labours={labours}
                    selectedProjectId={selectedProjectId}
                    setSelectedProjectId={setSelectedProjectId}
                    downloadCSV={downloadCSV}
                />
            )}

            {activeTab === "history" && (
                <LabourHistoryReport labours={labours} downloadCSV={downloadCSV} />
            )}
        </div>
    );
}

/* =========================================================================
   1. DAILY WORKFORCE REPORT (Section 23.1)
   ========================================================================= */
function DailyWorkforceReport({ projects, selectedProjectId, setSelectedProjectId, downloadCSV }) {
    const todayStr = new Date().toISOString().split("T")[0];
    const [selectedDate, setSelectedDate] = useState(todayStr);

    const { data, isLoading, refetch, isFetching } = useTodayReportQuery(
        { projectId: selectedProjectId, date: selectedDate },
        { skip: !selectedProjectId }
    );

    const labourAttendance = data?.labourAttendance || [];
    const employeeAttendance = data?.employeeAttendance || [];

    const stats = useMemo(() => {
        const total = labourAttendance.length;
        const present = labourAttendance.filter((r) => r.status === "Present").length;
        const halfDay = labourAttendance.filter((r) => r.status === "Half-Day").length;
        const absent = labourAttendance.filter((r) => r.status === "Absent").length;
        const pending = labourAttendance.filter((r) => r.approvalStatus === "Pending").length;
        const approved = labourAttendance.filter((r) => r.approvalStatus === "Approved").length;
        const totalOT = labourAttendance.reduce((sum, r) => sum + (r.overtimeHours || 0), 0);
        const totalCost = labourAttendance.reduce(
            (sum, r) => sum + (r.dailyWageAmount || r.totalAmount || 0),
            0
        );
        return { total, present, halfDay, absent, pending, approved, totalOT, totalCost };
    }, [labourAttendance]);

    const handleExport = () => {
        const rows = labourAttendance.map((rec) => ({
            Date: selectedDate,
            LabourName: rec.labourId?.name || "—",
            FatherName: rec.labourId?.fatherName || "—",
            Phone: rec.labourId?.phone || "—",
            Category: rec.labourId?.category || "—",
            LabourType: rec.labourId?.labourType || "—",
            Status: rec.status,
            CheckIn: rec.checkInTime || "—",
            CheckOut: rec.checkOutTime || "—",
            RegularHours: rec.regularHours || 0,
            OvertimeHours: rec.overtimeHours || 0,
            DailyWage: rec.dailyWageAmount || 0,
            ApprovalStatus: rec.approvalStatus || "Pending",
            MarkedBy: rec.markedBy?.name || "—"
        }));
        downloadCSV(`Daily_Workforce_${selectedDate}.csv`, rows);
    };

    return (
        <div className="space-y-6">
            {/* Filter Bar */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                            Project
                        </label>
                        <select
                            value={selectedProjectId}
                            onChange={(e) => setSelectedProjectId(e.target.value)}
                            className="bg-slate-50 border border-slate-200 text-slate-800 text-sm font-medium rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none min-w-[200px]"
                        >
                            {projects.map((p) => (
                                <option key={p._id} value={p._id}>
                                    {p.projectName || p.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                            Date
                        </label>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="bg-slate-50 border border-slate-200 text-slate-800 text-sm font-medium rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>

                    <button
                        onClick={() => refetch()}
                        disabled={isFetching}
                        className="self-end mb-0.5 p-2.5 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                        title="Refresh"
                    >
                        <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
                    </button>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                    <button
                        onClick={handleExport}
                        disabled={labourAttendance.length === 0}
                        className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl shadow-sm transition disabled:opacity-50"
                    >
                        <Download className="w-4 h-4 text-slate-500" />
                        Export CSV
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
                    <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
                    <div className="text-xs text-slate-500 mt-1 font-medium">Total Marked</div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-emerald-100 shadow-sm text-center bg-emerald-50/20">
                    <div className="text-2xl font-bold text-emerald-600">{stats.present}</div>
                    <div className="text-xs text-emerald-700 mt-1 font-medium">Present</div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-amber-100 shadow-sm text-center bg-amber-50/20">
                    <div className="text-2xl font-bold text-amber-600">{stats.halfDay}</div>
                    <div className="text-xs text-amber-700 mt-1 font-medium">Half Day</div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-rose-100 shadow-sm text-center bg-rose-50/20">
                    <div className="text-2xl font-bold text-rose-600">{stats.absent}</div>
                    <div className="text-xs text-rose-700 mt-1 font-medium">Absent</div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm text-center bg-blue-50/20">
                    <div className="text-2xl font-bold text-blue-600">{stats.totalOT}h</div>
                    <div className="text-xs text-blue-700 mt-1 font-medium">Overtime</div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-purple-100 shadow-sm text-center bg-purple-50/20">
                    <div className="text-lg font-bold text-purple-700">{formatCurrency(stats.totalCost)}</div>
                    <div className="text-xs text-purple-700 mt-1 font-medium">Estimated Cost</div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-amber-100 shadow-sm text-center bg-amber-50/20">
                    <div className="text-2xl font-bold text-amber-600">{stats.pending}</div>
                    <div className="text-xs text-amber-700 mt-1 font-medium">Pending Review</div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-emerald-100 shadow-sm text-center bg-emerald-50/20">
                    <div className="text-2xl font-bold text-emerald-700">{stats.approved}</div>
                    <div className="text-xs text-emerald-700 mt-1 font-medium">Approved</div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                    <div>
                        <h3 className="font-bold text-slate-800">Labour Attendance Records</h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                            Showing records for {formatDate(selectedDate)}
                        </p>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg">
                        {labourAttendance.length} workers recorded
                    </span>
                </div>

                {isLoading ? (
                    <div className="p-12 text-center text-slate-400">Loading daily report...</div>
                ) : labourAttendance.length === 0 ? (
                    <div className="p-12 text-center space-y-2">
                        <Users className="w-12 h-12 text-slate-300 mx-auto" />
                        <p className="text-base font-medium text-slate-700">No labour attendance recorded for this date</p>
                        <p className="text-xs text-slate-400">
                            Use the Project Attendance marking screen to mark attendance.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 text-slate-600 uppercase text-[11px] font-bold tracking-wider border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-3.5">Labour</th>
                                    <th className="px-4 py-3.5">Category & Type</th>
                                    <th className="px-4 py-3.5">Status</th>
                                    <th className="px-4 py-3.5">Punch In/Out</th>
                                    <th className="px-4 py-3.5">Hours / OT</th>
                                    <th className="px-4 py-3.5">Wage Amount</th>
                                    <th className="px-4 py-3.5">Approval</th>
                                    <th className="px-4 py-3.5">Marked By</th>
                                    <th className="px-4 py-3.5 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {labourAttendance.map((rec) => (
                                    <tr key={rec._id} className="hover:bg-slate-50/80 transition">
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-slate-900">
                                                {rec.labourId?.name || "Unknown Worker"}
                                            </div>
                                            <div className="text-xs text-slate-400">
                                                {rec.labourId?.phone || rec.labourId?.fatherName || "No contact"}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                                                {rec.labourId?.category || "Labour"}
                                            </span>
                                            <div className="text-xs text-slate-400 mt-0.5">
                                                {rec.labourId?.labourType || "Contract"}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusBadge(
                                                    rec.status
                                                )}`}
                                            >
                                                {rec.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-xs font-mono text-slate-600">
                                            {rec.checkInTime ? `${rec.checkInTime} → ${rec.checkOutTime || "—"}` : "—"}
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="text-xs font-semibold text-slate-800">
                                                {rec.workingHours || rec.regularHours || 0} hrs
                                            </div>
                                            {(rec.overtimeHours || 0) > 0 && (
                                                <div className="text-[11px] font-bold text-blue-600">
                                                    +{rec.overtimeHours}h OT
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-4 py-4 font-semibold text-slate-800">
                                            {formatCurrency(rec.dailyWageAmount || rec.totalAmount || 0)}
                                        </td>
                                        <td className="px-4 py-4">
                                            <span
                                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${getApprovalBadge(
                                                    rec.approvalStatus
                                                )}`}
                                            >
                                                {rec.approvalStatus || "Pending"}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-xs text-slate-500">
                                            {rec.markedBy?.name || rec.markedSource || "System"}
                                        </td>
                                        <td className="px-4 py-4 text-right">
                                            {rec.labourId?._id && (
                                                <Link
                                                    to={`/LabourDetail/${rec.labourId._id}`}
                                                    className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800"
                                                >
                                                    History <ArrowUpRight className="w-3.5 h-3.5" />
                                                </Link>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

/* =========================================================================
   2. PROJECT SUMMARY REPORT (Section 23.2)
   ========================================================================= */
function ProjectWorkforceReport({ projects, selectedProjectId, setSelectedProjectId, downloadCSV }) {
    const todayStr = new Date().toISOString().split("T")[0];
    const [selectedDate, setSelectedDate] = useState(todayStr);

    const { data, isLoading, refetch, isFetching } = useSummaryReportQuery(
        { projectId: selectedProjectId, date: selectedDate },
        { skip: !selectedProjectId }
    );

    const summary = data?.summary || {};
    const totalLabours = summary.totalLabours || 0;
    const present = summary.present || 0;
    const absent = summary.absent || 0;
    const halfDay = summary.halfDay || 0;
    const notMarked = summary.notMarked || 0;

    const presentPct = totalLabours > 0 ? Math.round((present / totalLabours) * 100) : 0;
    const absentPct = totalLabours > 0 ? Math.round((absent / totalLabours) * 100) : 0;
    const halfDayPct = totalLabours > 0 ? Math.round((halfDay / totalLabours) * 100) : 0;

    const handleExport = () => {
        const rows = [
            {
                Project: projects.find((p) => p._id === selectedProjectId)?.projectName || selectedProjectId,
                Date: selectedDate,
                TotalLabours: totalLabours,
                Present: present,
                HalfDay: halfDay,
                Absent: absent,
                NotMarked: notMarked,
                OvertimeHours: summary.overtimeHours || 0,
                TotalLabourCost: summary.totalLabourCost || 0,
                PendingApprovals: summary.pendingApproval || 0,
                ApprovedRecords: summary.approved || 0
            }
        ];
        downloadCSV(`Project_Summary_${selectedDate}.csv`, rows);
    };

    return (
        <div className="space-y-6">
            {/* Filter Bar */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                            Project
                        </label>
                        <select
                            value={selectedProjectId}
                            onChange={(e) => setSelectedProjectId(e.target.value)}
                            className="bg-slate-50 border border-slate-200 text-slate-800 text-sm font-medium rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none min-w-[220px]"
                        >
                            {projects.map((p) => (
                                <option key={p._id} value={p._id}>
                                    {p.projectName || p.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                            Report Date
                        </label>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="bg-slate-50 border border-slate-200 text-slate-800 text-sm font-medium rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>

                    <button
                        onClick={() => refetch()}
                        disabled={isFetching}
                        className="self-end mb-0.5 p-2.5 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                        title="Refresh"
                    >
                        <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
                    </button>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={handleExport}
                        className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl shadow-sm transition"
                    >
                        <Download className="w-4 h-4 text-slate-500" />
                        Export Summary
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-400">
                    Loading project summary...
                </div>
            ) : (
                <>
                    {/* Big Summary Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-slate-500">Active Labour Assigned</span>
                                <span className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
                                    <Users className="w-5 h-5" />
                                </span>
                            </div>
                            <div className="text-3xl font-extrabold text-slate-900 mt-2">{totalLabours}</div>
                            <div className="text-xs text-slate-400 mt-1">Single source of truth via LabourAssignment</div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-slate-500">Present Rate</span>
                                <span className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
                                    <CheckCircle2 className="w-5 h-5" />
                                </span>
                            </div>
                            <div className="text-3xl font-extrabold text-emerald-600 mt-2">{presentPct}%</div>
                            <div className="text-xs text-emerald-700 mt-1">{present} workers attended today</div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-slate-500">Overtime Hours</span>
                                <span className="p-2.5 rounded-xl bg-purple-50 text-purple-600">
                                    <Clock className="w-5 h-5" />
                                </span>
                            </div>
                            <div className="text-3xl font-extrabold text-purple-700 mt-2">
                                {summary.overtimeHours || 0} hrs
                            </div>
                            <div className="text-xs text-slate-400 mt-1">Calculated via overtime rules</div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-slate-500">Total Labour Cost</span>
                                <span className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
                                    <DollarSign className="w-5 h-5" />
                                </span>
                            </div>
                            <div className="text-3xl font-extrabold text-slate-900 mt-2">
                                {formatCurrency(summary.totalLabourCost)}
                            </div>
                            <div className="text-xs text-slate-400 mt-1">Authoritative wage sum for the day</div>
                        </div>
                    </div>

                    {/* Progress Distribution Card */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-bold text-slate-900">Attendance Distribution</h3>
                            <span className="text-xs font-semibold text-slate-400">
                                {totalLabours} total assigned workers
                            </span>
                        </div>

                        {/* Multi-segment bar */}
                        <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden flex">
                            <div
                                style={{ width: `${presentPct}%` }}
                                className="bg-emerald-500 h-full transition-all"
                                title={`Present: ${present}`}
                            />
                            <div
                                style={{ width: `${halfDayPct}%` }}
                                className="bg-amber-400 h-full transition-all"
                                title={`Half-Day: ${halfDay}`}
                            />
                            <div
                                style={{ width: `${absentPct}%` }}
                                className="bg-rose-500 h-full transition-all"
                                title={`Absent: ${absent}`}
                            />
                        </div>

                        {/* Breakdown pills */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                                <div>
                                    <div className="text-xs text-slate-500">Present</div>
                                    <div className="text-base font-bold text-slate-800">
                                        {present} ({presentPct}%)
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                                <span className="w-3 h-3 rounded-full bg-amber-400" />
                                <div>
                                    <div className="text-xs text-slate-500">Half Day</div>
                                    <div className="text-base font-bold text-slate-800">
                                        {halfDay} ({halfDayPct}%)
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                                <span className="w-3 h-3 rounded-full bg-rose-500" />
                                <div>
                                    <div className="text-xs text-slate-500">Absent</div>
                                    <div className="text-base font-bold text-slate-800">
                                        {absent} ({absentPct}%)
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                                <span className="w-3 h-3 rounded-full bg-slate-300" />
                                <div>
                                    <div className="text-xs text-slate-500">Not Marked</div>
                                    <div className="text-base font-bold text-slate-800">{notMarked}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

/* =========================================================================
   3. ATTENDANCE MASTER REPORT (Section 23.4)
   ========================================================================= */
function AttendanceMasterReport({ projects, labours, selectedProjectId, setSelectedProjectId, downloadCSV }) {
    const [selectedLabourId, setSelectedLabourId] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [approvalFilter, setApprovalFilter] = useState("");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [page, setPage] = useState(1);
    const limit = 20;

    const queryParams = useMemo(() => {
        const p = { page, limit };
        if (selectedProjectId) p.projectId = selectedProjectId;
        if (selectedLabourId) p.labourId = selectedLabourId;
        if (statusFilter) p.status = statusFilter;
        if (approvalFilter) p.approvalStatus = approvalFilter;
        if (fromDate) p.dateFrom = fromDate;
        if (toDate) p.dateTo = toDate;
        return p;
    }, [page, selectedProjectId, selectedLabourId, statusFilter, approvalFilter, fromDate, toDate]);

    const { data, isLoading, refetch, isFetching } = useGetLabourAttendanceRecordsQuery(queryParams);

    const items = data?.data?.items || data?.items || [];
    const pagination = data?.data?.pagination || data?.pagination || {};
    const summary = data?.data?.summary || data?.summary || {};

    const handleExport = () => {
        const rows = items.map((r) => ({
            Date: formatDate(r.date),
            Project: r.projectId?.projectName || "—",
            Labour: r.labourId?.name || "—",
            Phone: r.labourId?.phone || "—",
            Category: r.labourId?.category || "—",
            Status: r.status,
            CheckIn: r.checkInTime || "—",
            CheckOut: r.checkOutTime || "—",
            RegularHours: r.regularHours || 0,
            OvertimeHours: r.overtimeHours || 0,
            WageAmount: r.dailyWageAmount || 0,
            ApprovalStatus: r.approvalStatus || "Pending",
            MarkedBy: r.markedBy?.name || "—"
        }));
        downloadCSV("Attendance_Master_Report.csv", rows);
    };

    return (
        <div className="space-y-6">
            {/* Filter Panel */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                            Project
                        </label>
                        <select
                            value={selectedProjectId}
                            onChange={(e) => {
                                setSelectedProjectId(e.target.value);
                                setPage(1);
                            }}
                            className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm font-medium rounded-xl px-3 py-2 outline-none"
                        >
                            <option value="">All Projects</option>
                            {projects.map((p) => (
                                <option key={p._id} value={p._id}>
                                    {p.projectName || p.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                            Labour
                        </label>
                        <select
                            value={selectedLabourId}
                            onChange={(e) => {
                                setSelectedLabourId(e.target.value);
                                setPage(1);
                            }}
                            className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm font-medium rounded-xl px-3 py-2 outline-none"
                        >
                            <option value="">All Labours</option>
                            {labours.map((l) => (
                                <option key={l._id} value={l._id}>
                                    {l.name} {l.phone ? `(${l.phone})` : ""}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                            Attendance Status
                        </label>
                        <select
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value);
                                setPage(1);
                            }}
                            className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm font-medium rounded-xl px-3 py-2 outline-none"
                        >
                            <option value="">All Statuses</option>
                            <option value="Present">Present</option>
                            <option value="Half-Day">Half-Day</option>
                            <option value="Absent">Absent</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                            Approval Status
                        </label>
                        <select
                            value={approvalFilter}
                            onChange={(e) => {
                                setApprovalFilter(e.target.value);
                                setPage(1);
                            }}
                            className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm font-medium rounded-xl px-3 py-2 outline-none"
                        >
                            <option value="">All Approvals</option>
                            <option value="Pending">Pending</option>
                            <option value="Approved">Approved</option>
                            <option value="Rejected">Rejected</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                            From Date
                        </label>
                        <input
                            type="date"
                            value={fromDate}
                            onChange={(e) => {
                                setFromDate(e.target.value);
                                setPage(1);
                            }}
                            className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm font-medium rounded-xl px-3 py-2 outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                            To Date
                        </label>
                        <input
                            type="date"
                            value={toDate}
                            onChange={(e) => {
                                setToDate(e.target.value);
                                setPage(1);
                            }}
                            className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm font-medium rounded-xl px-3 py-2 outline-none"
                        />
                    </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <div className="text-xs text-slate-500">
                        Found <span className="font-bold text-slate-800">{pagination.total || items.length}</span> matching records
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => {
                                setSelectedLabourId("");
                                setStatusFilter("");
                                setApprovalFilter("");
                                setFromDate("");
                                setToDate("");
                                setPage(1);
                            }}
                            className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
                        >
                            Reset Filters
                        </button>
                        <button
                            onClick={handleExport}
                            disabled={items.length === 0}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg shadow-sm transition disabled:opacity-50"
                        >
                            <Download className="w-3.5 h-3.5" />
                            Export
                        </button>
                    </div>
                </div>
            </div>

            {/* Aggregation Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-center">
                    <div className="text-xl font-bold text-emerald-600">{summary.present || 0}</div>
                    <div className="text-xs text-slate-500 font-medium">Present Days</div>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-center">
                    <div className="text-xl font-bold text-amber-600">{summary.halfDay || 0}</div>
                    <div className="text-xs text-slate-500 font-medium">Half Days</div>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-center">
                    <div className="text-xl font-bold text-rose-600">{summary.absent || 0}</div>
                    <div className="text-xs text-slate-500 font-medium">Absent Days</div>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-center">
                    <div className="text-xl font-bold text-blue-600">{summary.overtimeHours || 0}h</div>
                    <div className="text-xs text-slate-500 font-medium">Total OT Hours</div>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-center">
                    <div className="text-xl font-bold text-purple-700">{formatCurrency(summary.approvedWages)}</div>
                    <div className="text-xs text-slate-500 font-medium">Approved Wages</div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                {isLoading ? (
                    <div className="p-12 text-center text-slate-400">Loading attendance records...</div>
                ) : items.length === 0 ? (
                    <div className="p-12 text-center text-slate-400">No records found matching filters</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 text-slate-600 uppercase text-[11px] font-bold tracking-wider border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-3.5">Date</th>
                                    <th className="px-4 py-3.5">Labour</th>
                                    <th className="px-4 py-3.5">Project</th>
                                    <th className="px-4 py-3.5">Status</th>
                                    <th className="px-4 py-3.5">Timings</th>
                                    <th className="px-4 py-3.5">Hours</th>
                                    <th className="px-4 py-3.5">Overtime</th>
                                    <th className="px-4 py-3.5">Wage</th>
                                    <th className="px-4 py-3.5">Approval</th>
                                    <th className="px-4 py-3.5 text-right">Profile</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {items.map((row) => (
                                    <tr key={row._id} className="hover:bg-slate-50 transition">
                                        <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">
                                            {formatDate(row.date)}
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="font-semibold text-slate-900">
                                                {row.labourId?.name || "Unknown"}
                                            </div>
                                            <div className="text-xs text-slate-400">
                                                {row.labourId?.phone || row.labourId?.category}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-xs font-medium text-slate-600">
                                            {row.projectId?.projectName || "—"}
                                        </td>
                                        <td className="px-4 py-4">
                                            <span
                                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${getStatusBadge(
                                                    row.status
                                                )}`}
                                            >
                                                {row.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-xs font-mono text-slate-500 whitespace-nowrap">
                                            {row.checkInTime ? `${row.checkInTime} → ${row.checkOutTime || "—"}` : "—"}
                                        </td>
                                        <td className="px-4 py-4 text-xs font-medium text-slate-700">
                                            {row.workingHours || row.regularHours || 0}h
                                        </td>
                                        <td className="px-4 py-4">
                                            {(row.overtimeHours || 0) > 0 ? (
                                                <span className="text-xs font-bold text-blue-600">
                                                    +{row.overtimeHours}h OT
                                                </span>
                                            ) : (
                                                <span className="text-xs text-slate-300">—</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-4 font-semibold text-slate-800">
                                            {formatCurrency(row.dailyWageAmount)}
                                        </td>
                                        <td className="px-4 py-4">
                                            <span
                                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${getApprovalBadge(
                                                    row.approvalStatus
                                                )}`}
                                            >
                                                {row.approvalStatus || "Pending"}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-right">
                                            {row.labourId?._id && (
                                                <Link
                                                    to={`/LabourDetail/${row.labourId._id}`}
                                                    className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800"
                                                >
                                                    View <ArrowUpRight className="w-3.5 h-3.5" />
                                                </Link>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {pagination.pages > 1 && (
                    <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                        <span>
                            Page {page} of {pagination.pages}
                        </span>
                        <div className="flex gap-2">
                            <button
                                disabled={page <= 1}
                                onClick={() => setPage((p) => p - 1)}
                                className="px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50"
                            >
                                Previous
                            </button>
                            <button
                                disabled={page >= pagination.pages}
                                onClick={() => setPage((p) => p + 1)}
                                className="px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

/* =========================================================================
   4. OVERTIME AUDIT REPORT (Section 23.5)
   ========================================================================= */
function OvertimeAuditReport({ projects, labours, selectedProjectId, setSelectedProjectId, downloadCSV }) {
    const [selectedLabourId, setSelectedLabourId] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");

    const queryParams = useMemo(() => {
        const p = {};
        if (selectedProjectId) p.project = selectedProjectId;
        if (selectedLabourId) p.labour = selectedLabourId;
        if (statusFilter) p.status = statusFilter;
        if (dateFrom) p.dateFrom = dateFrom;
        if (dateTo) p.dateTo = dateTo;
        return p;
    }, [selectedProjectId, selectedLabourId, statusFilter, dateFrom, dateTo]);

    const { data, isLoading } = useGetLabourOvertimeReportQuery(queryParams);

    const items = data?.data?.items || [];
    const summary = data?.data?.summary || {};

    const handleExport = () => {
        const rows = items.map((r) => ({
            Date: formatDate(r.date),
            Labour: r.labourId?.name || "—",
            Project: r.projectId?.projectName || "—",
            RegularHours: r.regularHours || 0,
            OvertimeHours: r.overtimeHours || 0,
            OvertimeRate: r.overtimeRate || 0,
            OvertimeAmount: r.overtimeAmount || 0,
            ApprovalStatus: r.overtimeApprovalStatus || r.approvalStatus || "Pending"
        }));
        downloadCSV("Labour_Overtime_Report.csv", rows);
    };

    return (
        <div className="space-y-6">
            {/* Filter Panel */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                            Project
                        </label>
                        <select
                            value={selectedProjectId}
                            onChange={(e) => setSelectedProjectId(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm font-medium rounded-xl px-3 py-2 outline-none"
                        >
                            <option value="">All Projects</option>
                            {projects.map((p) => (
                                <option key={p._id} value={p._id}>
                                    {p.projectName || p.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                            Labour
                        </label>
                        <select
                            value={selectedLabourId}
                            onChange={(e) => setSelectedLabourId(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm font-medium rounded-xl px-3 py-2 outline-none"
                        >
                            <option value="">All Labours</option>
                            {labours.map((l) => (
                                <option key={l._id} value={l._id}>
                                    {l.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                            OT Approval Status
                        </label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm font-medium rounded-xl px-3 py-2 outline-none"
                        >
                            <option value="">All</option>
                            <option value="Pending">Pending</option>
                            <option value="Approved">Approved</option>
                            <option value="Rejected">Rejected</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                            From Date
                        </label>
                        <input
                            type="date"
                            value={dateFrom}
                            onChange={(e) => setDateFrom(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm font-medium rounded-xl px-3 py-2 outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                            To Date
                        </label>
                        <input
                            type="date"
                            value={dateTo}
                            onChange={(e) => setDateTo(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm font-medium rounded-xl px-3 py-2 outline-none"
                        />
                    </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <span className="text-xs text-slate-500">
                        Total Overtime Records: <span className="font-bold text-slate-800">{items.length}</span>
                    </span>
                    <button
                        onClick={handleExport}
                        disabled={items.length === 0}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg shadow-sm transition disabled:opacity-50"
                    >
                        <Download className="w-3.5 h-3.5" />
                        Export Overtime CSV
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                            Total Overtime Hours
                        </div>
                        <div className="text-3xl font-extrabold text-blue-600 mt-1">
                            {summary.totalOvertimeHours || 0} hrs
                        </div>
                    </div>
                    <span className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                        <Clock className="w-6 h-6" />
                    </span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                            Total Overtime Cost
                        </div>
                        <div className="text-3xl font-extrabold text-purple-700 mt-1">
                            {formatCurrency(summary.totalOvertimeAmount)}
                        </div>
                    </div>
                    <span className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                        <DollarSign className="w-6 h-6" />
                    </span>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                {isLoading ? (
                    <div className="p-12 text-center text-slate-400">Loading overtime records...</div>
                ) : items.length === 0 ? (
                    <div className="p-12 text-center text-slate-400">No overtime records match filters</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 text-slate-600 uppercase text-[11px] font-bold tracking-wider border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-3.5">Date</th>
                                    <th className="px-4 py-3.5">Labour</th>
                                    <th className="px-4 py-3.5">Project</th>
                                    <th className="px-4 py-3.5">Regular Hrs</th>
                                    <th className="px-4 py-3.5">OT Hrs</th>
                                    <th className="px-4 py-3.5">OT Rate</th>
                                    <th className="px-4 py-3.5">OT Amount</th>
                                    <th className="px-4 py-3.5">Status</th>
                                    <th className="px-4 py-3.5 text-right">Details</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {items.map((row) => (
                                    <tr key={row._id} className="hover:bg-slate-50 transition">
                                        <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">
                                            {formatDate(row.date)}
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="font-semibold text-slate-900">
                                                {row.labourId?.name || "Unknown"}
                                            </div>
                                            <div className="text-xs text-slate-400">
                                                {row.labourId?.category || "Labour"}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-xs font-medium text-slate-600">
                                            {row.projectId?.projectName || "—"}
                                        </td>
                                        <td className="px-4 py-4 text-xs text-slate-600">{row.regularHours || 0}h</td>
                                        <td className="px-4 py-4 text-sm font-bold text-blue-600">
                                            {row.overtimeHours || 0}h
                                        </td>
                                        <td className="px-4 py-4 text-xs text-slate-600">
                                            ₹{row.overtimeRatePerHour || row.overtimeRate || 0}/h
                                        </td>
                                        <td className="px-4 py-4 font-bold text-slate-800">
                                            {formatCurrency(row.overtimeAmount)}
                                        </td>
                                        <td className="px-4 py-4">
                                            <span
                                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${getApprovalBadge(
                                                    row.overtimeApprovalStatus || row.approvalStatus
                                                )}`}
                                            >
                                                {row.overtimeApprovalStatus || row.approvalStatus || "Pending"}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-right">
                                            {row.labourId?._id && (
                                                <Link
                                                    to={`/LabourDetail/${row.labourId._id}`}
                                                    className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800"
                                                >
                                                    View <ArrowUpRight className="w-3.5 h-3.5" />
                                                </Link>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

/* =========================================================================
   5. LABOUR HISTORY REPORT (Section 23.3)
   ========================================================================= */
function LabourHistoryReport({ labours, downloadCSV }) {
    const [selectedLabourId, setSelectedLabourId] = useState(
        () => (labours.length > 0 ? labours[0]._id : "")
    );

    const { data, isLoading } = useGetLabourFullHistoryQuery(selectedLabourId, {
        skip: !selectedLabourId
    });

    const labour = data?.labour || {};
    const attendance = data?.attendance || [];
    const assignments = data?.assignments || [];

    const stats = useMemo(() => {
        const totalDays = attendance.length;
        const present = attendance.filter((a) => a.status === "Present").length;
        const halfDay = attendance.filter((a) => a.status === "Half-Day").length;
        const absent = attendance.filter((a) => a.status === "Absent").length;
        const totalHours = attendance.reduce((s, a) => s + (a.workingHours || a.regularHours || 0), 0);
        const totalOT = attendance.reduce((s, a) => s + (a.overtimeHours || 0), 0);
        const totalWages = attendance.reduce((s, a) => s + (a.dailyWageAmount || a.totalAmount || 0), 0);
        return { totalDays, present, halfDay, absent, totalHours, totalOT, totalWages };
    }, [attendance]);

    const handleExport = () => {
        const rows = attendance.map((a) => ({
            Date: formatDate(a.date),
            Project: a.projectId?.projectName || "—",
            Status: a.status,
            CheckIn: a.checkInTime || "—",
            CheckOut: a.checkOutTime || "—",
            Hours: a.workingHours || a.regularHours || 0,
            Overtime: a.overtimeHours || 0,
            WageAmount: a.dailyWageAmount || a.totalAmount || 0,
            ApprovalStatus: a.approvalStatus || "Pending"
        }));
        downloadCSV(`History_${labour.name || "Labour"}.csv`, rows);
    };

    return (
        <div className="space-y-6">
            {/* Labour Picker */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="w-full sm:w-80">
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                        Select Labour Worker
                    </label>
                    <select
                        value={selectedLabourId}
                        onChange={(e) => setSelectedLabourId(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm font-medium rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                        {labours.map((l) => (
                            <option key={l._id} value={l._id}>
                                {l.name} — {l.category || "Labour"} ({l.phone || "No phone"})
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex items-center gap-3">
                    {selectedLabourId && (
                        <Link
                            to={`/LabourDetail/${selectedLabourId}`}
                            className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition"
                        >
                            Open 7-Tab Profile <ArrowUpRight className="w-4 h-4" />
                        </Link>
                    )}
                    <button
                        onClick={handleExport}
                        disabled={attendance.length === 0}
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl shadow-sm transition disabled:opacity-50"
                    >
                        <Download className="w-4 h-4 text-slate-500" />
                        Export CSV
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-400">
                    Loading history...
                </div>
            ) : !selectedLabourId ? (
                <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-400">
                    Please select a worker to inspect their complete cross-project history
                </div>
            ) : (
                <>
                    {/* Worker Overview Card */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white font-bold text-xl flex items-center justify-center shadow-md">
                                {labour.name ? labour.name.charAt(0).toUpperCase() : "L"}
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">{labour.name}</h2>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    {labour.fatherName ? `S/o ${labour.fatherName} • ` : ""}
                                    {labour.category || "Labour"} • {labour.labourType || "Contract"} • Daily Wage: ₹
                                    {labour.dailyWage || 0}
                                </p>
                                <div className="flex items-center gap-2 mt-2">
                                    <span
                                        className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                                            labour.status === "Active"
                                                ? "bg-emerald-100 text-emerald-800"
                                                : "bg-rose-100 text-rose-800"
                                        }`}
                                    >
                                        Employment: {labour.status || "Active"}
                                    </span>
                                    <span
                                        className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                                            labour.isAssigned
                                                ? "bg-blue-100 text-blue-800"
                                                : "bg-slate-100 text-slate-700"
                                        }`}
                                    >
                                        {labour.isAssigned ? "Assigned" : "Unassigned"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Lifetime KPI pills */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
                                <div className="text-lg font-bold text-slate-800">{stats.totalDays}</div>
                                <div className="text-[11px] text-slate-500 font-medium">Recorded Days</div>
                            </div>
                            <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-100 text-center">
                                <div className="text-lg font-bold text-emerald-700">{stats.present}</div>
                                <div className="text-[11px] text-emerald-700 font-medium">Present</div>
                            </div>
                            <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-100 text-center">
                                <div className="text-lg font-bold text-blue-700">{stats.totalOT}h</div>
                                <div className="text-[11px] text-blue-700 font-medium">Overtime</div>
                            </div>
                            <div className="p-3 rounded-xl bg-purple-50/50 border border-purple-100 text-center">
                                <div className="text-lg font-bold text-purple-700">
                                    {formatCurrency(stats.totalWages)}
                                </div>
                                <div className="text-[11px] text-purple-700 font-medium">Total Wages</div>
                            </div>
                        </div>
                    </div>

                    {/* Historical Table */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="font-bold text-slate-900">Historical Attendance Entries</h3>
                            <span className="text-xs text-slate-400 font-medium">
                                Cross-project attendance partition
                            </span>
                        </div>

                        {attendance.length === 0 ? (
                            <div className="p-12 text-center text-slate-400">
                                No attendance records found for this worker
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50 text-slate-600 uppercase text-[11px] font-bold tracking-wider border-b border-slate-100">
                                        <tr>
                                            <th className="px-6 py-3.5">Date</th>
                                            <th className="px-4 py-3.5">Project</th>
                                            <th className="px-4 py-3.5">Status</th>
                                            <th className="px-4 py-3.5">Punch Timings</th>
                                            <th className="px-4 py-3.5">Regular Hrs</th>
                                            <th className="px-4 py-3.5">OT Hrs</th>
                                            <th className="px-4 py-3.5">Wage Amount</th>
                                            <th className="px-4 py-3.5">Approval</th>
                                            <th className="px-4 py-3.5">Source</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {attendance.map((rec) => (
                                            <tr key={rec._id} className="hover:bg-slate-50 transition">
                                                <td className="px-6 py-4 font-semibold text-slate-900 whitespace-nowrap">
                                                    {formatDate(rec.date)}
                                                </td>
                                                <td className="px-4 py-4 text-xs font-semibold text-slate-700">
                                                    {rec.projectId?.projectName || "—"}
                                                </td>
                                                <td className="px-4 py-4">
                                                    <span
                                                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${getStatusBadge(
                                                            rec.status
                                                        )}`}
                                                    >
                                                        {rec.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4 text-xs font-mono text-slate-600 whitespace-nowrap">
                                                    {rec.checkInTime
                                                        ? `${rec.checkInTime} → ${rec.checkOutTime || "—"}`
                                                        : "—"}
                                                </td>
                                                <td className="px-4 py-4 text-xs font-medium text-slate-700">
                                                    {rec.workingHours || rec.regularHours || 0}h
                                                </td>
                                                <td className="px-4 py-4">
                                                    {(rec.overtimeHours || 0) > 0 ? (
                                                        <span className="text-xs font-bold text-blue-600">
                                                            +{rec.overtimeHours}h OT
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs text-slate-300">—</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-4 font-semibold text-slate-800">
                                                    {formatCurrency(rec.dailyWageAmount || rec.totalAmount || 0)}
                                                </td>
                                                <td className="px-4 py-4">
                                                    <span
                                                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${getApprovalBadge(
                                                            rec.approvalStatus
                                                        )}`}
                                                    >
                                                        {rec.approvalStatus || "Pending"}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4 text-xs text-slate-500">
                                                    {rec.markedSource || "System"}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
