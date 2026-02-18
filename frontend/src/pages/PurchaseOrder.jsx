import React, { useState } from "react";
import OrderSummary from "../components/OrderSummary";

const PurchaseOrder = () => {
    const [materials, setMaterials] = useState([
        {
            id: 1,
            name: "Bricks",
            details:
                "Red Bricks\nBrand: SHIVSHAKTI\nWeight: 400 Grams, Color: Brown, Length: 20cm, Breadth: 9cm, Height: 8cm",
            quantity: 500,
            unit: "nos",
            price: 14,
            gst: 0,
        },
        {
            id: 2,
            name: "Cement",
            details: "Brand: Dalmia\nCode: 10116b",
            quantity: 500,
            unit: "bags",
            price: 550,
            gst: 3,
        },
    ]);

    const handleChange = (id, field, value) => {
        setMaterials((prev) =>
            prev.map((item) =>
                item.id === id ? { ...item, [field]: value } : item
            )
        );
    };

    const calculateTaxableValue = (item) => item.quantity * item.price;
    const calculateItemAmount = (item) =>
        calculateTaxableValue(item) * (1 + item.gst / 100);

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            {/* Header */}
            <div className="max-w-6xl mx-auto bg-white p-6 shadow-md rounded-xl">
                <h2 className="text-2xl font-semibold mb-4">New Purchase Order</h2>
                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Purchase Order ID
                        </label>
                        <input
                            type="text"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring focus:ring-blue-200"
                            placeholder="UEPL_P0001506"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Vendor Bank Details
                        </label>
                        <button className="border border-blue-500 text-blue-600 rounded-lg px-3 py-2 hover:bg-blue-50 w-full">
                            + Add Bank Details
                        </button>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Material Vendor
                        </label>
                        <input
                            type="text"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2"
                            placeholder="Type 3 or more letters to search vendor"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Payment Schedule
                        </label>
                        <select className="w-full border border-gray-300 rounded-lg px-3 py-2">
                            <option>Select Payment Term</option>
                            <option>Immediate</option>
                            <option>30 Days</option>
                            <option>60 Days</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto bg-white p-6 shadow-md rounded-xl mt-6">
                <h2 className="text-2xl font-semibold mb-4">Delivery and Billing Address</h2>
                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Expected Delivery By
                        </label>
                        <input
                            type="date"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring focus:ring-blue-200"
                            placeholder="UEPL_P0001506"
                        />
                    </div>
                    {/* <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Vendor Bank Details
                        </label>
                        <button className="border border-blue-500 text-blue-600 rounded-lg px-3 py-2 hover:bg-blue-50 w-full">
                            + Add Bank Details
                        </button>
                    </div> */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Delivery Address
                        </label>
                        <button className="border border-blue-500 text-blue-600 rounded-lg px-3 py-2 hover:bg-blue-50 w-full">
                            + Add Delivery Address
                        </button>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Billing Details
                        </label>
                        <button className="border border-blue-500 text-blue-600 rounded-lg px-3 py-2 hover:bg-blue-50 w-full">
                            + Add Billing Details
                        </button>
                    </div>
                </div>
            </div>

            {/* Material Details */}
            <div className="max-w-6xl mx-auto bg-white p-6 shadow-md rounded-xl mt-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Material Details</h3>
                    <button className="text-blue-600 hover:underline">
                        + Add Delivery Address
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full border border-gray-200 rounded-lg text-sm">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="border p-2">S.No</th>
                                <th className="border p-2">Materials</th>
                                <th className="border p-2">Order Quantity</th>
                                <th className="border p-2">Unit Price (₹)</th>
                                <th className="border p-2">Taxable Value</th>
                                <th className="border p-2">IGST (%)</th>
                                <th className="border p-2">Item Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {materials.map((item, index) => (
                                <tr key={item.id} className="text-center">
                                    <td className="border p-2">{index + 1}</td>
                                    <td className="border p-2 text-left">
                                        <p className="text-blue-600 font-semibold">{item.name}</p>
                                        <p className="text-gray-500 whitespace-pre-line text-xs mt-1">
                                            {item.details}
                                        </p>
                                    </td>
                                    <td className="border p-2">
                                        <input
                                            type="number"
                                            value={item.quantity}
                                            onChange={(e) =>
                                                handleChange(item.id, "quantity", e.target.value)
                                            }
                                            className="border rounded-lg w-20 text-center"
                                        />
                                        <p className="text-xs text-gray-500">Unit: {item.unit}</p>
                                    </td>
                                    <td className="border p-2">
                                        <input
                                            type="number"
                                            value={item.price}
                                            onChange={(e) =>
                                                handleChange(item.id, "price", e.target.value)
                                            }
                                            className="border rounded-lg w-24 text-center"
                                        />
                                    </td>
                                    <td className="border p-2">
                                        ₹{calculateTaxableValue(item).toLocaleString()}
                                    </td>
                                    <td className="border p-2">
                                        <input
                                            type="number"
                                            value={item.gst}
                                            onChange={(e) =>
                                                handleChange(item.id, "gst", e.target.value)
                                            }
                                            className="border rounded-lg w-16 text-center"
                                        />
                                    </td>
                                    <td className="border p-2 font-semibold">
                                        ₹{calculateItemAmount(item).toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>



                {/* Buttons */}
            </div>
            <OrderSummary />

            <div className="flex justify-end gap-3 mt-6">
                {/* <button className="border border-gray-400 rounded-lg px-4 py-2 hover:bg-gray-100">
                    Cancel
                    </button> */}
                <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                    Create PO
                </button>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                    Save Draft
                </button>
            </div>
        </div>
    );
};

export default PurchaseOrder;
