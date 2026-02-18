import React, { useState } from 'react';
import { FiChevronLeft, FiChevronRight, FiChevronDown } from 'react-icons/fi';
import { IoArrowBack } from "react-icons/io5";
import { FiDownload, FiFileText } from "react-icons/fi";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";


const PaymentHistory = ({ setShow }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(20);

    // Editable payment data state
    const [paymentData, setPaymentData] = useState([
        { sl: 1, date: '09 January, 2025', remarks: 'Received from Client A for Phase 1', amount: '₹1,30,340.00' },
        { sl: 2, date: '09 January, 2025', remarks: 'Bank transfer - second installment', amount: '₹1,65,000.00' },
        { sl: 3, date: '08 January, 2025', remarks: 'Cash deposit for initial work', amount: '₹10,000.00' },
        { sl: 4, date: '23 January, 2025', remarks: 'Small advance for materials', amount: '₹6,000.00' },
        { sl: 5, date: '22 January, 2025', remarks: 'Received from Client B', amount: '₹1,00,000.00' },
        { sl: 6, date: '24 January, 2025', remarks: 'Petty cash reimbursement', amount: '₹5,000.00' },
    ]);

    const totalRows = 23;
    const totalPages = Math.ceil(totalRows / rowsPerPage);

    // Handle amount change
    const handleAmountChange = (sl, newAmount) => {
        setPaymentData(prev =>
            prev.map(payment =>
                payment.sl === sl ? { ...payment, amount: newAmount } : payment
            )
        );
    };


    const tableData = [
        { item: "Cement", qty: "25 Bags", rate: "₹350", total: "₹8750" },
        { item: "Iron Rods", qty: "120 Kg", rate: "₹60", total: "₹7200" },
        { item: "Bricks", qty: "500", rate: "₹5", total: "₹2500" },
    ];
    const handleExport = () => {
        const ws = XLSX.utils.json_to_sheet(tableData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
        XLSX.writeFile(wb, "project-data.xlsx");
    };

    const handleDownloadReport = () => {
        const doc = new jsPDF();
        doc.text("Project Report", 14, 15);

        autoTable(doc, {
            head: [["Item", "Qty", "Rate", "Total"]],
            body: tableData.map((row) => [row.item, row.qty, row.rate, row.total]),
            startY: 25,
        });

        doc.save("project-report.pdf");
    };


    return (
        <div className="p-4 sm:p-3 md:p-4 lg:p-6 ">
            <div className="max-w-7xl mx-auto">

                {/* Header Section */}
                <div className="mb-6">
                    <div className="flex justify-between items-start mb-4">
                        <div className='flex gap-4 items-center'>
                            {/* Back Button with hover effect */}
                            <button
                                onClick={() => setShow(false)}
                                className=' rounded-full text-gray-700 hover:bg-gray-200 transition-colors'
                            >
                                <IoArrowBack size={25} />
                            </button>

                            <div>
                                {/* <h1 className="text-2xl font-bold text-gray-900">Payment History</h1> */}
                                <h1 className="text-2xl font-normal bg-gradient-to-r from-slate-900 via-blue-800 to-purple-700 bg-clip-text text-transparent mb-3">
                                    Payment History
                                </h1>
                                <p className="text-gray-600 mt-1 text-sm">
                                    <span className="font-semibold text-blue-600">SIRC.</span> Last synced 2 minutes ago
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Total Received Amount Card (Modernized with Top Border) */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6 shadow-md border-t-4 border-t-blue-600">
                        <p className="text-sm text-gray-600 mb-1">Total Payment Received</p>
                        <h2 className="text-3xl font-bold text-gray-900">
                            ₹46,68,340.00
                        </h2>
                    </div>
                </div>

                {/* Payment History Table (Matching Dashboard Table Style) */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-lg">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            {/* Table Header: Dark Blue Background like the 'Market Columns' table */}
                            <thead className="bg-blue-900">
                                <tr>
                                    {/* Borders: border-b border-r border-gray-200 on headers */}
                                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider border-b border-r border-gray-200">
                                        Sl
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider border-b border-r border-gray-200">
                                        Date of entry
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider border-b border-r border-gray-200">
                                        Remarks
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider border-b border-gray-200">
                                        Total amount
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {paymentData.map((payment) => (
                                    <tr key={payment.sl} className="hover: transition-colors">
                                        {/* Borders: border-r border-gray-200 on cells */}
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-r border-gray-200">
                                            {payment.sl}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium border-r border-gray-200">
                                            {payment.date}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 border-r border-gray-200">
                                            {payment.remarks}
                                        </td>
                                        <td className="px-6 py-3 whitespace-nowrap text-sm font-semibold text-gray-900">
                                            <input
                                                type="text"
                                                value={payment.amount}
                                                onChange={(e) => handleAmountChange(payment.sl, e.target.value)}
                                                className="border border-gray-300 rounded px-2 py-1 w-full max-w-[180px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-left"
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="px-6 py-4 border-t border-gray-200 /70">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-700">Rows per page:</span>
                                <div className="relative">
                                    <select
                                        value={rowsPerPage}
                                        onChange={(e) => setRowsPerPage(Number(e.target.value))}
                                        className="appearance-none bg-white border border-gray-300 rounded px-3 py-1 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value={10}>10</option>
                                        <option value={20}>20</option>
                                        <option value={50}>50</option>
                                        <option value={100}>100</option>
                                    </select>
                                    <FiChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none w-4 h-4" />
                                </div>
                            </div>

                            <div className="flex items-center space-x-4">
                                <span className="text-sm text-gray-700">
                                    {((currentPage - 1) * rowsPerPage) + 1}–{Math.min(currentPage * rowsPerPage, totalRows)} of {totalRows}
                                </span>

                                <div className="flex items-center space-x-1">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                        disabled={currentPage === 1}
                                        className="p-1 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <FiChevronLeft className="w-5 h-5 text-gray-600" />
                                    </button>

                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                        disabled={currentPage === totalPages}
                                        className="p-1 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <FiChevronRight className="w-5 h-5 text-gray-600" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Additional Actions */}
                <div className="flex justify-end gap-4 mt-6">
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
                    >
                        <FiFileText className="w-5 h-5" />
                        Export
                    </button>

                    <button
                        onClick={handleDownloadReport}
                        className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-md"
                    >
                        <FiDownload className="w-5 h-5" />
                        Download Report
                    </button>
                </div>

            </div>
        </div>
    );
};

export default PaymentHistory;