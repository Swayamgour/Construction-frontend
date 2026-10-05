import { useNavigate } from "react-router-dom";
import { Factory, CheckCircle2, Link2, Wrench, AlertOctagon, Truck, FileWarning, Clock, Fuel, IndianRupee } from "lucide-react";
import { useGetMachineDashboardStatsQuery } from "../../Reduxe/Api";
import { MachinePage, KpiCard, Spinner, fmtMoney, btnPrimary, btnGhost } from "../../components/machine/machineUi";
import MaintenanceDueBanner from "./MaintenanceDueBanner";
import { CheckRole } from "../../helper/CheckRole";
import { getMachinePermissions } from "../../helper/machinePermissions";

/**
 * Machinery dashboard — finally uses GET /api/machines/dashboard/stats,
 * which the backend already computed but no screen displayed.
 */
export default function MachineDashboard() {
    const navigate = useNavigate();
    const { role } = CheckRole();
    const permissions = getMachinePermissions(role);
    const { data, isLoading, isError } = useGetMachineDashboardStatsQuery();
    const s = data?.stats || {};

    const fleetTotal = s.totalMachines || 0;
    const pct = (n) => (fleetTotal ? Math.round(((n || 0) / fleetTotal) * 100) : 0);
    const fleetBars = [
        { label: "Available", value: s.available, color: "bg-emerald-500" },
        { label: "Assigned", value: s.assigned, color: "bg-blue-500" },
        { label: "Maintenance", value: s.maintenance, color: "bg-amber-500" },
        { label: "Breakdown", value: s.breakdown, color: "bg-red-500" },
    ];

    return (
        <MachinePage
            title="Machinery Dashboard"
            subtitle="Fleet status, requests, documents and running cost at a glance"
            actions={
                <>
                    <button className={btnGhost} onClick={() => navigate("/machinery/requests")}>Requests</button>
                    {permissions.canAddMachine && (
                        <button className={btnPrimary} onClick={() => navigate("/machine/add")}>+ Add Machine</button>
                    )}
                </>
            }
        >
            {isLoading ? (
                <Spinner />
            ) : isError ? (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    Could not load dashboard stats. You may not have access, or the server is unreachable.
                </div>
            ) : (
                <>
                    <MaintenanceDueBanner />

                    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                        <KpiCard label="Total Machines" value={s.totalMachines ?? 0} icon={Factory} tone="blue" onClick={() => navigate("/machine/list")} />
                        <KpiCard label="Available" value={s.available ?? 0} icon={CheckCircle2} tone="green" hint="Ready to assign" onClick={() => navigate("/machine/list?status=Available")} />
                        <KpiCard label="Assigned" value={s.assigned ?? 0} icon={Link2} tone="purple" hint={`${s.activeAssignments ?? 0} active assignments`} onClick={() => navigate("/assign/active")} />
                        <KpiCard label="Open Requests" value={s.openRequests ?? 0} icon={Truck} tone="amber" hint="Awaiting action" onClick={() => navigate("/machinery/requests")} />
                        <KpiCard label="Under Maintenance" value={s.maintenance ?? 0} icon={Wrench} tone="amber" onClick={() => navigate("/machine/list?status=Under Maintenance")} />
                        <KpiCard label="Breakdown" value={s.breakdown ?? 0} icon={AlertOctagon} tone="red" onClick={() => navigate("/machine/list?status=Breakdown")} />
                        <KpiCard label="Rented" value={s.rented ?? 0} icon={Truck} tone="gray" onClick={() => navigate("/machine/list?ownership=rented")} />
                        <KpiCard label="Documents Expiring" value={s.documentsExpiring ?? 0} icon={FileWarning} tone="red" hint="Next 30 days" />
                    </div>

                    <div className="grid gap-4 lg:grid-cols-3">
                        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm lg:col-span-2">
                            <h2 className="mb-4 font-semibold text-gray-800">Fleet Utilisation</h2>
                            <div className="mb-4 flex h-3 w-full overflow-hidden rounded-full bg-gray-100">
                                {fleetBars.map((b) => (
                                    <div key={b.label} className={b.color} style={{ width: `${pct(b.value)}%` }} title={`${b.label}: ${b.value || 0}`} />
                                ))}
                            </div>
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                {fleetBars.map((b) => (
                                    <div key={b.label} className="flex items-center gap-2 text-sm">
                                        <span className={`h-2.5 w-2.5 rounded-full ${b.color}`} />
                                        <span className="text-gray-600">{b.label}</span>
                                        <span className="ml-auto font-semibold text-gray-900">{b.value || 0}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                            <h2 className="mb-4 font-semibold text-gray-800">Usage</h2>
                            <dl className="space-y-3 text-sm">
                                <div className="flex items-center justify-between">
                                    <dt className="flex items-center gap-2 text-gray-500"><Clock size={15} /> Working hours</dt>
                                    <dd className="font-semibold">{s.totalWorkingHours ?? 0} h</dd>
                                </div>
                                <div className="flex items-center justify-between">
                                    <dt className="flex items-center gap-2 text-gray-500"><Fuel size={15} /> Fuel consumed</dt>
                                    <dd className="font-semibold">{s.totalFuelConsumed ?? 0} L</dd>
                                </div>
                            </dl>
                        </div>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                        <h2 className="mb-4 flex items-center gap-2 font-semibold text-gray-800">
                            <IndianRupee size={16} /> Operational Cost
                        </h2>
                        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                            {[
                                ["Machine usage", s.totalUsageCost],
                                ["Fuel", s.totalFuelCost],
                                ["Maintenance", s.totalMaintenanceCost],
                                ["Total", s.totalOperationalCost],
                            ].map(([label, val], i) => (
                                <div key={label} className={`rounded-lg p-3 ${i === 3 ? "bg-blue-50" : "bg-gray-50"}`}>
                                    <p className="text-xs text-gray-500">{label}</p>
                                    <p className={`mt-1 text-lg font-bold ${i === 3 ? "text-blue-700" : "text-gray-900"}`}>{fmtMoney(val)}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </MachinePage>
    );
}
