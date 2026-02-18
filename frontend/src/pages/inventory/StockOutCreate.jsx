import React, { useState } from "react";
import { FiSave, FiArrowLeft } from "react-icons/fi";
import { useLocation, useNavigate } from "react-router-dom";
import { useAddStockMutation, useGetStockByIdQuery } from "../../Reduxe/Api";
import toast from "react-hot-toast";

const StockOutCreate = () => {
  const navigate = useNavigate();
  const [addStock] = useAddStockMutation();
  const location = useLocation();
  const selectedProjectId = location?.state?.selectedProjectId || null;

  const { data: projectStockData = [] } = useGetStockByIdQuery(selectedProjectId, {
    skip: !selectedProjectId,
  });

  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({
    projectId: selectedProjectId || "",
    itemName: "",
    qty: "",
    unit: "",
    notes: "",
    entryType: "OUT",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleItemSelect = (e) => {
    const itemName = e.target.value;
    const found = projectStockData.find((i) => i.itemName === itemName);
    setSelectedItem(found || null);
    setFormData({
      ...formData,
      itemName,
      unit: found?.unit || "Bag",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedItem && Number(formData.qty) > selectedItem.qty) {
      alert(`❌ Only ${selectedItem.qty} ${selectedItem.unit} available.`);
      return;
    }

    try {
      const payload = {
        ...formData,
        projectId: selectedProjectId,
        entryType: "OUT",
      };

      const res = await addStock(payload);

      if (res?.data?.success) {
        // alert("✅ ");
        toast.success("Stock OUT entry added successfully!")
        navigate("/StockOverView");
      } else {
        toast.error(res?.error?.data?.message || "Failed to add stock")
        // alert("❌ " + ());
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error('Something went wrong')
      // alert("❌ ");
    }
  };

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
      >
        <FiArrowLeft /> Back
      </button>

      <div className="bg-white rounded-xl shadow-lg p-6 max-w-xl mx-auto">
        <h2 className="text-xl font-semibold text-gray-800 mb-5">
          Stock Out Entry
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Item Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Item
            </label>
            <select
              value={formData.itemName}
              onChange={handleItemSelect}
              className="w-full border rounded-lg px-4 py-2 outline-none"
              required
            >
              <option value="">Select Item</option>
              {projectStockData.map((item) => (
                <option key={item._id} value={item.itemName}>
                  {item.itemName} — {item.qty} {item.unit} available
                </option>
              ))}
            </select>
          </div>

          {/* Available Info */}
          {selectedItem && (
            <div className="text-sm text-gray-600 bg-gray-100 rounded-lg p-3">
              <p>
                Available:{" "}
                <strong>
                  {selectedItem.qty} {selectedItem.unit}
                </strong>
              </p>
            </div>
          )}

          {/* Quantity Input */}
          <div className="flex gap-3">
            <input
              type="number"
              placeholder="Quantity to OUT"
              name="qty"
              value={formData.qty}
              onChange={handleInputChange}
              className="w-full border rounded-lg px-4 py-2 outline-none"
              required
            />
            <input
              type="text"
              name="unit"
              value={formData.unit}
              readOnly
              className="border rounded-lg px-4 py-2 bg-gray-100 text-center w-24"
            />
          </div>

          {/* Notes */}
          <textarea
            placeholder="Where used / Notes"
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            rows={3}
            className="w-full border rounded-lg px-4 py-2 outline-none"
          />

          <button
            type="submit"
            disabled={selectedItem && Number(formData.qty) > selectedItem.qty}
            className={`flex items-center justify-center gap-2 w-full py-2 rounded-lg ${selectedItem && Number(formData.qty) > selectedItem.qty
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-red-600 hover:bg-red-700 text-white"
              }`}
          >
            <FiSave /> Save OUT Entry
          </button>
        </form>
      </div>
    </div>
  );
};

export default StockOutCreate;
