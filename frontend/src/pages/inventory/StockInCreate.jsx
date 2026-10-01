import React, { useState } from "react";
import { ArrowLeft, Save, PackagePlus, Truck, Boxes, StickyNote } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useReceiveMaterialMutation, useGetVendorsQuery, useGetAllItemsQuery } from "../../Reduxe/Api";
import toast from "react-hot-toast";

const fieldCls =
  "w-full rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all px-4 py-2.5";

const StockInCreate = () => {
  const navigate = useNavigate();
  const { data: vendorsResp } = useGetVendorsQuery();
  const { data: itemsResp } = useGetAllItemsQuery();
  const [receiveMaterial, { isLoading }] = useReceiveMaterialMutation();
  const location = useLocation();

  const vendors = vendorsResp?.data || vendorsResp || [];
  const items = itemsResp?.data || itemsResp || [];

  const selectedProjectId = location?.state?.selectedProjectId || null;

  const [formData, setFormData] = useState({
    vendorId: "",
    itemId: "",
    qty: "",
    unit: "Bag",
    rate: "",
    totalAmount: 0,
    notes: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...formData, [name]: value };

    if (name === "qty" || name === "rate") {
      updated.totalAmount = (Number(updated.qty) || 0) * (Number(updated.rate) || 0);
    }

    setFormData(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedProjectId) {
      toast.error("No project selected");
      return;
    }
    if (!formData.itemId || !formData.qty) {
      toast.error("Item and quantity are required");
      return;
    }

    try {
      const payload = {
        projectId: selectedProjectId,
        itemId: formData.itemId,
        qty: Number(formData.qty),
        unit: formData.unit,
        reason: formData.notes || "Material received",
      };

      await receiveMaterial(payload).unwrap();
      toast.success("Stock added successfully!");
      navigate("/StockOverView");
    } catch (error) {
      toast.error(error?.data?.message || "Failed to add stock");
    }
  };

  return (
    <div className="p-4 sm:p-6 min-h-screen bg-gray-50">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-5 transition-colors"
      >
        <ArrowLeft size={16} /> Back
      </button>

      <div className="bg-white rounded-2xl shadow-sm shadow-gray-200/60 border border-gray-100 p-6 max-w-xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md shadow-emerald-900/20">
            <PackagePlus size={20} />
          </div>
          <h2 className="text-xl font-bold text-gray-800">Add Stock (Stock IN)</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
              <Truck size={13} /> Vendor (for reference)
            </label>
            <select
              value={formData.vendorId}
              onChange={(e) => setFormData({ ...formData, vendorId: e.target.value })}
              className={fieldCls}
            >
              <option value="">Select Vendor (optional)</option>
              {vendors.map((v) => (
                <option key={v._id} value={v._id}>
                  {v.companyName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
              <Boxes size={13} /> Item *
            </label>
            <select name="itemId" value={formData.itemId} onChange={handleInputChange} className={fieldCls} required>
              <option value="">Select Item</option>
              {items.map((it) => (
                <option key={it._id} value={it._id}>
                  {it.name} ({it.unit})
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3">
            <input
              type="number"
              placeholder="Quantity"
              className={fieldCls}
              name="qty"
              value={formData.qty}
              onChange={handleInputChange}
              required
            />
            <select name="unit" value={formData.unit} onChange={handleInputChange} className={`${fieldCls} w-36 shrink-0`}>
              <option>Bag</option>
              <option>KG</option>
              <option>Ton</option>
              <option>Piece</option>
            </select>
          </div>

          <input
            type="number"
            placeholder="Rate per unit (for reference — not saved to stock ledger)"
            className={fieldCls}
            name="rate"
            value={formData.rate}
            onChange={handleInputChange}
          />

          <input
            type="number"
            placeholder="Total Amount"
            className={`${fieldCls} bg-gray-100 text-gray-500`}
            value={formData.totalAmount}
            readOnly
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
              <StickyNote size={13} /> Notes / Invoice / Bill Info
            </label>
            <textarea className={fieldCls} name="notes" rows={3} onChange={handleInputChange} />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white py-3 rounded-xl font-semibold shadow-lg shadow-emerald-900/20 disabled:opacity-60 transition-all"
          >
            <Save size={16} /> {isLoading ? "Saving..." : "Save Entry"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default StockInCreate;
