import { useState } from "react";
import { History, ArrowRightLeft, Clock, CalendarCheck } from "lucide-react";
import { useGetLabourQuery, useGetLabourFullHistoryQuery } from "../../Reduxe/Api";

/**
 * NEW PAGE — UI for GET /api/labour/:id/full-history (getLabourFullHistory),
 * the single aggregate endpoint added on the backend. Previously the only
 * way to see a labour's complete picture was to check assignment history,
 * attendance and overtime as three separate lookups.
 */
export default function LabourFullHistory() {
    const { data: labourResp } = useGetLabourQuery();
    const labours = labourResp?.data || labourResp?.labours || labourResp || [];

    const [labourId, setLabourId] = useState("");
    const { data, isFetching } = useGetLabourFullHistoryQuery(labourId, { skip: !labourId });
    const result = data?.data;

    return (
        <div className="p-4 lg:p-6 max-w-5xl mx-auto">
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2 mb-6">
                <History className="text-blue-800" size={26} /> Labour Full History
            </h1>

            <select
                value={labourId}
                onChange={(e) => setLabourId(e.target.value)}
                className="border rounded-lg px-3 py-2 text-sm mb-6 w-full max-w-sm"
            >
                <option value="">Select a labour…</option>
                {labours.map((l) => (
                    <option key={l._id} value={l._id}>{l.name} {l.phone ? `(${l.phone})` : ""}</option>
                ))}
            </select>

            {!labourId && <p className="text-sm text-gray-400">Select a labour above to see their complete history.</p>}
            {isFetching && <p className="text-sm text-gray-400">Loading…</p>}

            {result && (
                <div className="space-y-8">
                    <div className="bg-white rounded-2xl border border-gray-200 p-5">
                        <h2 className="font-bold text-gray-900 text-lg">{result.labour?.name}</h2>
                        <p className="text-sm text-gray-500">
                            {result.labour?.phone} · {result.labour?.labourType || "-"} · {result.labour?.skillLevel || "-"}
                        </p>
                    </div>

                    <Section title="Assignments" icon={ArrowRightLeft} count={result.assignments?.length}>
                        <SimpleTable
                            rows={result.assignments}
                            cols={[
                                { h: "Project", v: (r) => r.projectId?.projectName || "-" },
                                { h: "From Project", v: (r) => r.previousProjectId?.projectName || "-" },
                                { h: "Status", v: (r) => r.status },
                                { h: "Assigned By", v: (r) => r.assignedBy?.name || "-" },
                                { h: "Date", v: (r) => r.assignmentDate ? new Date(r.assignmentDate).toLocaleDateString() : "-" },
                            ]}
                        />
                    </Section>

                    <Section title="Transfers" icon={ArrowRightLeft} count={result.transfers?.length}>
                        <SimpleTable
                            rows={result.transfers}
                            cols={[
                                { h: "From", v: (r) => r.previousProjectId?.projectName || "-" },
                                { h: "To", v: (r) => r.projectId?.projectName || "-" },
                                { h: "Transferred By", v: (r) => r.transferredBy?.name || "-" },
                                { h: "Date", v: (r) => r.assignmentDate ? new Date(r.assignmentDate).toLocaleDateString() : "-" },
                            ]}
                        />
                    </Section>

                    <Section title="Attendance" icon={CalendarCheck} count={result.attendance?.length}>
                        <SimpleTable
                            rows={result.attendance}
                            cols={[
                                { h: "Date", v: (r) => r.date ? new Date(r.date).toLocaleDateString() : "-" },
                                { h: "Project", v: (r) => r.projectId?.projectName || "-" },
                                { h: "Status", v: (r) => r.status || "-" },
                                { h: "Check In", v: (r) => r.timeIn || "-" },
                                { h: "Check Out", v: (r) => r.timeOut || "-" },
                            ]}
                        />
                    </Section>

                    <Section title="Overtime" icon={Clock} count={result.overtime?.length}>
                        <SimpleTable
                            rows={result.overtime}
                            cols={[
                                { h: "Date", v: (r) => r.date ? new Date(r.date).toLocaleDateString() : "-" },
                                { h: "Hours", v: (r) => r.overtimeHours ?? r.approvedOvertimeHours ?? 0 },
                                { h: "Status", v: (r) => r.overtimeApprovalStatus || "-" },
                                { h: "Rejection Reason", v: (r) => r.overtimeRejectionReason || "-" },
                            ]}
                        />
                    </Section>
                </div>
            )}
        </div>
    );
}

function Section({ title, icon: Icon, count, children }) {
    return (
        <div>
            <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-1.5 mb-2">
                <Icon size={14} /> {title} {typeof count === "number" && <span className="text-gray-400">({count})</span>}
            </h3>
            {children}
        </div>
    );
}

function SimpleTable({ rows, cols }) {
    if (!rows || rows.length === 0) {
        return <p className="text-xs text-gray-400 bg-white border border-gray-200 rounded-xl p-4">No records</p>;
    }
    return (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-x-auto">
            <table className="w-full text-sm">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                    <tr>{cols.map((c) => <th key={c.h} className="px-4 py-2 text-left">{c.h}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {rows.map((r, i) => (
                        <tr key={r._id || i}>
                            {cols.map((c) => <td key={c.h} className="px-4 py-2">{c.v(r)}</td>)}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
