import React, { useEffect, useState } from "react";
import {
    useGetProjectsQuery,
    useGetProjectStockQuery,
    useAddConsumptionMutation
} from "../../Reduxe/Api";

import { FiArrowLeft, FiTrash, FiSave, FiPackage, FiCheck, FiAlertCircle } from "react-icons/fi";
import { AiOutlinePlus, AiOutlineSearch } from "react-icons/ai";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

export default function StockConsumption() {
    const navigate = useNavigate();
    const { projectId: initialProjectId } = useParams();

    // Load project list
    const { data: projects = [], isLoading: loadingProjects } =
        useGetProjectsQuery();

    // Selected project
    const [projectId, setProjectId] = useState(initialProjectId || "");

    // Fetch project stock
    const {
        data: stockData,
        isLoading: loadingStock,
        refetch: refetchStock
    } = useGetProjectStockQuery(projectId, { skip: !projectId });

    // Add consumption mutation
    const [addConsumption, { isLoading: saving }] = useAddConsumptionMutation();

    // -----------------------
    // MULTIPLE ITEM LIST
    // -----------------------
    const [items, setItems] = useState([]);
    const [showStockList, setShowStockList] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // Auto-select project
    useEffect(() => {
        if (!loadingProjects && projects.length > 0 && !projectId) {
            setProjectId(projects[0]._id);
        }
    }, [loadingProjects, projects]);

    // Refetch stock when project changes
    useEffect(() => {
        if (projectId) {
            refetchStock();
            setShowStockList(true); // Show stock list when project changes
        }
    }, [projectId]);

    // Filter stock based on search
    const filteredStock = stockData?.stock?.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    // -----------------------
    // Add item from stock
    // -----------------------
    const addItemFromStock = (stockItem) => {
        // Check if item already exists in consumption list
        const exists = items.find(item => item.itemId === stockItem.itemId);
        if (exists) {
            toast.error(`${stockItem.name} is already added`);
            return;
        }

        setItems((prev) => [
            ...prev,
            {
                itemId: stockItem.itemId,
                qtyUsed: "",
                remarks: "",
                stockItem: stockItem // Store stock data for reference
            }
        ]);

        // Switch to consumption view
        setShowStockList(false);
        toast.success(`${stockItem.name} added to consumption list`);
    };

    // -----------------------
    // Add new row manually
    // -----------------------
    const addRow = () => {
        setItems((prev) => [
            ...prev,
            { itemId: "", qtyUsed: "", remarks: "", stockItem: null }
        ]);
        setShowStockList(false);
    };

    // -----------------------
    // Remove row
    // -----------------------
    const removeRow = (index) => {
        setItems((prev) => prev.filter((_, i) => i !== index));
    };

    // -----------------------
    // Submit consumption
    // -----------------------
    const handleSubmit = async () => {
        if (items.length === 0) {
            toast.error("Please add at least one item");
            return;
        }

        // Validate all items
        for (const it of items) {
            if (!it.itemId) {
                toast.error("Please select an item for all entries");
                return;
            }

            if (!it.qtyUsed || it.qtyUsed <= 0) {
                toast.error("Quantity must be greater than 0 for all items");
                return;
            }

            // Validate available qty
            const stockItem = stockData?.stock?.find(
                (s) => s.itemId === it.itemId
            );

            if (!stockItem) {
                toast.error(`${it.stockItem?.name || 'Selected item'} not found in stock`);
                return;
            }

            if (Number(it.qtyUsed) > stockItem.qty) {
                return toast.error(
                    `${stockItem.name} available qty is only ${stockItem.qty}`
                );
            }
        }

        try {
            // Prepare data for API
            const consumptionData = items.map(item => ({
                itemId: item.itemId,
                qtyUsed: Number(item.qtyUsed),
                remarks: item.remarks
            }));

            await addConsumption({
                projectId,
                items: consumptionData
            }).unwrap();

            toast.success("Consumption saved successfully!");

            // Reset form
            setItems([]);
            setShowStockList(true);

            // Navigate to report
            setTimeout(() => {
                navigate(-1);
            }, 1500);

        } catch (err) {
            toast.error(err?.data?.message || "Something went wrong");
        }
    };

    // Get stock status color
    const getStockStatusColor = (qty) => {
        if (qty <= 0) return "bg-red-100 text-red-700 border-red-200";
        if (qty < 10) return "bg-yellow-100 text-yellow-700 border-yellow-200";
        return "bg-green-100 text-green-700 border-green-200";
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-6">
            <div className="max-w-7xl mx-auto">
                {/* HEADER */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                        <button
                            className="p-2 bg-white rounded-lg shadow-sm hover:bg-gray-50 transition-colors border border-gray-200"
                            onClick={() => navigate(-1)}
                        >
                            <FiArrowLeft size={22} className="text-gray-600" />
                        </button>

                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <FiPackage className="text-blue-600" size={24} />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                                    Material Consumption
                                </h1>
                                <p className="text-gray-600">Check stock first, then record material usage</p>
                            </div>
                        </div>
                    </div>

                    {/* PROJECT SELECTION CARD */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-6">
                        <div className="mb-3 flex items-center gap-2">
                            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                            <label className="text-gray-700 font-semibold text-lg">Select Project</label>
                        </div>
                        <select
                            className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                            value={projectId}
                            onChange={(e) => {
                                setProjectId(e.target.value);
                                setItems([]);
                                setShowStockList(true);
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

                {/* VIEW TOGGLE */}
                <div className="flex gap-2 mb-6">
                    <button
                        onClick={() => setShowStockList(true)}
                        className={`px-5 py-3 rounded-lg font-medium transition-all ${showStockList
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                            }`}
                    >
                        View Stock ({stockData?.stock?.length || 0})
                    </button>
                    <button
                        onClick={() => setShowStockList(false)}
                        className={`px-5 py-3 rounded-lg font-medium transition-all ${!showStockList
                            ? 'bg-green-600 text-white shadow-sm'
                            : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                            }`}
                    >
                        Consumption List ({items.length})
                    </button>
                </div>

                {/* STOCK LIST VIEW */}
                {showStockList && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 md:p-6 mb-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                            <div>
                                <h2 className="text-xl font-semibold text-gray-800">Available Stock</h2>
                                <p className="text-gray-600">Select items from available stock to add to consumption</p>
                            </div>

                            {/* SEARCH */}
                            <div className="relative w-full md:w-64">
                                <input
                                    type="text"
                                    placeholder="Search items..."
                                    className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <AiOutlineSearch className="absolute left-3 top-3.5 text-gray-400" size={20} />
                            </div>
                        </div>

                        {loadingStock ? (
                            <div className="text-center py-12">
                                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                                <p className="text-gray-500">Loading stock data...</p>
                            </div>
                        ) : filteredStock.length === 0 ? (
                            <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-xl">
                                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                    <FiAlertCircle size={28} className="text-gray-400" />
                                </div>
                                <h3 className="text-gray-500 font-medium mb-2">No stock items found</h3>
                                <p className="text-gray-400">No items available for this project</p>
                            </div>
                        ) : (
                            <>
                                {/* STOCK SUMMARY */}
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                        <p className="text-sm text-gray-600">Total Items</p>
                                        <p className="text-2xl font-bold text-blue-600">{stockData?.stock?.length || 0}</p>
                                    </div>
                                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                                        <p className="text-sm text-gray-600">In Stock</p>
                                        <p className="text-2xl font-bold text-green-600">
                                            {stockData?.stock?.filter(item => item.qty > 0).length || 0}
                                        </p>
                                    </div>
                                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                                        <p className="text-sm text-gray-600">Low Stock</p>
                                        <p className="text-2xl font-bold text-yellow-600">
                                            {stockData?.stock?.filter(item => item.qty > 0 && item.qty < 10).length || 0}
                                        </p>
                                    </div>
                                    <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                                        <p className="text-sm text-gray-600">Out of Stock</p>
                                        <p className="text-2xl font-bold text-red-600">
                                            {stockData?.stock?.filter(item => item.qty <= 0).length || 0}
                                        </p>
                                    </div>
                                </div>

                                {/* STOCK ITEMS GRID */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {filteredStock.map((stockItem) => (
                                        <div
                                            key={stockItem.itemId}
                                            className={`border rounded-xl p-4 transition-all hover:shadow-md ${getStockStatusColor(stockItem.qty)}`}
                                        >
                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    <h3 className="font-semibold text-lg">{stockItem.name}</h3>
                                                    {stockItem.category && (
                                                        <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                                            {stockItem.category}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-xl font-bold">{stockItem.qty}</div>
                                                    <div className="text-sm text-gray-500">units</div>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <div>
                                                    {stockItem.qty <= 0 ? (
                                                        <span className="inline-flex items-center text-red-600">
                                                            <FiAlertCircle className="mr-1" /> Out of Stock
                                                        </span>
                                                    ) : stockItem.qty < 10 ? (
                                                        <span className="inline-flex items-center text-yellow-600">
                                                            <FiAlertCircle className="mr-1" /> Low Stock
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center text-green-600">
                                                            <FiCheck className="mr-1" /> In Stock
                                                        </span>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={() => addItemFromStock(stockItem)}
                                                    disabled={stockItem.qty <= 0}
                                                    className={`px-4 py-2 rounded-lg font-medium transition-all ${stockItem.qty > 0
                                                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                        }`}
                                                >
                                                    {stockItem.qty > 0 ? 'Add to Consumption' : 'Out of Stock'}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* CONSUMPTION LIST VIEW */}
                {!showStockList && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 md:p-6">
                        {/* HEADER WITH BACK BUTTON */}
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-xl font-semibold text-gray-800">Consumption Items</h2>
                                <p className="text-gray-600">Add quantity used for each item</p>
                            </div>
                            <button
                                onClick={() => setShowStockList(true)}
                                className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg flex items-center gap-2 transition-colors"
                            >
                                <FiArrowLeft /> Back to Stock
                            </button>
                        </div>

                        {/* ADD ITEM BUTTON */}
                        <button
                            onClick={addRow}
                            className="w-full mb-6 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center gap-2 transition-colors shadow-sm"
                        >
                            <AiOutlinePlus /> Add Another Item
                        </button>

                        {/* ITEMS LIST */}
                        {items.length === 0 ? (
                            <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-xl">
                                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                    <FiPackage size={28} className="text-gray-400" />
                                </div>
                                <h3 className="text-gray-500 font-medium mb-2">No consumption items</h3>
                                <p className="text-gray-400 mb-4">Add items from stock to start</p>
                                <button
                                    onClick={() => setShowStockList(true)}
                                    className="px-6 py-2.5 bg-blue-600 text-white rounded-lg"
                                >
                                    View Stock Items
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="space-y-4 mb-6">
                                    {items.map((row, idx) => {
                                        const stockItem = stockData?.stock?.find(
                                            (st) => st.itemId === row.itemId
                                        ) || row.stockItem;

                                        return (
                                            <div key={idx} className="bg-gray-50 border border-gray-200 rounded-xl p-5">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                                            <span className="font-semibold text-blue-600">{idx + 1}</span>
                                                        </div>
                                                        <div>
                                                            <h3 className="font-medium text-gray-800">
                                                                {stockItem?.name || 'Select Item'}
                                                            </h3>
                                                            {stockItem && (
                                                                <div className="flex items-center gap-2 mt-1">
                                                                    <span className={`px-2 py-0.5 rounded text-xs ${getStockStatusColor(stockItem.qty)}`}>
                                                                        {stockItem.qty} units available
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => removeRow(idx)}
                                                        className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                                                    >
                                                        <FiTrash />
                                                    </button>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    {/* ITEM SELECT */}
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Item
                                                        </label>
                                                        <select
                                                            className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                                            value={row.itemId}
                                                            onChange={(e) => {
                                                                const selectedStock = stockData?.stock?.find(
                                                                    s => s.itemId === e.target.value
                                                                );
                                                                setItems((prev) =>
                                                                    prev.map((r, i) =>
                                                                        i === idx ? {
                                                                            ...r,
                                                                            itemId: e.target.value,
                                                                            stockItem: selectedStock
                                                                        } : r
                                                                    )
                                                                );
                                                            }}
                                                        >
                                                            <option value="">Select Item</option>
                                                            {stockData?.stock?.map((s) => (
                                                                <option key={s.itemId} value={s.itemId}>
                                                                    {s.name} ({s.qty} available)
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>

                                                    {/* QUANTITY USED */}
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Quantity Used
                                                        </label>
                                                        <div className="relative">
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                max={stockItem?.qty || 0}
                                                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                                                value={row.qtyUsed}
                                                                onChange={(e) =>
                                                                    setItems((prev) =>
                                                                        prev.map((r, i) =>
                                                                            i === idx ? { ...r, qtyUsed: e.target.value } : r
                                                                        )
                                                                    )
                                                                }
                                                                placeholder="Enter quantity"
                                                            />
                                                            {stockItem && row.qtyUsed && (
                                                                <div className={`text-sm mt-1 ${Number(row.qtyUsed) > stockItem.qty ? 'text-red-600' : 'text-green-600'}`}>
                                                                    {Number(row.qtyUsed) > stockItem.qty
                                                                        ? `Exceeds available stock by ${Number(row.qtyUsed) - stockItem.qty} units`
                                                                        : `${stockItem.qty - Number(row.qtyUsed)} units will remain`
                                                                    }
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* REMARKS */}
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Remarks (Optional)
                                                        </label>
                                                        <input
                                                            type="text"
                                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                                            value={row.remarks}
                                                            onChange={(e) =>
                                                                setItems((prev) =>
                                                                    prev.map((r, i) =>
                                                                        i === idx ? { ...r, remarks: e.target.value } : r
                                                                    )
                                                                )
                                                            }
                                                            placeholder="Add notes"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* SAVE BUTTON */}
                                <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
                                    <button
                                        onClick={handleSubmit}
                                        disabled={saving}
                                        className="flex-1 px-6 py-3.5 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg font-semibold flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow disabled:opacity-70"
                                    >
                                        {saving ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <FiSave /> Submit Consumption ({items.length} items)
                                            </>
                                        )}
                                    </button>
                                    <button
                                        onClick={() => setItems([])}
                                        className="px-6 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                                    >
                                        Clear All
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}