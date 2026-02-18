import React, { useState } from 'react';
import {
    HiOutlinePlus,
    HiOutlineViewList,
    HiOutlineCurrencyRupee,
    HiChevronRight,
    HiOutlineDocumentText,
    HiOutlineCalendar, 
    HiOutlineChartBar,
    HiOutlineUser,
    // HiOutlineBuilding,
    HiOutlinePhone,
    // HiOutlineMail,
    HiOutlineLocationMarker
} from 'react-icons/hi';
import {
    FaRupeeSign,
    // FaRegClock,
    // FaCheckCircle,
    // FaExclamationTriangle,
    // FaDownload,
    FaEdit,
    FaShare
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import EditableWorkOrderDrawer from '../components/EditableWorkOrderDrawer';
// import { Download } from 'lucide-react';
import { FiFileText } from 'react-icons/fi';

const VendorDetailsUI = () => {
    const navigate = useNavigate();

    const [workOrders] = useState([
        {
            id: 'WO-2024-25-000683',
            vendor: 'AK Construction Works',
            project: 'APEX HOSPITALS - West Delhi',
            totalContractValue: '₹37,760.00',
            earnedValue: '₹0.00',
            payableStatus: 'Pending',
            createdAt: '30 Sep, 2024',
            progress: 65,
            status: 'Active',
            dueDate: '15 Dec, 2024',
            contactPerson: 'Rajesh Kumar',
            phone: '+91 98765 43210'
        },
    ]);

    const vendorInfo = {
        name: 'AK Construction Works',
        type: 'Subcontractor',
        rating: 4.5,
        since: '2022',
        contact: '+91 98765 43210',
        email: 'contact@akconstruction.com',
        address: 'West Delhi, DLF Phase 4, New Delhi',
        totalProjects: 12,
        completedProjects: 8,
        onTimeRate: '94%'
    };

    const hasWorkOrders = workOrders.length > 0;
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const toggleDrawer = () => {
        setIsDrawerOpen(!isDrawerOpen);
    };

    const getStatusColor = (status) => {
        const colors = {
            'Active': 'bg-green-100 text-green-700 border-green-300',
            'Pending': 'bg-amber-100 text-amber-700 border-amber-300',
            'Completed': 'bg-blue-100 text-blue-700 border-blue-300',
            'On Hold': 'bg-red-100 text-red-700 border-red-300'
        };
        return colors[status] || 'bg-gray-100 text-gray-700';
    };

    const getProgressColor = (percentage) => {
        if (percentage < 30) return 'from-red-500 to-orange-500';
        if (percentage < 70) return 'from-amber-500 to-yellow-500';
        return 'from-green-500 to-emerald-600';
    };

    return (
        <div className="min-h-screen  p-8 font-sans">
            <div className="max-w-8xl mx-auto">

                <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start mb-8">
                    <div className="flex items-start space-x-6">

                        <div>
                            <div className="flex items-center space-x-4 mb-3">
                                <h1 className="text-2xl font-normal bg-gradient-to-r from-slate-900 via-blue-800 to-purple-700 bg-clip-text text-transparent ">
                                    {vendorInfo.name}
                                </h1>
                                <span className="bg-blue-100 text-blue-700 text-sm font-semibold px-4 py-2 rounded-2xl border border-blue-200">
                                    {vendorInfo.type}
                                </span>
                            </div>
                            <div className="flex flex-wrap gap-4 text-slate-600 text-sm">
                                <div className="flex items-center">
                                    <HiOutlineUser className="mr-2 text-blue-500" />
                                    Since {vendorInfo.since}
                                </div>
                                <div className="flex items-center">
                                    <HiOutlineChartBar className="mr-2 text-green-500" />
                                    Rating: {vendorInfo.rating}/5
                                </div>
                                <div className="flex items-center">
                                    <HiOutlinePhone className="mr-2 text-purple-500" />
                                    {vendorInfo.contact}
                                </div>
                                <div className="flex items-center">
                                    <HiOutlineLocationMarker className="mr-2 text-amber-500" />
                                    {vendorInfo.address}
                                </div>
                            </div>
                        </div>
                    </div>
                    <button className="mt-4 lg:mt-0 flex items-center bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 py-3 px-6 rounded-2xl text-sm font-semibold transition-all duration-300 hover:shadow-md">
                        <HiOutlineUser className="mr-2 text-lg" />
                        View Vendor Details
                    </button>
                </div>
                {/* Enhanced Breadcrumb */}
                {/* <div className="mb-8 flex items-center space-x-2 text-sm text-slate-600">
                    <span className="hover:text-slate-800 cursor-pointer transition-colors">Vendor</span>
                    <HiChevronRight className="h-4 w-4" />
                    <span className="text-slate-900 font-semibold">{vendorInfo.name}</span>
                </div> */}

                {/* Vendor Header & Financial Summary */}
                <div className="bg-white rounded-3xl  border border-slate-200 p-8 mb-8 backdrop-blur-sm">


                    {/* Enhanced Financial Summary Cards */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                        {/* Card 1: Total Payable Recorded */}
                        <div className="bg-gradient-to-br from-white to-blue-50 border border-blue-200 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                                    <HiOutlineViewList className="h-6 w-6 text-blue-600" />
                                </div>
                                <span className="text-blue-600 text-xs font-semibold bg-blue-100 px-3 py-1 rounded-full">RECORDED</span>
                            </div>
                            <span className="text-slate-600 text-sm font-medium mb-2 block">Total Payable Recorded</span>
                            <div className="flex items-end justify-between">
                                <span className="text-3xl font-black text-slate-900">₹0.00</span>
                                <button className="text-blue-600 hover:text-blue-700 text-sm font-semibold flex items-center group">
                                    View Payables
                                    <HiChevronRight className="ml-1 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </div>

                        {/* Card 2: Payment Due */}
                        <div className="bg-gradient-to-br from-red-50 to-white border border-red-200 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center">
                                    <HiOutlineCurrencyRupee className="h-6 w-6 text-red-600" />
                                </div>
                                <span className="text-red-600 text-xs font-semibold bg-red-100 px-3 py-1 rounded-full">DUE</span>
                            </div>
                            <span className="text-red-600 text-sm font-medium mb-2 block">Payment Due</span>
                            <div className="flex items-end justify-between">
                                <span className="text-3xl font-black text-red-700">₹0.00</span>
                                <button className="text-red-600 hover:text-red-700 text-sm font-semibold flex items-center group">
                                    Record Payment
                                    <HiChevronRight className="ml-1 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </div>

                        {/* Card 3: Advance Left */}
                        <div className="bg-gradient-to-br from-white to-green-50 border border-green-200 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
                                    <FaRupeeSign className="h-5 w-5 text-green-600" />
                                </div>
                                <span className="text-green-600 text-xs font-semibold bg-green-100 px-3 py-1 rounded-full">ADVANCE</span>
                            </div>
                            <span className="text-slate-600 text-sm font-medium mb-2 block">Advance Left (in project)</span>
                            <div className="flex items-end justify-between">
                                <span className="text-3xl font-black text-slate-900">₹0.00</span>
                                <button className="text-blue-600 hover:text-blue-700 text-sm font-semibold flex items-center group">
                                    View History
                                    <HiChevronRight className="ml-1 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Vendor Performance Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white rounded-2xl p-4 shadow-lg border border-slate-200 text-center">
                            <div className="text-2xl font-black text-slate-900">{vendorInfo.totalProjects}</div>
                            <div className="text-xs text-slate-600 font-semibold">Total Projects</div>
                        </div>
                        <div className="bg-white rounded-2xl p-4 shadow-lg border border-slate-200 text-center">
                            <div className="text-2xl font-black text-slate-900">{vendorInfo.completedProjects}</div>
                            <div className="text-xs text-slate-600 font-semibold">Completed</div>
                        </div>
                        <div className="bg-white rounded-2xl p-4 shadow-lg border border-slate-200 text-center">
                            <div className="text-2xl font-black text-slate-900">₹0</div>
                            <div className="text-xs text-slate-600 font-semibold">Pending Payments</div>
                        </div>
                        <div className="bg-white rounded-2xl p-4 shadow-lg border border-slate-200 text-center">
                            <div className="text-2xl font-black text-slate-900">{vendorInfo.onTimeRate}</div>
                            <div className="text-xs text-slate-600 font-semibold">On Time Rate</div>
                        </div>
                    </div>
                </div>

                {/* Work Order Section */}
                <div className="bg-white rounded-3xl  border border-slate-200 overflow-hidden">
                    {/* Enhanced Header */}
                    <div className="border-b border-slate-200 px-8 py-6">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                            <div className="flex items-center space-x-8 mb-4 lg:mb-0">
                                <h2 className="text-2xl font-bold text-slate-900">Work Orders</h2>
                                <div className="flex space-x-1 bg-slate-100 rounded-2xl p-1">
                                    <button className="px-4 py-2 rounded-2xl bg-white text-slate-900 font-semibold text-sm shadow-sm">
                                        All
                                    </button>
                                    <button className="px-4 py-2 rounded-2xl text-slate-600 hover:text-slate-900 font-medium text-sm">
                                        Active
                                    </button>
                                    <button className="px-4 py-2 rounded-2xl text-slate-600 hover:text-slate-900 font-medium text-sm">
                                        Completed
                                    </button>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            {hasWorkOrders && (
                                <div className="flex items-center space-x-3">
                                    {/* Export Button - Normal style */}
                                    {/* <button className="flex items-center border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 py-2 px-4 rounded-lg text-sm font-medium transition-colors duration-300">
                                        <FaDownload className="mr-2" />
                                        Export
                                    </button> */}

                                    <button
                                        // onClick={handleExportExcel}
                                        className="flex items-center border border-gray-300 text-gray-700 hover:bg-gray-100 py-2 px-4 rounded-md text-sm font-medium w-full sm:w-auto justify-center"
                                    >
                                        <FiFileText className="h-4 w-4 mr-2" />
                                        Export
                                    </button>

                                    {/* Add Work Order Button */}
                                    <button
                                        onClick={() => navigate('/CreateWorkOrder')}
                                        className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
                                    >
                                        <HiOutlinePlus size={20} />
                                        Add Work Order
                                    </button>
                                </div>

                            )}
                        </div>
                    </div>

                    {/* Conditional Rendering based on data */}
                    {hasWorkOrders ? (
                        /* Enhanced WORK ORDERS LIST VIEW */
                        <div className="p-6">
                            <div className="overflow-x-auto rounded-2xl border border-slate-200">
                                <table className="min-w-full divide-y divide-slate-200">
                                    <thead className="bg-slate-50">
                                        <tr>
                                            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Work Order</th>
                                            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Project</th>
                                            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Contract Value</th>
                                            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Progress</th>
                                            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Status</th>
                                            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-slate-200">
                                        {workOrders.map((order) => (
                                            <tr key={order.id} className="hover:bg-blue-50/50 transition-colors duration-300 group">
                                                <td className="px-6 py-4">
                                                    <div
                                                        onClick={toggleDrawer}
                                                        className="flex items-center space-x-3 cursor-pointer group/order"
                                                    >

                                                        <div>
                                                            <div className="font-semibold text-slate-900 group-hover/order:text-blue-600 transition-colors">
                                                                {order.id}
                                                            </div>
                                                            <div className="flex items-center text-slate-500 text-sm mt-1">
                                                                <HiOutlineCalendar className="mr-2" />
                                                                {order.createdAt}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-medium text-slate-900">{order.project}</div>
                                                    <div className="text-sm text-slate-500">{order.contactPerson}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-bold text-slate-900">{order.totalContractValue}</div>
                                                    <div className="text-sm text-slate-500">Earned: {order.earnedValue}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="w-20 bg-slate-200 rounded-full h-2">
                                                            <div
                                                                className={`h-2 rounded-full bg-gradient-to-r ${getProgressColor(order.progress)}`}
                                                                style={{ width: `${order.progress}%` }}
                                                            ></div>
                                                        </div>
                                                        <span className="text-sm font-semibold text-slate-700">{order.progress}%</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col space-y-2">
                                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(order.status)}`}>
                                                            {order.status}
                                                        </span>
                                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-amber-100 text-amber-800">
                                                            {order.payableStatus}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center space-x-2">
                                                        <button className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-2xl text-sm font-semibold transition-all duration-300 transform hover:scale-105">
                                                            Record Payable
                                                        </button>
                                                        <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all duration-300">
                                                            <FaEdit className="text-sm" />
                                                        </button>
                                                        <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all duration-300">
                                                            <FaShare className="text-sm" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        /* Enhanced EMPTY STATE VIEW */
                        <div className="flex flex-col items-center justify-center p-16 text-center">
                            <div className="mb-6 w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-3xl flex items-center justify-center shadow-lg">
                                <HiOutlineDocumentText className="h-12 w-12 text-blue-500" />
                            </div>
                            <h3 className="text-3xl font-black bg-gradient-to-r from-slate-900 to-blue-800 bg-clip-text text-transparent mb-4">
                                Add Your First Work Order
                            </h3>
                            <p className="max-w-xl text-slate-600 text-lg mb-8 leading-relaxed">
                                Work orders streamline projects by clarifying tasks, tracking progress, and ensuring budget control.
                                Create your first work order to get started with efficient project management.
                            </p>
                            <button
                                onClick={() => navigate('/CreateWorkOrder')}
                                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-lg font-semibold rounded-2xl shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 transition-all duration-300"
                            >
                                <HiOutlinePlus className="h-6 w-6 mr-3" />
                                Add Work Order
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <EditableWorkOrderDrawer
                isOpen={isDrawerOpen}
                onClose={toggleDrawer}
            />
        </div>
    );
};

export default VendorDetailsUI;