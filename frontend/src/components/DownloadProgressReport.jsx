import React, { useState } from "react";
import Drawer from "../helper/Drawer";

const DownloadProgressReportDrawer = ({ isOpen, onClose }) => {
    const [reportFor, setReportFor] = useState("Internal team");
    const [reportType, setReportType] = useState("Detailed report");
    const [duration, setDuration] = useState("Today");
    const [fromDate, setFromDate] = useState("30 Sep. 2025");
    const [toDate, setToDate] = useState("30 Sep. 2025");
    const [selectedTags, setSelectedTags] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState([]);

    const handleCreateReport = () => {
        console.log("Creating report with:", {
            reportFor,
            reportType,
            duration,
            fromDate,
            toDate,
            selectedTags,
            selectedCategories,
        });
    };

    return (
        <Drawer
            isOpen={isOpen}
            onClose={onClose}
            title="Download Progress Report"
          widthClass="w-full md:w-2/5 lg:w-1/3"
        >
            <div className=" font-sans min-h-screen">
                <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200">
                    {/* Report For Section */}
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-sm font-medium text-gray-700 mb-3">
                            Create Report for
                        </h2>
                        <div className="flex space-x-4">
                            {["Internal team", "Client"].map((option) => (
                                <button
                                    key={option}
                                    onClick={() => setReportFor(option)}
                                    className={`px-4 py-2 text-sm font-medium rounded-md border ${reportFor === option
                                            ? "bg-blue-50 border-blue-200 text-blue-700"
                                            : "bg-white border-gray-300 text-gray-700 hover:"
                                        }`}
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Report Type Section */}
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-sm font-medium text-gray-700 mb-3">
                            Select report type
                        </h2>
                        <div className=" flex gap-4">
                            {[
                                {
                                    type: "Detailed report",
                                    description:
                                        "Shows day-wise logs—useful for detailed tracking and records.",
                                },
                                {
                                    type: "Summary report",
                                    description:
                                        "Shows key summaries—great for quick updates and sharing.",
                                    isNew: true,
                                },
                            ].map(({ type, description, isNew }) => (
                                <div
                                    key={type}
                                    onClick={() => setReportType(type)}
                                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${reportType === type
                                            ? "border-blue-300 bg-blue-50"
                                            : "border-gray-200 hover:border-gray-300"
                                        }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <div
                                            className={`w-4 h-4 rounded-full border flex items-center justify-center ${reportType === type
                                                    ? "border-blue-500 bg-blue-500"
                                                    : "border-gray-400"
                                                }`}
                                        >
                                            {reportType === type && (
                                                <div className="w-2 h-2 rounded-full bg-white"></div>
                                            )}
                                        </div>
                                        <span className="text-sm font-medium text-gray-900">
                                            {type}
                                            {isNew && (
                                                <span className="ml-2 px-1.5 py-0.5 text-xs bg-green-100 text-green-800 rounded">
                                                    New
                                                </span>
                                            )}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1 ml-6">
                                        {description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Duration Section */}
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-sm font-medium text-gray-700 mb-3">
                            Select Duration
                        </h2>

                        <div className="flex space-x-2 mb-4">
                            {["Today", "7 Days", "15 Days", "Specific Date"].map((option) => (
                                <button
                                    key={option}
                                    onClick={() => setDuration(option)}
                                    className={`px-3 py-2 text-sm font-medium rounded-md border ${duration === option
                                            ? "bg-blue-50 border-blue-200 text-blue-700"
                                            : "bg-white border-gray-300 text-gray-700 hover:"
                                        }`}
                                >
                                    {option}
                                </button>
                            ))}
                        </div>

                        {duration === "Specific Date" && (
                            <div className="flex space-x-4">
                                <div className="flex-1">
                                    <label className="block text-xs font-medium text-gray-600 mb-1">
                                        From
                                    </label>
                                    <div className="px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 bg-white">
                                        {fromDate}
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <label className="block text-xs font-medium text-gray-600 mb-1">
                                        To
                                    </label>
                                    <div className="px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 bg-white">
                                        {toDate}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Filters Section */}
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-sm font-medium text-gray-700 mb-3">Filters</h2>
                        <div className="flex gap-4">
                            <div>
                                <button className="w-full  px-3 py-2 text-left border border-gray-300 rounded-md text-sm text-gray-700 bg-white hover:">
                                    Tags
                                </button>
                            </div>
                            <div>
                                <button className="w-full px-3 py-2 text-left border border-gray-300 rounded-md text-sm text-gray-700 bg-white hover:">
                                    Work Categories
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="px-6 py-4 flex justify-end space-x-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover: focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            CANCEL
                        </button>
                        <button
                            onClick={handleCreateReport}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            CREATE REPORT
                        </button>
                    </div>
                </div>
            </div>
        </Drawer>
    );
};

export default DownloadProgressReportDrawer;
