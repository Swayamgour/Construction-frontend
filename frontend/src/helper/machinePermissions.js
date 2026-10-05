/**
 * CONSTRUCTION ERP — MACHINERY MODULE ROLE & PERMISSION MATRIX
 *
 * Strict Role Separation:
 * - ADMIN = Control & Approval Layer (View, Monitor, Accept, Approve, Reject)
 * - MANAGER = Operations Layer (Create, Request, Allocate, Assign, Dispatch, Receive, Transfer, Release, Maintain)
 *
 * Rule: Admin must never see operational mutation buttons.
 *       Manager must never see admin approval/rejection buttons.
 */

export const getMachinePermissions = (role) => {
    const r = (role || "").toLowerCase();
    const isAdmin = r === "admin";
    const isManager = r === "manager";
    const isSupervisor = r === "supervisor";
    const isOperator = r === "operator";

    return {
        role: r,
        isAdmin,
        isManager,
        isSupervisor,
        isOperator,

        // ==========================================
        // VIEW & MONITORING (Admin + Operational)
        // ==========================================
        canViewMachines: true,
        canViewDetails: true,
        canViewRequests: true,
        canViewHistory: true,
        canViewDocuments: true,
        canViewUsage: true,
        canViewMaintenance: true,
        canViewReports: true,
        canViewAudit: isAdmin,

        // ==========================================
        // ADMIN ONLY — CONTROL & APPROVAL LAYER
        // (Strictly prohibited for Manager)
        // ==========================================
        canApproveRequest: isAdmin,
        canRejectRequest: isAdmin,
        canApproveOperatorLog: isAdmin,
        canVerifyDocument: isAdmin,

        // ==========================================
        // MANAGER ONLY — OPERATIONAL WORKFLOW LAYER
        // (Strictly prohibited for Admin)
        // ==========================================
        canAddMachine: isManager,
        canEditMachine: isManager,
        canDeleteMachine: false, // Operational deletes disabled

        // Request Lifecycle (Manager creates, Admin reviews & approves)
        canCreateRequest: isManager || isSupervisor,
        canCancelRequest: isManager || isSupervisor,

        // Post-Approval Operational Fulfillment (Manager only)
        canAllocateMachine: isManager,
        canProcureVendor: isManager,
        canDispatchMachine: isManager,

        // Site Inspection & Receiving (Manager / Site Supervisor)
        canReceiveAtSite: isManager || isSupervisor,
        canSiteReject: isManager || isSupervisor,

        // Assignment & Movement (Manager only)
        canAssignMachine: isManager,
        canTransferMachine: isManager,
        canReleaseMachine: isManager,

        // Operator Management (Manager only)
        canAssignOperator: isManager,
        canChangeOperator: isManager,
        canRemoveOperator: isManager,

        // Daily Usage & Operations
        canLogDailyUsage: isManager || isSupervisor || isOperator,

        // Maintenance & Breakdown (Manager / Supervisor)
        canAddMaintenance: isManager || isSupervisor,
        canResolveMaintenance: isManager,

        // Documents
        canUploadDocument: isManager || isSupervisor,
    };
};
