import React, { useState } from 'react';
import { FiPlus, FiChevronDown, FiChevronRight } from 'react-icons/fi';

// Dummy data for example tasks
const DUMMY_TASKS = [
    { id: 1, name: "Project Kick-off Meeting", startDate: "2023-10-01", endDate: "2023-10-01", actualStart: "2023-10-01", actualEnd: "2023-10-01", category: "General", status: "Complete" },
    { id: 2, name: "Design Mockups", startDate: "2023-10-02", endDate: "2023-10-06", actualStart: "2023-10-02", actualEnd: "2023-10-05", category: "Design", status: "Complete" },
    { id: 3, name: "Frontend Development", startDate: "2023-10-07", endDate: "2023-10-20", actualStart: "2023-10-07", actualEnd: null, category: "Development", status: "In Progress" },
    { id: 4, name: "Backend API Setup", startDate: "2023-10-21", endDate: "2023-10-30", actualStart: null, actualEnd: null, category: "Development", status: "Not Started" },
];

const TABLE_HEADERS = [
    { name: "#", minWidth: '130px' },
    { name: "NAME", minWidth: '250px' },
    { name: "START DATE", minWidth: '130px' },
    { name: "END DATE", minWidth: '130px' },
    { name: "ACTUAL START DATE", minWidth: '130px' },
    { name: "ACTUAL END DATE", minWidth: '130px' },
    { name: "WORK CATEGORY", minWidth: '130px' },
    { name: "STATUS", minWidth: '130px' },
];

// Helper to render the status pill
const getStatusClasses = (status) => {
    switch (status) {
        case 'Complete':
            return 'bg-green-100 text-green-800';
        case 'In Progress':
            return 'bg-blue-100 text-blue-800';
        case 'Not Started':
            return 'bg-gray-100 text-gray-800';
        default:
            return 'bg-yellow-100 text-yellow-800';
    }
};

const TaskTable = () => {
    // In a real application, you would manage tasks with useState/useReducer
    const [tasks, setTasks] = useState(DUMMY_TASKS);
    const [expandedIds, setExpandedIds] = useState([]); // For managing parent/child rows

    const handleAddTask = () => {
        // Placeholder function for adding a new task
        alert('Add Task functionality triggered!');
    };

    // Placeholder for a single task row component
    const TaskRow = ({ task }) => {
        // Placeholder for future expand/collapse logic
        const isExpanded = expandedIds.includes(task.id); 
        
        return (
            <tr className="bg-white hover: transition-colors">
                {/* # Column */}
                <td className="px-4 py-2 text-sm text-gray-500 border-r border-gray-200">
                    {task.id}
                </td>

                {/* NAME Column (Wider column) */}
                <td className="px-4 py-2 text-sm text-gray-900 border-r border-gray-200">
                    <div className="flex items-center space-x-2">
                        {/* Task expander icon placeholder */}
                        <div className="w-4 h-4 text-gray-400 cursor-pointer">
                            {/* {isExpanded ? <FiChevronDown /> : <FiChevronRight />} */}
                        </div>
                        <span className="font-medium">{task.name}</span>
                    </div>
                </td>
                
                {/* Date and Category Columns */}
                <td className="px-4 py-2 text-sm text-gray-500 border-r border-gray-200">{task.startDate || '-'}</td>
                <td className="px-4 py-2 text-sm text-gray-500 border-r border-gray-200">{task.endDate || '-'}</td>
                <td className="px-4 py-2 text-sm text-gray-500 border-r border-gray-200">{task.actualStart || '-'}</td>
                <td className="px-4 py-2 text-sm text-gray-500 border-r border-gray-200">{task.actualEnd || '-'}</td>
                <td className="px-4 py-2 text-sm text-gray-500 border-r border-gray-200">{task.category}</td>
                
                {/* STATUS Column */}
                <td className="px-4 py-2 text-sm whitespace-nowrap">
                    <span 
                        className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${getStatusClasses(task.status)}`}
                    >
                        {task.status}
                    </span>
                </td>
            </tr>
        );
    };

    const renderTasks = (taskList) => {
        return taskList.map((task) => <TaskRow key={task.id} task={task} />);
    };

    return (
        // The main container with scroll and max-height management
        <div className="overflow-x-auto max-h-[calc(100vh-200px)] border rounded-lg shadow-sm"> 
            <table className="min-w-full divide-y divide-gray-200 table-fixed">
                
                {/* Table Header (Thead) */}
                <thead className=" sticky top-0 z-10">
                    <tr>
                        {TABLE_HEADERS.map((h, index) => (
                            <th
                                key={h.name}
                                className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 last:border-r-0"
                                style={{ minWidth: h.minWidth }}
                            >
                                {h.name}
                            </th>
                        ))}
                    </tr>
                </thead>

                {/* Table Body (Tbody) */}
                <tbody className="bg-white divide-y divide-gray-200">
                    
                    {/* Render the dynamic task rows */}
                    {renderTasks(tasks)} 

                    {/* Add New Task Row */}
                    <tr className="bg-white hover: transition-colors border-t border-gray-200">
                        {/* Empty cell for '#' column */}
                        <td className="px-4 py-2 text-sm text-gray-500 border-r border-gray-200"></td> 

                        {/* Name column with Add Task button */}
                        <td className="px-4 py-2 text-sm text-gray-900 border-r border-gray-200">
                            <div className="flex items-center space-x-2">
                                <FiPlus 
                                    className="text-blue-600 cursor-pointer w-5 h-5" 
                                    onClick={handleAddTask} 
                                />
                                <button
                                    className="text-blue-600 font-medium cursor-pointer"
                                    onClick={handleAddTask}
                                >
                                    Add Task
                                </button>
                            </div>
                        </td>

                        {/* Colspan 6 for the remaining empty cells */}
                        <td colSpan={6} className="h-full"></td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
};

export default TaskTable;