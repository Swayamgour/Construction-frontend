import React, { useState } from 'react';
import { ChevronDown, Search, Download,  Settings } from 'lucide-react';
import SelectMaterialsModal from '../components/SelectMaterialsModal';
import { IoIosAddCircleOutline } from 'react-icons/io';

// Sample data for the material list
const materialData = [
    {
        material: 'cement',
        code: '101.16b',
        specification: 'Brand: Dalmia,',
        inStockQty: 100, // Added for realism, not directly visible in sample
        stockAlert: 'OK',
        totalAdded: '0 bags',
        usedFrom: '0 bags',
    },
];

// Mock component for the toggle switch
const ToggleSwitch = ({ isChecked, label, onChange }) => (
    <label className="flex items-center cursor-pointer text-sm text-gray-700">
        <div className="relative">
            <input
                type="checkbox"
                className="sr-only"
                checked={isChecked}
                onChange={onChange}
            />
            <div className={`block w-10 h-6 rounded-full ${isChecked ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
            <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition ${isChecked ? 'transform translate-x-4' : 'translate-x-0'}`}></div>
        </div>
        <span className="ml-2">{label}</span>
    </label>
);

const ProjectInventoryDashboard = () => {
    const [showArchived, setShowArchived] = useState(false);
    const [activeInventoryTab, setActiveInventoryTab] = useState('Inventory');

    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const toggleDrawer = () => {
        setIsDrawerOpen(!isDrawerOpen);
    };

    const mainTabs = ['Indents', 'Purchase Orders', 'Inventory', 'GRN', 'Site Transfers', 'Material Issue', 'Material Return', 'Petty Cash', 'Consumptions'];

    return (
        <div className="p-6">
            <h1 className="text-2xl font-normal bg-gradient-to-r from-slate-900 via-blue-800 to-purple-700 bg-clip-text text-transparent mb-3">
                Inventory
            </h1>

            {/* Tabs */}
            <nav className="bg-white border-b border-gray-200 shadow-sm px-4 overflow-x-auto">
                <div className="flex space-x-6 text-sm whitespace-nowrap">
                    {mainTabs.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveInventoryTab(tab)}
                            className={`py-3 font-medium transition-colors ${activeInventoryTab === tab
                                ? "text-blue-600 border-b-2 border-blue-600"
                                : "text-gray-600 hover:text-gray-800"
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </nav>

            {/* Main layout */}
            <div className="flex flex-col lg:flex-row max-w-7xl mx-auto pt-4 gap-6">
                {/* Sidebar */}
                <aside className="w-full lg:w-56 flex-shrink-0 border-r border-gray-200">
                    <nav className="space-y-1">
                        <button className="block py-2 px-3 text-sm text-gray-700 hover:bg-gray-100 rounded-md w-full text-left">
                            All Materials
                        </button>
                        <button className="block py-2 px-3 text-sm text-gray-700 hover:bg-gray-100 rounded-md w-full text-left">
                            Grouped Materials
                        </button>
                        <div className="pt-2">
                            <span className="block py-2 px-3 text-xs font-semibold uppercase text-gray-500">
                                Inventories by Project
                            </span>
                            <div className="relative mb-2">
                                <select
                                    defaultValue="SS Construction"
                                    className="w-full border border-gray-300 p-2 text-sm rounded appearance-none pr-8 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                                >
                                    <option>S S Construction</option>
                                    <option>Project Alpha</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
                            </div>
                            <a
                                href="#"
                                className="flex justify-between items-center py-2 px-3 text-sm bg-blue-50 text-blue-600 font-medium rounded-md border border-blue-200"
                            >
                                Project Inventory
                                <svg
                                    className="h-4 w-4 fill-current"
                                    viewBox="0 0 20 20"
                                >
                                    <path d="M0 11l2-2 5 5L18 3l2 2L7 18z" />
                                </svg>
                            </a>
                        </div>
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="flex-1 flex flex-col">
                    {/* Header buttons */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
                        <h2 className="text-xl font-semibold text-gray-800">Inventory Project</h2>
                        <div className="flex flex-wrap gap-3">
                            <button className="flex items-center border border-gray-300 text-gray-700 hover:bg-gray-100 py-2 px-4 rounded-md text-sm font-medium">
                                <Download className="h-4 w-4 mr-2" /> Export Excel
                            </button>
                            {/* <button
                                onClick={toggleDrawer}
                                className="flex items-center bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md text-sm font-medium shadow-md"
                            >
                                Add Material
                            </button> */}

                            <button
                                onClick={toggleDrawer}
                                className="w-full sm:w-auto bg-blue-700 text-white px-5 py-2 rounded-lg shadow-md hover:bg-blue-800 transition flex items-center justify-center gap-2"
                            >
                                <IoIosAddCircleOutline size={22} />
                                Add Material
                            </button>
                        </div>
                    </div>

                    <SelectMaterialsModal isOpen={isDrawerOpen} onClose={toggleDrawer} />

                    {/* Filters */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
                        <div className="relative w-full sm:w-80">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search Material"
                                className="w-full border border-gray-300 p-2 pl-10 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                        </div>
                        <div className="relative">
                            <button className="flex items-center border border-gray-300 bg-white py-2 px-3 rounded-md text-sm text-gray-700">
                                Category
                                <ChevronDown className="h-4 w-4 ml-1" />
                            </button>
                        </div>
                        <button className="flex items-center text-blue-600 text-sm font-medium hover:underline">
                            More filters
                            <ChevronDown className="h-4 w-4 ml-1" />
                        </button>
                    </div>

                    {/* Inventory Controls */}
                    <div className="flex flex-col sm:flex-row justify-end items-start sm:items-center gap-3 mb-4">
                        <ToggleSwitch
                            isChecked={showArchived}
                            onChange={() => setShowArchived(!showArchived)}
                            label="Show Archived"
                        />
                        <button className="flex items-center text-gray-600 hover:text-gray-800 text-sm font-medium">
                            <Settings className="h-4 w-4 mr-1" /> Manage Columns
                        </button>
                    </div>

                    {/* Materials Table */}
                    <div className="overflow-x-auto w-full rounded-2xl shadow-lg border border-gray-200 ">
                        <table className="min-w-[800px] table-fixed">
                            <thead className="sticky top-0 z-10 bg-blue-900 text-white text-sm font-semibold">
                                <tr>
                                    <th className="px-4 py-3 text-left border-r border-gray-400">Material</th>
                                    <th className="px-4 py-3 text-left border-r border-gray-400">Additional specification</th>
                                    <th className="px-4 py-3 text-center border-r border-gray-400">In stock qty</th>
                                    <th className="px-4 py-3 text-center border-r border-gray-400">Stock alert</th>
                                    <th className="px-4 py-3 text-center border-r border-gray-400">Total added</th>
                                    <th className="px-4 py-3 text-center border-r border-gray-400">Used from</th>
                                    <th className="px-4 py-3 text-center border-r border-gray-400">In stock qty</th>
                                    <th className="px-4 py-3 text-center border-r border-gray-400">In stock qty</th>
                                    <th className="px-4 py-3 text-center border-r border-gray-400">In stock qty</th>

                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {materialData.map((item, index) => (
                                    <tr key={index} className="hover:bg-blue-50 transition-all duration-200">
                                        <td className="px-4 border-r border-gray-200 py-3 text-gray-900">
                                            <div className="font-medium">{item.material}</div>
                                            <div className="text-xs text-gray-500">{item.code}</div>
                                        </td>
                                        <td className="px-4 border-r border-gray-200 py-3 text-gray-600 text-sm">{item.specification}</td>
                                        <td className="px-4 border-r border-gray-200 py-3 text-center">
                                            <button className="text-blue-600 hover:text-blue-800 text-xs font-medium border-b border-dashed border-blue-600 hover:border-blue-800 transition-all duration-200">
                                                Add
                                            </button>
                                        </td>
                                        <td className="px-4 border-r border-gray-200 py-3 text-center text-green-600 font-medium">
                                            <span className="mr-1">≥ 0 bags</span>
                                            {item.stockAlert}
                                        </td>
                                        <td className="px-4 border-r border-gray-200 py-3 text-center text-gray-700 font-medium">
                                            {item.totalAdded}
                                        </td>
                                        <td className="px-4 border-r border-gray-200 py-3 text-center text-gray-700">{item.usedFrom}</td>
                                        <td className="px-4 border-r border-gray-200 py-3 text-center">
                                            <button className="text-blue-600 hover:text-blue-800 text-xs font-medium border-b border-dashed border-blue-600 hover:border-blue-800 transition-all duration-200">
                                                Add
                                            </button>
                                        </td>
                                        <td className="px-4 border-r border-gray-200 py-3 text-center">
                                            <button className="text-blue-600 hover:text-blue-800 text-xs font-medium border-b border-dashed border-blue-600 hover:border-blue-800 transition-all duration-200">
                                                Add
                                            </button>
                                        </td>
                                        <td className="px-4 border-r border-gray-200 py-3 text-center">
                                            <button className="text-blue-600 hover:text-blue-800 text-xs font-medium border-b border-dashed border-blue-600 hover:border-blue-800 transition-all duration-200">
                                                Add
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    
                </main>
            </div>
        </div>

    );
};

export default ProjectInventoryDashboard;