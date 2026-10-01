import React, { useState } from "react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ClipboardList,
  CalendarDays,
  Package,
  Calculator,
  Scale,
  AlertTriangle,
  Trash2,
  Plus,
  FolderKanban,
} from "lucide-react";
import { useGetProjectsQuery, useCreateMaterialRequestMutation, useGetAllItemsQuery } from "../../Reduxe/Api";

const fieldCls =
  "w-full rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all p-3 mt-1.5";

const PRIORITY_STYLES = {
  low: "border-emerald-200 focus:ring-emerald-500",
  medium: "border-amber-200 focus:ring-amber-500",
  high: "border-red-200 focus:ring-red-500",
};

export default function MaterialRequest() {
  const { data: projects } = useGetProjectsQuery();
  const { data: items } = useGetAllItemsQuery();

  const [createRequest, { isLoading }] = useCreateMaterialRequestMutation();
  const navigate = useNavigate();

  const [projectId, setProjectId] = useState("");
  const [requiredDate, setRequiredDate] = useState("");

  const [mrItems, setMrItems] = useState([
    { itemId: "", requestedQty: "", unit: "", priority: "medium", purpose: "" },
  ]);

  const addItemRow = () => {
    setMrItems([...mrItems, { itemId: "", requestedQty: "", unit: "", priority: "medium", purpose: "" }]);
  };

  const removeItemRow = (index) => {
    const updated = [...mrItems];
    updated.splice(index, 1);
    setMrItems(updated);
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...mrItems];
    updated[index][field] = value;

    if (field === "itemId") {
      const selected = items?.items?.find((i) => i._id === value);
      updated[index].unit = selected?.unit || "";
    }

    setMrItems(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!projectId) return toast.error("Project is required.");
    if (!mrItems.length) return toast.error("Add at least one item.");

    if (mrItems.some((i) => !i.itemId || !i.requestedQty)) {
      return toast.error("Each item must have an Item and Quantity.");
    }

    try {
      await createRequest({ projectId, requiredDate, items: mrItems }).unwrap();
      toast.success("Material Request Sent Successfully!");
      navigate("/StockOverView");
    } catch (error) {
      toast.error(error?.data?.message || "Request Failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-xl shadow-gray-200/60 border border-gray-100 p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-600 flex items-center justify-center text-white shadow-md shadow-indigo-900/20">
              <ClipboardList size={20} />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">New Material Request</h2>
          </div>

          {/* PROJECT */}
          <div>
            <label className="font-semibold text-gray-700 text-sm flex items-center gap-1.5">
              <FolderKanban size={14} /> Select Project
            </label>
            <select value={projectId} onChange={(e) => setProjectId(e.target.value)} className={fieldCls}>
              <option value="">Choose project...</option>
              {projects?.data?.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.projectName}
                </option>
              ))}
            </select>
          </div>

          {/* DATE */}
          <div className="mt-4">
            <label className="font-semibold text-gray-700 text-sm flex items-center gap-1.5">
              <CalendarDays size={14} /> Required Date
            </label>
            <input
              type="date"
              value={requiredDate}
              onChange={(e) => setRequiredDate(e.target.value)}
              className={fieldCls}
            />
          </div>

          {/* MULTIPLE ITEMS */}
          <div className="mt-6 space-y-4">
            <AnimatePresence initial={false}>
              {mrItems.map((row, index) => (
                <motion.div
                  key={index}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="p-5 bg-gray-50 rounded-2xl border border-gray-200 relative"
                >
                  {mrItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItemRow(index)}
                      className="absolute top-3 right-3 text-red-500 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}

                  <label className="font-semibold text-gray-700 text-sm flex items-center gap-1.5">
                    <Package size={14} className="text-orange-500" /> Select Item
                  </label>

                  <select
                    value={row.itemId}
                    onChange={(e) => {
                      const selectedId = e.target.value;
                      if (mrItems.some((i, idx) => i.itemId === selectedId && idx !== index)) {
                        toast.error("This item is already selected!");
                        return;
                      }
                      handleItemChange(index, "itemId", selectedId);
                    }}
                    className={fieldCls}
                  >
                    <option value="">Choose Item...</option>
                    {items?.items?.map((i) => (
                      <option
                        key={i._id}
                        value={i._id}
                        disabled={mrItems.some((it, idx2) => it.itemId === i._id && idx2 !== index)}
                      >
                        {i.name} ({i.unit})
                      </option>
                    ))}
                  </select>

                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="font-semibold text-gray-700 text-sm flex items-center gap-1.5">
                        <Calculator size={14} /> Quantity
                      </label>
                      <input
                        type="number"
                        value={row.requestedQty}
                        onChange={(e) => handleItemChange(index, "requestedQty", e.target.value)}
                        className={fieldCls}
                        placeholder="Enter qty..."
                      />
                    </div>

                    <div>
                      <label className="font-semibold text-gray-700 text-sm flex items-center gap-1.5">
                        <Scale size={14} /> Unit
                      </label>
                      <input type="text" value={row.unit} readOnly className={`${fieldCls} bg-gray-100 text-gray-500`} />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="font-semibold text-gray-700 text-sm flex items-center gap-1.5">
                      <AlertTriangle size={14} /> Priority
                    </label>
                    <select
                      value={row.priority}
                      onChange={(e) => handleItemChange(index, "priority", e.target.value)}
                      className={`${fieldCls} ${PRIORITY_STYLES[row.priority]}`}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>

                  <div className="mt-4">
                    <label className="font-semibold text-gray-700 text-sm">Purpose</label>
                    <textarea
                      value={row.purpose}
                      onChange={(e) => handleItemChange(index, "purpose", e.target.value)}
                      className={fieldCls}
                      rows="2"
                      placeholder="Where will it be used?"
                    />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            <button
              type="button"
              onClick={addItemRow}
              className="w-full p-3 bg-indigo-50 border border-indigo-200 text-indigo-700 font-semibold rounded-xl hover:bg-indigo-100 transition-colors flex items-center justify-center gap-2"
            >
              <Plus size={16} /> Add Another Item
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-6 p-3.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-xl text-base font-bold shadow-lg shadow-indigo-900/20 disabled:opacity-60 transition-all"
          >
            {isLoading ? "Submitting..." : "Submit Material Request"}
          </button>
        </form>
      </div>
    </div>
  );
}
