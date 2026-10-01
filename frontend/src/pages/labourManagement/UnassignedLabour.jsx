import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserX,
  Search,
  FolderKanban,
  Calendar,
  CheckCircle,
  HardHat,
  Phone,
  Eye,
  ChevronLeft,
  ChevronRight,
  Loader2,
  X,
  CheckSquare,
  Square,
  Sparkles,
} from "lucide-react";
import {
  useGetUnassignedLaboursQuery,
  useGetProjectsQuery,
  useAssignLabourToProjectMutation,
  useAssignLabourMutation,
} from "../../Reduxe/Api";
import { getInitials, getAvatarGradient } from "../../helper/avatar";
import { CheckRole } from "../../helper/CheckRole";

const PAGE_SIZE = 10;

export default function UnassignedLabour() {
  const navigate = useNavigate();
  const { role } = CheckRole();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [labourType, setLabourType] = useState("");

  const [selectedIds, setSelectedIds] = useState([]);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [targetLabour, setTargetLabour] = useState(null); // null = bulk mode

  const [modalProjectId, setModalProjectId] = useState("");
  const [modalDate, setModalDate] = useState(new Date().toISOString().split("T")[0]);
  const [modalRemarks, setModalRemarks] = useState("");

  const { data, isFetching, refetch } = useGetUnassignedLaboursQuery({
    page,
    limit: PAGE_SIZE,
    search: search.trim() || undefined,
    category: category || undefined,
    labourType: labourType || undefined,
  });

  const { data: projectResp } = useGetProjectsQuery();
  const projects = projectResp?.data || projectResp || [];

  const [assignLabourToProject, { isLoading: isAssigningSingle }] = useAssignLabourToProjectMutation();
  const [assignLabourBulk, { isLoading: isAssigningBulk }] = useAssignLabourMutation();

  const labours = data?.data || [];
  const pagination = data?.pagination || {};
  const totalRecords = pagination.total || labours.length;
  const totalPages = pagination.totalPages || Math.ceil(totalRecords / PAGE_SIZE) || 1;

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === labours.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(labours.map((l) => l._id));
    }
  };

  const openSingleAssign = (labour) => {
    setTargetLabour(labour);
    setModalProjectId("");
    setModalDate(new Date().toISOString().split("T")[0]);
    setModalRemarks("");
    setAssignModalOpen(true);
  };

  const openBulkAssign = () => {
    if (selectedIds.length === 0) {
      toast.error("Please select at least one worker to assign");
      return;
    }
    setTargetLabour(null);
    setModalProjectId("");
    setModalDate(new Date().toISOString().split("T")[0]);
    setModalRemarks("");
    setAssignModalOpen(true);
  };

  const handleConfirmAssign = async (e) => {
    e.preventDefault();
    if (!modalProjectId) {
      toast.error("Please select a target project");
      return;
    }

    try {
      if (targetLabour) {
        // Single assignment
        await assignLabourToProject({
          labourId: targetLabour._id,
          projectId: modalProjectId,
          assignmentDate: modalDate,
          remarks: modalRemarks,
        }).unwrap();
        toast.success(`${targetLabour.name} assigned to project successfully`);
      } else {
        // Bulk assignment
        await assignLabourBulk({
          projectId: modalProjectId,
          labourIds: selectedIds,
        }).unwrap();
        toast.success(`${selectedIds.length} workers assigned successfully`);
        setSelectedIds([]);
      }
      setAssignModalOpen(false);
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || "Failed to assign worker(s)");
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-lg shadow-orange-900/20">
            <UserX size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              Unassigned Labour Pool
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                {totalRecords} Available
              </span>
            </h1>
            <p className="text-sm text-gray-500">
              Active workers not currently assigned to any project. Select and allocate to active project sites.
            </p>
          </div>
        </div>

        {role !== "supervisor" && (
          <button
            onClick={openBulkAssign}
            disabled={selectedIds.length === 0}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 shadow-lg shadow-indigo-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Sparkles size={16} />
            Assign Selected {selectedIds.length > 0 && `(${selectedIds.length})`}
          </button>
        )}
      </div>

      {/* Filters bar */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm shadow-gray-200/50 p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, phone..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          />
        </div>

        <select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setPage(1);
          }}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white outline-none focus:ring-2 focus:ring-indigo-500 text-gray-700"
        >
          <option value="">All Categories</option>
          <option value="Labour">Labour</option>
          <option value="Mistri">Mistri</option>
          <option value="Operator">Operator</option>
        </select>

        <select
          value={labourType}
          onChange={(e) => {
            setLabourType(e.target.value);
            setPage(1);
          }}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white outline-none focus:ring-2 focus:ring-indigo-500 text-gray-700"
        >
          <option value="">All Labour Types</option>
          <option value="Permanent Labour">Permanent Labour</option>
          <option value="Permanent Mistri">Permanent Mistri</option>
          <option value="Contract Labour">Contract Labour</option>
          <option value="Contract Mistri">Contract Mistri</option>
          <option value="Permanent Operator">Permanent Operator</option>
          <option value="Contract Operator">Contract Operator</option>
        </select>

        <div className="flex items-center justify-end gap-2 text-xs text-gray-500 pr-1">
          <button
            onClick={() => {
              setSearch("");
              setCategory("");
              setLabourType("");
              setPage(1);
            }}
            className="text-indigo-600 hover:text-indigo-800 font-medium"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Table Content */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm shadow-gray-200/50 overflow-hidden">
        {isFetching ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-500">
            <Loader2 className="animate-spin text-indigo-600" size={24} />
            <p className="text-sm">Fetching unassigned labour pool...</p>
          </div>
        ) : labours.length === 0 ? (
          <div className="text-center py-20 px-4">
            <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
              <CheckCircle size={28} />
            </div>
            <h3 className="text-base font-bold text-gray-800">No Unassigned Labour Found</h3>
            <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
              All active workers are currently assigned to active project sites, or no workers match your search filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 text-[11px] font-bold uppercase tracking-wider text-gray-500 border-b border-gray-100">
                  {role !== "supervisor" && (
                    <th className="py-3 px-4 w-10 text-center">
                      <button
                        onClick={toggleSelectAll}
                        className="text-gray-400 hover:text-indigo-600 transition-colors"
                      >
                        {selectedIds.length === labours.length && labours.length > 0 ? (
                          <CheckSquare size={16} className="text-indigo-600" />
                        ) : (
                          <Square size={16} />
                        )}
                      </button>
                    </th>
                  )}
                  <th className="py-3 px-4">Worker</th>
                  <th className="py-3 px-4">Category & Type</th>
                  <th className="py-3 px-4">Daily Wage</th>
                  <th className="py-3 px-4">Joining Date</th>
                  <th className="py-3 px-4">Skills</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {labours.map((labour) => {
                  const isSelected = selectedIds.includes(labour._id);

                  return (
                    <tr
                      key={labour._id}
                      className={`hover:bg-indigo-50/20 transition-colors ${
                        isSelected ? "bg-indigo-50/40" : ""
                      }`}
                    >
                      {role !== "supervisor" && (
                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={() => toggleSelect(labour._id)}
                            className="text-gray-400 hover:text-indigo-600 transition-colors"
                          >
                            {isSelected ? (
                              <CheckSquare size={16} className="text-indigo-600" />
                            ) : (
                              <Square size={16} />
                            )}
                          </button>
                        </td>
                      )}

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold bg-gradient-to-br ${getAvatarGradient(
                              labour.name
                            )} shadow-sm shrink-0`}
                          >
                            {getInitials(labour.name)}
                          </div>
                          <div>
                            <span
                              onClick={() => navigate(`/LabourDetail/${labour._id}`)}
                              className="font-semibold text-gray-900 hover:text-indigo-600 cursor-pointer transition-colors block"
                            >
                              {labour.name}
                            </span>
                            {labour.fatherName && (
                              <p className="text-[11px] text-gray-400">S/O {labour.fatherName}</p>
                            )}
                            {labour.phone && (
                              <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                <Phone size={10} /> {labour.phone}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <span className="inline-block px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
                            {labour.category || "General"}
                          </span>
                          <p className="text-xs text-gray-500">{labour.labourType || "Contract"}</p>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-emerald-700">
                        {labour.dailyWage ? `₹${labour.dailyWage}/day` : labour.monthlySalary ? `₹${labour.monthlySalary}/mo` : "-"}
                      </td>

                      <td className="py-3.5 px-4 text-xs text-gray-500">
                        {labour.joiningDate
                          ? new Date(labour.joiningDate).toLocaleDateString()
                          : labour.createdAt
                          ? new Date(labour.createdAt).toLocaleDateString()
                          : "-"}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1 max-w-[180px]">
                          {Array.isArray(labour.skills) && labour.skills.length > 0 ? (
                            labour.skills.slice(0, 2).map((sk, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-600"
                              >
                                {sk}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-gray-400">Standard</span>
                          )}
                          {Array.isArray(labour.skills) && labour.skills.length > 2 && (
                            <span className="text-[10px] text-gray-400">+{labour.skills.length - 2}</span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                          Unassigned
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {role !== "supervisor" && (
                            <button
                              onClick={() => openSingleAssign(labour)}
                              className="px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-colors"
                            >
                              Assign
                            </button>
                          )}
                          <button
                            onClick={() => navigate(`/LabourDetail/${labour._id}`)}
                            title="View Full Profile & History"
                            className="p-1.5 rounded-lg text-gray-500 hover:text-indigo-600 hover:bg-gray-100 transition-colors"
                          >
                            <Eye size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3.5 border-t border-gray-100 bg-gray-50/50 text-xs text-gray-600">
          <span>
            Showing {labours.length} of {totalRecords} unassigned workers
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-1.5 rounded-lg border border-gray-200 hover:bg-white disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="font-semibold text-gray-700">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-1.5 rounded-lg border border-gray-200 hover:bg-white disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Assignment Modal */}
      <AnimatePresence>
        {assignModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 border border-gray-100"
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                    <FolderKanban size={18} />
                  </div>
                  <h3 className="font-bold text-gray-900">
                    {targetLabour ? `Assign ${targetLabour.name}` : `Bulk Assign (${selectedIds.length} Workers)`}
                  </h3>
                </div>
                <button
                  onClick={() => setAssignModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleConfirmAssign} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Target Project *
                  </label>
                  <select
                    required
                    value={modalProjectId}
                    onChange={(e) => setModalProjectId(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="">Select Target Project</option>
                    {projects.map((proj) => (
                      <option key={proj._id} value={proj._id}>
                        {proj.projectName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Assignment Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={modalDate}
                    onChange={(e) => setModalDate(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Remarks / Assignment Note (Optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Assigned for foundation civil works"
                    value={modalRemarks}
                    onChange={(e) => setModalRemarks(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setAssignModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isAssigningSingle || isAssigningBulk}
                    className="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-900/20 disabled:opacity-50 transition-all flex items-center gap-1.5"
                  >
                    {isAssigningSingle || isAssigningBulk ? (
                      <>
                        <Loader2 size={14} className="animate-spin" /> Assigning...
                      </>
                    ) : (
                      "Confirm Assignment"
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
