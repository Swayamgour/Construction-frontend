import React, { useState } from "react";
import { BarChart3, Clock, Boxes, Truck, AlertTriangle, CalendarCheck, LayoutDashboard } from "lucide-react";
import {
    useGetLabourOvertimeReportQuery,
    useGetStockReportQuery,
    useGetMachineryReportQuery,
    useGetProjectDelaysReportQuery,
    useGetEODReportSummaryQuery,
    useGetProjectDashboardQuery,
    useGetProjectsQuery,
} from "../../Reduxe/Api";

/**
 * NEW PAGE — surfaces the /api/reports/* module, which had zero frontend
 * before this. Tabbed so each report keeps its own filters/table without
 * six separate routes.
 */

const TABS = [
    { key: "overtime", label: "Labour Overtime", icon: Clock },
    { key: "stock", label: "Stock", icon: Boxes },
    { key: "machinery", label: "Machinery", icon: Truck },
    { key: "delays", label: "Project Delays", icon: AlertTriangle },
    { key: "eod", label: "EOD Summary", icon: CalendarCheck },
    { key: "dashboard", label: "Project Dashboard", icon: LayoutDashboard },
];

const Card = ({ label, value }) => (
    <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
        <div className="text-xl font-bold text-slate-900">{value}</div>
        <div className="text-xs text-gray-500 mt-1">{label}</div>
    </div>
);

const Table = ({ headers, rows }) => (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-x-auto mt-4">
        <table className="w-full text-sm">
            <thead className="bg-blue-900 text-white text-xs uppercase">
                <tr>{headers.map((h) => <th key={h} className="px-4 py-3 text-left">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
                {rows.length === 0 && (
                    <tr><td colSpan={headers.length} className="px-4 py-8 text-center text-gray-400">No data for this filter</td></tr>
                )}
                {rows}
            </tbody>
        </table>
    </div>
);

const OvertimeReport = ({ projectId }) => {
    const { data, isLoading } = useGetLabourOvertimeReportQuery({ project: projectId || undefined });
    const items = data?.data?.items || [];
    const summary = data?.data?.summary || {};
    if (isLoading) return <p className="text-sm text-gray-400 py-8 text-center">Loading…</p>;
    return (
        <>
            <div className="grid grid-cols-2 gap-4">
                <Card label="Total Overtime Hours" value={summary.totalOvertimeHours || 0} />
                <Card label="Total Overtime Amount" value={`₹${(summary.totalOvertimeAmount || 0).toLocaleString()}`} />
            </div>
            <Table
                headers={["Labour", "Project", "Date", "OT Hours", "Status"]}
                rows={items.map((r) => (
                    <tr key={r._id}>
                        <td className="px-4 py-3">{r.labourId?.name || "-"}</td>
                        <td className="px-4 py-3">{r.projectId?.projectName || "-"}</td>
                        <td className="px-4 py-3">{r.date ? new Date(r.date).toLocaleDateString() : "-"}</td>
                        <td className="px-4 py-3">{r.overtimeHours}</td>
                        <td className="px-4 py-3">{r.overtimeApprovalStatus || "-"}</td>
                    </tr>
                ))}
            />
        </>
    );
};

const StockReport = ({ projectId }) => {
    const { data, isLoading } = useGetStockReportQuery({ project: projectId || undefined });
    const items = data?.data?.items || [];
    const summaryByType = data?.data?.summaryByType || [];
    if (isLoading) return <p className="text-sm text-gray-400 py-8 text-center">Loading…</p>;
    return (
        <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {summaryByType.map((s) => (
                    <Card key={s._id} label={s._id || "Unspecified"} value={`In ${s.totalIn || 0} / Out ${s.totalOut || 0}`} />
                ))}
            </div>
            <Table
                headers={["Item", "Project", "Type", "Qty In", "Qty Out", "Date"]}
                rows={items.map((r) => (
                    <tr key={r._id}>
                        <td className="px-4 py-3">{r.itemId?.name || "-"}</td>
                        <td className="px-4 py-3">{r.projectId?.projectName || "-"}</td>
                        <td className="px-4 py-3">{r.transactionType || "-"}</td>
                        <td className="px-4 py-3">{r.qtyIn || 0}</td>
                        <td className="px-4 py-3">{r.qtyOut || 0}</td>
                        <td className="px-4 py-3">{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "-"}</td>
                    </tr>
                ))}
            />
        </>
    );
};

const MachineryReport = ({ projectId }) => {
    const { data, isLoading } = useGetMachineryReportQuery({ project: projectId || undefined });
    const logs = data?.data?.operatorLogs || [];
    const totalMaintCost = data?.data?.totalMaintenanceCost || 0;
    if (isLoading) return <p className="text-sm text-gray-400 py-8 text-center">Loading…</p>;
    return (
        <>
            <Card label="Total Maintenance Cost" value={`₹${totalMaintCost.toLocaleString()}`} />
            <Table
                headers={["Machine", "Operator", "Date"]}
                rows={logs.map((r) => (
                    <tr key={r._id}>
                        <td className="px-4 py-3">{r.machineId?.machineNumber || "-"} ({r.machineId?.machineType || "-"})</td>
                        <td className="px-4 py-3">{r.operatorId?.name || "-"}</td>
                        <td className="px-4 py-3">{r.date ? new Date(r.date).toLocaleDateString() : "-"}</td>
                    </tr>
                ))}
            />
        </>
    );
};

const DelaysReport = ({ projectId }) => {
    const { data, isLoading } = useGetProjectDelaysReportQuery({ project: projectId || undefined });
    const items = data?.data?.items || [];
    const summary = data?.data?.summary || [];
    if (isLoading) return <p className="text-sm text-gray-400 py-8 text-center">Loading…</p>;
    return (
        <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {summary.map((s) => (
                    <Card key={s._id} label={s._id || "Unknown"} value={`${s.count} (Actual ${s.totalActualDays}d)`} />
                ))}
            </div>
            <Table
                headers={["Project", "Type", "Delay Date", "Est. Days", "Actual Days", "Status"]}
                rows={items.map((r) => (
                    <tr key={r._id}>
                        <td className="px-4 py-3">{r.projectId?.projectName || "-"}</td>
                        <td className="px-4 py-3">{r.delayType?.name || "-"}</td>
                        <td className="px-4 py-3">{r.delayDate ? new Date(r.delayDate).toLocaleDateString() : "-"}</td>
                        <td className="px-4 py-3">{r.estimatedDelayDays ?? "-"}</td>
                        <td className="px-4 py-3">{r.actualDelayDays ?? "-"}</td>
                        <td className="px-4 py-3">{r.status || "-"}</td>
                    </tr>
                ))}
            />
        </>
    );
};

const EODSummary = ({ projectId }) => {
    const { data, isLoading } = useGetEODReportSummaryQuery({ project: projectId || undefined });
    const items = data?.data || [];
    if (isLoading) return <p className="text-sm text-gray-400 py-8 text-center">Loading…</p>;
    return (
        <Table
            headers={["Project", "Submitted By", "Date", "Status"]}
            rows={items.map((r) => (
                <tr key={r._id}>
                    <td className="px-4 py-3">{r.projectId?.projectName || "-"}</td>
                    <td className="px-4 py-3">{r.submittedBy?.name || "-"} ({r.submittedBy?.role || "-"})</td>
                    <td className="px-4 py-3">{r.date ? new Date(r.date).toLocaleDateString() : "-"}</td>
                    <td className="px-4 py-3">{r.status || "-"}</td>
                </tr>
            ))}
        />
    );
};

const ProjectDashboardReport = ({ projectId }) => {
    const { data, isLoading } = useGetProjectDashboardQuery(projectId, { skip: !projectId });
    if (!projectId) return <p className="text-sm text-gray-400 py-8 text-center">Select a project above to see its dashboard</p>;
    if (isLoading) return <p className="text-sm text-gray-400 py-8 text-center">Loading…</p>;
    const d = data?.data || {};
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Card label="Critical Issues" value={d.criticalIssues ?? 0} />
                <Card label="Total Delay Days" value={d.totalActiveDelayDays ?? 0} />
                <Card label="Labour Available" value={d.labourAvailable ?? 0} />
                <Card label="Machines Available" value={d.machinesAvailable ?? 0} />
            </div>
            {d.latestEODStatus && (
                <div className="bg-white rounded-xl border border-gray-200 p-4 text-sm">
                    <p className="font-semibold text-slate-800 mb-1">Latest EOD</p>
                    <p>Date: {new Date(d.latestEODStatus.date).toLocaleDateString()} • Status: {d.latestEODStatus.status}</p>
                    {d.latestEODStatus.issues && <p className="text-gray-500 mt-1">Issues: {d.latestEODStatus.issues}</p>}
                </div>
            )}
            <Table
                headers={["Material", "Requested", "Fulfilled", "Status"]}
                rows={(d.materialShortages || []).map((m) => (
                    <tr key={m._id}>
                        <td className="px-4 py-3">{m.materialName}</td>
                        <td className="px-4 py-3">{m.quantity}</td>
                        <td className="px-4 py-3">{m.fulfilledQty || 0}</td>
                        <td className="px-4 py-3">{m.status}</td>
                    </tr>
                ))}
            />
        </div>
    );
};

const ReportsHub = () => {
    const [tab, setTab] = useState("overtime");
    const [projectId, setProjectId] = useState("");
    const { data: projectResp } = useGetProjectsQuery();
    const projects = projectResp?.data || projectResp || [];

    return (
        <div className="p-4 lg:p-6 max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <BarChart3 className="text-blue-800" size={26} /> Reports & Dashboard
                </h1>
                <select
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
                >
                    <option value="">All Projects</option>
                    {projects?.map((p) => (
                        <option key={p._id} value={p._id}>{p.projectName || p.name}</option>
                    ))}
                </select>
            </div>

            <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200 pb-2">
                {TABS.map((t) => {
                    const Icon = t.icon;
                    return (
                        <button
                            key={t.key}
                            onClick={() => setTab(t.key)}
                            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition ${
                                tab === t.key ? "bg-blue-900 text-white" : "text-gray-600 hover:bg-gray-100"
                            }`}
                        >
                            <Icon size={15} /> {t.label}
                        </button>
                    );
                })}
            </div>

            {tab === "overtime" && <OvertimeReport projectId={projectId} />}
            {tab === "stock" && <StockReport projectId={projectId} />}
            {tab === "machinery" && <MachineryReport projectId={projectId} />}
            {tab === "delays" && <DelaysReport projectId={projectId} />}
            {tab === "eod" && <EODSummary projectId={projectId} />}
            {tab === "dashboard" && <ProjectDashboardReport projectId={projectId} />}
        </div>
    );
};

export default ReportsHub;
