import React, { useState } from "react";
import {
    FiPlus,
    FiFolder,
    FiFilter,
    FiMoreVertical,
    FiChevronDown,
    FiChevronRight, // For closed tasks
    FiSearch,
    FiSquare, // Represents the checkbox outline
} from "react-icons/fi";
import { AiOutlineSetting } from "react-icons/ai"; // Using a simple setting icon for Task Details
import TaskDrawer from "../components/TaskDrawer";
import GanttView from "../components/GanttView";
import ReportDropdown from "../components/ReportDropdown";
import { MdOutlineTaskAlt } from "react-icons/md";

// --- Utility Components ---

// This component handles the in-place editing for any cell
const EditableCell = ({ value, task, field, updateTask }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [localValue, setLocalValue] = useState(value);


    const handleBlur = () => {
        setIsEditing(false);
        // Persist the change
        updateTask(task.id, field, localValue);
    };

    const handleChange = (e) => {
        setLocalValue(e.target.value);
    };

    if (isEditing) {
        return (
            <input
                type="text"
                value={localValue}
                onChange={handleChange}
                onBlur={handleBlur}
                onKeyDown={(e) => e.key === "Enter" && handleBlur()}
                // CLASS STYLE KEPT SAME
                className="w-full h-full p-1 -mx-1 border border-blue-400 focus:outline-none focus:border-blue-600"
                autoFocus
            />
        );
    }

    return (
        <div
            onClick={() => setIsEditing(true)}
            // CLASS STYLE KEPT SAME
            className="w-full h-full min-h-[36px] flex items-center cursor-pointer hover:bg-gray-100"
        >
            {value || "-"}
        </div>
    );
};

// --- Task Management Component ---

const TaskManagement = () => {
    const initialTasks = [
        {
            id: "TSK000003",
            name: "Plastering",
            start: "-",
            end: "-",
            actualStart: "",
            actualEnd: "",
            workCategory: "General",
            status: "Not Started",
            number: "6",
            children: [
                {
                    id: "TSK000007",
                    name: "floor 1",
                    start: "-",
                    end: "-",
                    actualStart: "",
                    actualEnd: "",
                    workCategory: "General",
                    status: "Not Started",
                    number: "7",
                    children: [
                        {
                            id: "TSK000010",
                            name: "101",
                            start: "-",
                            end: "-",
                            actualStart: "",
                            actualEnd: "",
                            workCategory: "General",
                            status: "Not Started",
                            number: "8",
                            children: [
                                {
                                    id: "TSK000013",
                                    name: "room",
                                    start: "-",
                                    end: "-",
                                    actualStart: "",
                                    actualEnd: "",
                                    workCategory: "General",
                                    status: "Not Started",
                                    number: "9",
                                    children: [],
                                },
                                {
                                    id: "TSK000014",
                                    name: "kitchen",
                                    start: "-",
                                    end: "-",
                                    actualStart: "",
                                    actualEnd: "",
                                    workCategory: "General",
                                    status: "Not Started",
                                    number: "10",
                                    children: [],
                                },
                                {
                                    id: "TSK000015",
                                    name: "hall",
                                    start: "-",
                                    end: "-",
                                    actualStart: "",
                                    actualEnd: "",
                                    workCategory: "General",
                                    status: "Not Started",
                                    number: "11",
                                    children: [],
                                },
                            ],
                        },
                    ],
                },
            ],
        },
    ];

    const [tasks, setTasks] = useState(initialTasks);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeView, setActiveView] = useState("Plan View");

    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const toggleDrawer = () => {
        setIsDrawerOpen(!isDrawerOpen);
    };


    // --- Data Manipulation ---

    // Utility to find and update a task recursively
    const updateTaskRecursive = (taskList, taskId, field, newValue) => {
        return taskList.map((task) => {
            if (task.id === taskId) {
                return { ...task, [field]: newValue };
            } else if (task.children.length > 0) {
                return {
                    ...task,
                    children: updateTaskRecursive(task.children, taskId, field, newValue),
                };
            }
            return task;
        });
    };

    // Function passed to EditableCell to update state
    const handleUpdateTask = (taskId, field, newValue) => {
        setTasks((prevTasks) => updateTaskRecursive(prevTasks, taskId, field, newValue));
    };


    // Recursive helper to add a subtask under the specified parentId
    const addSubtaskRecursive = (taskList, parentId) => {
        return taskList.map((task) => {
            if (task.id === parentId) {
                const newSubtask = {
                    id: `TSK${String(Math.floor(Math.random() * 1000000)).padStart(6, "0")}`,
                    name: "New Subtask",
                    start: "-",
                    end: "-",
                    actualStart: "",
                    actualEnd: "",
                    workCategory: "General",
                    status: "Not Started",
                    number: (task.children.length + 1).toString(),
                    children: [],
                };
                return { ...task, children: [...task.children, newSubtask] };
            } else if (task.children.length > 0) {
                return { ...task, children: addSubtaskRecursive(task.children, parentId) };
            }
            return task;
        });
    };

    // Public function to call when user clicks the plus icon
    const handleAddSubtask = (parentId) => {
        setTasks((prev) => addSubtaskRecursive(prev, parentId));
    };



    // --- Task Rendering Logic ---

    // Render a single task row
    const TaskRow = ({ task, level = 0 }) => {
        const [showIcons, setShowIcons] = useState(false);
        const [isHoveringDetail, setIsHoveringDetail] = useState(null);
        const [isExpanded, setIsExpanded] = useState(true); // Assuming tasks are expanded by default

        const fields = [
            { key: "name", value: task.name, width: "200px" },
            { key: "start", value: task.start, width: "120px" },
            { key: "end", value: task.end, width: "120px" },
            { key: "actualStart", value: task.actualStart, width: "120px" },
            { key: "actualEnd", value: task.actualEnd, width: "120px" },
            { key: "workCategory", value: task.workCategory, width: "120px" },
        ];

        return (
            <React.Fragment>
                {/* Main Task Row */}
                <tr
                    // CLASS STYLE KEPT SAME
                    className="hover: border-b border-gray-200"
                    onMouseEnter={() => setShowIcons(true)}
                    onMouseLeave={() => setShowIcons(false)}
                >
                    {/* # Column */}
                    <td className="px-4 py-2 text-sm text-gray-500 flex items-center space-x-2 border-r border-gray-200">
                        <FiSquare className="text-gray-400" />
                        <span className="font-medium text-gray-700">{task.number}</span>
                    </td>

                    {/* NAME Column (Editable) */}
                    <td className="px-4 py-0 text-sm text-gray-900 border-r border-gray-200">
                        <div className="flex justify-between items-center w-full">
                            <div
                                className="flex items-center space-x-2 min-h-[36px]"
                                style={{ paddingLeft: `${level * 20}px` }}
                            >
                                {task.children.length > 0 ? (
                                    isExpanded ? (
                                        <FiChevronDown className="text-gray-400 cursor-pointer" onClick={() => setIsExpanded(false)} />
                                    ) : (
                                        <FiChevronRight className="text-gray-400 cursor-pointer" onClick={() => setIsExpanded(true)} />
                                    )
                                ) : (
                                    <span className="w-4 h-4"></span> // Spacer for alignment
                                )}
                                <EditableCell
                                    value={task.name}
                                    task={task}
                                    field="name"
                                    updateTask={handleUpdateTask}
                                />
                            </div>

                            {/* Task Icons on Hover */}
                            {showIcons && (
                                <div className="flex items-center space-x-1 text-gray-400 pr-2">
                                    {/* Add Subtask Icon */}
                                    <FiPlus onClick={() => handleAddSubtask(task.id)} className="cursor-pointer hover:text-blue-600" />
                                    {/* <MdOutlineTaskAlt onClick={toggleDrawer} className="cursor-pointer hover:text-blue-600" /> */}

                                    {/* Task Details Icon with Tooltip */}
                                    <div
                                        className="relative"
                                        onMouseEnter={() => setIsHoveringDetail("manage")}
                                        onMouseLeave={() => setIsHoveringDetail(null)}
                                    >
                                        <MdOutlineTaskAlt
                                            onClick={toggleDrawer}
                                            className="cursor-pointer hover:text-blue-600"
                                        />
                                        {isHoveringDetail === "manage" && (
                                            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap">
                                                Task Manage
                                            </div>
                                        )}
                                    </div>

                                    <div
                                        className="relative"
                                        onMouseEnter={() => setIsHoveringDetail('details')}
                                        onMouseLeave={() => setIsHoveringDetail(null)}
                                    >
                                        <AiOutlineSetting onClick={toggleDrawer} className="cursor-pointer hover:text-blue-600" />
                                        {isHoveringDetail === 'details' && (
                                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 z-20 bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap">
                                                Task Details
                                            </div>
                                        )}
                                    </div>

                                    {/* More Options Icon */}
                                    <FiMoreVertical className="cursor-pointer hover:text-blue-600" />
                                </div>
                            )}
                        </div>
                    </td>

                    {/* Editable Data Columns */}
                    {fields.slice(1).map((field) => (
                        <td
                            key={field.key}
                            // CLASS STYLE KEPT SAME
                            className="px-4 py-0 text-sm text-gray-500 border-r border-gray-200 h-full"
                        >
                            <EditableCell
                                value={field.value}
                                task={task}
                                field={field.key}
                                updateTask={handleUpdateTask}
                            />
                        </td>
                    ))}

                    {/* Status Column (Read-only / Dropdown in full implementation) */}
                    <td className="px-4 py-2 text-sm whitespace-nowrap">
                        <span className="inline-flex px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                            {task.status}
                        </span>
                    </td>
                </tr>

                {/* Recursively render children if expanded */}
                {isExpanded && task.children.length > 0 && renderTasks(task.children, level + 1)}
            </React.Fragment>
        );
    };

    // Recursive Task Renderer
    const renderTasks = (taskList, level = 0) => {
        return taskList.map((task) => (
            <TaskRow key={task.id} task={task} level={level} />
        ));
    };

    // --- Main Render ---

    // Combined tasks for display and filtering (flattens structure for simple search)
    const flattenTasks = (taskList) => {
        let flat = [];
        taskList.forEach(task => {
            flat.push(task);
            if (task.children) {
                flat = flat.concat(flattenTasks(task.children));
            }
        });
        return flat;
    };

    // Filtering logic kept simple for demo
    const visibleTasks = tasks.filter((task) =>
        task.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Adds a new top-level task
    const handleAddTask = () => {
        const newTask = {
            id: `TSK${String(Math.floor(Math.random() * 1000000)).padStart(6, "0")}`,
            name: "New Task",
            start: "-",
            end: "-",
            actualStart: "",
            actualEnd: "",
            workCategory: "General",
            status: "Not Started",
            number: (tasks.length + 1).toString(),
            children: [],
        };

        setTasks((prevTasks) => [...prevTasks, newTask]);
    };


    return (
        <div className="min-h-screen  m-2 sm:m-4 md:m-6 lg:m-6"> {/* Background changed to light gray */}

            {/* <div>
                <h1 className="text-2xl font-normal bg-gradient-to-r from-slate-900 via-blue-800 to-purple-700 bg-clip-text text-transparent mb-3">
                    Tasks
                </h1>
            </div> */}

            <div className="  flex justify-between items-center mb-3">

                <h1 className="text-2xl font-normal bg-gradient-to-r from-slate-900 via-blue-800 to-purple-700 bg-clip-text text-transparent ">
                    Task Management
                </h1>
            </div>


            {/* 1. Header (Top Bar - Modernized) */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 bg-white shadow-md border-b-4 border-blue-500 rounded-lg gap-4 md:gap-0">
                {/* Left Section */}
                <div className="flex flex-col md:flex-row items-start md:items-center space-y-3 md:space-y-0 md:space-x-6 w-full md:w-auto">
                    {/* Company Info */}
                    <div className="flex flex-col">
                        <span className="text-xl font-bold text-gray-800">
                            SS Construction
                        </span>
                        <span className="text-xs text-green-500 font-medium">
                            <span className="text-gray-500">SYNC -</span> Last synced 4 minutes ago
                        </span>
                    </div>

                    {/* Search Bar */}
                    <div className="flex items-center relative border border-gray-300 rounded-full bg-white p-2 shadow-inner w-full md:w-72">
                        <FiSearch className="text-gray-400 ml-1" />
                        <input
                            type="text"
                            placeholder="Search tasks by name or ID"
                            className="ml-2 w-full text-sm bg-transparent focus:outline-none placeholder-gray-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* All Filters */}
                    <button className="flex items-center text-sm font-medium text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors border border-gray-300 w-full md:w-auto justify-center">
                        <FiFilter className="h-4 w-4" />
                        <span className="ml-2">All Filters</span>
                    </button>
                </div>

                {/* Right Section */}
                <div className="flex flex-wrap md:flex-nowrap items-center gap-3 w-full md:w-auto justify-start md:justify-end">
                    {/* Upload Plan */}
                    <button className="flex items-center bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors shadow-sm w-full md:w-auto justify-center">
                        <FiFolder className="h-4 w-4 text-blue-600" />
                        <span className="ml-2">Upload Plan</span>
                    </button>

                    {/* Report Dropdown */}
                    <ReportDropdown />

                    {/* More Options */}
                    <button className="text-gray-500 hover:text-blue-600 p-2 rounded-full hover:bg-gray-100 transition-colors">
                        <FiMoreVertical className="h-5 w-5" />
                    </button>
                </div>
            </div>

            {/* Toolbar (View Tabs & Action Buttons) */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center px-4 bg-white mt-4 py-3 gap-3 md:gap-0">
                {/* View Tabs */}
                <div className="flex space-x-4 overflow-x-auto pb-1">
                    {['Plan View', 'List View', 'Gantt View'].map((view) => (
                        <button
                            key={view}
                            onClick={() => setActiveView(view)}
                            className={`flex-shrink-0 pb-1 text-base font-semibold transition-all duration-200 ${activeView === view
                                ? 'text-blue-600 border-b-2 border-blue-600'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {view}
                        </button>
                    ))}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap md:flex-nowrap items-center gap-2 md:gap-3 mt-2 md:mt-0">
                    <button className="flex items-center bg-gray-100 text-gray-700 px-3 py-1.5 text-sm rounded-md hover:bg-gray-200 transition-colors">
                        Outline <FiChevronDown className="h-3 w-3 ml-1" />
                    </button>
                    <button className="flex items-center bg-gray-100 text-gray-700 px-3 py-1.5 text-sm rounded-md hover:bg-gray-200 transition-colors">
                        Baseline <FiChevronDown className="h-3 w-3 ml-1" />
                    </button>
                    <button className="flex items-center bg-blue-100 text-blue-700 px-3 py-1.5 text-sm rounded-md font-medium hover:bg-blue-200 transition-colors">
                        Scheduled <FiChevronDown className="h-3 w-3 ml-1" />
                    </button>
                    <button className="flex items-center bg-yellow-100 text-yellow-700 px-3 py-1.5 text-sm rounded-md font-medium hover:bg-yellow-200 transition-colors">
                        Delayed
                    </button>

                    <div className="border-l border-gray-300 h-6 mx-2"></div>

                    <button className="flex items-center text-gray-700 bg-white border border-gray-300 px-3 py-1.5 text-sm rounded-lg hover:bg-gray-100 font-medium">
                        <AiOutlineSetting className="h-4 w-4 mr-1" /> Manage Columns
                    </button>
                </div>
            </div>


            {/* 3. Task List Table / Gantt View */}
            <div className="border-t border-gray-200 mt-4">
                {activeView === "Gantt View" ? (
                    <GanttView tasks={flattenTasks(tasks)} />
                ) : (
                    <div className="overflow-x-auto max-h-[calc(100vh-200px)] rounded-lg md:max-w-[calc(100vw-360px)] lg:max-w-[calc(100vw-360px)]"> {/* Added max-height for better scroll management */}
                        <table className="min-w-full divide-y divide-gray-200 table-fixed ">
                            <thead className="sticky top-0 z-10 bg-blue-900">
                                <tr>
                                    {["#",
                                        "ITEM CODE",
                                        "DESCRIPTION",
                                        "TOTAL PROJECT QUANTITY",
                                        "ACHIEVED QUANTITY",
                                        "PLANNED COST AMOUNT (JOHNSON GTY)",
                                        "SALE AMOUNT (JOHNSON GTY)",
                                        "SALE PRICE",
                                    ].map((h, index) => (
                                        <th
                                            key={h}
                                            className="px-4 py-2 text-left text-xs font-medium text-white uppercase tracking-wider border-r border-gray-200 last:border-r-0"
                                            style={{ minWidth: index === 1 ? "250px" : "180px" }}
                                        >
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>

                            <tbody className="bg-white divide-y divide-gray-200">
                                {renderTasks(visibleTasks)}

                                {/* Add New Task Row - Styling kept same */}
                                <tr className="bg-white hover: transition-colors border-t border-gray-200">
                                    <td className="px-4 py-2 text-sm text-gray-500"></td>
                                    <td className="px-4 py-2 text-sm text-gray-900 border-r border-gray-200">
                                        <div className="flex items-center space-x-2">
                                            <FiPlus className="text-blue-600 cursor-pointer" onClick={handleAddTask} />
                                            <button
                                                className="text-blue-600 font-medium cursor-pointer"
                                                onClick={handleAddTask}
                                            >
                                                Add Task
                                            </button>
                                        </div>
                                    </td>
                                    <td colSpan={6} className="h-full"></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Bottom Count */}
                <div className="flex justify-start px-4 py-2 text-sm text-gray-600 bg-white border-t border-gray-200 shadow-inner">
                    Total Tasks: <span className="font-semibold ml-1">{flattenTasks(tasks).length}</span>
                </div>
            </div>
            <TaskDrawer
                isOpen={isDrawerOpen}
                onClose={toggleDrawer}
            />
        </div>
    );
};

export default TaskManagement;