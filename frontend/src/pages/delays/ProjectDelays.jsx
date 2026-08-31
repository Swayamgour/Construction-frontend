import React, { useState } from "react";
import toast from "react-hot-toast";
import ReportTable from "../../components/ReportTable";
import {
    useGetAllDelaysQuery,
    useGetDelayCategoriesQuery,
    useReportDelayMutation,
    useResolveDelayMutation,
    useGetProjectsQuery,
} from "../../Reduxe/Api";

/**
 * NEW PAGE — UI for the backend's Project Delay module
 * (POST /api/projects/:projectId/delays, POST /api/delays/:id/resolve).
 * Entirely new module — no frontend existed for this before.
 */
const ProjectDelays = () => {
    const [showCreate, setShowCreate] = useState(false);
    const [resolveModal, setResolveModal] = useState(null);

    const { data, isLoading, refetch } = useGetAllDelaysQuery({});
    const { data: catResp } = useGetDelayCategoriesQuery();
    const { data: projectResp } = useGetProjectsQuery();

    const [reportDelay, { isLoading: reporting }] = useReportDelayMutation();
    const [resolveDelay, { isLoading: resolving }] = useResolveDelayMutation();

    const delays = data?.data || [];
    const categories = catResp?.data || [];
    const projects = projectResp?.data || projectResp || [];

    const [form, setForm] = useState({
        projectId: "", delayDate: new Date().toISOString().slice(0, 10), delayType: "",
        reason: "", description: "", plannedResumeDate: "", estimatedDelayDays: "",
    });

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!form.projectId || !form.delayType || !form.reason) return toast.error("Fill required fields");
        try {
            const fd = new FormData();
            Object.entries(form).forEach(([k, v]) => { if (k !== "projectId") fd.append(k, v); });
            await reportDelay({ projectId: form.projectId, formData: fd }).unwrap();
            toast.success("Delay reported");
            setShowCreate(false);
            refetch();
        } catch (err) {
            toast.error(err?.data?.message || "Error reporting delay");
        }
    };

    const handleResolveSubmit = async (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        try {
            await resolveDelay({
                id: resolveModal._id,
                resolution: fd.get("resolution"),
                actualResumeDate: fd.get("actualResumeDate"),
            }).unwrap();
            toast.success("Delay resolved");
            setResolveModal(null);
            refetch();
        } catch (err) {
            toast.error(err?.data?.message || "Error resolving delay");
        }
    };

    const columns = [
        { header: "Project", render: (row) => row.projectId?.projectName || "-" },
        { header: "Date", render: (row) => new Date(row.delayDate).toLocaleDateString() },
        { header: "Category", render: (row) => row.delayType?.name || "-" },
        { header: "Reason", accessor: "reason" },
        { header: "Est. Days", accessor: "estimatedDelayDays" },
        { header: "Actual Days", accessor: "actualDelayDays" },
        { header: "Status", render: (row) => (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${row.status === "Resolved" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                {row.status}
            </span>
        )},
        { header: "Action", render: (row) => row.status === "Active" ? (
            <button onClick={() => setResolveModal(row)} className="px-2 py-1 bg-green-600 text-white rounded text-xs">Resolve</button>
        ) : "-" },
    ];

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-800">Project Delays</h1>
                <button onClick={() => setShowCreate((v) => !v)} className="px-4 py-2 bg-blue-600 text-white rounded-lg">
                    {showCreate ? "Close" : "+ Report Delay"}
                </button>
            </div>

            {showCreate && (
                <form onSubmit={handleCreate} className="bg-white rounded-xl shadow p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <select className="border p-2 rounded-lg" value={form.projectId} onChange={(e) => setForm({ ...form, projectId: e.target.value })} required>
                        <option value="">Select Project</option>
                        {projects.map((p) => <option key={p._id} value={p._id}>{p.projectName}</option>)}
                    </select>
                    <input type="date" className="border p-2 rounded-lg" value={form.delayDate} onChange={(e) => setForm({ ...form, delayDate: e.target.value })} required />

                    <select className="border p-2 rounded-lg" value={form.delayType} onChange={(e) => setForm({ ...form, delayType: e.target.value })} required>
                        <option value="">Select Delay Category</option>
                        {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                    </select>
                    <input type="number" placeholder="Estimated Delay Days" className="border p-2 rounded-lg" value={form.estimatedDelayDays} onChange={(e) => setForm({ ...form, estimatedDelayDays: e.target.value })} />

                    <input type="text" placeholder="Reason" className="border p-2 rounded-lg md:col-span-2" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} required />
                    <textarea placeholder="Description" className="border p-2 rounded-lg md:col-span-2" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />

                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Planned Resume Date</label>
                        <input type="date" className="border p-2 rounded-lg w-full" value={form.plannedResumeDate} onChange={(e) => setForm({ ...form, plannedResumeDate: e.target.value })} />
                    </div>

                    <button type="submit" disabled={reporting} className="md:col-span-2 bg-blue-600 text-white py-2 rounded-lg disabled:opacity-60">
                        {reporting ? "Submitting..." : "Report Delay"}
                    </button>
                </form>
            )}

            {isLoading ? <p className="text-center text-gray-500 py-10">Loading...</p> : <ReportTable columns={columns} data={delays} />}

            {resolveModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                        <h3 className="text-lg font-bold mb-4">Resolve Delay — {resolveModal.reason}</h3>
                        <form onSubmit={handleResolveSubmit} className="space-y-3">
                            <input name="actualResumeDate" type="date" className="border p-2 rounded-lg w-full" required />
                            <textarea name="resolution" placeholder="Resolution notes" className="border p-2 rounded-lg w-full" required />
                            <div className="flex gap-2 justify-end pt-2">
                                <button type="button" onClick={() => setResolveModal(null)} className="px-4 py-2 border rounded-lg">Cancel</button>
                                <button type="submit" disabled={resolving} className="px-4 py-2 bg-green-600 text-white rounded-lg disabled:opacity-60">
                                    {resolving ? "Saving..." : "Resolve"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProjectDelays;
