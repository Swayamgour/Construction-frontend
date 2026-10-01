import React, { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGetLabourByIdQuery } from "../../Reduxe/Api";
import LabourForm from "./LabourForm";
import {
  ArrowLeft,
  Edit,
  Trash2,
  User,
  Briefcase,
  Calendar,
  Clock,
  MapPin,
  Phone,
  IdCard,
  BarChart3,
  Download,
  Filter,
  CheckCircle,
  XCircle,
  PlayCircle,
  Square,
  Timer,
  Building2,
  Inbox,
} from "lucide-react";
import { BiRupee } from "react-icons/bi";
import { getInitials, getAvatarGradient } from "../../helper/avatar";

/** "HH:mm" strings (BulkAttendance/SingleMark flow) and full ISO datetimes
 *  (selfie punch-in flow) both show up in timeIn/timeOut — normalize both. */
const formatTime = (value) => {
  if (!value) return "—";
  if (/^\d{1,2}:\d{2}$/.test(value)) return value;
  const d = new Date(value);
  if (isNaN(d.getTime())) return value;
  return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
};

const formatDate = (value) => {
  const d = new Date(value);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const toCsvValue = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;

const TABS = [
  { id: "overview", label: "Overview", icon: User },
  { id: "attendance", label: "Attendance", icon: Clock },
  { id: "performance", label: "Performance", icon: BarChart3 },
];

const LabourDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [projectFilter, setProjectFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const { data, isLoading, isError } = useGetLabourByIdQuery(id);

  const labour = data;

  // attendanceHistory carries a raw projectId — resolve names from
  // assignedProjects (the only place project names are populated on this
  // response) so past project stints still show a readable name even
  // after the labour has since moved on.
  const projectNameById = useMemo(() => {
    const map = new Map();
    (labour?.assignedProjects || []).forEach((p) => map.set(p._id, p.projectName));
    return map;
  }, [labour]);

  const projectOptions = useMemo(() => {
    const map = new Map(projectNameById);
    (labour?.attendanceHistory || []).forEach((h) => {
      if (!map.has(h.projectId)) map.set(h.projectId, null);
    });
    return Array.from(map.entries()).map(([pid, name]) => ({ id: pid, name: name || "Unknown Project" }));
  }, [labour, projectNameById]);

  const sortedHistory = useMemo(
    () => [...(labour?.attendanceHistory || [])].sort((a, b) => new Date(b.date) - new Date(a.date)),
    [labour]
  );

  const filteredHistory = useMemo(() => {
    return sortedHistory.filter((h) => {
      if (projectFilter !== "all" && h.projectId !== projectFilter) return false;
      if (statusFilter !== "all" && h.status !== statusFilter) return false;
      return true;
    });
  }, [sortedHistory, projectFilter, statusFilter]);

  const totalOvertimeHours = useMemo(
    () => (labour?.attendanceHistory || []).reduce((sum, h) => sum + (h.overtimeHours || 0), 0),
    [labour]
  );

  const downloadCsv = () => {
    const header = ["Date", "Project", "Status", "Time In", "Time Out", "Overtime Hours"];
    const rows = filteredHistory.map((h) => [
      formatDate(h.date),
      projectNameById.get(h.projectId) || "Unknown Project",
      h.status,
      formatTime(h.timeIn),
      formatTime(h.timeOut),
      h.overtimeHours || 0,
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

  if (isLoading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading labour details...</p>
        </div>
      </div>
    );

  if (isError || !labour)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-red-600">
          <XCircle className="w-16 h-16 mx-auto mb-4" />
          <p className="text-lg font-semibold mb-2">Failed to load labour details</p>
          <button onClick={() => navigate(-1)} className="text-indigo-600 hover:text-indigo-700">
            Go Back
          </button>
        </div>
      </div>
    );

  if (isEditing) {
    return <LabourForm labourId={id} onClose={() => setIsEditing(false)} onSave={() => setIsEditing(false)} />;
  }

  const getWage = () => {
    if (labour.wageType === "Daily") return `₹${labour.dailyWage}/day`;
    return `₹${labour.monthlySalary}/month`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Present":
        return "text-emerald-600 bg-emerald-50";
      case "Absent":
        return "text-red-600 bg-red-50";
      case "Half-Day":
      case "Half Day":
        return "text-orange-600 bg-orange-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50/30 py-6 sm:py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6 group transition-all duration-200"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          Back to Labour List
        </button>

        {/* Header Card */}
        <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8 mb-8 border border-gray-100">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="flex items-center gap-5 sm:gap-6">
              <div className="relative shrink-0">
                <div
                  className={`w-20 h-20 rounded-2xl text-white text-2xl flex items-center justify-center font-bold shadow-lg bg-gradient-to-br ${getAvatarGradient(labour.name)}`}
                >
                  {getInitials(labour.name)}
                </div>
                <div
                  className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white ${
                    labour.status === "Active" ? "bg-emerald-500" : "bg-gray-400"
                  }`}
                  title={labour.status}
                />
              </div>

              <div className="min-w-0">
                <h1 className="text-2xl sm:text-4xl font-bold text-gray-800 mb-2 truncate">{labour.name}</h1>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs sm:text-sm font-medium">
                    {labour.labourType}
                  </span>
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs sm:text-sm font-medium flex items-center gap-1">
                    <BiRupee className="text-lg" />
                    {getWage()}
                  </span>
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs sm:text-sm font-medium">
                    {labour.skillLevel}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 w-full lg:w-auto">
              <button
                onClick={() => setIsEditing(true)}
                className="flex-1 lg:flex-none px-5 py-2.5 sm:px-6 sm:py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-xl flex items-center justify-center gap-2 transition-all duration-200 shadow-lg shadow-indigo-500/25"
              >
                <Edit size={18} /> Edit Profile
              </button>

              <button className="flex-1 lg:flex-none px-5 py-2.5 sm:px-6 sm:py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl flex items-center justify-center gap-2 transition-all duration-200 shadow-lg shadow-red-500/25">
                <Trash2 size={18} /> Delete
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-2xl shadow-lg mb-8 border border-gray-100">
          <div className="flex border-b border-gray-200 overflow-x-auto">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 min-w-[120px] py-4 px-6 text-center font-medium transition-all duration-200 whitespace-nowrap ${
                    activeTab === tab.id
                      ? "text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <Icon className="w-4 h-4 inline mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="p-4 sm:p-6">
            {activeTab === "overview" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                {/* Personal Info */}
                <div className="bg-gradient-to-br from-white to-gray-50 p-5 sm:p-6 rounded-2xl border border-gray-200">
                  <h2 className="text-lg sm:text-xl font-semibold mb-5 sm:mb-6 flex items-center gap-3 text-gray-800">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    Personal Information
                  </h2>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100">
                      <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500">Phone</p>
                        <p className="font-medium text-gray-800">{labour.phone}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100">
                      <User className="w-4 h-4 text-gray-400 shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500">Gender & Age</p>
                        <p className="font-medium text-gray-800">
                          {labour.gender || "Not Provided"} {labour.age && `• ${labour.age} years`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100">
                      <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500">Address</p>
                        <p className="font-medium text-gray-800">{labour.address}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100">
                      <IdCard className="w-4 h-4 text-gray-400 shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500">Aadhaar Number</p>
                        <p className="font-medium text-gray-800">{labour.aadhaarNumber || "Not Provided"}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Employment Info */}
                <div className="bg-gradient-to-br from-white to-gray-50 p-5 sm:p-6 rounded-2xl border border-gray-200">
                  <h2 className="text-lg sm:text-xl font-semibold mb-5 sm:mb-6 flex items-center gap-3 text-gray-800">
                    <div className="p-2 bg-emerald-100 rounded-lg">
                      <Briefcase className="w-5 h-5 text-emerald-600" />
                    </div>
                    Employment Details
                  </h2>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-white rounded-xl border border-gray-100">
                        <p className="text-xs text-gray-500">Category</p>
                        <p className="font-medium text-gray-800">{labour.category}</p>
                      </div>
                      <div className="p-3 bg-white rounded-xl border border-gray-100">
                        <p className="text-xs text-gray-500">Wage Type</p>
                        <p className="font-medium text-gray-800">{labour.wageType}</p>
                      </div>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-gray-100">
                      <p className="text-xs text-gray-500 mb-2">Assigned Projects</p>
                      {labour.assignedProjects?.length ? (
                        <div className="flex flex-wrap gap-2">
                          {labour.assignedProjects.map((p, i) => (
                            <span
                              key={p._id || i}
                              className="px-3 py-1 bg-gradient-to-r from-indigo-500 to-blue-600 text-white text-xs rounded-lg font-medium"
                            >
                              {p.projectName || "Project"}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-sm">Not assigned to any project</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "attendance" && (
              <>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4 mb-6">
                  <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-4 rounded-2xl border border-emerald-200">
                    <p className="text-sm text-emerald-600 font-medium">Present</p>
                    <p className="text-2xl font-bold text-emerald-700">{labour?.totalPresentDays || 0}</p>
                    <p className="text-xs text-emerald-600">Total Days</p>
                  </div>

                  <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-2xl border border-red-200">
                    <p className="text-sm text-red-600 font-medium">Absent</p>
                    <p className="text-2xl font-bold text-red-700">{labour?.totalAbsentDays || 0}</p>
                    <p className="text-xs text-red-600">Total Days</p>
                  </div>

                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-2xl border border-orange-200">
                    <p className="text-sm text-orange-600 font-medium">Half Days</p>
                    <p className="text-2xl font-bold text-orange-700">{labour?.totalHalfDays || 0}</p>
                    <p className="text-xs text-orange-600">Total Days</p>
                  </div>

                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-2xl border border-blue-200">
                    <p className="text-sm text-blue-600 font-medium">Total Records</p>
                    <p className="text-2xl font-bold text-blue-700">{labour?.totalAttendanceDays || 0}</p>
                    <p className="text-xs text-blue-600">Attendance Entries</p>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-2xl border border-purple-200 col-span-2 md:col-span-1">
                    <p className="text-sm text-purple-600 font-medium">Overtime</p>
                    <p className="text-2xl font-bold text-purple-700">{totalOvertimeHours.toFixed(2)}h</p>
                    <p className="text-xs text-purple-600">Across All Records</p>
                  </div>
                </div>

                {/* Filters + Export */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <Filter size={15} /> Filter:
                  </div>
                  <select
                    value={projectFilter}
                    onChange={(e) => setProjectFilter(e.target.value)}
                    className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white"
                  >
                    <option value="all">All Projects</option>
                    {projectOptions.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white"
                  >
                    <option value="all">All Statuses</option>
                    <option value="Present">Present</option>
                    <option value="Absent">Absent</option>
                    <option value="Half-Day">Half-Day</option>
                  </select>

                  <button
                    onClick={downloadCsv}
                    disabled={filteredHistory.length === 0}
                    className="sm:ml-auto flex items-center justify-center gap-2 text-sm px-4 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors"
                  >
                    <Download size={15} /> Export CSV
                  </button>
                </div>

                {/* Attendance History Table */}
                {filteredHistory.length === 0 ? (
                  <div className="text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    <Inbox className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">No attendance records found</p>
                    <p className="text-gray-400 text-sm">Try a different project or status filter.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-2xl border border-gray-200">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                        <tr>
                          <th className="text-left font-medium px-4 py-3">Date</th>
                          <th className="text-left font-medium px-4 py-3">Project</th>
                          <th className="text-left font-medium px-4 py-3">Status</th>
                          <th className="text-left font-medium px-4 py-3">Time In</th>
                          <th className="text-left font-medium px-4 py-3">Time Out</th>
                          <th className="text-left font-medium px-4 py-3">Overtime</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredHistory.map((h) => (
                          <tr key={h._id} className="border-t border-gray-100 hover:bg-gray-50/60 transition-colors">
                            <td className="px-4 py-3 flex items-center gap-2 text-gray-700">
                              <Calendar size={14} className="text-gray-400" />
                              {formatDate(h.date)}
                            </td>
                            <td className="px-4 py-3 text-gray-700">
                              <span className="flex items-center gap-1.5">
                                <Building2 size={14} className="text-gray-400" />
                                {projectNameById.get(h.projectId) || "Unknown Project"}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(h.status)}`}
                              >
                                {h.status === "Present" ? (
                                  <CheckCircle size={12} />
                                ) : h.status === "Absent" ? (
                                  <XCircle size={12} />
                                ) : (
                                  <Clock size={12} />
                                )}
                                {h.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-gray-600">
                              <span className="flex items-center gap-1.5">
                                <PlayCircle size={13} className="text-gray-400" /> {formatTime(h.timeIn)}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-gray-600">
                              <span className="flex items-center gap-1.5">
                                <Square size={12} className="text-gray-400" /> {formatTime(h.timeOut)}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              {h.overtimeHours > 0 ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700">
                                  <Timer size={12} /> {h.overtimeHours}h
                                </span>
                              ) : (
                                <span className="text-gray-400 text-xs">—</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}

            {activeTab === "performance" && (
              <div className="text-center py-12">
                <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">Performance Analytics</h3>
                <p className="text-gray-500">Detailed performance metrics and analytics coming soon...</p>
              </div>
            )}
          </div>
        </div>

        {/* System Info */}
        <div className="bg-white rounded-2xl shadow-lg p-5 sm:p-6 border border-gray-100">
          <h2 className="text-lg sm:text-xl font-semibold mb-5 sm:mb-6 flex items-center gap-3 text-gray-800">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Calendar className="w-5 h-5 text-gray-600" />
            </div>
            System Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="text-sm text-gray-500 mb-1">Created At</p>
              <p className="font-medium text-gray-800">
                {new Date(labour.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="text-sm text-gray-500 mb-1">Labour ID</p>
              <p className="font-medium text-gray-800 text-sm font-mono truncate">{labour._id}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LabourDetail;
