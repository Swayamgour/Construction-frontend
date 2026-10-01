import React, { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Timer, CheckCircle2, AlertTriangle, FolderKanban, User2 } from "lucide-react";
import {
  useGetProjectsQuery,
  useGetLaboursByProjectQuery,
  useGetOvertimeSettingsQuery,
  useRecordLabourWorkingTimeMutation,
} from "../../Reduxe/Api";

const todayStr = () => new Date().toISOString().slice(0, 10);
const fieldCls =
  "mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all disabled:bg-gray-100 disabled:text-gray-400";

export default function RecordWorkingTime() {
  const { data: projectResp } = useGetProjectsQuery();
  const projects = projectResp?.data || projectResp || [];

  const [projectId, setProjectId] = useState("");
  const { data: laboursResp, isFetching: loadingLabours } = useGetLaboursByProjectQuery(projectId, { skip: !projectId });
  const labours = laboursResp?.data || (Array.isArray(laboursResp) ? laboursResp : []);

  const { data: settingsResp } = useGetOvertimeSettingsQuery(projectId || undefined, { skip: !projectId });
  const settings = settingsResp?.data || settingsResp;

  const [recordWorkingTime, { isLoading: isSaving }] = useRecordLabourWorkingTimeMutation();

  const [form, setForm] = useState({
    labourId: "",
    date: todayStr(),
    checkInTime: "",
    checkOutTime: "",
    status: "Present",
    remarks: "",
  });
  const [result, setResult] = useState(null);

  const selectedLabour = useMemo(() => labours.find((l) => l._id === form.labourId), [labours, form.labourId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!projectId) return toast.error("Select a project");
    if (!form.labourId) return toast.error("Select a labour");
    if (!form.checkInTime || !form.checkOutTime) return toast.error("Enter check-in and check-out time");

    try {
      const res = await recordWorkingTime({
        projectId,
        labourId: form.labourId,
        date: form.date,
        checkInTime: form.checkInTime,
        checkOutTime: form.checkOutTime,
        status: form.status,
        remarks: form.remarks,
      }).unwrap();
      setResult(res?.data || res);
      toast.success("Working time recorded");
    } catch (err) {
      toast.error(err?.data?.message || "Error recording working time");
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-blue-900/20">
          <Clock size={20} />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Record Working Time</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Log a check-in/check-out — regular and overtime hours calculate automatically.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm shadow-gray-200/60 p-5 sm:p-6 space-y-5">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-600 flex items-center gap-1.5">
              <FolderKanban size={13} /> Project
            </label>
            <select
              required
              value={projectId}
              onChange={(e) => {
                setProjectId(e.target.value);
                setForm((f) => ({ ...f, labourId: "" }));
                setResult(null);
              }}
              className={fieldCls}
            >
              <option value="">Select Project</option>
              {projects?.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.projectName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600 flex items-center gap-1.5">
              <User2 size={13} /> Labour
            </label>
            <select
              required
              value={form.labourId}
              onChange={(e) => setForm({ ...form, labourId: e.target.value })}
              disabled={!projectId || loadingLabours}
              className={fieldCls}
            >
              <option value="">{loadingLabours ? "Loading..." : "Select Labour"}</option>
              {labours.map((l) => (
                <option key={l._id} value={l._id}>
                  {l.name} ({l.phone})
                </option>
              ))}
            </select>
          </div>
        </div>

        <AnimatePresence>
          {settings && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-start gap-2 text-xs text-blue-700 bg-blue-50 border border-blue-100 rounded-xl px-3.5 py-3 overflow-hidden"
            >
              <Timer size={14} className="shrink-0 mt-0.5" />
              <span>
                Standard shift {settings.workStartTime}–{settings.workEndTime} ({settings.standardWorkingHours}h) ·
                overtime past {settings.workEndTime} at {settings.overtimeMultiplier}× rate
                {selectedLabour?.wageType === "Daily" && selectedLabour?.dailyWage
                  ? ` · hourly rate from daily wage ₹${selectedLabour.dailyWage}`
                  : ""}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-600">Date</label>
            <input
              type="date"
              value={form.date}
              max={todayStr()}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className={fieldCls}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Check-in</label>
            <input
              type="time"
              required
              value={form.checkInTime}
              onChange={(e) => setForm({ ...form, checkInTime: e.target.value })}
              className={fieldCls}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Check-out</label>
            <input
              type="time"
              required
              value={form.checkOutTime}
              onChange={(e) => setForm({ ...form, checkOutTime: e.target.value })}
              className={fieldCls}
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-600">Status</label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className={fieldCls}>
              <option value="Present">Present</option>
              <option value="Half-Day">Half-Day</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Remarks</label>
            <input
              type="text"
              value={form.remarks}
              onChange={(e) => setForm({ ...form, remarks: e.target.value })}
              placeholder="Optional"
              className={fieldCls}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white py-3 rounded-xl text-sm font-semibold shadow-lg shadow-indigo-900/20 disabled:opacity-60 transition-all"
        >
          {isSaving ? "Recording..." : "Record Working Time"}
        </button>
      </form>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-emerald-100 shadow-sm shadow-emerald-100/60 p-5 sm:p-6"
          >
            <h2 className="text-sm font-semibold text-emerald-700 mb-4 flex items-center gap-1.5">
              <CheckCircle2 size={16} /> Recorded — calculated hours
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-gray-500 text-xs">Regular Hrs</p>
                <p className="font-bold text-gray-800 text-lg">{result.regularWorkingHours}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-gray-500 text-xs">Overtime Hrs</p>
                <p className="font-bold text-gray-800 text-lg">{result.overtimeHours}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-gray-500 text-xs">Total Hrs</p>
                <p className="font-bold text-gray-800 text-lg">{result.totalWorkingHours}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-gray-500 text-xs">Regular Amount</p>
                <p className="font-bold text-gray-800 text-lg">₹{result.regularAmount}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-gray-500 text-xs">Overtime Amount</p>
                <p className="font-bold text-gray-800 text-lg">₹{result.overtimeAmount}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-gray-500 text-xs">Total Amount</p>
                <p className="font-bold text-gray-800 text-lg">₹{result.totalAmount}</p>
              </div>
            </div>
            {result.overtimeHours > 0 && (
              <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-3.5 py-2.5 mt-4 flex items-start gap-2">
                <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                Overtime status: <b>{result.overtimeApprovalStatus}</b> — a manager/admin needs to approve it in
                Labour Overtime before it's finalized.
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
