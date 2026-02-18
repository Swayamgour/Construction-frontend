import React, { useState, useEffect } from "react";
import {
    useGetProjectsQuery,
    useCreateTaskMutation,
    useGetProjectTasksQuery,
} from "../../Reduxe/Api";
import Select from "react-select";
import { useNavigate } from "react-router-dom";
import {
    Calendar,
    Target,
    ClipboardCheck,
    PlayCircle,
    CheckCircle,
    AlertTriangle,
    PauseCircle,
    Plus,
    X,
    ChevronDown,
    ChevronUp
} from "lucide-react";

function TaskFrom() {
    const [createTask] = useCreateTaskMutation();
    const { data: projectList } = useGetProjectsQuery();
    const [selectedProjectId, setSelectedProjectId] = useState(null);
    const [expandedSection, setExpandedSection] = useState("basic");

    const {
        data: taskData,
    } = useGetProjectTasksQuery(selectedProjectId, {
        skip: !selectedProjectId,
    });

    const [newTask, setNewTask] = useState({
        name: "",
        startDate: "",
        endDate: "",
        progress: 0,
        status: "planned",
        dependencies: [],
        description: "",
        priority: "medium"
    });

    const navigate = useNavigate();

    const statusOptions = [
        { value: "planned", label: "Planned", icon: <Target size={16} />, color: "bg-blue-100 text-blue-800" },
        { value: "in-progress", label: "In Progress", icon: <PlayCircle size={16} />, color: "bg-yellow-100 text-yellow-800" },
        { value: "completed", label: "Completed", icon: <CheckCircle size={16} />, color: "bg-green-100 text-green-800" },
        { value: "delayed", label: "Delayed", icon: <AlertTriangle size={16} />, color: "bg-red-100 text-red-800" },
        { value: "on-hold", label: "On Hold", icon: <PauseCircle size={16} />, color: "bg-gray-100 text-gray-800" },
    ];

    const priorityOptions = [
        { value: "low", label: "Low", color: "bg-gray-100 text-gray-800" },
        { value: "medium", label: "Medium", color: "bg-blue-100 text-blue-800" },
        { value: "high", label: "High", color: "bg-orange-100 text-orange-800" },
        { value: "critical", label: "Critical", color: "bg-red-100 text-red-800" },
    ];

    const handleAddTask = async () => {
        if (!selectedProjectId) {
            alert("Please select a project first!");
            return;
        }
        if (!newTask.name || !newTask.startDate || !newTask.endDate) {
            alert("Please fill in all required fields!");
            return;
        }

        try {
            await createTask({
                projectId: selectedProjectId,
                body: newTask,
            });

            setNewTask({
                name: "",
                startDate: "",
                endDate: "",
                status: "planned",
                progress: 0,
                dependencies: [],
                description: "",
                priority: "medium"
            });

            navigate(`/GanttChart/${selectedProjectId}`);

        } catch (err) {
            console.log(err);
            alert("Failed to create task. Please try again.");
        }
    };

    const handleSectionToggle = (section) => {
        setExpandedSection(expandedSection === section ? null : section);
    };

    const customSelectStyles = {
        control: (base) => ({
            ...base,
            borderRadius: '0.5rem',
            borderColor: '#d1d5db',
            padding: '0.2rem',
            boxShadow: 'none',
            '&:hover': {
                borderColor: '#9ca3af'
            }
        }),
        option: (base, state) => ({
            ...base,
            backgroundColor: state.isSelected ? '#3b82f6' : state.isFocused ? '#eff6ff' : 'white',
            color: state.isSelected ? 'white' : '#1f2937',
            padding: '0.5rem 1rem',
        }),
    };

    return (
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-md">
                        <ClipboardCheck size={28} className="text-white" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-gray-800">Add New Construction Task</h3>
                        <p className="text-gray-600">Create and schedule tasks for your project</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-500">
                    {/* <button >View Gantt Chart </button> */}

                    {selectedProjectId &&
                        <button onClick={() => navigate(`/GanttChart/${selectedProjectId}`)} className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 
                             text-white font-medium rounded-lg shadow-md hover:shadow-lg 
                             transition-all duration-200 hover:brightness-110 mr-4"
                        >
                            View Gantt Chart
                        </button>
                    }

                    <div className={`px-3 py-1 rounded-full ${!selectedProjectId ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'}`}>
                        {!selectedProjectId ? 'Project Required' : 'Ready to Create'}
                    </div>
                </div>
            </div>

            {/* Project Selection Card */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 mb-8 border border-blue-100">
                <div className="flex items-center gap-3 mb-4">
                    <Target className="text-blue-600" size={20} />
                    <h4 className="text-lg font-semibold text-gray-800">Project Selection</h4>
                </div>
                <p className="text-gray-600 mb-4 text-sm">Select a project to start adding tasks. All tasks will be associated with this project.</p>

                <Select
                    styles={customSelectStyles}
                    options={
                        projectList?.map((p) => ({
                            value: p._id,
                            label: p.projectName,
                            subLabel: p.location || p.clientName || ""
                        })) || []
                    }
                    formatOptionLabel={({ label, subLabel }) => (
                        <div className="flex flex-col">
                            <span className="font-medium">{label}</span>
                            {subLabel && <span className="text-xs text-gray-500">{subLabel}</span>}
                        </div>
                    )}
                    onChange={(val) => {
                        setSelectedProjectId(val.value);
                        setNewTask({
                            name: "",
                            startDate: "",
                            endDate: "",
                            progress: 0,
                            status: "planned",
                            dependencies: [],
                            description: "",
                            priority: "medium"
                        });
                    }}
                    placeholder={
                        <div className="flex items-center gap-2 text-gray-500">
                            <Target size={16} />
                            <span>Select a project...</span>
                        </div>
                    }
                    className="react-select-container"
                    classNamePrefix="react-select"
                />

                {selectedProjectId && (
                    <div className="mt-4 p-3 bg-white rounded-lg border border-blue-200">
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                            <CheckCircle size={16} className="text-green-500" />
                            <span>Project selected. You can now add tasks.</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Task Form Sections */}
            {!selectedProjectId ? (
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-8 text-center border border-amber-200">
                    <AlertTriangle size={48} className="mx-auto text-amber-500 mb-4" />
                    <h4 className="text-xl font-bold text-amber-800 mb-2">Project Required</h4>
                    <p className="text-amber-700 mb-6">Please select a project above to enable task creation.</p>
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-800 rounded-lg">
                        <Target size={16} />
                        <span>Select a project to continue</span>
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Task Basics Section */}
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        <div
                            className="flex items-center justify-between p-5 bg-gradient-to-r from-gray-50 to-white cursor-pointer"
                            onClick={() => handleSectionToggle("basic")}
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <ClipboardCheck size={20} className="text-blue-600" />
                                </div>
                                <h4 className="text-lg font-semibold text-gray-800">Task Basics</h4>
                            </div>
                            <div className="text-gray-500">
                                {expandedSection === "basic" ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                            </div>
                        </div>

                        {expandedSection === "basic" && (
                            <div className="p-5 border-t border-gray-100">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                    <div>
                                        <label className="block text-gray-700 mb-2 font-medium">
                                            Task Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                            placeholder="Enter task name"
                                            value={newTask.name}
                                            onChange={(e) =>
                                                setNewTask({
                                                    ...newTask,
                                                    name: e.target.value,
                                                })
                                            }
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-gray-700 mb-2 font-medium">
                                            Start Date <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-3.5 text-gray-400" size={18} />
                                            <input
                                                type="date"
                                                className="w-full border border-gray-300 rounded-lg p-3 pl-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                                value={newTask.startDate}
                                                onChange={(e) =>
                                                    setNewTask({
                                                        ...newTask,
                                                        startDate: e.target.value,
                                                    })
                                                }
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-gray-700 mb-2 font-medium">
                                            End Date <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-3.5 text-gray-400" size={18} />
                                            <input
                                                type="date"
                                                className="w-full border border-gray-300 rounded-lg p-3 pl-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                                value={newTask.endDate}
                                                onChange={(e) =>
                                                    setNewTask({
                                                        ...newTask,
                                                        endDate: e.target.value,
                                                    })
                                                }
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-gray-700 mb-2 font-medium">
                                            Priority Level
                                        </label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {priorityOptions.map((option) => (
                                                <button
                                                    key={option.value}
                                                    type="button"
                                                    className={`py-2 px-3 rounded-lg text-center border transition-all ${newTask.priority === option.value ?
                                                        `${option.color} border-transparent font-medium` :
                                                        'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'}`}
                                                    onClick={() => setNewTask({ ...newTask, priority: option.value })}
                                                >
                                                    {option.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-gray-700 mb-2 font-medium">
                                            Description (Optional)
                                        </label>
                                        <textarea
                                            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all h-24"
                                            placeholder="Enter task description, notes, or special instructions..."
                                            value={newTask.description}
                                            onChange={(e) =>
                                                setNewTask({
                                                    ...newTask,
                                                    description: e.target.value,
                                                })
                                            }
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Status & Progress Section */}
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        <div
                            className="flex items-center justify-between p-5 bg-gradient-to-r from-gray-50 to-white cursor-pointer"
                            onClick={() => handleSectionToggle("status")}
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <PlayCircle size={20} className="text-green-600" />
                                </div>
                                <h4 className="text-lg font-semibold text-gray-800">Status & Progress</h4>
                            </div>
                            <div className="text-gray-500">
                                {expandedSection === "status" ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                            </div>
                        </div>

                        {expandedSection === "status" && (
                            <div className="p-5 border-t border-gray-100">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-gray-700 mb-2 font-medium">
                                            Status
                                        </label>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                            {statusOptions.map((option) => (
                                                <button
                                                    key={option.value}
                                                    type="button"
                                                    className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-center border transition-all ${newTask.status === option.value ?
                                                        `${option.color} border-transparent font-medium` :
                                                        'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'}`}
                                                    onClick={() => setNewTask({ ...newTask, status: option.value })}
                                                >
                                                    {option.icon}
                                                    <span>{option.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-gray-700 mb-2 font-medium">
                                            Progress <span className="text-gray-500 font-normal">({newTask.progress}%)</span>
                                        </label>
                                        <div className="space-y-3">
                                            <input
                                                type="range"
                                                min="0"
                                                max="100"
                                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-600"
                                                value={newTask.progress}
                                                onChange={(e) =>
                                                    setNewTask({
                                                        ...newTask,
                                                        progress: Number(e.target.value),
                                                    })
                                                }
                                            />
                                            <div className="flex justify-between text-sm text-gray-500">
                                                <span>0%</span>
                                                <span>25%</span>
                                                <span>50%</span>
                                                <span>75%</span>
                                                <span>100%</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Dependencies Section */}
                    <div className="bg-white rounded-xl border border-gray-200">
                        <div
                            className="flex items-center justify-between p-5 bg-gradient-to-r from-gray-50 to-white cursor-pointer"
                            onClick={() => handleSectionToggle("dependencies")}
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-100 rounded-lg">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <h4 className="text-lg font-semibold text-gray-800">Task Dependencies</h4>
                            </div>
                            <div className="text-gray-500">
                                {expandedSection === "dependencies" ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                            </div>
                        </div>

                        {expandedSection === "dependencies" && (
                            <div className="p-5 border-t border-gray-100">
                                <p className="text-gray-600 mb-4 text-sm">Select tasks that must be completed before this task can begin.</p>
                                <Select
                                    isMulti
                                    styles={{
                                        ...customSelectStyles,
                                        menuPortal: base => ({ ...base, zIndex: 9999 }),
                                        menu: base => ({ ...base, zIndex: 9999 })
                                    }}
                                    // styles={customSelectStyles}
                                    options={
                                        taskData?.tasks?.map((task) => ({
                                            value: task._id,
                                            label: task.name,
                                            status: task.status,
                                            progress: task.progress
                                        })) || []
                                    }
                                    formatOptionLabel={({ label, status, progress }) => (
                                        <div className="flex flex-col">
                                            <span className="font-medium">{label}</span>
                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                <span className={`px-2 py-0.5 rounded-full ${statusOptions.find(s => s.value === status)?.color || 'bg-gray-100'}`}>
                                                    {statusOptions.find(s => s.value === status)?.label || status}
                                                </span>
                                                <span>Progress: {progress}%</span>
                                            </div>
                                        </div>
                                    )}
                                    onChange={(selected) =>
                                        setNewTask({
                                            ...newTask,
                                            dependencies: selected?.map((s) => s.value) || [],
                                        })
                                    }
                                    placeholder="Select dependent tasks..."
                                />

                                {newTask.dependencies.length > 0 && (
                                    <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                        <div className="flex items-center gap-2 text-sm text-blue-800 mb-2">
                                            <CheckCircle size={16} />
                                            <span className="font-medium">{newTask.dependencies.length} dependencies selected</span>
                                        </div>
                                        <p className="text-xs text-blue-700">This task will only start after all selected dependencies are completed.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t border-gray-200">
                        <div className="text-sm text-gray-500">
                            <span className="font-medium">Project:</span>
                            <span className="ml-2 px-3 py-1 bg-gray-100 rounded-lg">
                                {projectList?.find(p => p._id === selectedProjectId)?.projectName || "Not selected"}
                            </span>
                        </div>

                        <div className="flex gap-3">
                            <button
                                className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-all flex items-center gap-2"
                                onClick={() => {
                                    setNewTask({
                                        name: "",
                                        startDate: "",
                                        endDate: "",
                                        status: "planned",
                                        progress: 0,
                                        dependencies: [],
                                        description: "",
                                        priority: "medium"
                                    });
                                }}
                            >
                                <X size={18} />
                                Clear Form
                            </button>
                            <button
                                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg flex items-center gap-2"
                                onClick={handleAddTask}
                            >
                                <Plus size={18} />
                                Create Task
                            </button>
                        </div>
                    </div>

                    {/* Validation Summary */}
                    {(!newTask.name || !newTask.startDate || !newTask.endDate) && (
                        <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200">
                            <div className="flex items-center gap-3">
                                <AlertTriangle className="text-amber-600" size={20} />
                                <div>
                                    <h5 className="font-medium text-amber-800">Required fields missing</h5>
                                    <ul className="text-sm text-amber-700 mt-1 list-disc pl-5">
                                        {!newTask.name && <li>Task name is required</li>}
                                        {!newTask.startDate && <li>Start date is required</li>}
                                        {!newTask.endDate && <li>End date is required</li>}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default TaskFrom;