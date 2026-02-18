import React, { useState } from "react";
import { useMonthlyReportQuery } from "../../Reduxe/Api";

export default function MonthlyReport() {
    const projectId = localStorage.getItem("projectId");

    const [month, setMonth] = useState("");
    const [year, setYear] = useState("");

    const { data, isLoading, refetch } = useMonthlyReportQuery(
        { projectId, month, year },
        { skip: !month || !year }
    );

    const fetchData = () => {
        if (!month || !year) return alert("Select Month & Year");
        refetch();
    };

    return (
        <div style={{ maxWidth: 750, margin: "20px auto" }}>
            <h2>Monthly Attendance Report</h2>

            <div style={{ marginTop: 20, display: "flex", gap: 8 }}>
                <input
                    type="number"
                    placeholder="Month (1-12)"
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    style={{ padding: 10, width: 150 }}
                />

                <input
                    type="number"
                    placeholder="Year"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    style={{ padding: 10, width: 150 }}
                />

                <button
                    onClick={fetchData}
                    style={{
                        padding: "10px 14px",
                        background: "#2563eb",
                        color: "white",
                        borderRadius: 6,
                        border: "none"
                    }}
                >
                    Load
                </button>
            </div>

            {isLoading && <p>Loading...</p>}

            {data?.records?.map((rec) => (
                <div
                    key={rec._id}
                    style={{
                        padding: 12,
                        marginTop: 10,
                        border: "1px solid #ddd",
                        borderRadius: 6
                    }}
                >
                    <strong>{rec.labourId?.name}</strong> — {rec.status}
                    <div style={{ fontSize: 13, color: "#666" }}>
                        Date: {new Date(rec.date).toLocaleDateString()}
                    </div>
                </div>
            ))}
        </div>
    );
}
