import React, { useState } from "react";
import Drawer from "../helper/Drawer";

function AddNewProject({ isOpen, onClose }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedProjects, setSelectedProjects] = useState([]);
    const [projects] = useState([
        "Projects in SC Payable",
        "Plot 9 REDI",
        "Speed Housing",
        "Bu bhandari Project",
        "APEX HOSPITALS",
        "West Delhi",
        "bsnl 4g",
        "BSNL 4G",
        "SJR PRIME A",
        "Rabin bc",
    ]);

    const handleToggle = (project) => {
        setSelectedProjects((prev) =>
            prev.includes(project)
                ? prev.filter((p) => p !== project)
                : [...prev, project]
        );
    };

    const handleAdd = () => {
        console.log("Selected projects:", selectedProjects);
        onClose();
    };

    const filteredProjects = projects.filter((p) =>
        p.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Drawer
            isOpen={isOpen}
            onClose={onClose}
            title="Add hjskaldjaslkdjsa to projects"
            widthClass="w-full md:w-2/3 lg:w-1/2"
        >
            <div className="p-4 flex flex-col h-full">
                {/* Search Bar */}
                <input
                    type="text"
                    placeholder="Type 2 or more letters to search project"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                {/* Project List */}
                <div className="flex-1 overflow-y-auto border rounded-md">
                    {filteredProjects.map((project, index) => (
                        <div
                            key={index}
                            className="flex items-center px-4 py-2 border-b hover:bg-gray-50"
                        >
                            <input
                                type="checkbox"
                                checked={selectedProjects.includes(project)}
                                onChange={() => handleToggle(project)}
                                className="mr-3"
                            />
                            <span className="text-gray-800 text-sm">{project}</span>
                        </div>
                    ))}
                </div>

                {/* Pagination Info */}
                <div className="flex justify-between text-sm text-gray-500 mt-3">
                    <span>Rows per page: 10</span>
                    <span>1–10 of 725</span>
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-3 mt-5">
                    <button
                        onClick={onClose}
                        className="px-5 py-2 rounded-md border border-gray-300 hover:bg-gray-100 text-gray-700"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleAdd}
                        className="px-5 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
                    >
                        Add to projects
                    </button>
                </div>
            </div>
        </Drawer>
    );
}

export default AddNewProject;
