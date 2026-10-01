import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
    ArrowLeft,
    Camera,
    CheckCircle2,
    Clock3,
    Loader2,
    LogIn,
    LogOut,
    Pencil,
    RefreshCw,
    UserX,
    Users,
    X,
} from "lucide-react";
import {
    useAttendanceMarkMutation,
    useBulkMarkLabourMutation,
    useCorrectOvertimeMutation,
    useGetLabourTodayStatusQuery,
    useGetProjectsQuery,
    usePunchInLabourMutation,
    usePunchOutLabourMutation,
} from "../../Reduxe/Api";
import { getAvatarGradient, getInitials } from "../../helper/avatar";

/* ------------------------------------------------------------------ *
 * Backend contract (labourAttendanceController.js)
 *  - GET  attendance/labour/today-status?projectId   -> data: [{ labour, attendance, state }]
 *  - POST attendance/labour/punch-in   { projectId, labourId, checkInTime?"HH:mm", latitude?, longitude? } (+ selfie file)
 *  - POST attendance/labour/punch-out  { projectId, labourId, checkOutTime?"HH:mm" }
 *  - POST attendance/labour/mark       { projectId, labourId, status }  (Absent / Half-Day)
 *  - POST attendance/labour/mark-bulk  { projectId, attendance:[{labourId,status}] }
 *  - Attendance can only be marked for TODAY. Times must be "HH:mm"
 *    (<input type="time"> already gives that). Empty time = server's current time.
 * ------------------------------------------------------------------ */

const errMsg = (e, fallback) => e?.data?.message || e?.message || fallback;

const STATE_STYLE = {
    "Not Marked": "bg-gray-100 text-gray-600",
    "Punched In": "bg-blue-100 text-blue-700",
    Completed: "bg-emerald-100 text-emerald-700",
    Absent: "bg-red-100 text-red-700",
};

const APPROVAL_STYLE = {
    Pending: "bg-amber-100 text-amber-700",
    Approved: "bg-emerald-100 text-emerald-700",
    Rejected: "bg-red-100 text-red-700",
};

const OT_STYLE = {
    Pending: "bg-amber-100 text-amber-700",
    Approved: "bg-emerald-100 text-emerald-700",
    Rejected: "bg-red-100 text-red-700",
};

const Badge = ({ children, className = "" }) => (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${className}`}>
        {children}
    </span>
);

const StatCard = ({ label, value, tone }) => (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
        <p className="text-xs text-gray-500">{label}</p>
        <p className={`text-2xl font-bold mt-1 ${tone}`}>{value}</p>
    </div>
);

export default function ProjectAttendancePage() {
    const { projectId } = useParams();
    const navigate = useNavigate();

    const { data: projectResp } = useGetProjectsQuery();
    const projects = projectResp?.data || projectResp || [];
    const project = Array.isArray(projects) ? projects.find((p) => p._id === projectId) : null;

    const { data, isLoading, isFetching, refetch } = useGetLabourTodayStatusQuery(projectId, {
        skip: !projectId,
    });
    const rows = data?.data || [];

    const [punchIn] = usePunchInLabourMutation();
    const [punchOut] = usePunchOutLabourMutation();
    const [markSingle] = useAttendanceMarkMutation();
    const [bulkMark] = useBulkMarkLabourMutation();
    const [correct, { isLoading: isCorrecting }] = useCorrectOvertimeMutation();

    const [times, setTimes] = useState({}); // labourId -> "HH:mm" (optional)
    const [selfies, setSelfies] = useState({}); // labourId -> File (optional)
    const [selected, setSelected] = useState([]); // labourIds (only "Not Marked")
    const [busy, setBusy] = useState(null); // labourId | "bulk"
    const [editing, setEditing] = useState(null); // { attendance, labour }
    const [editForm, setEditForm] = useState({ checkInTime: "", checkOutTime: "" });

    // GPS is optional - punch-in works without it
    const coords = useRef({});
    useEffect(() => {
        if (!navigator.geolocation) return;
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                coords.current = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
            },
            () => { },
            { timeout: 8000 }
        );
    }, []);

    // keep selection valid after every refetch
    useEffect(() => {
        const open = new Set(rows.filter((r) => r.state === "Not Marked").map((r) => r.labour._id));
        setSelected((prev) => prev.filter((id) => open.has(id)));
    }, [data]); // eslint-disable-line react-hooks/exhaustive-deps

    const stats = useMemo(() => {
        const by = (s) => rows.filter((r) => r.state === s).length;
        return {
            total: rows.length,
            notMarked: by("Not Marked"),
            punchedIn: by("Punched In"),
            completed: by("Completed"),
            absent: by("Absent"),
            pending: rows.filter((r) => r.attendance?.approvalStatus === "Pending").length,
        };
    }, [rows]);

    const notMarkedIds = rows.filter((r) => r.state === "Not Marked").map((r) => r.labour._id);

    /* ------------------------------ actions ------------------------------ */

    const buildPunchInBody = (labourId) => {
        const base = { projectId, labourId, ...coords.current };
        if (times[labourId]) base.checkInTime = times[labourId];

        const file = selfies[labourId];
        if (!file) return base;

        const fd = new FormData();
        Object.entries(base).forEach(([k, v]) => fd.append(k, v));
        fd.append("selfie", file);
        return fd;
    };

    const handlePunchIn = async (labour) => {
        try {
            setBusy(labour._id);
            await punchIn(buildPunchInBody(labour._id)).unwrap();
            toast.success(`${labour.name} punched in`);
            clearRowInput(labour._id);
        } catch (e) {
            toast.error(errMsg(e, "Punch-in failed"));
        } finally {
            setBusy(null);
        }
    };

    const handlePunchOut = async (labour) => {
        try {
            setBusy(labour._id);
            const body = { projectId, labourId: labour._id };
            if (times[labour._id]) body.checkOutTime = times[labour._id];
            const res = await punchOut(body).unwrap();
            const ot = res?.attendance?.overtimeHours;
            toast.success(ot > 0 ? `${labour.name} punched out - ${ot}h overtime sent to admin` : `${labour.name} punched out`);
            clearRowInput(labour._id);
        } catch (e) {
            toast.error(errMsg(e, "Punch-out failed"));
        } finally {
            setBusy(null);
        }
    };

    const handleMark = async (labour, status) => {
        try {
            setBusy(labour._id);
            await markSingle({ projectId, labourId: labour._id, status }).unwrap();
            toast.success(`${labour.name} marked ${status}`);
        } catch (e) {
            toast.error(errMsg(e, "Could not mark attendance"));
        } finally {
            setBusy(null);
        }
    };

    const clearRowInput = (id) => {
        setTimes((p) => {
            const n = { ...p };
            delete n[id];
            return n;
        });
        setSelfies((p) => {
            const n = { ...p };
            delete n[id];
            return n;
        });
    };

    const bulkPunchIn = async () => {
        if (selected.length === 0) return;
        setBusy("bulk");
        const results = await Promise.allSettled(
            selected.map((id) => punchIn(buildPunchInBody(id)).unwrap())
        );
        const ok = results.filter((r) => r.status === "fulfilled").length;
        const failed = results.filter((r) => r.status === "rejected");

        if (ok) toast.success(`${ok} punched in`);
        if (failed.length) toast.error(`${failed.length} failed: ${errMsg(failed[0].reason, "error")}`);
        setSelected([]);
        setBusy(null);
    };

    const bulkMarkStatus = async (status) => {
        if (selected.length === 0) return;
        try {
            setBusy("bulk");
            const res = await bulkMark({
                projectId,
                attendance: selected.map((labourId) => ({ labourId, status })),
            }).unwrap();
            toast.success(`${res.upserted + res.modified} marked ${status}`);
            if (res.skipped?.length) toast.error(`${res.skipped.length} skipped: ${res.skipped[0].reason}`);
            setSelected([]);
        } catch (e) {
            toast.error(errMsg(e, "Bulk mark failed"));
        } finally {
            setBusy(null);
        }
    };

    const toggle = (id) =>
        setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

    const toggleAll = () =>
        setSelected((prev) => (prev.length === notMarkedIds.length ? [] : notMarkedIds));

    const openEdit = (row) => {
        setEditing(row);
        setEditForm({
            checkInTime: row.attendance.checkInTime || "",
            checkOutTime: row.attendance.checkOutTime || "",
        });
    };

    const saveEdit = async () => {
        try {
            await correct({
                id: editing.attendance._id,
                checkInTime: editForm.checkInTime || undefined,
                checkOutTime: editForm.checkOutTime || undefined,
            }).unwrap();
            toast.success("Times corrected - sent back for admin approval");
            setEditing(null);
        } catch (e) {
            toast.error(errMsg(e, "Could not correct times"));
        }
    };

    /* ------------------------------ render ------------------------------- */

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] gap-3 text-gray-500">
                <Loader2 className="animate-spin" size={22} />
                <p className="text-sm">Loading labours...</p>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50"
                        aria-label="Back"
                    >
                        <ArrowLeft size={16} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">
                            {project?.projectName || "Project"} - Attendance
                        </h1>
                        <p className="text-sm text-gray-500">
                            Today, {new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                            {" "}- attendance can be marked for today only
                        </p>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={refetch}
                        className="px-3 py-2 border border-gray-200 rounded-xl text-sm hover:bg-gray-50 flex items-center gap-2"
                    >
                        <RefreshCw size={14} className={isFetching ? "animate-spin" : ""} /> Refresh
                    </button>
                    <button
                        onClick={() => navigate("/attendance/pending")}
                        className="px-3 py-2 bg-indigo-600 text-white rounded-xl text-sm hover:bg-indigo-700"
                    >
                        Approval status
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-6">
                <StatCard label="Total labours" value={stats.total} tone="text-gray-800" />
                <StatCard label="Not marked" value={stats.notMarked} tone="text-gray-600" />
                <StatCard label="Punched in" value={stats.punchedIn} tone="text-blue-600" />
                <StatCard label="Completed" value={stats.completed} tone="text-emerald-600" />
                <StatCard label="Absent" value={stats.absent} tone="text-red-600" />
                <StatCard label="Awaiting admin" value={stats.pending} tone="text-amber-600" />
            </div>

            {rows.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
                    <Users className="mx-auto text-gray-300 mb-3" size={28} />
                    <p className="text-gray-500">No active labour is assigned to this project.</p>
                    <button
                        onClick={() => navigate("/AssignLabour")}
                        className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm hover:bg-indigo-700"
                    >
                        Assign labour
                    </button>
                </div>
            ) : (
                <>
                    {/* Bulk bar */}
                    {notMarkedIds.length > 0 && (
                        <div className="flex flex-wrap items-center gap-2 mb-3 p-3 bg-indigo-50 border border-indigo-100 rounded-2xl">
                            <label className="flex items-center gap-2 text-sm text-gray-700 mr-2">
                                <input
                                    type="checkbox"
                                    checked={selected.length === notMarkedIds.length}
                                    onChange={toggleAll}
                                />
                                Select all not marked ({notMarkedIds.length})
                            </label>
                            <span className="text-sm text-gray-500">{selected.length} selected</span>

                            <div className="flex gap-2 ml-auto">
                                <button
                                    disabled={!selected.length || busy === "bulk"}
                                    onClick={bulkPunchIn}
                                    className="px-3 py-1.5 text-xs bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                                >
                                    Punch in selected
                                </button>
                                <button
                                    disabled={!selected.length || busy === "bulk"}
                                    onClick={() => bulkMarkStatus("Half-Day")}
                                    className="px-3 py-1.5 text-xs bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:opacity-50"
                                >
                                    Half-Day
                                </button>
                                <button
                                    disabled={!selected.length || busy === "bulk"}
                                    onClick={() => bulkMarkStatus("Absent")}
                                    className="px-3 py-1.5 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                                >
                                    Absent
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="overflow-x-auto bg-white border border-gray-100 rounded-2xl shadow-sm">
                        <table className="min-w-full text-sm">
                            <thead className="bg-gray-50 text-gray-600">
                                <tr>
                                    <th className="p-3 w-8"></th>
                                    <th className="p-3 text-left font-medium">Labour</th>
                                    <th className="p-3 text-left font-medium">State</th>
                                    <th className="p-3 text-left font-medium">In</th>
                                    <th className="p-3 text-left font-medium">Out</th>
                                    <th className="p-3 text-left font-medium">Hours / OT</th>
                                    <th className="p-3 text-left font-medium">Admin</th>
                                    <th className="p-3 text-left font-medium">Action</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-100">
                                {rows.map((row) => {
                                    const { labour, attendance: att, state } = row;
                                    const rowBusy = busy === labour._id;
                                    const locked = att?.approvalStatus === "Approved";

                                    return (
                                        <tr key={labour._id} className="hover:bg-gray-50/60 align-top">
                                            <td className="p-3">
                                                {state === "Not Marked" && (
                                                    <input
                                                        type="checkbox"
                                                        checked={selected.includes(labour._id)}
                                                        onChange={() => toggle(labour._id)}
                                                    />
                                                )}
                                            </td>

                                            <td className="p-3">
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className={`w-9 h-9 shrink-0 rounded-xl flex items-center justify-center text-white text-xs font-semibold bg-gradient-to-br ${getAvatarGradient(labour.name)}`}
                                                    >
                                                        {getInitials(labour.name)}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-gray-800">{labour.name}</p>
                                                        <p className="text-xs text-gray-500">
                                                            {labour.phone} {labour.category ? `- ${labour.category}` : ""}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="p-3">
                                                <Badge className={STATE_STYLE[state]}>
                                                    {att?.status === "Half-Day" && state !== "Not Marked" ? `Half-Day / ${state}` : state}
                                                </Badge>
                                            </td>

                                            <td className="p-3 text-gray-700">{att?.checkInTime || "-"}</td>
                                            <td className="p-3 text-gray-700">{att?.checkOutTime || "-"}</td>

                                            <td className="p-3">
                                                {att?.checkOutTime ? (
                                                    <div className="space-y-1">
                                                        <p className="text-gray-800">{att.totalWorkingHours || 0}h</p>
                                                        {att.overtimeHours > 0 && (
                                                            <Badge className={OT_STYLE[att.overtimeApprovalStatus] || "bg-gray-100 text-gray-600"}>
                                                                OT {att.overtimeHours}h - {att.overtimeApprovalStatus}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400">-</span>
                                                )}
                                            </td>

                                            <td className="p-3">
                                                {att ? (
                                                    <div className="space-y-1">
                                                        <Badge className={APPROVAL_STYLE[att.approvalStatus]}>{att.approvalStatus}</Badge>
                                                        {att.approvalStatus === "Rejected" && att.rejectionReason && (
                                                            <p className="text-xs text-red-600 max-w-[180px]">{att.rejectionReason}</p>
                                                        )}
                                                        {att.approvalStatus === "Approved" && (
                                                            <p className="text-xs text-gray-500">Rs {att.dailyWageAmount}</p>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400">-</span>
                                                )}
                                            </td>

                                            <td className="p-3">
                                                {state === "Not Marked" && (
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <input
                                                            type="time"
                                                            value={times[labour._id] || ""}
                                                            onChange={(e) => setTimes((p) => ({ ...p, [labour._id]: e.target.value }))}
                                                            className="border border-gray-200 rounded-lg px-2 py-1 text-xs"
                                                            title="Leave empty to use current time"
                                                        />
                                                        <label
                                                            className={`p-1.5 rounded-lg border cursor-pointer ${selfies[labour._id] ? "border-emerald-400 text-emerald-600" : "border-gray-200 text-gray-400"}`}
                                                            title="Attach selfie (optional)"
                                                        >
                                                            <Camera size={14} />
                                                            <input
                                                                type="file"
                                                                accept="image/*"
                                                                capture="user"
                                                                className="hidden"
                                                                onChange={(e) =>
                                                                    setSelfies((p) => ({ ...p, [labour._id]: e.target.files?.[0] }))
                                                                }
                                                            />
                                                        </label>
                                                        <button
                                                            disabled={rowBusy}
                                                            onClick={() => handlePunchIn(labour)}
                                                            className="px-3 py-1.5 text-xs bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-1"
                                                        >
                                                            <LogIn size={12} /> Punch in
                                                        </button>
                                                        <button
                                                            disabled={rowBusy}
                                                            onClick={() => handleMark(labour, "Half-Day")}
                                                            className="px-3 py-1.5 text-xs bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:opacity-50"
                                                        >
                                                            Half-Day
                                                        </button>
                                                        <button
                                                            disabled={rowBusy}
                                                            onClick={() => handleMark(labour, "Absent")}
                                                            className="px-3 py-1.5 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-1"
                                                        >
                                                            <UserX size={12} /> Absent
                                                        </button>
                                                    </div>
                                                )}

                                                {state === "Punched In" && (
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="time"
                                                            value={times[labour._id] || ""}
                                                            onChange={(e) => setTimes((p) => ({ ...p, [labour._id]: e.target.value }))}
                                                            className="border border-gray-200 rounded-lg px-2 py-1 text-xs"
                                                            title="Leave empty to use current time"
                                                        />
                                                        <button
                                                            disabled={rowBusy}
                                                            onClick={() => handlePunchOut(labour)}
                                                            className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1"
                                                        >
                                                            <LogOut size={12} /> Punch out
                                                        </button>
                                                    </div>
                                                )}

                                                {state === "Completed" && !locked && (
                                                    <button
                                                        onClick={() => openEdit(row)}
                                                        className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center gap-1"
                                                    >
                                                        <Pencil size={12} /> Edit times
                                                    </button>
                                                )}

                                                {(state === "Absent" || locked) && (
                                                    <span className="text-xs text-gray-400 flex items-center gap-1">
                                                        {locked ? <CheckCircle2 size={12} /> : <Clock3 size={12} />}
                                                        {locked ? "Locked" : "Waiting for admin"}
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {/* Edit times modal (PATCH labour/overtime/:id/correct) */}
            {editing && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="bg-white rounded-2xl p-5 w-full max-w-sm shadow-xl">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-gray-800">Correct times - {editing.labour.name}</h3>
                            <button onClick={() => setEditing(null)} className="text-gray-400 hover:text-gray-600">
                                <X size={18} />
                            </button>
                        </div>

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

                        <p className="text-xs text-gray-500 mt-3">
                            Overtime is recalculated and the record goes back to admin for approval.
                        </p>

                        <div className="flex justify-end gap-2 mt-4">
                            <button onClick={() => setEditing(null)} className="px-4 py-2 text-sm border border-gray-200 rounded-xl">
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
                    </div>
                </div>
            )}
        </div>
    );
}