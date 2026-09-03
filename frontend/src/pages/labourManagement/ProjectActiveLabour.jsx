import React, { useState } from "react";
import { Users2, ChevronLeft, ChevronRight } from "lucide-react";
import ReportTable from "../../components/ReportTable";
import { useGetProjectsQuery, useGetProjectActiveLabourQuery } from "../../Reduxe/Api";

/**
 * NEW PAGE — UI for GET /api/projects/:projectId/labour (getProjectActiveLabour).
 * This endpoint was already wired in Api.js (useGetProjectActiveLabourQuery)
 * but had no screen — the only way to see "who is on this project right now"
 * was to squint at LabourTransfer's full assignment history table.
 */
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
        <div className="p-6 max-w-6xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <Users2 className="text-blue-800" size={24} /> Project Active Labour
                </h1>
                <p className="text-sm text-gray-500 mt-1">Labour currently assigned to a project (status: Active).</p>
            </div>

            <select
                className="border p-2 rounded-lg w-full max-w-sm"
                value={projectId}
                onChange={(e) => { setProjectId(e.target.value); setPage(1); }}
            >
                <option value="">Select a Project</option>
                {projects?.map((p) => (
                    <option key={p._id} value={p._id}>{p.projectName}</option>
                ))}
            </select>

            {!projectId ? (
                <p className="text-gray-400 text-sm py-10 text-center">Select a project to view its active labour.</p>
            ) : isFetching ? (
                <p className="text-center text-gray-500 py-10">Loading...</p>
            ) : (
                <>
                    <ReportTable columns={columns} data={assignments} />
                    <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>
                            {pagination.total != null ? `${pagination.total} labour assigned` : `${assignments.length} labour on this page`}
                        </span>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page <= 1}
                                className="p-1.5 rounded-lg border border-gray-300 disabled:opacity-40"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <span>Page {page}{totalPages ? ` of ${totalPages}` : ""}</span>
                            <button
                                onClick={() => setPage((p) => (totalPages ? Math.min(totalPages, p + 1) : p + 1))}
                                disabled={totalPages ? page >= totalPages : assignments.length < PAGE_SIZE}
                                className="p-1.5 rounded-lg border border-gray-300 disabled:opacity-40"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
