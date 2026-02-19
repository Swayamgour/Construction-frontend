import React, { useState, useEffect } from 'react';
import {
    Search,
    Filter,
    Plus,
    MoreVertical,
    Edit,
    Trash2,
    Mail,
    Eye,
    Download,
    ChevronLeft,
    ChevronRight,
    Users,
    CheckCircle,
    XCircle,
    Shield
} from 'lucide-react';
import { useGetRolesQuery, useGetUsersQuery, useUpdateRolesMutation } from '../../Reduxe/Api';
import { useNavigate } from 'react-router-dom';
import Switch from '@mui/material/Switch';
import toast from 'react-hot-toast';

// Default avatar for users without images
const defaultAvatar = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face";

const roles = ["All Roles", "Admin", "Project Manager", "Engineer", "Store Manager", "Accountant", "HR"];
const statuses = ["All Status", "active", "inactive"];

function UserList() {
    // const { data, isSuccess, isLoading, error } = useGetUsersQuery();
    // const { data, isSuccess, isLoading, error } = useGetRolesQuery()
    const { data: users = [], isSuccess, isLoading, error } = useGetRolesQuery();

    const [updateRoles] = useUpdateRolesMutation()



    // console.log(data)
    // const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedRole, setSelectedRole] = useState("All Roles");
    const [selectedStatus, setSelectedStatus] = useState("All Status");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5);
    const [activeActions, setActiveActions] = useState(null);
    const [checked, setChecked] = React.useState(true);

    // Update users when data is successfully fetched
    // useEffect(() => {
    //     if (isSuccess) {
    //         setUsers(data);
    //     }
    // }, [isSuccess]);

    // Filter users based on search, role, and status

    const filteredUsers = users.filter(user => {
        const matchesSearch =
            user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesRole =
            selectedRole === "All Roles" ||
            (user.role && typeof user.role === "string" && user.role.includes(selectedRole.toLowerCase()));

        const userStatus = user.status === true ? "active" : "inactive";

        const matchesStatus = selectedStatus === "All Status" || userStatus === selectedStatus;

        return matchesSearch && matchesRole && matchesStatus;
    });


    // Pagination
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

    const handlePageChange = (page) => {
        setCurrentPage(page);
        setActiveActions(null);
    };

    const handleChange = (event) => {
        setChecked(event.target.checked);
    };

    const toggleActions = (userId) => {
        setActiveActions(activeActions === userId ? null : userId);
    };

    const handleEdit = (user) => {
        alert(`Edit user: ${user.name}`);
        setActiveActions(null);
    };

    const handleDelete = (user) => {
        if (window.confirm(`Are you sure you want to delete ${user.name}?`)) {
            alert(`User ${user.name} deleted`);
        }
        setActiveActions(null);
    };

    const handleView = (user) => {
        alert(`View user: ${user.name}`);
        setActiveActions(null);
    };

    const handleEmail = (user) => {
        alert(`Send email to: ${user.email}`);
        setActiveActions(null);
    };

    const getStatusBadge = (user) => {
        const baseClasses = "px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1";
        const status = user.status;

        if (status === true) {
            return `${baseClasses} bg-green-100 text-green-800`;
        }
        return `${baseClasses} bg-red-100 text-red-800`;
    };


    //

    // let 

    // console.log(data)

    const getRoleDisplay = (user) => {
        // if (!data || !user?.role) return "User";

        // const matchedRole = data.find((role) => role._id === user.role);

        // return matchedRole?.roleName || "User";
        return "User"
    };


    const getRoleColor = (role) => {
        const roleName = typeof role === 'string' ? role : getRoleDisplay({ role });
        const colors = {
            'Admin': 'bg-purple-100 text-purple-800',
            'Project Manager': 'bg-blue-100 text-blue-800',
            'Engineer': 'bg-orange-100 text-orange-800',
            'Store Manager': 'bg-green-100 text-green-800',
            'Accountant': 'bg-emerald-100 text-emerald-800',
            'HR': 'bg-pink-100 text-pink-800',
            'User': 'bg-gray-100 text-gray-800'
        };
        return colors[roleName] || 'bg-gray-100 text-gray-800';
    };

    const getJoinDate = (user) => {
        return user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A';
    };

    const getLastActive = (user) => {
        return user.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : 'N/A';
    };

    const getPermissionsCount = (user) => {
        if (!user.permissions) return 0;
        return Object.values(user.permissions).reduce((count, module) => {
            return count + Object.values(module).filter(Boolean).length;
        }, 0);
    };

    const navigate = useNavigate()

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-6 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-600">Loading users...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-6 flex items-center justify-center">
                <div className="text-center">
                    <XCircle className="text-red-500 mx-auto mb-4" size={48} />
                    <h3 className="text-lg font-semibold text-slate-800 mb-2">Error loading users</h3>
                    <p className="text-slate-600">Please try again later</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-6">
            <div className="max-w-7xl mx-auto">

                {/* Header */}
                <div className="mb-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-blue-100 rounded-2xl">
                                <Users className="text-blue-600" size={24} />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Create Manager</h1>
                                <p className="text-slate-600">Manage your team members and their permissions</p>
                            </div>
                        </div>

                        <button onClick={() => navigate('/CreateUserRoleForm')} className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105">
                            <Plus size={20} />
                            Add New User
                        </button>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <StatCard
                            title="Total Users"
                            value={users.length}
                            color="blue"
                            icon={<Users className="text-blue-600" size={20} />}
                        />
                        <StatCard
                            title="Active Users"
                            value={users.filter(u => (u.status || 'active') === 'active').length}
                            color="green"
                            icon={<CheckCircle className="text-green-600" size={20} />}
                        />
                        <StatCard
                            title="Inactive Users"
                            value={users.filter(u => u.status === 'inactive').length}
                            color="red"
                            icon={<XCircle className="text-red-600" size={20} />}
                        />
                        <StatCard
                            title="Total Permissions"
                            value={users.reduce((total, user) => total + getPermissionsCount(user), 0)}
                            color="purple"
                            icon={<Shield className="text-purple-600" size={20} />}
                        />
                    </div>
                </div>

                {/* Filters and Search */}
                <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 mb-6">
                    <div className="flex flex-col lg:flex-row gap-4 items-end">
                        <div className="flex-1">
                            <label className="text-sm font-semibold text-slate-700 mb-2 block">Search Users</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                                <input
                                    type="text"
                                    placeholder="Search by name or email..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                            {/* <div>
                                <label className="text-sm font-semibold text-slate-700 mb-2 block">Filter by Role</label>
                                <select
                                    value={selectedRole}
                                    onChange={(e) => setSelectedRole(e.target.value)}
                                    className="px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                                >
                                    {roles.map(role => (
                                        <option key={role} value={role}>{role}</option>
                                    ))}
                                </select>
                            </div> */}

                            <div>
                                <label className="text-sm font-semibold text-slate-700 mb-2 block">Filter by Status</label>
                                <select
                                    value={selectedStatus}
                                    onChange={(e) => setSelectedStatus(e.target.value)}
                                    className="px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                                >
                                    {statuses.map(status => (
                                        <option key={status} value={status}>
                                            {status === 'active' ? 'Active' : status === 'inactive' ? 'Inactive' : status}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Users Table */}
                <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
                    {/* Table Header */}
                    <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-slate-800">
                                Users ({filteredUsers.length})
                            </h3>
                            <button className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:text-slate-800 transition-colors duration-200">
                                <Download size={18} />
                                Export
                            </button>
                        </div>
                    </div>

                    {/* Users List */}
                    <div className="divide-y divide-slate-200">
                        {currentUsers.length > 0 ? (
                            currentUsers.map((user) => (
                                <div onClick={() => navigate('/UserDetails', { state: { userId: user?._id, user: user } })}
                                    key={user._id} className="p-6 hover:bg-slate-50 transition-colors duration-150">
                                    <div className="flex items-center justify-between">
                                        {/* User Info */}
                                        <div className="flex items-center gap-4 flex-1">
                                            <img
                                                src={user.avatar || defaultAvatar}
                                                alt={user.name}
                                                className="w-12 h-12 rounded-xl object-cover border-2 border-slate-200"
                                            />

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h4 className="font-semibold text-slate-800 truncate">{user.name}</h4>
                                                    {/* {console.log(user?.status === true)} */}
                                                    <span className={getStatusBadge(user)}>
                                                        {(user.status === true) === 'active' ? <CheckCircle size={12} /> : <XCircle size={12} />}
                                                        {user.status === true ? 'Active' : 'Inactive'}
                                                    </span>
                                                </div>
                                                <p className="text-slate-600 text-sm mb-1">{user.email}</p>
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    {/* {c} */}
                                                    <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getRoleColor(user.role)}`}>
                                                        {/* {getRoleDisplay(user)} */}
                                                        {user?.role || 'User'}
                                                    </span>
                                                    {user.phone && (
                                                        <span className="text-slate-500 text-xs">
                                                            {user.phone}
                                                        </span>
                                                    )}
                                                    <span className="text-slate-500 text-xs">
                                                        Joined {getJoinDate(user)}
                                                    </span>
                                                    {user.permissions && (
                                                        <span className="text-slate-500 text-xs">
                                                            {getPermissionsCount(user)} permissions
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div onClick={(e) => e.stopPropagation()}>
                                                <Switch
                                                    checked={user?.status === true}
                                                    onChange={async (event) => {
                                                        event.stopPropagation(); // 🛑 Prevent parent navigation

                                                        try {
                                                            await updateRoles({
                                                                userId: user?._id,
                                                                status: user?.status ? false : true
                                                            }).unwrap();

                                                            toast.success(
                                                                user?.status ? "User Deactivated" : "User Activated"
                                                            );
                                                        } catch (err) {
                                                            console.error(err);
                                                            toast.error("Failed to update status");
                                                        }
                                                    }}
                                                    slotProps={{ input: { "aria-label": "controlled" } }}
                                                />
                                            </div>


                                        </div>

                                        {/* Actions */}
                                        {/* <div className="relative">
                                            <button
                                                onClick={() => toggleActions(user._id)}
                                                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all duration-200"
                                            >
                                                <MoreVertical size={20} />
                                            </button>

                                            {activeActions === user._id && (
                                                <div className="absolute right-0 top-12 bg-white rounded-xl shadow-2xl border border-slate-200 min-w-48 z-10 animate-fadeIn">
                                                    <button
                                                        onClick={() => handleView(user)}
                                                        className="w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors duration-150 flex items-center gap-3 text-slate-700"
                                                    >
                                                        <Eye size={16} />
                                                        View Details
                                                    </button>
                                                    <button
                                                        onClick={() => handleEdit(user)}
                                                        className="w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors duration-150 flex items-center gap-3 text-slate-700"
                                                    >
                                                        <Edit size={16} />
                                                        Edit User
                                                    </button>
                                                    <button
                                                        onClick={() => handleEmail(user)}
                                                        className="w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors duration-150 flex items-center gap-3 text-slate-700"
                                                    >
                                                        <Mail size={16} />
                                                        Send Email
                                                    </button>
                                                    <div className="border-t border-slate-200">
                                                        <button
                                                            onClick={() => handleDelete(user)}
                                                            className="w-full text-left px-4 py-3 hover:bg-red-50 transition-colors duration-150 flex items-center gap-3 text-red-600"
                                                        >
                                                            <Trash2 size={16} />
                                                            Delete User
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div> */}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-12 text-center">
                                <Users className="mx-auto text-slate-300 mb-4" size={48} />
                                <h3 className="text-lg font-semibold text-slate-600 mb-2">No users found</h3>
                                <p className="text-slate-500">Try adjusting your search or filters</p>
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50">
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-slate-600">
                                    Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredUsers.length)} of {filteredUsers.length} users
                                </p>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className="p-2 rounded-xl border border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white transition-colors duration-200"
                                    >
                                        <ChevronLeft size={16} />
                                    </button>

                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                        <button
                                            key={page}
                                            onClick={() => handlePageChange(page)}
                                            className={`px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${currentPage === page
                                                ? 'bg-blue-500 text-white shadow-lg'
                                                : 'text-slate-600 hover:bg-white hover:text-slate-800'
                                                }`}
                                        >
                                            {page}
                                        </button>
                                    ))}

                                    <button
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        className="p-2 rounded-xl border border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white transition-colors duration-200"
                                    >
                                        <ChevronRight size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// Reusable Components
const StatCard = ({ title, value, color, icon }) => {
    const colorClasses = {
        blue: 'bg-blue-50 border-blue-200',
        green: 'bg-green-50 border-green-200',
        red: 'bg-red-50 border-red-200',
        purple: 'bg-purple-50 border-purple-200'
    };

    return (
        <div className={`p-4 rounded-2xl border-2 ${colorClasses[color]} transition-all duration-200 hover:scale-105`}>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-slate-600 mb-1">{title}</p>
                    <p className="text-2xl font-bold text-slate-800">{value}</p>
                </div>
                <div className="p-2 bg-white rounded-xl shadow-sm">
                    {icon}
                </div>
            </div>
        </div>
    );
};

// Add animation styles
const styles = `
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fadeIn {
  animation: fadeIn 0.3s ease-out;
}
`;

// Add styles to document
if (typeof document !== 'undefined') {
    const styleSheet = document.createElement("style");
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);
}

export default UserList;