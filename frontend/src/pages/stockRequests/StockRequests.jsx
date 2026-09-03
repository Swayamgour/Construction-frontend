import React, { useState } from "react";
import toast from "react-hot-toast";
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

/**
 * NEW PAGE — UI for the backend's Stock Request -> Admin Review ->
 * Transfer/Procurement workflow (POST /api/stock/requests, /transfers,
 * /procurement). This entire module had no frontend before.
 */
const STATUS_COLORS = {
    PENDING_ADMIN_REVIEW: "bg-yellow-100 text-yellow-700",
    APPROVED_TRANSFER: "bg-blue-100 text-blue-700",
    APPROVED_PROCUREMENT: "bg-purple-100 text-purple-700",
    PARTIALLY_FULFILLED: "bg-orange-100 text-orange-700",
    FULFILLED: "bg-green-100 text-green-700",
    REJECTED: "bg-red-100 text-red-700",
    CANCELLED: "bg-gray-100 text-gray-700",
};

const StockRequests = () => {
    const [showCreate, setShowCreate] = useState(false);
    const [fulfilModal, setFulfilModal] = useState(null); // { request, type: "transfer"|"procurement" }

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
    const items = itemResp?.items || itemResp || [];
    console.log(items , projectResp)
    const vendors = vendorResp?.data || vendorResp || [];

    const [form, setForm] = useState({
        projectId: "", materialId: "", quantity: "", unit: "", requiredDate: "",
        priority: "Medium", purpose: "", description: "",
    });
    const [imageFiles, setImageFiles] = useState([]);

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!form.projectId || !form.materialId || !form.quantity || !form.unit || !form.requiredDate) {
            return toast.error("Please fill all required fields");
        }
        try {
            const fd = new FormData();
            Object.entries(form).forEach(([k, v]) => fd.append(k, v));
            imageFiles.forEach((f) => fd.append("images", f));

            await createStockRequest(fd).unwrap();
            toast.success("Stock request submitted");
            setShowCreate(false);
            setForm({ projectId: "", materialId: "", quantity: "", unit: "", requiredDate: "", priority: "Medium", purpose: "", description: "" });
            setImageFiles([]);
            refetch();
        } catch (err) {
            toast.error(err?.data?.message || "Error creating request");
        }
    };

    const handleReject = async (id) => {
        const adminRemarks = window.prompt("Reason for rejection:") || "";
        try {
            await reviewStockRequest({ id, decision: "reject", adminRemarks }).unwrap();
            toast.success("Request rejected");
            refetch();
        } catch (err) {
            toast.error(err?.data?.message || "Error rejecting");
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
                toast.success("Transfer created");
            } else {
                await createProcurement({
                    stockRequestId: fulfilModal.request._id,
                    vendorId: fd.get("vendorId"),
                    quantity: Number(fd.get("quantity")),
                    rate: Number(fd.get("rate")),
                    tax: Number(fd.get("tax") || 0),
                    expectedDeliveryDate: fd.get("expectedDeliveryDate"),
                }).unwrap();
                toast.success("Procurement order created");
            }
            setFulfilModal(null);
            refetch();
        } catch (err) {
            toast.error(err?.data?.message || "Error fulfilling request");
        }
    };

    const columns = [
        { header: "Request #", accessor: "requestNumber" },
        { header: "Project", render: (row) => row.projectId?.projectName || "-" },
        { header: "Material", render: (row) => `${row.materialName} x ${row.quantity} ${row.unit}` },
        { header: "Requested By", render: (row) => `${row.requestedBy?.name || "-"} (${row.requestedByRole})` },
        { header: "Priority", accessor: "priority" },
        {
            header: "Images", render: (row) => row.images?.length ? (
                <div className="flex gap-1">
                    {row.images.slice(0, 3).map((img, i) => (
                        <a key={i} href={img} target="_blank" rel="noreferrer">
                            <img src={img} alt="" className="w-8 h-8 rounded object-cover border" />
                        </a>
                    ))}
                </div>
            ) : "-"
        },
        {
            header: "Status", render: (row) => (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[row.status] || "bg-gray-100"}`}>
                    {row.status.replaceAll("_", " ")}
                </span>
            )
        },
        {
            header: "Action", render: (row) => row.status === "PENDING_ADMIN_REVIEW" ? (
                <div className="flex gap-2 flex-wrap">
                    <button onClick={() => setFulfilModal({ request: row, type: "transfer" })} className="px-2 py-1 bg-blue-600 text-white rounded text-xs">Transfer</button>
                    <button onClick={() => setFulfilModal({ request: row, type: "procurement" })} className="px-2 py-1 bg-purple-600 text-white rounded text-xs">Procure</button>
                    <button onClick={() => handleReject(row._id)} className="px-2 py-1 bg-red-600 text-white rounded text-xs">Reject</button>
                </div>
            ) : "-"
        },
    ];

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-800">Stock Requests</h1>
                <button onClick={() => setShowCreate((v) => !v)} className="px-4 py-2 bg-blue-600 text-white rounded-lg">
                    {showCreate ? "Close" : "+ New Request"}
                </button>
            </div>

            {showCreate && (
                <form onSubmit={handleCreate} className="bg-white rounded-xl shadow p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <select className="border p-2 rounded-lg" value={form.projectId} onChange={(e) => setForm({ ...form, projectId: e.target.value })} required>
                        <option value="">Select Project</option>
                        {projects?.map((p) => <option key={p._id} value={p._id}>{p.projectName}</option>)}
                    </select>

                    <select className="border p-2 rounded-lg" value={form.materialId} onChange={(e) => setForm({ ...form, materialId: e.target.value, unit: items.find(i => i._id === e.target.value)?.unit || "" })} required>
                        <option value="">Select Material</option>
                        {items?.map((it) => <option key={it._id} value={it._id}>{it.name}</option>)}
                    </select>

                    <input type="number" placeholder="Quantity" className="border p-2 rounded-lg" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} required />
                    <input type="text" placeholder="Unit" className="border p-2 rounded-lg" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} required />

                    <input type="date" className="border p-2 rounded-lg" value={form.requiredDate} onChange={(e) => setForm({ ...form, requiredDate: e.target.value })} required />
                    <select className="border p-2 rounded-lg" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                        <option>Low</option><option>Medium</option><option>High</option><option>Urgent</option>
                    </select>

                    <input type="text" placeholder="Purpose" className="border p-2 rounded-lg md:col-span-2" value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })} />
                    <textarea placeholder="Description" className="border p-2 rounded-lg md:col-span-2" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />

                    <div className="md:col-span-2">
                        <label className="block text-sm text-gray-600 mb-1">Site Images (why material is needed)</label>
                        <input type="file" multiple accept="image/*" onChange={(e) => setImageFiles(Array.from(e.target.files))} />
                    </div>

                    <button type="submit" disabled={creating} className="md:col-span-2 bg-blue-600 text-white py-2 rounded-lg disabled:opacity-60">
                        {creating ? "Submitting..." : "Submit Request"}
                    </button>
                </form>
            )}

            {isLoading ? <p className="text-center text-gray-500 py-10">Loading...</p> : <ReportTable columns={columns} data={requests} />}

            {fulfilModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                        <h3 className="text-lg font-bold mb-4 capitalize">{fulfilModal.type} — {fulfilModal.request.materialName}</h3>
                        <form onSubmit={handleFulfilSubmit} className="space-y-3">
                            {fulfilModal.type === "transfer" ? (
                                <select name="sourceProjectId" className="border p-2 rounded-lg w-full" required>
                                    <option value="">Source Project (transfer from)</option>
                                    {projects.filter(p => p._id !== fulfilModal.request.projectId?._id).map((p) => (
                                        <option key={p._id} value={p._id}>{p.projectName}</option>
                                    ))}
                                </select>
                            ) : (
                                <>
                                    <select name="vendorId" className="border p-2 rounded-lg w-full" required>
                                        <option value="">Select Vendor</option>
                                        {vendors.map((v) => <option key={v._id} value={v._id}>{v.companyName}</option>)}
                                    </select>
                                    <input name="rate" type="number" placeholder="Rate per unit" className="border p-2 rounded-lg w-full" required />
                                    <input name="tax" type="number" placeholder="Tax %" className="border p-2 rounded-lg w-full" />
                                    <input name="expectedDeliveryDate" type="date" className="border p-2 rounded-lg w-full" />
                                </>
                            )}
                            <input name="quantity" type="number" placeholder="Quantity" defaultValue={fulfilModal.request.quantity} className="border p-2 rounded-lg w-full" required />
                            {fulfilModal.type === "transfer" && <input name="remarks" type="text" placeholder="Remarks" className="border p-2 rounded-lg w-full" />}

                            <div className="flex gap-2 justify-end pt-2">
                                <button type="button" onClick={() => setFulfilModal(null)} className="px-4 py-2 border rounded-lg">Cancel</button>
                                <button type="submit" disabled={transferring || procuring} className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-60">
                                    {transferring || procuring ? "Saving..." : "Confirm"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StockRequests;
