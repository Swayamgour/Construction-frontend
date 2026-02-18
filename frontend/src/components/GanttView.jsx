import React, { useState } from 'react';
import { FiCheckCircle, FiTrendingUp, FiAlertTriangle } from "react-icons/fi";

// --- Inline SVG Icons (Replacing react-icons for compatibility) ---
const SearchIcon = (props) => (<svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>);
const UploadIcon = (props) => (<svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>);
const DownloadIcon = (props) => (<svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0L8 12m4 4V4" /></svg>);
const ZoomInIcon = (props) => (<svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zm-7-3v4m0 0h4m-4 0H9" /></svg>);
const ZoomOutIcon = (props) => (<svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 12h4" /></svg>);
const CalendarIcon = (props) => (<svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-4 4V3m-5 9h10M5 12h14a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2z" /></svg>);
const ListIcon = (props) => (<svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>);
const GridIcon = (props) => (<svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7h16M4 11h16M4 15h16M4 19h16" /></svg>);
const ChartIcon = (props) => (<svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></svg>);

// Dummy data updated for better visualization colors
const DUMMY_DATA = [
  { id: 1, name: 'Excavation', progress: '100%', startDate: '30/09/2025', endDate: '06/10/2025', duration: '15 days', color: 'bg-green-500' },
  { id: 2, name: 'Foundation', progress: '30%', startDate: '01/10/2025', endDate: '24/10/2025', duration: '25 days', color: 'bg-indigo-500' },
  { id: 3, name: 'PCC', progress: '0%', startDate: '06/10/2025', endDate: '06/10/2025', duration: '1 days', color: 'bg-red-500' },
  { id: 4, name: 'RCC', progress: '0%', startDate: '07/10/2025', endDate: '24/10/2025', duration: '25 days', color: 'bg-yellow-500' },
  { id: 5, name: 'Site clearing', progress: '100%', startDate: '30/09/2025', endDate: '30/09/2025', duration: '1 days', color: 'bg-blue-500' }
];

const GanttView = ({ tasks }) => {
  const [zoomLevel, setZoomLevel] = useState(100);
  const [searchPlan, setSearchPlan] = useState('');

  const ganttData = DUMMY_DATA; // Use the rich dummy data

  // Helper to ensure 0% progress is still visible (min 5% width)
  const calculateProgressWidth = (progress) => {
    const numericProgress = parseFloat(progress.replace('%', ''));
    if (numericProgress > 0 && numericProgress < 100) return progress;
    if (numericProgress === 0) return '5%';
    return '100%';
  };



  // Placeholder for action handling
  const handleAction = (action) => {
    console.log(`${action} action triggered`);
  }

  // Component for a styled View Option
  const ViewOption = ({ icon: Icon, title, isActive, onClick }) => (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 p-3 rounded-xl transition cursor-pointer 
            ${isActive
          ? 'bg-blue-100 border border-blue-600 text-blue-800 shadow-inner'
          : 'hover:bg-gray-100 text-gray-700'
        }`}
    >
      <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
      <span className="font-medium">{title}</span>
    </div>
  );

  return (
    <div className="min-h-screen  font-inter">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-1">Project Schedule Overview</h1>
          <p className="text-md text-gray-500">Visualizing tasks across the timeline in a modern Gantt format.</p>
        </div>



        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Tasks */}
          <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-blue-500 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-xl text-gray-800 mb-1">Total Tasks</h3>
              <div className="text-sm text-gray-500">{ganttData.length} active tasks</div>
            </div>
            <FiCheckCircle className="text-blue-500 w-8 h-8" />
          </div>

          {/* Overall Progress */}
          <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-green-500 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-xl text-gray-800 mb-1">Overall Progress</h3>
              <div className="text-sm text-gray-500">Approx. 46% (Estimated)</div>
            </div>
            <FiTrendingUp className="text-green-500 w-8 h-8" />
          </div>

          {/* Critical Path Status */}
          <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-yellow-500 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-xl text-gray-800 mb-1">Critical Path Status</h3>
              <div className="text-sm text-gray-500">2 tasks are delayed</div>
            </div>
            <FiAlertTriangle className="text-yellow-500 w-8 h-8" />
          </div>
        </div>


        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

          {/* --- Left Sidebar (Controls) --- */}
          <div className="lg:col-span-1 space-y-6">

            {/* Search Plan */}
            <div className="bg-white rounded-xl shadow-lg p-5 border border-gray-200">
              <h3 className="font-semibold text-gray-800 mb-3">Find Task / Plan</h3>
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by name or ID..."
                  value={searchPlan}
                  onChange={(e) => setSearchPlan(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>
            </div>

            {/* Chart View Section */}
            <div className="bg-white rounded-xl shadow-lg p-5 border border-gray-200">
              <h2 className=" font-bold text-gray-800 mb-3">Chart View</h2>
              <div className="space-y-2">
                <ViewOption icon={ChartIcon} title="Plan View (Gantt)" isActive={true} onClick={() => handleAction('View: Gantt')} />
                <ViewOption icon={ListIcon} title="List View" isActive={false} onClick={() => handleAction('View: List')} />
                <ViewOption icon={GridIcon} title="Count View" isActive={false} onClick={() => handleAction('View: Count')} />
              </div>
            </div>

            {/* Outline Section */}
            <div className="bg-white rounded-xl shadow-lg p-5 border border-gray-200">
              <h2 className=" font-bold text-gray-800 mb-3">Outline Options</h2>
              <div className="space-y-2">
                <div className="p-3 bg-gray-100 rounded-xl font-semibold text-gray-800 border border-gray-300">
                  Current Path: BaseIL
                </div>
                <div className="p-3 hover:bg-gray-100 rounded-xl cursor-pointer text-gray-700">
                  Actual Start & End
                </div>
                <div className="p-3 hover:bg-gray-100 rounded-xl cursor-pointer text-gray-700">
                  Auto Schedule
                </div>
              </div>
            </div>

            {/* Action Buttons */}
          

            {/* Zoom Controls */}
           
          </div>

          {/* --- Right Gantt Chart Area --- */}
          <div className="lg:col-span-3 overflow-x-auto rounded-2xl shadow-xl border border-gray-200">
            <table className="min-w-full table-fixed">
              {/* Table Header */}
              <thead className="sticky top-0 z-10 bg-blue-900 text-white text-xs font-bold uppercase">
                <tr>
                  <th className="px-4 py-3 text-left w-1/4  border-r border-gray-400" >Task Detail</th>
                  <th className="px-4 py-3 text-center w-1/12 border-r border-gray-400 ">Prog.</th>
                  <th className="px-4 py-3 text-center w-1/12 border-r border-gray-400 ">Start</th>
                  <th className="px-4 py-3 text-center w-1/12 border-r border-gray-400 ">End</th>
                  <th className="px-4 py-3 text-center w-1/12 border-r border-gray-400 ">Dur.</th>
                  <th className="px-4 py-3 text-center w-5/12 border-r border-gray-400 ">Timeline Visualization</th>
                </tr>
              </thead>

              {/* Table Body */}
              <tbody className="divide-y divide-gray-100 max-h-[calc(100vh-250px)] overflow-y-auto">
                {ganttData.map((task) => (
                  <tr key={task.id} className="hover:bg-blue-50 transition-colors">
                    {/* Task Detail */}
                    <td className="px-4 border-r border-gray-200 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-blue-600 w-4">{task.id}</span>
                        <span className="text-sm font-medium text-gray-900 truncate">{task.name}</span>
                      </div>
                    </td>

                    {/* Progress */}
                    <td className="px-4 border-r border-gray-200 py-3 text-center">
                      <span className="text-sm font-semibold text-gray-700">{task.progress}</span>
                    </td>

                    {/* Start Date */}
                    <td className="px-4 border-r border-gray-200 py-3 text-center">
                      <span className="text-xs text-gray-600">{task.startDate}</span>
                    </td>

                    {/* End Date */}
                    <td className="px-4 border-r border-gray-200 py-3 text-center">
                      <span className="text-xs text-gray-600">{task.endDate}</span>
                    </td>

                    {/* Duration */}
                    <td className="px-4 border-r border-gray-200 py-3 text-center">
                      <span className="text-xs text-gray-600">{task.duration}</span>
                    </td>

                    {/* Timeline Visualization */}
                    <td className="px-4 border-r border-gray-200 py-3">
                      <div className="relative h-5 flex items-center">
                        {/* Background Track */}
                        <div className="w-full absolute rounded-full h-4 opacity-75 bg-gray-200"></div>

                        {/* Progress Fill */}
                        <div
                          className={`absolute rounded-full h-4 transition-all duration-500 ease-out ${task.color}`}
                          style={{ width: calculateProgressWidth(task.progress) }}
                        >
                          {parseFloat(task.progress.replace('%', '')) >= 50 && (
                            <span className="absolute right-1 top-1/2 transform -translate-y-1/2 text-white text-[10px] font-bold">
                              {task.progress}
                            </span>
                          )}
                        </div>

                        {/* Today Marker */}
                        <div className="absolute left-[50%] h-6 w-0.5 bg-red-600 shadow-xl z-10 rounded-full" title="Today"></div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>

              {/* Summary Footer */}
              {/* <tfoot>
                <tr>
                  <td colSpan={6} className="p-4 border-t border-gray-200 flex justify-between text-sm text-gray-600 rounded-b-2xl">
                    <span className="font-semibold">Current Timeline:</span>
                    <span>30/09/2025 - 24/10/2025 (4 Weeks)</span>
                  </td>
                </tr>
              </tfoot> */}
            </table>
          </div>

        </div>

        {/* Additional Stats Row */}

      </div>
    </div>
  );
};

export default GanttView;
