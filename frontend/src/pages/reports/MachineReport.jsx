import React from "react";
import ReportTable from "../../components/ReportTable";
import { useGetMaintenanceListQuery } from "../../Reduxe/Api";
// import { useGetMaintenanceListQuery } from "./maintenanceApi";

const MaintenanceReport = () => {
    const { data, isLoading } = useGetMaintenanceListQuery();

    const columns = [
        { header: "Machine", render: (row) => row.machineId?.machineName },
        { header: "Total Cost", render: (row) => `₹${row.cost}` },
        { header: "Technician", accessor: "technician" },
        { header: "Date", accessor: "date" },
    ];

    if (isLoading) return <p className="text-center p-4">Loading...</p>;

    const totalCost = data?.data?.reduce((acc, item) => acc + item.cost, 0);

    return (
        <div className="p-6 space-y-8">
            <h2 className="text-xl font-semibold">Maintenance Report</h2>

            <div className="p-4 bg-green-100 border rounded-lg font-medium">
                Total Maintenance Cost: <span className="text-green-700 font-bold">₹{totalCost}</span>
            </div>

            <ReportTable columns={columns} data={data?.data} />
        </div>
    );
};

export default MaintenanceReport;
