import React from "react";
import { FaDownload, FaPlus, FaCheckCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const DetailedBOQ = () => {
    const boqSummary = {
        totalBudget: "₹10,00,000",
        spent: "₹7,50,000",
        remaining: "₹2,50,000",
    };

    const boqItems = [
        {
            id: 1,
            category: "Cement",
            quantity: "500 Bags",
            rate: "₹350 / Bag",
            total: "₹1,75,000",
            spent: "₹1,20,000",
            progress: 68,
            status: "Ongoing",
        },
        {
            id: 2,
            category: "Steel",
            quantity: "3 Tons",
            rate: "₹58,000 / Ton",
            total: "₹1,74,000",
            spent: "₹1,74,000",
            progress: 100,
            status: "Completed",
        },
        {
            id: 3,
            category: "Sand",
            quantity: "20 Loads",
            rate: "₹3,500 / Load",
            total: "₹70,000",
            spent: "₹50,000",
            progress: 72,
            status: "Ongoing",
        },
        {
            id: 4,
            category: "Labor Charges",
            quantity: "-",
            rate: "-",
            total: "₹2,50,000",
            spent: "₹2,00,000",
            progress: 80,
            status: "Ongoing",
        },
        {
            id: 5,
            category: "Electrical Fittings",
            quantity: "100 Units",
            rate: "₹500 / Unit",
            total: "₹50,000",
            spent: "₹30,000",
            progress: 60,
            status: "Ongoing",
        },
    ];

    const navigate = useNavigate()

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 p-6 md:p-12">
            <div className="max-w-6xl mx-auto space-y-10">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">
                            Detailed BOQ Report
                        </h1>
                        <p className="text-slate-500 mt-2">
                            Breakdown of project budget, materials, and expenses
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <button className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-2xl font-medium shadow-md hover:shadow-lg transition-all">
                            <FaDownload />
                            Download Report
                        </button>
                        <button onClick={() => navigate('/AddBOQItem')} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-2xl font-medium shadow-md hover:shadow-lg transition-all">
                            <FaPlus />
                            Add Item
                        </button>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid sm:grid-cols-3 gap-6">
                    {[
                        { title: "Total Budget", value: boqSummary.totalBudget, border: "border-l-blue-500" },
                        { title: "Total Spent", value: boqSummary.spent, border: "border-l-purple-500" },
                        { title: "Remaining", value: boqSummary.remaining, border: "border-l-green-500" },
                    ].map((card, idx) => (
                        <div
                            key={idx}
                            className={`bg-white text-slate-800 rounded-2xl p-6 shadow-xl border border-slate-200 border-l-4 ${card.border} hover:shadow-2xl hover:scale-[1.03] transition-all duration-300`}
                        >
                            <h3 className="text-sm text-slate-500 mb-2">{card.title}</h3>
                            <p className="text-2xl font-bold text-slate-900">{card.value}</p>
                        </div>
                    ))}
                </div>


                {/* Table */}
                <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-8 overflow-x-auto">
                    <h2 className="text-2xl font-bold text-slate-900 mb-6">BOQ Breakdown</h2>

                    <table className="min-w-full text-left border-collapse">
                        <thead>
                            <tr className="text-slate-600 border-b">
                                <th className="py-3 px-4">Category</th>
                                <th className="py-3 px-4">Quantity</th>
                                <th className="py-3 px-4">Rate</th>
                                <th className="py-3 px-4">Total</th>
                                <th className="py-3 px-4">Spent</th>
                                <th className="py-3 px-4">Progress</th>
                                <th className="py-3 px-4">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {boqItems.map((item) => (
                                <tr
                                    key={item.id}
                                    className="border-b hover:bg-slate-50 transition-all"
                                >
                                    <td className="py-3 px-4 font-medium text-slate-800">{item.category}</td>
                                    <td className="py-3 px-4">{item.quantity}</td>
                                    <td className="py-3 px-4">{item.rate}</td>
                                    <td className="py-3 px-4 font-semibold">{item.total}</td>
                                    <td className="py-3 px-4">{item.spent}</td>
                                    <td className="py-3 px-4">
                                        <div className="w-36 bg-slate-200 rounded-full h-3 overflow-hidden">
                                            <div
                                                className="bg-blue-500 h-3 rounded-full"
                                                style={{ width: `${item.progress}%` }}
                                            ></div>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4">
                                        {item.status === "Completed" ? (
                                            <span className="flex items-center text-green-600 font-medium">
                                                <FaCheckCircle className="mr-1" /> Completed
                                            </span>
                                        ) : (
                                            <span className="text-amber-500 font-medium">{item.status}</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DetailedBOQ;
