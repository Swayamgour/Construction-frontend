import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAddMaintenanceMutation } from "../../Reduxe/Api";
import toast from "react-hot-toast";

export default function AddMaintenance() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        serviceType: "",
        serviceDate: new Date().toISOString().split('T')[0],
        vendorName: "",
        cost: "",
        description: "",
        nextServiceDate: "",
        partsReplaced: "",
        warrantyPeriod: ""
    });

    const [bill, setBill] = useState(null);
    const [billPreview, setBillPreview] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [addMaintenance] = useAddMaintenanceMutation();

    const serviceTypes = [
        "Routine Maintenance",
        "Oil Change",
        "Filter Replacement",
        "Brake Service",
        "Engine Repair",
        "Electrical Repair",
        "Tire Replacement",
        "Hydraulic Service",
        "Annual Service",
        "Emergency Repair",
        "Other"
    ];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setBill(file);

            // Create preview for images
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setBillPreview(reader.result);
                };
                reader.readAsDataURL(file);
            } else {
                setBillPreview(null);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!form.serviceType || !form.serviceDate || !form.vendorName || !form.cost) {
            toast.error("Please fill all required fields");
            return;
        }

        setIsSubmitting(true);

        const fd = new FormData();
        fd.append("machineId", id);

        Object.entries(form).forEach(([k, v]) => {
            if (v) fd.append(k, v);
        });

        if (bill) fd.append("billFile", bill);

        try {
            await addMaintenance(fd).unwrap();
            toast.success("Maintenance Added Successfully!");

            // Navigate back to machine details
            setTimeout(() => {
                navigate(`/machine/${id}`);
            }, 1500);

        } catch (err) {
            console.error(err);
            toast.error(err?.data?.message || "Failed to add maintenance");
        } finally {
            setIsSubmitting(false);
        }
    };

    const removeFile = () => {
        setBill(null);
        setBillPreview(null);
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate(`/machine/${id}`)}
                        className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                        </svg>
                        Back to Machine Details
                    </button>

                    <div className="bg-gradient-to-r from-green-600 to-emerald-700 rounded-2xl p-8 text-white">
                        <h1 className="text-3xl font-bold mb-2">Add Maintenance Record</h1>
                        <p className="text-green-100">Record a new maintenance service for this machine</p>
                    </div>
                </div>

                {/* Form Card */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    <form onSubmit={handleSubmit} className="p-8">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Left Column - Basic Details */}
                            <div className="space-y-6">
                                <h3 className="text-xl font-semibold text-gray-800 border-b pb-3">Service Details</h3>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Service Type <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="serviceType"
                                        value={form.serviceType}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-200"
                                        required
                                    >
                                        <option value="">Select service type</option>
                                        {serviceTypes.map(type => (
                                            <option key={type} value={type}>{type}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Service Date <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        name="serviceDate"
                                        value={form.serviceDate}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-200"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Vendor Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="vendorName"
                                        placeholder="Enter vendor name"
                                        value={form.vendorName}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-200"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Service Cost (₹) <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-3 text-gray-500">₹</span>
                                        <input
                                            type="number"
                                            name="cost"
                                            placeholder="Enter cost"
                                            value={form.cost}
                                            onChange={handleInputChange}
                                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-200"
                                            min="0"
                                            step="0.01"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Right Column - Additional Details & File Upload */}
                            <div className="space-y-6">
                                <h3 className="text-xl font-semibold text-gray-800 border-b pb-3">Additional Information</h3>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Next Service Date
                                    </label>
                                    <input
                                        type="date"
                                        name="nextServiceDate"
                                        value={form.nextServiceDate}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-200"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Parts Replaced
                                    </label>
                                    <input
                                        type="text"
                                        name="partsReplaced"
                                        placeholder="e.g., Oil filter, Brake pads"
                                        value={form.partsReplaced}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-200"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Warranty Period (Months)
                                    </label>
                                    <input
                                        type="number"
                                        name="warrantyPeriod"
                                        placeholder="Enter warranty period"
                                        value={form.warrantyPeriod}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-200"
                                        min="0"
                                    />
                                </div>

                                {/* Bill File Upload */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Bill / Invoice File
                                    </label>

                                    {bill ? (
                                        <div className="border-2 border-green-200 border-dashed rounded-xl p-6 bg-green-50">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center">
                                                    <svg className="w-10 h-10 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                                    </svg>
                                                    <div>
                                                        <p className="font-medium text-gray-900">{bill.name}</p>
                                                        <p className="text-sm text-gray-500">{(bill.size / 1024 / 1024).toFixed(2)} MB</p>
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={removeFile}
                                                    className="text-red-500 hover:text-red-700"
                                                >
                                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                                    </svg>
                                                </button>
                                            </div>

                                            {billPreview && (
                                                <div className="mt-4">
                                                    <p className="text-sm text-gray-600 mb-2">Preview:</p>
                                                    <img
                                                        src={billPreview}
                                                        alt="Bill preview"
                                                        className="max-w-full h-48 object-contain rounded-lg border border-gray-200"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-green-400 transition duration-200 cursor-pointer">
                                            <input
                                                type="file"
                                                id="billFile"
                                                onChange={handleFileChange}
                                                className="hidden"
                                                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                            />
                                            <label htmlFor="billFile" className="cursor-pointer">
                                                <div className="flex flex-col items-center">
                                                    <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                                                    </svg>
                                                    <p className="text-lg font-medium text-gray-700 mb-2">Upload Bill/Invoice</p>
                                                    <p className="text-sm text-gray-500">Drag & drop or click to browse</p>
                                                    <p className="text-xs text-gray-400 mt-2">Supports PDF, JPG, PNG, DOC (Max 10MB)</p>
                                                </div>
                                            </label>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Description Textarea - Full Width */}
                        <div className="mt-8">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Service Description / Notes
                            </label>
                            <textarea
                                name="description"
                                rows="4"
                                placeholder="Provide details about the service performed, issues found, recommendations, etc."
                                value={form.description}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-200 resize-none"
                            />
                            <p className="text-xs text-gray-500 mt-2">Optional: Add any additional notes about this maintenance service</p>
                        </div>

                        {/* Form Actions */}
                        <div className="mt-10 pt-8 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center">
                            <div className="text-sm text-gray-500 mb-4 sm:mb-0">
                                <p>Fields marked with <span className="text-red-500">*</span> are required</p>
                            </div>

                            <div className="flex space-x-4">
                                <button
                                    type="button"
                                    onClick={() => navigate(`/machine/${id}`)}
                                    className="px-8 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition duration-200"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-medium rounded-lg hover:from-green-700 hover:to-emerald-700 focus:ring-4 focus:ring-green-300 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Adding...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                            </svg>
                                            Add Maintenance Record
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Additional Info Card */}
                <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
                    <div className="flex items-start">
                        <svg className="w-6 h-6 text-blue-600 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <div>
                            <h4 className="font-semibold text-blue-800 mb-2">Why Record Maintenance?</h4>
                            <ul className="text-blue-700 text-sm space-y-1">
                                <li>• Track maintenance costs over time</li>
                                <li>• Schedule future services automatically</li>
                                <li>• Maintain warranty requirements</li>
                                <li>• Improve machine reliability and lifespan</li>
                                <li>• Generate maintenance history reports</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}