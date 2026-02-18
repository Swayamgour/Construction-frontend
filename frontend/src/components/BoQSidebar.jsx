import React from "react";
import Drawer from "../helper/Drawer";

const BoQSidebar = ({ isOpen, onClose }) => {
  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Upload Project BOQ"
      widthClass="w-full md:w-2/5 lg:w-1/3"
    >
      <div className="min-h-screen  font-sans">
        <div className="space-y-8">
          {/* Header */}
       

          <div className="flex flex-col gap-8">
            {/* Left Column - Upload Section */}
            <div className="space-y-6">
              {/* Upload Box */}
              <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
                <div className="mb-4">
                  <svg
                    className="w-12 h-12 text-gray-400 mx-auto"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                </div>
                <p className="text-gray-600 font-medium mb-2">
                  Drag and drop the filled sample sheet
                </p>
                <p className="text-gray-500 text-sm mb-4">
                  ...xls or ..xlsx format
                </p>
                <button className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors">
                  Choose from system
                </button>
              </div>

              {/* Sample Sheet Section */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Start with Sample Sheet
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  Fill the template with your BOQ details
                </p>
                <button className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-md text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors">
                  Download sample
                </button>
              </div>
            </div>

            {/* Right Column - Sample Template */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  BoQSample_Template : Sample Filled
                </h3>
                <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">
                  Sample Filled
                </span>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm border border-gray-200">
                  <thead className="">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-200">
                        BoQ Item Code*
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-200">
                        BoQ Section*
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-200">
                        Level 1
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-4 py-3 border border-gray-200 font-medium">
                        A
                      </td>
                      <td className="px-4 py-3 border border-gray-200">
                        Civil & Interior
                      </td>
                      <td className="px-4 py-3 border border-gray-200"></td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 border border-gray-200 font-medium">
                        1
                      </td>
                      <td className="px-4 py-3 border border-gray-200">
                        FINISHING WORK
                      </td>
                      <td className="px-4 py-3 border border-gray-200"></td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 border border-gray-200 font-medium">
                        1.01
                      </td>
                      <td className="px-4 py-3 border border-gray-200"></td>
                      <td className="px-4 py-3 border border-gray-200 text-gray-600">
                        Providing and applying white cement b. and manufacturer,
                        over the plastered w. complete.
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 border border-gray-200 font-medium">
                        1.02
                      </td>
                      <td className="px-4 py-3 border border-gray-200"></td>
                      <td className="px-4 py-3 border border-gray-200 text-gray-600">
                        P.O.P. Punning.-Providing and applying 6-10 mm thk. P.
                        channtering of corners, angles, junction give a smooth
                        surface in true line and h. per the direction of
                        Architect Engineer.
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 border border-gray-200 font-medium">
                        1.03
                      </td>
                      <td className="px-4 py-3 border border-gray-200"></td>
                      <td className="px-4 py-3 border border-gray-200 text-gray-600">
                        Enrichbox under with undue woodline icon
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mt-4 text-xs text-gray-500">
                * Required fields
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
            <button className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors">
              Upload BOQ
            </button>
          </div>
        </div>
      </div>
    </Drawer>
  );
};

export default BoQSidebar;
