import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { CheckCircle2, ClipboardCheck, Loader2, LogOut, Pencil, RefreshCw, X, XCircle } from "lucide-react";
import {
    useApproveBulkLabourAttendanceMutation,
    useApproveLabourAttendanceMutation,
    useCorrectOvertimeMutation,
    useGetLabourAttendanceRecordsQuery,
    useGetPendingLabourAttendanceQuery,
    usePunchOutLabourMutation,
    useRejectLabourAttendanceMutation,
} from "../../Reduxe/Api";
import { CheckRole } from "../../helper/CheckRole";
import { getFileUrl } from "../../utils/fileUrl";

/* ------------------------------------------------------------------ *
 * Shared by  /attendance/pending  and  /labour/pending
 *
 *  admin               -> approve / reject / bulk approve (+ overtime)
 *  manager, supervisor -> read-only list of what is waiting for admin,
 *                         can finish a forgotten punch-out, and can
 *                         fix records the admin rejected.
 * ------------------------------------------------------------------ */

const errMsg = (e, fallback) => e?.data?.message || e?.message || fallback;
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "-");
const toYMD = (d) => new Date(d).toISOString().slice(0, 10);

const STATUS_STYLE = {
    Present: "bg-green-100 text-green-700",
    Absent: "bg-red-100 text-red-700",
    "Half-Day": "bg-orange-100 text-orange-700",
};

const OT_STYLE = {
    Pending: "bg-amber-100 text-amber-700",
    Approved: "bg-emerald-100 text-emerald-700",
    Rejected: "bg-red-100 text-red-700",
};

function Modal({ title, onClose, children }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="bg-white rounded-2xl p-5 w-full max-w-sm shadow-xl">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-800">{title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={18} />
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
}

const RowInfo = ({ rec }) => (
    <>
        <td className="p-3">
            <div className="font-medium">{fmtDate(rec.date)}</div>
        </td>
        <td className="p-3">
            <div className="font-medium text-gray-800">{rec.projectId?.projectName || "-"}</div>
            <div className="text-xs text-gray-500">{rec.projectId?.projectCode || ""}</div>
        </td>
        <td className="p-3">
            <div className="font-semibold text-gray-900">{rec.labourId?.name || "-"}</div>
            <div className="text-xs text-gray-500">{rec.labourId?.phone}</div>
        </td>
    </>
);

export default function PendingAttendancePage() {
    const { role, isLoading: roleLoading } = CheckRole();
    const isAdmin = role === "admin";

    const { data, isLoading, isFetching, refetch } = useGetPendingLabourAttendanceQuery();
    const records = data?.data || [];

    // rejected records so a manager can correct them (not needed for admin)
    const { data: rejectedResp } = useGetLabourAttendanceRecordsQuery(
        { approvalStatus: "Rejected", limit: 50 },
        { skip: roleLoading || isAdmin }
    );
    const rejected = rejectedResp?.data?.items || [];

    const [approve] = useApproveLabourAttendanceMutation();
    const [approveBulk] = useApproveBulkLabourAttendanceMutation();
    const [reject, { isLoading: isRejecting }] = useRejectLabourAttendanceMutation();
    const [punchOut] = usePunchOutLabourMutation();
    const [correct, { isLoading: isCorrecting }] = useCorrectOvertimeMutation();

    const [selected, setSelected] = useState([]);
    const [approveOT, setApproveOT] = useState(true);
    const [busyId, setBusyId] = useState(null);

    const [rejectTarget, setRejectTarget] = useState(null);
    const [reason, setReason] = useState("");

    const [editTarget, setEditTarget] = useState(null);
    const [editForm, setEditForm] = useState({ checkInTime: "", checkOutTime: "" });
    const [outTimes, setOutTimes] = useState({});

    // approvable = admin can approve it (punch-out done, or absent)
    const approvable = useMemo(() => records.filter((r) => !r.awaitingPunchOut), [records]);

    useEffect(() => {
        const ids = new Set(approvable.map((r) => r._id));
        setSelected((prev) => prev.filter((id) => ids.has(id)));
    }, [data]); // eslint-disable-line react-hooks/exhaustive-deps

    const toggle = (id) => setSelected((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
    const toggleAll = () =>
        setSelected((p) => (p.length === approvable.length ? [] : approvable.map((r) => r._id)));

    /* ----------------------------- admin ----------------------------- */

    const handleApprove = async (rec) => {
        try {
            setBusyId(rec._id);
            await approve({ attendanceId: rec._id, approveOvertime: approveOT }).unwrap();
            toast.success("Attendance approved");
        } catch (e) {
            toast.error(errMsg(e, "Error approving attendance"));
        } finally {
            setBusyId(null);
        }
    };

    const handleApproveSelected = async () => {
        if (!selected.length) return toast.error("Select records first");
        if (!window.confirm(`Approve ${selected.length} record(s)?`)) return;

        try {
            setBusyId("bulk");
            const res = await approveBulk({ attendanceIds: selected, approveOvertime: approveOT }).unwrap();
            toast.success(res.message);
            if (res.failed?.length) toast.error(`${res.failed[0].reason} (+${res.failed.length - 1} more)`);
            setSelected([]);
        } catch (e) {
            toast.error(errMsg(e, "Bulk approval failed"));
        } finally {
            setBusyId(null);
        }
    };

    const submitReject = async () => {
        if (!reason.trim()) return toast.error("Rejection reason is required");
        try {
            await reject({ attendanceId: rejectTarget._id, reason: reason.trim() }).unwrap();
            toast.success("Rejected - sent back to manager");
            setRejectTarget(null);
            setReason("");
        } catch (e) {
            toast.error(errMsg(e, "Error rejecting"));
        }
    };

    /* ------------------- manager / supervisor ------------------------ */

    const handlePunchOut = async (rec) => {
        try {
            setBusyId(rec._id);
            const body = {
                projectId: rec.projectId?._id,
                labourId: rec.labourId?._id,
                date: toYMD(rec.date), // lets a forgotten punch-out of an earlier day be completed
            };
            if (outTimes[rec._id]) body.checkOutTime = outTimes[rec._id];
            await punchOut(body).unwrap();
            toast.success("Punched out");
        } catch (e) {
            toast.error(errMsg(e, "Punch-out failed"));
        } finally {
            setBusyId(null);
        }
    };

    const openEdit = (rec) => {
        setEditTarget(rec);
        setEditForm({ checkInTime: rec.checkInTime || "", checkOutTime: rec.checkOutTime || "" });
    };

    const saveEdit = async () => {
        try {
            await correct({
                id: editTarget._id,
                checkInTime: editForm.checkInTime || undefined,
                checkOutTime: editForm.checkOutTime || undefined,
            }).unwrap();
            toast.success("Corrected - sent back for admin approval");
            setEditTarget(null);
        } catch (e) {
            toast.error(errMsg(e, "Could not correct times"));
        }
    };

    /* ----------------------------- render ---------------------------- */

    if (isLoading || roleLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] gap-3 text-gray-500">
                <Loader2 className="animate-spin" size={22} />
                <p className="text-sm">Loading pending list...</p>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white">
                        <ClipboardCheck size={18} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">
                            {isAdmin ? "Pending Attendance Approval" : "Attendance waiting for admin"}
                        </h1>
                        <p className="text-sm text-gray-500">{records.length} record(s) pending</p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    {isAdmin && (
                        <label className="flex items-center gap-2 text-sm text-gray-700">
                            <input type="checkbox" checked={approveOT} onChange={(e) => setApproveOT(e.target.checked)} />
                            Also approve overtime
                        </label>
                    )}

                    <button
                        onClick={refetch}
                        className="px-3 py-2 border border-gray-200 rounded-xl text-sm hover:bg-gray-50 flex items-center gap-2"
                    >
                        <RefreshCw size={14} className={isFetching ? "animate-spin" : ""} /> Refresh
                    </button>

                    {isAdmin && (
                        <button
                            onClick={handleApproveSelected}
                            disabled={!selected.length || busyId === "bulk"}
                            className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-2"
                        >
                            <CheckCircle2 size={14} /> Approve selected ({selected.length})
                        </button>
                    )}
                </div>
            </div>

            {records.length === 0 ? (
                <div className="py-16 text-center bg-white rounded-2xl border border-dashed border-gray-200">
                    <CheckCircle2 className="mx-auto text-emerald-300 mb-3" size={32} />
                    <p className="text-gray-500">You're all caught up - nothing pending.</p>
                </div>
            ) : (
                <div className="overflow-x-auto bg-white border border-gray-100 rounded-2xl shadow-sm">
                    <table className="min-w-full text-sm">
                        <thead className="bg-gray-50 text-gray-600">
                            <tr>
                                {isAdmin && (
                                    <th className="p-3 w-8">
                                        <input
                                            type="checkbox"
                                            checked={approvable.length > 0 && selected.length === approvable.length}
                                            onChange={toggleAll}
                                        />
                                    </th>
                                )}
                                <th className="p-3 text-left font-medium">Date</th>
                                <th className="p-3 text-left font-medium">Project</th>
                                <th className="p-3 text-left font-medium">Labour</th>
                                <th className="p-3 text-left font-medium">Status</th>
                                <th className="p-3 text-left font-medium">In</th>
                                <th className="p-3 text-left font-medium">Out</th>
                                <th className="p-3 text-left font-medium">Hours</th>
                                <th className="p-3 text-left font-medium">Overtime</th>
                                <th className="p-3 text-left font-medium">Marked by</th>
                                <th className="p-3 text-left font-medium">Selfie</th>
                                <th className="p-3 text-center font-medium">Action</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-100">
                            {records.map((rec) => (
                                <tr key={rec._id} className="hover:bg-gray-50/60 align-top">
                                    {isAdmin && (
                                        <td className="p-3">
                                            {!rec.awaitingPunchOut && (
                                                <input
                                                    type="checkbox"
                                                    checked={selected.includes(rec._id)}
                                                    onChange={() => toggle(rec._id)}
                                                />
                                            )}
                                        </td>
                                    )}

                                    <RowInfo rec={rec} />

                                    <td className="p-3">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${STATUS_STYLE[rec.status] || "bg-gray-100 text-gray-600"}`}>
                                            {rec.status}
                                        </span>
                                    </td>

                                    <td className="p-3">{rec.checkInTime || "-"}</td>
                                    <td className="p-3">
                                        {rec.checkOutTime ||
                                            (rec.awaitingPunchOut ? (
                                                <span className="text-xs font-semibold text-blue-600">Not punched out</span>
                                            ) : (
                                                "-"
                                            ))}
                                    </td>

                                    <td className="p-3 font-semibold text-blue-700">{rec.totalWorkingHours || 0}h</td>

                                    <td className="p-3">
                                        {rec.overtimeHours > 0 ? (
                                            <div className="space-y-1">
                                                <p>{rec.overtimeHours}h</p>
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${OT_STYLE[rec.overtimeApprovalStatus] || ""}`}>
                                                    {rec.overtimeApprovalStatus}
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="text-gray-400">-</span>
                                        )}
                                    </td>

                                    <td className="p-3">{rec.markedBy?.name || "-"}</td>

                                    <td className="p-3">
                                        {rec.selfie ? (
                                            <a href={getFileUrl(rec.selfie)} target="_blank" rel="noreferrer">
                                                <img
                                                    src={getFileUrl(rec.selfie)}
                                                    alt="selfie"
                                                    className="w-12 h-12 rounded-lg object-cover border"
                                                />
                                            </a>
                                        ) : (
                                            <span className="text-gray-400 text-xs">No selfie</span>
                                        )}
                                    </td>

                                    <td className="p-3 text-center">
                                        {isAdmin ? (
                                            rec.awaitingPunchOut ? (
                                                <span className="text-xs text-gray-400">Waiting for punch-out</span>
                                            ) : (
                                                <div className="flex justify-center gap-2">
                                                    <button
                                                        onClick={() => handleApprove(rec)}
                                                        disabled={busyId === rec._id}
                                                        className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs hover:bg-blue-700 disabled:opacity-60"
                                                    >
                                                        {busyId === rec._id ? "..." : "Approve"}
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setRejectTarget(rec);
                                                            setReason("");
                                                        }}
                                                        className="px-3 py-1.5 border border-red-300 text-red-600 rounded-lg text-xs hover:bg-red-50 flex items-center gap-1"
                                                    >
                                                        <XCircle size={12} /> Reject
                                                    </button>
                                                </div>
                                            )
                                        ) : rec.awaitingPunchOut ? (
                                            <div className="flex items-center justify-center gap-2">
                                                <input
                                                    type="time"
                                                    value={outTimes[rec._id] || ""}
                                                    onChange={(e) => setOutTimes((p) => ({ ...p, [rec._id]: e.target.value }))}
                                                    className="border border-gray-200 rounded-lg px-2 py-1 text-xs"
                                                    title="Leave empty to use current time"
                                                />
                                                <button
                                                    onClick={() => handlePunchOut(rec)}
                                                    disabled={busyId === rec._id}
                                                    className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs hover:bg-blue-700 disabled:opacity-60 flex items-center gap-1"
                                                >
                                                    <LogOut size={12} /> Punch out
                                                </button>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-gray-400">Waiting for admin</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Rejected by admin -> manager / supervisor must fix */}
            {!isAdmin && rejected.length > 0 && (
                <div className="mt-8">
                    <h2 className="text-lg font-semibold text-red-700 mb-3">Rejected by admin ({rejected.length})</h2>

                    <div className="overflow-x-auto bg-white border border-red-100 rounded-2xl shadow-sm">
                        <table className="min-w-full text-sm">
                            <thead className="bg-red-50 text-gray-600">
                                <tr>
                                    <th className="p-3 text-left font-medium">Date</th>
                                    <th className="p-3 text-left font-medium">Project</th>
                                    <th className="p-3 text-left font-medium">Labour</th>
                                    <th className="p-3 text-left font-medium">In / Out</th>
                                    <th className="p-3 text-left font-medium">Reason</th>
                                    <th className="p-3 text-center font-medium">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {rejected.map((rec) => (
                                    <tr key={rec._id}>
                                        <RowInfo rec={rec} />
                                        <td className="p-3">
                                            {rec.checkInTime || "-"} / {rec.checkOutTime || "-"}
                                        </td>
                                        <td className="p-3 text-red-600">{rec.rejectionReason || "-"}</td>
                                        <td className="p-3 text-center">
                                            {rec.checkInTime && rec.checkOutTime ? (
                                                <button
                                                    onClick={() => openEdit(rec)}
                                                    className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs hover:bg-gray-50 inline-flex items-center gap-1"
                                                >
                                                    <Pencil size={12} /> Correct times
                                                </button>
                                            ) : (
                                                <span className="text-xs text-gray-400">Ask admin</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Reject modal */}
            {rejectTarget && (
                <Modal title={`Reject - ${rejectTarget.labourId?.name || "record"}`} onClose={() => setRejectTarget(null)}>
                    <textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        rows={3}
                        placeholder="Reason (required) - the manager will see this"
                        className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-red-400 outline-none"
                    />
                    <div className="flex justify-end gap-2 mt-4">
                        <button onClick={() => setRejectTarget(null)} className="px-4 py-2 text-sm border border-gray-200 rounded-xl">
                            Cancel
                        </button>
                        <button
                            onClick={submitReject}
                            disabled={isRejecting}
                            className="px-4 py-2 text-sm bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50"
                        >
                            {isRejecting ? "Rejecting..." : "Reject"}
                        </button>
                    </div>
                </Modal>
            )}

            {/* Correct-times modal */}
            {editTarget && (
                <Modal title={`Correct times - ${editTarget.labourId?.name || ""}`} onClose={() => setEditTarget(null)}>
                    <div className="grid grid-cols-2 gap-3">
                        <label className="text-xs text-gray-500">
                            Check-in
                            <input
                                type="time"
                                value={editForm.checkInTime}
                                onChange={(e) => setEditForm((f) => ({ ...f, checkInTime: e.target.value }))}
                                className="mt-1 w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm"
                            />
                        </label>
                        <label className="text-xs text-gray-500">
                            Check-out
                            <input
                                type="time"
                                value={editForm.checkOutTime}
                                onChange={(e) => setEditForm((f) => ({ ...f, checkOutTime: e.target.value }))}
                                className="mt-1 w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm"
                            />
                        </label>
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                        <button onClick={() => setEditTarget(null)} className="px-4 py-2 text-sm border border-gray-200 rounded-xl">
                            Cancel
                        </button>
                        <button
                            onClick={saveEdit}
                            disabled={isCorrecting}
                            className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50"
                        >
                            {isCorrecting ? "Saving..." : "Save"}
                        </button>
                    </div>
                </Modal>
            )}
        </div>
    );
}