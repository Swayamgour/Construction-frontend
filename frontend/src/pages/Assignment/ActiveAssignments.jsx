import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { History, ArrowRightLeft } from "lucide-react";
import {
    useGetActiveAssignmentsQuery,
    useReleaseMachineMutation,
    useTransferMachineMutation,
    useGetProjectsQuery,
} from "../../Reduxe/Api";
import { CheckRole } from "../../helper/CheckRole";
import { getMachinePermissions } from "../../helper/machinePermissions";
import {
    MachinePage,
    StatusBadge,
    REQUEST_STATUS_TONE,
    EmptyState,
    Spinner,
    projectLabel,
    fmtDate,
    btnPrimary,
} from "../../components/machine/machineUi";

export default function ActiveAssignments() {
    const navigate = useNavigate();
    const { role } = CheckRole();
    const permissions = getMachinePermissions(role);

    const { data, isLoading, isError, refetch } = useGetActiveAssignmentsQuery();
    const [releaseMachine, { isLoading: releasing }] = useReleaseMachineMutation();
    const [transferMachine, { isLoading: transferring }] = useTransferMachineMutation();
    const { data: projectResp } = useGetProjectsQuery();

    const [transferModal, setTransferModal] = useState(null);
    const [transferForm, setTransferForm] = useState({
        targetProjectId: "",
        transferDate: new Date().toISOString().slice(0, 10),
        openingMeterReading: "",
        fuelLevel: "",
        transportCost: "",
        transportVendor: "",
        remarks: "",
    });

    const rows = data?.active || [];
    const projectsList = projectResp?.data || projectResp?.projects || projectResp || [];

    const handleRelease = async (machine) => {
        if (!window.confirm(`Release ${machine.machineNumber} from its project?`)) return;
        try {
            await releaseMachine({ machineId: machine._id }).unwrap();
            toast.success("Machine released successfully");
            refetch();
        } catch (err) {
            toast.error(err?.data?.message || "Release failed");
        }
    };

    const handleTransferSubmit = async (e) => {
        e.preventDefault();
        if (!transferForm.targetProjectId) return toast.error("Select target project");

        try {
            await transferMachine({
                machineId: transferModal.machineId?._id || transferModal.machineId,
                targetProjectId: transferForm.targetProjectId,
                transferDate: transferForm.transferDate,
                openingMeterReading: Number(transferForm.openingMeterReading) || 0,
                fuelLevel: Number(transferForm.fuelLevel) || 0,
                transportCost: Number(transferForm.transportCost) || 0,
                transportVendor: transferForm.transportVendor,
                notes: transferForm.remarks,
            }).unwrap();

            toast.success("Machine transferred successfully!");
            setTransferModal(null);
            refetch();
        } catch (err) {
            toast.error(err?.data?.message || "Transfer failed");
        }
    };

    return (
        <MachinePage
            title={permissions.isAdmin ? "Active Machine Deployments (Monitor)" : "Active Machine Assignments"}
            subtitle={`${rows.length} machine${rows.length === 1 ? "" : "s"} currently deployed on active project sites`}
            actions={permissions.canAssignMachine && <button className={btnPrimary} onClick={() => navigate("/assign")}>+ Assign Machine</button>}
        >
            {isLoading ? (
                <Spinner />
            ) : isError ? (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">Could not load assignments.</div>
            ) : rows.length === 0 ? (
                <EmptyState title="No machines are currently assigned" />
            ) : (
                <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <table className="min-w-full divide-y divide-slate-200 text-sm">
                        <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                            <tr>
                                {["Machine", "Project Site", "Assigned Operator", "Status", "Assigned On", "Expected Till", "Actions"].map((h) => (
                                    <th key={h} className="px-4 py-3">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {rows.map((a) => (
                                <tr key={a._id} className="hover:bg-slate-50/50">
                                    <td className="px-4 py-3">
                                        <Link to={`/machine/${a.machineId?._id}`} className="font-semibold text-blue-700 hover:underline">
                                            {a.machineId?.machineNumber || "—"}
                                        </Link>
                                        <p className="text-xs text-slate-400">
                                            {a.machineId?.brand} {a.machineId?.model} • {a.machineId?.machineType}
                                        </p>
                                    </td>
                                    <td className="px-4 py-3 font-medium text-slate-800">{projectLabel(a.projectId)}</td>
                                    <td className="px-4 py-3">
                                        {a.operatorId ? (
                                            <div>
                                                <span className="font-semibold text-slate-800">
                                                    {a.operatorId.labourId ? `[${a.operatorId.labourId}] ` : ""}
                                                    {a.operatorId.name}
                                                </span>
                                                {a.operatorId.phone && <p className="text-xs text-slate-400">{a.operatorId.phone}</p>}
                                            </div>
                                        ) : (
                                            <span className="text-slate-400 text-xs italic">Not assigned</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        <StatusBadge status={a.assignmentStatus} map={REQUEST_STATUS_TONE} />
                                    </td>
                                    <td className="px-4 py-3 font-medium">{fmtDate(a.assignDate)}</td>
                                    <td className="px-4 py-3 text-slate-500">{fmtDate(a.assignedTo)}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-end gap-2">
                                            {permissions.canTransferMachine && (
                                                <button
                                                    onClick={() => {
                                                        setTransferForm({
                                                            targetProjectId: "",
                                                            transferDate: new Date().toISOString().slice(0, 10),
                                                            openingMeterReading: a.machineId?.currentMeterReading || 0,
                                                            fuelLevel: a.machineId?.currentFuelLevel || 0,
                                                            transportCost: "",
                                                            transportVendor: "",
                                                            remarks: "",
                                                        });
                                                        setTransferModal(a);
                                                    }}
                                                    className="inline-flex items-center gap-1 rounded-lg border border-indigo-200 bg-indigo-50 px-2.5 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 transition"
                                                >
                                                    <ArrowRightLeft size={13} /> Transfer
                                                </button>
                                            )}

                                            <button
                                                onClick={() => navigate(`/assign/history/${a.machineId?._id}`)}
                                                className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                                            >
                                                <History size={13} /> History
                                            </button>

                                            {permissions.canReleaseMachine && (
                                                <button
                                                    disabled={releasing}
                                                    onClick={() => handleRelease(a.machineId)}
                                                    className="rounded-lg bg-rose-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-rose-700 disabled:opacity-60 transition"
                                                >
                                                    Release
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Transfer Machine Modal */}
            {transferModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">Transfer Machine Between Sites</h3>
                                <p className="text-xs text-slate-500">
                                    Transfer {transferModal.machineId?.machineNumber} directly to another project site.
                                </p>
                            </div>
                            <button onClick={() => setTransferModal(null)} className="text-slate-400 hover:text-slate-600">✕</button>
                        </div>

                        <form onSubmit={handleTransferSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="text-xs font-semibold text-slate-600">Destination Project Site *</label>
                                <select
                                    required
                                    value={transferForm.targetProjectId}
                                    onChange={(e) => setTransferForm({ ...transferForm, targetProjectId: e.target.value })}
                                    className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Select Target Project</option>
                                    {projectsList
                                        .filter((p) => p._id !== (transferModal.projectId?._id || transferModal.projectId))
                                        .map((p) => (
                                            <option key={p._id} value={p._id}>
                                                {p.name || p.projectName} {p.code ? `(${p.code})` : ""}
                                            </option>
                                        ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-semibold text-slate-600">Transfer Date *</label>
                                    <input
                                        type="date"
                                        required
                                        value={transferForm.transferDate}
                                        onChange={(e) => setTransferForm({ ...transferForm, transferDate: e.target.value })}
                                        className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-600">Meter at Transfer (hrs)</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={transferForm.openingMeterReading}
                                        onChange={(e) => setTransferForm({ ...transferForm, openingMeterReading: e.target.value })}
                                        className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-semibold text-slate-600">Fuel Level at Transfer (L)</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={transferForm.fuelLevel}
                                        onChange={(e) => setTransferForm({ ...transferForm, fuelLevel: e.target.value })}
                                        className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-600">Transport Cost (₹)</label>
                                    <input
                                        type="number"
                                        value={transferForm.transportCost}
                                        onChange={(e) => setTransferForm({ ...transferForm, transportCost: e.target.value })}
                                        placeholder="e.g. 5000"
                                        className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-slate-600">Transport Carrier / Logistics Vendor</label>
                                <input
                                    value={transferForm.transportVendor}
                                    onChange={(e) => setTransferForm({ ...transferForm, transportVendor: e.target.value })}
                                    placeholder="e.g. ABC Heavy Logistics"
                                    className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-slate-600">Transfer Reason / Notes</label>
                                <input
                                    value={transferForm.remarks}
                                    onChange={(e) => setTransferForm({ ...transferForm, remarks: e.target.value })}
                                    placeholder="e.g. Relocating machine for foundation piling..."
                                    className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-3">
                                <button
                                    type="button"
                                    onClick={() => setTransferModal(null)}
                                    className="px-4 py-2 border border-slate-300 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={transferring}
                                    className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-sm disabled:opacity-50"
                                >
                                    {transferring ? "Transferring..." : "Confirm Transfer"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </MachinePage>
    );
}
