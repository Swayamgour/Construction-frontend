import React, { useState } from "react";
import { useGetEmployeeAttendanceByDateQuery } from "../../Redux/Api";

export default function EmployeeReport() {
    const [date, setDate] = useState("");
    const { data } = useGetEmployeeAttendanceByDateQuery({ date });

    return (
        <div className="p-4">
            <h1 className="text-xl font-bold">Employee Attendance Report</h1>

            <input
                type="date"
                className="p-2 border rounded mt-3"
                onChange={(e) => setDate(e.target.value)}
            />

            <div className="mt-4">
                {data?.records?.map((r) => (
                    <div key={r._id} className="p-3 border rounded mb-2">
                        <p>{r.employeeId?.name}</p>
                        <p>{r.status}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
