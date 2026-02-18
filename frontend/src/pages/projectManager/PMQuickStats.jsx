// src/components/PMQuickStats.jsx
import React from "react";

export default function PMQuickStats({stats}) {
  return (
    <div className="grid grid-cols-3 gap-3">
      <div className="bg-white p-3 rounded shadow text-center"><div className="text-sm">Active</div><div className="font-semibold">{stats.active}</div></div>
      <div className="bg-white p-3 rounded shadow text-center"><div className="text-sm">Pending Tasks</div><div className="font-semibold">{stats.pending}</div></div>
      <div className="bg-white p-3 rounded shadow text-center"><div className="text-sm">Materials Low</div><div className="font-semibold">{stats.materialsLow}</div></div>
    </div>
  );
}
