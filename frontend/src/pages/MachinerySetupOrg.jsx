import React, { useState } from 'react';

const MachinerySetupOrg = () => {
  const [filters, setFilters] = useState({
    createdAt: 'No filter',
    projectName: 'S2 options',
    machineName: 'JCB X'
  });

  const [machineryData, setMachineryData] = useState([
    {
      projectName: 'Project 1',
      parentTask: 'Trial Extension',
      taskName: '1',
      createdAt: '2024-05-24',
      machineName: 'JCB',
      owner: 'Version 1',
      operator: 'nil',
      workDone: '0',
      fuelConsumed: '6',
      startingHours: '15',
      endingHours: '19'
    },
    {
      projectName: 'Status Construction',
      parentTask: '',
      taskName: '',
      createdAt: '2024-12-26',
      machineName: 'JCB',
      owner: 'N/A',
      operator: 'Ramu',
      workDone: '2500',
      fuelConsumed: '100',
      startingHours: '12',
      endingHours: '45'
    },
    {
      projectName: 'setup walkthrough',
      parentTask: '',
      taskName: '',
      createdAt: '2024-04-04',
      machineName: 'JCB',
      owner: 'Self',
      operator: 'Demo Operator',
      workDone: '2400',
      fuelConsumed: '3',
      startingHours: '100',
      endingHours: '105'
    },
    {
      projectName: 'Urtman Construction',
      parentTask: '',
      taskName: '',
      createdAt: '2024-11-16',
      machineName: 'JCB',
      owner: 'N/A',
      operator: 'Kartem',
      workDone: '0',
      fuelConsumed: '15',
      startingHours: 'N/A',
      endingHours: 'N/A'
    },
    {
      projectName: '35 batch 2',
      parentTask: '',
      taskName: '',
      createdAt: '2024-10-23',
      machineName: 'JCB',
      owner: 'N/A',
      operator: 'N/A',
      workDone: '0',
      fuelConsumed: 'N/A',
      startingHours: 'N/A',
      endingHours: 'N/A'
    },
    {
      projectName: 'Project 1',
      parentTask: 'Substructure',
      taskName: 'Ground Floor',
      createdAt: '2024-04-20',
      machineName: 'JCB',
      owner: 'N/A',
      operator: 'N/A',
      workDone: '20',
      fuelConsumed: '1',
      startingHours: '0',
      endingHours: '5'
    },
    {
      projectName: 'THEO CONSTRUCTION',
      parentTask: '',
      taskName: '',
      createdAt: '2024-11-13',
      machineName: 'JCB',
      owner: 'N/A',
      operator: 'N/A',
      workDone: '8',
      fuelConsumed: '22',
      startingHours: '344555',
      endingHours: '555'
    },
    {
      projectName: 'Amav Construction',
      parentTask: '',
      taskName: 'RCC',
      createdAt: '2024-12-11',
      machineName: 'JCB',
      owner: 'N/A',
      operator: 'naja',
      workDone: '0',
      fuelConsumed: '10',
      startingHours: 'N/A',
      endingHours: 'N/A'
    },
    {
      projectName: 'mast project',
      parentTask: '',
      taskName: '',
      createdAt: '2024-10-01',
      machineName: 'JCB',
      owner: 'N/A',
      operator: 'N/A',
      workDone: '0',
      fuelConsumed: '50',
      startingHours: 'N/A',
      endingHours: 'N/A'
    },
    {
      projectName: 'Machine',
      parentTask: '',
      taskName: '',
      createdAt: '2024-12-20',
      machineName: 'JCB',
      owner: 'N/A',
      operator: 'N/A',
      workDone: '0',
      fuelConsumed: '10',
      startingHours: 'N/A',
      endingHours: 'N/A'
    },
    {
      projectName: 'Machinery Stany',
      parentTask: '',
      taskName: 'EXCAVATION',
      createdAt: '2024-06-16',
      machineName: 'JCB',
      owner: 'N/A',
      operator: 'N/A',
      workDone: '0',
      fuelConsumed: 'N/A',
      startingHours: '555',
      endingHours: '85'
    },
    {
      projectName: 'Project 1',
      parentTask: 'Dummy Task',
      taskName: '',
      createdAt: '2024-05-24',
      machineName: 'JCB',
      owner: 'Version 1',
      operator: 'XYZ',
      workDone: '315',
      fuelConsumed: '7',
      startingHours: '5',
      endingHours: '8.5'
    },
    {
      projectName: 'Project 1',
      parentTask: 'Substructure',
      taskName: 'Ground Floor',
      createdAt: '2024-04-04',
      machineName: 'JCB',
      owner: 'Own',
      operator: 'nil',
      workDone: '2100',
      fuelConsumed: '12',
      startingHours: '100',
      endingHours: '104'
    },
    {
      projectName: 'Maku Constructions',
      parentTask: '',
      taskName: '',
      createdAt: '2025-05-21',
      machineName: 'JCB',
      owner: 'N/A',
      operator: 'RAMU',
      workDone: '0',
      fuelConsumed: '10',
      startingHours: 'N/A',
      endingHours: 'N/A'
    },
    {
      projectName: 'Broker 1',
      parentTask: 'Substructure',
      taskName: 'First Floor',
      createdAt: '2024-04-20',
      machineName: 'JCB',
      owner: 'Own',
      operator: 'nil',
      workDone: '2400',
      fuelConsumed: '1',
      startingHours: '30',
      endingHours: '35'
    }
  ]);

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const applyFilters = () => {
    console.log('Applying filters:', filters);
    // Filter logic would go here
  };

  const clearAllFilters = () => {
    setFilters({
      createdAt: 'No filter',
      projectName: 'S2 options',
      machineName: 'JCB X'
    });
  };

  return (
    <div className="min-h-screen  p-6 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Machinery Setup Org</h1>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Fileers</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Created At Filter */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Created At</h3>
              <div className="space-y-1">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="noFilter"
                    name="createdAt"
                    checked={filters.createdAt === 'No filter'}
                    onChange={() => handleFilterChange('createdAt', 'No filter')}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <label htmlFor="noFilter" className="ml-2 text-sm text-gray-600">
                    No filter
                  </label>
                </div>
              </div>
            </div>

            {/* Project Name Filter */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Project Name</h3>
              <div className="space-y-1">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="s2options"
                    name="projectName"
                    checked={filters.projectName === 'S2 options'}
                    onChange={() => handleFilterChange('projectName', 'S2 options')}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <label htmlFor="s2options" className="ml-2 text-sm text-gray-600">
                    S2 options
                  </label>
                </div>
              </div>
            </div>

            {/* Machine Name Filter */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Machine Name</h3>
              <div className="space-y-1">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="jcbx"
                    name="machineName"
                    checked={filters.machineName === 'JCB X'}
                    onChange={() => handleFilterChange('machineName', 'JCB X')}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <label htmlFor="jcbx" className="ml-2 text-sm text-gray-600">
                    JCB X
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Filter Actions */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={applyFilters}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
            >
              Apply filters
            </button>
            <button
              onClick={clearAllFilters}
              className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-300 transition-colors"
            >
              Clear all
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-300 my-6"></div>

        {/* Project Name Section */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Project Name</h3>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className=" border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                    Project Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                    Parent Task
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                    Task Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                    Created At
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                    Machine Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                    Owner
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                    Operator
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                    Work Done
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                    Fuel Consumed
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                    Starting Hours
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ending Hours
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {machineryData.map((item, index) => (
                  <tr key={index} className="hover:">
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 border-r border-gray-200">
                      {item.projectName}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 border-r border-gray-200">
                      {item.parentTask}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 border-r border-gray-200">
                      {item.taskName}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 border-r border-gray-200">
                      {item.createdAt}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 border-r border-gray-200">
                      {item.machineName}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 border-r border-gray-200">
                      {item.owner}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 border-r border-gray-200">
                      {item.operator}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 border-r border-gray-200">
                      {item.workDone}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 border-r border-gray-200">
                      {item.fuelConsumed}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 border-r border-gray-200">
                      {item.startingHours}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                      {item.endingHours}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MachinerySetupOrg;