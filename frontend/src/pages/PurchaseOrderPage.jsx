import React from "react";

const PurchaseOrderPage = () => {
    const summary = [
        { label: "POs in duration", value: "2504" },
        { label: "Draft PO", value: "36" },
        { label: "Pending PO", value: "270" },
        { label: "Open", value: "670" },
        { label: "Closed/Marked as Closed", value: "1524" },
        { label: "Delivery Delayed POs", value: "401" },
        { label: "POs with Pending Payable", value: "1570" },
    ];

    const data = [
        {
            id: "UEPL_P0001506",
            project: "S S Construction",
            indentId: "MT001",
            grnId: "-",
            vendor: "Ravindra Yadav",
            createdOn: "30 Sep 2025, 01:23 PM",
            poStatus: "Open",
            deliveryStatus: "Not Delivered",
            payableStatus: "Not Recorded",
        },
        {
            id: "UEPL_P0001505",
            project: "SJR PRIME",
            indentId: "MT689",
            grnId: "GRN005062, GRN00",
            vendor: "Ravindra Yadav",
            createdOn: "29 Sep 2025, 12:13 PM",
            poStatus: "Closed",
            deliveryStatus: "Delivered",
            payableStatus: "Recorded",
        },
        {
            id: "UEPL_P0001504",
            project: "Composit",
            indentId: "MT001",
            grnId: "GRN005060, GRN00",
            vendor: "Ravindra Yadav",
            createdOn: "27 Sep 2025, 11:32 AM",
            poStatus: "Closed",
            deliveryStatus: "Delivered",
            payableStatus: "Recorded",
        },
        {
            id: "UEPL_P0001503",
            project: "SJR PRIME",
            indentId: "MT688",
            grnId: "GRN005059",
            vendor: "Shubham",
            createdOn: "26 Sep 2025, 04:37 PM",
            poStatus: "Closed",
            deliveryStatus: "Delivered",
            payableStatus: "Recorded",
        },
    ];

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold">Purchase Order</h1>
                <div className="flex gap-3">
                    <button className="px-4 py-2 border rounded-lg text-sm font-medium hover:bg-gray-100">
                        Export Excel
                    </button>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
                        + Create Purchase Order
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 mb-6">
                {["Project", "PO ID", "Material", "PO Status", "Vendors", "Expected Delivery Date"].map(
                    (item, i) => (
                        <select
                            key={i}
                            className="border rounded-md px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-400"
                        >
                            <option>{item}</option>
                        </select>
                    )
                )}
                <button className="text-blue-600 font-medium text-sm hover:underline">More filters</button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
                {summary.map((item, index) => (
                    <div
                        key={index}
                        className="bg-white p-4 shadow-sm rounded-lg text-center border border-gray-100"
                    >
                        <div className="text-lg font-semibold">{item.value}</div>
                        <div className="text-gray-500 text-sm">{item.label}</div>
                    </div>
                ))}
            </div>

            {/* Table */}
            <div className="overflow-x-auto bg-white rounded-lg shadow-sm">
                <table className="min-w-full text-sm">
                    <thead className="bg-gray-100 text-gray-700">
                        <tr>
                            <th className="px-4 py-3 text-left font-medium">PO ID</th>
                            <th className="px-4 py-3 text-left font-medium">Project</th>
                            <th className="px-4 py-3 text-left font-medium">Indent ID</th>
                            <th className="px-4 py-3 text-left font-medium">GRN ID</th>
                            <th className="px-4 py-3 text-left font-medium">Vendor</th>
                            <th className="px-4 py-3 text-left font-medium">Created On</th>
                            <th className="px-4 py-3 text-left font-medium">PO Status</th>
                            <th className="px-4 py-3 text-left font-medium">Delivery Status</th>
                            <th className="px-4 py-3 text-left font-medium">Payable Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((row, i) => (
                            <tr
                                key={i}
                                className="border-t hover:bg-gray-50 transition-colors duration-150"
                            >
                                <td className="px-4 py-3 text-blue-600 font-medium cursor-pointer">
                                    {row.id} <span className="text-green-500 text-xs">(Auto)</span>
                                </td>
                                <td className="px-4 py-3">{row.project}</td>
                                <td className="px-4 py-3">{row.indentId}</td>
                                <td className="px-4 py-3">{row.grnId}</td>
                                <td className="px-4 py-3">{row.vendor}</td>
                                <td className="px-4 py-3">{row.createdOn}</td>
                                <td className="px-4 py-3">
                                    <span
                                        className={`px-2 py-1 rounded-full text-xs font-medium ${row.poStatus === "Open"
                                                ? "bg-blue-100 text-blue-700"
                                                : "bg-green-100 text-green-700"
                                            }`}
                                    >
                                        {row.poStatus}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <span
                                        className={`px-2 py-1 rounded-full text-xs font-medium ${row.deliveryStatus === "Delivered"
                                                ? "bg-green-100 text-green-700"
                                                : "bg-gray-100 text-gray-700"
                                            }`}
                                    >
                                        {row.deliveryStatus}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <span
                                        className={`px-2 py-1 rounded-full text-xs font-medium ${row.payableStatus === "Recorded"
                                                ? "bg-green-100 text-green-700"
                                                : "bg-gray-100 text-gray-700"
                                            }`}
                                    >
                                        {row.payableStatus}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PurchaseOrderPage;
