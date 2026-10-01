import React, { useState } from "react";
import { Users2, ChevronLeft, ChevronRight, Loader2, FolderKanban } from "lucide-react";
import ReportTable from "../../components/ReportTable";
import { useGetProjectsQuery, useGetProjectActiveLabourQuery } from "../../Reduxe/Api";

const PAGE_SIZE = 10;

export default function ProjectActiveLabour() {
  const { data: projectResp } = useGetProjectsQuery();
  const projects = projectResp?.data || projectResp || [];

  const [projectId, setProjectId] = useState("");
  const [page, setPage] = useState(1);

  const { data, isFetching } = useGetProjectActiveLabourQuery(
    { projectId, page, limit: PAGE_SIZE },
    { skip: !projectId }
  );

  const assignments = data?.data || [];
  const pagination = data?.pagination || {};
  const totalPages = pagination.totalPages || (pagination.total ? Math.ceil(pagination.total / PAGE_SIZE) : 1);

  const columns = [
    { header: "Name", render: (row) => row.labourId?.name || "-" },
    { header: "Phone", render: (row) => row.labourId?.phone || "-" },
    { header: "Type", render: (row) => row.labourId?.labourType || "-" },
    { header: "Category", render: (row) => row.labourId?.category || "-" },
    { header: "Skill", render: (row) => row.labourId?.skillLevel || "-" },
    { header: "Labour Status", render: (row) => row.labourId?.status || "-" },
    { header: "Assigned Since", render: (row) => new Date(row.assignmentDate).toLocaleDateString() },
    { header: "Remarks", accessor: "remarks" },
  ];

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-blue-900/20">
          <Users2 size={20} />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Project Active Labour</h1>
          <p className="text-sm text-gray-500">Labour currently assigned to a project (status: Active)</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm shadow-gray-200/60 p-4 sm:p-5">
        <div className="relative max-w-sm">
          <FolderKanban size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <select
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            value={projectId}
            onChange={(e) => {
              setProjectId(e.target.value);
              setPage(1);
            }}
          >
            <option value="">Select a Project</option>
            {projects?.map((p) => (
              <option key={p._id} value={p._id}>
                {p.projectName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {!projectId ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
          <Users2 className="mx-auto text-gray-300 mb-3" size={28} />
          <p className="text-gray-400 text-sm">Select a project to view its active labour.</p>
        </div>
      ) : isFetching ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-500">
          <Loader2 className="animate-spin" size={22} />
          <p className="text-sm">Loading active labour...</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm shadow-gray-200/60 overflow-hidden">
          <ReportTable columns={columns} data={assignments} />
          <div className="flex items-center justify-between text-sm text-gray-600 px-4 sm:px-5 py-4 border-t border-gray-100">
            <span>
              {pagination.total != null ? `${pagination.total} labour assigned` : `${assignments.length} labour on this page`}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="font-medium">
                Page {page}
                {totalPages ? ` of ${totalPages}` : ""}
              </span>
              <button
                onClick={() => setPage((p) => (totalPages ? Math.min(totalPages, p + 1) : p + 1))}
                disabled={totalPages ? page >= totalPages : assignments.length < PAGE_SIZE}
                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
