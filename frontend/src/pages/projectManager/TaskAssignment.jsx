// src/pages/TaskAssignment.jsx
import React, { useEffect, useState } from "react";

const PRIORITIES = [
    { value: "Low", color: "bg-green-100 text-green-800 border-green-200", dot: "bg-green-500" },
    { value: "Medium", color: "bg-yellow-100 text-yellow-800 border-yellow-200", dot: "bg-yellow-500" },
    { value: "High", color: "bg-orange-100 text-orange-800 border-orange-200", dot: "bg-orange-500" },
    { value: "Critical", color: "bg-red-100 text-red-800 border-red-200", dot: "bg-red-500" }
];

const STATUS = [
    { value: "Pending", color: "bg-gray-100 text-gray-800", icon: "⏳" },
    { value: "In Progress", color: "bg-blue-100 text-blue-800", icon: "🚀" },
    { value: "Completed", color: "bg-green-100 text-green-800", icon: "✅" },
    { value: "Blocked", color: "bg-red-100 text-red-800", icon: "🚫" }
];

export default function TaskAssignment() {
    const [projects, setProjects] = useState([]);
    const [users, setUsers] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [activeTab, setActiveTab] = useState("all");
    const [form, setForm] = useState({
        title: "",
        projectId: "",
        assignedTo: "",
        priority: "Medium",
        startDate: "",
        endDate: "",
        instructions: ""
    });

    // --------------------------------------------------
    // 🚀 LOAD DUMMY DATA
    // --------------------------------------------------
    useEffect(() => {
        setProjects([
            { _id: "p1", name: "Tower Construction", color: "bg-blue-500" },
            { _id: "p2", name: "Road Development", color: "bg-green-500" },
            { _id: "p3", name: "Mall Renovation", color: "bg-purple-500" }
        ]);

        setUsers([
            { _id: "u1", name: "Ramesh", role: "Supervisor", avatar: "👨‍💼" },
            { _id: "u2", name: "Mahesh", role: "Engineer", avatar: "👨‍🔧" },
            { _id: "u3", name: "Suresh", role: "Worker", avatar: "👷" },
            { _id: "u4", name: "Priya", role: "Architect", avatar: "👩‍💼" }
        ]);

        setTasks([
            {
                _id: "t1",
                title: "Check Cement Stock",
                project: { name: "Tower Construction", color: "bg-blue-500" },
                assignedTo: { name: "Mahesh", role: "Engineer", avatar: "👨‍🔧" },
                priority: "High",
                status: "In Progress",
                instructions: "Verify remaining bags and reorder if needed. Check quality certification.",
                startDate: "2025-01-25",
                endDate: "2025-01-30"
            },
            {
                _id: "t2",
                title: "Site Safety Inspection",
                project: { name: "Road Development", color: "bg-green-500" },
                assignedTo: { name: "Ramesh", role: "Supervisor", avatar: "👨‍💼" },
                priority: "Critical",
                status: "Pending",
                instructions: "Inspect road leveling progress and ensure all safety protocols are followed.",
                startDate: "2025-01-26",
                endDate: "2025-01-27"
            },
            {
                _id: "t3",
                title: "Material Delivery Coordination",
                project: { name: "Mall Renovation", color: "bg-purple-500" },
                assignedTo: { name: "Priya", role: "Architect", avatar: "👩‍💼" },
                priority: "Medium",
                status: "Completed",
                instructions: "Coordinate with suppliers for glass and steel delivery.",
                startDate: "2025-01-20",
                endDate: "2025-01-24"
            }
        ]);
    }, []);

    // --------------------------------------------------
    // CREATE NEW TASK (DUMMY)
    // --------------------------------------------------
    const handleSubmit = (e) => {
        e.preventDefault();

        if (!form.title || !form.projectId || !form.assignedTo)
            return alert("Please fill all required fields!");

        const projectObj = projects.find(p => p._id === form.projectId);
        const userObj = users.find(u => u._id === form.assignedTo);

        const newTask = {
            _id: Date.now().toString(),
            ...form,
            project: { ...projectObj },
            assignedTo: { ...userObj },
            status: "Pending"
        };

        setTasks(prev => [newTask, ...prev]);

        setForm({
            title: "",
            projectId: "",
            assignedTo: "",
            priority: "Medium",
            startDate: "",
            endDate: "",
            instructions: ""
        });

        alert("Task Created Successfully!");
    };

    // --------------------------------------------------
    // UPDATE STATUS (DUMMY)
    // --------------------------------------------------
    const updateStatus = (id, status) => {
        setTasks(prev =>
            prev.map(t =>
                t._id === id ? { ...t, status } : t
            )
        );
    };

    // Filter tasks based on active tab
    const filteredTasks = activeTab === "all"
        ? tasks
        : tasks.filter(task => task.status === activeTab);

    const getPriorityConfig = (priority) =>
        PRIORITIES.find(p => p.value === priority) || PRIORITIES[1];

    const getStatusConfig = (status) =>
        STATUS.find(s => s.value === status) || STATUS[0];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Task Management</h1>
                            <p className="text-gray-600 mt-2">Assign and track tasks across projects</p>
                        </div>
                        <div className="text-right">
                            <div className="text-sm text-gray-500">Total Tasks</div>
                            <div className="text-2xl font-bold text-gray-900">{tasks.length}</div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
                    {/* Create Task Form */}
                    <div className="xl:col-span-1">
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 sticky top-6">
                            <div className="p-6 border-b border-gray-200">
                                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                    <span className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                    </span>
                                    Create New Task
                                </h2>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Task Title *</label>
                                    <input
                                        placeholder="Enter task title..."
                                        value={form.title}
                                        onChange={e => setForm({ ...form, title: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Project *</label>
                                    <select
                                        value={form.projectId}
                                        onChange={e => setForm({ ...form, projectId: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                        required
                                    >
                                        <option value="">Select project</option>
                                        {projects.map(p => (
                                            <option key={p._id} value={p._id}>{p.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Assign To *</label>
                                    <select
                                        value={form.assignedTo}
                                        onChange={e => setForm({ ...form, assignedTo: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                        required
                                    >
                                        <option value="">Select team member</option>
                                        {users.map(u => (
                                            <option key={u._id} value={u._id}>{u.name} - {u.role}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Priority</label>
                                    <select
                                        value={form.priority}
                                        onChange={e => setForm({ ...form, priority: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                    >
                                        {PRIORITIES.map(p => (
                                            <option key={p.value} value={p.value}>{p.value}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-1 gap-1">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Start Date</label>
                                        <input
                                            type="date"
                                            value={form.startDate}
                                            onChange={e => setForm({ ...form, startDate: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">End Date</label>
                                        <input
                                            type="date"
                                            value={form.endDate}
                                            onChange={e => setForm({ ...form, endDate: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Instructions</label>
                                    <textarea
                                        placeholder="Add detailed instructions..."
                                        value={form.instructions}
                                        onChange={e => setForm({ ...form, instructions: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                                        rows={4}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                                >
                                    Create Task
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Tasks List */}
                    <div className="xl:col-span-3">
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                            <div className="p-6 border-b border-gray-200">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                        <span className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                            </svg>
                                        </span>
                                        All Tasks ({filteredTasks.length})
                                    </h2>

                                    {/* Status Filter Tabs */}
                                    <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
                                        <button
                                            onClick={() => setActiveTab("all")}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === "all"
                                                    ? "bg-white text-gray-900 shadow-sm"
                                                    : "text-gray-600 hover:text-gray-900"
                                                }`}
                                        >
                                            All
                                        </button>
                                        {STATUS.map(status => (
                                            <button
                                                key={status.value}
                                                onClick={() => setActiveTab(status.value)}
                                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === status.value
                                                        ? "bg-white text-gray-900 shadow-sm"
                                                        : "text-gray-600 hover:text-gray-900"
                                                    }`}
                                            >
                                                {status.value}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="p-6">
                                {filteredTasks.length === 0 ? (
                                    <div className="text-center py-12">
                                        <div className="text-6xl mb-4">📝</div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No tasks found</h3>
                                        <p className="text-gray-500">Create your first task to get started</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {filteredTasks.map(task => {
                                            const priorityConfig = getPriorityConfig(task.priority);
                                            const statusConfig = getStatusConfig(task.status);
                                            const isOverdue = task.endDate && new Date(task.endDate) < new Date() && task.status !== "Completed";

                                            return (
                                                <div key={task._id} className="border border-gray-200 rounded-2xl p-6 hover:border-blue-300 transition-all duration-200 hover:shadow-md">
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-3 mb-3">
                                                                <h3 className="font-semibold text-gray-900 text-lg">{task.title}</h3>
                                                                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${priorityConfig.color}`}>
                                                                    <span className={`w-2 h-2 rounded-full ${priorityConfig.dot} inline-block mr-2`}></span>
                                                                    {task.priority}
                                                                </span>
                                                                {isOverdue && (
                                                                    <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                                                                        Overdue
                                                                    </span>
                                                                )}
                                                            </div>

                                                            <p className="text-gray-600 mb-4">{task.instructions}</p>

                                                            <div className="flex items-center gap-6 text-sm text-gray-500">
                                                                <div className="flex items-center gap-2">
                                                                    <div className={`w-3 h-3 rounded-full ${task.project?.color || 'bg-gray-400'}`}></div>
                                                                    <span>{task.project?.name}</span>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-lg">{task.assignedTo?.avatar}</span>
                                                                    <span>{task.assignedTo?.name} • {task.assignedTo?.role}</span>
                                                                </div>
                                                                {task.startDate && (
                                                                    <div className="flex items-center gap-2">
                                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                                        </svg>
                                                                        <span>{new Date(task.startDate).toLocaleDateString()} - {new Date(task.endDate).toLocaleDateString()}</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <div className="flex flex-col items-end gap-3">
                                                            <select
                                                                value={task.status}
                                                                onChange={(e) => updateStatus(task._id, e.target.value)}
                                                                className={`px-4 py-2 rounded-lg border-0 font-medium text-sm ${statusConfig.color} focus:ring-2 focus:ring-blue-500 transition-all duration-200`}
                                                            >
                                                                {STATUS.map(s => (
                                                                    <option key={s.value} value={s.value}>{s.icon} {s.value}</option>
                                                                ))}
                                                            </select>

                                                            <div className="flex gap-2">
                                                                <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                    </svg>
                                                                </button>
                                                                <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                    </svg>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}