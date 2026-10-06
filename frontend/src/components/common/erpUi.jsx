import React from "react";
import { CheckCircle2, AlertTriangle, AlertCircle, Info, ChevronRight, Loader2, X } from "lucide-react";

/**
 * ============================================================================
 * CONSTRUCTION ERP — UNIFIED MASTER UI / DESIGN SYSTEM
 * ============================================================================
 * One consistent component system across all ERP modules:
 * - PageContainer & PageHeader
 * - KpiCard
 * - StatusBadge
 * - Button & Action Hierarchy (Primary, Approval, Danger, Secondary, Ghost)
 * - FormSection, FormField, Input, Select, Textarea
 * - EmptyState, LoadingState, ErrorState
 * - ConfirmModal
 * - PermissionGuard & RoleGuard
 * - Formatters (fmtDate, fmtMoney, fmtTime, daysUntil)
 * ============================================================================
 */

/* -------------------------------------------------------------------------- */
/*  1. FORMATTERS                                                             */
/* -------------------------------------------------------------------------- */

export const fmtDate = (d) => {
    if (!d) return "—";
    const date = new Date(d);
    if (isNaN(date.getTime())) return String(d);
    return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
};

export const fmtTime = (d) => {
    if (!d) return "—";
    const date = new Date(d);
    if (isNaN(date.getTime())) return String(d);
    return date.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
    });
};

export const fmtMoney = (v) => {
    if (v === undefined || v === null || v === "") return "₹0";
    const num = Number(v) || 0;
    return `₹${num.toLocaleString("en-IN")}`;
};

export const daysUntil = (d) => {
    if (!d) return null;
    const diff = new Date(d).setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0);
    return Math.ceil(diff / 86400000);
};

/* -------------------------------------------------------------------------- */
/*  2. STATUS SYSTEM & BADGES                                                 */
/* -------------------------------------------------------------------------- */

export const STATUS_TONE_MAP = {
    // Green / Success
    APPROVED: "emerald",
    ACCEPTED: "emerald",
    ACTIVE: "emerald",
    COMPLETED: "emerald",
    AVAILABLE: "emerald",
    PAID: "emerald",
    VERIFIED: "emerald",
    IN_STOCK: "emerald",
    PRESENT: "emerald",
    GOOD: "emerald",

    // Blue / In Progress / Info
    IN_PROGRESS: "blue",
    ALLOCATED: "blue",
    DISPATCHED: "blue",
    RECEIVED: "blue",
    RECEIVED_AT_SITE: "blue",
    ASSIGNED: "blue",
    ORDERED: "blue",
    ISSUED: "blue",
    PLANNING: "blue",

    // Amber / Pending / Waiting
    REQUESTED: "amber",
    PENDING: "amber",
    SUBMITTED: "amber",
    IN_REVIEW: "amber",
    DRAFT: "amber",
    ON_HOLD: "amber",
    UNDER_MAINTENANCE: "amber",
    MAINTENANCE: "amber",
    HALF_DAY: "amber",
    OVERDUE: "amber",
    LOW: "amber",

    // Rose / Danger / Negative
    REJECTED: "rose",
    CANCELLED: "rose",
    BREAKDOWN: "rose",
    DECOMMISSIONED: "rose",
    ABSENT: "rose",
    RETURNED: "rose",
    DAMAGED: "rose",
    HIGH: "rose",
    CRITICAL: "rose",

    // Purple / Indigo
    IN_TRANSIT: "purple",
    TRANSFERRED: "purple",
    VENDOR_SELECTED: "purple",

    // Slate / Neutral
    RELEASED: "slate",
    CLOSED: "slate",
    ARCHIVED: "slate",
    MEDIUM: "slate",
};

const TONE_CLASSES = {
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    amber: "bg-amber-50 text-amber-800 border-amber-200",
    rose: "bg-rose-50 text-rose-700 border-rose-200",
    purple: "bg-purple-50 text-purple-700 border-purple-200",
    teal: "bg-teal-50 text-teal-700 border-teal-200",
    slate: "bg-slate-100 text-slate-700 border-slate-200",
};

export function StatusBadge({ status, tone, className = "" }) {
    if (!status && status !== 0) return <span className="text-slate-400 text-xs">—</span>;

    const normalized = String(status).toUpperCase().replace(/[\s-]/g, "_");
    const chosenTone = tone || STATUS_TONE_MAP[normalized] || "slate";
    const toneCls = TONE_CLASSES[chosenTone] || TONE_CLASSES.slate;

    // Display formatted name (e.g. RECEIVED_AT_SITE -> Received at Site)
    const displayName = String(status)
        .replace(/_/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());

    return (
        <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${toneCls} ${className}`}
        >
            <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-70" />
            {displayName}
        </span>
    );
}

/* -------------------------------------------------------------------------- */
/*  3. PAGE CONTAINER & PAGE HEADER                                           */
/* -------------------------------------------------------------------------- */

export function PageContainer({ children, className = "" }) {
    return (
        <div className={`mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-6 ${className}`}>
            {children}
        </div>
    );
}

export function PageHeader({ title, subtitle, breadcrumb, badge, actions, children }) {
    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5">
            <div>
                {breadcrumb && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1.5 font-medium">
                        {breadcrumb}
                    </div>
                )}
                <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
                    {badge}
                </div>
                {subtitle && <p className="mt-1 text-sm text-slate-500 max-w-3xl">{subtitle}</p>}
                {children}
            </div>
            {actions && <div className="flex flex-wrap items-center gap-2.5 shrink-0">{actions}</div>}
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/*  4. KPI / SUMMARY CARDS                                                    */
/* -------------------------------------------------------------------------- */

export function KpiCard({ label, value, hint, tone = "blue", icon: Icon, onClick, className = "" }) {
    const toneMap = {
        blue: { icon: "bg-blue-50 text-blue-600", border: "border-blue-100" },
        green: { icon: "bg-emerald-50 text-emerald-600", border: "border-emerald-100" },
        amber: { icon: "bg-amber-50 text-amber-600", border: "border-amber-100" },
        red: { icon: "bg-rose-50 text-rose-600", border: "border-rose-100" },
        purple: { icon: "bg-purple-50 text-purple-600", border: "border-purple-100" },
        teal: { icon: "bg-teal-50 text-teal-600", border: "border-teal-100" },
        slate: { icon: "bg-slate-100 text-slate-600", border: "border-slate-200" },
    };
    const t = toneMap[tone] || toneMap.blue;

    const clickable = typeof onClick === "function";

    return (
        <div
            onClick={onClick}
            className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 ${
                clickable ? "cursor-pointer hover:border-slate-300 hover:shadow-md hover:-translate-y-0.5" : ""
            } ${className}`}
        >
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</p>
                    <p className="mt-2 text-2xl font-black text-slate-900">{value ?? 0}</p>
                    {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
                </div>
                {Icon && (
                    <div className={`rounded-xl p-3 ${t.icon}`}>
                        <Icon size={20} />
                    </div>
                )}
            </div>
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/*  5. BUTTONS & ACTION HIERARCHY                                             */
/* -------------------------------------------------------------------------- */

export const btnPrimary =
    "inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed";

export const btnApproval =
    "inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed";

export const btnDanger =
    "inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed";

export const btnSecondary =
    "inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed";

export const btnGhost =
    "inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all disabled:opacity-60 disabled:cursor-not-allowed";

export function Button({
    children,
    variant = "primary", // "primary" | "approval" | "danger" | "secondary" | "ghost"
    loading = false,
    disabled = false,
    className = "",
    icon: Icon,
    ...props
}) {
    const variantCls = {
        primary: btnPrimary,
        approval: btnApproval,
        danger: btnDanger,
        secondary: btnSecondary,
        ghost: btnGhost,
    }[variant] || btnPrimary;

    return (
        <button
            disabled={disabled || loading}
            className={`${variantCls} ${className}`}
            {...props}
        >
            {loading ? (
                <Loader2 size={16} className="animate-spin" />
            ) : (
                Icon && <Icon size={16} />
            )}
            {children}
        </button>
    );
}

/* -------------------------------------------------------------------------- */
/*  6. FORM SYSTEM                                                            */
/* -------------------------------------------------------------------------- */

export const inputCls =
    "w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:bg-slate-50 disabled:text-slate-500";

export function FormSection({ title, subtitle, children, className = "" }) {
    return (
        <div className={`rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm space-y-4 ${className}`}>
            {(title || subtitle) && (
                <div className="border-b border-slate-100 pb-3">
                    {title && <h2 className="text-base font-semibold text-slate-900">{title}</h2>}
                    {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
                </div>
            )}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {children}
            </div>
        </div>
    );
}

export function FormField({ label, required, hint, error, full, children }) {
    return (
        <div className={`space-y-1.5 ${full ? "sm:col-span-2 lg:col-span-3" : ""}`}>
            {label && (
                <label className="block text-xs font-semibold text-slate-700">
                    {label}
                    {required && <span className="ml-1 text-rose-500">*</span>}
                </label>
            )}
            {children}
            {hint && <p className="text-xs text-slate-400">{hint}</p>}
            {error && <p className="text-xs font-medium text-rose-600">{error}</p>}
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/*  7. EMPTY, LOADING, ERROR STATES                                           */
/* -------------------------------------------------------------------------- */

export function EmptyState({
    title = "No records found",
    subtitle = "Try adjusting your filters or search terms, or create a new entry.",
    action,
    icon: Icon = Info,
}) {
    return (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm">
            <div className="rounded-2xl bg-slate-100 p-4 text-slate-500 mb-3">
                <Icon size={32} />
            </div>
            <h3 className="text-base font-semibold text-slate-800">{title}</h3>
            <p className="mt-1 text-sm text-slate-500 max-w-sm">{subtitle}</p>
            {action && <div className="mt-5">{action}</div>}
        </div>
    );
}

export function Spinner({ message = "Loading data...", size = 28 }) {
    return (
        <div className="flex flex-col items-center justify-center p-12 text-slate-500">
            <Loader2 size={size} className="animate-spin text-blue-600" />
            {message && <p className="mt-3 text-sm font-medium text-slate-500">{message}</p>}
        </div>
    );
}

export function ErrorState({ title = "Failed to load data", message, onRetry }) {
    return (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-800">
            <div className="flex items-start gap-3">
                <AlertCircle size={22} className="text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                    <h3 className="font-semibold text-sm">{title}</h3>
                    <p className="text-xs text-rose-700 mt-1">
                        {message || "An unexpected error occurred while communicating with the server."}
                    </p>
                    {onRetry && (
                        <button
                            onClick={onRetry}
                            className="mt-3 text-xs font-semibold px-3 py-1.5 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition"
                        >
                            Retry Request
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/*  8. CONFIRMATION MODAL                                                     */
/* -------------------------------------------------------------------------- */

export function ConfirmModal({
    isOpen,
    title = "Are you sure?",
    description,
    confirmText = "Confirm",
    cancelText = "Cancel",
    confirmVariant = "primary", // "primary" | "approval" | "danger"
    isLoading = false,
    onConfirm,
    onClose,
}) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-start justify-between">
                    <h3 className="text-lg font-bold text-slate-900">{title}</h3>
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
                    >
                        <X size={18} />
                    </button>
                </div>
                {description && <p className="text-sm text-slate-600">{description}</p>}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                    <Button variant="secondary" onClick={onClose} disabled={isLoading}>
                        {cancelText}
                    </Button>
                    <Button variant={confirmVariant} onClick={onConfirm} loading={isLoading}>
                        {confirmText}
                    </Button>
                </div>
            </div>
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/*  9. PERMISSION / ROLE GUARD                                                */
/* -------------------------------------------------------------------------- */

export function PermissionGuard({ allowed, fallback = null, children }) {
    if (!allowed) return fallback;
    return <>{children}</>;
}
