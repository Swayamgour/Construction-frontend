import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Boxes, Receipt, PackagePlus, PackageMinus, ArrowRightLeft, Undo2, Loader2, AlertTriangle, Inbox } from "lucide-react";
import {
  useGetProjectStockQuery,
  useGetProjectsQuery,
  useReceiveMaterialMutation,
  useOutStockMutation,
  useTransferMaterialMutation,
  useReturnMaterialMutation,
} from "../../../src/Reduxe/Api";
import Modal from "../../components/Modal";

const ACTION_META = {
  receive: { label: "Receive", icon: PackagePlus, chip: "bg-emerald-50 text-emerald-700 hover:bg-emerald-100", btn: "bg-emerald-600 hover:bg-emerald-700" },
  use: { label: "Use", icon: PackageMinus, chip: "bg-sky-50 text-sky-700 hover:bg-sky-100", btn: "bg-sky-600 hover:bg-sky-700" },
  transfer: { label: "Transfer", icon: ArrowRightLeft, chip: "bg-amber-50 text-amber-700 hover:bg-amber-100", btn: "bg-amber-600 hover:bg-amber-700" },
  return: { label: "Return", icon: Undo2, chip: "bg-rose-50 text-rose-700 hover:bg-rose-100", btn: "bg-rose-600 hover:bg-rose-700" },
};

const inputCls = "w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all";

const ProjectStockPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const { data: stock = [], isLoading, isError } = useGetProjectStockQuery(projectId);
  const { data: projectResp } = useGetProjectsQuery();
  const otherProjects = (projectResp?.data || projectResp || []).filter((p) => p._id !== projectId);

  const [openModal, setOpenModal] = useState(null); // "receive" | "use" | "transfer" | "return"
  const [selectedItem, setSelectedItem] = useState(null);
  const [saving, setSaving] = useState(false);

  const [receiveMaterial] = useReceiveMaterialMutation();
  const [issueStock] = useOutStockMutation();
  const [transferMaterial] = useTransferMaterialMutation();
  const [returnMaterial] = useReturnMaterialMutation();

  const [form, setForm] = useState({ qty: "", toProjectId: "", reason: "" });

  const handleOpen = (type, item) => {
    setSelectedItem(item);
    setForm({ qty: "", toProjectId: "", reason: "" });
    setOpenModal(type);
  };

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const runAction = async (fn, closeAfter) => {
    setSaving(true);
    try {
      await fn().unwrap?.();
      toast.success(`${ACTION_META[openModal].label} recorded`);
      closeAfter();
    } catch (err) {
      toast.error(err?.data?.message || "Action failed");
    } finally {
      setSaving(false);
    }
  };

  const handleReceiveSubmit = () => {
    if (!form.qty) return toast.error("Enter quantity");
    runAction(
      () =>
        receiveMaterial({
          projectId,
          itemId: selectedItem.itemId._id,
          qty: Number(form.qty),
          unit: selectedItem.itemId.unit,
          reason: form.reason,
        }),
      () => setOpenModal(null)
    );
  };

  const handleUseSubmit = () => {
    if (!form.qty) return toast.error("Enter quantity");
    runAction(
      () =>
        issueStock({
          projectId,
          items: [{ itemId: selectedItem.itemId._id, qty: Number(form.qty) }],
          reason: form.reason,
        }),
      () => setOpenModal(null)
    );
  };

  const handleTransferSubmit = () => {
    if (!form.qty || !form.toProjectId) return toast.error("Enter quantity and destination project");
    runAction(
      () =>
        transferMaterial({
          fromProjectId: projectId,
          toProjectId: form.toProjectId,
          itemId: selectedItem.itemId._id,
          qty: Number(form.qty),
          unit: selectedItem.itemId.unit,
          reason: form.reason,
        }),
      () => setOpenModal(null)
    );
  };

  const handleReturnSubmit = () => {
    if (!form.qty) return toast.error("Enter quantity");
    runAction(
      () =>
        returnMaterial({
          projectId,
          itemId: selectedItem.itemId._id,
          qty: Number(form.qty),
          unit: selectedItem.itemId.unit,
          reason: form.reason,
        }),
      () => setOpenModal(null)
    );
  };

  const SUBMIT_HANDLERS = {
    receive: handleReceiveSubmit,
    use: handleUseSubmit,
    transfer: handleTransferSubmit,
    return: handleReturnSubmit,
  };

  return (
    <div className="space-y-5 p-4 sm:p-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-600 flex items-center justify-center text-white shadow-md shadow-indigo-900/20">
            <Boxes size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Project Stock</h2>
            <p className="text-sm text-gray-500">
              Project ID: <span className="font-mono">{projectId}</span>
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate(`/stock/transactions/${projectId}`)}
          className="flex items-center gap-2 px-4 py-2.5 text-sm rounded-xl bg-gray-900 hover:bg-gray-800 text-white transition-colors w-fit"
        >
          <Receipt size={14} /> View Transactions
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm shadow-gray-200/60 border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50/70">
          <span className="font-semibold text-sm text-gray-700">Current Stock</span>
        </div>

        {isLoading && (
          <div className="flex flex-col items-center justify-center gap-3 py-14 text-gray-500">
            <Loader2 className="animate-spin" size={20} />
            <p className="text-sm">Loading stock...</p>
          </div>
        )}
        {isError && (
          <div className="flex flex-col items-center justify-center gap-2 py-14 text-red-500">
            <AlertTriangle size={20} />
            <p className="text-sm">Error loading stock.</p>
          </div>
        )}
        {!isLoading && stock.length === 0 && (
          <div className="text-center py-14">
            <Inbox className="mx-auto text-gray-300 mb-3" size={28} />
            <p className="text-sm text-gray-500">No stock found.</p>
          </div>
        )}

        {!isLoading && stock.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-50/70 text-gray-500 text-xs uppercase tracking-wide">
                  <th className="text-left px-4 py-3 font-semibold">Item</th>
                  <th className="text-left px-4 py-3 font-semibold">Unit</th>
                  <th className="text-right px-4 py-3 font-semibold">Qty</th>
                  <th className="text-right px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {stock.map((row) => (
                  <tr key={row._id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-4 py-3 text-gray-800 font-medium">{row?.itemId?.name || "—"}</td>
                    <td className="px-4 py-3 text-gray-500">{row?.itemId?.unit || row.unit || "—"}</td>
                    <td className="px-4 py-3 text-right font-mono text-gray-700">{row.qty}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2 flex-wrap">
                        {Object.entries(ACTION_META).map(([key, meta]) => {
                          const Icon = meta.icon;
                          return (
                            <button
                              key={key}
                              className={`px-2.5 py-1.5 text-xs rounded-lg font-medium flex items-center gap-1 transition-colors ${meta.chip}`}
                              onClick={() => handleOpen(key, row)}
                            >
                              <Icon size={11} /> {meta.label}
                            </button>
                          );
                        })}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Shared modal for all 4 actions */}
      {openModal && (
        <Modal
          open={!!openModal}
          title={`${ACTION_META[openModal].label} – ${selectedItem?.itemId?.name || ""}`}
          onClose={() => setOpenModal(null)}
        >
          <div className="space-y-3">
            <input
              type="number"
              name="qty"
              value={form.qty}
              onChange={handleChange}
              placeholder="Quantity"
              className={inputCls}
            />

            {openModal === "transfer" && (
              <select name="toProjectId" value={form.toProjectId} onChange={handleChange} className={inputCls}>
                <option value="">Transfer To Project</option>
                {otherProjects.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.projectName}
                  </option>
                ))}
              </select>
            )}

            <input
              type="text"
              name="reason"
              value={form.reason}
              onChange={handleChange}
              placeholder={openModal === "use" ? "Purpose / Work (optional)" : "Reason (optional)"}
              className={inputCls}
            />

            <button
              onClick={SUBMIT_HANDLERS[openModal]}
              disabled={saving}
              className={`w-full mt-1 px-3 py-2.5 rounded-xl text-white text-sm font-semibold transition-colors disabled:opacity-60 ${ACTION_META[openModal].btn}`}
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ProjectStockPage;
