import React, { useState } from 'react';
import {
    IoIosArrowForward,
    IoIosArrowDown,
    IoIosBusiness,
    IoIosCard,
    IoIosCalendar,
   
    IoIosDownload,
    IoIosAddCircleOutline
} from "react-icons/io";
import {
    FaRupeeSign,
    // FaHistory,
    FaFileInvoice,
    FaChartLine,
    FaBuilding,
    FaMapMarkerAlt,
    FaPhone,
    FaEnvelope
} from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
// import AddNewMember from '../components/AddNewMember';
import AddNewProject from '../components/AddNewProject';

const VendorPaymentDashboard = () => {
    const [activeTab, setActiveTab] = useState("Projects");
    const [expandedProject] = useState(null);

    const projectsData = [
        {
            id: 1,
            project: 'APEX HOSPITALS',
            location: 'West Delhi, DLF Phase 4',
            advanceLeft: '₹0.00',
            paymentDue: '₹0.00',
            status: 'Active',
            progress: 75,
            contact: '+91 98765 43210',
            email: 'contact@apexhospitals.com',
            lastPayment: '15 Dec 2024',
            nextPayment: '30 Jan 2024'
        },
        {
            id: 2,
            project: 'METRO MALL CONSTRUCTION',
            location: 'South Delhi, Saket',
            advanceLeft: '₹50,000.00',
            paymentDue: '₹2,50,000.00',
            status: 'Pending',
            progress: 45,
            contact: '+91 87654 32109',
            email: 'info@metromall.com',
            lastPayment: '05 Dec 2024',
            nextPayment: '20 Jan 2024'
        },
    ];

    const vendorInfo = {
        name: 'AK Construction Works',
        type: 'SubContractor',
        rating: 4.5,
        since: '2022',
        totalProjects: 12,
        completedProjects: 8
    };

    const navigate = useNavigate();

    const getStatusColor = (status) => {
        const colors = {
            'Active': 'bg-green-100 text-green-700 border-green-300',
            'Pending': 'bg-amber-100 text-amber-700 border-amber-300',
            'Completed': 'bg-blue-100 text-blue-700 border-blue-300',
            'On Hold': 'bg-red-100 text-red-700 border-red-300'
        };
        return colors[status] || 'bg-gray-100 text-gray-700';
    };

    // const getProgressColor = (percentage) => {
    //     if (percentage < 30) return 'from-red-500 to-orange-500';
    //     if (percentage < 70) return 'from-amber-500 to-yellow-500';
    //     return 'from-green-500 to-emerald-600';
    // };

    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    // const [show, setShow] = useState(false);


    const toggleDrawer = () => {
        setIsDrawerOpen(!isDrawerOpen);
    };

    return (
        <div className="min-h-screen  py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Enhanced Header */}
                <div className="mb-8">
                    <div className='flex flex-col lg:flex-row lg:justify-between lg:items-center mb-8'>
                        <div>
                            <h1 className="text-2xl font-black bg-gradient-to-r from-slate-900 via-blue-800 to-purple-700 bg-clip-text text-transparent mb-2">
                                {vendorInfo.name}
                            </h1>
                            <div className="flex items-center space-x-4 text-slate-600">
                                <span className="flex items-center">
                                    <IoIosBusiness className="mr-2 text-blue-500" />
                                    {vendorInfo.type}
                                </span>
                                <span className="flex items-center">
                                    <FaChartLine className="mr-2 text-green-500" />
                                    Rating: {vendorInfo.rating}/5
                                </span>
                                <span className="flex items-center">
                                    <IoIosCalendar className="mr-2 text-purple-500" />
                                    Since {vendorInfo.since}
                                </span>
                            </div>
                        </div>
                        <div className='flex gap-3 mt-4 lg:mt-0'>
                            {/* <button className="flex items-center bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 py-3 px-6 rounded-md text-sm font-semibold transition-all duration-300 hover:shadow-md">
                                <IoIosEye className="mr-2 text-lg" />
                                Vendor Details
                            </button> */}
                            {/* <button className="flex items-center bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 px-6 rounded-2xl text-sm font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300">
                                <IoIosAddCircle className="mr-2 text-lg" />
                                Add to Projects
                            </button> */}

                            <button
                                onClick={toggleDrawer}
                                className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-lg font-medium shadow-md hover:bg-blue-700 transition-colors"
                            >
                                <IoIosAddCircleOutline size={20} />
                                Add New Project
                            </button>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-6'>
                        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
                            <div className='flex justify-between items-start mb-4'>
                                <div className="flex items-center">
                                    <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center mr-4">
                                        <FaRupeeSign className="text-2xl text-red-500" />
                                    </div>
                                    <div>
                                        <h2 className="text-sm font-semibold text-red-700">Total Payment Due</h2>
                                        <p className="text-3xl font-black text-slate-900 mt-1">₹ 0.00</p>
                                    </div>
                                </div>
                                <button
                                    // onClick={() => navigate('/record-payment')}
                                    className="flex items-center text-blue-600 hover:text-blue-800 font-semibold text-sm transition-colors group"
                                >
                                    Record Payment
                                    <IoIosArrowForward className="ml-1 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-2">
                                <div className="bg-red-500 h-2 rounded-full" style={{ width: '0%' }}></div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
                            <div className='flex justify-between items-start mb-4'>
                                <div className="flex items-center">
                                    <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center mr-4">
                                        <IoIosCard className="text-2xl text-green-500" />
                                    </div>
                                    <div>
                                        <h2 className="text-sm font-semibold text-green-700">Total Advances</h2>
                                        <p className="text-3xl font-black text-slate-900 mt-1">₹ 0.00</p>
                                    </div>
                                </div>
                                <button className="flex items-center text-blue-600 hover:text-blue-800 font-semibold text-sm transition-colors group">
                                    View History
                                    <IoIosArrowForward className="ml-1 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-2">
                                <div className="bg-green-500 h-2 rounded-full" style={{ width: '0%' }}></div>
                            </div>
                        </div>
                    </div>

                    {/* Additional Stats */}

                </div>

                {/* Main Content */}
                <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
                    {/* Enhanced Tabs */}
                    <div className="border-b border-slate-200 px-6">
                        <div className="flex gap-8">
                            {["Projects", "Work Order", "Invoices", "History"].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`relative py-4 text-sm font-semibold transition-all duration-300 flex items-center
                                              ${activeTab === tab
                                            ? "text-blue-600"
                                            : "text-slate-700 hover:text-slate-900"
                                        }`}
                                >
                                    {tab}
                                    {activeTab === tab && (
                                        <span className="absolute left-0 bottom-0 w-full h-1 bg-blue-600 rounded-t-full"></span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Table Section */}
                    <div className="p-6">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-slate-200">
                                        <th className="text-left py-4 px-6 font-semibold text-slate-700 text-sm uppercase tracking-wider">Project Details</th>
                                        <th className="text-left py-4 px-6 font-semibold text-slate-700 text-sm uppercase tracking-wider">Status</th>
                                        <th className="text-left py-4 px-6 font-semibold text-slate-700 text-sm uppercase tracking-wider">Advance Left</th>
                                        <th className="text-left py-4 px-6 font-semibold text-slate-700 text-sm uppercase tracking-wider">Payment Due</th>
                                        <th className="text-left py-4 px-6 font-semibold text-slate-700 text-sm uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {projectsData.map((project) => (
                                        <React.Fragment key={project.id}>
                                            <tr className="border-b border-slate-100 hover:bg-blue-50/50 transition-colors duration-300">
                                                <td className="py-4 px-6">
                                                    <div
                                                        className="flex items-center justify-between cursor-pointer group"
                                                        onClick={() => navigate('/VendorDetailsPage')}
                                                    >
                                                        <div className="flex items-center space-x-4">

                                                            <div>
                                                                <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                                                                    {project.project}
                                                                </h3>
                                                                <div className="flex items-center text-slate-600 text-sm mt-1">
                                                                    <FaMapMarkerAlt className="mr-2 text-blue-500" />
                                                                    {project.location}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        {expandedProject === project.id ?
                                                            <IoIosArrowDown className="text-slate-400 group-hover:text-blue-600 transition-colors" /> :
                                                            <IoIosArrowForward className="text-slate-400 group-hover:text-blue-600 transition-colors" />
                                                        }
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(project.status)}`}>
                                                        {project.status}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="font-semibold text-slate-900">{project.advanceLeft}</div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="font-bold text-slate-900 text-lg">{project.paymentDue}</div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center space-x-2">
                                                        <button
                                                            onClick={() => navigate('/PayablesDashboard')}
                                                            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md text-sm font-semibold transition-all duration-300 transform hover:scale-105"
                                                        >
                                                            View Details
                                                        </button>
                                                        <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all duration-300">
                                                            <IoIosDownload className="text-lg" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                            {/* Expanded Details */}
                                            {expandedProject === project.id && (
                                                <tr className="bg-blue-25 border-b border-slate-200">
                                                    <td colSpan="5" className="px-6 py-4">
                                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
                                                            <div className="space-y-2">
                                                                <h4 className="font-semibold text-slate-900 flex items-center">
                                                                    <FaPhone className="mr-2 text-green-500" />
                                                                    Contact
                                                                </h4>
                                                                <p className="text-slate-600">{project.contact}</p>
                                                            </div>
                                                            <div className="space-y-2">
                                                                <h4 className="font-semibold text-slate-900 flex items-center">
                                                                    <FaEnvelope className="mr-2 text-blue-500" />
                                                                    Email
                                                                </h4>
                                                                <p className="text-slate-600">{project.email}</p>
                                                            </div>
                                                            <div className="space-y-2">
                                                                <h4 className="font-semibold text-slate-900 flex items-center">
                                                                    <IoIosCalendar className="mr-2 text-purple-500" />
                                                                    Last Payment
                                                                </h4>
                                                                <p className="text-slate-600">{project.lastPayment}</p>
                                                            </div>
                                                            <div className="space-y-2">
                                                                <h4 className="font-semibold text-slate-900 flex items-center">
                                                                    <FaFileInvoice className="mr-2 text-amber-500" />
                                                                    Next Payment
                                                                </h4>
                                                                <p className="text-slate-600">{project.nextPayment}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Empty State */}
                        {projectsData.length === 0 && (
                            <div className="text-center py-12">
                                <div className="w-24 h-24 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <FaBuilding className="text-3xl text-slate-400" />
                                </div>
                                <h3 className="text-lg font-semibold text-slate-900 mb-2">No Projects Found</h3>
                                <p className="text-slate-600 mb-4">This vendor is not associated with any projects yet.</p>
                                <button className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-2xl font-semibold transition-all duration-300">
                                    Add to Project
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <AddNewProject isOpen={isDrawerOpen} onClose={toggleDrawer} />
        </div>
    );
};

export default VendorPaymentDashboard;