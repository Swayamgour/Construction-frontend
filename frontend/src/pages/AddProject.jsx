import React from "react";
import { FiEdit, FiCheckSquare, FiTag, FiMapPin, FiSettings, FiFileText, FiLayers } from "react-icons/fi";

const AddProject = () => {
  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Header */}
     

      {/* Organization Overview */}
      <div className="bg-white p-6 rounded-xl shadow-md mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gray-200 flex items-center justify-center rounded-lg text-gray-500">
              No Image
            </div>
            <div>
              <h2 className="font-semibold text-lg">Powerplay Demo Org 1</h2>
              <p className="text-gray-500 text-sm">PAN: ABGFR8849D</p>
              <p className="text-gray-500 text-sm">TAN: -</p>
              <p className="text-gray-500 text-sm">Contact Email: karthick@getpowerplay.in</p>
            </div>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            <FiEdit /> Edit
          </button>
        </div>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-3 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl shadow hover:shadow-lg cursor-pointer flex items-center gap-2">
          <FiCheckSquare className="text-blue-600 text-xl" />
          <span>Checklist</span>
        </div>
        <div className="bg-white p-4 rounded-xl shadow hover:shadow-lg cursor-pointer flex items-center gap-2">
          <FiTag className="text-green-600 text-xl" />
          <span>Work Categories</span>
        </div>
        <div className="bg-white p-4 rounded-xl shadow hover:shadow-lg cursor-pointer flex items-center gap-2">
          <FiMapPin className="text-red-600 text-xl" />
          <span>Address Details</span>
        </div>
        <div className="bg-white p-4 rounded-xl shadow hover:shadow-lg cursor-pointer flex items-center gap-2">
          <FiSettings className="text-purple-600 text-xl" />
          <span>Approval Settings</span>
        </div>
        <div className="bg-white p-4 rounded-xl shadow hover:shadow-lg cursor-pointer flex items-center gap-2">
          <FiFileText className="text-yellow-600 text-xl" />
          <span>Auto DPR</span>
        </div>
        <div className="bg-white p-4 rounded-xl shadow hover:shadow-lg cursor-pointer flex items-center gap-2">
          <FiLayers className="text-indigo-600 text-xl" />
          <span>Material Categories</span>
        </div>
      </div>
    </div>
  );
};

export default AddProject;
