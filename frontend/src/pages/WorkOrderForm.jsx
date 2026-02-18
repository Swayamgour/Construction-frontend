import React, { useState } from "react";
import AddBillingDetailsDrawer from "../components/AddBillingDetailsDrawer";
// import WorkOrderPage from "../components/WorkOrderPage";

export default function WorkOrderForm() {

    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const toggleDrawer = () => {
        setIsDrawerOpen(!isDrawerOpen);
    };

    const [tasks, setTasks] = useState([
        { id: 1, name: "RCC", unit: "m", rate: 20, gst: "0%", amount: 2000 },
        { id: 2, name: "PCC", unit: "sft", rate: 30, gst: "0%", amount: 30000 },
    ]);

    const handleChange = (id, field, value) => {
        setTasks((prev) =>
            prev.map((task) =>
                task.id === id
                    ? {
                        ...task,
                        [field]: value,
                        amount: field === "rate" ? value * 1000 : task.amount,
                    }
                    : task
            )
        );
    };

    const totalValue = tasks.reduce((sum, t) => sum + t.amount, 0);
    const gstValue = totalValue * 0.18; // Example 18% GST
    const totalAmount = totalValue + gstValue;

    return (
        <>
            <div className=" bg-gray-50 min-h-screen py-8 px-4 sm:px-6 lg:px-8 ">
                <div className="w-full max-w-6xl bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-lg font-semibold mb-4">Create  Work Order</h2>
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-gray-600 text-sm">30 Sep, 2025</h2>
                    </div>

                    {/* Project Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Project Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                disabled
                                value="West Delhi"
                                className="w-full border rounded-md px-3 py-2 bg-gray-100 text-gray-600"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                WO-Number <span className="text-red-500">*</span>
                            </label>
                            <div className="flex items-center space-x-2">
                                <input
                                    type="text"
                                    value="WO-2024-25-000683"
                                    className="w-full border rounded-md px-3 py-2 focus:ring-1 focus:ring-blue-500"
                                />
                                <button className="p-2 border rounded-md hover:bg-gray-100">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-5 w-5 text-gray-500"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="1.5"
                                            d="M12 4v16m8-8H4"
                                        />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Vendor / Billing Section */}
                    <div className="border-t border-gray-200 pt-6">
                        {/* <h3 className="text-gray-800 font-semibold mb-4">
                           
                        </h3> */}
                        <h2 className="text-lg font-semibold mb-4">  Vendor / Billing Details </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Vendor */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Vendor <span className="text-red-500">*</span>
                                </label>
                                <select
                                    className="w-full border rounded-md px-3 py-2 bg-gray-100 text-gray-600"
                                    defaultValue="hjsakldjaslkdjsa"
                                >
                                    <option>hjsakldjaslkdjsa</option>
                                </select>
                            </div>

                            {/* Payment Schedule */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Payment Schedule
                                </label>
                                <button className="flex items-center text-blue-600 text-sm hover:underline">
                                    + Add Payment Terms
                                </button>
                            </div>

                            {/* Billing Details */}
                            <div className="col-span-2">
                                {/* <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Billing Details <span className="text-red-500">*</span>
                                </label> */}

                                <h2 className="text-lg font-semibold mb-4">  Billing Details </h2>
                                {/* <label className="block text-sm text-gray-500 mb-2">
                                
                            </label> */}
                                <button onClick={toggleDrawer} className="flex items-center text-blue-600 text-sm hover:underline mb-2">
                                    + Add Billing Details
                                </button>
                                <textarea
                                    className="w-full border rounded-md px-3 py-2 text-gray-700 h-28"
                                    value={`SC Payables\nfew24\nAndaman & Nicobar Islands\nGSTIN: cwde24`}
                                    readOnly
                                ></textarea>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl mb-2 mt-2">
                        <h2 className="text-lg font-semibold mb-4">Tasks assigned</h2>

                        <div className="lg:col-span-3 overflow-x-auto rounded-2xl shadow-xl border border-gray-200">
                            <table className="min-w-full table-fixed">
                                {/* Table Header */}
                                <thead className="sticky top-0 z-10 bg-blue-900 text-white text-xs font-bold uppercase">
                                    <tr>
                                        <th className="px-4 py-3 text-left w-1/4  border-r border-gray-400">#</th>
                                        <th className="px-4 py-3 text-left w-1/4  border-r border-gray-400">Task Name</th>
                                        <th className="px-4 py-3 text-left w-1/4  border-r border-gray-400">Unit</th>
                                        <th className="px-4 py-3 text-left w-1/4  border-r border-gray-400">Rate *</th>
                                        <th className="px-4 py-3 text-left w-1/4  border-r border-gray-400">Total Taxable Amount</th>
                                        <th className="px-4 py-3 text-left w-1/4  border-r border-gray-400">IGST</th>
                                        <th className="px-4 py-3 text-left w-1/4  border-r border-gray-400">Claim Perc.</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tasks.map((task, index) => (
                                        <tr key={task.id} className="border-b hover:bg-gray-50">
                                            <td className="px-4 py-3 text-left w-1/4  border-r border-gray-400">{index + 1}</td>
                                            <td className="px-4 py-3 text-left w-1/4  border-r border-gray-400">
                                                <input
                                                    className="border px-2 py-1 w-full rounded"
                                                    value={task.name}
                                                    onChange={(e) => handleChange(task.id, "name", e.target.value)}
                                                />
                                            </td>
                                            <td className="px-4 py-3 text-left w-1/4  border-r border-gray-400">
                                                <select
                                                    className="border px-2 py-1 rounded"
                                                    value={task.unit}
                                                    onChange={(e) => handleChange(task.id, "unit", e.target.value)}
                                                >
                                                    <option>m</option>
                                                    <option>sft</option>
                                                    <option>kg</option>
                                                </select>
                                            </td>
                                            <td className="px-4 py-3 text-left w-1/4  border-r border-gray-400">
                                                <input
                                                    type="number"
                                                    className="border px-2 py-1 w-20 rounded"
                                                    value={task.rate}
                                                    onChange={(e) =>
                                                        handleChange(task.id, "rate", Number(e.target.value))
                                                    }
                                                />
                                            </td>
                                            <td className="px-4 py-3 text-left w-1/4  border-r border-gray-400">₹{task.amount.toLocaleString()}</td>
                                            <td className="px-4 py-3 text-left w-1/4  border-r border-gray-400">
                                                <select
                                                    className="border px-2 py-1 rounded"
                                                    value={task.gst}
                                                    onChange={(e) => handleChange(task.id, "gst", e.target.value)}
                                                >
                                                    <option>0%</option>
                                                    <option>5%</option>
                                                    <option>12%</option>
                                                    <option>18%</option>
                                                </select>
                                            </td>
                                            <td className="px-4 py-3 text-left w-1/4  border-r border-gray-400 text-gray-600">0%</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            <div className="mt-3 flex gap-6 p-3 text-blue-600 text-sm">
                                <button className="flex items-center gap-1 hover:underline">+ Add new Task</button>
                                <button className="flex items-center gap-1 hover:underline">
                                    📋 Select task from existing plan
                                </button>
                            </div>
                        </div>

                    </div>

                    {/* 💰 Order Summary */}
                    <div className=" p-5 rounded-xl mb-2">
                        <h3 className="text-lg font-semibold mb-3">Order Summary</h3>

                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span>Total Value</span>
                                <span>₹{totalValue.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Total CGST/SGST</span>
                                <span>₹{gstValue.toLocaleString()}</span>
                            </div>

                            <div className="flex flex-col gap-2 mt-3">
                                <button className="text-blue-600 flex items-center gap-1">
                                    + Add charge
                                </button>
                                <button className="text-blue-600 flex items-center gap-1">
                                    + Add deduction
                                </button>
                            </div>

                            <hr className="my-2" />
                            <div className="flex justify-between font-semibold">
                                <span>Total Contract amount</span>
                                <span>₹{totalAmount.toLocaleString()}</span>
                            </div>

                            <div className="mt-2 flex items-center gap-2">
                                <input type="checkbox" />
                                <span className="text-sm text-gray-600">Round off amount</span>
                            </div>
                        </div>
                    </div>

                    {/* 📝 Additional Details */}
                    <div className=" p-5 rounded-xl mb-2">
                        <h3 className="text-lg font-semibold mb-3">Additional Details</h3>

                        <div className="space-y-4 text-sm">
                            <div>
                                <p className="font-medium mb-1">Terms & Condition</p>
                                <button className="text-blue-600 flex items-center gap-1">
                                    + Add Terms & Condition
                                </button>
                            </div>

                            <div>
                                <p className="font-medium mb-1">Remarks</p>
                                <textarea
                                    className="w-full border rounded-md p-2 text-sm"
                                    rows="3"
                                    placeholder="Mention remarks if any"
                                ></textarea>
                            </div>

                            <div>
                                <p className="font-medium mb-1">Attachments</p>
                                <div className="border-dashed border-2 border-gray-300 rounded-lg w-24 h-24 flex items-center justify-center text-2xl text-blue-600 cursor-pointer hover:bg-blue-50">
                                    +
                                </div>
                            </div>

                            <div>
                                <p className="font-medium mb-1">Signature</p>
                                <div className="border-2 border-gray-300 h-20 rounded-lg"></div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Buttons */}
                    <div className="flex justify-end items-center mt-8 space-x-4">
                        <button className="px-4 py-2 border border-gray-300 rounded-md text-gray-600 hover:bg-gray-50">
                            Cancel
                        </button>
                        <button className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                            Create work order
                        </button>
                    </div>
                </div>

                <AddBillingDetailsDrawer isOpen={isDrawerOpen}
                    onClose={toggleDrawer} />






            </div>
            {/* <WorkOrderPage /> */}
        </>
    );
}
