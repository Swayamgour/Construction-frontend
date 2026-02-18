import React from "react";
import {  FiPlus } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

export default function VendorDetailsPage() {

    const navigate = useNavigate()

    return (
        <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
            {/* Top Bar */}


            {/* Breadcrumb */}
            <div className="text-sm text-gray-500 mb-6">
                <span className="text-gray-700 font-medium">Vendor</span> /{" "}
                <span className="text-gray-900 font-semibold">hjskaldjaslkdjsa</span>
            </div>

            {/* Vendor Header */}
            <div className="bg-white rounded-lg shadow-sm p-5 mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        {/* <h2 className="text-2xl font-semibold text-gray-800  bg-gradient-to-r from-slate-900 via-blue-800 to-purple-700">
                            hjskaldjaslkdjsa
                        </h2> */}

                        <h1 className="text-xl sm:text-2xl font-normal bg-gradient-to-r from-slate-900 via-blue-800 to-purple-700 bg-clip-text text-transparent">
                            hjskaldjaslkdjsa
                        </h1>
                        <span className="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded-md">
                            Subcontractor
                        </span>
                    </div>

                    <button className="text-blue-600 text-sm font-medium hover:underline mt-2 sm:mt-0">
                        Vendor details
                    </button>
                </div>

                {/* Info Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                    {/* Card 1 */}
                    <div className="p-4 border rounded-lg bg-white flex flex-col justify-between">
                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                            <span>Total Payable recorded</span>
                            <span className="text-blue-600 cursor-pointer hover:underline">
                                View Payables
                            </span>
                        </div>
                        <p className="text-2xl font-semibold text-gray-800">₹0.00</p>
                    </div>

                    {/* Card 2 */}
                    <div className="p-4 border rounded-lg bg-white flex flex-col justify-between">
                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                            <span>Payment due</span>
                            <span className="text-blue-600 cursor-pointer hover:underline">
                                Record Payment to clear dues
                            </span>
                        </div>
                        <p className="text-2xl font-semibold text-gray-800">₹0.00</p>
                    </div>

                    {/* Card 3 */}
                    <div className="p-4 border rounded-lg bg-white flex flex-col justify-between">
                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                            <span>Advance left (in project)</span>
                            <span className="text-blue-600 cursor-pointer hover:underline">
                                View History
                            </span>
                        </div>
                        <p className="text-2xl font-semibold text-gray-800">₹0.00</p>
                    </div>
                </div>
            </div>

            {/* Work Order Section */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-gray-800 font-medium mb-4 border-b pb-2">
                    Work Order
                </h3>

                <div className="flex flex-col items-center justify-center text-center py-12">
                    <img
                        src="https://cdn-icons-png.flaticon.com/512/2657/2657058.png"
                        alt="work-order"
                        className="w-20 h-20 mb-4 opacity-80"
                    />
                    <h4 className="text-gray-800 font-semibold text-lg mb-1">
                        Add your first work order
                    </h4>
                    <p className="text-gray-500 text-sm max-w-md mb-6">
                        Work orders streamline projects by clarifying tasks, tracking
                        progress, and ensuring budget control.
                    </p>
                    <button onClick={() => navigate('/WorkOrderForm')} className="flex items-center gap-2 px-5 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-600 hover:text-white transition-all duration-200">
                        <FiPlus className="w-4 h-4" /> Add work order
                    </button>
                </div>
            </div>
        </div>
    );
}
