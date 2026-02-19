import React, { useState } from 'react';
import {
    ArrowLeft,
    Edit,
    Mail,
    Phone,
    Shield,
    Calendar,
    MoreVertical,
    Download,
    Send,
    Lock,
    User,
    Trash2
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDeleteUserMutation, useGetUsersByIdQuery } from '../../Reduxe/Api';
import toast from 'react-hot-toast';

const defaultAvatar = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face";

function UserDetails() {
    const navigate = useNavigate();
    const location = useLocation();
    const { userId } = location.state || {};

    const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();

    const [activeTab, setActiveTab] = useState('overview');
    const [showActionsMenu, setShowActionsMenu] = useState(false);

    const { data, isLoading, error } = useGetUsersByIdQuery(userId, {
        skip: !userId,
    });

    const user = data?.data;

    const handleEdit = () => {
        alert('Edit user functionality would open here');
        setShowActionsMenu(false);
    };

    const handleSendEmail = () => {
        alert(`Send email to ${user?.email}`);
        setShowActionsMenu(false);
    };

    const handleResetPassword = () => {
        alert('Password reset functionality would open here');
        setShowActionsMenu(false);
    };

    const handleExport = () => {
        alert('Export user data');
        setShowActionsMenu(false);
    };

    const handleBack = () => {
        navigate(-1);
    };

    const handleDelete = (user) => {
        console.log(user?._id)
        if (window.confirm(`Are you sure you want to delete ${user.name}?`)) {
            deleteUser(user._id);
            navigate(-1);
            toast.success('User deleted successfully');
        }
        // setActiveActions(null);
    };


    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
                <p className="text-slate-600">Loading user details...</p>
            </div>
        );
    }

    if (error || !user) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
                <p className="text-red-600">Error loading user details</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-6">
            {/* Header Navigation */}
            <div className="max-w-7xl mx-auto mb-6">
                <button
                    onClick={handleBack}
                    className="flex items-center gap-2 text-slate-600 hover:text-slate-800"
                >
                    <ArrowLeft size={20} />
                    <span>Back</span>
                </button>
            </div>

            {/* Main Card */}
            <div className="max-w-7xl mx-auto bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">

                {/* Header */}
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div className="flex items-center gap-6">
                            <img
                                src={defaultAvatar}
                                alt={user.name}
                                className="w-20 h-20 md:w-24 md:h-24 rounded-2xl border-4 border-white/30 object-cover"
                            />
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold mb-1">{user.name}</h1>
                                <p className="text-blue-100 flex items-center gap-2">
                                    <Shield size={16} />
                                    {user.role}
                                </p>
                                <p className="text-blue-100 text-sm mt-1">User ID: {user._id}</p>
                            </div>
                        </div>

                        <div className="border-t border-slate-200">
                            <button
                                onClick={() => handleDelete(user)}
                                className="w-full text-left px-4 py-3 bg-red-600  transition-colors duration-150 flex items-center gap-3 text-white"
                            >
                                <Trash2 size={16} />
                                Delete User
                            </button>
                        </div>

                        {/* <div className="flex items-center gap-3">
                            <button className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl">
                                <Edit size={18} />
                                Edit
                            </button>

                            <div className="relative">
                                <button
                                    onClick={() => setShowActionsMenu(!showActionsMenu)}
                                    className="p-2 bg-white/20 hover:bg-white/30 rounded-xl"
                                >
                                    <MoreVertical size={18} />
                                </button>
                                {showActionsMenu && (
                                    <div className="absolute right-0 top-12 bg-white rounded-xl shadow-lg border min-w-48 z-10">
                                        <ActionItem onClick={handleEdit} icon={<Edit size={16} />} label="Edit User" />
                                        <ActionItem onClick={handleSendEmail} icon={<Send size={16} />} label="Send Email" />
                                        <ActionItem onClick={handleResetPassword} icon={<Lock size={16} />} label="Reset Password" />
                                        <ActionItem onClick={handleExport} icon={<Download size={16} />} label="Export Data" />
                                    </div>
                                )}
                            </div>
                        </div> */}
                    </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-slate-200">
                    <nav className="flex overflow-x-auto">
                        {['overview', 'activity'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-6 py-4 font-medium border-b-2 ${activeTab === tab
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-slate-500'
                                    }`}
                            >
                                {tab.toUpperCase()}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Content */}
                <div className="p-6 md:p-8">

                    {/* Overview */}
                    {activeTab === 'overview' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <InfoCard icon={<Mail />} label="Email" value={user.email} />
                                    <InfoCard icon={<Phone />} label="Phone" value={user.phone} />
                                    <InfoCard icon={<Shield />} label="Role" value={user.role} />
                                    <InfoCard icon={<Calendar />} label="Join Date" value={new Date(user.createdAt).toLocaleDateString()} />
                                    <InfoCard icon={<Calendar />} label="Last Updated" value={new Date(user.updatedAt).toLocaleDateString()} />
                                    <InfoCard icon={<User />} label="User ID" value={user._id} isCode />
                                </div>

                                <div className="bg-slate-50 rounded-2xl p-6 border">
                                    <h3 className="font-semibold mb-4">User Summary</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        <StatCard label="Account Status" value="Active" />
                                        <StatCard label="Role Level" value={user.role} />
                                        <StatCard label="Assigned Projects" value={user.projectId ? 1 : 0} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Activity */}
                    {activeTab === 'activity' && (
                        <div className="space-y-4">
                            <ActivityItem action="Account Created" time={user.createdAt} />
                            <ActivityItem action="Profile Updated" time={user.updatedAt} />
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}

/* Reusable Components */
const ActionItem = ({ onClick, icon, label }) => (
    <button onClick={onClick} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50">
        {icon} {label}
    </button>
);

const InfoCard = ({ icon, label, value, isCode }) => (
    <div className="bg-slate-50 rounded-2xl p-4 border">
        <div className="flex items-center gap-3 mb-1">{icon}<span className="font-medium">{label}</span></div>
        {isCode ? <code className="font-mono text-sm">{value}</code> : <p className="font-semibold">{value}</p>}
    </div>
);

const StatCard = ({ label, value }) => (
    <div className="text-center p-4 bg-white rounded-xl border">
        <p className="text-2xl font-bold mb-1">{value}</p>
        <p className="text-sm text-slate-600">{label}</p>
    </div>
);

const ActivityItem = ({ action, time }) => (
    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border">
        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
        <div className="flex-1">
            <p className="font-medium">{action}</p>
            <p className="text-sm text-slate-500">{new Date(time).toLocaleString()}</p>
        </div>
    </div>
);

export default UserDetails;
