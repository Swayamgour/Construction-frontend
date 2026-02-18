import React from "react";
import {
    useGetPendingEmployeeAttendanceQuery,
    useApproveEmployeeAttendanceMutation
} from "../../Redux/Api";

export default function PendingEmployeeAttendance() {
    const { data } = useGetPendingEmployeeAttendanceQuery();
    const [approve] = useApproveEmployeeAttendanceMutation();

    const pending = data?.pending || [];

    const handleApprove = async (id) => {
        await approve({ attendanceId: id });
    };

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Pending Approvals</h1>

            {pending.map((att) => (
                <div key={att._id} className="p-4 border rounded-xl mb-3 shadow">
                    <h2 className="font-bold">{att.employeeId?.name}</h2>
                    <p>{att.status}</p>
                    <p>In: {att.timeIn} | Out: {att.timeOut}</p>

                    <button
                        onClick={() => handleApprove(att._id)}
                        className="mt-2 px-4 py-2 bg-green-600 text-white rounded"
                    >
                        Approve
                    </button>
                </div>
            ))}
        </div>
    );
}
