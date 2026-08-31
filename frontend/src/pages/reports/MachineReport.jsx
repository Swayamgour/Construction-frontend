import React from "react";
import ReportTable from "../../components/ReportTable";
// NOTE: this page is not currently routed in App.js. Fixed anyway so it
// does not break the build if it gets wired up later — the backend has no
// generic "all maintenance across machines" list, so this now uses the
// /api/reports/machinery summary endpoint instead.
import { useGetMachineryReportQuery } from "../../Reduxe/Api";

const MaintenanceReport = () => {
    const { data, isLoading } = useGetMachineryReportQuery();

    const columns = [
        { header: "Machine", render: (row) => row.machineId?.machineNumber || row.machineId?.machineType },
        { header: "Operator", render: (row) => row.operatorId?.name },
        { header: "Normal Hours", accessor: "normalHours" },
        { header: "Overtime Hours", accessor: "overtimeHours" },
        { header: "Date", render: (row) => new Date(row.date).toLocaleDateString() },
    ];

    if (isLoading) return <p className="text-center p-4">Loading...</p>;

    const totalCost = data?.data?.totalMaintenanceCost || 0;

    return (
        <div className="p-6 space-y-8">
            <h2 className="text-xl font-semibold">Maintenance Report</h2>

            <div className="p-4 bg-green-100 border rounded-lg font-medium">
                Total Maintenance Cost: <span className="text-green-700 font-bold">₹{totalCost}</span>
            </div>

            <ReportTable columns={columns} data={data?.data?.operatorLogs} />
        </div>
    );
};

export default MaintenanceReport;
