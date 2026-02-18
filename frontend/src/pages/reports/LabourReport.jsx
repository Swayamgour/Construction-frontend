import React from "react";
import ReportTable from "../../components/ReportTable";
import { useGetLabourReportQuery } from "../../Reduxe/Api";
// import { useGetLabourReportQuery } from "./reportApi";

const LabourReport = () => {
  const { data, isLoading } = useGetLabourReportQuery();

  const columns = [
    { header: "Labour Name", render: (row) => row.labourId?.name },
    { header: "Type", render: (row) => row.labourId?.labourType },
    { header: "Project", render: (row) => row.projectId?.projectName },
    { header: "Rate/Day", render: (row) => `₹${row.labourId?.ratePerDay}` },
    { header: "Worked Days", accessor: "days" },
    { header: "Total Cost", render: (row) => `₹${row.days * row.labourId?.ratePerDay}` },
  ];

  if (isLoading) return <p className="text-center p-4">Loading...</p>;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-3">Labour Cost Report</h2>
      <ReportTable columns={columns} data={data?.data} />
    </div>
  );
};

export default LabourReport;
