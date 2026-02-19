import React, { useState, useEffect } from "react";
import {
    FiArrowLeft,
    FiSave,
    FiMapPin,
    FiBriefcase,
    FiCreditCard,
    FiCheck,
    FiAlertCircle,
    FiXCircle,
    FiCheckCircle,
    FiUpload,
    FiNavigation,
    FiFileText,
    FiFile,
} from "react-icons/fi";
import { FaBuilding, FaIdCard, FaFileInvoice } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { State, City } from "country-state-city";
import toast from "react-hot-toast";
import { useAddVendorMutation, useUpdateVendorMutation } from "../Reduxe/Api";

const CreateNewVendorForm = () => {
    const navigate = useNavigate();
    const location = useLocation();
    // console.log(location?.state?.vendor);

    const [addVendor, addResult] = useAddVendorMutation();
    const [updateVendor, updateResult] = useUpdateVendorMutation();

    const [formData, setFormData] = useState({
        // ✅ 1. Vendor Basic Information
        companyLogo: null,
        aadhaarCardFile: null, // NEW: Aadhaar Card
        panCardFile: null, // NEW: PAN Card

        companyName: "",
        vendorType: "",
        contactPerson: "",
        email: "",
        phone: "",
        alternatePhone: "",
        website: "",

        // ✅ 2. Business Information
        businessRegNumber: "",
        gstNumber: "",
        panNumber: "",
        yearEstablished: "",
        businessType: "",
        ownershipType: "",
        annualTurnover: "",
        employeeCount: "",

        // ✅ 3. Address Information
        registeredAddress: "",
        address: "",
        city: "",
        state: "",
        pincode: "",
        country: "India",

        // ✅ 4. Bank Details
        bankName: "",
        accountNumber: "",
        ifscCode: "",
        accountHolderName: "",
        branchName: "",

        // ✅ 5. Product Categories (multi-select only)
        productCategories: [],

    });



    // ✅ If editing, preload the formData with vendor data
    useEffect(() => {
        if (location?.state?.vendor) {
            const vendor = location.state.vendor;
            setFormData({
                ...vendor,
                companyLogo: null,
                aadhaarCardFile: null,
                panCardFile: null,
            });
            setCurrentStep(1);
        }
    }, [location.state]);

    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isGettingLocation, setIsGettingLocation] = useState(false);
    const [locationError, setLocationError] = useState("");

    // ✅ Product Categories Data
    const PRODUCT_CATEGORIES = {
        "Material Supplier": {
            subcategories: {
                "Cement & Concrete": ["OPC Cement", "PPC Cement", "Ready Mix Concrete", "Cement Blocks", "Concrete Pipes"],
                "Steel & Metals": ["TMT Bars", "Steel Rods", "Steel Plates", "Angles", "Channels", "Beams", "Structural Steel"],
                "Aggregates": ["Coarse Sand", "Fine Sand", "Gravel", "Crushed Stone", "Stone Dust"],
                "Bricks & Blocks": ["Clay Bricks", "Concrete Blocks", "Fly Ash Bricks", "Hollow Blocks", "Paver Blocks"],
                "Paints & Coatings": ["Emulsion Paint", "Primer", "Enamel Paint", "Wall Putty", "Texture Paints", "Waterproofing"],
                "Plumbing": ["PVC Pipes", "CPVC Pipes", "UPVC Pipes", "GI Pipes", "Fittings", "Valves", "Sanitary Ware"],
                "Electrical": ["Cables", "Switches", "Wires", "Conduits", "DB Panels", "Lighting Fixtures"],
                "Wood & Furniture": ["Plywood", "Block Board", "Laminates", "Doors", "Windows", "Furniture"],
            }
        },
        "Machinery Supplier": {
            subcategories: {
                "Construction Equipment": ["Excavators", "Bulldozers", "Cranes", "Concrete Mixers", "Road Rollers"],
                "Earth Moving": ["Backhoe Loaders", "Motor Graders", "Trenchers", "Compactors"],
                "Material Handling": ["Forklifts", "Hoists", "Conveyors", "Cranes", "Winches"],
                "Concrete Equipment": ["Concrete Pumps", "Batching Plants", "Vibrators", "Troweling Machines"],
                "Power Tools": ["Drill Machines", "Cutting Machines", "Grinders", "Sanders", "Saws"],
            }
        },
        "Service Provider": {
            subcategories: {
                "Construction Services": ["Civil Work", "Structural Work", "Finishing Work", "MEP Services"],
                "Consultancy": ["Architectural", "Structural Engineering", "Project Management", "Quality Control"],
                "Labor Services": ["Skilled Labor", "Unskilled Labor", "Supervision", "Technical Staff"],
                "Maintenance": ["Equipment Maintenance", "Building Maintenance", "Repair Services"],
            }
        }
    };

    // ✅ Validation rules - Updated with file validations
    const validationRules = {
        1: {
            companyName: { required: true, message: "Company name is required" },
            contactPerson: { required: true, message: "Contact person is required" },
            phone: {
                required: true,
                pattern: /^\d{10}$/,
                message: "Phone number must be 10 digits",
            },
            email: {
                pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Please enter a valid email address",
            },
        },
        2: {
            businessRegNumber: {
                required: true,
                message: "Business registration number is required",
            },
            gstNumber: {
                required: true,
                pattern: /^[0-9A-Z]{15}$/,
                message: "GST number must be 15 characters",
            },
            panNumber: {
                required: true,
                pattern: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
                message: "Please enter a valid PAN number",
            },
            // NEW: Document validation
            aadhaarCardFile: {
                required: true,
                message: "Aadhaar Card is required",
            },
            panCardFile: {
                required: true,
                message: "PAN Card is required",
            },
        },
        3: {
            registeredAddress: {
                required: true,
                message: "Registered address is required",
            },
            city: { required: true, message: "City is required" },
            state: { required: true, message: "State is required" },
            pincode: {
                required: true,
                pattern: /^\d{6}$/,
                message: "PIN code must be 6 digits",
            },
        },
        4: {
            bankName: { required: true, message: "Bank name is required" },
            accountNumber: {
                required: true,
                pattern: /^\d{9,18}$/,
                message: "Please enter a valid account number",
            },
            ifscCode: {
                required: true,
                pattern: /^[A-Z]{4}0[A-Z0-9]{6}$/,
                message: "Please enter a valid IFSC code",
            },
        },
    };

    // ✅ Step titles and icons - Updated for Step 2
    const stepConfig = {
        1: { title: "Basic Information", icon: <FaBuilding className="text-blue-600" /> },
        2: { title: "Business & KYC", icon: <FaIdCard className="text-green-600" /> }, // Changed icon
        3: { title: "Address", icon: <FiMapPin className="text-orange-600" /> },
        4: { title: "Bank Details", icon: <FiCreditCard className="text-purple-600" /> },
        5: { title: "Review", icon: <FiSave className="text-indigo-600" /> },
    };

    const vendorTypes = Object.keys(PRODUCT_CATEGORIES);
    const businessTypes = ["Manufacturer", "Distributor", "Service Provider", "Contractor", "Consultant"];
    const ownershipTypes = ["Proprietorship", "Partnership", "Private Limited", "Public Limited", "LLP"];

    // ✅ Get Current Location Function
    const getCurrentLocation = () => {
        if (!navigator.geolocation) {
            setLocationError("Geolocation is not supported by this browser.");
            return;
        }

        setIsGettingLocation(true);
        setLocationError("");

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const { latitude, longitude } = position.coords;
                    const response = await fetch(
                        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
                    );

                    if (!response.ok) throw new Error('Failed to fetch location data');

                    const data = await response.json();
                    const matchedState = State.getStatesOfCountry("IN").find(
                        s => s.name.toLowerCase() === data.principalSubdivision?.toLowerCase()
                    );

                    setFormData(prev => ({
                        ...prev,
                        registeredAddress: data.localityInfo?.administrative[2]?.name || data.city || "Unknown location",
                        city: data.city || data.locality || "",
                        state: matchedState?.isoCode || "",
                        pincode: data.postcode || ""
                    }));

                    toast.success("Current location detected successfully!");
                } catch (error) {
                    console.error("Error getting location:", error);
                    setLocationError("Failed to get detailed location information.");
                    const { latitude, longitude } = position.coords;
                    setFormData(prev => ({
                        ...prev,
                        registeredAddress: `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`
                    }));
                } finally {
                    setIsGettingLocation(false);
                }
            },
            (error) => {
                setIsGettingLocation(false);
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        setLocationError("Location access denied. Please enable location permissions.");
                        break;
                    case error.POSITION_UNAVAILABLE:
                        setLocationError("Location information unavailable.");
                        break;
                    case error.TIMEOUT:
                        setLocationError("Location request timed out.");
                        break;
                    default:
                        setLocationError("An unknown error occurred while getting location.");
                        break;
                }
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 60000
            }
        );
    };

    // ✅ Handle input changes
    const handleInputChange = (e) => {
        const { name, type, value, files, checked } = e.target;
        let processedValue = value;

        // Input restrictions
        if (type === "text" || type === "tel") {
            if (name === "phone" || name === "alternatePhone") {
                processedValue = value.replace(/\D/g, "").slice(0, 10);
            } else if (name === "pincode") {
                processedValue = value.replace(/\D/g, "").slice(0, 6);
            } else if (name === "annualTurnover" || name === "employeeCount") {
                processedValue = value.replace(/\D/g, "");
            } else if (name === "gstNumber") {
                processedValue = value.replace(/[^0-9A-Z]/gi, "").toUpperCase().slice(0, 15);
            } else if (name === "panNumber") {
                processedValue = value.replace(/[^0-9A-Z]/gi, "").toUpperCase().slice(0, 10);
            } else if (name === "ifscCode") {
                processedValue = value.replace(/[^0-9A-Z]/gi, "").toUpperCase().slice(0, 11);
            }
        }

        // Handle file uploads
        if (type === "file") {
            setFormData(prev => ({
                ...prev,
                [name]: files[0]
            }));

            validateField(name, files[0]);
            setTouched(prev => ({ ...prev, [name]: true }));
            return;
        }

        setFormData(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : processedValue,
        }));

        validateField(name, type === "checkbox" ? checked : processedValue);
        setTouched(prev => ({ ...prev, [name]: true }));
    };

    // ✅ Handle product category selection
    const handleCategoryToggle = (category) => {
        setFormData(prev => {
            const isSelected = prev.productCategories.includes(category);
            if (isSelected) {
                return {
                    ...prev,
                    productCategories: prev.productCategories.filter(cat => cat !== category)
                };
            } else {
                return {
                    ...prev,
                    productCategories: [...prev.productCategories, category]
                };
            }
        });
    };

    // ✅ Other functions
    const handleInputBlur = (e) => {
        const { name, value } = e.target;
        setTouched((prev) => ({ ...prev, [name]: true }));
        validateField(name, value);
    };

    const validateField = (fieldName, value) => {
        const stepWithField = Object.keys(validationRules).find(
            (s) => validationRules[s][fieldName]
        );

        if (!stepWithField) return;

        const rule = validationRules[stepWithField][fieldName];
        let error = "";

        if (rule.required && !value) {
            error = rule.message;
        } else if (rule.pattern && value && !rule.pattern.test(value)) {
            error = rule.message;
        }

        setErrors((prev) => ({ ...prev, [fieldName]: error }));
    };

    const validateStep = (step) => {
        const stepRules = validationRules[step];
        const newErrors = {};

        if (stepRules) {
            Object.keys(stepRules).forEach((field) => {
                const rule = stepRules[field];
                const value = formData[field];

                if (rule.required && !value) {
                    newErrors[field] = rule.message;
                } else if (rule.pattern && value && !rule.pattern.test(value)) {
                    newErrors[field] = rule.message;
                }
            });
        }

        if (stepRules) {
            const stepTouched = {};
            Object.keys(stepRules).forEach((f) => (stepTouched[f] = true));
            setTouched((prev) => ({ ...prev, ...stepTouched }));
        }

        setErrors((prev) => ({ ...prev, ...newErrors }));
        return Object.keys(newErrors).length === 0;
    };

    const nextStep = () => {
        if (validateStep(currentStep)) {
            setCurrentStep((prev) => Math.min(prev + 1, 5));
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    const prevStep = () => {
        setCurrentStep((prev) => Math.max(prev - 1, 1));
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // ✅ On Submit with FormData for file upload
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        let allValid = true;
        const allErrors = {};

        for (let step = 1; step <= 4; step++) {
            const stepRules = validationRules[step];
            if (stepRules) {
                Object.keys(stepRules).forEach((field) => {
                    const rule = stepRules[field];
                    const value = formData[field];
                    if (rule.required && !value) {
                        allErrors[field] = rule.message;
                        allValid = false;
                    } else if (rule.pattern && value && !rule.pattern.test(value)) {
                        allErrors[field] = rule.message;
                        allValid = false;
                    }
                });
            }
        }

        console.log('if')

        setErrors((prev) => ({ ...prev, ...allErrors }));
        setTouched((prev) => ({
            ...prev,
            ...Object.keys(allErrors).reduce((acc, k) => ({ ...acc, [k]: true }), {}),
        }));

        if (!allValid) {
            toast.error("❌ Please fix all validation errors before submitting.");
            const firstErrorField = Object.keys(allErrors)[0];
            const errorStep = Number(
                Object.keys(validationRules).find((s) => validationRules[s][firstErrorField])
            );
            if (errorStep) setCurrentStep(errorStep);
            setIsSubmitting(false);
            return;
        }

        try {
            console.log("🚀 Preparing FormData for submission...");

            // Create FormData for file upload
            const formPayload = new FormData();

            // Append all form data including files
            Object.entries(formData).forEach(([key, value]) => {
                console.log(`Processing ${key}:`, value);

                if (value === null || value === undefined || value === "") {
                    console.log(`Skipping empty field: ${key}`);
                    return;
                }

                // Handle file uploads
                const isFileField = [
                    // 'companyLogo',
                    'aadhaarCardFile',
                    'panCardFile'
                ].includes(key);

                if (isFileField) {
                    if (value instanceof File) {
                        formPayload.append(key, value);
                        console.log(`✅ Appended file: ${key} - ${value.name}`);
                    }
                } else if (Array.isArray(value)) {
                    // Handle array fields like productCategories
                    value.forEach((item, index) => {
                        formPayload.append(`${key}[${index}]`, item);
                    });
                    console.log(`✅ Appended array: ${key}`);
                } else {
                    // Regular field
                    formPayload.append(key, value);
                    console.log(`✅ Appended field: ${key}`);
                }
            });

            // Log FormData contents for debugging
            console.log("📦 FormData entries:");
            for (let pair of formPayload.entries()) {
                console.log(pair[0] + ': ' +
                    (pair[1] instanceof File ?
                        `File: ${pair[1].name}, Size: ${pair[1].size} bytes` :
                        pair[1])
                );
            }

            if (location?.state?.vendor) {
                // Edit mode
                console.log(`🔄 Updating vendor with ID: ${location.state.vendor._id}`);
                await updateVendor({
                    id: location.state.vendor._id,
                    formData: formPayload,
                }).unwrap();
            } else {
                // Create mode
                console.log("🆕 Creating new vendor");
                await addVendor(formPayload).unwrap();
            }

        } catch (error) {
            console.error("❌ Error submitting vendor:", error);
            toast.error(error?.data?.message || "Failed to save vendor");
        } finally {
            setIsSubmitting(false);
        }
    };

    // ✅ Handle API responses
    useEffect(() => {
        if (addResult.isSuccess) {
            toast.success("Vendor created successfully! ✅");
            navigate(-1);
        }

        if (addResult.isError) {
            console.error("Add vendor error:", addResult.error);
            toast.error(addResult?.error?.data?.message || "Something went wrong!");
        }

        if (updateResult.isSuccess) {
            toast.success("Vendor updated successfully! ✏️");
            navigate(-1);
        }

        if (updateResult.isError) {
            console.error("Update vendor error:", updateResult.error);
            toast.error(updateResult.error?.data?.message || "Update failed!");
        }
    }, [addResult, updateResult, navigate]);

    const isFieldValid = (fieldName) =>
        touched[fieldName] && !errors[fieldName] && formData[fieldName];

    // ✅ State and City Data
    const stateList = State.getStatesOfCountry("IN");
    const cityList = formData.state
        ? City.getCitiesOfState("IN", formData.state)
        : [];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-4 md:p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-all bg-white p-3 rounded-2xl shadow-sm hover:shadow-md border border-slate-200"
                            type="button"
                        >
                            <FiArrowLeft className="text-xl" />
                        </button>
                        <div>
                            <h1 className="text-xl sm:text-2xl font-normal bg-gradient-to-r from-slate-900 via-blue-800 to-purple-700 bg-clip-text text-transparent">
                                {location?.state?.vendor ? "Edit Vendor" : "Add New Vendor"}
                            </h1>
                            <p className="text-slate-600 text-sm md:text-base">
                                Complete all details to register new vendor
                            </p>
                        </div>
                    </div>

                    <div className="text-sm text-slate-500 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200">
                        Step <span className="font-bold text-blue-600">{currentStep}</span> of 5
                    </div>
                </div>

                {/* Step Progress UI */}
                <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6 mb-8 border border-slate-200">
                    <div className="flex justify-between items-center relative">
                        <div className="absolute top-6 left-0 right-0 h-1 bg-slate-200 -z-10">
                            <div
                                className="h-1 bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-500"
                                style={{ width: `${((currentStep - 1) / 4) * 100}%` }}
                            />
                        </div>

                        {[1, 2, 3, 4, 5].map((step) => (
                            <div key={step} className="flex flex-col items-center relative z-10">
                                <div
                                    className={`w-12 h-12 rounded-2xl flex items-center justify-center border-2 font-semibold transition-all duration-300 transform hover:scale-110 ${step === currentStep
                                        ? " text-white border-blue-600 shadow-lg shadow-blue-500/25"
                                        : step < currentStep
                                            ? "bg-green-500 text-white border-green-500 shadow-lg shadow-green-500/25"
                                            : "bg-white text-slate-400 border-slate-300"
                                        }`}
                                >
                                    {step < currentStep ? (
                                        <FiCheck className="text-lg" />
                                    ) : (
                                        stepConfig[step]?.icon || step
                                    )}
                                </div>
                                <span
                                    className={`text-xs font-medium mt-2 transition-all truncate max-w-[200px] text-center ${step === currentStep
                                        ? "text-blue-600 font-semibold"
                                        : step < currentStep
                                            ? "text-green-600"
                                            : "text-slate-500"
                                        }`}
                                >
                                    {stepConfig[step]?.title}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
                        {/* Current Step Header */}
                        <div className="bg-gradient-to-r from-slate-50 to-blue-50/50 border-b border-slate-200 p-6">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-200">
                                    {stepConfig[currentStep]?.icon}
                                </div>
                                <div>
                                    <h2 className="text-xl md:text-2xl font-bold text-slate-900">
                                        {stepConfig[currentStep]?.title}
                                    </h2>
                                    <p className="text-slate-600 text-sm">
                                        {currentStep === 5
                                            ? "Review all details before submission"
                                            : `Fill in the ${stepConfig[currentStep]?.title.toLowerCase()} information`}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 md:p-8">
                            {/* STEP 1 - Basic Information */}
                            {currentStep === 1 && (
                                <div className="space-y-8">
                                    {/* Logo Upload and Basic Info */}
                                    <div className="flex flex-col lg:flex-row items-start gap-8">
                                        <div className="flex-shrink-0">
                                            <div className="w-32 h-32 bg-slate-100 rounded-2xl border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden">
                                                {formData.companyLogo ? (
                                                    <img
                                                        src={URL.createObjectURL(formData.companyLogo)}
                                                        alt="Preview"
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <FiUpload className="text-3xl text-slate-400" />
                                                )}
                                            </div>
                                            <input
                                                type="file"
                                                id="companyLogo"
                                                name="companyLogo"
                                                accept="image/*"
                                                onChange={handleInputChange}
                                                className="hidden"
                                            />
                                            <label
                                                htmlFor="companyLogo"
                                                className="block text-center mt-2 text-blue-600 hover:text-blue-800 cursor-pointer text-sm"
                                            >
                                                Upload Logo
                                            </label>
                                        </div>

                                        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <Input
                                                name="companyName"
                                                label="Company Name"
                                                value={formData.companyName}
                                                onChange={handleInputChange}
                                                onBlur={handleInputBlur}
                                                error={errors.companyName}
                                                touched={touched.companyName}
                                                isValid={isFieldValid("companyName")}
                                            />

                                            <Input
                                                name="contactPerson"
                                                label="Contact Person Name"
                                                value={formData.contactPerson}
                                                onChange={handleInputChange}
                                                onBlur={handleInputBlur}
                                                error={errors.contactPerson}
                                                touched={touched.contactPerson}
                                                isValid={isFieldValid("contactPerson")}
                                            />

                                            <Input
                                                name="email"
                                                label="Email Address"
                                                type="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                onBlur={handleInputBlur}
                                                error={errors.email}
                                                touched={touched.email}
                                                isValid={isFieldValid("email")}
                                            />

                                            <Input
                                                name="phone"
                                                label="Phone Number"
                                                value={formData.phone}
                                                onChange={handleInputChange}
                                                onBlur={handleInputBlur}
                                                error={errors.phone}
                                                touched={touched.phone}
                                                isValid={isFieldValid("phone")}
                                            />
                                        </div>
                                    </div>

                                    {/* Product Categories Section */}
                                    {/* <div className="bg-blue-50/50 rounded-xl p-6 border border-blue-200">
                                        <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                                            <FiBriefcase className="text-blue-600" />
                                            Product Categories
                                        </h3>

                                        
                                        <div className="flex flex-wrap gap-3 mb-6">
                                            {vendorTypes.map((type) => (
                                                <button
                                                    key={type}
                                                    type="button"
                                                    onClick={() => {
                                                        setFormData((prev) => ({
                                                            ...prev,
                                                            vendorType: type,
                                                        }));
                                                        validateField("vendorType", type);
                                                        setTouched(prev => ({ ...prev, vendorType: true }));
                                                    }}
                                                    className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all 
                                                          ${formData.vendorType === type
                                                            ? "bg-blue-600 text-white border-blue-600"
                                                            : "bg-white text-slate-700 border-slate-300 hover:bg-blue-50"}`}
                                                >
                                                    {type}
                                                </button>
                                            ))}
                                        </div>

                                        {formData.vendorType && (
                                            <div className="space-y-4">
                                                <p className="text-slate-600 text-sm">
                                                    Select product categories for {formData.vendorType}:
                                                </p>
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                                    {Object.keys(PRODUCT_CATEGORIES[formData.vendorType]?.subcategories || {}).map((subcategory) => (
                                                        <div key={subcategory} className="bg-white rounded-lg p-3 border border-slate-200">
                                                            <h4 className="font-semibold text-slate-800 text-sm mb-2">{subcategory}</h4>
                                                            <div className="space-y-1">
                                                                {PRODUCT_CATEGORIES[formData.vendorType].subcategories[subcategory].map((product) => (
                                                                    <div key={product} className="flex items-center gap-2">
                                                                        <input
                                                                            type="checkbox"
                                                                            id={product}
                                                                            checked={formData.productCategories.includes(product)}
                                                                            onChange={() => handleCategoryToggle(product)}
                                                                            className="rounded text-blue-600"
                                                                        />
                                                                        <label htmlFor={product} className="text-slate-700 text-sm cursor-pointer">
                                                                            {product}
                                                                        </label>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {!formData.vendorType && (
                                            <p className="text-slate-500 text-sm">Please select a vendor type to see available categories</p>
                                        )}
                                    </div> */}
                                </div>
                            )}

                            {/* STEP 2 - Business Details & KYC Documents */}
                            {currentStep === 2 && (
                                <div className="space-y-8">
                                    {/* Business Details Section */}
                                    <div className="bg-green-50/50 rounded-xl p-6 border border-green-200 mb-6">
                                        <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                                            <FiBriefcase className="text-green-600" />
                                            Business Details
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <Input
                                                name="businessRegNumber"
                                                label="Business Registration Number"
                                                value={formData.businessRegNumber}
                                                onChange={handleInputChange}
                                                onBlur={handleInputBlur}
                                                error={errors.businessRegNumber}
                                                touched={touched.businessRegNumber}
                                                isValid={isFieldValid("businessRegNumber")}
                                            />

                                            <Input
                                                name="gstNumber"
                                                label="GST Number"
                                                value={formData.gstNumber}
                                                onChange={handleInputChange}
                                                onBlur={handleInputBlur}
                                                error={errors.gstNumber}
                                                touched={touched.gstNumber}
                                                isValid={isFieldValid("gstNumber")}
                                            />

                                            <Input
                                                name="panNumber"
                                                label="PAN Number"
                                                value={formData.panNumber}
                                                onChange={handleInputChange}
                                                onBlur={handleInputBlur}
                                                error={errors.panNumber}
                                                touched={touched.panNumber}
                                                isValid={isFieldValid("panNumber")}
                                            />

                                            <Select
                                                name="businessType"
                                                label="Business Type"
                                                options={businessTypes}
                                                value={formData.businessType}
                                                onChange={handleInputChange}
                                                onBlur={handleInputBlur}
                                            />

                                            <Select
                                                name="ownershipType"
                                                label="Ownership Type"
                                                options={ownershipTypes}
                                                value={formData.ownershipType}
                                                onChange={handleInputChange}
                                                onBlur={handleInputBlur}
                                            />
                                        </div>
                                    </div>

                                    {/* KYC Documents Section - NEW */}
                                    <div className="bg-orange-50/50 rounded-xl p-6 border border-orange-200">
                                        <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                                            <FaIdCard className="text-orange-600" />
                                            KYC Documents (Required)
                                        </h3>
                                        <p className="text-slate-600 text-sm mb-6">
                                            Upload clear scanned copies of Aadhaar Card and PAN Card
                                        </p>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* Aadhaar Card Upload */}
                                            <div className="space-y-3">
                                                <label className="text-slate-700 text-sm font-semibold flex items-center gap-2">
                                                    <FaIdCard className="text-blue-600" />
                                                    Aadhaar Card
                                                    <span className="text-red-500">*</span>
                                                </label>

                                                <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 hover:border-blue-500 transition-colors">
                                                    <div className="flex flex-col items-center">
                                                        {formData.aadhaarCardFile ? (
                                                            <>
                                                                <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mb-2">
                                                                    <FiFileText className="w-8 h-8 text-blue-600" />
                                                                </div>
                                                                <p className="text-sm text-slate-700 font-medium truncate max-w-full">
                                                                    {formData.aadhaarCardFile.name}
                                                                </p>
                                                                <p className="text-xs text-slate-500">
                                                                    {(formData.aadhaarCardFile.size / 1024).toFixed(2)} KB
                                                                </p>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center mb-2">
                                                                    <FiUpload className="w-8 h-8 text-slate-400" />
                                                                </div>
                                                                <p className="text-sm text-slate-500">Click to upload Aadhaar Card</p>
                                                                <p className="text-xs text-slate-400">PDF, JPG, PNG (Max 5MB)</p>
                                                            </>
                                                        )}
                                                    </div>

                                                    <input
                                                        type="file"
                                                        id="aadhaarCardFile"
                                                        name="aadhaarCardFile"
                                                        accept=".pdf,.jpg,.jpeg,.png"
                                                        onChange={handleInputChange}
                                                        className="hidden"
                                                    />
                                                    <label
                                                        htmlFor="aadhaarCardFile"
                                                        className="block mt-3 text-center"
                                                    >
                                                        <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer text-sm">
                                                            <FiUpload className="w-4 h-4" />
                                                            {formData.aadhaarCardFile ? "Change File" : "Upload Aadhaar Card"}
                                                        </span>
                                                    </label>
                                                </div>

                                                {errors.aadhaarCardFile && touched.aadhaarCardFile && (
                                                    <div className="flex items-center gap-1 text-red-600 text-sm">
                                                        <FiAlertCircle className="w-4 h-4 flex-shrink-0" />
                                                        {errors.aadhaarCardFile}
                                                    </div>
                                                )}
                                            </div>

                                            {/* PAN Card Upload */}
                                            <div className="space-y-3">
                                                <label className="text-slate-700 text-sm font-semibold flex items-center gap-2">
                                                    <FaFileInvoice className="text-green-600" />
                                                    PAN Card
                                                    <span className="text-red-500">*</span>
                                                </label>

                                                <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 hover:border-green-500 transition-colors">
                                                    <div className="flex flex-col items-center">
                                                        {formData.panCardFile ? (
                                                            <>
                                                                <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mb-2">
                                                                    <FiFile className="w-8 h-8 text-green-600" />
                                                                </div>
                                                                <p className="text-sm text-slate-700 font-medium truncate max-w-full">
                                                                    {formData.panCardFile.name}
                                                                </p>
                                                                <p className="text-xs text-slate-500">
                                                                    {(formData.panCardFile.size / 1024).toFixed(2)} KB
                                                                </p>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center mb-2">
                                                                    <FiUpload className="w-8 h-8 text-slate-400" />
                                                                </div>
                                                                <p className="text-sm text-slate-500">Click to upload PAN Card</p>
                                                                <p className="text-xs text-slate-400">PDF, JPG, PNG (Max 5MB)</p>
                                                            </>
                                                        )}
                                                    </div>

                                                    <input
                                                        type="file"
                                                        id="panCardFile"
                                                        name="panCardFile"
                                                        accept=".pdf,.jpg,.jpeg,.png"
                                                        onChange={handleInputChange}
                                                        className="hidden"
                                                    />
                                                    <label
                                                        htmlFor="panCardFile"
                                                        className="block mt-3 text-center"
                                                    >
                                                        <span className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer text-sm">
                                                            <FiUpload className="w-4 h-4" />
                                                            {formData.panCardFile ? "Change File" : "Upload PAN Card"}
                                                        </span>
                                                    </label>
                                                </div>

                                                {errors.panCardFile && touched.panCardFile && (
                                                    <div className="flex items-center gap-1 text-red-600 text-sm">
                                                        <FiAlertCircle className="w-4 h-4 flex-shrink-0" />
                                                        {errors.panCardFile}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* File Requirements Info */}
                                        <div className="mt-6 p-3 bg-slate-50 rounded-lg border border-slate-200">
                                            <p className="text-sm text-slate-600 flex items-center gap-2">
                                                <FiAlertCircle className="w-4 h-4 text-blue-600" />
                                                <span className="font-medium">File Requirements:</span> Clear, readable scanned copies. Max file size: 5MB each. Accepted formats: PDF, JPG, PNG
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* STEP 3 - Address with Location Detection */}
                            {currentStep === 3 && (
                                <div className="space-y-8">
                                    <div className="bg-orange-50/50 rounded-xl p-6 border border-orange-200">
                                        <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                                            <FiMapPin className="text-orange-600" /> Address Information
                                        </h3>
                                        <div className="space-y-6">
                                            {/* Location Detection */}
                                            <div className="space-y-2">
                                                <div className="flex justify-between">
                                                    <label className="text-slate-700 text-sm font-semibold block">
                                                        Registered Address
                                                    </label>
                                                    <button
                                                        type="button"
                                                        onClick={getCurrentLocation}
                                                        disabled={isGettingLocation}
                                                        className="px-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2 self-start"
                                                    >
                                                        {isGettingLocation ? (
                                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-md animate-spin" />
                                                        ) : (
                                                            <>
                                                                <FiNavigation className="w-4 h-4" /> Auto Fetch
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                                <div className="flex gap-2">
                                                    <textarea
                                                        name="registeredAddress"
                                                        value={formData.registeredAddress}
                                                        onChange={handleInputChange}
                                                        onBlur={handleInputBlur}
                                                        rows="3"
                                                        className={`flex-1 p-3 pr-10 border-2 rounded-xl focus:outline-none transition-all duration-200 resize-none ${errors.registeredAddress && touched.registeredAddress
                                                            ? "border-red-500 focus:border-red-500 bg-red-50/50"
                                                            : isFieldValid("registeredAddress")
                                                                ? "border-green-500 focus:border-green-500 bg-green-50/50"
                                                                : "border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 hover:border-slate-300"
                                                            }`}
                                                        placeholder="Click the GPS button to detect location automatically"
                                                    />
                                                </div>
                                                {locationError && (
                                                    <div className="flex items-center gap-1 text-red-600 text-sm">
                                                        <FiAlertCircle className="w-4 h-4 flex-shrink-0" />
                                                        {locationError}
                                                    </div>
                                                )}
                                                {isGettingLocation && (
                                                    <div className="text-blue-600 text-sm flex items-center gap-1">
                                                        <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                                                        Detecting your location...
                                                    </div>
                                                )}
                                                {errors.registeredAddress && touched.registeredAddress && (
                                                    <div className="flex items-center gap-1 text-red-600 text-sm">
                                                        <FiAlertCircle className="w-4 h-4 flex-shrink-0" />
                                                        {errors.registeredAddress}
                                                    </div>
                                                )}
                                            </div>

                                            <Input
                                                name="address"
                                                label="Office/Operational Address"
                                                type="textarea"
                                                value={formData.address}
                                                onChange={handleInputChange}
                                                onBlur={handleInputBlur}
                                            />

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <Select
                                                    name="state"
                                                    label="State"
                                                    options={stateList?.map((st) => ({
                                                        label: st.name,
                                                        value: st.isoCode
                                                    }))}
                                                    value={formData.state}
                                                    onChange={(e) => {
                                                        handleInputChange(e);
                                                        setFormData((prev) => ({
                                                            ...prev,
                                                            state: e.target.value,
                                                            city: "",
                                                            pincode: "",
                                                        }));
                                                    }}
                                                    onBlur={handleInputBlur}
                                                    error={errors.state}
                                                    touched={touched.state}
                                                    isValid={isFieldValid("state")}
                                                />

                                                <Select
                                                    name="city"
                                                    label="City"
                                                    options={cityList?.map((ct) => ({
                                                        label: ct.name,
                                                        value: ct.name
                                                    }))}
                                                    value={formData.city}
                                                    disabled={!formData.state}
                                                    onChange={handleInputChange}
                                                    onBlur={handleInputBlur}
                                                    error={errors.city}
                                                    touched={touched.city}
                                                    isValid={isFieldValid("city")}
                                                />

                                                <Input
                                                    name="pincode"
                                                    label="PIN Code"
                                                    value={formData.pincode}
                                                    onChange={handleInputChange}
                                                    onBlur={handleInputBlur}
                                                    error={errors.pincode}
                                                    touched={touched.pincode}
                                                    isValid={isFieldValid("pincode")}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* STEP 4 - Bank Details */}
                            {currentStep === 4 && (
                                <div className="space-y-8">
                                    <div className="bg-purple-50/50 rounded-xl p-6 border border-purple-200">
                                        <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                                            <FiCreditCard className="text-purple-600" />
                                            Bank Details
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <Input
                                                name="bankName"
                                                label="Bank Name"
                                                value={formData.bankName}
                                                onChange={handleInputChange}
                                                onBlur={handleInputBlur}
                                                error={errors.bankName}
                                                touched={touched.bankName}
                                                isValid={isFieldValid("bankName")}
                                            />

                                            <Input
                                                name="accountNumber"
                                                label="Account Number"
                                                value={formData.accountNumber}
                                                onChange={handleInputChange}
                                                onBlur={handleInputBlur}
                                                error={errors.accountNumber}
                                                touched={touched.accountNumber}
                                                isValid={isFieldValid("accountNumber")}
                                            />

                                            <Input
                                                name="ifscCode"
                                                label="IFSC Code"
                                                value={formData.ifscCode}
                                                onChange={handleInputChange}
                                                onBlur={handleInputBlur}
                                                error={errors.ifscCode}
                                                touched={touched.ifscCode}
                                                isValid={isFieldValid("ifscCode")}
                                            />

                                            <Input
                                                name="accountHolderName"
                                                label="Account Holder Name"
                                                value={formData.accountHolderName}
                                                onChange={handleInputChange}
                                                onBlur={handleInputBlur}
                                            />

                                            <Input
                                                name="branchName"
                                                label="Branch Name"
                                                value={formData.branchName}
                                                onChange={handleInputChange}
                                                onBlur={handleInputBlur}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* STEP 5 - Review Step */}
                            {currentStep === 5 && (
                                <div className="space-y-6">
                                    <ReviewSection
                                        title="Vendor Basic Information"
                                        icon={<FaBuilding className="text-blue-600" />}
                                        data={[
                                            { label: "Company Name", value: formData.companyName },
                                            { label: "Vendor Type", value: formData.vendorType },
                                            { label: "Contact Person", value: formData.contactPerson },
                                            { label: "Email", value: formData.email },
                                            { label: "Phone", value: formData.phone },
                                            { label: "Website", value: formData.website },
                                        ]}
                                    />

                                    <ReviewSection
                                        title="Business Information"
                                        icon={<FiBriefcase className="text-green-600" />}
                                        data={[
                                            { label: "Business Registration", value: formData.businessRegNumber },
                                            { label: "GST Number", value: formData.gstNumber },
                                            { label: "PAN Number", value: formData.panNumber },
                                            { label: "Year Established", value: formData.yearEstablished },
                                            { label: "Business Type", value: formData.businessType },
                                            { label: "Ownership Type", value: formData.ownershipType },
                                            { label: "Annual Turnover", value: formData.annualTurnover ? `₹${formData.annualTurnover}` : "" },
                                            { label: "Employee Count", value: formData.employeeCount },
                                        ]}
                                    />

                                    {/* KYC Documents Review */}
                                    <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                                        <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                                            <FaIdCard className="text-orange-600" />
                                            KYC Documents
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-slate-600 text-sm font-medium">Aadhaar Card</label>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                                        <FiFileText className="w-6 h-6 text-blue-600" />
                                                    </div>
                                                    <div>
                                                        <p className="text-slate-900 font-semibold">
                                                            {formData.aadhaarCardFile ?
                                                                formData.aadhaarCardFile.name :
                                                                <span className="text-slate-400 italic">Not uploaded</span>
                                                            }
                                                        </p>
                                                        {formData.aadhaarCardFile && (
                                                            <p className="text-slate-500 text-sm">
                                                                {(formData.aadhaarCardFile.size / 1024).toFixed(2)} KB
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-slate-600 text-sm font-medium">PAN Card</label>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                                        <FiFile className="w-6 h-6 text-green-600" />
                                                    </div>
                                                    <div>
                                                        <p className="text-slate-900 font-semibold">
                                                            {formData.panCardFile ?
                                                                formData.panCardFile.name :
                                                                <span className="text-slate-400 italic">Not uploaded</span>
                                                            }
                                                        </p>
                                                        {formData.panCardFile && (
                                                            <p className="text-slate-500 text-sm">
                                                                {(formData.panCardFile.size / 1024).toFixed(2)} KB
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <ReviewSection
                                        title="Address Information"
                                        icon={<FiMapPin className="text-orange-600" />}
                                        data={[
                                            { label: "Registered Address", value: formData.registeredAddress },
                                            { label: "Office Address", value: formData.address },
                                            { label: "City", value: formData.city },
                                            { label: "State", value: formData.state },
                                            { label: "PIN Code", value: formData.pincode },
                                        ]}
                                    />

                                    <ReviewSection
                                        title="Bank Details"
                                        icon={<FiCreditCard className="text-purple-600" />}
                                        data={[
                                            { label: "Bank Name", value: formData.bankName },
                                            { label: "Account Number", value: formData.accountNumber },
                                            { label: "IFSC Code", value: formData.ifscCode },
                                            { label: "Account Holder", value: formData.accountHolderName },
                                            { label: "Branch Name", value: formData.branchName },
                                        ]}
                                    />

                                    {/* Product Categories Review */}
                                    {formData.productCategories.length > 0 && (
                                        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                                            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                                                <FiBriefcase className="text-blue-600" />
                                                Selected Product Categories
                                            </h3>
                                            <div className="flex flex-wrap gap-2">
                                                {formData.productCategories.map((category, index) => (
                                                    <span key={index} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                                                        {category}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* BUTTONS */}
                        <div className="flex justify-between items-center pt-6 border-t border-slate-200 mt-8 px-6 md:px-8 pb-6 bg-slate-50/50">
                            <button
                                type="button"
                                onClick={prevStep}
                                disabled={currentStep === 1}
                                className={`px-3 md:px-8 py-3 md:py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${currentStep === 1
                                    ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                                    : "bg-slate-600 text-white hover:bg-slate-700 shadow-sm hover:shadow-md transform hover:-translate-x-1"
                                    }`}
                            >
                                <ArrowLeft className="w-4 h-4" /> Previous
                            </button>

                            <div className="text-xs text-slate-500 text-center">
                                {currentStep < 5 ? `Step ${currentStep} of 5` : "Final Review"}
                            </div>

                            {currentStep < 5 ? (
                                <button
                                    type="button"
                                    onClick={nextStep}
                                    className="px-3 md:px-8 py-3 md:py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 shadow-sm hover:shadow-md transform hover:translate-x-1 transition-all flex items-center gap-2"
                                >
                                    Next Step <ArrowRight className="w-4 h-4" />
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-6 md:px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-semibold hover:from-green-700 hover:to-green-800 shadow-sm hover:shadow-md transform hover:scale-105 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            {location?.state?.vendor ? "Updating..." : "Creating..."}
                                        </>
                                    ) : (
                                        <>
                                            {location?.state?.vendor ? "Update Vendor" : "Create Vendor"}
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ✅ Enhanced Input Component with real-time validation
const Input = ({ name, label, type = "text", value, onChange, onBlur, error, touched, isValid }) => {
    const getInputMode = () => {
        if (name === "phone" || name === "alternatePhone") return "numeric";
        if (name === "pincode") return "numeric";
        return "text";
    };

    const getMaxLength = () => {
        if (name === "phone" || name === "alternatePhone") return 10;
        if (name === "pincode") return 6;
        if (name === "gstNumber") return 15;
        if (name === "panNumber") return 10;
        if (name === "ifscCode") return 11;
        return undefined;
    };

    if (type === "textarea") {
        return (
            <div className="space-y-2">
                <label className="text-slate-700 text-sm font-semibold block">
                    {label}
                    {error && <span className="text-red-500 ml-1">*</span>}
                </label>
                <div className="relative">
                    <textarea
                        name={name}
                        value={value}
                        onChange={onChange}
                        onBlur={onBlur}
                        rows="3"
                        className={`w-full p-3 pr-10 border-2 rounded-xl focus:outline-none transition-all duration-200 resize-none ${error && touched
                            ? "border-red-500 focus:border-red-500 bg-red-50/50"
                            : isValid
                                ? "border-green-500 focus:border-green-500 bg-green-50/50"
                                : "border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 hover:border-slate-300"
                            }`}
                    />
                    {touched && (
                        <div className="absolute right-3 top-3">
                            {error ? (
                                <FiXCircle className="w-5 h-5 text-red-500" />
                            ) : isValid ? (
                                <FiCheckCircle className="w-5 h-5 text-green-500" />
                            ) : null}
                        </div>
                    )}
                </div>
                {error && touched && (
                    <div className="flex items-center gap-1 text-red-600 text-sm">
                        <FiAlertCircle className="w-4 h-4 flex-shrink-0" />
                        {error}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-2">
            <label className="text-slate-700 text-sm font-semibold block">
                {label}
                {error && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="relative">
                <input
                    name={name}
                    type={type}
                    value={value}
                    onChange={onChange}
                    onBlur={onBlur}
                    inputMode={getInputMode()}
                    maxLength={getMaxLength()}
                    className={`w-full p-3 pr-10 border-2 rounded-xl focus:outline-none transition-all duration-200 ${error && touched
                        ? "border-red-500 focus:border-red-500 bg-red-50/50"
                        : isValid
                            ? "border-green-500 focus:border-green-500 bg-green-50/50"
                            : "border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 hover:border-slate-300"
                        }`}
                />
                {touched && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        {error ? (
                            <FiXCircle className="w-5 h-5 text-red-500" />
                        ) : isValid ? (
                            <FiCheckCircle className="w-5 h-5 text-green-500" />
                        ) : null}
                    </div>
                )}
            </div>
            {error && touched && (
                <div className="flex items-center gap-1 text-red-600 text-sm">
                    <FiAlertCircle className="w-4 h-4 flex-shrink-0" />
                    {error}
                </div>
            )}
        </div>
    );
};

// ✅ Enhanced Select Component with real-time validation
const Select = ({ name, label, value, onChange, onBlur, options, error, touched, isValid }) => (
    <div className="space-y-2">
        <label className="text-slate-700 text-sm font-semibold block">
            {label}
            {error && <span className="text-red-500 ml-1">*</span>}
        </label>
        <div className="relative">
            <select
                name={name}
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                className={`w-full p-3 pr-10 border-2 rounded-xl focus:outline-none transition-all duration-200 appearance-none ${error && touched
                    ? "border-red-500 focus:border-red-500 bg-red-50/50"
                    : isValid
                        ? "border-green-500 focus:border-green-500 bg-green-50/50"
                        : "border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 hover:border-slate-300"
                    }`}
            >
                <option value="">Select an option</option>
                {options?.map((opt, idx) => (
                    <option key={idx} value={typeof opt === "object" ? opt.value : opt}>
                        {typeof opt === "object" ? opt.label : opt}
                    </option>
                ))}
            </select>
            {touched && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    {error ? (
                        <FiXCircle className="w-5 h-5 text-red-500" />
                    ) : isValid ? (
                        <FiCheckCircle className="w-5 h-5 text-green-500" />
                    ) : null}
                </div>
            )}
        </div>
        {error && touched && (
            <div className="flex items-center gap-1 text-red-600 text-sm">
                <FiAlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
            </div>
        )}
    </div>
);

// ✅ Review Section Component
const ReviewSection = ({ title, icon, data }) => (
    <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
        <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            {icon} {title}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.map((item, index) => (
                <div key={index} className="space-y-1">
                    <label className="text-slate-600 text-sm font-medium">{item.label}</label>
                    <p className="text-slate-900 font-semibold">
                        {item.value || <span className="text-slate-400 italic">Not provided</span>}
                    </p>
                </div>
            ))}
        </div>
    </div>
);

export default CreateNewVendorForm;