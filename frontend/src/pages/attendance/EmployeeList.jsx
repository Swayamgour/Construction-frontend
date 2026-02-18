import React, { useState } from "react";
import { useGetEmployeeListQuery } from "../../Redux/Api";
import { useNavigate } from "react-router-dom";

export default function EmployeeList() {
    const { data, isLoading } = useGetEmployeeListQuery();
    const navigate = useNavigate();
    const [search, setSearch] = useState("");

    if (isLoading) return <p>Loading...</p>;

    const employees = data?.employees || [];

    const filtered = employees.filter((e) =>
        e.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Employees</h1>

            <input
                type="text"
                placeholder="Search Employee..."
                className="w-full mb-3 p-2 border rounded"
                onChange={(e) => setSearch(e.target.value)}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {filtered.map((emp) => (
                    <div
                        key={emp._id}
                        className="p-4 border rounded-xl shadow cursor-pointer"
                        onClick={() => navigate(`/attendance/employee/mark/${emp._id}`)}
                    >
                        <h2 className="text-lg font-semibold">{emp.name}</h2>
                        <p className="text-gray-500">{emp.phone}</p>
                        <p className="text-blue-600 font-medium">{emp.role}</p>

                        <button
                            className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg"
                        >
                            Mark Attendance
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
