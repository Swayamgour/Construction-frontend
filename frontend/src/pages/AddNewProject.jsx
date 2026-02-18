import React, { useState, useEffect } from "react";
import {
    FiArrowLeft,
    FiSave,
    FiClipboard,
    FiMapPin,
    FiCheck,
    FiAlertCircle,
    FiXCircle,
    FiCheckCircle,
    FiEdit,
    FiNavigation,
} from "react-icons/fi";
import { FaFileContract, FaUserTie } from "react-icons/fa";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { State, City } from "country-state-city";
import toast from "react-hot-toast";
import { useAddProjectMutation, useGetRolesQuery, useGetUsersQuery, useUpdateProjectMutation } from "../Reduxe/Api";

const AddNewProject = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const id = location?.state?.projectId?._id;

    const { data } = useGetRolesQuery()

    // console.log(data)

    const isEditMode = Boolean(id);
    const existingProject = location?.state?.projectId;
    const [addProject] = useAddProjectMutation();
    const [updateProject] = useUpdateProjectMutation();
    const apiProject = location?.state?.projectId;

    const [formData, setFormData] = useState({
        // ✅ 1. General Project Details
        projectName: "",
        clientName: "",
        projectCode: "",
        projectType: "",
        workScope: "",
        contractType: "",

        // ✅ 2. Site Information
        siteLocation: "",
        currentLocation: "",
        city: "",
        state: "",
        pinCode: "",
        siteArea: "",
        builtUpArea: "",
        landmark: "",
        latitude: "",
        longitude: "",




        // ✅ 3. Client / Authorized Person
        companyName: "",
        gst: "",
        ownerName: "",
        authorizedPerson: "",
        designation: "",
        contactNumber: "",
        email: "",
        alternateContact: "",

        // ✅ 4. Project Timeline
        workOrderDate: "",
        expectedStartDate: "",
        actualStartDate: "",
        expectedCompletionDate: "",
        actualCompletionDate: "",
        projectDuration: "",

        // ✅ 5. Internal Details
        projectIncharge: "",
        projectManager: "",
        managerId: '',
        consultantArchitect: "",
        structuralConsultant: "",
        subcontractorVendor: "",
        supervisorName: "",

        // ✅ 6. Attachments (PDF checklists)
        workOrderFile: null,
        siteLayoutFile: null,
        drawingsFile: null,
        clientKycFile: null,
        projectPhotosFile: null,
        notesFile: null,
    });

    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isGettingLocation, setIsGettingLocation] = useState(false);
    const [locationError, setLocationError] = useState("");

    // ✅ Populate form with existing data when in edit mode
    useEffect(() => {
        if (isEditMode) {
            const projectData = existingProject || apiProject;
            if (projectData) {
                console.log("Populating form with project data:", projectData);
                setFormData(prev => ({
                    ...prev,
                    ...projectData,
                    projectIncharge: projectData?.projectIncharge?._id || "",
                    managerId: projectData?.managerId?._id || "",
                    consultantArchitect: projectData?.consultantArchitect?._id || projectData?.consultantArchitect || "",
                    structuralConsultant: projectData?.structuralConsultant?._id || projectData?.structuralConsultant || "",
                    // supervisors: projectData?.supervisor?._id || projectData?.supervisor || "",
                    supervisors: projectData?.supervisors ? projectData.supervisors.map(s => s._id) : [],

                    subcontractorVendor: projectData?.subcontractorVendor?._id || projectData?.subcontractorVendor || "",
                    workOrderDate: formatDateForInput(projectData.workOrderDate),
                    expectedStartDate: formatDateForInput(projectData.expectedStartDate),
                    actualStartDate: formatDateForInput(projectData.actualStartDate),
                    expectedCompletionDate: formatDateForInput(projectData.expectedCompletionDate),
                    actualCompletionDate: formatDateForInput(projectData.actualCompletionDate),
                }));

            }
        }
    }, [isEditMode, existingProject, apiProject]);

    // Helper function to format dates for input fields
    const formatDateForInput = (dateString) => {
        if (!dateString) return "";
        try {
            const date = new Date(dateString);
            return date.toISOString().split('T')[0];
        } catch (error) {
            console.error("Error formatting date:", error);
            return "";
        }
    };

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

                    // Reverse geocoding to get address
                    const response = await fetch(
                        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
                    );
                    // console.log(response)

                    if (!response.ok) {
                        throw new Error('Failed to fetch location data');
                    }

                    const data = await response.json();

                    const matchedState = State.getStatesOfCountry("IN").find(
                        s => s.name.toLowerCase() === data.principalSubdivision?.toLowerCase()
                    );

                    setFormData(prev => ({
                        ...prev,
                        currentLocation: data.locality || data.city || matchedState?.name || "Unknown location",
                        city: data.locality || data.city || "",
                        state: matchedState?.isoCode || "",
                        pinCode: data.postcode || "",
                        locationMapLink: `https://www.google.com/maps?q=${latitude},${longitude}`,  // ⭐ NEW FIELD
                        // latitude: latitude.toFixed(6),
                        // longitude: longitude.toFixed(6),

                        latitude: Number(latitude.toFixed(6)),
                        longitude: Number(longitude.toFixed(6)),
                        locationMapLink: `https://www.google.com/maps?q=${latitude},${longitude}`
                    }));


                    console.log(formData, data)






                    toast.success("Current location detected successfully!");

                } catch (error) {
                    console.error("Error getting location:", error);
                    setLocationError("Failed to get detailed location information.");

                    // Fallback: Just show coordinates
                    const { latitude, longitude } = position.coords;
                    setFormData(prev => ({
                        ...prev,
                        currentLocation: `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`
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

    // console.log(formData)

    // // ✅ Auto-detect location when component mounts (optional)
    // useEffect(() => {
    //     // Uncomment the line below if you want to auto-detect location on component mount
    //     // getCurrentLocation();
    // }, []);

    // ✅ Validation rules for each step
    const validationRules = {
        1: {
            projectName: { required: true, message: "Project name is required" },
            clientName: { required: true, message: "Client name is required" },
            projectCode: { required: false, message: "Project code is required" },
            projectType: { required: true, message: "Project type is required" },
            workScope: { required: true, message: "Work scope is required" },
            contractType: { required: true, message: "Contract type is required" },
        },
        2: {
            workOrderDate: { required: true, message: "Work order date is required" },
            expectedStartDate: {
                required: true,
                message: "Expected start date is required",
            },
            expectedCompletionDate: {
                required: true,
                message: "Expected completion date is required",
            },
            projectDuration: {
                // pattern: /^\d+$/,
                message: "Project duration must be a number",
            },
        },
        3: {
            siteLocation: { required: true, message: "Site location is required" },
            currentLocation: { required: false, message: "Current location is required" },
            city: { required: true, message: "City is required" },
            state: { required: true, message: "State is required" },
            pinCode: {
                required: true,
                pattern: /^\d{6}$/,
                message: "PIN code must be 6 digits",
            },
            siteArea: {
                pattern: /^\d*\.?\d*$/,
                message: "Site area must be a number",
            },
            builtUpArea: {
                pattern: /^\d*\.?\d*$/,
                message: "Built-up area must be a number",
            },
            companyName: { required: true, message: "Company name is required" },
            contactNumber: {
                required: true,
                pattern: /^\d{10}$/,
                message: "Contact number must be 10 digits",
            },
            email: {
                required: true,
                pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Please enter a valid email address",
            },
            alternateContact: {
                pattern: /^\d{10}$/,
                message: "Alternate contact must be 10 digits",
            },
            gst: {
                pattern: /^[0-9A-Z]{15}$/,
                message: "GST number must be 15 characters",
            },
        },
        4: {
            projectIncharge: {
                required: true,
                message: "Project in-charge is required",
            },
            managerId: { required: true, message: "Project manager is required" },
        },
    };

    // ✅ Step titles and icons
    const stepConfig = {
        1: { title: "General Details", icon: <FiClipboard className="text-blue-600" /> },
        2: { title: "Timeline", icon: <FiCheck className="text-green-600" /> },
        3: { title: "Site & Client", icon: <FiMapPin className="text-orange-600" /> },
        4: { title: "Team & Files", icon: <FaUserTie className="text-purple-600" /> },
        5: { title: "Review", icon: <FiSave className="text-indigo-600" /> },
    };

    // ✅ Instant validation on typing
    // ✅ Instant validation on typing
    const handleInputChange = (e) => {
        const { name, type, value, files } = e.target;
        let processedValue = value;

        // 🔴 FIRST: Handle supervisors separately (array)
        if (name === "supervisors") {
            setFormData(prev => ({
                ...prev,
                supervisors: [value]   // ⭐ store as array
            }));
            setTouched((prev) => ({ ...prev, supervisors: true }));
            validateField("supervisors", value);
            return; // ⛔ stop further execution
        }

        // 🟢 Normal inputs below
        if (type === "text" || type === "email") {
            if (name === "contactNumber" || name === "alternateContact") {
                processedValue = value.replace(/\D/g, "").slice(0, 10);
            } else if (name === "pinCode") {
                processedValue = value.replace(/\D/g, "").slice(0, 6);
            } else if (
                name === "siteArea" ||
                name === "builtUpArea" ||
                name === "projectDuration"
            ) {
                processedValue = value.replace(/[^\d.]/g, "");
                const dots = (processedValue.match(/\./g) || []).length;
                if (dots > 1) processedValue = processedValue.slice(0, -1);
            } else if (name === "gst") {
                processedValue = value
                    .replace(/[^0-9A-Z]/gi, "")
                    .toUpperCase()
                    .slice(0, 15);
            }
        }

        // 🔥 Auto duration (your existing code remains same)
        setFormData((prev) => {
            const updated = {
                ...prev,
                [name]: type === "file" ? files[0] : processedValue,
            };

            if (name === "expectedStartDate" || name === "expectedCompletionDate") {
                const start = new Date(updated.expectedStartDate);
                const end = new Date(updated.expectedCompletionDate);

                if (!isNaN(start) && !isNaN(end)) {
                    let months =
                        (end.getFullYear() - start.getFullYear()) * 12 +
                        (end.getMonth() - start.getMonth());

                    if (end.getDate() < start.getDate()) {
                        months--;
                    }

                    let tempDate = new Date(start);
                    tempDate.setMonth(tempDate.getMonth() + months);
                    let diffTime = end - tempDate;
                    let days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                    if (months < 0 || days < 0) {
                        updated.projectDuration = "";
                    } else {
                        updated.projectDuration = `${months} Month${months > 1 ? "s" : ""}${days ? ` ${days} Day${days > 1 ? "s" : ""}` : ""}`;
                    }
                }
            }
            return updated;
        });

        validateField(name, type === "file" ? files[0] : processedValue);
        setTouched((prev) => ({ ...prev, [name]: true }));
    };



    // ✅ Handle field blur
    const handleInputBlur = (e) => {
        const { name, value } = e.target;
        setTouched((prev) => ({ ...prev, [name]: true }));
        validateField(name, value);
    };

    // ✅ Validate single field
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

    // ✅ Validate current step (used while navigating)
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

    // ✅ Navigation with validation
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

    // ✅ On Submit with final check
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

        setErrors((prev) => ({ ...prev, ...allErrors }));
        setTouched((prev) => ({
            ...prev,
            ...Object.keys(allErrors).reduce((acc, k) => ({ ...acc, [k]: true }), {}),
        }));

        if (!allValid) {
            alert("❌ Please fix all validation errors before submitting.");
            const firstErrorField = Object.keys(allErrors)[0];
            const errorStep = Number(
                Object.keys(validationRules).find((s) => validationRules[s][firstErrorField])
            );
            if (errorStep) setCurrentStep(errorStep);
            setIsSubmitting(false);
            return;
        }

        try {
            if (isEditMode) {
                const formPayload = new FormData();
                Object.entries(formData).forEach(([key, value]) => {
                    formPayload.append(key, value);
                });

                if (isEditMode) {
                    await updateProject({ id, formData }).unwrap();
                    toast.success("Project updated successfully!");
                }



                // await updateProject({ id, formData: formPayload }).unwrap();
                // toast.success("Project updated successfully!");
            } else {
                await addProject(formData).unwrap();
                toast.success("Project created successfully!");
            }

            navigate(-1);
        } catch (error) {
            console.error("Error saving project:", error);
            toast.error(isEditMode ? "Failed to update project" : "Failed to create project");
        } finally {
            setIsSubmitting(false);
        }
    };

    // ✅ Check if field is valid (for green border/icon)
    const isFieldValid = (fieldName) =>
        touched[fieldName] && !errors[fieldName] && formData[fieldName];

    const stateList = State.getStatesOfCountry("IN");
    const cityList = formData.state
        ? City.getCitiesOfState("IN", formData.state)
        : [];

    if (isEditMode && !existingProject) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-4 md:p-6 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-600">Loading project data...</p>
                </div>
            </div>
        );
    }

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
                                {isEditMode ? "Edit Project" : "Create New Project"}
                            </h1>
                            <p className="text-slate-600 text-sm md:text-base">
                                {isEditMode
                                    ? `Editing: ${formData.projectName || "Project"}`
                                    : "Fill in the project details step by step"
                                }
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {isEditMode && (
                            <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium border border-yellow-200">
                                Edit Mode
                            </div>
                        )}
                        <div className="text-sm text-slate-500 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200">
                            Step <span className="font-bold text-blue-600">{currentStep}</span> of 5
                        </div>
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
                                    className={`w-14 h-14 rounded-2xl flex items-center justify-center border-2 font-semibold transition-all duration-300 transform hover:scale-110 ${step === currentStep
                                        ? " text-white border-blue-600 shadow-lg shadow-blue-500/25"
                                        : step < currentStep
                                            ? "bg-green-500 text-white border-green-500 shadow-lg shadow-green-500/25"
                                            : "bg-white text-slate-400 border-slate-300"
                                        }`}
                                >
                                    {step < currentStep ? (
                                        <FiCheck className="text-xl" />
                                    ) : (
                                        stepConfig[step]?.icon || step
                                    )}
                                </div>
                                <span
                                    className={`text-xs font-medium mt-2 transition-all truncate max-w-[200px] ${step === currentStep
                                        ? "text-blue-600 font-semibold"
                                        : step < currentStep
                                            ? "text-green-600"
                                            : "text-slate-500"
                                        }`}
                                    title={stepConfig[step]?.title}
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
                                        {isEditMode && currentStep === 5 && (
                                            <span className="text-sm text-yellow-600 ml-2 font-normal">
                                                (Review changes before updating)
                                            </span>
                                        )}
                                    </h2>
                                    <p className="text-slate-600 text-sm">
                                        {currentStep === 5
                                            ? isEditMode
                                                ? "Review all changes before updating the project"
                                                : "Review all details before submission"
                                            : `Fill in the ${stepConfig[currentStep]?.title.toLowerCase()} information`}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 md:p-8">
                            {/* STEP 3 - Updated with Location Detection */}
                            {currentStep === 3 && (
                                <div className="space-y-8">
                                    <div className="bg-blue-50/50 rounded-xl p-6 border border-blue-200">
                                        <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                                            <FiMapPin className="text-blue-600" /> Site Information
                                        </h3>
                                        <div className="space-y-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <Input
                                                    name="siteLocation"
                                                    label="Site Location / Address"
                                                    value={formData.siteLocation}
                                                    onChange={handleInputChange}
                                                    onBlur={handleInputBlur}
                                                    error={errors.siteLocation}
                                                    touched={touched.siteLocation}
                                                    isValid={isFieldValid("siteLocation")}
                                                />

                                                {/* Current Location with GPS Button */}
                                                <div className="space-y-2">
                                                    <label className="text-slate-700 text-sm font-semibold block">
                                                        Current Location
                                                    </label>
                                                    <div className="flex gap-2">
                                                        <input
                                                            name="currentLocation"
                                                            type="text"
                                                            value={formData.currentLocation}
                                                            onChange={handleInputChange}
                                                            onBlur={handleInputBlur}
                                                            className="flex-1 p-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 hover:border-slate-300 transition-all duration-200"
                                                            placeholder="Click the GPS button to detect location"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={getCurrentLocation}
                                                            disabled={isGettingLocation}
                                                            className="px-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
                                                        >
                                                            {isGettingLocation ? (
                                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                            ) : (
                                                                <FiNavigation className="w-4 h-4" />
                                                            )}
                                                        </button>
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
                                                </div>
                                            </div>

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
                                                            pinCode: "",
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
                                                    options={City.getCitiesOfState("IN", formData.state).map((ct) => ({
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
                                                    name="pinCode"
                                                    label="PIN Code"
                                                    value={formData.pinCode}
                                                    onChange={handleInputChange}
                                                    onBlur={handleInputBlur}
                                                    error={errors.pinCode}
                                                    touched={touched.pinCode}
                                                    isValid={isFieldValid("pinCode")}
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <Input
                                                    name="siteArea"
                                                    label="Site Area (Sqm)"
                                                    value={formData.siteArea}
                                                    onChange={handleInputChange}
                                                    onBlur={handleInputBlur}
                                                    error={errors.siteArea}
                                                    touched={touched.siteArea}
                                                    isValid={isFieldValid("siteArea")}
                                                />
                                                <Input
                                                    name="builtUpArea"
                                                    label="Built-up Area (Sqm)"
                                                    value={formData.builtUpArea}
                                                    onChange={handleInputChange}
                                                    onBlur={handleInputBlur}
                                                    error={errors.builtUpArea}
                                                    touched={touched.builtUpArea}
                                                    isValid={isFieldValid("builtUpArea")}
                                                />
                                                <Input
                                                    name="landmark"
                                                    label="Nearest Landmark"
                                                    value={formData.landmark}
                                                    onChange={handleInputChange}
                                                    onBlur={handleInputBlur}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Rest of STEP 3 remains the same */}
                                    <div className="bg-green-50/50 rounded-xl p-6 border border-green-200">
                                        <h3 className="text-lg font-semibold text-slate-900 mb-4">
                                            Client / Authorized Person
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                                name="gst"
                                                label="GST No."
                                                value={formData.gst}
                                                onChange={handleInputChange}
                                                onBlur={handleInputBlur}
                                                error={errors.gst}
                                                touched={touched.gst}
                                                isValid={isFieldValid("gst")}
                                            />
                                            <Input
                                                name="ownerName"
                                                label="Owner Name"
                                                value={formData.ownerName}
                                                onChange={handleInputChange}
                                                onBlur={handleInputBlur}
                                            />
                                            <Input
                                                name="authorizedPerson"
                                                label="Authorized Person Name"
                                                value={formData.authorizedPerson}
                                                onChange={handleInputChange}
                                                onBlur={handleInputBlur}
                                            />
                                            <Input
                                                name="designation"
                                                label="Designation"
                                                value={formData.designation}
                                                onChange={handleInputChange}
                                                onBlur={handleInputBlur}
                                            />
                                            <Input
                                                name="contactNumber"
                                                label="Contact Number"
                                                value={formData.contactNumber}
                                                onChange={handleInputChange}
                                                onBlur={handleInputBlur}
                                                error={errors.contactNumber}
                                                touched={touched.contactNumber}
                                                isValid={isFieldValid("contactNumber")}
                                            />
                                            <Input
                                                name="email"
                                                label="Email ID"
                                                type="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                onBlur={handleInputBlur}
                                                error={errors.email}
                                                touched={touched.email}
                                                isValid={isFieldValid("email")}
                                            />
                                            <Input
                                                name="alternateContact"
                                                label="Alternate Contact"
                                                value={formData.alternateContact}
                                                onChange={handleInputChange}
                                                onBlur={handleInputBlur}
                                                error={errors.alternateContact}
                                                touched={touched.alternateContact}
                                                isValid={isFieldValid("alternateContact")}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Other steps remain the same */}
                            {currentStep === 1 && (
                                <div className="space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Input
                                            name="projectName"
                                            label="Project Name"
                                            value={formData.projectName}
                                            onChange={handleInputChange}
                                            onBlur={handleInputBlur}
                                            error={errors.projectName}
                                            touched={touched.projectName}
                                            isValid={isFieldValid("projectName")}
                                        />

                                        <Input
                                            name="clientName"
                                            label="Client / Organization Name"
                                            value={formData.clientName}
                                            onChange={handleInputChange}
                                            onBlur={handleInputBlur}
                                            error={errors.clientName}
                                            touched={touched.clientName}
                                            isValid={isFieldValid("clientName")}
                                        />

                                        <Select
                                            name="projectType"
                                            label="Project Type"
                                            options={[
                                                "Industrial",
                                                "Commercial",
                                                "Residential",
                                                "Institutional",
                                                "Infrastructure",
                                            ]}
                                            value={formData.projectType}
                                            onChange={handleInputChange}
                                            onBlur={handleInputBlur}
                                            error={errors.projectType}
                                            touched={touched.projectType}
                                            isValid={isFieldValid("projectType")}
                                        />

                                        <Input
                                            name="workScope"
                                            label="Work Scope"
                                            value={formData.workScope}
                                            onChange={handleInputChange}
                                            onBlur={handleInputBlur}
                                            error={errors.workScope}
                                            touched={touched.workScope}
                                            isValid={isFieldValid("workScope")}
                                        />

                                        <Select
                                            name="contractType"
                                            label="Contract Type"
                                            options={[
                                                "Turnkey",
                                                "Labour Rate Basis",
                                                "Covered Area Square Feet",
                                                "Covered Area Square metter",
                                                "Item Rate",
                                                "PMC",
                                                "Consultancy",
                                            ]}
                                            value={formData.contractType}
                                            onChange={handleInputChange}
                                            onBlur={handleInputBlur}
                                            error={errors.contractType}
                                            touched={touched.contractType}
                                            isValid={isFieldValid("contractType")}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* STEP 2 */}
                            {currentStep === 2 && (
                                <div className="space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        <Input
                                            name="workOrderDate"
                                            type="date"
                                            label="Work Order / LOI Date"
                                            value={formData.workOrderDate}
                                            onChange={handleInputChange}
                                            onBlur={handleInputBlur}
                                            error={errors.workOrderDate}
                                            touched={touched.workOrderDate}
                                            isValid={isFieldValid("workOrderDate")}
                                        />
                                        <Input
                                            name="expectedStartDate"
                                            type="date"
                                            label="Expected Start Date"
                                            value={formData.expectedStartDate}
                                            onChange={handleInputChange}
                                            onBlur={handleInputBlur}
                                            error={errors.expectedStartDate}
                                            touched={touched.expectedStartDate}
                                            isValid={isFieldValid("expectedStartDate")}
                                        />
                                        <Input
                                            name="actualStartDate"
                                            type="date"
                                            label="Actual Start Date"
                                            value={formData.actualStartDate}
                                            onChange={handleInputChange}
                                            onBlur={handleInputBlur}
                                        />
                                        <Input
                                            name="expectedCompletionDate"
                                            type="date"
                                            label="Expected Completion Date"
                                            value={formData.expectedCompletionDate}
                                            onChange={handleInputChange}
                                            onBlur={handleInputBlur}
                                            error={errors.expectedCompletionDate}
                                            touched={touched.expectedCompletionDate}
                                            isValid={isFieldValid("expectedCompletionDate")}
                                        />
                                        <Input
                                            name="actualCompletionDate"
                                            type="date"
                                            label="Actual Completion Date"
                                            value={formData.actualCompletionDate}
                                            onChange={handleInputChange}
                                            onBlur={handleInputBlur}
                                        />
                                        {/* <Input
                                            name="projectDuration"
                                            label="Project Duration (Months)"
                                            value={formData.projectDuration}
                                            onChange={handleInputChange}
                                            onBlur={handleInputBlur}
                                            error={errors.projectDuration}
                                            touched={touched.projectDuration}
                                            isValid={isFieldValid("projectDuration")}
                                        /> */}

                                        <Input
                                            name="projectDuration"
                                            label="Project Duration"
                                            value={formData.projectDuration}
                                            readOnly
                                        />


                                    </div>
                                </div>
                            )}

                            {/* STEP 4 */}
                            {currentStep === 4 && (
                                <div className="space-y-8">
                                    <div className="bg-purple-50/50 rounded-xl p-6 border border-purple-200">
                                        <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                                            <FaUserTie className="text-purple-600" /> Internal Details
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                            <Select
                                                name="projectIncharge"
                                                label="Project In-Charge / Site Engineer"
                                                options={data?.map((e) => ({
                                                    label: `${e.name} (${e.role || "User"})`, // what you want to display
                                                    value: e._id, // what will be stored
                                                }))}
                                                value={formData.projectIncharge}
                                                onChange={handleInputChange}
                                                onBlur={handleInputBlur}
                                                error={errors.projectIncharge}
                                                touched={touched.projectIncharge}
                                                isValid={isFieldValid("projectIncharge")}
                                            />

                                            <Select
                                                // name="projectManager"
                                                name="managerId"
                                                label="Project Manager"
                                                options={data?.map((e) => ({
                                                    label: `${e.name} (${e.role || "User"})`, // what you want to display
                                                    value: e._id, // what will be stored
                                                }))}
                                                // value={formData.projectManager}
                                                value={formData.managerId}
                                                onChange={handleInputChange}
                                                onBlur={handleInputBlur}
                                                // error={errors.projectManager}
                                                // touched={touched.projectManager}
                                                // isValid={isFieldValid("projectManager")}
                                                error={errors.managerId}
                                                touched={touched.managerId}
                                                isValid={isFieldValid("managerId")}
                                            />


                                            <Select
                                                name="supervisors"
                                                label="Supervisor"
                                                options={data?.map((e) => ({
                                                    label: `${e.name} (${e.role || "User"})`,
                                                    value: e._id,
                                                }))}
                                                value={formData.supervisors?.[0] || ""}
                                                onChange={handleInputChange}
                                                onBlur={handleInputBlur}
                                            />



                                            {/* <Select
                                                name="supervisors"
                                                label="Supervisor"
                                                options={data?.map((e) => ({
                                                    label: `${e.name} (${e.role || "User"})`,
                                                    value: e._id
                                                }))}
                                                value={formData.supervisors[0] || ""}
                                            /> */}


                                            <Select
                                                name="consultantArchitect"
                                                label="Consultant / Architect"
                                                options={data?.map((e) => ({
                                                    label: `${e.name} (${e.role || "User"})`, // what you want to display
                                                    value: e._id, // what will be stored
                                                }))}
                                                value={formData.consultantArchitect}
                                                onChange={handleInputChange}
                                                onBlur={handleInputBlur}
                                            />



                                            <Select
                                                name="subcontractorVendor"
                                                label="Subcontractor / Vendor"
                                                options={data?.map((e) => ({
                                                    label: `${e.name} (${e.role || "User"})`, // what you want to display
                                                    value: e._id, // what will be stored
                                                }))}
                                                value={formData.subcontractorVendor}
                                                onChange={handleInputChange}
                                                onBlur={handleInputBlur}
                                            />

                                        </div>

                                    </div>

                                    <div className="bg-orange-50/50 rounded-xl p-6 border border-orange-200">
                                        <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                                            <FaFileContract className="text-orange-600" /> Attachments
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <File name="workOrderFile" label="Work Order Copy" onChange={handleInputChange} />
                                            <File name="siteLayoutFile" label="Site Layout Plan" onChange={handleInputChange} />
                                            <File name="drawingsFile" label="Project Drawings" onChange={handleInputChange} />
                                            <File name="clientKycFile" label="Client KYC Documents" onChange={handleInputChange} />
                                            <File name="projectPhotosFile" label="Project Photos" onChange={handleInputChange} />
                                            <File name="notesFile" label="Special Instruction / Notes" onChange={handleInputChange} />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* STEP 5 - Review Step */}
                            {currentStep === 5 && (
                                <div className="space-y-6">
                                    <div className="space-y-6">
                                        <ReviewSection
                                            title="General Project Details"
                                            icon={<FiClipboard className="text-blue-600" />}
                                            data={[
                                                { label: "Project Name", value: formData.projectName },
                                                { label: "Client Name", value: formData.clientName },
                                                { label: "Project Code", value: formData.projectCode },
                                                { label: "Project Type", value: formData.projectType },
                                                { label: "Work Scope", value: formData.workScope },
                                                { label: "Contract Type", value: formData.contractType },
                                            ]}
                                        />
                                        <ReviewSection
                                            title="Project Timeline"
                                            icon={<FiCheck className="text-green-600" />}
                                            data={[
                                                { label: "Work Order Date", value: formData.workOrderDate },
                                                { label: "Expected Start Date", value: formData.expectedStartDate },
                                                { label: "Actual Start Date", value: formData.actualStartDate },
                                                { label: "Expected Completion Date", value: formData.expectedCompletionDate },
                                                { label: "Actual Completion Date", value: formData.actualCompletionDate },
                                                {
                                                    label: "Project Duration",
                                                    value: formData.projectDuration ? `${formData.projectDuration} months` : "",
                                                },
                                            ]}
                                        />
                                        <ReviewSection
                                            title="Site Information"
                                            icon={<FiMapPin className="text-orange-600" />}
                                            data={[
                                                { label: "Site Location", value: formData.siteLocation },
                                                { label: "Current Location", value: formData.currentLocation },
                                                { label: "City", value: formData.city },
                                                { label: "State", value: formData.state },
                                                { label: "PIN Code", value: formData.pinCode },
                                                { label: "Site Area", value: formData.siteArea ? `${formData.siteArea} sqm` : "" },
                                                { label: "Built-up Area", value: formData.builtUpArea ? `${formData.builtUpArea} sqm` : "" },
                                                { label: "Landmark", value: formData.landmark },
                                            ]}
                                        />
                                        <ReviewSection
                                            title="Client Details"
                                            data={[
                                                { label: "Company Name", value: formData.companyName },
                                                { label: "GST No.", value: formData.gst },
                                                { label: "Owner Name", value: formData.ownerName },
                                                { label: "Authorized Person", value: formData.authorizedPerson },
                                                { label: "Designation", value: formData.designation },
                                                { label: "Contact Number", value: formData.contactNumber },
                                                { label: "Email", value: formData.email },
                                                { label: "Alternate Contact", value: formData.alternateContact },
                                            ]}
                                        />
                                        <ReviewSection
                                            title="Internal Details"
                                            icon={<FaUserTie className="text-purple-600" />}
                                            data={[
                                                { label: "Project In-Charge", value: formData.projectIncharge },
                                                // { label: "Project Manager", value: formData.projectManager },
                                                { label: "Project Manager", value: formData.managerId },

                                                { label: "Consultant Architect", value: formData.consultantArchitect },
                                                { label: "Structural Consultant", value: formData.structuralConsultant },
                                                { label: "supervisor", value: formData.supervisor },
                                                { label: "Subcontractor/Vendor", value: formData.subcontractorVendor },
                                            ]}
                                        />
                                    </div>
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
                                {currentStep < 5 ? `Step ${currentStep} of 4` : "Final Review"}
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
                                            {isEditMode ? "Updating..." : "Creating..."}
                                        </>
                                    ) : (
                                        <>
                                            {isEditMode ? <FiEdit className="w-4 h-4" /> : <FiSave className="w-4 h-4" />}
                                            {isEditMode ? "Update Project" : "Create Project"}
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
        if (name === "contactNumber" || name === "alternateContact" || name === "pinCode") return "numeric";
        if (name === "siteArea" || name === "builtUpArea" || name === "projectDuration") return "decimal";
        return "text";
    };

    const getMaxLength = () => {
        if (name === "contactNumber" || name === "alternateContact") return 10;
        if (name === "pinCode") return 6;
        if (name === "gst") return 15;
        return undefined;
    };

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
        {/* {console.log(options)} */}
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

// ✅ File Input Component
const File = ({ name, label, onChange }) => (
    <div className="space-y-2">
        <label className="text-slate-700 text-sm font-semibold block">{label}</label>
        <div className="relative">
            <input
                type="file"
                name={name}
                multiple       // ✅ this enables multiple file selection
                onChange={(e) => onChange({
                    target: {
                        name,
                        // ✅ convert FileList into array
                        files: Array.from(e.target.files)
                    }
                })}
                className="w-full p-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 hover:border-slate-300 transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
        </div>
    </div>
);


// ✅ Review Section Component
const ReviewSection = ({ title, icon, data }) => (
    <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
        <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            {icon} {title}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data?.map((item, index) => (
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

export default AddNewProject;