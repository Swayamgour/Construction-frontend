import React, { useState, useEffect } from 'react';
import {
    FaChartLine, FaMoneyBillWave, FaClock, FaTasks, FaRegClock,
    FaCheckCircle, FaArrowRight, FaMapMarkerAlt, FaBuilding,
    FaUserTie, FaPhone, FaHardHat, FaCalendarAlt,
    FaChevronRight, FaRulerCombined, FaExclamationTriangle,
    FaFileContract, FaPlayCircle, FaEnvelope
} from 'react-icons/fa';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckRole } from '../helper/CheckRole';
import AssignManager from '../components/AssignManager';
import { useGetProjectsByIdQuery } from '../Reduxe/Api';

export default function DashboardProject() {
    const { role } = CheckRole();
    const navigate = useNavigate();
    const location = useLocation();

    const projectById = location.state?.project || {};
    const { data: projectData } = useGetProjectsByIdQuery({ id: projectById._id });

    const [progress, setProgress] = useState(16);
    const [activeTab, setActiveTab] = useState("overview");
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [selectManager, setSelectManager] = useState("");

    const toggleDrawer = () => setIsDrawerOpen(!isDrawerOpen);

    const getProgressColor = (p) =>
        p < 30 ? 'from-red-500 to-orange-500' :
            p < 70 ? 'from-amber-500 to-yellow-500' :
                'from-green-500 to-emerald-600';

    const formatDate = (d) => {
        if (!d) return 'Not set';
        return new Date(d).toLocaleDateString('en-IN', {
            day: 'numeric', month: 'short', year: 'numeric'
        });
    };

    const getDaysRemaining = (endDate) => {
        if (!endDate) return 'N/A';
        const end = new Date(endDate);
        const today = new Date();
        const diffTime = end - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? `${diffDays} days` : 'Overdue';
    };

    const getProjectStatus = () => {
        if (!projectData?.actualStartDate) return 'Not Started';
        if (projectData?.actualCompletionDate) return 'Completed';
        if (projectData?.actualStartDate) return 'In Progress';
        return 'Planning';
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Completed': return 'text-green-600 bg-green-50';
            case 'In Progress': return 'text-blue-600 bg-blue-50';
            case 'Not Started': return 'text-gray-600 bg-gray-50';
            case 'Overdue': return 'text-red-600 bg-red-50';
            default: return 'text-yellow-600 bg-yellow-50';
        }
    };

    const shareLocation = () => {
        const link = projectData?.locationMapLink;

        if (!link) {
            alert("No link found");
            return;
        }

        // Check if Web Share API is supported
        if (navigator.share) {
            navigator.share({
                title: "Project Location",
                text: "Here is the project location link:",
                url: link
            })
                .then(() => console.log("Shared successfully"))
                .catch((err) => console.log("Share failed", err));
        } else {
            // Fallback for unsupported browsers
            alert("Sharing not supported on this device");
        }
    };


    // ==================== OVERVIEW UI ====================
    const renderOverviewTab = () => (
        <div className="space-y-8">
            {/* Project Status Card */}
            <div className="bg-white rounded-3xl shadow-xl border p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold">Project Status</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(getProjectStatus())}`}>
                        {getProjectStatus()}
                    </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-slate-50 rounded-xl">
                        <p className="text-sm text-slate-600">Start Date</p>
                        <p className="font-semibold">{formatDate(projectData?.actualStartDate || projectData?.expectedStartDate)}</p>
                        <p className="text-xs text-slate-500">
                            {projectData?.actualStartDate ? 'Actual' : 'Expected'}
                        </p>
                    </div>
                    <div className="text-center p-4 bg-slate-50 rounded-xl">
                        <p className="text-sm text-slate-600">Completion Date</p>
                        <p className="font-semibold">{formatDate(projectData?.actualCompletionDate || projectData?.expectedCompletionDate)}</p>
                        <p className="text-xs text-slate-500">
                            {projectData?.actualCompletionDate ? 'Actual' : 'Expected'}
                        </p>
                    </div>
                    <div className="text-center p-4 bg-slate-50 rounded-xl">
                        <p className="text-sm text-slate-600">Time Remaining</p>
                        <p className="font-semibold">{getDaysRemaining(projectData?.expectedCompletionDate)}</p>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <ProjectCard title="Progress" icon={<FaChartLine />} value={`${progress}%`}>
                    <div className="w-full bg-slate-200 rounded-full h-3 mt-2">
                        <div className={`h-full rounded-full bg-gradient-to-r ${getProgressColor(progress)}`} style={{ width: `${progress}%` }}></div>
                    </div>
                </ProjectCard>

                <ProjectCard title="Team Size" icon={<FaHardHat />} value={projectData?.labours?.length || 0}>
                    <p className="text-sm text-slate-600">Labours assigned</p>
                </ProjectCard>

                <ProjectCard title="Built-up Area" icon={<FaRulerCombined />} value={`${projectData?.builtUpArea} sq.ft`} />

                <ProjectCard title="Duration" icon={<FaClock />} value={getDaysRemaining(projectData?.expectedCompletionDate)} />
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-3xl shadow-xl border p-6">
                <h3 className="text-xl font-bold mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {console.log(projectById)}
                    <ActionCard
                        title="View Tasks"
                        icon={<FaTasks />}
                        onClick={() => navigate(`/MyTasks/${projectById?._id}`)}
                        color="from-blue-500 to-cyan-500"
                    />
                    <ActionCard
                        title="Team Management"
                        icon={<FaUserTie />}
                        onClick={() => {/* Navigate to team management */ }}
                        color="from-green-500 to-emerald-500"
                    />
                    <ActionCard
                        title="Site Photos"
                        icon={<FaBuilding />}
                        onClick={() => {/* Navigate to photos */ }}
                        color="from-purple-500 to-pink-500"
                    />
                    <ActionCard
                        title="Documents"
                        icon={<FaFileContract />}
                        onClick={() => {/* Navigate to documents */ }}
                        color="from-orange-500 to-red-500"
                    />
                </div>
            </div>
        </div>
    );

    // ==================== DETAILS UI ====================
    const renderDetailsTab = () => (
        <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Block title="Project Information" icon={<FaBuilding className="text-blue-500" />}>
                    <Info label="Project Name" value={projectData?.projectName} />
                    <Info label="Type" value={projectData?.projectType} />
                    <Info label="Work Scope" value={projectData?.workScope} />
                    <Info label="Contract" value={projectData?.contractType} />
                    <Info label="Project Code" value={projectData?.projectCode} />
                    <Info label="Built-up Area" value={`${projectData?.builtUpArea} sq.ft`} />
                </Block>

                <Block title="Client & Company" icon={<FaUserTie className="text-purple-500" />}>
                    <Info label="Client" value={projectData?.clientName} />
                    <Info label="Company Name" value={projectData?.companyName} />
                    <Info label="GST" value={projectData?.gst} />
                    <Info label="Contact" value={projectData?.contactNumber} />
                    <Info label="Email" value={projectData?.email} />
                    <Info label="Alternate Contact" value={projectData?.alternateContact || 'Not provided'} />
                </Block>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Block title="Site Location" icon={<FaMapMarkerAlt className="text-green-500" />}>
                    <Info label="Location" value={projectData?.siteLocation} />
                    <Info label="City" value={projectData?.city} />
                    <Info label="State" value={projectData?.state} />
                    <Info label="Pincode" value={projectData?.pinCode} />
                    <Info label="Landmark" value={projectData?.landmark || 'Not specified'} />
                </Block>

                <Block title="Timeline & Dates" icon={<FaCalendarAlt className="text-amber-500" />}>
                    <Info label="Work Order Date" value={formatDate(projectData?.workOrderDate)} />
                    <Info label="Expected Start" value={formatDate(projectData?.expectedStartDate)} />
                    <Info label="Actual Start" value={formatDate(projectData?.actualStartDate) || 'Not started'} />
                    <Info label="Expected Completion" value={formatDate(projectData?.expectedCompletionDate)} />
                    <Info label="Actual Completion" value={formatDate(projectData?.actualCompletionDate) || 'Not completed'} />
                </Block>
            </div>

            <Block title="Project Team" icon={<FaHardHat className="text-cyan-500" />}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Team role="Created By" name={projectData?.createdBy?.name} email={projectData?.createdBy?.email} />
                    <Team role="Manager" name={projectData?.managerId?.name || "Not Assigned"} email={projectData?.managerId?.email} />
                    <Team role="Supervisor" name={projectData?.supervisors?.[0]?.name || "Not Assigned"} email={projectData?.supervisors?.[0]?.email} />
                    {/* {console.log(projectData)} */}
                    <Team role="Architect" name={projectData?.consultantArchitect || "Not Assigned"} />
                </div>
            </Block>

            {/* Additional Information */}
            <Block title="Additional Information" icon={<FaFileContract className="text-red-500" />}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Info label="Authorized Person" value={projectData?.authorizedPerson || 'Not specified'} />
                    <Info label="Owner Name" value={projectData?.ownerName || 'Not specified'} />
                    <Info label="Designation" value={projectData?.designation || 'Not specified'} />
                    <Info label="Current Location" value={projectData?.currentLocation || 'Not specified'} />
                </div>
            </Block>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
            <Header
                projectName={projectData?.projectName}
                client={projectData?.clientName}
                type={projectData?.projectType}
                status={getProjectStatus()}
                statusColor={getStatusColor(getProjectStatus())}
            />

            {/* BTN Row */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <Tabs active={activeTab} setActive={setActiveTab} />

                <div className="flex gap-4 flex-wrap">
                    {/* {role !== 'manager' && ( */}
                    {/* <Btn label="Assign Manager" onClick={() => { setSelectManager('manager'); toggleDrawer(); }} /> */}
                    {/* )} */}

                    {projectData?.locationMapLink &&
                        <button onClick={() => shareLocation()} className="px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md hover:opacity-90 transition" >
                            Share Location
                        </button>
                    }

                    {role !== 'manager' && (
                        <Btn label="Assign Manager" onClick={() => { setSelectManager('manager'); toggleDrawer(); }} />
                    )}
                    {role !== 'supervisor' && (
                        <Btn label="Assign Supervisor" onClick={() => { setSelectManager('supervisor'); toggleDrawer(); }} />
                    )}
                </div>
            </div>

            <AssignManager
                isOpen={isDrawerOpen}
                onClose={toggleDrawer}
                id={projectData?._id}
                selectManager={selectManager}
            />

            {activeTab === "overview" ? renderOverviewTab() : renderDetailsTab()}
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
                <p className="text-lg text-slate-600">{client} • {type}</p>
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-medium ${statusColor} self-start sm:self-auto`}>
                {status}
            </span>
        </div>
    </div>
);

const Tabs = ({ active, setActive }) => (
    <div className="bg-white p-2 rounded-xl shadow-lg flex">
        {["overview", "details"].map(tab => (
            <button key={tab}
                onClick={() => setActive(tab)}
                className={`px-6 py-2 rounded-lg font-semibold transition-all duration-300 
                ${active === tab ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                        : "text-slate-600"}`}>
                {tab === "overview" ? "Project Overview" : "Project Details"}
            </button>
        ))}
    </div>
);

const Btn = ({ label, onClick }) => (
    <button onClick={onClick}
        className="px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md hover:opacity-90 transition">
        {label}
    </button>
);

const ProjectCard = ({ title, icon, value, children, clickable, onClick }) => (
    <div onClick={onClick}
        className={`bg-white rounded-3xl shadow-xl border p-6 ${clickable && "cursor-pointer hover:scale-105 transition"} `}>
        <div className="flex justify-between mb-3">
            <h3 className="font-semibold">{title}</h3>
            <div className="p-2 bg-blue-50 rounded-lg">{icon}</div>
        </div>
        <div className="text-3xl font-bold">{value}</div>
        {children}
    </div>
);

const ActionCard = ({ title, icon, onClick, color }) => (
    <div onClick={onClick}
        className="bg-white rounded-2xl shadow-lg border p-4 cursor-pointer hover:scale-105 transition transform duration-200">
        <div className={`p-3 rounded-xl bg-gradient-to-r ${color} text-white w-12 h-12 flex items-center justify-center mb-3`}>
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
    <div className="flex justify-between border-b py-2 text-sm">
        <span className="text-slate-500 font-medium">{label}</span>
        <span className="font-semibold text-slate-900">{value}</span>
    </div>
);

const Team = ({ role, name, email }) => (
    <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-4 rounded-2xl text-center shadow">
        <div className="w-14 h-14 mx-auto mb-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full flex items-center justify-center text-lg font-bold">
            {name?.charAt(0) || '?'}
        </div>
        <h4 className="font-semibold">{name}</h4>
        <p className="text-sm text-slate-500">{role}</p>
        {email && <p className="text-xs text-slate-400 truncate">{email}</p>}
    </div>
);