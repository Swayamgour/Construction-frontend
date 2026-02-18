import React, { useState } from "react";
import {
  FiArrowLeft,
  FiSave,
  FiUpload,
  FiTool,
  FiMapPin,
  FiCalendar,
  FiClipboard,
  FiAlertCircle,
  FiCheckCircle,
  FiXCircle,
  FiCheck,
} from "react-icons/fi";
import { FaHardHat, FaTruck, FaCog } from "react-icons/fa";
import { BiRupee } from "react-icons/bi";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";

const AddNewMachine = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    // ✅ 1. Basic Information
    name: "",
    model: "",
    serialNumber: "",
    machineType: "",
    manufacturer: "",
    yearOfManufacture: "",
    registrationNumber: "",

    // ✅ 2. Specifications
    capacity: "",
    power: "",
    fuelType: "",
    dimensions: "",
    weight: "",

    // ✅ 3. Purchase & Ownership
    purchaseDate: "",
    purchasePrice: "",
    currentValue: "",
    supplier: "",
    ownershipType: "company-owned",
    status: "active",

    // ✅ 4. Location & Maintenance
    currentSite: "",
    assignedTo: "",
    operator: "",
    lastServiceDate: "",
    nextServiceDate: "",
    serviceInterval: "",
    maintenanceCost: "",

    // ✅ 5. Insurance & Documents
    insuranceProvider: "",
    insuranceNumber: "",
    insuranceExpiry: "",
    registrationFile: null,
    insuranceFile: null,
    serviceManualFile: null,
    notes: "",
    attachments: []
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ Sample data for dropdowns
  const machineTypes = [
    "Excavator", "Bulldozer", "Crane", "Concrete Mixer",
    "Dump Truck", "Backhoe Loader", "Forklift", "Road Roller",
    "Tower Crane", "Batching Plant", "Generator", "Compressor"
  ];

  const fuelTypes = ["Diesel", "Petrol", "Electric", "CNG", "Hybrid"];
  const ownershipTypes = ["company-owned", "rented", "leased"];
  const statusTypes = ["active", "maintenance", "inactive", "sold", "scrapped"];

  const sites = [
    "Sunrise Residency", "Metro Tower", "Tech Park",
    "Commercial Complex", "Industrial Zone", "Warehouse Site"
  ];

  // ✅ Validation rules for each step
  const validationRules = {
    1: {
      name: { required: true, message: "Machine name is required" },
      model: { required: true, message: "Model is required" },
      machineType: { required: true, message: "Machine type is required" },
      yearOfManufacture: {
        pattern: /^(19|20)\d{2}$/,
        message: "Please enter a valid year",
      },
    },
    2: {
      purchaseDate: { required: true, message: "Purchase date is required" },
      purchasePrice: {
        required: true,
        pattern: /^\d*\.?\d*$/,
        message: "Please enter a valid purchase price",
      },
    },
    3: {
      currentSite: { required: true, message: "Current site is required" },
    },
    4: {
      insuranceProvider: { required: true, message: "Insurance provider is required" },
      insuranceExpiry: { required: true, message: "Insurance expiry date is required" },
    },
  };

  // ✅ Step titles and icons
  const stepConfig = {
    1: { title: "Basic Information", icon: <FiTool className="text-blue-600" /> },
    2: { title: "Purchase Details", icon: <BiRupee className="text-green-600" /> },
    3: { title: "Assignment", icon: <FiMapPin className="text-orange-600" /> },
    4: { title: "Insurance & Docs", icon: <FaCog className="text-purple-600" /> },
    5: { title: "Review", icon: <FiSave className="text-indigo-600" /> },
  };

  // ✅ Instant validation on typing
  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;

    let processedValue = value;

    // Input restrictions
    if (type === "text" || type === "number") {
      if (name === "yearOfManufacture") {
        processedValue = value.replace(/\D/g, "").slice(0, 4);
      } else if (name === "purchasePrice" || name === "currentValue" || name === "maintenanceCost") {
        processedValue = value.replace(/[^\d.]/g, "");
        const dots = (processedValue.match(/\./g) || []).length;
        if (dots > 1) processedValue = processedValue.slice(0, -1);
      } else if (name === "serviceInterval") {
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

  // ✅ Generate registration number
  const generateRegistrationNumber = () => {
    const prefix = 'MCH';
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
    // alert("✅ Machine added successfully!");
    toast.success('✅ Machine added successfully!')
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
                Add New Machine
              </h1>
              <p className="text-slate-600 text-sm md:text-base">
                Complete all details to register new machinery
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      name="name"
                      label="Machine Name"
                      value={formData.name}
                      onChange={handleInputChange}
                      onBlur={handleInputBlur}
                      error={errors.name}
                      touched={touched.name}
                      isValid={isFieldValid("name")}
                    />

                    <Input
                      name="model"
                      label="Model"
                      value={formData.model}
                      onChange={handleInputChange}
                      onBlur={handleInputBlur}
                      error={errors.model}
                      touched={touched.model}
                      isValid={isFieldValid("model")}
                    />

                    <Select
                      name="machineType"
                      label="Machine Type"
                      options={machineTypes}
                      value={formData.machineType}
                      onChange={handleInputChange}
                      onBlur={handleInputBlur}
                      error={errors.machineType}
                      touched={touched.machineType}
                      isValid={isFieldValid("machineType")}
                    />

                    <div className="space-y-2">
                      <label className="text-slate-700 text-sm font-semibold block">
                        Registration Number
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          name="registrationNumber"
                          value={formData.registrationNumber || generateRegistrationNumber()}
                          onChange={handleInputChange}
                          className="flex-1 p-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                          placeholder="Auto-generated"
                        />
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({
                            ...prev,
                            registrationNumber: generateRegistrationNumber()
                          }))}
                          className="px-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                        >
                          Generate
                        </button>
                      </div>
                    </div>

                    <Input
                      name="serialNumber"
                      label="Serial Number"
                      value={formData.serialNumber}
                      onChange={handleInputChange}
                      onBlur={handleInputBlur}
                    />

                    <Input
                      name="manufacturer"
                      label="Manufacturer"
                      value={formData.manufacturer}
                      onChange={handleInputChange}
                      onBlur={handleInputBlur}
                    />

                    <Input
                      name="yearOfManufacture"
                      label="Year of Manufacture"
                      value={formData.yearOfManufacture}
                      onChange={handleInputChange}
                      onBlur={handleInputBlur}
                      error={errors.yearOfManufacture}
                      touched={touched.yearOfManufacture}
                      isValid={isFieldValid("yearOfManufacture")}
                    />
                  </div>

                  {/* Specifications */}
                  <div className="bg-blue-50/50 rounded-xl p-6 border border-blue-200">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                      <FaCog className="text-blue-600" />
                      Technical Specifications
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input
                        name="capacity"
                        label="Capacity"
                        value={formData.capacity}
                        onChange={handleInputChange}
                        onBlur={handleInputBlur}
                        placeholder="e.g., 2 tons, 200 HP"
                      />

                      <Input
                        name="power"
                        label="Power"
                        value={formData.power}
                        onChange={handleInputChange}
                        onBlur={handleInputBlur}
                        placeholder="e.g., 150 kW, 200 HP"
                      />

                      <Select
                        name="fuelType"
                        label="Fuel Type"
                        options={fuelTypes}
                        value={formData.fuelType}
                        onChange={handleInputChange}
                        onBlur={handleInputBlur}
                      />

                      <Input
                        name="dimensions"
                        label="Dimensions"
                        value={formData.dimensions}
                        onChange={handleInputChange}
                        onBlur={handleInputBlur}
                        placeholder="L x W x H"
                      />

                      <Input
                        name="weight"
                        label="Weight"
                        value={formData.weight}
                        onChange={handleInputChange}
                        onBlur={handleInputBlur}
                        placeholder="e.g., 5000 kg"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2 */}
              {currentStep === 2 && (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      name="purchaseDate"
                      type="date"
                      label="Purchase Date"
                      value={formData.purchaseDate}
                      onChange={handleInputChange}
                      onBlur={handleInputBlur}
                      error={errors.purchaseDate}
                      touched={touched.purchaseDate}
                      isValid={isFieldValid("purchaseDate")}
                    />

                    <Input
                      name="purchasePrice"
                      label="Purchase Price (₹)"
                      value={formData.purchasePrice}
                      onChange={handleInputChange}
                      onBlur={handleInputBlur}
                      error={errors.purchasePrice}
                      touched={touched.purchasePrice}
                      isValid={isFieldValid("purchasePrice")}
                    />

                    <Input
                      name="currentValue"
                      label="Current Value (₹)"
                      value={formData.currentValue}
                      onChange={handleInputChange}
                      onBlur={handleInputBlur}
                    />

                    <Input
                      name="supplier"
                      label="Supplier"
                      value={formData.supplier}
                      onChange={handleInputChange}
                      onBlur={handleInputBlur}
                    />

                    <Select
                      name="ownershipType"
                      label="Ownership Type"
                      options={ownershipTypes.map(type =>
                        type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ')
                      )}
                      value={formData.ownershipType}
                      onChange={handleInputChange}
                      onBlur={handleInputBlur}
                    />

                    <Select
                      name="status"
                      label="Status"
                      options={statusTypes.map(status =>
                        status.charAt(0).toUpperCase() + status.slice(1)
                      )}
                      value={formData.status}
                      onChange={handleInputChange}
                      onBlur={handleInputBlur}
                    />
                  </div>

                  {/* Maintenance Information */}
                  <div className="bg-green-50/50 rounded-xl p-6 border border-green-200">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                      <FaHardHat className="text-green-600" />
                      Maintenance Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input
                        name="lastServiceDate"
                        type="date"
                        label="Last Service Date"
                        value={formData.lastServiceDate}
                        onChange={handleInputChange}
                        onBlur={handleInputBlur}
                      />

                      <Input
                        name="nextServiceDate"
                        type="date"
                        label="Next Service Date"
                        value={formData.nextServiceDate}
                        onChange={handleInputChange}
                        onBlur={handleInputBlur}
                      />

                      <Input
                        name="serviceInterval"
                        label="Service Interval (Days)"
                        value={formData.serviceInterval}
                        onChange={handleInputChange}
                        onBlur={handleInputBlur}
                      />

                      <Input
                        name="maintenanceCost"
                        label="Annual Maintenance Cost (₹)"
                        value={formData.maintenanceCost}
                        onChange={handleInputChange}
                        onBlur={handleInputBlur}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3 */}
              {currentStep === 3 && (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Select
                      name="currentSite"
                      label="Current Site"
                      options={sites}
                      value={formData.currentSite}
                      onChange={handleInputChange}
                      onBlur={handleInputBlur}
                      error={errors.currentSite}
                      touched={touched.currentSite}
                      isValid={isFieldValid("currentSite")}
                    />

                    <Input
                      name="assignedTo"
                      label="Assigned To"
                      value={formData.assignedTo}
                      onChange={handleInputChange}
                      onBlur={handleInputBlur}
                      placeholder="Enter department or team"
                    />

                    <Input
                      name="operator"
                      label="Operator"
                      value={formData.operator}
                      onChange={handleInputChange}
                      onBlur={handleInputBlur}
                      placeholder="Enter operator name"
                    />
                  </div>

                  {/* Additional Notes */}
                  <div className="bg-orange-50/50 rounded-xl p-6 border border-orange-200">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                      <FiClipboard className="text-orange-600" />
                      Additional Information
                    </h3>
                    <Input
                      name="notes"
                      label="Notes & Remarks"
                      type="textarea"
                      value={formData.notes}
                      onChange={handleInputChange}
                      onBlur={handleInputBlur}
                      placeholder="Enter any additional notes or special instructions"
                    />
                  </div>
                </div>
              )}

              {/* STEP 4 */}
              {currentStep === 4 && (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      name="insuranceProvider"
                      label="Insurance Provider"
                      value={formData.insuranceProvider}
                      onChange={handleInputChange}
                      onBlur={handleInputBlur}
                      error={errors.insuranceProvider}
                      touched={touched.insuranceProvider}
                      isValid={isFieldValid("insuranceProvider")}
                    />

                    <Input
                      name="insuranceNumber"
                      label="Insurance Number"
                      value={formData.insuranceNumber}
                      onChange={handleInputChange}
                      onBlur={handleInputBlur}
                    />

                    <Input
                      name="insuranceExpiry"
                      type="date"
                      label="Insurance Expiry"
                      value={formData.insuranceExpiry}
                      onChange={handleInputChange}
                      onBlur={handleInputBlur}
                      error={errors.insuranceExpiry}
                      touched={touched.insuranceExpiry}
                      isValid={isFieldValid("insuranceExpiry")}
                    />
                  </div>

                  {/* Document Uploads */}
                  <div className="bg-purple-50/50 rounded-xl p-6 border border-purple-200">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                      <FiUpload className="text-purple-600" />
                      Document Uploads
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <File
                        name="registrationFile"
                        label="Registration Document"
                        onChange={handleInputChange}
                      />

                      <File
                        name="insuranceFile"
                        label="Insurance Document"
                        onChange={handleInputChange}
                      />

                      <File
                        name="serviceManualFile"
                        label="Service Manual"
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 5 - Review Step */}
              {currentStep === 5 && (
                <div className="space-y-6">
                  <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                    <div className="flex items-center gap-3">
                      <FaTruck className="text-2xl text-green-600" />
                      <div>
                        <h3 className="text-lg font-semibold text-green-800">
                          Ready to Register Machine
                        </h3>
                        <p className="text-green-600">
                          Please review all information before submitting
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <ReviewSection
                      title="Basic Details"
                      icon={<FiTool className="text-blue-600" />}
                      data={[
                        { label: "Name", value: formData.name },
                        { label: "Model", value: formData.model },
                        { label: "Type", value: formData.machineType },
                        { label: "Registration", value: formData.registrationNumber },
                        { label: "Serial Number", value: formData.serialNumber },
                        { label: "Manufacturer", value: formData.manufacturer },
                        { label: "Year", value: formData.yearOfManufacture },
                      ]}
                    />
                    <ReviewSection
                      title="Specifications"
                      icon={<FaCog className="text-green-600" />}
                      data={[
                        { label: "Capacity", value: formData.capacity },
                        { label: "Power", value: formData.power },
                        { label: "Fuel Type", value: formData.fuelType },
                        { label: "Dimensions", value: formData.dimensions },
                        { label: "Weight", value: formData.weight },
                      ]}
                    />
                    <ReviewSection
                      title="Purchase & Value"
                      icon={<BiRupee className="text-orange-600" />}
                      data={[
                        { label: "Purchase Date", value: formData.purchaseDate },
                        { label: "Purchase Price", value: formData.purchasePrice ? `₹${formData.purchasePrice}` : "" },
                        { label: "Current Value", value: formData.currentValue ? `₹${formData.currentValue}` : "" },
                        { label: "Supplier", value: formData.supplier },
                        { label: "Ownership", value: formData.ownershipType },
                        { label: "Status", value: formData.status },
                      ]}
                    />
                    <ReviewSection
                      title="Assignment & Maintenance"
                      icon={<FiMapPin className="text-purple-600" />}
                      data={[
                        { label: "Current Site", value: formData.currentSite },
                        { label: "Assigned To", value: formData.assignedTo },
                        { label: "Operator", value: formData.operator },
                        { label: "Last Service", value: formData.lastServiceDate },
                        { label: "Next Service", value: formData.nextServiceDate },
                        { label: "Service Interval", value: formData.serviceInterval ? `${formData.serviceInterval} days` : "" },
                        { label: "Maintenance Cost", value: formData.maintenanceCost ? `₹${formData.maintenanceCost}` : "" },
                      ]}
                    />
                    <ReviewSection
                      title="Insurance & Documents"
                      data={[
                        { label: "Insurance Provider", value: formData.insuranceProvider },
                        { label: "Insurance Number", value: formData.insuranceNumber },
                        { label: "Insurance Expiry", value: formData.insuranceExpiry },
                        { label: "Notes", value: formData.notes },
                      ]}
                    />
                  </div>

                  {/* Final Checkboxes */}
                  <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                    <div className="space-y-4">
                      <label className="flex items-center gap-3">
                        <input type="checkbox" className="rounded text-blue-600" required />
                        <span className="text-sm text-slate-700">
                          I confirm that all machine information is accurate
                        </span>
                      </label>
                      <label className="flex items-center gap-3">
                        <input type="checkbox" className="rounded text-blue-600" required />
                        <span className="text-sm text-slate-700">
                          I have verified all necessary documents and insurance
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
                      Registering...
                    </>
                  ) : (
                    <>
                      <FiSave className="w-4 h-4" /> Register Machine
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
    if (name === "purchasePrice" || name === "currentValue" || name === "maintenanceCost") return "decimal";
    if (name === "serviceInterval" || name === "yearOfManufacture") return "numeric";
    return "text";
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
            rows="4"
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
        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
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

export default AddNewMachine;