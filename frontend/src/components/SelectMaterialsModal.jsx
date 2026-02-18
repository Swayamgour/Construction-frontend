import React, { useState } from "react";
import { X, Search, Filter, Plus, ChevronDown } from "lucide-react";
import Drawer from "../helper/Drawer";

const materialsData = [
    { id: "m1", name: "STB", specification: "", category: "" },
    { id: "m2", name: "Concrete M15", specification: "", category: "" },
    { id: "m3", name: "sand", specification: "S", category: "" },
    { id: "m4", name: "Polyurethane Liquid Membrane", specification: "Single Component", category: "" },
    { id: "m5", name: "Bitumen Membrane", specification: "SBS Modified", category: "" },
    { id: "m6", name: "Waterproofing Coating", specification: "Acrylic Based", category: "" },
    { id: "m7", name: "BRICK", specification: "Standard Red", category: "Construction" },
    { id: "m8", name: "Cement OPC 43", specification: "50kg Bag", category: "Construction" },
    { id: "m9", name: "Steel Rebar", specification: "Fe 500D", category: "Structure" },
    { id: "m10", name: "Wood Planks", specification: "Pine, 2x4", category: "Finishing" },
];

const SelectMaterialsModal = ({ isOpen, onClose }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedMaterials, setSelectedMaterials] = useState([]);
    const [rowsPerPage, setRowsPerPage] = useState(20);

    const handleCheckboxChange = (materialId) => {
        setSelectedMaterials((prev) =>
            prev.includes(materialId)
                ? prev.filter((id) => id !== materialId)
                : [...prev, materialId]
        );
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedMaterials(materialsData.map((m) => m.id));
        } else {
            setSelectedMaterials([]);
        }
    };

    const handleContinue = () => {
        console.log("Selected Materials:", selectedMaterials);
        onClose();
    };

    const filteredMaterials = materialsData.filter(
        (m) =>
            m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            m.specification.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Drawer
            isOpen={isOpen}
            onClose={onClose}
            title="Select Materials"
            actions={[
                { label: "Close", onClick: onClose, color: "secondary" },
                { label: "Continue", onClick: handleContinue, color: "primary" },
            ]}
            // widthClass="w-1/2"
            widthClass="w-full md:w-2/5 lg:w-1/3"
        >
            <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl mx-auto flex flex-col h-[90vh]">

                {/* Header */}


                {/* Search & Filter Section */}
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center space-x-3 mb-4">
                        <div className="relative flex-grow">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <input
                                type="text"
                                placeholder="Search materials..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full border border-gray-300 p-2 pl-9 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm("")}
                                    className="absolute right-8 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                            <button className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                <Filter className="h-4 w-4" />
                            </button>
                        </div>

                        <button className="flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium whitespace-nowrap">
                            <Plus className="h-4 w-4 mr-1" /> New Material
                        </button>
                    </div>

                    {/* Filter Buttons */}
                    <div className="flex items-center space-x-3">
                        {["All Category", "Brand", "Color"].map((label, idx) => (
                            <button
                                key={idx}
                                className="flex items-center border border-gray-300 bg-white hover: py-2 px-3 rounded-md text-sm text-gray-700"
                            >
                                {label}
                                <ChevronDown className="h-4 w-4 ml-1" />
                            </button>
                        ))}
                        <button className="flex items-center text-blue-600 text-sm font-medium hover:underline">
                            <Plus className="h-4 w-4 mr-1" /> More
                        </button>
                    </div>
                </div>

                {/* Materials Table */}
                <div className="flex-1 overflow-y-auto">
                    <div className="bg-white">
                        {/* Table Header */}
                        <div className="grid grid-cols-12 text-sm font-medium text-gray-500 border-b border-gray-200 py-3 px-4 sticky top-0 bg-white z-10">
                            <div className="col-span-1 flex justify-center">
                                <input
                                    type="checkbox"
                                    className="form-checkbox h-4 w-4 text-blue-600 rounded"
                                    onChange={handleSelectAll}
                                    checked={
                                        selectedMaterials.length === filteredMaterials.length &&
                                        filteredMaterials.length > 0
                                    }
                                />
                            </div>
                            <div className="col-span-5">Material Name</div>
                            <div className="col-span-4">Additional Specification</div>
                            <div className="col-span-2">Category</div>
                        </div>

                        {/* Table Rows */}
                        <div className="divide-y divide-gray-100">
                            {filteredMaterials.map((material) => (
                                <div
                                    key={material.id}
                                    className="grid grid-cols-12 text-sm py-3 px-4 hover:"
                                >
                                    <div className="col-span-1 flex justify-center items-center">
                                        <input
                                            type="checkbox"
                                            className="form-checkbox h-4 w-4 text-blue-600 rounded"
                                            checked={selectedMaterials.includes(material.id)}
                                            onChange={() => handleCheckboxChange(material.id)}
                                        />
                                    </div>
                                    <div className="col-span-5 text-gray-800">
                                        <div className="font-semibold">{material.name}</div>
                                        {material.specification && (
                                            <div className="text-xs text-gray-500">
                                                {material.specification}
                                            </div>
                                        )}
                                    </div>
                                    <div className="col-span-4 text-gray-600">
                                        {material.specification || "-"}
                                    </div>
                                    <div className="col-span-2 text-gray-600">
                                        {material.category || "-"}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer / Pagination */}
                <div className="flex justify-between items-center border-t border-gray-200 p-4 bg-white sticky bottom-0">
                    <div className="flex items-center text-sm text-gray-600 space-x-4">
                        <div className="flex items-center space-x-2">
                            <span className="text-gray-500">Rows per page:</span>
                            <div className="relative">
                                <select
                                    value={rowsPerPage}
                                    onChange={(e) => setRowsPerPage(Number(e.target.value))}
                                    className="bg-white border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 pr-6"
                                >
                                    <option value="10">10</option>
                                    <option value="20">20</option>
                                    <option value="50">50</option>
                                </select>
                                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                            </div>
                        </div>

                        <div>1-{rowsPerPage} of {filteredMaterials.length}</div>

                        <div className="flex space-x-2 text-xl">
                            <span className="cursor-pointer text-gray-400 hover:text-gray-600">&lt;</span>
                            <span className="cursor-pointer text-gray-400 hover:text-gray-600">&gt;</span>
                        </div>
                    </div>

                    <button
                        onClick={handleContinue}
                        className="px-6 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 shadow-md"
                    >
                        Continue
                    </button>
                </div>
            </div>
        </Drawer>
    );
};

export default SelectMaterialsModal;
