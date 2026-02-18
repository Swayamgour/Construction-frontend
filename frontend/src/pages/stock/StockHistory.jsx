import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGetItemLedgerQuery } from "../../Reduxe/Api";
import {
    FaHistory,
    FaArrowLeft,
    FaFilter,
    FaDownload,
    FaSortAmountDown,
    FaSortAmountUp,
    FaCalendarAlt,
    FaBoxOpen,
    FaExchangeAlt,
    FaWarehouse
} from "react-icons/fa";
import {
    IoArrowDownCircle,
    IoArrowUpCircle,
    IoPieChart,
    IoPrint
} from "react-icons/io5";
import { FiRefreshCw } from "react-icons/fi";

export default function StockHistory() {
    const { projectId, itemId } = useParams();
    const navigate = useNavigate();

    const { data: ledgerData, isLoading, isSuccess, error, refetch } = useGetItemLedgerQuery({ projectId, itemId });

    // State for filtering
    const [filterType, setFilterType] = useState("all"); // all, in, out
    const [sortOrder, setSortOrder] = useState("desc"); // asc, desc
    const [selectedDateRange, setSelectedDateRange] = useState("all"); // all, today, week, month

    // Filter and sort ledger data
    const filteredLedger = React.useMemo(() => {
        if (!ledgerData) return [];

        let data = [...ledgerData];

        // Filter by transaction type
        if (filterType === "in") {
            data = data.filter(entry => entry.qtyIn > 0);
        } else if (filterType === "out") {
            data = data.filter(entry => entry.qtyOut > 0);
        }

        // Filter by date range
        const now = new Date();
        if (selectedDateRange === "today") {
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            data = data.filter(entry => new Date(entry.createdAt) >= today);
        } else if (selectedDateRange === "week") {
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            data = data.filter(entry => new Date(entry.createdAt) >= weekAgo);
        } else if (selectedDateRange === "month") {
            const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
            data = data.filter(entry => new Date(entry.createdAt) >= monthAgo);
        }

        // Sort by date
        data.sort((a, b) => {
            const dateA = new Date(a.createdAt);
            const dateB = new Date(b.createdAt);
            return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
        });

        return data;
    }, [ledgerData, filterType, sortOrder, selectedDateRange]);

    // Calculate statistics
    const stats = React.useMemo(() => {
        if (!Array.isArray(ledgerData) || ledgerData.length === 0) {
            return {
                totalIn: 0,
                totalOut: 0,
                currentBalance: 0,
                totalTransactions: 0,
                avgPerTransaction: 0
            };
        }

        let totalIn = 0;
        let totalOut = 0;

        ledgerData.forEach(entry => {
            totalIn += entry.qtyIn || 0;
            totalOut += entry.qtyOut || 0;
        });

        const currentBalance = totalIn - totalOut

        return {
            totalIn,
            totalOut,
            currentBalance,
            totalTransactions: ledgerData.length,
            avgPerTransaction: (totalIn + totalOut) / ledgerData.length
        };
    }, [ledgerData]);
    


    // Format date
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Get transaction type badge
    const getTransactionTypeBadge = (type, qtyIn, qtyOut) => {
        if (qtyIn > 0) {
            return (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium">
                    <IoArrowDownCircle /> Stock In
                </span>
            );
        } else if (qtyOut > 0) {
            return (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-100 text-red-700 text-sm font-medium">
                    <IoArrowUpCircle /> Stock Out
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium">
                <FaExchangeAlt /> Adjustment
            </span>
        );
    };

    // Handle print
    const handlePrint = () => {
        window.print();
    };

    // Handle download
    const handleDownload = () => {
        // Implement CSV download functionality here
        alert("Download functionality would be implemented here");
    };

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-6xl mx-auto">
                    <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
                        <FaHistory className="text-4xl text-red-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-red-700 mb-2">Failed to Load History</h2>
                        <p className="text-red-600 mb-6">Unable to fetch stock ledger data</p>
                        <button
                            onClick={refetch}
                            className="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-6">
            <div className="max-w-7xl mx-auto">
                {/* HEADER */}
                <div className="mb-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate(-1)}
                                className="p-2.5 bg-white rounded-lg shadow-sm hover:bg-gray-50 transition-colors border border-gray-200"
                            >
                                <FaArrowLeft className="text-gray-600" />
                            </button>

                            <div className="flex items-center gap-3">
                                <div className="bg-gradient-to-br from-blue-600 to-purple-600 text-white p-3 md:p-4 rounded-xl shadow-lg">
                                    <FaHistory className="text-2xl md:text-3xl" />
                                </div>
                                <div>
                                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                                        Stock Transaction History
                                    </h1>
                                    <p className="text-gray-600 mt-1">
                                        Item ID: <span className="font-mono text-blue-600">{itemId}</span>
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={refetch}
                                className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium flex items-center gap-2 transition-colors"
                            >
                                <FiRefreshCw /> Refresh
                            </button>
                            <button
                                onClick={handleDownload}
                                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
                            >
                                <FaDownload /> Export
                            </button>
                            <button
                                onClick={handlePrint}
                                className="px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
                            >
                                <IoPrint /> Print
                            </button>
                        </div>
                    </div>

                    {/* STATISTICS CARDS */}
                    {stats && (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                            <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-5">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Current Balance</p>
                                        <p className="text-2xl font-bold text-blue-600">{stats.currentBalance}</p>
                                        {console.log(stats)}
                                    </div>
                                    <div className="p-3 bg-blue-500 text-white rounded-lg">
                                        <FaWarehouse size={20} />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-xl p-5">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Total Stock In</p>
                                        <p className="text-2xl font-bold text-green-600">{stats.totalIn}</p>
                                    </div>
                                    <div className="p-3 bg-green-500 text-white rounded-lg">
                                        <IoArrowDownCircle size={20} />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-xl p-5">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Total Stock Out</p>
                                        <p className="text-2xl font-bold text-red-600">{stats.totalOut}</p>
                                    </div>
                                    <div className="p-3 bg-red-500 text-white rounded-lg">
                                        <IoArrowUpCircle size={20} />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-5">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Total Transactions</p>
                                        <p className="text-2xl font-bold text-purple-600">{stats.totalTransactions}</p>
                                    </div>
                                    <div className="p-3 bg-purple-500 text-white rounded-lg">
                                        <IoPieChart size={20} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* FILTERS AND CONTROLS */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-6">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                                <FaFilter className="text-blue-600" />
                                <h3 className="font-semibold text-gray-700">Filter & Sort</h3>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3">
                                {/* Date Range Filter */}
                                <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-lg">
                                    <FaCalendarAlt className="text-gray-500 ml-2" />
                                    <select
                                        className="bg-transparent p-2 focus:outline-none"
                                        value={selectedDateRange}
                                        onChange={(e) => setSelectedDateRange(e.target.value)}
                                    >
                                        <option value="all">All Time</option>
                                        <option value="today">Today</option>
                                        <option value="week">Last 7 Days</option>
                                        <option value="month">Last 30 Days</option>
                                    </select>
                                </div>

                                {/* Transaction Type Filter */}
                                <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-lg">
                                    <FaExchangeAlt className="text-gray-500 ml-2" />
                                    <select
                                        className="bg-transparent p-2 focus:outline-none"
                                        value={filterType}
                                        onChange={(e) => setFilterType(e.target.value)}
                                    >
                                        <option value="all">All Transactions</option>
                                        <option value="in">Stock In Only</option>
                                        <option value="out">Stock Out Only</option>
                                    </select>
                                </div>

                                {/* Sort Order */}
                                <button
                                    onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
                                    className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg font-medium flex items-center gap-2 transition-colors"
                                >
                                    {sortOrder === "desc" ? <FaSortAmountDown /> : <FaSortAmountUp />}
                                    Sort {sortOrder === "desc" ? "Newest First" : "Oldest First"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* MAIN CONTENT */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {/* LOADING STATE */}
                    {isLoading && (
                        <div className="text-center py-16">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                            <p className="text-gray-500">Loading transaction history...</p>
                        </div>
                    )}

                    {/* EMPTY STATE */}
                    {isSuccess && filteredLedger.length === 0 && (
                        <div className="text-center py-16 border-t">
                            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                <FaBoxOpen size={28} className="text-gray-400" />
                            </div>
                            <h3 className="text-gray-500 font-medium mb-2">No transactions found</h3>
                            <p className="text-gray-400">No stock history available for this item</p>
                        </div>
                    )}

                    {/* LEDGER TABLE */}
                    {isSuccess && filteredLedger.length > 0 && (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="p-4 text-left font-semibold text-gray-700">Date & Time</th>
                                            <th className="p-4 text-left font-semibold text-gray-700">Transaction Type</th>
                                            <th className="p-4 text-left font-semibold text-gray-700">Quantity In</th>
                                            <th className="p-4 text-left font-semibold text-gray-700">Quantity Out</th>
                                            <th className="p-4 text-left font-semibold text-gray-700">Balance</th>
                                            <th className="p-4 text-left font-semibold text-gray-700">Remarks</th>
                                            <th className="p-4 text-left font-semibold text-gray-700">Project</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredLedger.map((entry, index) => (
                                            <tr
                                                key={index}
                                                className="border-b hover:bg-blue-50 transition-colors"
                                            >
                                                <td className="p-4">
                                                    <div className="text-gray-700 font-medium">
                                                        {formatDate(entry.createdAt)}
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    {getTransactionTypeBadge(
                                                        entry.transactionType,
                                                        entry.qtyIn,
                                                        entry.qtyOut
                                                    )}
                                                </td>
                                                <td className="p-4">
                                                    {entry.qtyIn > 0 ? (
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-green-600 font-bold text-lg">
                                                                +{entry.qtyIn}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-400">-</span>
                                                    )}
                                                </td>
                                                <td className="p-4">
                                                    {entry.qtyOut > 0 ? (
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-red-600 font-bold text-lg">
                                                                -{entry.qtyOut}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-400">-</span>
                                                    )}
                                                </td>
                                                <td className="p-4">
                                                    <div className="text-blue-600 font-bold text-lg">
                                                        {entry.balanceQty}
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="max-w-xs">
                                                        <p className="text-gray-700 line-clamp-2">
                                                            {entry.remarks || "No remarks"}
                                                        </p>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="bg-gray-100 px-3 py-1.5 rounded-lg inline-block">
                                                        <span className="text-gray-800 font-medium">
                                                            {entry.projectId?.projectName || "N/A"}
                                                        </span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* TABLE FOOTER */}
                            <div className="bg-gray-50 px-6 py-4 border-t">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="text-gray-600">
                                        Showing <span className="font-semibold">{filteredLedger.length}</span> of{" "}
                                        <span className="font-semibold">{ledgerData?.length || 0}</span> transactions
                                    </div>
                                    <div className="text-gray-600">
                                        Filtered by:{" "}
                                        <span className="font-semibold">
                                            {filterType === "all" ? "All Types" :
                                                filterType === "in" ? "Stock In" : "Stock Out"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* TRANSACTION SUMMARY */}
                {isSuccess && filteredLedger.length > 0 && stats && (
                    <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5">
                        <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center gap-2">
                            <IoPieChart /> Transaction Summary
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-white p-4 rounded-lg border border-blue-100">
                                <p className="text-sm text-gray-600 mb-1">Net Flow</p>
                                <p className={`text-xl font-bold ${stats.totalIn - stats.totalOut >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {stats.totalIn - stats.totalOut >= 0 ? '+' : ''}{stats.totalIn - stats.totalOut}
                                </p>
                            </div>
                            <div className="bg-white p-4 rounded-lg border border-blue-100">
                                <p className="text-sm text-gray-600 mb-1">Avg. Transaction</p>
                                <p className="text-xl font-bold text-blue-600">
                                    {stats.avgPerTransaction.toFixed(1)}
                                </p>
                            </div>
                            <div className="bg-white p-4 rounded-lg border border-blue-100">
                                <p className="text-sm text-gray-600 mb-1">Time Period</p>
                                <p className="text-xl font-bold text-purple-600">
                                    {selectedDateRange === "all" ? "All Time" :
                                        selectedDateRange === "today" ? "Today" :
                                            selectedDateRange === "week" ? "Last 7 Days" : "Last 30 Days"}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}