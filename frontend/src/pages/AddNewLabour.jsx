import React, { useState } from "react";
import {
    FiArrowLeft,
    FiSave,
    FiUser,
    FiPhone,
    FiMapPin,
    FiMail,
    FiAlertCircle,
    FiCheckCircle,
    FiXCircle,
    FiCheck,
    FiUpload,
} from "react-icons/fi";
import { FaHardHat, FaIdCard, FaUserTie } from "react-icons/fa";
import { BiRupee } from "react-icons/bi";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";

const AddNewLabour = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        // ✅ 1. Personal Information
        photo: null,
        firstName: "",
        lastName: "",
        fatherName: "",
        dateOfBirth: "",
        gender: "",
        maritalStatus: "",
        nationality: "Indian",

        // ✅ 2. Contact Information
        phone: "",
        alternatePhone: "",
        email: "",
        emergencyContact: "",
        emergencyPhone: "",

        // ✅ 3. Address Information
        currentAddress: "",
        permanentAddress: "",
        city: "",
        state: "",
        pincode: "",

        // ✅ 4. Employment Details
        employeeId: "",
        role: "",
        category: "",
        site: "",
        department: "",
        joinDate: "",
        workType: "full-time",
        shift: "day",
        salary: "",

        // ✅ 5. Bank & Documents
        bankName: "",
        accountNumber: "",
        ifscCode: "",
        accountHolderName: "",
        panNumber: "",
        aadharNumber: "",
        paymentMethod: "bank-transfer",
        skills: [],
        experience: "",
        qualification: "",
        certifications: [],
        aadharFile: null,
        panFile: null,
        photoFile: null,
        resumeFile: null,
        bloodGroup: "",
        medicalConditions: "",
        allergies: ""
    });

    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [newSkill, setNewSkill] = useState("");
    const [newCertification, setNewCertification] = useState("");

    // ✅ Sample data for dropdowns
    const roles = [
        "Mason", "Carpenter", "Electrician", "Plumber", "Welder",
        "Painter", "Helper", "Foreman", "Supervisor", "Operator"
    ];

    const categories = [
        "Skilled", "Semi-Skilled", "Unskilled", "Supervisory", "Technical"
    ];

    const sites = [
        "Sunrise Residency", "Metro Tower", "Tech Park",
        "Commercial Complex", "Industrial Zone"
    ];

    const departments = [
        "Civil", "Electrical", "Plumbing", "Finishing", "Structural"
    ];

    const bloodGroups = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

    // ✅ Validation rules for each step
    const validationRules = {
        1: {
            firstName: { required: true, message: "First name is required" },
            phone: {
                required: true,
                pattern: /^\d{10}$/,
                message: "Phone number must be 10 digits",
            },
            role: { required: true, message: "Role is required" },
            email: {
                pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Please enter a valid email address",
            },
            emergencyPhone: {
                pattern: /^\d{10}$/,
                message: "Emergency phone must be 10 digits",
            },
        },
        2: {
            currentAddress: {
                required: true,
                message: "Current address is required",
            },
            city: { required: true, message: "City is required" },
            pincode: {
                required: true,
                pattern: /^\d{6}$/,
                message: "PIN code must be 6 digits",
            },
        },
        3: {
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
        4: {
            aadharNumber: {
                required: true,
                pattern: /^\d{12}$/,
                message: "Aadhar number must be 12 digits",
            },
            panNumber: {
                pattern: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
                message: "Please enter a valid PAN number",
            },
        },
    };

    // ✅ Step titles and icons
    const stepConfig = {
        1: { title: "Personal Details", icon: <FiUser className="text-blue-600" /> },
        2: { title: "Address", icon: <FiMapPin className="text-green-600" /> },
        3: { title: "Bank Details", icon: <BiRupee className="text-orange-600" /> },
        4: { title: "Documents & Skills", icon: <FaIdCard className="text-purple-600" /> },
        5: { title: "Review", icon: <FiSave className="text-indigo-600" /> },
    };

    // ✅ Instant validation on typing
    const handleInputChange = (e) => {
        const { name, value, type, files } = e.target;

        let processedValue = value;

        // Input restrictions
        if (type === "text" || type === "tel") {
            if (name === "phone" || name === "alternatePhone" || name === "emergencyPhone") {
                processedValue = value.replace(/\D/g, "").slice(0, 10);
            } else if (name === "pincode") {
                processedValue = value.replace(/\D/g, "").slice(0, 6);
            } else if (name === "aadharNumber") {
                processedValue = value.replace(/\D/g, "").slice(0, 12);
            } else if (name === "panNumber") {
                processedValue = value.replace(/[^0-9A-Z]/gi, "").toUpperCase().slice(0, 10);
            } else if (name === "ifscCode") {
                processedValue = value.replace(/[^0-9A-Z]/gi, "").toUpperCase().slice(0, 11);
            } else if (name === "salary" || name === "experience") {
                processedValue = value.replace(/\D/g, "");
            }
        }

        setFormData((prev) => ({
            ...prev,
            [name]: type === "file" ? files[0] : processedValue,
        }));

        // ✅ Validate immediately on change
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

    // ✅ Validate current step
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

        // Mark all step fields as touched
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

    // ✅ Handle array fields
    const handleAddSkill = () => {
        if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
            setFormData(prev => ({
                ...prev,
                skills: [...prev.skills, newSkill.trim()]
            }));
            setNewSkill("");
        }
    };

    const handleRemoveSkill = (skillToRemove) => {
        setFormData(prev => ({
            ...prev,
            skills: prev.skills.filter(skill => skill !== skillToRemove)
        }));
    };

    const handleAddCertification = () => {
        if (newCertification.trim() && !formData.certifications.includes(newCertification.trim())) {
            setFormData(prev => ({
                ...prev,
                certifications: [...prev.certifications, newCertification.trim()]
            }));
            setNewCertification("");
        }
    };

    const handleRemoveCertification = (certToRemove) => {
        setFormData(prev => ({
            ...prev,
            certifications: prev.certifications.filter(cert => cert !== certToRemove)
        }));
    };

    // ✅ Generate employee ID
    const generateEmployeeId = () => {
        const prefix = 'EMP';
        const random = Math.floor(10000 + Math.random() * 90000);
        return `${prefix}${random}`;
    };

    // ✅ On Submit with final check
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Validate all steps
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

        // Simulate API call
        await new Promise((r) => setTimeout(r, 800));
        // alert("✅ Labour added successfully!");
        toast.success('✅ Labour added successfully!')
        console.log(formData);
        setIsSubmitting(false);
        navigate(-1);
    };

    // ✅ Check if field is valid (for green border/icon)
    const isFieldValid = (fieldName) =>
        touched[fieldName] && !errors[fieldName] && formData[fieldName];

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
                                Add New Labour
                            </h1>
                            <p className="text-slate-600 text-sm md:text-base">
                                Complete all details to register new labour
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
                        {/* Progress line */}
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
                                    className={`text-xs font-medium mt-2 transition-all truncate max-w-[80px] ${step === currentStep
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
                            {/* STEP 1 */}
                            {currentStep === 1 && (
                                <div className="space-y-8">
                                    {/* Photo Upload */}
                                    <div className="flex flex-col lg:flex-row items-start gap-8">
                                        <div className="flex-shrink-0">
                                            <div className="w-32 h-32 bg-slate-100 rounded-2xl border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden">
                                                {formData.photo ? (
                                                    <img
                                                        src={URL.createObjectURL(formData.photo)}
                                                        alt="Preview"
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <FiUpload className="text-3xl text-slate-400" />
                                                )}
                                            </div>
                                            <input
                                                type="file"
                                                id="photo"
                                                name="photo"
                                                accept="image/*"
                                                onChange={handleInputChange}
                                                className="hidden"
                                            />
                                            <label
                                                htmlFor="photo"
                                                className="block text-center mt-2 text-blue-600 hover:text-blue-800 cursor-pointer text-sm"
                                            >
                                                Upload Photo
                                            </label>
                                        </div>

                                        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <Input
                                                name="firstName"
                                                label="First Name"
                                                value={formData.firstName}
                                                onChange={handleInputChange}
                                                onBlur={handleInputBlur}
                                                error={errors.firstName}
                                                touched={touched.firstName}
                                                isValid={isFieldValid("firstName")}
                                            />

                                            <Input
                                                name="lastName"
                                                label="Last Name"
                                                value={formData.lastName}
                                                onChange={handleInputChange}
                                                onBlur={handleInputBlur}
                                            />

                                            <Input
                                                name="fatherName"
                                                label="Father's Name"
                                                value={formData.fatherName}
                                                onChange={handleInputChange}
                                                onBlur={handleInputBlur}
                                            />

                                            <Input
                                                name="dateOfBirth"
                                                type="date"
                                                label="Date of Birth"
                                                value={formData.dateOfBirth}
                                                onChange={handleInputChange}
                                                onBlur={handleInputBlur}
                                            />

                                            <Select
                                                name="gender"
                                                label="Gender"
                                                options={["Male", "Female", "Other"]}
                                                value={formData.gender}
                                                onChange={handleInputChange}
                                                onBlur={handleInputBlur}
                                            />

                                            <Select
                                                name="maritalStatus"
                                                label="Marital Status"
                                                options={["Single", "Married", "Divorced", "Widowed"]}
                                                value={formData.maritalStatus}
                                                onChange={handleInputChange}
                                                onBlur={handleInputBlur}
                                            />
                                        </div>
                                    </div>

                                    {/* Contact Information */}
                                    <div className="bg-blue-50/50 rounded-xl p-6 border border-blue-200">
                                        <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                                            <FiPhone className="text-blue-600" />
                                            Contact Information
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                                            <Input
                                                name="alternatePhone"
                                                label="Alternate Phone"
                                                value={formData.alternatePhone}
                                                onChange={handleInputChange}
                                                onBlur={handleInputBlur}
                                                error={errors.alternatePhone}
                                                touched={touched.alternatePhone}
                                                isValid={isFieldValid("alternatePhone")}
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
                                                name="emergencyContact"
                                                label="Emergency Contact Name"
                                                value={formData.emergencyContact}
                                                onChange={handleInputChange}
                                                onBlur={handleInputBlur}
                                            />

                                            <Input
                                                name="emergencyPhone"
                                                label="Emergency Phone"
                                                value={formData.emergencyPhone}
                                                onChange={handleInputChange}
                                                onBlur={handleInputBlur}
                                                error={errors.emergencyPhone}
                                                touched={touched.emergencyPhone}
                                                isValid={isFieldValid("emergencyPhone")}
                                            />
                                        </div>
                                    </div>

                                    {/* Employment Details */}
                                    <div className="bg-green-50/50 rounded-xl p-6 border border-green-200">
                                        <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                                            <FaUserTie className="text-green-600" />
                                            Employment Details
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-slate-700 text-sm font-semibold block">
                                                    Employee ID
                                                </label>
                                                <div className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        name="employeeId"
                                                        value={formData.employeeId || generateEmployeeId()}
                                                        onChange={handleInputChange}
                                                        className="flex-1 p-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                                        placeholder="Auto-generated"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setFormData(prev => ({
                                                            ...prev,
                                                            employeeId: generateEmployeeId()
                                                        }))}
                                                        className="px-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                                                    >
                                                        Generate
                                                    </button>
                                                </div>
                                            </div>

                                            <Select
                                                name="role"
                                                label="Role/Designation"
                                                options={roles}
                                                value={formData.role}
                                                onChange={handleInputChange}
                                                onBlur={handleInputBlur}
                                                error={errors.role}
                                                touched={touched.role}
                                                isValid={isFieldValid("role")}
                                            />

                                            <Select
                                                name="category"
                                                label="Category"
                                                options={categories}
                                                value={formData.category}
                                                onChange={handleInputChange}
                                                onBlur={handleInputBlur}
                                            />

                                            <Select
                                                name="site"
                                                label="Site/Project"
                                                options={sites}
                                                value={formData.site}
                                                onChange={handleInputChange}
                                                onBlur={handleInputBlur}
                                            />

                                            <Select
                                                name="department"
                                                label="Department"
                                                options={departments}
                                                value={formData.department}
                                                onChange={handleInputChange}
                                                onBlur={handleInputBlur}
                                            />

                                            <Input
                                                name="joinDate"
                                                type="date"
                                                label="Join Date"
                                                value={formData.joinDate}
                                                onChange={handleInputChange}
                                                onBlur={handleInputBlur}
                                            />

                                            <Input
                                                name="salary"
                                                label="Monthly Salary (₹)"
                                                value={formData.salary}
                                                onChange={handleInputChange}
                                                onBlur={handleInputBlur}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* STEP 2 */}
                            {currentStep === 2 && (
                                <div className="space-y-8">
                                    <div className="grid grid-cols-1 gap-6">
                                        <Input
                                            name="currentAddress"
                                            label="Current Address"
                                            type="textarea"
                                            value={formData.currentAddress}
                                            onChange={handleInputChange}
                                            onBlur={handleInputBlur}
                                            error={errors.currentAddress}
                                            touched={touched.currentAddress}
                                            isValid={isFieldValid("currentAddress")}
                                        />

                                        <Input
                                            name="permanentAddress"
                                            label="Permanent Address"
                                            type="textarea"
                                            value={formData.permanentAddress}
                                            onChange={handleInputChange}
                                            onBlur={handleInputBlur}
                                        />

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <Input
                                                name="city"
                                                label="City"
                                                value={formData.city}
                                                onChange={handleInputChange}
                                                onBlur={handleInputBlur}
                                                error={errors.city}
                                                touched={touched.city}
                                                isValid={isFieldValid("city")}
                                            />

                                            <Input
                                                name="state"
                                                label="State"
                                                value={formData.state}
                                                onChange={handleInputChange}
                                                onBlur={handleInputBlur}
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
                            )}

                            {/* STEP 3 */}
                            {currentStep === 3 && (
                                <div className="space-y-8">
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
                                            name="paymentMethod"
                                            label="Payment Method"
                                            options={["Bank Transfer", "Cash", "Cheque", "UPI"]}
                                            value={formData.paymentMethod}
                                            onChange={handleInputChange}
                                            onBlur={handleInputBlur}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* STEP 4 */}
                            {currentStep === 4 && (
                                <div className="space-y-8">
                                    {/* Document Details */}
                                    <div className="bg-purple-50/50 rounded-xl p-6 border border-purple-200">
                                        <h3 className="text-lg font-semibold text-slate-900 mb-4">
                                            Document Details
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <Input
                                                name="aadharNumber"
                                                label="Aadhar Number"
                                                value={formData.aadharNumber}
                                                onChange={handleInputChange}
                                                onBlur={handleInputBlur}
                                                error={errors.aadharNumber}
                                                touched={touched.aadharNumber}
                                                isValid={isFieldValid("aadharNumber")}
                                            />

                                            <File
                                                name="aadharFile"
                                                label="Upload Aadhar"
                                                onChange={handleInputChange}
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

                                            <File
                                                name="panFile"
                                                label="Upload PAN"
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                    </div>

                                    {/* Skills & Qualifications */}
                                    <div className="bg-orange-50/50 rounded-xl p-6 border border-orange-200">
                                        <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                                            <FaHardHat className="text-orange-600" />
                                            Skills & Qualifications
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-3">
                                                <label className="text-slate-700 text-sm font-semibold block">
                                                    Skills
                                                </label>
                                                <div className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        value={newSkill}
                                                        onChange={(e) => setNewSkill(e.target.value)}
                                                        className="flex-1 p-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                                        placeholder="Add a skill"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={handleAddSkill}
                                                        className="px-4 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
                                                    >
                                                        Add
                                                    </button>
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {formData.skills.map(skill => (
                                                        <span
                                                            key={skill}
                                                            className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                                                        >
                                                            {skill}
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRemoveSkill(skill)}
                                                                className="text-blue-600 hover:text-blue-800 text-xs"
                                                            >
                                                                ×
                                                            </button>
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            <Input
                                                name="experience"
                                                label="Experience (Years)"
                                                value={formData.experience}
                                                onChange={handleInputChange}
                                                onBlur={handleInputBlur}
                                            />

                                            <Input
                                                name="qualification"
                                                label="Educational Qualification"
                                                value={formData.qualification}
                                                onChange={handleInputChange}
                                                onBlur={handleInputBlur}
                                            />

                                            <div className="space-y-3">
                                                <label className="text-slate-700 text-sm font-semibold block">
                                                    Certifications
                                                </label>
                                                <div className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        value={newCertification}
                                                        onChange={(e) => setNewCertification(e.target.value)}
                                                        className="flex-1 p-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                                        placeholder="Add certification"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={handleAddCertification}
                                                        className="px-4 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
                                                    >
                                                        Add
                                                    </button>
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {formData.certifications.map(cert => (
                                                        <span
                                                            key={cert}
                                                            className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
                                                        >
                                                            {cert}
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRemoveCertification(cert)}
                                                                className="text-purple-600 hover:text-purple-800 text-xs"
                                                            >
                                                                ×
                                                            </button>
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* STEP 5 - Review Step */}
                            {currentStep === 5 && (
                                <div className="space-y-6">
                                    <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                                        <div className="flex items-center gap-3">
                                            <FiCheck className="text-2xl text-green-600" />
                                            <div>
                                                <h3 className="text-lg font-semibold text-green-800">
                                                    Ready to Submit
                                                </h3>
                                                <p className="text-green-600">
                                                    Please review all information before submitting
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <ReviewSection
                                            title="Personal Details"
                                            icon={<FiUser className="text-blue-600" />}
                                            data={[
                                                { label: "First Name", value: formData.firstName },
                                                { label: "Last Name", value: formData.lastName },
                                                { label: "Father's Name", value: formData.fatherName },
                                                { label: "Date of Birth", value: formData.dateOfBirth },
                                                { label: "Gender", value: formData.gender },
                                                { label: "Marital Status", value: formData.maritalStatus },
                                            ]}
                                        />
                                        <ReviewSection
                                            title="Contact Information"
                                            icon={<FiPhone className="text-green-600" />}
                                            data={[
                                                { label: "Phone", value: formData.phone },
                                                { label: "Alternate Phone", value: formData.alternatePhone },
                                                { label: "Email", value: formData.email },
                                                { label: "Emergency Contact", value: formData.emergencyContact },
                                                { label: "Emergency Phone", value: formData.emergencyPhone },
                                            ]}
                                        />
                                        <ReviewSection
                                            title="Employment Details"
                                            icon={<FaUserTie className="text-orange-600" />}
                                            data={[
                                                { label: "Employee ID", value: formData.employeeId },
                                                { label: "Role", value: formData.role },
                                                { label: "Category", value: formData.category },
                                                { label: "Site", value: formData.site },
                                                { label: "Department", value: formData.department },
                                                { label: "Join Date", value: formData.joinDate },
                                                { label: "Salary", value: formData.salary ? `₹${formData.salary}` : "" },
                                            ]}
                                        />
                                        <ReviewSection
                                            title="Bank & Documents"
                                            icon={<BiRupee className="text-purple-600" />}
                                            data={[
                                                { label: "Bank Name", value: formData.bankName },
                                                { label: "Account Number", value: formData.accountNumber },
                                                { label: "IFSC Code", value: formData.ifscCode },
                                                { label: "Account Holder", value: formData.accountHolderName },
                                                { label: "PAN Number", value: formData.panNumber },
                                                { label: "Aadhar Number", value: formData.aadharNumber },
                                            ]}
                                        />
                                        <ReviewSection
                                            title="Skills & Qualifications"
                                            data={[
                                                {
                                                    label: "Skills",
                                                    value: formData.skills.length > 0
                                                        ? formData.skills.join(", ")
                                                        : "None specified"
                                                },
                                                { label: "Experience", value: formData.experience ? `${formData.experience} years` : "" },
                                                { label: "Qualification", value: formData.qualification },
                                                {
                                                    label: "Certifications",
                                                    value: formData.certifications.length > 0
                                                        ? formData.certifications.join(", ")
                                                        : "None specified"
                                                },
                                            ]}
                                        />
                                    </div>

                                    {/* Final Checkboxes */}
                                    <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                                        <div className="space-y-4">
                                            <label className="flex items-center gap-3">
                                                <input type="checkbox" className="rounded text-blue-600" required />
                                                <span className="text-sm text-slate-700">
                                                    I confirm that all information provided is accurate and verified
                                                </span>
                                            </label>
                                            <label className="flex items-center gap-3">
                                                <input type="checkbox" className="rounded text-blue-600" required />
                                                <span className="text-sm text-slate-700">
                                                    I agree to the terms and conditions of employment
                                                </span>
                                            </label>
                                        </div>
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
                                            Adding...
                                        </>
                                    ) : (
                                        <>
                                            <FiSave className="w-4 h-4" /> Add Labour
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
const Input = ({ name, label, type = "text", value, onChange, onBlur, error, touched, isValid, placeholder }) => {
    const getInputMode = () => {
        if (name === "phone" || name === "alternatePhone" || name === "emergencyPhone") return "numeric";
        if (name === "pincode" || name === "aadharNumber") return "numeric";
        if (name === "salary" || name === "experience") return "numeric";
        return "text";
    };

    const getMaxLength = () => {
        if (name === "phone" || name === "alternatePhone" || name === "emergencyPhone") return 10;
        if (name === "pincode") return 6;
        if (name === "aadharNumber") return 12;
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
                        placeholder={placeholder}
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
                    placeholder={placeholder}
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
                {options.map((opt, idx) => (
                    <option key={idx} value={opt}>
                        {opt}
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
                onChange={onChange}
                className="w-full p-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 hover:border-slate-300 transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                accept=".pdf,.jpg,.jpeg,.png"
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

export default AddNewLabour;