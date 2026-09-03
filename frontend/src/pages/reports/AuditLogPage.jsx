import { useState } from "react";
import { ShieldCheck, ChevronLeft, ChevronRight } from "lucide-react";
import { useGetAuditLogsQuery, useGetProjectsQuery } from "../../Reduxe/Api";
import { CheckRole } from "../../helper/CheckRole";

/**
 * NEW PAGE — wires up GET /api/audit (admin/manager oversight, added on
 * the backend alongside the per-entity AuditHistory component). Supports
 * the same filter set the backend accepts: module, action, projectId,
 * fromDate/toDate, plus pagination.
 */

const MODULES = [
    "LabourAssignment", "LabourOvertime", "LabourAttendance",
    "StockRequest", "StockTransfer", "Procurement", "StockReceipt",
    "StockLedger", "GRN", "PurchaseOrder", "Inventory",
    "DrawingRequest", "DrawingVersion",
    "MachineRequest", "MachineDocument", "MachineOperatorLog", "MachineMaintenance",
    "EODReport", "ProjectDelay",
];

export default function AuditLogPage() {
    const { role } = CheckRole();
    const [page, setPage] = useState(1);
    const [filters, setFilters] = useState({ module: "", projectId: "", fromDate: "", toDate: "" });

    const { data: projectResp } = useGetProjectsQuery();
    

    const { data, isLoading } = useGetAuditLogsQuery({ page, limit: 20, ...filters });
    const logs = data?.data || [];
    const pagination = data?.pagination || {};

    const setFilter = (k) => (e) => {
        setPage(1);
        setFilters((f) => ({ ...f, [k]: e.target.value }));
    };

    if (!["admin", "manager"].includes(role)) {
        return <div className="p-6 text-sm text-gray-500">You don't have access to the audit log.</div>;
    }

    return (
        <div className="p-4 lg:p-6 max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2 mb-6">
                <ShieldCheck className="text-blue-800" size={26} /> Audit Log
            </h1>

            <div className="flex flex-wrap gap-3 mb-6">
                <select value={filters.module} onChange={setFilter("module")} className="border rounded-lg px-3 py-2 text-sm">
                    <option value="">All modules</option>
                    {MODULES.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
                <select value={filters.projectId} onChange={setFilter("projectId")} className="border rounded-lg px-3 py-2 text-sm">
                    <option value="">All projects</option>
                    {projectResp?.data?.map((p) => <option key={p._id} value={p._id}>{p.projectName || p.name}</option>)}
                </select>
                <input type="date" value={filters.fromDate} onChange={setFilter("fromDate")} className="border rounded-lg px-3 py-2 text-sm" />
                <input type="date" value={filters.toDate} onChange={setFilter("toDate")} className="border rounded-lg px-3 py-2 text-sm" />
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-blue-900 text-white text-xs uppercase">
                        <tr>
                            <th className="px-4 py-3 text-left">When</th>
                            <th className="px-4 py-3 text-left">Module</th>
                            <th className="px-4 py-3 text-left">Action</th>
                            <th className="px-4 py-3 text-left">By</th>
                            <th className="px-4 py-3 text-left">Project</th>
                            <th className="px-4 py-3 text-left">Remarks</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {isLoading && (
                            <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">Loading…</td></tr>
                        )}
                        {!isLoading && logs.length === 0 && (
                            <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No audit entries found</td></tr>
                        )}
                        {logs.map((l) => (
                            <tr key={l._id}>
                                <td className="px-4 py-3 whitespace-nowrap text-gray-500">
                                    {l.createdAt ? new Date(l.createdAt).toLocaleString() : "-"}
                                </td>
                                <td className="px-4 py-3 font-medium">{l.module}</td>
                                <td className="px-4 py-3 capitalize">{l.action}</td>
                                <td className="px-4 py-3">
                                    {l.performedBy?.name || "-"}
                                    {l.performedBy?.role && <span className="text-gray-400"> ({l.performedBy.role})</span>}
                                </td>
                                <td className="px-4 py-3">{l.projectId?.projectName || "-"}</td>
                                <td className="px-4 py-3 text-gray-500">{l.remarks || "-"}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
                    <span>Page {pagination.page} of {pagination.totalPages} ({pagination.total} entries)</span>
                    <div className="flex gap-2">
                        <button
                            disabled={page <= 1}
                            onClick={() => setPage((p) => p - 1)}
                            className="px-3 py-1.5 rounded-lg border disabled:opacity-40 flex items-center gap-1"
                        >
                            <ChevronLeft size={14} /> Prev
                        </button>
                        <button
                            disabled={page >= pagination.totalPages}
                            onClick={() => setPage((p) => p + 1)}
                            className="px-3 py-1.5 rounded-lg border disabled:opacity-40 flex items-center gap-1"
                        >
                            Next <ChevronRight size={14} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
