import React from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Receipt, PackageSearch, Loader2, AlertTriangle } from "lucide-react";
import { useGetProjectTransactionsQuery } from "../../../src/Reduxe/Api";

const TYPE_STYLES = {
  IN: "bg-emerald-50 text-emerald-700",
  OUT: "bg-red-50 text-red-700",
  TRANSFER: "bg-blue-50 text-blue-700",
};

const TransactionsPage = () => {
  const { projectId } = useParams();
  const { data: txns = [], isLoading, isError } = useGetProjectTransactionsQuery(projectId);

  return (
    <div className="space-y-5 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-600 flex items-center justify-center text-white shadow-md shadow-indigo-900/20">
            <Receipt size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Transactions</h2>
            <p className="text-sm text-gray-500">
              Project ID: <span className="font-mono">{projectId}</span>
            </p>
          </div>
        </div>
        <Link
          to={`/stock/project/${projectId}`}
          className="flex items-center gap-2 px-4 py-2.5 text-sm rounded-xl bg-gray-900 text-white hover:bg-gray-800 transition-colors w-fit"
        >
          <ArrowLeft size={14} /> Back to Stock
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm shadow-gray-200/60 border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/70">
          <span className="font-semibold text-sm text-gray-700 flex items-center gap-2">
            <PackageSearch size={15} /> Stock Movements
          </span>
        </div>

        {isLoading && (
          <div className="flex flex-col items-center justify-center gap-3 py-14 text-gray-500">
            <Loader2 className="animate-spin" size={20} />
            <p className="text-sm">Loading transactions...</p>
          </div>
        )}
        {isError && (
          <div className="flex flex-col items-center justify-center gap-2 py-14 text-red-500">
            <AlertTriangle size={20} />
            <p className="text-sm">Error loading transactions.</p>
          </div>
        )}

        {!isLoading && txns.length === 0 && (
          <div className="text-center py-14">
            <PackageSearch className="mx-auto text-gray-300 mb-3" size={28} />
            <p className="text-sm text-gray-500">No transactions found.</p>
          </div>
        )}

        {!isLoading && txns.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-50/70 text-gray-500 text-xs uppercase tracking-wide">
                  <th className="text-left px-4 py-3 font-semibold">Date</th>
                  <th className="text-left px-4 py-3 font-semibold">Type</th>
                  <th className="text-left px-4 py-3 font-semibold">Item</th>
                  <th className="text-right px-4 py-3 font-semibold">Qty</th>
                  <th className="text-left px-4 py-3 font-semibold">From</th>
                  <th className="text-left px-4 py-3 font-semibold">To</th>
                  <th className="text-left px-4 py-3 font-semibold">Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {txns.map((t) => (
                  <tr key={t._id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-4 py-3 text-gray-600">{new Date(t.createdAt).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${TYPE_STYLES[t.type] || "bg-gray-100 text-gray-600"}`}>
                        {t.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{t?.itemId?.name || "—"}</td>
                    <td className="px-4 py-3 text-right font-mono text-gray-700">
                      {t.qty} {t.unit}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {t.fromProject?.projectName || t.projectId?.projectName || "—"}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">{t.toProject?.projectName || "—"}</td>
                    <td className="px-4 py-3 text-xs max-w-xs text-gray-500">{t.reason || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionsPage;
