import React, { useState } from "react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Plus, X, Ban, CheckCircle2, Loader2 } from "lucide-react";
import {
  useGetProcurementsQuery,
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 relative"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors">
          <X size={20} />
        </button>
        <div className="flex items-center gap-2 mb-5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-600 flex items-center justify-center text-white">
            <ShoppingCart size={16} />
          </div>
          <h2 className="text-lg font-bold text-slate-900">New Procurement Order</h2>
        </div>
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
                className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              />
            </div>
          ))}
          <div>
            <label className="text-sm font-medium text-gray-600">Expected Delivery Date</label>
            <input
              type="date"
              value={form.expectedDeliveryDate}
              onChange={(e) => setForm({ ...form, expectedDeliveryDate: e.target.value })}
              className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            />
          </div>
          <button
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-xl py-2.5 text-sm font-semibold shadow-lg shadow-indigo-900/20 transition-all disabled:opacity-60"
          >
            {isLoading ? "Creating..." : "Create Order"}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default function Procurement() {
  const { role } = CheckRole();
  const { data, isLoading } = useGetProcurementsQuery();
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
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-600 flex items-center justify-center text-white shadow-md shadow-indigo-900/20">
            <ShoppingCart size={20} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Procurement</h1>
            <p className="text-sm text-gray-500 mt-0.5">Vendor purchase orders when site stock can't be fulfilled internally</p>
          </div>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowNew(true)}
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-indigo-900/20 transition-all w-fit"
          >
            <Plus size={18} /> New Order
          </button>
        )}
      </div>

      {isLoading && (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-gray-500">
          <Loader2 className="animate-spin" size={22} />
          <p className="text-sm">Loading orders...</p>
        </div>
      )}
      {!isLoading && orders.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
          <ShoppingCart className="mx-auto text-gray-300 mb-3" size={36} />
          <p className="text-gray-500 text-sm">No procurement orders yet</p>
        </div>
      )}

      {orders.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm shadow-gray-200/60 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50/70 text-gray-500 text-xs uppercase tracking-wide">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Item</th>
                  <th className="px-4 py-3 text-left font-semibold">Vendor</th>
                  <th className="px-4 py-3 text-left font-semibold">Qty</th>
                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                  <th className="px-4 py-3 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((o) => (
                  <tr key={o._id} className="hover:bg-indigo-50/30 transition-colors">
                    <td className="px-4 py-3 font-semibold text-slate-800">{o.itemName}</td>
                    <td className="px-4 py-3 text-gray-600">{o.vendorName}</td>
                    <td className="px-4 py-3 text-gray-600">{o.quantity}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${STATUS_STYLES[o.status] || "bg-gray-50 text-gray-600 border-gray-200"}`}
                      >
                        {o.status || "pending"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {isAdmin && o.status !== "delivered" && o.status !== "cancelled" && (
                        <div className="flex gap-3">
                          <button
                            onClick={() => markDelivered(o._id)}
                            className="text-emerald-700 text-xs font-semibold hover:underline flex items-center gap-1"
                          >
                            <CheckCircle2 size={12} /> Mark Delivered
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
        </div>
      )}

      <AnimatePresence>{showNew && <NewProcurementModal onClose={() => setShowNew(false)} />}</AnimatePresence>
    </div>
  );
}
