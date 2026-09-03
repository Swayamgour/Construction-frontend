import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
    useGetProjectsQuery,
    useGetVendorsQuery,
    useGetAllItemsQuery,
    useCreatePurchaseOrderMutation,
} from "../Reduxe/Api";

// One blank material row for the PO items table.
const emptyRow = () => ({
    rowId: Date.now() + Math.random(),
    itemId: "",
    qty: "",
    unit: "",
    rate: "",
    tax: 0,
    discount: 0,
});

const PurchaseOrder = () => {
    const navigate = useNavigate();

    const { data: projectsData, isLoading: projectsLoading } = useGetProjectsQuery();
    const { data: vendorsData, isLoading: vendorsLoading } = useGetVendorsQuery();
    const { data: itemsData, isLoading: itemsLoading } = useGetAllItemsQuery();
    const [createPurchaseOrder, { isLoading: saving }] = useCreatePurchaseOrderMutation();

    const projects = projectsData?.data || projectsData || [];
    const vendors = vendorsData?.data || vendorsData || [];
    const items = itemsData?.data || itemsData || [];

    const [projectId, setProjectId] = useState("");
    const [vendorId, setVendorId] = useState("");
    const [expectedDeliveryDate, setExpectedDeliveryDate] = useState("");
    const [materials, setMaterials] = useState([emptyRow()]);

    const itemById = useMemo(
        () => Object.fromEntries(items.map((it) => [it._id, it])),
        [items]
    );

    const handleRowChange = (rowId, field, value) => {
        setMaterials((prev) =>
            prev.map((row) => {
                if (row.rowId !== rowId) return row;
                const next = { ...row, [field]: value };
                if (field === "itemId") {
                    const picked = itemById[value];
                    next.unit = picked?.unit || "";
                    if (!next.rate && picked?.price) next.rate = picked.price;
                }
                return next;
            })
        );
    };

    const addRow = () => setMaterials((prev) => [...prev, emptyRow()]);

    const removeRow = (rowId) =>
        setMaterials((prev) => (prev.length > 1 ? prev.filter((r) => r.rowId !== rowId) : prev));

    // Mirrors calc()/totals() in backend/controllers/purchaseOrderController.js
    // so the numbers shown here match exactly what gets saved.
    const computed = useMemo(() => {
        const rows = materials.map((row) => {
            const qty = Number(row.qty || 0);
            const rate = Number(row.rate || 0);
            const discount = Number(row.discount || 0);
            const tax = Number(row.tax || 0);
            const amount = qty * rate;
            const discountAmount = discount > 0 && discount <= 100 ? (amount * discount) / 100 : discount;
            const taxable = Math.max(0, amount - discountAmount);
            const taxAmount = tax > 0 && tax <= 100 ? (taxable * tax) / 100 : tax;
            return { ...row, amount, discountAmount, taxAmount, total: taxable + taxAmount };
        });
        const subtotal = rows.reduce((s, r) => s + r.amount, 0);
        const discountTotal = rows.reduce((s, r) => s + r.discountAmount, 0);
        const taxTotal = rows.reduce((s, r) => s + r.taxAmount, 0);
        return { rows, subtotal, discountTotal, taxTotal, grandTotal: subtotal - discountTotal + taxTotal };
    }, [materials]);

    const validate = () => {
        if (!projectId) return "Project select karein";
        if (!vendorId) return "Vendor select karein";
        const validRows = materials.filter((r) => r.itemId);
        if (!validRows.length) return "Kam se kam ek material item add karein";
        for (const r of validRows) {
            if (!(Number(r.qty) > 0)) return "Har item ki quantity 0 se zyada honi chahiye";
            if (Number(r.rate) < 0) return "Rate negative nahi ho sakta";
        }
        return null;
    };

    const handleSubmit = async () => {
        const error = validate();
        if (error) {
            toast.error(error);
            return;
        }
        const payload = {
            projectId,
            vendorId,
            expectedDeliveryDate: expectedDeliveryDate || undefined,
            items: materials
                .filter((r) => r.itemId)
                .map((r) => ({
                    itemId: r.itemId,
                    qty: Number(r.qty),
                    unit: r.unit,
                    rate: Number(r.rate || 0),
                    tax: Number(r.tax || 0),
                    discount: Number(r.discount || 0),
                })),
        };
        try {
            await createPurchaseOrder(payload).unwrap();
            toast.success("Purchase Order (DRAFT) create ho gaya");
            navigate("/purchase-orders");
        } catch (err) {
            toast.error(err?.data?.message || "Purchase Order create nahi ho paaya");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-6xl mx-auto bg-white p-6 shadow-md rounded-xl">
                <h2 className="text-2xl font-semibold mb-4">New Purchase Order</h2>
                <p className="text-sm text-gray-500 mb-4">
                    PO <span className="font-medium">DRAFT</span> status me create hota hai — baad me
                    Purchase Orders list se Submit / Approve / Order kar sakte hain.
                </p>
                <div className="grid md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
                        <select
                            className="w-full border border-gray-300 rounded-lg px-3 py-2"
                            value={projectId}
                            onChange={(e) => setProjectId(e.target.value)}
                            disabled={projectsLoading}
                        >
                            <option value="">Select Project</option>
                            {projects?.data?.map((p) => (
                                <option key={p._id} value={p._id}>
                                    {p.projectName || p.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Vendor</label>
                        <select
                            className="w-full border border-gray-300 rounded-lg px-3 py-2"
                            value={vendorId}
                            onChange={(e) => setVendorId(e.target.value)}
                            disabled={vendorsLoading}
                        >
                            <option value="">Select Vendor</option>
                            {vendors.map((v) => (
                                <option key={v._id} value={v._id}>
                                    {v.companyName || v.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Expected Delivery By
                        </label>
                        <input
                            type="date"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring focus:ring-blue-200"
                            value={expectedDeliveryDate}
                            onChange={(e) => setExpectedDeliveryDate(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto bg-white p-6 shadow-md rounded-xl mt-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Material Details</h3>
                    <button onClick={addRow} className="text-blue-600 hover:underline text-sm font-medium">
                        + Add Item
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full border border-gray-200 rounded-lg text-sm">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="border p-2">S.No</th>
                                <th className="border p-2">Material</th>
                                <th className="border p-2">Qty</th>
                                <th className="border p-2">Rate (₹)</th>
                                <th className="border p-2">Discount</th>
                                <th className="border p-2">Tax (%)</th>
                                <th className="border p-2">Item Total</th>
                                <th className="border p-2"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {computed.rows.map((row, index) => (
                                <tr key={row.rowId} className="text-center">
                                    <td className="border p-2">{index + 1}</td>
                                    <td className="border p-2 text-left">
                                        <select
                                            className="border rounded-lg px-2 py-1 w-full"
                                            value={row.itemId}
                                            onChange={(e) => handleRowChange(row.rowId, "itemId", e.target.value)}
                                            disabled={itemsLoading}
                                        >
                                            <option value="">Select item</option>
                                            {items.map((it) => (
                                                <option key={it._id} value={it._id}>
                                                    {it.name}
                                                </option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="border p-2">
                                        <input
                                            type="number"
                                            min="0"
                                            value={row.qty}
                                            onChange={(e) => handleRowChange(row.rowId, "qty", e.target.value)}
                                            className="border rounded-lg w-20 text-center"
                                        />
                                        <p className="text-xs text-gray-500">{row.unit}</p>
                                    </td>
                                    <td className="border p-2">
                                        <input
                                            type="number"
                                            min="0"
                                            value={row.rate}
                                            onChange={(e) => handleRowChange(row.rowId, "rate", e.target.value)}
                                            className="border rounded-lg w-24 text-center"
                                        />
                                    </td>
                                    <td className="border p-2">
                                        <input
                                            type="number"
                                            min="0"
                                            value={row.discount}
                                            onChange={(e) => handleRowChange(row.rowId, "discount", e.target.value)}
                                            className="border rounded-lg w-20 text-center"
                                        />
                                    </td>
                                    <td className="border p-2">
                                        <input
                                            type="number"
                                            min="0"
                                            value={row.tax}
                                            onChange={(e) => handleRowChange(row.rowId, "tax", e.target.value)}
                                            className="border rounded-lg w-16 text-center"
                                        />
                                    </td>
                                    <td className="border p-2 font-semibold">
                                        ₹{row.total.toLocaleString()}
                                    </td>
                                    <td className="border p-2">
                                        <button
                                            onClick={() => removeRow(row.rowId)}
                                            className="text-red-500 hover:underline text-xs"
                                        >
                                            Remove
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="max-w-6xl mx-auto bg-white p-6 shadow-md rounded-xl mt-6">
                <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
                <div className="max-w-sm ml-auto space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-gray-500">Subtotal</span>
                        <span>₹{computed.subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Total Discount</span>
                        <span>₹{computed.discountTotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Total Tax</span>
                        <span>₹{computed.taxTotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-base border-t pt-2">
                        <span>Grand Total</span>
                        <span>₹{computed.grandTotal.toLocaleString()}</span>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto flex justify-end gap-3 mt-6">
                <button
                    onClick={() => navigate("/purchase-orders")}
                    className="border border-gray-400 rounded-lg px-4 py-2 hover:bg-gray-100"
                >
                    Cancel
                </button>
                <button
                    onClick={handleSubmit}
                    disabled={saving}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-60"
                >
                    {saving ? "Creating..." : "Create PO (Draft)"}
                </button>
            </div>
        </div>
    );
};

export default PurchaseOrder;
