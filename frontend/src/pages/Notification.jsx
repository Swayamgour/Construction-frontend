import React, { useState } from "react";

export const notifications = [
    {
        id: 1,
        type: "project",
        title: "New Project Assigned",
        message: "You’ve been assigned to the 'Metro Station Phase 2' project.",
        time: "2 hours ago",
        status: "read",
        icon: "🏗️",
        details: {
            projectName: "Metro Station Phase 2",
            assignedBy: "Rohit Sharma (Project Manager)",
            deadline: "Nov 20, 2025",
            location: "Lucknow Sector 7",
            description:
                "This project involves structural design and supervision of the metro station extension. Ensure safety and timeline compliance.",
        },
    },
    {
        id: 2,
        type: "finance",
        title: "Invoice Approved",
        message: "Invoice #INV-2025-011 approved by the Accounts Department.",
        time: "1 day ago",
        status: "read",
        icon: "💰",
        details: {
            invoiceNumber: "INV-2025-011",
            amount: "₹1,25,000",
            approvedBy: "Accounts Dept",
            approvalDate: "Oct 29, 2025",
            description:
                "The invoice for raw material supply has been approved and forwarded for payment processing.",
        },
    },
    {
        id: 3,
        type: "task",
        title: "Task Completed",
        message: "Task 'Foundation Leveling' marked as completed by Rahul Verma.",
        time: "5 hours ago",
        status: "read",
        icon: "✅",
        details: {
            taskName: "Foundation Leveling",
            completedBy: "Rahul Verma (Site Engineer)",
            completionDate: "Oct 30, 2025",
            project: "Metro Station Phase 1",
            description:
                "The leveling task for the foundation section was completed successfully and approved by the QA team.",
        },
    },
    {
        id: 398,
        type: "finance",
        title: "Invoice Approved",
        message: "Invoice #INV-2025-011 approved by the Accounts Department.",
        time: "1 day ago",
        status: "read",
        icon: "💰",
        details: {
            invoiceNumber: "INV-2025-011",
            amount: "₹1,25,000",
            approvedBy: "Accounts Dept",
            approvalDate: "Oct 29, 2025",
            description:
                "The invoice for raw material supply has been approved and forwarded for payment processing.",
        },
    },
    {
        id: 4,
        type: "inventory",
        title: "Low Stock Alert",
        message: "Stock of Cement (Grade 43) is below minimum threshold.",
        time: "3 days ago",
        status: "read",
        icon: "📦",
        details: {
            itemName: "Cement (Grade 43)",
            currentStock: "180 bags",
            minThreshold: "250 bags",
            warehouse: "Kanpur Central Store",
            description:
                "Low stock detected. Please initiate a new purchase order to avoid project delays.",
        },
    },
    {
        id: 5,
        type: "hr",
        title: "Leave Request Approved",
        message: "Your leave request for 2 days (Oct 27–28) has been approved.",
        time: "4 days ago",
        status: "read",
        icon: "🧑‍💼",
        details: {
            employeeName: "Sunny Tiwari",
            leaveType: "Casual Leave",
            duration: "2 Days (Oct 27–28)",
            approvedBy: "Priya Singh (HR Manager)",
            description:
                "Your leave request has been approved. Make sure to complete pending documentation post resumption.",
        },
    },
    {
        id: 6,
        type: "system",
        title: "System Maintenance Scheduled",
        message: "ERP maintenance is scheduled for tonight at 11:00 PM.",
        time: "Yesterday",
        status: "read",
        icon: "⚙️",
        details: {
            scheduledBy: "IT Department",
            maintenanceTime: "11:00 PM – 12:00 AM",
            affectedModules: ["Finance", "Inventory"],
            description:
                "Some ERP services will be temporarily unavailable during the maintenance window. Please save your work beforehand.",
        },
    },
    {
        id: 7,
        type: "vendor",
        title: "New Vendor Registered",
        message: "Vendor 'UltraTech Cement Ltd' has been successfully added.",
        time: "2 days ago",
        status: "read",
        icon: "🏢",
        details: {
            vendorName: "UltraTech Cement Ltd",
            contactPerson: "Rakesh Jain",
            phone: "+91 9876543210",
            email: "rakesh@ultratechcement.com",
            description:
                "New vendor has been added to the database for future procurement of cement and concrete materials.",
        },
    },
    {
        id: 8,
        type: "project",
        title: "Project Deadline Nearing",
        message: "Project 'Highway Bridge A2' deadline due in 3 days.",
        time: "6 hours ago",
        status: "read",
        icon: "📅",
        details: {
            projectName: "Highway Bridge A2",
            deadline: "Nov 2, 2025",
            progress: "88%",
            projectManager: "Nikhil Agarwal",
            description:
                "The project is nearing its deadline. Please ensure all remaining documentation and safety checks are completed.",
        },
    },
    {
        id: 9,
        type: "finance",
        title: "Payment Released",
        message: "₹75,000 payment released to vendor 'Tata Steel Pvt. Ltd'.",
        time: "5 days ago",
        status: "read",
        icon: "💳",
        details: {
            vendor: "Tata Steel Pvt. Ltd",
            amount: "₹75,000",
            paymentDate: "Oct 25, 2025",
            mode: "NEFT",
            description:
                "Payment for steel supply (Invoice #INV-2025-004) has been successfully processed.",
        },
    },
    {
        id: 10,
        type: "security",
        title: "Suspicious Login Attempt",
        message: "Multiple failed login attempts detected on your account.",
        time: "Just now",
        status: "read",
        icon: "🔐",
        details: {
            device: "Windows 10 Chrome Browser",
            ipAddress: "103.91.45.22",
            location: "Delhi, India",
            description:
                "We detected 5 failed login attempts within 10 minutes. If this wasn’t you, please change your password immediately.",
        },
    },
];

const Notification = () => {
    const [openId, setOpenId] = useState(null);
    const [menuId, setMenuId] = useState(null);
    const [data, setData] = useState(notifications);

    const toggleMenu = (id) => {
        setMenuId(menuId === id ? null : id);
    };

    const markAsRead = (id) => {
        setData((prev) =>
            prev.map((n) =>
                n.id === id
                    ? { ...n, status: n.status === "read" ? "unread" : "read" }
                    : n
            )
        );
        setMenuId(null);
    };

    const deleteNotification = (id) => {
        setData((prev) => prev.filter((n) => n.id !== id));
        setMenuId(null);
    };

    return (
        <div className="p-6 relative">
            <h2 className="text-2xl font-semibold mb-4">Notifications</h2>

            {data.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center h-[60vh] text-gray-500 animate-fadeIn">
                    <div className="text-5xl mb-2">🔔</div>
                    <h3 className="text-lg font-medium">No Notifications Found</h3>
                    <p className="text-sm text-gray-400">
                        You’re all caught up! Nothing new to check right now.
                    </p>
                </div>
            ) : (
                <div className="flex flex-col gap-5">
                    {data.map((n) => {
                        const isOpen = openId === n.id;
                        const isMenuOpen = menuId === n.id;

                        return (
                            <div
                                key={n.id}
                                className={`relative border border-black/35 shadow-md rounded-3xl transition-all duration-300 ${n.status === "unread"
                                    ? "bg-blue-50 border-l-4 border-blue-500"
                                    : "bg-white hover:bg-gray-50"
                                    }`}
                            >
                                {/* Header */}
                                <div className="flex items-start justify-between p-4">
                                    <div className="flex items-center gap-4">
                                        <div
                                            className={`text-2xl ${n.status === "unread" ? "opacity-100" : "opacity-70"
                                                }`}
                                        >
                                            {n.icon}
                                        </div>
                                        <div className="flex-1">
                                            <h3
                                                className={`font-medium ${n.status === "unread"
                                                    ? "text-blue-900"
                                                    : "text-gray-800"
                                                    }`}
                                            >
                                                {n.title}
                                            </h3>
                                            <p
                                                className={`text-sm ${n.status === "unread"
                                                    ? "text-gray-700"
                                                    : "text-gray-600"
                                                    }`}
                                            >
                                                {n.message}
                                                <span
                                                    onClick={() => setOpenId(isOpen ? null : n.id)}
                                                    className="block text-[#ea2222] hover:text-[#ef0c0c] font-medium mt-1 cursor-pointer select-none"
                                                >
                                                    {isOpen ? "Hide Details" : "View Details"}
                                                </span>
                                            </p>
                                            <span className="text-xs text-gray-400">{n.time}</span>
                                        </div>
                                    </div>

                                    {/* 3-Dot Menu */}
                                    <div className="relative">
                                        <button
                                            onClick={() => toggleMenu(n.id)}
                                            className="text-gray-500 hover:text-gray-700 text-xl px-2"
                                        >
                                            ⋮
                                        </button>

                                        {isMenuOpen && (
                                            <div className="absolute right-0 top-7 w-40 bg-white border border-gray-200 shadow-lg rounded-xl z-50 animate-fadeIn">
                                                <button
                                                    onClick={() => markAsRead(n.id)}
                                                    className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                                                >
                                                    {n.status === "read"
                                                        ? "Mark as Unread"
                                                        : "Mark as Read"}
                                                </button>
                                                <button
                                                    onClick={() => deleteNotification(n.id)}
                                                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Drawer */}
                                <div
                                    className={`transition-all duration-500 overflow-hidden ${isOpen ? "max-h-[400px] p-4" : "max-h-0 p-0"
                                        }`}
                                >
                                    {isOpen && (
                                        <div className="bg-gray-50 rounded-2xl p-4 border-t border-gray-200 animate-fadeIn">
                                            {n.details &&
                                                Object.entries(n.details).map(([key, value]) => (
                                                    <div key={key} className="mb-2">
                                                        <span className="font-semibold capitalize">
                                                            {key}:{" "}
                                                        </span>
                                                        {Array.isArray(value) ? (
                                                            <span className="text-blue-600 font-medium">
                                                                {value.join(", ")}
                                                            </span>
                                                        ) : (
                                                            <span>{value}</span>
                                                        )}
                                                    </div>
                                                ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
export default Notification;