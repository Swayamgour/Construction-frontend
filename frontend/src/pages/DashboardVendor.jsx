import React, { useState } from "react";
import {
    IoIosAddCircleOutline,
    IoIosMore,
    IoIosBuild,
    IoIosTrash,
    IoIosEye
} from "react-icons/io";
import {
    FiPhone,
    FiMail,
    FiMapPin,
    FiBriefcase,
    FiStar,
    FiEdit,
    FiTrash2,
    FiUser
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useGetVendorsQuery } from "../Reduxe/Api";

const DashboardVendor = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");
    const [activeMenu, setActiveMenu] = useState(null);

    // ✅ Fetch vendors from backend (RTK Query)
    const { data, isLoading, isError } = useGetVendorsQuery();

    console.log(data)

    const vendorList = data || [];

    // ✅ Search filter
    const filteredVendors = vendorList.filter((vendor) => {
        const search = searchTerm.toLowerCase();
        return (
            vendor.companyName?.toLowerCase().includes(search) ||
            vendor.contactPerson?.toLowerCase().includes(search) ||
            vendor.city?.toLowerCase().includes(search) ||
            vendor.productCategories?.some((m) => m.toLowerCase().includes(search))
        );
    });

    // ✅ Toggle menu
    const toggleMenu = (vendorId) => {
        setActiveMenu(activeMenu === vendorId ? null : vendorId);
    };

    // ✅ Close menu when clicking outside
    React.useEffect(() => {
        const handleClickOutside = () => setActiveMenu(null);
        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, []);

    // ✅ Handle actions
    const handleEdit = (vendor) => {
        console.log("Edit vendor:", vendor);
        setActiveMenu(null);
        // Navigate to edit page or open modal
    };

    const handleDelete = (vendor) => {
        if (window.confirm(`Are you sure you want to delete ${vendor.companyName}?`)) {
            console.log("Delete vendor:", vendor);
            setActiveMenu(null);
            // Add delete logic here
        }
    };

    const handleViewDetails = (vendorId) => {
        navigate(`/VendorDetails/${vendorId}`);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 text-lg">Loading vendors...</p>
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
                <div className="text-center bg-white p-8 rounded-2xl shadow-lg border border-red-200 max-w-md">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FiBriefcase className="text-red-500 text-2xl" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Failed to Load</h2>
                    <p className="text-gray-600 mb-4">Unable to fetch vendors. Please try again.</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 transition-colors"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen px-4 sm:px-6 py-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50/30">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-6">
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-purple-700 bg-clip-text text-transparent mb-2">
                            Vendor Management
                        </h1>
                        <p className="text-slate-600 text-lg">
                            Manage your vendor relationships and partnerships
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                        {/* Search Bar */}
                        <div className="relative w-full sm:w-80">
                            <input
                                type="text"
                                placeholder="Search vendors by name, contact, or category..."
                                className="w-full px-4 pl-12 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-700 placeholder-slate-500 bg-white shadow-sm transition-all duration-200"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400">
                                <FiUser size={18} />
                            </div>
                        </div>

                        {/* Add Vendor Button */}
                        <button
                            onClick={() => navigate("/CreateNewVendorForm")}
                            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2 font-semibold"
                        >
                            <IoIosAddCircleOutline size={22} />
                            Add Vendor
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <StatCard
                        title="Total Vendors"
                        value={vendorList.length}
                        color="from-blue-500 to-cyan-500"
                        icon={<FiBriefcase />}
                    />
                    <StatCard
                        title="Active"
                        value={vendorList.length}
                        color="from-green-500 to-emerald-500"
                        icon={<FiStar />}
                    />
                    <StatCard
                        title="Material Suppliers"
                        value={vendorList.filter(v => v.vendorType === 'Material Supplier').length}
                        color="from-orange-500 to-red-500"
                        icon={<IoIosBuild />}
                    />
                    <StatCard
                        title="This Month"
                        value={0}
                        color="from-purple-500 to-pink-500"
                        icon={<IoIosAddCircleOutline />}
                    />
                </div>

                {/* Vendor Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                    {filteredVendors.length > 0 ? (
                        filteredVendors.map((vendor) => (
                            <VendorCard
                                key={vendor._id}
                                vendor={vendor}
                                isMenuOpen={activeMenu === vendor._id}
                                onToggleMenu={() => toggleMenu(vendor._id)}
                                onViewDetails={() => handleViewDetails(vendor._id)}
                                onEdit={() => handleEdit(vendor)}
                                onDelete={() => handleDelete(vendor)}
                            />
                        ))
                    ) : (
                        <div className="col-span-full text-center py-12">
                            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FiBriefcase className="text-slate-400 text-3xl" />
                            </div>
                            <h3 className="text-xl font-semibold text-slate-700 mb-2">No vendors found</h3>
                            <p className="text-slate-500 mb-6">
                                {searchTerm ? "Try adjusting your search terms" : "Get started by adding your first vendor"}
                            </p>
                            <button
                                onClick={() => navigate("/CreateNewVendorForm")}
                                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Add New Vendor
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// ✅ Vendor Card Component
const VendorCard = ({ vendor, isMenuOpen, onToggleMenu, onViewDetails, onEdit, onDelete }) => {
    const navigate = useNavigate()
    return (
        <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-slate-200 overflow-hidden group">
            {/* Card Header with Menu */}
            <div className="relative p-4 border-b border-slate-100">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img
                            src={
                                vendor.companyLogo
                                    ? vendor.companyLogo
                                    : "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                            }
                            alt={vendor.companyName}
                            className="w-12 h-12 object-cover rounded-xl border border-slate-200 shadow-sm"
                        />
                        <div>
                            <h3 className="font-semibold text-slate-900 text-sm leading-tight">
                                {vendor.companyName}
                            </h3>
                            <p className="text-slate-500 text-xs">
                                {vendor.vendorType}
                            </p>
                        </div>
                    </div>

                    {/* Three Dots Menu */}
                    <div className="relative">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onToggleMenu();
                            }}
                            className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            <IoIosMore size={18} />
                        </button>

                        {/* Dropdown Menu */}
                        {isMenuOpen && (
                            <div className="absolute right-0 top-10 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-10 min-w-32">
                                {/* <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onViewDetails();
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                                >
                                    <IoIosEye className="text-blue-600" />
                                    View Details
                                </button> */}
                                <button
                                    onClick={() =>
                                        navigate("/EditVendorForm", {
                                            state: { vendor },
                                        })
                                    }

                                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                                >
                                    <FiEdit className="text-green-600" />
                                    Edit
                                </button>
                                {/* <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDelete();
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-700 hover:bg-red-50 transition-colors"
                                >
                                    <FiTrash2 className="text-red-600" />
                                    Delete
                                </button> */}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Card Body */}
            <div className="p-4">
                {/* Contact Person */}
                <div className="flex items-center gap-2 text-slate-600 mb-3">
                    <FiUser className="text-slate-400" size={14} />
                    <span className="text-sm">{vendor.contactPerson}</span>
                </div>

                {/* Contact Information */}
                <div className="space-y-2 mb-4">
                    <ContactItem
                        icon={<FiPhone />}
                        value={`+91 ${vendor.phone}`}
                    />
                    <ContactItem
                        icon={<FiMail />}
                        value={vendor.email}
                    />
                    <ContactItem
                        icon={<FiMapPin />}
                        value={`${vendor.city}, ${vendor.state}`}
                    />
                </div>

                {/* Product Categories */}
                <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                        {vendor.productCategories?.slice(0, 3).map((category, idx) => (
                            <span
                                key={idx}
                                className="bg-blue-50 text-blue-700 px-2 py-1 rounded-lg text-xs font-medium border border-blue-200"
                            >
                                {category}
                            </span>
                        ))}
                        {vendor.productCategories?.length > 3 && (
                            <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded-lg text-xs font-medium">
                                +{vendor.productCategories.length - 3} more
                            </span>
                        )}
                    </div>
                </div>

                {/* Action Button */}
                <button
                    onClick={onViewDetails}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2.5 rounded-xl shadow hover:shadow-lg transition-all duration-200 font-semibold text-sm hover:opacity-90"
                >
                    View Full Profile
                </button>
            </div>
        </div>
    );
};

// ✅ Contact Item Component
const ContactItem = ({ icon, value }) => (
    <div className="flex items-center gap-2 text-slate-600">
        <div className="text-slate-400">{icon}</div>
        <span className="text-sm truncate">{value}</span>
    </div>
);

// ✅ Stat Card Component
const StatCard = ({ title, value, color, icon }) => (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-slate-500 text-sm font-medium mb-1">{title}</p>
                <p className="text-2xl font-bold text-slate-900">{value}</p>
            </div>
            <div className={`p-3 rounded-xl bg-gradient-to-r ${color} text-white`}>
                {icon}
            </div>
        </div>
    </div>
);

export default DashboardVendor;