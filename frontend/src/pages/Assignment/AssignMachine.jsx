import { useState } from "react";
import {
    useAssignMachineMutation,
    useGetProjectsQuery,
    useGetAllMachinesQuery,
    useGetLabourQuery
} from "../../Reduxe/Api";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function AssignMachine() {
    // States for data and loading
    const { data: machinesData, isLoading: loadingMachines } = useGetAllMachinesQuery();
    const { data: projects, isLoading: loadingProjects } = useGetProjectsQuery();
    const { data: labourData, isLoading: loadingLabour } = useGetLabourQuery();

    const [assignMachine, { isLoading: isSubmitting }] = useAssignMachineMutation();


    const navigate = useNavigate()

    // Filter available machines (not currently assigned)
    const availableMachines = machinesData?.machines?.filter(machine =>
        machine.active && !machine.isAssigned
    ) || [];

    // Filter available operators
    const operators = labourData?.filter((item) =>
        item.category === "Operator" && item.isMachineAssigned === false
    ) || [];

    // Form state
    const [form, setForm] = useState({
        machineId: "",
        projectId: "",
        operatorId: "",
        notes: "",
        assignDate: new Date().toISOString().split('T')[0],
        expectedReleaseDate: ""
    });

    // Selected items for display
    const [selectedMachine, setSelectedMachine] = useState(null);
    const [selectedProject, setSelectedProject] = useState(null);
    const [selectedOperator, setSelectedOperator] = useState(null);

    console.log(availableMachines)

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));

        // Update selected items for preview
        if (name === "machineId") {
            const machine = availableMachines.find(m => m._id === value);

            setSelectedMachine(machine || null);
        }
        if (name === "projectId") {
            const project = projects?.find(p => p._id === value);
            setSelectedProject(project || null);
        }
        if (name === "operatorId") {
            const operator = operators?.find(o => o._id === value);
            setSelectedOperator(operator || null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!form.machineId || !form.projectId) {
            toast.error("Please select both machine and project");
            return;
        }

        try {
            await assignMachine(form).unwrap();
            toast.success("Machine Assigned Successfully!");
            navigate(-1)

            // Reset form
            setForm({
                machineId: "",
                projectId: "",
                operatorId: "",
                notes: "",
                assignDate: new Date().toISOString().split('T')[0],
                expectedReleaseDate: ""
            });
            setSelectedMachine(null);
            setSelectedProject(null);
            setSelectedOperator(null);

        } catch (error) {
            toast.error(error?.data?.message || "Failed to assign machine");
        }
    };

    if (loadingMachines || loadingProjects || loadingLabour) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading assignment data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-10">
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-2xl p-8 text-white shadow-lg">
                        <h1 className="text-3xl font-bold mb-3">Assign Machine to Project</h1>
                        <p className="text-indigo-100 text-lg">Assign heavy equipment to construction projects with operators</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Form */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                            <div className="p-8">
                                <h2 className="text-2xl font-bold text-gray-800 mb-6 pb-4 border-b">Assignment Details</h2>

                                <form onSubmit={handleSubmit}>
                                    <div className="space-y-6">
                                        {/* Machine Selection */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Select Machine <span className="text-red-500">*</span>
                                                <span className="ml-2 text-xs text-gray-500">
                                                    ({availableMachines.length} available)
                                                </span>
                                            </label>
                                            <select
                                                name="machineId"
                                                value={form.machineId}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                                                required
                                            >
                                                <option value="">Choose a machine...</option>
                                                {availableMachines.length === 0 ? (
                                                    <option disabled>No available machines</option>
                                                ) : (
                                                    availableMachines.map((m) => (
                                                        <option value={m._id} key={m._id}>
                                                            {m.machineNumber} — {m.machineType} ({m.ownedOrRented === 'owned' ? 'Owned' : 'Rented'})
                                                        </option>
                                                    ))
                                                )}
                                            </select>
                                        </div>

                                        {/* Project Selection */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Select Project <span className="text-red-500">*</span>
                                                <span className="ml-2 text-xs text-gray-500">
                                                    ({projects?.length || 0} projects)
                                                </span>
                                            </label>
                                            <select
                                                name="projectId"
                                                value={form.projectId}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                                                required
                                            >
                                                <option value="">Choose a project...</option>
                                                {projects?.map((p) => (
                                                    <option value={p._id} key={p._id}>
                                                        {p.projectName} — {p.city} ({p.status || 'Active'})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Operator Selection */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Select Operator (Optional)
                                                <span className="ml-2 text-xs text-gray-500">
                                                    ({operators.length} available)
                                                </span>
                                            </label>
                                            <select
                                                name="operatorId"
                                                value={form.operatorId}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                                            >
                                                <option value="">Choose an operator (optional)...</option>
                                                {operators.length === 0 ? (
                                                    <option disabled>No available operators</option>
                                                ) : (
                                                    operators.map((op) => (
                                                        <option value={op._id} key={op._id}>
                                                            {op.name} — {op.phone} ({op.experience || 'N/A'} years exp)
                                                        </option>
                                                    ))
                                                )}
                                            </select>
                                        </div>

                                        {/* Date Selection */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Assignment Date <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="date"
                                                    name="assignDate"
                                                    value={form.assignDate}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Expected Release Date (Optional)
                                                </label>
                                                <input
                                                    type="date"
                                                    name="expectedReleaseDate"
                                                    value={form.expectedReleaseDate}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                                                    min={form.assignDate}
                                                />
                                            </div>
                                        </div>

                                        {/* Notes */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Assignment Notes (Optional)
                                            </label>
                                            <textarea
                                                name="notes"
                                                rows="4"
                                                placeholder="Add any specific instructions, special requirements, or notes for this assignment..."
                                                value={form.notes}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 resize-none"
                                            />
                                        </div>

                                        {/* Submit Button */}
                                        <div className="pt-6 border-t border-gray-200">
                                            <button
                                                type="submit"
                                                disabled={isSubmitting || availableMachines.length === 0}
                                                className="w-full px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-lg hover:from-indigo-700 hover:to-purple-700 focus:ring-4 focus:ring-indigo-300 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                            >
                                                {isSubmitting ? (
                                                    <>
                                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                        </svg>
                                                        Assigning Machine...
                                                    </>
                                                ) : (
                                                    <>
                                                        <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                                        </svg>
                                                        Confirm Assignment
                                                    </>
                                                )}
                                            </button>

                                            <p className="text-center text-sm text-gray-500 mt-4">
                                                Fields marked with <span className="text-red-500">*</span> are required
                                            </p>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Preview */}
                    <div className="space-y-8">
                        {/* Machine Preview Card */}
                        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-100 p-6">
                                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                                    <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                                    </svg>
                                    Selected Machine
                                </h3>

                                {selectedMachine ? (
                                    <div className="space-y-4">
                                        <div className="flex items-start space-x-4">
                                            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                                <span className="text-white font-bold text-xl">
                                                    {selectedMachine.machineNumber.charAt(0)}
                                                </span>
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-900 text-lg">{selectedMachine.machineNumber}</h4>
                                                <p className="text-gray-600">{selectedMachine.machineType}</p>
                                                <div className="flex flex-wrap gap-2 mt-2">
                                                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                                                        {selectedMachine.ownedOrRented === 'owned' ? 'Owned' : 'Rented'}
                                                    </span>
                                                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                                                        Active
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Engine No:</span>
                                                <span className="font-medium">{selectedMachine.engineNumber}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Chassis No:</span>
                                                <span className="font-medium">{selectedMachine.chassisNumber}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Last Service:</span>
                                                <span className="font-medium">2 weeks ago</span>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                                            </svg>
                                        </div>
                                        <p className="text-gray-500">Select a machine to preview details</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Project Preview Card */}
                        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                            <div className="bg-gradient-to-r from-emerald-50 to-green-100 p-6">
                                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                                    <svg className="w-5 h-5 mr-2 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                                    </svg>
                                    Selected Project
                                </h3>

                                {selectedProject ? (
                                    <div className="space-y-4">
                                        <div>
                                            <h4 className="font-bold text-gray-900 text-lg">{selectedProject.projectName}</h4>
                                            <p className="text-gray-600">{selectedProject.city}, {selectedProject.state || 'India'}</p>
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                <span className="px-2 py-1 bg-emerald-100 text-emerald-800 rounded text-xs font-medium">
                                                    {selectedProject.status || 'Active'}
                                                </span>
                                                <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs font-medium">
                                                    {selectedProject.type || 'Construction'}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Start Date:</span>
                                                <span className="font-medium">
                                                    {selectedProject.startDate ? new Date(selectedProject.startDate).toLocaleDateString() : 'N/A'}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">End Date:</span>
                                                <span className="font-medium">
                                                    {selectedProject.endDate ? new Date(selectedProject.endDate).toLocaleDateString() : 'Ongoing'}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Client:</span>
                                                <span className="font-medium">{selectedProject.clientName || 'N/A'}</span>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                                            </svg>
                                        </div>
                                        <p className="text-gray-500">Select a project to preview details</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Operator Preview Card */}
                        {selectedOperator && (
                            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                                <div className="bg-gradient-to-r from-amber-50 to-orange-100 p-6">
                                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                                        <svg className="w-5 h-5 mr-2 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                                        </svg>
                                        Selected Operator
                                    </h3>

                                    <div className="space-y-4">
                                        <div className="flex items-start space-x-4">
                                            <div className="w-16 h-16 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full flex items-center justify-center flex-shrink-0">
                                                <span className="text-white font-bold text-xl">
                                                    {selectedOperator.name.charAt(0)}
                                                </span>
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-900 text-lg">{selectedOperator.name}</h4>
                                                <p className="text-gray-600">Operator • {selectedOperator.experience || '0'} years exp</p>
                                                <div className="flex flex-wrap gap-2 mt-2">
                                                    <span className="px-2 py-1 bg-amber-100 text-amber-800 rounded text-xs font-medium">
                                                        Available
                                                    </span>
                                                    {selectedOperator.licenseNumber && (
                                                        <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs font-medium">
                                                            Licensed
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Contact:</span>
                                                <span className="font-medium">{selectedOperator.phone}</span>
                                            </div>
                                            {selectedOperator.licenseNumber && (
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500">License:</span>
                                                    <span className="font-medium">{selectedOperator.licenseNumber}</span>
                                                </div>
                                            )}
                                            {selectedOperator.address && (
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500">Location:</span>
                                                    <span className="font-medium truncate">{selectedOperator.address}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Info Card */}
                        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-xl p-6">
                            <div className="flex items-start">
                                <svg className="w-6 h-6 text-indigo-600 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                                <div>
                                    <h4 className="font-semibold text-indigo-800 mb-2">Assignment Guidelines</h4>
                                    <ul className="text-indigo-700 text-sm space-y-1">
                                        <li>• Machines must be in active and good condition</li>
                                        <li>• Verify operator qualifications match machine type</li>
                                        <li>• Set realistic expected release dates</li>
                                        <li>• Include clear notes for site supervisors</li>
                                        <li>• Update maintenance schedule after assignment</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}