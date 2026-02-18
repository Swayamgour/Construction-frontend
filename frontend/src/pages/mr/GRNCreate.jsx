import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGetSingleMRQuery, useCreateGRNMutation } from "../../Reduxe/Api";
import toast from "react-hot-toast";
import { ArrowLeft, AlertCircle, CheckCircle, Package } from "lucide-react";

export default function GRNCreate() {
    const { id } = useParams();
    const navigate = useNavigate();

    const { data, isLoading, error } = useGetSingleMRQuery(id);
    const [createGRN, { isLoading: saving }] = useCreateGRNMutation();

    // Track which inputs have been focused
    const [focusedInputs, setFocusedInputs] = useState({});

    // HEADER DETAILS
    const [header, setHeader] = useState({
        deliveryChallan: "",
        transporter: "",
        vehicleNumber: "",
        driverName: "",
        dispatchDate: "",
    });

    // ITEMS
    const [items, setItems] = useState([]);

    useEffect(() => {
        if (!data) return;

        setItems(
            data.items.map((it, index) => ({
                itemId: it.itemId._id,
                name: it.itemId.name,
                orderedQty: Number(it.requestedQty),
                receivedQty: 0,
                damagedQty: 0,
                shortQty: 0,
                excessQty: 0,
                acceptedQty: 0,
                returnQty: 0,
                remarks: "",
                unit: it.itemId.unit,
            }))
        );
    }, [data]);

    // Handle input focus - clears the 0 value when first clicked
    const handleInputFocus = (itemIndex, fieldName) => {
        const key = `${itemIndex}-${fieldName}`;
        if (!focusedInputs[key]) {
            setFocusedInputs(prev => ({ ...prev, [key]: true }));

            // Clear the value if it's 0
            if (items[itemIndex][fieldName] === 0) {
                updateItem(itemIndex, fieldName, "");
            }
        }
    };

    // Handle input blur - ensures empty values become 0
    const handleInputBlur = (itemIndex, fieldName) => {
        if (items[itemIndex][fieldName] === "") {
            updateItem(itemIndex, fieldName, 0);
        }
    };

    // UPDATE ITEM
    const updateItem = (index, field, value) => {
        let updated = [...items];

        // Convert empty string to 0 for numeric fields
        if (value === "" && ["receivedQty", "damagedQty", "returnQty"].includes(field)) {
            updated[index][field] = "";
        } else {
            updated[index][field] = Number(value || 0);
        }

        const rec = Number(updated[index].receivedQty || 0);
        const dmg = Number(updated[index].damagedQty || 0);
        const ordered = updated[index].orderedQty;

        updated[index].acceptedQty = Math.max(rec - dmg, 0);
        updated[index].shortQty = rec < ordered ? ordered - rec : 0;
        updated[index].excessQty = rec > ordered ? rec - ordered : 0;

        setItems(updated);
    };

    // Helper function to get item status
    const getItemStatus = (item) => {
        if (item.receivedQty === 0) return "not-received";
        if (item.receivedQty === item.orderedQty && item.damagedQty === 0) return "perfect";
        if (item.damagedQty > 0) return "damaged";
        if (item.shortQty > 0) return "short";
        if (item.excessQty > 0) return "excess";
        return "partial";
    };

    // Check if damage input should be disabled
    const isDamageDisabled = (item) => {
        // Rule 2: Disable damage when receivedQty === 0
        return item.receivedQty === 0;
    };

    // Check if return input should be disabled
    const isReturnDisabled = (item) => {
        // Rule 5: Disable return when:
        // 1. receivedQty === 0 (nothing to return)
        // OR
        // 2. receivedQty === orderedQty AND damagedQty === 0 (perfect receipt)
        return (
            item.receivedQty === 0 ||
            (item.receivedQty === item.orderedQty && item.damagedQty === 0)
        );
    };

    // Calculate total summary
    const calculateSummary = () => {
        const totalOrdered = items.reduce((sum, item) => sum + item.orderedQty, 0);
        const totalReceived = items.reduce((sum, item) => sum + (item.receivedQty || 0), 0);
        const totalAccepted = items.reduce((sum, item) => sum + item.acceptedQty, 0);
        const totalDamaged = items.reduce((sum, item) => sum + (item.damagedQty || 0), 0);

        return {
            totalOrdered,
            totalReceived,
            totalAccepted,
            totalDamaged,
            completionPercentage: totalOrdered > 0 ? Math.round((totalReceived / totalOrdered) * 100) : 0
        };
    };

    const summary = calculateSummary();

    // SUBMIT
    const handleSubmit = async () => {
        // Validate all required fields
        if (!header.deliveryChallan.trim()) {
            toast.error("Please enter Delivery Challan Number");
            return;
        }

        // Check if at least some quantity is received
        if (summary.totalReceived === 0) {
            toast.error("Please enter received quantities for at least one item");
            return;
        }

        // Validate items - ensure all quantities are numbers
        const validatedItems = items.map(item => ({
            ...item,
            receivedQty: Number(item.receivedQty || 0),
            damagedQty: Number(item.damagedQty || 0),
            returnQty: Number(item.returnQty || 0),
        }));

        const payload = {
            materialRequestId: id,
            ...header,
            items: validatedItems
        };

        try {
            const res = await createGRN(payload).unwrap();
            toast.success("GRN Created Successfully!");
            navigate(-1);
        } catch (err) {
            toast.error(err?.data?.message || "Failed to create GRN");
        }
    };

    if (isLoading) return (
        <div className="flex justify-center items-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );

    if (error) return (
        <div className="flex justify-center items-center min-h-screen">
            <div className="text-center">
                <h2 className="text-xl font-semibold text-red-600 mb-2">Failed to load Material Request</h2>
                <button
                    onClick={() => navigate(-1)}
                    className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                    Go Back
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header with Back Button */}
                <div className="mb-6">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
                    >
                        <ArrowLeft size={20} />
                        <span>Back</span>
                    </button>
                    <h1 className="text-3xl font-bold text-gray-800">Goods Receive Note (GRN)</h1>
                    <p className="text-gray-600 mt-1">Create GRN for Material Request #{id?.slice(-6)}</p>
                </div>

                {/* Summary Card */}
                <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                            <Package size={24} />
                            Order Summary
                        </h2>
                        <div className="text-sm text-gray-600">
                            {items.length} items total
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                            <div className="text-sm text-blue-700 font-medium">Ordered Qty</div>
                            <div className="text-2xl font-bold text-blue-800">{summary.totalOrdered}</div>
                            <div className="text-xs text-blue-600 mt-1">Total ordered quantity</div>
                        </div>

                        <div className="bg-green-50 border border-green-100 rounded-lg p-4">
                            <div className="text-sm text-green-700 font-medium">Received Qty</div>
                            <div className="text-2xl font-bold text-green-800">{summary.totalReceived}</div>
                            <div className="text-xs text-green-600 mt-1">
                                {summary.completionPercentage}% of order
                            </div>
                        </div>

                        <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-4">
                            <div className="text-sm text-emerald-700 font-medium">Accepted Qty</div>
                            <div className="text-2xl font-bold text-emerald-800">{summary.totalAccepted}</div>
                            <div className="text-xs text-emerald-600 mt-1">Ready for use</div>
                        </div>

                        <div className="bg-amber-50 border border-amber-100 rounded-lg p-4">
                            <div className="text-sm text-amber-700 font-medium">Damaged Qty</div>
                            <div className="text-2xl font-bold text-amber-800">{summary.totalDamaged}</div>
                            <div className="text-xs text-amber-600 mt-1">Requires attention</div>
                        </div>
                    </div>
                </div>

                {/* HEADER FORM */}
                <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
                        <h2 className="text-xl font-semibold text-gray-800">Delivery Information</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Delivery Challan No. *
                            </label>
                            <input
                                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                placeholder="Enter delivery challan number"
                                value={header.deliveryChallan}
                                onChange={(e) => setHeader({ ...header, deliveryChallan: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Transporter Name
                            </label>
                            <input
                                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                placeholder="Enter transporter name"
                                value={header.transporter}
                                onChange={(e) => setHeader({ ...header, transporter: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Vehicle Number
                            </label>
                            <input
                                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                placeholder="Enter vehicle number"
                                value={header.vehicleNumber}
                                onChange={(e) => setHeader({ ...header, vehicleNumber: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Driver Name
                            </label>
                            <input
                                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                placeholder="Enter driver name"
                                value={header.driverName}
                                onChange={(e) => setHeader({ ...header, driverName: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Dispatch Date
                            </label>
                            <input
                                type="date"
                                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                value={header.dispatchDate}
                                onChange={(e) => setHeader({ ...header, dispatchDate: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                {/* ITEMS INPUT */}
                <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-1 h-6 bg-green-600 rounded-full"></div>
                        <h2 className="text-xl font-semibold text-gray-800">Items Received</h2>
                        <span className="ml-auto bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                            {items?.length || 0} Items
                        </span>
                    </div>

                    {items?.map((it, i) => {
                        const status = getItemStatus(it);
                        const damageDisabled = isDamageDisabled(it);
                        const returnDisabled = isReturnDisabled(it);

                        return (
                            <div key={i} className="border border-gray-200 rounded-xl p-5 mb-4 hover:border-blue-300 transition">
                                {/* Item Header with Status */}
                                <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-3">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-lg text-gray-800">{it?.name}</span>
                                            {status === "perfect" && (
                                                <span className="flex items-center gap-1 bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                                                    <CheckCircle size={12} />
                                                    Perfect
                                                </span>
                                            )}
                                            {status === "damaged" && (
                                                <span className="flex items-center gap-1 bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
                                                    <AlertCircle size={12} />
                                                    Damaged
                                                </span>
                                            )}
                                            {status === "short" && (
                                                <span className="flex items-center gap-1 bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded-full">
                                                    <AlertCircle size={12} />
                                                    Short
                                                </span>
                                            )}
                                            {status === "excess" && (
                                                <span className="flex items-center gap-1 bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded-full">
                                                    <AlertCircle size={12} />
                                                    Excess
                                                </span>
                                            )}
                                            {status === "not-received" && (
                                                <span className="flex items-center gap-1 bg-gray-100 text-gray-800 text-xs font-medium px-2 py-1 rounded-full">
                                                    Not Received
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-sm text-gray-600">Unit: {it?.unit}</span>
                                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                                            <span className="text-sm text-gray-600">Item ID: {it?.itemId?.slice(-6)}</span>
                                        </div>
                                    </div>
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
                                        <span className="font-semibold text-blue-700">
                                            Ordered: {it?.orderedQty} {it?.unit}
                                        </span>
                                    </div>
                                </div>

                                {/* Status Messages */}
                                {damageDisabled && it.receivedQty === 0 && (
                                    <div className="mb-3 bg-gray-50 border border-gray-200 rounded-lg p-3">
                                        <p className="text-sm text-gray-600 flex items-center gap-2">
                                            <AlertCircle size={16} />
                                            <span>Enter received quantity first to enable damage and return fields</span>
                                        </p>
                                    </div>
                                )}

                                {returnDisabled && !damageDisabled && it.receivedQty === it.orderedQty && it.damagedQty === 0 && (
                                    <div className="mb-3 bg-green-50 border border-green-200 rounded-lg p-3">
                                        <p className="text-sm text-green-700 flex items-center gap-2">
                                            <CheckCircle size={16} />
                                            <span>Perfect receipt! All items received in good condition. Return not required.</span>
                                        </p>
                                    </div>
                                )}

                                {/* Quantity Input Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {/* Received Qty */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Received Qty *
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                            placeholder="Enter received quantity"
                                            value={it.receivedQty === 0 ? "" : it.receivedQty}
                                            onFocus={() => handleInputFocus(i, "receivedQty")}
                                            onBlur={() => handleInputBlur(i, "receivedQty")}
                                            onChange={(e) => updateItem(i, "receivedQty", e.target.value)}
                                        />
                                    </div>

                                    {/* Damaged Qty */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Damaged Qty
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            max={it.receivedQty}
                                            disabled={damageDisabled}
                                            className={`w-full border rounded-lg p-3 transition ${damageDisabled
                                                    ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                                                    : 'border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500'
                                                }`}
                                            placeholder={damageDisabled ? "Enter received qty first" : "Enter damaged quantity"}
                                            value={it.damagedQty === 0 ? "" : it.damagedQty}
                                            onFocus={() => !damageDisabled && handleInputFocus(i, "damagedQty")}
                                            onBlur={() => !damageDisabled && handleInputBlur(i, "damagedQty")}
                                            onChange={(e) => !damageDisabled && updateItem(i, "damagedQty", e.target.value)}
                                        />
                                        {damageDisabled && (
                                            <p className="text-xs text-gray-500 mt-1">Disabled until received qty is entered</p>
                                        )}
                                    </div>

                                    {/* Short Qty (Readonly) */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Short Qty
                                        </label>
                                        <input
                                            readOnly
                                            className={`w-full border p-3 rounded-lg ${it.shortQty > 0
                                                    ? 'bg-yellow-50 border-yellow-200 text-yellow-800'
                                                    : 'bg-gray-50 border-gray-200 text-gray-700'
                                                }`}
                                            value={it.shortQty}
                                        />
                                    </div>

                                    {/* Excess Qty (Readonly) */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Excess Qty
                                        </label>
                                        <input
                                            readOnly
                                            className={`w-full border p-3 rounded-lg ${it.excessQty > 0
                                                    ? 'bg-green-50 border-green-200 text-green-800'
                                                    : 'bg-gray-50 border-gray-200 text-gray-700'
                                                }`}
                                            value={it.excessQty}
                                        />
                                    </div>

                                    {/* Accepted Qty (Readonly) */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Accepted Qty
                                        </label>
                                        <input
                                            readOnly
                                            className="w-full border bg-emerald-50 border-emerald-200 text-emerald-800 p-3 rounded-lg font-semibold"
                                            value={it.acceptedQty}
                                        />
                                    </div>

                                    {/* Return Qty */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Return Qty
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            max={it.receivedQty}
                                            disabled={returnDisabled}
                                            className={`w-full border rounded-lg p-3 transition ${returnDisabled
                                                    ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                                                    : 'border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500'
                                                }`}
                                            placeholder={returnDisabled ? "Not applicable" : "Enter return quantity"}
                                            value={it.returnQty === 0 ? "" : it.returnQty}
                                            onFocus={() => !returnDisabled && handleInputFocus(i, "returnQty")}
                                            onBlur={() => !returnDisabled && handleInputBlur(i, "returnQty")}
                                            onChange={(e) => !returnDisabled && updateItem(i, "returnQty", e.target.value)}
                                        />
                                        {returnDisabled && (
                                            <p className="text-xs text-gray-500 mt-1">
                                                {it.receivedQty === 0
                                                    ? "Disabled until received qty is entered"
                                                    : "Disabled - perfect receipt"}
                                            </p>
                                        )}
                                    </div>

                                    {/* Remarks - Full Width */}
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Remarks
                                        </label>
                                        <input
                                            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
                                            placeholder="Enter any remarks or notes about this item"
                                            value={it.remarks}
                                            onChange={(e) => updateItem(i, "remarks", e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white rounded-xl shadow-md p-6">
                    <button
                        onClick={() => navigate(-1)}
                        className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition w-full sm:w-auto"
                    >
                        Cancel
                    </button>

                    <div className="flex gap-4 w-full sm:w-auto">
                        <button
                            onClick={() => {
                                // Reset form logic here
                                setHeader({
                                    deliveryChallan: "",
                                    transporter: "",
                                    vehicleNumber: "",
                                    driverName: "",
                                    dispatchDate: "",
                                });
                                setItems(items.map(item => ({
                                    ...item,
                                    receivedQty: 0,
                                    damagedQty: 0,
                                    shortQty: 0,
                                    excessQty: 0,
                                    acceptedQty: 0,
                                    returnQty: 0,
                                    remarks: "",
                                })));
                                setFocusedInputs({});
                                toast.success("Form reset successfully");
                            }}
                            className="px-6 py-3 border border-orange-300 text-orange-700 rounded-lg hover:bg-orange-50 transition w-full sm:w-auto"
                        >
                            Reset Form
                        </button>

                        <button
                            onClick={handleSubmit}
                            disabled={saving}
                            className={`px-8 py-3 rounded-lg font-semibold transition w-full sm:w-auto ${saving
                                    ? 'bg-green-400 cursor-not-allowed'
                                    : 'bg-green-600 hover:bg-green-700'
                                } text-white`}
                        >
                            {saving ? (
                                <span className="flex items-center justify-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Creating GRN...
                                </span>
                            ) : (
                                "Submit GRN"
                            )}
                        </button>
                    </div>
                </div>

                {/* Summary Info */}
                <div className="mt-4 text-sm text-gray-500 text-center">
                    <p className="flex items-center justify-center gap-2">
                        <AlertCircle size={16} />
                        Make sure all quantities are accurately entered before submission.
                    </p>
                </div>
            </div>
        </div>
    );
}