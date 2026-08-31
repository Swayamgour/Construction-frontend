import React, { useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard, UserPlus, Layers, Store, ClipboardList, Users,
  Factory, BarChart2, Boxes, ChevronDown, ArrowRightLeft,
  Clock, FileStack, Truck, CalendarCheck, AlertTriangle,
  PanelLeftClose, PanelLeftOpen, LogOut, X,
} from "lucide-react";
import toast from "react-hot-toast";

// ⚡ ROLE-BASED NAV — grouped into sections so the sidebar reads like a
// menu instead of a flat wall of links. `roles` is preserved exactly
// from the old flat list, so permissions behave the same as before —
// only the presentation changed.
const NAV_GROUPS = [
  {
    label: "Overview",
    items: [
      { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard", roles: ["admin", "manager", "supervisor", "storekeeper", "drawing_manager"] },
      { name: "Manager Dashboard", icon: BarChart2, path: "/pm/dashboard", roles: ["manager"] },
    ],
  },
  {
    label: "Projects",
    items: [
      { name: "All Projects", icon: Layers, path: "/Product", roles: ["admin"] },
      { name: "My Projects", icon: Layers, path: "/AssignProject", roles: ["manager", "supervisor"] },
      { name: "Gantt Chart", icon: ClipboardList, path: "/AddGanttTask", roles: ["admin", "manager", "supervisor"] },
    ],
  },
  {
    label: "Labour",
    items: [
      { name: "Labour Manage", icon: Users, path: "/LabourDashboard", roles: ["admin", "manager", "supervisor"] },
      { name: "Assign Labour", icon: Users, path: "/AssignLabour", roles: ["manager", "supervisor"] },
      { name: "Attendance Labour", icon: ClipboardList, path: "/AttendanceLabour", roles: ["admin", "manager"] },
      { name: "Approve Attendance", icon: ClipboardList, path: "/employee/pending", roles: ["admin"] },
      { name: "Labour Transfer", icon: ArrowRightLeft, path: "/labour/transfer", roles: ["admin", "manager", "supervisor"] },
      { name: "Labour Overtime", icon: Clock, path: "/labour/overtime", roles: ["admin", "manager", "supervisor"] },
    ],
  },
  {
    label: "Materials & Stock",
    items: [
      { name: "Stock Overview", icon: Boxes, path: "/StockOverView", roles: ["supervisor", "admin", "manager"] },
      { name: "Stock Manage", icon: Boxes, path: "/StockPage", roles: ["supervisor", "admin", "manager"] },
      // "Approve Stock" and "Material Approval" used to be two separate
      // entries pointing at the exact same page — merged into one so
      // it doesn't look like two different features.
      { name: "Material Approval", icon: BarChart2, path: "/MaterialApproval", roles: ["admin", "manager"] },
      { name: "Stock Requests", icon: Boxes, path: "/stock/requests", roles: ["admin", "manager", "supervisor", "storekeeper"] },
    ],
  },
  {
    label: "Machinery",
    items: [
      { name: "Machine", icon: Factory, path: "/machine/list", roles: ["admin", "manager", "supervisor"] },
      { name: "Machine Requests", icon: Truck, path: "/machinery/requests", roles: ["admin", "manager", "supervisor"] },
    ],
  },
  {
    label: "Vendors & Tasks",
    items: [
      { name: "Vendor Manage", icon: Store, path: "/VendorManagement", roles: ["admin", "manager"] },
      { name: "Assign Task", icon: ClipboardList, path: "/TaskList", roles: ["admin", "manager"] },
    ],
  },
  {
    label: "Tracking",
    items: [
      { name: "Drawings", icon: FileStack, path: "/drawings", roles: ["admin", "manager", "supervisor", "drawing_manager"] },
      { name: "EOD Reports", icon: CalendarCheck, path: "/eod-reports", roles: ["admin", "manager", "supervisor"] },
      { name: "Project Delays", icon: AlertTriangle, path: "/project-delays", roles: ["admin", "manager", "supervisor"] },
    ],
  },
  {
    label: "Administration",
    items: [
      { name: "Create Role", icon: UserPlus, path: "/ViewUser", roles: ["admin"] },
    ],
  },
];

const ROLE_STYLES = {
  admin: "bg-purple-500/15 text-purple-300 border-purple-500/30",
  manager: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  supervisor: "bg-teal-500/15 text-teal-300 border-teal-500/30",
  storekeeper: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  drawing_manager: "bg-pink-500/15 text-pink-300 border-pink-500/30",
};

const initials = (name = "") =>
  name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("") || "U";

const Sidebar = ({ sidebarOpen, setSidebarOpen, collapsed, setCollapsed, data }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const userRole = data?.user?.role;
  const userName = data?.user?.name;

  // which groups are expanded — default: the group containing the
  // current route is open, rest closed, so the nav stays scannable.
  const [openGroups, setOpenGroups] = useState(() => {
    const g = NAV_GROUPS.find((grp) =>
      grp.items.some((it) => location.pathname.startsWith(it.path))
    );
    return g ? { [g.label]: true } : { Overview: true };
  });

  const visibleGroups = useMemo(
    () =>
      NAV_GROUPS
        .map((grp) => ({ ...grp, items: grp.items.filter((it) => it.roles.includes(userRole)) }))
        .filter((grp) => grp.items.length > 0),
    [userRole]
  );

  const toggleGroup = (label) =>
    setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }));

  const handleItemClick = (path) => {
    navigate(path);
    setSidebarOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    toast.success("Logged out successfully");
    navigate("/login");
    window.location.reload();
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm lg:hidden z-[9990]"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 z-[9999] h-screen bg-slate-900 text-slate-200
        flex flex-col transition-[width,transform] duration-300 ease-in-out
        ${collapsed ? "lg:w-[76px]" : "lg:w-64"}
        w-72 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-white/10 shrink-0">
          <div
            onClick={() => handleItemClick("/dashboard")}
            className="flex items-center gap-3 cursor-pointer overflow-hidden"
          >
            <div className="w-9 h-9 shrink-0 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-indigo-900/40">
              SS
            </div>
            {!collapsed && (
              <span className="font-bold text-white tracking-wide whitespace-nowrap">
                S S Construction
              </span>
            )}
          </div>
          <button
            className="lg:hidden p-1.5 rounded-lg hover:bg-white/10 text-slate-300"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-2.5 space-y-1 scrollbar-thin">
          {visibleGroups.map((grp) => (
            <div key={grp.label} className="mb-1">
              {!collapsed && (
                <button
                  onClick={() => toggleGroup(grp.label)}
                  className="w-full flex items-center justify-between px-2.5 py-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500 hover:text-slate-300 transition-colors"
                >
                  <span>{grp.label}</span>
                  <ChevronDown
                    size={13}
                    className={`transition-transform duration-200 ${openGroups[grp.label] ? "rotate-180" : ""}`}
                  />
                </button>
              )}

              <div
                className={`space-y-0.5 overflow-hidden transition-all duration-200 ${
                  collapsed || openGroups[grp.label] ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                {grp.items.map((item, i) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);
                  return (
                    <button
                      key={item.path + i}
                      title={collapsed ? item.name : undefined}
                      onClick={() => handleItemClick(item.path)}
                      className={`group relative w-full flex items-center gap-3 px-2.5 py-2.5 rounded-xl text-sm font-medium transition-all
                        ${collapsed ? "justify-center" : ""}
                        ${active
                          ? "bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md shadow-indigo-900/30"
                          : "text-slate-300 hover:bg-white/5 hover:text-white"}`}
                    >
                      <Icon size={18} className="shrink-0" />
                      {!collapsed && <span className="truncate">{item.name}</span>}
                      {collapsed && (
                        <span className="pointer-events-none absolute left-full ml-2 whitespace-nowrap rounded-lg bg-slate-800 px-2.5 py-1.5 text-xs text-white opacity-0 shadow-lg group-hover:opacity-100 transition-opacity z-50">
                          {item.name}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Collapse toggle (desktop only) */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex items-center justify-center gap-2 mx-2.5 mb-2 py-2 rounded-xl text-slate-400 hover:bg-white/5 hover:text-white text-xs font-medium transition-colors"
        >
          {collapsed ? <PanelLeftOpen size={16} /> : <><PanelLeftClose size={16} /> Collapse</>}
        </button>

        {/* User footer */}
        <div className="border-t border-white/10 p-3 shrink-0">
          <div className={`flex items-center gap-3 rounded-xl px-2 py-2 ${collapsed ? "justify-center" : ""}`}>
            <div className="w-9 h-9 shrink-0 rounded-full bg-slate-700 flex items-center justify-center text-white text-xs font-semibold">
              {initials(userName)}
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white truncate">{userName || "User"}</p>
                <span className={`inline-block mt-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded-md border capitalize ${ROLE_STYLES[userRole] || "bg-slate-700 text-slate-300 border-slate-600"}`}>
                  {userRole || "role"}
                </span>
              </div>
            )}
            {!collapsed && (
              <button
                title="Logout"
                onClick={handleLogout}
                className="p-2 rounded-lg text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
              >
                <LogOut size={16} />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
