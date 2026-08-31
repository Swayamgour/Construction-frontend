import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Settings, Save } from "lucide-react";
import { useGetOvertimeSettingsQuery, useUpsertOvertimeSettingsMutation } from "../../Reduxe/Api";

export default function OvertimeSettings() {
    const { data, isLoading } = useGetOvertimeSettingsQuery();
    const [upsertOvertimeSettings, { isLoading: isSaving }] = useUpsertOvertimeSettingsMutation();

    const [form, setForm] = useState({
        standardWorkingHours: 8,
        overtimeRateMultiplier: 1.5,
        weeklyOffDay: "sunday",
        graceMinutes: 15,
    });

    useEffect(() => {
        const settings = data?.settings || data;
        if (settings) {
            setForm((f) => ({ ...f, ...settings }));
        }
    }, [data]);

    const submit = async (e) => {
        e.preventDefault();
        try {
            await upsertOvertimeSettings(form).unwrap();
            toast.success("Overtime settings saved");
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
                <p className="text-sm text-gray-500 mt-1">Configure company-wide labour overtime rules</p>
            </div>

            {isLoading ? (
                <div className="text-center py-16 text-gray-400 text-sm">Loading settings...</div>
            ) : (
                <form onSubmit={submit} className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
                    <div className="grid sm:grid-cols-2 gap-5">
                        <div>
                            <label className="text-sm font-medium text-gray-600">Standard Working Hours / Day</label>
                            <input
                                type="number"
                                step="0.5"
                                value={form.standardWorkingHours}
                                onChange={(e) => setForm({ ...form, standardWorkingHours: e.target.value })}
                                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-600">Overtime Rate Multiplier</label>
                            <input
                                type="number"
                                step="0.1"
                                value={form.overtimeRateMultiplier}
                                onChange={(e) => setForm({ ...form, overtimeRateMultiplier: e.target.value })}
                                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-600">Weekly Off Day</label>
                            <select
                                value={form.weeklyOffDay}
                                onChange={(e) => setForm({ ...form, weeklyOffDay: e.target.value })}
                                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                {["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].map((d) => (
                                    <option key={d} value={d}>
                                        {d[0].toUpperCase() + d.slice(1)}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-600">Grace Period (minutes)</label>
                            <input
                                type="number"
                                value={form.graceMinutes}
                                onChange={(e) => setForm({ ...form, graceMinutes: e.target.value })}
                                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            />
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
