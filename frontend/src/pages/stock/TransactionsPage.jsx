import React from "react";
import { useParams, Link } from "react-router-dom";
import { useGetProjectTransactionsQuery } from "../../../src/Reduxe/Api";

const TransactionsPage = () => {
    const { projectId } = useParams();
    const { data: txns = [], isLoading, isError } =
        useGetProjectTransactionsQuery(projectId);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold mb-1">Transactions</h2>
                    <p className="text-sm text-slate-500">
                        Project ID: <span className="font-mono">{projectId}</span>
                    </p>
                </div>
                <Link
                    to={`/stock/project/${projectId}`}
                    className="px-3 py-2 text-sm rounded-lg bg-slate-900 text-white hover:bg-slate-800"
                >
                    Back to Stock
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow border border-slate-100">
                <div className="p-3 border-b border-slate-100 flex justify-between items-center">
                    <span className="font-medium text-sm">Stock Movements</span>
                </div>

                {isLoading && (
                    <div className="p-4 text-sm text-slate-500">
                        Loading transactions...
                    </div>
                )}
                {isError && (
                    <div className="p-4 text-sm text-red-500">
                        Error loading transactions.
                    </div>
                )}

                {!isLoading && txns.length === 0 && (
                    <div className="p-4 text-sm text-slate-500">
                        No transactions found.
                    </div>
                )}

                {!isLoading && txns.length > 0 && (
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr className="bg-slate-50 text-slate-600">
                                <th className="text-left px-4 py-2">Date</th>
                                <th className="text-left px-4 py-2">Type</th>
                                <th className="text-left px-4 py-2">Item</th>
                                <th className="text-right px-4 py-2">Qty</th>
                                <th className="text-left px-4 py-2">From</th>
                                <th className="text-left px-4 py-2">To</th>
                                <th className="text-left px-4 py-2">Reason</th>
                            </tr>
                        </thead>
                        <tbody>
                            {txns.map((t) => (
                                <tr key={t._id} className="border-t border-slate-100">
                                    <td className="px-4 py-2">
                                        {new Date(t.createdAt).toLocaleString()}
                                    </td>
                                    <td className="px-4 py-2 font-semibold">
                                        {t.type}
                                    </td>
                                    <td className="px-4 py-2">
                                        {t?.itemId?.name || "—"}
                                    </td>
                                    <td className="px-4 py-2 text-right font-mono">
                                        {t.qty} {t.unit}
                                    </td>
                                    <td className="px-4 py-2 text-xs">
                                        {t.fromProject?.projectName ||
                                            t.projectId?.projectName ||
                                            "—"}
                                    </td>
                                    <td className="px-4 py-2 text-xs">
                                        {t.toProject?.projectName || "—"}
                                    </td>
                                    <td className="px-4 py-2 text-xs max-w-xs">
                                        {t.reason || "—"}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default TransactionsPage;
