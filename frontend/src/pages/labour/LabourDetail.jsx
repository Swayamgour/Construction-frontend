import React, { useState } from "react";
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
  TrendingUp,
  BarChart3,
  Download,
  Filter,
  Search,
  CheckCircle,
  XCircle,
  PlayCircle,
  Square
} from "lucide-react";
import { BiRupee } from "react-icons/bi";

const LabourDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const { data, isLoading, isError } = useGetLabourByIdQuery(id);

  // Mock attendance data - replace with actual API data
  const attendanceData = [
    { date: "2024-01-15", punchIn: "08:00 AM", punchOut: "05:00 PM", status: "Present", hours: 9, project: "Site A" },
    { date: "2024-01-14", punchIn: "08:15 AM", punchOut: "05:30 PM", status: "Present", hours: 9.25, project: "Site B" },
    { date: "2024-01-13", punchIn: "-", punchOut: "-", status: "Absent", hours: 0, project: "-" },
    { date: "2024-01-12", punchIn: "09:00 AM", punchOut: "06:00 PM", status: "Present", hours: 9, project: "Site A" },
    { date: "2024-01-11", punchIn: "08:30 AM", punchOut: "04:45 PM", status: "Half Day", hours: 8.25, project: "Site C" },
  ];

  const labour = data;

  if (isLoading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
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
          <button
            onClick={() => navigate(-1)}
            className="text-blue-600 hover:text-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );

  if (isEditing) {
    return (
      <LabourForm
        labourId={id}
        onClose={() => setIsEditing(false)}
        onSave={() => setIsEditing(false)}
      />
    );
  }

  const getWage = () => {
    if (labour.wageType === "Daily") return `₹${labour.dailyWage}/day`;
    return `₹${labour.monthlySalary}/month`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Present": return "text-green-600 bg-green-50";
      case "Absent": return "text-red-600 bg-red-50";
      case "Half Day": return "text-orange-600 bg-orange-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  const getInitials = (name) => {
    return name?.split(" ").map((n) => n[0]).join("").toUpperCase() || "U";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 py-8 px-4">
      <div className="max-w-7xl mx-auto">

        {/* 🔙 Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6 group transition-all duration-200"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          Back to Labour List
        </button>

        {/* 🧾 Header Card */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-8 border border-gray-100">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 text-white text-2xl flex items-center justify-center font-bold shadow-lg">
                  {getInitials(labour.name)}
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white"></div>
              </div>

              <div>
                <h1 className="text-4xl font-bold text-gray-800 mb-2">{labour.name}</h1>
                <div className="flex flex-wrap items-center gap-4">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                    {labour.labourType}
                  </span>
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium flex items-center gap-1">
                    <BiRupee className="text-lg" />
                    {getWage()}
                  </span>
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                    {labour.skillLevel}
                  </span>
                </div>
              </div>
            </div>

            {/* ✏️ Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setIsEditing(true)}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl flex items-center gap-2 transition-all duration-200 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
              >
                <Edit size={18} /> Edit Profile
              </button>

              <button className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl flex items-center gap-2 transition-all duration-200 shadow-lg shadow-red-500/25 hover:shadow-red-500/40">
                <Trash2 size={18} /> Delete
              </button>
            </div>
          </div>
        </div>

        {/* 📊 Navigation Tabs */}
        <div className="bg-white rounded-2xl shadow-lg mb-8 border border-gray-100">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab("overview")}
              className={`flex-1 py-4 px-6 text-center font-medium transition-all duration-200 ${activeTab === "overview"
                ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50/50"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
            >
              <User className="w-4 h-4 inline mr-2" />
              Overview
            </button>
            <button
              onClick={() => setActiveTab("attendance")}
              className={`flex-1 py-4 px-6 text-center font-medium transition-all duration-200 ${activeTab === "attendance"
                ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50/50"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
            >
              <Clock className="w-4 h-4 inline mr-2" />
              Attendance
            </button>
            {/* <button
              onClick={() => setActiveTab("performance")}
              className={`flex-1 py-4 px-6 text-center font-medium transition-all duration-200 ${activeTab === "performance"
                  ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50/50"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
            >
              <TrendingUp className="w-4 h-4 inline mr-2" />
              Performance
            </button> */}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === "overview" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 👤 Personal Info */}
                <div className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-2xl border border-gray-200">
                  <h2 className="text-xl font-semibold mb-6 flex items-center gap-3 text-gray-800">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    Personal Information
                  </h2>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="font-medium">{labour.phone}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100">
                      <User className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Gender & Age</p>
                        <p className="font-medium">
                          {labour.gender || "Not Provided"} {labour.age && `• ${labour.age} years`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Address</p>
                        <p className="font-medium">{labour.address}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100">
                      <IdCard className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Aadhaar Number</p>
                        <p className="font-medium">{labour.aadhaarNumber || "Not Provided"}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 💼 Employment Info */}
                <div className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-2xl border border-gray-200">
                  <h2 className="text-xl font-semibold mb-6 flex items-center gap-3 text-gray-800">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Briefcase className="w-5 h-5 text-green-600" />
                    </div>
                    Employment Details
                  </h2>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-white rounded-xl border border-gray-100">
                        <p className="text-sm text-gray-500">Category</p>
                        <p className="font-medium">{labour.category}</p>
                      </div>
                      <div className="p-3 bg-white rounded-xl border border-gray-100">
                        <p className="text-sm text-gray-500">Wage Type</p>
                        <p className="font-medium">{labour.wageType}</p>
                      </div>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-gray-100">
                      <p className="text-sm text-gray-500 mb-2">Assigned Projects</p>
                      {labour.assignedProjects?.length ? (
                        <div className="flex flex-wrap gap-2">
                          {labour.assignedProjects?.map((p, i) => (
                            <span key={i} className="px-3 py-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs rounded-lg font-medium">
                              {p.projectName || "Project"}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-sm">Not Assigned to any project</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "attendance" && (
              <div className="space-y-6">
                {/* 📈 Attendance Summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-2xl border border-green-200">
                    <p className="text-sm text-green-600 font-medium">Present</p>
                    <p className="text-2xl font-bold text-green-700">18</p>
                    <p className="text-xs text-green-600">This Month</p>
                  </div>
                  <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-2xl border border-red-200">
                    <p className="text-sm text-red-600 font-medium">Absent</p>
                    <p className="text-2xl font-bold text-red-700">2</p>
                    <p className="text-xs text-red-600">This Month</p>
                  </div>
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-2xl border border-orange-200">
                    <p className="text-sm text-orange-600 font-medium">Half Days</p>
                    <p className="text-2xl font-bold text-orange-700">1</p>
                    <p className="text-xs text-orange-600">This Month</p>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-2xl border border-blue-200">
                    <p className="text-sm text-blue-600 font-medium">Avg. Hours</p>
                    <p className="text-2xl font-bold text-blue-700">8.5</p>
                    <p className="text-xs text-blue-600">Daily Average</p>
                  </div>
                </div>

                {/* 🎛️ Attendance Controls */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  {/* <div className="flex gap-3">
                    <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl flex items-center gap-2 transition-all duration-200">
                      <PlayCircle className="w-4 h-4" />
                      Punch In
                    </button>
                    <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl flex items-center gap-2 transition-all duration-200">
                      <Square className="w-4 h-4" />
                      Punch Out
                    </button>
                  </div> */}

                  <div className="flex gap-3 md:w-auto w-full flex-wrap">
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search dates..."
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <button className="px-4 py-2 border border-gray-300 rounded-xl flex items-center gap-2 hover:bg-gray-50 transition-all duration-200">
                      <Filter className="w-4 h-4" />
                      Filter
                    </button>
                    <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center gap-2 transition-all duration-200">
                      <Download className="w-4 h-4" />
                      Export
                    </button>
                  </div>
                </div>

                {/* 📋 Attendance Table */}
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                  <tbody>
                    {labour.attendanceHistory?.length > 0 ? (
                      labour.attendanceHistory.map((record, index) => (
                        <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">

                          {/* 📅 Date */}
                          <td className="p-4 font-medium text-gray-800">
                            {new Date(record.date).toLocaleDateString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </td>

                          {/* 🏗 Project Name */}
                          <td className="p-4">
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                              {labour.assignedProjects?.find(p => p._id === record.projectId)?.projectName || "N/A"}
                            </span>
                          </td>

                          {/* ⏱ Punch In (Not Available) */}
                          <td className="p-4 font-medium">-</td>

                          {/* ⏱ Punch Out (Not Available) */}
                          <td className="p-4 font-medium">-</td>

                          {/* ⏳ Hours (Not Available) */}
                          <td className="p-4">
                            <span className="font-bold text-gray-500"> - </span>
                          </td>

                          {/* ✔ Status */}
                          <td className="p-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                              {record.status}
                            </span>
                          </td>

                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="p-4 text-center text-gray-500">
                          No attendance records found
                        </td>
                      </tr>
                    )}
                  </tbody>

                </div>
              </div>
            )}

            {activeTab === "performance" && (
              <div className="text-center py-12">
                <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">Performance Analytics</h3>
                <p className="text-gray-500">Detailed performance metrics and analytics coming soon...</p>
              </div>
            )}
          </div>
        </div>

        {/* 🖥 System Info */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-3 text-gray-800">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Calendar className="w-5 h-5 text-gray-600" />
            </div>
            System Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="text-sm text-gray-500 mb-1">Created At</p>
              <p className="font-medium text-gray-800">
                {new Date(labour.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="text-sm text-gray-500 mb-1">Updated At</p>
              <p className="font-medium text-gray-800">
                {new Date(labour.updatedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="text-sm text-gray-500 mb-1">Labour ID</p>
              <p className="font-medium text-gray-800 text-sm font-mono">{labour._id}</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LabourDetail;