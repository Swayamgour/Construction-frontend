import React from "react";
import { FaCheckCircle, FaClock, FaHourglassHalf, FaPlus } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const ProjectTasks = () => {
    const tasks = [
        { id: 1, title: "Design Wireframes", description: "Create low-fidelity wireframes for dashboard layout", status: "Done", assignedTo: "Ravi Kumar", dueDate: "2025-11-05" },
        { id: 2, title: "API Integration", description: "Connect backend APIs for data sync", status: "In Progress", assignedTo: "Priya Sharma", dueDate: "2025-11-07" },
        { id: 3, title: "Testing", description: "Perform unit and UI testing", status: "Pending", assignedTo: "Amit Verma", dueDate: "2025-11-10" },
        { id: 4, title: "UI Polish", description: "Enhance dashboard visuals and animations", status: "In Progress", assignedTo: "Swayam Gaur", dueDate: "2025-11-08" },
        { id: 5, title: "Documentation", description: "Prepare project documentation and reports", status: "Done", assignedTo: "Neha Patel", dueDate: "2025-11-03" },
    ];

    const getStatusStyles = (status) => {
        switch (status) {
            case "Done":
                return "bg-green-100 text-green-700 border-green-300";
            case "In Progress":
                return "bg-yellow-100 text-yellow-700 border-yellow-300";
            case "Pending":
                return "bg-red-100 text-red-700 border-red-300";
            default:
                return "";
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case "Done":
                return <FaCheckCircle className="text-green-500" size={20} />;
            case "In Progress":
                return <FaHourglassHalf className="text-yellow-500" size={20} />;
            case "Pending":
                return <FaClock className="text-red-500" size={20} />;
            default:
                return null;
        }
    };

    const navigate = useNavigate()

    return (
        <div className="p-8 bg-slate-50 min-h-screen">
            <div className="flex items-center justify-between mb-8">
                <div>
                    {/* <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Project Tasks</h1> */}
                    <h1 className="text-xl sm:text-2xl font-semibold bg-gradient-to-r from-slate-900 via-blue-800 to-purple-700 bg-clip-text text-transparent">
                       Project Tasks
                    </h1>
                    <p className="text-slate-500 text-sm">Manage and track progress of all project tasks</p>
                </div>
                <button onClick={() => navigate('/AddTask')} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-3 rounded-xl shadow-md transition-all duration-300">
                    <FaPlus />
                    <span>Add Task</span>
                </button>
            </div>

            {/* Task Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tasks.map((task) => (
                    <div
                        key={task.id}
                        className="bg-white rounded-2xl border border-slate-200 shadow-md hover:shadow-xl p-6 transition-all duration-300 transform hover:-translate-y-1"
                    >
                        <div className="flex justify-between items-center mb-3">
                            <div className="flex items-center gap-2">
                                {getStatusIcon(task.status)}
                                <span className={`text-sm font-medium px-3 py-1 rounded-full border ${getStatusStyles(task.status)}`}>
                                    {task.status}
                                </span>
                            </div>
                            <span className="text-xs text-slate-500 font-medium">Due: {task.dueDate}</span>
                        </div>

                        <h3 className="text-lg font-semibold text-slate-800 mb-2">{task.title}</h3>
                        <p className="text-slate-600 text-sm mb-4 line-clamp-2">{task.description}</p>

                        <div className="flex items-center justify-between text-sm text-slate-500">
                            <span>
                                <span className="font-semibold text-slate-700">Assigned to:</span> {task.assignedTo}
                            </span>
                            <button className="text-blue-600 hover:text-blue-800 font-semibold transition-all">
                                View →
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProjectTasks;
