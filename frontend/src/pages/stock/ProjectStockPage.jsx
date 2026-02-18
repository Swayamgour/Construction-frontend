import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
    useGetProjectStockQuery,
    useReceiveMaterialMutation,
    useUseMaterialMutation,
    useTransferMaterialMutation,
    useReturnMaterialMutation,
} from "../../../src/Reduxe/Api";
import Modal from "../../components/Modal";

const ProjectStockPage = () => {
    const { projectId } = useParams();
    const navigate = useNavigate();

    const { data: stock = [], isLoading, isError } = useGetProjectStockQuery(projectId);

    const [receiveModalOpen, setReceiveModalOpen] = useState(false);
    const [useModalOpen, setUseModalOpen] = useState(false);
    const [transferModalOpen, setTransferModalOpen] = useState(false);
    const [returnModalOpen, setReturnModalOpen] = useState(false);

    const [selectedItem, setSelectedItem] = useState(null);

    const [receiveMaterial] = useReceiveMaterialMutation();
    const [Material] = useUseMaterialMutation();
    const [transferMaterial] = useTransferMaterialMutation();
    const [returnMaterial] = useReturnMaterialMutation();

    const [form, setForm] = useState({
        qty: "",
        toProjectId: "",
        reason: "",
    });

    const handleOpen = (type, item) => {
        setSelectedItem(item);
        setForm({ qty: "", toProjectId: "", reason: "" });
        if (type === "receive") setReceiveModalOpen(true);
        if (type === "use") setUseModalOpen(true);
        if (type === "transfer") setTransferModalOpen(true);
        if (type === "return") setReturnModalOpen(true);
    };

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleReceiveSubmit = async () => {
        if (!form.qty) return;
        await receiveMaterial({
            projectId,
            itemId: selectedItem.itemId._id,
            qty: Number(form.qty),
            unit: selectedItem.itemId.unit,
            reason: form.reason,
        });
        setReceiveModalOpen(false);
    };

    const handleUseSubmit = async () => {
        if (!form.qty) return;
        await Material({
            projectId,
            itemId: selectedItem.itemId._id,
            qty: Number(form.qty),
            unit: selectedItem.itemId.unit,
            reason: form.reason,
        });
        setUseModalOpen(false);
    };

    const handleTransferSubmit = async () => {
        if (!form.qty || !form.toProjectId) return;
        await transferMaterial({
            fromProjectId: projectId,
            toProjectId: form.toProjectId,
            itemId: selectedItem.itemId._id,
            qty: Number(form.qty),
            unit: selectedItem.itemId.unit,
            reason: form.reason,
        });
        setTransferModalOpen(false);
    };

    const handleReturnSubmit = async () => {
        if (!form.qty) return;
        await returnMaterial({
            projectId,
            itemId: selectedItem.itemId._id,
            qty: Number(form.qty),
            unit: selectedItem.itemId.unit,
            reason: form.reason,
        });
        setReturnModalOpen(false);
    };

    return (
        <div className="space-y-4">
            {/* Top Bar */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold mb-1">Project Stock</h2>
                    <p className="text-sm text-slate-500">
                        Project ID: <span className="font-mono">{projectId}</span>
                    </p>
                </div>
                <button
                    onClick={() => navigate(`/stock/transactions/${projectId}`)}
                    className="px-3 py-2 text-sm rounded-lg bg-slate-900 text-white hover:bg-slate-800"
                >
                    View Transactions
                </button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow border border-slate-100">
                <div className="p-3 border-b border-slate-100 flex justify-between items-center">
                    <span className="font-medium text-sm">Current Stock</span>
                </div>

                {isLoading && (
                    <div className="p-4 text-sm text-slate-500">Loading stock...</div>
                )}
                {isError && (
                    <div className="p-4 text-sm text-red-500">
                        Error loading stock. Check console / backend.
                    </div>
                )}

                {!isLoading && stock.length === 0 && (
                    <div className="p-4 text-sm text-slate-500">No stock found.</div>
                )}

                {!isLoading && stock.length > 0 && (
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr className="bg-slate-50 text-slate-600">
                                <th className="text-left px-4 py-2">Item</th>
                                <th className="text-left px-4 py-2">Unit</th>
                                <th className="text-right px-4 py-2">Qty</th>
                                <th className="text-right px-4 py-2">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stock.map((row) => (
                                <tr key={row._id} className="border-t border-slate-100">
                                    <td className="px-4 py-2">
                                        {row?.itemId?.name || "—"}
                                    </td>
                                    <td className="px-4 py-2">
                                        {row?.itemId?.unit || row.unit || "—"}
                                    </td>
                                    <td className="px-4 py-2 text-right font-mono">
                                        {row.qty}
                                    </td>
                                    <td className="px-4 py-2">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                className="px-2 py-1 text-xs rounded bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                                                onClick={() => handleOpen("receive", row)}
                                            >
                                                Receive
                                            </button>
                                            <button
                                                className="px-2 py-1 text-xs rounded bg-sky-100 text-sky-700 hover:bg-sky-200"
                                                onClick={() => handleOpen("use", row)}
                                            >
                                                Use
                                            </button>
                                            <button
                                                className="px-2 py-1 text-xs rounded bg-amber-100 text-amber-700 hover:bg-amber-200"
                                                onClick={() => handleOpen("transfer", row)}
                                            >
                                                Transfer
                                            </button>
                                            <button
                                                className="px-2 py-1 text-xs rounded bg-rose-100 text-rose-700 hover:bg-rose-200"
                                                onClick={() => handleOpen("return", row)}
                                            >
                                                Return
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Receive Modal */}
            <Modal
                open={receiveModalOpen}
                title={`Receive – ${selectedItem?.itemId?.name || ""}`}
                onClose={() => setReceiveModalOpen(false)}
            >
                <div className="space-y-2">
                    <input
                        type="number"
                        name="qty"
                        value={form.qty}
                        onChange={handleChange}
                        placeholder="Quantity"
                        className="w-full border rounded-lg px-3 py-2 text-sm"
                    />
                    <input
                        type="text"
                        name="reason"
                        value={form.reason}
                        onChange={handleChange}
                        placeholder="Reason (optional)"
                        className="w-full border rounded-lg px-3 py-2 text-sm"
                    />
                    <button
                        onClick={handleReceiveSubmit}
                        className="w-full mt-2 px-3 py-2 rounded-lg bg-emerald-600 text-white text-sm hover:bg-emerald-700"
                    >
                        Save
                    </button>
                </div>
            </Modal>

            {/* Use Modal */}
            <Modal
                open={useModalOpen}
                title={`Use – ${selectedItem?.itemId?.name || ""}`}
                onClose={() => setUseModalOpen(false)}
            >
                <div className="space-y-2">
                    <input
                        type="number"
                        name="qty"
                        value={form.qty}
                        onChange={handleChange}
                        placeholder="Quantity"
                        className="w-full border rounded-lg px-3 py-2 text-sm"
                    />
                    <input
                        type="text"
                        name="reason"
                        value={form.reason}
                        onChange={handleChange}
                        placeholder="Purpose / Work (optional)"
                        className="w-full border rounded-lg px-3 py-2 text-sm"
                    />
                    <button
                        onClick={handleUseSubmit}
                        className="w-full mt-2 px-3 py-2 rounded-lg bg-sky-600 text-white text-sm hover:bg-sky-700"
                    >
                        Save
                    </button>
                </div>
            </Modal>

            {/* Transfer Modal */}
            <Modal
                open={transferModalOpen}
                title={`Transfer – ${selectedItem?.itemId?.name || ""}`}
                onClose={() => setTransferModalOpen(false)}
            >
                <div className="space-y-2">
                    <input
                        type="number"
                        name="qty"
                        value={form.qty}
                        onChange={handleChange}
                        placeholder="Quantity"
                        className="w-full border rounded-lg px-3 py-2 text-sm"
                    />
                    <input
                        type="text"
                        name="toProjectId"
                        value={form.toProjectId}
                        onChange={handleChange}
                        placeholder="To Project ID"
                        className="w-full border rounded-lg px-3 py-2 text-sm"
                    />
                    <input
                        type="text"
                        name="reason"
                        value={form.reason}
                        onChange={handleChange}
                        placeholder="Reason (optional)"
                        className="w-full border rounded-lg px-3 py-2 text-sm"
                    />
                    <button
                        onClick={handleTransferSubmit}
                        className="w-full mt-2 px-3 py-2 rounded-lg bg-amber-600 text-white text-sm hover:bg-amber-700"
                    >
                        Save
                    </button>
                </div>
            </Modal>

            {/* Return Modal */}
            <Modal
                open={returnModalOpen}
                title={`Return – ${selectedItem?.itemId?.name || ""}`}
                onClose={() => setReturnModalOpen(false)}
            >
                <div className="space-y-2">
                    <input
                        type="number"
                        name="qty"
                        value={form.qty}
                        onChange={handleChange}
                        placeholder="Quantity"
                        className="w-full border rounded-lg px-3 py-2 text-sm"
                    />
                    <input
                        type="text"
                        name="reason"
                        value={form.reason}
                        onChange={handleChange}
                        placeholder="Reason (optional)"
                        className="w-full border rounded-lg px-3 py-2 text-sm"
                    />
                    <button
                        onClick={handleReturnSubmit}
                        className="w-full mt-2 px-3 py-2 rounded-lg bg-rose-600 text-white text-sm hover:bg-rose-700"
                    >
                        Save
                    </button>
                </div>
            </Modal>
        </div>
    );
};

export default ProjectStockPage;
