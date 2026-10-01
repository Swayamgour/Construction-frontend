// Layout.jsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { useNavigate, Navigate } from "react-router-dom";
import { useCheckLoginQuery, useGetAttendanceQuery } from "../Reduxe/Api";
import { CheckRole } from "../helper/CheckRole";
import { Clock, LogIn, LogOut } from "lucide-react";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import pka from "../../package.json";
import { APP_NAME, CREDIT_NAME, CREDIT_URL } from "../config/brand";

// Formats the seconds elapsed since punch-in as "Hh Mm" / "Mm Ss" so the
// floating action button shows real, ticking data instead of a static label.
const formatElapsed = (totalSeconds) => {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
};

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

  // Live elapsed time since punch-in, ticking every second — real
  // dynamic data instead of a static "Punch Out" label.
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    if (!hasPunchedIn || hasPunchedOut) return undefined;
    const tick = () =>
      setElapsed(Math.max(0, Math.floor((Date.now() - new Date(hasPunchedIn).getTime()) / 1000)));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [hasPunchedIn, hasPunchedOut]);

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

          <AnimatePresence>
            {role !== "admin" && !hasPunchedIn && (
              <motion.button
                key="punch-in"
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.9 }}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate("/employee/punch-in")}
                className="fixed bottom-6 right-6 flex items-center gap-2 bg-gradient-to-br from-emerald-500 to-emerald-700 text-white py-3 px-5 rounded-2xl shadow-xl shadow-emerald-900/30 text-sm font-semibold z-50"
              >
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white" />
                </span>
                <LogIn size={16} /> Punch In
              </motion.button>
            )}

            {hasPunchedIn && !hasPunchedOut && (
              <motion.button
                key="punch-out"
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.9 }}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate("/employee/punch-out")}
                className="fixed bottom-6 right-6 flex items-center gap-3 bg-gradient-to-br from-red-500 to-red-700 text-white py-3 px-5 rounded-2xl shadow-xl shadow-red-900/30 text-sm font-semibold z-50"
              >
                <LogOut size={16} />
                <span className="flex flex-col items-start leading-tight">
                  <span>Punch Out</span>
                  <span className="flex items-center gap-1 text-[11px] font-normal text-red-100">
                    <Clock size={11} /> {formatElapsed(elapsed)}
                  </span>
                </span>
              </motion.button>
            )}
          </AnimatePresence>
        </main>

        <footer className="w-full bg-white border-t border-gray-200 text-gray-500 py-3 px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:justify-between items-center gap-1">
            <div className="flex gap-4 text-xs sm:text-sm">
              <span>© {new Date().getFullYear()} {APP_NAME}. All Rights Reserved.</span>
              <span className="text-gray-400">v{versions}</span>
            </div>
            <div className="text-xs text-gray-400">
              Design by{" "}
              <a
                href={CREDIT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-gray-500 hover:text-indigo-600 underline transition-colors"
              >
                {CREDIT_NAME}
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Layout;
