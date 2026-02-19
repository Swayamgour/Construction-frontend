import React, { useState } from "react";
import { IoIosAddCircleOutline } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import CreateProjectForm from "../../components/CreateProjectForm";
import {
  FaMapMarkerAlt,
  FaEllipsisV,
  FaClock,
  FaCalendarCheck,
  FaRocket,
  FaEye,
  FaEdit,
  FaTrash,
  FaSearch
} from "react-icons/fa";
import { useDeleteProjectMutation, useGetAttendanceByDateQuery, useGetAttendanceQuery, useGetProjectsQuery } from "../../Reduxe/Api";



const Dashboard = () => {
  const navigate = useNavigate();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeMenu, setActiveMenu] = useState(null);
  const { data, isLoading } = useGetProjectsQuery();
  // console.log(data)
  const [deleteProject] = useDeleteProjectMutation();



  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  const toggleMenu = (projectId) => {
    setActiveMenu(activeMenu === projectId ? null : projectId);
  };

  const handleDelete = async (projectId) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      try {
        await deleteProject(projectId).unwrap();
        setActiveMenu(null);
      } catch (error) {
        console.error("Failed to delete project:", error);
      }
    }
  };

  const handleViewDetails = (project) => {
    navigate("/DashboardProject", { state: { project } });
    setActiveMenu(null);
  };

  const handleEdit = (project) => {
    navigate("/EditProject", { state: { projectId: project } });
    setActiveMenu(null);
  };

  const getProgressColor = (progress) => {
    if (progress < 25) return "bg-red-500";
    if (progress < 50) return "bg-amber-500";
    if (progress < 75) return "bg-blue-500";
    return "bg-green-500";
  };

  const getProgressValue = (projectDuration) => {
    return projectDuration ? Number(projectDuration) * 10 : 0;
  };

  const getStatusBadge = (progress) => {
    if (progress >= 75) return "bg-green-100 text-green-800";
    if (progress >= 50) return "bg-blue-100 text-blue-800";
    if (progress >= 25) return "bg-amber-100 text-amber-800";
    return "bg-red-100 text-red-800";
  };


  let projects = data

  const filteredProjects = projects?.filter(project =>
    project.projectName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.siteLocation?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen px-4 sm:px-6 py-6 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 sm:px-6 py-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-purple-700 bg-clip-text text-transparent">
              Project Management
            </h1>
            <p className="text-gray-600 mt-1">
              Total Projects: {projects?.length || 0}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <button
              onClick={() => navigate('/AddNewProject')}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl shadow-md transition-all duration-200 flex items-center justify-center gap-2 font-medium"
            >
              <IoIosAddCircleOutline size={20} />
              New Project
            </button>

            <div className="relative w-full sm:w-64">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700 placeholder-gray-500 bg-white"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Table Header */}
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">
              All Projects ({filteredProjects?.length || 0})
            </h3>
          </div>

          {/* Table Content */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Project Details
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Timeline
                  </th>
                  {/* <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Progress
                  </th> */}
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredProjects?.map((project) => {
                  const progressValue = getProgressValue(project.projectDuration);

                  return (
                    <tr
                      key={project._id}
                      className="hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
                      onClick={() => navigate("/DashboardProject", { state: { project } })}
                    >
                      {/* Project Details */}
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0 w-12 h-12 rounded-xl overflow-hidden">
                            <img
                              src="./images/cons.jpg"
                              alt={project.projectName}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="text-sm font-semibold text-gray-900 truncate">
                              {project.projectName}
                            </h3>
                            <div className="flex items-center mt-1 text-gray-500 text-sm">
                              <FaMapMarkerAlt className="mr-2 text-blue-500 flex-shrink-0" />
                              <span className="truncate">{project.siteLocation}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Timeline */}
                      <td className="px-6 py-4">
                        <div className="space-y-2">
                          <div className="flex items-center text-sm">
                            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                              <FaClock className="text-red-500 text-xs" />
                            </div>
                            <div>
                              <div className="text-xs text-gray-500 uppercase font-semibold">Start</div>
                              <div className="font-semibold text-gray-900">{project.expectedStartDate}</div>
                            </div>
                          </div>
                          <div className="flex items-center text-sm">
                            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                              <FaCalendarCheck className="text-green-500 text-xs" />
                            </div>
                            <div>
                              <div className="text-xs text-gray-500 uppercase font-semibold">End</div>
                              <div className="font-semibold text-gray-900">{project.expectedCompletionDate}</div>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Progress */}
                      {/* <td className="px-6 py-4">
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-semibold text-gray-700">Progress</span>
                            <span className={`text-sm font-bold ${progressValue >= 75 ? "text-green-600" :
                              progressValue >= 50 ? "text-blue-600" : "text-amber-600"
                              }`}>
                              {'75'}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-full rounded-full ${getProgressColor(progressValue)} transition-all duration-500`}
                              style={{ width: `${progressValue}%` }}
                            ></div>
                          </div>
                        </div>
                      </td> */}

                      {/* Status */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 w-fit">
                          <FaRocket className="text-green-500 text-sm" />
                          <span className="text-sm font-semibold text-green-700">
                            {progressValue >= 75 ? "Almost Done" :
                              progressValue >= 50 ? "On Track" :
                                progressValue >= 25 ? "In Progress" : "Starting"}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleMenu(project._id);
                            }}
                            className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
                          >
                            <FaEllipsisV className="text-gray-600 text-sm" />
                          </button>

                          {activeMenu === project._id && (
                            <div
                              className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-2xl py-2 border border-gray-200 z-50"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                onClick={() => handleViewDetails(project)}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                              >
                                <FaEye className="mr-3 text-blue-500" /> View Details
                              </button>
                              <button
                                onClick={() => handleEdit(project)}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors"
                              >
                                <FaEdit className="mr-3 text-green-500" /> Edit Project
                              </button>
                              <button
                                onClick={() => handleDelete(project._id)}
                                className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50 hover:text-red-600 transition-colors"
                              >
                                <FaTrash className="mr-3 text-red-500" /> Delete Project
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Empty State */}
            {(!filteredProjects || filteredProjects.length === 0) && (
              <div className="text-center py-12">
                <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <FaRocket className="text-gray-400 text-2xl" />
                </div>
                <h3 className="text-lg font-semibold text-gray-600 mb-2">
                  {searchTerm ? "No projects found" : "No projects yet"}
                </h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm ? "Try adjusting your search terms" : "Get started by creating your first project"}
                </p>
                <button
                  onClick={() => navigate('/AddNewProject')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2 mx-auto"
                >
                  <IoIosAddCircleOutline size={18} />
                  Create Project
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Drawer Form */}
      <CreateProjectForm isOpen={isDrawerOpen} onClose={toggleDrawer} />
    </div>
  );
};

export default Dashboard;