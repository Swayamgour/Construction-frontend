import React, { useState } from 'react';
import Drawer from '../helper/Drawer'; // Your custom drawer component
import { FiDownload, FiMail, FiSave, FiTrash2, FiInfo, FiEdit2 } from 'react-icons/fi';
import { HiOutlineCurrencyRupee } from 'react-icons/hi';
import { IoAddCircle } from 'react-icons/io5';

const EditableWorkOrderDrawer = ({ isOpen, onClose }) => {
    // Header Fields
    const [vendorDetails, setVendorDetails] = useState({
        projectName: 'West Delhi',
        vendorName: 'hjsakldjaslkdjsa',
        createdBy: 'shubham kumar',
        createdAt: '30 Sep, 2025 13:13 PM',
        contractValue: '37760.00',
        earnedValue: '0.00',
    });

    // Tasks Array
    const [tasks, setTasks] = useState([
        { id: 1, name: 'rcc', description: '', totalQty: 100, unit: 'm', rate: 20.0, totalTaxable: 2000.0 },
        { id: 2, name: 'PCC', description: '', totalQty: 1000, unit: 'sft', rate: 30.0, totalTaxable: 30000.0 },
    ]);

    // Summary
    const [summary, setSummary] = useState({
        totalValue: 32000.0,
        totalCGST_SGST: 5760.0,
    });

    const totalContractAmount = summary.totalValue + summary.totalCGST_SGST;

    const handleTaskChange = (id, field, value) => {
        setTasks(prevTasks =>
            prevTasks.map(task => (task.id === id ? { ...task, [field]: value } : task))
        );
    };

    const handleHeaderChange = (field, value) => {
        setVendorDetails(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = () => {
        console.log('Saved Data:', { vendorDetails, tasks, summary });
        onClose();
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(value);
    };

    return (
        <Drawer
            isOpen={isOpen}
            onClose={onClose}
            title={`Editable Work Order - WO-2024-25-000683`}
           widthClass="w-full md:w-2/5 lg:w-1/3"
        >
            <div className=" min-h-full p-6 font-sans flex flex-col">
                {/* Header Buttons */}
                <div className="flex justify-end space-x-3 mb-6">
                    <button className="flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-50 transition border border-blue-200">
                        <FiDownload className="h-4 w-4 mr-2" /> Download PDF
                    </button>
                    <button className="flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-50 transition border border-blue-200">
                        <FiMail className="h-4 w-4 mr-2" /> Send Email
                    </button>
                    <button
                        onClick={handleSave}
                        className="flex items-center text-green-600 hover:text-green-700 text-sm font-medium px-4 py-2 rounded-lg bg-green-50 hover:bg-green-100 transition border border-green-300"
                    >
                        <FiSave className="h-4 w-4 mr-2" /> Save All Changes
                    </button>
                    <button className="flex items-center text-red-600 hover:text-red-700 text-sm font-medium px-4 py-2 rounded-lg hover:bg-red-50 transition border border-red-200">
                        <FiTrash2 className="h-4 w-4 mr-2" /> Delete
                    </button>
                </div>

                {/* Vendor & Project Info */}
                <div className="grid grid-cols-3 gap-6 border-b pb-6 mb-6">
                    {[
                        { label: 'Project Name', value: vendorDetails.projectName, field: 'projectName' },
                        { label: 'Vendor Name', value: vendorDetails.vendorName, field: 'vendorName' },
                        { label: 'Created by / On', value: `${vendorDetails.createdBy} | ${vendorDetails.createdAt}`, field: 'createdByAndDate' },
                    ].map(({ label, value, field }) => (
                        <div key={field} className="text-sm">
                            <label className="block text-gray-600 mb-2 font-medium">{label}</label>
                            <input
                                type="text"
                                value={value}
                                onChange={e => handleHeaderChange(field, e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition text-gray-800 bg-white"
                            />
                        </div>
                    ))}
                </div>

                {/* Financial Totals */}
                <div className="flex justify-between items-center mb-8 p-4 bg-white rounded-lg border border-gray-200">
                    <div className="flex space-x-12">
                        {[
                            { label: 'Total Contract Value', value: vendorDetails.contractValue, field: 'contractValue' },
                            { label: 'Earned Value', value: vendorDetails.earnedValue, field: 'earnedValue' },
                        ].map(({ label, value, field }) => (
                            <div key={field} className="text-sm">
                                <span className="text-gray-600 block mb-2 font-medium">{label}</span>
                                <div className="flex items-center">
                                    <HiOutlineCurrencyRupee className="text-xl font-bold text-gray-700 mr-1" />
                                    <input
                                        type="number"
                                        value={value}
                                        onChange={e => handleHeaderChange(field, e.target.value)}
                                        className="text-xl font-bold text-gray-900 px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition w-32"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                    <button className="flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg shadow hover:bg-blue-700 transition">
                        <FiEdit2 className="h-4 w-4 mr-2" />
                        Record Payable
                    </button>
                </div>

                {/* Tasks Assigned Table */}
                <div className="bg-white rounded-lg border border-gray-200 mb-8 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-800">Tasks Assigned</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className=" border-b border-gray-200">
                                <tr>
                                    {['#', 'Task Name', 'Description', 'Total Qty', 'Unit', 'Rate (₹)', 'Total Taxable (₹)'].map((th) => (
                                        <th key={th} className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                                            {th}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {tasks.map((task) => (
                                    <tr key={task.id} className="hover: transition">
                                        <td className="px-6 py-4 text-sm text-gray-500 font-medium">
                                            {task.id}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <input
                                                    type="text"
                                                    value={task.name}
                                                    onChange={e => handleTaskChange(task.id, 'name', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition text-gray-900 bg-white"
                                                />
                                                <FiInfo className="ml-2 h-4 w-4 text-gray-400 cursor-pointer hover:text-gray-600 transition" />
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <input
                                                type="text"
                                                value={task.description}
                                                onChange={e => handleTaskChange(task.id, 'description', e.target.value)}
                                                placeholder="Enter Description"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition text-gray-600 bg-white placeholder-gray-400"
                                            />
                                        </td>
                                        <td className="px-6 py-4">
                                            <input
                                                type="number"
                                                value={task.totalQty}
                                                onChange={e => handleTaskChange(task.id, 'totalQty', parseFloat(e.target.value) || 0)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition text-gray-900 bg-white"
                                            />
                                        </td>
                                        <td className="px-6 py-4">
                                            <input
                                                type="text"
                                                value={task.unit}
                                                onChange={e => handleTaskChange(task.id, 'unit', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition text-gray-900 bg-white"
                                            />
                                        </td>
                                        <td className="px-6 py-4">
                                            <input
                                                type="number"
                                                value={task.rate}
                                                onChange={e => handleTaskChange(task.id, 'rate', parseFloat(e.target.value) || 0)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition text-gray-900 bg-white"
                                            />
                                        </td>
                                        <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                                            ₹{formatCurrency(task.totalQty * task.rate)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Order Summary */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-6">Order Summary</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="text-sm text-gray-600">
                            <p>Review and verify all the details before saving the work order.</p>
                        </div>
                        <div className="space-y-4">
                            {[
                                { label: 'Total Value', value: summary.totalValue, field: 'totalValue' },
                                { label: 'Total CGST/SGST', value: summary.totalCGST_SGST, field: 'totalCGST_SGST' },
                            ].map(({ label, value, field }) => (
                                <div key={field} className="flex justify-between items-center border-b border-gray-100 pb-3">
                                    <span className="text-gray-700 font-medium">{label}</span>
                                    <div className="flex items-center">
                                        <HiOutlineCurrencyRupee className="text-base text-gray-700 mr-1" />
                                        <input
                                            type="number"
                                            value={value}
                                            onChange={e => setSummary(prev => ({ ...prev, [field]: parseFloat(e.target.value) || 0 }))}
                                            className="text-right font-semibold text-gray-900 px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition w-32"
                                        />
                                    </div>
                                </div>
                            ))}

                            {/* Total Contract Amount */}
                            <div className="flex justify-between items-center pt-4 border-t border-gray-300">
                                <span className="text-gray-800 font-bold text-lg">Total Contract amount</span>
                                <span className="text-gray-900 text-xl font-extrabold">
                                    ₹{formatCurrency(totalContractAmount)}
                                </span>
                            </div>
                            <div className="text-right text-sm text-gray-600 italic pt-2 border-t border-gray-100">
                                {`Total amount in words: ${numberToWordsIndian(totalContractAmount)}`}
                            </div>
                        </div>
                    </div>
                </div>


                <div>
                    <h1 className='font-bold mt-6' >Advance Payment on this Order</h1>
                    <p className='text-sm'>Auto-adjusted in the payable recorded for this order</p>
                    <div className='flex gap-2 items-center mt-2'>
                        <IoAddCircle className='text-blue-500' />
                        <h1 className='text-blue-500 text-sm'>Add Advance Payment</h1>
                    </div>
                </div>

                {/* <hr className='my-4' />

                <div className='flex '>
                    <div className=''>
                        <h1>Vender Details</h1>
                        <p>Aman</p>
                    </div>
                    <div className=''>
                        <h1>Vender Details</h1>
                        <p>Aman</p>
                    </div>
                </div> */}
            </div>
        </Drawer>
    );
};

// Placeholder number to words
const numberToWordsIndian = (n) => {
    const num = Math.round(n);
    if (num === 37760) return 'Thirty Seven Thousand Seven Hundred Sixty Rupees Only';
    return 'Thirty Two Thousand Five Hundred Seventy Six Rupees Only';
};

export default EditableWorkOrderDrawer;