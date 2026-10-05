import { useMemo } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Search, Gauge, Fuel, HardHat, AlertTriangle, LayoutGrid, Rows3, Factory } from "lucide-react";
import { useGetAllMachinesQuery } from "../../Reduxe/Api";
import { CheckRole } from "../../helper/CheckRole";
import {
    MachinePage,
    StatusBadge,
    Badge,
    EmptyState,
    Spinner,
    MACHINE_STATUSES,
    projectLabel,
    fmtDate,
    daysUntil,
    isRented,
    btnPrimary,
    btnGhost,
} from "../../components/machine/machineUi";
import MaintenanceDueBanner from "./MaintenanceDueBanner";
import { getFileUrl } from "../../utils/fileUrl";

function ExpiryChip({ label, date }) {
    const d = daysUntil(date);
    if (d === null) return null;
    const tone = d < 0 ? "red" : d <= 30 ? "amber" : "green";
    const text = d < 0 ? "Expired" : d <= 30 ? `${d}d left` : fmtDate(date);
    return <Badge tone={tone}>{label}: {text}</Badge>;
}

export default function MachineList() {
    const navigate = useNavigate();
    const { role } = CheckRole();
    const canManage = role === "admin" || role === "manager";
    const [params, setParams] = useSearchParams();
    const { data, isLoading, isError } = useGetAllMachinesQuery();

    const search = params.get("q") || "";
    const status = params.get("status") || "";
    const ownership = params.get("ownership") || "";
    const type = params.get("type") || "";
    const view = params.get("view") || "grid";

    const setParam = (key, value) => {
        const next = new URLSearchParams(params);
        value ? next.set(key, value) : next.delete(key);
        setParams(next, { replace: true });
    };

    const machines = useMemo(() => data?.machines || [], [data]);
    const types = useMemo(() => [...new Set(machines.map((m) => m.machineType).filter(Boolean))].sort(), [machines]);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        return machines.filter((m) => {
            if (status && m.status !== status) return false;
            if (type && m.machineType !== type) return false;
            if (ownership && String(m.ownedOrRented).toLowerCase() !== ownership) return false;
            if (!q) return true;
            return [m.machineNumber, m.brand, m.model, m.machineType, m.engineNumber, m.chassisNumber]
                .filter(Boolean)
                .some((v) => String(v).toLowerCase().includes(q));
        });
    }, [machines, search, status, type, ownership]);

    const hasFilters = search || status || type || ownership;

    const inputCls =
        "rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500";

    return (
        <MachinePage
            title="Machines"
            subtitle={`${filtered.length} of ${machines.length} machines`}
            actions={
                canManage && (
                    <>
                        <button className={btnGhost} onClick={() => navigate("/assign")}>Assign Machine</button>
                        <button className={btnPrimary} onClick={() => navigate("/machine/add")}>+ Add Machine</button>
                    </>
                )
            }
        >
            <MaintenanceDueBanner />

            {/* Filters */}
            <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-3 shadow-sm lg:flex-row lg:items-center">
                <div className="relative flex-1">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        value={search}
                        onChange={(e) => setParam("q", e.target.value)}
                        placeholder="Search number, brand, model, engine / chassis no."
                        className={`${inputCls} w-full pl-9`}
                    />
                </div>
                <select value={status} onChange={(e) => setParam("status", e.target.value)} className={inputCls}>
                    <option value="">All statuses</option>
                    {MACHINE_STATUSES.map((s) => <option key={s}>{s}</option>)}
                </select>
                <select value={type} onChange={(e) => setParam("type", e.target.value)} className={inputCls}>
                    <option value="">All types</option>
                    {types.map((t) => <option key={t}>{t}</option>)}
                </select>
                <select value={ownership} onChange={(e) => setParam("ownership", e.target.value)} className={inputCls}>
                    <option value="">Owned + Rented</option>
                    <option value="owned">Owned</option>
                    <option value="rented">Rented</option>
                </select>
                <div className="flex rounded-lg border border-gray-300 bg-white p-0.5">
                    {[["grid", LayoutGrid], ["table", Rows3]].map(([v, Icon]) => (
                        <button
                            key={v}
                            onClick={() => setParam("view", v === "grid" ? "" : v)}
                            className={`rounded-md p-2 ${view === v ? "bg-blue-600 text-white" : "text-gray-500 hover:bg-gray-100"}`}
                            title={`${v} view`}
                        >
                            <Icon size={16} />
                        </button>
                    ))}
                </div>
                {hasFilters && (
                    <button onClick={() => setParams({}, { replace: true })} className="text-sm font-medium text-blue-600 hover:underline">
                        Clear
                    </button>
                )}
            </div>

            {isLoading ? (
                <Spinner />
            ) : isError ? (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">Could not load machines.</div>
            ) : filtered.length === 0 ? (
                <EmptyState title={machines.length === 0 ? "No machines added yet" : "No machines match these filters"}>
                    {machines.length === 0 && canManage && (
                        <button className={btnPrimary} onClick={() => navigate("/machine/add")}>Add your first machine</button>
                    )}
                </EmptyState>
            ) : view === "table" ? (
                <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                        <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                            <tr>
                                {["Machine", "Type", "Status", "Ownership", "Project / Operator", "Meter", "RC / Insurance"].map((h) => (
                                    <th key={h} className="px-4 py-3">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filtered.map((m) => (
                                <tr key={m._id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3">
                                        <Link to={`/machine/${m._id}`} className="font-semibold text-blue-700 hover:underline">{m.machineNumber}</Link>
                                        <p className="text-xs text-gray-400">{[m.brand, m.model].filter(Boolean).join(" ")}</p>
                                    </td>
                                    <td className="px-4 py-3">{m.machineType || "—"}</td>
                                    <td className="px-4 py-3"><StatusBadge status={m.status} /></td>
                                    <td className="px-4 py-3"><Badge tone={isRented(m) ? "purple" : "blue"}>{isRented(m) ? "Rented" : "Owned"}</Badge></td>
                                    <td className="px-4 py-3">
                                        {m.activeAssignment ? (
                                            <>
                                                <p className="font-medium">{projectLabel(m.activeAssignment.projectId)}</p>
                                                <p className="text-xs text-gray-400">{m.activeAssignment.operatorId?.name || "No operator"}</p>
                                            </>
                                        ) : "—"}
                                    </td>
                                    <td className="px-4 py-3">{m.currentMeterReading ?? 0} h</td>
                                    <td className="space-x-1 px-4 py-3">
                                        <ExpiryChip label="RC" date={m.rcExpiry} />
                                        <ExpiryChip label="Ins" date={m.insuranceExpiry} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {filtered.map((m) => (
                        <Link
                            key={m._id}
                            to={`/machine/${m._id}`}
                            className="group overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:border-blue-300 hover:shadow-md"
                        >
                            <div className="flex h-36 items-center justify-center bg-gray-100">
                                {m.photo || m.photos?.[0]?.url ? (
                                    <img src={getFileUrl(m.photo || m.photos[0].url)} alt={m.machineNumber} className="h-full w-full object-cover" />
                                ) : (
                                    <Factory size={40} className="text-gray-300" />
                                )}
                            </div>
                            <div className="space-y-3 p-4">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0">
                                        <h3 className="truncate font-bold text-gray-900 group-hover:text-blue-700">{m.machineNumber}</h3>
                                        <p className="truncate text-sm text-gray-500">
                                            {[m.machineType, m.brand, m.model].filter(Boolean).join(" · ") || "—"}
                                        </p>
                                    </div>
                                    <StatusBadge status={m.status} />
                                </div>

                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                                    <span className="flex items-center gap-1"><Gauge size={13} />{m.currentMeterReading ?? 0} h</span>
                                    <span className="flex items-center gap-1"><Fuel size={13} />{m.currentFuelLevel ?? 0} L</span>
                                    <Badge tone={isRented(m) ? "purple" : "blue"}>{isRented(m) ? "Rented" : "Owned"}</Badge>
                                    {!m.active && <Badge tone="red">Inactive</Badge>}
                                </div>

                                {m.activeAssignment && (
                                    <div className="rounded-lg bg-blue-50 p-2.5 text-xs">
                                        <p className="font-semibold text-blue-800">{projectLabel(m.activeAssignment.projectId)}</p>
                                        <p className="mt-0.5 flex items-center gap-1 text-blue-600">
                                            <HardHat size={12} /> {m.activeAssignment.operatorId?.name || "No operator assigned"}
                                        </p>
                                    </div>
                                )}

                                {(m.rcExpiry || m.insuranceExpiry) && (
                                    <div className="flex flex-wrap items-center gap-1.5 border-t border-gray-100 pt-3">
                                        {(daysUntil(m.rcExpiry) < 30 || daysUntil(m.insuranceExpiry) < 30) && (
                                            <AlertTriangle size={14} className="text-amber-500" />
                                        )}
                                        <ExpiryChip label="RC" date={m.rcExpiry} />
                                        <ExpiryChip label="Insurance" date={m.insuranceExpiry} />
                                    </div>
                                )}
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </MachinePage>
    );
}
