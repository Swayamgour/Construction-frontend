import React, { useState } from "react";
import toast from "react-hot-toast";
import { CheckCircle2, XCircle, Phone, HardHat, Gauge, Wallet, MapPin, Loader2, FolderKanban } from "lucide-react";
import {
  useGetProjectsQuery,
  useGetLaboursByProjectQuery,
  useBulkMarkLabourMutation,
} from "../../Reduxe/Api";
import { getInitials, getAvatarGradient } from "../../helper/avatar";

// NOTE: the project used to be hardcoded to a single fixed id, so this
// screen always marked attendance for the same project no matter who
// opened it. It's now a real dropdown backed by the projects list.
export default function BulkAttendance() {
  const { data: projectResp } = useGetProjectsQuery();
  const projects = projectResp?.data || projectResp || [];

  const [projectId, setProjectId] = useState("");
  const { data, isLoading } = useGetLaboursByProjectQuery(projectId, { skip: !projectId });
  const [bulkMark] = useBulkMarkLabourMutation();

  const [attendance, setAttendance] = useState([]);

  const setStatus = (labourId, status) => {
    setAttendance((prev) => {
      const exists = prev.find((p) => p.labourId === labourId);
      if (exists) {
        return prev.map((p) => (p.labourId === labourId ? { labourId, status } : p));
      }
      return [...prev, { labourId, status }];
    });
  };

  const selectAll = (status) => {
    const mapped = data.map((l) => ({ labourId: l._id, status }));
    setAttendance(mapped);
  };

  const submit = async () => {
    if (attendance.length === 0) return toast.error("Please select attendance");

    await bulkMark({ projectId, attendance });
    toast.success("Attendance submitted");
    setAttendance([]);
  };

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-5">Bulk Labour Attendance</h2>

      {/* Project selector */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm shadow-gray-200/60 p-4 mb-5">
        <div className="relative">
          <FolderKanban size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <select
            value={projectId}
            onChange={(e) => {
              setProjectId(e.target.value);
              setAttendance([]);
            }}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
          >
            <option value="">Select a project</option>
            {projects.map((p) => (
              <option key={p._id} value={p._id}>
                {p.projectName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {!projectId ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
          <FolderKanban className="mx-auto text-gray-300 mb-3" size={28} />
          <p className="text-gray-400 text-sm">Select a project to mark attendance.</p>
        </div>
      ) : isLoading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-500">
          <Loader2 className="animate-spin" size={22} />
          <p className="text-sm">Loading labour...</p>
        </div>
      ) : (
        <>
          {/* Top Buttons */}
          <div className="flex gap-3 mb-5">
            <button
              onClick={() => selectAll("Present")}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl font-medium shadow-md shadow-emerald-900/20 transition-all"
            >
              <CheckCircle2 size={16} /> Mark All Present
            </button>

            <button
              onClick={() => selectAll("Absent")}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl font-medium shadow-md shadow-red-900/20 transition-all"
            >
              <XCircle size={16} /> Mark All Absent
            </button>
          </div>

          {/* Labour List */}
          <div className="space-y-3">
            {data?.map((labour) => {
              const selected = attendance.find((a) => a.labourId === labour._id);

              return (
                <div
                  key={labour._id}
                  className="bg-white border border-gray-100 shadow-sm shadow-gray-200/60 p-4 rounded-2xl flex flex-col sm:flex-row justify-between sm:items-center gap-4"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      className={`w-11 h-11 shrink-0 rounded-xl flex items-center justify-center text-white font-semibold bg-gradient-to-br ${getAvatarGradient(labour.name)}`}
                    >
                      {getInitials(labour.name)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-800">{labour.name}</p>
                      <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-xs text-gray-500">
                        {labour.phone && (
                          <span className="flex items-center gap-1">
                            <Phone size={11} /> {labour.phone}
                          </span>
                        )}
                        {labour.labourType && (
                          <span className="flex items-center gap-1">
                            <HardHat size={11} /> {labour.labourType}
                          </span>
                        )}
                        {labour.skillLevel && (
                          <span className="flex items-center gap-1">
                            <Gauge size={11} /> {labour.skillLevel}
                          </span>
                        )}
                        {labour.wageType && (
                          <span className="flex items-center gap-1">
                            <Wallet size={11} /> {labour.wageType}
                            {labour.wageType === "Monthly" && ` — ₹${labour.monthlySalary}`}
                            {labour.wageType === "Daily" && ` — ₹${labour.dailyWage}`}
                          </span>
                        )}
                        {labour.address && (
                          <span className="flex items-center gap-1">
                            <MapPin size={11} /> {labour.address}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => setStatus(labour._id, "Present")}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                        selected?.status === "Present"
                          ? "bg-emerald-600 text-white shadow-md shadow-emerald-900/20"
                          : "border border-emerald-500 text-emerald-600 hover:bg-emerald-50"
                      }`}
                    >
                      Present
                    </button>

                    <button
                      onClick={() => setStatus(labour._id, "Absent")}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                        selected?.status === "Absent"
                          ? "bg-red-600 text-white shadow-md shadow-red-900/20"
                          : "border border-red-500 text-red-600 hover:bg-red-50"
                      }`}
                    >
                      Absent
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Submit */}
          <button
            onClick={submit}
            className="mt-6 w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white py-3 rounded-xl font-semibold shadow-lg shadow-indigo-900/20 transition-all"
          >
            Submit Attendance
          </button>
        </>
      )}
    </div>
  );
}
