import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Settings, Save, Building2 } from "lucide-react";
import {
    useGetOvertimeSettingsQuery,
    useUpsertOvertimeSettingsMutation,
    useGetProjectsQuery,
} from "../../Reduxe/Api";

/**
 * FIXED — this page previously posted fields (overtimeRateMultiplier,
 * weeklyOffDay, graceMinutes) that don't exist anywhere on the backend's
 * OvertimeSettings schema, so nothing actually saved or loaded correctly.
 * Now matches models/OvertimeSettings.js exactly: workStartTime,
 * workEndTime, standardWorkingHours, weeklyOvertimeThresholdHours,
 * regularRate, overtimeMultiplier — plus the project-override selector
 * the backend already supports (projectId: null = company-wide default).
 */
const DEFAULTS = {
    workStartTime: "09:00",
    workEndTime: "18:00",
    standardWorkingHours: 9,
    weeklyOvertimeThresholdHours: 48,
    regularRate: 0,
    overtimeMultiplier: 1.5,
};

export default function OvertimeSettings() {
    const { data: projectResp } = useGetProjectsQuery();
    const projects = projectResp?.data || projectResp || [];

    const [scopeProjectId, setScopeProjectId] = useState(""); // "" = company default

    const { data, isLoading, isFetching } = useGetOvertimeSettingsQuery(scopeProjectId || undefined);
    const [upsertOvertimeSettings, { isLoading: isSaving }] = useUpsertOvertimeSettingsMutation();

    const [form, setForm] = useState(DEFAULTS);

    useEffect(() => {
        const settings = data?.data || data;
        setForm({
            workStartTime: settings?.workStartTime ?? DEFAULTS.workStartTime,
            workEndTime: settings?.workEndTime ?? DEFAULTS.workEndTime,
            standardWorkingHours: settings?.standardWorkingHours ?? DEFAULTS.standardWorkingHours,
            weeklyOvertimeThresholdHours: settings?.weeklyOvertimeThresholdHours ?? DEFAULTS.weeklyOvertimeThresholdHours,
            regularRate: settings?.regularRate ?? DEFAULTS.regularRate,
            overtimeMultiplier: settings?.overtimeMultiplier ?? DEFAULTS.overtimeMultiplier,
        });
    }, [data]);

    const submit = async (e) => {
        e.preventDefault();
        try {
            await upsertOvertimeSettings({
                projectId: scopeProjectId || null,
                workStartTime: form.workStartTime,
                workEndTime: form.workEndTime,
                standardWorkingHours: Number(form.standardWorkingHours),
                weeklyOvertimeThresholdHours: Number(form.weeklyOvertimeThresholdHours),
                regularRate: Number(form.regularRate),
                overtimeMultiplier: Number(form.overtimeMultiplier),
            }).unwrap();
            toast.success(
                scopeProjectId ? "Project overtime settings saved" : "Company-wide default settings saved"
            );
        } catch (err) {
            toast.error(err?.data?.message || "Failed to save settings");
        }
    };

    return (
        <div className="p-4 lg:p-6 max-w-2xl mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <Settings className="text-blue-800" size={26} /> Overtime & Working Hours
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                    Configure the working-hours window and overtime rules used by the overtime engine.
                    A project override takes priority over the company-wide default whenever it exists.
                </p>
            </div>

            <div className="mb-5 bg-white rounded-2xl border border-gray-200 p-4">
                <label className="text-sm font-medium text-gray-600 flex items-center gap-1.5 mb-1.5">
                    <Building2 size={15} /> Scope
                </label>
                <select
                    value={scopeProjectId}
                    onChange={(e) => setScopeProjectId(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                >
                    <option value="">Company-wide Default (all projects without an override)</option>
                    {projects?.map((p) => (
                        <option key={p._id} value={p._id}>
                            Project Override — {p.projectName}
                        </option>
                    ))}
                </select>
            </div>

            {isLoading || isFetching ? (
                <div className="text-center py-16 text-gray-400 text-sm">Loading settings...</div>
            ) : (
                <form onSubmit={submit} className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
                    <div className="grid sm:grid-cols-2 gap-5">
                        <div>
                            <label className="text-sm font-medium text-gray-600">Work Start Time</label>
                            <input
                                type="time"
                                value={form.workStartTime}
                                onChange={(e) => setForm({ ...form, workStartTime: e.target.value })}
                                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-600">Work End Time</label>
                            <input
                                type="time"
                                value={form.workEndTime}
                                onChange={(e) => setForm({ ...form, workEndTime: e.target.value })}
                                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                            <p className="text-xs text-gray-400 mt-1">Overtime = time worked past this.</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-600">Standard Working Hours / Day</label>
                            <input
                                type="number"
                                step="0.5"
                                min="0"
                                value={form.standardWorkingHours}
                                onChange={(e) => setForm({ ...form, standardWorkingHours: e.target.value })}
                                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-600">Weekly Overtime Threshold (hrs)</label>
                            <input
                                type="number"
                                step="1"
                                min="0"
                                value={form.weeklyOvertimeThresholdHours}
                                onChange={(e) => setForm({ ...form, weeklyOvertimeThresholdHours: e.target.value })}
                                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                            <p className="text-xs text-gray-400 mt-1">0 disables weekly overtime (daily-only).</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-600">Regular Rate (₹ / hour)</label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={form.regularRate}
                                onChange={(e) => setForm({ ...form, regularRate: e.target.value })}
                                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                            <p className="text-xs text-gray-400 mt-1">Fallback only — labour with a daily wage uses that instead.</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-600">Overtime Multiplier</label>
                            <input
                                type="number"
                                step="0.1"
                                min="1"
                                value={form.overtimeMultiplier}
                                onChange={(e) => setForm({ ...form, overtimeMultiplier: e.target.value })}
                                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                            <p className="text-xs text-gray-400 mt-1">OT rate = Regular Rate × this.</p>
                        </div>
                    </div>
                    <button
                        disabled={isSaving}
                        className="inline-flex items-center gap-2 bg-blue-900 hover:bg-blue-800 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition disabled:opacity-60"
                    >
                        <Save size={16} /> {isSaving ? "Saving..." : "Save Settings"}
                    </button>
                </form>
            )}
        </div>
    );
}
