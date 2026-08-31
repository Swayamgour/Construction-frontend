import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { Menu, Bell, ChevronDown, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import toast from "react-hot-toast";
import {
  useGetMyNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
} from "../Reduxe/Api";

// Friendly titles for the top bar breadcrumb — falls back to a
// prettified version of the path segment when a route isn't listed.
const PAGE_TITLES = {
  "/dashboard": "Dashboard",
  "/pm/dashboard": "Manager Dashboard",
  "/Product": "Projects",
  "/AssignProject": "Projects",
  "/AddGanttTask": "Gantt Chart",
  "/LabourDashboard": "Labour Management",
  "/AssignLabour": "Assign Labour",
  "/AttendanceLabour": "Attendance",
  "/StockOverView": "Stock Overview",
  "/StockPage": "Stock Management",
  "/MaterialApproval": "Material Approval",
  "/machine/list": "Machinery",
  "/machinery/requests": "Machine Requests",
  "/VendorManagement": "Vendor Management",
  "/TaskList": "Tasks",
  "/drawings": "Drawings",
  "/eod-reports": "EOD Reports",
  "/project-delays": "Project Delays",
  "/ViewUser": "User & Roles",
  "/Profile": "My Profile",
};

const prettify = (path) => {
  const seg = path.split("/").filter(Boolean).pop() || "Dashboard";
  return seg.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
};

const Header = ({ sidebarOpen, setSidebarOpen, collapsed, setCollapsed, role, user }) => {
  const [openProfile, setOpenProfile] = useState(false);
  const [openNotifications, setOpenNotifications] = useState(false);

  const dropdownRef = useRef(null);
  const notifRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Real notification data, polled every 30s so the bell stays fresh
  // without needing a socket connection.
  const { data: notifResp } = useGetMyNotificationsQuery(
    { limit: 8 },
    { pollingInterval: 30000 }
  );
  const [markRead] = useMarkNotificationReadMutation();
  const [markAllRead] = useMarkAllNotificationsReadMutation();

  const notifications = notifResp?.data?.items || [];
  const unreadCount = notifResp?.data?.unreadCount || 0;

  const pageTitle = PAGE_TITLES[location.pathname] || prettify(location.pathname);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setOpenProfile(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setOpenNotifications(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    toast.success("Logged out successfully");
    navigate("/login");
    window.location.reload();
  };

  return (
    <header className="flex items-center justify-between w-full bg-white/90 backdrop-blur-md px-4 sm:px-6 py-3 border-b border-gray-200 sticky top-0 z-40">
      {/* Left: menu toggles + breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600"
        >
          <Menu size={20} />
        </button>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
        </button>

        <div className="min-w-0">
          <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate">{pageTitle}</h1>
          <p className="text-xs text-gray-400 hidden sm:block">Construction ERP</p>
        </div>
      </div>

      {/* Right: notifications + profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setOpenNotifications((v) => !v)}
            className="relative p-2.5 rounded-xl hover:bg-gray-100 transition-colors text-gray-500"
          >
            <Bell size={19} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {openNotifications && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-12 w-80 bg-white shadow-xl rounded-2xl border border-gray-100 overflow-hidden z-50"
              >
                <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50/70">
                  <span className="font-semibold text-gray-800 text-sm">Notifications</span>
                  {unreadCount > 0 && (
                    <button
                      onClick={() => markAllRead()}
                      className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
                  {notifications.length === 0 ? (
                    <p className="text-center text-sm text-gray-400 py-8">You're all caught up 🎉</p>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n._id}
                        onClick={() => !n.isRead && markRead(n._id)}
                        className={`px-4 py-3 text-sm cursor-pointer hover:bg-gray-50 transition-colors ${!n.isRead ? "bg-indigo-50/60" : ""}`}
                      >
                        <p className="font-medium text-gray-800">{n.title}</p>
                        <p className="text-gray-500 text-xs mt-0.5 line-clamp-2">{n.message}</p>
                        <p className="text-gray-400 text-[11px] mt-1">
                          {new Date(n.createdAt).toLocaleString()}
                        </p>
                      </div>
                    ))
                  )}
                </div>
                <div className="px-4 py-2.5 border-t bg-gray-50/70 text-center">
                  <button
                    onClick={() => { setOpenNotifications(false); navigate("/Notification"); }}
                    className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
                  >
                    View all notifications
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Profile */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setOpenProfile((v) => !v)}
            className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <img
              src="/profile.png"
              alt="User"
              className="w-9 h-9 rounded-full border-2 border-white shadow-sm object-cover"
            />
            <div className="hidden sm:block text-left leading-tight">
              <p className="text-sm font-semibold text-gray-800">{user?.name || "User"}</p>
              <p className="text-xs text-gray-400 capitalize">{role || "role"}</p>
            </div>
            <ChevronDown size={14} className="hidden sm:block text-gray-400" />
          </button>

          <AnimatePresence>
            {openProfile && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-14 w-48 bg-white shadow-xl rounded-2xl border border-gray-100 overflow-hidden z-50"
              >
                <ul className="text-gray-700 py-1">
                  <li
                    onClick={() => { setOpenProfile(false); navigate("/Profile"); }}
                    className="px-4 py-2.5 text-sm hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    My Profile
                  </li>
                  <li
                    onClick={handleLogout}
                    className="px-4 py-2.5 text-sm hover:bg-red-50 text-red-600 cursor-pointer transition-colors"
                  >
                    Logout
                  </li>
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};

export default Header;
