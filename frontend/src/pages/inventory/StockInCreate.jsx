import React, { useState } from "react";
import { FiSave, FiArrowLeft } from "react-icons/fi";
import { useLocation, useNavigate } from "react-router-dom";
import { useReceiveMaterialMutation, useGetVendorsQuery, useGetAllItemsQuery } from "../../Reduxe/Api";
import toast from "react-hot-toast";

/**
 * CORRECTED to match the real backend:
 *  - useAddStockMutation didn't exist (no POST /stock/add on the backend) —
 *    the real "stock IN" endpoint is receiveMaterial (POST /stock/receive),
 *    which requires a real Item (from the Item catalog), not a free-text
 *    itemName pulled from vendor.productCategories (a field that doesn't
 *    exist on the Vendor model either).
 *  - The "Machine Supplier" rental-billing branch (rate x usage duration)
 *    has no backend support at all — machines are tracked entirely
 *    separately via the Machine/MachineAssignment system, not through
 *    Stock. That branch is removed here; machine rentals should be
 *    recorded via the Machines pages instead.
 */
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
            console.error("Error:", error);
            toast.error(error?.data?.message || "Failed to add stock");
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
                    Add Stock (Stock IN)
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Vendor (for reference)
                        </label>
                        <select
                            value={formData.vendorId}
                            onChange={(e) => setFormData({ ...formData, vendorId: e.target.value })}
                            className="w-full border rounded-lg px-4 py-2 outline-none"
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Item *
                        </label>
                        <select
                            name="itemId"
                            value={formData.itemId}
                            onChange={handleInputChange}
                            className="w-full border rounded-lg px-4 py-2 outline-none"
                            required
                        >
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
                            className="w-full border rounded-lg px-4 py-2 outline-none"
                            name="qty"
                            value={formData.qty}
                            onChange={handleInputChange}
                            required
                        />
                        <select
                            name="unit"
                            value={formData.unit}
                            onChange={handleInputChange}
                            className="border rounded-lg px-4 py-2"
                        >
                            <option>Bag</option>
                            <option>KG</option>
                            <option>Ton</option>
                            <option>Piece</option>
                        </select>
                    </div>

                    <input
                        type="number"
                        placeholder="Rate per unit (for reference — not saved to stock ledger)"
                        className="w-full border rounded-lg px-4 py-2 outline-none"
                        name="rate"
                        value={formData.rate}
                        onChange={handleInputChange}
                    />

                    <input
                        type="number"
                        placeholder="Total Amount"
                        className="w-full border rounded-lg px-4 py-2 outline-none bg-gray-100"
                        value={formData.totalAmount}
                        readOnly
                    />

                    <textarea
                        placeholder="Notes / Invoice / Bill Info"
                        className="w-full border rounded-lg px-4 py-2 outline-none"
                        name="notes"
                        rows={3}
                        onChange={handleInputChange}
                    />

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="flex items-center justify-center gap-2 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-60"
                    >
                        <FiSave /> {isLoading ? "Saving..." : "Save Entry"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default StockInCreate;
