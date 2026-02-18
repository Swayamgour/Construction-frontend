import React, { useState } from "react";
import {
  useGetMachinesQuery,
  useAllocateMachineMutation,
  useReleaseMachineMutation,
  useGetAllocationsQuery,
} from "../../Reduxe/Api";
import { useAssignProjectQuery } from "../../Reduxe/Api";
import {
  FiCheckCircle,
  FiUnlock,
  FiPlus,
  FiTruck,
  FiCalendar,
  FiUser,
  FiPackage,
  FiClock,
  FiRefreshCw
} from "react-icons/fi";
import { toast } from "react-hot-toast";

export default function MachineAllocation() {
  const { data: machinesData = [] } = useGetMachinesQuery();
  const { data: projectsData = [] } = useAssignProjectQuery();
  const { data: allocations = [], isLoading } = useGetAllocationsQuery();

  const [allocateMachine] = useAllocateMachineMutation();
  const [releaseMachine] = useReleaseMachineMutation();

  const [form, setForm] = useState({
    machineId: "",
    projectId: "",
    operatorName: "",
    startDate: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAllocate = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await allocateMachine(form).unwrap();
      setForm({ machineId: "", projectId: "", operatorName: "", startDate: "" });
      toast.success("Machine allocated successfully!");
    } catch (error) {
      toast.error("Failed to allocate machine");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRelease = async (allocationId) => {
    try {
      await releaseMachine({ allocationId, endDate: new Date() }).unwrap();
      toast.success("Machine released successfully!");
    } catch (error) {
      toast.error("Failed to release machine");
    }
  };

  const activeAllocations = allocations.data?.filter(a => a.status !== "Released") || [];
  const releasedAllocations = allocations.data?.filter(a => a.status === "Released") || [];

  return (
    <div className="min-h-screen bg-gray-50/30 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-blue-100 rounded-lg">
            <FiTruck className="text-2xl text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Machine Allocation</h1>
        </div>
        <p className="text-gray-600">Manage machine assignments to projects and track allocations</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Allocation Form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <FiPlus className="text-xl" /> Allocate New Machine
              </h3>
            </div>

            <form onSubmit={handleAllocate} className="p-6 space-y-4">
              {/* Machine Selection */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <FiPackage className="text-gray-400" />
                  Select Machine
                </label>
                <select
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                  value={form.machineId}
                  required
                  onChange={(e) => setForm({ ...form, machineId: e.target.value })}
                >
                  <option value="">Choose a machine...</option>
                  {machinesData?.data?.map((m) => (
                    <option key={m._id} value={m._id}>
                      {m.name} • {m.machineType}
                    </option>
                  ))}
                </select>
              </div>

              {/* Project Selection */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <FiCalendar className="text-gray-400" />
                  Select Project
                </label>
                <select
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                  value={form.projectId}
                  required
                  onChange={(e) => setForm({ ...form, projectId: e.target.value })}
                >
                  <option value="">Choose a project...</option>
                  {projectsData?.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.projectName} ({p.projectCode})
                    </option>
                  ))}
                </select>
              </div>

              {/* Operator Name */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <FiUser className="text-gray-400" />
                  Operator Name
                </label>
                <input
                  type="text"
                  placeholder="Enter operator name (optional)"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  value={form.operatorName}
                  onChange={(e) => setForm({ ...form, operatorName: e.target.value })}
                />
              </div>

              {/* Start Date */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <FiClock className="text-gray-400" />
                  Start Date
                </label>
                <input
                  type="date"
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25"
              >
                {isSubmitting ? (
                  <>
                    <FiRefreshCw className="animate-spin" />
                    Allocating...
                  </>
                ) : (
                  <>
                    <FiPlus />
                    Allocate Machine
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Allocation List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-6 py-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                📋 Allocation History
              </h3>
            </div>

            <div className="p-6">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <FiRefreshCw className="animate-spin text-2xl text-gray-400 mr-3" />
                  <span className="text-gray-500">Loading allocations...</span>
                </div>
              ) : allocations.data?.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-5xl mb-3">🚜</div>
                  <p className="text-gray-500 font-medium">No machines allocated yet</p>
                  <p className="text-gray-400 text-sm mt-1">Allocate your first machine to get started</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Active Allocations */}
                  {activeAllocations.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        Active Allocations ({activeAllocations.length})
                      </h4>
                      <div className="space-y-3">
                        {activeAllocations.map((a) => (
                          <div key={a._id} className="border border-gray-100 rounded-xl p-4 hover:shadow-md transition-shadow duration-200">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <span className="font-semibold text-gray-800">{a.machineId?.name}</span>
                                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                                    {a.machineId?.machineType}
                                  </span>
                                </div>
                                <div className="text-sm text-gray-600 space-y-1">
                                  <p><span className="font-medium">Project:</span> {a.projectId?.projectName}</p>
                                  <p><span className="font-medium">Operator:</span> {a.operatorName || "Not assigned"}</p>
                                  <p><span className="font-medium">Started:</span> {new Date(a.startDate).toLocaleDateString()}</p>
                                </div>
                              </div>
                              <button
                                onClick={() => handleRelease(a._id)}
                                className="bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2 ml-4 border border-red-200"
                              >
                                <FiUnlock className="text-sm" />
                                Release
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Released Allocations */}
                  {releasedAllocations.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                        Released Allocations ({releasedAllocations.length})
                      </h4>
                      <div className="space-y-3">
                        {releasedAllocations.slice(0, 3).map((a) => (
                          <div key={a._id} className="border border-gray-100 rounded-xl p-4 bg-gray-50/50">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <span className="font-semibold text-gray-600 line-through">{a.machineId?.name}</span>
                                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                                    {a.machineId?.machineType}
                                  </span>
                                </div>
                                <div className="text-sm text-gray-500 space-y-1">
                                  <p><span className="font-medium">Project:</span> {a.projectId?.projectName}</p>
                                  <p><span className="font-medium">Duration:</span> {new Date(a.startDate).toLocaleDateString()}</p>
                                </div>
                              </div>
                              <span className="text-green-600 flex gap-1 items-center px-3 py-1 bg-green-50 rounded-full text-sm">
                                <FiCheckCircle /> Released
                              </span>
                            </div>
                          </div>
                        ))}
                        {releasedAllocations.length > 3 && (
                          <p className="text-center text-gray-500 text-sm py-2">
                            +{releasedAllocations.length - 3} more released allocations
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}