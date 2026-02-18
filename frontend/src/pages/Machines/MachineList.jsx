import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useGetAllMachinesQuery } from "../../Reduxe/Api";

export default function MachineList() {
    const [machines, setMachines] = useState([]);
    const { data, isSuccess } = useGetAllMachinesQuery();
    const navigate = useNavigate();

    useEffect(() => {
        if (isSuccess) {
            setMachines(data?.machines || []);
        }
    }, [isSuccess, data]);

    // Helper function to get machine display name
    const getMachineName = (machine) => {
        return machine.machineNumber || machine.name || "Unnamed Machine";
    };

    // Helper function to get machine type
    const getMachineType = (machine) => {
        return machine.machineType || "Unknown Type";
    };

    // Helper function to get engine number
    const getEngineNumber = (machine) => {
        return machine.engineNumber || "N/A";
    };

    // Helper function to get chassis number
    const getChassisNumber = (machine) => {
        return machine.chassisNumber || "N/A";
    };

    // Helper function to get RC expiry
    const getRCExpiry = (machine) => {
        if (machine.rcExpiry) {
            return new Date(machine.rcExpiry).toLocaleDateString();
        }
        return "N/A";
    };

    // Helper function to get insurance expiry
    const getInsuranceExpiry = (machine) => {
        if (machine.insuranceExpiry) {
            return new Date(machine.insuranceExpiry).toLocaleDateString();
        }
        return "N/A";
    };

    // Helper function to get ownership status
    const getOwnership = (machine) => {
        return machine.ownedOrRented || machine.ownership || "Unknown";
    };

    // Helper function to check if expiry dates are near (within 30 days)
    const isExpiryNear = (dateString) => {
        if (!dateString) return false;
        const expiryDate = new Date(dateString);
        const today = new Date();
        const diffTime = expiryDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 30 && diffDays > 0;
    };

    // Helper function to check if expiry date is past
    const isExpiryPast = (dateString) => {
        if (!dateString) return false;
        const expiryDate = new Date(dateString);
        const today = new Date();
        return expiryDate < today;
    };

    return (
        <div className="p-5">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Machine List</h2>
                <div className="flex gap-3">
                    <button
                        onClick={() => navigate('/assign')}
                        className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition duration-200"
                    >
                        Assign Machine
                    </button>
                    <button
                        onClick={() => navigate('/machine/add')}
                        className="py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg transition duration-200"
                    >
                        Add Machine
                    </button>
                </div>
            </div>

            {isSuccess && machines.length === 0 ? (
                <div className="text-center py-10">
                    <p className="text-gray-500 text-lg">No machines found</p>
                    <button
                        onClick={() => navigate('/machine/add')}
                        className="mt-4 py-2 px-4 bg-blue-600 text-white rounded-lg"
                    >
                        Add Your First Machine
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {machines.map(machine => {
                        const rcExpiryNear = isExpiryNear(machine.rcExpiry);
                        const rcExpiryPast = isExpiryPast(machine.rcExpiry);
                        const insuranceExpiryNear = isExpiryNear(machine.insuranceExpiry);
                        const insuranceExpiryPast = isExpiryPast(machine.insuranceExpiry);

                        return (
                            <Link
                                to={`/machine/${machine._id}`}
                                key={machine._id}
                                className="block p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-200 border border-gray-100"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-bold text-xl text-gray-800">
                                            {getMachineName(machine)}
                                        </h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${machine.active
                                                ? "bg-green-100 text-green-800"
                                                : "bg-red-100 text-red-800"
                                                }`}>
                                                {machine.active ? "Active" : "Inactive"}
                                            </span>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getOwnership(machine) === 'owned'
                                                ? "bg-blue-100 text-blue-800"
                                                : "bg-purple-100 text-purple-800"
                                                }`}>
                                                {getOwnership(machine)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex gap-6 items-center">
                                        <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-sm">
                                            {getMachineType(machine)}
                                        </span>
                                        {machine?.isAssigned &&
                                            <button className={`px-4 py-2 rounded-lg font-medium flex items-center 
                                                 bg-gradient-to-r from-red-500 to-rose-600 text-white hover:from-red-600 hover:to-rose-700
                                                `}  >
                                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path>
                                                </svg>
                                                All Ready Assign

                                            </button>
                                        }
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Engine No:</span>
                                        <span className="font-medium">{getEngineNumber(machine)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Chassis No:</span>
                                        <span className="font-medium">{getChassisNumber(machine)}</span>
                                    </div>

                                    {(machine.rcExpiry || machine.insuranceExpiry) && (
                                        <div className="pt-3 border-t border-gray-100">
                                            <h4 className="font-semibold text-gray-700 mb-2">Document Expiry</h4>
                                            {machine.rcExpiry && (
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-gray-600">RC Expiry:</span>
                                                    <span className={`font-medium ${rcExpiryPast
                                                        ? "text-red-600"
                                                        : rcExpiryNear
                                                            ? "text-yellow-600"
                                                            : "text-green-600"
                                                        }`}>
                                                        {getRCExpiry(machine)}
                                                        {(rcExpiryNear || rcExpiryPast) && (
                                                            <span className="ml-2 text-xs">
                                                                {rcExpiryPast ? "⚠️ Expired" : "⚠️ Expiring soon"}
                                                            </span>
                                                        )}
                                                    </span>
                                                </div>
                                            )}
                                            {machine.insuranceExpiry && (
                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-600">Insurance Expiry:</span>
                                                    <span className={`font-medium ${insuranceExpiryPast
                                                        ? "text-red-600"
                                                        : insuranceExpiryNear
                                                            ? "text-yellow-600"
                                                            : "text-green-600"
                                                        }`}>
                                                        {getInsuranceExpiry(machine)}
                                                        {(insuranceExpiryNear || insuranceExpiryPast) && (
                                                            <span className="ml-2 text-xs">
                                                                {insuranceExpiryPast ? "⚠️ Expired" : "⚠️ Expiring soon"}
                                                            </span>
                                                        )}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {machine.currentProjectId && (
                                        <div className="pt-3 border-t border-gray-100">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Current Project:</span>
                                                <span className="font-medium text-blue-600">Assigned</span>
                                            </div>
                                        </div>
                                    )}

                                    {machine.createdAt && (
                                        <div className="pt-3 border-t border-gray-100">
                                            <div className="flex justify-between text-sm text-gray-500">
                                                <span>Added on:</span>
                                                <span>{new Date(machine.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-6 pt-4 border-t border-gray-100">
                                    <span className="text-blue-600 font-medium hover:text-blue-800 transition-colors">
                                        View Details →
                                    </span>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}