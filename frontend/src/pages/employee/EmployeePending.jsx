import React, { useState } from "react";
import {
    useGetPendingEmployeeAttendanceQuery,
    useApproveEmployeeAttendanceMutation
} from "../../Reduxe/Api";

import {
    FaCalendarAlt,
    FaClock,
    FaUser,
    FaCheckCircle,
    FaSync,
    FaUsers,
    FaEye
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function EmployeePending() {
    const { data, isFetching, refetch } = useGetPendingEmployeeAttendanceQuery();
    const [approve, { isLoading: isApproving }] = useApproveEmployeeAttendanceMutation();

    const list = data?.pending || [];
    const [selectedRow, setSelectedRow] = useState(null); // For Modal

    // const BASE = 'http://localhost:3000';
    const navigate = useNavigate()

    // Formatters
    const formatDate = (date) =>
        date ? new Date(date).toLocaleDateString("en-IN") : "—";

    const formatTime = (time) =>
        time
            ? new Date(time).toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
            })
            : "—";

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case "present":
                return "bg-green-100 text-green-800 border-green-300";
            case "absent":
                return "bg-red-100 text-red-800 border-red-300";
            case "half-day":
                return "bg-yellow-100 text-yellow-800 border-yellow-300";
            case "leave":
                return "bg-blue-100 text-blue-800 border-blue-300";
            default:
                return "bg-gray-100 text-gray-800 border-gray-300";
        }
    };

    const handleApprove = async (id) => {
        try {
            await approve({ attendanceId: id }).unwrap();
            refetch();
        } catch (e) {
            alert(e?.data?.message || "Approve Failed");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6">
            <div className="max-w-7xl mx-auto">

                {/* HEADER */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Pending Approvals</h1>
                        <p className="text-gray-600 mt-1">
                            Review all pending employee attendance requests.
                        </p>
                    </div>

                    <div className="flex gap-6">
                        <div className="flex items-center space-x-2">
                            <FaUsers className="text-blue-600 text-2xl" />
                            <span className="text-xl font-semibold">{list.length}</span>
                        </div>
                        <button className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            onClick={() => navigate('/employee/list')}>
                            Employee List
                        </button>

                    </div>
                </div>

                {/* LOADER */}
                {isFetching && (
                    <div className="py-12 text-center">
                        <FaSync className="h-10 w-10 text-blue-500 animate-spin mx-auto" />
                        <p className="mt-2 text-gray-600">Loading records...</p>
                    </div>
                )}

                {/* EMPTY STATE */}
                {!isFetching && list.length === 0 && (
                    <div className="py-20 text-center">
                        <FaCheckCircle className="text-green-500 text-5xl mx-auto" />
                        <h2 className="mt-4 text-xl font-bold">All caught up!</h2>
                        <p className="text-gray-500 mt-2">
                            No pending attendance records at the moment.
                        </p>
                    </div>
                )}

                {/* TABLE */}
                {!isFetching && list.length > 0 && (
                    <div className="bg-white shadow-md rounded-xl border overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Employee
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Punch Info
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Marked By
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Action
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-200 bg-white">
                                {list.map((row) => (
                                    <tr key={row._id} className="hover:bg-gray-50">
                                        {/* EMPLOYEE + SELFIE */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={row.selfie}
                                                    alt="Selfie"
                                                    className="w-16 h-16 rounded-lg object-cover border"
                                                />

                                                <div>
                                                    <p className="font-semibold text-gray-800">
                                                        {row.employeeId?.name || "Unknown Employee"}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        ID: {row.employeeId?._id || "N/A"}
                                                    </p>
                                                    <p className="text-xs text-gray-600">
                                                        Lat: {row.latitude} | Lng: {row.longitude}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* PUNCH INFO */}
                                        <td className="px-6 py-4">
                                            <p className="text-sm">
                                                <FaCalendarAlt className="inline mr-1 text-gray-400" />
                                                {formatDate(row.date)}
                                            </p>
                                            <p className="text-sm text-gray-600 mt-1">
                                                <FaClock className="inline mr-1 text-gray-400" />
                                                In: {formatTime(row.timeIn)}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                Out: {formatTime(row.timeOut)}
                                            </p>
                                            <p className="text-xs text-blue-600 mt-1">
                                                Punch Time: {formatTime(row.timestamp)}
                                            </p>
                                        </td>

                                        {/* STATUS */}
                                        <td className="px-6 py-4">
                                            <span
                                                className={`px-3 py-1 rounded-full border text-xs font-semibold ${getStatusColor(
                                                    row.status
                                                )}`}
                                            >
                                                {row.status}
                                            </span>
                                        </td>

                                        {/* MARKED BY */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <FaUser className="text-blue-500 mr-2" />
                                                <div>
                                                    <p className="font-medium text-sm">
                                                        {row.markedBy?.name}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        ID: {row.markedBy?._id}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* ACTION */}
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleApprove(row._id)}
                                                    disabled={isApproving}
                                                    className="bg-green-600 hover:bg-green-700 text-white text-xs px-4 py-2 rounded-lg"
                                                >
                                                    Approve
                                                </button>

                                                <button
                                                    onClick={() => setSelectedRow(row)}
                                                    className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs px-4 py-2 rounded-lg"
                                                >
                                                    <FaEye className="inline mr-1" /> Details
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* DETAILS MODAL */}
            {selectedRow && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-[95%] sm:w-[450px] shadow-xl">

                        <h2 className="text-xl font-semibold mb-3">Attendance Details</h2>
                        <img
                            src={selectedRow.selfie}
                            className="w-full h-56 rounded-lg object-cover border"
                        />

                        <div className="mt-4 space-y-2 text-sm">
                            <p><strong>Employee:</strong> {selectedRow.employeeId?.name}</p>
                            <p><strong>Status:</strong> {selectedRow.status}</p>
                            <p><strong>Date:</strong> {formatDate(selectedRow.date)}</p>
                            <p><strong>Time In:</strong> {formatTime(selectedRow.timeIn)}</p>
                            <p><strong>Punch Time:</strong> {formatTime(selectedRow.timestamp)}</p>
                            <p><strong>Location:</strong> {selectedRow.latitude}, {selectedRow.longitude}</p>
                        </div>

                        <button
                            onClick={() => setSelectedRow(null)}
                            className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
