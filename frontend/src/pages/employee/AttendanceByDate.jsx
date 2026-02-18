import React, { useState } from "react";
import { useGetAttendanceByDateQuery } from "../../Reduxe/Api";

export default function AttendanceByDate() {
  const [date, setDate] = useState("");
  // skip query until date is selected
  const { data, isFetching, refetch } = useGetAttendanceByDateQuery(date, { skip: !date });
  console.log(data)

  const rows = data?.attendance || [];

  return (
    <div style={{ maxWidth: 900, margin: "24px auto", padding: 16 }}>
      <h2>Attendance — Date wise</h2>

      <div style={{ marginTop: 12, display: "flex", gap: 8, alignItems: "center" }}>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          style={{ padding: 8, borderRadius: 6, border: "1px solid #e5e7eb" }}
        />
        <button onClick={refetch} style={{ padding: "8px 12px" }}>Get</button>
      </div>

      <div style={{ marginTop: 16 }}>
        {isFetching ? (
          <p>Loading...</p>
        ) : rows.length === 0 ? (
          <p style={{ color: "#6b7280" }}>No attendance records for the selected date.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", borderBottom: "1px solid #e5e7eb" }}>
                <th style={{ padding: 8 }}>Employee</th>
                <th style={{ padding: 8 }}>Status</th>
                <th style={{ padding: 8 }}>Time In</th>
                <th style={{ padding: 8 }}>Time Out</th>
                <th style={{ padding: 8 }}>Work Hours</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r._id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                  <td style={{ padding: 8 }}>{r.employeeId?.name || "-"}</td>
                  <td style={{ padding: 8 }}>{r.status}</td>
                  <td style={{ padding: 8 }}>{r.timeIn ? new Date(r.timeIn).toLocaleTimeString() : "—"}</td>
                  <td style={{ padding: 8 }}>{r.timeOut ? new Date(r.timeOut).toLocaleTimeString() : "—"}</td>
                  <td style={{ padding: 8 }}>{r.workHours ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
