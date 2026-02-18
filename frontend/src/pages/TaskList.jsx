import React, { useState, useEffect } from 'react';
import {
    FiArrowLeft,
    FiPlus,
    FiSearch,
    FiFilter,
    FiCalendar,
    FiUser,
    FiFlag,
    FiClock,
    FiCheckCircle,
    FiAlertCircle
} from 'react-icons/fi';
import { FaHardHat } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const TaskList = () => {
    const navigate = useNavigate();
    const [tasks, setTasks] = useState([]);
    const [filteredTasks, setFilteredTasks] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [priorityFilter, setPriorityFilter] = useState('all');
    const [isLoading, setIsLoading] = useState(true);

    // Mock tasks data
    useEffect(() => {
        const fetchTasks = async () => {
            setIsLoading(true);
            try {
                // Simulate API call
                setTimeout(() => {
                    const mockTasks = [
                        {
                            id: 'TSK-2024-001',
                            title: 'Electrical Wiring Installation - 3rd Floor',
                            taskType: 'Electrical',
                            priority: 'high',
                            status: 'in-progress',
                            progress: 65,
                            assignTo: 'Anil Sharma',
                            assignToRole: 'Electrician',
                            startDate: '2024-01-15',
                            dueDate: '2024-02-10',
                            project: 'Sunrise Residency',
                            site: 'Site A - Foundation',
                            daysRemaining: 13
                        },
                        {
                            id: 'TSK-2024-002',
                            title: 'Concrete Pouring - Foundation Slab',
                            taskType: 'Structural',
                            priority: 'critical',
                            status: 'pending',
                            progress: 0,
                            assignTo: 'Mohan Singh',
                            assignToRole: 'Mason',
                            startDate: '2024-02-01',
                            dueDate: '2024-02-05',
                            project: 'Metro Tower',
                            site: 'Main Building',
                            daysRemaining: 5
                        },
                        {
                            id: 'TSK-2024-003',
                            title: 'Plumbing Rough-in - 2nd Floor',
                            taskType: 'Plumbing',
                            priority: 'medium',
                            status: 'in-progress',
                            progress: 40,
                            assignTo: 'Priya Patel',
                            assignToRole: 'Plumber',
                            startDate: '2024-01-20',
                            dueDate: '2024-02-15',
                            project: 'Sunrise Residency',
                            site: 'Site B - Structure',
                            daysRemaining: 18
                        },
                        {
                            id: 'TSK-2024-004',
                            title: 'Safety Inspection - Entire Site',
                            taskType: 'Safety Inspection',
                            priority: 'high',
                            status: 'completed',
                            progress: 100,
                            assignTo: 'Rajesh Kumar',
                            assignToRole: 'Site Supervisor',
                            startDate: '2024-01-10',
                            dueDate: '2024-01-25',
                            project: 'Tech Park',
                            site: 'All Areas',
                            daysRemaining: -3
                        },
                        {
                            id: 'TSK-2024-005',
                            title: 'Wall Finishing - Lobby Area',
                            taskType: 'Finishing',
                            priority: 'medium',
                            status: 'on-hold',
                            progress: 20,
                            assignTo: 'David Wilson',
                            assignToRole: 'Finishing Specialist',
                            startDate: '2024-01-25',
                            dueDate: '2024-02-20',
                            project: 'Commercial Complex',
                            site: 'Main Lobby',
                            daysRemaining: 23
                        },
                        {
                            id: 'TSK-2024-006',
                            title: 'HVAC Installation - Basement',
                            taskType: 'MEP',
                            priority: 'high',
                            status: 'in-progress',
                            progress: 75,
                            assignTo: 'Team A',
                            assignToRole: 'MEP Team',
                            startDate: '2024-01-12',
                            dueDate: '2024-02-08',
                            project: 'Industrial Zone',
                            site: 'Basement Level',
                            daysRemaining: 11
                        }
                    ];
                    setTasks(mockTasks);
                    setFilteredTasks(mockTasks);
                    setIsLoading(false);
                }, 1000);
            } catch (error) {
                console.error('Error fetching tasks:', error);
                setIsLoading(false);
            }
        };

        fetchTasks();
    }, []);

    // Filter tasks based on search and filters
    useEffect(() => {
        let filtered = tasks;

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(task =>
                task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                task.assignTo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                task.project.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Status filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter(task => task.status === statusFilter);
        }

        // Priority filter
        if (priorityFilter !== 'all') {
            filtered = filtered.filter(task => task.priority === priorityFilter);
        }

        setFilteredTasks(filtered);
    }, [searchTerm, statusFilter, priorityFilter, tasks]);

    // Get status color
    const getStatusColor = (status) => {
        const colors = {
            'pending': 'gray',
            'assigned': 'blue',
            'in-progress': 'yellow',
            'completed': 'green',
            'on-hold': 'orange',
            'cancelled': 'red'
        };
        return colors[status] || 'gray';
    };

    // Get priority color
    const getPriorityColor = (priority) => {
        const colors = {
            'low': 'green',
            'medium': 'yellow',
            'high': 'orange',
            'critical': 'red'
        };
        return colors[priority] || 'gray';
    };

    // Get status icon
    const getStatusIcon = (status) => {
        const icons = {
            'pending': FiClock,
            'assigned': FiUser,
            'in-progress': FiFlag,
            'completed': FiCheckCircle,
            'on-hold': FiAlertCircle,
            'cancelled': FiAlertCircle
        };
        return icons[status] || FiClock;
    };

    // Handle task click
    const handleTaskClick = (taskId) => {
        navigate(`/TaskView`);
    };

    // Handle new task
    const handleNewTask = () => {
        navigate('/AssignTask');
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-white rounded-2xl shadow-lg p-8 flex items-center justify-center h-64">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-600">Loading tasks...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors bg-white p-3 rounded-2xl shadow-sm hover:shadow-md"
                        >
                            <FiArrowLeft className="text-xl" />
                        </button>
                        <div>
                            {/* <h1 className="text-3xl font-bold text-gray-900">Task Management</h1> */}

                            <h1 className="text-xl sm:text-2xl font-normal bg-gradient-to-r from-slate-900 via-blue-800 to-purple-700 bg-clip-text text-transparent">
                                Task Management
                            </h1>
                            <p className="text-gray-600">View and manage all assigned tasks</p>
                        </div>
                    </div>
                    <button
                        onClick={handleNewTask}
                        className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors"
                    >
                        <FiPlus className="text-lg" />
                        Assign New Task
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Total Tasks</p>
                                <p className="text-2xl font-bold text-gray-900">{tasks.length}</p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                <FiFlag className="text-2xl text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-yellow-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">In Progress</p>
                                <p className="text-2xl font-bold text-yellow-600">
                                    {tasks.filter(t => t.status === 'in-progress').length}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                                <FiFlag className="text-2xl text-yellow-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Completed</p>
                                <p className="text-2xl font-bold text-green-600">
                                    {tasks.filter(t => t.status === 'completed').length}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                <FiCheckCircle className="text-2xl text-green-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-red-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Overdue</p>
                                <p className="text-2xl font-bold text-red-600">
                                    {tasks.filter(t => t.daysRemaining < 0).length}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                                <FiAlertCircle className="text-2xl text-red-600" />
                            </div>
                        </div>
                    </div>
                </div>


                {/* Filters and Search */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Search */}
                        <div className="md:col-span-2">
                            <div className="relative">
                                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search tasks, assignees, or projects..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        {/* Status Filter */}
                        <div>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="all">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="assigned">Assigned</option>
                                <option value="in-progress">In Progress</option>
                                <option value="completed">Completed</option>
                                <option value="on-hold">On Hold</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>

                        {/* Priority Filter */}
                        <div>
                            <select
                                value={priorityFilter}
                                onChange={(e) => setPriorityFilter(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="all">All Priority</option>
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                                <option value="critical">Critical</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Tasks List */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    {/* Table Header */}
                    <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-gray-50 border-b border-gray-200 font-medium text-gray-700">
                        <div className="col-span-4">Task Details</div>
                        <div className="col-span-2">Assignee</div>
                        <div className="col-span-2">Timeline</div>
                        <div className="col-span-2">Progress</div>
                        <div className="col-span-2">Status</div>
                    </div>

                    {/* Tasks */}
                    <div className="divide-y divide-gray-200">
                        {filteredTasks.length === 0 ? (
                            <div className="text-center py-12">
                                <FiFilter className="text-4xl text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
                                <p className="text-gray-500">Try adjusting your search or filters</p>
                            </div>
                        ) : (
                            filteredTasks.map((task) => {
                                const StatusIcon = getStatusIcon(task.status);
                                return (
                                    <div
                                        key={task.id}
                                        onClick={() => handleTaskClick(task.id)}
                                        className="grid grid-cols-12 gap-4 px-6 py-6 hover:bg-gray-50 cursor-pointer transition-colors"
                                    >
                                        {/* Task Details */}
                                        <div className="col-span-4">
                                            <div className="flex items-start gap-3">
                                                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                                    <FaHardHat className="text-blue-600" />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-gray-900 mb-1">{task.title}</h3>
                                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                                        <span>{task.taskType}</span>
                                                        <span>•</span>
                                                        <span>{task.project}</span>
                                                        <span>•</span>
                                                        <span>{task.site}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium bg-${getPriorityColor(task.priority)}-100 text-${getPriorityColor(task.priority)}-800`}>
                                                            {task.priority.toUpperCase()}
                                                        </span>
                                                        <span className="text-xs text-gray-500">#{task.id}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Assignee */}
                                        <div className="col-span-2">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                                    <FiUser className="text-purple-600 text-sm" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">{task.assignTo}</p>
                                                    <p className="text-sm text-gray-500">{task.assignToRole}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Timeline */}
                                        <div className="col-span-2">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-sm">
                                                    <FiCalendar className="text-gray-400" />
                                                    <span className="text-gray-900">{new Date(task.dueDate).toLocaleDateString()}</span>
                                                </div>
                                                <div className={`text-sm ${task.daysRemaining < 0 ? 'text-red-600' : task.daysRemaining < 3 ? 'text-orange-600' : 'text-gray-500'}`}>
                                                    {task.daysRemaining < 0
                                                        ? `${Math.abs(task.daysRemaining)} days overdue`
                                                        : `${task.daysRemaining} days remaining`
                                                    }
                                                </div>
                                            </div>
                                        </div>

                                        {/* Progress */}
                                        <div className="col-span-2">
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-gray-700">Progress</span>
                                                    <span className="font-medium text-gray-900">{task.progress}%</span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className={`h-2 rounded-full ${task.progress < 30 ? 'bg-red-500' :
                                                            task.progress < 70 ? 'bg-yellow-500' : 'bg-green-500'
                                                            }`}
                                                        style={{ width: `${task.progress}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Status */}
                                        <div className="col-span-2">
                                            <div className="flex items-center gap-2">
                                                <StatusIcon className={`text-${getStatusColor(task.status)}-600`} />
                                                <span className={`font-medium text-${getStatusColor(task.status)}-700`}>
                                                    {task.status.replace('-', ' ').toUpperCase()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Summary */}
                <div className="mt-6 text-center text-gray-500 text-sm">
                    Showing {filteredTasks.length} of {tasks.length} tasks
                </div>
            </div>
        </div>
    );
};

export default TaskList;