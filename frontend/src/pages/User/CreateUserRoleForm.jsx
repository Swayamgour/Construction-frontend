import React, { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Plus, Check, User, Shield, Eye } from "lucide-react";
import { FiSave } from "react-icons/fi";
import { useAddRolesMutation, useAddUserMutation, useGetRolesQuery } from "../../Reduxe/Api";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const permissionModules = [
    { name: "Projects", icon: "📊", color: "bg-blue-100 text-blue-600" },
    { name: "Vendors", icon: "🤝", color: "bg-green-100 text-green-600" },
    { name: "Inventory", icon: "📦", color: "bg-orange-100 text-orange-600" },
    { name: "Purchase", icon: "🛒", color: "bg-purple-100 text-purple-600" },
    { name: "Finance", icon: "💰", color: "bg-emerald-100 text-emerald-600" },
    { name: "Users", icon: "👥", color: "bg-pink-100 text-pink-600" },
];

const CreateUserForm = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const [showRoleModal, setShowRoleModal] = useState(false);

    // const { data: , isSuccess } = useGetRolesQuery()

    let defaultRoles = [
        "manager",
        "supervisor",
        "labour"
    ]

    const [roles, setRoles] = useState(defaultRoles || []);
    const [newRole, setNewRole] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [addUser, result] = useAddUserMutation()
    const [addRoles, resultAddRoles] = useAddRolesMutation()

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        role: "",
        // Remove permissions from user form data
    });

    // State for role permissions (only used in role modal)
    const [rolePermissions, setRolePermissions] = useState({});

    // Initialize permissions for new role
    const initializePermissions = () => {
        const initialPermissions = {};
        permissionModules.forEach(module => {
            initialPermissions[module.name] = {
                view: false,
                add: false,
                edit: false,
                delete: false
            };
        });
        setRolePermissions(initialPermissions);
    };

    const addNewRole = () => {
        if (!newRole.trim()) return;

        // ✅ Check role duplication by roleName
        if (roles?.some((r) => r.roleName.toLowerCase() === newRole.toLowerCase())) {
            alert("Role already exists!");
            return;
        }

        // ✅ Create role object with permissions
        const newRoleObj = {
            roleName: newRole,
            permissions: rolePermissions  // Include permissions when creating role
        };

        // ✅ Add to local UI (Frontend list)
        setRoles((prev) => [...prev, newRoleObj]);
        setFormData({ ...formData, role: newRole });
        setNewRole("");
        setShowRoleModal(false);

        // ✅ Backend API call with permissions
        addRoles({
            roleName: newRole,
            permissions: rolePermissions
        });

        toast.success('Role Created Successfully with Permissions');

        // Reset permissions for next role creation
        initializePermissions();
    };

    const navigate = useNavigate()

    const handleSubmit = () => {
        setIsSubmitting(true);
        addUser({ ...formData, password: '12345' });
        setIsSubmitting(false);
    };

    useEffect(() => {
        if (result?.status === "fulfilled") {
            toast.success("User Created Successfully");
            navigate(-1);
        }

        if (result?.error?.status === 400) {
            toast.error("User already exists!");
        }
    }, [result]);

    const progressPercentage = (currentStep / 2) * 100; // Changed to 2 steps

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-6">
            {/* CARD CONTAINER */}
            <div className="max-w-4xl mx-auto bg-white p-6 md:p-8 rounded-3xl shadow-2xl border border-slate-200">

                {/* HEADER */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-100 rounded-xl">
                            <User className="text-blue-600" size={24} />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800">Create New User</h2>
                    </div>

                    {/* Progress Bar - Now only 2 steps */}
                    <div className="mt-6">
                        <div className="flex justify-between text-sm text-slate-500 mb-2">
                            <span>User Info</span>
                            <span>Review</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                            <div
                                className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
                                style={{ width: `${progressPercentage}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

                {/* STEP 1 -------------------*/}
                {currentStep === 1 && (
                    <div className="space-y-6 animate-fadeIn">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <User className="text-blue-600" size={20} />
                            </div>
                            <h3 className="font-bold text-xl text-slate-800">User Information</h3>
                        </div>

                        {/* Inputs */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                                label="Full Name"
                                name="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                icon="👤"
                                placeholder="Enter full name"
                            />

                            <Input
                                label="Email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                icon="📧"
                                placeholder="user@example.com"
                            />

                            <Input
                                label="Phone"
                                name="phone"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                icon="📱"
                                maxLength={10}
                                placeholder="+91 9999999999"
                            />

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                    <Shield size={16} className="text-blue-500" />
                                    User Role
                                </label>
                                <div className="flex gap-2">
                                    <select
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                        className="flex-1 p-3 border-2 border-slate-200 rounded-xl bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                                    >
                                        <option value="">Select Role</option>
                                        {defaultRoles?.map((role) => (
                                            <option key={role} value={role}>
                                                {role}
                                            </option>
                                        ))}
                                    </select>

                                    <button
                                        onClick={() => {
                                            initializePermissions(); // Reset permissions when opening modal
                                            setShowRoleModal(true);
                                        }}
                                        className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                                    >
                                        <Plus size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 2 - REVIEW STEP (Permissions removed) -------------------*/}
                {currentStep === 2 && (
                    <div className="animate-fadeIn">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-emerald-100 rounded-lg">
                                <Eye className="text-emerald-600" size={20} />
                            </div>
                            <h3 className="font-bold text-xl text-slate-800">Review Details</h3>
                        </div>

                        <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50 border-2 border-slate-200 shadow-sm">
                            <div className="space-y-4">
                                <DetailItem label="Full Name" value={formData.name || "Not provided"} />
                                <DetailItem label="Email" value={formData.email || "Not provided"} />
                                <DetailItem label="Phone" value={formData.phone || "Not provided"} />
                                <DetailItem
                                    label="Role"
                                    value={formData.role || "Not selected"}
                                    highlight
                                />
                            </div>

                            {/* Show role permissions summary if role is selected */}
                            {formData.role && (
                                <div className="mt-6 p-4 bg-white rounded-xl border border-slate-200">
                                    <h4 className="font-semibold text-slate-700 mb-3">Role Permissions</h4>
                                    <p className="text-slate-600 text-sm mb-3">
                                        Permissions are managed at the role level. This user will inherit all permissions from the selected role.
                                    </p>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                                        {permissionModules.map(module => {
                                            // Find the selected role and its permissions
                                            const selectedRole = defaultRoles?.find(role => role._id === formData.role);
                                            const modulePerms = selectedRole?.permissions?.[module.name] || {};
                                            const activePerms = Object.values(modulePerms).filter(Boolean).length;

                                            return (
                                                <div key={module.name} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
                                                    <span className={module.color + " p-1 rounded text-xs"}>{module.icon}</span>
                                                    <span className="text-slate-600">{module.name}</span>
                                                    <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                                                        {activePerms}/4
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* FOOTER + BUTTONS */}
                <div className="flex justify-between mt-10 pt-6 border-t border-slate-200">
                    <button
                        disabled={currentStep === 1}
                        onClick={() => setCurrentStep(currentStep - 1)}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-600 text-white disabled:bg-slate-300 disabled:cursor-not-allowed hover:bg-slate-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:shadow-none transform hover:scale-105 disabled:scale-100"
                    >
                        <ArrowLeft size={18} /> Back
                    </button>

                    {currentStep < 2 ? ( // Changed to 2 steps
                        <button
                            onClick={() => setCurrentStep(currentStep + 1)}
                            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                            Next <ArrowRight size={18} />
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:from-green-300 disabled:to-green-400 disabled:scale-100 disabled:shadow-none"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Creating...
                                </>
                            ) : (
                                <>
                                    Create User <FiSave size={18} />
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>

            {/* Create Role Modal with Permissions */}
            {showRoleModal && (
                <RoleModal
                    newRole={newRole}
                    setNewRole={setNewRole}
                    addNewRole={addNewRole}
                    onClose={() => setShowRoleModal(false)}
                    rolePermissions={rolePermissions}
                    setRolePermissions={setRolePermissions}
                    permissionModules={permissionModules}
                />
            )}
        </div>
    );
};

/* ✅ ENHANCED INPUT COMPONENT */
const Input = ({ label, name, value, onChange, type = "text", icon, placeholder, maxLength }) => (
    <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-700">{label}</label>
        <div className="relative">
            {icon && (
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">
                    {icon}
                </span>
            )}
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                maxLength={maxLength}
                className={`w-full p-3 border-2 border-slate-200 rounded-xl bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 ${icon ? 'pl-10' : ''
                    }`}
            />
        </div>
    </div>
);

/* ✅ DETAIL ITEM COMPONENT */
const DetailItem = ({ label, value, highlight = false }) => (
    <div className="flex justify-between items-center py-3 border-b border-slate-200 last:border-b-0">
        <span className="font-medium text-slate-600">{label}:</span>
        <span className={`font-semibold ${highlight ? 'text-blue-600 bg-blue-50 px-3 py-1 rounded-full' : 'text-slate-800'}`}>
            {value}
        </span>
    </div>
);

/* ✅ ENHANCED ADD ROLE MODAL WITH PERMISSIONS */
const RoleModal = ({
    newRole,
    setNewRole,
    addNewRole,
    onClose,
    rolePermissions,
    setRolePermissions,
    permissionModules
}) => {

    const toggleRolePermission = (module, permission) => {
        setRolePermissions(prev => ({
            ...prev,
            [module]: {
                ...prev[module],
                [permission]: !prev[module]?.[permission]
            }
        }));
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center p-4 z-50 animate-fadeIn">
            <div
                className="bg-white p-6 rounded-2xl w-full max-w-4xl shadow-2xl border border-slate-200 animate-scaleIn max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                        <Plus className="text-blue-600" size={20} />
                    </div>
                    <h3 className="font-bold text-lg text-slate-800">Add New Role with Permissions</h3>
                </div>

                {/* Role Name Input */}
                <div className="mb-6">
                    <label className="text-sm font-semibold text-slate-700 mb-2 block">Role Name</label>
                    <input
                        type="text"
                        className="w-full p-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                        value={newRole}
                        onChange={(e) => setNewRole(e.target.value)}
                        placeholder="Enter role name"
                    />
                </div>

                {/* Permissions Table */}
                <div className="mb-6">
                    <label className="text-sm font-semibold text-slate-700 mb-3 block">Set Permissions</label>
                    <div className="border-2 border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                        <table className="w-full">
                            <thead className="bg-gradient-to-r from-slate-50 to-slate-100">
                                <tr>
                                    <th className="p-4 text-left font-bold text-slate-700">Module</th>
                                    <th className="p-4 text-center font-bold text-slate-700">View</th>
                                    <th className="p-4 text-center font-bold text-slate-700">Add</th>
                                    <th className="p-4 text-center font-bold text-slate-700">Edit</th>
                                    <th className="p-4 text-center font-bold text-slate-700">Delete</th>
                                </tr>
                            </thead>
                            <tbody>
                                {permissionModules.map((module, index) => (
                                    <tr
                                        key={module.name}
                                        className={`border-b border-slate-100 ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50'
                                            } hover:bg-blue-50 transition-colors duration-150`}
                                    >
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <span className={`p-2 rounded-lg ${module.color}`}>
                                                    {module.icon}
                                                </span>
                                                <span className="font-medium text-slate-700">{module.name}</span>
                                            </div>
                                        </td>
                                        {["view", "add", "edit", "delete"].map((perm) => (
                                            <td key={perm} className="text-center p-4">
                                                <label className="inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        className="hidden"
                                                        checked={rolePermissions[module.name]?.[perm] || false}
                                                        onChange={() => toggleRolePermission(module.name, perm)}
                                                    />
                                                    <div className={`w-6 h-6 border-2 rounded-lg flex items-center justify-center transition-all duration-200 ${rolePermissions[module.name]?.[perm]
                                                        ? 'bg-blue-500 border-blue-500'
                                                        : 'border-slate-300 hover:border-blue-400'
                                                        }`}>
                                                        {rolePermissions[module.name]?.[perm] && (
                                                            <Check size={14} className="text-white" />
                                                        )}
                                                    </div>
                                                </label>
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Permissions Summary */}
                <div className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <h4 className="font-semibold text-slate-700 mb-3">Permissions Summary</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                        {permissionModules.map(module => {
                            const perms = rolePermissions[module.name] || {};
                            const activePerms = Object.values(perms).filter(Boolean).length;
                            return (
                                <div key={module.name} className="flex items-center gap-2 p-2 bg-white rounded-lg">
                                    <span className={module.color + " p-1 rounded text-xs"}>{module.icon}</span>
                                    <span className="text-slate-600">{module.name}</span>
                                    <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                                        {activePerms}/4
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-3 border-2 border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-all duration-200"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={addNewRole}
                        disabled={!newRole.trim()}
                        className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 disabled:from-slate-300 disabled:to-slate-400 disabled:cursor-not-allowed transition-all duration-200"
                    >
                        Create Role with Permissions
                    </button>
                </div>
            </div>
        </div>
    );
};

// Add these styles to your global CSS or use a CSS-in-JS solution
const styles = `
@keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}

@keyframes scaleIn {
    from { opacity: 0; transform: scale(0.9); }
    to { opacity: 1; transform: scale(1); }
}

.animate-fadeIn {
    animation: fadeIn 0.5s ease-out;
}

.animate-scaleIn {
    animation: scaleIn 0.3s ease-out;
}
`;

// Add the styles to the document head
if (typeof document !== 'undefined') {
    const styleSheet = document.createElement("style");
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);
}

export default CreateUserForm;