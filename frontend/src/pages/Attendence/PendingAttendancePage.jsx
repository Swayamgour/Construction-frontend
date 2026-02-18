import React, { useEffect, useState } from "react";
// import axios from "../../utils/axiosInstance";
import toast from "react-hot-toast";
import { useGetPendingAttendanceQuery, useApproveAttendanceMutation } from "../../Reduxe/Api";

const PendingAttendancePage = () => {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(false);
    const [approvingId, setApprovingId] = useState(null);

    const { data, isLoading: fetchPending, isSuccess } = useGetPendingAttendanceQuery()


    console.log(data?.pending)

    const [MarkAttendance] = useApproveAttendanceMutation()


    useEffect(() => {
        if (isSuccess && data) {

            setRecords(data?.pending || []);
        }
    }, [isSuccess, data])

    const handleApprove = async (attendanceId) => {
        try {
            setApprovingId(attendanceId);
            const res = await MarkAttendance({ attendanceId }).unwrap();
            toast.success(res.data?.message || "Attendance approved");

            setRecords((prev) => prev.filter((r) => r._id !== attendanceId));
        } catch (error) {
            console.error(error);
            toast.error(
                error.response?.data?.message || "Error approving attendance"
            );
        } finally {
            setApprovingId(null);
        }
    };

    // const handleApproveAll = async () => {
    //     if (records.length === 0) {
    //         toast.error("No pending attendance to approve!");
    //         return;
    //     }

    //     if (!window.confirm("Are you sure you want to approve ALL pending attendance?")) {
    //         return;
    //     }

    //     try {
    //         setApprovingId("all"); // mark UI as busy

    //         for (const rec of records) {
    //             await approveLabour({ attendanceId: rec._id }).unwrap();
    //         }

    //         toast.success("All attendance approved successfully!");
    //         fetchPending(); // refresh updated list

    //     } catch (error) {
    //         console.error("Bulk approval error:", error);
    //         toast.error("Failed to approve all records");
    //     } finally {
    //         setApprovingId(null); // remove loading UI
    //     }
    // };


    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-800">
                    Pending Attendance Approval
                </h1>

                <div className="flex gap-3">
                    <button
                        onClick={fetchPending}
                        className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-100"
                    >
                        Refresh
                    </button>

                    {/* Bulk Approve */}
                    {/* {records.length > 0 && (
                        <button
                            onClick={handleApproveAll}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg 
                               hover:bg-green-700 shadow"
                        >
                            Approve All
                        </button>
                    )} */}
                </div>
            </div>

            {/* Loading */}
            {loading ? (
                <div className="py-10 text-center text-gray-500 text-lg">
                    Loading pending list…
                </div>
            ) : records.length === 0 ? (
                <div className="py-16 text-center text-green-600 text-xl font-semibold">
                    🎉 No pending attendance!
                </div>
            ) : (
                <div className="overflow-x-auto border rounded-xl shadow bg-white">
                    <table className="min-w-full text-sm table-auto">
                        <thead className="bg-gray-100 text-gray-700">
                            <tr>
                                <th className="p-3 text-left">Date</th>
                                <th className="p-3 text-left">Project</th>
                                <th className="p-3 text-left">Labour</th>
                                <th className="p-3 text-left">Punch In</th>
                                <th className="p-3 text-left">Punch Out</th>
                                <th className="p-3 text-left">Hours</th>
                                <th className="p-3 text-left">Status</th>
                                <th className="p-3 text-left">Marked By</th>
                                <th className="p-3 text-left">Selfie</th>
                                <th className="p-3 text-center">Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {records.map((rec) => (
                                <tr key={rec._id} className="border-b hover:bg-gray-50">

                                    {/* DATE */}
                                    <td className="p-3">
                                        <div className="font-medium">
                                            {new Date(rec.date).toLocaleDateString()}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {new Date(rec.createdAt).toLocaleTimeString()}
                                        </div>
                                    </td>

                                    {/* PROJECT */}
                                    <td className="p-3">
                                        <div className="font-medium text-gray-800">
                                            {rec.projectId?.projectName || "-"}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {rec.projectId?.location || ""}
                                        </div>
                                    </td>

                                    {/* LABOUR */}
                                    <td className="p-3">
                                        <div className="font-semibold text-gray-900">
                                            {rec.labourId?.name || "-"}
                                        </div>
                                        <div className="text-xs text-gray-600">
                                            📞 {rec.labourId?.phone}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {rec.labourId?.skillLevel} • {rec.labourId?.labourType}
                                        </div>
                                    </td>

                                    {/* PUNCH IN */}
                                    <td className="p-3">
                                        {rec.timeIn ? (
                                            <span>{new Date(rec.timeIn).toLocaleTimeString()}</span>
                                        ) : (
                                            <span className="text-gray-400">-</span>
                                        )}
                                    </td>

                                    {/* PUNCH OUT */}
                                    <td className="p-3">
                                        {rec.timeOut ? (
                                            <span>{new Date(rec.timeOut).toLocaleTimeString()}</span>
                                        ) : (
                                            <span className="text-gray-400">-</span>
                                        )}
                                    </td>

                                    {/* WORK HOURS */}
                                    <td className="p-3 font-semibold text-blue-700">
                                        {rec.workHours || 0} h
                                    </td>

                                    {/* STATUS */}
                                    <td className="p-3">
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-bold 
                                        ${rec.status === "Present"
                                                    ? "bg-green-100 text-green-700"
                                                    : rec.status === "Absent"
                                                        ? "bg-red-100 text-red-700"
                                                        : "bg-orange-100 text-orange-700"
                                                }`}
                                        >
                                            {rec.status}
                                        </span>
                                    </td>

                                    {/* MARKED BY */}
                                    <td className="p-3">
                                        <div className="font-medium">
                                            {rec.markedBy?.name}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {rec.markedBy?.role}
                                        </div>
                                    </td>

                                    {/* SELFIE */}
                                    <td className="p-3">
                                        {rec.selfie ? (
                                            <img
                                                src={rec.selfie}
                                                className="w-12 h-12 rounded-lg object-cover border"
                                            />
                                        ) : (
                                            <span className="text-gray-400 text-xs">No Selfie</span>
                                        )}
                                    </td>

                                    {/* APPROVE */}
                                    <td className="p-3 text-center">
                                        <button
                                            onClick={() => handleApprove(rec._id)}
                                            disabled={approvingId === rec._id}
                                            className="px-4 py-1.5 bg-blue-600 text-white 
                                               rounded-lg text-xs hover:bg-blue-700 
                                               disabled:opacity-60"
                                        >
                                            {approvingId === rec._id
                                                ? "Approving..."
                                                : "Approve"}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>

    );
};

export default PendingAttendancePage;
