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
} from "lucide-react";
import {
  useGetStockTransfersQuery,
  useCreateStockTransferMutation,
  useConfirmTransferReceiptMutation,
  useCancelStockTransferMutation,
  useGetStockReceiptsQuery,
  useGetInventoryQuery,
  useGetProjectLedgerQuery,
  useGetProjectsQuery,
  useGetAllItemsQuery,
  useOpeningStockMutation,
  useDamageInventoryMutation,
  useAdjustInventoryMutation,
} from "../../Reduxe/Api";
import { CheckRole } from "../../helper/CheckRole";
import AuditHistory from "../../components/AuditHistory";

const TABS = [
  { key: "inventory", label: "Inventory", icon: Boxes },
  { key: "transfers", label: "Transfers", icon: ArrowRightLeft },
  { key: "receipts", label: "Goods Receipts (GRN)", icon: PackageCheck },
  { key: "ledger", label: "Stock Ledger", icon: ScrollText },
  { key: "adjustments", label: "Damage / Adjust / Opening", icon: PackagePlus },
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
const InventoryTab = ({ projectId, onSelectLedgerItem }) => {
  const { data, isLoading } = useGetInventoryQuery(projectId, { skip: !projectId });
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMode, setFilterMode] = useState("all"); // all | low | damaged

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
    if (filterMode === "damaged") return Number(it.damaged || 0) > 0;
    if (filterMode === "out") return it.currentBalance <= 0;
    return true;
  });

  const totalItems = rawItems.length;
  const inStockCount = rawItems.filter((i) => i.currentBalance > 10).length;
  const lowStockCount = rawItems.filter((i) => i.currentBalance > 0 && i.currentBalance <= 10).length;
  const damagedCount = rawItems.filter((i) => Number(i.damaged || 0) > 0).length;

  return (
    <div className="space-y-4">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div
          onClick={() => setFilterMode("all")}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
            filterMode === "all" ? "bg-indigo-50/60 border-indigo-200 ring-2 ring-indigo-500/20" : "bg-white border-gray-100"
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
            <CheckCircle2 size={13} /> In Stock (&gt;10)
          </span>
          <span className="text-xl font-bold text-emerald-700">{inStockCount}</span>
        </div>
        <div
          onClick={() => setFilterMode("low")}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
            filterMode === "low" ? "bg-amber-50/60 border-amber-200 ring-2 ring-amber-500/20" : "bg-white border-gray-100"
          }`}
        >
          <span className="text-xs font-medium text-amber-600 block flex items-center gap-1">
            <AlertTriangle size={13} /> Low Stock (&lt;10)
          </span>
          <span className="text-xl font-bold text-amber-700">{lowStockCount}</span>
        </div>
        <div
          onClick={() => setFilterMode("damaged")}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
            filterMode === "damaged" ? "bg-rose-50/60 border-rose-200 ring-2 ring-rose-500/20" : "bg-white border-gray-100"
          }`}
        >
          <span className="text-xs font-medium text-rose-600 block flex items-center gap-1">
            <XCircle size={13} /> Damaged
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
              <th className={th}>Available Stock</th>
              <th className={th}>Damaged</th>
              <th className={th}>Status</th>
              <th className={th}>Ledger</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                  No materials match your search or filter.
                </td>
              </tr>
            ) : (
              filtered.map((it) => {
                const bal = Number(it.currentBalance || 0);
                const isOut = bal <= 0;
                const isLow = bal > 0 && bal < 10;
                return (
                  <tr key={it.itemId} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-800">{it.name}</td>
                    <td className="px-4 py-3 text-gray-600">{it.category || "-"}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900">
                      {bal} <span className="text-xs text-gray-400 font-normal">{it.unit}</span>
                    </td>
                    <td className="px-4 py-3 text-rose-600 font-medium">{it.damaged || 0}</td>
                    <td className="px-4 py-3">
                      {isOut ? (
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
                          Out of Stock
                        </span>
                      ) : isLow ? (
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          Low Stock
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          In Stock
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => onSelectLedgerItem(it.itemId)}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-1"
                      >
                        <ScrollText size={13} /> View Ledger
                      </button>
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
   3. GOODS RECEIPTS (GRN) TAB
   ========================================================================= */
const ReceiptsTab = () => {
  const { data, isLoading } = useGetStockReceiptsQuery({});
  const receipts = data?.data || [];

  if (isLoading) return <p className="text-sm text-gray-400 py-12 text-center">Loading receipts…</p>;

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">
        Goods Receipt Notes (GRN) recorded when material arrives from vendors or inter-site transfers.
        Only accepted usable quantity is credited to inventory.
      </p>

      <div className={card}>
        <table className="w-full text-sm">
          <thead className={thead}>
            <tr>
              <th className={th}>Project</th>
              <th className={th}>Material</th>
              <th className={th}>Received</th>
              <th className={th}>Accepted (Usable)</th>
              <th className={th}>Damaged / Rejected</th>
              <th className={th}>Received By</th>
              <th className={th}>Status</th>
              <th className={th}>Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {receipts.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-gray-400">
                  No goods receipts recorded yet.
                </td>
              </tr>
            ) : (
              receipts.map((r) => (
                <tr key={r._id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-800">{r.projectId?.projectName || "-"}</td>
                  <td className="px-4 py-3 text-gray-700">{r.materialId?.name || "-"}</td>
                  <td className="px-4 py-3 font-semibold text-gray-800">{r.receivedQuantity ?? 0}</td>
                  <td className="px-4 py-3 font-semibold text-emerald-700">+{r.acceptedQuantity ?? 0}</td>
                  <td className="px-4 py-3 text-rose-600 font-medium">
                    {r.damagedQuantity || 0} / {r.rejectedQuantity || 0}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{r.receivedBy?.name || "-"}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        r.verificationStatus === "Verified"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}
                    >
                      {r.verificationStatus || "Verified"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {r.receivedDate ? new Date(r.receivedDate).toLocaleDateString() : "-"}
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
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              mode === m.key
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

  const handleSelectLedgerItem = (itemId) => {
    setSelectedItemId(itemId);
    handleTabChange("ledger");
  };

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto min-h-screen pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-600 flex items-center justify-center text-white shadow-md shadow-indigo-900/20">
            <Boxes size={20} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Inventory & Stock Management</h1>
            <p className="text-xs text-slate-500">Live project balances, inter-site transfers, receiving, and audit ledger.</p>
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
        {TABS.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => handleTabChange(t.key)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                tab === t.key
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
      {tab === "inventory" && <InventoryTab projectId={projectId} onSelectLedgerItem={handleSelectLedgerItem} />}
      {tab === "transfers" && <TransfersTab role={role} projects={projects} />}
      {tab === "receipts" && <ReceiptsTab />}
      {tab === "ledger" && <LedgerTab projectId={projectId} selectedItemId={selectedItemId} />}
      {tab === "adjustments" && <AdjustmentsTab projectId={projectId} />}
    </div>
  );
};

export default StockOperations;
