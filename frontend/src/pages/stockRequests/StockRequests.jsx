import React, { useState, useMemo } from "react";
import { CheckRole } from "../../helper/CheckRole";
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
  Filter,
  Search,
  Building2,
  Calendar,
  Layers,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import ReportTable from "../../components/ReportTable";
import {
  useGetStockRequestsQuery,
  useCreateStockRequestMutation,
  useReviewStockRequestMutation,
  useCreateStockTransferMutation,
  useCreateProcurementMutation,
  useGetProjectsQuery,
  useGetAllItemsQuery,
  useGetVendorsQuery,
} from "../../Reduxe/Api";

const STATUS_CONFIG = {
  PENDING_ADMIN_REVIEW: {
    label: "Pending Review",
    cls: "bg-amber-50 text-amber-700 border-amber-200",
  },
  APPROVED_TRANSFER: {
    label: "Transfer Approved",
    cls: "bg-blue-50 text-blue-700 border-blue-200",
  },
  APPROVED_PROCUREMENT: {
    label: "In Procurement",
    cls: "bg-purple-50 text-purple-700 border-purple-200",
  },
  PARTIALLY_FULFILLED: {
    label: "Partially Fulfilled",
    cls: "bg-orange-50 text-orange-700 border-orange-200",
  },
  FULFILLED: {
    label: "Fulfilled",
    cls: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  REJECTED: {
    label: "Rejected",
    cls: "bg-red-50 text-red-700 border-red-200",
  },
  CANCELLED: {
    label: "Cancelled",
    cls: "bg-gray-100 text-gray-600 border-gray-200",
  },
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
  const { role: userRole } = CheckRole();
  const currentRole = String(userRole || "").toLowerCase();
  const isAdmin = currentRole === "admin";

  const [showCreate, setShowCreate] = useState(false);
  const [fulfilModal, setFulfilModal] = useState(null); // { request, type: 'transfer' | 'procurement' }

  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [projectFilter, setProjectFilter] = useState("all");

  const { data, isLoading, refetch } = useGetStockRequestsQuery({});
  const { data: projectResp } = useGetProjectsQuery();
  const { data: itemResp } = useGetAllItemsQuery();
  const { data: vendorResp } = useGetVendorsQuery();

  const [createStockRequest, { isLoading: creating }] = useCreateStockRequestMutation();
  const [reviewStockRequest] = useReviewStockRequestMutation();
  const [createStockTransfer, { isLoading: transferring }] = useCreateStockTransferMutation();
  const [createProcurement, { isLoading: procuring }] = useCreateProcurementMutation();

  const requests = data?.data || [];
  const projects = projectResp?.data || projectResp || [];
  const items = itemResp?.items || itemResp?.data || itemResp || [];
  const vendors = vendorResp?.data || vendorResp || [];

  // New Request Form State
  const [form, setForm] = useState({
    projectId: "",
    materialId: "",
    quantity: "",
    unit: "",
    requiredDate: "",
    priority: "Medium",
    purpose: "",
    description: "",
  });
  const [imageFiles, setImageFiles] = useState([]);

  // Handle Material Selection and auto-populate unit
  const handleMaterialChange = (e) => {
    const matId = e.target.value;
    const selectedItem = items.find((i) => String(i._id) === String(matId));
    setForm((prev) => ({
      ...prev,
      materialId: matId,
      unit: selectedItem?.unit || prev.unit,
    }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.projectId || !form.materialId || !form.quantity || !form.unit || !form.requiredDate) {
      return toast.error("Please fill in all required fields");
    }
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      imageFiles.forEach((f) => fd.append("images", f));

      await createStockRequest(fd).unwrap();
      toast.success("Material request submitted successfully");
      setShowCreate(false);
      setForm({
        projectId: "",
        materialId: "",
        quantity: "",
        unit: "",
        requiredDate: "",
        priority: "Medium",
        purpose: "",
        description: "",
      });
      setImageFiles([]);
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || "Error submitting material request");
    }
  };

  const handleReject = async (id) => {
    const adminRemarks = window.prompt("Reason for rejection:") || "";
    if (adminRemarks === null) return;
    try {
      await reviewStockRequest({ id, decision: "reject", adminRemarks }).unwrap();
      toast.success("Request rejected");
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || "Error rejecting request");
    }
  };

  const handleFulfilSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    try {
      if (fulfilModal.type === "transfer") {
        await createStockTransfer({
          stockRequestId: fulfilModal.request._id,
          sourceProjectId: fd.get("sourceProjectId"),
          quantity: Number(fd.get("quantity")),
          remarks: fd.get("remarks"),
        }).unwrap();
        toast.success("Stock transfer initiated");
      } else {
        await createProcurement({
          stockRequestId: fulfilModal.request._id,
          vendorId: fd.get("vendorId"),
          quantity: Number(fd.get("quantity")),
          rate: Number(fd.get("rate")),
          tax: Number(fd.get("tax") || 0),
          expectedDeliveryDate: fd.get("expectedDeliveryDate"),
        }).unwrap();
        toast.success("Purchase order created for procurement");
      }
      setFulfilModal(null);
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || "Error fulfilling request");
    }
  };

  // Filtered requests
  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      const matchesSearch =
        r.materialName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.requestNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.projectId?.projectName?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === "all" || r.status === statusFilter;
      const matchesProject =
        projectFilter === "all" || String(r.projectId?._id || r.projectId) === String(projectFilter);

      return matchesSearch && matchesStatus && matchesProject;
    });
  }, [requests, searchTerm, statusFilter, projectFilter]);

  // Metric KPI counts
  const totalCount = requests.length;
  const pendingCount = requests.filter((r) => r.status === "PENDING_ADMIN_REVIEW").length;
  const transferCount = requests.filter((r) => r.status === "APPROVED_TRANSFER").length;
  const procureCount = requests.filter((r) => r.status === "APPROVED_PROCUREMENT").length;
  const fulfilledCount = requests.filter((r) => r.status === "FULFILLED").length;

  const columns = [
    { header: "Request #", accessor: "requestNumber" },
    { header: "Project", render: (row) => row.projectId?.projectName || "-" },
    {
      header: "Material Details",
      render: (row) => (
        <div>
          <div className="font-semibold text-gray-800">{row.materialName}</div>
          <div className="text-xs text-gray-500">
            Qty: {row.quantity} {row.unit}
            {row.fulfilledQty > 0 && (
              <span className="text-emerald-600 ml-1">({row.fulfilledQty} fulfilled)</span>
            )}
          </div>
        </div>
      ),
    },
    {
      header: "Requested By",
      render: (row) => (
        <div>
          <div className="text-gray-800 font-medium">{row.requestedBy?.name || "-"}</div>
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
      header: "Images",
      render: (row) =>
        row.images?.length ? (
          <div className="flex gap-1">
            {row.images.slice(0, 3).map((img, i) => (
              <a key={i} href={img} target="_blank" rel="noreferrer">
                <img
                  src={img}
                  alt=""
                  className="w-8 h-8 rounded-lg object-cover border border-gray-200 hover:scale-110 transition-transform"
                />
              </a>
            ))}
          </div>
        ) : (
          <span className="text-xs text-gray-400">-</span>
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
      render: (row) => {
        // ADMIN SPECIFIC ACTIONS: Approve via Transfer, Procure, or Reject
        if (isAdmin) {
          if (row.status === "PENDING_ADMIN_REVIEW") {
            return (
              <div className="flex gap-1.5 flex-wrap">
                <button
                  onClick={() => setFulfilModal({ request: row, type: "transfer" })}
                  className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-sm transition-colors"
                  title="Fulfill via inter-project / godown transfer"
                >
                  <ArrowRightLeft size={12} /> Transfer
                </button>
                <button
                  onClick={() => setFulfilModal({ request: row, type: "procurement" })}
                  className="px-2.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-sm transition-colors"
                  title="Order from vendor through Purchase Order"
                >
                  <ShoppingCart size={12} /> Procure
                </button>
                <button
                  onClick={() => handleReject(row._id)}
                  className="px-2.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-sm transition-colors"
                  title="Reject request with remarks"
                >
                  <Ban size={12} /> Reject
                </button>
              </div>
            );
          }
          return (
            <span className="text-xs text-gray-400 italic">
              {row.status === "FULFILLED" ? "Completed" : "Actioned"}
            </span>
          );
        }

        // MANAGER / SUPERVISOR VIEW: Clear status badge
        if (row.status === "PENDING_ADMIN_REVIEW") {
          return (
            <span className="text-xs text-amber-700 font-medium flex items-center gap-1">
              <Clock size={12} /> Awaiting Admin Approval
            </span>
          );
        }
        if (row.status === "APPROVED_TRANSFER") {
          return (
            <span className="text-xs text-blue-700 font-medium flex items-center gap-1">
              <Truck size={12} /> Transfer In-Transit
            </span>
          );
        }
        if (row.status === "APPROVED_PROCUREMENT") {
          return (
            <span className="text-xs text-purple-700 font-medium flex items-center gap-1">
              <ShoppingCart size={12} /> Vendor Order Placed
            </span>
          );
        }
        if (row.status === "FULFILLED") {
          return (
            <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
              <CheckCircle2 size={12} /> Received & Stocked
            </span>
          );
        }
        if (row.status === "REJECTED") {
          return (
            <span className="text-xs text-rose-600 font-medium" title={row.adminRemarks || "No remarks"}>
              Rejected {row.adminRemarks && `(${row.adminRemarks})`}
            </span>
          );
        }
        return <span className="text-xs text-gray-400">-</span>;
      },
    },
  ];

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 min-h-screen pb-20">
      {/* 1. Header (Differentiated between Admin vs Manager vs Supervisor) */}
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
                {isAdmin ? "Material Approvals & Overview" : "Project Material Requests"}
              </h1>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                  isAdmin
                    ? "bg-purple-50 text-purple-700 border-purple-200"
                    : "bg-blue-50 text-blue-700 border-blue-200"
                }`}
              >
                {isAdmin ? "Admin Panel" : currentRole === "supervisor" ? "Site Supervisor" : "Manager Operations"}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              {isAdmin
                ? "Review pending site requests. Fulfill via inter-project stock transfer or vendor procurement."
                : "Raise site material requirements, track approvals, and check delivery status."}
            </p>
          </div>
        </div>

        {/* Manager & Supervisor have "+ New Request" button. Admin does NOT need to create operational requests */}
        {!isAdmin && (
          <button
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-indigo-900/20 transition-all self-start sm:self-auto"
          >
            <Plus size={16} /> New Request
          </button>
        )}
      </div>

      {/* 2. Quick KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm shadow-gray-200/50">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-xs font-medium">Total Requests</span>
            <Layers size={14} className="text-gray-400" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{totalCount}</div>
        </div>

        <div
          className={`p-4 rounded-2xl border shadow-sm ${
            isAdmin && pendingCount > 0
              ? "bg-amber-50/60 border-amber-200 shadow-amber-200/40"
              : "bg-white border-gray-100 shadow-gray-200/50"
          }`}
        >
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className={`text-xs font-medium ${isAdmin && pendingCount > 0 ? "text-amber-800" : ""}`}>
              {isAdmin ? "Action Needed" : "Pending Review"}
            </span>
            <Clock size={14} className={isAdmin && pendingCount > 0 ? "text-amber-600" : "text-gray-400"} />
          </div>
          <div className={`text-2xl font-bold ${isAdmin && pendingCount > 0 ? "text-amber-700" : "text-gray-900"}`}>
            {pendingCount}
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm shadow-gray-200/50">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-xs font-medium">In Transfer / PO</span>
            <Truck size={14} className="text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{transferCount + procureCount}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm shadow-gray-200/50">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-xs font-medium">Fulfilled</span>
            <CheckCircle2 size={14} className="text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-700">{fulfilledCount}</div>
        </div>
      </div>

      {/* 3. Search and Filters Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-gray-100 shadow-sm shadow-gray-200/50 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by material, request number or project..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs font-medium bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
          >
            <option value="all">All Statuses</option>
            <option value="PENDING_ADMIN_REVIEW">Pending Review</option>
            <option value="APPROVED_TRANSFER">Transfer Approved</option>
            <option value="APPROVED_PROCUREMENT">In Procurement</option>
            <option value="FULFILLED">Fulfilled</option>
            <option value="REJECTED">Rejected</option>
          </select>

          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="px-3 py-2 text-xs font-medium bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
          >
            <option value="all">All Projects</option>
            {projects.map((p) => (
              <option key={p._id} value={p._id}>
                {p.projectName}
              </option>
            ))}
          </select>

          {(searchTerm || statusFilter !== "all" || projectFilter !== "all") && (
            <button
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
                setProjectFilter("all");
              }}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold px-2 py-1"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* 4. Main Requests Table */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-500">
          <Loader2 className="animate-spin text-indigo-600" size={26} />
          <p className="text-sm font-medium">Loading material requests...</p>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center text-gray-500 space-y-3">
          <ClipboardList size={36} className="mx-auto text-gray-300" />
          <p className="font-semibold text-gray-700">No material requests found.</p>
          <p className="text-xs text-gray-400">
            {isAdmin
              ? "All submitted site requests have been actioned."
              : "Click 'New Request' above to submit a material requirement for your site."}
          </p>
          {!isAdmin && (
            <button
              onClick={() => setShowCreate(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <Plus size={14} /> Create Material Request
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm shadow-gray-200/60 overflow-hidden">
          <ReportTable columns={columns} data={filteredRequests} />
        </div>
      )}

      {/* 5. MODAL: Create New Material Request (Manager & Supervisor) */}
      <AnimatePresence>
        {showCreate && !isAdmin && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 my-8"
            >
              <div className="flex items-center justify-between mb-4 border-b pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <PackagePlus size={18} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800">Raise Material Request</h3>
                </div>
                <button
                  onClick={() => setShowCreate(false)}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Target Project *</label>
                  <select
                    className={inputCls}
                    value={form.projectId}
                    onChange={(e) => setForm({ ...form, projectId: e.target.value })}
                    required
                  >
                    <option value="">Select Construction Project</option>
                    {projects.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.projectName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Material / Item *</label>
                  <select
                    className={inputCls}
                    value={form.materialId}
                    onChange={handleMaterialChange}
                    required
                  >
                    <option value="">Select Material from Master</option>
                    {items.map((it) => (
                      <option key={it._id} value={it._id}>
                        {it.name} ({it.unit || "unit"})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Quantity *</label>
                    <input
                      type="number"
                      min="0.01"
                      step="any"
                      placeholder="e.g. 50"
                      className={inputCls}
                      value={form.quantity}
                      onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Unit *</label>
                    <input
                      type="text"
                      placeholder="e.g. Bags, Ton"
                      className={inputCls}
                      value={form.unit}
                      onChange={(e) => setForm({ ...form, unit: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Required By Date *</label>
                    <input
                      type="date"
                      className={inputCls}
                      value={form.requiredDate}
                      onChange={(e) => setForm({ ...form, requiredDate: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Priority</label>
                    <select
                      className={inputCls}
                      value={form.priority}
                      onChange={(e) => setForm({ ...form, priority: e.target.value })}
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Purpose / Work Area</label>
                  <input
                    type="text"
                    placeholder="e.g. 3rd Floor Slab Casting"
                    className={inputCls}
                    value={form.purpose}
                    onChange={(e) => setForm({ ...form, purpose: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Site Evidence Photos (optional)</label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => setImageFiles(Array.from(e.target.files || []))}
                    className="w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                  />
                </div>

                <div className="flex gap-2 justify-end pt-3 border-t">
                  <button
                    type="button"
                    onClick={() => setShowCreate(false)}
                    className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-900/20 disabled:opacity-60"
                  >
                    {creating ? "Submitting..." : "Submit Material Request"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 6. MODAL: Admin Fulfill / Review (Transfer vs Procurement) */}
      <AnimatePresence>
        {fulfilModal && isAdmin && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 my-8"
            >
              <div className="flex items-center justify-between mb-4 border-b pb-3">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 capitalize">
                    {fulfilModal.type === "transfer" ? "Fulfill via Transfer" : "Fulfill via Vendor Procurement"}
                  </h3>
                  <p className="text-xs text-gray-500">
                    Request: {fulfilModal.request.requestNumber} ({fulfilModal.request.materialName})
                  </p>
                </div>
                <button
                  onClick={() => setFulfilModal(null)}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleFulfilSubmit} className="space-y-3.5">
                {fulfilModal.type === "transfer" ? (
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                      Source Project / Store (transfer from) *
                    </label>
                    <select name="sourceProjectId" className={inputCls} required>
                      <option value="">Select Source Project / Godown</option>
                      {projects
                        .filter(
                          (p) => String(p._id) !== String(fulfilModal.request.projectId?._id || fulfilModal.request.projectId)
                        )
                        .map((p) => (
                          <option key={p._id} value={p._id}>
                            {p.projectName}
                          </option>
                        ))}
                    </select>
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Vendor *</label>
                      <select name="vendorId" className={inputCls} required>
                        <option value="">Select Vendor</option>
                        {vendors.map((v) => (
                          <option key={v._id} value={v._id}>
                            {v.companyName}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Rate per unit (₹) *</label>
                        <input
                          name="rate"
                          type="number"
                          step="any"
                          placeholder="e.g. 350"
                          className={inputCls}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">GST Tax %</label>
                        <input
                          name="tax"
                          type="number"
                          step="any"
                          placeholder="e.g. 18"
                          className={inputCls}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Expected Delivery Date</label>
                      <input name="expectedDeliveryDate" type="date" className={inputCls} />
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Fulfill Quantity *</label>
                  <input
                    name="quantity"
                    type="number"
                    step="any"
                    placeholder="Quantity"
                    defaultValue={fulfilModal.request.quantity}
                    className={inputCls}
                    required
                  />
                </div>

                {fulfilModal.type === "transfer" && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Transfer Remarks</label>
                    <input
                      name="remarks"
                      type="text"
                      placeholder="e.g. Dispatched from Central Godown"
                      className={inputCls}
                    />
                  </div>
                )}

                <div className="flex gap-2 justify-end pt-3 border-t">
                  <button
                    type="button"
                    onClick={() => setFulfilModal(null)}
                    className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={transferring || procuring}
                    className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-900/20 disabled:opacity-60"
                  >
                    {transferring || procuring ? "Processing..." : "Confirm & Authorize"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StockRequests;
