import React, { useState } from "react";
import {
  useGetLaboursByProjectQuery,
  useMarkSingleLabourMutation
} from "../../Reduxe/Api";

export default function SingleMark() {
  const projectId = localStorage.getItem("projectId");
  const { data } = useGetLaboursByProjectQuery(projectId);
  const [markSingle] = useMarkSingleLabourMutation();

  const [selected, setSelected] = useState("");
  const [status, setStatus] = useState("Present");

  const submit = async () => {
    if (!selected) return alert("Select labour");
    await markSingle({
      projectId,
      labourId: selected,
      status,
    });
    alert("Attendance Saved!");
  };

  return (
    <div style={{ maxWidth: 600, margin: "20px auto", padding: 10 }}>
      <h2>Mark Single Attendance</h2>

      <select
        onChange={(e) => setSelected(e.target.value)}
        style={{ padding: 10, width: "100%", marginBottom: 12 }}
      >
        <option>Select Labour</option>
        {data?.data?.map((l) => (
          <option key={l.labourId._id} value={l.labourId._id}>
            {l.labourId.name}
          </option>
        ))}
      </select>

      <select
        onChange={(e) => setStatus(e.target.value)}
        style={{ padding: 10, width: "100%", marginBottom: 12 }}
      >
        <option value="Present">Present</option>
        <option value="Absent">Absent</option>
        <option value="Half-Day">Half Day</option>
      </select>

      <button
        onClick={submit}
        style={{
          background: "#10b981",
          color: "white",
          padding: "10px 16px",
          borderRadius: 6,
          border: "none",
          width: "100%",
        }}
      >
        Save Attendance
      </button>
    </div>
  );
}
