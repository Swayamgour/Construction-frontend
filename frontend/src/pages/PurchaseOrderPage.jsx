import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
    useGetPurchaseOrdersQuery,
    useGetProjectsQuery,
    useGetPurchaseOrderByIdQuery,
    useUpdatePurchaseOrderMutation,
    useSubmitPurchaseOrderMutation,
    useApprovePurchaseOrderMutation,
    useOrderPurchaseOrderMutation,
    useCancelPurchaseOrderMutation,
    useClosePurchaseOrderMutation,
} from "../Reduxe/Api";
import { CheckRole } from "../helper/CheckRole";
import AuditHistory from "../components/AuditHistory";

// Mirrors PURCHASE_ORDER_TRANSITIONS in backend/controllers/purchaseOrderController.js
const TRANSITIONS = {
    DRAFT: ["SUBMITTED", "CANCELLED"],
    SUBMITTED: ["APPROVED", "CANCELLED"],
    APPROVED: ["ORDERED", "CANCELLED"],
    ORDERED: ["PARTIALLY_RECEIVED", "RECEIVED", "CLOSED", "CANCELLED"],
    PARTIALLY_RECEIVED: ["RECEIVED", "CLOSED", "CANCELLED"],
    RECEIVED: ["CLOSED"],
    CLOSED: [],
    CANCELLED: [],
};

const STATUS_STYLES = {
    DRAFT: "bg-gray-100 text-gray-700",
    SUBMITTED: "bg-yellow-100 text-yellow-700",
    APPROVED: "bg-indigo-100 text-indigo-700",
    ORDERED: "bg-blue-100 text-blue-700",
    PARTIALLY_RECEIVED: "bg-orange-100 text-orange-700",
    RECEIVED: "bg-teal-100 text-teal-700",
    CLOSED: "bg-green-100 text-green-700",
    CANCELLED: "bg-red-100 text-red-700",
};

// action -> [mutation trigger name, label, allowed roles, confirm message]
const ACTIONS = [
    { to: "SUBMITTED", label: "Submit", roles: ["admin", "manager"] },
    { to: "APPROVED", label: "Approve", roles: ["admin"] },
    { to: "ORDERED", label: "Mark Ordered", roles: ["admin", "manager"] },
    { to: "CLOSED", label: "Close", roles: ["admin", "manager"] },
    { to: "CANCELLED", label: "Cancel", roles: ["admin", "manager"], danger: true },
];

// Detail/edit modal — view any PO; DRAFT ones can have items/vendor edited
// (backend only allows edits while status === DRAFT).
const PODetailModal = ({ id, onClose }) => {
    const { data, isLoading } = useGetPurchaseOrderByIdQuery(id);
    const [updatePO, { isLoading: saving }] = useUpdatePurchaseOrderMutation();
    const po = data?.data || data;
    const [items, setItems] = useState(null);

    const rows = items || po?.items || [];
    const editable = po?.status === "DRAFT";

    const setQty = (idx, qty) => {
        const next = [...rows];
        next[idx] = { ...next[idx], quantity: Number(qty) };
        setItems(next);
    };

    const save = async () => {
        try {
            await updatePO({ id, items: rows.map((r) => ({ itemId: r.itemId?._id || r.itemId, quantity: r.quantity, unitPrice: r.unitPrice })) }).unwrap();
            toast.success("Purchase order updated");
            setItems(null);
        } catch (err) {
            toast.error(err?.data?.message || "Update failed");
        }
    };

    return (
        <div className="fixed inset-0 z-[9999] bg-black/40 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl p-6 max-h-[85vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">PO {id.slice(-8).toUpperCase()}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-sm">Close</button>
                </div>
                {isLoading && <div className="text-sm text-gray-400 py-8 text-center">Loading…</div>}
                {po && (
                    <>
                        <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                            <div><span className="text-gray-500">Project:</span> {po.projectId?.projectName || po.projectId?.name || "-"}</div>
                            <div><span className="text-gray-500">Vendor:</span> {po.vendorId?.companyName || po.vendorId?.name || "-"}</div>
                            <div><span className="text-gray-500">Status:</span> {po.status}</div>
                            <div><span className="text-gray-500">Grand Total:</span> ₹{Number(po.grandTotal || 0).toLocaleString()}</div>
                        </div>
                        <table className="w-full text-sm border rounded-lg overflow-hidden">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-3 py-2 text-left">Item</th>
                                    <th className="px-3 py-2 text-left">Qty</th>
                                    <th className="px-3 py-2 text-left">Unit Price</th>
                                    <th className="px-3 py-2 text-left">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((it, idx) => (
                                    <tr key={idx} className="border-t">
                                        <td className="px-3 py-2">{it.itemId?.name || it.name || "-"}</td>
                                        <td className="px-3 py-2">
                                            {editable ? (
                                                <input
                                                    type="number"
                                                    min={1}
                                                    value={it.quantity}
                                                    onChange={(e) => setQty(idx, e.target.value)}
                                                    className="w-20 border rounded px-2 py-1"
                                                />
                                            ) : it.quantity}
                                        </td>
                                        <td className="px-3 py-2">₹{it.unitPrice}</td>
                                        <td className="px-3 py-2">₹{Number(it.quantity * it.unitPrice || 0).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {editable && (
                            <button
                                onClick={save}
                                disabled={saving || !items}
                                className="mt-4 bg-blue-900 hover:bg-blue-800 disabled:opacity-50 text-white text-sm font-semibold px-4 py-2 rounded-lg"
                            >
                                {saving ? "Saving…" : "Save Changes"}
                            </button>
                        )}
                        {!editable && (
                            <p className="mt-4 text-xs text-gray-400">Only DRAFT purchase orders can be edited.</p>
                        )}
                        <AuditHistory module="PurchaseOrder" entityId={id} />
                    </>
                )}
            </div>
        </div>
    );
};

const PurchaseOrderPage = () => {
    const navigate = useNavigate();
    const { role } = CheckRole();
    const currentRole = String(role || "").toLowerCase();
    const [detailId, setDetailId] = useState(null);

    const [projectId, setProjectId] = useState("");
    const [status, setStatus] = useState("");

    const params = useMemo(() => {
        const p = {};
        if (projectId) p.projectId = projectId;
        if (status) p.status = status;
        return p;
    }, [projectId, status]);

    const { data, isLoading, isFetching } = useGetPurchaseOrdersQuery(params);
    const { data: projectsData } = useGetProjectsQuery();
    const projects = projectsData?.data || projectsData || [];

    const [submitPO] = useSubmitPurchaseOrderMutation();
    const [approvePO] = useApprovePurchaseOrderMutation();
    const [orderPO] = useOrderPurchaseOrderMutation();
    const [cancelPO] = useCancelPurchaseOrderMutation();
    const [closePO] = useClosePurchaseOrderMutation();

    const mutationFor = {
        SUBMITTED: submitPO,
        APPROVED: approvePO,
        ORDERED: orderPO,
        CLOSED: closePO,
        CANCELLED: cancelPO,
    };

    const orders = data?.data || [];
    const summary = useMemo(() => {
        const counts = orders.reduce((acc, po) => {
            acc[po.status] = (acc[po.status] || 0) + 1;
            return acc;
        }, {});
        return [
            { label: "Total POs", value: data?.pagination?.total ?? orders.length },
            { label: "Draft", value: counts.DRAFT || 0 },
            { label: "Submitted", value: counts.SUBMITTED || 0 },
            { label: "Approved", value: counts.APPROVED || 0 },
            { label: "Ordered", value: counts.ORDERED || 0 },
            { label: "Closed", value: counts.CLOSED || 0 },
            { label: "Cancelled", value: counts.CANCELLED || 0 },
        ];
    }, [orders, data]);

    const handleAction = async (poId, currentStatus, action) => {
        if (action.danger && !window.confirm(`Is PO ko ${action.label} karna hai?`)) return;
        try {
            await mutationFor[action.to](poId).unwrap();
            toast.success(`PO ${action.label} ho gaya`);
        } catch (err) {
            toast.error(err?.data?.message || `${action.label} nahi ho paaya`);
        }
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-semibold">Purchase Orders</h1>
                    <p className="text-xs text-gray-500 mt-1">
                        {currentRole === "admin"
                            ? "Enterprise procurement, vendor orders, and financial approvals."
                            : "Site purchase orders and vendor supply tracking."}
                    </p>
                </div>
                {(currentRole === "admin" || currentRole === "manager") && (
                    <button
                        onClick={() => navigate("/PurchaseOrder")}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 shadow-sm"
                    >
                        + Create Purchase Order
                    </button>
                )}
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 mb-6">
                <select
                    className="border rounded-md px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-400"
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                >
                    <option value="">All Projects</option>
                    {projects?.data?.map((p) => (
                        <option key={p._id} value={p._id}>
                            {p.projectName || p.name}
                        </option>
                    ))}
                </select>
                <select
                    className="border rounded-md px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-400"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                >
                    <option value="">All Status</option>
                    {Object.keys(TRANSITIONS).map((s) => (
                        <option key={s} value={s}>
                            {s}
                        </option>
                    ))}
                </select>
                {isFetching && <span className="text-xs text-gray-400 self-center">Refreshing…</span>}
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
                {summary.map((item, index) => (
                    <div
                        key={index}
                        className="bg-white p-4 shadow-sm rounded-lg text-center border border-gray-100"
                    >
                        <div className="text-lg font-semibold">{item.value}</div>
                        <div className="text-gray-500 text-sm">{item.label}</div>
                    </div>
                ))}
            </div>

            {/* Table */}
            <div className="overflow-x-auto bg-white rounded-lg shadow-sm">
                <table className="min-w-full text-sm">
                    <thead className="bg-gray-100 text-gray-700">
                        <tr>
                            <th className="px-4 py-3 text-left font-medium">PO ID</th>
                            <th className="px-4 py-3 text-left font-medium">Project</th>
                            <th className="px-4 py-3 text-left font-medium">Vendor</th>
                            <th className="px-4 py-3 text-left font-medium">Created On</th>
                            <th className="px-4 py-3 text-left font-medium">Grand Total</th>
                            <th className="px-4 py-3 text-left font-medium">Status</th>
                            <th className="px-4 py-3 text-left font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading && (
                            <tr>
                                <td colSpan={7} className="px-4 py-6 text-center text-gray-500">
                                    Loading purchase orders…
                                </td>
                            </tr>
                        )}
                        {!isLoading && orders.length === 0 && (
                            <tr>
                                <td colSpan={7} className="px-4 py-6 text-center text-gray-500">
                                    Koi purchase order nahi mila.
                                </td>
                            </tr>
                        )}
                        {orders.map((po) => {
                            const allowedTargets = TRANSITIONS[po.status] || [];
                            const visibleActions = ACTIONS.filter(
                                (a) => allowedTargets.includes(a.to) && a.roles.map((r) => r.toLowerCase()).includes(currentRole)
                            );
                            return (
                                <tr key={po._id} className="border-t hover:bg-gray-50 transition-colors duration-150">
                                    <td className="px-4 py-3 text-blue-600 font-medium">
                                        {po._id.slice(-8).toUpperCase()}
                                    </td>
                                    <td className="px-4 py-3">
                                        {po.projectId?.projectName || po.projectId?.name || "-"}
                                    </td>
                                    <td className="px-4 py-3">
                                        {po.vendorId?.companyName || po.vendorId?.name || "-"}
                                    </td>
                                    <td className="px-4 py-3">
                                        {po.createdAt ? new Date(po.createdAt).toLocaleString() : "-"}
                                    </td>
                                    <td className="px-4 py-3">₹{Number(po.grandTotal || 0).toLocaleString()}</td>
                                    <td className="px-4 py-3">
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[po.status] || "bg-gray-100 text-gray-700"
                                                }`}
                                        >
                                            {po.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex flex-wrap gap-2">
                                            <button
                                                onClick={() => setDetailId(po._id)}
                                                className="px-2 py-1 rounded text-xs font-medium border border-gray-300 text-gray-600 hover:bg-gray-50"
                                            >
                                                View
                                            </button>
                                            {visibleActions.length === 0 && (
                                                <span className="text-xs text-gray-400">No action</span>
                                            )}
                                            {visibleActions.map((action) => (
                                                <button
                                                    key={action.to}
                                                    onClick={() => handleAction(po._id, po.status, action)}
                                                    className={`px-2 py-1 rounded text-xs font-medium border ${action.danger
                                                            ? "border-red-300 text-red-600 hover:bg-red-50"
                                                            : "border-blue-300 text-blue-600 hover:bg-blue-50"
                                                        }`}
                                                >
                                                    {action.label}
                                                </button>
                                            ))}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            {detailId && <PODetailModal id={detailId} onClose={() => setDetailId(null)} />}
        </div>
    );
};

export default PurchaseOrderPage;
