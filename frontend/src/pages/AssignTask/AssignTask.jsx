import React, { useState, useEffect } from "react";
import {
    useAssignTaskMutation,
    useAssignProjectQuery,
    useGetProjectsQuery,
    useGetRolesQuery,
} from "../../Reduxe/Api";
import {
    FiPlus,
    FiArrowLeft,
    FiCalendar,
    FiUser,
    FiFolder,
    FiFlag,
    FiType,
    FiFileText,
    FiCheck,
    FiAlertCircle
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { CheckRole } from "../../helper/CheckRole";

export default function AssignTask() {

    const [assignTask, { isLoading }] = useAssignTaskMutation();
    const { data: projects } = useAssignProjectQuery();
    const { data: allProjects } = useGetProjectsQuery(); // Renamed for clarity
    const { data: users } = useGetRolesQuery();

    const { role } = CheckRole();
    const navigate = useNavigate();

    // Determine which project data to use based on role
    const projectData = allProjects

    const [form, setForm] = useState({
        title: "",
        description: "",
        projectId: "",
        assignedTo: "",
        deadline: "",
        priority: "Medium",
    });

    const [errors, setErrors] = useState({});
    const [selectedProject, setSelectedProject] = useState(null);

    // Debug: Log project data when it changes
    useEffect(() => {
        console.log("All Projects Data:", allProjects);
        console.log("Projects Data:", projects);
        console.log("Project Data based on role:", projectData);
    }, [allProjects, projects, projectData]);

    // Handle project selection change
    const handleProjectChange = (selectedProjectId) => {
        setForm(prev => ({ ...prev, projectId: selectedProjectId }));

        // Find the selected project
        const foundProject = projectData?.find(p => p._id === selectedProjectId);
        setSelectedProject(foundProject);

        console.log("Selected Project:", foundProject);
        console.log("Supervisors:", foundProject?.supervisors);

        // Auto-select supervisor if available
        if (foundProject?.supervisors && foundProject.supervisors.length > 0) {
            // Check supervisor structure
            const supervisor = foundProject.supervisors[0];

            // Handle different supervisor object structures
            let supervisorId;
            if (typeof supervisor === 'object' && supervisor !== null) {
                supervisorId = supervisor._id || supervisor.id || supervisor.userId;
            } else if (typeof supervisor === 'string') {
                supervisorId = supervisor;
            }

            console.log("Selected Supervisor ID:", supervisorId);

            if (supervisorId) {
                setForm(prev => ({
                    ...prev,
                    assignedTo: supervisorId
                }));
                toast.success(`Auto-assigned to supervisor: ${supervisor.name || 'Supervisor'}`);
            }
        } else {
            // Clear assignedTo if no supervisors
            setForm(prev => ({ ...prev, assignedTo: "" }));
            // toast.warning("No supervisors available for this project");
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!form.title.trim()) newErrors.title = "Title is required";
        if (!form.projectId) newErrors.projectId = "Project is required";
        if (!form.assignedTo) newErrors.assignedTo = "Assignee is required";
        if (!form.deadline) newErrors.deadline = "Deadline is required";

        if (form.deadline) {
            const selectedDate = new Date(form.deadline);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (selectedDate < today) {
                newErrors.deadline = "Deadline cannot be in the past";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error("Please fix the errors before submitting");
            return;
        }

        try {
            await assignTask(form).unwrap();
            toast.success("🎉 Task Assigned Successfully!");
            navigate(-1);
        } catch (error) {
            console.error("Assignment Error:", error);
            toast.error("❌ Failed to assign task. Please try again.");
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case "High": return "text-red-600 bg-red-50 border-red-200";
            case "Medium": return "text-orange-600 bg-orange-50 border-orange-200";
            case "Low": return "text-green-600 bg-green-50 border-green-200";
            default: return "text-gray-600 bg-gray-50 border-gray-200";
        }
    };

    const getDaysUntilDeadline = () => {
        if (!form.deadline) return null;
        const deadline = new Date(form.deadline);
        const today = new Date();
        const diffTime = deadline - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    // Get supervisor name for display
    const getSupervisorName = () => {
        if (!selectedProject?.supervisors?.length) return "No supervisor assigned";

        const supervisor = selectedProject.supervisors[0];
        if (typeof supervisor === 'object') {
            return supervisor.name || supervisor.email || "Supervisor";
        }
        return "Supervisor";
    };

    // Get user name for display
    const getUserName = (userId) => {
        const user = users?.find(u => u._id === userId);
        return user ? `${user.name} • ${user.role}` : "Unknown User";
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
            <div className="max-w-2xl mx-auto">

                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4 transition-colors"
                    >
                        <FiArrowLeft size={20} />
                        <span className="font-medium">Back</span>
                    </button>

                    <div className="text-center">
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-700 via-blue-700 to-cyan-700 bg-clip-text text-transparent mb-3">
                            🚀 Assign New Task
                        </h1>
                        <p className="text-gray-600 text-lg">
                            Create and assign tasks to your team members
                        </p>
                    </div>
                </div>

                {/* Debug Info - Remove in production */}
                {/* {process.env.NODE_ENV === 'development' && (
                    <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center gap-2 text-yellow-800 mb-2">
                            <FiAlertCircle />
                            <span className="font-semibold">Debug Info:</span>
                        </div>
                        <div className="text-sm">
                            <p>Selected Project ID: {form.projectId || "None"}</p>
                            <p>Selected Supervisor ID: {form.assignedTo || "None"}</p>
                            <p>Project Data Length: {projectData?.length || 0}</p>
                        </div>
                    </div>
                )} */}

                {/* Form Card */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
                        <h2 className="text-white text-xl font-semibold flex items-center gap-3">
                            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                                <FiPlus className="text-white" />
                            </div>
                            Task Details
                        </h2>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-6">

                        {/* Project Selection */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                <FiFolder className="text-blue-500" />
                                Project *
                            </label>
                            <div className="relative">
                                <select
                                    value={form.projectId}
                                    onChange={(e) => handleProjectChange(e.target.value)}
                                    className={`w-full p-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none bg-white ${errors.projectId ? 'border-red-500' : 'border-gray-200'}`}
                                >
                                    <option value="">Select a project</option>
                                    {projectData?.map((p) => (
                                        <option key={p._id} value={p._id}>
                                            {p.projectName} • {p.projectCode || "No Code"}
                                        </option>
                                    ))}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                                    <FiFolder />
                                </div>
                            </div>
                            {errors.projectId && (
                                <p className="text-red-500 text-sm flex items-center gap-1">
                                    ⚠️ {errors.projectId}
                                </p>
                            )}
                        </div>

                        {/* Project Supervisor Info */}
                        {selectedProject && (
                            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-semibold text-blue-800">{selectedProject.projectName}</h4>
                                        <div className="text-sm text-blue-600 mt-1">
                                            <p>Supervisor: {getSupervisorName()}</p>
                                            <p>Location: {selectedProject.siteLocation || selectedProject.city || "N/A"}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm text-gray-600">Client</div>
                                        <div className="font-medium">{selectedProject.clientName}</div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Assignee Selection */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                    <FiUser className="text-green-500" />
                                    Assign To *
                                </label>
                                {form.assignedTo && (
                                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                        Auto-assigned from project
                                    </span>
                                )}
                            </div>

                            <div className="relative">
                                <select
                                    value={form.assignedTo}
                                    onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}
                                    className={`w-full p-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none bg-white ${errors.assignedTo ? 'border-red-500' : 'border-gray-200'}`}
                                >
                                    <option value="">Select team member</option>

                                    {/* Always show the auto-selected supervisor first */}
                                    {form.assignedTo && selectedProject?.supervisors?.[0] && (
                                        <optgroup label="Project Supervisor">
                                            <option value={form.assignedTo}>
                                                {getUserName(form.assignedTo)} (Auto)
                                            </option>
                                        </optgroup>
                                    )}

                                    <optgroup label="All Team Members">
                                        {users?.map((u) => (
                                            <option key={u._id} value={u._id}>
                                                {u.name} • {u.role}
                                            </option>
                                        ))}
                                    </optgroup>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                                    <FiUser />
                                </div>
                            </div>

                            {errors.assignedTo && (
                                <p className="text-red-500 text-sm flex items-center gap-1">
                                    ⚠️ {errors.assignedTo}
                                </p>
                            )}

                            {/* Current Selection Info */}
                            {form.assignedTo && (
                                <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                                    <div className="text-sm text-gray-700">
                                        <span className="font-medium">Selected: </span>
                                        {getUserName(form.assignedTo)}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Rest of the form remains the same */}
                        {/* Task Title */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                <FiType className="text-purple-500" />
                                Task Title *
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Enter task title..."
                                    value={form.title}
                                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                                    className={`w-full p-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${errors.title ? 'border-red-500' : 'border-gray-200'}`}
                                />
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                                    <FiType />
                                </div>
                            </div>
                            {errors.title && (
                                <p className="text-red-500 text-sm flex items-center gap-1">
                                    ⚠️ {errors.title}
                                </p>
                            )}
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                <FiFileText className="text-amber-500" />
                                Description
                            </label>
                            <div className="relative">
                                <textarea
                                    placeholder="Describe the task..."
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    rows="4"
                                    className="w-full p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                                />
                                <div className="pointer-events-none absolute top-4 right-3 text-gray-400">
                                    <FiFileText />
                                </div>
                            </div>
                        </div>

                        {/* Priority and Deadline */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            {/* Priority */}
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                    <FiFlag className="text-red-500" />
                                    Priority
                                </label>
                                <div className="relative">
                                    <select
                                        value={form.priority}
                                        onChange={(e) => setForm({ ...form, priority: e.target.value })}
                                        className="w-full p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none bg-white"
                                    >
                                        <option value="Low">Low Priority</option>
                                        <option value="Medium">Medium Priority</option>
                                        <option value="High">High Priority</option>
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                                        <FiFlag />
                                    </div>
                                </div>
                                <div className={`mt-2 px-3 py-2 rounded-lg border text-sm font-medium text-center ${getPriorityColor(form.priority)}`}>
                                    {form.priority} Priority
                                </div>
                            </div>

                            {/* Deadline */}
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                    <FiCalendar className="text-cyan-500" />
                                    Deadline *
                                </label>
                                <div className="relative">
                                    <input
                                        type="date"
                                        value={form.deadline}
                                        onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                                        className={`w-full p-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${errors.deadline ? 'border-red-500' : 'border-gray-200'}`}
                                    />
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                                        <FiCalendar />
                                    </div>
                                </div>
                                {errors.deadline && (
                                    <p className="text-red-500 text-sm flex items-center gap-1">
                                        ⚠️ {errors.deadline}
                                    </p>
                                )}
                                {form.deadline && !errors.deadline && (
                                    <div className="mt-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700 text-center">
                                        {getDaysUntilDeadline() >= 0
                                            ? `⏰ ${getDaysUntilDeadline()} days remaining`
                                            : '⚠️ Deadline is in the past'}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-6">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-3"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                        Assigning Task...
                                    </>
                                ) : (
                                    <>
                                        <FiCheck size={20} />
                                        Assign Task
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Quick Stats */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
                        <div className="text-2xl font-bold text-blue-600">{projectData?.length || 0}</div>
                        <div className="text-sm text-gray-600">Active Projects</div>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
                        <div className="text-2xl font-bold text-green-600">{users?.length || 0}</div>
                        <div className="text-sm text-gray-600">Team Members</div>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
                        <div className="text-2xl font-bold text-purple-600">
                            {form.deadline ? new Date(form.deadline).toLocaleDateString() : '--'}
                        </div>
                        <div className="text-sm text-gray-600">Selected Deadline</div>
                    </div>
                </div>
            </div>
        </div>
    );
}