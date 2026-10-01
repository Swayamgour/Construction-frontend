import React, { useState } from "react";
import toast from "react-hot-toast";
import { Pencil, Clock, Wallet, CheckCircle2, XCircle, Timer } from "lucide-react";
import ReportTable from "../../components/ReportTable";
import Modal from "../../components/Modal";
import {
  useGetOvertimeRecordsQuery,
  useApproveOvertimeMutation,
  useRejectOvertimeMutation,
  useCorrectOvertimeMutation,
  useGetProjectsQuery,
} from "../../Reduxe/Api";

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

  const [correctTarget, setCorrectTarget] = useState(null);
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
      header: "Status",
      render: (row) => (
        <span
          className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
            row.overtimeApprovalStatus === "Approved"
              ? "bg-emerald-50 text-emerald-700"
              : row.overtimeApprovalStatus === "Rejected"
              ? "bg-red-50 text-red-700"
              : "bg-amber-50 text-amber-700"
          }`}
        >
          {row.overtimeApprovalStatus}
        </span>
      ),
    },
    {
      header: "Action",
      render: (row) => (
        <div className="flex gap-2 items-center">
          {row.overtimeApprovalStatus === "Pending" && (
            <>
              <button
                onClick={() => handleApprove(row._id)}
                className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium flex items-center gap-1 transition-colors"
              >
                <CheckCircle2 size={11} /> Approve
              </button>
              <button
                onClick={() => handleReject(row._id)}
                className="px-2.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-medium flex items-center gap-1 transition-colors"
              >
                <XCircle size={11} /> Reject
              </button>
            </>
          )}
          <button
            onClick={() => openCorrect(row)}
            title="Correct check-in/out"
            className="px-2.5 py-1.5 border border-gray-200 text-gray-600 rounded-lg text-xs flex items-center gap-1 hover:bg-gray-50 transition-colors"
          >
            <Pencil size={11} /> Correct
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-md shadow-orange-900/20">
          <Timer size={20} />
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Labour Overtime</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm shadow-gray-200/60 p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
            <Clock size={18} />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">Total OT Hours</p>
            <p className="text-2xl font-bold text-gray-800">{summary.totalOvertimeHours}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm shadow-gray-200/60 p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <Wallet size={18} />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">Total OT Amount</p>
            <p className="text-2xl font-bold text-gray-800">₹{summary.totalOvertimeAmount}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <select
          className="border border-gray-200 p-2.5 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm"
          value={filters.projectId}
          onChange={(e) => setFilters({ ...filters, projectId: e.target.value })}
        >
          <option value="">All Projects</option>
          {projects?.map((p) => (
            <option key={p._id} value={p._id}>
              {p.projectName}
            </option>
          ))}
        </select>
        <select
          className="border border-gray-200 p-2.5 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm"
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
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-500">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm">Loading overtime records...</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm shadow-gray-200/60 overflow-hidden">
          <ReportTable columns={columns} data={records} />
        </div>
      )}

      <Modal
        open={!!correctTarget}
        title={`Correct Attendance — ${correctTarget?.labourId?.name || ""}`}
        onClose={() => setCorrectTarget(null)}
      >
        <form onSubmit={submitCorrect} className="space-y-4">
          <p className="text-xs text-gray-500">
            {correctTarget && new Date(correctTarget.date).toLocaleDateString()} · Correcting resets the overtime
            approval status back to Pending.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-600">Check-in</label>
              <input
                type="time"
                required
                value={correctForm.checkInTime}
                onChange={(e) => setCorrectForm({ ...correctForm, checkInTime: e.target.value })}
                className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Check-out</label>
              <input
                type="time"
                required
                value={correctForm.checkOutTime}
                onChange={(e) => setCorrectForm({ ...correctForm, checkOutTime: e.target.value })}
                className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Remarks</label>
            <textarea
              value={correctForm.remarks}
              onChange={(e) => setCorrectForm({ ...correctForm, remarks: e.target.value })}
              className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              rows={2}
              placeholder="Reason for correction (optional)"
            />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setCorrectTarget(null)}
              className="px-4 py-2 rounded-xl text-sm border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCorrecting}
              className="px-4 py-2 rounded-xl text-sm bg-gradient-to-r from-indigo-600 to-blue-600 text-white disabled:opacity-60 font-medium shadow-md shadow-indigo-900/20"
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
