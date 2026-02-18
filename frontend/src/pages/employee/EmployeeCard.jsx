import React from "react";

export default function EmployeeCard({ employee, onSelect }) {
  // Format date to readable string
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Format time to readable string
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calculate work hours in HH:MM format
  const formatWorkHours = (hours) => {
    if (hours === 0) return "0h";
    const totalMinutes = Math.round(hours * 60);
    const hoursPart = Math.floor(totalMinutes / 60);
    const minutesPart = totalMinutes % 60;

    if (hoursPart === 0) return `${minutesPart}m`;
    if (minutesPart === 0) return `${hoursPart}h`;
    return `${hoursPart}h ${minutesPart}m`;
  };

  // Get status color classes
  const getStatusClasses = (status) => {
    switch (status) {
      case "Present":
        return "bg-green-500 text-white";
      case "Absent":
        return "bg-red-500 text-white";
      case "Half Day":
        return "bg-amber-500 text-white";
      case "Late":
        return "bg-orange-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  return (
    <div className="border border-gray-200 p-4 rounded-lg mb-3 bg-white shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="font-semibold text-lg mb-1">
            Employee ID: {employee.markedBy || "—"}
          </div>

          <div className="flex items-center gap-2 mb-1">
            <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusClasses(employee.status)}`}>
              {employee.status}
            </span>
            <div className="text-sm text-gray-500">
              {formatDate(employee.date)}
            </div>
          </div>
        </div>

        {/* {onSelect && (
          <button
            onClick={() => onSelect(employee)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md cursor-pointer text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Select
          </button>
        )} */}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm mb-3">
        <div>
          <div className="text-gray-500 text-xs mb-1">Time In</div>
          <div className="font-medium">{formatTime(employee.timeIn)}</div>
        </div>

        <div>
          <div className="text-gray-500 text-xs mb-1">Time Out</div>
          <div className="font-medium">
            {employee.timeOut ? formatTime(employee.timeOut) : "—"}
          </div>
        </div>

        <div>
          <div className="text-gray-500 text-xs mb-1">Work Hours</div>
          <div className="font-medium">{formatWorkHours(employee.workHours)}</div>
        </div>

        {/* <div>
          <div className="text-gray-500 text-xs mb-1">Approved By</div>
          <div className="font-medium">
            {employee.approvedBy ? `ID: ${employee.approvedBy}` : "Pending"}
          </div>
        </div> */}
      </div>

      {employee.selfie && (
        <div className="mt-3">
          <div className="text-gray-500 text-xs mb-1">Selfie</div>
          <a
            href={employee.selfie}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 text-sm no-underline flex items-center gap-1 hover:text-blue-800 hover:underline transition-colors"
          >
            View Selfie
            <span>→</span>
          </a>
        </div>
      )}
    </div>
  );
}