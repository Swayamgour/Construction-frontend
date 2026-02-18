import React from "react";
import { useGetEmployeeListQuery } from "../../Reduxe/Api";
import EmployeeCard from "./EmployeeCard";
import { Users, Loader2, Calendar } from "lucide-react";

export default function EmployeeList({ onSelect }) {
  const { data, isLoading, isError, error } = useGetEmployeeListQuery();

  const list = data?.employees || [];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="relative">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 blur-xl rounded-full"></div>
        </div>
        <p className="mt-4 text-gray-600 font-medium">Loading employee data...</p>
        <p className="text-sm text-gray-400 mt-2">Please wait a moment</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-6">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-4">
          <Users className="w-10 h-10 text-red-500" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Unable to Load Data</h3>
        <p className="text-gray-600 text-center mb-6">
          {error?.data?.message || "Failed to fetch employee list"}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (list.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-6">
        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-4">
          <Users className="w-10 h-10 text-blue-500" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">No Employees Found</h3>
        <p className="text-gray-600 text-center">
          There are no attendance records available for the selected date.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Employee Attendance</h1>
            <p className="text-gray-500 flex items-center gap-2 mt-1">
              <Calendar size={14} />
              Showing attendance records for all employees
            </p>
          </div>
        </div>

        {/* Stats summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="text-sm text-gray-500 mb-1">Total Records</div>
            <div className="text-2xl font-bold text-gray-900">{list.length}</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="text-sm text-gray-500 mb-1">Present Today</div>
            <div className="text-2xl font-bold text-emerald-600">
              {list.filter(e => e.status === "Present").length}
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="text-sm text-gray-500 mb-1">Pending Approval</div>
            <div className="text-2xl font-bold text-amber-600">
              {list.filter(e => !e.approvedBy).length}
            </div>
          </div>
        </div>
      </div>

      {/* Employee cards */}
      <div className="space-y-4">
        {list.map((emp) => (
          <EmployeeCard
            key={emp._id}
            employee={emp}
            onSelect={onSelect}
          />
        ))}
      </div>

      {/* Footer summary */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            Showing {list.length} employee attendance records
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded">
              Updated just now
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}