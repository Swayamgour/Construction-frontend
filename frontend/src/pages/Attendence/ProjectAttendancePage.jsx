import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { useGetAllAttendanceQuery, useGetAssignedLabourQuery, useBulkMarkLabourMutation } from "../../Reduxe/Api";

const STATUS_OPTIONS = [
    { value: "Present", label: "Present", color: "green" },
    { value: "Absent", label: "Absent", color: "red" },
    { value: "Half-Day", label: "Half-Day", color: "yellow" },
];

const STATUS_COLORS = {
    "Present": "bg-green-100 text-green-800 border-green-300",
    "Absent": "bg-red-100 text-red-800 border-red-300",
    "Half-Day": "bg-yellow-100 text-yellow-800 border-yellow-300"
};

const ProjectAttendancePage = () => {
    const { projectId } = useParams();
    const [allLabours, setAllLabours] = useState([]);
    const [alreadyMarkedLabours, setAlreadyMarkedLabours] = useState([]);
    const [pendingMarkingLabours, setPendingMarkingLabours] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));

    // Local state: labourId -> status for new attendance
    const [attendanceMap, setAttendanceMap] = useState({});

    // Fetch existing attendance data
    const { data: attendanceData, refetch: refetchAttendance } = useGetAllAttendanceQuery(projectId);
    const { data: labourData, isLoading } = useGetAssignedLabourQuery(projectId);
    const [MarkAttendance] = useBulkMarkLabourMutation();

    useEffect(() => {
        if (labourData?.data) {
            const labours = labourData.data || [];
            setAllLabours(labours);

            // Separate labours based on attendanceToday flag
            const marked = labours.filter(lab => lab.attendanceToday === true);
            const pending = labours.filter(lab => lab.attendanceToday !== true);

            setAlreadyMarkedLabours(marked);
            setPendingMarkingLabours(pending);

            // Initialize attendanceMap for pending labours
            const initialMap = {};
            pending.forEach(lab => {
                initialMap[lab._id] = "";
            });
            setAttendanceMap(initialMap);
        }
    }, [labourData]);

    useEffect(() => {
        // Refresh when date changes
        if (projectId) {
            // You might want to refetch labour data with new date parameter
            // This depends on your API implementation
        }
    }, [date, projectId]);

    const handleStatusChange = (labourId, status) => {
        setAttendanceMap((prev) => ({
            ...prev,
            [labourId]: status,
        }));
    };

    const handleMarkAll = (status) => {
        const updated = {};
        pendingMarkingLabours.forEach((lab) => {
            updated[lab._id] = status;
        });
        setAttendanceMap(updated);
    };

    const handleSaveAttendance = async () => {
        try {
            if (!projectId) {
                return toast.error("Project not selected");
            }

            const punchInTime = new Date().toISOString();

            // Build attendance array with REAL status string
            const attendance = Object.entries(attendanceMap)
                .filter(([_, status]) => status !== "" && status !== null)
                .map(([labourId, status]) => ({
                    labourId,
                    status,
                    timeIn: punchInTime,
                    attendanceToday: true
                }));

            if (attendance.length === 0) {
                return toast.error("No attendance selected");
            }

            setSaving(true);

            const body = {
                projectId,
                attendance,
            };

            const res = await MarkAttendance(body).unwrap();
            toast.success(res?.message || "Attendance saved");

            // Refetch labour data to update attendanceToday status
            // Assuming your API updates the labour's attendanceToday flag after marking

            // Clear attendance map for newly marked labours
            const newMap = {};
            pendingMarkingLabours.forEach(lab => {
                if (!attendance.find(a => a.labourId === lab._id)) {
                    newMap[lab._id] = attendanceMap[lab._id] || "";
                }
            });
            setAttendanceMap(newMap);

            // Update local state to move marked labours to already marked section
            const newlyMarkedIds = attendance.map(a => a.labourId);
            const newlyMarked = pendingMarkingLabours.filter(lab =>
                newlyMarkedIds.includes(lab._id)
            );
            const stillPending = pendingMarkingLabours.filter(lab =>
                !newlyMarkedIds.includes(lab._id)
            );

            setAlreadyMarkedLabours(prev => [...prev, ...newlyMarked.map(lab => ({
                ...lab,
                attendanceToday: true
            }))]);
            setPendingMarkingLabours(stillPending);

        } catch (error) {
            console.error(error);
            toast.error(error?.response?.data?.message || "Error saving attendance");
        } finally {
            setSaving(false);
        }
    };

    const getAttendanceStatusForLabour = (labourId) => {
        if (!attendanceData?.data) return null;

        const todayAttendance = attendanceData.data.find(att => {
            const attDate = new Date(att.date).toISOString().slice(0, 10);
            return attDate === date && att.labourId === labourId;
        });

        return todayAttendance?.status || null;
    };

    const formatTime = (timeString) => {
        if (!timeString) return "N/A";
        const date = new Date(timeString);
        return date.toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatDate = (dateString) => {
        if (!dateString) return "Today";
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    if (isLoading) {
        return (
            <div className="p-6 max-w-6xl mx-auto">
                <div className="text-center py-10">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading labours data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-800">Project Attendance</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Project ID: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{projectId}</span>
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Date:</span>
                        <input
                            type="date"
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white border rounded-lg p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Total Labours</p>
                            <p className="text-2xl font-semibold mt-1">{allLabours.length}</p>
                        </div>
                        <div className="text-blue-600">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                    </div>
                </div>
                <div className="bg-white border rounded-lg p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Attendance Marked</p>
                            <p className="text-2xl font-semibold mt-1">{alreadyMarkedLabours.length}</p>
                        </div>
                        <div className="text-green-600">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                </div>
                <div className="bg-white border rounded-lg p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Pending Marking</p>
                            <p className="text-2xl font-semibold mt-1">{pendingMarkingLabours.length}</p>
                        </div>
                        <div className="text-yellow-600">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                </div>
                <div className="bg-white border rounded-lg p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Marked Percentage</p>
                            <p className="text-2xl font-semibold mt-1">
                                {allLabours.length > 0
                                    ? `${Math.round((alreadyMarkedLabours.length / allLabours.length) * 100)}%`
                                    : "0%"
                                }
                            </p>
                        </div>
                        <div className="text-purple-600">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Section 1: Already Marked Attendance */}
            {alreadyMarkedLabours.length > 0 && (
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                            <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                            Already Marked Today ({alreadyMarkedLabours.length})
                        </h2>
                        <div className="flex items-center gap-2 text-sm">
                            <span className="text-gray-500">Date: </span>
                            <span className="font-medium">{formatDate(date)}</span>
                        </div>
                    </div>

                    <div className="overflow-x-auto border border-gray-200 rounded-lg">
                        <table className="min-w-full text-sm">
                            <thead className="bg-gray-50 text-gray-700">
                                <tr>
                                    <th className="px-4 py-3 text-left font-medium">#</th>
                                    <th className="px-4 py-3 text-left font-medium">Labour Name</th>
                                    <th className="px-4 py-3 text-left font-medium">Phone</th>
                                    <th className="px-4 py-3 text-left font-medium">Labour Type</th>
                                    <th className="px-4 py-3 text-left font-medium">Status</th>
                                    <th className="px-4 py-3 text-left font-medium">Details</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {alreadyMarkedLabours.map((labour, idx) => {
                                    const attendanceStatus = getAttendanceStatusForLabour(labour._id);
                                    return (
                                        <tr key={labour._id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3">{idx + 1}</td>
                                            <td className="px-4 py-3 font-medium">
                                                <div className="flex items-center gap-2">
                                                    {labour.name}
                                                    {labour.attendanceToday && (
                                                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-gray-600">
                                                {labour.phone}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
                                                    {labour.labourType}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                {attendanceStatus ? (
                                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[attendanceStatus] || 'bg-gray-100 text-gray-800'}`}>
                                                        {attendanceStatus}
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                        Marked
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <button
                                                    className="text-blue-600 hover:text-blue-800 text-sm"
                                                    onClick={() => {
                                                        // View attendance details modal/functionality
                                                        console.log("View details for:", labour._id);
                                                    }}
                                                >
                                                    View Details
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Section 2: Pending Attendance Marking */}
            {pendingMarkingLabours.length > 0 && (
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                            <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                            Mark Pending Attendance ({pendingMarkingLabours.length})
                        </h2>

                        <div className="flex items-center gap-2">
                            <div className="flex gap-1">
                                <button
                                    onClick={() => handleMarkAll("Present")}
                                    className="px-3 py-1.5 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1"
                                >
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                    Mark all Present
                                </button>
                                <button
                                    onClick={() => handleMarkAll("Absent")}
                                    className="px-3 py-1.5 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-1"
                                >
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                    Mark all Absent
                                </button>
                                <button
                                    onClick={() => {
                                        const clearedMap = {};
                                        pendingMarkingLabours.forEach(lab => {
                                            clearedMap[lab._id] = "";
                                        });
                                        setAttendanceMap(clearedMap);
                                    }}
                                    className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1"
                                >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    Clear All
                                </button>
                            </div>

                            <button
                                onClick={handleSaveAttendance}
                                disabled={saving || Object.values(attendanceMap).filter(v => v).length === 0}
                                className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {saving ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                        </svg>
                                        Save Attendance
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto border border-gray-200 rounded-lg">
                        <table className="min-w-full text-sm">
                            <thead className="bg-gray-50 text-gray-700">
                                <tr>
                                    <th className="px-4 py-3 text-left font-medium">#</th>
                                    <th className="px-4 py-3 text-left font-medium">Labour Name</th>
                                    <th className="px-4 py-3 text-left font-medium">Phone</th>
                                    <th className="px-4 py-3 text-left font-medium">Labour Type</th>
                                    <th className="px-4 py-3 text-left font-medium">Skill Level</th>
                                    <th className="px-4 py-3 text-left font-medium">Status</th>
                                    <th className="px-4 py-3 text-left font-medium">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {pendingMarkingLabours.map((lab, idx) => (
                                    <tr key={lab._id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3">{idx + 1}</td>
                                        <td className="px-4 py-3 font-medium">
                                            <div className="flex items-center gap-2">
                                                {lab.name}
                                                {!lab.attendanceToday && (
                                                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-gray-600">{lab.phone}</td>
                                        <td className="px-4 py-3">
                                            <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
                                                {lab.labourType}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-purple-100 text-purple-800">
                                                {lab.skillLevel}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            {attendanceMap[lab._id] ? (
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${attendanceMap[lab._id] === "Present" ? "bg-green-100 text-green-800" :
                                                        attendanceMap[lab._id] === "Absent" ? "bg-red-100 text-red-800" :
                                                            "bg-yellow-100 text-yellow-800"
                                                    }`}>
                                                    {attendanceMap[lab._id]}
                                                </span>
                                            ) : (
                                                <span className="text-gray-400 text-sm">Not selected</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex gap-2">
                                                {STATUS_OPTIONS.map((opt) => (
                                                    <button
                                                        key={opt.value}
                                                        type="button"
                                                        onClick={() => handleStatusChange(lab._id, opt.value)}
                                                        className={`px-3 py-1.5 rounded text-xs border transition-colors flex items-center gap-1 ${attendanceMap[lab._id] === opt.value
                                                                ? opt.value === "Present"
                                                                    ? "bg-green-600 text-white border-green-600"
                                                                    : opt.value === "Absent"
                                                                        ? "bg-red-600 text-white border-red-600"
                                                                        : "bg-yellow-500 text-white border-yellow-500"
                                                                : "bg-white hover:bg-gray-50 border-gray-300"
                                                            }`}
                                                    >
                                                        {opt.value === "Present" && (
                                                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                            </svg>
                                                        )}
                                                        {opt.value === "Absent" && (
                                                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                            </svg>
                                                        )}
                                                        {opt.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Selection Summary */}
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex flex-wrap items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-700 font-medium">Selected:</span>
                                    <span className="font-bold text-lg">
                                        {Object.values(attendanceMap).filter(v => v).length} of {pendingMarkingLabours.length}
                                    </span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                                        <span className="text-sm text-gray-600">
                                            Present: {Object.values(attendanceMap).filter(v => v === "Present").length}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-red-600 rounded-full"></div>
                                        <span className="text-sm text-gray-600">
                                            Absent: {Object.values(attendanceMap).filter(v => v === "Absent").length}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                        <span className="text-sm text-gray-600">
                                            Half-Day: {Object.values(attendanceMap).filter(v => v === "Half-Day").length}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="text-right">
                                <p className="text-sm text-gray-600">
                                    Progress:
                                    <span className="font-bold ml-2">
                                        {Math.round((Object.values(attendanceMap).filter(v => v).length / pendingMarkingLabours.length) * 100)}%
                                    </span>
                                </p>
                                <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden mt-1">
                                    <div
                                        className="h-full bg-blue-600 rounded-full transition-all duration-300"
                                        style={{
                                            width: `${(Object.values(attendanceMap).filter(v => v).length / pendingMarkingLabours.length) * 100}%`
                                        }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Empty State */}
            {allLabours.length === 0 && (
                <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                    <div className="text-gray-400 mb-4">
                        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-600 mb-2">No Labours Found</h3>
                    <p className="text-gray-500 mb-4">There are no labours assigned to this project yet.</p>
                    <button
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        onClick={() => {
                            // Navigate to assign labour page
                            console.log("Navigate to assign labour");
                        }}
                    >
                        Assign Labours
                    </button>
                </div>
            )}

            {/* All attendance marked state */}
            {pendingMarkingLabours.length === 0 && alreadyMarkedLabours.length > 0 && (
                <div className="text-center py-12 border-2 border-dashed border-green-300 rounded-lg bg-green-50">
                    <div className="text-green-400 mb-4">
                        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-green-600 mb-2">All Attendance Marked!</h3>
                    <p className="text-green-500">
                        You have successfully marked attendance for all {alreadyMarkedLabours.length} labours today.
                    </p>
                </div>
            )}
        </div>
    );
};

export default ProjectAttendancePage;