import React, { useState } from "react";
import { useParams } from "react-router-dom";
import {
    useGetEmployeeByIdQuery,
    useMarkEmployeeAttendanceMutation
} from "../../Redux/Api";

export default function MarkEmployeeAttendance() {
    const { employeeId } = useParams();
    const { data } = useGetEmployeeByIdQuery(employeeId);
    const [markAttendance] = useMarkEmployeeAttendanceMutation();

    const [status, setStatus] = useState("Present");
    const [timeIn, setTimeIn] = useState(new Date().toLocaleTimeString());
    const [timeOut, setTimeOut] = useState("");
    const [workHours, setWorkHours] = useState("");

    const handleSubmit = async () => {
        try {
            const res = await markAttendance({
                employeeId,
                status,
                timeIn,
                timeOut,
                workHours
            }).unwrap();

            alert("Attendance marked!");
        } catch (err) {
            alert(err?.data?.message);
        }
    };

    const emp = data?.employee;

    return (
        <div className="p-5 max-w-xl mx-auto">
            <h2 className="text-2xl font-bold mb-3">Mark Attendance</h2>

            <div className="p-4 border rounded-xl shadow bg-white">
                <h3 className="font-bold text-lg">{emp?.name}</h3>
                <p>{emp?.phone}</p>
                <p className="text-gray-500">{emp?.role}</p>

                <div className="mt-4">
                    <label>Status</label>
                    <select
                        className="w-full p-2 border rounded"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                    >
                        <option>Present</option>
                        <option>Absent</option>
                        <option>Half-Day</option>
                    </select>
                </div>

                <div className="mt-3">
                    <label>Time In</label>
                    <input
                        type="time"
                        className="w-full p-2 border rounded"
                        onChange={(e) => setTimeIn(e.target.value)}
                    />
                </div>

                <div className="mt-3">
                    <label>Time Out</label>
                    <input
                        type="time"
                        className="w-full p-2 border rounded"
                        onChange={(e) => setTimeOut(e.target.value)}
                    />
                </div>

                <div className="mt-3">
                    <label>Work Hours</label>
                    <input
                        type="number"
                        className="w-full p-2 border rounded"
                        onChange={(e) => setWorkHours(e.target.value)}
                    />
                </div>

                <button
                    onClick={handleSubmit}
                    className="mt-5 w-full bg-blue-600 text-white py-2 rounded-lg"
                >
                    Submit Attendance
                </button>
            </div>
        </div>
    );
}
