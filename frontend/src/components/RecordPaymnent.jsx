import React, { useState } from "react";
import { FiCalendar } from "react-icons/fi";
import { HiOutlineCurrencyRupee } from "react-icons/hi";
import Drawer from "../helper/Drawer"; // Your custom reusable Drawer component

const RecordPaymentDrawer = ({
    isOpen,
    onClose,
    dueAmount = "475.00",
    payableId = "5435535435534",
}) => {
    const [paidAmount, setPaidAmount] = useState("");
    const [paidByOption, setPaidByOption] = useState("company");
    const [modeOfPayment, setModeOfPayment] = useState("Cash");
    const [paidDate, setPaidDate] = useState("30 Sep, 2025");
    const [transactionId, setTransactionId] = useState("");

    const handleRecordPayment = () => {
        console.log({
            payableId,
            paidAmount,
            paidByOption,
            modeOfPayment,
            paidDate,
            transactionId,
        });
        alert("✅ Payment Recorded Successfully (Simulated)");
        onClose();
    };

    return (
        <Drawer
            isOpen={isOpen}
            onClose={onClose}
            title="Record Payment"
            // widthClass="w-2/5"
            widthClass="w-full md:w-2/5 lg:w-1/3"
        >
            <div className=" min-h-screen font-sans flex flex-col">
                {/* Header Subtitle */}
                <div className="px-6 pt-4 text-sm text-gray-600">
                    Work order Payable to{" "}
                    <span className="font-medium text-gray-900">hjsakldjaslkdjsa</span>
                </div>

                {/* Drawer Body */}
                <div className="flex-grow p-6 space-y-6 overflow-y-auto">
                    {/* Due Amount & Payable ID */}
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <p className="text-sm text-gray-500">Due Amount</p>
                            <div className="text-2xl font-bold text-gray-900 flex items-center mt-1">
                                <HiOutlineCurrencyRupee className="h-5 w-5 mr-1" />
                                {dueAmount}
                            </div>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Payable ID</p>
                            <p className="text-lg font-semibold text-gray-800 mt-1">
                                {payableId}
                            </p>
                        </div>
                    </div>

                    {/* Paid Amount */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Paid Amount <span className="text-red-500">*</span>
                        </label>
                        <div className="flex rounded-lg shadow-sm">
                            <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300  text-gray-500 text-sm">
                                ₹
                            </span>
                            <input
                                type="number"
                                placeholder="Enter Amount"
                                value={paidAmount}
                                onChange={(e) => setPaidAmount(e.target.value)}
                                className="flex-1 block w-full rounded-none rounded-r-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2.5"
                            />
                        </div>
                    </div>

                    {/* Paid By */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Paid by <span className="text-red-500">*</span>
                        </label>
                        <div className="space-y-3">
                            {/* Company Option */}
                            <label className="flex items-start p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-blue-50 transition">
                                <input
                                    type="radio"
                                    name="paidBy"
                                    value="company"
                                    checked={paidByOption === "company"}
                                    onChange={() => setPaidByOption("company")}
                                    className="h-4 w-4 text-blue-600 border-gray-300 mt-0.5 focus:ring-blue-500"
                                />
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-gray-900">
                                        Paid by the company
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        This will be deducted from the company's account
                                    </p>
                                </div>
                            </label>

                            {/* Team Option */}
                            <label className="flex items-start p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-blue-50 transition">
                                <input
                                    type="radio"
                                    name="paidBy"
                                    value="team"
                                    checked={paidByOption === "team"}
                                    onChange={() => setPaidByOption("team")}
                                    className="h-4 w-4 text-blue-600 border-gray-300 mt-0.5 focus:ring-blue-500"
                                />
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-gray-900">
                                        Paid by me or someone from my team
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        This will be deducted from the member’s balance
                                    </p>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Mode of Payment & Paid On */}
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Mode of Payment <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={modeOfPayment}
                                onChange={(e) => setModeOfPayment(e.target.value)}
                                className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2.5"
                            >
                                <option>Cash</option>
                                <option>Bank Transfer</option>
                                <option>Cheque</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Paid on <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={paidDate}
                                    readOnly
                                    className="block w-full rounded-lg border-gray-300 pr-10 focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2.5"
                                />
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                    <FiCalendar className="h-5 w-5 text-gray-400" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Transaction ID */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Transaction Id
                        </label>
                        <input
                            type="text"
                            placeholder="Enter ID (Optional)"
                            value={transactionId}
                            onChange={(e) => setTransactionId(e.target.value)}
                            className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2.5"
                        />
                    </div>
                </div>

                {/* Drawer Footer */}
                <div className="p-6 border-t border-gray-200 flex justify-end gap-3 bg-white">
                    <button
                        onClick={onClose}
                        className="px-5 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleRecordPayment}
                        disabled={!paidAmount}
                        className="px-5 py-2 rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                    >
                        Record Payment
                    </button>
                </div>
            </div>
        </Drawer>
    );
};

export default RecordPaymentDrawer;
