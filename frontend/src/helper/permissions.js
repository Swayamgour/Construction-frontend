/**
 * CONSTRUCTION ERP — CENTRAL ROLE & PERMISSION SYSTEM (RBAC)
 *
 * Master Architecture:
 * - ADMIN: Control & Approval Layer (View, Review, Approve, Reject, Accept, Monitor, Report, Audit)
 * - MANAGER: Operations & Management Layer (Create, Request, Allocate, Assign, Dispatch, Receive, Transfer, Release, Operate)
 * - SUPERVISOR: Site Execution Layer (Daily Operations, Attendance, Tasks, Material Requests, Logs within assigned project)
 * - OPERATOR / LABOUR: Execution & Self-Service (Assigned machine/task, punch attendance, daily usage log)
 * - STOREKEEPER: Stock, GRN, Issue, Inventory Operations
 * - ACCOUNTANT: Payments, Financial Ledger, Invoices
 *
 * Golden Rules:
 * 1. Admin NEVER performs day-to-day operational mutations (no create/assign/dispatch/transfer/release).
 * 2. Manager NEVER performs Admin approvals or final rejections.
 * 3. Supervisor and Manager are scoped to their assigned project(s).
 */

export const ROLES = Object.freeze({
    ADMIN: "admin",
    MANAGER: "manager",
    SUPERVISOR: "supervisor",
    STOREKEEPER: "storekeeper",
    ACCOUNTANT: "accountant",
    OPERATOR: "operator",
    LABOUR: "labour",
    DRAWING_MANAGER: "drawing_manager",
});

/**
 * Returns a standardized, normalized permissions object for any role.
 * @param {string} roleName
 * @returns {object} module-specific capability booleans
 */
export const getPermissions = (roleName) => {
    const r = (roleName || "").trim().toLowerCase();

    const isAdmin = r === ROLES.ADMIN;
    const isManager = r === ROLES.MANAGER;
    const isSupervisor = r === ROLES.SUPERVISOR;
    const isStorekeeper = r === ROLES.STOREKEEPER;
    const isAccountant = r === ROLES.ACCOUNTANT;
    const isOperator = r === ROLES.OPERATOR;
    const isLabour = r === ROLES.LABOUR;
    const isDrawingManager = r === ROLES.DRAWING_MANAGER;

    return {
        role: r,
        isAdmin,
        isManager,
        isSupervisor,
        isStorekeeper,
        isAccountant,
        isOperator,
        isLabour,
        isDrawingManager,

        // ==========================================
        // 1. PROJECT MODULE
        // ==========================================
        project: {
            canViewAll: isAdmin,
            canViewAssigned: isManager || isSupervisor,
            canCreate: isManager, // Admin monitors projects; Manager handles operational creation
            canEdit: isManager,
            canDelete: false, // Protected
            canAssignMembers: isAdmin || isManager,
        },

        // ==========================================
        // 2. LABOUR MODULE
        // ==========================================
        labour: {
            canView: true,
            canViewAll: isAdmin,
            canViewAssigned: isManager || isSupervisor,
            canCreate: isManager,
            canEdit: isManager,
            canAssign: isManager,
            canTransfer: isManager,
            canViewHistory: true,
            canViewOvertime: true,
            canApplyOvertime: isManager || isSupervisor,
            canApproveOvertime: isAdmin,
            canRejectOvertime: isAdmin,
        },

        // ==========================================
        // 3. ATTENDANCE MODULE
        // ==========================================
        attendance: {
            canView: true,
            canMark: isManager || isSupervisor || isLabour || isOperator,
            canManageProjectAttendance: isManager || isSupervisor,
            canApprove: isAdmin,
            canReject: isAdmin,
            canViewReports: true,
        },

        // ==========================================
        // 4. MACHINE MODULE
        // ==========================================
        machine: {
            canView: true,
            canViewAll: isAdmin,
            canViewDetails: true,
            canCreate: isManager,
            canEdit: isManager,
            canDelete: false,
            canRequest: isManager || isSupervisor,
            canCancelRequest: isManager || isSupervisor,
            canApproveRequest: isAdmin,
            canRejectRequest: isAdmin,
            canAllocate: isManager,
            canProcureVendor: isManager,
            canDispatch: isManager,
            canReceiveAtSite: isManager || isSupervisor,
            canSiteReject: isManager || isSupervisor,
            canAssignOperator: isManager,
            canLogDailyUsage: isManager || isSupervisor || isOperator,
            canApproveOperatorLog: isAdmin,
            canAddMaintenance: isManager || isSupervisor,
            canResolveMaintenance: isManager,
            canTransfer: isManager,
            canRelease: isManager,
            canUploadDocument: isManager || isSupervisor,
            canVerifyDocument: isAdmin,
        },

        // ==========================================
        // 5. MATERIAL & STOCK MODULE
        // ==========================================
        stock: {
            canView: true,
            canViewAll: isAdmin,
            canRequest: isManager || isSupervisor || isStorekeeper,
            canCancelRequest: isManager || isSupervisor,
            canApproveRequest: isAdmin,
            canRejectRequest: isAdmin,
            canIssue: isManager || isStorekeeper,
            canReceive: isManager || isStorekeeper || isSupervisor,
            canTransfer: isManager || isStorekeeper,
            canConsume: isManager || isSupervisor,
            canReturn: isManager || isStorekeeper || isSupervisor,
            canAdjust: isManager || isStorekeeper,
        },

        // ==========================================
        // 6. PROCUREMENT & PURCHASE ORDERS
        // ==========================================
        purchase: {
            canView: true,
            canCreatePO: isManager || isStorekeeper,
            canSubmitPO: isManager,
            canApprovePO: isAdmin,
            canRejectPO: isAdmin,
            canReceiveGRN: isManager || isStorekeeper || isSupervisor,
        },

        // ==========================================
        // 7. VENDOR MODULE
        // ==========================================
        vendor: {
            canView: true,
            canCreate: isManager,
            canEdit: isManager,
            canManage: isManager,
            canApprove: isAdmin,
        },

        // ==========================================
        // 8. TASK MODULE
        // ==========================================
        task: {
            canView: true,
            canCreate: isManager,
            canAssign: isManager,
            canEdit: isManager,
            canUpdateProgress: isManager || isSupervisor || isOperator || isLabour,
            canComplete: isManager,
        },

        // ==========================================
        // 9. DRAWINGS & SITE DOCUMENTS
        // ==========================================
        drawing: {
            canView: true,
            canUpload: isManager || isSupervisor || isDrawingManager,
            canApprove: isAdmin,
            canReject: isAdmin,
        },

        // ==========================================
        // 10. EOD REPORTS & DELAYS
        // ==========================================
        eod: {
            canView: true,
            canCreate: isManager || isSupervisor,
            canReview: isAdmin,
        },
        delay: {
            canView: true,
            canReport: isManager || isSupervisor,
            canResolve: isManager,
        },

        // ==========================================
        // 11. REPORTS & AUDIT LOGS
        // ==========================================
        report: {
            canViewCompanyWide: isAdmin,
            canViewProjectScoped: isManager || isSupervisor,
        },
        audit: {
            canView: isAdmin,
        },

        // ==========================================
        // 12. USER MANAGEMENT & RBAC
        // ==========================================
        user: {
            canView: isAdmin,
            canCreateRole: isAdmin,
            canManageUsers: isAdmin,
        },
    };
};

/**
 * Backward compatibility alias for machine module.
 */
export const getMachinePermissions = (role) => {
    const p = getPermissions(role);
    return {
        ...p,
        ...p.machine,
        canViewMachines: p.machine.canView,
        canViewRequests: p.machine.canView,
        canViewHistory: p.machine.canView,
        canViewDocuments: p.machine.canView,
        canViewUsage: p.machine.canView,
        canViewMaintenance: p.machine.canView,
        canViewReports: p.report.canViewCompanyWide || p.report.canViewProjectScoped,
        canViewAudit: p.audit.canView,
        canAddMachine: p.machine.canCreate,
        canEditMachine: p.machine.canEdit,
        canDeleteMachine: p.machine.canDelete,
        canCreateRequest: p.machine.canRequest,
        canAllocateMachine: p.machine.canAllocate,
        canDispatchMachine: p.machine.canDispatch,
        canAssignMachine: p.machine.canAllocate,
        canTransferMachine: p.machine.canTransfer,
        canReleaseMachine: p.machine.canRelease,
    };
};

export const hasModulePermission = (roleName, moduleName, actionName) => {
    const p = getPermissions(roleName);
    if (!p || !p[moduleName]) return false;
    return Boolean(p[moduleName][actionName]);
};

export default getPermissions;

