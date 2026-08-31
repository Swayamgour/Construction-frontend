import React, { useState } from "react";
import toast from "react-hot-toast";
import ReportTable from "../../components/ReportTable";
import {
    useGetEODReportsQuery,
    useSubmitEODMutation,
    useApproveEODReportMutation,
    useRejectEODReportMutation,
    useGetProjectsQuery,
} from "../../Reduxe/Api";

/**
 * NEW PAGE — UI for the backend's daily EOD report module
 * (POST /api/eod, PATCH /:id/approve|reject). No frontend previously
 * existed for this rich report — only the old task-linked DailyReport had
 * partial UI elsewhere. One report per project/day (duplicate submit is
 * rejected by the backend), so this form is intentionally focused on the
 * core fields; work-items/labour/machinery/material breakdown JSON can be
 * added by managers who need the full detail via the API directly.
 */
const EODReports = () => {
    const [showCreate, setShowCreate] = useState(false);
    const { data, isLoading, refetch } = useGetEODReportsQuery({});
    const { data: projectResp } = useGetProjectsQuery();

    const [submitEOD, { isLoading: submitting }] = useSubmitEODMutation();
    const [approveEOD] = useApproveEODReportMutation();
    const [rejectEOD] = useRejectEODReportMutation();

    const reports = data?.data || [];
    const projects = projectResp?.data || projectResp || [];

    const [form, setForm] = useState({
        projectId: "", date: new Date().toISOString().slice(0, 10),
        weather: "", workingShift: "", siteStatus: "",
        totalLabour: "", skilledLabour: "", unskilledLabour: "", absentLabour: "",
    });
    const [imageFiles, setImageFiles] = useState([]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.projectId || !form.date) return toast.error("Project and date are required");
        try {
            const fd = new FormData();
            fd.append("projectId", form.projectId);
            fd.append("date", form.date);
            fd.append("weather", form.weather);
            fd.append("workingShift", form.workingShift);
            fd.append("siteStatus", form.siteStatus);
            fd.append("labourDetails", JSON.stringify({
                totalLabour: Number(form.totalLabour) || 0,
                skilledLabour: Number(form.skilledLabour) || 0,
                unskilledLabour: Number(form.unskilledLabour) || 0,
                absentLabour: Number(form.absentLabour) || 0,
            }));
            imageFiles.forEach((f) => fd.append("images", f));

            await submitEOD(fd).unwrap();
            toast.success("EOD report submitted");
            setShowCreate(false);
            refetch();
        } catch (err) {
            toast.error(err?.data?.message || "Error submitting report — one report per project/day is allowed");
        }
    };

    const columns = [
        { header: "Date", render: (row) => new Date(row.date).toLocaleDateString() },
        { header: "Project", render: (row) => row.projectId?.projectName || "-" },
        { header: "Submitted By", render: (row) => row.submittedBy?.name || "-" },
        { header: "Weather", accessor: "weather" },
        { header: "Labour Present", render: (row) => row.labourDetails?.totalLabour ?? "-" },
        { header: "Issues", render: (row) => row.issues?.length || 0 },
        { header: "Status", render: (row) => (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                row.status === "Approved" ? "bg-green-100 text-green-700" :
                row.status === "Rejected" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"
            }`}>{row.status}</span>
        )},
        { header: "Action", render: (row) => row.status === "Submitted" ? (
            <div className="flex gap-2">
                <button onClick={() => approveEOD(row._id).then(() => { toast.success("Approved"); refetch(); })} className="px-2 py-1 bg-green-600 text-white rounded text-xs">Approve</button>
                <button onClick={() => rejectEOD({ id: row._id, reason: window.prompt("Reason:") || "" }).then(() => { toast.success("Rejected"); refetch(); })} className="px-2 py-1 bg-red-600 text-white rounded text-xs">Reject</button>
            </div>
        ) : "-" },
    ];

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-800">Daily EOD Reports</h1>
                <button onClick={() => setShowCreate((v) => !v)} className="px-4 py-2 bg-blue-600 text-white rounded-lg">
                    {showCreate ? "Close" : "+ Submit Today's Report"}
                </button>
            </div>

            {showCreate && (
                <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <select className="border p-2 rounded-lg" value={form.projectId} onChange={(e) => setForm({ ...form, projectId: e.target.value })} required>
                        <option value="">Select Project</option>
                        {projects.map((p) => <option key={p._id} value={p._id}>{p.projectName}</option>)}
                    </select>
                    <input type="date" className="border p-2 rounded-lg" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />

                    <input type="text" placeholder="Weather" className="border p-2 rounded-lg" value={form.weather} onChange={(e) => setForm({ ...form, weather: e.target.value })} />
                    <input type="text" placeholder="Working Shift" className="border p-2 rounded-lg" value={form.workingShift} onChange={(e) => setForm({ ...form, workingShift: e.target.value })} />
                    <input type="text" placeholder="Site Status" className="border p-2 rounded-lg md:col-span-2" value={form.siteStatus} onChange={(e) => setForm({ ...form, siteStatus: e.target.value })} />

                    <input type="number" placeholder="Total Labour" className="border p-2 rounded-lg" value={form.totalLabour} onChange={(e) => setForm({ ...form, totalLabour: e.target.value })} />
                    <input type="number" placeholder="Skilled Labour" className="border p-2 rounded-lg" value={form.skilledLabour} onChange={(e) => setForm({ ...form, skilledLabour: e.target.value })} />
                    <input type="number" placeholder="Unskilled Labour" className="border p-2 rounded-lg" value={form.unskilledLabour} onChange={(e) => setForm({ ...form, unskilledLabour: e.target.value })} />
                    <input type="number" placeholder="Absent Labour" className="border p-2 rounded-lg" value={form.absentLabour} onChange={(e) => setForm({ ...form, absentLabour: e.target.value })} />

                    <div className="md:col-span-2">
                        <label className="block text-sm text-gray-600 mb-1">Progress / Site Photos</label>
                        <input type="file" multiple accept="image/*" onChange={(e) => setImageFiles(Array.from(e.target.files))} />
                    </div>

                    <button type="submit" disabled={submitting} className="md:col-span-2 bg-blue-600 text-white py-2 rounded-lg disabled:opacity-60">
                        {submitting ? "Submitting..." : "Submit Report"}
                    </button>
                </form>
            )}

            {isLoading ? <p className="text-center text-gray-500 py-10">Loading...</p> : <ReportTable columns={columns} data={reports} />}
        </div>
    );
};

export default EODReports;
