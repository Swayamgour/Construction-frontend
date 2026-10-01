import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { HardHat, Wrench, Phone, Plus, Users, AlertCircle } from "lucide-react";
import { useGetLabourQuery } from "../../Reduxe/Api";
import { getAvatarGradient } from "../../helper/avatar";

const STAT_STYLES = {
  "Permanent Labour": { chip: "from-blue-500 to-indigo-600", text: "text-blue-700", bg: "bg-blue-50" },
  "Permanent Mistri": { chip: "from-indigo-500 to-violet-600", text: "text-indigo-700", bg: "bg-indigo-50" },
  "Contract Labour": { chip: "from-emerald-500 to-teal-600", text: "text-emerald-700", bg: "bg-emerald-50" },
  "Contract Mistri": { chip: "from-orange-500 to-amber-600", text: "text-orange-700", bg: "bg-orange-50" },
};

const LabourCard = ({ labour, onClick }) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -8 }}
    onClick={onClick}
    className="p-5 bg-white shadow-sm shadow-gray-200/60 rounded-2xl border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer"
  >
    <div className="flex justify-between items-start gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <div
          className={`w-11 h-11 shrink-0 rounded-xl flex items-center justify-center text-white bg-gradient-to-br ${getAvatarGradient(labour.name)}`}
        >
          {labour.labourType?.includes("Mistri") ? <Wrench size={18} /> : <HardHat size={18} />}
        </div>
        <div className="min-w-0">
          <h3 className="text-base font-bold text-gray-800 truncate">{labour.name}</h3>
          <p className="text-xs text-gray-400">{labour.labourType}</p>
        </div>
      </div>
      <span
        className={`px-2.5 py-1 rounded-full text-xs font-semibold shrink-0 ${
          labour.status === "Active" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
        }`}
      >
        {labour.status}
      </span>
    </div>

    {labour.phone && (
      <p className="text-sm text-gray-500 mt-3 flex items-center gap-1.5">
        <Phone size={13} /> {labour.phone}
      </p>
    )}

    <div className="mt-3 pt-3 border-t border-gray-50">
      <p className="font-semibold text-gray-700 text-sm">
        {labour.wageType === "Daily"
          ? `₹${labour.dailyWage} / day`
          : `₹${labour.monthlySalary} / month`}
      </p>
    </div>
  </motion.div>
);

const LabourDashboard = () => {
  const { data, isLoading, isError } = useGetLabourQuery();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("All");

  const labours = data || [];

  const groups = useMemo(
    () => ({
      "Permanent Labour": labours.filter((l) => l.labourType === "Permanent Labour"),
      "Permanent Mistri": labours.filter((l) => l.labourType === "Permanent Mistri"),
      "Contract Labour": labours.filter((l) => l.labourType === "Contract Labour"),
      "Contract Mistri": labours.filter((l) => l.labourType === "Contract Mistri"),
    }),
    [labours]
  );

  const tabs = ["All", ...Object.keys(groups)];
  const visibleLabours = activeTab === "All" ? labours : groups[activeTab] || [];

  if (isLoading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center h-[60vh] gap-3 text-gray-500">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p>Loading labour data...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 flex flex-col items-center justify-center h-[60vh] gap-2 text-red-500">
        <AlertCircle size={28} />
        <p>Failed to load labour data</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-slate-900 to-indigo-700 bg-clip-text text-transparent">
            Labour Management
          </h1>
          <p className="text-gray-500 mt-1">View and manage all labour types</p>
        </div>

        <button
          onClick={() => navigate("/LabourForm")}
          className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-900/20 transition-all flex items-center justify-center gap-2 w-fit"
        >
          <Plus size={16} /> Add New Labour
        </button>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm shadow-gray-200/60 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white">
            <Users size={18} />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">Total Labour</p>
            <p className="text-2xl font-bold text-gray-800">{labours.length}</p>
          </div>
        </div>
        {Object.entries(groups).map(([label, list]) => {
          const s = STAT_STYLES[label];
          return (
            <div key={label} className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm shadow-gray-200/60 flex items-center gap-4">
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${s.chip} flex items-center justify-center text-white`}>
                {label.includes("Mistri") ? <Wrench size={18} /> : <HardHat size={18} />}
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium">{label}</p>
                <p className="text-2xl font-bold text-gray-800">{list.length}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeTab === tab
                ? "bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md shadow-indigo-900/20"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            {tab} {tab !== "All" && `(${groups[tab]?.length || 0})`}
            {tab === "All" && `(${labours.length})`}
          </button>
        ))}
      </div>

      {/* List */}
      <AnimatePresence mode="popLayout">
        {visibleLabours.length > 0 ? (
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {visibleLabours.map((labour) => (
              <LabourCard key={labour._id} labour={labour} onClick={() => navigate(`/LabourDetail/${labour._id}`)} />
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
            <Users className="mx-auto text-gray-300 mb-3" size={32} />
            <p className="text-gray-500">No labour found in this category.</p>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LabourDashboard;
