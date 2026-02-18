import { useState } from "react";
import { useAddMachineMutation } from "../../Reduxe/Api";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function AddMachine() {
    const [form, setForm] = useState({
        machineNumber: "",
        engineNumber: "",
        chassisNumber: "",
        machineType: "",
        rcExpiry: "",
        insuranceExpiry: "",
    });

    const [addMachine, { isLoading }] = useAddMachineMutation();

    const [files, setFiles] = useState({
        photo: null,
        rcFile: null,
        insuranceFile: null
    });

    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Basic validation
        if (!form.machineNumber || !form.engineNumber || !form.chassisNumber || !form.machineType) {
            toast.error("Please fill all required fields");
            return;
        }

        const fd = new FormData();
        Object.entries(form).forEach(([k, v]) => fd.append(k, v));
        Object.entries(files).forEach(([k, v]) => v && fd.append(k, v));

        try {
            await addMachine(fd).unwrap();
            toast.success("Machine Added Successfully!");
            navigate(-1)


            // Reset form
            setForm({
                machineNumber: "",
                engineNumber: "",
                chassisNumber: "",
                machineType: "",
                rcExpiry: "",
                insuranceExpiry: "",
            });
            setFiles({
                photo: null,
                rcFile: null,
                insuranceFile: null
            });
        } catch (err) {
            console.error(err);
            toast.error("Failed to add machine");
        }
    };

    const handleFileChange = (fileType, file) => {
        setFiles({ ...files, [fileType]: file });
    };

    const handleInputChange = (field, value) => {
        setForm({ ...form, [field]: value });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-6">
                    <h2 className="text-3xl font-bold text-white">Add New Machine</h2>
                    <p className="text-blue-100 mt-2">Fill in the machine details below</p>
                </div>

                <form onSubmit={handleSubmit} className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Left Column - Basic Details */}
                        <div className="space-y-6">
                            <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">Machine Details</h3>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Machine Number <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                                    placeholder="Enter machine number"
                                    value={form.machineNumber}
                                    onChange={(e) => handleInputChange("machineNumber", e.target.value)}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Engine Number <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                                    placeholder="Enter engine number"
                                    value={form.engineNumber}
                                    onChange={(e) => handleInputChange("engineNumber", e.target.value)}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Chassis Number <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                                    placeholder="Enter chassis number"
                                    value={form.chassisNumber}
                                    onChange={(e) => handleInputChange("chassisNumber", e.target.value)}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Machine Type <span className="text-red-500">*</span>
                                </label>
                                <select
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                                    value={form.machineType}
                                    onChange={(e) => handleInputChange("machineType", e.target.value)}
                                    required
                                >
                                    <option value="">Select machine type</option>
                                    <option value="Excavator">Excavator</option>
                                    <option value="Bulldozer">Bulldozer</option>
                                    <option value="Crane">Crane</option>
                                    <option value="Loader">Loader</option>
                                    <option value="Grader">Grader</option>
                                    <option value="Roller">Roller</option>
                                    <option value="Forklift">Forklift</option>
                                </select>
                            </div>
                        </div>

                        {/* Right Column - Documents & Dates */}
                        <div className="space-y-6">
                            <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">Documents & Expiry Dates</h3>

                            {/* File Uploads */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Machine Photo
                                    </label>
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition duration-200">
                                        <input
                                            type="file"
                                            className="hidden"
                                            id="photo"
                                            onChange={(e) => handleFileChange("photo", e.target.files[0])}
                                            accept="image/*"
                                        />
                                        <label htmlFor="photo" className="cursor-pointer">
                                            <div className="flex flex-col items-center">
                                                <svg className="w-12 h-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                                </svg>
                                                <span className="text-blue-600 hover:text-blue-800 font-medium">
                                                    {files.photo ? files.photo.name : "Click to upload photo"}
                                                </span>
                                                <p className="text-xs text-gray-500 mt-1">PNG, JPG, JPEG up to 5MB</p>
                                            </div>
                                        </label>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        RC Document
                                    </label>
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition duration-200">
                                        <input
                                            type="file"
                                            className="hidden"
                                            id="rcFile"
                                            onChange={(e) => handleFileChange("rcFile", e.target.files[0])}
                                            accept=".pdf,.doc,.docx"
                                        />
                                        <label htmlFor="rcFile" className="cursor-pointer">
                                            <div className="flex flex-col items-center">
                                                <svg className="w-12 h-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                                </svg>
                                                <span className="text-blue-600 hover:text-blue-800 font-medium">
                                                    {files.rcFile ? files.rcFile.name : "Click to upload RC document"}
                                                </span>
                                                <p className="text-xs text-gray-500 mt-1">PDF, DOC, DOCX up to 10MB</p>
                                            </div>
                                        </label>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Insurance Document
                                    </label>
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition duration-200">
                                        <input
                                            type="file"
                                            className="hidden"
                                            id="insuranceFile"
                                            onChange={(e) => handleFileChange("insuranceFile", e.target.files[0])}
                                            accept=".pdf,.doc,.docx"
                                        />
                                        <label htmlFor="insuranceFile" className="cursor-pointer">
                                            <div className="flex flex-col items-center">
                                                <svg className="w-12 h-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                                                </svg>
                                                <span className="text-blue-600 hover:text-blue-800 font-medium">
                                                    {files.insuranceFile ? files.insuranceFile.name : "Click to upload insurance document"}
                                                </span>
                                                <p className="text-xs text-gray-500 mt-1">PDF, DOC, DOCX up to 10MB</p>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Expiry Dates */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        RC Expiry Date
                                    </label>
                                    <input
                                        type="date"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                                        value={form.rcExpiry}
                                        onChange={(e) => handleInputChange("rcExpiry", e.target.value)}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Insurance Expiry Date
                                    </label>
                                    <input
                                        type="date"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                                        value={form.insuranceExpiry}
                                        onChange={(e) => handleInputChange("insuranceExpiry", e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Form Actions */}
                    <div className="mt-10 pt-6 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center">
                        <div className="text-sm text-gray-500 mb-4 sm:mb-0">
                            <p>Fields marked with <span className="text-red-500">*</span> are required</p>
                        </div>
                        <div className="flex space-x-4">
                            <button
                                type="button"
                                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition duration-200"
                                onClick={() => {
                                    setForm({
                                        machineNumber: "",
                                        engineNumber: "",
                                        chassisNumber: "",
                                        machineType: "",
                                        rcExpiry: "",
                                        insuranceExpiry: "",
                                    });
                                    setFiles({
                                        photo: null,
                                        rcFile: null,
                                        insuranceFile: null
                                    });
                                    toast.success("Form cleared");
                                }}
                            >
                                Clear Form
                            </button>
                            <button
                                type="submit"
                                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:ring-4 focus:ring-blue-300 transition duration-200 flex items-center"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Adding Machine...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                                        </svg>
                                        Add Machine
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}