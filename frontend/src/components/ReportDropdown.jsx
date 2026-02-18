import React, { useState, useRef, useEffect } from "react";
import DownloadProgressReport from "./DownloadProgressReport";
import { TbReportMedical } from "react-icons/tb";

const ReportDropdown = () => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown if clicked outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const toggleDrawer = () => {
        setIsDrawerOpen(!isDrawerOpen);
    };

    return (
        <div className="relative inline-block" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
                <TbReportMedical size={20} />
                Generate Report
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    <ul className="py-2 text-sm text-gray-700">
                        <li>
                            <button className="w-full text-left px-4 py-2 hover:bg-gray-100">
                                Daily Report
                            </button>
                        </li>
                        <li>
                            <button className="w-full text-left px-4 py-2 hover:bg-gray-100">
                                Weekly Report
                            </button>
                        </li>
                        <li>
                            <button className="w-full text-left px-4 py-2 hover:bg-gray-100">
                                Monthly Report
                            </button>
                        </li>
                        <li>
                            <button onClick={toggleDrawer} className="w-full text-left px-4 py-2 hover:bg-gray-100">
                                Download Progress Report
                            </button>
                        </li>
                    </ul>
                </div>
            )}

            <DownloadProgressReport
                isOpen={isDrawerOpen}
                onClose={toggleDrawer}
            />
        </div>
    );
};

export default ReportDropdown;
