import React, { useState } from "react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { HardHat, Phone, UserCheck, ArrowRightLeft, X, Loader2 } from "lucide-react";
import {
  useGetLabourQuery,
  useGetProjectsQuery,
  useAssignLabourMutation,
  useUnassignLabourMutation,
  useReassignLabourMutation,
} from "../Reduxe/Api";
import { getInitials, getAvatarGradient } from "../helper/avatar";

const AssignLabour = () => {
  const [projectId, setProjectId] = useState("");
  const [selectedLabours, setSelectedLabours] = useState([]);
  const [reassignLabourId, setReassignLabourId] = useState(null);
  const [newProjectId, setNewProjectId] = useState("");

  const { data: allLabours, isLoading } = useGetLabourQuery();
  const { data: Projects } = useGetProjectsQuery();
  let allProjects = Projects?.data || [];

  const [assignLabour] = useAssignLabourMutation();
  const [unassignLabour] = useUnassignLabourMutation();
  const [reassignLabour] = useReassignLabourMutation();

  const toggleSelect = (labour) => {
    if (labour.assignedProjects?.length > 0) return;

    setSelectedLabours((prev) =>
      prev.includes(labour._id) ? prev.filter((id) => id !== labour._id) : [...prev, labour._id]
    );
  };

  const handleProjectChange = (e) => {
    setProjectId(e.target.value);
    setSelectedLabours([]);
  };

  const handleSave = async () => {
    if (!projectId) return toast.error("Select a project");
    if (selectedLabours.length === 0) return toast.error("Select at least one labour");

    try {
      await assignLabour({ projectId, labourIds: selectedLabours }).unwrap();
      toast.success("Labours assigned!");
      setSelectedLabours([]);
      setProjectId("");
    } catch (err) {
      toast.error(err?.data?.message || "Failed to assign");
    }
  };

  const handleUnassign = async (labour) => {
    try {
      await unassignLabour({
        labourId: labour._id,
        projectId: labour.assignedProjects[0]?._id,
      }).unwrap();

      toast.success("Labour removed from project");
    } catch (err) {
      toast.error("Error removing");
    }
  };

  const handleReassign = async () => {
    if (!newProjectId) return toast.error("Select new project");

    try {
      await reassignLabour({
        labourId: reassignLabourId,
        oldProjectId: allLabours?.find((l) => l._id === reassignLabourId)?.assignedProjects[0]?._id,
        newProjectId,
      }).unwrap();

      toast.success("Labour reassigned successfully");
      setReassignLabourId(null);
      setNewProjectId("");
    } catch (err) {
      toast.error("Failed to reassign");
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto min-h-screen pb-24 md:pb-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white">
            <HardHat size={18} />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Labour Project Manager</h1>
        </div>

        <button
          className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-6 py-2.5 rounded-xl shadow-lg shadow-emerald-900/20 hidden md:block font-medium transition-all"
          onClick={handleSave}
        >
          Assign Worker
        </button>
      </div>

      {/* SELECT PROJECT */}
      <select
        className="border border-gray-200 p-3 rounded-xl w-full mb-6 bg-white shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
        value={projectId}
        onChange={handleProjectChange}
      >
        <option value="">Select Project</option>
        {allProjects?.map((proj) => (
          <option key={proj._id} value={proj._id}>
            {proj.projectName}
          </option>
        ))}
      </select>

      {/* LABOUR TABLE */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-500">
          <Loader2 className="animate-spin" size={22} />
          <p className="text-sm">Loading labour...</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100">
          <table className="w-full border-collapse bg-white">
            <thead>
              <tr className="bg-gray-50/70 text-left text-xs uppercase tracking-wide text-gray-500">
                <th className="p-3.5 w-12 text-center">Select</th>
                <th className="p-3.5">Name</th>
                <th className="p-3.5">Phone</th>
                <th className="p-3.5">Type</th>
                <th className="p-3.5">Wage</th>
                <th className="p-3.5 text-center">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {allLabours?.map((labour) => {
                const isAssigned = labour.assignedProjects?.length > 0;
                const assignedProj = labour.assignedProjects?.[0];
                const isSelected = selectedLabours.includes(labour._id);

                return (
                  <tr
                    key={labour._id}
                    className={`transition-colors ${
                      isAssigned ? "bg-gray-50/60" : isSelected ? "bg-emerald-50/60" : "hover:bg-indigo-50/30"
                    }`}
                  >
                    <td className="p-3.5 text-center">
                      <input
                        type="checkbox"
                        disabled={isAssigned}
                        checked={isSelected}
                        onChange={() => toggleSelect(labour)}
                        className="w-4 h-4 accent-indigo-600"
                      />
                    </td>

                    <td className="p-3.5">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 shrink-0 rounded-lg flex items-center justify-center text-white text-xs font-semibold bg-gradient-to-br ${getAvatarGradient(labour.name)}`}
                        >
                          {getInitials(labour.name)}
                        </div>
                        <span className="font-semibold text-gray-800">{labour.name}</span>
                      </div>
                    </td>

                    <td className="p-3.5 text-gray-600">
                      <span className="flex items-center gap-1.5">
                        <Phone size={12} className="text-gray-400" /> {labour.phone}
                      </span>
                    </td>

                    <td className="p-3.5 text-gray-600">{labour.labourType}</td>

                    <td className="p-3.5 font-medium text-gray-700">
                      {labour.wageType === "Monthly" ? `₹${labour.monthlySalary}/month` : `₹${labour.dailyWage}/day`}
                    </td>

                    <td className="p-3.5 text-center">
                      {isAssigned ? (
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => handleUnassign(labour)}
                            className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-medium transition-colors"
                          >
                            Unassign
                          </button>
                          <button
                            onClick={() => setReassignLabourId(labour._id)}
                            className="px-3 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-1"
                          >
                            <ArrowRightLeft size={11} /> Reassign
                          </button>
                        </div>
                      ) : (
                        <span className="px-3 py-1 text-xs bg-emerald-50 text-emerald-700 rounded-full font-medium inline-flex items-center gap-1">
                          <UserCheck size={11} /> Available
                        </span>
                      )}

                      {assignedProj && (
                        <p className="text-xs mt-1.5 text-gray-500">
                          Assigned → <span className="font-medium">{assignedProj.projectName}</span>
                        </p>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* MOBILE SAVE BUTTON */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-white shadow-2xl shadow-black/10 border-t border-gray-100">
        <button
          onClick={handleSave}
          className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white w-full py-3 rounded-xl font-semibold shadow-lg shadow-emerald-900/20"
        >
          Save Assignment
        </button>
      </div>

      {/* REASSIGN POPUP */}
      <AnimatePresence>
        {reassignLabourId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 px-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white p-6 rounded-2xl w-full max-w-sm shadow-2xl relative"
            >
              <button
                onClick={() => setReassignLabourId(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
              <h2 className="text-lg font-bold mb-4 text-gray-800">Reassign Labour</h2>

              <select
                className="border border-gray-200 p-3 rounded-xl w-full mb-4 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                value={newProjectId}
                onChange={(e) => setNewProjectId(e.target.value)}
              >
                <option value="">Select New Project</option>
                {allProjects?.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.projectName}
                  </option>
                ))}
              </select>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setReassignLabourId(null)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-700 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReassign}
                  className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl font-medium shadow-md shadow-indigo-900/20"
                >
                  Reassign
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AssignLabour;
