import React, { useState } from "react";
import WorkForm from "../components/WorkForm";
import WorkList from "../components/WorkList";

const WorkManagement = ({ categories, vendors, materials }) => {
  const [works, setWorks] = useState([]);

  const handleAddWork = (newWork) => {
    setWorks([...works, newWork]);
  };

  const handleDeleteWork = (index) => {
    setWorks(works.filter((_, i) => i !== index));
  };

  const handleProgressChange = (index, newProgress) => {
    setWorks(
      works?.map((w, i) =>
        i === index ? { ...w, progress: parseInt(newProgress) } : w
      )
    );
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* <h1 className="text-3xl font-bold text-center text-blue-700 mb-6">
        🧱 Work Management
      </h1> */}

      {/* <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4"> */}
      {/* <h1 className="text-xl sm:text-2xl font-semibold bg-gradient-to-r from-slate-900 via-blue-800 to-purple-700 bg-clip-text text-transparent">
                    Your Vendors
                </h1> */}
      <h1 className="text-xl sm:text-2xl font-semibold bg-gradient-to-r from-slate-900 via-blue-800 to-purple-700 bg-clip-text text-transparent">
        Work Management
      </h1>

      <WorkForm
        categories={categories}
        vendors={vendors}
        materials={materials}
        onSubmit={handleAddWork}
      />
      <WorkList
        works={works}
        onDelete={handleDeleteWork}
        onUpdateProgress={handleProgressChange}
      />
    </div>
  );
};

export default WorkManagement;
