import React, { useState } from "react";
import toast from "react-hot-toast";
import { AlertTriangle, Plus, X, CheckCircle2, Clock } from "lucide-react";
import {
    useListAllDelaysQuery,
    useListDelayCategoriesQuery,
    useReportProjectDelayMutation,
    useResolveDelayMutation,
} from "../../Reduxe/Api";
import { CheckRole } from "../../helper/CheckRole";

const STATUS_STYLES = {
    open: "bg-rose-50 text-rose-700 border-rose-200",
    resolved: "bg-emerald-50 text-emerald-700 border-emerald-200",
    in_progress: "bg-amber-50 text-amber-700 border-amber-200",
};

const ReportDelayModal = ({ onClose }) => {
    const { data: catData } = useListDelayCategoriesQuery();
    const categories = catData?.categories || (Array.isArray(catData) ? catData : []) || [];
    const [form, setForm] = useState({ projectId: "", categoryId: "", reason: "", delayDays: "" });
    const [reportProjectDelay, { isLoading }] = useReportProjectDelayMutation();

    const submit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        Object.entries(form).forEach(([k, v]) => formData.append(k, v));
        try {
            await reportProjectDelay({ projectId: form.projectId, formData }).unwrap();
            toast.success("Delay reported");
            onClose();
        } catch (err) {
            toast.error(err?.data?.message || "Failed to report delay");
        }
    };

    return (
        <div className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700">
                    <X size={20} />
                </button>
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Report Project Delay</h2>
                <form onSubmit={submit} className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-gray-600">Project ID</label>
                        <input
                            required
                            value={form.projectId}
                            onChange={(e) => setForm({ ...form, projectId: e.target.value })}
                            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-600">Category</label>
                        <select
                            value={form.categoryId}
                            onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                            <option value="">Select category</option>
                            {categories.map((c) => (
                                <option key={c._id} value={c._id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-600">Delay (days)</label>
                        <input
                            type="number"
                            value={form.delayDays}
                            onChange={(e) => setForm({ ...form, delayDays: e.target.value })}
                            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-600">Reason</label>
                        <textarea
                            required
                            value={form.reason}
                            onChange={(e) => setForm({ ...form, reason: e.target.value })}
                            rows={3}
                            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                    <button
                        disabled={isLoading}
                        className="w-full bg-rose-600 hover:bg-rose-700 text-white rounded-lg py-2.5 text-sm font-semibold transition disabled:opacity-60"
                    >
                        {isLoading ? "Submitting..." : "Report Delay"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default function DelayTracking() {
    const { role } = CheckRole();
    const { data, isLoading } = useListAllDelaysQuery();
    const [resolveDelay] = useResolveDelayMutation();
    const [showReport, setShowReport] = useState(false);

    const delays = data?.delays || (Array.isArray(data) ? data : []) || [];
    const canManage = role === "admin" || role === "manager";

    const resolve = async (id) => {
        try {
            await resolveDelay({ id, body: {} }).unwrap();
            toast.success("Delay resolved");
        } catch (err) {
            toast.error(err?.data?.message || "Failed to resolve");
        }
    };

    return (
        <div className="p-4 lg:p-6 max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <AlertTriangle className="text-rose-600" size={26} /> Delay Tracking
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">Log, categorize and resolve project delays</p>
                </div>
                <button
                    onClick={() => setShowReport(true)}
                    className="inline-flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition"
                >
                    <Plus size={18} /> Report Delay
                </button>
            </div>

            {isLoading && <div className="text-center py-16 text-gray-400 text-sm">Loading delays...</div>}
            {!isLoading && delays.length === 0 && (
                <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300">
                    <AlertTriangle className="mx-auto text-gray-300 mb-3" size={40} />
                    <p className="text-gray-500 text-sm">No delays reported</p>
                </div>
            )}

            <div className="space-y-3">
                {delays.map((d) => (
                    <div
                        key={d._id}
                        className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                    >
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span
                                    className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${STATUS_STYLES[d.status] || "bg-gray-50 text-gray-600 border-gray-200"
                                        }`}
                                >
                                    {d.status || "open"}
                                </span>
                                {d.delayDays && (
                                    <span className="text-xs text-gray-400 flex items-center gap-1">
                                        <Clock size={12} /> {d.delayDays} days
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-slate-800">{d.reason}</p>
                            <p className="text-xs text-gray-400 mt-1">
                                {d.category?.name || d.categoryName || ""} {d.project?.projectName ? `· ${d.project.projectName}` : ""}
                            </p>
                        </div>
                        {canManage && d.status !== "resolved" && (
                            <button
                                onClick={() => resolve(d._id)}
                                className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg py-1.5 px-3 text-xs font-semibold hover:bg-emerald-100 whitespace-nowrap"
                            >
                                <CheckCircle2 size={14} /> Mark Resolved
                            </button>
                        )}
                    </div>
                ))}
            </div>

            {showReport && <ReportDelayModal onClose={() => setShowReport(false)} />}
        </div>
    );
}
