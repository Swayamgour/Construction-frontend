import React, { useState } from 'react';
import {
    FiArrowLeft,
    FiEdit,
    FiSettings,
    FiCalendar,
    FiDollarSign,
    FiBarChart2,
    // FiTool,
    // FiClock,
    // FiAlertTriangle,
    FiTrendingUp,
    FiCheckCircle,
    FiDownload,
    FiPrinter,
    FiMapPin,
    FiUser
} from 'react-icons/fi';
import {
    FaHardHat,
    FaOilCan,
    FaGasPump,
    FaExclamationTriangle,
    FaTools,
    FaTachometerAlt
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { BiRupee } from "react-icons/bi";

const MachineDetailPage = () => {
    // const { id } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');

    // Sample machine data - in real app, this would come from API
    const machineData = {
        id: 'MCH-001',
        name: 'Excavator CAT 320',
        type: 'Excavator',
        model: 'CAT 320D',
        serialNumber: 'CAT320D-2023-001',
        manufacturer: 'Caterpillar',
        year: 2023,
        purchaseDate: '2023-03-15',
        purchaseCost: 4500000,
        currentValue: 3800000,

        // Status Information
        status: 'active',
        availability: 'available',
        currentSite: 'Sunrise Residency',
        operator: 'Rajesh Kumar',
        operatorPhone: '+91 9876543210',

        // Specifications
        specifications: {
            engine: 'CAT C4.4',
            horsepower: '125 HP',
            weight: '21,500 kg',
            bucketCapacity: '1.2 m³',
            maxDepth: '6.5 m',
            fuelCapacity: '400 L',
            fuelType: 'Diesel'
        },

        // Operational Data
        operationalData: {
            totalHours: 1250,
            monthlyHours: 180,
            lastOperation: '2025-01-20',
            utilization: 78,
            efficiency: 92
        },

        // Maintenance Information
        maintenance: {
            lastMaintenance: '2025-01-15',
            nextMaintenance: '2025-02-15',
            maintenanceCost: 15000,
            serviceInterval: 250,
            hoursSinceLastService: 120
        },

        // Health & Performance
        health: {
            score: 92,
            engineHealth: 95,
            hydraulicHealth: 90,
            electricalHealth: 88,
            tireHealth: 85,
            alerts: ['Hydraulic pressure variation detected']
        },

        // Fuel & Consumption
        fuel: {
            currentLevel: 85,
            averageConsumption: '12.5 L/hr',
            totalFuelCost: 125000,
            lastRefuel: '2025-01-20',
            lastRefuelAmount: 50
        },

        // Cost Analysis
        costs: {
            monthlyCost: 75000,
            fuelCost: 25000,
            maintenanceCost: 15000,
            operatorCost: 25000,
            otherCosts: 10000,
            totalLifetimeCost: 850000
        },

        // Documents
        documents: [
            { name: 'Purchase Invoice', type: 'Financial', date: '2023-03-15', verified: true },
            { name: 'Service Manual', type: 'Technical', date: '2023-03-20', verified: true },
            { name: 'Insurance Certificate', type: 'Legal', date: '2024-03-15', verified: true },
            { name: 'Operator License', type: 'Personnel', date: '2023-04-01', verified: false }
        ],

        // Maintenance History
        maintenanceHistory: [
            { id: 'MTN-001', date: '2025-01-15', type: 'Scheduled', cost: 15000, status: 'Completed', description: 'Routine maintenance and oil change' },
            { id: 'MTN-002', date: '2024-12-10', type: 'Emergency', cost: 25000, status: 'Completed', description: 'Hydraulic hose replacement' },
            { id: 'MTN-003', date: '2024-11-05', type: 'Scheduled', cost: 12000, status: 'Completed', description: 'Filter replacement and inspection' },
            { id: 'MTN-004', date: '2024-10-15', type: 'Scheduled', cost: 18000, status: 'Completed', description: 'Engine tune-up and servicing' }
        ],

        // Fuel History
        fuelHistory: [
            { id: 'FL-001', date: '2025-01-20', quantity: 50, cost: 4500, operator: 'Rajesh Kumar' },
            { id: 'FL-002', date: '2025-01-15', quantity: 45, cost: 4050, operator: 'Rajesh Kumar' },
            { id: 'FL-003', date: '2025-01-10', quantity: 55, cost: 4950, operator: 'Suresh Patel' },
            { id: 'FL-004', date: '2025-01-05', quantity: 48, cost: 4320, operator: 'Rajesh Kumar' }
        ]
    };

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
            case 'Completed': return 'bg-green-100 text-green-800';
            case 'Scheduled': return 'bg-blue-100 text-blue-800';
            case 'In Progress': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const calculateDaysUntilMaintenance = () => {
        const nextDate = new Date(machineData.maintenance.nextMaintenance);
        const today = new Date();
        const diffTime = nextDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const daysUntilMaintenance = calculateDaysUntilMaintenance();

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors bg-white p-3 rounded-2xl shadow-sm hover:shadow-md"
                        >
                            <FiArrowLeft className="text-xl" />

                        </button>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Machine Details</h1>
                            <p className="text-gray-600">Complete overview and management for {machineData.name}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="flex items-center gap-2 bg-white text-gray-700 px-4 py-3 rounded-2xl shadow-sm hover:shadow-md transition-all border border-gray-200">
                            <FiPrinter className="text-lg" />
                            Print
                        </button>
                        <button className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl">
                            <FiEdit className="text-lg" />
                            Edit Machine
                        </button>
                    </div>
                </div>

                {/* Machine Header Card */}
                <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
                    <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
                        {/* Machine Icon and Basic Info */}
                        <div className="flex items-center gap-6">
                            <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center text-3xl text-white">
                                🏗️
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">{machineData.name}</h2>
                                <p className="text-gray-600 flex items-center gap-2 mt-1">
                                    <FaHardHat className="text-orange-500" />
                                    {machineData.model} • {machineData.serialNumber}
                                </p>
                                <div className="flex items-center gap-4 mt-3 text-sm">
                                    <span className="flex items-center gap-1 text-gray-600">
                                        <FiMapPin />
                                        {machineData.currentSite}
                                    </span>
                                    <span className="flex items-center gap-1 text-gray-600">
                                        <FiUser />
                                        {machineData.operator}
                                    </span>
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(machineData.status)}`}>
                                        {machineData.status}
                                    </span>
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getAvailabilityColor(machineData.availability)}`}>
                                        {machineData.availability}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="text-center p-4 bg-blue-50 rounded-xl">
                                <div className="text-2xl font-bold text-blue-700">{machineData.operationalData.totalHours}h</div>
                                <div className="text-sm text-gray-600">Total Hours</div>
                            </div>
                            <div className="text-center p-4 bg-green-50 rounded-xl">
                                <div className="text-2xl font-bold text-green-700">{machineData.operationalData.utilization}%</div>
                                <div className="text-sm text-gray-600">Utilization</div>
                            </div>
                            <div className="text-center p-4 bg-orange-50 rounded-xl">
                                <div className="text-2xl font-bold text-orange-700">{machineData.health.score}%</div>
                                <div className="text-sm text-gray-600">Health Score</div>
                            </div>
                            <div className="text-center p-4 bg-purple-50 rounded-xl">
                                <div className="text-2xl font-bold text-purple-700">₹{machineData.costs.monthlyCost.toLocaleString()}</div>
                                <div className="text-sm text-gray-600">Monthly Cost</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs Navigation */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
                    <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl">
                        {[
                            { key: 'overview', label: 'Overview', icon: FiBarChart2 },
                            { key: 'specifications', label: 'Specifications', icon: FaTools },
                            { key: 'maintenance', label: 'Maintenance', icon: FiSettings },
                            { key: 'fuel', label: 'Fuel & Consumption', icon: FaGasPump },
                            { key: 'costs', label: 'Cost Analysis', icon: FiDollarSign },
                            { key: 'documents', label: 'Documents', icon: FiDownload }
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

                {/* Tab Content */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                    {/* Overview Tab */}
                    {activeTab === 'overview' && (
                        <div className="space-y-8">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Basic Information */}
                                <div className="space-y-6">
                                    <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                                        <FaHardHat className="text-blue-600" />
                                        Basic Information
                                    </h3>
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-600">Machine Type</label>
                                                <p className="text-gray-900 font-medium mt-1">{machineData.type}</p>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-600">Model</label>
                                                <p className="text-gray-900 font-medium mt-1">{machineData.model}</p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-600">Manufacturer</label>
                                                <p className="text-gray-900 font-medium mt-1">{machineData.manufacturer}</p>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-600">Year</label>
                                                <p className="text-gray-900 font-medium mt-1">{machineData.year}</p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-600">Serial Number</label>
                                                <p className="text-gray-900 font-medium mt-1">{machineData.serialNumber}</p>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-600">Purchase Date</label>
                                                <p className="text-gray-900 font-medium mt-1">{machineData.purchaseDate}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Operational Status */}
                                <div className="space-y-6">
                                    <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                                        <FaTachometerAlt className="text-green-600" />
                                        Operational Status
                                    </h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-600">Current Site</label>
                                            <p className="text-gray-900 font-medium mt-1 flex items-center gap-2">
                                                <FiMapPin className="text-gray-400" />
                                                {machineData.currentSite}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-600">Operator</label>
                                            <p className="text-gray-900 font-medium mt-1 flex items-center gap-2">
                                                <FiUser className="text-gray-400" />
                                                {machineData.operator} ({machineData.operatorPhone})
                                            </p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-600">Last Operation</label>
                                                <p className="text-gray-900 font-medium mt-1">{machineData.operationalData.lastOperation}</p>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-600">Monthly Hours</label>
                                                <p className="text-gray-900 font-medium mt-1">{machineData.operationalData.monthlyHours}h</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Health & Performance */}
                            <div className="border-t pt-6">
                                <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2 mb-4">
                                    <FiTrendingUp className="text-orange-600" />
                                    Health & Performance
                                </h3>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    <div>
                                        <div className="flex items-center justify-between mb-4">
                                            <h4 className="font-medium text-gray-900">Overall Health Score</h4>
                                            <span className={`text-2xl font-bold ${getHealthColor(machineData.health.score)}`}>
                                                {machineData.health.score}%
                                            </span>
                                        </div>
                                        <div className="space-y-3">
                                            <div>
                                                <div className="flex justify-between text-sm mb-1">
                                                    <span>Engine Health</span>
                                                    <span>{machineData.health.engineHealth}%</span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className="bg-green-500 h-2 rounded-full"
                                                        style={{ width: `${machineData.health.engineHealth}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                            <div>
                                                <div className="flex justify-between text-sm mb-1">
                                                    <span>Hydraulic Health</span>
                                                    <span>{machineData.health.hydraulicHealth}%</span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className="bg-blue-500 h-2 rounded-full"
                                                        style={{ width: `${machineData.health.hydraulicHealth}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                            <div>
                                                <div className="flex justify-between text-sm mb-1">
                                                    <span>Electrical Health</span>
                                                    <span>{machineData.health.electricalHealth}%</span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className="bg-yellow-500 h-2 rounded-full"
                                                        style={{ width: `${machineData.health.electricalHealth}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="font-medium text-gray-900 mb-3">Alerts & Notifications</h4>
                                        {machineData.health.alerts.length > 0 ? (
                                            <div className="space-y-2">
                                                {machineData.health.alerts.map((alert, index) => (
                                                    <div key={index} className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                                                        <FaExclamationTriangle className="text-red-600 flex-shrink-0" />
                                                        <span className="text-sm text-red-800">{alert}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                                                <FiCheckCircle className="text-green-600 flex-shrink-0" />
                                                <span className="text-sm text-green-800">No active alerts. All systems operational.</span>
                                            </div>
                                        )}

                                        {/* Maintenance Alert */}
                                        <div className={`mt-4 p-4 rounded-lg border ${daysUntilMaintenance <= 7
                                            ? 'bg-red-50 border-red-200'
                                            : daysUntilMaintenance <= 14
                                                ? 'bg-yellow-50 border-yellow-200'
                                                : 'bg-blue-50 border-blue-200'
                                            }`}>
                                            <div className="flex items-center gap-3">
                                                <FiSettings className={
                                                    daysUntilMaintenance <= 7
                                                        ? 'text-red-600'
                                                        : daysUntilMaintenance <= 14
                                                            ? 'text-yellow-600'
                                                            : 'text-blue-600'
                                                } />
                                                <div>
                                                    <div className="font-medium text-gray-900">Next Maintenance</div>
                                                    <div className="text-sm text-gray-600">
                                                        Scheduled for {machineData.maintenance.nextMaintenance}
                                                        ({daysUntilMaintenance} days from now)
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Specifications Tab */}
                    {activeTab === 'specifications' && (
                        <div className="space-y-6">
                            <h3 className="text-2xl font-bold text-gray-900">Technical Specifications</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <h4 className="text-lg font-semibold text-gray-900">Engine & Power</h4>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                            <span className="text-gray-700">Engine Model</span>
                                            <span className="font-semibold">{machineData.specifications.engine}</span>
                                        </div>
                                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                            <span className="text-gray-700">Horsepower</span>
                                            <span className="font-semibold">{machineData.specifications.horsepower}</span>
                                        </div>
                                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                            <span className="text-gray-700">Fuel Type</span>
                                            <span className="font-semibold">{machineData.specifications.fuelType}</span>
                                        </div>
                                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                            <span className="text-gray-700">Fuel Capacity</span>
                                            <span className="font-semibold">{machineData.specifications.fuelCapacity}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <h4 className="text-lg font-semibold text-gray-900">Dimensions & Capacity</h4>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                            <span className="text-gray-700">Weight</span>
                                            <span className="font-semibold">{machineData.specifications.weight}</span>
                                        </div>
                                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                            <span className="text-gray-700">Bucket Capacity</span>
                                            <span className="font-semibold">{machineData.specifications.bucketCapacity}</span>
                                        </div>
                                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                            <span className="text-gray-700">Maximum Depth</span>
                                            <span className="font-semibold">{machineData.specifications.maxDepth}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Additional Specifications */}
                            <div className="border-t pt-6">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">Additional Details</h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="text-center p-4 bg-blue-50 rounded-xl">
                                        <div className="text-2xl font-bold text-blue-700">{machineData.operationalData.totalHours}</div>
                                        <div className="text-sm text-gray-600">Total Operating Hours</div>
                                    </div>
                                    <div className="text-center p-4 bg-green-50 rounded-xl">
                                        <div className="text-2xl font-bold text-green-700">{machineData.operationalData.efficiency}%</div>
                                        <div className="text-sm text-gray-600">Operational Efficiency</div>
                                    </div>
                                    <div className="text-center p-4 bg-purple-50 rounded-xl">
                                        <div className="text-2xl font-bold text-purple-700">{machineData.maintenance.hoursSinceLastService}h</div>
                                        <div className="text-sm text-gray-600">Since Last Service</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Maintenance Tab */}
                    {activeTab === 'maintenance' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <h3 className="text-2xl font-bold text-gray-900">Maintenance History & Schedule</h3>
                                <button className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                                    <FiSettings className="text-lg" />
                                    Schedule Maintenance
                                </button>
                            </div>

                            {/* Maintenance Summary */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                                <div className="bg-blue-50 p-4 rounded-xl text-center">
                                    <FiCalendar className="text-2xl text-blue-600 mx-auto mb-2" />
                                    <div className="text-lg font-bold text-gray-900">{machineData.maintenance.nextMaintenance}</div>
                                    <div className="text-sm text-gray-600">Next Maintenance</div>
                                </div>
                                <div className="bg-green-50 p-4 rounded-xl text-center">
                                    <FiCheckCircle className="text-2xl text-green-600 mx-auto mb-2" />
                                    <div className="text-lg font-bold text-gray-900">{machineData.maintenanceHistory.length}</div>
                                    <div className="text-sm text-gray-600">Completed Services</div>
                                </div>
                                <div className="bg-orange-50 p-4 rounded-xl text-center">
                                    <FaOilCan className="text-2xl text-orange-600 mx-auto mb-2" />
                                    <div className="text-lg font-bold text-gray-900">{machineData.maintenance.hoursSinceLastService}h</div>
                                    <div className="text-sm text-gray-600">Since Last Service</div>
                                </div>
                                <div className="bg-purple-50 p-4 rounded-xl text-center">
                                    <BiRupee className="text-2xl text-purple-600 mx-auto mb-2" />
                                    <div className="text-lg font-bold text-gray-900">₹{machineData.maintenance.maintenanceCost.toLocaleString()}</div>
                                    <div className="text-sm text-gray-600">Last Service Cost</div>
                                </div>
                            </div>

                            {/* Maintenance History Table */}
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="text-left p-4 font-semibold text-gray-700">Maintenance ID</th>
                                            <th className="text-left p-4 font-semibold text-gray-700">Date</th>
                                            <th className="text-left p-4 font-semibold text-gray-700">Type</th>
                                            <th className="text-left p-4 font-semibold text-gray-700">Description</th>
                                            <th className="text-left p-4 font-semibold text-gray-700">Cost</th>
                                            <th className="text-left p-4 font-semibold text-gray-700">Status</th>
                                            <th className="text-left p-4 font-semibold text-gray-700">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {machineData.maintenanceHistory.map(maintenance => (
                                            <tr key={maintenance.id} className="border-b border-gray-100 hover:bg-gray-50">
                                                <td className="p-4 font-medium text-gray-900">{maintenance.id}</td>
                                                <td className="p-4 text-gray-700">{maintenance.date}</td>
                                                <td className="p-4">
                                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${maintenance.type === 'Emergency'
                                                        ? 'bg-red-100 text-red-800'
                                                        : 'bg-blue-100 text-blue-800'
                                                        }`}>
                                                        {maintenance.type}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-gray-700">{maintenance.description}</td>
                                                <td className="p-4 font-semibold text-gray-900">₹{maintenance.cost.toLocaleString()}</td>
                                                <td className="p-4">
                                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getMaintenanceStatusColor(maintenance.status)}`}>
                                                        {maintenance.status}
                                                    </span>
                                                </td>
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
                        </div>
                    )}

                    {/* Fuel & Consumption Tab */}
                    {activeTab === 'fuel' && (
                        <div className="space-y-6">
                            <h3 className="text-2xl font-bold text-gray-900">Fuel Consumption & Tracking</h3>

                            {/* Fuel Summary */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                                <div className="bg-white border border-gray-200 rounded-xl p-6">
                                    <div className="flex items-center gap-3 mb-3">
                                        <FaGasPump className="text-2xl text-orange-600" />
                                        <div>
                                            <div className="text-2xl font-bold text-gray-900">{machineData.fuel.currentLevel}%</div>
                                            <div className="text-sm text-gray-600">Current Fuel Level</div>
                                        </div>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-3">
                                        <div
                                            className={`h-3 rounded-full ${machineData.fuel.currentLevel > 70 ? 'bg-green-500' :
                                                machineData.fuel.currentLevel > 30 ? 'bg-yellow-500' : 'bg-red-500'
                                                }`}
                                            style={{ width: `${machineData.fuel.currentLevel}%` }}
                                        ></div>
                                    </div>
                                </div>

                                <div className="bg-white border border-gray-200 rounded-xl p-6">
                                    <div className="flex items-center gap-3 mb-3">
                                        <FiTrendingUp className="text-2xl text-blue-600" />
                                        <div>
                                            <div className="text-2xl font-bold text-gray-900">{machineData.fuel.averageConsumption}</div>
                                            <div className="text-sm text-gray-600">Average Consumption</div>
                                        </div>
                                    </div>
                                    <div className="text-sm text-gray-600">Per operating hour</div>
                                </div>

                                <div className="bg-white border border-gray-200 rounded-xl p-6">
                                    <div className="flex items-center gap-3 mb-3">
                                        <BiRupee className="text-2xl text-green-600" />
                                        <div>
                                            <div className="text-2xl font-bold text-gray-900">₹{machineData.fuel.totalFuelCost.toLocaleString()}</div>
                                            <div className="text-sm text-gray-600">Total Fuel Cost</div>
                                        </div>
                                    </div>
                                    <div className="text-sm text-gray-600">Lifetime total</div>
                                </div>
                            </div>

                            {/* Fuel History Table */}
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="text-left p-4 font-semibold text-gray-700">Date</th>
                                            <th className="text-left p-4 font-semibold text-gray-700">Quantity (L)</th>
                                            <th className="text-left p-4 font-semibold text-gray-700">Cost (₹)</th>
                                            <th className="text-left p-4 font-semibold text-gray-700">Operator</th>
                                            <th className="text-left p-4 font-semibold text-gray-700">Cost per Liter</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {machineData.fuelHistory.map(record => (
                                            <tr key={record.id} className="border-b border-gray-100 hover:bg-gray-50">
                                                <td className="p-4 font-medium text-gray-900">{record.date}</td>
                                                <td className="p-4 font-semibold text-gray-900">{record.quantity}L</td>
                                                <td className="p-4 font-semibold text-green-600">₹{record.cost.toLocaleString()}</td>
                                                <td className="p-4 text-gray-700">{record.operator}</td>
                                                <td className="p-4 text-gray-600">₹{(record.cost / record.quantity).toFixed(2)}/L</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Cost Analysis Tab */}
                    {activeTab === 'costs' && (
                        <div className="space-y-6">
                            <h3 className="text-2xl font-bold text-gray-900">Cost Analysis & Financial Overview</h3>

                            {/* Cost Breakdown */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <h4 className="text-lg font-semibold text-gray-900">Monthly Cost Breakdown</h4>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center p-4 bg-blue-50 rounded-xl">
                                            <span className="text-gray-700">Fuel Cost</span>
                                            <span className="font-bold text-blue-700">₹{machineData.costs.fuelCost.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between items-center p-4 bg-green-50 rounded-xl">
                                            <span className="text-gray-700">Maintenance Cost</span>
                                            <span className="font-bold text-green-700">₹{machineData.costs.maintenanceCost.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between items-center p-4 bg-orange-50 rounded-xl">
                                            <span className="text-gray-700">Operator Cost</span>
                                            <span className="font-bold text-orange-700">₹{machineData.costs.operatorCost.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between items-center p-4 bg-purple-50 rounded-xl">
                                            <span className="text-gray-700">Other Costs</span>
                                            <span className="font-bold text-purple-700">₹{machineData.costs.otherCosts.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between items-center p-4 bg-gray-100 rounded-xl border">
                                            <span className="text-gray-900 font-semibold">Total Monthly Cost</span>
                                            <span className="font-bold text-gray-900 text-lg">₹{machineData.costs.monthlyCost.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <h4 className="text-lg font-semibold text-gray-900">Asset Information</h4>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center p-4 bg-white border border-gray-200 rounded-xl">
                                            <span className="text-gray-700">Purchase Cost</span>
                                            <span className="font-bold text-gray-900">₹{machineData.purchaseCost.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between items-center p-4 bg-white border border-gray-200 rounded-xl">
                                            <span className="text-gray-700">Current Value</span>
                                            <span className="font-bold text-green-600">₹{machineData.currentValue.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between items-center p-4 bg-white border border-gray-200 rounded-xl">
                                            <span className="text-gray-700">Depreciation</span>
                                            <span className="font-bold text-red-600">₹{(machineData.purchaseCost - machineData.currentValue).toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between items-center p-4 bg-white border border-gray-200 rounded-xl">
                                            <span className="text-gray-700">Total Lifetime Cost</span>
                                            <span className="font-bold text-purple-600">₹{machineData.costs.totalLifetimeCost.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Cost per Hour Analysis */}
                            <div className="border-t pt-6">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">Cost Efficiency</h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="text-center p-4 bg-blue-50 rounded-xl">
                                        <div className="text-xl font-bold text-blue-700">
                                            ₹{(machineData.costs.monthlyCost / machineData.operationalData.monthlyHours).toFixed(2)}
                                        </div>
                                        <div className="text-sm text-gray-600">Cost per Hour (Monthly)</div>
                                    </div>
                                    <div className="text-center p-4 bg-green-50 rounded-xl">
                                        <div className="text-xl font-bold text-green-700">
                                            ₹{(machineData.costs.totalLifetimeCost / machineData.operationalData.totalHours).toFixed(2)}
                                        </div>
                                        <div className="text-sm text-gray-600">Cost per Hour (Lifetime)</div>
                                    </div>
                                    <div className="text-center p-4 bg-orange-50 rounded-xl">
                                        <div className="text-xl font-bold text-orange-700">
                                            {((machineData.operationalData.monthlyHours * machineData.costs.monthlyCost) / 100000).toFixed(1)}K
                                        </div>
                                        <div className="text-sm text-gray-600">Revenue Generated (Est.)</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Documents Tab */}
                    {activeTab === 'documents' && (
                        <div className="space-y-6">
                            <h3 className="text-2xl font-bold text-gray-900">Machine Documents & Certificates</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {machineData.documents.map((doc, index) => (
                                    <div key={index} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <FiDownload className="text-blue-600 text-xl" />
                                                <div>
                                                    <h4 className="font-semibold text-gray-900">{doc.name}</h4>
                                                    <p className="text-sm text-gray-600">{doc.type}</p>
                                                </div>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${doc.verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {doc.verified ? 'Verified' : 'Pending'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm text-gray-600">
                                            <span>Uploaded: {doc.date}</span>
                                            <div className="flex gap-2">
                                                <button className="text-blue-600 hover:text-blue-800 font-medium">
                                                    View
                                                </button>
                                                <button className="text-green-600 hover:text-green-800 font-medium">
                                                    Download
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Document Upload Section */}
                            <div className="border-t pt-6">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">Upload New Document</h4>
                                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
                                    <FiDownload className="text-3xl text-gray-400 mx-auto mb-3" />
                                    <p className="text-gray-600 mb-4">Drag and drop files here or click to upload</p>
                                    <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                                        Select Files
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MachineDetailPage;