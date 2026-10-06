import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { CheckRole } from "../../helper/CheckRole";
import { getPermissions } from "../../helper/permissions";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  PackagePlus,
  X,
  Ban,
  ArrowRightLeft,
  ShoppingCart,
  ClipboardList,
  Loader2,
  Clock,
  CheckCircle2,
  AlertCircle,
  Truck,
  Plus,
  Trash2,
  Search,
  Building2,
  ShieldCheck,
  Eye,
  Boxes,
  HelpCircle,
} from "lucide-react";
import ReportTable from "../../components/ReportTable";
import {
  useGetStockRequestsQuery,
  useCreateStockRequestMutation,
  useApproveStockRequestMutation,
  useRejectStockRequestMutation,
  useCreateStockTransferMutation,
  useGetProjectsQuery,
  useGetAllItemsQuery,
} from "../../Reduxe/Api";

const STATUS_CONFIG = {
  PENDING_APPROVAL: { label: "Pending Approval", cls: "bg-amber-50 text-amber-700 border-amber-200" },
  PENDING_ADMIN_REVIEW: { label: "Pending Approval", cls: "bg-amber-50 text-amber-700 border-amber-200" },
  APPROVED: { label: "Approved (Stock Checked)", cls: "bg-blue-50 text-blue-700 border-blue-200" },
  APPROVED_TRANSFER: { label: "Transfer Initiated", cls: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  APPROVED_PROCUREMENT: { label: "PO Ordered", cls: "bg-purple-50 text-purple-700 border-purple-200" },
  PARTIALLY_FULFILLED: { label: "Partially Fulfilled", cls: "bg-orange-50 text-orange-700 border-orange-200" },
  FULFILLED: { label: "Fulfilled", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  REJECTED: { label: "Rejected", cls: "bg-red-50 text-red-700 border-red-200" },
  CANCELLED: { label: "Cancelled", cls: "bg-gray-100 text-gray-600 border-gray-200" },
};

const PRIORITY_BADGES = {
  Urgent: "bg-red-50 text-red-700 border-red-200",
  High: "bg-orange-50 text-orange-700 border-orange-200",
  Medium: "bg-amber-50 text-amber-700 border-amber-200",
  Low: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

const inputCls =
  "w-full rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all px-3 py-2 text-sm";

const StockRequests = () => {
  const navigate = useNavigate();
  const { role: userRole } = CheckRole();
  const permissions = getPermissions(userRole);
  const currentRole = permissions.role;
  const isAdmin = permissions.isAdmin;

  const [showCreate, setShowCreate] = useState(false);
  const [reviewModal, setReviewModal] = useState(null); // request doc
  const [transferModal, setTransferModal] = useState(null); // { request, item }
  const [rejectPrompt, setRejectPrompt] = useState(null); // requestId
  const [rejectionRemarks, setRejectionRemarks] = useState("");

  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [projectFilter, setProjectFilter] = useState("all");

  const { data, isLoading, refetch } = useGetStockRequestsQuery({});
  const { data: projectResp } = useGetProjectsQuery();
  const { data: itemResp } = useGetAllItemsQuery();

  const [createStockRequest, { isLoading: creating }] = useCreateStockRequestMutation();
  const [approveStockRequest, { isLoading: approving }] = useApproveStockRequestMutation();
  const [rejectStockRequest, { isLoading: rejecting }] = useRejectStockRequestMutation();
  const [createStockTransfer, { isLoading: transferring }] = useCreateStockTransferMutation();

  const requests = data?.data || [];
  const projects = projectResp?.data || projectResp || [];
  const items = itemResp?.items || itemResp?.data || itemResp || [];

  // Multi-item Request Form State
  const [projectId, setProjectId] = useState("");
  const [requiredDate, setRequiredDate] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [purpose, setPurpose] = useState("");
  const [description, setDescription] = useState("");
  const [requestItems, setRequestItems] = useState([
    { itemId: "", materialName: "", requestedQty: "", unit: "", purpose: "" },
  ]);
  const [imageFiles, setImageFiles] = useState([]);

  // Multi-item management
  const handleAddItemRow = () => {
    setRequestItems((prev) => [
      ...prev,
      { itemId: "", materialName: "", requestedQty: "", unit: "", purpose: "" },
    ]);
  };

  const handleRemoveItemRow = (index) => {
    if (requestItems.length === 1) return;
    setRequestItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleItemChange = (index, field, value) => {
    setRequestItems((prev) => {
      const updated = [...prev];
      if (field === "itemId") {
        const selected = items.find((it) => String(it._id) === String(value));
        updated[index] = {
          ...updated[index],
          itemId: value,
          materialName: selected?.name || "",
          unit: selected?.unit || updated[index].unit,
        };
      } else {
        updated[index] = { ...updated[index], [field]: value };
      }
      return updated;
    });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!projectId || !requiredDate) {
      return toast.error("Please fill in project and required date");
    }

    const validItems = requestItems.filter((i) => i.itemId && Number(i.requestedQty) > 0);
    if (!validItems.length) {
      return toast.error("Please add at least one material with valid quantity");
    }

    try {
      const fd = new FormData();
      fd.append("projectId", projectId);
      fd.append("requiredDate", requiredDate);
      fd.append("priority", priority);
      fd.append("purpose", purpose);
      fd.append("description", description);
      fd.append("items", JSON.stringify(validItems));
      imageFiles.forEach((f) => fd.append("images", f));

      await createStockRequest(fd).unwrap();
      toast.success("Material request submitted for Admin approval");
      setShowCreate(false);
      setProjectId("");
      setRequiredDate("");
      setPurpose("");
      setDescription("");
      setRequestItems([{ itemId: "", materialName: "", requestedQty: "", unit: "", purpose: "" }]);
      setImageFiles([]);
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || "Error submitting material request");
    }
  };

  // Admin Approval (triggers automatic stock check on backend)
  const handleApprove = async (requestId) => {
    try {
      const res = await approveStockRequest({ id: requestId, adminRemarks: "Approved by Admin" }).unwrap();
      toast.success("Request Approved! Stock check calculated.");
      if (res?.data?.request) {
        setReviewModal(res.data.request);
      }
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || "Error approving request");
    }
  };

  // Admin Reject
  const handleRejectConfirm = async () => {
    if (!rejectionRemarks.trim()) {
      return toast.error("Rejection remarks are mandatory");
    }
    try {
      await rejectStockRequest({
        id: rejectPrompt,
        rejectionReason: rejectionRemarks,
        adminRemarks: rejectionRemarks,
      }).unwrap();
      toast.success("Request rejected");
      setRejectPrompt(null);
      setRejectionRemarks("");
      setReviewModal(null);
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || "Error rejecting request");
    }
  };

  // Transfer submission
  const handleTransferSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    try {
      await createStockTransfer({
        stockRequestId: transferModal.request._id,
        sourceProjectId: fd.get("sourceProjectId"),
        destinationProjectId: transferModal.request.projectId?._id || transferModal.request.projectId,
        materialId: transferModal.item.itemId?._id || transferModal.item.itemId,
        quantity: Number(fd.get("quantity")),
        remarks: fd.get("remarks") || "Transferred against Material Request",
      }).unwrap();
      toast.success("Stock transfer initiated from godown to project");
      setTransferModal(null);
      setReviewModal(null);
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || "Error creating transfer");
    }
  };

  // Filtered requests
  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      const matchesSearch =
        r.requestNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.projectId?.projectName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.items || []).some((i) => i.materialName?.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus = statusFilter === "all" || r.status === statusFilter;
      const matchesProject =
        projectFilter === "all" || String(r.projectId?._id || r.projectId) === String(projectFilter);

      return matchesSearch && matchesStatus && matchesProject;
    });
  }, [requests, searchTerm, statusFilter, projectFilter]);

  const totalCount = requests.length;
  const pendingCount = requests.filter(
    (r) => r.status === "PENDING_APPROVAL" || r.status === "PENDING_ADMIN_REVIEW"
  ).length;
  const approvedCount = requests.filter((r) => r.status === "APPROVED").length;
  const fulfilledCount = requests.filter((r) => r.status === "FULFILLED").length;

  const columns = [
    { header: "Request #", accessor: "requestNumber" },
    { header: "Project", render: (row) => row.projectId?.projectName || "-" },
    {
      header: "Items Requested",
      render: (row) => {
        const rowItems = row.items?.length
          ? row.items
          : [{ materialName: row.materialName, requestedQty: row.quantity, unit: row.unit }];
        return (
          <div className="space-y-1">
            {rowItems.slice(0, 2).map((it, idx) => (
              <div key={idx} className="text-xs">
                <span className="font-semibold text-gray-800">{it.materialName || "Material"}</span>
                <span className="text-gray-500 ml-1.5 font-medium">
                  {it.requestedQty} {it.unit}
                </span>
                {it.shortageQty > 0 && row.status === "APPROVED" && (
                  <span className="ml-1 text-[11px] font-semibold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">
                    Shortage: {it.shortageQty}
                  </span>
                )}
              </div>
            ))}
            {rowItems.length > 2 && (
              <span className="text-[11px] text-indigo-600 font-semibold">
                +{rowItems.length - 2} more items
              </span>
            )}
          </div>
        );
      },
    },
    {
      header: "Requested By",
      render: (row) => (
        <div>
          <div className="text-gray-800 font-medium text-xs">{row.requestedBy?.name || "-"}</div>
          <div className="text-[11px] text-gray-400 capitalize">{row.requestedByRole || "Staff"}</div>
        </div>
      ),
    },
    {
      header: "Priority",
      render: (row) => (
        <span
          className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${
            PRIORITY_BADGES[row.priority] || "bg-gray-50 text-gray-600 border-gray-200"
          }`}
        >
          {row.priority || "Medium"}
        </span>
      ),
    },
    {
      header: "Status",
      render: (row) => {
        const conf = STATUS_CONFIG[row.status] || {
          label: row.status?.replaceAll("_", " ") || "-",
          cls: "bg-gray-100 text-gray-600 border-gray-200",
        };
        return (
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${conf.cls}`}>
            {conf.label}
          </span>
        );
      },
    },
    {
      header: "Action",
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setReviewModal(row)}
            className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
          >
            <Eye size={13} /> {isAdmin ? "Review & Stock Check" : "View Details"}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 min-h-screen pb-20">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg ${
              isAdmin
                ? "bg-gradient-to-br from-purple-600 to-indigo-700 shadow-purple-900/25"
                : "bg-gradient-to-br from-indigo-600 to-blue-600 shadow-indigo-900/25"
            }`}
          >
            {isAdmin ? <ShieldCheck size={22} /> : <ClipboardList size={22} />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                {isAdmin ? "Material Requests & Stock Check" : "Material Requests"}
              </h1>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                  isAdmin
                    ? "bg-purple-50 text-purple-700 border-purple-200"
                    : "bg-blue-50 text-blue-700 border-blue-200"
                }`}
              >
                {isAdmin ? "Admin Approval & Routing" : "Site Operations"}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              One canonical flow: Manager submits multiple items &rarr; Admin approves with automatic stock check &rarr; Transfer or Purchase Order.
            </p>
          </div>
        </div>

        {!isAdmin && (
          <button
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-indigo-900/20 transition-all self-start sm:self-auto"
          >
            <Plus size={16} /> Raise Material Request
          </button>
        )}
      </div>

      {/* 2. KPI Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <span className="text-xs font-medium text-gray-500 block">Total Requests</span>
          <span className="text-2xl font-bold text-gray-900">{totalCount}</span>
        </div>
        <div
          className={`p-4 rounded-2xl border shadow-sm ${
            pendingCount > 0 ? "bg-amber-50/60 border-amber-200" : "bg-white border-gray-100"
          }`}
        >
          <span className="text-xs font-medium text-amber-700 block flex items-center gap-1">
            <Clock size={13} /> Pending Admin Approval
          </span>
          <span className="text-2xl font-bold text-amber-800">{pendingCount}</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <span className="text-xs font-medium text-blue-600 block flex items-center gap-1">
            <CheckCircle2 size={13} /> Approved (Stock Checked)
          </span>
          <span className="text-2xl font-bold text-blue-800">{approvedCount}</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <span className="text-xs font-medium text-emerald-600 block flex items-center gap-1">
            <Boxes size={13} /> Fulfilled
          </span>
          <span className="text-2xl font-bold text-emerald-800">{fulfilledCount}</span>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by request # or item name..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs font-medium bg-gray-50 border border-gray-200 rounded-xl outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="PENDING_APPROVAL">Pending Approval</option>
            <option value="APPROVED">Approved</option>
            <option value="FULFILLED">Fulfilled</option>
            <option value="REJECTED">Rejected</option>
          </select>

          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="px-3 py-2 text-xs font-medium bg-gray-50 border border-gray-200 rounded-xl outline-none"
          >
            <option value="all">All Projects</option>
            {projects.map((p) => (
              <option key={p._id} value={p._id}>
                {p.projectName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 4. Requests Table */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-500">
          <Loader2 className="animate-spin text-indigo-600" size={26} />
          <p className="text-sm font-medium">Loading requests...</p>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center text-gray-500 space-y-3">
          <ClipboardList size={36} className="mx-auto text-gray-300" />
          <p className="font-semibold text-gray-700">No material requests found.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm shadow-gray-200/60 overflow-hidden">
          <ReportTable columns={columns} data={filteredRequests} />
        </div>
      )}

      {/* 5. MODAL: Multi-item Request Creation (Manager / Supervisor) */}
      <AnimatePresence>
        {showCreate && !isAdmin && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6 my-8"
            >
              <div className="flex items-center justify-between mb-4 border-b pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <PackagePlus size={18} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800">Raise Material Request (Multi-Item)</h3>
                </div>
                <button onClick={() => setShowCreate(false)} className="text-gray-400 hover:text-gray-600 p-1">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Project Site *</label>
                    <select
                      className={inputCls}
                      value={projectId}
                      onChange={(e) => setProjectId(e.target.value)}
                      required
                    >
                      <option value="">Select Project</option>
                      {projects.map((p) => (
                        <option key={p._id} value={p._id}>
                          {p.projectName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Required By Date *</label>
                    <input
                      type="date"
                      className={inputCls}
                      value={requiredDate}
                      onChange={(e) => setRequiredDate(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Priority</label>
                    <select
                      className={inputCls}
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Urgent">Urgent</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">General Purpose</label>
                    <input
                      type="text"
                      placeholder="e.g. Foundation / 2nd Floor Slab"
                      className={inputCls}
                      value={purpose}
                      onChange={(e) => setPurpose(e.target.value)}
                    />
                  </div>
                </div>

                {/* Items Table */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">
                      Request Items List *
                    </label>
                    <button
                      type="button"
                      onClick={handleAddItemRow}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                    >
                      <Plus size={13} /> Add Another Item
                    </button>
                  </div>

                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {requestItems.map((row, idx) => (
                      <div key={idx} className="flex gap-2 items-center bg-gray-50 p-2.5 rounded-xl border border-gray-200">
                        <div className="flex-1">
                          <select
                            className="w-full text-xs bg-white border border-gray-200 rounded-lg p-1.5 outline-none"
                            value={row.itemId}
                            onChange={(e) => handleItemChange(idx, "itemId", e.target.value)}
                            required
                          >
                            <option value="">Select Material</option>
                            {items.map((it) => (
                              <option key={it._id} value={it._id}>
                                {it.name} ({it.unit || "unit"})
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="w-24">
                          <input
                            type="number"
                            min="0.01"
                            step="any"
                            placeholder="Qty"
                            className="w-full text-xs bg-white border border-gray-200 rounded-lg p-1.5 outline-none"
                            value={row.requestedQty}
                            onChange={(e) => handleItemChange(idx, "requestedQty", e.target.value)}
                            required
                          />
                        </div>
                        <div className="w-20">
                          <input
                            type="text"
                            placeholder="Unit"
                            className="w-full text-xs bg-gray-100 border border-gray-200 rounded-lg p-1.5 text-gray-500 outline-none"
                            value={row.unit}
                            readOnly
                          />
                        </div>
                        {requestItems.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveItemRow(idx)}
                            className="text-gray-400 hover:text-rose-600 p-1"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-3 border-t">
                  <button
                    type="button"
                    onClick={() => setShowCreate(false)}
                    className="px-4 py-2 border rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl text-xs font-semibold shadow-md disabled:opacity-60"
                  >
                    {creating ? "Submitting..." : "Submit to Admin"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 6. MODAL: Admin Stock Check & Approval / Routing */}
      <AnimatePresence>
        {reviewModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6 my-8"
            >
              <div className="flex items-center justify-between mb-4 border-b pb-3">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Request Details &amp; Stock Check
                  </h3>
                  <p className="text-xs text-gray-500">
                    Request #{reviewModal.requestNumber} &bull; Project: {reviewModal.projectId?.projectName}
                  </p>
                </div>
                <button onClick={() => setReviewModal(null)} className="text-gray-400 hover:text-gray-600 p-1">
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4">
                {/* Header Information */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <div>
                    <span className="text-gray-400 block font-medium">Status</span>
                    <span className="font-bold text-gray-800">{reviewModal.status}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block font-medium">Requested By</span>
                    <span className="font-semibold text-gray-800">{reviewModal.requestedBy?.name || "Staff"}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block font-medium">Required Date</span>
                    <span className="font-semibold text-gray-800">
                      {reviewModal.requiredDate ? new Date(reviewModal.requiredDate).toLocaleDateString() : "-"}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block font-medium">Priority</span>
                    <span className="font-semibold text-gray-800">{reviewModal.priority}</span>
                  </div>
                </div>

                {/* Items & Stock Check Breakdown Table */}
                <div>
                  <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                    <Boxes size={14} className="text-indigo-600" />
                    Automatic Stock Check (Godown vs Shortage)
                  </h4>
                  <div className="border border-gray-200 rounded-xl overflow-hidden">
                    <table className="w-full text-xs">
                      <thead className="bg-gray-50 text-gray-500 uppercase font-semibold">
                        <tr>
                          <th className="p-2.5 text-left">Material</th>
                          <th className="p-2.5 text-right">Requested</th>
                          <th className="p-2.5 text-right">In Godown</th>
                          <th className="p-2.5 text-right">Shortage</th>
                          <th className="p-2.5 text-center">Status</th>
                          {permissions.stock.canTransfer && reviewModal.status === "APPROVED" && (
                            <th className="p-2.5 text-right">Action</th>
                          )}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {(reviewModal.items?.length
                          ? reviewModal.items
                          : [{ materialName: reviewModal.materialName, requestedQty: reviewModal.quantity, unit: reviewModal.unit, availableQty: 0, shortageQty: reviewModal.quantity }]
                        ).map((it, idx) => (
                          <tr key={idx} className="hover:bg-gray-50/60">
                            <td className="p-2.5 font-semibold text-gray-800">
                              {it.materialName || it.itemId?.name || "Material"}
                            </td>
                            <td className="p-2.5 text-right font-medium">
                              {it.requestedQty} {it.unit}
                            </td>
                            <td className="p-2.5 text-right font-bold text-emerald-600">
                              {it.availableQty || 0} {it.unit}
                            </td>
                            <td className="p-2.5 text-right font-bold text-rose-600">
                              {it.shortageQty !== undefined ? it.shortageQty : it.requestedQty} {it.unit}
                            </td>
                            <td className="p-2.5 text-center">
                              {it.shortageQty === 0 ? (
                                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-semibold text-[11px]">
                                  Full Stock
                                </span>
                              ) : it.availableQty > 0 ? (
                                <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full font-semibold text-[11px]">
                                  Partial
                                </span>
                              ) : (
                                <span className="bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded-full font-semibold text-[11px]">
                                  Procure Needed
                                </span>
                              )}
                            </td>
                            {permissions.stock.canTransfer && reviewModal.status === "APPROVED" && (
                              <td className="p-2.5 text-right space-x-1">
                                {it.availableQty > 0 && (
                                  <button
                                    onClick={() => setTransferModal({ request: reviewModal, item: it })}
                                    className="px-2 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-[11px] font-semibold"
                                  >
                                    Transfer
                                  </button>
                                )}
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Role-Specific Actions */}
                <div className="pt-3 border-t flex flex-wrap gap-2 justify-end items-center">
                  {/* Admin Approval / Rejection */}
                  {permissions.stock.canApproveRequest &&
                    (reviewModal.status === "PENDING_APPROVAL" || reviewModal.status === "PENDING_ADMIN_REVIEW") && (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setRejectPrompt(reviewModal._id);
                          }}
                          className="px-4 py-2 border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-semibold flex items-center gap-1"
                        >
                          <Ban size={14} /> Reject Request
                        </button>
                        <button
                          type="button"
                          disabled={approving}
                          onClick={() => handleApprove(reviewModal._id)}
                          className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl text-xs font-semibold shadow-md flex items-center gap-1.5"
                        >
                          {approving ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                          Approve &amp; Check Stock
                        </button>
                      </>
                    )}

                  {/* Manager Procurement Creation for Shortages */}
                  {permissions.purchase.canCreatePO && reviewModal.status === "APPROVED" && (
                    <>
                      {(reviewModal.items || []).some((i) => (i.shortageQty || 0) > 0) && (
                        <button
                          type="button"
                          onClick={() => {
                            navigate("/PurchaseOrder", {
                              state: {
                                prefillProjectId: reviewModal.projectId?._id || reviewModal.projectId,
                                prefillStockRequestId: reviewModal._id,
                                prefillItems: (reviewModal.items || [])
                                  .filter((i) => (i.shortageQty || 0) > 0)
                                  .map((i) => ({
                                    itemId: i.itemId?._id || i.itemId,
                                    qty: i.shortageQty,
                                    unit: i.unit,
                                  })),
                              },
                            });
                          }}
                          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm"
                        >
                          <ShoppingCart size={14} /> Create Purchase Order for Shortage
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 7. MODAL: Transfer Available Stock from Central Godown */}
      <AnimatePresence>
        {transferModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 my-8"
            >
              <div className="flex items-center justify-between mb-4 border-b pb-3">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Transfer from Godown</h3>
                  <p className="text-xs text-gray-500">
                    Fulfilling {transferModal.item.materialName || "Material"} for {transferModal.request.projectId?.projectName}
                  </p>
                </div>
                <button onClick={() => setTransferModal(null)} className="text-gray-400 hover:text-gray-600 p-1">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleTransferSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Source Godown / Project *</label>
                  <select
                    name="sourceProjectId"
                    className={inputCls}
                    required
                    defaultValue={
                      projects.find(
                        (p) =>
                          (p.isGodown || p.projectType === "Godown" || p.projectCode === "GODOWN-MAIN" || /godown/i.test(p.projectName)) &&
                          String(p._id) !== String(transferModal.request.projectId?._id || transferModal.request.projectId)
                      )?._id || ""
                    }
                  >
                    <option value="">-- Select Source Godown / Project --</option>
                    {[...projects]
                      .filter((p) => String(p._id) !== String(transferModal.request.projectId?._id || transferModal.request.projectId))
                      .sort((a, b) => {
                        const isAGodown = a.isGodown || a.projectType === "Godown" || a.projectCode === "GODOWN-MAIN" || /godown/i.test(a.projectName);
                        const isBGodown = b.isGodown || b.projectType === "Godown" || b.projectCode === "GODOWN-MAIN" || /godown/i.test(b.projectName);
                        if (isAGodown && !isBGodown) return -1;
                        if (!isAGodown && isBGodown) return 1;
                        return (a.projectName || "").localeCompare(b.projectName || "");
                      })
                      .map((p) => {
                        const isGodown = p.isGodown || p.projectType === "Godown" || p.projectCode === "GODOWN-MAIN" || /godown/i.test(p.projectName);
                        return (
                          <option key={p._id} value={p._id}>
                            {isGodown ? `🏭 ${p.projectName} (Main Godown)` : `🏗️ ${p.projectName}`}
                          </option>
                        );
                      })}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Transfer Quantity *</label>
                  <input
                    name="quantity"
                    type="number"
                    min="0.01"
                    step="any"
                    defaultValue={transferModal.item.availableQty || transferModal.item.requestedQty}
                    className={inputCls}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Remarks</label>
                  <input
                    name="remarks"
                    type="text"
                    placeholder="Dispatched from Godown"
                    className={inputCls}
                  />
                </div>

                <div className="flex gap-2 justify-end pt-3 border-t">
                  <button
                    type="button"
                    onClick={() => setTransferModal(null)}
                    className="px-4 py-2 border rounded-xl text-xs font-semibold text-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={transferring}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold"
                  >
                    {transferring ? "Transferring..." : "Confirm Transfer"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 8. MODAL: Rejection Remarks Prompt */}
      <AnimatePresence>
        {rejectPrompt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6"
            >
              <h3 className="text-base font-bold text-gray-900 mb-2">Reject Material Request</h3>
              <p className="text-xs text-gray-500 mb-3">Please provide the mandatory reason for rejection:</p>
              <textarea
                className="w-full text-xs p-2.5 border rounded-xl bg-gray-50 outline-none focus:ring-2 focus:ring-rose-500"
                rows={3}
                placeholder="Reason for rejection..."
                value={rejectionRemarks}
                onChange={(e) => setRejectionRemarks(e.target.value)}
                required
              />
              <div className="flex gap-2 justify-end mt-4">
                <button
                  type="button"
                  onClick={() => setRejectPrompt(null)}
                  className="px-3.5 py-1.5 border rounded-xl text-xs font-semibold text-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={rejecting}
                  onClick={handleRejectConfirm}
                  className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold"
                >
                  {rejecting ? "Rejecting..." : "Confirm Rejection"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StockRequests;
