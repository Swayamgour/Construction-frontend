import React from "react";
import { useGetTodaysPresentLaboursQuery } from "../../Reduxe/Api";

export default function LabourList() {

    const { data, isLoading } = useGetTodaysPresentLaboursQuery();

    if (isLoading) return <p>Loading...</p>;

    return (
        <div style={{ maxWidth: 600, margin: "20px auto", padding: 10 }}>
            <h2>Present Labour Today</h2>

            {data?.length === 0 && <p>No labour present today.</p>}

            {data?.map((record) => {

                const labour = record.labourId; // shortcut destructure

                return (
                    <div
                        key={record._id}
                        style={{
                            border: "1px solid #e5e7eb",
                            padding: 12,
                            borderRadius: 8,
                            marginBottom: 10
                        }}
                    >
                        <strong>{labour?.name}</strong>

                        <div>
                            📱 {labour?.phone}
                        </div>

                        <div style={{ fontSize: 12, color: "#6b7280" }}>
                            {labour?.skillLevel || "No skill info"}
                        </div>

                        <div style={{ fontSize: 11, color: "#9ca3af" }}>
                            Type: {labour?.labourType}
                        </div>

                        <div style={{ fontSize: 11, color: "#9ca3af" }}>
                            Category: {labour?.category}
                        </div>

                        <div style={{ fontSize: 11, color: "#9ca3af" }}>
                            Salary: {labour?.dailyWage || labour?.monthlySalary}
                        </div>

                    </div>
                )
            })}
        </div>
    );
}
