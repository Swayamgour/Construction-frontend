import React, { useState, useRef, useEffect } from 'react';
import { useCreateTaskMutation, useGetProjectTasksQuery } from './Reduxe/Api';
import Select from "react-select";

const ConstructionERP_GanttChart = () => {
    // Sample construction project data


    // Status options
    const statusOptions = [
        { value: 'planned', label: 'Planned', color: 'bg-gray-300', textColor: 'text-gray-700' },
        { value: 'in-progress', label: 'In Progress', color: 'bg-blue-500', textColor: 'text-blue-700' },
        { value: 'completed', label: 'Completed', color: 'bg-green-500', textColor: 'text-green-700' },
        { value: 'delayed', label: 'Delayed', color: 'bg-red-500', textColor: 'text-red-700' },
        { value: 'on-hold', label: 'On Hold', color: 'bg-yellow-500', textColor: 'text-yellow-700' },
    ];

    // State for projects

    const [createTask] = useCreateTaskMutation()
    const { data, isSuccess, refetch } = useGetProjectTasksQuery('69380887f606e3940f835a03')

    // console.log()

    useEffect(() => {
        if (data) {
            setProjects(data?.tasks)
            // setProjects(initialProjects)
        }
    }, [isSuccess, refetch])

    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState(null);
    const [viewMode, setViewMode] = useState('month'); // 'week', 'month', 'quarter'
    const [currentDateRange, setCurrentDateRange] = useState({ start: '2023-10-01', end: '2024-01-31' });
    const [isAddingTask, setIsAddingTask] = useState(false);
    // const [newTask, setNewTask] = useState({ name: '', startDate: '', endDate: '', status: 'planned' });
    const [newTask, setNewTask] = useState({
        name: '',
        startDate: '',
        endDate: '',
        progress: 0,
        status: 'planned',
        dependencies: []
    });

    const [ganttWidth, setGanttWidth] = useState(1000);

    // Refs
    const ganttContainerRef = useRef(null);
    const timelineRef = useRef(null);




    // Calculate date range for timeline
    const getDatesBetween = (start, end) => {
        const dates = [];
        let currentDate = new Date(start);
        const endDate = new Date(end);

        while (currentDate <= endDate) {
            dates.push(new Date(currentDate));
            currentDate.setDate(currentDate.getDate() + 1);
        }

        return dates;
    };

    // Calculate timeline dates based on view mode
    const timelineDates = getDatesBetween(currentDateRange.start, currentDateRange.end);

    // Filter timeline dates based on view mode
    const filteredTimelineDates = timelineDates.filter(date => {
        if (viewMode === 'week') {
            return date.getDay() === 1; // Only show Mondays for week view
        } else if (viewMode === 'month') {
            return date.getDate() === 1; // Only show first day of each month
        }
        return true; // Show all days for other views
    });

    // Calculate position and width for each project bar
    const calculateProjectBarStyle = (project) => {
        const start = new Date(project.startDate);
        const end = new Date(project.endDate);
        const timelineStart = new Date(currentDateRange.start);
        const timelineEnd = new Date(currentDateRange.end);

        // Calculate total timeline duration in days
        const totalDays = Math.ceil((timelineEnd - timelineStart) / (1000 * 60 * 60 * 24));

        // Calculate project start and end positions
        const projectStartDay = Math.ceil((start - timelineStart) / (1000 * 60 * 60 * 24));
        const projectDuration = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

        // Calculate percentage positions
        const left = (projectStartDay / totalDays);
        const width = (projectDuration / totalDays) * 100;

        return {
            left: `${left}%`,
            width: `${width}%`,

        }
    };


    const handleProjectClick = (project) => {
        setSelectedProject(project);
    };



    const initialProjects = [
        { id: 1, name: 'Site Preparation', startDate: '2023-10-01', endDate: '2023-10-15', progress: 100, status: 'completed', dependencies: [] },
        { id: 2, name: 'Foundation Work', startDate: '2023-10-10', endDate: '2023-11-05', progress: 80, status: 'in-progress', dependencies: [1] },
        { id: 3, name: 'Structural Steel', startDate: '2023-10-25', endDate: '2023-11-20', progress: 60, status: 'in-progress', dependencies: [2] },
        { id: 4, name: 'Concrete Pouring', startDate: '2023-11-15', endDate: '2023-12-10', progress: 30, status: 'delayed', dependencies: [2, 3] },
        { id: 5, name: 'Electrical & Plumbing', startDate: '2023-11-25', endDate: '2023-12-30', progress: 10, status: 'planned', dependencies: [4] },
        { id: 6, name: 'Interior Finishing', startDate: '2023-12-15', endDate: '2024-01-25', progress: 0, status: 'planned', dependencies: [4, 5] },
        { id: 7, name: 'Exterior Work', startDate: '2023-12-01', endDate: '2024-01-10', progress: 5, status: 'planned', dependencies: [3] },
        { id: 8, name: 'Landscaping', startDate: '2024-01-05', endDate: '2024-01-30', progress: 0, status: 'planned', dependencies: [6, 7] },
    ];


    const handleAddTask = async () => {
        if (!newTask.name || !newTask.startDate || !newTask.endDate) return;

        try {

            await createTask({
                projectId: "69380887f606e3940f835a03",
                body: {
                    name: newTask.name,
                    startDate: newTask.startDate,
                    endDate: newTask.endDate,
                    status: newTask.status,
                    progress: newTask.progress,
                    dependencies: newTask.dependencies
                }

            });


            setNewTask({
                name: '',
                startDate: '',
                endDate: '',
                status: 'planned',
                progress: 0,
                dependencies: []
            });

            setIsAddingTask(false);
        } catch (err) {
            console.log(err);
        }
    };



    // Handle progress update
    const handleProgressUpdate = (id, progress) => {
        setProjects(prev => prev.map(project =>
            project.id === id ? { ...project, progress } : project
        ));
    };

    // Handle status update
    const handleStatusUpdate = (id, status) => {
        setProjects(prev => prev.map(project =>
            project.id === id ? { ...project, status } : project
        ));
    };

    // Calculate project statistics
    // console.log(projects)
    const projectStats = {
        total: projects.length,
        completed: projects.filter(p => p.status === 'completed').length,
        inProgress: projects.filter(p => p.status === 'in-progress').length,
        delayed: projects.filter(p => p.status === 'delayed').length,
        planned: projects.filter(p => p.status === 'planned').length,
        overallProgress: Math.round(projects.reduce((acc, project) => acc + project.progress, 0) / projects.length),
    };

    // Format date for display
    const formatDate = (dateString) => {
        const options = { month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    };

    // Set gantt width based on container
    useEffect(() => {
        if (ganttContainerRef.current) {
            setGanttWidth(ganttContainerRef.current.offsetWidth);
        }
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <header className="mb-8 flex justify-between items-center ">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-800">Construction ERP - Gantt Chart</h1>
                        <p className="text-gray-600 mt-2">Project Timeline & Progress Tracking</p>
                    </div>


                    <button
                        className="flex justify-between items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                        onClick={() => setIsAddingTask(!isAddingTask)}
                    >
                        <i className="fas fa-plus"></i>
                        Add New Task
                    </button>
                    {/* </div> */}
                </header>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                    <div className="bg-white rounded-xl shadow p-4">
                        <div className="text-gray-500 text-sm">Total Tasks</div>
                        <div className="text-2xl font-bold mt-1">{projectStats.total}</div>
                    </div>
                    <div className="bg-white rounded-xl shadow p-4">
                        <div className="text-gray-500 text-sm">Completed</div>
                        <div className="text-2xl font-bold text-green-600 mt-1">{projectStats.completed}</div>
                    </div>
                    <div className="bg-white rounded-xl shadow p-4">
                        <div className="text-gray-500 text-sm">In Progress</div>
                        <div className="text-2xl font-bold text-blue-600 mt-1">{projectStats.inProgress}</div>
                    </div>
                    <div className="bg-white rounded-xl shadow p-4">
                        <div className="text-gray-500 text-sm">Delayed</div>
                        <div className="text-2xl font-bold text-red-600 mt-1">{projectStats.delayed}</div>
                    </div>
                    <div className="bg-white rounded-xl shadow p-4">
                        <div className="text-gray-500 text-sm">Planned</div>
                        <div className="text-2xl font-bold text-gray-600 mt-1">{projectStats.planned}</div>
                    </div>
                    <div className="bg-white rounded-xl shadow p-4">
                        <div className="text-gray-500 text-sm">Overall Progress</div>
                        <div className="text-2xl font-bold text-purple-600 mt-1">{projectStats.overallProgress}%</div>
                    </div>
                </div>

                {/* Add New Task Form */}
                

                {/* Gantt Chart Container */}
                {/* Projects List & Gantt Bars (UPDATED) */}
                {/* Gantt Chart Section */}
                <div className="relative">

                    {/* STATUS COLORS FIXED */}
                    {(() => {
                        if (!projects.length) return null;

                        const STATUS_COLORS = {
                            "planned": "#BDBDBD",
                            "in-progress": "#56CCF2",
                            "completed": "#6FCF97",
                            "delayed": "#EB5757",
                            "on-hold": "#F2C94C"
                        };

                        const minDate = new Date(Math.min(...projects.map(t => new Date(t.startDate))));
                        const maxDate = new Date(Math.max(...projects.map(t => new Date(t.endDate))));

                        const getDayDiff = (start, end) =>
                            Math.floor((end - start) / (1000 * 60 * 60 * 24));

                        return (
                            <>
                                {projects.map((task, index) => {
                                    const start = new Date(task.startDate);
                                    const end = new Date(task.endDate);

                                    const startOffset = getDayDiff(minDate, start);
                                    const duration = getDayDiff(start, end) + 1;

                                    const status = statusOptions.find(s => s.value === task.status);

                                    return (
                                        <div
                                            key={task._id}
                                            className="flex items-center border-b hover:bg-gray-50"
                                        >
                                            {/* LEFT TASK INFO */}
                                            <div className="w-64 p-3 flex items-center">
                                                <div className="flex-1">
                                                    <div className="font-medium">{task.name}</div>
                                                    <div className="text-sm text-gray-500">
                                                        {formatDate(task.startDate)} → {formatDate(task.endDate)}
                                                    </div>
                                                </div>

                                                <div className={`h-3 w-3 rounded-full ${status?.color}`}></div>
                                            </div>

                                            {/* RIGHT BAR */}
                                            <div className="flex-1 relative h-20 border-b border-gray-200">

                                                <div
                                                    className="absolute rounded-full text-xs text-black font-semibold px-2 flex items-center shadow-md"
                                                    style={{
                                                        left: `${startOffset * 14}px`,
                                                        width: `${duration * 14}px`,
                                                        height: "20px",
                                                        backgroundColor: STATUS_COLORS[task.status],
                                                        top: "35px"
                                                    }}
                                                >
                                                    {task.name}
                                                </div>

                                                {/* Dependencies */}
                                                {Array.isArray(task.dependencies) && task.dependencies.length > 0 && (
                                                    <div className="absolute top-0 left-0 transform -translate-y-full flex">
                                                        {task.dependencies.map((dep, i) => (
                                                            <div key={i} className="text-xs text-gray-500 mr-2">
                                                                ← {dep?.name || "Dependency"}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                            </div>

                                            {/* STATUS DROPDOWN */}
                                            <div className="w-32 p-3 flex items-center justify-end gap-2">
                                                <select
                                                    className="text-xs border rounded p-1"
                                                    value={task.status}
                                                    onChange={(e) => handleStatusUpdate(task._id, e.target.value)}
                                                >
                                                    {statusOptions.map(option => (
                                                        <option key={option.value} value={option.value}>
                                                            {option.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    );
                                })}
                            </>
                        );
                    })()}
                </div>


                {/* Selected Project Details */}
                {selectedProject && (
                    <div className="bg-white rounded-xl shadow-lg p-6 mt-8">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold">Task Details: {selectedProject.name}</h3>
                            <button
                                className="text-gray-500 hover:text-gray-700"
                                onClick={() => setSelectedProject(null)}
                            >
                                <i className="fas fa-times"></i>
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="font-medium text-gray-700 mb-2">Task Information</h4>
                                <div className="space-y-3">
                                    <div className="flex">
                                        <div className="w-32 text-gray-500">Start Date:</div>
                                        <div>{selectedProject.startDate}</div>
                                    </div>
                                    <div className="flex">
                                        <div className="w-32 text-gray-500">End Date:</div>
                                        <div>{selectedProject.endDate}</div>
                                    </div>
                                    <div className="flex">
                                        <div className="w-32 text-gray-500">Duration:</div>
                                        <div>
                                            {Math.ceil((new Date(selectedProject.endDate) - new Date(selectedProject.startDate)) / (1000 * 60 * 60 * 24))} days
                                        </div>
                                    </div>
                                    <div className="flex">
                                        <div className="w-32 text-gray-500">Status:</div>
                                        <div className="flex items-center">
                                            <div className={`h-3 w-3 rounded-full ${statusOptions.find(s => s.value === selectedProject.status)?.color} mr-2`}></div>
                                            {statusOptions.find(s => s.value === selectedProject.status)?.label}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-medium text-gray-700 mb-2">Progress Update</h4>
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between mb-1">
                                            <span>Completion Progress</span>
                                            <span>{selectedProject.progress}%</span>
                                            {/* {console.log(selectedProject?.progress)} */}
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                                            <div
                                                className={`h-2.5 rounded-full ${statusOptions.find(s => s.value === selectedProject.status)?.color}`}
                                                style={{ width: `${selectedProject.progress}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <span className="text-gray-500">Update Progress:</span>
                                        <input
                                            type="range"
                                            min="0"
                                            max="100"
                                            value={selectedProject.progress}
                                            onChange={(e) => handleProgressUpdate(selectedProject.id, parseInt(e.target.value))}
                                            className="flex-1"
                                        />
                                        <span className="font-medium">{selectedProject.progress}%</span>
                                    </div>

                                    <div className="pt-4">
                                        <button className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                            <i className="fas fa-save mr-2"></i>
                                            Save Changes
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Legend */}
                <div className="bg-white rounded-xl shadow p-4 mt-8">
                    <h4 className="font-medium mb-3">Status Legend</h4>
                    <div className="flex flex-wrap gap-4">
                        {statusOptions.map(status => (
                            <div key={status.value} className="flex items-center">
                                <div className={`h-4 w-4 rounded ${status.color} mr-2`}></div>
                                <span className={status.textColor}>{status.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}

            </div>
        </div>
    );
};

export default ConstructionERP_GanttChart


