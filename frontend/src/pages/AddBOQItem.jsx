import React, { useState } from "react";
import { FaPlus, FaTrash, FaSave, FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const AddBOQItem = () => {
    const navigate = useNavigate();

    const [items, setItems] = useState([
        { category: "", quantity: "", rate: "", total: 0, status: "Ongoing" },
    ]);

    const handleChange = (index, field, value) => {
        const updated = [...items];
        updated[index][field] = value;

        if (field === "quantity" || field === "rate") {
            const qty = parseFloat(updated[index].quantity) || 0;
            const rate = parseFloat(updated[index].rate) || 0;
            updated[index].total = qty * rate;
        }

        setItems(updated);
    };

    const addItem = () => {
        setItems([
            ...items,
            { category: "", quantity: "", rate: "", total: 0, status: "Ongoing" },
        ]);
    };

    const removeItem = (index) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const handleSave = () => {
        console.log("BOQ Items Saved:", items);
        alert("Items saved successfully!");
        navigate("/DetailedBOQ");
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 p-6 md:p-12">
            <div className="max-w-6xl mx-auto bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200 p-8 space-y-10">
                {/* Header */}
                <div className="flex items-center justify-start flex-wrap gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2  text-slate-700 px-5 py-3 rounded-2xl font-medium shadow-sm transition-all"
                    >
                        <FaArrowLeft /> 
                    </button>
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900">
                            Add New BOQ Items
                        </h1>
                        <p className="text-slate-500 mt-1">
                            Add material or labor details to your project’s BOQ
                        </p>
                    </div>


                </div>

                {/* Form Section */}
                <div className="space-y-6">
                    {items.map((item, index) => (
                        <div
                            key={index}
                            className="p-6 border border-slate-200 rounded-2xl shadow-sm bg-gradient-to-br from-white via-slate-50 to-slate-100 hover:shadow-md transition-all duration-200"
                        >
                            <div className="grid md:grid-cols-5 gap-4">
                                <input
                                    type="text"
                                    placeholder="Category (e.g. Cement)"
                                    value={item.category}
                                    onChange={(e) => handleChange(index, "category", e.target.value)}
                                    className="border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                                <input
                                    type="number"
                                    placeholder="Quantity"
                                    value={item.quantity}
                                    onChange={(e) => handleChange(index, "quantity", e.target.value)}
                                    className="border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                                <input
                                    type="number"
                                    placeholder="Rate (₹)"
                                    value={item.rate}
                                    onChange={(e) => handleChange(index, "rate", e.target.value)}
                                    className="border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                                <input
                                    type="text"
                                    placeholder="Total"
                                    value={item.total.toLocaleString("en-IN")}
                                    readOnly
                                    className="border border-slate-300 rounded-xl px-4 py-3 bg-slate-100 text-slate-700 font-medium"
                                />
                                <select
                                    value={item.status}
                                    onChange={(e) => handleChange(index, "status", e.target.value)}
                                    className="border border-slate-300 rounded-xl px-4 py-3 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    <option value="Ongoing">Ongoing</option>
                                    <option value="Completed">Completed</option>
                                </select>
                            </div>

                            {items.length > 1 && (
                                <div className="flex justify-end mt-4">
                                    <button
                                        onClick={() => removeItem(index)}
                                        className="text-red-600 hover:text-red-800 flex items-center gap-1 font-medium transition-colors"
                                    >
                                        <FaTrash /> Remove
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Add Item Button */}
                <div className="flex justify-center">
                    <button
                        onClick={addItem}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-full shadow-md transition-all flex items-center justify-center gap-2"
                    >
                        <FaPlus /> Add Another Item
                    </button>
                </div>

                {/* Preview Table */}
                <div className="mt-10 overflow-x-auto">
                    <h2 className="text-xl font-bold text-slate-800 mb-4">
                        Preview of Added Items
                    </h2>
                    <table className="w-full border-collapse overflow-hidden rounded-2xl shadow-md">
                        <thead className="bg-blue-600 text-white">
                            <tr>
                                <th className="p-3 text-left">Category</th>
                                <th className="p-3 text-left">Quantity</th>
                                <th className="p-3 text-left">Rate</th>
                                <th className="p-3 text-left">Total</th>
                                <th className="p-3 text-left">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item, idx) => (
                                <tr
                                    key={idx}
                                    className="border-b border-slate-200 hover:bg-slate-50 transition-all"
                                >
                                    <td className="p-3">{item.category || "-"}</td>
                                    <td className="p-3">{item.quantity || "-"}</td>
                                    <td className="p-3">{item.rate ? `₹${item.rate}` : "-"}</td>
                                    <td className="p-3 font-semibold text-slate-700">
                                        ₹{item.total ? item.total.toLocaleString("en-IN") : "0"}
                                    </td>
                                    <td className="p-3">
                                        <span
                                            className={`px-3 py-1 text-sm font-medium rounded-full ${item.status === "Ongoing"
                                                ? "bg-yellow-100 text-yellow-800"
                                                : "bg-green-100 text-green-700"
                                                }`}
                                        >
                                            {item.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-4 pt-6">
                    <button
                        onClick={() => navigate(-1)}
                        className="px-6 py-3 rounded-2xl bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-6 py-3 rounded-2xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-all flex items-center gap-2 shadow-md"
                    >
                        <FaSave /> Save All Items
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddBOQItem;
