import React, { useState } from "react";
import LabourReport from "./LabourReport";
import MachineReport from "./MachineReport";
import ProjectReport from "./ProjectReport";

// import MachineReport from './MachineReport'

const ReportsDashboard = () => {
  const [active, setActive] = useState("labour");

  const renderTab = () => {
    switch (active) {
      case "machine": return <MachineReport />;
      case "project": return <ProjectReport />;
      default: return <LabourReport />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex gap-4">
        {["labour", "machine", "project"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActive(tab)}
            className={`px-4 py-2 rounded-md font-medium transition ${
              active === tab ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
          >
            {tab.toUpperCase()}
          </button>
        ))}
      </div>

      <div>{renderTab()}</div>
    </div>
  );
};

export default ReportsDashboard;
