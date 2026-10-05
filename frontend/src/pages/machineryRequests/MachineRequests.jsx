import React, { useState } from "react";
import { CheckRole } from "../../helper/CheckRole";
import toast from "react-hot-toast";
import ReportTable from "../../components/ReportTable";
import { MachinePage, StatusBadge, REQUEST_STATUS_TONE, KpiCard, btnPrimary, projectLabel, fmtDate } from "../../components/machine/machineUi";
import {
    useGetMachineRequestsQuery,
    useCreateMachineRequestMutation,
    useApproveMachineRequestMutation,
    useRejectMachineRequestMutation,
    useCancelMachineRequestMutation,
    useAllocateMachineRequestMutation,
    useProcureVendorMachineMutation,
    useDispatchMachineRequestMutation,
    useReceiveMachineAtSiteMutation,
    useRejectMachineAtSiteMutation,
    useReleaseMachineRequestMutation,
    useGetProjectsQuery,
    useGetAllMachinesQuery,
    useGetVendorsQuery,
} from "../../Reduxe/Api";

import { getMachinePermissions } from "../../helper/machinePermissions";

const MachineRequests = () => {
    const { role: userRole } = CheckRole();
    const permissions = getMachinePermissions(userRole);

    const [showCreate, setShowCreate] = useState(false);
    const [allocateModal, setAllocateModal] = useState(null);
    const [vendorModal, setVendorModal] = useState(null);
    const [dispatchModal, setDispatchModal] = useState(null);
    const [receiveModal, setReceiveModal] = useState(null);
    const [siteRejectModal, setSiteRejectModal] = useState(null);

    const { data, isLoading, refetch } = useGetMachineRequestsQuery({});
    const { data: projectResp } = useGetProjectsQuery();
    const { data: machineResp } = useGetAllMachinesQuery();
    const { data: vendorResp } = useGetVendorsQuery();

    const [createRequest, { isLoading: creating }] = useCreateMachineRequestMutation();
    const [approve] = useApproveMachineRequestMutation();
    const [reject] = useRejectMachineRequestMutation();
    const [cancelRequest] = useCancelMachineRequestMutation();
    const [allocate, { isLoading: allocating }] = useAllocateMachineRequestMutation();
    const [procureVendor, { isLoading: procuring }] = useProcureVendorMachineMutation();
    const [dispatch, { isLoading: dispatching }] = useDispatchMachineRequestMutation();
    const [receive, { isLoading: receiving }] = useReceiveMachineAtSiteMutation();
    const [siteReject, { isLoading: siteRejecting }] = useRejectMachineAtSiteMutation();
    const [release] = useReleaseMachineRequestMutation();

    const allRequests = data?.data || [];
    const [statusFilter, setStatusFilter] = useState("");
    const requests = statusFilter ? allRequests.filter((r) => r.status === statusFilter) : allRequests;
    const countBy = (...st) => allRequests.filter((r) => st.includes(r.status)).length;

    const projects = projectResp?.data || projectResp?.projects || projectResp || [];
    const rawMachines = machineResp?.machines || machineResp?.data || machineResp || [];
    const availableMachines = Array.isArray(rawMachines)
        ? rawMachines.filter((m) => m.active && !m.isAssigned && ["Available", "In Transit"].includes(m.status))
        : [];
    const vendors = vendorResp?.data || vendorResp?.vendors || vendorResp || [];

    // Create Request Form
    const [form, setForm] = useState({
        projectId: "",
        machineType: "",
        requiredMachine: "",
        quantity: 1,
        requiredFromDate: "",
        requiredToDate: "",
        reason: "",
        priority: "Medium",
    });

    // Vendor Procure Form
    const [vendorForm, setVendorForm] = useState({
        vendorId: "",
        vendorMachineNumber: "",
        rentalRate: "",
        rateType: "PER_DAY",
        contractStart: "",
        contractEnd: "",
        securityDeposit: "",
        transportCost: "",
        operatorProvidedBy: "Vendor",
        vendorRemarks: "",
    });

    // Dispatch Form
    const [dispatchForm, setDispatchForm] = useState({
        expectedSiteArrival: "",
        transportDetails: "",
        driverName: "",
        driverPhone: "",
        vehicleNumber: "",
        remarks: "",
    });

    // Site Inspection / Receive Form
    const [receiveForm, setReceiveForm] = useState({
        openingMeterReading: "",
        fuelLevel: "",
        machineCondition: "Good",
        documentsChecked: true,
        remarks: "",
        arrivalPhotos: [],
    });

    // Site Reject Form
    const [siteRejectForm, setSiteRejectForm] = useState({
        reason: "",
        remarks: "",
    });

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!form.projectId || !form.machineType || !form.requiredFromDate) return toast.error("Fill required fields");
        try {
            const fd = new FormData();
            Object.entries(form).forEach(([k, v]) => fd.append(k, v));
            await createRequest(fd).unwrap();
            toast.success("Machine request submitted");
            setShowCreate(false);
            setForm({
                projectId: "",
                machineType: "",
                requiredMachine: "",
                quantity: 1,
                requiredFromDate: "",
                requiredToDate: "",
                reason: "",
                priority: "Medium",
            });
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
        if (!machineId) return toast.error("Please select a machine");
        try {
            await allocate({ id: allocateModal._id, machineId }).unwrap();
            toast.success("Machine allocated successfully");
            setAllocateModal(null);
            refetch();
        } catch (err) {
            toast.error(err?.data?.message || "Error allocating machine");
        }
    };

    const handleVendorSubmit = async (e) => {
        e.preventDefault();
        if (!vendorForm.vendorId || !vendorForm.vendorMachineNumber || !vendorForm.rentalRate) {
            return toast.error("Please fill vendor, machine number, and rental rate");
        }
        try {
            await procureVendor({ id: vendorModal._id, ...vendorForm }).unwrap();
            toast.success("Vendor machine procured and allocated");
            setVendorModal(null);
            refetch();
        } catch (err) {
            toast.error(err?.data?.message || "Failed to procure vendor machine");
        }
    };

    const handleDispatchSubmit = async (e) => {
        e.preventDefault();
        try {
            await dispatch({ id: dispatchModal._id, ...dispatchForm }).unwrap();
            toast.success("Machine dispatched to site");
            setDispatchModal(null);
            refetch();
        } catch (err) {
            toast.error(err?.data?.message || "Failed to dispatch machine");
        }
    };

    const handleReceiveSubmit = async (e) => {
        e.preventDefault();
        if (receiveForm.openingMeterReading === "" || receiveForm.fuelLevel === "") {
            return toast.error("Opening meter reading and fuel level are required for site inspection");
        }

        const formData = new FormData();
        formData.append("openingMeterReading", receiveForm.openingMeterReading);
        formData.append("fuelLevel", receiveForm.fuelLevel);
        formData.append("machineCondition", receiveForm.machineCondition);
        formData.append("documentsChecked", receiveForm.documentsChecked ? "true" : "false");
        if (receiveForm.remarks) formData.append("remarks", receiveForm.remarks);

        if (receiveForm.arrivalPhotos?.length > 0) {
            Array.from(receiveForm.arrivalPhotos).forEach((file) => {
                formData.append("arrivalPhotos", file);
            });
        }

        try {
            await receive({ id: receiveModal._id, formData }).unwrap();
            toast.success("Machine accepted at site and assignment is active!");
            setReceiveModal(null);
            refetch();
        } catch (err) {
            toast.error(err?.data?.message || "Failed to accept machine at site");
        }
    };

    const handleSiteRejectSubmit = async (e) => {
        e.preventDefault();
        if (!siteRejectForm.reason) return toast.error("A rejection reason is required");
        try {
            await siteReject({ id: siteRejectModal._id, ...siteRejectForm }).unwrap();
            toast.success("Machine arrival rejected at site");
            setSiteRejectModal(null);
            refetch();
        } catch (err) {
            toast.error(err?.data?.message || "Failed to reject machine at site");
        }
    };

    const columns = [
        { header: "Request #", accessor: "requestNumber" },
        { header: "Project", render: (row) => projectLabel(row.projectId) },
        { header: "Machine Type", accessor: "machineType" },
        {
            header: "Allocated Unit",
            render: (row) => (
                <div>
                    <span className="font-semibold text-slate-800">{row.machineId?.machineNumber || row.vendorMachineNumber || "—"}</span>
                    {row.isVendorProcured && (
                        <span className="block text-[11px] text-amber-700 font-medium">Vendor: {row.vendorId?.name || "External"}</span>
                    )}
                </div>
            ),
        },
        { header: "Required From", render: (row) => fmtDate(row.requiredFromDate) },
        {
            header: "Status",
            render: (row) => (
                <div>
                    <StatusBadge status={row.status} map={REQUEST_STATUS_TONE} />
                    {row.status === "SITE_REJECTED" && (
                        <span className="block text-[11px] text-red-600 mt-1 font-medium">
                            Reason: {row.siteRejectionReason}
                        </span>
                    )}
                </div>
            ),
        },
        {
            header: "Timeline",
            render: (row) => (
                <div className="text-xs text-slate-500 space-y-0.5">
                    {row.approvedAt && <p>Approved: {new Date(row.approvedAt).toLocaleDateString()}</p>}
                    {row.dispatchedAt && <p>Dispatched: {new Date(row.dispatchedAt).toLocaleDateString()}</p>}
                    {row.receivedAtSite && <p>Received: {new Date(row.receivedAtSite).toLocaleDateString()}</p>}
                </div>
            ),
        },
        {
            header: "Action",
            render: (row) => {
                switch (row.status) {
                    case "REQUESTED":
                    case "ADMIN_REVIEW":
                        return (
                            <div className="flex flex-wrap gap-1.5">
                                {permissions.canApproveRequest && (
                                    <>
                                        <button
                                            onClick={() => act(approve, row._id, "Request Approved")}
                                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold"
                                        >
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => act(reject, row._id, "Request Rejected")}
                                            className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold"
                                        >
                                            Reject
                                        </button>
                                    </>
                                )}
                                {permissions.canCancelRequest && (
                                    <button
                                        onClick={() => act(cancelRequest, row._id, "Request Cancelled")}
                                        className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-semibold"
                                    >
                                        Cancel
                                    </button>
                                )}
                            </div>
                        );
                    case "APPROVED":
                        return (
                            <div className="flex flex-wrap items-center gap-1.5">
                                {permissions.canAllocateMachine && (
                                    <button
                                        onClick={() => setAllocateModal(row)}
                                        className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold"
                                    >
                                        Allocate Internal
                                    </button>
                                )}
                                {permissions.canProcureVendor && (
                                    <button
                                        onClick={() => {
                                            setVendorForm({
                                                vendorId: "",
                                                vendorMachineNumber: "",
                                                rentalRate: "",
                                                rateType: "PER_DAY",
                                                contractStart: row.requiredFromDate ? row.requiredFromDate.slice(0, 10) : "",
                                                contractEnd: row.requiredToDate ? row.requiredToDate.slice(0, 10) : "",
                                                securityDeposit: "",
                                                transportCost: "",
                                                operatorProvidedBy: "Vendor",
                                                vendorRemarks: "",
                                            });
                                            setVendorModal(row);
                                        }}
                                        className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold"
                                    >
                                        Procure Vendor
                                    </button>
                                )}
                                {permissions.canCancelRequest && (
                                    <button
                                        onClick={() => act(cancelRequest, row._id, "Request Cancelled")}
                                        className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-semibold"
                                    >
                                        Cancel
                                    </button>
                                )}
                                {permissions.isAdmin && (
                                    <span className="text-[11px] font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                                        Approved • Awaiting Manager Allocation
                                    </span>
                                )}
                            </div>
                        );
                    case "ALLOCATED":
                        return (
                            <div className="flex flex-wrap items-center gap-1.5">
                                {permissions.canDispatchMachine && (
                                    <button
                                        onClick={() => {
                                            setDispatchForm({
                                                expectedSiteArrival: "",
                                                transportDetails: "",
                                                driverName: "",
                                                driverPhone: "",
                                                vehicleNumber: "",
                                                remarks: "",
                                            });
                                            setDispatchModal(row);
                                        }}
                                        className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold"
                                    >
                                        Dispatch
                                    </button>
                                )}
                                {permissions.canCancelRequest && (
                                    <button
                                        onClick={() => act(cancelRequest, row._id, "Request Cancelled")}
                                        className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-semibold"
                                    >
                                        Cancel
                                    </button>
                                )}
                                {permissions.isAdmin && (
                                    <span className="text-[11px] font-medium text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                                        Allocated • Awaiting Dispatch
                                    </span>
                                )}
                            </div>
                        );
                    case "DISPATCHED":
                        return (
                            <div className="flex flex-wrap items-center gap-1.5">
                                {permissions.canReceiveAtSite && (
                                    <button
                                        onClick={() => {
                                            setReceiveForm({
                                                openingMeterReading: row.machineId?.currentMeterReading || 0,
                                                fuelLevel: row.machineId?.currentFuelLevel || 0,
                                                machineCondition: "Good",
                                                documentsChecked: true,
                                                remarks: "",
                                                arrivalPhotos: [],
                                            });
                                            setReceiveModal(row);
                                        }}
                                        className="px-2.5 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold"
                                    >
                                        Accept at Site
                                    </button>
                                )}
                                {permissions.canSiteReject && (
                                    <button
                                        onClick={() => {
                                            setSiteRejectForm({ reason: "", remarks: "" });
                                            setSiteRejectModal(row);
                                        }}
                                        className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold"
                                    >
                                        Reject Arrival
                                    </button>
                                )}
                                {permissions.isAdmin && (
                                    <span className="text-[11px] font-medium text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                                        In Transit • Site Inspection Pending
                                    </span>
                                )}
                            </div>
                        );
                    case "ACTIVE":
                        return (
                            <div className="flex items-center gap-1.5">
                                {permissions.canReleaseMachine ? (
                                    <button
                                        onClick={() => act(release, row._id, "Released from site")}
                                        className="px-2.5 py-1 bg-slate-700 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold"
                                    >
                                        Release
                                    </button>
                                ) : (
                                    <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                        Active on Site
                                    </span>
                                )}
                            </div>
                        );
                    default:
                        return <span className="text-slate-400 text-xs">—</span>;
                }
            },
        },
    ];

    return (
        <MachinePage
            title="Machinery Requests"
            subtitle={
                permissions.isAdmin
                    ? "Control & Approval Panel: Review project requirements and issue approvals/rejections"
                    : "Operations Lifecycle: Request → Allocate (Internal/Vendor) → Dispatch → Site Inspection → Active → Release"
            }
            actions={
                permissions.canCreateRequest ? (
                    <button onClick={() => setShowCreate((v) => !v)} className={btnPrimary}>
                        {showCreate ? "Close" : "+ New Request"}
                    </button>
                ) : (
                    <span className="text-xs font-semibold px-3 py-1.5 bg-purple-100 text-purple-800 rounded-lg">
                        Admin Approval & Monitor Mode
                    </span>
                )
            }
        >
            {/* KPI Summary Cards */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <KpiCard
                    label="Awaiting Approval"
                    value={countBy("REQUESTED", "ADMIN_REVIEW")}
                    tone="amber"
                    onClick={() => setStatusFilter("REQUESTED")}
                />
                <KpiCard
                    label="Approved / Allocated"
                    value={countBy("APPROVED", "ALLOCATED")}
                    tone="blue"
                    onClick={() => setStatusFilter("APPROVED")}
                />
                <KpiCard
                    label="In Transit"
                    value={countBy("DISPATCHED")}
                    tone="purple"
                    onClick={() => setStatusFilter("DISPATCHED")}
                />
                <KpiCard
                    label="Active on Site"
                    value={countBy("RECEIVED_AT_SITE", "ACTIVE")}
                    tone="green"
                    onClick={() => setStatusFilter("ACTIVE")}
                />
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap gap-2">
                {[
                    "",
                    "REQUESTED",
                    "ADMIN_REVIEW",
                    "APPROVED",
                    "ALLOCATED",
                    "DISPATCHED",
                    "ACTIVE",
                    "SITE_REJECTED",
                    "RELEASED",
                    "CANCELLED",
                    "REJECTED",
                ].map((st) => (
                    <button
                        key={st || "all"}
                        onClick={() => setStatusFilter(st)}
                        className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset transition ${
                            statusFilter === st
                                ? "bg-blue-600 text-white ring-blue-600"
                                : "bg-white text-slate-600 ring-slate-200 hover:bg-slate-50"
                        }`}
                    >
                        {st ? st.replaceAll("_", " ") : "All Requests"}
                    </button>
                ))}
            </div>

            {/* New Machine Request Drawer Form */}
            {showCreate && (
                <form onSubmit={handleCreate} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <h3 className="text-lg font-bold text-slate-900">Create Machinery Site Request</h3>
                        <p className="text-xs text-slate-500">Submit equipment requirements for site deployment.</p>
                    </div>

                    <div>
                        <label className="text-xs font-semibold text-slate-600">Project Site *</label>
                        <select
                            className="mt-1 w-full border border-slate-300 p-2.5 rounded-xl text-sm"
                            value={form.projectId}
                            onChange={(e) => setForm({ ...form, projectId: e.target.value })}
                            required
                        >
                            <option value="">Select Project Site</option>
                            {projects?.map((p) => (
                                <option key={p._id} value={p._id}>
                                    {p.name || p.projectName} {p.code ? `(${p.code})` : ""}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="text-xs font-semibold text-slate-600">Machine Type *</label>
                        <input
                            type="text"
                            placeholder="e.g. Excavator, Crane, Roller, Backhoe"
                            className="mt-1 w-full border border-slate-300 p-2.5 rounded-xl text-sm"
                            value={form.machineType}
                            onChange={(e) => setForm({ ...form, machineType: e.target.value })}
                            required
                        />
                    </div>

                    <div>
                        <label className="text-xs font-semibold text-slate-600">Required Machine Specs</label>
                        <input
                            type="text"
                            placeholder="e.g. 20 Ton, Long Boom, Rock Breaker Attachment"
                            className="mt-1 w-full border border-slate-300 p-2.5 rounded-xl text-sm"
                            value={form.requiredMachine}
                            onChange={(e) => setForm({ ...form, requiredMachine: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="text-xs font-semibold text-slate-600">Priority</label>
                        <select
                            className="mt-1 w-full border border-slate-300 p-2.5 rounded-xl text-sm"
                            value={form.priority}
                            onChange={(e) => setForm({ ...form, priority: e.target.value })}
                        >
                            <option>Low</option>
                            <option>Medium</option>
                            <option>High</option>
                            <option>Urgent</option>
                        </select>
                    </div>

                    <div>
                        <label className="text-xs font-semibold text-slate-600">Required From Date *</label>
                        <input
                            type="date"
                            className="mt-1 border border-slate-300 p-2.5 rounded-xl w-full text-sm"
                            value={form.requiredFromDate}
                            onChange={(e) => setForm({ ...form, requiredFromDate: e.target.value })}
                            required
                        />
                    </div>

                    <div>
                        <label className="text-xs font-semibold text-slate-600">Required Till Date</label>
                        <input
                            type="date"
                            className="mt-1 border border-slate-300 p-2.5 rounded-xl w-full text-sm"
                            value={form.requiredToDate}
                            onChange={(e) => setForm({ ...form, requiredToDate: e.target.value })}
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="text-xs font-semibold text-slate-600">Operational Purpose / Reason</label>
                        <input
                            type="text"
                            placeholder="e.g. Deep foundation trenching, pile cap excavation"
                            className="mt-1 border border-slate-300 p-2.5 rounded-xl w-full text-sm"
                            value={form.reason}
                            onChange={(e) => setForm({ ...form, reason: e.target.value })}
                        />
                    </div>

                    <div className="md:col-span-2 flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => setShowCreate(false)}
                            className="px-5 py-2.5 border border-slate-300 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={creating}
                            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-sm disabled:opacity-60"
                        >
                            {creating ? "Submitting..." : "Submit Request"}
                        </button>
                    </div>
                </form>
            )}

            {/* Requests Table */}
            {isLoading ? (
                <div className="py-12 text-center text-slate-500 font-medium">Loading requests...</div>
            ) : (
                <ReportTable columns={columns} data={requests} />
            )}

            {/* Modal 1: Internal Machine Allocation Modal */}
            {allocateModal && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6">
                        <h3 className="text-lg font-bold text-slate-900 mb-1">
                            Allocate Internal Unit — {allocateModal.machineType}
                        </h3>
                        <p className="text-xs text-slate-500 mb-4">
                            Select an available machine with valid compliance documents and no scheduling overlaps.
                        </p>
                        <form onSubmit={handleAllocateSubmit} className="space-y-4">
                            <div>
                                <label className="text-xs font-semibold text-slate-600">Select Available Unit</label>
                                <select name="machineId" className="mt-1 border border-slate-300 p-2.5 rounded-xl w-full text-sm" required>
                                    <option value="">Select from Available Machines</option>
                                    {availableMachines.map((m) => (
                                        <option key={m._id} value={m._id}>
                                            {m.machineNumber} • {m.brand} {m.model} ({m.machineType})
                                        </option>
                                    ))}
                                </select>
                                {availableMachines.length === 0 && (
                                    <p className="text-xs text-amber-600 mt-1 font-medium">
                                        No internal machines currently available. Consider procuring from an external vendor.
                                    </p>
                                )}
                            </div>

                            <div className="flex gap-2 justify-end pt-3">
                                <button
                                    type="button"
                                    onClick={() => setAllocateModal(null)}
                                    className="px-4 py-2 border border-slate-300 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={allocating || availableMachines.length === 0}
                                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-sm disabled:opacity-50"
                                >
                                    {allocating ? "Allocating..." : "Confirm Allocation"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal 2: Vendor Machine Procurement Modal */}
            {vendorModal && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="text-lg font-bold text-slate-900">Procure from Rental Vendor</h3>
                            <button onClick={() => setVendorModal(null)} className="text-slate-400 hover:text-slate-600 text-lg">✕</button>
                        </div>
                        <p className="text-xs text-slate-500 mb-4">
                            Deploy a rented equipment directly against request #{vendorModal.requestNumber}.
                        </p>

                        <form onSubmit={handleVendorSubmit} className="space-y-3 text-left">
                            <div>
                                <label className="text-xs font-semibold text-slate-600">Equipment Vendor *</label>
                                <select
                                    required
                                    value={vendorForm.vendorId}
                                    onChange={(e) => setVendorForm({ ...vendorForm, vendorId: e.target.value })}
                                    className="mt-1 w-full border border-slate-300 p-2.5 rounded-xl text-sm"
                                >
                                    <option value="">Select Vendor</option>
                                    {vendors.map((v) => (
                                        <option key={v._id} value={v._id}>
                                            {v.name} {v.contactPerson ? `(${v.contactPerson})` : ""}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-semibold text-slate-600">Vendor Machine / Reg. No. *</label>
                                    <input
                                        required
                                        value={vendorForm.vendorMachineNumber}
                                        onChange={(e) => setVendorForm({ ...vendorForm, vendorMachineNumber: e.target.value })}
                                        placeholder="e.g. MH14-EX-9988"
                                        className="mt-1 w-full border border-slate-300 p-2.5 rounded-xl text-sm font-mono"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-600">Rate Billing Type</label>
                                    <select
                                        value={vendorForm.rateType}
                                        onChange={(e) => setVendorForm({ ...vendorForm, rateType: e.target.value })}
                                        className="mt-1 w-full border border-slate-300 p-2.5 rounded-xl text-sm"
                                    >
                                        <option value="PER_HOUR">Per Hour</option>
                                        <option value="PER_DAY">Per Day</option>
                                        <option value="PER_MONTH">Per Month</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-semibold text-slate-600">Rental Rate (₹) *</label>
                                    <input
                                        type="number"
                                        required
                                        value={vendorForm.rentalRate}
                                        onChange={(e) => setVendorForm({ ...vendorForm, rentalRate: e.target.value })}
                                        placeholder="Rate amount"
                                        className="mt-1 w-full border border-slate-300 p-2.5 rounded-xl text-sm font-mono"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-600">Transport Cost (₹)</label>
                                    <input
                                        type="number"
                                        value={vendorForm.transportCost}
                                        onChange={(e) => setVendorForm({ ...vendorForm, transportCost: e.target.value })}
                                        placeholder="Mobilization cost"
                                        className="mt-1 w-full border border-slate-300 p-2.5 rounded-xl text-sm font-mono"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-semibold text-slate-600">Contract Start</label>
                                    <input
                                        type="date"
                                        value={vendorForm.contractStart}
                                        onChange={(e) => setVendorForm({ ...vendorForm, contractStart: e.target.value })}
                                        className="mt-1 w-full border border-slate-300 p-2.5 rounded-xl text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-600">Contract End</label>
                                    <input
                                        type="date"
                                        value={vendorForm.contractEnd}
                                        onChange={(e) => setVendorForm({ ...vendorForm, contractEnd: e.target.value })}
                                        className="mt-1 w-full border border-slate-300 p-2.5 rounded-xl text-sm"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-slate-600">Operator Provided By</label>
                                <select
                                    value={vendorForm.operatorProvidedBy}
                                    onChange={(e) => setVendorForm({ ...vendorForm, operatorProvidedBy: e.target.value })}
                                    className="mt-1 w-full border border-slate-300 p-2.5 rounded-xl text-sm"
                                >
                                    <option value="Vendor">Vendor Provides Operator</option>
                                    <option value="Company">Company Assigns Own Operator</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-slate-600">Vendor Terms / Remarks</label>
                                <input
                                    value={vendorForm.vendorRemarks}
                                    onChange={(e) => setVendorForm({ ...vendorForm, vendorRemarks: e.target.value })}
                                    placeholder="Diesel terms, maintenance clauses..."
                                    className="mt-1 w-full border border-slate-300 p-2.5 rounded-xl text-sm"
                                />
                            </div>

                            <div className="flex gap-2 justify-end pt-3">
                                <button
                                    type="button"
                                    onClick={() => setVendorModal(null)}
                                    className="px-4 py-2 border border-slate-300 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={procuring}
                                    className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold rounded-xl shadow-sm disabled:opacity-50"
                                >
                                    {procuring ? "Procuring..." : "Procure & Allocate"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal 3: Dispatch Modal */}
            {dispatchModal && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6">
                        <h3 className="text-lg font-bold text-slate-900 mb-1">Dispatch Machine to Site</h3>
                        <p className="text-xs text-slate-500 mb-4">
                            Record carrier and driver info for transit tracking.
                        </p>
                        <form onSubmit={handleDispatchSubmit} className="space-y-3 text-left">
                            <div>
                                <label className="text-xs font-semibold text-slate-600">Expected Site Arrival Date</label>
                                <input
                                    type="date"
                                    value={dispatchForm.expectedSiteArrival}
                                    onChange={(e) => setDispatchForm({ ...dispatchForm, expectedSiteArrival: e.target.value })}
                                    className="mt-1 w-full border border-slate-300 p-2.5 rounded-xl text-sm"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-semibold text-slate-600">Trailer / Vehicle No.</label>
                                    <input
                                        value={dispatchForm.vehicleNumber}
                                        onChange={(e) => setDispatchForm({ ...dispatchForm, vehicleNumber: e.target.value })}
                                        placeholder="e.g. MH-12-TR-1122"
                                        className="mt-1 w-full border border-slate-300 p-2.5 rounded-xl text-sm font-mono"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-600">Carrier / Logistics</label>
                                    <input
                                        value={dispatchForm.transportDetails}
                                        onChange={(e) => setDispatchForm({ ...dispatchForm, transportDetails: e.target.value })}
                                        placeholder="e.g. Quick Haulers"
                                        className="mt-1 w-full border border-slate-300 p-2.5 rounded-xl text-sm"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-semibold text-slate-600">Driver Name</label>
                                    <input
                                        value={dispatchForm.driverName}
                                        onChange={(e) => setDispatchForm({ ...dispatchForm, driverName: e.target.value })}
                                        placeholder="Driver full name"
                                        className="mt-1 w-full border border-slate-300 p-2.5 rounded-xl text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-600">Driver Phone</label>
                                    <input
                                        value={dispatchForm.driverPhone}
                                        onChange={(e) => setDispatchForm({ ...dispatchForm, driverPhone: e.target.value })}
                                        placeholder="Phone number"
                                        className="mt-1 w-full border border-slate-300 p-2.5 rounded-xl text-sm"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-600">Dispatch Remarks</label>
                                <input
                                    value={dispatchForm.remarks}
                                    onChange={(e) => setDispatchForm({ ...dispatchForm, remarks: e.target.value })}
                                    placeholder="Dispatch instructions or notes..."
                                    className="mt-1 w-full border border-slate-300 p-2.5 rounded-xl text-sm"
                                />
                            </div>

                            <div className="flex gap-2 justify-end pt-3">
                                <button
                                    type="button"
                                    onClick={() => setDispatchModal(null)}
                                    className="px-4 py-2 border border-slate-300 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={dispatching}
                                    className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-xl shadow-sm disabled:opacity-50"
                                >
                                    {dispatching ? "Dispatching..." : "Confirm Dispatch"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal 4: Site Arrival Inspection / Acceptance Modal */}
            {receiveModal && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-lg font-bold text-slate-900">Site Inspection & Acceptance</h3>
                            <button onClick={() => setReceiveModal(null)} className="text-slate-400 hover:text-slate-600 text-lg">✕</button>
                        </div>
                        <p className="text-xs text-slate-500 mb-4">
                            Inspect arrival condition, verify physical meter reading and fuel before activating deployment.
                        </p>

                        <form onSubmit={handleReceiveSubmit} className="space-y-4 text-left">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-semibold text-slate-600">Opening Meter Reading (hrs) *</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        required
                                        value={receiveForm.openingMeterReading}
                                        onChange={(e) => setReceiveForm({ ...receiveForm, openingMeterReading: e.target.value })}
                                        className="mt-1 w-full border border-slate-300 p-2.5 rounded-xl text-sm font-mono"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-600">Arrival Fuel Level (L) *</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        required
                                        value={receiveForm.fuelLevel}
                                        onChange={(e) => setReceiveForm({ ...receiveForm, fuelLevel: e.target.value })}
                                        className="mt-1 w-full border border-slate-300 p-2.5 rounded-xl text-sm font-mono"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-semibold text-slate-600">Physical Condition</label>
                                    <select
                                        value={receiveForm.machineCondition}
                                        onChange={(e) => setReceiveForm({ ...receiveForm, machineCondition: e.target.value })}
                                        className="mt-1 w-full border border-slate-300 p-2.5 rounded-xl text-sm"
                                    >
                                        <option value="Good">Good / Working</option>
                                        <option value="Satisfactory">Satisfactory</option>
                                        <option value="Minor Damage">Minor Cosmetic Damage</option>
                                        <option value="Poor">Poor / Needs Attention</option>
                                    </select>
                                </div>
                                <div className="flex items-center pt-6">
                                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={receiveForm.documentsChecked}
                                            onChange={(e) => setReceiveForm({ ...receiveForm, documentsChecked: e.target.checked })}
                                            className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500"
                                        />
                                        RC & Insurance Verified
                                    </label>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-slate-600">Arrival Inspection Photos (optional)</label>
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={(e) => setReceiveForm({ ...receiveForm, arrivalPhotos: e.target.files })}
                                    className="mt-1 w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-slate-600">Inspection Remarks</label>
                                <input
                                    value={receiveForm.remarks}
                                    onChange={(e) => setReceiveForm({ ...receiveForm, remarks: e.target.value })}
                                    placeholder="Arrival checklist notes..."
                                    className="mt-1 w-full border border-slate-300 p-2.5 rounded-xl text-sm"
                                />
                            </div>

                            <div className="flex gap-2 justify-end pt-3">
                                <button
                                    type="button"
                                    onClick={() => setReceiveModal(null)}
                                    className="px-4 py-2 border border-slate-300 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={receiving}
                                    className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-xl shadow-sm disabled:opacity-50"
                                >
                                    {receiving ? "Accepting..." : "Accept Machine at Site"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal 5: Site Rejection Modal */}
            {siteRejectModal && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6">
                        <h3 className="text-lg font-bold text-slate-900 mb-1">Reject Machine Arrival</h3>
                        <p className="text-xs text-slate-500 mb-4">
                            Reject the delivery if machine is damaged, mechanical breakdown occurred in transit, or spec is incorrect.
                        </p>
                        <form onSubmit={handleSiteRejectSubmit} className="space-y-4 text-left">
                            <div>
                                <label className="text-xs font-semibold text-slate-600">Rejection Reason *</label>
                                <select
                                    required
                                    value={siteRejectForm.reason}
                                    onChange={(e) => setSiteRejectForm({ ...siteRejectForm, reason: e.target.value })}
                                    className="mt-1 w-full border border-slate-300 p-2.5 rounded-xl text-sm"
                                >
                                    <option value="">Select Rejection Reason</option>
                                    <option value="Severe transit damage detected">Severe transit damage detected</option>
                                    <option value="Mechanical breakdown / won't start">Mechanical breakdown / won't start</option>
                                    <option value="Incorrect machine specification / tonnage">Incorrect machine specification / tonnage</option>
                                    <option value="Missing mandatory safety documents / certificates">Missing mandatory safety documents / certificates</option>
                                    <option value="Other">Other Reason</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-slate-600">Detailed Remarks</label>
                                <textarea
                                    rows="3"
                                    value={siteRejectForm.remarks}
                                    onChange={(e) => setSiteRejectForm({ ...siteRejectForm, remarks: e.target.value })}
                                    placeholder="Explain observations and photos sent to head office..."
                                    className="mt-1 w-full border border-slate-300 p-2.5 rounded-xl text-sm"
                                />
                            </div>

                            <div className="flex gap-2 justify-end pt-3">
                                <button
                                    type="button"
                                    onClick={() => setSiteRejectModal(null)}
                                    className="px-4 py-2 border border-slate-300 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={siteRejecting}
                                    className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold rounded-xl shadow-sm disabled:opacity-50"
                                >
                                    {siteRejecting ? "Rejecting..." : "Confirm Rejection"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </MachinePage>
    );
};

export default MachineRequests;
