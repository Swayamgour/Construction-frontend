import React, { useState } from "react";
import { CheckRole } from "../../helper/CheckRole";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { PackagePlus, X, Ban, ArrowRightLeft, ShoppingCart, ClipboardList, Loader2 } from "lucide-react";
import ReportTable from "../../components/ReportTable";
import {
  useGetStockRequestsQuery,
  useCreateStockRequestMutation,
  useReviewStockRequestMutation,
  useCreateStockTransferMutation,
  useCreateProcurementMutation,
  useGetProjectsQuery,
  useGetAllItemsQuery,
  useGetVendorsQuery,
} from "../../Reduxe/Api";

const STATUS_COLORS = {
  PENDING_ADMIN_REVIEW: "bg-amber-50 text-amber-700",
  APPROVED_TRANSFER: "bg-blue-50 text-blue-700",
  APPROVED_PROCUREMENT: "bg-purple-50 text-purple-700",
  PARTIALLY_FULFILLED: "bg-orange-50 text-orange-700",
  FULFILLED: "bg-emerald-50 text-emerald-700",
  REJECTED: "bg-red-50 text-red-700",
  CANCELLED: "bg-gray-100 text-gray-600",
};

const inputCls =
  "border border-gray-200 p-2.5 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm";

const StockRequests = () => {
  const { role: userRole } = CheckRole();
  const [showCreate, setShowCreate] = useState(false);
  const [fulfilModal, setFulfilModal] = useState(null);

  const { data, isLoading, refetch } = useGetStockRequestsQuery({});
  const { data: projectResp } = useGetProjectsQuery();
  const { data: itemResp } = useGetAllItemsQuery();
  const { data: vendorResp } = useGetVendorsQuery();

  const [createStockRequest, { isLoading: creating }] = useCreateStockRequestMutation();
  const [reviewStockRequest] = useReviewStockRequestMutation();
  const [createStockTransfer, { isLoading: transferring }] = useCreateStockTransferMutation();
  const [createProcurement, { isLoading: procuring }] = useCreateProcurementMutation();

  const requests = data?.data || [];
  const projects = projectResp?.data || projectResp || [];
  const items = itemResp?.items || itemResp || [];
  const vendors = vendorResp?.data || vendorResp || [];

  const [form, setForm] = useState({
    projectId: "", materialId: "", quantity: "", unit: "", requiredDate: "",
    priority: "Medium", purpose: "", description: "",
  });
  const [imageFiles, setImageFiles] = useState([]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.projectId || !form.materialId || !form.quantity || !form.unit || !form.requiredDate) {
      return toast.error("Please fill all required fields");
    }
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      imageFiles.forEach((f) => fd.append("images", f));

      await createStockRequest(fd).unwrap();
      toast.success("Stock request submitted");
      setShowCreate(false);
      setForm({ projectId: "", materialId: "", quantity: "", unit: "", requiredDate: "", priority: "Medium", purpose: "", description: "" });
      setImageFiles([]);
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || "Error creating request");
    }
  };

  const handleReject = async (id) => {
    const adminRemarks = window.prompt("Reason for rejection:") || "";
    try {
      await reviewStockRequest({ id, decision: "reject", adminRemarks }).unwrap();
      toast.success("Request rejected");
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || "Error rejecting");
    }
  };

  const handleFulfilSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    try {
      if (fulfilModal.type === "transfer") {
        await createStockTransfer({
          stockRequestId: fulfilModal.request._id,
          sourceProjectId: fd.get("sourceProjectId"),
          quantity: Number(fd.get("quantity")),
          remarks: fd.get("remarks"),
        }).unwrap();
        toast.success("Transfer created");
      } else {
        await createProcurement({
          stockRequestId: fulfilModal.request._id,
          vendorId: fd.get("vendorId"),
          quantity: Number(fd.get("quantity")),
          rate: Number(fd.get("rate")),
          tax: Number(fd.get("tax") || 0),
          expectedDeliveryDate: fd.get("expectedDeliveryDate"),
        }).unwrap();
        toast.success("Procurement order created");
      }
      setFulfilModal(null);
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || "Error fulfilling request");
    }
  };

  const columns = [
    { header: "Request #", accessor: "requestNumber" },
    { header: "Project", render: (row) => row.projectId?.projectName || "-" },
    { header: "Material", render: (row) => `${row.materialName} x ${row.quantity} ${row.unit}` },
    { header: "Requested By", render: (row) => `${row.requestedBy?.name || "-"} (${row.requestedByRole})` },
    { header: "Priority", accessor: "priority" },
    {
      header: "Images",
      render: (row) =>
        row.images?.length ? (
          <div className="flex gap-1">
            {row.images.slice(0, 3).map((img, i) => (
              <a key={i} href={img} target="_blank" rel="noreferrer">
                <img src={img} alt="" className="w-8 h-8 rounded-lg object-cover border border-gray-200" />
              </a>
            ))}
          </div>
        ) : (
          "-"
        ),
    },
    {
      header: "Status",
      render: (row) => (
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[row.status] || "bg-gray-100 text-gray-600"}`}>
          {row.status.replaceAll("_", " ")}
        </span>
      ),
    },
    {
      header: "Action",
      render: (row) =>
        row.status === "PENDING_ADMIN_REVIEW" ? (
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFulfilModal({ request: row, type: "transfer" })}
              className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium flex items-center gap-1 transition-colors"
            >
              <ArrowRightLeft size={11} /> Transfer
            </button>
            <button
              onClick={() => setFulfilModal({ request: row, type: "procurement" })}
              className="px-2.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-medium flex items-center gap-1 transition-colors"
            >
              <ShoppingCart size={11} /> Procure
            </button>
            <button
              onClick={() => handleReject(row._id)}
              className="px-2.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-medium flex items-center gap-1 transition-colors"
            >
              <Ban size={11} /> Reject
            </button>
          </div>
        ) : (
          "-"
        ),
    },
  ];

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-600 flex items-center justify-center text-white shadow-md shadow-indigo-900/20">
            <ClipboardList size={20} />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Stock Requests</h1>
        </div>
        {userRole !== "admin" && <button
          onClick={() => setShowCreate((v) => !v)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-900/20 transition-all"
        >
          {showCreate ? <X size={16} /> : <PackagePlus size={16} />}
          {showCreate ? "Close" : "New Request"}
        </button>}
      </div>

      <AnimatePresence>
        {showCreate && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleCreate}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm shadow-gray-200/60 p-5 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-hidden"
          >
            <select className={inputCls} value={form.projectId} onChange={(e) => setForm({ ...form, projectId: e.target.value })} required>
              <option value="">Select Project</option>
              {projects?.map((p) => (
                <option key={p._id} value={p._id}>{p.projectName}</option>
              ))}
            </select>

            <select
              className={inputCls}
              value={form.materialId}
              onChange={(e) => setForm({ ...form, materialId: e.target.value, unit: items.find((i) => i._id === e.target.value)?.unit || "" })}
              required
            >
              <option value="">Select Material</option>
              {items?.map((it) => (
                <option key={it._id} value={it._id}>{it.name}</option>
              ))}
            </select>

            <input type="number" placeholder="Quantity" className={inputCls} value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} required />
            <input type="text" placeholder="Unit" className={inputCls} value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} required />

            <input type="date" className={inputCls} value={form.requiredDate} onChange={(e) => setForm({ ...form, requiredDate: e.target.value })} required />
            <select className={inputCls} value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
              <option>Urgent</option>
            </select>

            <input type="text" placeholder="Purpose" className={`${inputCls} md:col-span-2`} value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })} />
            <textarea placeholder="Description" className={`${inputCls} md:col-span-2`} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />

            <div className="md:col-span-2">
              <label className="block text-sm text-gray-600 mb-1.5">Site Images (why material is needed)</label>
              <input type="file" multiple accept="image/*" onChange={(e) => setImageFiles(Array.from(e.target.files))} className="text-sm" />
            </div>

            <button
              type="submit"
              disabled={creating}
              className="md:col-span-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white py-2.5 rounded-xl font-semibold shadow-lg shadow-indigo-900/20 disabled:opacity-60 transition-all"
            >
              {creating ? "Submitting..." : "Submit Request"}
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-500">
          <Loader2 className="animate-spin" size={22} />
          <p className="text-sm">Loading requests...</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm shadow-gray-200/60 overflow-hidden">
          <ReportTable columns={columns} data={requests} />
        </div>
      )}

      <AnimatePresence>
        {fulfilModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
            >
              <h3 className="text-lg font-bold mb-4 capitalize text-gray-800">
                {fulfilModal.type} — {fulfilModal.request.materialName}
              </h3>
              <form onSubmit={handleFulfilSubmit} className="space-y-3">
                {fulfilModal.type === "transfer" ? (
                  <select name="sourceProjectId" className={`${inputCls} w-full`} required>
                    <option value="">Source Project (transfer from)</option>
                    {projects.filter((p) => p._id !== fulfilModal.request.projectId?._id).map((p) => (
                      <option key={p._id} value={p._id}>{p.projectName}</option>
                    ))}
                  </select>
                ) : (
                  <>
                    <select name="vendorId" className={`${inputCls} w-full`} required>
                      <option value="">Select Vendor</option>
                      {vendors.map((v) => (
                        <option key={v._id} value={v._id}>{v.companyName}</option>
                      ))}
                    </select>
                    <input name="rate" type="number" placeholder="Rate per unit" className={`${inputCls} w-full`} required />
                    <input name="tax" type="number" placeholder="Tax %" className={`${inputCls} w-full`} />
                    <input name="expectedDeliveryDate" type="date" className={`${inputCls} w-full`} />
                  </>
                )}
                <input name="quantity" type="number" placeholder="Quantity" defaultValue={fulfilModal.request.quantity} className={`${inputCls} w-full`} required />
                {fulfilModal.type === "transfer" && <input name="remarks" type="text" placeholder="Remarks" className={`${inputCls} w-full`} />}

                <div className="flex gap-2 justify-end pt-2">
                  <button type="button" onClick={() => setFulfilModal(null)} className="px-4 py-2 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors">
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={transferring || procuring}
                    className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl font-medium shadow-md shadow-indigo-900/20 disabled:opacity-60"
                  >
                    {transferring || procuring ? "Saving..." : "Confirm"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StockRequests;
