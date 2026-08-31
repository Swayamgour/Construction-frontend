import React, { useState } from "react";
import toast from "react-hot-toast";
import { ShoppingCart, Plus, X, Ban } from "lucide-react";
import {
    useListProcurementsQuery,
    useCreateProcurementMutation,
    useUpdateProcurementStatusMutation,
    useCancelProcurementMutation,
} from "../../Reduxe/Api";
import { CheckRole } from "../../helper/CheckRole";

const STATUS_STYLES = {
    ordered: "bg-blue-50 text-blue-700 border-blue-200",
    delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
    cancelled: "bg-rose-50 text-rose-700 border-rose-200",
    pending: "bg-amber-50 text-amber-700 border-amber-200",
};

const NewProcurementModal = ({ onClose }) => {
    const [form, setForm] = useState({ projectId: "", itemName: "", quantity: "", vendorName: "", expectedDeliveryDate: "" });
    const [createProcurement, { isLoading }] = useCreateProcurementMutation();

    const submit = async (e) => {
        e.preventDefault();
        try {
            await createProcurement(form).unwrap();
            toast.success("Procurement order created");
            onClose();
        } catch (err) {
            toast.error(err?.data?.message || "Failed to create order");
        }
    };

    return (
        <div className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700">
                    <X size={20} />
                </button>
                <h2 className="text-lg font-semibold text-slate-900 mb-4">New Procurement Order</h2>
                <form onSubmit={submit} className="space-y-4">
                    {[
                        ["projectId", "Project ID"],
                        ["itemName", "Item Name"],
                        ["quantity", "Quantity"],
                        ["vendorName", "Vendor Name"],
                    ].map(([key, label]) => (
                        <div key={key}>
                            <label className="text-sm font-medium text-gray-600">{label}</label>
                            <input
                                required
                                value={form[key]}
                                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                    ))}
                    <div>
                        <label className="text-sm font-medium text-gray-600">Expected Delivery Date</label>
                        <input
                            type="date"
                            value={form.expectedDeliveryDate}
                            onChange={(e) => setForm({ ...form, expectedDeliveryDate: e.target.value })}
                            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                    <button
                        disabled={isLoading}
                        className="w-full bg-blue-900 hover:bg-blue-800 text-white rounded-lg py-2.5 text-sm font-semibold transition disabled:opacity-60"
                    >
                        {isLoading ? "Creating..." : "Create Order"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default function Procurement() {
    const { role } = CheckRole();
    const { data, isLoading } = useListProcurementsQuery();
    const [updateStatus] = useUpdateProcurementStatusMutation();
    const [cancelProcurement] = useCancelProcurementMutation();
    const [showNew, setShowNew] = useState(false);

    const orders = data?.procurements || (Array.isArray(data) ? data : []) || [];
    const isAdmin = role === "admin";

    const markDelivered = async (id) => {
        const formData = new FormData();
        formData.append("status", "delivered");
        try {
            await updateStatus({ id, formData }).unwrap();
            toast.success("Marked delivered");
        } catch (err) {
            toast.error(err?.data?.message || "Failed");
        }
    };

    const cancel = async (id) => {
        try {
            await cancelProcurement(id).unwrap();
            toast.success("Order cancelled");
        } catch (err) {
            toast.error(err?.data?.message || "Failed");
        }
    };

    return (
        <div className="p-4 lg:p-6 max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <ShoppingCart className="text-blue-800" size={26} /> Procurement
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">Vendor purchase orders when site stock can't be fulfilled internally</p>
                </div>
                {isAdmin && (
                    <button
                        onClick={() => setShowNew(true)}
                        className="inline-flex items-center gap-2 bg-blue-900 hover:bg-blue-800 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition"
                    >
                        <Plus size={18} /> New Order
                    </button>
                )}
            </div>

            {isLoading && <div className="text-center py-16 text-gray-400 text-sm">Loading orders...</div>}
            {!isLoading && orders.length === 0 && (
                <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300">
                    <ShoppingCart className="mx-auto text-gray-300 mb-3" size={40} />
                    <p className="text-gray-500 text-sm">No procurement orders yet</p>
                </div>
            )}

            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                {orders.length > 0 && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-blue-900 text-white text-xs uppercase">
                                <tr>
                                    <th className="px-4 py-3 text-left">Item</th>
                                    <th className="px-4 py-3 text-left">Vendor</th>
                                    <th className="px-4 py-3 text-left">Qty</th>
                                    <th className="px-4 py-3 text-left">Status</th>
                                    <th className="px-4 py-3 text-left">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {orders.map((o) => (
                                    <tr key={o._id} className="hover:bg-blue-50/50">
                                        <td className="px-4 py-3 font-medium text-slate-800">{o.itemName}</td>
                                        <td className="px-4 py-3 text-gray-600">{o.vendorName}</td>
                                        <td className="px-4 py-3 text-gray-600">{o.quantity}</td>
                                        <td className="px-4 py-3">
                                            <span
                                                className={`px-2.5 py-1 rounded-full text-xs font-medium border ${STATUS_STYLES[o.status] || "bg-gray-50 text-gray-600 border-gray-200"
                                                    }`}
                                            >
                                                {o.status || "pending"}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            {isAdmin && o.status !== "delivered" && o.status !== "cancelled" && (
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => markDelivered(o._id)}
                                                        className="text-emerald-700 text-xs font-semibold hover:underline"
                                                    >
                                                        Mark Delivered
                                                    </button>
                                                    <button
                                                        onClick={() => cancel(o._id)}
                                                        className="text-rose-600 text-xs font-semibold hover:underline inline-flex items-center gap-1"
                                                    >
                                                        <Ban size={12} /> Cancel
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {showNew && <NewProcurementModal onClose={() => setShowNew(false)} />}
        </div>
    );
}
