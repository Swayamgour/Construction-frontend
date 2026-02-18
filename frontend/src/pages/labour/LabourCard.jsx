import React from "react";
import { useGetLaboursByProjectQuery } from "../../Reduxe/Api";

export default function LabourList() {
  const projectId = localStorage.getItem("projectId");

  const { data, isLoading } = useGetLaboursByProjectQuery(projectId);

  if (isLoading) return <p>Loading...</p>;

  return (
    <div style={{ maxWidth: 600, margin: "20px auto" }}>
      <h2>Labours in Project</h2>

      {data?.data?.map((labour) => (
        <div
          key={labour.labourId._id}
          style={{
            padding: 12,
            border: "1px solid #ddd",
            borderRadius: 8,
            marginBottom: 10,
          }}
        >
          <strong>{labour.labourId.name}</strong>
          <div>{labour.labourId.phone}</div>
          <div style={{ color: "#666" }}>{labour.labourId.skillLevel}</div>
        </div>
      ))}
    </div>
  );
}
