import React, { useState } from "react";
import toast from "react-hot-toast";
import { ArrowRightLeft, PackageCheck, Boxes, ScrollText, Ban, CheckCheck, History, PackagePlus } from "lucide-react";
import {
    useGetStockTransfersQuery,
    useConfirmTransferReceiptMutation,
    useCancelStockTransferMutation,
    useGetStockReceiptsQuery,
    useGetInventoryQuery,
    useGetProjectLedgerQuery,
    useGetProjectsQuery,
    useGetAllItemsQuery,
    useOpeningStockMutation,
    useDamageInventoryMutation,
    useAdjustInventoryMutation,
} from "../../Reduxe/Api";
import { CheckRole } from "../../helper/CheckRole";
import AuditHistory from "../../components/AuditHistory";

/**
 * NEW PAGE — wires up /api/stock/transfers, /api/stock/receipts,
 * /api/stock/inventory/:projectId and /api/stock/ledger/project/:projectId,
 * none of which had any frontend before this. Also now wires up
 * /api/stock/opening, /api/stock/damage and /api/stock/adjustment (the
 * "Adjustments" tab) — the centralized inventory-movement endpoints that
 * had no UI at all.
 */

const TABS = [
    { key: "transfers", label: "Transfers", icon: ArrowRightLeft },
    { key: "receipts", label: "Receipts", icon: PackageCheck },
    { key: "inventory", label: "Inventory", icon: Boxes },
    { key: "ledger", label: "Ledger", icon: ScrollText },
    { key: "adjustments", label: "Opening / Damage / Adjust", icon: PackagePlus },
];

const STATUS_STYLES = {
    InTransit: "bg-amber-50 text-amber-700 border-amber-200",
    Received: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Cancelled: "bg-rose-50 text-rose-700 border-rose-200",
};

const TransfersTab = ({ role }) => {
    const { data, isLoading } = useGetStockTransfersQuery({});
    const [confirmReceipt] = useConfirmTransferReceiptMutation();
    const [cancelTransfer] = useCancelStockTransferMutation();
    const [historyId, setHistoryId] = useState(null);
    const transfers = data?.data || [];

    const receive = async (id) => {
        try {
            await confirmReceipt(id).unwrap();
            toast.success("Transfer marked received");
        } catch (err) {
            toast.error(err?.data?.message || "Failed");
        }
    };
    const cancel = async (id) => {
        const reason = window.prompt("Reason for cancelling this transfer?");
        if (reason === null) return;
        try {
            await cancelTransfer({ id, reason }).unwrap();
            toast.success("Transfer cancelled");
        } catch (err) {
            toast.error(err?.data?.message || "Failed");
        }
    };

    if (isLoading) return <p className="text-sm text-gray-400 py-8 text-center">Loading…</p>;
    return (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-x-auto">
            <table className="w-full text-sm">
                <thead className="bg-blue-900 text-white text-xs uppercase">
                    <tr>
                        <th className="px-4 py-3 text-left">Material</th>
                        <th className="px-4 py-3 text-left">From → To</th>
                        <th className="px-4 py-3 text-left">Qty</th>
                        <th className="px-4 py-3 text-left">Status</th>
                        <th className="px-4 py-3 text-left">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {transfers.length === 0 && (
                        <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">No transfers yet</td></tr>
                    )}
                    {transfers.map((t) => (
                        <React.Fragment key={t._id}>
                        <tr>
                            <td className="px-4 py-3">{t.materialId?.name || "-"}</td>
                            <td className="px-4 py-3">
                                {t.sourceProjectId?.projectName || "-"} → {t.destinationProjectId?.projectName || "-"}
                            </td>
                            <td className="px-4 py-3">{t.transferredQuantity}</td>
                            <td className="px-4 py-3">
                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${STATUS_STYLES[t.status] || "bg-gray-50 text-gray-600 border-gray-200"}`}>
                                    {t.status}
                                </span>
                            </td>
                            <td className="px-4 py-3">
                                <div className="flex gap-3 items-center">
                                    {t.status === "InTransit" && (
                                        <>
                                        <button onClick={() => receive(t._id)} className="text-emerald-700 text-xs font-semibold hover:underline inline-flex items-center gap-1">
                                            <CheckCheck size={13} /> Receive
                                        </button>
                                        {(role === "admin" || role === "manager") && (
                                            <button onClick={() => cancel(t._id)} className="text-rose-600 text-xs font-semibold hover:underline inline-flex items-center gap-1">
                                                <Ban size={13} /> Cancel
                                            </button>
                                        )}
                                        </>
                                    )}
                                    <button
                                        onClick={() => setHistoryId(historyId === t._id ? null : t._id)}
                                        className="text-gray-500 text-xs font-semibold hover:underline inline-flex items-center gap-1"
                                    >
                                        <History size={13} /> History
                                    </button>
                                </div>
                            </td>
                        </tr>
                        {historyId === t._id && (
                            <tr>
                                <td colSpan={5} className="px-4 pb-4 bg-gray-50">
                                    <AuditHistory module="StockTransfer" entityId={t._id} />
                                </td>
                            </tr>
                        )}
                        </React.Fragment>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const ReceiptsTab = () => {
    const { data, isLoading } = useGetStockReceiptsQuery({});
    const receipts = data?.data || [];
    if (isLoading) return <p className="text-sm text-gray-400 py-8 text-center">Loading…</p>;
    return (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-x-auto">
            <table className="w-full text-sm">
                <thead className="bg-blue-900 text-white text-xs uppercase">
                    <tr>
                        <th className="px-4 py-3 text-left">Project</th>
                        <th className="px-4 py-3 text-left">Material</th>
                        <th className="px-4 py-3 text-left">Accepted / Damaged / Rejected</th>
                        <th className="px-4 py-3 text-left">Received By</th>
                        <th className="px-4 py-3 text-left">Date</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {receipts.length === 0 && (
                        <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">No receipts yet</td></tr>
                    )}
                    {receipts.map((r) => (
                        <tr key={r._id}>
                            <td className="px-4 py-3">{r.projectId?.projectName || "-"}</td>
                            <td className="px-4 py-3">{r.materialId?.name || "-"}</td>
                            <td className="px-4 py-3">{r.accepted ?? 0} / {r.damaged ?? 0} / {r.rejected ?? 0}</td>
                            <td className="px-4 py-3">{r.receivedBy?.name || "-"}</td>
                            <td className="px-4 py-3">{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "-"}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const InventoryTab = ({ projectId }) => {
    const { data, isLoading } = useGetInventoryQuery(projectId, { skip: !projectId });
    if (!projectId) return <p className="text-sm text-gray-400 py-8 text-center">Select a project above</p>;
    if (isLoading) return <p className="text-sm text-gray-400 py-8 text-center">Loading…</p>;
    const items = data?.data || [];
    return (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-x-auto">
            <table className="w-full text-sm">
                <thead className="bg-blue-900 text-white text-xs uppercase">
                    <tr>
                        <th className="px-4 py-3 text-left">Item</th>
                        <th className="px-4 py-3 text-left">Category</th>
                        <th className="px-4 py-3 text-left">Balance</th>
                        <th className="px-4 py-3 text-left">Damaged</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {items.length === 0 && (
                        <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400">No stock on this project</td></tr>
                    )}
                    {items.map((it) => (
                        <tr key={it.itemId}>
                            <td className="px-4 py-3">{it.name}</td>
                            <td className="px-4 py-3">{it.category || "-"}</td>
                            <td className="px-4 py-3 font-medium">{it.currentBalance} {it.unit}</td>
                            <td className="px-4 py-3">{it.damaged || 0}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const LedgerTab = ({ projectId }) => {
    const { data, isLoading } = useGetProjectLedgerQuery({ projectId }, { skip: !projectId });
    if (!projectId) return <p className="text-sm text-gray-400 py-8 text-center">Select a project above</p>;
    if (isLoading) return <p className="text-sm text-gray-400 py-8 text-center">Loading…</p>;
    const items = data?.data || [];
    return (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-x-auto">
            <table className="w-full text-sm">
                <thead className="bg-blue-900 text-white text-xs uppercase">
                    <tr>
                        <th className="px-4 py-3 text-left">Item</th>
                        <th className="px-4 py-3 text-left">Type</th>
                        <th className="px-4 py-3 text-left">In</th>
                        <th className="px-4 py-3 text-left">Out</th>
                        <th className="px-4 py-3 text-left">Date</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {items.length === 0 && (
                        <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">No ledger entries</td></tr>
                    )}
                    {items.map((l) => (
                        <tr key={l._id}>
                            <td className="px-4 py-3">{l.itemId?.name || "-"}</td>
                            <td className="px-4 py-3">{l.transactionType || "-"}</td>
                            <td className="px-4 py-3">{l.qtyIn || 0}</td>
                            <td className="px-4 py-3">{l.qtyOut || 0}</td>
                            <td className="px-4 py-3">{l.createdAt ? new Date(l.createdAt).toLocaleString() : "-"}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const AdjustmentsTab = ({ projectId }) => {
    const [mode, setMode] = useState("opening"); // opening | damage | adjustment
    const { data: itemsResp } = useGetAllItemsQuery();
    const items = itemsResp?.items || itemsResp?.data || [];

    const [form, setForm] = useState({ itemId: "", qty: "", rate: "", date: "", reason: "", adjustmentType: "POSITIVE" });
    const [openingStock, { isLoading: l1 }] = useOpeningStockMutation();
    const [damageInventory, { isLoading: l2 }] = useDamageInventoryMutation();
    const [adjustInventory, { isLoading: l3 }] = useAdjustInventoryMutation();
    const busy = l1 || l2 || l3;

    const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

    const submit = async (e) => {
        e.preventDefault();
        if (!projectId) return toast.error("Select a project above first");
        if (!form.itemId) return toast.error("Select an item");
        try {
            if (mode === "opening") {
                if (!form.qty) return toast.error("Quantity is required");
                await openingStock({
                    projectId, itemId: form.itemId, quantity: Number(form.qty),
                    rate: form.rate ? Number(form.rate) : undefined,
                    date: form.date || undefined, remarks: form.reason,
                }).unwrap();
                toast.success("Opening stock recorded");
            } else if (mode === "damage") {
                if (!form.qty) return toast.error("Quantity is required");
                await damageInventory({ projectId, itemId: form.itemId, qty: Number(form.qty), reason: form.reason }).unwrap();
                toast.success("Damage recorded");
            } else {
                if (!form.qty || !form.reason.trim()) return toast.error("Quantity and reason are required for an adjustment");
                await adjustInventory({
                    projectId, itemId: form.itemId, qty: Number(form.qty),
                    adjustmentType: form.adjustmentType, reason: form.reason,
                }).unwrap();
                toast.success("Adjustment recorded");
            }
            setForm({ itemId: "", qty: "", rate: "", date: "", reason: "", adjustmentType: "POSITIVE" });
        } catch (err) {
            toast.error(err?.data?.message || "Failed");
        }
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 max-w-xl">
            <div className="flex gap-2 mb-5">
                {[
                    { key: "opening", label: "Opening Stock" },
                    { key: "damage", label: "Damage" },
                    { key: "adjustment", label: "Adjustment" },
                ].map((m) => (
                    <button
                        key={m.key}
                        onClick={() => setMode(m.key)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${mode === m.key ? "bg-blue-900 text-white" : "bg-gray-100 text-gray-600"}`}
                    >
                        {m.label}
                    </button>
                ))}
            </div>

            {!projectId && <p className="text-sm text-amber-600 mb-4">Select a project from the dropdown above first.</p>}

            <form onSubmit={submit} className="space-y-4">
                <div>
                    <label className="text-xs font-medium text-gray-600">Item</label>
                    <select value={form.itemId} onChange={set("itemId")} className="mt-1 w-full border rounded-lg px-3 py-2 text-sm">
                        <option value="">Select item…</option>
                        {items.map((it) => <option key={it._id} value={it._id}>{it.name}</option>)}
                    </select>
                </div>

                <div>
                    <label className="text-xs font-medium text-gray-600">Quantity</label>
                    <input type="number" min="0" step="any" value={form.qty} onChange={set("qty")} className="mt-1 w-full border rounded-lg px-3 py-2 text-sm" />
                </div>

                {mode === "opening" && (
                    <>
                        <div>
                            <label className="text-xs font-medium text-gray-600">Rate (optional)</label>
                            <input type="number" min="0" step="any" value={form.rate} onChange={set("rate")} className="mt-1 w-full border rounded-lg px-3 py-2 text-sm" />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-gray-600">Date (optional, defaults to today)</label>
                            <input type="date" value={form.date} onChange={set("date")} className="mt-1 w-full border rounded-lg px-3 py-2 text-sm" />
                        </div>
                        <p className="text-xs text-gray-400">One-time entry per item on this project — use Adjustment afterwards to correct a balance.</p>
                    </>
                )}

                {mode === "adjustment" && (
                    <div>
                        <label className="text-xs font-medium text-gray-600">Direction</label>
                        <select value={form.adjustmentType} onChange={set("adjustmentType")} className="mt-1 w-full border rounded-lg px-3 py-2 text-sm">
                            <option value="POSITIVE">Increase (+)</option>
                            <option value="NEGATIVE">Decrease (−)</option>
                        </select>
                    </div>
                )}

                <div>
                    <label className="text-xs font-medium text-gray-600">
                        {mode === "opening" ? "Remarks (optional)" : "Reason" + (mode === "damage" ? " (optional)" : " (required)")}
                    </label>
                    <input value={form.reason} onChange={set("reason")} className="mt-1 w-full border rounded-lg px-3 py-2 text-sm" />
                </div>

                <button
                    type="submit"
                    disabled={busy}
                    className="px-4 py-2 bg-blue-900 text-white rounded-lg text-sm font-semibold hover:bg-blue-800 disabled:opacity-50"
                >
                    {busy ? "Saving…" : "Submit"}
                </button>
            </form>
        </div>
    );
};

const StockOperations = () => {
    const { role } = CheckRole();
    const [tab, setTab] = useState("transfers");
    const [projectId, setProjectId] = useState("");
    const { data: projectResp } = useGetProjectsQuery();
    const projects = projectResp?.data || projectResp || [];

    return (
        <div className="p-4 lg:p-6 max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <ArrowRightLeft className="text-blue-800" size={26} /> Stock Operations
                </h1>
                {(tab === "inventory" || tab === "ledger" || tab === "adjustments") && (
                    <select
                        value={projectId}
                        onChange={(e) => setProjectId(e.target.value)}
                        className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    >
                        <option value="">Select project…</option>
                        {projects?.map((p) => (
                            <option key={p._id} value={p._id}>{p.projectName || p.name}</option>
                        ))}
                    </select>
                )}
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

            {tab === "transfers" && <TransfersTab role={role} />}
            {tab === "receipts" && <ReceiptsTab />}
            {tab === "inventory" && <InventoryTab projectId={projectId} />}
            {tab === "ledger" && <LedgerTab projectId={projectId} />}
            {tab === "adjustments" && <AdjustmentsTab projectId={projectId} />}
        </div>
    );
};

export default StockOperations;
