import { Link } from "react-router-dom";
import { AlertTriangle, Gauge } from "lucide-react";
import { useGetUpcomingMaintenanceQuery, useGetMeterBasedMaintenanceDueQuery } from "../../Reduxe/Api";

/**
 * NEW — surfaces both maintenance-due signals the backend computes:
 * date-based (nextMaintenanceDate within N days) and meter/hour-based
 * (derived from DailyUsage hoursRun since the last service). Neither had
 * any frontend before this.
 */
export default function MaintenanceDueBanner() {
    const { data: dateDue } = useGetUpcomingMaintenanceQuery(15);
    const { data: meterDue } = useGetMeterBasedMaintenanceDueQuery();

    const dateItems = dateDue?.data || [];
    const meterItems = meterDue?.data || [];

    if (dateItems.length === 0 && meterItems.length === 0) return null;

    return (
        <div className="mb-6 space-y-2">
            {dateItems.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-amber-800 font-semibold text-sm mb-2">
                        <AlertTriangle size={16} /> {dateItems.length} machine{dateItems.length > 1 ? "s" : ""} due for maintenance (by date)
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {dateItems.map((m) => (
                            <Link
                                key={m._id}
                                to={`/machine/${m.machineId?._id || m.machineId}`}
                                className="text-xs px-2.5 py-1 bg-white border border-amber-300 rounded-full text-amber-700 hover:bg-amber-100"
                            >
                                {m.machineId?.machineNumber || "Machine"} — due {m.nextMaintenanceDate ? new Date(m.nextMaintenanceDate).toLocaleDateString() : ""}
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {meterItems.length > 0 && (
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-orange-800 font-semibold text-sm mb-2">
                        <Gauge size={16} /> {meterItems.length} machine{meterItems.length > 1 ? "s" : ""} due for maintenance (by meter hours)
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {meterItems.map((m) => (
                            <Link
                                key={m.machineId}
                                to={`/machine/${m.machineId}`}
                                className={`text-xs px-2.5 py-1 bg-white border rounded-full hover:bg-orange-100 ${
                                    m.status === "Overdue" ? "border-red-300 text-red-700" : "border-orange-300 text-orange-700"
                                }`}
                            >
                                {m.machine?.machineNumber || "Machine"} — {m.status} ({m.estimatedCurrentMeter}/{m.nextServiceMeterReading} hrs)
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
