import React, { useState } from "react";
import {
    useGetMachinesQuery,
    useAddMachineUsageMutation,
    useGetMachineUsageQuery,
} from "../../Reduxe/Api";
import { useAssignProjectQuery } from "../../Reduxe/Api";
import { FiCheckCircle, FiClock } from "react-icons/fi";

export default function MachineUsage() {
    const { data: machinesData = [] } = useGetMachinesQuery();
    const { data: projectsData = [] } = useAssignProjectQuery();
    const { data: usageData = [], isLoading } = useGetMachineUsageQuery();

    const [addMachineUsage] = useAddMachineUsageMutation();
    const [form, setForm] = useState({
        machineId: "",
        projectId: "",
        usageDate: "",
        workingHours: "",
        idleHours: "",
        breakdownHours: "",
        remarks: "",
    });

    // auto-set project based on machine current allocation
    const handleMachineSelect = (machineId) => {
        const obj = machinesData?.data?.find((m) => m._id === machineId);
        setForm({
            ...form,
            machineId,
            projectId: obj?.currentProjectId?._id || "",
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await addMachineUsage(form);
        setForm({
            machineId: "",
            projectId: "",
            usageDate: "",
            workingHours: "",
            idleHours: "",
            breakdownHours: "",
            remarks: "",
        });
    };

    return (
        <div className="p-6">

            {/* Header */}
            <h1 className="text-2xl font-bold text-gray-700 mb-4">
                ⏱ Daily Machine Usage Entry
            </h1>

            {/* Form */}
            <form
                onSubmit={handleSubmit}
                className="bg-white p-5 rounded-lg shadow-md max-w-xl space-y-3"
            >
                <h3 className="font-semibold text-gray-600 flex items-center gap-2">
                    <FiClock /> Usage Entry
                </h3>

                {/* Machine Select */}
                <select
                    value={form.machineId}
                    required
                    className="border p-2 w-full rounded"
                    onChange={(e) => handleMachineSelect(e.target.value)}
                >
                    <option value="">Select Machine</option>
                    {machinesData?.data?.map((m) => (
                        <option key={m._id} value={m._id}>
                            {m.name} ({m.machineType})
                        </option>
                    ))}
                </select>

                {/* Project Auto fill */}
                <select
                    value={form.projectId}
                    readOnly
                    disabled
                    className="border p-2 w-full rounded bg-gray-100"
                >
                    <option value="">
                        {form.projectId ? "" : "Project auto-selected"}
                    </option>
                    {projectsData?.map((p) => (
                        <option key={p._id} value={p._id}>
                            {p.projectName} ({p.projectCode})
                        </option>
                    ))}
                </select>

                {/* Date */}
                <input
                    type="date"
                    required
                    className="border p-2 w-full rounded"
                    value={form.usageDate}
                    onChange={(e) => setForm({ ...form, usageDate: e.target.value })}
                />

                {/* Hours Row */}
                <div className="grid grid-cols-3 gap-3">
                    <input
                        type="number"
                        min="0"
                        placeholder="Working"
                        className="border p-2 rounded"
                        value={form.workingHours}
                        onChange={(e) => setForm({ ...form, workingHours: e.target.value })}
                    />
                    <input
                        type="number"
                        min="0"
                        placeholder="Idle"
                        className="border p-2 rounded"
                        value={form.idleHours}
                        onChange={(e) => setForm({ ...form, idleHours: e.target.value })}
                    />
                    <input
                        type="number"
                        min="0"
                        placeholder="Breakdown"
                        className="border p-2 rounded"
                        value={form.breakdownHours}
                        onChange={(e) => setForm({ ...form, breakdownHours: e.target.value })}
                    />
                </div>

                <textarea
                    placeholder="Remarks (optional)"
                    className="border p-2 w-full rounded"
                    value={form.remarks}
                    onChange={(e) => setForm({ ...form, remarks: e.target.value })}
                />

                <button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg w-full"
                >
                    Submit Usage
                </button>
            </form>

            {/* Usage list */}
            <div className="mt-6 bg-white p-5 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">
                    📋 Machine Daily Usage Entries
                </h3>

                {isLoading ? (
                    <p>Loading...</p>
                ) : usageData.data?.length === 0 ? (
                    <p className="text-gray-500">No usage entries found.</p>
                ) : (
                    <table className="w-full text-sm rounded-lg overflow-hidden">
                        <thead className="bg-gray-100 text-gray-600">
                            <tr>
                                <th className="p-2">Machine</th>
                                <th className="p-2">Working</th>
                                <th className="p-2">Idle</th>
                                <th className="p-2">Breakdown</th>
                                <th className="p-2">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {usageData.data?.map((u) => (
                                <tr key={u._id} className="border-t text-center">
                                    <td className="p-2">{u.machineId?.name}</td>
                                    <td className="p-2">{u.workingHours || 0}h</td>
                                    <td className="p-2">{u.idleHours || 0}h</td>
                                    <td className="p-2">{u.breakdownHours || 0}h</td>
                                    <td className="p-2">
                                        {new Date(u.usageDate).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
