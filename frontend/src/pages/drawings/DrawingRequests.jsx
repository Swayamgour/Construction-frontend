import React, { useState } from "react";
import toast from "react-hot-toast";
import ReportTable from "../../components/ReportTable";
import {
    useGetDrawingRequestsQuery,
    useCreateDrawingRequestMutation,
    useUpdateDrawingRequestStatusMutation,
    useUploadDrawingVersionMutation,
    useGetDrawingVersionsQuery,
    useGetProjectsQuery,
} from "../../Reduxe/Api";

const STATUS_COLORS = {
    REQUESTED: "bg-yellow-100 text-yellow-700",
    UNDER_REVIEW: "bg-blue-100 text-blue-700",
    UPLOADED: "bg-purple-100 text-purple-700",
    APPROVED: "bg-green-100 text-green-700",
    REJECTED: "bg-red-100 text-red-700",
    DELIVERED: "bg-gray-100 text-gray-700",
};

/**
 * NEW PAGE — UI for the backend's Drawing Request module
 * (POST /api/drawings/requests, /upload, GET /:id/versions). Entirely new
 * module, no frontend existed for it before.
 */
const DrawingRequests = () => {
    const [showCreate, setShowCreate] = useState(false);
    const [versionsModal, setVersionsModal] = useState(null);
    const [uploadModal, setUploadModal] = useState(null);

    const { data, isLoading, refetch } = useGetDrawingRequestsQuery({});
    const { data: projectResp } = useGetProjectsQuery();

    const [createDrawingRequest, { isLoading: creating }] = useCreateDrawingRequestMutation();
    const [updateStatus] = useUpdateDrawingRequestStatusMutation();
    const [uploadVersion, { isLoading: uploading }] = useUploadDrawingVersionMutation();
    const { data: versionsResp } = useGetDrawingVersionsQuery(versionsModal?._id, { skip: !versionsModal });

    const requests = data?.data || [];
    const projects = projectResp?.data || projectResp || [];

    const [form, setForm] = useState({ projectId: "", drawingCategory: "", drawingTitle: "", description: "", requiredDate: "", priority: "Medium" });

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!form.projectId || !form.drawingCategory || !form.drawingTitle) return toast.error("Fill required fields");
        try {
            await createDrawingRequest(form).unwrap();
            toast.success("Drawing request submitted");
            setShowCreate(false);
            setForm({ projectId: "", drawingCategory: "", drawingTitle: "", description: "", requiredDate: "", priority: "Medium" });
            refetch();
        } catch (err) {
            toast.error(err?.data?.message || "Error creating request");
        }
    };

    const handleStatusChange = async (id, status) => {
        try {
            await updateStatus({ id, status }).unwrap();
            toast.success(`Marked ${status}`);
            refetch();
        } catch (err) {
            toast.error(err?.data?.message || "Error updating status");
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        try {
            await uploadVersion({ id: uploadModal._id, formData: fd }).unwrap();
            toast.success("Version uploaded");
            setUploadModal(null);
            refetch();
        } catch (err) {
            toast.error(err?.data?.message || "Error uploading");
        }
    };

    const columns = [
        { header: "Request #", accessor: "requestNumber" },
        { header: "Project", render: (row) => row.projectId?.projectName || "-" },
        { header: "Title", accessor: "drawingTitle" },
        { header: "Category", accessor: "drawingCategory" },
        { header: "Requested By", render: (row) => row.requestedBy?.name || "-" },
        { header: "Version", render: (row) => `v${row.latestVersionNumber}` },
        { header: "Status", render: (row) => (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[row.status] || "bg-gray-100"}`}>{row.status}</span>
        )},
        { header: "Action", render: (row) => (
            <div className="flex gap-2 flex-wrap">
                <button onClick={() => setVersionsModal(row)} className="px-2 py-1 bg-gray-600 text-white rounded text-xs">Versions</button>
                <button onClick={() => setUploadModal(row)} className="px-2 py-1 bg-blue-600 text-white rounded text-xs">Upload</button>
                {row.status === "UPLOADED" && (
                    <>
                        <button onClick={() => handleStatusChange(row._id, "APPROVED")} className="px-2 py-1 bg-green-600 text-white rounded text-xs">Approve</button>
                        <button onClick={() => handleStatusChange(row._id, "REJECTED")} className="px-2 py-1 bg-red-600 text-white rounded text-xs">Reject</button>
                    </>
                )}
                {row.status === "APPROVED" && (
                    <button onClick={() => handleStatusChange(row._id, "DELIVERED")} className="px-2 py-1 bg-purple-600 text-white rounded text-xs">Mark Delivered</button>
                )}
            </div>
        )},
    ];

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-800">Drawing Requests</h1>
                <button onClick={() => setShowCreate((v) => !v)} className="px-4 py-2 bg-blue-600 text-white rounded-lg">
                    {showCreate ? "Close" : "+ New Request"}
                </button>
            </div>

            {showCreate && (
                <form onSubmit={handleCreate} className="bg-white rounded-xl shadow p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <select className="border p-2 rounded-lg" value={form.projectId} onChange={(e) => setForm({ ...form, projectId: e.target.value })} required>
                        <option value="">Select Project</option>
                        {projects.map((p) => <option key={p._id} value={p._id}>{p.projectName}</option>)}
                    </select>
                    <input type="text" placeholder="Drawing Category (e.g. Structural)" className="border p-2 rounded-lg" value={form.drawingCategory} onChange={(e) => setForm({ ...form, drawingCategory: e.target.value })} required />
                    <input type="text" placeholder="Drawing Title" className="border p-2 rounded-lg md:col-span-2" value={form.drawingTitle} onChange={(e) => setForm({ ...form, drawingTitle: e.target.value })} required />
                    <input type="date" className="border p-2 rounded-lg" value={form.requiredDate} onChange={(e) => setForm({ ...form, requiredDate: e.target.value })} />
                    <select className="border p-2 rounded-lg" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                        <option>Low</option><option>Medium</option><option>High</option><option>Urgent</option>
                    </select>
                    <textarea placeholder="Description" className="border p-2 rounded-lg md:col-span-2" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                    <button type="submit" disabled={creating} className="md:col-span-2 bg-blue-600 text-white py-2 rounded-lg disabled:opacity-60">
                        {creating ? "Submitting..." : "Submit Request"}
                    </button>
                </form>
            )}

            {isLoading ? <p className="text-center text-gray-500 py-10">Loading...</p> : <ReportTable columns={columns} data={requests} />}

            {uploadModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                        <h3 className="text-lg font-bold mb-4">Upload Version — {uploadModal.drawingTitle}</h3>
                        <form onSubmit={handleUpload} className="space-y-3">
                            <input name="file" type="file" accept="image/*,.pdf,.dwg,.dxf" className="w-full" required />
                            <input name="revisionNumber" type="text" placeholder="Revision # (optional)" className="border p-2 rounded-lg w-full" />
                            <input name="drawingNumber" type="text" placeholder="Drawing # (optional)" className="border p-2 rounded-lg w-full" />
                            <input name="remarks" type="text" placeholder="Remarks" className="border p-2 rounded-lg w-full" />
                            <div className="flex gap-2 justify-end pt-2">
                                <button type="button" onClick={() => setUploadModal(null)} className="px-4 py-2 border rounded-lg">Cancel</button>
                                <button type="submit" disabled={uploading} className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-60">
                                    {uploading ? "Uploading..." : "Upload"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {versionsModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setVersionsModal(null)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-lg font-bold mb-4">Versions — {versionsModal.drawingTitle}</h3>
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                            {(versionsResp?.data || []).map((v) => (
                                <a key={v._id} href={v.fileUrl} target="_blank" rel="noreferrer" className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50">
                                    <div>
                                        <p className="font-medium">v{v.versionNumber} {v.revisionNumber && `(${v.revisionNumber})`}</p>
                                        <p className="text-xs text-gray-500">{v.uploadedBy?.name} · {new Date(v.createdAt).toLocaleString()}</p>
                                    </div>
                                    <span className="text-blue-600 text-sm">Open →</span>
                                </a>
                            ))}
                        </div>
                        <button onClick={() => setVersionsModal(null)} className="mt-4 w-full px-4 py-2 border rounded-lg">Close</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DrawingRequests;
