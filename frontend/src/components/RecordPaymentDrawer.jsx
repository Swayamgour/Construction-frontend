import React, { useState } from "react";
import Drawer from "../helper/Drawer";

const RecordPaymentDrawer = ({ isOpen, onClose }) => {
    const [date, setDate] = useState("");
    const [amount, setAmount] = useState("");
    const [remark, setRemark] = useState("");

    const handleSubmit = () => {
        const data = { date, amount, remark };
        console.log("Payment Data:", data);
        // You can send this data to API or parent component here
        onClose();
    };

    return (
        <Drawer isOpen={isOpen} onClose={onClose} title="Record Payment Received"
            // widthClass="w-2/5"
            widthClass="w-full md:w-2/5 lg:w-1/3"
        >
            <div className="p-6 space-y-6  min-h-screen">
                {/* Date of Entry */}
                <div className="flex flex-col">
                    <label className="text-gray-700 font-medium mb-2">Date of entry <span className="text-red-500">*</span></label>
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Total Amount */}
                <div className="flex flex-col">
                    <label className="text-gray-700 font-medium mb-2">Total Amount <span className="text-red-500">*</span></label>
                    <div className="flex items-center">
                        <span className="px-3 py-2 bg-gray-200 rounded-l-md border border-r-0 border-gray-300">₹</span>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="Enter Amount"
                            className="border border-gray-300 rounded-r-md px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                {/* Remark */}
                <div className="flex flex-col">
                    <label className="text-gray-700 font-medium mb-2">Remark</label>
                    <textarea
                        value={remark}
                        onChange={(e) => setRemark(e.target.value)}
                        placeholder="Enter Remark"
                        rows={4}
                        maxLength={999}
                        className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                    <div className="text-right text-xs text-gray-500">{remark.length}/999</div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-4 mt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2 bg-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-400 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
                    >
                        Record Payment
                    </button>
                </div>
            </div>
        </Drawer>
    );
};

export default RecordPaymentDrawer;
