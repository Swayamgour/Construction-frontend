import React, { useState } from "react";
import {
    FaChartLine,
    FaClock,
    FaTasks,
    FaMapMarkerAlt,
    FaBuilding,
    FaUserTie,
    FaHardHat,
    FaCalendarAlt,
    FaRulerCombined,
    FaFileContract,
    FaFileAlt,
    FaTimes,
    FaFolderOpen,
} from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import { CheckRole } from "../helper/CheckRole";
import AssignManager from "../components/AssignManager";
import { useGetProjectsByIdQuery } from "../Reduxe/Api";
import {
    getFileUrl,
    getFileName,
    isImageFile,
    toFileArray,
} from "../utils/fileUrl";

// Attachment categories (same keys as backend Project.files)
const FILE_CATEGORIES = [
    { key: "workOrderFile", label: "Work Order Copy" },
    { key: "siteLayoutFile", label: "Site Layout Plan" },
    { key: "drawingsFile", label: "Project Drawings" },
    { key: "clientKycFile", label: "Client KYC Documents" },
    { key: "projectPhotosFile", label: "Project Photos" },
    { key: "notesFile", label: "Special Instructions / Notes" },
];

const TABS = [
    { key: "overview", label: "Project Overview" },
    { key: "details", label: "Project Details" },
    { key: "documents", label: "Documents" },
];

export default function DashboardProject() {
    const { role } = CheckRole();
    const navigate = useNavigate();
    const location = useLocation();

    const projectById = location.state?.project || {};
    const { data: projectData } = useGetProjectsByIdQuery(
        { id: projectById._id },
        { skip: !projectById._id }
    );

    // Show list data instantly, replace with full data once it loads
    const project = projectData || projectById;

    const [activeTab, setActiveTab] = useState("overview");
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [selectManager, setSelectManager] = useState("");
    const [previewImage, setPreviewImage] = useState(null);

    const toggleDrawer = () => setIsDrawerOpen(!isDrawerOpen);

    const getProgressColor = (p) =>
        p < 30
            ? "from-red-500 to-orange-500"
            : p < 70
                ? "from-amber-500 to-yellow-500"
                : "from-green-500 to-emerald-600";

    const formatDate = (d, fallback = "Not set") => {
        if (!d) return fallback;
        const date = new Date(d);
        if (isNaN(date)) return fallback;
        return date.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    const getDaysRemaining = () => {
        if (project?.actualCompletionDate) return "Completed";
        if (!project?.expectedCompletionDate) return "N/A";

        const diffDays = Math.ceil(
            (new Date(project.expectedCompletionDate) - new Date()) /
            (1000 * 60 * 60 * 24)
        );

        return diffDays > 0 ? `${diffDays} days` : "Overdue";
    };

    // Uses backend progress if present, otherwise derives from dates
    const getProgress = () => {
        if (typeof project?.progress === "number") {
            return Math.min(100, Math.max(0, Math.round(project.progress)));
        }
        if (project?.actualCompletionDate) return 100;

        const start = project?.actualStartDate || project?.expectedStartDate;
        const end = project?.expectedCompletionDate;
        if (!start || !end) return 0;

        const startDate = new Date(start);
        const endDate = new Date(end);
        const today = new Date();

        if (today <= startDate) return 0;
        if (today >= endDate) return 100;

        const total = endDate - startDate;
        return total > 0 ? Math.round(((today - startDate) / total) * 100) : 0;
    };
    const progress = getProgress();

    const getProjectStatus = () => {
        if (project?.actualCompletionDate) return "Completed";
        if (
            project?.expectedCompletionDate &&
            new Date(project.expectedCompletionDate) < new Date()
        ) {
            return "Overdue";
        }
        if (project?.actualStartDate) return "In Progress";
        return "Not Started";
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "Completed":
                return "text-green-600 bg-green-50";
            case "In Progress":
                return "text-blue-600 bg-blue-50";
            case "Not Started":
                return "text-gray-600 bg-gray-50";
            case "Overdue":
                return "text-red-600 bg-red-50";
            default:
                return "text-yellow-600 bg-yellow-50";
        }
    };

    const shareLocation = async () => {
        const link = project?.locationMapLink;

        if (!link) {
            alert("No link found");
            return;
        }

        if (navigator.share) {
            try {
                await navigator.share({
                    title: "Project Location",
                    text: "Here is the project location link:",
                    url: link,
                });
            } catch (err) {
                console.log("Share cancelled/failed", err);
            }
        } else if (navigator.clipboard) {
            await navigator.clipboard.writeText(link);
            alert("Location link copied to clipboard");
        } else {
            alert("Sharing not supported on this device");
        }
    };

    // Architect/consultant may be a populated object or just an ID string
    const personName = (value) => {
        if (!value) return "Not Assigned";
        if (typeof value === "object") return value.name || "Not Assigned";
        return "Assigned";
    };

    const areaText = (value) => (value ? `${value} sqm` : "Not provided");

    const totalFiles = FILE_CATEGORIES.reduce(
        (sum, c) => sum + toFileArray(project?.files?.[c.key]).length,
        0
    );

    // ==================== OVERVIEW ====================
    const renderOverviewTab = () => (
        <div className="space-y-8">
            <div className="bg-white rounded-3xl shadow-xl border p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold">Project Status</h3>
                    <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                            getProjectStatus()
                        )}`}
                    >
                        {getProjectStatus()}
                    </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-slate-50 rounded-xl">
                        <p className="text-sm text-slate-600">Start Date</p>
                        <p className="font-semibold">
                            {formatDate(
                                project?.actualStartDate || project?.expectedStartDate
                            )}
                        </p>
                        <p className="text-xs text-slate-500">
                            {project?.actualStartDate ? "Actual" : "Expected"}
                        </p>
                    </div>
                    <div className="text-center p-4 bg-slate-50 rounded-xl">
                        <p className="text-sm text-slate-600">Completion Date</p>
                        <p className="font-semibold">
                            {formatDate(
                                project?.actualCompletionDate ||
                                project?.expectedCompletionDate
                            )}
                        </p>
                        <p className="text-xs text-slate-500">
                            {project?.actualCompletionDate ? "Actual" : "Expected"}
                        </p>
                    </div>
                    <div className="text-center p-4 bg-slate-50 rounded-xl">
                        <p className="text-sm text-slate-600">Time Remaining</p>
                        <p className="font-semibold">{getDaysRemaining()}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <ProjectCard title="Progress" icon={<FaChartLine />} value={`${progress}%`}>
                    <div className="w-full bg-slate-200 rounded-full h-3 mt-2">
                        <div
                            className={`h-full rounded-full bg-gradient-to-r ${getProgressColor(
                                progress
                            )}`}
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </ProjectCard>

                <ProjectCard
                    title="Team Size"
                    icon={<FaHardHat />}
                    value={project?.labours?.length || 0}
                >
                    <p className="text-sm text-slate-600">Labours assigned</p>
                </ProjectCard>

                <ProjectCard
                    title="Built-up Area"
                    icon={<FaRulerCombined />}
                    value={project?.builtUpArea ? `${project.builtUpArea} sqm` : "N/A"}
                />

                <ProjectCard
                    title="Duration"
                    icon={<FaClock />}
                    value={project?.projectDuration || "N/A"}
                />
            </div>

            <div className="bg-white rounded-3xl shadow-xl border p-6">
                <h3 className="text-xl font-bold mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <ActionCard
                        title="View Tasks"
                        icon={<FaTasks />}
                        onClick={() => navigate(`/MyTasks`)}
                        color="from-blue-500 to-cyan-500"
                    />
                    <ActionCard
                        title="Team Management"
                        icon={<FaUserTie />}
                        onClick={() => setActiveTab("details")}
                        color="from-green-500 to-emerald-500"
                    />
                    <ActionCard
                        title={`Documents (${totalFiles})`}
                        icon={<FaFolderOpen />}
                        onClick={() => setActiveTab("documents")}
                        color="from-orange-500 to-amber-500"
                    />
                </div>
            </div>
        </div>
    );

    // ==================== DETAILS ====================
    const renderDetailsTab = () => (
        <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Block title="Project Information" icon={<FaBuilding className="text-blue-500" />}>
                    <Info label="Project Name" value={project?.projectName} />
                    <Info label="Type" value={project?.projectType} />
                    <Info label="Work Scope" value={project?.workScope} />
                    <Info label="Contract" value={project?.contractType} />
                    <Info label="Project Code" value={project?.projectCode || "Not provided"} />
                    <Info label="Site Area" value={areaText(project?.siteArea)} />
                    <Info label="Built-up Area" value={areaText(project?.builtUpArea)} />
                </Block>

                <Block title="Client & Company" icon={<FaUserTie className="text-purple-500" />}>
                    <Info label="Client" value={project?.clientName} />
                    <Info label="Company Name" value={project?.companyName} />
                    <Info label="GST" value={project?.gst || "Not provided"} />
                    <Info label="Contact" value={project?.contactNumber} />
                    <Info label="Email" value={project?.email} />
                    <Info label="Alternate Contact" value={project?.alternateContact || "Not provided"} />
                </Block>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Block title="Site Location" icon={<FaMapMarkerAlt className="text-green-500" />}>
                    <Info label="Location" value={project?.siteLocation} />
                    <Info label="City" value={project?.city} />
                    <Info label="State" value={project?.state} />
                    <Info label="Pincode" value={project?.pinCode} />
                    <Info label="Landmark" value={project?.landmark || "Not specified"} />
                </Block>

                <Block title="Timeline & Dates" icon={<FaCalendarAlt className="text-amber-500" />}>
                    <Info label="Work Order Date" value={formatDate(project?.workOrderDate)} />
                    <Info label="Expected Start" value={formatDate(project?.expectedStartDate)} />
                    <Info label="Actual Start" value={formatDate(project?.actualStartDate, "Not started")} />
                    <Info label="Expected Completion" value={formatDate(project?.expectedCompletionDate)} />
                    <Info label="Actual Completion" value={formatDate(project?.actualCompletionDate, "Not completed")} />
                    <Info label="Duration" value={project?.projectDuration || "N/A"} />
                </Block>
            </div>

            <Block title="Project Team" icon={<FaHardHat className="text-cyan-500" />}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                    <Team role="Created By" name={project?.createdBy?.name || "N/A"} email={project?.createdBy?.email} />
                    <Team role="Manager" name={personName(project?.managerId)} email={project?.managerId?.email} />
                    <Team role="Project In-Charge" name={personName(project?.projectIncharge)} email={project?.projectIncharge?.email} />
                    <Team role="Supervisor" name={personName(project?.supervisors?.[0])} email={project?.supervisors?.[0]?.email} />
                    <Team role="Architect" name={personName(project?.consultantArchitect)} email={project?.consultantArchitect?.email} />
                </div>
            </Block>

            <Block title="Additional Information" icon={<FaFileContract className="text-red-500" />}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Info label="Authorized Person" value={project?.authorizedPerson || "Not specified"} />
                    <Info label="Owner Name" value={project?.ownerName || "Not specified"} />
                    <Info label="Designation" value={project?.designation || "Not specified"} />
                    <Info label="Current Location" value={project?.currentLocation || "Not specified"} />
                </div>
            </Block>
        </div>
    );

    // ==================== DOCUMENTS ====================
    const renderDocumentsTab = () => {
        if (totalFiles === 0) {
            return (
                <div className="bg-white rounded-3xl shadow-xl border p-12 text-center">
                    <FaFolderOpen className="mx-auto text-5xl text-slate-300 mb-4" />
                    <p className="text-slate-600 font-medium">No documents uploaded yet</p>
                    <p className="text-sm text-slate-400 mt-1">
                        Upload files from the Edit Project screen.
                    </p>
                </div>
            );
        }

        return (
            <div className="space-y-8">
                {FILE_CATEGORIES.map(({ key, label }) => {
                    const files = toFileArray(project?.files?.[key]);
                    if (files.length === 0) return null;

                    return (
                        <Block
                            key={key}
                            title={`${label} (${files.length})`}
                            icon={<FaFileAlt className="text-blue-500" />}
                        >
                            {console.log(files)}
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {files.map((path, index) => {
                                    const url = getFileUrl(path);
                                    const name = getFileName(path);

                                    if (isImageFile(path)) {
                                        return (
                                            <button
                                                key={`${path}-${index}`}
                                                type="button"
                                                onClick={() => setPreviewImage({ url, name })}
                                                className="group relative aspect-square overflow-hidden rounded-2xl border bg-slate-100 hover:shadow-lg transition"
                                                title={name}
                                            >
                                                <img
                                                    src={url}
                                                    alt={name}
                                                    loading="lazy"
                                                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                                                />
                                            </button>
                                        );
                                    }

                                    return (
                                        <a
                                            key={`${path}-${index}`}
                                            href={url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="aspect-square flex flex-col items-center justify-center gap-2 rounded-2xl border bg-slate-50 hover:bg-blue-50 hover:shadow-lg transition p-3 text-center"
                                            title={name}
                                        >
                                            <FaFileAlt className="text-3xl text-slate-400" />
                                            <span className="text-xs text-slate-600 break-all line-clamp-2">
                                                {name}
                                            </span>
                                        </a>
                                    );
                                })}
                            </div>
                        </Block>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
            <Header
                projectName={project?.projectName}
                client={project?.clientName}
                type={project?.projectType}
                status={getProjectStatus()}
                statusColor={getStatusColor(getProjectStatus())}
            />

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <Tabs active={activeTab} setActive={setActiveTab} />

                <div className="flex gap-4 flex-wrap">
                    {project?.locationMapLink && <Btn label="Share Location" onClick={shareLocation} />}

                    {/* admin: both, manager: supervisor only, supervisor: none */}
                    {role === "admin" && (
                        <Btn
                            label="Assign Manager"
                            onClick={() => {
                                setSelectManager("manager");
                                toggleDrawer();
                            }}
                        />
                    )}
                    {(role === "admin" || role === "manager") && (
                        <Btn
                            label="Assign Supervisor"
                            onClick={() => {
                                setSelectManager("supervisor");
                                toggleDrawer();
                            }}
                        />
                    )}
                </div>
            </div>

            <AssignManager
                isOpen={isDrawerOpen}
                onClose={toggleDrawer}
                id={project?._id}
                selectManager={selectManager}
            />

            {activeTab === "overview" && renderOverviewTab()}
            {activeTab === "details" && renderDetailsTab()}
            {activeTab === "documents" && renderDocumentsTab()}

            {/* Image lightbox */}
            {previewImage && (
                <div
                    className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
                    onClick={() => setPreviewImage(null)}
                >
                    <button
                        type="button"
                        onClick={() => setPreviewImage(null)}
                        className="absolute top-4 right-4 p-3 rounded-full bg-white/10 text-white hover:bg-white/20"
                    >
                        <FaTimes />
                    </button>

                    <div
                        className="max-w-5xl w-full flex flex-col items-center gap-3"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <img
                            src={previewImage.url}
                            alt={previewImage.name}
                            className="max-h-[80vh] max-w-full rounded-xl object-contain"
                        />
                        <div className="flex items-center gap-4 text-white text-sm">
                            <span className="truncate max-w-xs">{previewImage.name}</span>
                            <a
                                href={previewImage.url}
                                target="_blank"
                                rel="noreferrer"
                                className="underline hover:text-blue-300"
                            >
                                Open original
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ================= SMALL COMPONENTS ==================

const Header = ({ projectName, client, type, status, statusColor }) => (
    <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-purple-700 bg-clip-text text-transparent">
                    {projectName}
                </h1>
                <p className="text-lg text-slate-600">
                    {client} • {type}
                </p>
            </div>
            <span
                className={`px-4 py-2 rounded-full text-sm font-medium ${statusColor} self-start sm:self-auto`}
            >
                {status}
            </span>
        </div>
    </div>
);

const Tabs = ({ active, setActive }) => (
    <div className="bg-white p-2 rounded-xl shadow-lg flex flex-wrap">
        {TABS.map((tab) => (
            <button
                key={tab.key}
                onClick={() => setActive(tab.key)}
                className={`px-5 py-2 rounded-lg font-semibold transition-all duration-300 ${active === tab.key
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                    : "text-slate-600"
                    }`}
            >
                {tab.label}
            </button>
        ))}
    </div>
);

const Btn = ({ label, onClick }) => (
    <button
        onClick={onClick}
        className="px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md hover:opacity-90 transition"
    >
        {label}
    </button>
);

const ProjectCard = ({ title, icon, value, children, clickable, onClick }) => (
    <div
        onClick={onClick}
        className={`bg-white rounded-3xl shadow-xl border p-6 ${clickable ? "cursor-pointer hover:scale-105 transition" : ""
            }`}
    >
        <div className="flex justify-between mb-3">
            <h3 className="font-semibold">{title}</h3>
            <div className="p-2 bg-blue-50 rounded-lg">{icon}</div>
        </div>
        <div className="text-3xl font-bold">{value}</div>
        {children}
    </div>
);

const ActionCard = ({ title, icon, onClick, color }) => (
    <div
        onClick={onClick}
        className="bg-white rounded-2xl shadow-lg border p-4 cursor-pointer hover:scale-105 transition transform duration-200"
    >
        <div
            className={`p-3 rounded-xl bg-gradient-to-r ${color} text-white w-12 h-12 flex items-center justify-center mb-3`}
        >
            {icon}
        </div>
        <h4 className="font-semibold text-slate-800">{title}</h4>
        <p className="text-sm text-slate-500 mt-1">Click to view</p>
    </div>
);

const Block = ({ title, icon, children }) => (
    <div className="bg-white rounded-3xl shadow-xl border p-8">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            {icon} {title}
        </h3>
        {children}
    </div>
);

const Info = ({ label, value }) => (
    <div className="flex justify-between gap-4 border-b py-2 text-sm">
        <span className="text-slate-500 font-medium">{label}</span>
        <span className="font-semibold text-slate-900 text-right">{value || "—"}</span>
    </div>
);

const Team = ({ role, name, email }) => (
    <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-4 rounded-2xl text-center shadow">
        <div className="w-14 h-14 mx-auto mb-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full flex items-center justify-center text-lg font-bold">
            {name?.charAt(0) || "?"}
        </div>
        <h4 className="font-semibold">{name}</h4>
        <p className="text-sm text-slate-500">{role}</p>
        {email && <p className="text-xs text-slate-400 truncate">{email}</p>}
    </div>
);