import { useState } from "react";
import { Link } from "react-router-dom";
import { History, ArrowRightLeft, Clock, CalendarCheck, FolderKanban, Phone, Loader2, ExternalLink } from "lucide-react";
import { useGetLabourQuery, useGetLabourFullHistoryQuery } from "../../Reduxe/Api";
import { getInitials, getAvatarGradient } from "../../helper/avatar";

const SECTION_STYLES = {
  Assignments: "from-blue-500 to-indigo-600",
  Transfers: "from-violet-500 to-purple-600",
  Attendance: "from-emerald-500 to-teal-600",
  Overtime: "from-amber-500 to-orange-600",
};

export default function LabourFullHistory() {
  const { data: labourResp } = useGetLabourQuery();
  const labours = labourResp?.data || labourResp?.labours || labourResp || [];

  const [labourId, setLabourId] = useState("");
  const { data, isFetching } = useGetLabourFullHistoryQuery(labourId, { skip: !labourId });
  const result = data?.data;

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-blue-900/20">
          <History size={20} />
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Labour Full History</h1>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm shadow-gray-200/60 p-4 mb-6">
        <div className="relative max-w-sm">
          <FolderKanban size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <select
            value={labourId}
            onChange={(e) => setLabourId(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm"
          >
            <option value="">Select a labour…</option>
            {labours.map((l) => (
              <option key={l._id} value={l._id}>
                {l.name} {l.phone ? `(${l.phone})` : ""}
              </option>
            ))}
          </select>
        </div>
      </div>

      {!labourId && (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
          <History className="mx-auto text-gray-300 mb-3" size={28} />
          <p className="text-sm text-gray-400">Select a labour above to see their complete history.</p>
        </div>
      )}

      {isFetching && (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-500">
          <Loader2 className="animate-spin" size={22} />
          <p className="text-sm">Loading history...</p>
        </div>
      )}

      {result && (
        <div className="space-y-8">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm shadow-gray-200/60 p-5 flex items-center gap-4">
            <div
              className={`w-14 h-14 shrink-0 rounded-2xl flex items-center justify-center text-white text-lg font-bold bg-gradient-to-br ${getAvatarGradient(result.labour?.name)}`}
            >
              {getInitials(result.labour?.name)}
            </div>
            <div>
              <h2 className="font-bold text-gray-900 text-lg">{result.labour?.name}</h2>
              <p className="text-sm text-gray-500 flex items-center gap-1.5 flex-wrap">
                {result.labour?.phone && (
                  <span className="flex items-center gap-1">
                    <Phone size={12} /> {result.labour.phone}
                  </span>
                )}
                {result.labour?.labourType && <span>· {result.labour.labourType}</span>}
                {result.labour?.skillLevel && <span>· {result.labour.skillLevel}</span>}
              </p>
            </div>
            {result.labour?._id && (
              <Link
                to={`/LabourDetail/${result.labour._id}`}
                className="ml-auto inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl border border-indigo-200 transition-colors shadow-sm"
              >
                <span>View Full Profile</span>
                <ExternalLink size={14} />
              </Link>
            )}
          </div>

          <Section title="Assignments" icon={ArrowRightLeft} count={result.assignments?.length}>
            <SimpleTable
              rows={result.assignments}
              cols={[
                { h: "Project", v: (r) => r.projectId?.projectName || "-" },
                { h: "From Project", v: (r) => r.previousProjectId?.projectName || "-" },
                { h: "Status", v: (r) => r.status },
                { h: "Assigned By", v: (r) => r.assignedBy?.name || "-" },
                { h: "Date", v: (r) => (r.assignmentDate ? new Date(r.assignmentDate).toLocaleDateString() : "-") },
              ]}
            />
          </Section>

          <Section title="Transfers" icon={ArrowRightLeft} count={result.transfers?.length}>
            <SimpleTable
              rows={result.transfers}
              cols={[
                { h: "From", v: (r) => r.previousProjectId?.projectName || "-" },
                { h: "To", v: (r) => r.projectId?.projectName || "-" },
                { h: "Transferred By", v: (r) => r.transferredBy?.name || "-" },
                { h: "Date", v: (r) => (r.assignmentDate ? new Date(r.assignmentDate).toLocaleDateString() : "-") },
              ]}
            />
          </Section>

          <Section title="Attendance" icon={CalendarCheck} count={result.attendance?.length}>
            <SimpleTable
              rows={result.attendance}
              cols={[
                { h: "Date", v: (r) => (r.date ? new Date(r.date).toLocaleDateString() : "-") },
                { h: "Project", v: (r) => r.projectId?.projectName || "-" },
                { h: "Status", v: (r) => r.status || "-" },
                { h: "Check In", v: (r) => r.timeIn || "-" },
                { h: "Check Out", v: (r) => r.timeOut || "-" },
              ]}
            />
          </Section>

          <Section title="Overtime" icon={Clock} count={result.overtime?.length}>
            <SimpleTable
              rows={result.overtime}
              cols={[
                { h: "Date", v: (r) => (r.date ? new Date(r.date).toLocaleDateString() : "-") },
                { h: "Hours", v: (r) => r.overtimeHours ?? r.approvedOvertimeHours ?? 0 },
                { h: "Status", v: (r) => r.overtimeApprovalStatus || "-" },
                { h: "Rejection Reason", v: (r) => r.overtimeRejectionReason || "-" },
              ]}
            />
          </Section>
        </div>
      )}
    </div>
  );
}

function Section({ title, icon: Icon, count, children }) {
  const chip = SECTION_STYLES[title] || "from-gray-500 to-gray-700";
  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-3">
        <span className={`w-6 h-6 rounded-lg bg-gradient-to-br ${chip} flex items-center justify-center text-white`}>
          <Icon size={12} />
        </span>
        {title}
        {typeof count === "number" && <span className="text-gray-400 font-normal">({count})</span>}
      </h3>
      {children}
    </div>
  );
}

function SimpleTable({ rows, cols }) {
  if (!rows || rows.length === 0) {
    return (
      <p className="text-xs text-gray-400 bg-white border border-dashed border-gray-200 rounded-2xl p-5 text-center">
        No records
      </p>
    );
  }
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm shadow-gray-200/60 overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50/70 text-xs uppercase tracking-wide text-gray-500">
          <tr>
            {cols.map((c) => (
              <th key={c.h} className="px-4 py-3 text-left font-semibold">
                {c.h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {rows.map((r, i) => (
            <tr key={r._id || i} className="hover:bg-gray-50/60 transition-colors">
              {cols.map((c) => (
                <td key={c.h} className="px-4 py-3 text-gray-700">
                  {c.v(r)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
