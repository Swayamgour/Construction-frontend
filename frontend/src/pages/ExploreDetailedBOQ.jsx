import React from "react";
import { FaTasks, FaUserTie, FaCogs, FaRupeeSign, FaCalendarAlt, FaClipboardList } from "react-icons/fa";
import { AiOutlineFileProtect } from "react-icons/ai";

const ExploreDetailedBOQ = () => {
    const boqData = {
        projectName: "Residential Tower Construction",
        client: "Skyline Developers",
        startDate: "01 Sep 2025",
        endDate: "30 Dec 2025",
        totalBudget: "₹1,20,00,000",
        status: "In Progress",
        manager: "Arjun Mehta",
        materials: [
            { name: "Cement", qty: "400 Bags", cost: "₹1,60,000" },
            { name: "Steel", qty: "5 Tons", cost: "₹3,00,000" },
            { name: "Sand", qty: "10 Tons", cost: "₹80,000" },
        ],
        tasks: [
            { name: "Foundation Work", progress: 100 },
            { name: "Pillar Casting", progress: 60 },
            { name: "Brick Work", progress: 30 },
            { name: "Plastering", progress: 0 },
        ],
    };

    return (
        <div className="p-8 bg-gradient-to-br from-gray-50 to-slate-100 min-h-screen">
            {/* Header */}
            <div className="bg-white shadow-xl rounded-3xl p-8 border border-slate-200 mb-10">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-extrabold text-slate-900">
                        Explore Detailed BOQ
                    </h1>
                    <span className="px-4 py-2 rounded-full text-sm font-semibold bg-blue-100 text-blue-700 border border-blue-200">
                        {boqData.status}
                    </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-slate-700">
                    <div className="flex items-center gap-3">
                        <FaClipboardList className="text-indigo-500 text-xl" />
                        <div>
                            <p className="font-medium text-gray-600">Project Name</p>
                            <p className="font-semibold">{boqData.projectName}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <FaUserTie className="text-teal-500 text-xl" />
                        <div>
                            <p className="font-medium text-gray-600">Client</p>
                            <p className="font-semibold">{boqData.client}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <FaCalendarAlt className="text-orange-500 text-xl" />
                        <div>
                            <p className="font-medium text-gray-600">Start Date</p>
                            <p className="font-semibold">{boqData.startDate}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <FaCalendarAlt className="text-red-500 text-xl" />
                        <div>
                            <p className="font-medium text-gray-600">End Date</p>
                            <p className="font-semibold">{boqData.endDate}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <FaRupeeSign className="text-green-500 text-xl" />
                        <div>
                            <p className="font-medium text-gray-600">Total Budget</p>
                            <p className="font-semibold">{boqData.totalBudget}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <AiOutlineFileProtect className="text-purple-500 text-xl" />
                        <div>
                            <p className="font-medium text-gray-600">Project Manager</p>
                            <p className="font-semibold">{boqData.manager}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Task Progress Section */}
            <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-8 mb-10">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <FaTasks className="text-blue-500" /> Task Progress
                    </h2>
                    <span className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full font-medium">
                        Updated just now
                    </span>
                </div>

                <div className="space-y-6">
                    {boqData.tasks.map((task, index) => (
                        <div key={index}>
                            <div className="flex justify-between mb-2">
                                <span className="font-medium text-gray-700">{task.name}</span>
                                <span className="font-semibold text-gray-800">{task.progress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                <div
                                    className={`h-3 rounded-full transition-all duration-700 ${task.progress === 100
                                        ? "bg-green-500"
                                        : task.progress >= 60
                                            ? "bg-blue-500"
                                            : "bg-yellow-500"
                                        }`}
                                    style={{ width: `${task.progress}%` }}
                                ></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Material & Cost Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Materials Used */}
                <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-8">
                    <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <FaCogs className="text-indigo-500" /> Materials Used
                    </h3>
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="text-left bg-slate-100 text-gray-700">
                                <th className="py-3 px-4 rounded-l-xl">Material</th>
                                <th className="py-3 px-4">Quantity</th>
                                <th className="py-3 px-4 rounded-r-xl">Cost</th>
                            </tr>
                        </thead>
                        <tbody>
                            {boqData.materials.map((m, index) => (
                                <tr key={index} className="border-b hover:bg-slate-50 transition">
                                    <td className="py-3 px-4 font-medium">{m.name}</td>
                                    <td className="py-3 px-4">{m.qty}</td>
                                    <td className="py-3 px-4 font-semibold text-green-600">{m.cost}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Cost Overview */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-3xl shadow-xl border border-green-200 p-8">
                    <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <FaRupeeSign className="text-green-600" /> Cost Overview
                    </h3>
                    <ul className="space-y-4 text-gray-800">
                        <li className="flex justify-between">
                            <span>Material Cost</span>
                            <span>₹5,40,000</span>
                        </li>
                        <li className="flex justify-between">
                            <span>Labour Cost</span>
                            <span>₹3,00,000</span>
                        </li>
                        <li className="flex justify-between">
                            <span>Machinery & Equipment</span>
                            <span>₹1,20,000</span>
                        </li>
                        <li className="flex justify-between font-bold border-t pt-3">
                            <span>Total Project Cost</span>
                            <span>₹9,60,000</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default ExploreDetailedBOQ;
