import React, { useState } from "react";
import { IoIosAddCircleOutline } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
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
  FaSearch,
  FaBuilding,
} from "react-icons/fa";
import { useDeleteProjectMutation, useGetProjectsQuery } from "../../Reduxe/Api";
import { getAvatarGradient } from "../../helper/avatar";

const Dashboard = () => {
  const navigate = useNavigate();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeMenu, setActiveMenu] = useState(null);
  const { data, isLoading } = useGetProjectsQuery();
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

  const getProgressValue = (projectDuration) => {
    return projectDuration ? Number(projectDuration) * 10 : 0;
  };

  let projects = data?.data;

  const filteredProjects = projects?.filter(
    (project) =>
      project.projectName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.siteLocation?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen px-4 sm:px-6 py-6 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 sm:px-6 py-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-slate-900 via-indigo-800 to-blue-700 bg-clip-text text-transparent">
              Project Management
            </h1>
            <p className="text-gray-500 mt-1">
              Total Projects: <span className="font-semibold text-gray-700">{projects?.length || 0}</span>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <button
              onClick={() => navigate("/AddNewProject")}
              className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white px-6 py-3 rounded-xl shadow-lg shadow-indigo-900/20 transition-all flex items-center justify-center gap-2 font-medium"
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
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-700 placeholder-gray-400 bg-white shadow-sm"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 overflow-hidden">
          {/* Table Header */}
          <div className="px-6 py-4 bg-gray-50/70 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800">
              All Projects ({filteredProjects?.length || 0})
            </h3>
          </div>

          {/* Table Content */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50/70 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Project Details
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Timeline
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProjects?.map((project) => {
                  const progressValue = getProgressValue(project.projectDuration);

                  return (
                    <tr
                      key={project._id}
                      className="hover:bg-indigo-50/30 transition-colors duration-150 cursor-pointer"
                      onClick={() => navigate("/DashboardProject", { state: { project } })}
                    >
                      {/* Project Details */}
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-4">
                          {project.image ? (
                            <img
                              src={project.image}
                              alt={project.projectName}
                              className="flex-shrink-0 w-12 h-12 rounded-xl object-cover"
                            />
                          ) : (
                            <div
                              className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-white bg-gradient-to-br ${getAvatarGradient(project.projectName)}`}
                            >
                              <FaBuilding size={16} />
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <h3 className="text-sm font-semibold text-gray-900 truncate">
                              {project.projectName}
                            </h3>
                            <div className="flex items-center mt-1 text-gray-500 text-sm">
                              <FaMapMarkerAlt className="mr-2 text-indigo-500 flex-shrink-0" />
                              <span className="truncate">{project.siteLocation}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Timeline */}
                      <td className="px-6 py-4">
                        <div className="space-y-2">
                          <div className="flex items-center text-sm">
                            <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center mr-3">
                              <FaClock className="text-red-500 text-xs" />
                            </div>
                            <div>
                              <div className="text-xs text-gray-400 uppercase font-semibold">Start</div>
                              <div className="font-semibold text-gray-900">{project.expectedStartDate}</div>
                            </div>
                          </div>
                          <div className="flex items-center text-sm">
                            <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center mr-3">
                              <FaCalendarCheck className="text-emerald-500 text-xs" />
                            </div>
                            <div>
                              <div className="text-xs text-gray-400 uppercase font-semibold">End</div>
                              <div className="font-semibold text-gray-900">{project.expectedCompletionDate}</div>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 w-fit">
                          <FaRocket className="text-emerald-500 text-sm" />
                          <span className="text-sm font-semibold text-emerald-700">
                            {progressValue >= 75
                              ? "Almost Done"
                              : progressValue >= 50
                              ? "On Track"
                              : progressValue >= 25
                              ? "In Progress"
                              : "Starting"}
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

                          <AnimatePresence>
                            {activeMenu === project._id && (
                              <motion.div
                                initial={{ opacity: 0, y: -6, scale: 0.97 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -6, scale: 0.97 }}
                                transition={{ duration: 0.12 }}
                                className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-2xl shadow-black/10 py-2 border border-gray-100 z-50"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button
                                  onClick={() => handleViewDetails(project)}
                                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                                >
                                  <FaEye className="mr-3 text-indigo-500" /> View Details
                                </button>
                                <button
                                  onClick={() => handleEdit(project)}
                                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                                >
                                  <FaEdit className="mr-3 text-emerald-500" /> Edit Project
                                </button>
                                <button
                                  onClick={() => handleDelete(project._id)}
                                  className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50 hover:text-red-600 transition-colors"
                                >
                                  <FaTrash className="mr-3 text-red-500" /> Delete Project
                                </button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Empty State */}
            {(!filteredProjects || filteredProjects.length === 0) && (
              <div className="text-center py-14">
                <div className="w-24 h-24 mx-auto mb-4 bg-indigo-50 rounded-full flex items-center justify-center">
                  <FaRocket className="text-indigo-400 text-2xl" />
                </div>
                <h3 className="text-lg font-semibold text-gray-600 mb-2">
                  {searchTerm ? "No projects found" : "No projects yet"}
                </h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm ? "Try adjusting your search terms" : "Get started by creating your first project"}
                </p>
                <button
                  onClick={() => navigate("/AddNewProject")}
                  className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white px-6 py-2.5 rounded-xl transition-all flex items-center gap-2 mx-auto font-medium shadow-md"
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
