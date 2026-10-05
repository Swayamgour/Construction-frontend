import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { ShoppingCart, Plus, Loader2, ArrowRight } from "lucide-react";
import {
  useGetPurchaseOrdersQuery,
  useGetProjectsQuery,
} from "../../Reduxe/Api";
import { CheckRole } from "../../helper/CheckRole";

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

export default function Procurement() {
  const navigate = useNavigate();
  const { role } = CheckRole();
  const currentRole = String(role || "").toLowerCase();
  const isAdmin = currentRole === "admin" || currentRole === "manager";

  const [projectId, setProjectId] = useState("");
  const params = useMemo(() => (projectId ? { projectId } : {}), [projectId]);

  const { data, isLoading } = useGetPurchaseOrdersQuery(params);
  const { data: projectsData } = useGetProjectsQuery();
  const projects = (Array.isArray(projectsData?.data) ? projectsData.data : Array.isArray(projectsData) ? projectsData : []) || [];
  const orders = data?.data || [];

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-600 flex items-center justify-center text-white shadow-md shadow-indigo-900/20">
            <ShoppingCart size={20} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Procurement & Purchase Orders</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Unified procurement flow for site shortages, vendor purchase orders, and goods receipts.
            </p>
          </div>
        </div>
        {isAdmin && (
          <button
            onClick={() => navigate("/PurchaseOrder")}
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-indigo-900/20 transition-all w-fit"
          >
            <Plus size={18} /> New Purchase Order
          </button>
        )}
      </div>

      {/* Info card */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 text-xs text-blue-900 flex items-start justify-between gap-4">
        <div>
          <span className="font-semibold block mb-0.5">Single Source Procurement Flow:</span>
          <span>
            When Stock Check identifies a shortage, procurement proceeds via canonical Purchase Orders with explicit delivery routing (Central Godown vs Direct Site).
          </span>
        </div>
        <button
          onClick={() => navigate("/purchase-orders")}
          className="shrink-0 flex items-center gap-1 font-semibold text-blue-700 hover:text-blue-900 underline"
        >
          Full PO Management <ArrowRight size={13} />
        </button>
      </div>

      {/* Project Filter */}
      <div className="flex gap-3 mb-6">
        <select
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Projects</option>
          {projects.map((p) => (
            <option key={p._id} value={p._id}>
              {p.projectName || p.name}
            </option>
          ))}
        </select>
      </div>

      {isLoading && (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-gray-500">
          <Loader2 className="animate-spin" size={22} />
          <p className="text-sm">Loading procurement orders...</p>
        </div>
      )}

      {!isLoading && orders.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
          <ShoppingCart className="mx-auto text-gray-300 mb-3" size={36} />
          <p className="text-gray-500 text-sm">No procurement orders found</p>
        </div>
      )}

      {orders.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm shadow-gray-200/60 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50/70 text-gray-500 text-xs uppercase tracking-wide">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">PO #</th>
                  <th className="px-4 py-3 text-left font-semibold">Project</th>
                  <th className="px-4 py-3 text-left font-semibold">Routing</th>
                  <th className="px-4 py-3 text-left font-semibold">Vendor</th>
                  <th className="px-4 py-3 text-left font-semibold">Grand Total</th>
                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                  <th className="px-4 py-3 text-left font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((o) => (
                  <tr key={o._id} className="hover:bg-indigo-50/30 transition-colors">
                    <td className="px-4 py-3 font-semibold text-blue-600">
                      {o.poNumber || o._id.slice(-8).toUpperCase()}
                    </td>
                    <td className="px-4 py-3 text-gray-800 font-medium">
                      {o.projectId?.projectName || o.projectId?.name || "-"}
                    </td>
                    <td className="px-4 py-3">
                      {o.deliveryType === "DIRECT_PROJECT_SITE" ? (
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          Direct Site
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                          Central Godown
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {o.vendorId?.companyName || o.vendorId?.name || "-"}
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-900">
                      ₹{Number(o.grandTotal || 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                          STATUS_STYLES[o.status] || "bg-gray-50 text-gray-600 border-gray-200"
                        }`}
                      >
                        {o.status || "DRAFT"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => navigate("/purchase-orders")}
                        className="text-xs font-semibold text-blue-600 hover:underline"
                      >
                        View in PO List
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
