import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import { useGetAllItemsQuery, useGetItemHistoryQuery } from "../../Reduxe/Api";

/**
 * CORRECTED: useGetHistoryOfStockItemQuery ("stock/item/:projectId/:itemName")
 * had no matching backend route. The real item-history endpoint is
 * GET /api/grn/history/:itemId/:projectId (StockLedger entries), which
 * needs an itemId — this page's route only carries an itemName, so we
 * resolve the id via the Item catalog first, then fetch the ledger.
 */
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
    <div className="p-6 min-h-screen bg-gray-50">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
      >
        <FiArrowLeft /> Back
      </button>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">
          Item History — <span className="text-blue-600">{itemName}</span>
        </h2>
        <p className="text-gray-500 text-sm">
          Project ID: <span className="text-gray-700">{projectId}</span>
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {!matchedItem ? (
          <p className="text-center text-gray-500 py-10">
            Could not find this item in the catalog.
          </p>
        ) : isLoading ? (
          <p className="text-center text-gray-500 py-10">Loading...</p>
        ) : error ? (
          <p className="text-center text-red-500 py-10">
            Error loading history.
          </p>
        ) : history.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-gray-100">
                <tr className="text-gray-700 text-sm uppercase">
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-center">Type</th>
                  <th className="px-4 py-3 text-center">Qty In</th>
                  <th className="px-4 py-3 text-center">Qty Out</th>
                  <th className="px-4 py-3 text-center">Balance</th>
                  <th className="px-4 py-3 text-left">Remarks</th>
                </tr>
              </thead>
              <tbody>
                {history.map((row, idx) => (
                  <tr
                    key={row._id || idx}
                    className="border-t hover:bg-gray-50 transition duration-150"
                  >
                    <td className="px-4 py-3 text-left whitespace-nowrap">
                      {new Date(row.createdAt).toLocaleDateString()}
                    </td>
                    <td
                      className={`px-4 py-3 text-center font-medium ${
                        row.qtyIn > 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {row.transactionType}
                    </td>
                    <td className="px-4 py-3 text-center">{row.qtyIn || "-"}</td>
                    <td className="px-4 py-3 text-center">{row.qtyOut || "-"}</td>
                    <td className="px-4 py-3 text-center font-semibold text-gray-700">
                      {row.balanceQty}
                    </td>
                    <td className="px-4 py-3 text-left text-gray-600">
                      {row.remarks || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-gray-500 py-10">
            No history found for this item.
          </p>
        )}
      </div>
    </div>
  );
};

export default StockItemHistory;
