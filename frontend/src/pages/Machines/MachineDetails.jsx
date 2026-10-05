import { useState, useMemo, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import {
    useGetMachineDetailsQuery,
    useReleaseMachineMutation,
    useTransferMachineMutation,
    useGetProjectsQuery,
    useGetLabourQuery,
    useGetMachineDocumentsQuery,
    useAddMachineDocumentMutation,
    useVerifyMachineDocumentMutation,
    useGetMachineOperatorLogsQuery,
    useLogMachineOperatorDayMutation,
    useApproveOperatorLogMutation,
    useGetFullMaintenanceHistoryQuery,
    useReportMachineMaintenanceMutation,
    useUpdateMaintenanceStatusMutation,
} from "../../Reduxe/Api";
import toast from "react-hot-toast";
import { CheckRole } from "../../helper/CheckRole";
import OperatorAssignmentPanel from "./OperatorAssignmentPanel";
import { MachineNav, StatusBadge, projectLabel } from "../../components/machine/machineUi";
import { getFileUrl, isImageFile, isPdfFile } from "../../utils/fileUrl";

export default function MachineDetails() {
    const { id } = useParams();
    const { role } = CheckRole();
    const canManage = ["admin", "manager"].includes(role);

    const { data, isLoading, refetch } = useGetMachineDetailsQuery(id);
    const [releaseMachine, { isLoading: isReleasing }] = useReleaseMachineMutation();
    const [transferMachine, { isLoading: isTransferring }] = useTransferMachineMutation();
    const { data: projectsData } = useGetProjectsQuery();
    const { data: labourData } = useGetLabourQuery();

    const [activeTab, setActiveTab] = useState("overview");

    // Universal Document Preview Modal State
    const [previewDoc, setPreviewDoc] = useState(null);

    // Close preview on Escape key
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Escape") setPreviewDoc(null);
        };
        if (previewDoc) {
            window.addEventListener("keydown", handleKeyDown);
            return () => window.removeEventListener("keydown", handleKeyDown);
        }
    }, [previewDoc]);

    // Transfer Modal State
    const [showTransferModal, setShowTransferModal] = useState(false);
    const [transferForm, setTransferForm] = useState({
        targetProjectId: "",
        transferDate: new Date().toISOString().slice(0, 10),
        openingMeterReading: "",
        fuelLevel: "",
        transportCost: "",
        transportVendor: "",
        remarks: "",
    });

    // Documents Tab State
    const { data: docsData, refetch: refetchDocs } = useGetMachineDocumentsQuery(id);
    const [addDocument, { isLoading: isUploadingDoc }] = useAddMachineDocumentMutation();
    const [verifyDocument] = useVerifyMachineDocumentMutation();
    const [docForm, setDocForm] = useState({
        type: "RC",
        documentNumber: "",
        issueDate: "",
        expiryDate: "",
        remarks: "",
        file: null,
    });

    // Operator Logs Tab State
    const { data: opLogsData, refetch: refetchOpLogs } = useGetMachineOperatorLogsQuery({ id }, { skip: activeTab !== "operator" });
    const [logOperatorDay, { isLoading: isLoggingDay }] = useLogMachineOperatorDayMutation();
    const [approveOperatorLog] = useApproveOperatorLogMutation();

    const [opForm, setOpForm] = useState({
        date: new Date().toISOString().slice(0, 10),
        operatorId: "",
        projectId: "",
        shift: "Morning",
        workType: "General Site Work",
        checkInTime: "08:00",
        checkOutTime: "17:00",
        openingMeterReading: 0,
        closingMeterReading: 0,
        fuelOpening: 0,
        fuelAdded: 0,
        fuelClosing: 0,
        fuelRate: 95,
        machineHourlyRate: 0,
        remarks: "",
    });

    // Full Maintenance Tab State
    const { data: fullMaintData, refetch: refetchFullMaint } = useGetFullMaintenanceHistoryQuery({ id }, { skip: activeTab !== "full-maintenance" });
    const [reportMaintenance, { isLoading: isReportingMaint }] = useReportMachineMaintenanceMutation();
    const [updateMaintStatus] = useUpdateMaintenanceStatusMutation();
    const [maintForm, setMaintForm] = useState({ issue: "", cost: "", serviceType: "Breakdown Repair" });

    // Populate initial values when machine data loads
    const machine = data?.machine;
    const currentAssignment = data?.activeAssignment || data?.assignments?.find((a) => !a.releaseDate);
    const isCurrentlyAssigned = !!currentAssignment;

    const allLabours = Array.isArray(labourData) ? labourData : labourData?.data || [];
    const operators = useMemo(() => {
        const ops = allLabours.filter((l) => l.category === "Operator");
        return ops.length > 0 ? ops : allLabours;
    }, [allLabours]);

    const projectsList = projectsData?.data || projectsData?.projects || [];

    // Helper to compute document expiry badge & status
    const getExpiryStatus = (expiryDate) => {
        if (!expiryDate) return { label: "No Expiry Date", color: "bg-slate-100 text-slate-600 border-slate-200" };
        const exp = new Date(expiryDate);
        if (isNaN(exp.getTime())) return { label: "No Expiry Date", color: "bg-slate-100 text-slate-600 border-slate-200" };
        const now = new Date();
        const diffDays = Math.ceil((exp - now) / (1000 * 60 * 60 * 24));

        if (diffDays < 0) {
            return {
                label: `Expired (${Math.abs(diffDays)}d ago)`,
                color: "bg-rose-100 text-rose-800 border-rose-200",
                isExpired: true,
            };
        }
        if (diffDays <= 30) {
            return {
                label: `Expiring in ${diffDays}d`,
                color: "bg-amber-100 text-amber-800 border-amber-200",
                isExpiringSoon: true,
            };
        }
        return {
            label: `Valid (Expires ${new Date(expiryDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })})`,
            color: "bg-emerald-100 text-emerald-800 border-emerald-200",
            isValid: true,
        };
    };

    // Primary registered documents attached to the Machine record
    const primaryDocs = useMemo(() => {
        if (!machine) return [];
        const list = [];
        if (machine.photo) {
            list.push({
                _id: "primary-photo",
                type: "Machine Photo",
                documentNumber: machine.machineNumber || "",
                fileUrl: machine.photo,
                isPrimary: true,
                source: "Machine Registration",
                verificationStatus: "VERIFIED",
                remarks: "Primary machine photograph",
                createdAt: machine.createdAt,
            });
        }
        if (machine.rcFile) {
            list.push({
                _id: "primary-rc",
                type: "RC (Registration Certificate)",
                documentNumber: machine.machineNumber || "",
                fileUrl: machine.rcFile,
                expiryDate: machine.rcExpiry,
                isPrimary: true,
                source: "Machine Registration",
                verificationStatus: "VERIFIED",
                remarks: "Primary vehicle registration certificate",
                createdAt: machine.createdAt,
            });
        }
        if (machine.insuranceFile) {
            list.push({
                _id: "primary-insurance",
                type: "Insurance Policy",
                documentNumber: "",
                fileUrl: machine.insuranceFile,
                expiryDate: machine.insuranceExpiry,
                isPrimary: true,
                source: "Machine Registration",
                verificationStatus: "VERIFIED",
                remarks: "Primary insurance coverage document",
                createdAt: machine.createdAt,
            });
        }
        return list;
    }, [machine]);

    // Structured documents from MachineDocument collection
    const structuredDocs = docsData?.data || data?.documents || [];

    // Unified list of all documents uploaded for this machine
    const allDocuments = useMemo(() => {
        return [...primaryDocs, ...structuredDocs];
    }, [primaryDocs, structuredDocs]);

    const rcStatus = getExpiryStatus(machine?.rcExpiry);
    const insuranceStatus = getExpiryStatus(machine?.insuranceExpiry);

    useEffect(() => {
        if (machine) {
            setOpForm((prev) => ({
                ...prev,
                openingMeterReading: machine.currentMeterReading || 0,
                closingMeterReading: machine.currentMeterReading || 0,
                fuelOpening: machine.currentFuelLevel || 0,
                fuelClosing: machine.currentFuelLevel || 0,
                machineHourlyRate: machine.hourlyRate || 0,
                projectId: currentAssignment?.projectId?._id || currentAssignment?.projectId || prev.projectId,
                operatorId: currentAssignment?.operatorId?._id || currentAssignment?.operatorId || prev.operatorId,
            }));

            setTransferForm((prev) => ({
                ...prev,
                openingMeterReading: machine.currentMeterReading || 0,
                fuelLevel: machine.currentFuelLevel || 0,
            }));
        }
    }, [machine, currentAssignment]);

    // Live calculations for Operator Log Form
    const computedHours = Math.max(0, (Number(opForm.closingMeterReading) || 0) - (Number(opForm.openingMeterReading) || 0));
    const computedFuel = Math.max(
        0,
        (Number(opForm.fuelOpening) || 0) + (Number(opForm.fuelAdded) || 0) - (Number(opForm.fuelClosing) || 0)
    );
    const computedFuelCost = computedFuel * (Number(opForm.fuelRate) || 0);
    const computedUsageCost = computedHours * (Number(opForm.machineHourlyRate) || 0);
    const computedDayCost = computedFuelCost + computedUsageCost;

    // Handlers
    const submitDocument = async (e) => {
        e.preventDefault();
        if (!docForm.type || !docForm.file) return toast.error("Document type and file are required");

        const formData = new FormData();
        formData.append("type", docForm.type);
        if (docForm.documentNumber) formData.append("documentNumber", docForm.documentNumber);
        if (docForm.issueDate) formData.append("issueDate", docForm.issueDate);
        if (docForm.expiryDate) formData.append("expiryDate", docForm.expiryDate);
        if (docForm.remarks) formData.append("remarks", docForm.remarks);
        formData.append("file", docForm.file);

        try {
            await addDocument({ id, formData }).unwrap();
            toast.success("Document uploaded successfully");
            setDocForm({
                type: "RC",
                documentNumber: "",
                issueDate: "",
                expiryDate: "",
                remarks: "",
                file: null,
            });
            refetchDocs();
            refetch();
        } catch (err) {
            toast.error(err?.data?.message || "Document upload failed");
        }
    };

    const submitOperatorLog = async (e) => {
        e.preventDefault();
        if (!opForm.operatorId) return toast.error("Please select an operator");
        if (!opForm.projectId) return toast.error("Please select a project");
        if (Number(opForm.closingMeterReading) < Number(opForm.openingMeterReading)) {
            return toast.error("Closing meter reading cannot be lower than opening reading");
        }

        try {
            await logOperatorDay({
                id,
                ...opForm,
                openingMeterReading: Number(opForm.openingMeterReading),
                closingMeterReading: Number(opForm.closingMeterReading),
                fuelOpening: Number(opForm.fuelOpening),
                fuelAdded: Number(opForm.fuelAdded),
                fuelClosing: Number(opForm.fuelClosing),
                fuelRate: Number(opForm.fuelRate),
                machineHourlyRate: Number(opForm.machineHourlyRate),
            }).unwrap();
            toast.success("Daily operator log recorded successfully");
            refetchOpLogs();
            refetch();
        } catch (err) {
            toast.error(err?.data?.message || "Failed to log operator day");
        }
    };

    const submitMaintenanceReport = async (e) => {
        e.preventDefault();
        if (!maintForm.issue) return toast.error("Describe the maintenance issue");

        const formData = new FormData();
        formData.append("issue", maintForm.issue);
        formData.append("serviceType", maintForm.serviceType || "Breakdown Repair");
        if (maintForm.cost) formData.append("cost", maintForm.cost);

        try {
            await reportMaintenance({ id, formData }).unwrap();
            toast.success("Maintenance issue reported successfully");
            setMaintForm({ issue: "", cost: "", serviceType: "Breakdown Repair" });
            refetchFullMaint();
            refetch();
        } catch (err) {
            toast.error(err?.data?.message || "Failed to report maintenance");
        }
    };

    const handleRelease = async () => {
        if (window.confirm("Are you sure you want to release this machine from its current project?")) {
            try {
                await releaseMachine({ machineId: id }).unwrap();
                toast.success("Machine Released Successfully!");
                refetch();
            } catch (error) {
                toast.error(error?.data?.message || "Failed to release machine");
            }
        }
    };

    const handleTransfer = async (e) => {
        e.preventDefault();
        if (!transferForm.targetProjectId) return toast.error("Select target project");

        try {
            await transferMachine({
                machineId: id,
                targetProjectId: transferForm.targetProjectId,
                transferDate: transferForm.transferDate,
                openingMeterReading: Number(transferForm.openingMeterReading) || 0,
                fuelLevel: Number(transferForm.fuelLevel) || 0,
                transportCost: Number(transferForm.transportCost) || 0,
                transportVendor: transferForm.transportVendor,
                notes: transferForm.remarks,
            }).unwrap();

            toast.success("Machine transferred successfully!");
            setShowTransferModal(false);
            refetch();
        } catch (err) {
            toast.error(err?.data?.message || "Transfer failed");
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-slate-600 font-medium">Loading machine details...</p>
                </div>
            </div>
        );
    }

    if (!data || !machine) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center p-8 bg-white rounded-2xl shadow-sm border border-slate-200 max-w-md">
                    <div className="text-amber-500 text-6xl mb-4">⚠️</div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Machine Not Found</h2>
                    <p className="text-slate-600 mb-6">The machine you are looking for does not exist or may have been deleted.</p>
                    <Link to="/machine/list" className="inline-block px-6 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 shadow-sm">
                        Back to Machine List
                    </Link>
                </div>
            </div>
        );
    }

    const { maintenance = [], assignments = [], logs = [], summary = {}, totalMaintenanceCost = 0 } = data;

    const formatDate = (dateString) => {
        if (!dateString) return "—";
        return new Date(dateString).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    return (
        <div className="min-h-screen bg-slate-50/50 py-6 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header Navigation */}
                <MachineNav />

                {/* Machine Header Card */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                        <div className="flex items-center space-x-4">
                            {machine.photo ? (
                                <button
                                    type="button"
                                    onClick={() => setPreviewDoc({
                                        title: `Machine Photo - ${machine.machineNumber}`,
                                        url: getFileUrl(machine.photo),
                                        type: "Machine Photo",
                                    })}
                                    className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-blue-500/40 shadow-md shadow-blue-500/20 group relative cursor-pointer focus:outline-none bg-slate-100 flex-shrink-0"
                                    title="Click to view full photo"
                                >
                                    <img
                                        src={getFileUrl(machine.photo)}
                                        alt={machine.machineNumber}
                                        className="w-full h-full object-cover group-hover:scale-110 transition duration-200"
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition text-white">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    </div>
                                </button>
                            ) : (
                                <div className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-md shadow-blue-500/20 text-white font-bold text-2xl flex-shrink-0">
                                    {(machine.machineNumber || "M").charAt(0).toUpperCase()}
                                </div>
                            )}
                            <div>
                                <div className="flex items-center gap-3">
                                    <h1 className="text-2xl font-bold text-slate-900">{machine.machineNumber}</h1>
                                    <StatusBadge status={machine.status} />
                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${String(machine.ownedOrRented).toLowerCase() === "rented"
                                        ? "bg-amber-100 text-amber-800 border border-amber-200"
                                        : "bg-blue-100 text-blue-800 border border-blue-200"
                                        }`}>
                                        {String(machine.ownedOrRented).toLowerCase() === "rented" ? "Rented Equipment" : "Company Owned"}
                                    </span>
                                </div>
                                <p className="text-slate-500 text-sm mt-1">
                                    {machine.brand} {machine.model} • Type: <span className="font-medium text-slate-700">{machine.machineType}</span> • Added {formatDate(machine.createdAt)}
                                </p>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap items-center gap-3">
                            <Link
                                to={`/machine/${id}/maintenance/add`}
                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-sm flex items-center transition"
                            >
                                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Add Maintenance
                            </Link>

                            {isCurrentlyAssigned && canManage && (
                                <button
                                    onClick={() => setShowTransferModal(true)}
                                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-sm flex items-center transition"
                                >
                                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                    </svg>
                                    Transfer Machine
                                </button>
                            )}

                            <button
                                onClick={handleRelease}
                                disabled={!isCurrentlyAssigned || isReleasing}
                                className={`px-4 py-2 text-sm font-semibold rounded-xl flex items-center transition ${isCurrentlyAssigned
                                    ? "bg-rose-600 hover:bg-rose-700 text-white shadow-sm"
                                    : "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                                    }`}
                            >
                                {isReleasing ? "Releasing..." : "Release from Project"}
                            </button>
                        </div>
                    </div>
                </div>

                {/* 360° Operational Metrics Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Cumulative Meter</p>
                                <p className="text-2xl font-black text-slate-900 mt-1">
                                    {machine.currentMeterReading || 0} <span className="text-sm font-semibold text-slate-500">hrs/km</span>
                                </p>
                                <p className="text-xs text-slate-500 mt-1">Total run hours logged: {summary.totalWorkingHours || 0} hrs</p>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Fuel Level</p>
                                <p className="text-2xl font-black text-slate-900 mt-1">
                                    {machine.currentFuelLevel || 0} <span className="text-sm font-semibold text-slate-500">Liters</span>
                                </p>
                                <p className="text-xs text-slate-500 mt-1">Consumed: {summary.totalFuelConsumed || 0} L (₹{summary.totalFuelCost || 0})</p>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Maintenance Cost</p>
                                <p className="text-2xl font-black text-slate-900 mt-1">₹{totalMaintenanceCost || 0}</p>
                                <p className="text-xs text-slate-500 mt-1">{maintenance.length} services recorded</p>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total 360° Cost</p>
                                <p className="text-2xl font-black text-emerald-600 mt-1">₹{summary.totalOperationalCost || totalMaintenanceCost || 0}</p>
                                <p className="text-xs text-slate-500 mt-1">Usage: ₹{summary.totalUsageCost || 0} • Fuel: ₹{summary.totalFuelCost || 0}</p>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs Navigation */}
                <div className="border-b border-slate-200">
                    <nav className="-mb-px flex space-x-6 overflow-x-auto">
                        {[
                            { id: "overview", label: "Overview & Specs" },
                            { id: "operator", label: "Daily Operator Log" },
                            { id: "documents", label: "Documents & Compliance", count: allDocuments.length },
                            { id: "assignments", label: "Assignment History" },
                            { id: "full-maintenance", label: "Maintenance & Repairs" },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`py-3.5 px-1 border-b-2 font-semibold text-sm whitespace-nowrap transition flex items-center gap-2 ${activeTab === tab.id
                                    ? "border-blue-600 text-blue-600"
                                    : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                                    }`}
                            >
                                <span>{tab.label}</span>
                                {tab.count !== undefined && (
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${activeTab === tab.id
                                        ? "bg-blue-100 text-blue-700"
                                        : "bg-slate-100 text-slate-600"
                                        }`}>
                                        {tab.count}
                                    </span>
                                )}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Tab 1: Overview */}
                {activeTab === "overview" && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Machine Specifications */}
                        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
                            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                                <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Machine Specifications & Rates
                            </h3>
                            <div className="divide-y divide-slate-100 text-sm">
                                {[
                                    { label: "Machine Number", value: machine.machineNumber },
                                    { label: "Brand / Manufacturer", value: machine.brand || "—" },
                                    { label: "Model", value: machine.model || "—" },
                                    { label: "Machine Type", value: machine.machineType },
                                    { label: "Engine Number", value: machine.engineNumber || "—" },
                                    { label: "Chassis Number", value: machine.chassisNumber || "—" },
                                    { label: "Ownership Type", value: machine.ownedOrRented === "owned" ? "Company Owned" : "Rented Equipment" },
                                    { label: "Hourly Rate", value: `₹${machine.hourlyRate || 0} / hr` },
                                    { label: "Daily Rate", value: `₹${machine.dailyRate || 0} / day` },
                                    { label: "Monthly Rate", value: `₹${machine.monthlyRate || 0} / month` },
                                    { label: "Cumulative Meter", value: `${machine.currentMeterReading || 0} hrs/km` },
                                    { label: "Current Fuel Level", value: `${machine.currentFuelLevel || 0} Liters` },
                                    { label: "RC Expiry", value: formatDate(machine.rcExpiry) },
                                    { label: "Insurance Expiry", value: formatDate(machine.insuranceExpiry) },
                                ].map((item, idx) => (
                                    <div key={idx} className="flex justify-between py-2.5">
                                        <span className="text-slate-500 font-medium">{item.label}</span>
                                        <span className="text-slate-900 font-semibold">{item.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Current Site Assignment Card */}
                        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                                    <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    Active Site Deployment
                                </h3>

                                {currentAssignment ? (
                                    <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-5 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-700">Project</span>
                                            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                                                Active Assignment
                                            </span>
                                        </div>
                                        <p className="text-xl font-bold text-slate-900">
                                            {projectLabel(currentAssignment.projectId)}
                                        </p>
                                        <div className="text-xs text-slate-600 space-y-1">
                                            <p>Assigned Date: <span className="font-semibold">{formatDate(currentAssignment.assignDate)}</span></p>
                                            {currentAssignment.assignedTo && <p>Assigned Till: <span className="font-semibold">{formatDate(currentAssignment.assignedTo)}</span></p>}
                                            {currentAssignment.notes && <p>Notes: <span className="font-semibold">{currentAssignment.notes}</span></p>}
                                        </div>

                                        {/* Operator Assignment Component */}
                                        <OperatorAssignmentPanel assignment={currentAssignment} onChanged={refetch} />
                                    </div>
                                ) : (
                                    <div className="text-center py-10 bg-slate-50 border border-slate-200/60 rounded-xl">
                                        <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                            </svg>
                                        </div>
                                        <h4 className="font-semibold text-slate-700">No Active Assignment</h4>
                                        <p className="text-xs text-slate-500 mt-1 mb-4">This machine is ready and available in the central yard.</p>
                                        {canManage && (
                                            <Link
                                                to={`/assign/machine?machineId=${id}`}
                                                className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm"
                                            >
                                                Assign to Project
                                            </Link>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Primary Registration Documents & Expiry Card */}
                        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 flex items-center">
                                        <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        Registration & Mandatory Documents
                                    </h3>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        Official certificates, smart cards, and insurance policies attached to this vehicle.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setActiveTab("documents")}
                                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 hover:bg-blue-100 transition cursor-pointer"
                                >
                                    View All Documents ({allDocuments.length}) →
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Card 1: Machine Photo */}
                                <div className="border border-slate-200/80 rounded-xl p-4 bg-slate-50/50 flex flex-col justify-between hover:border-slate-300 transition">
                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Equipment Photograph</span>
                                            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${machine.photo ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600"
                                                }`}>
                                                {machine.photo ? "Attached" : "Not Attached"}
                                            </span>
                                        </div>
                                        {machine.photo ? (
                                            <div
                                                onClick={() => setPreviewDoc({
                                                    title: `Machine Photo - ${machine.machineNumber}`,
                                                    url: getFileUrl(machine.photo),
                                                    type: "Machine Photo",
                                                })}
                                                className="relative rounded-lg overflow-hidden border border-slate-200 aspect-video mb-3 group bg-slate-100 cursor-pointer shadow-xs"
                                            >
                                                <img
                                                    src={getFileUrl(machine.photo)}
                                                    alt={machine.machineNumber}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition duration-200"
                                                />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition text-white text-xs font-semibold gap-1">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                    Click to View
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="rounded-lg border border-dashed border-slate-300 aspect-video mb-3 flex flex-col items-center justify-center text-slate-400 bg-white">
                                                <svg className="w-8 h-8 mb-1 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                <span className="text-xs font-medium">No photo uploaded</span>
                                            </div>
                                        )}
                                    </div>
                                    {machine.photo && (
                                        <div className="flex items-center gap-2 pt-2 border-t border-slate-200/60">
                                            <button
                                                type="button"
                                                onClick={() => setPreviewDoc({
                                                    title: `Machine Photo - ${machine.machineNumber}`,
                                                    url: getFileUrl(machine.photo),
                                                    type: "Machine Photo",
                                                })}
                                                className="flex-1 py-1.5 px-3 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold flex items-center justify-center transition shadow-xs cursor-pointer"
                                            >
                                                <svg className="w-3.5 h-3.5 mr-1 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                                Preview
                                            </button>
                                            <a
                                                href={getFileUrl(machine.photo)}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="p-1.5 bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-lg transition shadow-xs"
                                                title="Open full photo in new tab"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                </svg>
                                            </a>
                                        </div>
                                    )}
                                </div>

                                {/* Card 2: RC Document */}
                                <div className="border border-slate-200/80 rounded-xl p-4 bg-slate-50/50 flex flex-col justify-between hover:border-slate-300 transition">
                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">RC (Registration)</span>
                                            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${rcStatus.color}`}>
                                                {rcStatus.label}
                                            </span>
                                        </div>
                                        <div className="space-y-2 mb-4 text-xs">
                                            <div className="flex justify-between py-1 border-b border-slate-100">
                                                <span className="text-slate-500 font-medium">Reg Number:</span>
                                                <span className="font-mono font-semibold text-slate-800">{machine.machineNumber}</span>
                                            </div>
                                            <div className="flex justify-between py-1 border-b border-slate-100">
                                                <span className="text-slate-500 font-medium">RC Expiry:</span>
                                                <span className="font-semibold text-slate-800">{formatDate(machine.rcExpiry)}</span>
                                            </div>
                                            <div className="flex justify-between py-1">
                                                <span className="text-slate-500 font-medium">Document Status:</span>
                                                <span className="font-semibold text-slate-700">{machine.rcFile ? "File Attached" : "No File Uploaded"}</span>
                                            </div>
                                        </div>
                                    </div>
                                    {machine.rcFile ? (
                                        <div className="flex items-center gap-2 pt-2 border-t border-slate-200/60">
                                            <button
                                                type="button"
                                                onClick={() => setPreviewDoc({
                                                    title: `Registration Certificate (RC) - ${machine.machineNumber}`,
                                                    url: getFileUrl(machine.rcFile),
                                                    type: "RC Document",
                                                    expiryDate: machine.rcExpiry,
                                                })}
                                                className="flex-1 py-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center transition shadow-xs cursor-pointer"
                                            >
                                                <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                                View RC File
                                            </button>
                                            <a
                                                href={getFileUrl(machine.rcFile)}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="p-1.5 bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-lg transition shadow-xs"
                                                title="Open RC file in new tab"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                </svg>
                                            </a>
                                        </div>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => setActiveTab("documents")}
                                            className="w-full py-1.5 px-3 bg-white hover:bg-slate-100 text-blue-600 border border-slate-200 rounded-lg text-xs font-semibold transition cursor-pointer"
                                        >
                                            + Upload RC Document
                                        </button>
                                    )}
                                </div>

                                {/* Card 3: Insurance Policy */}
                                <div className="border border-slate-200/80 rounded-xl p-4 bg-slate-50/50 flex flex-col justify-between hover:border-slate-300 transition">
                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Insurance Policy</span>
                                            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${insuranceStatus.color}`}>
                                                {insuranceStatus.label}
                                            </span>
                                        </div>
                                        <div className="space-y-2 mb-4 text-xs">
                                            <div className="flex justify-between py-1 border-b border-slate-100">
                                                <span className="text-slate-500 font-medium">Policy Expiry:</span>
                                                <span className="font-semibold text-slate-800">{formatDate(machine.insuranceExpiry)}</span>
                                            </div>
                                            <div className="flex justify-between py-1 border-b border-slate-100">
                                                <span className="text-slate-500 font-medium">Document Status:</span>
                                                <span className="font-semibold text-slate-700">{machine.insuranceFile ? "Policy Attached" : "No File Uploaded"}</span>
                                            </div>
                                            <div className="flex justify-between py-1">
                                                <span className="text-slate-500 font-medium">Compliance:</span>
                                                <span className={`font-semibold ${insuranceStatus.isExpired ? "text-rose-600" : insuranceStatus.isExpiringSoon ? "text-amber-600" : "text-emerald-600"}`}>
                                                    {insuranceStatus.isExpired ? "Needs Urgent Renewal" : insuranceStatus.isExpiringSoon ? "Renewal Approaching" : "Compliant"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    {machine.insuranceFile ? (
                                        <div className="flex items-center gap-2 pt-2 border-t border-slate-200/60">
                                            <button
                                                type="button"
                                                onClick={() => setPreviewDoc({
                                                    title: `Insurance Policy - ${machine.machineNumber}`,
                                                    url: getFileUrl(machine.insuranceFile),
                                                    type: "Insurance Policy",
                                                    expiryDate: machine.insuranceExpiry,
                                                })}
                                                className="flex-1 py-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center transition shadow-xs cursor-pointer"
                                            >
                                                <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                                View Policy
                                            </button>
                                            <a
                                                href={getFileUrl(machine.insuranceFile)}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="p-1.5 bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-lg transition shadow-xs"
                                                title="Open policy in new tab"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                </svg>
                                            </a>
                                        </div>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => setActiveTab("documents")}
                                            className="w-full py-1.5 px-3 bg-white hover:bg-slate-100 text-blue-600 border border-slate-200 rounded-lg text-xs font-semibold transition cursor-pointer"
                                        >
                                            + Upload Insurance Policy
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tab 2: Daily Operator Log */}
                {activeTab === "operator" && (
                    <div className="space-y-6">
                        {/* Daily Log Entry Form */}
                        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
                            <h3 className="text-lg font-bold text-slate-900 mb-2">Record Daily Working & Fuel Log</h3>
                            <p className="text-xs text-slate-500 mb-6">
                                Logs calculate working hours from meter delta, monitor fuel efficiency, and post usage costs to project reports.
                            </p>

                            <form onSubmit={submitOperatorLog} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div>
                                        <label className="text-xs font-semibold text-slate-600">Date *</label>
                                        <input
                                            type="date"
                                            required
                                            value={opForm.date}
                                            onChange={(e) => setOpForm({ ...opForm, date: e.target.value })}
                                            className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-xs font-semibold text-slate-600">Operator (Labour ID) *</label>
                                        <select
                                            required
                                            value={opForm.operatorId}
                                            onChange={(e) => setOpForm({ ...opForm, operatorId: e.target.value })}
                                            className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="">Select Operator</option>
                                            {operators.map((op) => (
                                                <option key={op._id} value={op._id}>
                                                    {op.labourId ? `[${op.labourId}] ` : ""}{op.name} {op.phone ? `(${op.phone})` : ""}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="text-xs font-semibold text-slate-600">Project Site *</label>
                                        <select
                                            required
                                            value={opForm.projectId}
                                            onChange={(e) => setOpForm({ ...opForm, projectId: e.target.value })}
                                            className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="">Select Project</option>
                                            {projectsList.map((p) => (
                                                <option key={p._id} value={p._id}>
                                                    {p.name} {p.code ? `(${p.code})` : ""}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="text-xs font-semibold text-slate-600">Shift</label>
                                        <select
                                            value={opForm.shift}
                                            onChange={(e) => setOpForm({ ...opForm, shift: e.target.value })}
                                            className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="Morning">Morning Shift</option>
                                            <option value="Evening">Evening Shift</option>
                                            <option value="Night">Night Shift</option>
                                            <option value="General">General Shift</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2 border-t border-slate-100">
                                    <div>
                                        <label className="text-xs font-semibold text-slate-600">Opening Meter Reading *</label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            required
                                            value={opForm.openingMeterReading}
                                            onChange={(e) => setOpForm({ ...opForm, openingMeterReading: e.target.value })}
                                            className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 font-mono"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-xs font-semibold text-slate-600">Closing Meter Reading *</label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            required
                                            value={opForm.closingMeterReading}
                                            onChange={(e) => setOpForm({ ...opForm, closingMeterReading: e.target.value })}
                                            className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 font-mono"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-xs font-semibold text-slate-600">Work Type</label>
                                        <input
                                            value={opForm.workType}
                                            onChange={(e) => setOpForm({ ...opForm, workType: e.target.value })}
                                            placeholder="e.g. Excavation, Hauling, Grading"
                                            className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-xs font-semibold text-slate-600">Hourly Rate Applied (₹/hr)</label>
                                        <input
                                            type="number"
                                            value={opForm.machineHourlyRate}
                                            onChange={(e) => setOpForm({ ...opForm, machineHourlyRate: e.target.value })}
                                            className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 font-mono"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2 border-t border-slate-100">
                                    <div>
                                        <label className="text-xs font-semibold text-slate-600">Opening Fuel (L)</label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            value={opForm.fuelOpening}
                                            onChange={(e) => setOpForm({ ...opForm, fuelOpening: e.target.value })}
                                            className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 font-mono"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-xs font-semibold text-slate-600">Fuel Added (L)</label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            value={opForm.fuelAdded}
                                            onChange={(e) => setOpForm({ ...opForm, fuelAdded: e.target.value })}
                                            className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 font-mono"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-xs font-semibold text-slate-600">Closing Fuel (L)</label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            value={opForm.fuelClosing}
                                            onChange={(e) => setOpForm({ ...opForm, fuelClosing: e.target.value })}
                                            className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 font-mono"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-xs font-semibold text-slate-600">Fuel Rate (₹/L)</label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            value={opForm.fuelRate}
                                            onChange={(e) => setOpForm({ ...opForm, fuelRate: e.target.value })}
                                            className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 font-mono"
                                        />
                                    </div>
                                </div>

                                {/* Computed Summary Pill */}
                                <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 text-xs font-semibold text-slate-700">
                                    <div>Working Hours: <span className="text-blue-600 font-bold font-mono text-sm">{computedHours.toFixed(1)} hrs</span></div>
                                    <div>Fuel Consumed: <span className="text-amber-600 font-bold font-mono text-sm">{computedFuel.toFixed(1)} L</span></div>
                                    <div>Fuel Cost: <span className="text-slate-900 font-bold font-mono text-sm">₹{computedFuelCost.toFixed(2)}</span></div>
                                    <div>Usage Cost: <span className="text-slate-900 font-bold font-mono text-sm">₹{computedUsageCost.toFixed(2)}</span></div>
                                    <div>Estimated Day Cost: <span className="text-emerald-600 font-bold font-mono text-base">₹{computedDayCost.toFixed(2)}</span></div>
                                </div>

                                <div>
                                    <label className="text-xs font-semibold text-slate-600">Work Description / Remarks</label>
                                    <input
                                        value={opForm.remarks}
                                        onChange={(e) => setOpForm({ ...opForm, remarks: e.target.value })}
                                        placeholder="Site activities performed, breakdown notes, or weather conditions..."
                                        className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div className="text-right pt-2">
                                    <button
                                        type="submit"
                                        disabled={isLoggingDay}
                                        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-sm transition disabled:opacity-50"
                                    >
                                        {isLoggingDay ? "Recording Log..." : "Submit Daily Log"}
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Recent Operator Logs Table */}
                        <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
                            <div className="p-5 border-b border-slate-100 flex justify-between items-center">
                                <h4 className="font-bold text-slate-900">Recent Operator Logs ({logs.length})</h4>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-xs font-semibold">
                                        <tr>
                                            <th className="py-3 px-4">Date & Shift</th>
                                            <th className="py-3 px-4">Operator</th>
                                            <th className="py-3 px-4">Project</th>
                                            <th className="py-3 px-4 text-center">Meter Delta (hrs)</th>
                                            <th className="py-3 px-4 text-center">Fuel Consumed</th>
                                            <th className="py-3 px-4 text-right">Total Cost</th>
                                            <th className="py-3 px-4 text-center">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {logs.length === 0 ? (
                                            <tr>
                                                <td colSpan="7" className="py-8 text-center text-slate-500 text-xs">
                                                    No operator logs recorded for this machine yet.
                                                </td>
                                            </tr>
                                        ) : (
                                            logs.map((l) => (
                                                <tr key={l._id} className="hover:bg-slate-50/50">
                                                    <td className="py-3 px-4">
                                                        <span className="font-medium text-slate-800">{formatDate(l.date)}</span>
                                                        <span className="block text-xs text-slate-400">{l.shift || "Morning"}</span>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <span className="font-medium text-slate-800">
                                                            {l.operatorId?.labourId ? `[${l.operatorId.labourId}] ` : ""}
                                                            {l.operatorId?.name || "—"}
                                                        </span>
                                                        <span className="block text-xs text-slate-400">{l.workType || "General Work"}</span>
                                                    </td>
                                                    <td className="py-3 px-4 text-slate-600 font-medium">
                                                        {l.projectId?.name || "—"}
                                                    </td>
                                                    <td className="py-3 px-4 text-center font-mono">
                                                        <span className="font-bold text-blue-600">{l.workingHours || 0} hrs</span>
                                                        <span className="block text-xs text-slate-400">{l.openingMeterReading} → {l.closingMeterReading}</span>
                                                    </td>
                                                    <td className="py-3 px-4 text-center font-mono">
                                                        <span className="font-bold text-amber-600">{l.fuelConsumed || 0} L</span>
                                                        <span className="block text-xs text-slate-400">Eff: {l.fuelEfficiency ? `${l.fuelEfficiency} L/hr` : "—"}</span>
                                                    </td>
                                                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600">
                                                        ₹{l.totalDayCost || 0}
                                                    </td>
                                                    <td className="py-3 px-4 text-center">
                                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${l.approved ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                                                            }`}>
                                                            {l.approved ? "Approved" : "Pending"}
                                                        </span>
                                                        {!l.approved && canManage && (
                                                            <button
                                                                onClick={async () => {
                                                                    try {
                                                                        await approveOperatorLog(l._id).unwrap();
                                                                        toast.success("Log approved");
                                                                        refetch();
                                                                    } catch (err) {
                                                                        toast.error(err?.data?.message || "Failed to approve");
                                                                    }
                                                                }}
                                                                className="block mx-auto mt-1 text-xs text-blue-600 hover:underline font-semibold"
                                                            >
                                                                Approve
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tab 3: Structured Documents */}
                {activeTab === "documents" && (
                    <div className="space-y-6">
                        {/* Upload Document Form */}
                        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
                            <h3 className="text-lg font-bold text-slate-900 mb-2">Upload Structured Compliance Document</h3>
                            <p className="text-xs text-slate-500 mb-6">
                                Upload mandatory machine documents (RC, Insurance, Fitness, PUC, Permits) to keep compliance updated.
                            </p>

                            <form onSubmit={submitDocument} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div>
                                        <label className="text-xs font-semibold text-slate-600">Document Type *</label>
                                        <select
                                            value={docForm.type}
                                            onChange={(e) => setDocForm({ ...docForm, type: e.target.value })}
                                            className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="RC">RC (Registration Certificate)</option>
                                            <option value="Insurance">Insurance Policy</option>
                                            <option value="Fitness Certificate">Fitness Certificate</option>
                                            <option value="PUC">Pollution Under Control (PUC)</option>
                                            <option value="Road Tax">Road Tax Certificate</option>
                                            <option value="Permit">National / State Permit</option>
                                            <option value="Purchase Invoice">Purchase Invoice / Bill</option>
                                            <option value="Other">Other Document</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="text-xs font-semibold text-slate-600">Document / Certificate No.</label>
                                        <input
                                            value={docForm.documentNumber}
                                            onChange={(e) => setDocForm({ ...docForm, documentNumber: e.target.value })}
                                            placeholder="e.g. MH12AB1234/RC/99"
                                            className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-xs font-semibold text-slate-600">Issue Date</label>
                                        <input
                                            type="date"
                                            value={docForm.issueDate}
                                            onChange={(e) => setDocForm({ ...docForm, issueDate: e.target.value })}
                                            className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-xs font-semibold text-slate-600">Expiry Date</label>
                                        <input
                                            type="date"
                                            value={docForm.expiryDate}
                                            onChange={(e) => setDocForm({ ...docForm, expiryDate: e.target.value })}
                                            className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-semibold text-slate-600">Attach Document File (PDF / Image) *</label>
                                        <input
                                            type="file"
                                            required
                                            onChange={(e) => setDocForm({ ...docForm, file: e.target.files[0] })}
                                            className="mt-1 w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-xs font-semibold text-slate-600">Remarks / Authority</label>
                                        <input
                                            value={docForm.remarks}
                                            onChange={(e) => setDocForm({ ...docForm, remarks: e.target.value })}
                                            placeholder="Issuing authority or special clauses..."
                                            className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>

                                <div className="text-right pt-2">
                                    <button
                                        type="submit"
                                        disabled={isUploadingDoc}
                                        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-sm transition disabled:opacity-50"
                                    >
                                        {isUploadingDoc ? "Uploading..." : "Upload Document"}
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Documents List */}
                        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
                                <div>
                                    <h4 className="font-bold text-slate-900 text-base">All Machine Documents ({allDocuments.length})</h4>
                                    <p className="text-xs text-slate-500">Includes core registration certificates, photo, insurance, and compliance documents.</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {allDocuments.length === 0 ? (
                                    <div className="text-center py-12 border border-dashed border-slate-200 rounded-xl">
                                        <svg className="w-12 h-12 text-slate-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <p className="text-slate-600 font-semibold text-sm">No documents uploaded for this machine yet.</p>
                                        <p className="text-slate-400 text-xs mt-1">Upload registration papers, insurance policies, or fitness certificates above.</p>
                                    </div>
                                ) : (
                                    allDocuments.map((doc) => {
                                        const fileUrl = getFileUrl(doc.fileUrl);
                                        const isImg = isImageFile(doc.fileUrl);
                                        const isPdf = isPdfFile(doc.fileUrl);
                                        const expStatus = getExpiryStatus(doc.expiryDate);

                                        return (
                                            <div
                                                key={doc._id || doc.type}
                                                className="border border-slate-200/80 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-slate-300 hover:shadow-xs transition bg-white"
                                            >
                                                <div className="flex items-start gap-3 min-w-0">
                                                    {/* File type avatar */}
                                                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
                                                        isImg
                                                            ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                                                            : isPdf
                                                            ? "bg-rose-50 text-rose-600 border border-rose-100"
                                                            : "bg-blue-50 text-blue-600 border border-blue-100"
                                                    }`}>
                                                        {isImg ? (
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                            </svg>
                                                        ) : isPdf ? (
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                                            </svg>
                                                        ) : (
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                            </svg>
                                                        )}
                                                    </div>

                                                    <div className="min-w-0">
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <span className="font-bold text-slate-900">{doc.type}</span>

                                                            {doc.isPrimary && (
                                                                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                                                                    Core Registration
                                                                </span>
                                                            )}

                                                            {doc.documentNumber && (
                                                                <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono font-medium">
                                                                    {doc.documentNumber}
                                                                </span>
                                                            )}

                                                            {doc.expiryDate && (
                                                                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${expStatus.color}`}>
                                                                    {expStatus.label}
                                                                </span>
                                                            )}
                                                        </div>

                                                        <p className="text-xs text-slate-500 mt-1">
                                                            Source: <span className="font-medium text-slate-700">{doc.source || "Compliance Record"}</span>
                                                            {doc.remarks && ` • ${doc.remarks}`}
                                                            {doc.createdAt && ` • Added ${formatDate(doc.createdAt)}`}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex flex-wrap items-center gap-2 self-end sm:self-center flex-shrink-0">
                                                    {/* Quick Preview Button */}
                                                    <button
                                                        type="button"
                                                        onClick={() => setPreviewDoc({
                                                            title: `${doc.type}${doc.documentNumber ? ` - ${doc.documentNumber}` : ""}`,
                                                            url: fileUrl,
                                                            type: doc.type,
                                                            expiryDate: doc.expiryDate,
                                                            source: doc.source,
                                                            remarks: doc.remarks,
                                                        })}
                                                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg flex items-center transition shadow-xs cursor-pointer"
                                                    >
                                                        <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                        </svg>
                                                        Preview
                                                    </button>

                                                    {/* Open Original in New Tab */}
                                                    <a
                                                        href={fileUrl}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center transition"
                                                        title="Open original file in new tab"
                                                    >
                                                        <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                        </svg>
                                                        Open
                                                    </a>

                                                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                                                        doc.verificationStatus === "VERIFIED"
                                                            ? "bg-emerald-100 text-emerald-800"
                                                            : doc.verificationStatus === "REJECTED"
                                                            ? "bg-rose-100 text-rose-800"
                                                            : "bg-amber-100 text-amber-800"
                                                    }`}>
                                                        {doc.verificationStatus || "PENDING"}
                                                    </span>

                                                    {canManage && !doc.isPrimary && doc.verificationStatus !== "VERIFIED" && (
                                                        <button
                                                            onClick={async () => {
                                                                try {
                                                                    await verifyDocument({ docId: doc._id, verificationStatus: "VERIFIED" }).unwrap();
                                                                    toast.success("Document marked as verified");
                                                                    refetchDocs();
                                                                } catch (err) {
                                                                    toast.error(err?.data?.message || "Verification failed");
                                                                }
                                                            }}
                                                            className="text-xs px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition"
                                                        >
                                                            Verify
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Tab 4: Assignment History */}
                {activeTab === "assignments" && (
                    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-900 mb-6">Complete Site Assignment History</h3>
                        {assignments.length === 0 ? (
                            <div className="text-center py-10 text-slate-500 text-sm">
                                This machine has not been assigned to any project yet.
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {assignments.map((as) => (
                                    <div key={as._id} className="border border-slate-200/80 rounded-xl p-5 hover:border-slate-300 transition">
                                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3">
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-bold text-slate-900 text-base">{projectLabel(as.projectId)}</h4>
                                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${as.releaseDate ? "bg-slate-100 text-slate-700" : "bg-emerald-100 text-emerald-800"
                                                    }`}>
                                                    {as.releaseDate ? "Completed" : "Active Deployment"}
                                                </span>
                                            </div>
                                            <span className="text-xs text-slate-500">
                                                Assigned: {formatDate(as.assignDate)} {as.releaseDate && `• Released: ${formatDate(as.releaseDate)}`}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs bg-slate-50 rounded-xl p-3 text-slate-600">
                                            <div>
                                                <span className="text-slate-400 font-medium">Assigned Operator:</span>{" "}
                                                <span className="font-semibold text-slate-800">
                                                    {as.operatorId?.labourId ? `[${as.operatorId.labourId}] ` : ""}
                                                    {as.operatorId?.name || "Unassigned"}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-slate-400 font-medium">Assigned By:</span>{" "}
                                                <span className="font-semibold text-slate-800">{as.assignedBy?.name || "System"}</span>
                                            </div>
                                            <div>
                                                <span className="text-slate-400 font-medium">Notes:</span>{" "}
                                                <span className="font-semibold text-slate-800">{as.notes || "—"}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Tab 5: Maintenance & Repairs */}
                {activeTab === "full-maintenance" && (
                    <div className="space-y-6">
                        {/* Report Maintenance Form */}
                        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
                            <h3 className="text-lg font-bold text-slate-900 mb-2">Report Maintenance or Breakdown</h3>
                            <p className="text-xs text-slate-500 mb-6">
                                Reporting a breakdown automatically updates machine status and alerts management for timely repair.
                            </p>

                            <form onSubmit={submitMaintenanceReport} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="text-xs font-semibold text-slate-600">Service / Maintenance Type</label>
                                        <select
                                            value={maintForm.serviceType}
                                            onChange={(e) => setMaintForm({ ...maintForm, serviceType: e.target.value })}
                                            className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="Breakdown Repair">Breakdown Repair</option>
                                            <option value="Scheduled Maintenance">Scheduled Maintenance</option>
                                            <option value="Oil & Filter Change">Oil & Filter Change</option>
                                            <option value="Hydraulic Service">Hydraulic Service</option>
                                            <option value="Tyre / Track Replacement">Tyre / Track Replacement</option>
                                            <option value="Inspection / Calibration">Inspection / Calibration</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="text-xs font-semibold text-slate-600">Estimated Cost (₹)</label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={maintForm.cost}
                                            onChange={(e) => setMaintForm({ ...maintForm, cost: e.target.value })}
                                            placeholder="e.g. 15000"
                                            className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div className="md:col-span-1 flex items-end">
                                        <button
                                            type="submit"
                                            disabled={isReportingMaint}
                                            className="w-full px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold rounded-xl shadow-sm transition disabled:opacity-50"
                                        >
                                            {isReportingMaint ? "Submitting..." : "Report Issue"}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-semibold text-slate-600">Issue Description / Symptoms *</label>
                                    <textarea
                                        required
                                        rows="2"
                                        value={maintForm.issue}
                                        onChange={(e) => setMaintForm({ ...maintForm, issue: e.target.value })}
                                        placeholder="Describe the issue, parts needing replacement, or fault codes..."
                                        className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </form>
                        </div>

                        {/* Maintenance History */}
                        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
                            <h4 className="font-bold text-slate-900 mb-4">Maintenance Work Orders ({maintenance.length})</h4>
                            <div className="space-y-3">
                                {maintenance.length === 0 ? (
                                    <p className="text-slate-500 text-sm py-4 text-center">No maintenance recorded for this machine yet.</p>
                                ) : (
                                    maintenance.map((m) => (
                                        <div key={m._id} className="border border-slate-200/80 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-slate-900">{m.serviceType || "Maintenance Service"}</span>
                                                    <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded font-mono font-semibold">
                                                        ₹{m.cost || m.totalCost || 0}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-slate-600 mt-1">{m.issue || m.description || m.notes || "—"}</p>
                                                <p className="text-xs text-slate-400 mt-0.5">
                                                    Date: {formatDate(m.serviceDate || m.createdAt)} • Reported by: {m.reportedBy?.name || "System"}
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${m.status === "Resolved" || m.status === "Completed"
                                                    ? "bg-emerald-100 text-emerald-800"
                                                    : "bg-amber-100 text-amber-800"
                                                    }`}>
                                                    {m.status || "Reported"}
                                                </span>

                                                {canManage && m.status !== "Resolved" && (
                                                    <button
                                                        onClick={async () => {
                                                            try {
                                                                await updateMaintStatus({ id: m._id, status: "Resolved" }).unwrap();
                                                                toast.success("Maintenance marked as Resolved");
                                                                refetch();
                                                                refetchFullMaint();
                                                            } catch (err) {
                                                                toast.error(err?.data?.message || "Failed to update status");
                                                            }
                                                        }}
                                                        className="text-xs px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition"
                                                    >
                                                        Mark Resolved
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Transfer Machine Modal */}
            {showTransferModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">Transfer Machine Between Sites</h3>
                                <p className="text-xs text-slate-500">Deploy directly to another project while preserving history.</p>
                            </div>
                            <button onClick={() => setShowTransferModal(false)} className="text-slate-400 hover:text-slate-600">
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleTransfer} className="p-6 space-y-4">
                            <div>
                                <label className="text-xs font-semibold text-slate-600">Target Project Site *</label>
                                <select
                                    required
                                    value={transferForm.targetProjectId}
                                    onChange={(e) => setTransferForm({ ...transferForm, targetProjectId: e.target.value })}
                                    className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Select Destination Project</option>
                                    {projectsList
                                        .filter((p) => p._id !== (currentAssignment?.projectId?._id || currentAssignment?.projectId))
                                        .map((p) => (
                                            <option key={p._id} value={p._id}>
                                                {p.name} {p.code ? `(${p.code})` : ""}
                                            </option>
                                        ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-semibold text-slate-600">Transfer Date *</label>
                                    <input
                                        type="date"
                                        required
                                        value={transferForm.transferDate}
                                        onChange={(e) => setTransferForm({ ...transferForm, transferDate: e.target.value })}
                                        className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-semibold text-slate-600">Meter at Transfer (hrs)</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={transferForm.openingMeterReading}
                                        onChange={(e) => setTransferForm({ ...transferForm, openingMeterReading: e.target.value })}
                                        className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-semibold text-slate-600">Fuel Level at Transfer (L)</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={transferForm.fuelLevel}
                                        onChange={(e) => setTransferForm({ ...transferForm, fuelLevel: e.target.value })}
                                        className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-semibold text-slate-600">Transport Cost (₹)</label>
                                    <input
                                        type="number"
                                        value={transferForm.transportCost}
                                        onChange={(e) => setTransferForm({ ...transferForm, transportCost: e.target.value })}
                                        placeholder="e.g. 5000"
                                        className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-slate-600">Transport Vendor / Carrier</label>
                                <input
                                    value={transferForm.transportVendor}
                                    onChange={(e) => setTransferForm({ ...transferForm, transportVendor: e.target.value })}
                                    placeholder="e.g. ABC Heavy Logistics"
                                    className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-slate-600">Transfer Reason / Notes</label>
                                <input
                                    value={transferForm.remarks}
                                    onChange={(e) => setTransferForm({ ...transferForm, remarks: e.target.value })}
                                    placeholder="e.g. Project phase 1 complete, moving to site B excavation"
                                    className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-3">
                                <button
                                    type="button"
                                    onClick={() => setShowTransferModal(false)}
                                    className="px-4 py-2 border border-slate-300 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isTransferring}
                                    className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-sm disabled:opacity-50"
                                >
                                    {isTransferring ? "Transferring..." : "Confirm Transfer"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Universal Document Preview Modal */}
            {previewDoc && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-3 sm:p-6 animate-in fade-in duration-200"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) setPreviewDoc(null);
                    }}
                >
                    <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="p-4 sm:px-6 sm:py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
                            <div className="flex items-center gap-3 min-w-0 pr-4">
                                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <div className="min-w-0">
                                    <h3 className="text-base font-bold text-slate-900 truncate">
                                        {previewDoc.title || "Document Preview"}
                                    </h3>
                                    <p className="text-xs text-slate-500 truncate flex items-center gap-2 mt-0.5">
                                        {previewDoc.source && <span>{previewDoc.source}</span>}
                                        {previewDoc.expiryDate && (
                                            <>
                                                <span>•</span>
                                                <span className="font-medium text-slate-600">
                                                    Expires: {formatDate(previewDoc.expiryDate)}
                                                </span>
                                            </>
                                        )}
                                        {previewDoc.remarks && (
                                            <>
                                                <span>•</span>
                                                <span className="italic text-slate-400">{previewDoc.remarks}</span>
                                            </>
                                        )}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 flex-shrink-0">
                                {previewDoc.url && (
                                    <a
                                        href={previewDoc.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold flex items-center transition shadow-xs"
                                        title="Open in new window"
                                    >
                                        <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                        </svg>
                                        Open Original
                                    </a>
                                )}

                                <button
                                    type="button"
                                    onClick={() => setPreviewDoc(null)}
                                    className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 flex items-center justify-center transition cursor-pointer"
                                    title="Close (Esc)"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="flex-1 overflow-auto bg-slate-900/5 min-h-[350px] flex items-center justify-center p-2 sm:p-4">
                            {!previewDoc.url ? (
                                <div className="text-center py-12 text-slate-400 text-sm">
                                    No document URL available to display.
                                </div>
                            ) : isImageFile(previewDoc.url) ? (
                                <div className="w-full h-full flex items-center justify-center bg-slate-950/90 rounded-xl p-2 overflow-auto max-h-[72vh]">
                                    <img
                                        src={previewDoc.url}
                                        alt={previewDoc.title}
                                        className="max-h-[70vh] max-w-full object-contain rounded shadow-lg"
                                    />
                                </div>
                            ) : isPdfFile(previewDoc.url) ? (
                                <div className="w-full h-[70vh] rounded-xl overflow-hidden bg-white shadow-inner border border-slate-200">
                                    <iframe
                                        src={previewDoc.url}
                                        title={previewDoc.title}
                                        className="w-full h-full border-0"
                                    />
                                </div>
                            ) : (
                                <div className="text-center py-12 bg-white rounded-xl border border-slate-200 p-8 max-w-md shadow-sm">
                                    <svg className="w-16 h-16 text-slate-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                    </svg>
                                    <h4 className="text-base font-bold text-slate-800 mb-1">{previewDoc.title}</h4>
                                    <p className="text-xs text-slate-500 mb-5">
                                        This document format cannot be embedded inline. Click below to view or download it directly.
                                    </p>
                                    <a
                                        href={previewDoc.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm transition"
                                    >
                                        <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                        </svg>
                                        Download / Open File
                                    </a>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="p-3 sm:px-6 bg-white border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                            <span className="truncate max-w-[60%] font-mono text-[11px] text-slate-400">
                                {previewDoc.url}
                            </span>
                            <button
                                type="button"
                                onClick={() => setPreviewDoc(null)}
                                className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition cursor-pointer"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}