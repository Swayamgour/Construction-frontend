import React, { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Clock, Timer } from "lucide-react";
import {
    useGetProjectsQuery,
    useGetLaboursByProjectQuery,
    useGetOvertimeSettingsQuery,
    useRecordLabourWorkingTimeMutation,
} from "../../Reduxe/Api";

const todayStr = () => new Date().toISOString().slice(0, 10);

/**
 * NEW PAGE — UI for POST /api/labour/attendance (recordLabourWorkingTime),
 * the entry point that actually feeds the whole overtime engine
 * (utils/overtime.js). This endpoint was already wired in Api.js but had
 * no screen anywhere — without it there was no way to log a check-in/out
 * pair and get regular vs overtime hours calculated at all; the only
 * existing attendance screens (SingleMark/BulkAttendance) just record a
 * Present/Absent status with no times.
 */
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

    const selectedLabour = useMemo(
        () => labours.find((l) => l._id === form.labourId),
        [labours, form.labourId]
    );

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
        <div className="p-6 max-w-3xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <Clock className="text-blue-800" size={24} /> Record Working Time
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                    Log a labour's check-in/check-out for a day — regular and overtime hours are
                    calculated automatically against the project's working-hours settings.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
                <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm font-medium text-gray-600">Project</label>
                        <select
                            required
                            value={projectId}
                            onChange={(e) => {
                                setProjectId(e.target.value);
                                setForm((f) => ({ ...f, labourId: "" }));
                                setResult(null);
                            }}
                            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                        >
                            <option value="">Select Project</option>
                            {projects?.map((p) => (
                                <option key={p._id} value={p._id}>{p.projectName}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-600">Labour</label>
                        <select
                            required
                            value={form.labourId}
                            onChange={(e) => setForm({ ...form, labourId: e.target.value })}
                            disabled={!projectId || loadingLabours}
                            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm disabled:bg-gray-50"
                        >
                            <option value="">{loadingLabours ? "Loading..." : "Select Labour"}</option>
                            {labours.map((l) => (
                                <option key={l._id} value={l._id}>{l.name} ({l.phone})</option>
                            ))}
                        </select>
                    </div>
                </div>

                {settings && (
                    <div className="flex items-center gap-2 text-xs text-gray-500 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
                        <Timer size={14} />
                        Standard shift {settings.workStartTime}–{settings.workEndTime} ({settings.standardWorkingHours}h) ·
                        overtime past {settings.workEndTime} at {settings.overtimeMultiplier}× rate
                        {selectedLabour?.wageType === "Daily" && selectedLabour?.dailyWage
                            ? ` · hourly rate from daily wage ₹${selectedLabour.dailyWage}`
                            : ""}
                    </div>
                )}

                <div className="grid sm:grid-cols-3 gap-4">
                    <div>
                        <label className="text-sm font-medium text-gray-600">Date</label>
                        <input
                            type="date"
                            value={form.date}
                            max={todayStr()}
                            onChange={(e) => setForm({ ...form, date: e.target.value })}
                            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-600">Check-in</label>
                        <input
                            type="time"
                            required
                            value={form.checkInTime}
                            onChange={(e) => setForm({ ...form, checkInTime: e.target.value })}
                            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-600">Check-out</label>
                        <input
                            type="time"
                            required
                            value={form.checkOutTime}
                            onChange={(e) => setForm({ ...form, checkOutTime: e.target.value })}
                            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                        />
                    </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm font-medium text-gray-600">Status</label>
                        <select
                            value={form.status}
                            onChange={(e) => setForm({ ...form, status: e.target.value })}
                            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                        >
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
                            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isSaving}
                    className="w-full bg-blue-900 hover:bg-blue-800 text-white py-2.5 rounded-lg text-sm font-semibold disabled:opacity-60"
                >
                    {isSaving ? "Recording..." : "Record Working Time"}
                </button>
            </form>

            {result && (
                <div className="bg-white rounded-2xl border border-green-200 p-6">
                    <h2 className="text-sm font-semibold text-green-700 mb-3">Recorded — calculated hours</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                        <div><p className="text-gray-500">Regular Hrs</p><p className="font-semibold">{result.regularWorkingHours}</p></div>
                        <div><p className="text-gray-500">Overtime Hrs</p><p className="font-semibold">{result.overtimeHours}</p></div>
                        <div><p className="text-gray-500">Total Hrs</p><p className="font-semibold">{result.totalWorkingHours}</p></div>
                        <div><p className="text-gray-500">Regular Amount</p><p className="font-semibold">₹{result.regularAmount}</p></div>
                        <div><p className="text-gray-500">Overtime Amount</p><p className="font-semibold">₹{result.overtimeAmount}</p></div>
                        <div><p className="text-gray-500">Total Amount</p><p className="font-semibold">₹{result.totalAmount}</p></div>
                    </div>
                    {result.overtimeHours > 0 && (
                        <p className="text-xs text-yellow-700 bg-yellow-50 border border-yellow-100 rounded-lg px-3 py-2 mt-4">
                            Overtime status: <b>{result.overtimeApprovalStatus}</b> — a manager/admin needs to approve
                            it in Labour Overtime before it's finalized.
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}
