import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  ArrowRightLeft,
  PackageCheck,
  Boxes,
  ScrollText,
  Ban,
  CheckCheck,
  History,
  PackagePlus,
  Search,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Plus,
  Building2,
  Warehouse,
  FolderKanban,
  X,
  Loader2,
  Send,
  Undo2,
  Truck,
  FileText,
  ClipboardCheck,
} from "lucide-react";
import {
  useGetStockTransfersQuery,
  useCreateStockTransferMutation,
  useConfirmTransferReceiptMutation,
  useCancelStockTransferMutation,
  useGetStockReceiptsQuery,
  useGetAllGRNQuery,
  useCreateGRNMutation,
  useGetPurchaseOrdersQuery,
  useGetInventoryQuery,
  useGetProjectLedgerQuery,
  useGetProjectsQuery,
  useGetAllItemsQuery,
  useOpeningStockMutation,
  useDamageInventoryMutation,
  useAdjustInventoryMutation,
  useCreateStockIssueMutation,
  useGetProjectIssuesQuery,
  useReturnMaterialMutation,
} from "../../Reduxe/Api";
import { CheckRole } from "../../helper/CheckRole";
import AuditHistory from "../../components/AuditHistory";

const TABS = [
  { key: "inventory", label: "Inventory", icon: Boxes },
  { key: "transfers", label: "Transfers", icon: ArrowRightLeft },
  { key: "receipts", label: "Goods Receipts (GRN)", icon: PackageCheck },
  { key: "issues", label: "Material Issues", icon: Send },
  { key: "returns", label: "Returns to Central", icon: Undo2 },
  { key: "adjustments", label: "Damage / Adjust / Opening", icon: PackagePlus },
  { key: "ledger", label: "Stock Ledger", icon: ScrollText },
];

const STATUS_STYLES = {
  InTransit: "bg-amber-50 text-amber-700 border-amber-200",
  Received: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Cancelled: "bg-rose-50 text-rose-700 border-rose-200",
};

const thead = "bg-gray-50/70 text-gray-500 text-xs uppercase tracking-wide";
const th = "px-4 py-3 text-left font-semibold";
const card = "bg-white rounded-2xl border border-gray-100 shadow-sm shadow-gray-200/60 overflow-x-auto";
const fieldCls =
  "mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all px-3 py-2 text-sm";

/* =========================================================================
   1. INVENTORY TAB
   ========================================================================= */
const InventoryTab = ({ projectId, onSelectLedgerItem, onSelectIssueItem }) => {
  const { data, isLoading } = useGetInventoryQuery(projectId, { skip: !projectId });
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMode, setFilterMode] = useState("all"); // all | low | damaged | buffer

  if (!projectId) {
    return <p className="text-sm text-gray-400 py-12 text-center">Select a project or godown above to view inventory.</p>;
  }

  if (isLoading) {
    return (
      <div className="py-16 text-center text-gray-400">
        <Loader2 className="animate-spin inline-block mr-2" size={20} />
        Loading project inventory…
      </div>
    );
  }

  const rawItems = data?.data || [];
  const filtered = rawItems.filter((it) => {
    const matchesSearch =
      it.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      it.category?.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;
    if (filterMode === "low") return it.currentBalance > 0 && it.currentBalance < 10;
    if (filterMode === "buffer") return Number(it.issuedBuffer || 0) > 0;
    if (filterMode === "damaged") return Number(it.damaged || 0) > 0;
    if (filterMode === "out") return it.currentBalance <= 0;
    return true;
  });

  const totalItems = rawItems.length;
  const inStockCount = rawItems.filter((i) => i.currentBalance > 10).length;
  const lowStockCount = rawItems.filter((i) => i.currentBalance > 0 && i.currentBalance <= 10).length;
  const totalIssuedBuffer = rawItems.reduce((sum, i) => sum + Number(i.issuedBuffer || 0), 0);
  const damagedCount = rawItems.filter((i) => Number(i.damaged || 0) > 0).length;

  return (
    <div className="space-y-4">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div
          onClick={() => setFilterMode("all")}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${filterMode === "all" ? "bg-indigo-50/60 border-indigo-200 ring-2 ring-indigo-500/20" : "bg-white border-gray-100"
            }`}
        >
          <span className="text-xs font-medium text-gray-500 block">Total Items</span>
          <span className="text-xl font-bold text-gray-800">{totalItems}</span>
        </div>
        <div
          onClick={() => setFilterMode("all")}
          className="p-3.5 rounded-2xl bg-white border border-gray-100 cursor-pointer"
        >
          <span className="text-xs font-medium text-emerald-600 block flex items-center gap-1">
            <CheckCircle2 size={13} /> Usable Stock (&gt;10)
          </span>
          <span className="text-xl font-bold text-emerald-700">{inStockCount}</span>
        </div>
        <div
          onClick={() => setFilterMode("buffer")}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${filterMode === "buffer" ? "bg-blue-50/60 border-blue-200 ring-2 ring-blue-500/20" : "bg-white border-gray-100"
            }`}
        >
          <span className="text-xs font-medium text-blue-600 block flex items-center gap-1">
            <Send size={13} /> Issued Buffer (Site)
          </span>
          <span className="text-xl font-bold text-blue-700">{totalIssuedBuffer}</span>
        </div>
        <div
          onClick={() => setFilterMode("damaged")}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${filterMode === "damaged" ? "bg-rose-50/60 border-rose-200 ring-2 ring-rose-500/20" : "bg-white border-gray-100"
            }`}
        >
          <span className="text-xs font-medium text-rose-600 block flex items-center gap-1">
            <XCircle size={13} /> Damaged Stock
          </span>
          <span className="text-xl font-bold text-rose-700">{damagedCount}</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search material by name or category…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>
        {filterMode !== "all" && (
          <button
            onClick={() => setFilterMode("all")}
            className="text-xs text-gray-500 hover:text-gray-800 underline px-2 py-1"
          >
            Clear filter
          </button>
        )}
      </div>

      {/* Table */}
      <div className={card}>
        <table className="w-full text-sm">
          <thead className={thead}>
            <tr>
              <th className={th}>Material</th>
              <th className={th}>Category</th>
              <th className={th}>Usable Stock (Store)</th>
              <th className={th}>Issued (Site Buffer)</th>
              <th className={th}>Damaged</th>
              <th className={th}>Total Site Stock</th>
              <th className={th}>Status</th>
              <th className={th}>Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-gray-400">
                  No materials match your search or filter.
                </td>
              </tr>
            ) : (
              filtered.map((it) => {
                const bal = Number(it.currentBalance || 0);
                const buffer = Number(it.issuedBuffer || 0);
                const damaged = Number(it.damaged || 0);
                const total = bal + buffer;
                const isOut = bal <= 0;
                const isLow = bal > 0 && bal < 10;
                return (
                  <tr key={it.itemId} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-800">{it.name}</td>
                    <td className="px-4 py-3 text-gray-600">{it.category || "-"}</td>
                    <td className="px-4 py-3 font-semibold text-emerald-700">
                      {bal} <span className="text-xs text-gray-400 font-normal">{it.unit}</span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-blue-700">
                      {buffer} <span className="text-xs text-gray-400 font-normal">{it.unit}</span>
                    </td>
                    <td className="px-4 py-3 text-rose-600 font-medium">{damaged}</td>
                    <td className="px-4 py-3 font-bold text-gray-900">
                      {total} <span className="text-xs text-gray-400 font-normal">{it.unit}</span>
                    </td>
                    <td className="px-4 py-3">
                      {isOut ? (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
                          Out of Store
                        </span>
                      ) : isLow ? (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          Low Stock
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          In Stock
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {bal > 0 && onSelectIssueItem && (
                          <button
                            onClick={() => onSelectIssueItem(it.itemId)}
                            className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-0.5"
                          >
                            <Send size={12} /> Issue
                          </button>
                        )}
                        <button
                          onClick={() => onSelectLedgerItem(it.itemId)}
                          className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-0.5"
                        >
                          <ScrollText size={12} /> Ledger
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* =========================================================================
   2. TRANSFERS TAB
   ========================================================================= */
const TransfersTab = ({ role, projects }) => {
  const { data, isLoading } = useGetStockTransfersQuery({});
  const [confirmReceipt] = useConfirmTransferReceiptMutation();
  const [cancelTransfer] = useCancelStockTransferMutation();
  const [createTransfer, { isLoading: creatingTransfer }] = useCreateStockTransferMutation();
  const { data: itemsResp } = useGetAllItemsQuery();
  const allItems = itemsResp?.items || itemsResp?.data || [];

  const [historyId, setHistoryId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    sourceProjectId: "",
    destinationProjectId: "",
    materialId: "",
    quantity: "",
    remarks: "",
  });

  const transfers = data?.data || [];

  const receive = async (id) => {
    try {
      await confirmReceipt(id).unwrap();
      toast.success("Transfer marked received and credited to site inventory");
    } catch (err) {
      toast.error(err?.data?.message || "Failed to receive transfer");
    }
  };

  const cancel = async (id) => {
    const reason = window.prompt("Reason for cancelling this transfer?");
    if (reason === null) return;
    try {
      await cancelTransfer({ id, reason }).unwrap();
      toast.success("Transfer cancelled");
    } catch (err) {
      toast.error(err?.data?.message || "Failed to cancel transfer");
    }
  };

  const handleInitiateTransfer = async (e) => {
    e.preventDefault();
    if (!form.sourceProjectId || !form.destinationProjectId || !form.materialId || !form.quantity) {
      return toast.error("Please fill all required fields");
    }
    if (form.sourceProjectId === form.destinationProjectId) {
      return toast.error("Source and destination projects cannot be the same");
    }

    try {
      await createTransfer({
        sourceProjectId: form.sourceProjectId,
        destinationProjectId: form.destinationProjectId,
        materialId: form.materialId,
        quantity: Number(form.quantity),
        remarks: form.remarks,
      }).unwrap();
      toast.success("Transfer initiated successfully");
      setShowModal(false);
      setForm({ sourceProjectId: "", destinationProjectId: "", materialId: "", quantity: "", remarks: "" });
    } catch (err) {
      toast.error(err?.data?.message || "Failed to initiate transfer");
    }
  };

  if (isLoading) return <p className="text-sm text-gray-400 py-12 text-center">Loading transfers…</p>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-500">Track and receive material transferred between construction sites or godowns.</p>
        {(role === "admin" || role === "manager") && (
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl text-sm font-semibold shadow-md shadow-indigo-900/20 hover:from-indigo-700 hover:to-blue-700 transition-all"
          >
            <Plus size={16} /> New Transfer
          </button>
        )}
      </div>

      <div className={card}>
        <table className="w-full text-sm">
          <thead className={thead}>
            <tr>
              <th className={th}>Material</th>
              <th className={th}>Source → Destination</th>
              <th className={th}>Qty</th>
              <th className={th}>Status</th>
              <th className={th}>Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {transfers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-gray-400">
                  No transfers recorded yet.
                </td>
              </tr>
            ) : (
              transfers.map((t) => (
                <React.Fragment key={t._id}>
                  <tr className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-800">{t.materialId?.name || "-"}</td>
                    <td className="px-4 py-3 text-gray-600">
                      <span className="font-medium text-gray-700">{t.sourceProjectId?.projectName || "-"}</span>
                      <span className="text-gray-400 mx-2">→</span>
                      <span className="font-medium text-gray-700">{t.destinationProjectId?.projectName || "-"}</span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-900">{t.transferredQuantity}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${STATUS_STYLES[t.status] || "bg-gray-50 text-gray-600 border-gray-200"}`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-3 items-center">
                        {t.status === "InTransit" && (
                          <>
                            <button
                              onClick={() => receive(t._id)}
                              className="text-emerald-700 text-xs font-semibold hover:underline inline-flex items-center gap-1"
                            >
                              <CheckCheck size={13} /> Confirm Receipt
                            </button>
                            {(role === "admin" || role === "manager") && (
                              <button
                                onClick={() => cancel(t._id)}
                                className="text-rose-600 text-xs font-semibold hover:underline inline-flex items-center gap-1"
                              >
                                <Ban size={13} /> Cancel
                              </button>
                            )}
                          </>
                        )}
                        <button
                          onClick={() => setHistoryId(historyId === t._id ? null : t._id)}
                          className="text-gray-500 text-xs font-semibold hover:underline inline-flex items-center gap-1"
                        >
                          <History size={13} /> History
                        </button>
                      </div>
                    </td>
                  </tr>
                  {historyId === t._id && (
                    <tr>
                      <td colSpan={5} className="px-4 pb-4 bg-gray-50">
                        <AuditHistory module="StockTransfer" entityId={t._id} />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* New Transfer Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-6 relative">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700">
              <X size={20} />
            </button>
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <ArrowRightLeft size={18} className="text-indigo-600" />
              Initiate Stock Transfer
            </h2>
            <form onSubmit={handleInitiateTransfer} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-600">Source Project / Godown (Stock will reduce)</label>
                <select
                  required
                  value={form.sourceProjectId}
                  onChange={(e) => setForm({ ...form, sourceProjectId: e.target.value })}
                  className={fieldCls}
                >
                  <option value="">Select source project…</option>
                  {projects.map((p) => (
                    <option key={p._id} value={p._id}>{p.projectName || p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600">Destination Project (Stock will increase)</label>
                <select
                  required
                  value={form.destinationProjectId}
                  onChange={(e) => setForm({ ...form, destinationProjectId: e.target.value })}
                  className={fieldCls}
                >
                  <option value="">Select destination project…</option>
                  {projects.map((p) => (
                    <option key={p._id} value={p._id}>{p.projectName || p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600">Material</label>
                <select
                  required
                  value={form.materialId}
                  onChange={(e) => setForm({ ...form, materialId: e.target.value })}
                  className={fieldCls}
                >
                  <option value="">Select material…</option>
                  {allItems.map((it) => (
                    <option key={it._id} value={it._id}>{it.name} ({it.unit || "unit"})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600">Quantity to Transfer</label>
                <input
                  required
                  type="number"
                  min="0.01"
                  step="any"
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                  className={fieldCls}
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600">Remarks / Reason</label>
                <input
                  value={form.remarks}
                  onChange={(e) => setForm({ ...form, remarks: e.target.value })}
                  placeholder="e.g. Urgent site requirement"
                  className={fieldCls}
                />
              </div>

              <button
                type="submit"
                disabled={creatingTransfer}
                className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-900/20 disabled:opacity-50 transition-all"
              >
                {creatingTransfer ? "Initiating Transfer…" : "Confirm Transfer"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

/* =========================================================================
   3. GOODS RECEIPTS (GRN) TAB & MODAL
   ========================================================================= */

const CreateGRNModal = ({ isOpen, onClose, initialPoId }) => {
  const { data: poResp, isLoading: poLoading } = useGetPurchaseOrdersQuery({});
  const [createGRN, { isLoading: creating }] = useCreateGRNMutation();

  const allPOs = poResp?.data || poResp || [];
  // Filter POs in ORDERED or PARTIALLY_RECEIVED status
  const receivablePOs = allPOs.filter((p) =>
    ["ORDERED", "PARTIALLY_RECEIVED"].includes(String(p.status).toUpperCase())
  );

  const [selectedPoId, setSelectedPoId] = useState(initialPoId || "");
  const [deliveryChallan, setDeliveryChallan] = useState("");
  const [dispatchDate, setDispatchDate] = useState(new Date().toISOString().split("T")[0]);
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [driverName, setDriverName] = useState("");
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (initialPoId) setSelectedPoId(initialPoId);
  }, [initialPoId]);

  const selectedPO = allPOs.find((p) => String(p._id) === String(selectedPoId));

  useEffect(() => {
    if (!selectedPO) {
      setItems([]);
      return;
    }
    const poItems = (selectedPO.items || []).map((it) => {
      const ord = Number(it.qty || it.quantity || 0);
      const recSoFar = Number(it.receivedQty || 0);
      const remaining = Math.max(0, ord - recSoFar);
      return {
        itemId: it.itemId?._id || it.itemId,
        name: it.itemId?.name || it.name || "Material",
        unit: it.unit || it.itemId?.unit || "",
        orderedQty: ord,
        receivedSoFar: recSoFar,
        remainingQty: remaining,
        receivedQty: remaining > 0 ? remaining : ord,
        damagedQty: 0,
        acceptedQty: remaining > 0 ? remaining : ord,
        remarks: "",
      };
    });
    setItems(poItems);
  }, [selectedPO]);

  const handleItemChange = (index, field, val) => {
    setItems((prev) => {
      const copy = [...prev];
      const target = { ...copy[index], [field]: val };
      if (field === "receivedQty" || field === "damagedQty") {
        const rec = Number(field === "receivedQty" ? val : target.receivedQty) || 0;
        const dmg = Number(field === "damagedQty" ? val : target.damagedQty) || 0;
        target.acceptedQty = Math.max(0, rec - dmg);
      }
      copy[index] = target;
      return copy;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPoId) return toast.error("Please select a Purchase Order");
    if (!deliveryChallan.trim()) return toast.error("Please enter Delivery Challan number");

    const validItems = items.filter((i) => Number(i.receivedQty) > 0);
    if (!validItems.length) {
      return toast.error("Please enter received quantity for at least one item");
    }

    for (const it of validItems) {
      if (Number(it.damagedQty || 0) > Number(it.receivedQty || 0)) {
        return toast.error(`Damaged qty cannot exceed received qty for ${it.name}`);
      }
    }

    try {
      const payload = {
        purchaseOrderId: selectedPoId,
        stockRequestId: selectedPO.stockRequestId,
        deliveryChallan: deliveryChallan.trim(),
        dispatchDate: dispatchDate || new Date(),
        vehicleNumber: vehicleNumber.trim(),
        driverName: driverName.trim(),
        items: validItems.map((it) => ({
          itemId: it.itemId,
          orderedQty: it.orderedQty,
          receivedQty: Number(it.receivedQty),
          acceptedQty: Math.max(0, Number(it.receivedQty) - Number(it.damagedQty || 0)),
          damagedQty: Number(it.damagedQty || 0),
          remarks: it.remarks || "",
        })),
      };

      await createGRN(payload).unwrap();
      toast.success("Goods Receipt Note (GRN) created & inventory credited successfully!");
      onClose();
    } catch (err) {
      toast.error(err?.data?.message || err?.message || "Failed to create GRN");
    }
  };

  if (!isOpen) return null;

  const isGodown = selectedPO?.deliveryType === "CENTRAL_GODOWN";

  return (
    <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl p-6 relative my-8">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 p-1"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-5 border-b pb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <PackageCheck size={22} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Create Goods Receipt Note (GRN)</h2>
            <p className="text-xs text-gray-500">
              Receive material delivered by vendor against Purchase Order with destination routing.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* PO Selector */}
          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1">
              Select Purchase Order <span className="text-rose-500">*</span>
            </label>
            <select
              value={selectedPoId}
              onChange={(e) => setSelectedPoId(e.target.value)}
              className={fieldCls}
              required
            >
              <option value="">-- Choose Purchase Order --</option>
              {receivablePOs.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.poNumber || p._id.slice(-8).toUpperCase()} &bull; {p.vendorId?.companyName || p.vendorId?.name || "Vendor"} &bull; Status: {p.status} ({p.deliveryType === "CENTRAL_GODOWN" ? "Central Godown" : p.deliveryProject?.projectName || p.projectId?.projectName || "Direct Site"})
                </option>
              ))}
            </select>
            {receivablePOs.length === 0 && !poLoading && (
              <p className="text-[11px] text-amber-600 mt-1">
                Notice: No POs currently in "ORDERED" or "PARTIALLY_RECEIVED" status. Mark a PO as Ordered first in Purchase Orders.
              </p>
            )}
          </div>

          {/* PO Summary & Routing Card */}
          {selectedPO && (
            <div className={`p-4 rounded-xl border ${isGodown ? "bg-blue-50/70 border-blue-200" : "bg-amber-50/70 border-amber-200"}`}>
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <div>
                  <span className="text-gray-500">PO Number: </span>
                  <span className="font-bold text-gray-800">{selectedPO.poNumber || selectedPO._id}</span>
                  <span className="mx-2 text-gray-300">|</span>
                  <span className="text-gray-500">Vendor: </span>
                  <span className="font-semibold text-gray-800">{selectedPO.vendorId?.companyName || selectedPO.vendorId?.name || "-"}</span>
                </div>
                <div>
                  {isGodown ? (
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300 flex items-center gap-1">
                      <Warehouse size={13} /> Routing: Central Godown
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                      <Building2 size={13} /> Routing: Direct Site ({selectedPO.deliveryProject?.projectName || selectedPO.projectId?.projectName || "Site"})
                    </span>
                  )}
                </div>
              </div>
              <p className="text-[11px] text-gray-600 mt-2 font-medium">
                {isGodown
                  ? "✓ Usable accepted quantity will be credited to Central Godown inventory."
                  : `✓ Usable accepted quantity will be credited directly to ${selectedPO.deliveryProject?.projectName || selectedPO.projectId?.projectName || "project"} site inventory (Central Godown will not increase).`}
              </p>
            </div>
          )}

          {/* Delivery Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">
                Delivery Challan # <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={deliveryChallan}
                onChange={(e) => setDeliveryChallan(e.target.value)}
                placeholder="e.g. DC-2024-001"
                className={fieldCls}
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">
                Delivery / Dispatch Date
              </label>
              <input
                type="date"
                value={dispatchDate}
                onChange={(e) => setDispatchDate(e.target.value)}
                className={fieldCls}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">
                Vehicle Number
              </label>
              <input
                type="text"
                value={vehicleNumber}
                onChange={(e) => setVehicleNumber(e.target.value)}
                placeholder="e.g. MH-12-AB-1234"
                className={fieldCls}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">
                Driver Name / Phone
              </label>
              <input
                type="text"
                value={driverName}
                onChange={(e) => setDriverName(e.target.value)}
                placeholder="e.g. Ramesh Kumar"
                className={fieldCls}
              />
            </div>
          </div>

          {/* Items Table */}
          {items.length > 0 && (
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-2">
                Line Items Received &amp; Quality Check (Accepted vs Damaged)
              </label>
              <div className="border rounded-xl overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50 border-b text-gray-600 uppercase font-semibold">
                    <tr>
                      <th className="px-3 py-2.5 text-left">Material</th>
                      <th className="px-3 py-2.5 text-center">Ordered</th>
                      <th className="px-3 py-2.5 text-center">Remaining</th>
                      <th className="px-3 py-2.5 text-center">Received Now</th>
                      <th className="px-3 py-2.5 text-center">Damaged</th>
                      <th className="px-3 py-2.5 text-center">Accepted (Usable)</th>
                      <th className="px-3 py-2.5 text-left">Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {items.map((it, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/70">
                        <td className="px-3 py-2.5 font-medium text-gray-900">
                          {it.name} <span className="text-gray-400 font-normal">({it.unit})</span>
                        </td>
                        <td className="px-3 py-2.5 text-center text-gray-600 font-semibold">{it.orderedQty}</td>
                        <td className="px-3 py-2.5 text-center text-amber-700 font-semibold">{it.remainingQty}</td>
                        <td className="px-3 py-2.5 text-center">
                          <input
                            type="number"
                            min="0"
                            step="any"
                            value={it.receivedQty}
                            onChange={(e) => handleItemChange(idx, "receivedQty", e.target.value)}
                            className="w-20 px-2 py-1 text-center font-bold text-gray-800 border rounded-lg bg-white focus:ring-1 focus:ring-emerald-500 outline-none"
                          />
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          <input
                            type="number"
                            min="0"
                            step="any"
                            value={it.damagedQty}
                            onChange={(e) => handleItemChange(idx, "damagedQty", e.target.value)}
                            className="w-20 px-2 py-1 text-center font-semibold text-rose-600 border border-rose-200 rounded-lg bg-rose-50/40 focus:ring-1 focus:ring-rose-500 outline-none"
                          />
                        </td>
                        <td className="px-3 py-2.5 text-center font-bold text-emerald-700 bg-emerald-50/40">
                          +{it.acceptedQty}
                        </td>
                        <td className="px-3 py-2.5">
                          <input
                            type="text"
                            value={it.remarks}
                            onChange={(e) => handleItemChange(idx, "remarks", e.target.value)}
                            placeholder="e.g. Batch # or note"
                            className="w-full px-2 py-1 text-xs border rounded-lg bg-white"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="flex gap-2 justify-end pt-3 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creating || !selectedPoId}
              className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-emerald-900/20 disabled:opacity-50 transition-all flex items-center gap-1.5"
            >
              {creating ? <Loader2 size={14} className="animate-spin" /> : <PackageCheck size={14} />}
              {creating ? "Processing & Crediting Stock…" : "Confirm Goods Receipt (GRN)"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ReceiptsTab = ({ initialPoId }) => {
  const { data, isLoading } = useGetAllGRNQuery();
  const [showModal, setShowModal] = useState(Boolean(initialPoId));

  const receipts = data?.grns || data?.data || (Array.isArray(data) ? data : []);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
            <PackageCheck className="text-emerald-600" size={18} />
            Goods Receipt Notes (GRN)
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Record physical material arriving from vendors against approved Purchase Orders.
            Accepted quantity is credited to inventory; damaged quantity is quarantined in damaged stock.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-emerald-900/20 transition-all cursor-pointer"
        >
          <Plus size={15} /> Receive Goods (Create GRN)
        </button>
      </div>

      {isLoading ? (
        <p className="text-sm text-gray-400 py-12 text-center">Loading receipts…</p>
      ) : (
        <div className={card}>
          <table className="w-full text-sm">
            <thead className={thead}>
              <tr>
                <th className={th}>GRN / PO Ref</th>
                <th className={th}>Project / Destination</th>
                <th className={th}>Delivery Routing</th>
                <th className={th}>Materials Received</th>
                <th className={th}>Challan #</th>
                <th className={th}>Vehicle / Driver</th>
                <th className={th}>Received By</th>
                <th className={th}>Date</th>
                <th className={th}>Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {receipts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-gray-400">
                    No goods receipts recorded yet. Click "Receive Goods (Create GRN)" above to receive your first delivery.
                  </td>
                </tr>
              ) : (
                receipts.map((r) => {
                  const isGodown = r.deliveryType === "CENTRAL_GODOWN";
                  const itemsList = r.items || [];
                  return (
                    <tr key={r._id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-4 py-3 font-semibold text-gray-900">
                        <div>{r.poNumber || `GRN-${r._id.slice(-6).toUpperCase()}`}</div>
                        {r.purchaseOrderId?.poNumber && (
                          <div className="text-[11px] text-gray-400">PO: {r.purchaseOrderId.poNumber}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-800">
                        {r.destinationProjectId?.projectName || r.projectId?.projectName || (isGodown ? "Central Godown" : "-")}
                      </td>
                      <td className="px-4 py-3">
                        {isGodown ? (
                          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 whitespace-nowrap">
                            Central Godown
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 whitespace-nowrap">
                            Direct Site
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="space-y-0.5">
                          {itemsList.slice(0, 2).map((it, idx) => (
                            <div key={idx} className="text-xs">
                              <span className="font-medium text-gray-800">{it.itemId?.name || it.name || "Material"}</span>
                              <span className="text-emerald-700 font-semibold ml-1.5">+{it.acceptedQty ?? it.receivedQty}</span>
                              {Number(it.damagedQty || 0) > 0 && (
                                <span className="text-rose-600 font-medium ml-1">({it.damagedQty} dmg)</span>
                              )}
                              <span className="text-gray-400 text-[11px] ml-1">{it.itemId?.unit || ""}</span>
                            </div>
                          ))}
                          {itemsList.length > 2 && (
                            <div className="text-[11px] text-indigo-600 font-semibold">
                              +{itemsList.length - 2} more items
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-700">{r.deliveryChallan || "-"}</td>
                      <td className="px-4 py-3 text-gray-600 text-xs">
                        <div>{r.vehicleNumber || "-"}</div>
                        {r.driverName && <div className="text-gray-400 text-[11px]">{r.driverName}</div>}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{r.receivedBy?.name || "-"}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {r.receivedDate ? new Date(r.receivedDate).toLocaleDateString() : "-"}
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {r.status || "RECEIVED"}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* GRN Creation Modal */}
      <CreateGRNModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        initialPoId={initialPoId}
      />
    </div>
  );
};

/* =========================================================================
   3b. MATERIAL ISSUES TAB (Storekeeper issues to site activity)
   Project Usable Stock (-) -> Issued Buffer (+)
   ========================================================================= */
const IssuesTab = ({ projectId, initialItemId }) => {
  const { data: invData } = useGetInventoryQuery(projectId, { skip: !projectId });
  const { data: issuesData, isLoading: issuesLoading } = useGetProjectIssuesQuery(projectId, { skip: !projectId });
  const [createStockIssue, { isLoading: submitting }] = useCreateStockIssueMutation();

  const [form, setForm] = useState({
    itemId: initialItemId || "",
    quantity: "",
    purpose: "",
    issuedTo: "",
    remarks: "",
  });

  useEffect(() => {
    if (initialItemId) {
      setForm((prev) => ({ ...prev, itemId: initialItemId }));
    }
  }, [initialItemId]);

  const availableItems = (invData?.data || []).filter((i) => Number(i.currentBalance || 0) > 0);
  const selectedItem = availableItems.find((i) => String(i.itemId) === String(form.itemId));
  const recentIssues = issuesData?.data || issuesData || [];

  const handleIssueSubmit = async (e) => {
    e.preventDefault();
    if (!projectId) return toast.error("Select a project first");
    if (!form.itemId || !form.quantity) return toast.error("Select material and enter quantity");
    const qty = Number(form.quantity);
    if (!(qty > 0)) return toast.error("Quantity must be greater than 0");
    if (selectedItem && qty > Number(selectedItem.currentBalance)) {
      return toast.error(`Cannot issue more than available usable stock (${selectedItem.currentBalance})`);
    }

    try {
      await createStockIssue({
        projectId,
        items: [
          {
            itemId: form.itemId,
            qty,
            quantity: qty,
            purpose: form.purpose || "Site activity",
            issuedTo: form.issuedTo || "Site team",
            remarks: form.remarks || "",
          },
        ],
        itemId: form.itemId,
        qty,
        quantity: qty,
        purpose: form.purpose || "Site activity",
        issuedTo: form.issuedTo || "Site team",
        remarks: form.remarks || "",
      }).unwrap();
      toast.success("Material issued to site buffer successfully");
      setForm({ itemId: "", quantity: "", purpose: "", issuedTo: "", remarks: "" });
    } catch (err) {
      toast.error(err?.data?.message || "Failed to issue material");
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs text-blue-800">
        <p className="font-semibold mb-1">Single Business Flow — Material Issue Step:</p>
        <p>
          Storekeeper issues material to site activity or contractor. This debits Usable Stock and credits Issued Buffer.
          When site consumption is reported, it consumes from the Issued Buffer with zero double deduction.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Issue Form */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 md:col-span-1">
          <h3 className="text-base font-semibold text-gray-800 mb-3">Issue Material to Site</h3>
          <form onSubmit={handleIssueSubmit} className="space-y-3">
            <div>
              <label className="text-xs font-medium text-gray-600">Material (from available usable stock)</label>
              <select
                value={form.itemId}
                onChange={(e) => setForm({ ...form, itemId: e.target.value })}
                className={fieldCls}
                required
              >
                <option value="">Select material…</option>
                {availableItems.map((it) => (
                  <option key={it.itemId} value={it.itemId}>
                    {it.name} (Available: {it.currentBalance} {it.unit})
                  </option>
                ))}
              </select>
            </div>

            {selectedItem && (
              <div className="bg-gray-50 border rounded-lg p-2 text-xs text-gray-600">
                <span>Available Usable Stock: </span>
                <span className="font-bold text-emerald-700">{selectedItem.currentBalance} {selectedItem.unit}</span>
              </div>
            )}

            <div>
              <label className="text-xs font-medium text-gray-600">Quantity to Issue</label>
              <input
                type="number"
                min="0.01"
                step="any"
                max={selectedItem?.currentBalance || undefined}
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                className={fieldCls}
                placeholder="Enter quantity"
                required
              />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600">Purpose / Task / Site Activity</label>
              <input
                type="text"
                value={form.purpose}
                onChange={(e) => setForm({ ...form, purpose: e.target.value })}
                className={fieldCls}
                placeholder="e.g. Ground floor slab casting"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600">Issued To (Contractor / Worker / Team)</label>
              <input
                type="text"
                value={form.issuedTo}
                onChange={(e) => setForm({ ...form, issuedTo: e.target.value })}
                className={fieldCls}
                placeholder="e.g. Mason team / Contractor name"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600">Remarks</label>
              <input
                type="text"
                value={form.remarks}
                onChange={(e) => setForm({ ...form, remarks: e.target.value })}
                className={fieldCls}
                placeholder="Optional notes"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-md disabled:opacity-50 transition-all"
            >
              {submitting ? "Issuing…" : "Confirm Issue to Site"}
            </button>
          </form>
        </div>

        {/* Recent Issues List */}
        <div className="md:col-span-2 space-y-3">
          <h3 className="text-base font-semibold text-gray-800">Recent Issues on Project</h3>
          <div className={card}>
            <table className="w-full text-sm">
              <thead className={thead}>
                <tr>
                  <th className={th}>Material</th>
                  <th className={th}>Qty Issued</th>
                  <th className={th}>Purpose / Activity</th>
                  <th className={th}>Issued To</th>
                  <th className={th}>Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {issuesLoading ? (
                  <tr><td colSpan={5} className="p-4 text-center text-gray-400">Loading issues…</td></tr>
                ) : recentIssues.length === 0 ? (
                  <tr><td colSpan={5} className="p-6 text-center text-gray-400">No materials issued on this project yet.</td></tr>
                ) : (
                  recentIssues.map((iss) => (
                    <tr key={iss._id} className="hover:bg-gray-50/60">
                      <td className="px-4 py-3 font-medium text-gray-800">{iss.itemId?.name || "-"}</td>
                      <td className="px-4 py-3 font-bold text-blue-700">+{iss.quantity} <span className="text-xs font-normal text-gray-400">{iss.unit || iss.itemId?.unit}</span></td>
                      <td className="px-4 py-3 text-gray-600">{iss.purpose || "-"}</td>
                      <td className="px-4 py-3 text-gray-600">{iss.issuedTo || "-"}</td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{iss.createdAt ? new Date(iss.createdAt).toLocaleDateString() : "-"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

/* =========================================================================
   3c. RETURNS TAB (Return from Site back to Central Godown)
   Project Usable Stock (-) -> Central Godown Stock (+)
   ========================================================================= */
const ReturnsTab = ({ projectId }) => {
  const { data: invData } = useGetInventoryQuery(projectId, { skip: !projectId });
  const [returnMaterial, { isLoading: returning }] = useReturnMaterialMutation();

  const [form, setForm] = useState({
    itemId: "",
    quantity: "",
    reason: "",
  });

  const availableItems = (invData?.data || []).filter((i) => Number(i.currentBalance || 0) > 0);
  const selectedItem = availableItems.find((i) => String(i.itemId) === String(form.itemId));

  const handleReturnSubmit = async (e) => {
    e.preventDefault();
    if (!projectId) return toast.error("Select a project first");
    if (!form.itemId || !form.quantity) return toast.error("Select material and enter quantity");
    const qty = Number(form.quantity);
    if (!(qty > 0)) return toast.error("Quantity must be positive");
    if (selectedItem && qty > Number(selectedItem.currentBalance)) {
      return toast.error(`Cannot return more than available usable stock (${selectedItem.currentBalance})`);
    }

    try {
      await returnMaterial({
        projectId,
        itemId: form.itemId,
        quantity: qty,
        qty: qty,
        reason: form.reason || "Surplus material returned to central godown",
      }).unwrap();
      toast.success("Material returned and credited to Central Godown successfully");
      setForm({ itemId: "", quantity: "", reason: "" });
    } catch (err) {
      toast.error(err?.data?.message || "Failed to return material");
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 max-w-xl">
      <h3 className="text-base font-semibold text-gray-800 mb-1">Return Surplus Material to Central Godown</h3>
      <p className="text-xs text-gray-500 mb-4">
        Debits project stock and atomically credits Central Godown stock with an immutable Stock Ledger audit entry.
      </p>

      <form onSubmit={handleReturnSubmit} className="space-y-4">
        <div>
          <label className="text-xs font-medium text-gray-600">Material (from available usable stock)</label>
          <select
            value={form.itemId}
            onChange={(e) => setForm({ ...form, itemId: e.target.value })}
            className={fieldCls}
            required
          >
            <option value="">Select material…</option>
            {availableItems.map((it) => (
              <option key={it.itemId} value={it.itemId}>
                {it.name} (Available: {it.currentBalance} {it.unit})
              </option>
            ))}
          </select>
        </div>

        {selectedItem && (
          <div className="bg-gray-50 border rounded-lg p-2.5 text-xs text-gray-600">
            <span>Available Usable Stock to Return: </span>
            <span className="font-bold text-emerald-700">{selectedItem.currentBalance} {selectedItem.unit}</span>
          </div>
        )}

        <div>
          <label className="text-xs font-medium text-gray-600">Quantity to Return</label>
          <input
            type="number"
            min="0.01"
            step="any"
            max={selectedItem?.currentBalance || undefined}
            value={form.quantity}
            onChange={(e) => setForm({ ...form, quantity: e.target.value })}
            className={fieldCls}
            placeholder="Quantity to return"
            required
          />
        </div>

        <div>
          <label className="text-xs font-medium text-gray-600">Reason for Return</label>
          <input
            type="text"
            value={form.reason}
            onChange={(e) => setForm({ ...form, reason: e.target.value })}
            className={fieldCls}
            placeholder="e.g. Excess material after task completion"
            required
          />
        </div>

        <button
          type="submit"
          disabled={returning}
          className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-sm font-semibold shadow-md disabled:opacity-50 transition-all"
        >
          {returning ? "Returning…" : "Return to Central Godown"}
        </button>
      </form>
    </div>
  );
};

/* =========================================================================
   4. STOCK LEDGER TAB (Audit Trail)
   ========================================================================= */
const LedgerTab = ({ projectId, selectedItemId }) => {
  const { data, isLoading } = useGetProjectLedgerQuery({ projectId }, { skip: !projectId });

  if (!projectId) {
    return <p className="text-sm text-gray-400 py-12 text-center">Select a project above to view the stock ledger.</p>;
  }

  if (isLoading) return <p className="text-sm text-gray-400 py-12 text-center">Loading ledger…</p>;

  let items = data?.data || [];
  if (selectedItemId) {
    items = items.filter((l) => String(l.itemId?._id || l.itemId) === String(selectedItemId));
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-500">
          Immutable historical audit trail of every stock increase, decrease, transfer, issue, and adjustment.
        </p>
        {selectedItemId && (
          <span className="text-xs bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-lg font-medium border border-indigo-200">
            Filtered by material
          </span>
        )}
      </div>

      <div className={card}>
        <table className="w-full text-sm">
          <thead className={thead}>
            <tr>
              <th className={th}>Material</th>
              <th className={th}>Movement Type</th>
              <th className={th}>Qty In</th>
              <th className={th}>Qty Out</th>
              <th className={th}>Balance After</th>
              <th className={th}>Remarks</th>
              <th className={th}>Date & Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                  No ledger entries recorded for this project yet.
                </td>
              </tr>
            ) : (
              items.map((l) => (
                <tr key={l._id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-800">{l.itemId?.name || "-"}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                      {l.transactionType || "-"}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-emerald-700">
                    {l.qtyIn ? `+${l.qtyIn}` : "-"}
                  </td>
                  <td className="px-4 py-3 font-semibold text-rose-600">
                    {l.qtyOut ? `-${l.qtyOut}` : "-"}
                  </td>
                  <td className="px-4 py-3 font-bold text-gray-800">{l.balanceQty ?? "-"}</td>
                  <td className="px-4 py-3 text-gray-500 max-w-xs truncate">{l.remarks || "-"}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {l.createdAt ? new Date(l.createdAt).toLocaleString() : "-"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* =========================================================================
   5. DAMAGE / ADJUSTMENTS / OPENING TAB
   ========================================================================= */
const AdjustmentsTab = ({ projectId }) => {
  const [mode, setMode] = useState("opening");
  const { data: itemsResp } = useGetAllItemsQuery();
  const items = itemsResp?.items || itemsResp?.data || [];

  const [form, setForm] = useState({ itemId: "", qty: "", rate: "", date: "", reason: "", adjustmentType: "POSITIVE" });
  const [openingStock, { isLoading: l1 }] = useOpeningStockMutation();
  const [damageInventory, { isLoading: l2 }] = useDamageInventoryMutation();
  const [adjustInventory, { isLoading: l3 }] = useAdjustInventoryMutation();
  const busy = l1 || l2 || l3;

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!projectId) return toast.error("Select a project above first");
    if (!form.itemId) return toast.error("Select a material");
    try {
      if (mode === "opening") {
        if (!form.qty) return toast.error("Quantity is required");
        await openingStock({
          projectId,
          itemId: form.itemId,
          quantity: Number(form.qty),
          rate: form.rate ? Number(form.rate) : undefined,
          date: form.date || undefined,
          remarks: form.reason || "Opening balance",
        }).unwrap();
        toast.success("Opening stock recorded");
      } else if (mode === "damage") {
        if (!form.qty) return toast.error("Quantity is required");
        await damageInventory({
          projectId,
          itemId: form.itemId,
          qty: Number(form.qty),
          reason: form.reason || "Damaged on site",
        }).unwrap();
        toast.success("Damage recorded");
      } else {
        if (!form.qty || !form.reason.trim()) {
          return toast.error("Quantity and adjustment reason are required");
        }
        await adjustInventory({
          projectId,
          itemId: form.itemId,
          qty: Number(form.qty),
          adjustmentType: form.adjustmentType,
          reason: form.reason,
        }).unwrap();
        toast.success("Stock adjustment recorded");
      }
      setForm({ itemId: "", qty: "", rate: "", date: "", reason: "", adjustmentType: "POSITIVE" });
    } catch (err) {
      toast.error(err?.data?.message || "Operation failed");
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm shadow-gray-200/60 p-5 sm:p-6 max-w-xl">
      <div className="flex flex-wrap gap-2 mb-5">
        {[
          { key: "opening", label: "Opening Stock" },
          { key: "damage", label: "Record Damage" },
          { key: "adjustment", label: "Stock Adjustment" },
        ].map((m) => (
          <button
            key={m.key}
            onClick={() => setMode(m.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${mode === m.key
                ? "bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md shadow-indigo-900/20"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {!projectId && <p className="text-sm text-amber-600 mb-4 font-medium">Select a project from the dropdown above first.</p>}

      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="text-xs font-medium text-gray-600">Material</label>
          <select value={form.itemId} onChange={set("itemId")} className={fieldCls}>
            <option value="">Select material…</option>
            {items.map((it) => (
              <option key={it._id} value={it._id}>{it.name} ({it.unit || "unit"})</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-medium text-gray-600">Quantity</label>
          <input type="number" min="0.01" step="any" value={form.qty} onChange={set("qty")} className={fieldCls} />
        </div>

        {mode === "opening" && (
          <>
            <div>
              <label className="text-xs font-medium text-gray-600">Rate per Unit (Optional)</label>
              <input type="number" min="0" step="any" value={form.rate} onChange={set("rate")} className={fieldCls} />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">Date (Defaults to today)</label>
              <input type="date" value={form.date} onChange={set("date")} className={fieldCls} />
            </div>
            <p className="text-xs text-gray-400">
              One-time initial stock entry per material on this site. Use adjustment afterwards to correct balances.
            </p>
          </>
        )}

        {mode === "adjustment" && (
          <div>
            <label className="text-xs font-medium text-gray-600">Adjustment Direction</label>
            <select value={form.adjustmentType} onChange={set("adjustmentType")} className={fieldCls}>
              <option value="POSITIVE">Increase Stock (+)</option>
              <option value="NEGATIVE">Decrease Stock (−)</option>
            </select>
          </div>
        )}

        <div>
          <label className="text-xs font-medium text-gray-600">
            {mode === "opening" ? "Remarks (Optional)" : "Reason " + (mode === "damage" ? "(Optional)" : "(Required)")}
          </label>
          <input
            value={form.reason}
            onChange={set("reason")}
            placeholder={mode === "damage" ? "e.g. Water damage during transit" : "e.g. Physical count reconciliation"}
            className={fieldCls}
          />
        </div>

        <button
          type="submit"
          disabled={busy}
          className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-900/20 disabled:opacity-50 transition-all"
        >
          {busy ? "Saving…" : "Save Record"}
        </button>
      </form>
    </div>
  );
};

/* =========================================================================
   MAIN COMPONENT
   ========================================================================= */
const StockOperations = () => {
  const { role } = CheckRole();
  const [searchParams, setSearchParams] = useSearchParams();

  const tabParam = searchParams.get("tab") || "inventory";
  const [tab, setTab] = useState(tabParam);
  const [selectedItemId, setSelectedItemId] = useState(null);

  const { data: projectResp } = useGetProjectsQuery();
  const projects = projectResp?.data || projectResp || [];

  const [projectId, setProjectId] = useState(
    localStorage.getItem("selectedProjectId") || ""
  );

  // Sync tab with URL search parameter
  useEffect(() => {
    if (tabParam && tabParam !== tab) {
      setTab(tabParam);
    }
  }, [tabParam]);

  const handleTabChange = (newTab) => {
    setTab(newTab);
    setSearchParams({ tab: newTab });
  };

  // Auto-select first project if none is selected
  useEffect(() => {
    if (projects.length > 0 && !projectId) {
      const firstId = projects[0]._id;
      setProjectId(firstId);
      localStorage.setItem("selectedProjectId", firstId);
    }
  }, [projects, projectId]);

  const handleProjectSelect = (e) => {
    const val = e.target.value;
    setProjectId(val);
    localStorage.setItem("selectedProjectId", val);
  };

  const [selectedIssueItemId, setSelectedIssueItemId] = useState(null);

  const handleSelectLedgerItem = (itemId) => {
    setSelectedItemId(itemId);
    handleTabChange("ledger");
  };

  const handleSelectIssueItem = (itemId) => {
    setSelectedIssueItemId(itemId);
    handleTabChange("issues");
  };

  const currentRole = String(role || "").toLowerCase();

  const visibleTabs = React.useMemo(() => {
    if (currentRole === "supervisor") {
      return TABS.filter((t) => ["inventory", "receipts", "issues", "returns"].includes(t.key));
    }
    return TABS;
  }, [currentRole]);

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto min-h-screen pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center text-white shadow-md ${currentRole === "admin"
                ? "bg-gradient-to-br from-purple-600 to-indigo-700 shadow-purple-900/20"
                : "bg-gradient-to-br from-indigo-600 to-blue-600 shadow-indigo-900/20"
              }`}
          >
            <Boxes size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                {currentRole === "admin"
                  ? "Central Stock & Inventory Management"
                  : currentRole === "supervisor"
                    ? "Site Inventory & Goods Receipt"
                    : "Project Stock & Inventory"}
              </h1>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${currentRole === "admin"
                    ? "bg-purple-50 text-purple-700 border-purple-200"
                    : currentRole === "supervisor"
                      ? "bg-teal-50 text-teal-700 border-teal-200"
                      : "bg-blue-50 text-blue-700 border-blue-200"
                  }`}
              >
                {currentRole === "admin"
                  ? "Admin Central View"
                  : currentRole === "supervisor"
                    ? "Site Supervisor"
                    : "Manager Project View"}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {currentRole === "admin"
                ? "Live enterprise inventory, godown stock, inter-project transfers, and complete audit trail."
                : "Live site material balances, delivery receipts, site ledger, and damage records."}
            </p>
          </div>
        </div>

        {/* Global Project / Godown Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-gray-500 flex items-center gap-1">
            <FolderKanban size={13} /> Project:
          </label>
          <select
            value={projectId}
            onChange={handleProjectSelect}
            className="rounded-xl border border-gray-200 bg-white focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none px-3 py-2 text-sm font-medium text-slate-800 shadow-sm"
          >
            {projects.map((p) => (
              <option key={p._id} value={p._id}>
                {p.projectName || p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200 pb-2">
        {visibleTabs.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => handleTabChange(t.key)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${tab === t.key
                  ? "bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md shadow-indigo-900/20"
                  : "text-gray-600 hover:bg-gray-100"
                }`}
            >
              <Icon size={15} /> {t.label}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      {tab === "inventory" && (
        <InventoryTab
          projectId={projectId}
          onSelectLedgerItem={handleSelectLedgerItem}
          onSelectIssueItem={handleSelectIssueItem}
        />
      )}
      {tab === "transfers" && <TransfersTab role={role} projects={projects} />}
      {tab === "receipts" && <ReceiptsTab initialPoId={searchParams.get("poId")} />}
      {tab === "issues" && <IssuesTab projectId={projectId} initialItemId={selectedIssueItemId} />}
      {tab === "returns" && <ReturnsTab projectId={projectId} />}
      {tab === "ledger" && <LedgerTab projectId={projectId} selectedItemId={selectedItemId} />}
      {tab === "adjustments" && <AdjustmentsTab projectId={projectId} />}
    </div>
  );
};

export default StockOperations;
