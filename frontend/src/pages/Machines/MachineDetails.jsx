import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
    useGetMachineDetailsQuery,
    useReleaseMachineMutation
} from "../../Reduxe/Api";
import toast from "react-hot-toast";

export default function MachineDetails() {
    const { id } = useParams();
    const { data, isLoading, refetch } = useGetMachineDetailsQuery(id);
    const [releaseMachine, { isLoading: isReleasing }] = useReleaseMachineMutation();
    const [activeTab, setActiveTab] = useState("overview");

    const handleRelease = async () => {
        if (window.confirm("Are you sure you want to release this machine?")) {
            try {
                await releaseMachine({ machineId: id }).unwrap();
                toast.success("Machine Released Successfully!");
                refetch();
            } catch (error) {
                toast.error("Failed to release machine");
            }
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading machine details...</p>
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-red-500 text-6xl mb-4">⚠️</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Machine Not Found</h2>
                    <p className="text-gray-600">The machine you're looking for doesn't exist.</p>
                    <Link to="/machines" className="mt-4 inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        Back to Machines
                    </Link>
                </div>
            </div>
        );
    }

    const { machine, maintenance, assignments, usage, totalMaintenanceCost } = data;
    const currentAssignment = assignments?.find(a => !a.releaseDate);
    const isCurrentlyAssigned = !!currentAssignment;

    // Format date
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    // Calculate machine age
    const machineAge = Math.floor((new Date() - new Date(machine.createdAt)) / (1000 * 60 * 60 * 24 * 30));

    return (
        <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                    <div>
                        <div className="flex items-center space-x-2 mb-2">
                            <Link to="/machine/list" className="text-blue-600 hover:text-blue-800">
                                ← Back to Machines
                            </Link>
                            <span className="text-gray-400">/</span>
                            <span className="text-gray-600">Machine Details</span>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-xl">J</span>
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">{machine.machineNumber}</h1>
                                <div className="flex items-center space-x-4 mt-1">
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${machine.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {machine.active ? 'Active' : 'Inactive'}
                                    </span>
                                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                                        {machine.ownedOrRented === 'owned' ? 'Owned' : 'Rented'}
                                    </span>
                                    <span className="text-gray-500 text-sm">
                                        Added {formatDate(machine.createdAt)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex space-x-3 mt-4 sm:mt-0">
                        <Link
                            to={`/machine/${id}/maintenance/add`}
                            className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 font-medium flex items-center"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                            </svg>
                            Add Maintenance
                        </Link>

                        <button
                            onClick={handleRelease}
                            disabled={!isCurrentlyAssigned || isReleasing}
                            className={`px-4 py-2 rounded-lg font-medium flex items-center ${isCurrentlyAssigned
                                ? 'bg-gradient-to-r from-red-500 to-rose-600 text-white hover:from-red-600 hover:to-rose-700'
                                : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
                        >
                            {isReleasing ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Releasing...
                                </>
                            ) : (
                                <>
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path>
                                    </svg>
                                    Release Machine
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm font-medium">Maintenance Cost</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">₹{totalMaintenanceCost || 0}</p>
                            </div>
                            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm font-medium">Maintenance Records</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{maintenance?.length || 0}</p>
                            </div>
                            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm font-medium">Assignments</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{assignments?.length || 0}</p>
                            </div>
                            <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm font-medium">Status</p>
                                <p className={`text-lg font-bold mt-1 ${isCurrentlyAssigned ? 'text-amber-600' : 'text-green-600'}`}>
                                    {isCurrentlyAssigned ? 'Assigned to Project' : 'Available'}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-amber-50 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="mb-8">
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex space-x-8">
                            {["overview", "maintenance", "assignments", "usage"].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${activeTab === tab
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </nav>
                    </div>
                </div>

                {/* Tab Content */}
                <div className="bg-white rounded-xl shadow overflow-hidden">
                    {/* Overview Tab */}
                    {activeTab === "overview" && (
                        <div className="p-8">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Machine Details */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Machine Information</h3>
                                    <div className="space-y-4">
                                        {[
                                            { label: "Machine Number", value: machine.machineNumber },
                                            { label: "Engine Number", value: machine.engineNumber },
                                            { label: "Chassis Number", value: machine.chassisNumber },
                                            { label: "Machine Type", value: machine.machineType },
                                            { label: "Ownership", value: machine.ownedOrRented === 'owned' ? 'Company Owned' : 'Rented' },
                                            { label: "Active Status", value: machine.active ? 'Active' : 'Inactive' },
                                            { label: "Created On", value: formatDate(machine.createdAt) },
                                            { label: "Last Updated", value: formatDate(machine.updatedAt) },
                                        ].map((item, index) => (
                                            <div key={index} className="flex border-b border-gray-100 py-3">
                                                <span className="text-gray-600 w-40">{item.label}</span>
                                                <span className="font-medium text-gray-900">{item.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Current Assignment */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Assignment</h3>
                                    {currentAssignment ? (
                                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
                                            <div className="flex items-start justify-between mb-4">
                                                <div>
                                                    <h4 className="font-bold text-gray-900 text-lg">Assigned to Project</h4>
                                                    <p className="text-gray-600 text-sm">Since {formatDate(currentAssignment.assignDate)}</p>
                                                </div>
                                                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                                                    Active
                                                </span>
                                            </div>

                                            <div className="space-y-3">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Operator ID:</span>
                                                    <span className="font-medium">{currentAssignment.operatorId}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Project ID:</span>
                                                    <span className="font-medium">{currentAssignment.projectId}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Notes:</span>
                                                    <span className="font-medium">{currentAssignment.notes || 'No notes'}</span>
                                                </div>
                                            </div>

                                            <button
                                                onClick={handleRelease}
                                                disabled={isReleasing}
                                                className="mt-6 w-full px-4 py-2 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-lg hover:from-red-600 hover:to-rose-700 font-medium"
                                            >
                                                {isReleasing ? 'Releasing...' : 'Release from Project'}
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="bg-gray-50 rounded-xl p-6 text-center">
                                            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                                                </svg>
                                            </div>
                                            <h4 className="font-semibold text-gray-700 mb-2">No Active Assignment</h4>
                                            <p className="text-gray-500 text-sm">This machine is currently available for assignment</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Maintenance Tab */}
                    {activeTab === "maintenance" && (
                        <div className="p-8">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-semibold text-gray-900">Maintenance History</h3>
                                <Link
                                    to={`/machine/${id}/maintenance/add`}
                                    className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 font-medium flex items-center"
                                >
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                                    </svg>
                                    New Maintenance
                                </Link>
                            </div>

                            {maintenance?.length > 0 ? (
                                <div className="space-y-4">
                                    {maintenance.map((item) => (
                                        <div key={item._id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h4 className="font-bold text-gray-900">{item.serviceType}</h4>
                                                    <p className="text-gray-600 text-sm">{formatDate(item.serviceDate)}</p>
                                                </div>
                                                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                                                    ₹{item.cost}
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 mb-4">
                                                <div>
                                                    <p className="text-gray-500 text-sm">Vendor</p>
                                                    <p className="font-medium">{item.vendorName}</p>
                                                </div>
                                                {item.nextServiceDate && (
                                                    <div>
                                                        <p className="text-gray-500 text-sm">Next Service</p>
                                                        <p className="font-medium">{formatDate(item.nextServiceDate)}</p>
                                                    </div>
                                                )}
                                            </div>

                                            {item.notes && (
                                                <div className="bg-gray-50 rounded-lg p-4">
                                                    <p className="text-gray-700 text-sm">{item.notes}</p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                        </svg>
                                    </div>
                                    <h4 className="font-semibold text-gray-700 mb-2">No Maintenance Records</h4>
                                    <p className="text-gray-500 mb-6">No maintenance has been recorded for this machine yet.</p>
                                    <Link
                                        to={`/machine/${id}/maintenance/add`}
                                        className="inline-block px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 font-medium"
                                    >
                                        Add First Maintenance
                                    </Link>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Assignments Tab */}
                    {activeTab === "assignments" && (
                        <div className="p-8">
                            <h3 className="text-lg font-semibold text-gray-900 mb-6">Assignment History</h3>

                            {assignments?.length > 0 ? (
                                <div className="space-y-4">
                                    {assignments.map((assignment) => (
                                        <div key={assignment._id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <div className="flex items-center space-x-2 mb-2">
                                                        <h4 className="font-bold text-gray-900">
                                                            {assignment.projectId ? `Project ${assignment.projectId}` : 'Project Assignment'}
                                                        </h4>
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${assignment.releaseDate
                                                            ? 'bg-gray-100 text-gray-800'
                                                            : 'bg-green-100 text-green-800'}`}>
                                                            {assignment.releaseDate ? 'Completed' : 'Active'}
                                                        </span>
                                                    </div>
                                                    <p className="text-gray-600 text-sm">
                                                        Assigned on {formatDate(assignment.assignDate)}
                                                        {assignment.releaseDate && ` • Released on ${formatDate(assignment.releaseDate)}`}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                                <div>
                                                    <p className="text-gray-500 text-sm">Operator ID</p>
                                                    <p className="font-medium">{assignment.operatorId}</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-500 text-sm">Assigned By</p>
                                                    <p className="font-medium">{assignment.assignedBy || 'System'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-500 text-sm">Duration</p>
                                                    <p className="font-medium">
                                                        {assignment.releaseDate
                                                            ? `${Math.ceil((new Date(assignment.releaseDate) - new Date(assignment.assignDate)) / (1000 * 60 * 60 * 24))} days`
                                                            : 'Ongoing'}
                                                    </p>
                                                </div>
                                            </div>

                                            {assignment.notes && (
                                                <div className="bg-gray-50 rounded-lg p-4">
                                                    <p className="text-gray-700 text-sm">{assignment.notes}</p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                                        </svg>
                                    </div>
                                    <h4 className="font-semibold text-gray-700 mb-2">No Assignment History</h4>
                                    <p className="text-gray-500">This machine has not been assigned to any projects yet.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Usage Tab */}
                    {activeTab === "usage" && (
                        <div className="p-8">
                            <h3 className="text-lg font-semibold text-gray-900 mb-6">Usage History</h3>

                            {usage?.length > 0 ? (
                                <div className="space-y-4">
                                    {usage.map((usageItem) => (
                                        <div key={usageItem._id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                                            {/* Add usage details here based on your usage data structure */}
                                            <p>Usage data would be displayed here</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                                        </svg>
                                    </div>
                                    <h4 className="font-semibold text-gray-700 mb-2">No Usage Data</h4>
                                    <p className="text-gray-500">Usage tracking has not been enabled for this machine.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}