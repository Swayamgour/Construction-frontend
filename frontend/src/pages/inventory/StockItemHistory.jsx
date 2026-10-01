import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, History, PackageX, Loader2, AlertTriangle, Inbox } from "lucide-react";
import { useGetAllItemsQuery, useGetItemHistoryQuery } from "../../Reduxe/Api";

const StockItemHistory = () => {
  const { projectId, itemName } = useParams();
  const navigate = useNavigate();

  const { data: itemsResp } = useGetAllItemsQuery();
  const items = itemsResp?.data || itemsResp || [];
  const matchedItem = items.find(
    (it) => it.name?.toLowerCase() === decodeURIComponent(itemName || "").toLowerCase()
  );

  const { data, isLoading, error } = useGetItemHistoryQuery(
    { itemId: matchedItem?._id, projectId },
    { skip: !matchedItem?._id || !projectId }
  );

  const history = data?.history || [];

  return (
    <div className="p-4 sm:p-6 min-h-screen bg-gray-50">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-5 transition-colors"
      >
        <ArrowLeft size={16} /> Back
      </button>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-600 flex items-center justify-center text-white shadow-md shadow-indigo-900/20">
            <History size={20} />
          </div>
          <h2 className="text-xl font-bold text-gray-800">
            Item History — <span className="text-indigo-600">{itemName}</span>
          </h2>
        </div>
        <p className="text-gray-500 text-sm">
          Project ID: <span className="text-gray-700 font-mono">{projectId}</span>
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm shadow-gray-200/60 border border-gray-100 overflow-hidden">
        {!matchedItem ? (
          <div className="text-center py-14">
            <PackageX className="mx-auto text-gray-300 mb-3" size={28} />
            <p className="text-gray-500 text-sm">Could not find this item in the catalog.</p>
          </div>
        ) : isLoading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-14 text-gray-500">
            <Loader2 className="animate-spin" size={20} />
            <p className="text-sm">Loading history...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center gap-2 py-14 text-red-500">
            <AlertTriangle size={20} />
            <p className="text-sm">Error loading history.</p>
          </div>
        ) : history.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead className="bg-gray-50/70">
                <tr className="text-gray-500 text-xs uppercase tracking-wide">
                  <th className="px-4 py-3 text-left font-semibold">Date</th>
                  <th className="px-4 py-3 text-center font-semibold">Type</th>
                  <th className="px-4 py-3 text-center font-semibold">Qty In</th>
                  <th className="px-4 py-3 text-center font-semibold">Qty Out</th>
                  <th className="px-4 py-3 text-center font-semibold">Balance</th>
                  <th className="px-4 py-3 text-left font-semibold">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {history.map((row, idx) => (
                  <tr key={row._id || idx} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-4 py-3 text-left whitespace-nowrap text-gray-600">
                      {new Date(row.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          row.qtyIn > 0 ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
                        }`}
                      >
                        {row.transactionType}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-gray-700">{row.qtyIn || "-"}</td>
                    <td className="px-4 py-3 text-center text-gray-700">{row.qtyOut || "-"}</td>
                    <td className="px-4 py-3 text-center font-semibold text-gray-800">{row.balanceQty}</td>
                    <td className="px-4 py-3 text-left text-gray-500">{row.remarks || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-14">
            <Inbox className="mx-auto text-gray-300 mb-3" size={28} />
            <p className="text-gray-500 text-sm">No history found for this item.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StockItemHistory;
