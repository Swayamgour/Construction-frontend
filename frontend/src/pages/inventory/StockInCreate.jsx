import React, { useState } from "react";
import { FiSave, FiArrowLeft } from "react-icons/fi";
import { useLocation, useNavigate } from "react-router-dom";
import { useAddStockMutation, useGetVendorsQuery } from "../../Reduxe/Api";
import toast from "react-hot-toast";

const StockInCreate = () => {
    const navigate = useNavigate();
    const { data: vendors = [] } = useGetVendorsQuery();
    const [addStock] = useAddStockMutation();
    const location = useLocation();

    const selectedProjectId = location?.state?.selectedProjectId || null;

    const [selectedVendor, setSelectedVendor] = useState(null);
    const [formData, setFormData] = useState({
        vendorId: "",
        projectId: selectedProjectId || "",
        productId: "", // optional for now
        vendorType: "",
        itemName: "",
        qty: "",
        unit: "Bag",
        rate: "",
        totalAmount: 0,
        usageDuration: "",
        notes: "",
        entryType: "IN"
    });

    // ✅ Auto calculate total
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        const updated = { ...formData, [name]: value };

        // Fix: use `updated` not `formData` inside condition
        if (name === "qty" || name === "rate" || name === "usageDuration") {
            if (updated.vendorType === "Material Supplier") {
                updated.totalAmount = (Number(updated.qty) || 0) * (Number(updated.rate) || 0);
            } else if (updated.vendorType.includes("Machine")) {
                updated.totalAmount = (Number(updated.rate) || 0) * (Number(updated.usageDuration) || 0);
            }
        }

        setFormData(updated);
    };

    // ✅ Vendor selection logic
    const handleVendorSelect = (e) => {
        const vendorId = e.target.value;
        const vendor = vendors.find((v) => v._id === vendorId);

        setSelectedVendor(vendor || null);

        setFormData({
            ...formData,
            vendorId,
            vendorType: vendor?.vendorType || "",
            itemName: "",
            productId: "",
            qty: "",
            rate: "",
            totalAmount: 0,
            usageDuration: "",
            notes: "",
        });
    };

    // ✅ Item select (we'll use item name as product for now)
    const handleItemSelect = (e) => {
        const selectedItem = e.target.value;
        setFormData({
            ...formData,
            itemName: selectedItem,
            productId: selectedItem, // backend expects this — use same value
        });
    };

    // ✅ Submit form
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const payload = {
                ...formData,
                projectId: selectedProjectId,
                entryType: "IN",
            };

            const res = await addStock(payload);
            console.log("📦 Stock Added:", res);

            if (res?.data?.success) {
                toast.success('Stock Added Successfully!')
                navigate("/StockOverView");
            } else {
                toast.error(res?.error?.data?.message || "Failed to add stock")
                // alert("❌ " + ());
                // toast
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
                    Add Stock / Machine (Stock IN)
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* ✅ Vendor Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Select Vendor
                        </label>
                        <select
                            value={formData.vendorId}
                            onChange={handleVendorSelect}
                            className="w-full border rounded-lg px-4 py-2 outline-none"
                            required
                        >
                            <option value="">Select Vendor</option>
                            {vendors.map((v) => (
                                <option key={v._id} value={v._id}>
                                    {v.companyName} ({v.vendorType})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* ✅ Dynamic Product/Machine Selection */}
                    {selectedVendor && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {selectedVendor.vendorType.includes("Machine")
                                    ? "Select Machine"
                                    : "Select Product"}
                            </label>
                            <select
                                name="itemName"
                                value={formData.itemName}
                                onChange={handleItemSelect}
                                className="w-full border rounded-lg px-4 py-2 outline-none"
                                required
                            >
                                <option value="">
                                    {selectedVendor.vendorType.includes("Machine")
                                        ? "Select Machine"
                                        : "Select Product"}
                                </option>
                                {selectedVendor?.productCategories?.map((p, i) => (
                                    <option key={i} value={p}>
                                        {p}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* ✅ Material Supplier Inputs */}
                    {formData.vendorType === "Material Supplier" && (
                        <>
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
                                placeholder="Rate per unit"
                                className="w-full border rounded-lg px-4 py-2 outline-none"
                                name="rate"
                                value={formData.rate}
                                onChange={handleInputChange}
                                required
                            />
                        </>
                    )}

                    {/* ✅ Machine Supplier Inputs */}
                    {formData.vendorType.includes("Machine") && (
                        <>
                            <input
                                type="number"
                                placeholder="Rate per Hour / Day"
                                className="w-full border rounded-lg px-4 py-2 outline-none"
                                name="rate"
                                value={formData.rate}
                                onChange={handleInputChange}
                                required
                            />
                            <input
                                type="number"
                                placeholder="Usage Duration (Hours / Days)"
                                className="w-full border rounded-lg px-4 py-2 outline-none"
                                name="usageDuration"
                                value={formData.usageDuration}
                                onChange={handleInputChange}
                                required
                            />
                        </>
                    )}

                    {/* ✅ Total Amount */}
                    <input
                        type="number"
                        placeholder="Total Amount"
                        className="w-full border rounded-lg px-4 py-2 outline-none bg-gray-100"
                        value={formData.totalAmount}
                        readOnly
                    />

                    {/* ✅ Notes */}
                    <textarea
                        placeholder="Notes / Invoice / Bill Info"
                        className="w-full border rounded-lg px-4 py-2 outline-none"
                        name="notes"
                        rows={3}
                        onChange={handleInputChange}
                    />

                    <button
                        type="submit"
                        className="flex items-center justify-center gap-2 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                    >
                        <FiSave /> Save Entry
                    </button>
                </form>
            </div>
        </div>
    );
};

export default StockInCreate;
