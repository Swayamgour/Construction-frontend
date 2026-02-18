import React, { useState } from "react";
import Drawer from "../helper/Drawer";
import {
    FiX,
    FiCalendar,
    FiTag,
    FiUser,
    FiClock,
    FiPercent,
} from "react-icons/fi";

const TaskDrawer = ({ isOpen, onClose, task }) => {
    const [progress, setProgress] = useState(0);
    const [details, setDetails] = useState({
        workCategory: "General",
        duration: "1 Day",
        startDate: "",
        endDate: "",
        unitOfWork: "% (percent)",
        tags: "Select Tags",
        assignedTo: "Select Assignee",
    });

    const handleDetailChange = (field, value) => {
        setDetails((prev) => ({ ...prev, [field]: value }));
    };

    const statusIcons = {
        "✓": <span className="text-green-500 font-bold">✓</span>,
        "❑": <span className="text-gray-400 font-bold">❑</span>,
        "✗": <span className="text-red-500 font-bold">✗</span>,
    };

    return (
        <Drawer isOpen={isOpen} onClose={onClose} title="Task Details"
            // widthClass="w-2/5"
            widthClass="w-full md:w-2/5 lg:w-1/3"
        >
            <div className="space-y-6 min-h-[80vh]">
                {/* Header */}
                <div className="flex flex-col gap-1">
                    <h1 className="text-gray-700 text-sm">{task?.parentPath || "Plastering / floor 1"}</h1>
                    <h2 className="text-gray-900 font-bold text-lg">{task?.name || "kitchen"}</h2>
                </div>

                {/* Status & Progress */}
                <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                        {task?.status || "Not Started"}
                    </span>
                    <span className="text-sm text-gray-600">{progress}%</span>
                </div>

                {/* Details Section */}
                <div className="space-y-3">
                    {/* Work Category */}
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <FiTag className="w-4 h-4 text-gray-400" />
                            <span className="text-sm font-medium text-gray-700">WORK CATEGORY</span>
                        </div>
                        <div className="px-3 py-2 rounded border  text-gray-900 text-sm">
                            {details.workCategory}
                        </div>
                    </div>

                    {/* Duration */}
                    <div className="flex items-center justify-between p-3  rounded-lg">
                        <div className="flex items-center gap-2">
                            <FiClock className="w-4 h-4 text-gray-400" />
                            <span className="text-sm font-medium text-gray-700">DURATION</span>
                        </div>
                        <span className="text-sm text-gray-900">{details.duration}</span>
                    </div>

                    {/* Start Date */}
                    <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                        <div className="flex items-center gap-2">
                            <FiCalendar className="w-4 h-4 text-gray-400" />
                            <span className="text-sm font-medium text-gray-700">START DATE</span>
                        </div>
                        <input
                            type="date"
                            value={details.startDate}
                            onChange={(e) => handleDetailChange("startDate", e.target.value)}
                            className="text-sm text-gray-900 border-none focus:outline-none"
                        />
                    </div>

                    {/* End Date */}
                    <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                        <div className="flex items-center gap-2">
                            <FiCalendar className="w-4 h-4 text-gray-400" />
                            <span className="text-sm font-medium text-gray-700">END DATE</span>
                        </div>
                        <input
                            type="date"
                            value={details.endDate}
                            onChange={(e) => handleDetailChange("endDate", e.target.value)}
                            className="text-sm text-gray-900 border-none focus:outline-none"
                        />
                    </div>

                    {/* Unit of Work */}
                    <div className="flex items-center justify-between p-3  rounded-lg">
                        <div className="flex items-center gap-2">
                            <FiPercent className="w-4 h-4 text-gray-400" />
                            <span className="text-sm font-medium text-gray-700">UNIT OF WORK</span>
                        </div>
                        <span className="text-sm text-gray-900">{details.unitOfWork}</span>
                    </div>

                    {/* Tags */}
                    <div className="flex items-center justify-between p-3  rounded-lg">
                        <div className="flex items-center gap-2">
                            <FiTag className="w-4 h-4 text-gray-400" />
                            <span className="text-sm font-medium text-gray-700">TAGS</span>
                        </div>
                        <select
                            value={details.tags}
                            onChange={(e) => handleDetailChange("tags", e.target.value)}
                            className="text-sm text-gray-900 bg-transparent border-none focus:outline-none"
                        >
                            <option>Select Tags</option>
                            <option>High Priority</option>
                            <option>Urgent</option>
                            <option>Follow Up</option>
                        </select>
                    </div>

                    {/* Assigned To */}
                    <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                        <div className="flex items-center gap-2">
                            <FiUser className="w-4 h-4 text-gray-400" />
                            <span className="text-sm font-medium text-gray-700">ASSIGNED TO</span>
                        </div>
                        <select
                            value={details.assignedTo}
                            onChange={(e) => handleDetailChange("assignedTo", e.target.value)}
                            className="text-sm text-gray-900 bg-transparent border-none focus:outline-none"
                        >
                            <option>Select Assignee</option>
                            <option>John Doe</option>
                            <option>Jane Smith</option>
                            <option>Mike Johnson</option>
                        </select>
                    </div>
                </div>

                {/* Update Progress */}
                <div className="space-y-3">
                    <h3 className="text-gray-900 font-semibold text-lg">Update Progress</h3>
                    <div className="w-full bg-gray-200 h-2 rounded-full">
                        <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>

                    <div className="flex items-center gap-3">
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={progress}
                            onChange={(e) => setProgress(parseInt(e.target.value))}
                            className="flex-1"
                        />
                        <input
                            type="number"
                            min="0"
                            max="100"
                            value={progress}
                            onChange={(e) => setProgress(parseInt(e.target.value) || 0)}
                            className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                        <span className="text-sm text-gray-600">%</span>
                    </div>

                    <button className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                        Update Progress
                    </button>
                </div>
            </div>
        </Drawer>
    );
};

export default TaskDrawer;
