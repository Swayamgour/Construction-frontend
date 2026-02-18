import React, { useState } from "react";
import { ChevronDown, FileDown, Plus, ChevronRight } from "lucide-react";
import MaterialTransferDrawer from "../components/MaterialTransferDrawer";

export default function IndentPage() {
    const indents = [
        {
            id: "MT001",
            project: "S S Construction",
            createdOn: "30 Sep 2025, 01:19 PM",
            item: "Bricks, cement",
            status: "Open",
            progress: "Not Delivered",
            poId: "UEPL_P0001505",
            stId: "-",
            expected: "03 Oct 2025",
        },
        {
            id: "MT690",
            project: "SJR PRIME",
            createdOn: "29 Sep 2025, 05:13 PM",
            item: "cement9002, Steel",
            status: "Open",
            progress: "Not Delivered",
            poId: "UEPL_P0001505",
            stId: "-",
            expected: "01 Oct 2025",
        },
        {
            id: "MT689",
            project: "SJR PRIME",
            createdOn: "29 Sep 2025, 12:11 PM",
            item: "cement9002, Angle",
            status: "Closed",
            progress: "Delivered",
            poId: "UEPL_P0001504",
            stId: "-",
            expected: "01 Oct 2025",
        },
    ];

    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const toggleDrawer = () => {
        setIsDrawerOpen(!isDrawerOpen);
    };

    return (
        <div className="min-h-screen p-4 sm:p-3 md:p-4 lg:p-6 bg-gray-50">
            <div className="max-w-7xl mx-auto">
                {/* Header Tabs */}
                <div className="flex flex-wrap items-center gap-6 border-b border-gray-200 mb-6">
                    {[
                        "Indents",
                        "Purchase Orders",
                        "Inventory",
                        "GRN",
                        "Site Transfers",
                        "Material Issue",
                        "Material Return",
                        "Petty Cash",
                        "Consumptions",
                    ].map((tab, i) => (
                        <button
                            key={i}
                            className={`pb-2 text-sm font-medium transition-colors ${tab === "Indents"
                                ? "border-b-2 border-blue-600 text-blue-600"
                                : "text-gray-500 hover:text-blue-600"
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>




                {/* Header + Actions */}
                <div className="flex flex-wrap justify-between items-center mb-8">
                    <h1 className="text-2xl font-normal bg-gradient-to-r from-slate-900 via-blue-800 to-purple-700 bg-clip-text text-transparent">
                        Indents
                    </h1>

                    <div className="flex flex-wrap gap-3 items-center">
                        <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium">
                            <FileDown className="w-4 h-4" /> Export Excel
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                            <Plus className="w-4 h-4" /> Create Indent
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-3 mb-6">
                    {[
                        "Project",
                        "Indent Status",
                        "Indent Progress",
                        "Expected Delivery",
                        "More Filters",
                    ].map((f, i) => (
                        <button
                            key={i}
                            className="flex items-center gap-1 border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white hover:bg-gray-50 transition-colors"
                        >
                            {f} <ChevronDown className="w-4 h-4" />
                        </button>
                    ))}
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                    {[
                        {
                            title: "Indents created in duration",
                            value: "3739",
                            border: "border-b-blue-600",
                        },
                        {
                            title: "Pending for approval",
                            value: "406",
                            border: "border-b-yellow-500",
                        },
                        { title: "Open", value: "1520 (3328 Approved)", border: "border-b-green-600" },
                        {
                            title: "Closed/Marked as Closed",
                            value: "1808",
                            border: "border-b-gray-400",
                        },
                        {
                            title: "Delayed Indents",
                            value: "1245",
                            border: "border-b-red-500",
                        },
                    ].map((stat, i) => (
                        <div
                            key={i}
                            className={`bg-white rounded-lg border border-gray-200 p-6 shadow-md border-b-4 ${stat.border}`}
                        >
                            <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                            <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
                        </div>
                    ))}
                </div>

                {/* Table Section */}
                <div className="py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800">Indent List</h3>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-md mt-4">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-700">
                            <thead className="bg-blue-900 text-white uppercase text-xs">
                                <tr>
                                    {[
                                        "",
                                        "Indent ID",
                                        "Project",
                                        "Created On",
                                        "Item",
                                        "Indent Status",
                                        "Indent Progress",
                                        "PO ID",
                                        "ST ID",
                                        "Expected Delivery",
                                    ].map((head, i) => (
                                        <th key={i} className="px-4 py-3">
                                            {head}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {indents.map((indent, i) => (
                                    <tr key={i} className="border-t hover:bg-gray-50 transition-colors">
                                        <td onClick={toggleDrawer} className="px-4 py-3 text-gray-400 cursor-pointer">
                                            <ChevronRight className="w-4 h-4" />
                                        </td>
                                        <td onClick={toggleDrawer} className="px-4 py-3 font-medium text-blue-600 cursor-pointer">
                                            {indent.id}
                                        </td>
                                        <td className="px-4 py-3">{indent.project}</td>
                                        <td className="px-4 py-3">{indent.createdOn}</td>
                                        <td className="px-4 py-3">{indent.item}</td>
                                        <td className="px-4 py-3">
                                            <span
                                                className={`px-2 py-1 text-xs font-semibold rounded-full ${indent.status === "Open"
                                                    ? "bg-blue-100 text-blue-800"
                                                    : "bg-green-100 text-green-800"
                                                    }`}
                                            >
                                                {indent.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span
                                                className={`px-2 py-1 text-xs font-semibold rounded-full ${indent.progress === "Delivered"
                                                    ? "bg-green-100 text-green-800"
                                                    : "bg-gray-100 text-gray-800"
                                                    }`}
                                            >
                                                {indent.progress}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">{indent.poId}</td>
                                        <td className="px-4 py-3">{indent.stId}</td>
                                        <td className="px-4 py-3">{indent.expected}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Footer Options */}
                <div className="mt-6 flex flex-wrap justify-between items-center gap-3">
                    <label className="flex items-center gap-2 text-sm text-gray-600">
                        <input type="checkbox" className="rounded" /> Show only deleted
                    </label>
                    <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium">
                        Manage Columns
                    </button>
                </div>




            </div>
            <MaterialTransferDrawer
                isOpen={isDrawerOpen}
                onClose={toggleDrawer}
            />
        </div>
    );
}
