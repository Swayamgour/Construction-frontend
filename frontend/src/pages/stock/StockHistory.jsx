import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGetItemLedgerQuery } from "../../Reduxe/Api";
import {
  History,
  ArrowLeft,
  Filter,
  Download,
  ArrowDownWideNarrow,
  ArrowUpWideNarrow,
  CalendarDays,
  PackageOpen,
  ArrowLeftRight,
  Warehouse,
  ArrowDownCircle,
  ArrowUpCircle,
  PieChart,
  Printer,
  RefreshCw,
} from "lucide-react";

export default function StockHistory() {
  const { projectId, itemId } = useParams();
  const navigate = useNavigate();

  const { data: ledgerData, isLoading, isSuccess, error, refetch } = useGetItemLedgerQuery({ projectId, itemId });

  const [filterType, setFilterType] = useState("all");
  const [sortOrder, setSortOrder] = useState("desc");
  const [selectedDateRange, setSelectedDateRange] = useState("all");

  const filteredLedger = React.useMemo(() => {
    if (!ledgerData) return [];

    let data = [...ledgerData];

    if (filterType === "in") {
      data = data.filter((entry) => entry.qtyIn > 0);
    } else if (filterType === "out") {
      data = data.filter((entry) => entry.qtyOut > 0);
    }

    const now = new Date();
    if (selectedDateRange === "today") {
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      data = data.filter((entry) => new Date(entry.createdAt) >= today);
    } else if (selectedDateRange === "week") {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      data = data.filter((entry) => new Date(entry.createdAt) >= weekAgo);
    } else if (selectedDateRange === "month") {
      const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      data = data.filter((entry) => new Date(entry.createdAt) >= monthAgo);
    }

    data.sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });

    return data;
  }, [ledgerData, filterType, sortOrder, selectedDateRange]);

  const stats = React.useMemo(() => {
    if (!Array.isArray(ledgerData) || ledgerData.length === 0) {
      return { totalIn: 0, totalOut: 0, currentBalance: 0, totalTransactions: 0, avgPerTransaction: 0 };
    }

    let totalIn = 0;
    let totalOut = 0;

    ledgerData.forEach((entry) => {
      totalIn += entry.qtyIn || 0;
      totalOut += entry.qtyOut || 0;
    });

    const currentBalance = totalIn - totalOut;

    return {
      totalIn,
      totalOut,
      currentBalance,
      totalTransactions: ledgerData.length,
      avgPerTransaction: (totalIn + totalOut) / ledgerData.length,
    };
  }, [ledgerData]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  const getTransactionTypeBadge = (type, qtyIn, qtyOut) => {
    if (qtyIn > 0) {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">
          <ArrowDownCircle size={12} /> Stock In
        </span>
      );
    } else if (qtyOut > 0) {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-50 text-red-700 text-xs font-semibold">
          <ArrowUpCircle size={12} /> Stock Out
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
        <ArrowLeftRight size={12} /> Adjustment
      </span>
    );
  };

  const handlePrint = () => window.print();

  const toCsvValue = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;

  const handleDownload = () => {
    const header = ["Date", "Type", "Qty In", "Qty Out", "Balance", "Remarks", "Project"];
    const rows = filteredLedger.map((e) => [
      formatDate(e.createdAt),
      e.qtyIn > 0 ? "Stock In" : e.qtyOut > 0 ? "Stock Out" : "Adjustment",
      e.qtyIn || 0,
      e.qtyOut || 0,
      e.balanceQty,
      e.remarks || "",
      e.projectId?.projectName || "",
    ]);
    const csv = [header, ...rows].map((r) => r.map(toCsvValue).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `stock-history-${itemId}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
            <History className="text-4xl text-red-500 mx-auto mb-4" size={40} />
            <h2 className="text-2xl font-bold text-red-700 mb-2">Failed to Load History</h2>
            <p className="text-red-600 mb-6">Unable to fetch stock ledger data</p>
            <button onClick={refetch} className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors">
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50/40 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2.5 bg-white rounded-xl shadow-sm hover:bg-gray-50 transition-colors border border-gray-200"
              >
                <ArrowLeft className="text-gray-600" size={18} />
              </button>

              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-indigo-600 to-blue-600 text-white p-3.5 rounded-2xl shadow-lg shadow-indigo-900/25">
                  <History size={24} />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Stock Transaction History</h1>
                  <p className="text-gray-500 mt-1">
                    Item ID: <span className="font-mono text-indigo-600">{itemId}</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={refetch}
                className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium flex items-center gap-2 transition-colors"
              >
                <RefreshCw size={15} /> Refresh
              </button>
              <button
                onClick={handleDownload}
                className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-xl font-medium flex items-center gap-2 shadow-lg shadow-indigo-900/20 transition-all"
              >
                <Download size={15} /> Export
              </button>
              <button
                onClick={handlePrint}
                className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-xl font-medium flex items-center gap-2 shadow-lg shadow-emerald-900/20 transition-all"
              >
                <Printer size={15} /> Print
              </button>
            </div>
          </div>

          {/* STATISTICS CARDS */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100 rounded-2xl p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Current Balance</p>
                    <p className="text-2xl font-bold text-indigo-600">{stats.currentBalance}</p>
                  </div>
                  <div className="p-3 bg-indigo-500 text-white rounded-xl">
                    <Warehouse size={20} />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 border border-emerald-200 rounded-2xl p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Total Stock In</p>
                    <p className="text-2xl font-bold text-emerald-600">{stats.totalIn}</p>
                  </div>
                  <div className="p-3 bg-emerald-500 text-white rounded-xl">
                    <ArrowDownCircle size={20} />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-2xl p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Total Stock Out</p>
                    <p className="text-2xl font-bold text-red-600">{stats.totalOut}</p>
                  </div>
                  <div className="p-3 bg-red-500 text-white rounded-xl">
                    <ArrowUpCircle size={20} />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-2xl p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Total Transactions</p>
                    <p className="text-2xl font-bold text-purple-600">{stats.totalTransactions}</p>
                  </div>
                  <div className="p-3 bg-purple-500 text-white rounded-xl">
                    <PieChart size={20} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* FILTERS AND CONTROLS */}
          <div className="bg-white rounded-2xl shadow-sm shadow-gray-200/60 border border-gray-100 p-5 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Filter className="text-indigo-600" size={16} />
                <h3 className="font-semibold text-gray-700">Filter & Sort</h3>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 px-2 rounded-xl">
                  <CalendarDays className="text-gray-400" size={15} />
                  <select
                    className="bg-transparent p-2 focus:outline-none text-sm"
                    value={selectedDateRange}
                    onChange={(e) => setSelectedDateRange(e.target.value)}
                  >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">Last 7 Days</option>
                    <option value="month">Last 30 Days</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 px-2 rounded-xl">
                  <ArrowLeftRight className="text-gray-400" size={15} />
                  <select
                    className="bg-transparent p-2 focus:outline-none text-sm"
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                  >
                    <option value="all">All Transactions</option>
                    <option value="in">Stock In Only</option>
                    <option value="out">Stock Out Only</option>
                  </select>
                </div>

                <button
                  onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
                  className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl font-medium flex items-center gap-2 transition-colors text-sm"
                >
                  {sortOrder === "desc" ? <ArrowDownWideNarrow size={15} /> : <ArrowUpWideNarrow size={15} />}
                  Sort {sortOrder === "desc" ? "Newest First" : "Oldest First"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="bg-white rounded-2xl shadow-sm shadow-gray-200/60 border border-gray-100 overflow-hidden">
          {isLoading && (
            <div className="text-center py-16">
              <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-indigo-500 border-t-transparent mb-4"></div>
              <p className="text-gray-500">Loading transaction history...</p>
            </div>
          )}

          {isSuccess && filteredLedger.length === 0 && (
            <div className="text-center py-16 border-t border-gray-100">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <PackageOpen size={26} className="text-gray-400" />
              </div>
              <h3 className="text-gray-500 font-medium mb-1">No transactions found</h3>
              <p className="text-gray-400 text-sm">No stock history available for this item</p>
            </div>
          )}

          {isSuccess && filteredLedger.length > 0 && (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50/70 text-gray-500 text-xs uppercase tracking-wide">
                    <tr>
                      <th className="p-4 text-left font-semibold">Date & Time</th>
                      <th className="p-4 text-left font-semibold">Transaction Type</th>
                      <th className="p-4 text-left font-semibold">Quantity In</th>
                      <th className="p-4 text-left font-semibold">Quantity Out</th>
                      <th className="p-4 text-left font-semibold">Balance</th>
                      <th className="p-4 text-left font-semibold">Remarks</th>
                      <th className="p-4 text-left font-semibold">Project</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredLedger.map((entry, index) => (
                      <tr key={index} className="hover:bg-indigo-50/30 transition-colors">
                        <td className="p-4 text-gray-700 font-medium">{formatDate(entry.createdAt)}</td>
                        <td className="p-4">{getTransactionTypeBadge(entry.transactionType, entry.qtyIn, entry.qtyOut)}</td>
                        <td className="p-4">
                          {entry.qtyIn > 0 ? (
                            <span className="text-emerald-600 font-bold">+{entry.qtyIn}</span>
                          ) : (
                            <span className="text-gray-300">-</span>
                          )}
                        </td>
                        <td className="p-4">
                          {entry.qtyOut > 0 ? (
                            <span className="text-red-600 font-bold">-{entry.qtyOut}</span>
                          ) : (
                            <span className="text-gray-300">-</span>
                          )}
                        </td>
                        <td className="p-4">
                          <span className="text-indigo-600 font-bold">{entry.balanceQty}</span>
                        </td>
                        <td className="p-4 max-w-xs">
                          <p className="text-gray-600 line-clamp-2">{entry.remarks || "No remarks"}</p>
                        </td>
                        <td className="p-4">
                          <span className="bg-gray-100 px-3 py-1.5 rounded-lg inline-block text-gray-700 font-medium text-xs">
                            {entry.projectId?.projectName || "N/A"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="bg-gray-50/70 px-6 py-4 border-t border-gray-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm">
                  <div className="text-gray-600">
                    Showing <span className="font-semibold">{filteredLedger.length}</span> of{" "}
                    <span className="font-semibold">{ledgerData?.length || 0}</span> transactions
                  </div>
                  <div className="text-gray-600">
                    Filtered by:{" "}
                    <span className="font-semibold">
                      {filterType === "all" ? "All Types" : filterType === "in" ? "Stock In" : "Stock Out"}
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* TRANSACTION SUMMARY */}
        {isSuccess && filteredLedger.length > 0 && stats && (
          <div className="mt-6 bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100 rounded-2xl p-5">
            <h3 className="text-lg font-semibold text-indigo-800 mb-4 flex items-center gap-2">
              <PieChart size={18} /> Transaction Summary
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-xl border border-indigo-100">
                <p className="text-sm text-gray-500 mb-1">Net Flow</p>
                <p className={`text-xl font-bold ${stats.totalIn - stats.totalOut >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                  {stats.totalIn - stats.totalOut >= 0 ? "+" : ""}
                  {stats.totalIn - stats.totalOut}
                </p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-indigo-100">
                <p className="text-sm text-gray-500 mb-1">Avg. Transaction</p>
                <p className="text-xl font-bold text-indigo-600">{stats.avgPerTransaction.toFixed(1)}</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-indigo-100">
                <p className="text-sm text-gray-500 mb-1">Time Period</p>
                <p className="text-xl font-bold text-purple-600">
                  {selectedDateRange === "all"
                    ? "All Time"
                    : selectedDateRange === "today"
                    ? "Today"
                    : selectedDateRange === "week"
                    ? "Last 7 Days"
                    : "Last 30 Days"}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
