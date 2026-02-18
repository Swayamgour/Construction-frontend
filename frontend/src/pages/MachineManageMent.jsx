import React, { useState, useMemo } from 'react';
import {
  FiPlus,
  FiSearch,
  FiFilter,
  FiSettings,
  FiAlertTriangle,
  FiCheckCircle,
  // FiClock,
  // BiRupee,
  FiBarChart2,
  FiTrendingUp,
  // FiTool,
  // FiTruck,
  // FiRefreshCw,
  FiEdit,
  FiEye,
  FiDownload
} from 'react-icons/fi';
import { BiRupee } from "react-icons/bi";
import {
  // FaHardHat,
  // FaOilCan,
  // FaCalendarCheck,
  FaTools,
  FaExclamationTriangle,
  FaGasPump
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const MachineManagement = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  // Sample machine data
  const machinesData = [
    {
      id: 'MCH-001',
      name: 'Excavator CAT 320',
      type: 'Excavator',
      model: 'CAT 320D',
      serialNumber: 'CAT320D-2023-001',
      status: 'active',
      availability: 'available',
      currentSite: 'Sunrise Residency',
      operator: 'Rajesh Kumar',
      lastMaintenance: '2025-01-15',
      nextMaintenance: '2025-02-15',
      totalHours: 1250,
      fuelLevel: 85,
      healthScore: 92,
      monthlyCost: 75000,
      utilization: 78
    },
    {
      id: 'MCH-002',
      name: 'Concrete Mixer',
      type: 'Mixer',
      model: 'L&T 500L',
      serialNumber: 'LT500L-2023-002',
      status: 'active',
      availability: 'in-use',
      currentSite: 'Metro Tower',
      operator: 'Suresh Patel',
      lastMaintenance: '2025-01-10',
      nextMaintenance: '2025-02-10',
      totalHours: 890,
      fuelLevel: 45,
      healthScore: 85,
      monthlyCost: 25000,
      utilization: 92
    },
    {
      id: 'MCH-003',
      name: 'Crane 25T',
      type: 'Crane',
      model: 'Tata 25T',
      serialNumber: 'TATA25T-2023-003',
      status: 'maintenance',
      availability: 'unavailable',
      currentSite: 'Tech Park',
      operator: 'Amit Sharma',
      lastMaintenance: '2025-01-20',
      nextMaintenance: '2025-01-25',
      totalHours: 1560,
      fuelLevel: 90,
      healthScore: 65,
      monthlyCost: 120000,
      utilization: 45
    },
    {
      id: 'MCH-004',
      name: 'Bulldozer Komatsu',
      type: 'Bulldozer',
      model: 'Komatsu D65',
      serialNumber: 'KOMD65-2023-004',
      status: 'active',
      availability: 'available',
      currentSite: 'Commercial Complex',
      operator: 'Vikram Singh',
      lastMaintenance: '2025-01-18',
      nextMaintenance: '2025-02-18',
      totalHours: 2100,
      fuelLevel: 60,
      healthScore: 88,
      monthlyCost: 95000,
      utilization: 82
    },
    {
      id: 'MCH-005',
      name: 'Road Roller',
      type: 'Roller',
      model: 'BOMAG 120',
      serialNumber: 'BOM120-2023-005',
      status: 'inactive',
      availability: 'unavailable',
      currentSite: 'Warehouse',
      operator: 'No Operator',
      lastMaintenance: '2024-12-20',
      nextMaintenance: '2025-01-20',
      totalHours: 750,
      fuelLevel: 20,
      healthScore: 72,
      monthlyCost: 35000,
      utilization: 25
    },
    {
      id: 'MCH-006',
      name: 'Tower Crane',
      type: 'Crane',
      model: 'Liebherr 200',
      serialNumber: 'LIE200-2023-006',
      status: 'active',
      availability: 'in-use',
      currentSite: 'Sunrise Residency',
      operator: 'Deepak Yadav',
      lastMaintenance: '2025-01-12',
      nextMaintenance: '2025-02-12',
      totalHours: 980,
      fuelLevel: 75,
      healthScore: 95,
      monthlyCost: 150000,
      utilization: 88
    }
  ];

  const maintenanceData = [
    {
      id: 'MTN-001',
      machineId: 'MCH-003',
      machineName: 'Crane 25T',
      type: 'Scheduled',
      scheduledDate: '2025-01-25',
      completionDate: '',
      status: 'pending',
      cost: 15000,
      description: 'Routine maintenance and inspection',
      parts: ['Hydraulic Oil', 'Filters', 'Grease']
    },
    {
      id: 'MTN-002',
      machineId: 'MCH-002',
      machineName: 'Concrete Mixer',
      type: 'Emergency',
      scheduledDate: '2025-01-22',
      completionDate: '2025-01-22',
      status: 'completed',
      cost: 8000,
      description: 'Motor replacement and electrical repair',
      parts: ['Electric Motor', 'Wiring Kit']
    },
    {
      id: 'MTN-003',
      machineId: 'MCH-001',
      machineName: 'Excavator CAT 320',
      type: 'Scheduled',
      scheduledDate: '2025-02-15',
      completionDate: '',
      status: 'scheduled',
      cost: 25000,
      description: 'Engine overhaul and hydraulic system check',
      parts: ['Engine Oil', 'Hydraulic Fluid', 'Air Filters']
    }
  ];

  const fuelData = [
    {
      id: 'FL-001',
      machineId: 'MCH-001',
      machineName: 'Excavator CAT 320',
      date: '2025-01-20',
      quantity: 50,
      cost: 4500,
      type: 'Diesel',
      operator: 'Rajesh Kumar'
    },
    {
      id: 'FL-002',
      machineId: 'MCH-002',
      machineName: 'Concrete Mixer',
      date: '2025-01-20',
      quantity: 25,
      cost: 2250,
      type: 'Diesel',
      operator: 'Suresh Patel'
    },
    {
      id: 'FL-003',
      machineId: 'MCH-004',
      machineName: 'Bulldozer Komatsu',
      date: '2025-01-19',
      quantity: 60,
      cost: 5400,
      type: 'Diesel',
      operator: 'Vikram Singh'
    }
  ];

  // Filter machines
  const filteredMachines = useMemo(() => {
    return machinesData.filter(machine => {
      const matchesSearch = machine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        machine.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        machine.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = !statusFilter || machine.status === statusFilter;
      const matchesType = !typeFilter || machine.type === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [machinesData, searchTerm, statusFilter, typeFilter]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalMachines = machinesData.length;
    const activeMachines = machinesData.filter(m => m.status === 'active').length;
    const underMaintenance = machinesData.filter(m => m.status === 'maintenance').length;
    const totalMonthlyCost = machinesData.reduce((sum, m) => sum + m.monthlyCost, 0);
    const avgUtilization = machinesData.reduce((sum, m) => sum + m.utilization, 0) / totalMachines;
    const lowHealthMachines = machinesData.filter(m => m.healthScore < 70).length;

    return {
      totalMachines,
      activeMachines,
      underMaintenance,
      totalMonthlyCost,
      avgUtilization,
      lowHealthMachines
    };
  }, [machinesData]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAvailabilityColor = (availability) => {
    switch (availability) {
      case 'available': return 'bg-blue-100 text-blue-800';
      case 'in-use': return 'bg-orange-100 text-orange-800';
      case 'unavailable': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getHealthColor = (score) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getMaintenanceStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const navigator = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
          <div>
            {/* <h1 className="text-4xl font-bold text-gray-900 mb-2">
              🏗️
            </h1> */}

            <h1 className="text-xl sm:text-2xl font-semibold bg-gradient-to-r from-slate-900 via-blue-800 to-purple-700 bg-clip-text text-transparent">
              Machine Management
            </h1>
            <p className="text-gray-600 text-lg">
              Monitor and manage construction equipment and machinery
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 bg-white text-gray-700 px-4 py-3 rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-200">
              <FiDownload className="text-lg" />
              Export Report
            </button>
            <button onClick={() => navigator('/AddNewMachine')} className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl">
              <FiPlus className="text-lg" />
              Add New Machine
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Machines</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.totalMachines}</h3>
              </div>
              <div className="bg-blue-100 p-3 rounded-xl">
                <FaTools className="text-blue-600 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Active Machines</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.activeMachines}</h3>
              </div>
              <div className="bg-green-100 p-3 rounded-xl">
                <FiCheckCircle className="text-green-600 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Under Maintenance</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.underMaintenance}</h3>
              </div>
              <div className="bg-yellow-100 p-3 rounded-xl">
                <FiSettings className="text-yellow-600 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Monthly Cost</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">₹{stats.totalMonthlyCost.toLocaleString()}</h3>
              </div>
              <div className="bg-purple-100 p-3 rounded-xl">
                <BiRupee className="text-purple-600 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Avg Utilization</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.avgUtilization.toFixed(1)}%</h3>
              </div>
              <div className="bg-orange-100 p-3 rounded-xl">
                <FiTrendingUp className="text-orange-600 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Low Health</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.lowHealthMachines}</h3>
              </div>
              <div className="bg-red-100 p-3 rounded-xl">
                <FiAlertTriangle className="text-red-600 text-xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl">
            {[
              { key: 'overview', label: 'Machine Overview', icon: FiBarChart2 },
              { key: 'maintenance', label: 'Maintenance', icon: FiSettings },
              { key: 'fuel', label: 'Fuel Tracking', icon: FaGasPump },
              { key: 'utilization', label: 'Utilization', icon: FiTrendingUp }
            ].map(tab => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all capitalize ${activeTab === tab.key
                    ? 'bg-white shadow-sm text-blue-600 font-semibold'
                    : 'text-gray-600 hover:text-gray-900'
                    }`}
                >
                  <IconComponent className="text-lg" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <FiFilter className="text-blue-600" />
              Filter Machines
            </h2>

            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <div className="relative flex-1">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search machines by name, type, or ID..."
                  className="pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <select
                className="border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="maintenance">Maintenance</option>
                <option value="inactive">Inactive</option>
              </select>

              <select
                className="border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="">All Types</option>
                <option value="Excavator">Excavator</option>
                <option value="Crane">Crane</option>
                <option value="Mixer">Mixer</option>
                <option value="Bulldozer">Bulldozer</option>
                <option value="Roller">Roller</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Machine Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-gray-900">Machines Inventory</h3>
                <div className="text-sm text-gray-500">
                  Showing {filteredMachines.length} of {machinesData.length} machines
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredMachines.map(machine => (
                  <div onClick={() => navigator('/MachineDetailPage')} key={machine.id} className="border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-bold text-lg text-gray-900">{machine.name}</h4>
                        <p className="text-gray-600 text-sm">{machine.model} • {machine.id}</p>
                      </div>
                      <div className="flex gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(machine.status)}`}>
                          {machine.status}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAvailabilityColor(machine.availability)}`}>
                          {machine.availability}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Current Site:</span>
                        <span className="font-medium">{machine.currentSite}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Operator:</span>
                        <span className="font-medium">{machine.operator}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Total Hours:</span>
                        <span className="font-medium">{machine.totalHours}h</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Health Score:</span>
                        <span className={`font-medium ${getHealthColor(machine.healthScore)}`}>
                          {machine.healthScore}%
                        </span>
                      </div>
                    </div>

                    {/* Fuel Level */}
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Fuel Level</span>
                        <span className="font-medium">{machine.fuelLevel}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${machine.fuelLevel > 70 ? 'bg-green-500' :
                            machine.fuelLevel > 30 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                          style={{ width: `${machine.fuelLevel}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Utilization */}
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Utilization</span>
                        <span className="font-medium">{machine.utilization}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${machine.utilization}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                      <div className="text-sm">
                        <div className="text-gray-600">Monthly Cost</div>
                        <div className="font-bold text-gray-900">₹{machine.monthlyCost.toLocaleString()}</div>
                      </div>
                      <div className="flex gap-2">
                        <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <FiEye className="text-lg" />
                        </button>
                        <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                          <FiEdit className="text-lg" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Maintenance Tab */}
          {activeTab === 'maintenance' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-gray-900">Maintenance Schedule</h3>
                <button className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                  <FiPlus className="text-lg" />
                  Schedule Maintenance
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left p-4 font-semibold text-gray-700">Maintenance ID</th>
                      <th className="text-left p-4 font-semibold text-gray-700">Machine</th>
                      <th className="text-left p-4 font-semibold text-gray-700">Type</th>
                      <th className="text-left p-4 font-semibold text-gray-700">Scheduled Date</th>
                      <th className="text-left p-4 font-semibold text-gray-700">Status</th>
                      <th className="text-left p-4 font-semibold text-gray-700">Cost</th>
                      <th className="text-left p-4 font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {maintenanceData.map(maintenance => (
                      <tr key={maintenance.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="p-4 font-medium text-gray-900">{maintenance.id}</td>
                        <td className="p-4">
                          <div>
                            <div className="font-medium text-gray-900">{maintenance.machineName}</div>
                            <div className="text-sm text-gray-600">{maintenance.machineId}</div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${maintenance.type === 'Emergency'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-blue-100 text-blue-800'
                            }`}>
                            {maintenance.type}
                          </span>
                        </td>
                        <td className="p-4 text-gray-700">{maintenance.scheduledDate}</td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getMaintenanceStatusColor(maintenance.status)}`}>
                            {maintenance.status}
                          </span>
                        </td>
                        <td className="p-4 font-semibold text-gray-900">₹{maintenance.cost.toLocaleString()}</td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                              View Details
                            </button>
                            {maintenance.status !== 'completed' && (
                              <button className="text-green-600 hover:text-green-800 text-sm font-medium">
                                Mark Complete
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Upcoming Maintenance */}
              <div className="mt-8">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Maintenance</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {machinesData
                    .filter(machine => new Date(machine.nextMaintenance) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000))
                    .map(machine => (
                      <div key={machine.id} className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <FaExclamationTriangle className="text-yellow-600 text-xl" />
                          <div>
                            <div className="font-semibold text-gray-900">{machine.name}</div>
                            <div className="text-sm text-gray-600">Next maintenance: {machine.nextMaintenance}</div>
                          </div>
                        </div>
                        <button className="w-full bg-yellow-600 text-white py-2 rounded-lg hover:bg-yellow-700 transition-colors text-sm font-medium">
                          Schedule Now
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* Fuel Tracking Tab */}
          {activeTab === 'fuel' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-gray-900">Fuel Consumption Tracking</h3>
                <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  <FaGasPump className="text-lg" />
                  Add Fuel Record
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left p-4 font-semibold text-gray-700">Date</th>
                      <th className="text-left p-4 font-semibold text-gray-700">Machine</th>
                      <th className="text-left p-4 font-semibold text-gray-700">Fuel Type</th>
                      <th className="text-left p-4 font-semibold text-gray-700">Quantity (L)</th>
                      <th className="text-left p-4 font-semibold text-gray-700">Cost (₹)</th>
                      <th className="text-left p-4 font-semibold text-gray-700">Operator</th>
                      <th className="text-left p-4 font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fuelData.map(record => (
                      <tr key={record.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="p-4 font-medium text-gray-900">{record.date}</td>
                        <td className="p-4">
                          <div>
                            <div className="font-medium text-gray-900">{record.machineName}</div>
                            <div className="text-sm text-gray-600">{record.machineId}</div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
                            {record.type}
                          </span>
                        </td>
                        <td className="p-4 font-semibold text-gray-900">{record.quantity}L</td>
                        <td className="p-4 font-semibold text-green-600">₹{record.cost.toLocaleString()}</td>
                        <td className="p-4 text-gray-700">{record.operator}</td>
                        <td className="p-4">
                          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Fuel Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <div className="bg-blue-50 p-6 rounded-xl text-center">
                  <FaGasPump className="text-3xl text-blue-600 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-gray-900">125L</div>
                  <div className="text-sm text-gray-600">Total Fuel This Week</div>
                </div>
                <div className="bg-green-50 p-6 rounded-xl text-center">
                  <BiRupee className="text-3xl text-green-600 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-gray-900">₹11,250</div>
                  <div className="text-sm text-gray-600">Total Fuel Cost</div>
                </div>
                <div className="bg-orange-50 p-6 rounded-xl text-center">
                  <FiTrendingUp className="text-3xl text-orange-600 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-gray-900">8.5L/hr</div>
                  <div className="text-sm text-gray-600">Average Consumption</div>
                </div>
              </div>
            </div>
          )}

          {/* Utilization Tab */}
          {activeTab === 'utilization' && (
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-gray-900">Machine Utilization Analytics</h3>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Utilization by Machine */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900">Utilization by Machine</h4>
                  <div className="space-y-3">
                    {machinesData.map(machine => (
                      <div key={machine.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium text-gray-900">{machine.name}</div>
                          <div className="text-sm text-gray-600">{machine.type}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-gray-900">{machine.utilization}%</div>
                          <div className="text-sm text-gray-600">utilization</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Utilization Statistics */}
                <div className="space-y-6">
                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Utilization Overview</h4>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>High Utilization (&gt;80%)</span>
                          <span className="font-semibold text-green-600">
                            {machinesData.filter(m => m.utilization > 80).length} machines
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: `${(machinesData.filter(m => m.utilization > 80).length / machinesData.length) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Medium Utilization (50-80%)</span>
                          <span className="font-semibold text-yellow-600">
                            {machinesData.filter(m => m.utilization >= 50 && m.utilization <= 80).length} machines
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-yellow-500 h-2 rounded-full"
                            style={{ width: `${(machinesData.filter(m => m.utilization >= 50 && m.utilization <= 80).length / machinesData.length) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Low Utilization (&lt;50%)</span>
                          <span className="font-semibold text-red-600">
                            {machinesData.filter(m => m.utilization < 50).length} machines
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-red-500 h-2 rounded-full"
                            style={{ width: `${(machinesData.filter(m => m.utilization < 50).length / machinesData.length) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MachineManagement;