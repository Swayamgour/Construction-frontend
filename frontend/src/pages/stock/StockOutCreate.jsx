import React, { useEffect, useState } from "react";
import { useGetProjectsQuery, useGetProjectStockQuery, useOutStockMutation } from "../../Reduxe/Api";
import {
  Layers,
  Truck,
  PackageOpen,
  Trash2,
  Check,
  Search,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

export default function StockOutCreate() {
  const navigate = useNavigate();
  const { projectId: initialProjectId } = useParams();

  const { data: projects = [], isLoading: loadingProjects } = useGetProjectsQuery();
  const [projectId, setProjectId] = useState(initialProjectId || "");
  const [selectedProject, setSelectedProject] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: stockData, isLoading: loadingStock } = useGetProjectStockQuery(projectId, { skip: !projectId });

  const [createIssue, { isLoading: issuing }] = useOutStockMutation();

  const [selectedItems, setSelectedItems] = useState([]);

  useEffect(() => {
    if (!loadingProjects && projects.length > 0 && !projectId) {
      const firstProject = projects[0];
      setProjectId(firstProject._id);
      setSelectedProject(firstProject);
    }
  }, [loadingProjects, projects]);

  useEffect(() => {
    if (projectId && projects.length > 0) {
      const project = projects.find((p) => p._id === projectId);
      setSelectedProject(project);
    }
  }, [projectId, projects]);

  const filteredStock =
    stockData?.stock?.filter(
      (item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  const handleItemSelect = (item) => {
    const exists = selectedItems.find((i) => i.itemId === item.itemId);

    if (exists) {
      setSelectedItems(selectedItems.filter((i) => i.itemId !== item.itemId));
      toast.success(`Removed ${item.name} from selection`);
    } else {
      setSelectedItems([
        ...selectedItems,
        { itemId: item.itemId, name: item.name, maxQty: item.qty, qty: "", remarks: "", unit: item.unit, category: item.category },
      ]);
      toast.success(`Added ${item.name} to selection`);
    }
  };

  const updateField = (itemId, field, value) => {
    setSelectedItems((prev) => prev.map((it) => (it.itemId === itemId ? { ...it, [field]: value } : it)));
  };

  const removeSelectedItem = (itemId, itemName) => {
    setSelectedItems(selectedItems.filter((item) => item.itemId !== itemId));
    toast.success(`Removed ${itemName} from selection`);
  };

  const clearAllSelections = () => {
    if (selectedItems.length > 0) {
      setSelectedItems([]);
      toast.success("Cleared all selections");
    }
  };

  const getStockStatus = (qty) => {
    if (qty <= 0) return { label: "Out of Stock", color: "bg-red-50 text-red-700", icon: <XCircle size={12} className="text-red-600" /> };
    if (qty < 10) return { label: "Low Stock", color: "bg-amber-50 text-amber-700", icon: <AlertCircle size={12} className="text-amber-600" /> };
    return { label: "In Stock", color: "bg-emerald-50 text-emerald-700", icon: <CheckCircle2 size={12} className="text-emerald-600" /> };
  };

  const handleSubmit = async () => {
    if (selectedItems.length === 0) {
      toast.error("Please select at least one item!");
      return;
    }

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
      invalidItems.forEach((error) => toast.error(error));
      return;
    }

    const payload = {
      projectId,
      items: selectedItems.map((it) => ({ itemId: it.itemId, qty: Number(it.qty), remarks: it.remarks })),
    };

    try {
      await createIssue(payload).unwrap();
      toast.success("Stock Issued Successfully!");
      setSelectedItems([]);
      setTimeout(() => navigate(-1), 500);
    } catch (err) {
      toast.error(err?.data?.message || "Issue failed");
    }
  };

  const totalSelectedQty = selectedItems.reduce((sum, item) => sum + (Number(item.qty) || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-red-50/50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2.5 bg-white rounded-xl shadow-sm hover:bg-gray-50 transition-colors border border-gray-200"
              >
                <ArrowLeft className="text-gray-600" size={18} />
              </button>

              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-red-600 to-orange-600 text-white p-3.5 rounded-2xl shadow-lg shadow-red-900/25">
                  <Truck size={24} />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Issue Stock (Stock Out)</h1>
                  <p className="text-gray-500 mt-1">Transfer stock to other locations or projects</p>
                </div>
              </div>
            </div>

            <button
              onClick={clearAllSelections}
              disabled={selectedItems.length === 0}
              className={`px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-colors w-fit ${
                selectedItems.length > 0 ? "bg-red-50 hover:bg-red-100 text-red-700" : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            >
              <Trash2 size={15} /> Clear All
            </button>
          </div>

          {/* PROJECT SELECTION CARD */}
          {selectedProject && (
            <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-100 rounded-2xl p-5 mb-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-sm font-semibold text-red-700 mb-1.5 uppercase tracking-wide">Issuing From Project</h2>
                  <div className="flex items-center gap-3">
                    <div className="bg-white p-2.5 rounded-xl shadow-sm">
                      <PackageOpen className="text-red-600" size={20} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">{selectedProject.projectName}</h3>
                      <p className="text-gray-500 text-sm">{stockData?.stock?.length || 0} items available</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-3.5 shadow-sm">
                  <select
                    className="w-full p-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                    value={projectId}
                    onChange={(e) => {
                      const newProjectId = e.target.value;
                      setProjectId(newProjectId);
                      setSelectedItems([]);
                      const project = projects.find((p) => p._id === newProjectId);
                      setSelectedProject(project);
                    }}
                  >
                    {loadingProjects ? (
                      <option>Loading projects...</option>
                    ) : (
                      projects?.data?.map((p) => (
                        <option key={p._id} value={p._id}>
                          {p.projectName}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* SELECTED ITEMS SUMMARY */}
          {selectedItems.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm shadow-gray-200/60">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Selected Items</p>
                    <p className="text-2xl font-bold text-red-600">{selectedItems.length}</p>
                  </div>
                  <div className="p-3 bg-red-50 rounded-xl">
                    <Check className="text-red-600" size={20} />
                  </div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm shadow-gray-200/60">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Total Quantity</p>
                    <p className="text-2xl font-bold text-amber-600">{totalSelectedQty}</p>
                  </div>
                  <div className="p-3 bg-amber-50 rounded-xl">
                    <Layers className="text-amber-600" size={20} />
                  </div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm shadow-gray-200/60">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Ready to Issue</p>
                    <p className="text-2xl font-bold text-emerald-600">{selectedItems.filter((item) => item.qty > 0).length}</p>
                  </div>
                  <div className="p-3 bg-emerald-50 rounded-xl">
                    <Truck className="text-emerald-600" size={20} />
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
            <div className="bg-white rounded-2xl shadow-sm shadow-gray-200/60 border border-gray-100 p-5 md:p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <PackageOpen className="text-red-600" size={18} />
                    Available Stock Items
                  </h2>
                  <p className="text-gray-500 text-sm">Click on items to add to issue list</p>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search items..."
                    className="w-full sm:w-64 p-2.5 pl-10 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                </div>
              </div>

              {loadingStock ? (
                <div className="text-center py-16">
                  <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-red-500 border-t-transparent mb-4"></div>
                  <p className="text-gray-500">Loading stock data...</p>
                </div>
              ) : filteredStock.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-2xl">
                  <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <PackageOpen size={26} className="text-gray-400" />
                  </div>
                  <h3 className="text-gray-500 font-medium mb-1">No stock items found</h3>
                  <p className="text-gray-400 text-sm">No items available in this project</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredStock.map((item) => {
                    const isSelected = selectedItems.find((s) => s.itemId === item.itemId);
                    const status = getStockStatus(item.qty);

                    return (
                      <div
                        key={item.itemId}
                        className={`border rounded-2xl p-4 transition-all cursor-pointer hover:shadow-md ${
                          isSelected ? "bg-red-50 border-red-200 ring-2 ring-red-100" : "bg-white border-gray-100 hover:border-red-200"
                        }`}
                        onClick={() => handleItemSelect(item)}
                      >
                        <div className="flex items-start justify-between mb-3 gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                              <h3 className="font-semibold text-gray-800">{item.name}</h3>
                              {isSelected && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">
                                  <Check size={10} /> Selected
                                </span>
                              )}
                            </div>
                            {item.category && (
                              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-md">{item.category}</span>
                            )}
                          </div>
                          <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs shrink-0 ${status.color}`}>
                            {status.icon}
                            <span>{status.label}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-2xl font-bold text-gray-800">{item.qty}</div>
                            <div className="text-sm text-gray-400">{item.unit}</div>
                          </div>
                          <button
                            className={`px-4 py-2 rounded-xl font-medium transition-colors text-sm ${
                              isSelected ? "bg-red-600 hover:bg-red-700 text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                            }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleItemSelect(item);
                            }}
                          >
                            {isSelected ? "Remove" : "Select"}
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
            <div className="bg-white rounded-2xl shadow-sm shadow-gray-200/60 border border-gray-100 p-5 md:p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <Truck className="text-red-600" size={18} />
                  Items to Issue
                </h2>
                <span className="bg-red-50 text-red-700 px-3 py-1 rounded-full font-medium text-xs">{selectedItems.length} items</span>
              </div>

              {selectedItems.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-2xl">
                  <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <PackageOpen size={26} className="text-gray-400" />
                  </div>
                  <h3 className="text-gray-500 font-medium mb-1">No items selected</h3>
                  <p className="text-gray-400 text-sm">Click on items in the left panel to add them</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4 mb-6 max-h-[500px] overflow-y-auto pr-2">
                    {selectedItems.map((item) => (
                      <div key={item.itemId} className="border border-gray-100 rounded-2xl p-4 bg-gray-50/70">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-gray-800">{item.name}</h3>
                            <p className="text-sm text-gray-500 mt-0.5">
                              Max: {item.maxQty} {item.unit}
                            </p>
                          </div>
                          <button
                            onClick={() => removeSelectedItem(item.itemId, item.name)}
                            className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1.5">Quantity to Issue</label>
                            <div className="relative">
                              <input
                                type="number"
                                min="0"
                                max={item.maxQty}
                                className="w-full p-2.5 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                                placeholder="Enter quantity"
                                value={item.qty}
                                onChange={(e) => updateField(item.itemId, "qty", e.target.value)}
                              />
                              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">{item.unit}</span>
                            </div>
                            {item.qty && (
                              <div className={`text-xs mt-1.5 ${Number(item.qty) > item.maxQty ? "text-red-600" : "text-emerald-600"}`}>
                                {Number(item.qty) > item.maxQty
                                  ? `Exceeds available stock by ${Number(item.qty) - item.maxQty}`
                                  : `${item.maxQty - Number(item.qty)} will remain`}
                              </div>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1.5">Remarks (Optional)</label>
                            <textarea
                              className="w-full p-2.5 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
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

                  <button
                    onClick={handleSubmit}
                    disabled={issuing || selectedItems.length === 0}
                    className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-red-900/20 disabled:opacity-70"
                  >
                    {issuing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <Truck size={16} />
                        Issue Stock ({selectedItems.length} items)
                      </>
                    )}
                  </button>

                  <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="text-xs text-gray-500 mb-2 font-medium">Issue Summary</div>
                    <div className="flex justify-between text-gray-700 text-sm">
                      <span>Total Items:</span>
                      <span className="font-semibold">{selectedItems.length}</span>
                    </div>
                    <div className="flex justify-between text-gray-700 mt-1 text-sm">
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
