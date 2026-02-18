import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    FiPhone,
    FiMail,
    FiMapPin,
    FiStar,
    FiGlobe,
    FiArrowLeft,
    FiUser,
    FiBriefcase,
    FiCreditCard,
    FiPackage,
} from "react-icons/fi";
import {
    BsBank,
    BsBuilding,
    BsCheckCircle,
    BsStarFill
} from "react-icons/bs";
import { MdLocationCity } from "react-icons/md";
import { useGetVendorByIdQuery } from "../Reduxe/Api";
import { IoIosAddCircleOutline } from "react-icons/io";
import MaterialDialog from "../components/MaterialDialog";

const VendorDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const { data, isLoading, isError } = useGetVendorByIdQuery(id);
    const vendor = data?.vendor;

    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const toggleDrawer = () => setIsDrawerOpen(!isDrawerOpen);

    // ------------------- Loading State -------------------
    if (isLoading) {
        return (
            <div className="min-h-screen flex justify-center items-center">
                <div className="flex flex-col items-center">
                    <div className="w-14 h-14 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-600 mt-3 text-lg">Loading Vendor...</p>
                </div>
            </div>
        );
    }

    // ------------------- Error State -------------------
    if (isError || !vendor) {
        return (
            <div className="min-h-screen flex justify-center items-center">
                <div className="bg-white shadow-md rounded-xl p-6">
                    <h2 className="text-xl font-bold mb-3">Error</h2>
                    <p className="text-gray-600 mb-4">Unable to load vendor details</p>
                    <button
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                        onClick={() => navigate(-1)}
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-6xl mx-auto">

                {/* ---------------- Header ---------------- */}
                <div className="flex justify-between items-center mb-8">
                    <div className="flex gap-3 items-center">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-3 bg-white rounded-xl border shadow hover:shadow-md transition"
                        >
                            <FiArrowLeft size={20} />
                        </button>

                        <div>
                            <h1 className="text-3xl font-bold">{vendor.companyName}</h1>
                            <p className="text-gray-600 text-sm">{vendor.vendorType}</p>
                        </div>
                    </div>

                    <button
                        onClick={toggleDrawer}
                        className="bg-blue-600 text-white px-5 py-3 rounded-xl shadow flex items-center gap-2 hover:bg-blue-700 transition"
                    >
                        <IoIosAddCircleOutline size={24} />
                        Add Material
                    </button>

                    <MaterialDialog
                        isOpen={isDrawerOpen}
                        onClose={toggleDrawer}
                        vendorId={id}
                    />
                </div>

                {/* ---------------- Two Column Grid ---------------- */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* ---------------- Left Column ---------------- */}
                    <div className="space-y-6">

                        {/* Vendor Card */}
                        <div className="bg-white p-6 rounded-xl shadow border">
                            <div className="flex items-center gap-4">
                                <img
                                    src={vendor.companyLogo || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"}
                                    alt="company"
                                    className="w-20 h-20 rounded-xl border object-cover"
                                />
                                <div>
                                    <h2 className="text-xl font-bold">{vendor.companyName}</h2>
                                    <p className="text-gray-600">{vendor.businessType || "Business"}</p>
                                </div>
                            </div>

                            <div className="mt-4 space-y-3">
                                <ContactItem icon={<FiPhone />} label="Phone" value={vendor.phone} />
                                <ContactItem icon={<FiMail />} label="Email" value={vendor.email} />
                                <ContactItem icon={<FiGlobe />} label="Website" value={vendor.website || "N/A"} />
                                <ContactItem icon={<FiMapPin />} label="City" value={`${vendor.city}, ${vendor.state}`} />
                            </div>
                        </div>

                        {/* Highlights */}
                        <div className="bg-white p-6 rounded-xl shadow border">
                            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                <BsCheckCircle className="text-green-600" /> Business Highlights
                            </h3>

                            <div className="space-y-3">
                                <HighlightItem label="GST Number" value={vendor.gstNumber} />
                                <HighlightItem label="PAN Number" value={vendor.panNumber} />
                                <HighlightItem label="Business Type" value={vendor.businessType} />
                            </div>
                        </div>
                    </div>

                    {/* ---------------- Right Column ---------------- */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Address Details */}
                        <Section title="Address Details" icon={<MdLocationCity className="text-orange-600" />} gradient="from-orange-500 to-red-500">
                            <DetailGrid>
                                <DetailItem label="Address" value={vendor.address} fullWidth />
                                <DetailItem label="City" value={vendor.city} />
                                <DetailItem label="State" value={vendor.state} />
                                <DetailItem label="Pincode" value={vendor.pincode} />
                            </DetailGrid>
                        </Section>

                        {/* Bank Details */}
                        <Section title="Bank Details" icon={<FiCreditCard className="text-purple-600" />} gradient="from-purple-500 to-pink-500">
                            <DetailGrid>
                                <DetailItem label="Bank Name" value={vendor.bankName} />
                                <DetailItem label="Branch Name" value={vendor.branchName} />
                                <DetailItem label="Account Number" value={vendor.accountNumber} />
                                <DetailItem label="IFSC Code" value={vendor.ifscCode} />
                            </DetailGrid>
                        </Section>

                        {/* -------------------- ITEMS SUPPLIED SECTION -------------------- */}
                        <Section title="Items Supplied" icon={<FiPackage className="text-emerald-600" />} gradient="from-emerald-500 to-green-500">
                            {vendor.itemsSupplied?.length > 0 ? (
                                <div className="space-y-4">

                                    {vendor.itemsSupplied.map((item) => (
                                        <div
                                            key={item._id}
                                            className="bg-white rounded-xl border p-4 shadow-sm flex flex-col md:flex-row justify-between md:items-center gap-4 hover:shadow-md transition"
                                        >
                                            <div>
                                                <h4 className="text-lg font-semibold text-gray-900">{item.name}</h4>
                                                <p className="text-sm text-gray-600">Type: <b>{item.type}</b></p>
                                                <p className="text-sm text-gray-600">Category: <b>{item.category}</b></p>
                                                <p className="text-sm text-gray-600">Unit: <b>{item.unit}</b></p>
                                            </div>

                                            {/* <div className="flex gap-3">
                                                <button className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg border hover:bg-blue-200">
                                                    Edit
                                                </button>
                                                <button className="px-4 py-2 bg-red-100 text-red-600 rounded-lg border hover:bg-red-200">
                                                    Delete
                                                </button>
                                            </div> */}
                                        </div>
                                    ))}

                                </div>
                            ) : (
                                <p className="text-gray-500 text-sm">
                                    No items added yet. Click “Add Material” to add items.
                                </p>
                            )}
                        </Section>

                    </div>
                </div>

            </div>
        </div>
    );
};

/* ---------------- UI Components --------------- */

const Section = ({ title, icon, gradient, children }) => (
    <div className="bg-white rounded-xl shadow border">
        <div className={`bg-gradient-to-r ${gradient} px-6 py-3 text-white flex items-center gap-2 rounded-t-xl`}>
            {icon}
            <h3 className="font-semibold text-lg">{title}</h3>
        </div>
        <div className="p-6">{children}</div>
    </div>
);

const DetailGrid = ({ children }) => <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>;

const DetailItem = ({ label, value, fullWidth }) => (
    <div className={fullWidth ? "md:col-span-2" : ""}>
        <p className="text-gray-500 text-sm">{label}</p>
        <p className="font-semibold text-gray-900">{value || "-"}</p>
    </div>
);

const ContactItem = ({ icon, label, value }) => (
    <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-lg hover:bg-slate-100">
        <span className="text-blue-600">{icon}</span>
        <div>
            <p className="text-xs text-gray-500">{label}</p>
            <p className="text-sm font-medium text-gray-900">{value}</p>
        </div>
    </div>
);

const HighlightItem = ({ label, value }) => (
    <div className="flex justify-between py-2 border-b last:border-0">
        <span className="text-gray-600">{label}</span>
        <span className="font-bold text-gray-800">{value}</span>
    </div>
);

export default VendorDetails;
