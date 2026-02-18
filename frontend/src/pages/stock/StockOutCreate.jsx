import React, { useEffect, useState } from "react";
import {
    useGetProjectsQuery,
    useGetProjectStockQuery,
    useOutStockMutation
} from "../../Reduxe/Api";

import {
    FaLayerGroup,
    FaTruckLoading,
    FaBoxOpen,
    FaPlus,
    FaTrash,
    FaCheck,
    FaSearch
} from "react-icons/fa";
import {
    FiArrowLeft,
    FiFilter,
    FiRefreshCw
} from "react-icons/fi";
import {
    IoAlertCircle,
    IoCheckmarkCircle,
    IoCloseCircle
} from "react-icons/io5";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

export default function StockOutPage() {
    const navigate = useNavigate();
    const { projectId: initialProjectId } = useParams();

    const { data: projects = [], isLoading: loadingProjects } = useGetProjectsQuery();
    const [projectId, setProjectId] = useState(initialProjectId || "");
    const [selectedProject, setSelectedProject] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    const { data: stockData, isLoading: loadingStock } =
        useGetProjectStockQuery(projectId, { skip: !projectId });

    const [createIssue, { isLoading: issuing }] = useOutStockMutation();

    // MULTIPLE SELECTED ITEMS
    const [selectedItems, setSelectedItems] = useState([]);

    // Auto select 1st project
    useEffect(() => {
        if (!loadingProjects && projects.length > 0 && !projectId) {
            const firstProject = projects[0];
            setProjectId(firstProject._id);
            setSelectedProject(firstProject);
        }
    }, [loadingProjects, projects]);

    // Update selected project when project changes
    useEffect(() => {
        if (projectId && projects.length > 0) {
            const project = projects.find(p => p._id === projectId);
            setSelectedProject(project);
        }
    }, [projectId, projects]);

    // Filter stock based on search
    const filteredStock = stockData?.stock?.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    // Toggle select / unselect item
    const handleItemSelect = (item) => {
        const exists = selectedItems.find((i) => i.itemId === item.itemId);

        if (exists) {
            // REMOVE
            setSelectedItems(selectedItems.filter((i) => i.itemId !== item.itemId));
            toast.success(`Removed ${item.name} from selection`);
        } else {
            // ADD
            setSelectedItems([
                ...selectedItems,
                {
                    itemId: item.itemId,
                    name: item.name,
                    maxQty: item.qty,
                    qty: "",
                    remarks: "",
                    unit: item.unit,
                    category: item.category
                }
            ]);
            toast.success(`Added ${item.name} to selection`);
        }
    };

    // Update qty or remarks
    const updateField = (itemId, field, value) => {
        setSelectedItems((prev) =>
            prev.map((it) =>
                it.itemId === itemId ? { ...it, [field]: value } : it
            )
        );
    };

    // Remove selected item
    const removeSelectedItem = (itemId, itemName) => {
        setSelectedItems(selectedItems.filter(item => item.itemId !== itemId));
        toast.success(`Removed ${itemName} from selection`);
    };

    // Clear all selections
    const clearAllSelections = () => {
        if (selectedItems.length > 0) {
            setSelectedItems([]);
            toast.success("Cleared all selections");
        }
    };

    // Get stock status
    const getStockStatus = (qty) => {
        if (qty <= 0) return {
            label: "Out of Stock",
            color: "bg-red-100 text-red-700",
            icon: <IoCloseCircle className="text-red-600" />
        };
        if (qty < 10) return {
            label: "Low Stock",
            color: "bg-yellow-100 text-yellow-700",
            icon: <IoAlertCircle className="text-yellow-600" />
        };
        return {
            label: "In Stock",
            color: "bg-green-100 text-green-700",
            icon: <IoCheckmarkCircle className="text-green-600" />
        };
    };

    // Submit multiple items
    const handleSubmit = async () => {
        if (selectedItems.length === 0) {
            toast.error("Please select at least one item!");
            return;
        }

        // Validation
        const invalidItems = [];
        selectedItems.forEach((it) => {
            const qtyNum = Number(it.qty);

            if (!qtyNum || qtyNum <= 0) {
                invalidItems.push(`${it.name}: Invalid quantity`);
            } else if (qtyNum > it.maxQty) {
                invalidItems.push(`${it.name}: Cannot exceed ${it.maxQty} ${it.unit}`);
            }
        });

        if (invalidItems.length > 0) {
            invalidItems.forEach(error => toast.error(error));
            return;
        }

        const payload = {
            projectId,
            items: selectedItems.map((it) => ({
                itemId: it.itemId,
                qty: Number(it.qty),
                remarks: it.remarks
            }))
        };

        try {
            await createIssue(payload).unwrap();
            toast.success("Stock Issued Successfully!");

            // Reset form
            setSelectedItems([]);

            // Navigate after delay
            setTimeout(() => {
                navigate(-1);
            }, 500);
        } catch (err) {
            toast.error(err?.data?.message || "Issue failed");
        }
    };

    // Calculate total selected quantity
    const totalSelectedQty = selectedItems.reduce((sum, item) => {
        return sum + (Number(item.qty) || 0);
    }, 0);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-red-50 p-4 md:p-6">
            <div className="max-w-7xl mx-auto">
                {/* HEADER */}
                <div className="mb-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate(-1)}
                                className="p-2.5 bg-white rounded-lg shadow-sm hover:bg-gray-50 transition-colors border border-gray-200"
                            >
                                <FiArrowLeft className="text-gray-600" />
                            </button>

                            <div className="flex items-center gap-3">
                                <div className="bg-gradient-to-br from-red-600 to-orange-600 text-white p-3 md:p-4 rounded-xl shadow-lg">
                                    <FaTruckLoading className="text-2xl md:text-3xl" />
                                </div>
                                <div>
                                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                                        Issue Stock (Stock Out)
                                    </h1>
                                    <p className="text-gray-600 mt-1">Transfer stock to other locations or projects</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={clearAllSelections}
                                disabled={selectedItems.length === 0}
                                className={`px-4 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-colors ${selectedItems.length > 0
                                    ? 'bg-red-100 hover:bg-red-200 text-red-700'
                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    }`}
                            >
                                <FaTrash /> Clear All
                            </button>
                        </div>
                    </div>

                    {/* PROJECT SELECTION CARD */}
                    {selectedProject && (
                        <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-xl p-5 mb-6">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <h2 className="text-lg font-semibold text-red-800 mb-1">
                                        Issuing From Project
                                    </h2>
                                    <div className="flex items-center gap-3">
                                        <div className="bg-white p-3 rounded-lg shadow-sm">
                                            <FaBoxOpen className="text-red-600" size={20} />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-800">
                                                {selectedProject.projectName}
                                            </h3>
                                            <p className="text-gray-600">
                                                {stockData?.stock?.length || 0} items available
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-lg p-3 shadow-sm">
                                    <select
                                        className="w-full p-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                        value={projectId}
                                        onChange={(e) => {
                                            const newProjectId = e.target.value;
                                            setProjectId(newProjectId);
                                            setSelectedItems([]);
                                            const project = projects.find(p => p._id === newProjectId);
                                            setSelectedProject(project);
                                        }}
                                    >
                                        {loadingProjects ? (
                                            <option>Loading projects...</option>
                                        ) : projects.map((p) => (
                                            <option key={p._id} value={p._id}>
                                                {p.projectName}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* SELECTED ITEMS SUMMARY */}
                    {selectedItems.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <div className="bg-white p-5 rounded-xl border border-red-200 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Selected Items</p>
                                        <p className="text-2xl font-bold text-red-600">{selectedItems.length}</p>
                                    </div>
                                    <div className="p-3 bg-red-50 rounded-lg">
                                        <FaCheck className="text-red-600" size={20} />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-5 rounded-xl border border-yellow-200 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Total Quantity</p>
                                        <p className="text-2xl font-bold text-yellow-600">{totalSelectedQty}</p>
                                    </div>
                                    <div className="p-3 bg-yellow-50 rounded-lg">
                                        <FaLayerGroup className="text-yellow-600" size={20} />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-5 rounded-xl border border-green-200 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Ready to Issue</p>
                                        <p className="text-2xl font-bold text-green-600">
                                            {selectedItems.filter(item => item.qty > 0).length}
                                        </p>
                                    </div>
                                    <div className="p-3 bg-green-50 rounded-lg">
                                        <FaTruckLoading className="text-green-600" size={20} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* MAIN CONTENT */}
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* LEFT COLUMN - AVAILABLE STOCK */}
                    <div className="lg:w-2/3">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 md:p-6">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                                        <FaBoxOpen className="text-red-600" />
                                        Available Stock Items
                                    </h2>
                                    <p className="text-gray-600">Click on items to add to issue list</p>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-3">
                                    {/* Search */}
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="Search items..."
                                            className="w-full sm:w-64 p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                        <FaSearch className="absolute left-3 top-3.5 text-gray-400" />
                                    </div>
                                </div>
                            </div>

                            {loadingStock ? (
                                <div className="text-center py-16">
                                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mb-4"></div>
                                    <p className="text-gray-500">Loading stock data...</p>
                                </div>
                            ) : filteredStock.length === 0 ? (
                                <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-xl">
                                    <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                        <FaBoxOpen size={28} className="text-gray-400" />
                                    </div>
                                    <h3 className="text-gray-500 font-medium mb-2">No stock items found</h3>
                                    <p className="text-gray-400">No items available in this project</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {filteredStock.map((item) => {
                                        const isSelected = selectedItems.find(s => s.itemId === item.itemId);
                                        const status = getStockStatus(item.qty);

                                        return (
                                            <div
                                                key={item.itemId}
                                                className={`border rounded-xl p-4 transition-all cursor-pointer hover:shadow-md ${isSelected
                                                    ? 'bg-red-50 border-red-300 ring-2 ring-red-200'
                                                    : 'bg-white border-gray-200 hover:border-red-200'
                                                    }`}
                                                onClick={() => handleItemSelect(item)}
                                            >
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <h3 className="font-semibold text-gray-800">{item.name}</h3>
                                                            {isSelected && (
                                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">
                                                                    <FaCheck size={10} /> Selected
                                                                </span>
                                                            )}
                                                        </div>
                                                        {item.category && (
                                                            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                                                {item.category}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${status.color}`}>
                                                        {status.icon}
                                                        <span>{status.label}</span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <div className="text-2xl font-bold text-gray-800">{item.qty}</div>
                                                        <div className="text-sm text-gray-500">{item.unit}</div>
                                                    </div>
                                                    <button
                                                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${isSelected
                                                            ? 'bg-red-600 hover:bg-red-700 text-white'
                                                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                                            }`}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleItemSelect(item);
                                                        }}
                                                    >
                                                        {isSelected ? 'Remove' : 'Select'}
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RIGHT COLUMN - SELECTED ITEMS */}
                    <div className="lg:w-1/3">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 md:p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                                    <FaTruckLoading className="text-red-600" />
                                    Items to Issue
                                </h2>
                                <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full font-medium">
                                    {selectedItems.length} items
                                </span>
                            </div>

                            {selectedItems.length === 0 ? (
                                <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-xl">
                                    <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                        <FaBoxOpen size={28} className="text-gray-400" />
                                    </div>
                                    <h3 className="text-gray-500 font-medium mb-2">No items selected</h3>
                                    <p className="text-gray-400 mb-4">Select items from available stock</p>
                                    <p className="text-sm text-gray-500">Click on items in the left panel to add them</p>
                                </div>
                            ) : (
                                <>
                                    <div className="space-y-4 mb-6 max-h-[500px] overflow-y-auto pr-2">
                                        {selectedItems.map((item) => (
                                            <div key={item.itemId} className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                                                <div className="flex items-start justify-between mb-3">
                                                    <div>
                                                        <h3 className="font-semibold text-gray-800">{item.name}</h3>
                                                        <p className="text-sm text-gray-600 mt-1">
                                                            Max: {item.maxQty} {item.unit}
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={() => removeSelectedItem(item.itemId, item.name)}
                                                        className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-colors"
                                                    >
                                                        <FaTrash />
                                                    </button>
                                                </div>

                                                <div className="space-y-3">
                                                    {/* Quantity Input */}
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Quantity to Issue
                                                        </label>
                                                        <div className="relative">
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                max={item.maxQty}
                                                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                                                                placeholder="Enter quantity"
                                                                value={item.qty}
                                                                onChange={(e) => updateField(item.itemId, "qty", e.target.value)}
                                                            />
                                                            <span className="absolute right-3 top-3 text-gray-500">
                                                                {item.unit}
                                                            </span>
                                                        </div>
                                                        {item.qty && (
                                                            <div className={`text-sm mt-1 ${Number(item.qty) > item.maxQty
                                                                ? 'text-red-600'
                                                                : 'text-green-600'
                                                                }`}>
                                                                {Number(item.qty) > item.maxQty
                                                                    ? `Exceeds available stock by ${Number(item.qty) - item.maxQty}`
                                                                    : `${item.maxQty - Number(item.qty)} will remain`
                                                                }
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Remarks Input */}
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Remarks (Optional)
                                                        </label>
                                                        <textarea
                                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                                                            placeholder="Add remarks..."
                                                            value={item.remarks}
                                                            onChange={(e) => updateField(item.itemId, "remarks", e.target.value)}
                                                            rows="2"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* SUBMIT BUTTON */}
                                    <button
                                        onClick={handleSubmit}
                                        disabled={issuing || selectedItems.length === 0}
                                        className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow disabled:opacity-70"
                                    >
                                        {issuing ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                <FaTruckLoading />
                                                Issue Stock ({selectedItems.length} items)
                                            </>
                                        )}
                                    </button>

                                    {/* SUMMARY */}
                                    <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                        <div className="text-sm text-gray-600 mb-2">Issue Summary</div>
                                        <div className="flex justify-between text-gray-700">
                                            <span>Total Items:</span>
                                            <span className="font-semibold">{selectedItems.length}</span>
                                        </div>
                                        <div className="flex justify-between text-gray-700 mt-1">
                                            <span>Total Quantity:</span>
                                            <span className="font-semibold">{totalSelectedQty}</span>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}