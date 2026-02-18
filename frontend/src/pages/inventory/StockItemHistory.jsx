import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import { useGetHistoryOfStockItemQuery } from "../../Reduxe/Api";

const StockItemHistory = () => {
  const { projectId, itemName } = useParams();
  const navigate = useNavigate();

  // Fetch item history
  const { data, isLoading, error } = useGetHistoryOfStockItemQuery(
    { projectId, itemName },
    { skip: !projectId || !itemName }
  );

  const history = data?.data || [];

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
      >
        <FiArrowLeft /> Back
      </button>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">
          Item History — <span className="text-blue-600">{itemName}</span>
        </h2>
        <p className="text-gray-500 text-sm">
          Project ID: <span className="text-gray-700">{projectId}</span>
        </p>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {isLoading ? (
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
                  <th className="px-4 py-3 text-center">Qty</th>
                  <th className="px-4 py-3 text-center">Unit</th>
                  <th className="px-4 py-3 text-center">Total (₹)</th>
                  <th className="px-4 py-3 text-left">Notes</th>
                </tr>
              </thead>
              <tbody>
                {history.map((row, idx) => (
                  <tr
                    key={idx}
                    className="border-t hover:bg-gray-50 transition duration-150"
                  >
                    <td className="px-4 py-3 text-left whitespace-nowrap">
                      {new Date(row.createdAt).toLocaleDateString()}
                    </td>
                    <td
                      className={`px-4 py-3 text-center font-medium ${
                        row.entryType === "IN"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {row.entryType}
                    </td>
                    <td className="px-4 py-3 text-center">{row.qty}</td>
                    <td className="px-4 py-3 text-center">{row.unit}</td>
                    <td className="px-4 py-3 text-center font-semibold text-gray-700">
                      ₹{row.totalAmount}
                    </td>
                    <td className="px-4 py-3 text-left text-gray-600">
                      {row.notes || "-"}
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
