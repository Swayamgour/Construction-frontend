import React, { useState, useEffect } from 'react';
import {
    FiArrowLeft,
    FiSave,
    FiUpload,
    FiDollarSign,
    FiUser,
    FiMapPin,
    FiCalendar,
    FiClipboard,
    FiEdit
} from 'react-icons/fi';
import { FaHardHat, FaUserTie, FaFileContract } from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';

const EditProject = () => {
    const navigate = useNavigate();
    const { projectId } = useParams();

    // Form state
    const [formData, setFormData] = useState({
        // Basic Information
        name: '',
        code: '',
        type: '',
        client: '',
        description: '',

        // Timeline & Budget
        startDate: '',
        endDate: '',
        budget: '',
        currency: 'INR',

        // Team Details
        manager: '',
        supervisor: '',
        teamMembers: [],

        // Location Details
        address: '',
        city: '',
        state: '',
        pincode: '',
        country: 'India',

        // Project Details
        workCategories: [],
        status: 'planning',
        priority: 'medium',

        // Documents
        permitNo: '',
        contractFile: null,
        blueprintFile: null,
        permitFile: null,

        // Additional Information
        clientContact: '',
        clientEmail: '',
        clientPhone: ''
    });

    const [currentStep, setCurrentStep] = useState(1);
    const [newCategory, setNewCategory] = useState('');
    const [newMember, setNewMember] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    // Sample data for dropdowns
    const projectTypes = [
        'Residential', 'Commercial', 'Industrial',
        'Infrastructure', 'Renovation', 'Institutional'
    ];

    const workCategoriesList = [
        'Excavation', 'Foundation', 'Structural', 'Electrical',
        'Plumbing', 'Finishing', 'Landscaping', 'MEP'
    ];

    const priorities = ['low', 'medium', 'high', 'critical'];
    const statuses = ['planning', 'active', 'on-hold', 'completed', 'cancelled'];

    // Mock function to fetch project data
    useEffect(() => {
        const fetchProjectData = async () => {
            setIsLoading(true);
            try {
                // Simulate API call
                setTimeout(() => {
                    // Mock project data - in real app, this would come from API
                    const mockProjectData = {
                        name: 'Sunrise Residency Tower A',
                        code: 'PRJ2024001',
                        type: 'Residential',
                        client: 'Sunrise Developers Ltd.',
                        description: 'Construction of 25-story residential tower with modern amenities and parking facility.',

                        startDate: '2024-03-01',
                        endDate: '2025-12-31',
                        budget: '25000000',
                        currency: 'INR',

                        manager: 'Rajesh Kumar',
                        supervisor: 'Anil Sharma',
                        teamMembers: ['Mohan Singh', 'Priya Patel', 'David Wilson'],

                        address: 'Sector 45, Gurugram, Haryana',
                        city: 'Gurugram',
                        state: 'Haryana',
                        pincode: '122001',

                        workCategories: ['Foundation', 'Structural', 'Electrical', 'Plumbing', 'Finishing'],
                        status: 'active',
                        priority: 'high',

                        permitNo: 'BLD/GRG/2024/0456',
                        clientContact: 'Mr. Vikram Mehta',
                        clientEmail: 'vikram.mehta@sunrisedev.com',
                        clientPhone: '+91 9876543210'
                    };

                    setFormData(mockProjectData);
                    setIsLoading(false);
                }, 1000);
            } catch (error) {
                console.error('Error fetching project data:', error);
                setIsLoading(false);
            }
        };

        fetchProjectData();
    }, [projectId]);

    // Handle input changes
    const handleInputChange = (e) => {
        const { name, value, type, files } = e.target;

        if (type === 'file') {
            setFormData(prev => ({
                ...prev,
                [name]: files[0]
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    // Handle array fields
    const handleAddCategory = () => {
        if (newCategory.trim() && !formData.workCategories.includes(newCategory.trim())) {
            setFormData(prev => ({
                ...prev,
                workCategories: [...prev.workCategories, newCategory.trim()]
            }));
            setNewCategory('');
        }
    };

    const handleRemoveCategory = (categoryToRemove) => {
        setFormData(prev => ({
            ...prev,
            workCategories: prev.workCategories.filter(cat => cat !== categoryToRemove)
        }));
    };

    const handleAddMember = () => {
        if (newMember.trim() && !formData.teamMembers.includes(newMember.trim())) {
            setFormData(prev => ({
                ...prev,
                teamMembers: [...prev.teamMembers, newMember.trim()]
            }));
            setNewMember('');
        }
    };

    const handleRemoveMember = (memberToRemove) => {
        setFormData(prev => ({
            ...prev,
            teamMembers: prev.teamMembers.filter(member => member !== memberToRemove)
        }));
    };

    // Form validation
    const validateStep = (step) => {
        switch (step) {
            case 1:
                return formData.name && formData.code && formData.type;
            case 2:
                return formData.startDate && formData.budget;
            case 3:
                return formData.manager && formData.address;
            case 4:
                return formData.permitNo;
            default:
                return true;
        }
    };

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Project updated:', formData);
        alert('Project updated successfully!');
        navigate(-1);
    };

    // Navigation
    const nextStep = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(prev => Math.min(prev + 1, 5));
        } else {
            alert('Please fill all required fields');
        }
    };

    const prevStep = () => {
        setCurrentStep(prev => Math.max(prev - 1, 1));
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 p-6">
                <div className="max-w-6xl mx-auto">
                    <div className="bg-white rounded-2xl shadow-lg p-8 flex items-center justify-center h-64">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-600">Loading project data...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors bg-white p-3 rounded-2xl shadow-sm hover:shadow-md"
                        >
                            <FiArrowLeft className="text-xl" />
                        </button>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                                <FiEdit className="text-blue-600" />
                                Edit Project
                            </h1>
                            <p className="text-gray-600">Update project details for {formData.name}</p>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                    ID: {projectId}
                                </span>
                                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                    {formData.code}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="text-sm text-gray-500">
                        Step {currentStep} of 5
                    </div>
                </div>

                {/* Progress Steps */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
                    <div className="flex justify-between items-center">
                        {[1, 2, 3, 4, 5].map(step => (
                            <div key={step} className="flex flex-col items-center">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 font-semibold transition-all ${step === currentStep
                                    ? 'bg-blue-600 text-white border-blue-600'
                                    : step < currentStep
                                        ? 'bg-green-500 text-white border-green-500'
                                        : 'bg-white text-gray-400 border-gray-300'
                                    }`}>
                                    {step < currentStep ? '✓' : step}
                                </div>
                                <span className={`text-sm mt-2 font-medium ${step === currentStep ? 'text-blue-600' : 'text-gray-500'
                                    }`}>
                                    {step === 1 && 'Basic Info'}
                                    {step === 2 && 'Budget & Timeline'}
                                    {step === 3 && 'Team & Location'}
                                    {step === 4 && 'Documents'}
                                    {step === 5 && 'Review'}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="bg-white rounded-2xl shadow-lg p-8">
                        {/* Step 1: Basic Information */}
                        {currentStep === 1 && (
                            <div className="space-y-8">
                                <h2 className="text-2xl font-bold text-gray-900 border-b pb-4">
                                    <FiClipboard className="inline mr-2" />
                                    Basic Information
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Project Name *
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Enter project name"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Project Code *
                                        </label>
                                        <input
                                            type="text"
                                            name="code"
                                            value={formData.code}
                                            onChange={handleInputChange}
                                            className="w-full p-3 border border-gray-300 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Project code"
                                            required
                                            readOnly
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Project code cannot be changed</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Project Type *
                                        </label>
                                        <select
                                            name="type"
                                            value={formData.type}
                                            onChange={handleInputChange}
                                            className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            required
                                        >
                                            <option value="">Select Type</option>
                                            {projectTypes.map(type => (
                                                <option key={type} value={type}>{type}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Client Name
                                        </label>
                                        <input
                                            type="text"
                                            name="client"
                                            value={formData.client}
                                            onChange={handleInputChange}
                                            className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Enter client name"
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Project Description
                                        </label>
                                        <textarea
                                            name="description"
                                            value={formData.description}
                                            onChange={handleInputChange}
                                            rows="3"
                                            className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Describe the project scope and objectives"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Priority
                                        </label>
                                        <select
                                            name="priority"
                                            value={formData.priority}
                                            onChange={handleInputChange}
                                            className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            {priorities.map(priority => (
                                                <option key={priority} value={priority}>
                                                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Status
                                        </label>
                                        <select
                                            name="status"
                                            value={formData.status}
                                            onChange={handleInputChange}
                                            className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            {statuses.map(status => (
                                                <option key={status} value={status}>
                                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Budget & Timeline */}
                        {currentStep === 2 && (
                            <div className="space-y-8">
                                <h2 className="text-2xl font-bold text-gray-900 border-b pb-4">
                                    <FiDollarSign className="inline mr-2" />
                                    Budget & Timeline
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Start Date *
                                        </label>
                                        <input
                                            type="date"
                                            name="startDate"
                                            value={formData.startDate}
                                            onChange={handleInputChange}
                                            className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            End Date
                                        </label>
                                        <input
                                            type="date"
                                            name="endDate"
                                            value={formData.endDate}
                                            onChange={handleInputChange}
                                            className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Budget *
                                        </label>
                                        <div className="flex gap-2">
                                            <select
                                                name="currency"
                                                value={formData.currency}
                                                onChange={handleInputChange}
                                                className="w-24 p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            >
                                                <option value="INR">₹ INR</option>
                                                <option value="USD">$ USD</option>
                                                <option value="EUR">€ EUR</option>
                                            </select>
                                            <input
                                                type="number"
                                                name="budget"
                                                value={formData.budget}
                                                onChange={handleInputChange}
                                                className="flex-1 p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="Enter project budget"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Work Categories */}
                                <div className="border-t pt-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                        <FaHardHat className="inline mr-2" />
                                        Work Categories
                                    </h3>
                                    <div className="mb-4">
                                        <div className="flex gap-2 mb-2">
                                            <select
                                                value={newCategory}
                                                onChange={(e) => setNewCategory(e.target.value)}
                                                className="flex-1 p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            >
                                                <option value="">Select a category</option>
                                                {workCategoriesList.map(cat => (
                                                    <option key={cat} value={cat}>{cat}</option>
                                                ))}
                                            </select>
                                            <button
                                                type="button"
                                                onClick={handleAddCategory}
                                                className="px-4 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
                                            >
                                                Add
                                            </button>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {formData.workCategories.map(category => (
                                                <span
                                                    key={category}
                                                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                                                >
                                                    {category}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveCategory(category)}
                                                        className="text-blue-600 hover:text-blue-800"
                                                    >
                                                        ×
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Team & Location */}
                        {currentStep === 3 && (
                            <div className="space-y-8">
                                <h2 className="text-2xl font-bold text-gray-900 border-b pb-4">
                                    <FaUserTie className="inline mr-2" />
                                    Team & Location
                                </h2>

                                {/* Team Details */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                        Team Details
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Project Manager *
                                            </label>
                                            <input
                                                type="text"
                                                name="manager"
                                                value={formData.manager}
                                                onChange={handleInputChange}
                                                className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="Enter project manager name"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Site Supervisor
                                            </label>
                                            <input
                                                type="text"
                                                name="supervisor"
                                                value={formData.supervisor}
                                                onChange={handleInputChange}
                                                className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="Enter site supervisor name"
                                            />
                                        </div>

                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Team Members
                                            </label>
                                            <div className="flex gap-2 mb-2">
                                                <input
                                                    type="text"
                                                    value={newMember}
                                                    onChange={(e) => setNewMember(e.target.value)}
                                                    className="flex-1 p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    placeholder="Add team member"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={handleAddMember}
                                                    className="px-4 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
                                                >
                                                    Add
                                                </button>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {formData.teamMembers.map(member => (
                                                    <span
                                                        key={member}
                                                        className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
                                                    >
                                                        {member}
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveMember(member)}
                                                            className="text-purple-600 hover:text-purple-800"
                                                        >
                                                            ×
                                                        </button>
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Location Details */}
                                <div className="border-t pt-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                        <FiMapPin className="inline mr-2" />
                                        Location Details
                                    </h3>
                                    <div className="grid grid-cols-1 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Site Address *
                                            </label>
                                            <textarea
                                                name="address"
                                                value={formData.address}
                                                onChange={handleInputChange}
                                                rows="3"
                                                className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="Enter complete site address"
                                                required
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    City
                                                </label>
                                                <input
                                                    type="text"
                                                    name="city"
                                                    value={formData.city}
                                                    onChange={handleInputChange}
                                                    className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    placeholder="Enter city"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    State
                                                </label>
                                                <input
                                                    type="text"
                                                    name="state"
                                                    value={formData.state}
                                                    onChange={handleInputChange}
                                                    className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    placeholder="Enter state"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    PIN Code
                                                </label>
                                                <input
                                                    type="text"
                                                    name="pincode"
                                                    value={formData.pincode}
                                                    onChange={handleInputChange}
                                                    className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    placeholder="Enter PIN code"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 4: Documents */}
                        {currentStep === 4 && (
                            <div className="space-y-8">
                                <h2 className="text-2xl font-bold text-gray-900 border-b pb-4">
                                    <FaFileContract className="inline mr-2" />
                                    Documents & Compliance
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Permit Number *
                                        </label>
                                        <input
                                            type="text"
                                            name="permitNo"
                                            value={formData.permitNo}
                                            onChange={handleInputChange}
                                            className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Enter permit number"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Upload Permit Document
                                        </label>
                                        <input
                                            type="file"
                                            name="permitFile"
                                            onChange={handleInputChange}
                                            className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            accept=".pdf,.jpg,.jpeg,.png"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Contract File
                                        </label>
                                        <input
                                            type="file"
                                            name="contractFile"
                                            onChange={handleInputChange}
                                            className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            accept=".pdf,.doc,.docx"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Blueprint/Design File
                                        </label>
                                        <input
                                            type="file"
                                            name="blueprintFile"
                                            onChange={handleInputChange}
                                            className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            accept=".pdf,.dwg,.dxf,.jpg,.jpeg,.png"
                                        />
                                    </div>
                                </div>

                                {/* Client Contact Information */}
                                <div className="border-t pt-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                        Client Contact Information
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Contact Person
                                            </label>
                                            <input
                                                type="text"
                                                name="clientContact"
                                                value={formData.clientContact}
                                                onChange={handleInputChange}
                                                className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="Enter contact person name"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Email
                                            </label>
                                            <input
                                                type="email"
                                                name="clientEmail"
                                                value={formData.clientEmail}
                                                onChange={handleInputChange}
                                                className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="Enter client email"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Phone
                                            </label>
                                            <input
                                                type="tel"
                                                name="clientPhone"
                                                value={formData.clientPhone}
                                                onChange={handleInputChange}
                                                className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="Enter client phone number"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 5: Review & Submit */}
                        {currentStep === 5 && (
                            <div className="space-y-8">
                                <h2 className="text-2xl font-bold text-gray-900 border-b pb-4">
                                    <FiSave className="inline mr-2" />
                                    Review & Update
                                </h2>

                                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <FiEdit className="text-2xl text-blue-600" />
                                        <div>
                                            <h3 className="text-lg font-semibold text-blue-800">
                                                Review Changes
                                            </h3>
                                            <p className="text-blue-600">
                                                Please review all updates before saving changes
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Review Summary */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <h4 className="font-semibold text-gray-900">Project Details</h4>
                                        <div className="space-y-2 text-sm">
                                            <p><strong>Name:</strong> {formData.name}</p>
                                            <p><strong>Code:</strong> {formData.code}</p>
                                            <p><strong>Type:</strong> {formData.type}</p>
                                            <p><strong>Client:</strong> {formData.client}</p>
                                            <p><strong>Status:</strong> {formData.status}</p>
                                            <p><strong>Priority:</strong> {formData.priority}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h4 className="font-semibold text-gray-900">Timeline & Budget</h4>
                                        <div className="space-y-2 text-sm">
                                            <p><strong>Start Date:</strong> {formData.startDate}</p>
                                            <p><strong>End Date:</strong> {formData.endDate}</p>
                                            <p><strong>Budget:</strong> {formData.currency} {formData.budget}</p>
                                            <p><strong>Work Categories:</strong> {formData.workCategories.join(', ')}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h4 className="font-semibold text-gray-900">Team & Location</h4>
                                        <div className="space-y-2 text-sm">
                                            <p><strong>Manager:</strong> {formData.manager}</p>
                                            <p><strong>Supervisor:</strong> {formData.supervisor}</p>
                                            <p><strong>Team Members:</strong> {formData.teamMembers.join(', ')}</p>
                                            <p><strong>Address:</strong> {formData.address}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h4 className="font-semibold text-gray-900">Documents</h4>
                                        <div className="space-y-2 text-sm">
                                            <p><strong>Permit No:</strong> {formData.permitNo}</p>
                                            <p><strong>Client Contact:</strong> {formData.clientContact}</p>
                                            <p><strong>Client Email:</strong> {formData.clientEmail}</p>
                                            <p><strong>Client Phone:</strong> {formData.clientPhone}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Final Checkboxes */}
                                <div className="space-y-4">
                                    <label className="flex items-center gap-3">
                                        <input type="checkbox" className="rounded text-blue-600" required />
                                        <span className="text-sm text-gray-700">
                                            I confirm that all project updates are accurate
                                        </span>
                                    </label>
                                    <label className="flex items-center gap-3">
                                        <input type="checkbox" className="rounded text-blue-600" required />
                                        <span className="text-sm text-gray-700">
                                            I have verified all necessary permits and documentation
                                        </span>
                                    </label>
                                </div>
                            </div>
                        )}

                        {/* Navigation Buttons */}
                        <div className="flex justify-between pt-8 border-t mt-8">
                            <button
                                type="button"
                                onClick={prevStep}
                                disabled={currentStep === 1}
                                className={`px-8 py-3 rounded-xl font-semibold transition-all ${currentStep === 1
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-gray-600 text-white hover:bg-gray-700'
                                    }`}
                            >
                                <ArrowLeft className="inline mr-2" />
                                Previous
                            </button>

                            {currentStep < 5 ? (
                                <button
                                    type="button"
                                    onClick={nextStep}
                                    className="px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all"
                                >
                                    Next Step
                                    <ArrowRight className="inline ml-2" />
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    className="px-8 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-all flex items-center gap-2"
                                >
                                    <FiSave />
                                    Update Project
                                </button>
                            )}
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditProject;