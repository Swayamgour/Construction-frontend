import React, { useState, useEffect, useMemo } from "react";
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
    FiFileText,
} from "react-icons/fi";
import { FaFileContract, FaUserTie } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { State, City } from "country-state-city";
import toast from "react-hot-toast";
import {
    useAddProjectMutation,
    useGetRolesQuery,
    useUpdateProjectMutation,
} from "../Reduxe/Api";
import {
    getFileUrl,
    getFileName,
    isImageFile,
    toFileArray,
} from "../utils/fileUrl";

const FILE_FIELDS = [
    "workOrderFile",
    "siteLayoutFile",
    "drawingsFile",
    "clientKycFile",
    "projectPhotosFile",
    "notesFile",
];

// Helper function to format dates for input fields
const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    try {
        const date = new Date(dateString);
        if (isNaN(date)) return "";
        return date.toISOString().split("T")[0];
    } catch (error) {
        console.error("Error formatting date:", error);
        return "";
    }
};

const AddNewProject = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const existingProject = location?.state?.projectId;
    const id = existingProject?._id;
    const isEditMode = Boolean(id);

    const { data } = useGetRolesQuery();

    // ============================================================
    // Role-based Project Team Users (only ACTIVE users)
    // ============================================================
    const users = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
            ? data.data
            : Array.isArray(data?.users)
                ? data.users
                : [];

    const activeUsers = users.filter((user) => user?.status === true);

    const supervisors = activeUsers.filter(
        (user) => user?.role?.toLowerCase() === "supervisor"
    );
    const managers = activeUsers.filter(
        (user) => user?.role?.toLowerCase() === "manager"
    );
    const consultants = activeUsers.filter((user) =>
        ["consultant", "architect"].includes(user?.role?.toLowerCase())
    );
    const vendors = activeUsers.filter((user) =>
        ["vendor", "subcontractor"].includes(user?.role?.toLowerCase())
    );

    const userOptions = (userList) =>
        userList.map((user) => ({
            label: `${user.name} (${user.role || "User"})`,
            value: user._id,
        }));

    // ID -> name (for Review step)
    const nameOf = (userId) =>
        userId ? users.find((u) => u._id === userId)?.name || userId : "";

    const [addProject] = useAddProjectMutation();
    const [updateProject] = useUpdateProjectMutation();

    const [formData, setFormData] = useState({
        // 1. General Project Details
        projectName: "",
        clientName: "",
        projectCode: "",
        projectType: "",
        workScope: "",
        contractType: "",

        // 2. Site Information
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
        locationMapLink: "",

        // 3. Client / Authorized Person
        companyName: "",
        gst: "",
        ownerName: "",
        authorizedPerson: "",
        designation: "",
        contactNumber: "",
        email: "",
        alternateContact: "",

        // 4. Project Timeline
        workOrderDate: "",
        expectedStartDate: "",
        actualStartDate: "",
        expectedCompletionDate: "",
        actualCompletionDate: "",
        projectDuration: "",

        // 5. Internal Details
        projectIncharge: "",
        managerId: "",
        consultantArchitect: "",
        structuralConsultant: "",
        subcontractorVendor: "",

        // 6. Attachments - newly selected File objects (multiple per field)
        workOrderFile: [],
        siteLayoutFile: [],
        drawingsFile: [],
        clientKycFile: [],
        projectPhotosFile: [],
        notesFile: [],

        // Already uploaded files (edit mode, read-only, never sent back)
        files: {},

        labours: [],
        supervisors: [],
    });

    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isGettingLocation, setIsGettingLocation] = useState(false);
    const [locationError, setLocationError] = useState("");

    // Populate form with existing data when in edit mode
    useEffect(() => {
        if (!isEditMode || !existingProject) return;

        const p = existingProject;

        setFormData((prev) => ({
            ...prev,
            ...p,
            latitude: p.latitude ?? "",
            longitude: p.longitude ?? "",
            projectIncharge: p.projectIncharge?._id || p.projectIncharge || "",
            managerId: p.managerId?._id || p.managerId || "",
            consultantArchitect: p.consultantArchitect?._id || p.consultantArchitect || "",
            structuralConsultant: p.structuralConsultant?._id || p.structuralConsultant || "",
            subcontractorVendor: p.subcontractorVendor?._id || p.subcontractorVendor || "",
            supervisors: Array.isArray(p.supervisors)
                ? p.supervisors.map((s) => (typeof s === "object" ? s._id : s))
                : [],
            labours: Array.isArray(p.labours)
                ? p.labours.map((l) => (typeof l === "object" ? l._id : l))
                : [],
            workOrderDate: formatDateForInput(p.workOrderDate),
            expectedStartDate: formatDateForInput(p.expectedStartDate),
            actualStartDate: formatDateForInput(p.actualStartDate),
            expectedCompletionDate: formatDateForInput(p.expectedCompletionDate),
            actualCompletionDate: formatDateForInput(p.actualCompletionDate),

            // keep new-file inputs empty; existing files live in `files`
            workOrderFile: [],
            siteLayoutFile: [],
            drawingsFile: [],
            clientKycFile: [],
            projectPhotosFile: [],
            notesFile: [],
            files: p.files || {},
        }));
    }, [isEditMode, existingProject]);

    // Get Current Location
    const getCurrentLocation = () => {
        if (!navigator.geolocation) {
            setLocationError("Geolocation is not supported by this browser.");
            return;
        }

        setIsGettingLocation(true);
        setLocationError("");

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;

                try {
                    const response = await fetch(
                        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
                    );

                    if (!response.ok) {
                        throw new Error("Failed to fetch location data");
                    }

                    const geo = await response.json();

                    const matchedState = State.getStatesOfCountry("IN").find(
                        (s) =>
                            s.name.toLowerCase() ===
                            geo.principalSubdivision?.toLowerCase()
                    );

                    setFormData((prev) => ({
                        ...prev,
                        currentLocation:
                            geo.locality || geo.city || matchedState?.name || "Unknown location",
                        city: geo.locality || geo.city || "",
                        state: matchedState?.isoCode || "",
                        pinCode: geo.postcode || "",
                        latitude: Number(latitude.toFixed(6)),
                        longitude: Number(longitude.toFixed(6)),
                        locationMapLink: `https://www.google.com/maps?q=${latitude},${longitude}`,
                    }));

                    toast.success("Current location detected successfully!");
                } catch (error) {
                    console.error("Error getting location:", error);
                    setLocationError("Failed to get detailed location information.");

                    // Fallback: coordinates only
                    setFormData((prev) => ({
                        ...prev,
                        currentLocation: `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`,
                        latitude: Number(latitude.toFixed(6)),
                        longitude: Number(longitude.toFixed(6)),
                        locationMapLink: `https://www.google.com/maps?q=${latitude},${longitude}`,
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
                maximumAge: 60000,
            }
        );
    };

    // Validation rules for each step
    const validationRules = {
        1: {
            projectName: { required: true, message: "Project name is required" },
            clientName: { required: true, message: "Client name is required" },
            projectType: { required: true, message: "Project type is required" },
            workScope: { required: true, message: "Work scope is required" },
            contractType: { required: true, message: "Contract type is required" },
        },
        2: {
            workOrderDate: { required: true, message: "Work order date is required" },
            expectedStartDate: { required: true, message: "Expected start date is required" },
            expectedCompletionDate: { required: true, message: "Expected completion date is required" },
        },
        3: {
            siteLocation: { required: true, message: "Site location is required" },
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
            projectIncharge: { required: true, message: "Project in-charge is required" },
            managerId: { required: true, message: "Project manager is required" },
        },
    };

    // Step titles and icons
    const stepConfig = {
        1: { title: "General Details", icon: <FiClipboard className="text-blue-600" /> },
        2: { title: "Timeline", icon: <FiCheck className="text-green-600" /> },
        3: { title: "Site & Client", icon: <FiMapPin className="text-orange-600" /> },
        4: { title: "Team & Files", icon: <FaUserTie className="text-purple-600" /> },
        5: { title: "Review", icon: <FiSave className="text-indigo-600" /> },
    };

    // Run one rule against a value -> error message or ""
    const runRule = (rule, value) => {
        if (rule.required && !value) return rule.message;
        if (rule.pattern && value && !rule.pattern.test(value)) return rule.message;
        return "";
    };

    // Completion date must not be before start date
    const getDateOrderError = (data) => {
        if (!data.expectedStartDate || !data.expectedCompletionDate) return "";
        return new Date(data.expectedCompletionDate) < new Date(data.expectedStartDate)
            ? "Completion date must be after start date"
            : "";
    };

    // Instant validation on typing
    const handleInputChange = (e) => {
        const { name, type, value, files } = e.target;

        // Multiple file handling
        if (type === "file" || Array.isArray(files)) {
            const selectedFiles = Array.isArray(files)
                ? files.filter(Boolean)
                : Array.from(files || []).filter(Boolean);

            setFormData((prev) => ({ ...prev, [name]: selectedFiles }));
            setTouched((prev) => ({ ...prev, [name]: true }));
            return;
        }

        // Supervisor select - backend expects an array
        if (name === "supervisors") {
            setFormData((prev) => ({
                ...prev,
                supervisors: value ? [value] : [],
            }));
            setTouched((prev) => ({ ...prev, supervisors: true }));
            return;
        }

        let processedValue = value;

        if (type === "text" || type === "email") {
            if (name === "contactNumber" || name === "alternateContact") {
                processedValue = value.replace(/\D/g, "").slice(0, 10);
            } else if (name === "pinCode") {
                processedValue = value.replace(/\D/g, "").slice(0, 6);
            } else if (name === "siteArea" || name === "builtUpArea") {
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

        setFormData((prev) => {
            const updated = { ...prev, [name]: processedValue };

            // State change resets dependent fields
            if (name === "state") {
                updated.city = "";
                updated.pinCode = "";
            }

            // Auto duration
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

                    const tempDate = new Date(start);
                    tempDate.setMonth(tempDate.getMonth() + months);

                    const days = Math.ceil((end - tempDate) / (1000 * 60 * 60 * 24));

                    if (months < 0 || days < 0) {
                        updated.projectDuration = "";
                    } else {
                        updated.projectDuration =
                            `${months} Month${months !== 1 ? "s" : ""}` +
                            `${days ? ` ${days} Day${days > 1 ? "s" : ""}` : ""}`;
                    }
                }

                // Live date-order check
                setErrors((p) => ({
                    ...p,
                    expectedCompletionDate:
                        getDateOrderError(updated) ||
                        runRule(
                            validationRules[2].expectedCompletionDate,
                            updated.expectedCompletionDate
                        ),
                }));
            }

            return updated;
        });

        if (name !== "expectedStartDate" && name !== "expectedCompletionDate") {
            validateField(name, processedValue);
        }
        setTouched((prev) => ({ ...prev, [name]: true }));
    };

    const handleInputBlur = (e) => {
        const { name, value } = e.target;
        setTouched((prev) => ({ ...prev, [name]: true }));
        validateField(name, value);
    };

    // Validate single field
    const validateField = (fieldName, value) => {
        const stepWithField = Object.keys(validationRules).find(
            (s) => validationRules[s][fieldName]
        );

        if (!stepWithField) return;

        const error = runRule(validationRules[stepWithField][fieldName], value);
        setErrors((prev) => ({ ...prev, [fieldName]: error }));
    };

    // Validate current step (used while navigating)
    const validateStep = (step) => {
        const stepRules = validationRules[step];
        const newErrors = {};

        if (stepRules) {
            Object.keys(stepRules).forEach((field) => {
                const error = runRule(stepRules[field], formData[field]);
                if (error) newErrors[field] = error;
            });

            const stepTouched = {};
            Object.keys(stepRules).forEach((f) => (stepTouched[f] = true));
            setTouched((prev) => ({ ...prev, ...stepTouched }));
        }

        if (step === 2 && !newErrors.expectedCompletionDate) {
            const dateError = getDateOrderError(formData);
            if (dateError) newErrors.expectedCompletionDate = dateError;
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

    // Build multipart/form-data. Every new file is appended under its field name.
    const buildProjectFormData = () => {
        const payload = new FormData();

        // Never sent to the backend
        const ignoredFields = [
            "_id",
            "createdBy",
            "createdAt",
            "updatedAt",
            "__v",
            "files",
        ];

        Object.entries(formData).forEach(([key, value]) => {
            if (FILE_FIELDS.includes(key) || ignoredFields.includes(key)) return;

            if (key === "supervisors" || key === "labours") {
                payload.append(
                    key,
                    JSON.stringify(Array.isArray(value) ? value : [])
                );
                return;
            }

            if (value !== undefined && value !== null && typeof value !== "object") {
                payload.append(key, String(value));
            }
        });

        FILE_FIELDS.forEach((field) => {
            const selectedFiles = Array.isArray(formData[field])
                ? formData[field]
                : formData[field]
                    ? [formData[field]]
                    : [];

            selectedFiles.forEach((file) => {
                if (
                    file &&
                    typeof file === "object" &&
                    typeof file.name === "string" &&
                    typeof file.size === "number"
                ) {
                    payload.append(field, file);
                }
            });
        });

        return payload;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Safety: only submit from the Review step
        if (currentStep < 5) return;

        setIsSubmitting(true);

        let allValid = true;
        const allErrors = {};

        for (let step = 1; step <= 4; step++) {
            const stepRules = validationRules[step];
            if (!stepRules) continue;

            Object.keys(stepRules).forEach((field) => {
                const error = runRule(stepRules[field], formData[field]);
                if (error) {
                    allErrors[field] = error;
                    allValid = false;
                }
            });
        }

        const dateError = getDateOrderError(formData);
        if (dateError) {
            allErrors.expectedCompletionDate = dateError;
            allValid = false;
        }

        setErrors((prev) => ({ ...prev, ...allErrors }));
        setTouched((prev) => ({
            ...prev,
            ...Object.keys(allErrors).reduce((acc, k) => ({ ...acc, [k]: true }), {}),
        }));

        if (!allValid) {
            toast.error("Please fix all validation errors before submitting.");
            const firstErrorField = Object.keys(allErrors)[0];
            const errorStep = Number(
                Object.keys(validationRules).find(
                    (s) => validationRules[s][firstErrorField]
                )
            );

            if (errorStep) setCurrentStep(errorStep);
            setIsSubmitting(false);
            return;
        }

        try {
            const formPayload = buildProjectFormData();

            if (isEditMode) {
                await updateProject({ id, formData: formPayload }).unwrap();
                toast.success("Project updated successfully!");
            } else {
                await addProject(formPayload).unwrap();
                toast.success("Project created successfully!");
            }

            navigate(-1);
        } catch (error) {
            console.error("Error saving project:", error);
            toast.error(
                error?.data?.message ||
                (isEditMode ? "Failed to update project" : "Failed to create project")
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    // Check if field is valid (for green border/icon)
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

    // Shortcut to keep the JSX below compact
    const inputProps = (name) => ({
        name,
        value: formData[name],
        onChange: handleInputChange,
        onBlur: handleInputBlur,
        error: errors[name],
        touched: touched[name],
        isValid: isFieldValid(name),
    });

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
                                    : "Fill in the project details step by step"}
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
                                        ? "bg-white text-blue-600 border-blue-600 shadow-lg shadow-blue-500/25"
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
                            {/* STEP 1 */}
                            {currentStep === 1 && (
                                <div className="space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Input label="Project Name" {...inputProps("projectName")} />
                                        <Input label="Client / Organization Name" {...inputProps("clientName")} />
                                        <Select
                                            label="Project Type"
                                            options={[
                                                "Industrial",
                                                "Commercial",
                                                "Residential",
                                                "Institutional",
                                                "Infrastructure",
                                            ]}
                                            {...inputProps("projectType")}
                                        />
                                        <Input label="Work Scope" {...inputProps("workScope")} />
                                        <Select
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
                                            {...inputProps("contractType")}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* STEP 2 */}
                            {currentStep === 2 && (
                                <div className="space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        <Input type="date" label="Work Order / LOI Date" {...inputProps("workOrderDate")} />
                                        <Input type="date" label="Expected Start Date" {...inputProps("expectedStartDate")} />
                                        <Input type="date" label="Actual Start Date" {...inputProps("actualStartDate")} />
                                        <Input type="date" label="Expected Completion Date" {...inputProps("expectedCompletionDate")} />
                                        <Input type="date" label="Actual Completion Date" {...inputProps("actualCompletionDate")} />
                                        <Input
                                            name="projectDuration"
                                            label="Project Duration"
                                            value={formData.projectDuration}
                                            readOnly
                                        />
                                    </div>
                                </div>
                            )}

                            {/* STEP 3 */}
                            {currentStep === 3 && (
                                <div className="space-y-8">
                                    <div className="bg-blue-50/50 rounded-xl p-6 border border-blue-200">
                                        <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                                            <FiMapPin className="text-blue-600" /> Site Information
                                        </h3>
                                        <div className="space-y-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <Input label="Site Location / Address" {...inputProps("siteLocation")} />

                                                {/* Current Location with GPS Button */}
                                                <div className="space-y-2">
                                                    <label className="text-slate-700 text-sm font-semibold block">
                                                        Current Location
                                                    </label>
                                                    <div className="flex gap-2">
                                                        <input
                                                            name="currentLocation"
                                                            type="text"
                                                            value={formData.currentLocation ?? ""}
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
                                                    label="State"
                                                    options={stateList?.map((st) => ({
                                                        label: st.name,
                                                        value: st.isoCode,
                                                    }))}
                                                    {...inputProps("state")}
                                                />
                                                <Select
                                                    label="City"
                                                    options={cityList.map((ct) => ({
                                                        label: ct.name,
                                                        value: ct.name,
                                                    }))}
                                                    disabled={!formData.state}
                                                    {...inputProps("city")}
                                                />
                                                <Input label="PIN Code" {...inputProps("pinCode")} />
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <Input label="Site Area (Sqm)" {...inputProps("siteArea")} />
                                                <Input label="Built-up Area (Sqm)" {...inputProps("builtUpArea")} />
                                                <Input label="Nearest Landmark" {...inputProps("landmark")} />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-green-50/50 rounded-xl p-6 border border-green-200">
                                        <h3 className="text-lg font-semibold text-slate-900 mb-4">
                                            Client / Authorized Person
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <Input label="Company Name" {...inputProps("companyName")} />
                                            <Input label="GST No." {...inputProps("gst")} />
                                            <Input label="Owner Name" {...inputProps("ownerName")} />
                                            <Input label="Authorized Person Name" {...inputProps("authorizedPerson")} />
                                            <Input label="Designation" {...inputProps("designation")} />
                                            <Input label="Contact Number" {...inputProps("contactNumber")} />
                                            <Input label="Email ID" type="email" {...inputProps("email")} />
                                            <Input label="Alternate Contact" {...inputProps("alternateContact")} />
                                        </div>
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
                                                label="Project In-Charge / Site Engineer"
                                                options={userOptions(supervisors)}
                                                {...inputProps("projectIncharge")}
                                            />
                                            <Select
                                                label="Project Manager"
                                                options={userOptions(managers)}
                                                {...inputProps("managerId")}
                                            />
                                            <Select
                                                name="supervisors"
                                                label="Supervisor"
                                                options={userOptions(supervisors)}
                                                value={formData.supervisors?.[0] || ""}
                                                onChange={handleInputChange}
                                                onBlur={handleInputBlur}
                                            />
                                            <Select
                                                label="Consultant / Architect"
                                                options={userOptions(consultants)}
                                                {...inputProps("consultantArchitect")}
                                            />
                                            <Select
                                                label="Subcontractor / Vendor"
                                                options={userOptions(vendors)}
                                                {...inputProps("subcontractorVendor")}
                                            />
                                        </div>
                                    </div>

                                    <div className="bg-orange-50/50 rounded-xl p-6 border border-orange-200">
                                        <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                                            <FaFileContract className="text-orange-600" /> Attachments
                                        </h3>
                                        <p className="text-sm text-slate-500 mb-4">
                                            You can select multiple files for every attachment (max 10 MB each).
                                            {isEditMode && " New files are added to the existing ones."}
                                        </p>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FileUpload name="workOrderFile" label="Work Order Copy" onChange={handleInputChange} existingFiles={formData.files?.workOrderFile} />
                                            <FileUpload name="siteLayoutFile" label="Site Layout Plan" onChange={handleInputChange} existingFiles={formData.files?.siteLayoutFile} />
                                            <FileUpload name="drawingsFile" label="Project Drawings" onChange={handleInputChange} existingFiles={formData.files?.drawingsFile} />
                                            <FileUpload name="clientKycFile" label="Client KYC Documents" onChange={handleInputChange} existingFiles={formData.files?.clientKycFile} />
                                            <FileUpload name="projectPhotosFile" label="Project Photos" onChange={handleInputChange} existingFiles={formData.files?.projectPhotosFile} />
                                            <FileUpload name="notesFile" label="Special Instruction / Notes" onChange={handleInputChange} existingFiles={formData.files?.notesFile} />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* STEP 5 - Review */}
                            {currentStep === 5 && (
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
                                            { label: "Project Duration", value: formData.projectDuration },
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
                                            { label: "Project In-Charge", value: nameOf(formData.projectIncharge) },
                                            { label: "Project Manager", value: nameOf(formData.managerId) },
                                            { label: "Supervisor", value: formData.supervisors?.map(nameOf).join(", ") },
                                            { label: "Consultant / Architect", value: nameOf(formData.consultantArchitect) },
                                            { label: "Structural Consultant", value: nameOf(formData.structuralConsultant) },
                                            { label: "Subcontractor/Vendor", value: nameOf(formData.subcontractorVendor) },
                                        ]}
                                    />
                                    <ReviewSection
                                        title="New Attachments"
                                        icon={<FaFileContract className="text-orange-600" />}
                                        data={FILE_FIELDS.map((field) => ({
                                            label: field.replace("File", "").replace(/([A-Z])/g, " $1"),
                                            value: formData[field]?.length
                                                ? `${formData[field].length} file(s)`
                                                : "",
                                        }))}
                                    />
                                </div>
                            )}
                        </div>

                        {/* BUTTONS */}
                        <div className="flex justify-between items-center pt-6 border-t border-slate-200 mt-8 px-6 md:px-8 pb-6 bg-slate-50/50">
                            <button
                                type="button"
                                onClick={prevStep}
                                disabled={currentStep === 1}
                                className={`px-3 md:px-8 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${currentStep === 1
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
                                    className="px-3 md:px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 shadow-sm hover:shadow-md transform hover:translate-x-1 transition-all flex items-center gap-2"
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

// ============================================================
// Input with real-time validation
// ============================================================
const Input = ({
    name,
    label,
    type = "text",
    value,
    onChange,
    onBlur,
    error,
    touched,
    isValid,
    readOnly = false,
}) => {
    const getInputMode = () => {
        if (name === "contactNumber" || name === "alternateContact" || name === "pinCode") return "numeric";
        if (name === "siteArea" || name === "builtUpArea") return "decimal";
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
                    value={value ?? ""}
                    onChange={onChange}
                    onBlur={onBlur}
                    readOnly={readOnly}
                    inputMode={getInputMode()}
                    maxLength={getMaxLength()}
                    className={`w-full p-3 pr-10 border-2 rounded-xl focus:outline-none transition-all duration-200 ${readOnly
                        ? "bg-slate-100 border-slate-200 text-slate-600 cursor-not-allowed"
                        : error && touched
                            ? "border-red-500 focus:border-red-500 bg-red-50/50"
                            : isValid
                                ? "border-green-500 focus:border-green-500 bg-green-50/50"
                                : "border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 hover:border-slate-300"
                        }`}
                />
                {touched && !readOnly && (
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

// ============================================================
// Select with real-time validation
// ============================================================
const Select = ({
    name,
    label,
    value,
    onChange,
    onBlur,
    options,
    error,
    touched,
    isValid,
    disabled = false,
}) => (
    <div className="space-y-2">
        <label className="text-slate-700 text-sm font-semibold block">
            {label}
            {error && <span className="text-red-500 ml-1">*</span>}
        </label>
        <div className="relative">
            <select
                name={name}
                value={value ?? ""}
                onChange={onChange}
                onBlur={onBlur}
                disabled={disabled}
                className={`w-full p-3 pr-10 border-2 rounded-xl focus:outline-none transition-all duration-200 appearance-none disabled:bg-slate-100 disabled:cursor-not-allowed ${error && touched
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

// ============================================================
// Multiple file input.
// - shows already uploaded files (edit mode) with image thumbnails
// - shows previews of newly selected files
// ============================================================
const FileUpload = ({ name, label, onChange, existingFiles }) => {
    const [selectedFiles, setSelectedFiles] = useState([]);

    const uploaded = toFileArray(existingFiles);

    // Preview URLs for newly selected images
    const previews = useMemo(
        () =>
            selectedFiles.map((file) => ({
                name: file.name,
                url: file.type?.startsWith("image/") ? URL.createObjectURL(file) : null,
            })),
        [selectedFiles]
    );

    // Free object URLs when selection changes / component unmounts
    useEffect(
        () => () => previews.forEach((p) => p.url && URL.revokeObjectURL(p.url)),
        [previews]
    );

    const handleFiles = (e) => {
        const files = Array.from(e.target.files || []);

        setSelectedFiles(files);

        onChange({
            target: {
                name,
                type: "file",
                files,
                value: "",
            },
        });
    };

    return (
        <div className="space-y-2">
            <label className="text-slate-700 text-sm font-semibold block">{label}</label>

            {/* Already uploaded files */}
            {uploaded.length > 0 && (
                <div className="rounded-lg bg-slate-50 border border-slate-200 p-3">
                    <p className="text-xs font-semibold text-slate-600 mb-2">
                        Already uploaded ({uploaded.length})
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {uploaded.map((path, index) => {
                            const url = getFileUrl(path);
                            const fileName = getFileName(path);

                            return (
                                <a
                                    key={`${path}-${index}`}
                                    href={url}
                                    target="_blank"
                                    rel="noreferrer"
                                    title={fileName}
                                    className="w-16 h-16 rounded-lg border bg-white overflow-hidden flex items-center justify-center hover:shadow-md transition"
                                >
                                    {isImageFile(path) ? (
                                        <img
                                            src={url}
                                            alt={fileName}
                                            loading="lazy"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <FiFileText className="w-6 h-6 text-slate-400" />
                                    )}
                                </a>
                            );
                        })}
                    </div>
                </div>
            )}

            <input
                type="file"
                name={name}
                multiple
                onChange={handleFiles}
                className="w-full p-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 hover:border-slate-300 transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />

            {/* Newly selected files */}
            {previews.length > 0 && (
                <div className="mt-2 rounded-lg bg-blue-50 border border-blue-100 p-3">
                    <p className="text-xs font-semibold text-blue-700 mb-2">
                        {previews.length} new file{previews.length > 1 ? "s" : ""} selected
                    </p>

                    <div className="space-y-1 max-h-40 overflow-y-auto">
                        {previews.map((p, index) => (
                            <div
                                key={`${p.name}-${index}`}
                                className="flex items-center gap-2 text-xs text-slate-700"
                            >
                                {p.url ? (
                                    <img
                                        src={p.url}
                                        alt={p.name}
                                        className="w-8 h-8 rounded object-cover border"
                                    />
                                ) : (
                                    <FiFileText className="w-8 h-8 p-1.5 text-slate-400" />
                                )}
                                <span className="truncate" title={p.name}>
                                    {p.name}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// ============================================================
// Review Section
// ============================================================
const ReviewSection = ({ title, icon, data }) => (
    <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
        <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            {icon} {title}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data?.map((item, index) => (
                <div key={index} className="space-y-1">
                    <label className="text-slate-600 text-sm font-medium capitalize">
                        {item.label}
                    </label>
                    <p className="text-slate-900 font-semibold">
                        {item.value || (
                            <span className="text-slate-400 italic font-normal">Not provided</span>
                        )}
                    </p>
                </div>
            ))}
        </div>
    </div>
);

export default AddNewProject;