import React from "react";
import { useGetTodaysPresentLaboursQuery } from "../../Reduxe/Api";
import { Phone, HardHat, CalendarCheck2, Loader2, Users } from "lucide-react";
import { getInitials, getAvatarGradient } from "../../helper/avatar";

export default function LabourList() {
  const { data, isLoading } = useGetTodaysPresentLaboursQuery();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] gap-3 text-gray-500">
        <Loader2 className="animate-spin" size={22} />
        <p className="text-sm">Loading present labour...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6">
      <div className="flex items-center gap-2 mb-6">
        <CalendarCheck2 className="text-indigo-600" size={22} />
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Present Labour Today</h2>
      </div>

      {data?.length === 0 && (
        <div className="text-center py-14 bg-white rounded-2xl border border-dashed border-gray-200">
          <Users className="mx-auto text-gray-300 mb-3" size={28} />
          <p className="text-gray-500">No labour present today.</p>
        </div>
      )}

      <div className="space-y-3">
        {data?.map((record) => {
          const labour = record.labourId;

          return (
            <div
              key={record._id}
              className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm shadow-gray-200/60 hover:shadow-md transition-shadow"
            >
              <div
                className={`w-12 h-12 shrink-0 rounded-xl flex items-center justify-center text-white font-semibold bg-gradient-to-br ${getAvatarGradient(labour?.name)}`}
              >
                {getInitials(labour?.name)}
              </div>

              <div className="min-w-0 flex-1">
                <p className="font-semibold text-gray-800 truncate">{labour?.name}</p>
                {labour?.phone && (
                  <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-0.5">
                    <Phone size={12} /> {labour.phone}
                  </p>
                )}
                <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1.5 text-xs text-gray-400">
                  {labour?.skillLevel && (
                    <span className="flex items-center gap-1">
                      <HardHat size={11} /> {labour.skillLevel}
                    </span>
                  )}
                  {labour?.labourType && <span>{labour.labourType}</span>}
                  {labour?.category && <span>{labour.category}</span>}
                </div>
              </div>

              {(labour?.dailyWage || labour?.monthlySalary) && (
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-emerald-600">
                    ₹{labour?.dailyWage || labour?.monthlySalary}
                  </p>
                  <p className="text-[10px] text-gray-400">{labour?.dailyWage ? "per day" : "per month"}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
