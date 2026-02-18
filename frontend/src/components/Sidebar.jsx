import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  UserPlus, Layers, Store, Wrench, ClipboardList, Users,
  Factory, BarChart2, Boxes, ChevronLeft
} from "lucide-react";


const Sidebar = ({ sidebarOpen, setSidebarOpen, data }) => {
  const [activeView, setActiveView] = useState("");
  const navigate = useNavigate();
  const userRole = data?.user?.role;


  // const version = process.env.REACT_APP_VERSION;
  
  // ⚡ ROLE BASED MENU
  const menuItems = [
    { name: "Manager", icon: <BarChart2 size={20} />, path: "/pm/dashboard", roles: ["manager"] },
    { name: "Create Role", icon: <UserPlus size={20} />, path: "/ViewUser", roles: ["admin"] },
    { name: "Projects", icon: <Layers size={20} />, path: "/Product", roles: ["admin"] },
    { name: "Projects", icon: <Layers size={20} />, path: "/AssignProject", roles: ["manager", "supervisor"] },
    { name: "Labour Manage", icon: <Users size={20} />, path: "/LabourDashboard", roles: ["admin", "manager", "supervisor"] },
    { name: "Assign labour", icon: <Users size={20} />, path: "/AssignLabour", roles: ["manager", "supervisor"] },
    // { name: "App Attendance", icon: <ClipboardList size={20} />, path: "/attendance/pending", roles: ["admin", "manager"] },
    { name: "Attendance Labour", icon: <ClipboardList size={20} />, path: "/AttendanceLabour", roles: ["admin", "manager"] },
    { name: "Vendor Manage", icon: <Store size={20} />, path: "/VendorManagement", roles: ["admin", "manager"] },
    { name: "Stock Overview", icon: <Boxes size={20} />, path: "/StockOverView", roles: ["supervisor", "admin", "manager"] },
    { name: "Stock Manage", icon: <Boxes size={20} />, path: "/StockPage", roles: ["supervisor", "admin", "manager"] },

    { name: "Approve Stock", icon: <Boxes size={20} />, path: "/MaterialApproval", roles: ["admin", "manager"] },
    // { name: "Work Management", icon: <Wrench size={20} />, path: "/WorkManagement", roles: ["admin", "manager", "supervisor"] },
    { name: "Assign Task", icon: <ClipboardList size={20} />, path: "/TaskList", roles: ["admin", "manager"] },
    // { name: "Machine Manage", icon: <Factory size={20} />, path: "/MachineManageMent", roles: ["admin"] },
    { name: "Material Approval", icon: <BarChart2 size={20} />, path: "/MaterialApproval", roles: ["admin"] },
    { name: "My Task", icon: <ClipboardList size={20} />, path: "/MyTasks", roles: ["supervisor", "manager"] },
    { name: "Machine", icon: <Factory size={20} />, path: "/machine/list", roles: ["admin", "manager", "supervisor"] },

    // { name: "Punch In", icon: <ClipboardList size={20} />, path: "/employee/punch-in", roles: ["manager", "supervisor"] },
    // { name: "Attendance", icon: <ClipboardList size={20} />, path: "/employee/punch-in", roles: ["manager", "supervisor"] },
    { name: "Approve Atten", icon: <ClipboardList size={20} />, path: "/employee/pending", roles: ["admin"] },
    { name: "Gantt Chart", icon: <ClipboardList size={20} />, path: "/AddGanttTask", roles: ["admin", "manager", "supervisor"] },
    // { name: "Reports", icon: <BarChart2 size={20} />, path: "/ReportsPage", roles: ["admin", "manager"] },
  ];

  // FILTER MENU BY ROLE
  const visibleMenu = menuItems.filter(item => item.roles.includes(userRole));

  // MENU CLICK HANDLER
  const handleItemClick = (name, path) => {
    setActiveView(name);
    navigate(path);
    setSidebarOpen(false); // 👉 close sidebar on mobile
  };

  return (
    <>
      {/* 🔳 Mobile Overlay (Click to Close) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm lg:hidden z-[9990]"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* 🟦 SIDEBAR */}
      <div
        className={`fixed lg:sticky top-0 z-[9999] w-64 h-screen bg-white border-r border-gray-100
        transform transition-transform duration-300
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0 overflow-y-auto`}
      >
        {/* 🏢 Logo + Mobile Close */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <div onClick={() => navigate('/dashboard')} className="flex items-center space-x-3 cursor-pointer">
            {/* <img src="/logoss.png" className="w-8" alt="logo" /> */}
            <img src={`/logoss.png`} alt="profile" className="w-8" />

            <h1 className="text-lg font-black bg-gradient-to-r from-slate-900 to-blue-800 bg-clip-text text-transparent">
              S S C
            </h1>
          </div>

          {/* ❌ Close Icon for Mobile */}
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
            onClick={() => setSidebarOpen(false)}
          >
            <ChevronLeft />
          </button>
        </div>

        {/* 📌 MENU ITEMS */}
        <nav className="p-4 space-y-2">
          {visibleMenu.map((item, index) => (
            <button
              key={index}
              onClick={() => handleItemClick(item.name, item.path)}
              className={`flex items-center w-full px-4 py-3 rounded-xl transition-all
              ${activeView === item.name ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-100"}`}
            >
              <span className="mr-3">{item.icon}</span>
              <span className="font-semibold">{item.name}</span>
            </button>
          ))}
        </nav>
      </div>

     


    </>
  );
};

export default Sidebar;
