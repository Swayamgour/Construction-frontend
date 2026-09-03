import React from "react";
import { History } from "lucide-react";
import { useGetModuleAuditHistoryQuery } from "../Reduxe/Api";

/**
 * NEW REUSABLE COMPONENT — surfaces GET /api/audit/:module/:entityId, which
 * had zero frontend before this. Drop it into any detail view:
 *   <AuditHistory module="PurchaseOrder" entityId={po._id} />
 * `module` must match the string the backend logs under (see logAudit calls
 * in each controller — e.g. "PurchaseOrder", "StockTransfer", "EODReport").
 */
export default function AuditHistory({ module, entityId }) {
    const { data, isLoading } = useGetModuleAuditHistoryQuery(
        { module, entityId },
        { skip: !module || !entityId }
    );
    const history = data?.data || [];

    if (!module || !entityId) return null;

    return (
        <div className="mt-4">
            <p className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-1.5 mb-2">
                <History size={13} /> History
            </p>
            {isLoading && <p className="text-xs text-gray-400">Loading history…</p>}
            {!isLoading && history.length === 0 && (
                <p className="text-xs text-gray-400">No history recorded yet.</p>
            )}
            <div className="space-y-2">
                {history.map((h) => (
                    <div key={h._id} className="text-xs bg-gray-50 rounded-lg px-3 py-2 flex justify-between items-start gap-2">
                        <div>
                            <span className="font-medium text-slate-700 capitalize">{h.action}</span>
                            <span className="text-gray-500"> by {h.performedBy?.name || "someone"} ({h.performedBy?.role || "-"})</span>
                            {h.remarks && <p className="text-gray-500 mt-0.5">{h.remarks}</p>}
                        </div>
                        <span className="text-gray-400 whitespace-nowrap">
                            {h.createdAt ? new Date(h.createdAt).toLocaleString() : ""}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
