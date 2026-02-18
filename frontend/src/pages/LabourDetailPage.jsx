import React, { useState } from 'react';
import {
    FiArrowLeft,
    FiEdit,
    FiPhone,
    FiMail,
    FiMapPin,
    FiCalendar,
    // FiDollarSign,
    // FiRupeeSign,
    FiDownload,
    FiPrinter,
    // FiMessageSquare,
    // FiAward,
    FiUser,
    FiClock,
    FiTrendingUp,
    FiBarChart2
} from 'react-icons/fi';
import { BiRupee } from "react-icons/bi";
import {
    FaHardHat,
    FaIdCard,
    // FaUserTie,
    FaTools,
    FaShieldAlt,
    FaFileContract
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const LabourDetailPage = () => {
    // const { id } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');

    // Sample labour data - in real app, this would come from API
    const labourData = {
        id: 1,
        photo: "👷",
        firstName: "Rajesh",
        lastName: "Kumar",
        fatherName: "Suresh Kumar",
        dateOfBirth: "1990-05-15",
        gender: "Male",
        maritalStatus: "Married",
        nationality: "Indian",

        // Contact Information
        phone: "+91 9876543210",
        alternatePhone: "+91 9876543211",
        email: "rajesh.kumar@email.com",
        emergencyContact: "Priya Kumar",
        emergencyPhone: "+91 9876543212",

        // Address Information
        currentAddress: "123 Worker Colony, Site Area, Delhi Industrial Zone",
        permanentAddress: "456 Village Road, Bihar 845101",
        city: "Delhi",
        state: "Delhi",
        pincode: "110045",

        // Employment Details
        employeeId: "EMP00123",
        role: "Mason",
        category: "Skilled",
        site: "Sunrise Residency",
        department: "Civil",
        joinDate: "2024-12-01",
        workType: "full-time",
        shift: "day",
        status: "active",

        // Bank & Payment Details
        bankName: "State Bank of India",
        accountNumber: "123456789012",
        ifscCode: "SBIN0001234",
        accountHolderName: "Rajesh Kumar",
        panNumber: "ABCDE1234F",
        salary: 18000,
        paid: 15000,
        paymentMethod: "bank-transfer",

        // Skills & Qualifications
        skills: ["Brick Work", "Plastering", "Concrete Mixing", "Tile Laying"],
        experience: "8 years",
        qualification: "ITI Masonry",
        certifications: ["Safety Training", "Advanced Masonry"],

        // Attendance & Performance
        attendance: [
            { date: "2025-01-20", status: "present", hours: 8, overtime: 2 },
            { date: "2025-01-19", status: "present", hours: 8, overtime: 0 },
            { date: "2025-01-18", status: "absent", hours: 0, overtime: 0 },
            { date: "2025-01-17", status: "present", hours: 8, overtime: 1 },
            { date: "2025-01-16", status: "present", hours: 8, overtime: 0 },
            { date: "2025-01-15", status: "present", hours: 8, overtime: 2 },
            { date: "2025-01-14", status: "present", hours: 8, overtime: 0 }
        ],

        // Performance Metrics
        performance: {
            attendanceRate: 85,
            productivity: 90,
            safetyScore: 95,
            overtimeHours: 15
        },

        // Documents
        documents: [
            { name: "Aadhar Card", type: "ID Proof", uploadDate: "2024-12-01", verified: true },
            { name: "PAN Card", type: "ID Proof", uploadDate: "2024-12-01", verified: true },
            { name: "Bank Passbook", type: "Financial", uploadDate: "2024-12-02", verified: true },
            { name: "ITI Certificate", type: "Education", uploadDate: "2024-12-03", verified: false }
        ]
    };

    // Calculate statistics
    const stats = {
        totalDays: labourData.attendance.length,
        presentDays: labourData.attendance.filter(a => a.status === 'present').length,
        absentDays: labourData.attendance.filter(a => a.status === 'absent').length,
        totalHours: labourData.attendance.reduce((sum, a) => sum + a.hours, 0),
        totalOvertime: labourData.attendance.reduce((sum, a) => sum + a.overtime, 0),
        attendanceRate: Math.round((labourData.attendance.filter(a => a.status === 'present').length / labourData.attendance.length) * 100)
    };

    const getStatusColor = (status) => {
        return status === 'present' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
    };

    const getVerificationColor = (verified) => {
        return verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
    };

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
                            {/* <h1 className="text-3xl font-bold text-gray-900">Labour Details</h1> */}
                            <h1 className="text-xl sm:text-2xl font-semibold bg-gradient-to-r from-slate-900 via-blue-800 to-purple-700 bg-clip-text text-transparent">
                                Labour Details
                            </h1>
                            <p className="text-gray-600">Complete profile and performance overview</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="flex items-center gap-2 bg-white text-gray-700 px-4 py-3 rounded-2xl shadow-sm hover:shadow-md transition-all border border-gray-200">
                            <FiPrinter className="text-lg" />
                            Print
                        </button>
                        <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-2xl shadow-lg hover:shadow-xl hover:bg-blue-700 transition-all">
                            <FiEdit className="text-lg" />
                            Edit Profile
                        </button>
                    </div>
                </div>

                {/* Profile Header Card */}
                <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
                    <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
                        {/* Photo and Basic Info */}
                        <div className="flex items-center gap-6">
                            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-4xl text-white">
                                {labourData.photo}
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">
                                    {labourData.firstName} {labourData.lastName}
                                </h2>
                                <p className="text-gray-600 flex items-center gap-2 mt-1">
                                    <FaHardHat className="text-orange-500" />
                                    {labourData.role} • {labourData.site}
                                </p>
                                <div className="flex items-center gap-4 mt-3 text-sm">
                                    <span className="flex items-center gap-1 text-gray-600">
                                        <FiPhone />
                                        {labourData.phone}
                                    </span>
                                    <span className="flex items-center gap-1 text-gray-600">
                                        <FaIdCard />
                                        {labourData.employeeId}
                                    </span>
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${labourData.status === 'active'
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-red-100 text-red-800'
                                        }`}>
                                        {labourData.status}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="text-center p-4 bg-blue-50 rounded-xl">
                                <div className="text-2xl font-bold text-blue-700">{stats.attendanceRate}%</div>
                                <div className="text-sm text-gray-600">Attendance</div>
                            </div>
                            <div className="text-center p-4 bg-green-50 rounded-xl">
                                <div className="text-2xl font-bold text-green-700">{stats.totalHours}h</div>
                                <div className="text-sm text-gray-600">Work Hours</div>
                            </div>
                            <div className="text-center p-4 bg-orange-50 rounded-xl">
                                <div className="text-2xl font-bold text-orange-700">{stats.totalOvertime}h</div>
                                <div className="text-sm text-gray-600">Overtime</div>
                            </div>
                            <div className="text-center p-4 bg-purple-50 rounded-xl">
                                <div className="text-2xl font-bold text-purple-700">₹{labourData.salary}</div>
                                <div className="text-sm text-gray-600">Monthly Salary</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs Navigation */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
                    <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl">
                        {[
                            { key: 'overview', label: 'Overview', icon: FiUser },
                            { key: 'attendance', label: 'Attendance', icon: FiCalendar },
                            { key: 'payment', label: 'Payment', icon: BiRupee },
                            { key: 'documents', label: 'Documents', icon: FaFileContract },
                            { key: 'performance', label: 'Performance', icon: FiTrendingUp }
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
                                {/* Personal Information */}
                                <div className="space-y-6">
                                    <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                                        <FiUser className="text-blue-600" />
                                        Personal Information
                                    </h3>
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-600">Full Name</label>
                                                <p className="text-gray-900 font-medium mt-1">
                                                    {labourData.firstName} {labourData.lastName}
                                                </p>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-600">Father's Name</label>
                                                <p className="text-gray-900 font-medium mt-1">{labourData.fatherName}</p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-600">Date of Birth</label>
                                                <p className="text-gray-900 font-medium mt-1">{labourData.dateOfBirth}</p>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-600">Gender</label>
                                                <p className="text-gray-900 font-medium mt-1 capitalize">{labourData.gender}</p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-600">Marital Status</label>
                                                <p className="text-gray-900 font-medium mt-1 capitalize">{labourData.maritalStatus}</p>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-600">Nationality</label>
                                                <p className="text-gray-900 font-medium mt-1">{labourData.nationality}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Contact Information */}
                                <div className="space-y-6">
                                    <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                                        <FiPhone className="text-green-600" />
                                        Contact Information
                                    </h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-600">Phone Number</label>
                                            <p className="text-gray-900 font-medium mt-1 flex items-center gap-2">
                                                <FiPhone className="text-gray-400" />
                                                {labourData.phone}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-600">Alternate Phone</label>
                                            <p className="text-gray-900 font-medium mt-1 flex items-center gap-2">
                                                <FiPhone className="text-gray-400" />
                                                {labourData.alternatePhone}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-600">Email</label>
                                            <p className="text-gray-900 font-medium mt-1 flex items-center gap-2">
                                                <FiMail className="text-gray-400" />
                                                {labourData.email}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-600">Emergency Contact</label>
                                            <p className="text-gray-900 font-medium mt-1">
                                                {labourData.emergencyContact} - {labourData.emergencyPhone}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Address Information */}
                            <div className="border-t pt-6">
                                <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2 mb-4">
                                    <FiMapPin className="text-orange-600" />
                                    Address Information
                                </h3>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    <div>
                                        <h4 className="font-medium text-gray-900 mb-2">Current Address</h4>
                                        <p className="text-gray-700 leading-relaxed">{labourData.currentAddress}</p>
                                        <p className="text-gray-600 mt-2">
                                            {labourData.city}, {labourData.state} - {labourData.pincode}
                                        </p>
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-gray-900 mb-2">Permanent Address</h4>
                                        <p className="text-gray-700 leading-relaxed">{labourData.permanentAddress}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Skills & Qualifications */}
                            <div className="border-t pt-6">
                                <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2 mb-4">
                                    <FaTools className="text-purple-600" />
                                    Skills & Qualifications
                                </h3>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    <div>
                                        <h4 className="font-medium text-gray-900 mb-3">Skills</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {labourData.skills.map(skill => (
                                                <span
                                                    key={skill}
                                                    className="px-3 py-2 bg-blue-100 text-blue-800 rounded-xl text-sm font-medium"
                                                >
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-gray-900 mb-3">Certifications</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {labourData.certifications.map(cert => (
                                                <span
                                                    key={cert}
                                                    className="px-3 py-2 bg-green-100 text-green-800 rounded-xl text-sm font-medium"
                                                >
                                                    {cert}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600">Experience</label>
                                        <p className="text-gray-900 font-medium mt-1">{labourData.experience}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600">Qualification</label>
                                        <p className="text-gray-900 font-medium mt-1">{labourData.qualification}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Attendance Tab */}
                    {activeTab === 'attendance' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <h3 className="text-xl font-semibold text-gray-900">Attendance Records</h3>
                                <div className="text-sm text-gray-600">
                                    Last 7 days • {stats.presentDays} Present • {stats.absentDays} Absent
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="text-left p-4 font-semibold text-gray-700">Date</th>
                                            <th className="text-left p-4 font-semibold text-gray-700">Status</th>
                                            <th className="text-left p-4 font-semibold text-gray-700">Work Hours</th>
                                            <th className="text-left p-4 font-semibold text-gray-700">Overtime</th>
                                            <th className="text-left p-4 font-semibold text-gray-700">Total Hours</th>
                                            <th className="text-left p-4 font-semibold text-gray-700">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {labourData.attendance.map((record, index) => (
                                            <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                                                <td className="p-4 font-medium text-gray-900">{record.date}</td>
                                                <td className="p-4">
                                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(record.status)}`}>
                                                        {record.status}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-gray-700">{record.hours}h</td>
                                                <td className="p-4 text-orange-600 font-medium">{record.overtime}h</td>
                                                <td className="p-4 font-semibold text-blue-600">{record.hours + record.overtime}h</td>
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

                            {/* Attendance Summary */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
                                <div className="bg-blue-50 p-4 rounded-xl text-center">
                                    <div className="text-2xl font-bold text-blue-700">{stats.attendanceRate}%</div>
                                    <div className="text-sm text-gray-600">Attendance Rate</div>
                                </div>
                                <div className="bg-green-50 p-4 rounded-xl text-center">
                                    <div className="text-2xl font-bold text-green-700">{stats.totalHours}h</div>
                                    <div className="text-sm text-gray-600">Total Work Hours</div>
                                </div>
                                <div className="bg-orange-50 p-4 rounded-xl text-center">
                                    <div className="text-2xl font-bold text-orange-700">{stats.totalOvertime}h</div>
                                    <div className="text-sm text-gray-600">Total Overtime</div>
                                </div>
                                <div className="bg-purple-50 p-4 rounded-xl text-center">
                                    <div className="text-2xl font-bold text-purple-700">{stats.presentDays}/{stats.totalDays}</div>
                                    <div className="text-sm text-gray-600">Present Days</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Payment Tab */}
                    {activeTab === 'payment' && (
                        <div className="space-y-8">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Salary Information */}
                                <div className="space-y-6">
                                    <h3 className="text-xl font-semibold text-gray-900">Salary Information</h3>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                                            <span className="text-gray-700">Monthly Salary</span>
                                            <span className="text-2xl font-bold text-green-600">₹{labourData.salary}</span>
                                        </div>
                                        <div className="flex justify-between items-center p-4 bg-blue-50 rounded-xl">
                                            <span className="text-gray-700">Amount Paid</span>
                                            <span className="text-xl font-bold text-blue-600">₹{labourData.paid}</span>
                                        </div>
                                        <div className="flex justify-between items-center p-4 bg-red-50 rounded-xl">
                                            <span className="text-gray-700">Pending Amount</span>
                                            <span className="text-xl font-bold text-red-600">₹{labourData.salary - labourData.paid}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Bank Details */}
                                <div className="space-y-6">
                                    <h3 className="text-xl font-semibold text-gray-900">Bank Details</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-600">Bank Name</label>
                                            <p className="text-gray-900 font-medium mt-1">{labourData.bankName}</p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-600">Account Number</label>
                                                <p className="text-gray-900 font-medium mt-1">{labourData.accountNumber}</p>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-600">IFSC Code</label>
                                                <p className="text-gray-900 font-medium mt-1">{labourData.ifscCode}</p>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-600">Account Holder</label>
                                            <p className="text-gray-900 font-medium mt-1">{labourData.accountHolderName}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-600">PAN Number</label>
                                            <p className="text-gray-900 font-medium mt-1">{labourData.panNumber}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Payment History */}
                            <div className="border-t pt-6">
                                <h3 className="text-xl font-semibold text-gray-900 mb-4">Recent Payments</h3>
                                <div className="space-y-4">
                                    {[
                                        { date: "2025-01-15", amount: 15000, type: "Salary", status: "Completed" },
                                        { date: "2024-12-15", amount: 18000, type: "Salary", status: "Completed" },
                                        { date: "2024-11-15", amount: 18000, type: "Salary", status: "Completed" }
                                    ].map((payment, index) => (
                                        <div key={index} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                                            <div>
                                                <div className="font-medium text-gray-900">{payment.type}</div>
                                                <div className="text-sm text-gray-600">{payment.date}</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-bold text-green-600">₹{payment.amount}</div>
                                                <div className="text-sm text-green-600">{payment.status}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Documents Tab */}
                    {activeTab === 'documents' && (
                        <div className="space-y-6">
                            <h3 className="text-xl font-semibold text-gray-900">Documents & Verification</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {labourData.documents.map((doc, index) => (
                                    <div key={index} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <FaFileContract className="text-blue-600 text-xl" />
                                                <div>
                                                    <h4 className="font-semibold text-gray-900">{doc.name}</h4>
                                                    <p className="text-sm text-gray-600">{doc.type}</p>
                                                </div>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getVerificationColor(doc.verified)}`}>
                                                {doc.verified ? 'Verified' : 'Pending'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm text-gray-600">
                                            <span>Uploaded: {doc.uploadDate}</span>
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

                    {/* Performance Tab */}
                    {activeTab === 'performance' && (
                        <div className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div className="bg-white border border-gray-200 rounded-xl p-6 text-center">
                                    <FiBarChart2 className="text-3xl text-blue-600 mx-auto mb-3" />
                                    <div className="text-2xl font-bold text-gray-900">{labourData.performance.attendanceRate}%</div>
                                    <div className="text-sm text-gray-600">Attendance Rate</div>
                                </div>
                                <div className="bg-white border border-gray-200 rounded-xl p-6 text-center">
                                    <FiTrendingUp className="text-3xl text-green-600 mx-auto mb-3" />
                                    <div className="text-2xl font-bold text-gray-900">{labourData.performance.productivity}%</div>
                                    <div className="text-sm text-gray-600">Productivity</div>
                                </div>
                                <div className="bg-white border border-gray-200 rounded-xl p-6 text-center">
                                    <FaShieldAlt className="text-3xl text-orange-600 mx-auto mb-3" />
                                    <div className="text-2xl font-bold text-gray-900">{labourData.performance.safetyScore}%</div>
                                    <div className="text-sm text-gray-600">Safety Score</div>
                                </div>
                                <div className="bg-white border border-gray-200 rounded-xl p-6 text-center">
                                    <FiClock className="text-3xl text-purple-600 mx-auto mb-3" />
                                    <div className="text-2xl font-bold text-gray-900">{labourData.performance.overtimeHours}h</div>
                                    <div className="text-sm text-gray-600">Overtime (Monthly)</div>
                                </div>
                            </div>

                            {/* Performance Metrics */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <h4 className="text-lg font-semibold text-gray-900">Performance Overview</h4>
                                    <div className="space-y-3">
                                        <div>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span>Work Quality</span>
                                                <span>95%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div className="bg-green-600 h-2 rounded-full" style={{ width: '95%' }}></div>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span>Teamwork</span>
                                                <span>88%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '88%' }}></div>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span>Punctuality</span>
                                                <span>92%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div className="bg-orange-600 h-2 rounded-full" style={{ width: '92%' }}></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="text-lg font-semibold text-gray-900">Recent Feedback</h4>
                                    <div className="space-y-3">
                                        <div className="p-4 bg-green-50 rounded-xl">
                                            <p className="text-sm text-gray-700">"Excellent work on the foundation concrete pouring. Maintains high quality standards."</p>
                                            <p className="text-xs text-gray-500 mt-2">- Site Supervisor, 2 days ago</p>
                                        </div>
                                        <div className="p-4 bg-blue-50 rounded-xl">
                                            <p className="text-sm text-gray-700">"Good teamwork demonstrated during the slab work. Helpful to fellow workers."</p>
                                            <p className="text-xs text-gray-500 mt-2">- Project Manager, 1 week ago</p>
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

export default LabourDetailPage;