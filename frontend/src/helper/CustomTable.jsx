import React from "react";
import { FiChevronRight } from "react-icons/fi";

export default function CustomTable({ columns, data }) {
    if (!data || data.length === 0) {
        return (
            <div className="p-4 text-center text-gray-500 bg-white border border-gray-200 rounded-lg">
                No data available
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    {/* Table Header */}
                    <thead className="bg-blue-900">
                        <tr>
                            {columns.map((col, index) => (
                                <th
                                    key={index}
                                    className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider border-b border-r border-gray-400"
                                >
                                    {col.header}
                                </th>
                            ))}
                        </tr>
                    </thead>

                    {/* Table Body */}
                    <tbody className="bg-white divide-y divide-gray-200">
                        {data.map((row, rowIndex) => (
                            <tr key={rowIndex} className="hover:bg-blue-50 transition-colors">
                                {columns.map((col, colIndex) => (
                                    <td
                                        key={colIndex}
                                        className={`px-6 py-4 text-sm text-gray-900 ${colIndex !== columns.length - 1
                                                ? "border-r border-gray-200"
                                                : ""
                                            }`}
                                    >
                                        {col.accessor === "description" ? (
                                            <div className="flex items-center justify-between">
                                                <span className="flex-1">{row[col.accessor]}</span>
                                                <FiChevronRight className="w-4 h-4 text-gray-400 ml-2 flex-shrink-0" />
                                            </div>
                                        ) : (
                                            row[col.accessor] || "--"
                                        )}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
