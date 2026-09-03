import React, { useState } from "react";
import toast from "react-hot-toast";
import ReportTable from "../../components/ReportTable";
import {
    useGetMachineRequestsQuery,
    useCreateMachineRequestMutation,
    useApproveMachineRequestMutation,
    useRejectMachineRequestMutation,
    useAllocateMachineRequestMutation,
    useDispatchMachineRequestMutation,
    useReceiveMachineAtSiteMutation,
    useReleaseMachineRequestMutation,
    useGetProjectsQuery,
    useGetAllMachinesQuery,
} from "../../Reduxe/Api";

const STATUS_COLORS = {
    REQUESTED: "bg-yellow-100 text-yellow-700",
    ADMIN_REVIEW: "bg-yellow-100 text-yellow-700",
    APPROVED: "bg-blue-100 text-blue-700",
    ALLOCATED: "bg-indigo-100 text-indigo-700",
    DISPATCHED: "bg-purple-100 text-purple-700",
    RECEIVED_AT_SITE: "bg-teal-100 text-teal-700",
    ACTIVE: "bg-green-100 text-green-700",
    RELEASED: "bg-gray-100 text-gray-700",
    REJECTED: "bg-red-100 text-red-700",
};

/**
 * NEW PAGE — UI for the backend's Machinery Request workflow
 * (POST /api/machinery/requests, PATCH .../approve|allocate|dispatch|
 * receive|release). Entirely new module with separate timestamps for
 * every movement stage — no frontend existed for it before.
 */
const MachineRequests = () => {
    const [showCreate, setShowCreate] = useState(false);
    const [allocateModal, setAllocateModal] = useState(null);

    const { data, isLoading, refetch } = useGetMachineRequestsQuery({});
    const { data: projectResp } = useGetProjectsQuery();
    const { data: machineResp } = useGetAllMachinesQuery();

    const [createRequest, { isLoading: creating }] = useCreateMachineRequestMutation();
    const [approve] = useApproveMachineRequestMutation();
    const [reject] = useRejectMachineRequestMutation();
    const [allocate, { isLoading: allocating }] = useAllocateMachineRequestMutation();
    const [dispatch] = useDispatchMachineRequestMutation();
    const [receive] = useReceiveMachineAtSiteMutation();
    const [release] = useReleaseMachineRequestMutation();

    const requests = data?.data || [];
    const projects = projectResp?.data || projectResp || [];
    const machines = machineResp?.data || machineResp || [];

    const [form, setForm] = useState({ projectId: "", machineType: "", requiredMachine: "", quantity: 1, requiredFromDate: "", requiredToDate: "", reason: "", priority: "Medium" });

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!form.projectId || !form.machineType || !form.requiredFromDate) return toast.error("Fill required fields");
        try {
            const fd = new FormData();
            Object.entries(form).forEach(([k, v]) => fd.append(k, v));
            await createRequest(fd).unwrap();
            toast.success("Machine request submitted");
            setShowCreate(false);
            setForm({ projectId: "", machineType: "", requiredMachine: "", quantity: 1, requiredFromDate: "", requiredToDate: "", reason: "", priority: "Medium" });
            refetch();
        } catch (err) {
            toast.error(err?.data?.message || "Error creating request");
        }
    };

    const act = async (fn, id, successMsg, extra = {}) => {
        try {
            await fn({ id, ...extra }).unwrap();
            toast.success(successMsg);
            refetch();
        } catch (err) {
            toast.error(err?.data?.message || "Action failed");
        }
    };

    const handleAllocateSubmit = async (e) => {
        e.preventDefault();
        const machineId = new FormData(e.target).get("machineId");
        try {
            await allocate({ id: allocateModal._id, machineId }).unwrap();
            toast.success("Machine allocated");
            setAllocateModal(null);
            refetch();
        } catch (err) {
            toast.error(err?.data?.message || "Error allocating");
        }
    };

    const columns = [
        { header: "Request #", accessor: "requestNumber" },
        { header: "Project", render: (row) => row.projectId?.projectName || "-" },
        { header: "Machine Type", accessor: "machineType" },
        { header: "Machine", render: (row) => row.machineId?.machineNumber || "-" },
        { header: "Required From", render: (row) => new Date(row.requiredFromDate).toLocaleDateString() },
        { header: "Status", render: (row) => (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[row.status] || "bg-gray-100"}`}>{row.status.replaceAll("_", " ")}</span>
        )},
        { header: "Timeline", render: (row) => (
            <div className="text-xs text-gray-500 space-y-0.5">
                {row.approvedAt && <p>Approved: {new Date(row.approvedAt).toLocaleDateString()}</p>}
                {row.dispatchedAt && <p>Dispatched: {new Date(row.dispatchedAt).toLocaleDateString()}</p>}
                {row.receivedAtSite && <p>Received: {new Date(row.receivedAtSite).toLocaleDateString()}</p>}
            </div>
        )},
        { header: "Action", render: (row) => {
            switch (row.status) {
                case "REQUESTED":
                case "ADMIN_REVIEW":
                    return <div className="flex gap-2">
                        <button onClick={() => act(approve, row._id, "Approved")} className="px-2 py-1 bg-green-600 text-white rounded text-xs">Approve</button>
                        <button onClick={() => act(reject, row._id, "Rejected")} className="px-2 py-1 bg-red-600 text-white rounded text-xs">Reject</button>
                    </div>;
                case "APPROVED":
                    return <button onClick={() => setAllocateModal(row)} className="px-2 py-1 bg-blue-600 text-white rounded text-xs">Allocate</button>;
                case "ALLOCATED":
                    return <button onClick={() => act(dispatch, row._id, "Dispatched")} className="px-2 py-1 bg-purple-600 text-white rounded text-xs">Dispatch</button>;
                case "DISPATCHED":
                    return <button onClick={() => act(receive, row._id, "Received at site")} className="px-2 py-1 bg-teal-600 text-white rounded text-xs">Receive</button>;
                case "ACTIVE":
                    return <button onClick={() => act(release, row._id, "Released")} className="px-2 py-1 bg-gray-600 text-white rounded text-xs">Release</button>;
                default:
                    return "-";
            }
        }},
    ];

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-800">Machinery Requests</h1>
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
                    <input type="text" placeholder="Machine Type (e.g. Excavator)" className="border p-2 rounded-lg" value={form.machineType} onChange={(e) => setForm({ ...form, machineType: e.target.value })} required />
                    <input type="text" placeholder="Required Machine Spec" className="border p-2 rounded-lg" value={form.requiredMachine} onChange={(e) => setForm({ ...form, requiredMachine: e.target.value })} />
                    <input type="number" min="1" placeholder="Quantity" className="border p-2 rounded-lg" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Required From</label>
                        <input type="date" className="border p-2 rounded-lg w-full" value={form.requiredFromDate} onChange={(e) => setForm({ ...form, requiredFromDate: e.target.value })} required />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Required To</label>
                        <input type="date" className="border p-2 rounded-lg w-full" value={form.requiredToDate} onChange={(e) => setForm({ ...form, requiredToDate: e.target.value })} />
                    </div>
                    <select className="border p-2 rounded-lg" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                        <option>Low</option><option>Medium</option><option>High</option><option>Urgent</option>
                    </select>
                    <input type="text" placeholder="Reason" className="border p-2 rounded-lg" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} />
                    <button type="submit" disabled={creating} className="md:col-span-2 bg-blue-600 text-white py-2 rounded-lg disabled:opacity-60">
                        {creating ? "Submitting..." : "Submit Request"}
                    </button>
                </form>
            )}

            {isLoading ? <p className="text-center text-gray-500 py-10">Loading...</p> : <ReportTable columns={columns} data={requests} />}

            {allocateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                        <h3 className="text-lg font-bold mb-4">Allocate Machine — {allocateModal.machineType}</h3>
                        <form onSubmit={handleAllocateSubmit} className="space-y-3">
                            <select name="machineId" className="border p-2 rounded-lg w-full" required>
                                <option value="">Select Machine</option>
                                {machines.map((m) => <option key={m._id} value={m._id}>{m.machineNumber} ({m.machineType})</option>)}
                            </select>
                            <div className="flex gap-2 justify-end pt-2">
                                <button type="button" onClick={() => setAllocateModal(null)} className="px-4 py-2 border rounded-lg">Cancel</button>
                                <button type="submit" disabled={allocating} className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-60">
                                    {allocating ? "Saving..." : "Allocate"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MachineRequests;
