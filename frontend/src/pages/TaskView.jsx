import React, { useState, useEffect } from 'react';
import {
    FiArrowLeft,
    // FiEdit,
    FiCalendar,
    FiUser,
    FiFlag,
    FiClipboard,
    FiMapPin,
    FiTool,
    // FiClock,
    FiAlertCircle,
    FiCheckCircle,
    FiMessageSquare,
    FiFileText,
    FiDownload
} from 'react-icons/fi';
import { FaHardHat  } from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';

const TaskView = () => {
    const navigate = useNavigate();
    const { taskId } = useParams();
    const [task, setTask] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [isLoading, setIsLoading] = useState(true);

    // Mock task data - in real app, this would come from API
    useEffect(() => {
        const fetchTaskData = async () => {
            setIsLoading(true);
            try {
                // Simulate API call
                setTimeout(() => {
                    const mockTaskData = {
                        id: taskId || 'TSK-2024-001',
                        title: 'Electrical Wiring Installation - 3rd Floor',
                        description: 'Complete electrical wiring installation for all rooms on the 3rd floor including switches, sockets, and lighting points. Ensure compliance with safety standards and proper cable management.',
                        taskType: 'Electrical',
                        priority: 'high',
                        category: 'Electrical',
                        status: 'in-progress',
                        progress: 65,

                        // Assignment Details
                        assignTo: '2',
                        assignToType: 'individual',
                        assignedPerson: {
                            id: 2,
                            name: 'Anil Sharma',
                            role: 'Electrician',
                            department: 'Electrical',
                            phone: '+91 9876543210',
                            email: 'anil.sharma@construction.com'
                        },
                        reportingTo: '1',
                        reportingPerson: {
                            id: 1,
                            name: 'Rajesh Kumar',
                            role: 'Site Supervisor',
                            department: 'Civil'
                        },

                        // Timeline
                        startDate: '2024-01-15',
                        dueDate: '2024-02-10',
                        estimatedHours: 40,
                        actualHours: 26,
                        reminderDate: '2024-02-05',
                        createdAt: '2024-01-10',
                        lastUpdated: '2024-01-28',

                        // Location & Resources
                        project: 'Sunrise Residency',
                        site: 'Site A - Foundation',
                        location: '3rd Floor, North Wing, Rooms 301-315',
                        requiredTools: ['Wire Stripper', 'Voltage Tester', 'Drill Machine', 'Screwdrivers Set', 'Cable Cutter'],
                        materials: ['Electrical Wires', 'Switches', 'Sockets', 'Conduit Pipes', 'Circuit Breakers'],

                        // Task Details
                        budget: 75000,
                        milestones: [
                            'Complete wiring layout',
                            'Install conduit pipes',
                            'Pull electrical wires',
                            'Install switches and sockets',
                            'Final testing and safety check'
                        ],
                        instructions: 'Follow electrical safety protocols. Use only approved materials. Test each circuit before final installation. Coordinate with plumbing team for any conflicts.',
                        communicationMethod: 'in-person',

                        // Status Updates
                        updates: [
                            {
                                id: 1,
                                date: '2024-01-28',
                                status: 'in-progress',
                                progress: 65,
                                notes: 'Completed wiring for rooms 301-308. Starting on 309-315 tomorrow.',
                                updatedBy: 'Anil Sharma'
                            },
                            {
                                id: 2,
                                date: '2024-01-25',
                                status: 'in-progress',
                                progress: 40,
                                notes: 'Conduit installation completed. Starting wire pulling.',
                                updatedBy: 'Anil Sharma'
                            },
                            {
                                id: 3,
                                date: '2024-01-20',
                                status: 'in-progress',
                                progress: 20,
                                notes: 'Layout planning completed. Materials checked and approved.',
                                updatedBy: 'Anil Sharma'
                            },
                            {
                                id: 4,
                                date: '2024-01-15',
                                status: 'assigned',
                                progress: 0,
                                notes: 'Task assigned and initiated.',
                                updatedBy: 'Rajesh Kumar'
                            }
                        ],

                        // Attachments
                        attachments: [
                            {
                                id: 1,
                                name: 'electrical_layout.pdf',
                                type: 'pdf',
                                size: '2.4 MB',
                                uploadedBy: 'Rajesh Kumar',
                                date: '2024-01-12'
                            },
                            {
                                id: 2,
                                name: 'wiring_diagram.dwg',
                                type: 'dwg',
                                size: '1.8 MB',
                                uploadedBy: 'Rajesh Kumar',
                                date: '2024-01-12'
                            }
                        ],

                        // Comments
                        comments: [
                            {
                                id: 1,
                                user: 'Rajesh Kumar',
                                role: 'Site Supervisor',
                                date: '2024-01-22',
                                message: 'Please ensure all wiring follows the updated safety standards document.',
                                type: 'instruction'
                            },
                            {
                                id: 2,
                                user: 'Anil Sharma',
                                role: 'Electrician',
                                date: '2024-01-22',
                                message: 'Understood. I have reviewed the safety standards.',
                                type: 'response'
                            }
                        ]
                    };

                    setTask(mockTaskData);
                    setIsLoading(false);
                }, 1000);
            } catch (error) {
                console.error('Error fetching task data:', error);
                setIsLoading(false);
            }
        };

        fetchTaskData();
    }, [taskId]);

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

    // Calculate days remaining
    const getDaysRemaining = (dueDate) => {
        const today = new Date();
        const due = new Date(dueDate);
        const diffTime = due - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 p-6">
                <div className="max-w-6xl mx-auto">
                    <div className="bg-white rounded-2xl shadow-lg p-8 flex items-center justify-center h-64">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-600">Loading task details...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!task) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 p-6">
                <div className="max-w-6xl mx-auto">
                    <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                        <FiAlertCircle className="text-4xl text-red-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Task Not Found</h2>
                        <p className="text-gray-600 mb-6">The requested task could not be found.</p>
                        <button
                            onClick={() => navigate(-1)}
                            className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors"
                        >
                            Go Back
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const daysRemaining = getDaysRemaining(task.dueDate);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 p-6">
            <div className="max-w-6xl mx-auto">
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
                            <div className="flex items-center gap-3 mb-2">
                                {/* <h1 className="text-3xl font-bold text-gray-900"></h1> */}
                                <h1 className="text-xl sm:text-2xl font-normal bg-gradient-to-r from-slate-900 via-blue-800 to-purple-700 bg-clip-text text-transparent">
                                    {task.title}
                                </h1>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium bg-${getStatusColor(task.status)}-100 text-${getStatusColor(task.status)}-800`}>
                                    {task.status.replace('-', ' ').toUpperCase()}
                                </span>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium bg-${getPriorityColor(task.priority)}-100 text-${getPriorityColor(task.priority)}-800`}>
                                    {task.priority.toUpperCase()} PRIORITY
                                </span>
                            </div>
                            <p className="text-gray-600">Task ID: {task.id} • Created on {new Date(task.createdAt).toLocaleDateString()}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* <button
                            onClick={() => navigate(`/edit-task/${task.id}`)}
                            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors"
                        >
                            <FiEdit className="text-lg" />
                            Edit Task
                        </button> */}
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-gray-700">Progress</span>
                        <span className="text-sm font-medium text-gray-900">{task.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                            className="bg-green-600 h-3 rounded-full transition-all duration-300"
                            style={{ width: `${task.progress}%` }}
                        ></div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-2xl shadow-lg mb-8">
                    <div className="border-b">
                        <nav className="flex -mb-px">
                            {['overview', 'timeline', 'updates', 'documents', 'comments'].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`py-4 px-6 font-medium text-sm border-b-2 transition-colors ${activeTab === tab
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                </button>
                            ))}
                        </nav>
                    </div>

                    <div className="p-8">
                        {/* Overview Tab */}
                        {activeTab === 'overview' && (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Left Column */}
                                <div className="lg:col-span-2 space-y-6">
                                    {/* Task Description */}
                                    <div className="bg-gray-50 rounded-xl p-6">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                            <FiClipboard className="text-blue-600" />
                                            Task Description
                                        </h3>
                                        <p className="text-gray-700 leading-relaxed">{task.description}</p>
                                    </div>

                                    {/* Instructions */}
                                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                            <FiFlag className="text-yellow-600" />
                                            Special Instructions
                                        </h3>
                                        <p className="text-gray-700 leading-relaxed">{task.instructions}</p>
                                    </div>

                                    {/* Milestones */}
                                    <div className="bg-white border border-gray-200 rounded-xl p-6">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                            <FiCheckCircle className="text-green-600" />
                                            Key Milestones
                                        </h3>
                                        <div className="space-y-3">
                                            {task.milestones.map((milestone, index) => (
                                                <div key={index} className="flex items-center gap-3">
                                                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                                                        <span className="text-xs font-medium text-blue-600">{index + 1}</span>
                                                    </div>
                                                    <span className="text-gray-700">{milestone}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column - Summary */}
                                <div className="space-y-6">
                                    {/* Assignment Card */}
                                    <div className="bg-white border border-gray-200 rounded-xl p-6">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                            <FiUser className="text-purple-600" />
                                            Assignment
                                        </h3>
                                        <div className="space-y-3">
                                            <div>
                                                <p className="text-sm text-gray-500">Assigned To</p>
                                                <p className="font-medium text-gray-900">{task.assignedPerson.name}</p>
                                                <p className="text-sm text-gray-600">{task.assignedPerson.role}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Reporting To</p>
                                                <p className="font-medium text-gray-900">{task.reportingPerson.name}</p>
                                                <p className="text-sm text-gray-600">{task.reportingPerson.role}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Timeline Card */}
                                    <div className="bg-white border border-gray-200 rounded-xl p-6">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                            <FiCalendar className="text-green-600" />
                                            Timeline
                                        </h3>
                                        <div className="space-y-3">
                                            <div>
                                                <p className="text-sm text-gray-500">Start Date</p>
                                                <p className="font-medium text-gray-900">{new Date(task.startDate).toLocaleDateString()}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Due Date</p>
                                                <p className="font-medium text-gray-900">{new Date(task.dueDate).toLocaleDateString()}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Days Remaining</p>
                                                <p className={`font-medium ${daysRemaining < 3 ? 'text-red-600' : daysRemaining < 7 ? 'text-orange-600' : 'text-green-600'}`}>
                                                    {daysRemaining} days
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Time Spent</p>
                                                <p className="font-medium text-gray-900">{task.actualHours || 0} of {task.estimatedHours} hours</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Location Card */}
                                    <div className="bg-white border border-gray-200 rounded-xl p-6">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                            <FiMapPin className="text-red-600" />
                                            Location
                                        </h3>
                                        <div className="space-y-3">
                                            <div>
                                                <p className="text-sm text-gray-500">Project</p>
                                                <p className="font-medium text-gray-900">{task.project}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Site</p>
                                                <p className="font-medium text-gray-900">{task.site}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Specific Location</p>
                                                <p className="font-medium text-gray-900">{task.location}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Timeline Tab */}
                        {activeTab === 'timeline' && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Resources */}
                                    <div className="bg-white border border-gray-200 rounded-xl p-6">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                            <FiTool className="text-blue-600" />
                                            Required Tools
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {task.requiredTools.map((tool, index) => (
                                                <span
                                                    key={index}
                                                    className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                                                >
                                                    {tool}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Materials */}
                                    <div className="bg-white border border-gray-200 rounded-xl p-6">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                            <FaHardHat className="text-orange-600" />
                                            Required Materials
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {task.materials.map((material, index) => (
                                                <span
                                                    key={index}
                                                    className="inline-flex items-center px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm"
                                                >
                                                    {material}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Budget & Communication */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-white border border-gray-200 rounded-xl p-6">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Budget</h3>
                                        <div className="text-3xl font-bold text-gray-900">₹{task.budget?.toLocaleString()}</div>
                                        <p className="text-gray-600">Allocated budget for this task</p>
                                    </div>

                                    <div className="bg-white border border-gray-200 rounded-xl p-6">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Communication</h3>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                                <FiMessageSquare className="text-green-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900 capitalize">
                                                    {task.communicationMethod.replace('-', ' ')}
                                                </p>
                                                <p className="text-sm text-gray-600">Preferred method</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Updates Tab */}
                        {activeTab === 'updates' && (
                            <div className="space-y-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Progress Updates</h3>
                                <div className="space-y-4">
                                    {task.updates.map(update => (
                                        <div key={update.id} className="bg-white border border-gray-200 rounded-xl p-6">
                                            <div className="flex items-start justify-between mb-3">
                                                <div>
                                                    <p className="font-medium text-gray-900">{update.updatedBy}</p>
                                                    <p className="text-sm text-gray-500">{new Date(update.date).toLocaleDateString()}</p>
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-sm font-medium bg-${getStatusColor(update.status)}-100 text-${getStatusColor(update.status)}-800`}>
                                                    {update.status.replace('-', ' ').toUpperCase()}
                                                </span>
                                            </div>
                                            <p className="text-gray-700 mb-3">{update.notes}</p>
                                            {update.progress > 0 && (
                                                <div className="flex items-center gap-3">
                                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                                        <div
                                                            className="bg-green-600 h-2 rounded-full"
                                                            style={{ width: `${update.progress}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className="text-sm font-medium text-gray-700">{update.progress}%</span>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Documents Tab */}
                        {activeTab === 'documents' && (
                            <div className="space-y-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Attachments</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {task.attachments.map(file => (
                                        <div key={file.id} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                                    <FiFileText className="text-blue-600" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">{file.name}</p>
                                                    <p className="text-sm text-gray-500">{file.size} • {new Date(file.date).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <button className="text-gray-400 hover:text-gray-600">
                                                <FiDownload className="text-lg" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Comments Tab */}
                        {activeTab === 'comments' && (
                            <div className="space-y-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Comments & Discussion</h3>
                                <div className="space-y-4">
                                    {task.comments.map(comment => (
                                        <div key={comment.id} className="bg-white border border-gray-200 rounded-xl p-6">
                                            <div className="flex items-start gap-4">
                                                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                                                    <FiUser className="text-purple-600" />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <p className="font-medium text-gray-900">{comment.user}</p>
                                                        <span className="text-sm text-gray-500">{comment.role}</span>
                                                        <span className="text-sm text-gray-400">•</span>
                                                        <span className="text-sm text-gray-500">{new Date(comment.date).toLocaleDateString()}</span>
                                                    </div>
                                                    <p className="text-gray-700">{comment.message}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TaskView;