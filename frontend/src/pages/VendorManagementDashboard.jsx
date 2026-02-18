import React, { useState } from "react";
import { Search, ChevronDown, Upload, Download, Plus } from "lucide-react";
import { MdOutlineKeyboardArrowRight } from "react-icons/md";
// import { useNavigate } from "react-router-dom";
// import * as XLSX from "xlsx";
// import { useNavigate } from "react-router-dom";2

import * as XLSX from "xlsx";
import { useNavigate } from "react-router-dom";
import { useGetVendorsQuery } from "../Reduxe/Api";


const vendorsData = [
    { name: "adkjsadjalkd", categories: ["SubContractor"] },
    { name: "ramesh mason vendor", categories: ["Labours"] },
    { name: "gad", categories: ["Labours", "SubContractor"] },
    { name: "jflksjlkodf", categories: ["Material"] },
    { name: "Another Vendor Name", categories: ["Material", "Equipment"] },
];

const CategoryTag = ({ category }) => (
    <span className="inline-block bg-gray-200 text-gray-700 text-xs font-medium px-2 py-0.5 rounded-full mr-1 mb-1">
        {category}
    </span>
);



const VendorManagementDashboard = () => {

    const navigate = useNavigate()

    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedProject, setSelectedProject] = useState("");

    const categoryOptions = ["Labours", "Material", "SubContractor", "Equipment"];
    const projectOptions = ["Project A", "Project B", "Project C"];

    const { data } = useGetVendorsQuery()

    console.log(data)


    const vendorList = [
        { name: "ABC Traders", phone: "9876543210", location: "Delhi" },
        { name: "Sharma Cement Supplier", phone: "9123456780", location: "Mumbai" },
    ];

    const filteredVendors = vendorsData.filter((vendor) => {
        return (
            vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
            (selectedCategory ? vendor.categories.includes(selectedCategory) : true) &&
            (selectedProject ? vendor.project === selectedProject : true)
        );
    });


    const handleExportExcel = () => {
        const ws = XLSX.utils.json_to_sheet(vendorList);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Vendors");
        XLSX.writeFile(wb, "Vendor_List.xlsx");
    };

    const handleUploadVendorList = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();

        reader.onload = (event) => {
            const data = XLSX.read(event.target.result, { type: "binary" });
            const sheet = data.Sheets[data.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(sheet);

            console.log("Uploaded Vendor Data:", jsonData);

            // 👉 Yaha tum data ko state me save kar sakte ho, API me send kar sakte ho, table me dikha sakte ho.
        };

        reader.readAsBinaryString(file);
    };


    return (
        <div className="min-h-screen p-4 sm:p-6">
            <div className="max-w-7xl mx-auto">

                {/* --- Header and Action Buttons --- */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                    <h1 className="text-2xl font-normal bg-gradient-to-r from-slate-900 via-blue-800 to-purple-700 bg-clip-text text-transparent mb-3 sm:mb-0">
                        Vendor
                    </h1>

                    <div className="flex flex-wrap gap-3">

                        {/* Export Excel */}
                        <button
                            onClick={handleExportExcel}
                            className="flex items-center border border-gray-300 text-gray-700 hover:bg-gray-100 py-2 px-4 rounded-md text-sm font-medium w-full sm:w-auto justify-center"
                        >
                            <Download className="h-4 w-4 mr-2" />
                            Export Excel
                        </button>

                        {/* Upload Vendor List */}
                        <label
                            className="flex items-center border border-gray-300 text-gray-700 hover:bg-gray-100 py-2 px-4 rounded-md text-sm font-medium w-full sm:w-auto justify-center cursor-pointer"
                        >
                            <Upload className="h-4 w-4 mr-2" />
                            Upload Vendor List
                            <input type="file" accept=".xlsx, .xls" className="hidden" onChange={handleUploadVendorList} />
                        </label>

                        {/* Create New Vendor */}
                        <button
                            onClick={() => navigate('/CreateNewVendorForm')}
                            className="flex items-center bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md text-sm font-medium shadow-md w-full sm:w-auto justify-center"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Create New Vendor
                        </button>

                    </div>

                </div>

                {/* --- Search and Filters Bar --- */}
                <div className="flex flex-col sm:flex-row flex-wrap sm:flex-nowrap items-start sm:items-center gap-2 sm:gap-3 mb-6">

                    {/* Search Input */}
                    <div className="relative w-full sm:w-72">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search vendors"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full border border-gray-300 p-2 pl-10 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                    </div>

                    {/* Vendor Category Filter */}
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="border border-gray-300 bg-white py-2 px-3 rounded-md text-sm text-gray-700 w-full sm:w-auto"
                    >
                        <option value="">All Categories</option>
                        {categoryOptions.map((cat, i) => (
                            <option key={i} value={cat}>{cat}</option>
                        ))}
                    </select>

                    {/* Project Filter */}
                    <select
                        value={selectedProject}
                        onChange={(e) => setSelectedProject(e.target.value)}
                        className="border border-gray-300 bg-white py-2 px-3 rounded-md text-sm text-gray-700 w-full sm:w-auto"
                    >
                        <option value="">All Projects</option>
                        {projectOptions.map((project, i) => (
                            <option key={i} value={project}>{project}</option>
                        ))}
                    </select>

                </div>


                {/* --- Vendor Table --- */}
                <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-x-auto">
                    {/* Header */}
                    <div className="flex text-sm font-medium text-gray-500 border-b border-gray-200 py-3 px-4 bg-blue-900 min-w-[500px]">
                        <div className="w-[30%] text-white">Vendor</div>
                        <div className="w-[0.5px] bg-gray-200 mx-2 text-white"></div>
                        <div className="w-[70%] text-white">Category</div>
                    </div>

                    {/* Rows */}
                    <div className="divide-y divide-gray-100 min-w-[500px]">
                        {filteredVendors?.map((vendor, index) => (
                            <div
                                key={index}
                                className="flex items-center text-sm py-3 px-4 hover:cursor-pointer flex-wrap sm:flex-nowrap gap-2 sm:gap-0"
                            >
                                {/* Vendor Name */}
                                <div onClick={() => navigate('/VendorPaymentDashboard')} className="w-full sm:w-[30%] flex items-center justify-between text-gray-800">
                                    {vendor.name}
                                    <MdOutlineKeyboardArrowRight className="ml-1 text-gray-500" />
                                </div>

                                {/* Middle Divider Line */}
                                <div className="hidden sm:block w-[0.5px] bg-gray-200 h-5 mx-2"></div>

                                {/* Categories */}
                                <div className="w-full sm:w-[70%] flex flex-wrap items-center pt-1 pb-1 gap-1">
                                    {vendor.categories.map((category, catIndex) => (
                                        <CategoryTag key={catIndex} category={category} />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* --- Pagination Footer --- */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-sm text-gray-600 mt-4 gap-2 sm:gap-0">
                    <div className="flex items-center space-x-2">
                        <span className="text-gray-500">Rows per page:</span>
                        <span className="font-medium">10</span>
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                    </div>
                    <div>1-10 of 1849</div>
                    <div className="flex space-x-2 text-xl">
                        <span className="cursor-pointer text-gray-400 hover:text-gray-600">
                            &lt;
                        </span>
                        <span className="cursor-pointer text-gray-400 hover:text-gray-600">
                            &gt;
                        </span>
                    </div>
                </div>
            </div>
        </div>

    );
};

export default VendorManagementDashboard;
