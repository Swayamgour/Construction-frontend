import React from 'react';
import { FiChevronDown, FiDownload, FiCalendar } from 'react-icons/fi';
import {  HiOutlinePlus } from 'react-icons/hi';

const ExpensesDashboard = () => {
    const expensesData = [
        { refId: 'PP002322', type: '', project: 'West Delhi', paidTo: 'hjsakldjaslkdjsa\nVendor', paidBy: 'Company', category: 'Subcontractor', paidOn: '30 Sep, 2025', paidAmount: '₹475.00' },
        { refId: 'ADV000440', type: 'Advance', project: 'West Delhi', paidTo: 'hjsakldjaslkdjsa\nVendor', paidBy: 'Company', category: 'Subcontractor', paidOn: '30 Sep, 2025', paidAmount: '₹1,000.00' },
        { refId: 'PP002321', type: '', project: 'Sapoli Hospital', paidTo: 'Manoj Kumar\nVendor', paidBy: 'Company', category: 'Subcontractor', paidOn: '12 Sep, 2025', paidAmount: '₹10,000.00' },
        { refId: 'PP002323', type: '', project: 'East Mumbai', paidTo: 'Rahul Services\nVendor', paidBy: 'Company', category: 'Material', paidOn: '01 Oct, 2025', paidAmount: '₹2,500.00' },
        { refId: 'ADV000441', type: 'Advance', project: 'North Bengaluru', paidTo: 'Creative Designs\nVendor', paidBy: 'Employee', category: 'Miscellaneous', paidOn: '05 Oct, 2025', paidAmount: '₹500.00' },
        { refId: 'PP002324', type: '', project: 'South Chennai', paidTo: 'XYZ Construction\nVendor', paidBy: 'Company', category: 'Subcontractor', paidOn: '10 Oct, 2025', paidAmount: '₹7,500.00' },
    ];

    // const ExpenseCategoryCard = ({ title, amount, highlight }) => (
    //     <div className={`flex flex-col items-center justify-center p-4   ${highlight ? 'bg-blue-50' : 'bg-white'}`}>
    //         <span className="text-xs font-medium text-gray-500 mb-1">{title}</span>
    //         <div className="flex items-center text-lg font-bold text-gray-900">
    //             {title === 'Total Expense' && <HiOutlineCurrencyRupee className="h-4 w-4 mr-1 text-gray-700" />}
    //             {amount}
    //         </div>
    //     </div>
    // );

    const data = [
        { title: "Total Expense", amount: "₹1,37,06,89,922.69", highlight: true },
        { title: "Material", amount: "₹1,31,30,96,777.92" },
        { title: "Subcontractor", amount: "₹5,26,27,817.54" },
        { title: "Attendance", amount: "₹3,60,733.23" },
        { title: "Petty Spend", amount: "₹45,94,594.00" },
        { title: "Miscellaneous", amount: "₹10,000.00" },
    ];

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-800">Expenses</h2>
                <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition">
                    <FiDownload className="h-4 w-4 mr-2" /> Export Excel
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm p-4 mb-6 border border-gray-100">
                <div className="flex flex-wrap items-center space-x-3">
                    {['Paid to', 'Paid by', 'Project', 'Category', 'Created on'].map((label) => (
                        <button key={label} className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition">
                            {label} <FiChevronDown className="ml-2 h-4 w-4" />
                        </button>
                    ))}
                    <div className="ml-auto flex items-center space-x-2">
                        <FiCalendar className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">
                            Sort by Date created (Latest first)
                        </span>
                    </div>
                </div>
            </div>

            {/* Summary */}
            <div className="bg-white rounded-xl shadow-md mb-6 flex flex-wrap  items-center gap-6 py-4 justify-center">
                {data.map((item, index) => (
                    <div
                        key={index}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg ${item.highlight ? "bg-blue-50" : "bg-white"
                            }`}
                    >
                        {index !== 0 && <HiOutlinePlus className="text-blue-600 w-5 h-5" />}
                        <div className="flex flex-col items-start">
                            <span className="text-xs font-medium text-gray-500">{item.title}</span>
                            <span className="text-sm font-bold text-gray-900">{item.amount}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-blue-900">
                            <tr>
                                {['Payment reference ID', 'Project', 'Paid to', 'Paid by', 'Category', 'Paid on', 'Paid amount'].map((head) => (
                                    <th key={head} className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">{head}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {expensesData.map((item) => (
                                <tr key={item.refId} className="hover:bg-blue-50 transition">
                                    <td className="px-6 py-4 text-sm font-medium text-blue-600 flex items-center whitespace-nowrap">
                                        {item.refId}
                                        {item.type === 'Advance' && (
                                            <span className="ml-2 px-2 py-0.5 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full">Advance</span>
                                        )}
                                        <FiChevronDown className="ml-1 h-4 w-4 text-gray-400 transform -rotate-90" />
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-900">{item.project}</td>
                                    <td className="px-6 py-4 whitespace-pre-line text-sm text-gray-800">{item.paidTo}</td>
                                    <td className="px-6 py-4 text-sm text-gray-700">{item.paidBy}</td>
                                    <td className="px-6 py-4 text-sm text-gray-700">{item.category}</td>
                                    <td className="px-6 py-4 text-sm text-gray-700">{item.paidOn}</td>
                                    <td className="px-6 py-4 text-sm font-semibold text-gray-900 text-right">{item.paidAmount}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex justify-between items-center p-4 border-t border-gray-200 text-sm text-gray-600 bg-white">
                    <div className="flex items-center space-x-2">
                        <span>Rows per page:</span>
                        <select className="border border-gray-300 rounded-lg p-1 bg-white">
                            <option>10</option>
                            <option>20</option>
                            <option>50</option>
                        </select>
                    </div>
                    <span>1–10 of 1541</span>
                </div>
            </div>
        </div>
    );
};

export default ExpensesDashboard;
