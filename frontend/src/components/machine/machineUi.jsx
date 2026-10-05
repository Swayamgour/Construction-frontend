import { NavLink } from "react-router-dom";
import { LayoutDashboard, Factory, Truck, Link2, Wrench } from "lucide-react";
import { CheckRole } from "../../helper/CheckRole";

/* ------------------------------------------------------------------ *
 * Shared UI kit for the Machinery module.
 * Status values mirror the backend enums exactly:
 *   Machine.status            -> Available | Assigned | Under Maintenance |
 *                                Breakdown | In Transit | Decommissioned
 *   MachineAssignment.status  -> PENDING | DISPATCHED | ACTIVE | TRANSFERRED | RELEASED
 *   MachineRequest.status     -> REQUESTED | ADMIN_REVIEW | APPROVED | ALLOCATED |
 *                                DISPATCHED | RECEIVED_AT_SITE | ACTIVE | RELEASED | REJECTED
 * ------------------------------------------------------------------ */

const TONES = {
    green: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
    blue: "bg-blue-50 text-blue-700 ring-blue-600/20",
    amber: "bg-amber-50 text-amber-700 ring-amber-600/20",
    red: "bg-red-50 text-red-700 ring-red-600/20",
    purple: "bg-purple-50 text-purple-700 ring-purple-600/20",
    indigo: "bg-indigo-50 text-indigo-700 ring-indigo-600/20",
    teal: "bg-teal-50 text-teal-700 ring-teal-600/20",
    gray: "bg-gray-100 text-gray-600 ring-gray-500/20",
};

export const MACHINE_STATUS_TONE = {
    Available: "green",
    Assigned: "blue",
    "Under Maintenance": "amber",
    Breakdown: "red",
    "In Transit": "purple",
    Decommissioned: "gray",
};

export const REQUEST_STATUS_TONE = {
    REQUESTED: "amber",
    ADMIN_REVIEW: "amber",
    APPROVED: "blue",
    ALLOCATED: "indigo",
    DISPATCHED: "purple",
    RECEIVED_AT_SITE: "teal",
    ACTIVE: "green",
    RELEASED: "gray",
    REJECTED: "red",
    SITE_REJECTED: "red",
    CANCELLED: "gray",
    PENDING: "amber",
    TRANSFERRED: "purple",
};

export const MACHINE_STATUSES = Object.keys(MACHINE_STATUS_TONE);

export function Badge({ tone = "gray", children, className = "" }) {
    return (
        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${TONES[tone] || TONES.gray} ${className}`}>
            {children}
        </span>
    );
}

export function StatusBadge({ status, map = MACHINE_STATUS_TONE }) {
    if (!status) return <Badge>—</Badge>;
    return <Badge tone={map[status] || "gray"}>{String(status).replaceAll("_", " ")}</Badge>;
}

/* ------------------------------ helpers ------------------------------ */

// Backend populates projectId with different field sets in different
// endpoints ("name code" vs "projectName"), so read whichever is there.
export const projectLabel = (p) => {
    if (!p) return "—";
    if (typeof p === "string") return p;
    return p.projectName || p.name || p.code || p.projectCode || "—";
};

export const fmtDate = (d) =>
    d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

export const fmtMoney = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

export const daysUntil = (d) => (d ? Math.ceil((new Date(d) - new Date()) / 86400000) : null);

export const isRented = (m) => String(m?.ownedOrRented || "").toLowerCase() === "rented";

/* ------------------------------ layout ------------------------------ */

const TABS = [
    { to: "/machine/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["admin", "manager", "supervisor"] },
    { to: "/machine/list", label: "Machines", icon: Factory, roles: ["admin", "manager", "supervisor"] },
    { to: "/machinery/requests", label: "Requests", icon: Truck, roles: ["admin", "manager", "supervisor"] },
    { to: "/assign/active", label: "Assignments", icon: Link2, roles: ["admin", "manager", "supervisor"] },
    { to: "/assign", label: "Assign Machine", icon: Wrench, roles: ["manager"] },
];

export function MachineNav() {
    const { role } = CheckRole();
    const tabs = TABS.filter((t) => !role || t.roles.includes(role));
    return (
        <nav className="flex gap-1 overflow-x-auto rounded-xl border border-gray-200 bg-white p-1 shadow-sm">
            {tabs.map(({ to, label, icon: Icon }) => (
                <NavLink
                    key={to}
                    to={to}
                    end
                    className={({ isActive }) =>
                        `flex shrink-0 items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition ${
                            isActive ? "bg-blue-600 text-white shadow-sm" : "text-gray-600 hover:bg-gray-100"
                        }`
                    }
                >
                    <Icon size={16} />
                    {label}
                </NavLink>
            ))}
        </nav>
    );
}

export function MachinePage({ title, subtitle, actions, children }) {
    return (
        <div className="mx-auto max-w-7xl space-y-5 p-4 sm:p-6">
            <MachineNav />
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                    {subtitle && <p className="mt-0.5 text-sm text-gray-500">{subtitle}</p>}
                </div>
                {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
            </div>
            {children}
        </div>
    );
}

export function KpiCard({ label, value, hint, tone = "blue", icon: Icon, onClick }) {
    const ring = {
        blue: "bg-blue-50 text-blue-600",
        green: "bg-emerald-50 text-emerald-600",
        amber: "bg-amber-50 text-amber-600",
        red: "bg-red-50 text-red-600",
        purple: "bg-purple-50 text-purple-600",
        gray: "bg-gray-100 text-gray-600",
    }[tone];
    const Wrapper = onClick ? "button" : "div";
    return (
        <Wrapper
            onClick={onClick}
            className={`rounded-xl border border-gray-200 bg-white p-4 text-left shadow-sm ${onClick ? "transition hover:border-blue-300 hover:shadow" : ""}`}
        >
            <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-500">{label}</p>
                {Icon && (
                    <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${ring}`}>
                        <Icon size={18} />
                    </span>
                )}
            </div>
            <p className="mt-2 text-2xl font-bold text-gray-900">{value}</p>
            {hint && <p className="mt-0.5 text-xs text-gray-400">{hint}</p>}
        </Wrapper>
    );
}

export function EmptyState({ title, children }) {
    return (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white py-12 text-center">
            <p className="font-medium text-gray-700">{title}</p>
            {children && <div className="mt-3">{children}</div>}
        </div>
    );
}

export function Spinner({ label = "Loading..." }) {
    return (
        <div className="flex items-center justify-center py-16 text-gray-500">
            <div className="mr-3 h-6 w-6 animate-spin rounded-full border-b-2 border-blue-600" />
            {label}
        </div>
    );
}

export const btnPrimary =
    "inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-60";
export const btnGhost =
    "inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50";

/* ------------------------------ form kit ------------------------------ */

export const inputCls =
    "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50";

export function Section({ title, hint, children }) {
    return (
        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-4 border-b border-gray-100 pb-3">
                <h2 className="font-semibold text-gray-900">{title}</h2>
                {hint && <p className="mt-0.5 text-xs text-gray-500">{hint}</p>}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">{children}</div>
        </section>
    );
}

export function Field({ label, required, hint, full, children }) {
    return (
        <label className={`block ${full ? "sm:col-span-2" : ""}`}>
            <span className="mb-1 block text-sm font-medium text-gray-700">
                {label} {required && <span className="text-red-500">*</span>}
            </span>
            {children}
            {hint && <span className="mt-1 block text-xs text-gray-400">{hint}</span>}
        </label>
    );
}

export function FileInput({ label, accept, file, onChange, hint }) {
    return (
        <Field label={label} hint={hint}>
            <input
                type="file"
                accept={accept}
                onChange={(e) => onChange(e.target.files?.[0] || null)}
                className="block w-full text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-blue-700 hover:file:bg-blue-100"
            />
            {file && <span className="mt-1 block text-xs text-gray-500">{file.name} · {(file.size / 1024 / 1024).toFixed(2)} MB</span>}
        </Field>
    );
}
