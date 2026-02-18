import React from "react";
import ProgressBar from "./ProgressBar";

const WorkList = ({ works, onDelete, onUpdateProgress }) => {
  return (
    <div className="max-w-5xl mx-auto mt-8">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">All Projects</h2>

      <div className="grid md:grid-cols-2 gap-4">
        {works.map((w, i) => (
          <div key={i} className="bg-white p-5 shadow rounded-2xl space-y-2">
            <div className="flex justify-between">
              <h3 className="font-semibold text-lg">{w.name}</h3>
              <button
                onClick={() => onDelete(i)}
                className="text-red-600 hover:underline"
              >
                Delete
              </button>
            </div>
            <p className="text-gray-600 text-sm">{w.address}</p>
            <p className="text-sm text-gray-500">
              {w.startDate} → {w.endDate}
            </p>

            <div>
              <strong>Category:</strong> {w.category}
            </div>

            <div>
              <strong>Vendors:</strong> {w.assignedVendors.join(", ") || "None"}
            </div>

            <div>
              <strong>Materials:</strong>{" "}
              {w.assignedMaterials.join(", ") || "None"}
            </div>

            <div className="mt-3">
              <div className="flex justify-between mb-1 text-sm text-gray-700">
                <span>Progress</span>
                <span>{w.progress}%</span>
              </div>
              <ProgressBar progress={w.progress} />
              <input
                type="range"
                min="0"
                max="100"
                value={w.progress}
                onChange={(e) => onUpdateProgress(i, e.target.value)}
                className="w-full mt-2 accent-blue-600"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WorkList;
