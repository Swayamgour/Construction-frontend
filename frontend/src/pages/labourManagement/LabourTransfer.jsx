import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { History, Users2, ArrowRightLeft, LogOutIcon, UserPlus2 } from "lucide-react";
import ReportTable from "../../components/ReportTable";
import Modal from "../../components/Modal";
import {
  useGetLabourQuery,
  useGetProjectsQuery,
  useAssignLabourToProjectMutation,
  useTransferLabourMutation,
  useReleaseLabourMutation,
  useGetLabourAssignmentsQuery,
  useGetLabourAssignmentHistoryQuery,
} from "../../Reduxe/Api";

import { CheckRole } from "../../helper/CheckRole";
import { getPermissions } from "../../helper/permissions";

const MODE_META = {
  assign: { icon: UserPlus2, chip: "from-indigo-600 to-blue-600" },
  transfer: { icon: ArrowRightLeft, chip: "from-violet-600 to-purple-600" },
  // release: { icon: LogOutIcon, chip: "from-red-500 to-rose-600" },
};

const inputCls =
  "border border-gray-200 p-2.5 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm";

const LabourTransfer = () => {
  const navigate = useNavigate();
  const { role } = CheckRole();
  const permissions = getPermissions(role);

  React.useEffect(() => {
    if (permissions.isAdmin) {
      toast.error("Admins have view & monitoring access only. Labour transfers are executed by Managers.");
      navigate("/labour/full-history", { replace: true });
    }
  }, [permissions.isAdmin, navigate]);

  const { data: labourResp } = useGetLabourQuery();
  const { data: projectResp } = useGetProjectsQuery();
  const { data: assignmentResp, refetch } = useGetLabourAssignmentsQuery({});

  const [assignLabour, { isLoading: assigning }] = useAssignLabourToProjectMutation();
  const [transferLabour, { isLoading: transferring }] = useTransferLabourMutation();
  const [releaseLabour, { isLoading: releasing }] = useReleaseLabourMutation();

  const labours = labourResp?.data || labourResp?.labours || labourResp || [];
  const projects = projectResp?.data || projectResp || [];
  const assignments = assignmentResp?.data || [];

  const [mode, setMode] = useState("assign");
  const [form, setForm] = useState({ labourId: "", projectId: "", toProjectId: "", transferReason: "", remarks: "" });

  const isLoading = assigning || transferring || releasing;
  const navigate = useNavigate();

  const [historyLabourId, setHistoryLabourId] = useState(null);
  const { data: historyResp, isFetching: loadingHistory } = useGetLabourAssignmentHistoryQuery(historyLabourId, {
    skip: !historyLabourId,
  });
  const history = historyResp?.data || [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.labourId) return toast.error("Select a labour");

    try {
      if (mode === "assign") {
        if (!form.projectId) return toast.error("Select a project");
        await assignLabour({ labourId: form.labourId, projectId: form.projectId, remarks: form.remarks }).unwrap();
        toast.success("Labour assigned");
      } else if (mode === "transfer") {
        if (!form.toProjectId) return toast.error("Select destination project");
        await transferLabour({
          labourId: form.labourId,
          toProjectId: form.toProjectId,
          transferReason: form.transferReason,
          remarks: form.remarks,
        }).unwrap();
        toast.success("Labour transferred");
      } else {
        await releaseLabour({ labourId: form.labourId, remarks: form.remarks }).unwrap();
        toast.success("Labour released");
      }
      setForm({ labourId: "", projectId: "", toProjectId: "", transferReason: "", remarks: "" });
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || "Action failed");
    }
  };

  const columns = [
    { header: "Labour", render: (row) => row.labourId?.name || "-" },
    { header: "Project", render: (row) => row.projectId?.projectName || "-" },
    {
      header: "Status",
      render: (row) => (
        <span
          className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
            row.status === "Active"
              ? "bg-emerald-50 text-emerald-700"
              : row.status === "Transferred"
              ? "bg-blue-50 text-blue-700"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          {row.status}
        </span>
      ),
    },
    { header: "Assignment Date", render: (row) => new Date(row.assignmentDate).toLocaleDateString() },
    { header: "Transfer Reason", accessor: "transferReason" },
    { header: "Remarks", accessor: "remarks" },
    {
      header: "Action",
      render: (row) => (
        <button
          onClick={() => setHistoryLabourId(row.labourId?._id)}
          disabled={!row.labourId?._id}
          className="px-2.5 py-1.5 border border-gray-200 text-gray-600 rounded-lg text-xs flex items-center gap-1 hover:bg-gray-50 disabled:opacity-40 transition-colors"
        >
          <History size={11} /> History
        </button>
      ),
    },
  ];

  const ModeIcon = MODE_META[mode].icon;

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${MODE_META[mode].chip} flex items-center justify-center text-white shadow-md transition-colors`}>
            <ModeIcon size={20} />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Labour Assignment & Transfer</h1>
        </div>
        <button
          onClick={() => navigate("/labour/project-active")}
          className="flex items-center gap-1.5 text-sm border border-gray-200 text-gray-600 px-3.5 py-2 rounded-xl hover:bg-gray-50 transition-colors"
        >
          <Users2 size={14} /> View Active Labour by Project
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm shadow-gray-200/60 p-5 sm:p-6">
        <div className="flex gap-2 mb-5">
          {Object.keys(MODE_META).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-4 py-2 rounded-xl text-sm capitalize font-semibold transition-all ${
                mode === m
                  ? `bg-gradient-to-r ${MODE_META[m].chip} text-white shadow-md`
                  : "bg-gray-50 text-gray-600 hover:bg-gray-100"
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <select className={inputCls} value={form.labourId} onChange={(e) => setForm({ ...form, labourId: e.target.value })} required>
            <option value="">Select Labour</option>
            {labours.map((l) => (
              <option key={l._id} value={l._id}>
                {l.name} ({l.phone})
              </option>
            ))}
          </select>

          {mode === "assign" && (
            <select className={inputCls} value={form.projectId} onChange={(e) => setForm({ ...form, projectId: e.target.value })} required>
              <option value="">Select Project</option>
              {projects?.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.projectName}
                </option>
              ))}
            </select>
          )}

          {mode === "transfer" && (
            <>
              <select className={inputCls} value={form.toProjectId} onChange={(e) => setForm({ ...form, toProjectId: e.target.value })} required>
                <option value="">Transfer To Project</option>
                {projects?.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.projectName}
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Transfer Reason"
                className={inputCls}
                value={form.transferReason}
                onChange={(e) => setForm({ ...form, transferReason: e.target.value })}
              />
            </>
          )}

          <input
            type="text"
            placeholder="Remarks"
            className={`${inputCls} md:col-span-2`}
            value={form.remarks}
            onChange={(e) => setForm({ ...form, remarks: e.target.value })}
          />

          <button
            type="submit"
            disabled={isLoading}
            className={`md:col-span-2 bg-gradient-to-r ${MODE_META[mode].chip} text-white py-2.5 rounded-xl font-semibold shadow-lg shadow-black/10 disabled:opacity-60 capitalize transition-all`}
          >
            {isLoading ? "Saving..." : mode}
          </button>
        </form>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Assignment History</h2>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm shadow-gray-200/60 overflow-hidden">
          <ReportTable columns={columns} data={assignments} />
        </div>
      </div>

      <Modal open={!!historyLabourId} title="Labour Assignment History" onClose={() => setHistoryLabourId(null)}>
        {loadingHistory ? (
          <p className="text-sm text-gray-500 py-6 text-center">Loading...</p>
        ) : history.length === 0 ? (
          <p className="text-sm text-gray-500 py-6 text-center">No assignment history found.</p>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {history.map((h) => (
              <div key={h._id} className="border border-gray-100 rounded-xl p-3.5 text-sm bg-gray-50/60">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-800">{h.projectId?.projectName || "-"}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                      h.status === "Active"
                        ? "bg-emerald-50 text-emerald-700"
                        : h.status === "Transferred"
                        ? "bg-blue-50 text-blue-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {h.status}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1.5">
                  Since {new Date(h.assignmentDate).toLocaleDateString()}
                  {h.previousProjectId?.projectName ? ` · from ${h.previousProjectId.projectName}` : ""}
                  {h.releaseDate ? ` · ended ${new Date(h.releaseDate).toLocaleDateString()}` : ""}
                </p>
                {h.transferReason && <p className="text-xs text-gray-500 mt-0.5">Reason: {h.transferReason}</p>}
                {h.assignedBy?.name && <p className="text-xs text-gray-400 mt-0.5">By {h.assignedBy.name}</p>}
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default LabourTransfer;
