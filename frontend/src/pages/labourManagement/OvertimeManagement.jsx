import React, { useState } from "react";
import toast from "react-hot-toast";
import ReportTable from "../../components/ReportTable";
import {
    useGetOvertimeRecordsQuery,
    useApproveOvertimeMutation,
    useRejectOvertimeMutation,
    useGetProjectsQuery,
} from "../../Reduxe/Api";

/**
 * NEW PAGE — UI for the backend's Labour Overtime engine
 * (GET /api/labour/overtime, PATCH /overtime/:id/approve|reject). No
 * frontend previously existed for overtime approval at all.
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

    const projects = projectResp?.data || projectResp || [];
    const records = data?.data?.items || [];
    const summary = data?.data?.summary || { totalOvertimeHours: 0, totalOvertimeAmount: 0 };

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

    const columns = [
        { header: "Labour", render: (row) => row.labourId?.name || "-" },
        { header: "Project", render: (row) => row.projectId?.projectName || "-" },
        { header: "Date", render: (row) => new Date(row.date).toLocaleDateString() },
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
            header: "Action", render: (row) => row.overtimeApprovalStatus === "Pending" ? (
                <div className="flex gap-2">
                    <button onClick={() => handleApprove(row._id)} className="px-2 py-1 bg-green-600 text-white rounded text-xs">Approve</button>
                    <button onClick={() => handleReject(row._id)} className="px-2 py-1 bg-red-600 text-white rounded text-xs">Reject</button>
                </div>
            ) : "-"
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
                    {projects.map((p) => (
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
        </div>
    );
};

export default OvertimeManagement;
