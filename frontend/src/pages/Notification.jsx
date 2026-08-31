import React, { useState } from "react";
import {
    useGetMyNotificationsQuery,
    useMarkNotificationReadMutation,
    useMarkAllNotificationsReadMutation,
} from "../Reduxe/Api";

/**
 * REWRITTEN: this page used a hard-coded fake `notifications` array (10
 * static entries, no backend call at all — "Mark as Read"/"Delete" only
 * mutated local state). Now wired to the real notification system added in
 * the backend feature work (GET/PATCH /api/notifications/*). Deleting a
 * notification isn't supported by the backend (only read/unread), so that
 * option is removed.
 */

const MODULE_ICONS = {
    Labour: "👷",
    Stock: "📦",
    Drawing: "📐",
    Machinery: "🚜",
    EOD: "📋",
    Delay: "⏳",
    General: "🔔",
};

const Notification = () => {
    const [page, setPage] = useState(1);
    const [filter, setFilter] = useState("all"); // all | unread

    const { data, isLoading, isFetching } = useGetMyNotificationsQuery({
        page,
        limit: 20,
        ...(filter === "unread" ? { isRead: false } : {}),
    });

    const [markRead] = useMarkNotificationReadMutation();
    const [markAllRead, { isLoading: markingAll }] = useMarkAllNotificationsReadMutation();

    const items = data?.data?.items || [];
    const unreadCount = data?.data?.unreadCount || 0;
    const pagination = data?.pagination;

    return (
        <div className="p-6 relative max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold">Notifications</h2>
                {unreadCount > 0 && (
                    <button
                        onClick={() => markAllRead()}
                        disabled={markingAll}
                        className="text-sm text-blue-600 hover:underline disabled:opacity-50"
                    >
                        {markingAll ? "Marking..." : `Mark all ${unreadCount} as read`}
                    </button>
                )}
            </div>

            <div className="flex gap-2 mb-4">
                {["all", "unread"].map((f) => (
                    <button
                        key={f}
                        onClick={() => { setFilter(f); setPage(1); }}
                        className={`px-3 py-1.5 rounded-full text-sm border ${filter === f
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                            }`}
                    >
                        {f === "all" ? "All" : `Unread (${unreadCount})`}
                    </button>
                ))}
            </div>

            {isLoading ? (
                <div className="text-center py-10 text-gray-500">Loading...</div>
            ) : items.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center h-[50vh] text-gray-500">
                    <div className="text-5xl mb-2">🔔</div>
                    <h3 className="text-lg font-medium">No Notifications Found</h3>
                    <p className="text-sm text-gray-400">
                        You're all caught up! Nothing new to check right now.
                    </p>
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {items.map((n) => (
                        <div
                            key={n._id}
                            onClick={() => !n.isRead && markRead(n._id)}
                            className={`border rounded-2xl p-4 cursor-pointer transition-all ${!n.isRead
                                ? "bg-blue-50 border-blue-200"
                                : "bg-white border-gray-200 hover:bg-gray-50"
                                }`}
                        >
                            <div className="flex items-start gap-3">
                                <div className="text-2xl">{MODULE_ICONS[n.module] || "🔔"}</div>
                                <div className="flex-1">
                                    <h3 className={`font-medium ${!n.isRead ? "text-blue-900" : "text-gray-800"}`}>
                                        {n.title}
                                    </h3>
                                    <p className="text-sm text-gray-600 mt-0.5">{n.message}</p>
                                    <span className="text-xs text-gray-400">
                                        {new Date(n.createdAt).toLocaleString()}
                                    </span>
                                </div>
                                {!n.isRead && (
                                    <span className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {pagination && pagination.totalPages > 1 && (
                <div className="flex justify-center items-center gap-3 mt-6">
                    <button
                        disabled={page <= 1 || isFetching}
                        onClick={() => setPage((p) => p - 1)}
                        className="px-3 py-1 border rounded-lg disabled:opacity-40"
                    >
                        Prev
                    </button>
                    <span className="text-sm text-gray-600">
                        Page {pagination.page} of {pagination.totalPages}
                    </span>
                    <button
                        disabled={page >= pagination.totalPages || isFetching}
                        onClick={() => setPage((p) => p + 1)}
                        className="px-3 py-1 border rounded-lg disabled:opacity-40"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

export default Notification;
