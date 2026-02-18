import React, { useState } from 'react';
import {
    FiChevronDown,
    // FiMoreHorizontal,
    FiDownload,
    // FiSettings,
    FiPlus,
    // FiCalendar,
    // FiDollarSign,
    FiAlertCircle,
    FiClock,
} from "react-icons/fi";
// import { HiOutlineDocumentText } from 'react-icons/hi';
import RecordPaymentDrawer from '../components/RecordPaymnent';
import ExpensesDashboard from './ExpensesDashboard';
import * as XLSX from "xlsx";
import { MdCurrencyRupee } from 'react-icons/md';
// import CustomTable from '../helper/CustomTable';

const SCPayableDashboard = () => {
    const payableData = [
        {
            id: '5435535435534',
            project: 'West Delhi',
            contract: 'Work order\nWO-2024-25-000683',
            payableRecorded: '₹1,475.00',
            payableDue: '₹475.00',
            dueDate: '15 Oct, 2025',
            status: 'Partially paid',
            payableTo: 'hjsakldjaslkdjsa',
            createdOn: '30 Sep, 2024',
        },
        {
            id: 'unrvywtew',
            project: 'West Delhi',
            contract: 'Work order\nWO-2024-25-000674',
            payableRecorded: '₹1,534.00',
            payableDue: '₹1,534.00',
            dueDate: '30 Sep, 2025',
            status: 'Unpaid',
            payableTo: 'dhskfdsaifds',
            createdOn: '26 Sep, 2024',
        },
        {
            id: '264264264',
            project: 'SJR PRIME A',
            contract: 'Work order\nWO-2024-25-000667',
            payableRecorded: '₹301.00',
            payableDue: '₹301.00',
            dueDate: '30 Sep, 2025',
            status: 'Unpaid',
            payableTo: 'ABC1234',
            createdOn: '19 Sep, 2024',
        },
    ];



    // const columns = [
    //     { header: 'Payable ID', accessor: 'id' },
    //     { header: 'Project', accessor: 'project' },
    //     { header: 'Contract', accessor: 'contract' },
    //     { header: 'Payable Recorded', accessor: 'payableRecorded' },
    //     { header: 'Payable Due', accessor: 'payableDue' },
    //     { header: 'Due Date', accessor: 'dueDate' },
    //     { header: 'Status', accessor: 'status' },
    //     { header: 'Payable To', accessor: 'payableTo' },
    //     { header: 'Created On', accessor: 'createdOn' },
    //     { header: 'Action', accessor: 'action' },

    // ]

    const [activeTab, setActiveTab] = useState("Payables");
    const tabs = ["Payables", "Payments", "Expenses"];
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const toggleDrawer = () => setIsDrawerOpen(!isDrawerOpen);

    const handleExportData = () => {
        const ws = XLSX.utils.json_to_sheet(payableData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Payables");
        XLSX.writeFile(wb, "payables.xlsx");
    };

    const SummaryCard = ({ title, amount, count, color, borderColor, icon }) => (
        <div className={`bg-white rounded-lg border border-gray-200 p-6 border-b-4 ${borderColor} shadow-md`}>
            <div className="flex justify-between items-start mb-3">
                <h3 className="text-sm text-gray-500">{title}</h3>
                <div className={`text-2xl ${color}`}>{icon}</div>
            </div>
            <p className="text-2xl font-semibold text-gray-900">{amount}</p>
            <p className="text-sm text-gray-400">{count} Payables</p>
        </div>
    );

    return (
        <div className="min-h-screen p-4 sm:p-3 md:p-4 lg:p-6 font-sans">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-2">
                        {/* <HiOutlineDocumentText className="h-6 w-6 text-blue-600" /> */}
                        {/* <h1 className="text-2xl font-semibold bg-gradient-to-r from-blue-800 to-purple-700 bg-clip-text text-transparent">
                            SC Payable
                        </h1> */}

                        <h1 className="text-xl sm:text-2xl font-normal bg-gradient-to-r from-slate-900 via-blue-800 to-purple-700 bg-clip-text text-transparent">
                            SC Payable
                        </h1>
                    </div>
                    {/* <div className="h-8 w-8 bg-gray-200 rounded-full"></div> */}
                </div>

                {/* Tabs */}
                <div className="flex space-x-6 border-b border-gray-200 mb-6">
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`py-3 px-4 text-sm font-semibold relative ${activeTab === tab
                                ? "text-blue-600 after:absolute after:-bottom-[1px] after:left-0 after:w-full after:h-[3px] after:bg-blue-600 rounded-full"
                                : "text-gray-500 hover:text-gray-700"
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {activeTab === "Expenses" ? (
                    <ExpensesDashboard />
                ) : (
                    <>
                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <SummaryCard
                                title="Total Due"
                                amount="₹2,44,92,59,249.52"
                                count="678"
                                color="text-blue-600"
                                borderColor="border-b-blue-600"
                                icon={<MdCurrencyRupee />}
                            />
                            <SummaryCard
                                title="Overdue"
                                amount="₹2,44,92,55,818.52"
                                count="674"
                                color="text-red-600"
                                borderColor="border-b-red-600"
                                icon={<FiAlertCircle />}
                            />
                            <SummaryCard
                                title="Due within next 15 days"
                                amount="₹2,956.00"
                                count="3"
                                color="text-yellow-600"
                                borderColor="border-b-yellow-500"
                                icon={<FiClock />}
                            />
                        </div>

                        {/* Filter and Actions */}
                        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm mb-6 flex flex-wrap justify-between items-center gap-3">
                            <div className="flex flex-wrap items-center gap-2">
                                {["Status", "Payable To", "Project"].map((label) => (
                                    <button
                                        key={label}
                                        className="flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
                                    >
                                        {label}
                                        <FiChevronDown className="ml-2 h-4 w-4" />
                                    </button>
                                ))}
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <button onClick={handleExportData} className="flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-100">
                                    <FiDownload className="mr-2" /> Export Excel
                                </button>
                                <button className="flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md shadow hover:bg-blue-700">
                                    <FiPlus className="h-4 w-4 mr-1" /> Record Payable
                                </button>
                            </div>
                        </div>

                        {/* Table */}

                        {/* <CustomTable columns={columns} data={payableData} /> */}

                        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-md">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-blue-900">
                                        <tr>
                                            {[
                                                'Payable ID',
                                                'Project',
                                                'Contract',
                                                'Payable Recorded',
                                                'Payable Due',
                                                'Due Date',
                                                'Status',
                                                'Payable To',
                                                'Created On',
                                                'Action'
                                            ].map((header) => (
                                                <th
                                                    key={header}
                                                    className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider border-b border-gray-400"
                                                >
                                                    {header}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {payableData.map((item) => (
                                            <tr key={item.id} className="hover:bg-gray-50 transition">
                                                <td className="px-6 py-4 text-sm font-medium text-blue-700">{item.id}</td>
                                                <td className="px-6 py-4 text-sm text-gray-900">{item.project}</td>
                                                <td className="px-6 py-4 text-sm text-gray-900 whitespace-pre-line">{item.contract}</td>
                                                <td className="px-6 py-4 text-sm text-gray-900">{item.payableRecorded}</td>
                                                <td className="px-6 py-4 text-sm text-gray-900">{item.payableDue}</td>
                                                <td className="px-6 py-4 text-sm text-gray-900">{item.dueDate}</td>
                                                <td className="px-6 py-4">
                                                    <span
                                                        className={`px-2 py-1 inline-block text-xs leading-5 font-semibold rounded-full ${item.status === 'Partially paid'
                                                            ? ' text-yellow-800 text-center'
                                                            : ' text-gray-800 text-center'
                                                            }`}
                                                    >
                                                        {item.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-900">{item.payableTo}</td>
                                                <td className="px-6 py-4 text-sm text-gray-500">{item.createdOn}</td>
                                                <td className="px-6 py-4">
                                                    <button
                                                        onClick={toggleDrawer}
                                                        className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center gap-1"
                                                    >
                                                        <FiPlus className="h-4 w-4" /> Record Payment
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}
            </div>
            <RecordPaymentDrawer isOpen={isDrawerOpen} onClose={toggleDrawer} />
        </div>
    );
};

export default SCPayableDashboard;
