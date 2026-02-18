import React, { useState } from "react";

export default function WorkOrderPage() {
  const [tasks, setTasks] = useState([
    { id: 1, name: "RCC", unit: "m", rate: 20, gst: "0%", amount: 2000 },
    { id: 2, name: "PCC", unit: "sft", rate: 30, gst: "0%", amount: 30000 },
  ]);

  const handleChange = (id, field, value) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id
          ? {
              ...task,
              [field]: value,
              amount: field === "rate" ? value * 1000 : task.amount,
            }
          : task
      )
    );
  };

  const totalValue = tasks.reduce((sum, t) => sum + t.amount, 0);
  const gstValue = totalValue * 0.18; // Example 18% GST
  const totalAmount = totalValue + gstValue;

  return (
    <div className="p-6 bg-gray-50 min-h-screen ">
      {/* 🧱 Task Section */}
     
    </div>
  );
}
