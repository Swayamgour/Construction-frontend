import React, { useState, useMemo } from 'react';
import {
    FiDownload,
    FiPrinter,
    FiFilter,
    // FiCalendar,
    FiBarChart2,
    FiTrendingUp,
    FiUsers,
    // MdOutlineCurrencyRupee,
    // FiClock,
    FiAlertTriangle,
    FiCheckCircle,
    // FiEye,
    // FiRefreshCw
} from 'react-icons/fi';
import { FaHardHat, FaIndustry,  FaFileExport } from 'react-icons/fa';
import { MdOutlineCurrencyRupee } from "react-icons/md";

const ReportsPage = () => {
    const [activeReport, setActiveReport] = useState('attendance');
    const [dateRange, setDateRange] = useState({
        start: '2025-01-01',
        end: '2025-01-31'
    });
    const [selectedSite, setSelectedSite] = useState('');
    const [selectedDepartment, setSelectedDepartment] = useState('');

    // Sample data for reports
    const reportData = {
        attendance: {
            title: "Attendance Report",
            description: "Daily attendance records and analytics",
            data: [
                { date: "2025-01-20", present: 45, absent: 5, late: 3, overtime: 12 },
                { date: "2025-01-19", present: 42, absent: 8, late: 2, overtime: 8 },
                { date: "2025-01-18", present: 48, absent: 2, late: 1, overtime: 15 },
                { date: "2025-01-17", present: 44, absent: 6, late: 4, overtime: 10 },
                { date: "2025-01-16", present: 46, absent: 4, late: 2, overtime: 14 },
                { date: "2025-01-15", present: 43, absent: 7, late: 3, overtime: 9 },
                { date: "2025-01-14", present: 47, absent: 3, late: 1, overtime: 16 }
            ],
            summary: {
                totalDays: 7,
                averageAttendance: 92.5,
                totalOvertime: 84,
                attendanceRate: 94.2
            }
        },
        payroll: {
            title: "Payroll Report",
            description: "Salary payments and financial summary",
            data: [
                { employee: "Rajesh Kumar", role: "Mason", salary: 18000, paid: 15000, due: 3000, status: "Partial" },
                { employee: "Suresh Patel", role: "Carpenter", salary: 22000, paid: 22000, due: 0, status: "Paid" },
                { employee: "Amit Sharma", role: "Electrician", salary: 25000, paid: 20000, due: 5000, status: "Partial" },
                { employee: "Vikram Singh", role: "Plumber", salary: 20000, paid: 18000, due: 2000, status: "Partial" },
                { employee: "Deepak Yadav", role: "Helper", salary: 12000, paid: 8000, due: 4000, status: "Partial" },
                { employee: "Rahul Verma", role: "Welder", salary: 19000, paid: 19000, due: 0, status: "Paid" }
            ],
            summary: {
                totalSalary: 116000,
                totalPaid: 102000,
                totalDue: 14000,
                paidPercentage: 87.9
            }
        },
        productivity: {
            title: "Productivity Report",
            description: "Work progress and efficiency metrics",
            data: [
                { site: "Sunrise Residency", progress: 75, target: 80, efficiency: 94, workers: 45 },
                { site: "Metro Tower", progress: 45, target: 50, efficiency: 90, workers: 32 },
                { site: "Tech Park", progress: 30, target: 35, efficiency: 86, workers: 28 },
                { site: "Commercial Complex", progress: 85, target: 85, efficiency: 100, workers: 68 },
                { site: "Industrial Zone", progress: 60, target: 65, efficiency: 92, workers: 52 }
            ],
            summary: {
                avgProgress: 59,
                avgEfficiency: 92.4,
                totalWorkers: 225,
                onTrackProjects: 3
            }
        },
        safety: {
            title: "Safety & Compliance Report",
            description: "Safety incidents and compliance tracking",
            data: [
                { site: "Sunrise Residency", incidents: 2, inspections: 15, compliance: 95, training: 45 },
                { site: "Metro Tower", incidents: 1, inspections: 12, compliance: 98, training: 32 },
                { site: "Tech Park", incidents: 0, inspections: 10, compliance: 100, training: 28 },
                { site: "Commercial Complex", incidents: 3, inspections: 18, compliance: 92, training: 68 },
                { site: "Industrial Zone", incidents: 1, inspections: 14, compliance: 96, training: 52 }
            ],
            summary: {
                totalIncidents: 7,
                avgCompliance: 96.2,
                totalInspections: 69,
                trainingCompleted: 225
            }
        },
        materials: {
            title: "Materials Usage Report",
            description: "Material consumption and inventory status",
            data: [
                { material: "Cement", used: "500 Bags", stock: "150 Bags", cost: 225000, wastage: "2%" },
                { material: "Steel", used: "3000 kg", stock: "800 kg", cost: 195000, wastage: "1.5%" },
                { material: "Bricks", used: "15000 Units", stock: "5000 Units", cost: 120000, wastage: "3%" },
                { material: "Sand", used: "200 Tons", stock: "50 Tons", cost: 80000, wastage: "4%" },
                { material: "Electrical Wires", used: "1500 Meters", stock: "300 Meters", cost: 67500, wastage: "1%" }
            ],
            summary: {
                totalCost: 687500,
                avgWastage: 2.3,
                stockValue: 245000,
                materialsUsed: 8
            }
        }
    };

    const sites = ["All Sites", "Sunrise Residency", "Metro Tower", "Tech Park", "Commercial Complex", "Industrial Zone"];
    const departments = ["All Departments", "Civil", "Electrical", "Plumbing", "Finishing", "Structural"];

    // Filtered data based on selections
    const filteredData = useMemo(() => {
        return reportData[activeReport].data;
    }, [activeReport, dateRange, selectedSite, selectedDepartment]);

    const currentReport = reportData[activeReport];

    const exportReport = (format) => {
        alert(`Exporting ${currentReport.title} as ${format.toUpperCase()}`);
        // In real application, this would generate and download the file
    };

    const printReport = () => {
        alert(`Printing ${currentReport.title}`);
        // In real application, this would open print dialog
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Paid': return 'bg-green-100 text-green-800';
            case 'Partial': return 'bg-yellow-100 text-yellow-800';
            case 'Unpaid': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getEfficiencyColor = (efficiency) => {
        if (efficiency >= 95) return 'text-green-600';
        if (efficiency >= 85) return 'text-yellow-600';
        return 'text-red-600';
    };

    const borderColors = [
        "border-blue-500",
        "border-green-500",
        "border-purple-500",
        "border-yellow-500",
        "border-pink-500",
        "border-orange-500",
    ];


    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
                    <div>
                        {/* <h1 className="text-4xl font-bold text-gray-900 mb-2">
                            📊
                        </h1> */}
                        <h1 className="text-xl sm:text-2xl font-semibold bg-gradient-to-r from-slate-900 via-blue-800 to-purple-700 bg-clip-text text-transparent">
                            Reports & Analytics
                        </h1>
                        <p className="text-gray-600 text-lg">
                            Comprehensive insights and analytics for construction management
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => exportReport('pdf')}
                            className="flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-xl hover:bg-red-700 transition-all shadow-lg hover:shadow-xl"
                        >
                            <FiDownload className="text-lg" />
                            Export PDF
                        </button>
                        <button
                            onClick={printReport}
                            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl"
                        >
                            <FiPrinter className="text-lg" />
                            Print Report
                        </button>
                    </div>
                </div>

                {/* Report Type Selector */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
                    <div className="flex flex-wrap gap-2">
                        {[
                            { key: 'attendance', label: 'Attendance', icon: FiUsers },
                            { key: 'payroll', label: 'Payroll', icon: MdOutlineCurrencyRupee },
                            { key: 'productivity', label: 'Productivity', icon: FiTrendingUp },
                            { key: 'safety', label: 'Safety', icon: FaHardHat },
                            { key: 'materials', label: 'Materials', icon: FaIndustry }
                        ].map(report => {
                            const IconComponent = report.icon;
                            return (
                                <button
                                    key={report.key}
                                    onClick={() => setActiveReport(report.key)}
                                    className={`flex items-center gap-3 px-6 py-4 rounded-xl transition-all ${activeReport === report.key
                                        ? 'bg-blue-600 text-white shadow-lg'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    <IconComponent className="text-lg" />
                                    <span className="font-semibold">{report.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
                    <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <FiFilter className="text-blue-600" />
                            Report Filters
                        </h2>
                        <div className="text-sm text-gray-500">
                            Data for: {dateRange.start} to {dateRange.end}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Date Range
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="date"
                                    value={dateRange.start}
                                    onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                                    className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <input
                                    type="date"
                                    value={dateRange.end}
                                    onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                                    className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Site
                            </label>
                            <select
                                value={selectedSite}
                                onChange={(e) => setSelectedSite(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                {sites.map(site => (
                                    <option key={site} value={site}>{site}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Department
                            </label>
                            <select
                                value={selectedDepartment}
                                onChange={(e) => setSelectedDepartment(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                {departments.map(dept => (
                                    <option key={dept} value={dept}>{dept}</option>
                                ))}
                            </select>
                        </div>

                        {/* <div className="flex items-end">
                            <button className="w-full bg-green-600 text-white p-3 rounded-xl hover:bg-green-700 transition-colors font-semibold">
                                <FiRefreshCw className="inline mr-2" />
                                Apply Filters
                            </button>
                        </div> */}
                    </div>
                </div>

                {/* Report Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {Object.entries(currentReport.summary).map(([key, value], index) => (
                        <div
                            key={key}
                            className={`bg-white rounded-2xl shadow-lg p-6 border-l-4 ${borderColors[index % borderColors.length]}`}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-600 text-sm font-medium capitalize">
                                        {key.replace(/([A-Z])/g, " $1").trim()}
                                    </p>

                                    <h3 className="text-2xl font-bold text-gray-900 mt-1">
                                        {typeof value === "number" && key.includes("Percentage")
                                            ? `${value}%`
                                            : typeof value === "number" && key.includes("Cost")
                                                ? `₹${value.toLocaleString()}`
                                                : value}
                                    </h3>
                                </div>

                                <div className={`p-3 rounded-xl bg-gray-100`}>
                                    <FiBarChart2 className="text-gray-700 text-xl" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>


                {/* Report Content */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">{currentReport.title}</h2>
                            <p className="text-gray-600">{currentReport.description}</p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => exportReport('excel')}
                                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                            >
                                <FaFileExport />
                                Excel
                            </button>
                            <button
                                onClick={() => exportReport('csv')}
                                className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                            >
                                <FiDownload />
                                CSV
                            </button>
                        </div>
                    </div>

                    {/* Report Tables */}
                    <div className="overflow-x-auto">
                        {activeReport === 'attendance' && (
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="text-left p-4 font-semibold text-gray-700">Date</th>
                                        <th className="text-left p-4 font-semibold text-gray-700">Present</th>
                                        <th className="text-left p-4 font-semibold text-gray-700">Absent</th>
                                        <th className="text-left p-4 font-semibold text-gray-700">Late Arrivals</th>
                                        <th className="text-left p-4 font-semibold text-gray-700">Overtime (Hours)</th>
                                        <th className="text-left p-4 font-semibold text-gray-700">Attendance Rate</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredData.map((row, index) => {
                                        const total = row.present + row.absent;
                                        const rate = (row.present / total) * 100;
                                        return (
                                            <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                                                <td className="p-4 font-medium text-gray-900">{row.date}</td>
                                                <td className="p-4">
                                                    <span className="text-green-600 font-semibold">{row.present}</span>
                                                </td>
                                                <td className="p-4">
                                                    <span className="text-red-600 font-semibold">{row.absent}</span>
                                                </td>
                                                <td className="p-4 text-orange-600 font-semibold">{row.late}</td>
                                                <td className="p-4 text-blue-600 font-semibold">{row.overtime}</td>
                                                <td className="p-4">
                                                    <span className={`font-semibold ${rate >= 90 ? 'text-green-600' : 'text-red-600'}`}>
                                                        {rate.toFixed(1)}%
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}

                        {activeReport === 'payroll' && (
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="text-left p-4 font-semibold text-gray-700">Employee</th>
                                        <th className="text-left p-4 font-semibold text-gray-700">Role</th>
                                        <th className="text-left p-4 font-semibold text-gray-700">Salary (₹)</th>
                                        <th className="text-left p-4 font-semibold text-gray-700">Paid (₹)</th>
                                        <th className="text-left p-4 font-semibold text-gray-700">Due (₹)</th>
                                        <th className="text-left p-4 font-semibold text-gray-700">Status</th>
                                        <th className="text-left p-4 font-semibold text-gray-700">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredData.map((row, index) => (
                                        <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="p-4 font-medium text-gray-900">{row.employee}</td>
                                            <td className="p-4 text-gray-600">{row.role}</td>
                                            <td className="p-4 font-semibold text-gray-900">₹{row.salary.toLocaleString()}</td>
                                            <td className="p-4 text-green-600 font-semibold">₹{row.paid.toLocaleString()}</td>
                                            <td className="p-4 text-red-600 font-semibold">₹{row.due.toLocaleString()}</td>
                                            <td className="p-4">
                                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(row.status)}`}>
                                                    {row.status}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <button className="text-blue-600 hover:text-blue-800 font-medium text-sm">
                                                    View Details
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}

                        {activeReport === 'productivity' && (
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="text-left p-4 font-semibold text-gray-700">Site</th>
                                        <th className="text-left p-4 font-semibold text-gray-700">Progress</th>
                                        <th className="text-left p-4 font-semibold text-gray-700">Target</th>
                                        <th className="text-left p-4 font-semibold text-gray-700">Efficiency</th>
                                        <th className="text-left p-4 font-semibold text-gray-700">Workers</th>
                                        <th className="text-left p-4 font-semibold text-gray-700">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredData.map((row, index) => (
                                        <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="p-4 font-medium text-gray-900">{row.site}</td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-16 bg-gray-200 rounded-full h-2">
                                                        <div
                                                            className="bg-blue-600 h-2 rounded-full"
                                                            style={{ width: `${row.progress}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className="font-semibold">{row.progress}%</span>
                                                </div>
                                            </td>
                                            <td className="p-4 text-gray-600">{row.target}%</td>
                                            <td className="p-4">
                                                <span className={`font-semibold ${getEfficiencyColor(row.efficiency)}`}>
                                                    {row.efficiency}%
                                                </span>
                                            </td>
                                            <td className="p-4 text-gray-700">{row.workers}</td>
                                            <td className="p-4">
                                                {row.progress >= row.target ? (
                                                    <span className="flex items-center gap-1 text-green-600 font-semibold">
                                                        <FiCheckCircle />
                                                        On Track
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-1 text-orange-600 font-semibold">
                                                        <FiAlertTriangle />
                                                        Behind
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}

                        {activeReport === 'safety' && (
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="text-left p-4 font-semibold text-gray-700">Site</th>
                                        <th className="text-left p-4 font-semibold text-gray-700">Incidents</th>
                                        <th className="text-left p-4 font-semibold text-gray-700">Inspections</th>
                                        <th className="text-left p-4 font-semibold text-gray-700">Compliance</th>
                                        <th className="text-left p-4 font-semibold text-gray-700">Training Completed</th>
                                        <th className="text-left p-4 font-semibold text-gray-700">Safety Rating</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredData.map((row, index) => (
                                        <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="p-4 font-medium text-gray-900">{row.site}</td>
                                            <td className="p-4">
                                                <span className={`font-semibold ${row.incidents === 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                    {row.incidents}
                                                </span>
                                            </td>
                                            <td className="p-4 text-blue-600 font-semibold">{row.inspections}</td>
                                            <td className="p-4">
                                                <span className={`font-semibold ${row.compliance >= 95 ? 'text-green-600' : 'text-yellow-600'}`}>
                                                    {row.compliance}%
                                                </span>
                                            </td>
                                            <td className="p-4 text-purple-600 font-semibold">{row.training}</td>
                                            <td className="p-4">
                                                {row.compliance >= 95 ? (
                                                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                                                        Excellent
                                                    </span>
                                                ) : row.compliance >= 90 ? (
                                                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                                                        Good
                                                    </span>
                                                ) : (
                                                    <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                                                        Needs Improvement
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}

                        {activeReport === 'materials' && (
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="text-left p-4 font-semibold text-gray-700">Material</th>
                                        <th className="text-left p-4 font-semibold text-gray-700">Used</th>
                                        <th className="text-left p-4 font-semibold text-gray-700">Stock</th>
                                        <th className="text-left p-4 font-semibold text-gray-700">Cost (₹)</th>
                                        <th className="text-left p-4 font-semibold text-gray-700">Wastage</th>
                                        <th className="text-left p-4 font-semibold text-gray-700">Stock Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredData.map((row, index) => (
                                        <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="p-4 font-medium text-gray-900">{row.material}</td>
                                            <td className="p-4 text-blue-600 font-semibold">{row.used}</td>
                                            <td className="p-4 text-gray-700">{row.stock}</td>
                                            <td className="p-4 font-semibold text-gray-900">₹{row.cost.toLocaleString()}</td>
                                            <td className="p-4">
                                                <span className={`font-semibold ${parseFloat(row.wastage) <= 2 ? 'text-green-600' : 'text-red-600'}`}>
                                                    {row.wastage}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                {parseFloat(row.wastage) <= 2 ? (
                                                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                                                        Optimal
                                                    </span>
                                                ) : (
                                                    <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                                                        High Wastage
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {/* Report Summary Charts */}
                    <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-gray-50 rounded-xl p-6">
                            <h4 className="text-lg font-semibold text-gray-900 mb-4">Quick Insights</h4>
                            <div className="space-y-3">
                                {Object.entries(currentReport.summary).map(([key, value]) => (
                                    <div key={key} className="flex justify-between items-center">
                                        <span className="text-gray-600 capitalize">
                                            {key.replace(/([A-Z])/g, ' $1').trim()}:
                                        </span>
                                        <span className="font-semibold text-gray-900">
                                            {typeof value === 'number' && key.includes('Percentage')
                                                ? `${value}%`
                                                : typeof value === 'number' && key.includes('Cost')
                                                    ? `₹${value.toLocaleString()}`
                                                    : value
                                            }
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-gray-50 rounded-xl p-6">
                            <h4 className="text-lg font-semibold text-gray-900 mb-4">Export Options</h4>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => exportReport('pdf')}
                                    className="bg-red-600 text-white p-3 rounded-lg hover:bg-red-700 transition-colors font-medium"
                                >
                                    PDF Report
                                </button>
                                <button
                                    onClick={() => exportReport('excel')}
                                    className="bg-green-600 text-white p-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
                                >
                                    Excel Sheet
                                </button>
                                <button
                                    onClick={() => exportReport('csv')}
                                    className="bg-purple-600 text-white p-3 rounded-lg hover:bg-purple-700 transition-colors font-medium"
                                >
                                    CSV Data
                                </button>
                                <button
                                    onClick={printReport}
                                    className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                                >
                                    Print Report
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportsPage;