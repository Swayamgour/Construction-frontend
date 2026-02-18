import React from "react";
import { useTodayReportQuery } from "../../Reduxe/Api";

export default function TodayReport() {
    const projectId = localStorage.getItem("projectId");

    const { data, isLoading } = useTodayReportQuery(projectId);

    if (isLoading) return <p>Loading Today Report...</p>;

    return (
        <div style={{ maxWidth: 750, margin: "20px auto" }}>
            <h2>Today Attendance Report</h2>

            <h3 style={{ marginTop: 20 }}>Labours</h3>
            {data?.labourAttendance?.length === 0 && <p>No labour records.</p>}

            {data?.labourAttendance?.map((l) => (
                <div
                    key={l._id}
                    style={{
                        padding: 10,
                        border: "1px solid #ddd",
                        marginBottom: 8,
                        borderRadius: 6
                    }}
                >
                    <strong>{l.labourId?.name}</strong> — {l.status}
                </div>
            ))}

            <h3 style={{ marginTop: 30 }}>Employees</h3>
            {data?.employeeAttendance?.length === 0 && <p>No employee records.</p>}

            {data?.employeeAttendance?.map((e) => (
                <div
                    key={e._id}
                    style={{
                        padding: 10,
                        border: "1px solid #ddd",
                        marginBottom: 8,
                        borderRadius: 6
                    }}
                >
                    <strong>{e.employeeId?.name}</strong> — {e.status}
                </div>
            ))}
        </div>
    );
}
