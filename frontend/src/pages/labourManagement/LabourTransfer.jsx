import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { History, Users2 } from "lucide-react";
import ReportTable from "../../components/ReportTable";
import Modal from "../../components/Modal";
import {
    useGetLabourQuery,
    useGetProjectsQuery,
    useAssignLabourToProjectMutation,
    useTransferLabourMutation,
    useReleaseLabourMutation,
    useGetLabourAssignmentsQuery,
    useGetLabourAssignmentHistoryQuery,
} from "../../Reduxe/Api";

/**
 * NEW PAGE — UI for the backend's Labour Assignment/Transfer module
 * (POST /api/labour/assign, /transfer, /release, GET /api/labour/assignments).
 * There was previously no frontend for this at all; the existing
 * assignLabour/unassignLabour/reassignLabour flow is a separate, simpler
 * legacy system with no transfer history.
 */
const LabourTransfer = () => {
    const { data: labourResp } = useGetLabourQuery();
    const { data: projectResp } = useGetProjectsQuery();
    const { data: assignmentResp, refetch } = useGetLabourAssignmentsQuery({});

    const [assignLabour, { isLoading: assigning }] = useAssignLabourToProjectMutation();
    const [transferLabour, { isLoading: transferring }] = useTransferLabourMutation();
    const [releaseLabour, { isLoading: releasing }] = useReleaseLabourMutation();

    const labours = labourResp?.data || labourResp?.labours || labourResp || [];
    const projects = projectResp?.data || projectResp || [];
    const assignments = assignmentResp?.data || [];

    const [mode, setMode] = useState("assign"); // assign | transfer | release
    const [form, setForm] = useState({ labourId: "", projectId: "", toProjectId: "", transferReason: "", remarks: "" });

    const isLoading = assigning || transferring || releasing;
    const navigate = useNavigate();

    // History modal — GET /api/labour/:id/history (getLabourAssignmentHistory).
    // Was already wired in Api.js but had no screen anywhere.
    const [historyLabourId, setHistoryLabourId] = useState(null);
    const { data: historyResp, isFetching: loadingHistory } = useGetLabourAssignmentHistoryQuery(
        historyLabourId,
        { skip: !historyLabourId }
    );
    const history = historyResp?.data || [];

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.labourId) return toast.error("Select a labour");

        try {
            if (mode === "assign") {
                if (!form.projectId) return toast.error("Select a project");
                await assignLabour({ labourId: form.labourId, projectId: form.projectId, remarks: form.remarks }).unwrap();
                toast.success("Labour assigned");
            } else if (mode === "transfer") {
                if (!form.toProjectId) return toast.error("Select destination project");
                await transferLabour({
                    labourId: form.labourId,
                    toProjectId: form.toProjectId,
                    transferReason: form.transferReason,
                    remarks: form.remarks,
                }).unwrap();
                toast.success("Labour transferred");
            } else {
                await releaseLabour({ labourId: form.labourId, remarks: form.remarks }).unwrap();
                toast.success("Labour released");
            }
            setForm({ labourId: "", projectId: "", toProjectId: "", transferReason: "", remarks: "" });
            refetch();
        } catch (err) {
            toast.error(err?.data?.message || "Action failed");
        }
    };

    const columns = [
        { header: "Labour", render: (row) => row.labourId?.name || "-" },
        { header: "Project", render: (row) => row.projectId?.projectName || "-" },
        { header: "Status", render: (row) => (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                row.status === "Active" ? "bg-green-100 text-green-700" :
                row.status === "Transferred" ? "bg-blue-100 text-blue-700" :
                "bg-gray-100 text-gray-700"
            }`}>{row.status}</span>
        )},
        { header: "Assignment Date", render: (row) => new Date(row.assignmentDate).toLocaleDateString() },
        { header: "Transfer Reason", accessor: "transferReason" },
        { header: "Remarks", accessor: "remarks" },
        {
            header: "Action", render: (row) => (
                <button
                    onClick={() => setHistoryLabourId(row.labourId?._id)}
                    disabled={!row.labourId?._id}
                    className="px-2 py-1 border border-gray-300 text-gray-600 rounded text-xs flex items-center gap-1 hover:bg-gray-50 disabled:opacity-40"
                >
                    <History size={12} /> History
                </button>
            )
        },
    ];

    return (
        <div className="p-6 max-w-6xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-800">Labour Assignment & Transfer</h1>
                <button
                    onClick={() => navigate("/labour/project-active")}
                    className="flex items-center gap-1.5 text-sm border border-gray-300 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-50"
                >
                    <Users2 size={14} /> View Active Labour by Project
                </button>
            </div>

            <div className="bg-white rounded-xl shadow p-6">
                <div className="flex gap-2 mb-4">
                    {["assign", "transfer", "release"].map((m) => (
                        <button
                            key={m}
                            onClick={() => setMode(m)}
                            className={`px-4 py-1.5 rounded-full text-sm capitalize border ${
                                mode === m ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-300"
                            }`}
                        >
                            {m}
                        </button>
                    ))}
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <select
                        className="border p-2 rounded-lg"
                        value={form.labourId}
                        onChange={(e) => setForm({ ...form, labourId: e.target.value })}
                        required
                    >
                        <option value="">Select Labour</option>
                        {labours.map((l) => (
                            <option key={l._id} value={l._id}>{l.name} ({l.phone})</option>
                        ))}
                    </select>

                    {mode === "assign" && (
                        <select
                            className="border p-2 rounded-lg"
                            value={form.projectId}
                            onChange={(e) => setForm({ ...form, projectId: e.target.value })}
                            required
                        >
                            <option value="">Select Project</option>
                            {projects?.map((p) => (
                                <option key={p._id} value={p._id}>{p.projectName}</option>
                            ))}
                        </select>
                    )}

                    {mode === "transfer" && (
                        <>
                            <select
                                className="border p-2 rounded-lg"
                                value={form.toProjectId}
                                onChange={(e) => setForm({ ...form, toProjectId: e.target.value })}
                                required
                            >
                                <option value="">Transfer To Project</option>
                                {projects?.map((p) => (
                                    <option key={p._id} value={p._id}>{p.projectName}</option>
                                ))}
                            </select>
                            <input
                                type="text"
                                placeholder="Transfer Reason"
                                className="border p-2 rounded-lg"
                                value={form.transferReason}
                                onChange={(e) => setForm({ ...form, transferReason: e.target.value })}
                            />
                        </>
                    )}

                    <input
                        type="text"
                        placeholder="Remarks"
                        className="border p-2 rounded-lg md:col-span-2"
                        value={form.remarks}
                        onChange={(e) => setForm({ ...form, remarks: e.target.value })}
                    />

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="md:col-span-2 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-60 capitalize"
                    >
                        {isLoading ? "Saving..." : mode}
                    </button>
                </form>
            </div>

            <div>
                <h2 className="text-lg font-semibold mb-3">Assignment History</h2>
                <ReportTable columns={columns} data={assignments} />
            </div>

            <Modal
                open={!!historyLabourId}
                title="Labour Assignment History"
                onClose={() => setHistoryLabourId(null)}
            >
                {loadingHistory ? (
                    <p className="text-sm text-gray-500 py-6 text-center">Loading...</p>
                ) : history.length === 0 ? (
                    <p className="text-sm text-gray-500 py-6 text-center">No assignment history found.</p>
                ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                        {history.map((h) => (
                            <div key={h._id} className="border border-gray-200 rounded-lg p-3 text-sm">
                                <div className="flex justify-between items-center">
                                    <span className="font-medium">{h.projectId?.projectName || "-"}</span>
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                        h.status === "Active" ? "bg-green-100 text-green-700" :
                                        h.status === "Transferred" ? "bg-blue-100 text-blue-700" :
                                        "bg-gray-100 text-gray-700"
                                    }`}>{h.status}</span>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    Since {new Date(h.assignmentDate).toLocaleDateString()}
                                    {h.previousProjectId?.projectName ? ` · from ${h.previousProjectId.projectName}` : ""}
                                    {h.releaseDate ? ` · ended ${new Date(h.releaseDate).toLocaleDateString()}` : ""}
                                </p>
                                {h.transferReason && <p className="text-xs text-gray-500">Reason: {h.transferReason}</p>}
                                {h.assignedBy?.name && <p className="text-xs text-gray-400">By {h.assignedBy.name}</p>}
                            </div>
                        ))}
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default LabourTransfer;
