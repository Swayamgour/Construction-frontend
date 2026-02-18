import React, { useState } from "react";

const OrderSummary = () => {
    const [additionalDiscount, setAdditionalDiscount] = useState(0);
    const [charges, setCharges] = useState([]);
    const [deductions, setDeductions] = useState([]);

    // Example values (these can be props or computed dynamically)
    const subtotal = 185000;
    const totalDiscount = 0;
    const totalGST = 33300;

    const totalCharges = charges.reduce((acc, c) => acc + Number(c.amount || 0), 0);
    const totalDeductions = deductions.reduce((acc, d) => acc + Number(d.amount || 0), 0);

    const totalAfterDiscount = subtotal - totalDiscount;
    const totalNetAmount =
        totalAfterDiscount + totalGST + totalCharges - totalDeductions - additionalDiscount;

    const handleAddCharge = () => {
        setCharges([...charges, { id: Date.now(), title: "", amount: 0 }]);
    };

    const handleAddDeduction = () => {
        setDeductions([...deductions, { id: Date.now(), title: "", amount: 0 }]);
    };

    const handleChargeChange = (id, field, value) => {
        setCharges((prev) =>
            prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
        );
    };

    const handleDeductionChange = (id, field, value) => {
        setDeductions((prev) =>
            prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
        );
    };

    return (
        <div className="max-w-6xl mx-auto bg-white p-6 shadow-md rounded-xl mt-6 flex">
            <h3 className="text-lg font-semibold mb-4 flex-1">Order Summary</h3>

            <div className="space-y-3 text-sm flex-1">
                {/* Subtotal */}
                <div className="flex justify-between">
                    <span>Subtotal (₹)</span>
                    <span className="font-medium">₹{subtotal.toLocaleString()}</span>
                </div>

                {/* Total Discount */}
                <div className="flex justify-between">
                    <span>Total Discount (₹)</span>
                    <span className="font-medium">₹{totalDiscount.toLocaleString()}</span>
                </div>

                {/* Total after discount */}
                <div className="flex justify-between">
                    <span className="font-semibold">Total Amount (after discount) (₹)</span>
                    <span className="font-semibold">
                        ₹{totalAfterDiscount.toLocaleString()}
                    </span>
                </div>

                {/* GST */}
                <div className="flex justify-between">
                    <span>Total GST (₹)</span>
                    <span className="font-medium">₹{totalGST.toLocaleString()}</span>
                </div>

                {/* Total Net Amount */}
                <div className="flex justify-between">
                    <span className="font-semibold">Total Net Amount (incl. taxes) (₹)</span>
                    <span className="font-semibold text-green-600">
                        ₹{totalNetAmount.toLocaleString()}
                    </span>
                </div>

                {/* Additional Discount */}
                <div className="flex justify-between items-center">
                    <label className="font-medium">Additional Discount (₹)</label>
                    <input
                        type="number"
                        className="border border-gray-300 rounded-lg w-32 text-right px-2 py-1"
                        value={additionalDiscount}
                        onChange={(e) => setAdditionalDiscount(Number(e.target.value))}
                    />
                </div>

                {/* Total Charges */}
                <div className="border-t border-gray-200 pt-3 mt-3">
                    <div className="flex justify-between items-center">
                        <h4 className="font-semibold">
                            Total Charges ({charges.length})
                        </h4>
                        <span className="font-semibold">
                            ₹{totalCharges.toLocaleString()}
                        </span>
                    </div>

                    {/* Charge inputs */}
                    {charges.map((charge) => (
                        <div
                            key={charge.id}
                            className="flex gap-3 items-center mt-2 pl-2 border-l-4 border-blue-500"
                        >
                            <input
                                type="text"
                                placeholder="What's this charge for?"
                                className="border border-gray-300 rounded-lg px-2 py-1 flex-1"
                                value={charge.title}
                                onChange={(e) =>
                                    handleChargeChange(charge.id, "title", e.target.value)
                                }
                            />
                            <input
                                type="number"
                                className="border border-gray-300 rounded-lg px-2 py-1 w-28 text-right"
                                value={charge.amount}
                                onChange={(e) =>
                                    handleChargeChange(charge.id, "amount", e.target.value)
                                }
                            />
                            <button
                                onClick={() =>
                                    setCharges(charges.filter((c) => c.id !== charge.id))
                                }
                                className="text-red-500 hover:text-red-700 font-bold"
                            >
                                ✕
                            </button>
                        </div>
                    ))}

                    {/* Add Charge / Deduction */}
                    <div className="flex gap-4 mt-3">
                        <button
                            onClick={handleAddCharge}
                            className="text-blue-600 hover:underline flex items-center gap-1"
                        >
                            + Add charge
                        </button>
                        <button
                            onClick={handleAddDeduction}
                            className="text-blue-600 hover:underline flex items-center gap-1"
                        >
                            + Add deduction
                        </button>
                    </div>

                    {/* Deductions */}
                    {deductions.length > 0 && (
                        <div className="mt-3">
                            <h4 className="font-semibold">Deductions ({deductions.length})</h4>
                            {deductions.map((deduction) => (
                                <div
                                    key={deduction.id}
                                    className="flex gap-3 items-center mt-2 pl-2 border-l-4 border-yellow-500"
                                >
                                    <input
                                        type="text"
                                        placeholder="What's this deduction for?"
                                        className="border border-gray-300 rounded-lg px-2 py-1 flex-1"
                                        value={deduction.title}
                                        onChange={(e) =>
                                            handleDeductionChange(deduction.id, "title", e.target.value)
                                        }
                                    />
                                    <input
                                        type="number"
                                        className="border border-gray-300 rounded-lg px-2 py-1 w-28 text-right"
                                        value={deduction.amount}
                                        onChange={(e) =>
                                            handleDeductionChange(deduction.id, "amount", e.target.value)
                                        }
                                    />
                                    <button
                                        onClick={() =>
                                            setDeductions(deductions.filter((d) => d.id !== deduction.id))
                                        }
                                        className="text-red-500 hover:text-red-700 font-bold"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom Buttons */}

        </div>
    );
};

export default OrderSummary;
