import React from "react";
import {
    useGetPendingLabourAttendanceQuery,
    useApproveLabourAttendanceMutation
} from "../../Reduxe/Api";

export default function PendingApprovals() {
    const { data, isLoading, refetch } = useGetPendingLabourAttendanceQuery();
    const [approve] = useApproveLabourAttendanceMutation();

    const list = data?.data || [];

    const handleApprove = async (id) => {
        await approve({ attendanceId: id });
// /        await approve({ attendanceId: id });

        // approve({ attendanceId: id })

        refetch();
    };

    const handleApproveAll = async () => {
        if (list.length === 0) return alert("No items to approve");

        for (const item of list) {
            await approve({ attendanceId: item._id });
        }

        alert("All Approved ✔");
        refetch();
    };

    if (isLoading)
        return <p className="text-center py-6 text-gray-600">Loading...</p>;

    return (
        <div className="max-w-3xl mx-auto p-4">
            <h2 className="text-xl font-semibold mb-4">
                Pending Labour Approvals
            </h2>

            {/* APPROVE ALL BUTTON */}
            {list.length > 0 && (
                <button
                    onClick={handleApproveAll}
                    className="mb-4 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                >
                    Approve All ✔
                </button>
            )}

            {list.length === 0 ? (
                <p className="text-gray-500">No Pending Items</p>
            ) : (
                <div className="space-y-3">
                    {list.map((l) => (
                        <div
                            key={l._id}
                            className="border border-gray-300 rounded-lg p-4 flex justify-between items-center"
                        >
                            <div>
                                <p className="font-semibold">{l.labourId?.name}</p>
                                <p className="text-sm text-gray-600">
                                    Status: {l.status}
                                </p>
                                <p className="text-xs text-gray-500">
                                    Marked By: {l.markedBy?.name}
                                </p>
                            </div>

                            <button
                                onClick={() => handleApprove(l._id)}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                            >
                                Approve
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
