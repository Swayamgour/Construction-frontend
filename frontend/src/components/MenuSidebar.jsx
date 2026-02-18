// import * as React from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
    FiHome, FiUsers, FiCalendar, FiSettings, FiChevronDown, FiChevronUp, FiCircle
} from "react-icons/fi";
import { RiBillLine } from "react-icons/ri";
import { AiOutlineProject } from "react-icons/ai";
import { FaTasks, FaChartLine } from "react-icons/fa";
import { IoMdPeople } from "react-icons/io";
import { FiMenu } from "react-icons/fi"; // 👈 slider (menu) icon

// import { motion } from "framer-motion";

import {
    // FiHome,
    // FiCircle,
    // FiUsers,
    FiUserCheck,
    // FiCalendar
} from "react-icons/fi";
import {
    AiOutlineProduct,
    // AiOutlineProject
} from "react-icons/ai";
import { useState } from 'react';
// import MenuSidebar from "./MenuSidebar";


export default function MenuSidebar() {
    const [open, setOpen] = useState(false);
    const [activeView, setActiveView] = useState("");
    const [openDropdown, setOpenDropdown] = useState(null);
    const navigate = useNavigate();

    const menuItems = [
        { name: "Dashboard", icon: <FiHome />, path: "/dashboard" },

        { name: "Product", icon: <AiOutlineProduct />, path: "/Product" },

        {
            name: "Receivables",
            icon: <RiBillLine />,
            submenu: [
                { name: "Bill of Quantities", path: "/BillofQuantities", icon: <FiCircle /> },
                // { name: "Received Amount", path: "/PaymentHistory", icon: <FiCircle /> },
            ],
        },

        {
            name: "Member",
            icon: <IoMdPeople />,
            submenu: [
                { name: "All Member", path: "/AddMember", icon: <FiCircle /> },
            ],
        },

        {
            name: "Tasks",
            icon: <FaTasks />,
            submenu: [
                { name: "Plan View", path: "/TaskManagement", icon: <FiCircle /> },
                { name: "Inventory", path: "/ProjectInventoryDashboard", icon: <FiCircle /> },
            ],
        },

        {
            name: "User Per & Roles",
            icon: <FiUsers />,
            path: "/UserRolesAndPermissions",
        },

        {
            name: "Commercial",
            icon: <FiUserCheck />,
            submenu: [
                { name: "GRM / Vendor", path: "/VendorManagementDashboard", icon: <FiCircle /> },
                { name: "Tasks", path: "/TaskManagement", icon: <FiCircle /> },
            ],
        },

        // { name: "Calendar", icon: <FiCalendar />, path: "/calendar" },
        // { name: "Reports", icon: <FaChartLine />, path: "/reports" },
    ];


    const handleItemClick = (itemName, hasSubmenu, path) => {
        if (hasSubmenu) {
            setOpenDropdown(openDropdown === itemName ? null : itemName);
        } else {
            setActiveView(itemName);
            navigate(path);
            setOpenDropdown(null);
        }
    };

    const toggleDrawer = (newOpen) => () => {
        setOpen(newOpen);
    };

    const DrawerList = (
        <Box sx={{ width: 250 }} role="presentation" onClick={toggleDrawer(false)}>
            <div
                className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-100
         transform transition-transform duration-300
       
           lg:translate-x-0 lg:static lg:inset-0 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent`}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-gray-200">
                    <div onClick={() => navigate('/dashboard')} className="flex items-center space-x-3 cursor-pointer">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-lg cursor-pointer">
                            ss
                        </div>
                        <div>
                            <h1 className="text-lg font-black bg-gradient-to-r from-slate-900 to-blue-800 bg-clip-text text-transparent">
                                S S C
                            </h1>
                            {/* <p className="text-xs text-gray-500"> Suite</p> */}
                        </div>
                    </div>

                </div>

                {/* Menu */}
                <nav className="p-4 space-y-2">
                    {menuItems.map((item, index) => {
                        const hasSubmenu = !!item.submenu?.length;
                        const isOpen = openDropdown === item.name;

                        return (
                            <div key={index}>
                                {/* Main Button */}
                                <button
                                    onClick={() => handleItemClick(item.name, hasSubmenu, item.path)}
                                    className={`flex items-center justify-between w-full px-4 py-3 rounded-xl transition-all duration-300
                  ${activeView === item.name
                                            ? "bg-blue-600 text-white shadow-lg"
                                            : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                                        }`}
                                >
                                    <div className="flex items-center space-x-3">
                                        <span className="text-lg">{item.icon}</span>
                                        <span className="font-semibold">{item.name}</span>
                                    </div>


                                    {hasSubmenu && (
                                        <span>
                                            {isOpen ? (
                                                <FiChevronUp className="text-gray-500" />
                                            ) : (
                                                <FiChevronDown className="text-gray-500" />
                                            )}
                                        </span>
                                    )}
                                </button>

                                {/* Dropdown */}
                                <AnimatePresence>
                                    {isOpen && hasSubmenu && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            exit={{ opacity: 0, height: 0 }}
                                            transition={{ duration: 0.25 }}
                                            className="ml-10 mt-1 overflow-hidden"
                                        >
                                            {item.submenu.map((sub, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => {
                                                        navigate(sub.path);
                                                        setActiveView(sub.name);
                                                    }}
                                                    className={`flex items-center w-full px-2 py-2 text-sm rounded-lg mb-1 transition-colors ${activeView === sub.name
                                                        ? "text-blue-600 bg-blue-50 font-medium"
                                                        : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                                                        }`}
                                                >
                                                    {sub.icon}
                                                    <span className="ml-2">{sub.name}</span>
                                                </button>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    })}
                </nav>

                {/* Profile Section */}

            </div>
        </Box>
    );

    return (
        <div>
            {/* <Button onClick={toggleDrawer(true)}>Open drawer</Button> */}
            <button
                onClick={toggleDrawer(true)}
                className="lg:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors"
            >
                <FiMenu className="h-5 w-5 text-gray-600" />
            </button>
            <Drawer open={open} onClose={toggleDrawer(false)}>
                {DrawerList}
            </Drawer>
        </div>
    );
}
