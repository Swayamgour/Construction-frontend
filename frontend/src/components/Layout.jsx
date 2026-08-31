// Layout.jsx
import React, { useState, useEffect } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { useNavigate, Navigate } from "react-router-dom";
import { useCheckLoginQuery, useGetAttendanceQuery } from "../Reduxe/Api";
import { CheckRole } from "../helper/CheckRole";
import { Clock } from "lucide-react";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import pka from "../../package.json";

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // Desktop icon-rail mode — remembered across visits.
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem("sidebarCollapsed") === "1"
  );
  useEffect(() => {
    localStorage.setItem("sidebarCollapsed", collapsed ? "1" : "0");
  }, [collapsed]);

  const { data, isLoading, isError } = useCheckLoginQuery();

  const date = new Date().toISOString().split("T")[0];
  const { data: record } = useGetAttendanceQuery({ date });

  // ---- PUNCH STATE ----
  const attendance = record?.record;
  const hasPunchedIn = attendance?.timeIn;
  const hasPunchedOut = attendance?.timeOut;

  const navigate = useNavigate();
  const versions = pka.version;
  const { role, user } = CheckRole();

  // ✅ Show loader until backend verifies token
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-3 text-gray-500 font-medium">
          <Box sx={{ display: "flex" }}>
            <CircularProgress size={32} />
          </Box>
          Checking authentication...
        </div>
      </div>
    );
  }

  // ❌ Token invalid OR no token → Redirect to Login
  if (isError) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50">
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        data={data}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          role={role}
          user={user}
        />

        <main className="flex-1 overflow-auto p-4 sm:p-6">
          {children}

          {role !== "admin" && !hasPunchedIn && (
            <button
              onClick={() => navigate("/employee/punch-in")}
              className="fixed bottom-6 right-6 flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-5 rounded-2xl shadow-xl shadow-emerald-900/20 text-sm font-semibold z-50 transition-colors"
            >
              <Clock size={16} /> Punch In
            </button>
          )}

          {hasPunchedIn && !hasPunchedOut && (
            <button
              onClick={() => navigate("/employee/punch-out")}
              className="fixed bottom-6 right-6 flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white py-3 px-5 rounded-2xl shadow-xl shadow-red-900/20 text-sm font-semibold z-50 transition-colors"
            >
              <Clock size={16} /> Punch Out
            </button>
          )}
        </main>

        <footer className="w-full bg-white border-t border-gray-200 text-gray-500 py-3 px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:justify-between items-center gap-1">
            <div className="flex gap-4 text-xs sm:text-sm">
              <span>© {new Date().getFullYear()} S S Construction. All Rights Reserved.</span>
              <span className="text-gray-400">v{versions}</span>
            </div>
            <div className="text-xs text-gray-400">
              Design by{" "}
              <a
                href="https://riveyrainfotech.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-gray-500 hover:text-indigo-600 underline transition-colors"
              >
                Riveyra Infotech Pvt Ltd.
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Layout;
