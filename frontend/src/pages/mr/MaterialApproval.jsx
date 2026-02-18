import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
    useGetProjectsQuery,
    useGetAllItemsQuery,
    useGetMaterialRequestQuery,
    useGetVendorsQuery,
} from "../../Reduxe/Api";

import {
    FaClipboardList,
    FaBuilding,
    FaCheckCircle,
    FaClock,
    FaCheck,
    FaTimes,
    FaChevronDown,
    FaChevronRight,
    FaFileAlt,
    FaCalendarAlt,
    FaUser,
    FaBoxes,
    FaRupeeSign,
    FaExclamationTriangle
} from "react-icons/fa";

import { useNavigate } from "react-router-dom";
import ApproveModal from "../../components/ApproveModal";

export default function MaterialRequest() {
    const { data: requests = [], isLoading, refetch } = useGetMaterialRequestQuery();
    const { data: vendors } = useGetVendorsQuery();
    const navigate = useNavigate();

    const [selectedMR, setSelectedMR] = useState(null);
    const [open, setOpen] = useState(false);
    const [openItemIndex, setOpenItemIndex] = useState(null);
    const [activeTab, setActiveTab] = useState("pending"); // pending, approved, completed, all

    // Separate requests by status
    const pendingRequests = requests.filter(req => req.status === "pending");
    const approvedRequests = requests.filter(req => req.status === "approved");
    const completedRequests = requests.filter(req => req.status === "completed");
    const recentRequests = [...requests].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

    // For demo - the user who approves (you can get this from auth context)
    const approvingUser = {
        name: "Admin User",
        role: "admin",
        avatar: "https://ui-avatars.com/api/?name=Admin+User&background=3B82F6&color=fff"
    };

    const closeModal = () => {
        setSelectedMR(null);
        setOpen(false);
        refetch(); // Refresh data after approval
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'approved': return 'bg-gradient-to-r from-green-500 to-emerald-600 text-white';
            case 'pending': return 'bg-gradient-to-r from-amber-500 to-orange-500 text-white';
            case 'completed': return 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white';
            case 'rejected': return 'bg-gradient-to-r from-red-500 to-pink-600 text-white';
            default: return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'approved': return <FaCheck className="text-green-500" />;
            case 'pending': return <FaClock className="text-amber-500" />;
            case 'completed': return <FaCheckCircle className="text-blue-500" />;
            case 'rejected': return <FaTimes className="text-red-500" />;
            default: return <FaClock className="text-gray-500" />;
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    // Get requests based on active tab
    const getFilteredRequests = () => {
        switch (activeTab) {
            case 'pending': return pendingRequests;
            case 'approved': return approvedRequests;
            case 'completed': return completedRequests;
            default: return requests;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-6">
            <div className="max-w-7xl mx-auto">
                {/* HEADER */}
                <div className="mb-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                        <div className="flex items-center gap-4">
                            <div className="bg-gradient-to-br from-blue-600 to-purple-600 text-white p-3 md:p-4 rounded-xl shadow-lg">
                                <FaClipboardList className="text-2xl md:text-3xl" />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                                    Material Requests Dashboard
                                </h1>
                                <p className="text-gray-600 mt-1">Manage and approve material purchase requests</p>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <button
                                onClick={refetch}
                                className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium flex items-center gap-2 transition-colors"
                            >
                                <FaClock /> Refresh
                            </button>
                        </div>
                    </div>

                    {/* STATS CARDS */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow transition-shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Total Requests</p>
                                    <p className="text-2xl font-bold text-gray-800">{requests.length}</p>
                                </div>
                                <div className="p-3 bg-blue-50 rounded-lg">
                                    <FaClipboardList className="text-blue-600" size={20} />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-5 rounded-xl border border-amber-200 shadow-sm hover:shadow transition-shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Pending Approval</p>
                                    <p className="text-2xl font-bold text-amber-600">{pendingRequests.length}</p>
                                </div>
                                <div className="p-3 bg-amber-50 rounded-lg">
                                    <FaClock className="text-amber-600" size={20} />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-5 rounded-xl border border-green-200 shadow-sm hover:shadow transition-shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Approved</p>
                                    <p className="text-2xl font-bold text-green-600">{approvedRequests.length}</p>
                                </div>
                                <div className="p-3 bg-green-50 rounded-lg">
                                    <FaCheck className="text-green-600" size={20} />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-5 rounded-xl border border-blue-200 shadow-sm hover:shadow transition-shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Completed</p>
                                    <p className="text-2xl font-bold text-blue-600">{completedRequests.length}</p>
                                </div>
                                <div className="p-3 bg-blue-50 rounded-lg">
                                    <FaCheckCircle className="text-blue-600" size={20} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* APPROVER CARD - MAIN FOCUS */}
                    <div className="bg-gradient-to-r from-green-50 to-emerald-100 border border-green-200 rounded-xl p-5 mb-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <img
                                        src={approvingUser.avatar}
                                        alt={approvingUser.name}
                                        className="w-16 h-16 rounded-xl border-4 border-white shadow"
                                    />
                                    <div className="absolute -bottom-2 -right-2 bg-green-500 text-white p-1 rounded-full">
                                        <FaCheck size={14} />
                                    </div>
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-800">Approval Authority</h2>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="font-semibold text-green-700">{approvingUser.name}</span>
                                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                                            {approvingUser.role}
                                        </span>
                                    </div>
                                    <p className="text-gray-600 text-sm mt-1">
                                        {pendingRequests.length} requests awaiting your approval
                                    </p>
                                </div>
                            </div>

                            <div className="text-right">
                                <div className="text-3xl font-bold text-green-700">{pendingRequests.length}</div>
                                <div className="text-sm text-gray-600">Pending for approval</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* MAIN CONTENT - TWO COLUMNS */}
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* LEFT COLUMN - REQUESTS LIST */}
                    <div className="lg:w-2/3">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 md:p-6">
                            {/* TABS */}
                            <div className="flex border-b border-gray-200 mb-6">
                                <button
                                    onClick={() => setActiveTab("pending")}
                                    className={`px-4 py-3 font-medium border-b-2 transition-colors ${activeTab === "pending"
                                        ? "border-amber-500 text-amber-600"
                                        : "border-transparent text-gray-500 hover:text-gray-700"
                                        }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <FaClock />
                                        Pending ({pendingRequests.length})
                                    </div>
                                </button>
                                <button
                                    onClick={() => setActiveTab("approved")}
                                    className={`px-4 py-3 font-medium border-b-2 transition-colors ${activeTab === "approved"
                                        ? "border-green-500 text-green-600"
                                        : "border-transparent text-gray-500 hover:text-gray-700"
                                        }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <FaCheck />
                                        Approved ({approvedRequests.length})
                                    </div>
                                </button>
                                <button
                                    onClick={() => setActiveTab("completed")}
                                    className={`px-4 py-3 font-medium border-b-2 transition-colors ${activeTab === "completed"
                                        ? "border-blue-500 text-blue-600"
                                        : "border-transparent text-gray-500 hover:text-gray-700"
                                        }`}

                                >
                                    <div className="flex items-center gap-2">
                                        <FaCheckCircle />
                                        Completed ({completedRequests.length})
                                    </div>
                                </button>
                                <button
                                    onClick={() => setActiveTab("all")}
                                    className={`px-4 py-3 font-medium border-b-2 transition-colors ${activeTab === "all"
                                        ? "border-purple-500 text-purple-600"
                                        : "border-transparent text-gray-500 hover:text-gray-700"
                                        }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <FaClipboardList />
                                        All ({requests.length})
                                    </div>
                                </button>
                            </div>

                            {/* REQUESTS LIST */}
                            <div className="space-y-4">
                                {isLoading ? (
                                    <div className="text-center py-16">
                                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                                        <p className="text-gray-500">Loading requests...</p>
                                    </div>
                                ) : getFilteredRequests().length === 0 ? (
                                    <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-xl">
                                        <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                            <FaClipboardList size={28} className="text-gray-400" />
                                        </div>
                                        <h3 className="text-gray-500 font-medium mb-2">No requests found</h3>
                                        <p className="text-gray-400">No {activeTab} material requests available</p>
                                    </div>
                                ) : (
                                    getFilteredRequests().map((mr) => (
                                        <div
                                            key={mr._id}
                                            className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow"
                                        >
                                            <div className="flex items-start justify-between mb-4">
                                                <div>
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <div className="bg-blue-50 p-2 rounded-lg">
                                                            <FaBuilding className="text-blue-600" />
                                                        </div>
                                                        <div>
                                                            <h3 className="font-bold text-gray-800 text-lg">
                                                                {mr.projectId?.projectName}
                                                            </h3>
                                                            <p className="text-sm text-gray-600">
                                                                PO# {mr.poNumber} • {formatDate(mr.createdAt)}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-4 text-sm text-gray-600">
                                                        <span className="flex items-center gap-1">
                                                            <FaUser /> {mr.requestedBy?.name}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <FaCalendarAlt /> Required: {formatDate(mr.requiredDate)}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className={`px-4 py-2 rounded-full ${getStatusColor(mr.status)} font-semibold`}>
                                                    {mr.status.toUpperCase()}
                                                </div>
                                            </div>

                                            {/* ITEMS PREVIEW */}
                                            <div className="mb-4">
                                                <div className="flex items-center gap-2 text-gray-700 font-medium mb-3">
                                                    <FaBoxes /> Items ({mr.items.length})
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    {mr.items.slice(0, 2).map((it, index) => (
                                                        <div key={index} className="bg-gray-50 p-3 rounded-lg">
                                                            <div className="flex justify-between items-start">
                                                                <div>
                                                                    <div className="font-medium text-gray-800">{it.itemId?.name}</div>
                                                                    <div className="text-sm text-gray-600">
                                                                        {it.requestedQty} {it.unit}
                                                                    </div>
                                                                </div>
                                                                <div className="text-right">
                                                                    <div className="text-green-600 font-bold">
                                                                        {formatCurrency(it.amount)}
                                                                    </div>
                                                                    <div className="text-xs text-gray-500">
                                                                        @ {formatCurrency(it.unitPrice)}/unit
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    {mr.items.length > 2 && (
                                                        <div className="bg-gray-50 p-3 rounded-lg flex items-center justify-center">
                                                            <span className="text-gray-600">
                                                                + {mr.items.length - 2} more items
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* TOTAL AMOUNT & ACTIONS */}
                                            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                                                <div className="flex items-center gap-2">
                                                    <FaRupeeSign className="text-green-600" />
                                                    <span className="text-lg font-bold text-gray-800">
                                                        Total: {formatCurrency(mr.totalAmount)}
                                                    </span>
                                                </div>

                                                <div className="flex gap-3">
                                                    {mr.status === "pending" && (
                                                        <button
                                                            onClick={() => {
                                                                setSelectedMR(mr);
                                                                setOpen(true);
                                                            }}
                                                            className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-medium hover:shadow transition-all"
                                                        >
                                                            Review & Approve
                                                        </button>
                                                    )}

                                                    {mr.status === "approved" && (
                                                        <button
                                                            onClick={() => navigate(`/POView/${mr._id}`)}
                                                            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg font-medium hover:shadow transition-all"
                                                        >
                                                            View Purchase Order
                                                        </button>
                                                    )}

                                                    {/* <button
                                                        onClick={() => navigate(`/RequestDetails/${mr._id}`)}
                                                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                                                    >
                                                        View Details
                                                    </button> */}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN - RECENT REQUESTS */}
                    <div className="lg:w-1/3">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 md:p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                                    <FaClock className="text-blue-600" />
                                    Recent Requests
                                </h2>
                                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                                    5 most recent
                                </span>
                            </div>

                            <div className="space-y-4">
                                {recentRequests.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500">
                                        No recent requests
                                    </div>
                                ) : (
                                    recentRequests.map((mr) => (
                                        <div
                                            key={mr._id}
                                            className="border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                                            onClick={() => navigate(`/RequestDetails/${mr._id}`)}
                                        >
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="font-medium text-gray-800">
                                                    {mr.projectId?.projectName}
                                                </div>
                                                <div className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(mr.status)}`}>
                                                    {mr.status}
                                                </div>
                                            </div>

                                            <div className="text-sm text-gray-600 mb-2">
                                                {mr.items.length} items • {formatCurrency(mr.totalAmount)}
                                            </div>

                                            <div className="flex items-center justify-between text-xs text-gray-500">
                                                <span>{formatDate(mr.createdAt)}</span>
                                                <span className="flex items-center gap-1">
                                                    <FaUser size={10} /> {mr.requestedBy?.name}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* QUICK STATS */}
                            <div className="mt-6 pt-6 border-t border-gray-200">
                                <h3 className="font-medium text-gray-700 mb-3">Quick Stats</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-amber-50 p-3 rounded-lg">
                                        <div className="text-amber-600 font-bold">{pendingRequests.length}</div>
                                        <div className="text-xs text-gray-600">Awaiting</div>
                                    </div>
                                    <div className="bg-green-50 p-3 rounded-lg">
                                        <div className="text-green-600 font-bold">{approvedRequests.length}</div>
                                        <div className="text-xs text-gray-600">Approved</div>
                                    </div>
                                    <div className="bg-blue-50 p-3 rounded-lg">
                                        <div className="text-blue-600 font-bold">{completedRequests.length}</div>
                                        <div className="text-xs text-gray-600">Completed</div>
                                    </div>
                                    <div className="bg-purple-50 p-3 rounded-lg">
                                        <div className="text-purple-600 font-bold">{formatCurrency(
                                            requests.reduce((sum, mr) => sum + mr.totalAmount, 0)
                                        )}</div>
                                        <div className="text-xs text-gray-600">Total Value</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>


                    {/* APPROVE MODAL */}
                    {selectedMR && (
                        <ApproveModal
                            open={open}
                            mr={selectedMR}
                            vendors={vendors}
                            onClose={closeModal}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}