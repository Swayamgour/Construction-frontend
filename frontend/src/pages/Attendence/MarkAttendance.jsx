import React, { useState } from "react";
import toast from "react-hot-toast";
import { useGetLabourQuery, useAttendanceMarkMutation, useAssignProjectQuery } from "../../Reduxe/Api";

const MarkAttendance = () => {
    const [projectId, setProjectId] = useState("");
    const [attendance, setAttendance] = useState([]);
    const [markBulkAttendance] = useAttendanceMarkMutation();

    const { data: labourData, isFetching } = useGetLabourQuery();
    const { data: project } = useAssignProjectQuery()

    // const labourData = []

    // Update attendance state for each labour
    const handleChange = (labourId, field, value) => {
        setAttendance(prev =>
            prev.map(item =>
                item.labourId === labourId ? { ...item, [field]: value } : item
            )
        );
    };

    // On selecting project, prefill labour with default values
    const handleProjectSelect = (e) => {
        const id = e.target.value;
        setProjectId(id);

        if (labourData) {
            const arr = labourData?.map(l => ({
                labourId: l._id,
                status: "Present",
                timeIn: "",
                timeOut: "",
                overtimeHours: 0
            }));
            setAttendance(arr);
        }
    };

    const handleSubmit = async () => {
        try {
            await markBulkAttendance({ projectId, attendance }).unwrap();
            toast.success("Attendance marked successfully!");
        } catch (err) {
            toast.error(err?.data?.message || "Error marking attendance");
        }
    };

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">👷 Mark Bulk Attendance</h1>

            {/* Select Project */}
            <select
                className="border p-3 rounded-lg w-full mb-6"
                value={projectId}
                onChange={handleProjectSelect}
            >
                {/* <option value="">Select Project</option> */}
                {project?.map(proj => (
                    <option key={proj._id} value={proj._id}>
                        {proj.projectName}
                    </option>
                ))}
                {/* Dynamic Project Options */}
            </select>

            {isFetching && <p className="text-gray-500">Loading labour...</p>}

            {/* Attendance Table */}
            {labourData && (
                <table className="w-full border-collapse shadow-md">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="p-3 border">Name</th>
                            <th className="p-3 border">Phone</th>
                            <th className="p-3 border">Status</th>
                            <th className="p-3 border">Time In</th>
                            <th className="p-3 border">Time Out</th>
                            <th className="p-3 border">OT (Hours)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {labourData?.map((labour, index) => (
                            <tr key={labour._id} className="border">
                                <td className="p-3">{labour.name}</td>
                                <td className="p-3">{labour.phone}</td>
                                <td className="p-3">
                                    <select
                                        className="border p-1 rounded"
                                        value={attendance[index]?.status}
                                        onChange={(e) => handleChange(labour._id, "status", e.target.value)}
                                    >
                                        <option value="Present">Present</option>
                                        <option value="Absent">Absent</option>
                                        <option value="Half-Day">Half Day</option>
                                    </select>
                                </td>
                                <td className="p-3">
                                    <input
                                        type="time"
                                        className="border p-1 rounded"
                                        onChange={(e) => handleChange(labour._id, "timeIn", e.target.value)}
                                    />
                                </td>
                                <td className="p-3">
                                    <input
                                        type="time"
                                        className="border p-1 rounded"
                                        onChange={(e) => handleChange(labour._id, "timeOut", e.target.value)}
                                    />
                                </td>
                                <td className="p-3">
                                    <input
                                        type="number"
                                        className="border p-1 rounded w-20"
                                        min={0}
                                        onChange={(e) => handleChange(labour._id, "overtimeHours", e.target.value)}
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {/* Submit Button */}
            {labourData && (
                <button
                    className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    onClick={handleSubmit}
                >
                    Save Attendance
                </button>
            )}
        </div>
    );
};

export default MarkAttendance;
