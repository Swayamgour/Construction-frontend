import React, { useState } from "react";
import toast from "react-hot-toast";
import { Pencil } from "lucide-react";
import ReportTable from "../../components/ReportTable";
import Modal from "../../components/Modal";
import {
    useGetOvertimeRecordsQuery,
    useApproveOvertimeMutation,
    useRejectOvertimeMutation,
    useCorrectOvertimeMutation,
    useGetProjectsQuery,
} from "../../Reduxe/Api";

/**
 * UI for the backend's Labour Overtime engine
 * (GET /api/labour/overtime, PATCH /overtime/:id/approve|reject|correct).
 * "Correct" was previously wired in Api.js but had no UI anywhere — added
 * here as a modal so a mis-entered check-in/out can be fixed without
 * touching the database directly. Correcting resets approval to Pending
 * (backend behaviour), which this view reflects immediately via refetch.
 */
const OvertimeManagement = () => {
    const { data: projectResp } = useGetProjectsQuery();
    const [filters, setFilters] = useState({ projectId: "", status: "" });

    const { data, isLoading, refetch } = useGetOvertimeRecordsQuery({
        ...(filters.projectId ? { projectId: filters.projectId } : {}),
        ...(filters.status ? { status: filters.status } : {}),
    });

    const [approveOvertime] = useApproveOvertimeMutation();
    const [rejectOvertime] = useRejectOvertimeMutation();
    const [correctOvertime, { isLoading: isCorrecting }] = useCorrectOvertimeMutation();

    const projects = projectResp?.data || projectResp || [];
    const records = data?.data?.items || [];
    const summary = data?.data?.summary || { totalOvertimeHours: 0, totalOvertimeAmount: 0 };

    const [correctTarget, setCorrectTarget] = useState(null); // the row being corrected
    const [correctForm, setCorrectForm] = useState({ checkInTime: "", checkOutTime: "", remarks: "" });

    const handleApprove = async (id) => {
        try {
            await approveOvertime(id).unwrap();
            toast.success("Overtime approved");
            refetch();
        } catch (err) {
            toast.error(err?.data?.message || "Error approving");
        }
    };

    const handleReject = async (id) => {
        const reason = window.prompt("Rejection reason (optional):") || "";
        try {
            await rejectOvertime({ id, reason }).unwrap();
            toast.success("Overtime rejected");
            refetch();
        } catch (err) {
            toast.error(err?.data?.message || "Error rejecting");
        }
    };

    const openCorrect = (row) => {
        setCorrectTarget(row);
        setCorrectForm({
            checkInTime: row.checkInTime || "",
            checkOutTime: row.checkOutTime || "",
            remarks: "",
        });
    };

    const submitCorrect = async (e) => {
        e.preventDefault();
        if (!correctTarget) return;
        try {
            await correctOvertime({
                id: correctTarget._id,
                checkInTime: correctForm.checkInTime,
                checkOutTime: correctForm.checkOutTime,
                remarks: correctForm.remarks,
            }).unwrap();
            toast.success("Attendance corrected — sent back for approval");
            setCorrectTarget(null);
            refetch();
        } catch (err) {
            toast.error(err?.data?.message || "Error correcting attendance");
        }
    };

    const columns = [
        { header: "Labour", render: (row) => row.labourId?.name || "-" },
        { header: "Project", render: (row) => row.projectId?.projectName || "-" },
        { header: "Date", render: (row) => new Date(row.date).toLocaleDateString() },
        { header: "In / Out", render: (row) => `${row.checkInTime || "-"} – ${row.checkOutTime || "-"}` },
        { header: "Regular Hrs", accessor: "regularWorkingHours" },
        { header: "OT Hrs", accessor: "overtimeHours" },
        { header: "OT Amount", render: (row) => `₹${row.overtimeAmount || 0}` },
        {
            header: "Status", render: (row) => (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${row.overtimeApprovalStatus === "Approved" ? "bg-green-100 text-green-700" :
                    row.overtimeApprovalStatus === "Rejected" ? "bg-red-100 text-red-700" :
                        "bg-yellow-100 text-yellow-700"
                    }`}>{row.overtimeApprovalStatus}</span>
            )
        },
        {
            header: "Action", render: (row) => (
                <div className="flex gap-2 items-center">
                    {row.overtimeApprovalStatus === "Pending" && (
                        <>
                            <button onClick={() => handleApprove(row._id)} className="px-2 py-1 bg-green-600 text-white rounded text-xs">Approve</button>
                            <button onClick={() => handleReject(row._id)} className="px-2 py-1 bg-red-600 text-white rounded text-xs">Reject</button>
                        </>
                    )}
                    <button
                        onClick={() => openCorrect(row)}
                        title="Correct check-in/out"
                        className="px-2 py-1 border border-gray-300 text-gray-600 rounded text-xs flex items-center gap-1 hover:bg-gray-50"
                    >
                        <Pencil size={12} /> Correct
                    </button>
                </div>
            )
        },
    ];

    return (
        <div className="p-6 max-w-6xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">Labour Overtime</h1>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white border rounded-lg p-4 shadow-sm">
                    <p className="text-sm text-gray-500">Total OT Hours</p>
                    <p className="text-2xl font-semibold">{summary.totalOvertimeHours}</p>
                </div>
                <div className="bg-white border rounded-lg p-4 shadow-sm">
                    <p className="text-sm text-gray-500">Total OT Amount</p>
                    <p className="text-2xl font-semibold">₹{summary.totalOvertimeAmount}</p>
                </div>
            </div>

            <div className="flex gap-3">
                <select
                    className="border p-2 rounded-lg"
                    value={filters.projectId}
                    onChange={(e) => setFilters({ ...filters, projectId: e.target.value })}
                >
                    <option value="">All Projects</option>
                    {projects?.map((p) => (
                        <option key={p._id} value={p._id}>{p.projectName}</option>
                    ))}
                </select>
                <select
                    className="border p-2 rounded-lg"
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                >
                    <option value="">All Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                </select>
            </div>

            {isLoading ? (
                <p className="text-center text-gray-500 py-10">Loading...</p>
            ) : (
                <ReportTable columns={columns} data={records} />
            )}

            <Modal
                open={!!correctTarget}
                title={`Correct Attendance — ${correctTarget?.labourId?.name || ""}`}
                onClose={() => setCorrectTarget(null)}
            >
                <form onSubmit={submitCorrect} className="space-y-4">
                    <p className="text-xs text-gray-500">
                        {correctTarget && new Date(correctTarget.date).toLocaleDateString()} · Correcting resets
                        the overtime approval status back to Pending.
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-sm font-medium text-gray-600">Check-in</label>
                            <input
                                type="time"
                                required
                                value={correctForm.checkInTime}
                                onChange={(e) => setCorrectForm({ ...correctForm, checkInTime: e.target.value })}
                                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-600">Check-out</label>
                            <input
                                type="time"
                                required
                                value={correctForm.checkOutTime}
                                onChange={(e) => setCorrectForm({ ...correctForm, checkOutTime: e.target.value })}
                                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-600">Remarks</label>
                        <textarea
                            value={correctForm.remarks}
                            onChange={(e) => setCorrectForm({ ...correctForm, remarks: e.target.value })}
                            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                            rows={2}
                            placeholder="Reason for correction (optional)"
                        />
                    </div>
                    <div className="flex justify-end gap-2 pt-1">
                        <button
                            type="button"
                            onClick={() => setCorrectTarget(null)}
                            className="px-4 py-2 rounded-lg text-sm border border-gray-300 text-gray-600"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isCorrecting}
                            className="px-4 py-2 rounded-lg text-sm bg-blue-600 text-white disabled:opacity-60"
                        >
                            {isCorrecting ? "Saving..." : "Save Correction"}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default OvertimeManagement;
