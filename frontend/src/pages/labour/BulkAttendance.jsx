import React, { useState } from "react";
import {
    useGetLaboursByProjectQuery,
    useBulkMarkLabourMutation
} from "../../Reduxe/Api";

export default function BulkAttendance() {
    const projectId = "692816c1c801849185620f8f";
    const { data, isLoading } = useGetLaboursByProjectQuery('692816c1c801849185620f8f');
    const [bulkMark] = useBulkMarkLabourMutation();

    const [attendance, setAttendance] = useState([]);

    const setStatus = (labourId, status) => {
        setAttendance((prev) => {
            const exists = prev.find((p) => p.labourId === labourId);

            if (exists) {
                return prev.map((p) =>
                    p.labourId === labourId ? { labourId, status } : p
                );
            }
            return [...prev, { labourId, status }];
        });
    };

    const selectAll = (status) => {
        const mapped = data.map((l) => ({ labourId: l._id, status }));
        setAttendance(mapped);
    };

    const submit = async () => {
        if (attendance.length === 0) return alert("Please select attendance");

        await bulkMark({ projectId, attendance });
        alert("Attendance Submitted ✔");
        setAttendance([]);
    };

    if (isLoading) return <p className="text-center mt-4">Loading...</p>;

    return (
        <div className="max-w-3xl mx-auto p-4">
            <h2 className="text-xl font-semibold mb-4">Bulk Labour Attendance</h2>

            {/* Top Buttons */}
            <div className="flex gap-4 mb-4">
                <button
                    onClick={() => selectAll("Present")}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg"
                >
                    Mark All Present
                </button>

                <button
                    onClick={() => selectAll("Absent")}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg"
                >
                    Mark All Absent
                </button>
            </div>

            {/* Labour List */}
            <div className="space-y-4">
                {data?.map((labour) => {
                    const selected = attendance.find((a) => a.labourId === labour._id);

                    return (
                        <div
                            key={labour._id}
                            className="border border-gray-300 p-4 rounded-lg flex justify-between items-center"
                        >
                            <div>
                                <p className="font-semibold text-lg">{labour.name}</p>
                                <p className="text-sm text-gray-600">📞 {labour.phone}</p>

                                <p className="text-sm text-gray-600">
                                    👷 <b>Type:</b> {labour.labourType}
                                </p>

                                <p className="text-sm text-gray-600">
                                    🎚 <b>Skill:</b> {labour.skillLevel}
                                </p>

                                <p className="text-sm text-gray-600">
                                    🧾 <b>Wage:</b> {labour.wageType}
                                    {labour.wageType === "Monthly" && (
                                        <span> — ₹{labour.monthlySalary}</span>
                                    )}
                                    {labour.wageType === "Daily" && (
                                        <span> — ₹{labour.dailyWage}</span>
                                    )}
                                </p>

                                <p className="text-sm text-gray-600">📌 {labour.address}</p>
                            </div>

                            {/* Buttons */}
                            <div className="flex flex-col gap-2">
                                <button
                                    onClick={() => setStatus(labour._id, "Present")}
                                    className={`px-4 py-2 rounded-lg  ${selected?.status === "Present"
                                        ? "bg-green-700 text-white"
                                        : "border border-green-700"
                                        }`}
                                >
                                    Present
                                </button>

                                <button
                                    onClick={() => setStatus(labour._id, "Absent")}
                                    className={`px-4 py-2 rounded-lg  ${selected?.status === "Absent"
                                        ? "bg-red-700 text-white"
                                        : "border border-red-700"
                                        }`}
                                >
                                    Absent
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Submit */}
            <button
                onClick={submit}
                className="mt-6 w-full bg-blue-600 text-white py-3 rounded-lg font-medium"
            >
                Submit Attendance
            </button>
        </div>
    );
}
