import {
    HiOutlinePencil,
    HiOutlineUserGroup,
    HiOutlineTag,
    HiOutlineThumbUp,
    HiOutlineClipboardList,
    HiOutlineTruck,
    HiOutlineDocumentText,
} from "react-icons/hi";
import { useNavigate } from "react-router-dom";

export default function Setting() {
    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h1 className="text-xl sm:text-2xl font-normal bg-gradient-to-r from-slate-900 via-blue-800 to-purple-700 bg-clip-text text-transparent">
                    Settings
                </h1>
            </div>

            {/* Project Profile Section */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-100">
                <div className="flex justify-between items-start mb-4">
                    <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                        Project Profile
                    </h2>
                    <button className="flex items-center gap-1 text-blue-600 text-sm font-medium hover:underline">
                        <HiOutlinePencil className="w-4 h-4" /> Edit
                    </button>
                </div>

                <div className="space-y-3">
                    <p className="text-sm text-gray-500">Project Name</p>
                    <p className="text-lg font-medium text-gray-900">S S Construction</p>
                    <button className="border border-blue-500 text-blue-600 px-4 py-1.5 rounded-md text-sm font-medium hover:bg-blue-50">
                        Add Project Details
                    </button>
                </div>
            </div>

            {/* Other Settings Section */}
            <div>
                <h2 className="text-sm font-semibold text-gray-600 uppercase mb-4">
                    Other Settings
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    <SettingCard
                        icon={<HiOutlineUserGroup className="w-8 h-8 text-blue-500" />}
                        title="Project Members"
                        desc="Add and manage members for this project."
                    />
                    <SettingCard
                        icon={<HiOutlineTag className="w-8 h-8 text-blue-500" />}
                        title="Purchase Order Settings"
                        desc="Manage purchase order configurations."
                    />
                    <SettingCard
                        icon={<HiOutlineThumbUp className="w-8 h-8 text-blue-500" />}
                        title="Approval Settings"
                        desc="All modules."
                    />
                    <SettingCard
                        icon={<HiOutlineClipboardList className="w-8 h-8 text-blue-500" />}
                        title="Task Custom Field Settings"
                        desc="Configure custom fields for tasks."
                    />
                    <SettingCard
                        icon={<HiOutlineTruck className="w-8 h-8 text-blue-500" />}
                        title="Material Custom Field Settings"
                        desc="Manage custom fields for materials."
                    />
                    <SettingCard
                        icon={<HiOutlineDocumentText className="w-8 h-8 text-blue-500" />}
                        title="Team Attendance Settings"
                        desc="Control attendance tracking."
                    />
                </div>

                {/* S-Curve Option */}
                <div className="mt-8 bg-white border border-gray-100 rounded-xl shadow-sm p-5 flex items-center justify-between hover:shadow-md transition-all cursor-pointer">
                    <div className="flex items-center gap-3">
                        <HiOutlineUserGroup className="w-8 h-8 text-blue-500" />
                        <div>
                            <h3 className="font-medium text-gray-800 text-sm">S-Curve</h3>
                            <p className="text-xs text-gray-500 mt-1">
                                Enable and manage S-Curve for this project.
                            </p>
                        </div>
                    </div>

                    {/* Toggle Button */}
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                    </label>
                </div>
            </div>
        </div>
    );
}

function SettingCard({ icon, title, desc }) {
    const navigate = useNavigate()
    return (
        <div onClick={() => navigate('/ApprovalSettings')} className="bg-white border border-gray-100 rounded-xl shadow-sm p-5 hover:shadow-md transition-all cursor-pointer flex flex-col items-start gap-3">
            {icon}
            <div>
                <h3 className="font-medium text-gray-800 text-sm">{title}</h3>
                <p className="text-xs text-gray-500 mt-1">{desc}</p>
            </div>
        </div>
    );
}
