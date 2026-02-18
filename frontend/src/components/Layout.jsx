// Layout.jsx
import React, { useState } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
// import { useCheckLoginQuery } from "../Reduxe/Api"; // ✅ correct import path
import { useNavigate, Navigate } from "react-router-dom"; // ✅ required for redirect
import { useCheckLoginQuery, useGetAttendanceQuery } from "../Reduxe/Api";
import { CheckRole } from "../helper/CheckRole";

import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import pka from '../../package.json'


const Layout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { data, isLoading, isError } = useCheckLoginQuery();

    const date = new Date().toISOString().split("T")[0];
    const { data: record } = useGetAttendanceQuery({ date });
    // console.log(record?.record?.timeIn);

    // ---- PUNCH STATE ----
    const attendance = record?.record;
    const hasPunchedIn = attendance?.timeIn;
    const hasPunchedOut = attendance?.timeOut;

    const navigate = useNavigate()

    const versions = pka.version;

    // console.log(versions)

    const { role, user } = CheckRole()
    // console.log(role === "admin", user.name)

    // console.log(data)

    // ✅ Show loader until backend verifies token
    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen text-lg font-medium">
                <div className="flex flex-col justify-center items-center gap-3 ">
                    Checking authentication...


                    <Box sx={{ display: 'flex' }}>
                        <CircularProgress />
                    </Box>
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
            {/* Sidebar */}
            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} data={data} />

            {/* Right Section */}
            <div className="flex-1 flex flex-col">
                <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} role={role} user={user}
                />

                <main className="flex-1 overflow-auto">
                    {children}
                    {/* Page Content */}
                    {role !== "admin" && !hasPunchedIn && (
                        <button
                            onClick={() => navigate("/employee/punch-in")}
                            className="fixed bottom-20 right-6 bg-green-600 text-white py-3 px-5 rounded-full shadow-xl text-sm font-semibold z-50"
                        >
                            Punch In
                        </button>
                    )}

                    {hasPunchedIn && !hasPunchedOut && (
                        <button
                            onClick={() => navigate("/employee/punch-out")}
                            className="fixed bottom-20 right-6 bg-red-600 text-white py-3 px-5 rounded-full shadow-xl text-sm font-semibold z-50"
                        >
                            Punch Out
                        </button>
                    )}

                </main>



                {/* Footer */}
                <footer className="w-full bg-white border-t border-gray-200 text-gray-600 py-3 px-4">
                    <div className="flex flex-col sm:flex-row sm:justify-between items-center gap-1">
                        <div className="flex gap-5">
                            <div className="text-center sm:text-left text-sm">
                                © {new Date().getFullYear()} S S Construction. All Rights Reserved.
                            </div>

                            <p>V. {versions}</p>
                        </div>

                        <div className="text-center sm:text-right text-xs text-gray-400 mt-1 sm:mt-0">
                            Design by{" "}
                            <a
                                href="https://riveyrainfotech.com/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-medium text-gray-600 hover:text-blue-600 underline transition-colors"
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
