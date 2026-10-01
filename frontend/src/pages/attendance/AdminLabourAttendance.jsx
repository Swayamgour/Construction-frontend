import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useGetProjectsQuery,
  useGetAdminLabourAttendanceQuery,
} from "../../Reduxe/Api";

export default function AdminLabourAttendance() {
  // ----------------------------------------
  // DEFAULT DATE
  // ----------------------------------------

  const getToday = () => {
    const now = new Date();

    const offset =
      now.getTimezoneOffset();

    const localDate = new Date(
      now.getTime() -
      offset * 60 * 1000
    );

    return localDate
      .toISOString()
      .slice(0, 10);
  };

  // ----------------------------------------
  // FILTERS
  // ----------------------------------------

  const [filters, setFilters] =
    useState({
      projectId: "",
      date: getToday(),
      status: "",
      search: "",
      page: 1,
      limit: 25,
    });

  // ----------------------------------------
  // PROJECT LIST
  // ----------------------------------------

  const {
    data: projectResponse,
    isLoading: projectsLoading,
    isError: projectsError,
  } = useGetProjectsQuery();

  const projects =
    projectResponse?.data || [];

  // ----------------------------------------
  // ATTENDANCE
  // ----------------------------------------

  const {
    data: attendanceResponse,
    isLoading: attendanceLoading,
    isFetching: attendanceFetching,
    isError: attendanceError,
  } =
    useGetAdminLabourAttendanceQuery(
      {
        projectId:
          filters.projectId,
        date: filters.date,
        status:
          filters.status,
        search:
          filters.search,
        page:
          filters.page,
        limit:
          filters.limit,
      },
      {
        skip:
          !filters.projectId ||
          !filters.date,
      }
    );

  const rows =
    attendanceResponse?.data || [];

  const stats =
    attendanceResponse?.stats || {};

  const selectedProject =
    attendanceResponse?.project;

  // ----------------------------------------
  // UPDATE FILTER
  // ----------------------------------------

  const updateFilter = (
    key,
    value
  ) => {
    setFilters((previous) => ({
      ...previous,
      [key]: value,
      page:
        key === "page"
          ? value
          : 1,
    }));
  };

  // ----------------------------------------
  // AUTO SELECT FIRST PROJECT
  // ----------------------------------------

  useEffect(() => {
    if (
      !filters.projectId &&
      projects.length > 0
    ) {
      setFilters((previous) => ({
        ...previous,
        projectId:
          projects[0]._id,
        page: 1,
      }));
    }
  }, [
    projects,
    filters.projectId,
  ]);

  // ----------------------------------------
  // PERCENTAGE
  // ----------------------------------------

  const attendancePercentage =
    useMemo(() => {
      return stats.percentage || 0;
    }, [stats.percentage]);

  // ----------------------------------------
  // STATUS CLASS
  // ----------------------------------------

  const getStatusClass = (
    status
  ) => {
    switch (status) {
      case "Present":
        return "bg-green-100 text-green-700";

      case "Absent":
        return "bg-red-100 text-red-700";

      case "Half-Day":
        return "bg-amber-100 text-amber-700";

      case "Pending":
      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  // ----------------------------------------
  // RENDER
  // ----------------------------------------

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-5">

        {/* ================================= */}
        {/* HEADER */}
        {/* ================================= */}

        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
            Labour Attendance
          </h1>

          <p className="text-sm text-slate-500 mt-1">
            Project-wise daily labour
            attendance monitoring
          </p>
        </div>

        {/* ================================= */}
        {/* PROJECT + DATE FILTER */}
        {/* ================================= */}

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

            {/* PROJECT */}

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Select Project
              </label>

              <select
                value={
                  filters.projectId
                }
                onChange={(e) =>
                  updateFilter(
                    "projectId",
                    e.target.value
                  )
                }
                disabled={
                  projectsLoading
                }
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">
                  Select Project
                </option>

                {projects.map(
                  (project) => (
                    <option
                      key={
                        project._id
                      }
                      value={
                        project._id
                      }
                    >
                      {project.projectName}
                      {project.projectCode
                        ? ` (${project.projectCode})`
                        : ""}
                    </option>
                  )
                )}
              </select>

              {projectsError && (
                <p className="text-xs text-red-500 mt-1">
                  Unable to load
                  projects.
                </p>
              )}
            </div>

            {/* DATE */}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Attendance Date
              </label>

              <input
                type="date"
                value={
                  filters.date
                }
                onChange={(e) =>
                  updateFilter(
                    "date",
                    e.target.value
                  )
                }
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* STATUS */}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Status
              </label>

              <select
                value={
                  filters.status
                }
                onChange={(e) =>
                  updateFilter(
                    "status",
                    e.target.value
                  )
                }
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">
                  All Status
                </option>

                <option value="Present">
                  Present
                </option>

                <option value="Absent">
                  Absent
                </option>

                <option value="Half-Day">
                  Half-Day
                </option>

                <option value="Pending">
                  Pending
                </option>
              </select>
            </div>
          </div>

          {/* SEARCH */}

          <div className="mt-4">

            <label className="block text-sm font-medium text-slate-700 mb-1">
              Search Labour
            </label>

            <input
              type="text"
              value={
                filters.search
              }
              onChange={(e) =>
                updateFilter(
                  "search",
                  e.target.value
                )
              }
              placeholder="Search by Labour ID, name or phone..."
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* ================================= */}
        {/* SELECTED PROJECT */}
        {/* ================================= */}

        {selectedProject && (
          <div className="bg-white border border-blue-200 rounded-xl p-4">

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">

              <div>
                <p className="text-xs text-slate-500">
                  Selected Project
                </p>

                <h2 className="text-lg font-bold text-slate-800">
                  {
                    selectedProject.projectName
                  }
                </h2>

                {selectedProject.projectCode && (
                  <p className="text-sm text-slate-500">
                    Code:{" "}
                    {
                      selectedProject.projectCode
                    }
                  </p>
                )}
              </div>

              <div className="text-sm text-slate-500">
                Date:{" "}
                <span className="font-semibold text-slate-800">
                  {filters.date}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ================================= */}
        {/* STATS */}
        {/* ================================= */}

        {filters.projectId && (
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">

            <StatCard
              title="Total Labour"
              value={
                stats.totalExpected ??
                0
              }
            />

            <StatCard
              title="Present"
              value={
                stats.Present ??
                0
              }
              valueClass="text-green-600"
            />

            <StatCard
              title="Absent"
              value={
                stats.Absent ??
                0
              }
              valueClass="text-red-600"
            />

            <StatCard
              title="Half-Day"
              value={
                stats["Half-Day"] ??
                0
              }
              valueClass="text-amber-600"
            />

            <StatCard
              title="Pending"
              value={
                stats.Pending ??
                0
              }
              valueClass="text-slate-600"
            />

            <StatCard
              title="Marked"
              value={`${attendancePercentage}%`}
              valueClass="text-blue-600"
            />

          </div>
        )}

        {/* ================================= */}
        {/* ATTENDANCE TABLE */}
        {/* ================================= */}

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">

          {!filters.projectId ? (

            <div className="p-16 text-center">

              <div className="text-4xl mb-3">
                📋
              </div>

              <h3 className="font-semibold text-slate-700">
                Select a project
              </h3>

              <p className="text-sm text-slate-500 mt-1">
                Select a project to view
                its labour attendance.
              </p>

            </div>

          ) : attendanceLoading ? (

            <div className="p-16 text-center text-slate-500">
              Loading labour
              attendance...
            </div>

          ) : attendanceError ? (

            <div className="p-16 text-center text-red-600">
              Unable to load labour
              attendance.
            </div>

          ) : (

            <>
              {/* Loading overlay text */}

              {attendanceFetching && (
                <div className="px-4 py-2 bg-blue-50 text-blue-600 text-sm">
                  Updating attendance...
                </div>
              )}

              <div className="overflow-x-auto">

                <table className="w-full text-sm">

                  <thead className="bg-slate-50 border-b">

                    <tr>

                      <th className="text-left px-4 py-3 font-semibold text-slate-700">
                        Labour ID
                      </th>

                      <th className="text-left px-4 py-3 font-semibold text-slate-700">
                        Labour
                      </th>

                      <th className="text-left px-4 py-3 font-semibold text-slate-700">
                        Phone
                      </th>

                      <th className="text-left px-4 py-3 font-semibold text-slate-700">
                        Type
                      </th>

                      <th className="text-left px-4 py-3 font-semibold text-slate-700">
                        Skill
                      </th>

                      <th className="text-left px-4 py-3 font-semibold text-slate-700">
                        Date
                      </th>

                      <th className="text-left px-4 py-3 font-semibold text-slate-700">
                        Status
                      </th>

                      <th className="text-left px-4 py-3 font-semibold text-slate-700">
                        Marked By
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {rows.length > 0 ? (

                      rows.map(
                        (row) => (
                          <tr
                            key={
                              row.labour
                                ?._id
                            }
                            className="border-b last:border-b-0 hover:bg-slate-50"
                          >

                            {/* LABOUR ID */}

                            <td className="px-4 py-3 font-mono text-xs">
                              {row.labour
                                ?.labourId ||
                                "-"}
                            </td>

                            {/* NAME */}

                            <td className="px-4 py-3">

                              <div className="font-medium text-slate-800">
                                {row.labour
                                  ?.name ||
                                  "-"}
                              </div>

                            </td>

                            {/* PHONE */}

                            <td className="px-4 py-3 text-slate-600">
                              {row.labour
                                ?.phone ||
                                "-"}
                            </td>

                            {/* TYPE */}

                            <td className="px-4 py-3 text-slate-600">
                              {row.labour
                                ?.labourType ||
                                "-"}
                            </td>

                            {/* SKILL */}

                            <td className="px-4 py-3 text-slate-600">
                              {row.labour
                                ?.skillLevel ||
                                "-"}
                            </td>

                            {/* DATE */}

                            <td className="px-4 py-3 text-slate-600">
                              {
                                filters.date
                              }
                            </td>

                            {/* STATUS */}

                            <td className="px-4 py-3">

                              <span
                                className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getStatusClass(
                                  row.attendanceStatus
                                )}`}
                              >
                                {
                                  row.attendanceStatus
                                }
                              </span>

                            </td>

                            {/* MARKED BY */}

                            <td className="px-4 py-3 text-slate-600">
                              {row
                                .attendance
                                ?.markedBy
                                ?.name ||
                                "-"}
                            </td>

                          </tr>
                        )
                      )

                    ) : (

                      <tr>

                        <td
                          colSpan="8"
                          className="p-12 text-center text-slate-500"
                        >
                          No labour found
                          for this project.
                        </td>

                      </tr>

                    )}

                  </tbody>

                </table>

              </div>

              {/* ================================= */}
              {/* PAGINATION */}
              {/* ================================= */}

              {attendanceResponse
                ?.pagination
                ?.totalPages > 1 && (

                  <div className="border-t p-4 flex items-center justify-between">

                    <button
                      disabled={
                        filters.page <=
                        1
                      }
                      onClick={() =>
                        updateFilter(
                          "page",
                          filters.page -
                          1
                        )
                      }
                      className="px-4 py-2 border rounded-lg text-sm disabled:opacity-40"
                    >
                      Previous
                    </button>

                    <span className="text-sm text-slate-600">
                      Page{" "}
                      {
                        filters.page
                      }{" "}
                      of{" "}
                      {
                        attendanceResponse
                          .pagination
                          .totalPages
                      }
                    </span>

                    <button
                      disabled={
                        filters.page >=
                        attendanceResponse
                          .pagination
                          .totalPages
                      }
                      onClick={() =>
                        updateFilter(
                          "page",
                          filters.page +
                          1
                        )
                      }
                      className="px-4 py-2 border rounded-lg text-sm disabled:opacity-40"
                    >
                      Next
                    </button>

                  </div>
                )}

            </>

          )}

        </div>

      </div>
    </div>
  );
}

/**
 * Stats Card
 */
function StatCard({
  title,
  value,
  valueClass = "text-slate-800",
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">

      <p className="text-xs text-slate-500">
        {title}
      </p>

      <p
        className={`text-xl font-bold mt-1 ${valueClass}`}
      >
        {value}
      </p>

    </div>
  );
}