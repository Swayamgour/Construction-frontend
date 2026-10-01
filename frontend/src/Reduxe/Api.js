import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";


export const Api = createApi({
    reducerPath: "erpApi",

    baseQuery: fetchBaseQuery({
        // baseUrl: "https://backendapi.ssconstructionsup.in/api/",
        baseUrl: "http://localhost:5002/api/",

        prepareHeaders: (headers) => {
            const token = localStorage.getItem("token");
            if (token) {
                headers.set("Authorization", `Bearer ${token}`);
            }
            return headers;
        },
    }),

    tagTypes: [
        "Project", "Roles", "User", "Vendor", "Stock", "MaterialRequest",
        "Machine", "Task", "Transactions", "GRN", "Maintenance", "Usage",
        "Assignments", "ProjectTasks", "AssignWork", "Employee", "Labour",
        "Reports", "TaskActivity",
        "LabourAssignment", "OvertimeSettings", "StockRequest", "StockTransfer",
        "Procurement", "StockReceipt", "Inventory", "Ledger",
        "DrawingRequest", "DrawingVersion",
        "MachineRequest", "MachineDocument", "OperatorLog",
        "EOD", "Delay", "DelayCategory", "Notification", "Audit", "Dashboard",
        "PurchaseOrder", "LabourAttendance",
    ],

    endpoints: (build) => ({
        /* =====================================================================
           AUTH / USERS
           ===================================================================== */
        register: build.mutation({
            query: (body) => ({ url: "auth/register", method: "POST", body }),
        }),

        login: build.mutation({
            query: (body) => ({ url: "auth/login", method: "POST", body }),
            async onQueryStarted(_, { queryFulfilled }) {
                try {
                    const result = await queryFulfilled;
                    localStorage.setItem("token", result.data.token);
                } catch (err) {
                    console.log("Login error:", err);
                }
            },
        }),

        checkLogin: build.query({
            query: () => ({ url: "auth/check-login", method: "GET" }),
        }),

        userDetail: build.query({
            query: () => ({ url: "auth/me", method: "GET" }),
        }),

        getUsers: build.query({
            query: () => "auth",
            providesTags: ["User"],
        }),

        getUsersById: build.query({
            query: (userId) => `auth/manager/${userId}`,
        }),

        getRoles: build.query({
            query: () => `auth/managers-supervisors`,
            providesTags: ["Roles"],
        }),

        deleteUser: build.mutation({
            query: (id) => ({ url: `auth/delete-user/${id}`, method: "DELETE" }),
            invalidatesTags: ["User"],
        }),

        updateRoles: build.mutation({
            query: ({ userId, status }) => ({
                url: `auth/update-status`,
                method: "PUT",
                body: { userId, status },
            }),
            invalidatesTags: ["Roles"],
        }),

        addRoles: build.mutation({
            query: (body) => ({ url: "auth/create-user", method: "POST", body }),
            invalidatesTags: ["Roles", "User"],
        }),

        addUser: build.mutation({
            query: (body) => ({ url: "auth/create-user", method: "POST", body }),
            invalidatesTags: ["User"],
        }),

        /* =====================================================================
           PROJECTS
           ===================================================================== */
        addProject: build.mutation({
            query: (formData) => ({ url: "project/create", method: "POST", body: formData }),
            invalidatesTags: ["Project"],
        }),

        getProjects: build.query({
            query: (params) => ({ url: "project", params }),
            providesTags: ["Project"],
        }),

        getProjectById: build.query({
            query: (id) => `project/${id}`,
            providesTags: ["Project"],
        }),

        getProjectsById: build.query({
            query: ({ id }) => `project/${id}`,
            providesTags: ["Project"],
        }),

        assignProject: build.query({
            query: () => "project/my-supervisor-projects",
            providesTags: ["Project"],
        }),

        getManagerProjects: build.query({
            query: () => "project/my-projects",
            providesTags: ["Project"],
        }),

        updateProject: build.mutation({
            query: ({ id, formData }) => ({ url: `project/update/${id}`, method: "PUT", body: formData }),
            invalidatesTags: ["Project"],
        }),

        deleteProject: build.mutation({
            query: (id) => ({ url: `project/${id}`, method: "DELETE" }),
            invalidatesTags: ["Project"],
        }),

        assignManager: build.mutation({
            query: (body) => ({ url: "project/assign-manager", method: "POST", body }),
            invalidatesTags: ["Project"],
        }),

        assignSupervisor: build.mutation({
            query: (body) => ({ url: "project/assign-supervisor", method: "POST", body }),
            invalidatesTags: ["Project"],
        }),

        /* =====================================================================
           VENDORS
           ===================================================================== */
        getVendors: build.query({
            query: (params) => ({ url: `vendor/all`, params }),
            providesTags: ["Vendor"],
        }),

        getVendorById: build.query({
            query: (id) => `vendor/${id}`,
        }),

        addVendor: build.mutation({
            query: (body) => ({ url: "vendor/add", method: "POST", body }),
            invalidatesTags: ["Vendor"],
        }),

        // ✅ Backend endpoint added (PUT /api/vendor/:id) — previously
        // called by CreateNewVendorForm.jsx's edit mode with no matching route.
        updateVendor: build.mutation({
            query: ({ id, formData }) => ({ url: `vendor/${id}`, method: "PUT", body: formData }),
            invalidatesTags: ["Vendor"],
        }),

        assignItemsToVendor: build.mutation({
            query: (body) => ({ url: "vendor/assign-items", method: "POST", body }),
            invalidatesTags: ["Vendor"],
        }),

        assignItemsWithDetails: build.mutation({
            query: (body) => ({ url: "vendor/assign-items-details", method: "POST", body }),
            invalidatesTags: ["Vendor"],
        }),

        /* =====================================================================
           ITEMS
           ===================================================================== */
        addItems: build.mutation({
            query: (body) => ({ url: "item/add", method: "POST", body }),
            invalidatesTags: ["Stock"],
        }),

        getAllItems: build.query({
            query: () => `item/all`,
            providesTags: ["Stock"],
        }),

        getItemById: build.query({
            query: (id) => `item/${id}`,
            providesTags: ["Stock"],
        }),

        updateItem: build.mutation({
            query: ({ id, body }) => ({ url: `item/update/${id}`, method: "PUT", body }),
            invalidatesTags: ["Stock"],
        }),

        deleteItem: build.mutation({
            query: (id) => ({ url: `item/delete/${id}`, method: "DELETE" }),
            invalidatesTags: ["Stock"],
        }),

        /* =====================================================================
           LABOUR — basic CRUD (existing) + legacy assign/unassign/reassign
           ===================================================================== */
        getLabour: build.query({
            query: () => `auth/labours`,
            providesTags: ["Labour"],
        }),

        getLabourById: build.query({
            query: (id) => `auth/labours/${id}`,
            providesTags: ["Labour"],
        }),

        addLabour: build.mutation({
            query: (body) => ({ url: "auth/add-labour", method: "POST", body }),
            invalidatesTags: ["Labour"],
        }),

        // ✅ Backend endpoint added (PUT /api/auth/labours/:id) alongside this
        // fix — previously the frontend called a route that didn't exist.
        updateLabour: build.mutation({
            query: ({ id, ...body }) => ({ url: `auth/labours/${id}`, method: "PUT", body }),
            invalidatesTags: ["Labour"],
        }),

        assignLabour: build.mutation({
            query: (body) => ({ url: "assignLabour/assign-labour", method: "POST", body }),
            invalidatesTags: ["Labour"],
        }),

        unassignLabour: build.mutation({
            query: (body) => ({ url: "assignLabour/unassign-labour", method: "POST", body }),
            invalidatesTags: ["Labour"],
        }),

        reassignLabour: build.mutation({
            query: (body) => ({ url: "assignLabour/reassign-labour", method: "POST", body }),
            invalidatesTags: ["Labour"],
        }),

        getAssignedLabour: build.query({
            query: (projectId) => ({ url: `assignLabour/labour-by-project`, params: { projectId } }),
            providesTags: ["Labour"],
        }),

        /* =====================================================================
           NEW: LABOUR ASSIGNMENT / TRANSFER / HISTORY  (/api/labour/*)
           ===================================================================== */
        assignLabourToProject: build.mutation({
            query: (body) => ({ url: "labour/assign", method: "POST", body }),
            invalidatesTags: ["LabourAssignment", "Labour"],
        }),

        transferLabour: build.mutation({
            query: (body) => ({ url: "labour/transfer", method: "POST", body }),
            invalidatesTags: ["LabourAssignment", "Labour"],
        }),

        releaseLabour: build.mutation({
            query: (body) => ({ url: "labour/release", method: "POST", body }),
            invalidatesTags: ["LabourAssignment", "Labour"],
        }),

        getLabourAssignments: build.query({
            query: (params) => ({ url: "labour/assignments", params }),
            providesTags: ["LabourAssignment"],
        }),

        getUnassignedLabours: build.query({
            query: (params) => ({ url: "labour/unassigned", params }),
            providesTags: ["Labour", "LabourAssignment"],
        }),

        getLabourAssignmentHistory: build.query({
            query: (labourId) => `labour/${labourId}/history`,
            providesTags: ["LabourAssignment"],
        }),

        getProjectActiveLabour: build.query({
            query: ({ projectId, ...params }) => ({ url: `projects/${projectId}/labour`, params }),
            providesTags: ["LabourAssignment"],
        }),

        // ⭐ NEW: single aggregate endpoint — labour + assignments +
        // transfers + attendance + overtime in one call.
        getLabourFullHistory: build.query({
            query: (labourId) => `labour/${labourId}/full-history`,
            providesTags: ["LabourAssignment", "Labour"],
        }),

        /* NEW: LABOUR WORKING TIME / OVERTIME */
        recordLabourWorkingTime: build.mutation({
            query: (body) => ({ url: "labour/attendance", method: "POST", body }),
            invalidatesTags: ["Labour", "Reports", "LabourAttendance"],
        }),

        getOvertimeRecords: build.query({
            query: (params) => ({ url: "labour/overtime", params }),
            providesTags: ["Reports"],
        }),

        approveOvertime: build.mutation({
            query: (id) => ({ url: `labour/overtime/${id}/approve`, method: "PATCH" }),
            invalidatesTags: ["Reports", "Labour", "LabourAttendance"],
        }),

        rejectOvertime: build.mutation({
            query: ({ id, reason }) => ({ url: `labour/overtime/${id}/reject`, method: "PATCH", body: { reason } }),
            invalidatesTags: ["Reports", "Labour", "LabourAttendance"],
        }),

        correctOvertime: build.mutation({
            query: ({ id, ...body }) => ({ url: `labour/overtime/${id}/correct`, method: "PATCH", body }),
            invalidatesTags: ["Reports", "Labour", "LabourAttendance"],
        }),

        getOvertimeSettings: build.query({
            query: (projectId) => ({ url: "labour/overtime-settings", params: projectId ? { projectId } : {} }),
            providesTags: ["OvertimeSettings"],
        }),

        upsertOvertimeSettings: build.mutation({
            query: (body) => ({ url: "labour/overtime-settings", method: "PUT", body }),
            invalidatesTags: ["OvertimeSettings"],
        }),

        triggerAutoAbsent: build.mutation({
            query: (body) => ({ url: "labour/auto-absent/run", method: "POST", body }),
            invalidatesTags: ["LabourAttendance", "Reports"],
        }),

        /* =====================================================================
           MATERIAL REQUEST (existing MR -> PO flow)
           ===================================================================== */
        getMaterialRequest: build.query({
            query: () => `mr/all`,
            providesTags: ["MaterialRequest", "GRN"],
        }),

        getSingleMR: build.query({
            query: (id) => `mr/material-request/${id}`,
            providesTags: ["MaterialRequest"],
        }),

        getPoRequest: build.query({
            query: (id) => `mr/po/${id}`,
            providesTags: ["MaterialRequest"],
        }),

        createMaterialRequest: build.mutation({
            query: (body) => ({ url: "mr/add", method: "POST", body }),
            invalidatesTags: ["MaterialRequest"],
        }),

        getPendingRequests: build.query({
            query: () => `mr/pending`,
            providesTags: ["MaterialRequest"],
        }),

        approveMaterialRequest: build.mutation({
            query: ({ id, data }) => ({ url: `mr/approve/${id}`, method: "PUT", body: data }),
            invalidatesTags: ["MaterialRequest"],
        }),

        rejectMaterialRequest: build.mutation({
            query: ({ id }) => ({ url: `mr/reject/${id}`, method: "PUT" }),
            invalidatesTags: ["MaterialRequest"],
        }),

        /* =====================================================================
           STOCK (existing plain in/out/transfer/return + GRN)
           ===================================================================== */
        getStockProjectBalance: build.query({
            query: (projectId) => `stock/project/${projectId}`,
            providesTags: ["Stock"],
        }),

        getProjectTransactions: build.query({
            query: (projectId) => `stock/transactions/${projectId}`,
            providesTags: (result, error, arg) => [{ type: "Transactions", id: arg }],
        }),

        receiveMaterial: build.mutation({
            query: (body) => ({ url: "stock/receive", method: "POST", body }),
            invalidatesTags: ["Stock", "Transactions"],
        }),

        outStock: build.mutation({
            query: (body) => ({ url: "stock/issue", method: "POST", body }),
            invalidatesTags: ["Stock", "Transactions"],
        }),

        transferMaterial: build.mutation({
            query: (body) => ({ url: "stock/transfer", method: "POST", body }),
            invalidatesTags: ["Stock", "Transactions"],
        }),

        returnMaterial: build.mutation({
            query: (body) => ({ url: "stock/return", method: "POST", body }),
            invalidatesTags: ["Stock", "Transactions"],
        }),

        getItemLedgerByItem: build.query({
            query: (itemId) => `stock/ledger/${itemId}`,
            providesTags: ["Stock"],
        }),

        getProjectIssues: build.query({
            query: (projectId) => `stock/issue/${projectId}`,
            providesTags: ["Stock"],
        }),

        createGRN: build.mutation({
            query: (body) => ({ url: `grn/add`, method: "POST", body }),
            invalidatesTags: ["GRN"],
        }),

        getGRN: build.query({
            query: (id) => `grn/${id}`,
            providesTags: ["GRN"],
        }),

        getAllGRN: build.query({
            query: () => `grn`,
            providesTags: ["GRN"],
        }),

        getProjectStock: build.query({
            query: (projectId) => `grn/project/${projectId}`,
            providesTags: ["Stock"],
        }),

        getItemHistory: build.query({
            query: ({ itemId, projectId }) => `grn/history/${itemId}/${projectId}`,
            providesTags: ["Stock"],
        }),

        getItemLedger: build.query({
            query: ({ projectId, itemId }) => `grn/ledger/${projectId}/${itemId}`,
            providesTags: ["Stock"],
        }),

        addConsumption: build.mutation({
            query: (body) => ({ url: "consumption/add-multiple", method: "POST", body }),
            invalidatesTags: ["Stock"],
        }),

        getTodayConsumption: build.query({
            query: () => "consumption/today",
            providesTags: ["Stock"],
        }),

        getProjectConsumption: build.query({
            query: (projectId) => `consumption/project/${projectId}`,
            providesTags: ["Stock"],
        }),

        filterConsumption: build.query({
            query: (params) => ({ url: "consumption/filter", params }),
            providesTags: ["Stock"],
        }),

        /* =====================================================================
           NEW: STOCK REQUEST -> ADMIN REVIEW -> TRANSFER / PROCUREMENT ->
           RECEIVING -> INVENTORY  (/api/stock/*)
           ===================================================================== */
        createStockRequest: build.mutation({
            query: (formData) => ({ url: "stock/requests", method: "POST", body: formData }),
            invalidatesTags: ["StockRequest"],
        }),

        getStockRequests: build.query({
            query: (params) => ({ url: "stock/requests", params }),
            providesTags: ["StockRequest"],
        }),

        getStockRequestById: build.query({
            query: (id) => `stock/requests/${id}`,
            providesTags: ["StockRequest"],
        }),

        reviewStockRequest: build.mutation({
            query: ({ id, ...body }) => ({ url: `stock/requests/${id}/review`, method: "PATCH", body }),
            invalidatesTags: ["StockRequest"],
        }),

        createStockTransfer: build.mutation({
            query: (body) => ({ url: "stock/transfers", method: "POST", body }),
            invalidatesTags: ["StockTransfer", "StockRequest", "Inventory", "Ledger"],
        }),

        getStockTransfers: build.query({
            query: (params) => ({ url: "stock/transfers", params }),
            providesTags: ["StockTransfer"],
        }),

        confirmTransferReceipt: build.mutation({
            query: (id) => ({ url: `stock/transfers/${id}/receive`, method: "PATCH" }),
            invalidatesTags: ["StockTransfer", "StockRequest", "Inventory"],
        }),

        cancelStockTransfer: build.mutation({
            query: ({ id, reason }) => ({ url: `stock/transfers/${id}/cancel`, method: "PATCH", body: { reason } }),
            invalidatesTags: ["StockTransfer", "StockRequest", "Inventory", "Ledger"],
        }),

        createProcurement: build.mutation({
            query: (body) => ({ url: "stock/procurement", method: "POST", body }),
            invalidatesTags: ["Procurement", "StockRequest"],
        }),

        getProcurements: build.query({
            query: (params) => ({ url: "stock/procurement", params }),
            providesTags: ["Procurement"],
        }),

        updateProcurementStatus: build.mutation({
            query: ({ id, formData }) => ({ url: `stock/procurement/${id}/status`, method: "PATCH", body: formData }),
            invalidatesTags: ["Procurement", "StockRequest"],
        }),

        cancelProcurement: build.mutation({
            query: ({ id, reason }) => ({ url: `stock/procurement/${id}/cancel`, method: "PATCH", body: { reason } }),
            invalidatesTags: ["Procurement", "StockRequest"],
        }),

        createStockReceipt: build.mutation({
            query: (formData) => ({ url: "stock/receipts", method: "POST", body: formData }),
            invalidatesTags: ["StockReceipt", "StockRequest", "Inventory", "Ledger", "Procurement"],
        }),

        getStockReceipts: build.query({
            query: (params) => ({ url: "stock/receipts", params }),
            providesTags: ["StockReceipt"],
        }),

        getInventory: build.query({
            query: (projectId) => `stock/inventory/${projectId}`,
            providesTags: ["Inventory"],
        }),

        getProjectLedger: build.query({
            query: ({ projectId, ...params }) => ({ url: `stock/ledger/project/${projectId}`, params }),
            providesTags: ["Ledger"],
        }),

        // ⭐ NEW: Opening Stock / Damage / Adjustment — centralized inventory
        // movements added on the backend that had no frontend wiring yet.
        openingStock: build.mutation({
            query: (body) => ({ url: "stock/opening", method: "POST", body }),
            invalidatesTags: ["Inventory", "Ledger", "Stock"],
        }),

        damageInventory: build.mutation({
            query: (body) => ({ url: "stock/damage", method: "POST", body }),
            invalidatesTags: ["Inventory", "Ledger", "Stock"],
        }),

        adjustInventory: build.mutation({
            query: (body) => ({ url: "stock/adjustment", method: "POST", body }),
            invalidatesTags: ["Inventory", "Ledger", "Stock"],
        }),

        /* =====================================================================
           NEW: DRAWINGS  (/api/drawings/*)
           ===================================================================== */
        createDrawingRequest: build.mutation({
            query: (body) => ({ url: "drawings/requests", method: "POST", body }),
            invalidatesTags: ["DrawingRequest"],
        }),

        getDrawingRequests: build.query({
            query: (params) => ({ url: "drawings/requests", params }),
            providesTags: ["DrawingRequest"],
        }),

        updateDrawingRequestStatus: build.mutation({
            query: ({ id, ...body }) => ({ url: `drawings/requests/${id}/status`, method: "PATCH", body }),
            invalidatesTags: ["DrawingRequest"],
        }),

        uploadDrawingVersion: build.mutation({
            query: ({ id, formData }) => ({ url: `drawings/requests/${id}/upload`, method: "POST", body: formData }),
            invalidatesTags: ["DrawingVersion", "DrawingRequest"],
        }),

        uploadDrawingRevision: build.mutation({
            query: ({ id, formData }) => ({ url: `drawings/${id}/revision`, method: "POST", body: formData }),
            invalidatesTags: ["DrawingVersion", "DrawingRequest"],
        }),

        getDrawingVersions: build.query({
            query: (id) => `drawings/${id}/versions`,
            providesTags: ["DrawingVersion"],
        }),

        /* =====================================================================
           MACHINES (existing: CRUD, allocation, usage, maintenance)
           ===================================================================== */
        addMachine: build.mutation({
            query: (formData) => ({ url: "machines/add", method: "POST", body: formData }),
            invalidatesTags: ["Machine", "Assignments"],
        }),

        getAllMachines: build.query({
            query: () => `machines/all`,
            providesTags: ["Machine", "Assignments"],
        }),

        getMachineDetails: build.query({
            query: (id) => `machines/${id}`,
            providesTags: ["Machine", "Maintenance", "Usage", "Assignments"],
        }),

        // Added alongside the backend PUT/DELETE /api/machines/:id routes —
        // AddEditMachine.jsx previously called endpoints that did not exist.
        updateMachine: build.mutation({
            query: ({ id, formData }) => ({ url: `machines/${id}`, method: "PUT", body: formData }),
            invalidatesTags: ["Machine"],
        }),

        deleteMachine: build.mutation({
            query: (id) => ({ url: `machines/${id}`, method: "DELETE" }),
            invalidatesTags: ["Machine"],
        }),

        addMaintenance: build.mutation({
            query: (formData) => ({ url: "machines/maintenance/add", method: "POST", body: formData }),
            invalidatesTags: ["Maintenance", "Machine", "Assignments"],
        }),

        getMaintenanceHistory: build.query({
            query: (machineId) => `machines/${machineId}/maintenance`,
            providesTags: ["Maintenance", "Assignments"],
        }),

        addUsage: build.mutation({
            query: (data) => ({ url: "machines/usage", method: "POST", body: data }),
            invalidatesTags: ["Usage"],
        }),

        getUsageList: build.query({
            query: (params) => ({ url: "machines/usage", params }),
            providesTags: ["Usage"],
        }),

        allocateMachine: build.mutation({
            query: (data) => ({ url: "machine/allocation/allocate", method: "POST", body: data }),
            invalidatesTags: ["Machine", "Assignments"],
        }),

        releaseMachineAllocation: build.mutation({
            query: (data) => ({ url: "machine/allocation/release", method: "POST", body: data }),
            invalidatesTags: ["Machine", "Assignments"],
        }),

        getAllocations: build.query({
            query: () => "machine/allocation/all",
            providesTags: ["Machine", "Assignments"],
        }),

        addMachineUsage: build.mutation({
            query: (data) => ({ url: "machine/usage/add", method: "POST", body: data }),
            invalidatesTags: ["Machine", "Usage"],
        }),

        getMachineUsage: build.query({
            query: () => "machine/usage/all",
            providesTags: ["Machine", "Usage"],
        }),

        assignMachine: build.mutation({
            query: (data) => ({ url: "assignments/assign", method: "POST", body: data }),
            invalidatesTags: ["Assignments"],
        }),

        releaseMachine: build.mutation({
            query: (data) => ({ url: "assignments/release", method: "POST", body: data }),
            invalidatesTags: ["Assignments"],
        }),

        getActiveAssignments: build.query({
            query: () => "assignments/active",
            providesTags: ["Assignments"],
        }),

        getAssignmentHistory: build.query({
            query: (machineId) => `assignments/history/${machineId}`,
            providesTags: ["Assignments"],
        }),

        /* =====================================================================
           NEW: MACHINERY REQUEST WORKFLOW / DOCUMENTS / OPERATOR / FULL
           MAINTENANCE  (/api/machinery/*)
           ===================================================================== */
        createMachineRequest: build.mutation({
            query: (formData) => ({ url: "machinery/requests", method: "POST", body: formData }),
            invalidatesTags: ["MachineRequest"],
        }),

        getMachineRequests: build.query({
            query: (params) => ({ url: "machinery/requests", params }),
            providesTags: ["MachineRequest"],
        }),

        getMachineRequestHistory: build.query({
            query: (id) => `machinery/requests/${id}/history`,
            providesTags: ["MachineRequest"],
        }),

        approveMachineRequest: build.mutation({
            query: (id) => ({ url: `machinery/requests/${id}/approve`, method: "PATCH" }),
            invalidatesTags: ["MachineRequest"],
        }),

        rejectMachineRequest: build.mutation({
            query: ({ id, remarks }) => ({ url: `machinery/requests/${id}/reject`, method: "PATCH", body: { remarks } }),
            invalidatesTags: ["MachineRequest"],
        }),

        allocateMachineRequest: build.mutation({
            query: ({ id, machineId }) => ({ url: `machinery/requests/${id}/allocate`, method: "PATCH", body: { machineId } }),
            invalidatesTags: ["MachineRequest", "Machine"],
        }),

        dispatchMachineRequest: build.mutation({
            query: ({ id, ...body }) => ({ url: `machinery/requests/${id}/dispatch`, method: "PATCH", body }),
            invalidatesTags: ["MachineRequest"],
        }),

        receiveMachineAtSite: build.mutation({
            query: (id) => ({ url: `machinery/requests/${id}/receive`, method: "PATCH" }),
            invalidatesTags: ["MachineRequest", "Assignments"],
        }),

        releaseMachineRequest: build.mutation({
            query: (id) => ({ url: `machinery/requests/${id}/release`, method: "PATCH" }),
            invalidatesTags: ["MachineRequest", "Assignments"],
        }),

        addMachineDocument: build.mutation({
            query: ({ id, formData }) => ({ url: `machinery/${id}/documents`, method: "POST", body: formData }),
            invalidatesTags: ["MachineDocument"],
        }),

        getMachineDocuments: build.query({
            query: (id) => `machinery/${id}/documents`,
            providesTags: ["MachineDocument"],
        }),

        verifyMachineDocument: build.mutation({
            query: ({ docId, ...body }) => ({ url: `machinery/documents/${docId}/verify`, method: "PATCH", body }),
            invalidatesTags: ["MachineDocument"],
        }),

        getExpiringMachineDocuments: build.query({
            query: (days) => ({ url: "machinery/documents/expiring", params: days ? { days } : {} }),
            providesTags: ["MachineDocument"],
        }),

        logMachineOperatorDay: build.mutation({
            query: ({ id, ...body }) => ({ url: `machinery/${id}/operator`, method: "POST", body }),
            invalidatesTags: ["OperatorLog"],
        }),

        getMachineOperatorLogs: build.query({
            query: ({ id, ...params }) => ({ url: `machinery/${id}/operator-logs`, params }),
            providesTags: ["OperatorLog"],
        }),

        approveOperatorLog: build.mutation({
            query: (logId) => ({ url: `machinery/operator-logs/${logId}/approve`, method: "PATCH" }),
            invalidatesTags: ["OperatorLog"],
        }),

        reportMachineMaintenance: build.mutation({
            query: ({ id, formData }) => ({ url: `machinery/${id}/maintenance`, method: "POST", body: formData }),
            invalidatesTags: ["Maintenance", "Machine"],
        }),

        getFullMaintenanceHistory: build.query({
            query: ({ id, ...params }) => ({ url: `machinery/${id}/maintenance/full`, params }),
            providesTags: ["Maintenance"],
        }),

        updateMaintenanceStatus: build.mutation({
            query: ({ id, ...body }) => ({ url: `machinery/maintenance/${id}/status`, method: "PATCH", body }),
            invalidatesTags: ["Maintenance"],
        }),

        getUpcomingMaintenance: build.query({
            query: (days) => ({ url: "machinery/maintenance/upcoming", params: days ? { days } : {} }),
            providesTags: ["Maintenance"],
        }),

        // ⭐ NEW: meter/hour-based maintenance due (derived from DailyUsage
        // hoursRun since the machine's last service) — no frontend before.
        getMeterBasedMaintenanceDue: build.query({
            query: (bufferHours) => ({ url: "machinery/maintenance/meter-due", params: bufferHours ? { bufferHours } : {} }),
            providesTags: ["Maintenance"],
        }),

        // ⭐ NEW: Operator assignment lifecycle (assign/change/remove +
        // permanent history) — distinct from the daily working-hours log
        // above (logMachineOperatorDay). Acts on a MachineAssignment id.
        assignOperatorToMachine: build.mutation({
            query: ({ assignmentId, ...body }) => ({ url: `machinery/assignments/${assignmentId}/operator`, method: "POST", body }),
            invalidatesTags: ["Assignments", "OperatorLog"],
        }),

        changeOperator: build.mutation({
            query: ({ assignmentId, ...body }) => ({ url: `machinery/assignments/${assignmentId}/operator/change`, method: "PATCH", body }),
            invalidatesTags: ["Assignments", "OperatorLog"],
        }),

        removeOperator: build.mutation({
            query: ({ assignmentId, ...body }) => ({ url: `machinery/assignments/${assignmentId}/operator/remove`, method: "PATCH", body }),
            invalidatesTags: ["Assignments", "OperatorLog"],
        }),

        getOperatorAssignmentHistory: build.query({
            query: (assignmentId) => `machinery/assignments/${assignmentId}/operator/history`,
            providesTags: ["OperatorLog", "Assignments"],
        }),

        /* =====================================================================
           NEW: EOD DAILY REPORT  (/api/eod/*)
           ===================================================================== */
        submitEOD: build.mutation({
            query: (formData) => ({ url: "eod", method: "POST", body: formData }),
            invalidatesTags: ["EOD", "Dashboard"],
        }),

        getEODReports: build.query({
            query: (params) => ({ url: "eod", params }),
            providesTags: ["EOD"],
        }),

        getEODReportById: build.query({
            query: (id) => `eod/${id}`,
            providesTags: ["EOD"],
        }),

        updateEODReport: build.mutation({
            query: ({ id, formData }) => ({ url: `eod/${id}`, method: "PATCH", body: formData }),
            invalidatesTags: ["EOD"],
        }),

        approveEODReport: build.mutation({
            query: (id) => ({ url: `eod/${id}/approve`, method: "PATCH" }),
            invalidatesTags: ["EOD", "Dashboard"],
        }),

        rejectEODReport: build.mutation({
            query: ({ id, reason }) => ({ url: `eod/${id}/reject`, method: "PATCH", body: { reason } }),
            invalidatesTags: ["EOD", "Dashboard"],
        }),

        /* =====================================================================
           NEW: PROJECT DELAY  (/api/projects/:projectId/delays, /api/delays)
           ===================================================================== */
        getDelayCategories: build.query({
            query: () => "delays/categories",
            providesTags: ["DelayCategory"],
        }),

        createDelayCategory: build.mutation({
            query: (body) => ({ url: "delays/categories", method: "POST", body }),
            invalidatesTags: ["DelayCategory"],
        }),

        reportDelay: build.mutation({
            query: ({ projectId, formData }) => ({ url: `projects/${projectId}/delays`, method: "POST", body: formData }),
            invalidatesTags: ["Delay", "Dashboard"],
        }),

        getProjectDelays: build.query({
            query: ({ projectId, ...params }) => ({ url: `projects/${projectId}/delays`, params }),
            providesTags: ["Delay"],
        }),

        getAllDelays: build.query({
            query: (params) => ({ url: "delays", params }),
            providesTags: ["Delay"],
        }),

        updateDelay: build.mutation({
            query: ({ id, ...body }) => ({ url: `delays/${id}`, method: "PATCH", body }),
            invalidatesTags: ["Delay"],
        }),

        resolveDelay: build.mutation({
            query: ({ id, ...body }) => ({ url: `delays/${id}/resolve`, method: "POST", body }),
            invalidatesTags: ["Delay", "Dashboard"],
        }),

        /* =====================================================================
           NEW: NOTIFICATIONS  (/api/notifications/*)
           ===================================================================== */
        getMyNotifications: build.query({
            query: (params) => ({ url: "notifications", params }),
            providesTags: ["Notification"],
        }),

        markNotificationRead: build.mutation({
            query: (id) => ({ url: `notifications/${id}/read`, method: "PATCH" }),
            invalidatesTags: ["Notification"],
        }),

        markAllNotificationsRead: build.mutation({
            query: () => ({ url: `notifications/read-all`, method: "PATCH" }),
            invalidatesTags: ["Notification"],
        }),

        /* =====================================================================
           NEW: AUDIT HISTORY  (/api/audit/*)
           ===================================================================== */
        getModuleAuditHistory: build.query({
            query: ({ module, entityId }) => `audit/${module}/${entityId}`,
            providesTags: ["Audit"],
        }),

        // ⭐ NEW: global paginated/filterable audit log (admin/manager
        // oversight) — previously only the per-entity lookup above existed.
        getAuditLogs: build.query({
            query: (params) => ({ url: "audit", params }),
            providesTags: ["Audit"],
        }),

        /* =====================================================================
           NEW: ERP REPORTS + DASHBOARD  (/api/reports/*)
           ===================================================================== */
        getLabourOvertimeReport: build.query({
            query: (params) => ({ url: "reports/labour-overtime", params }),
            providesTags: ["Reports"],
        }),

        getStockReport: build.query({
            query: (params) => ({ url: "reports/stock", params }),
            providesTags: ["Reports"],
        }),

        getMachineryReport: build.query({
            query: (params) => ({ url: "reports/machinery", params }),
            providesTags: ["Reports"],
        }),

        getProjectDelaysReport: build.query({
            query: (params) => ({ url: "reports/project-delays", params }),
            providesTags: ["Reports"],
        }),

        getEODReportSummary: build.query({
            query: (params) => ({ url: "reports/eod", params }),
            providesTags: ["Reports"],
        }),

        getProjectDashboard: build.query({
            query: (projectId) => `reports/project-dashboard/${projectId}`,
            providesTags: ["Dashboard"],
        }),

        /* =====================================================================
           OLD /report/* (existing summary reports, kept as-is)
           ===================================================================== */
        getLabourReport: build.query({
            query: () => "report/labour",
            providesTags: ["Reports"],
        }),
        getMachineReport: build.query({
            query: () => "report/machine",
            providesTags: ["Reports"],
        }),
        getProjectReport: build.query({
            query: () => "report/project-summary",
            providesTags: ["Reports"],
        }),

        /* =====================================================================
           EMPLOYEE ATTENDANCE
           ===================================================================== */
        punchIn: build.mutation({
            query: (body) => ({ url: "attendance/employee/mark", method: "POST", body }),
            invalidatesTags: ["Employee"],
        }),

        punchOut: build.mutation({
            query: (body) => ({ url: "attendance/employee/punch-out", method: "POST", body }),
            invalidatesTags: ["Employee"],
        }),

        getEmployeeList: build.query({
            query: () => "attendance/employee/list",
            providesTags: ["Employee"],
        }),

        getAttendanceByDate: build.query({
            query: ({ date }) => `attendance/employee/by-date?date=${date}`,
            providesTags: ["Employee"],
        }),

        getAttendance: build.query({
            query: ({ date }) => `attendance/employee/my?date=${date}`,
            providesTags: ["Employee"],
        }),

        getAdminLabourAttendance: build.query({
            query: (params) => ({ url: "attendance/labour/admin-workforce", params }),
            providesTags: ["Labour", "Reports"],
        }),

        getPendingEmployeeAttendance: build.query({
            query: () => "attendance/employee/pending",
            providesTags: ["Employee"],
        }),

        approveEmployeeAttendance: build.mutation({
            query: (attendanceId) => ({ url: "attendance/employee/approve", method: "POST", body: { attendanceId } }),
            invalidatesTags: ["Employee"],
        }),

        markBulkAttendance: build.mutation({
            query: (body) => ({ url: `attendance/employee/mark-bulk`, method: "POST", body }),
            invalidatesTags: ["Employee"],
        }),

        /* =====================================================================
           LABOUR ATTENDANCE (legacy simple mark, kept as-is)
           ===================================================================== */
        // Manual single mark (Absent / Half-Day / manual Present)
        attendanceMark: build.mutation({
            query: (body) => ({ url: "attendance/labour/mark", method: "POST", body }),
            invalidatesTags: ["Labour", "LabourAttendance", "Reports"],
        }),

        // Active labours assigned to a project (plain array response)
        getLaboursByProject: build.query({
            query: (projectId) => `attendance/labour/list?projectId=${projectId}`,
            providesTags: ["Labour"],
        }),

        getTodaysPresentLabours: build.query({
            query: (params) => ({ url: "attendance/TodaysPresentLabours/list", params }),
            providesTags: ["Labour", "LabourAttendance"],
        }),

        // Bulk manual mark: use for Absent / Half-Day. timeIn/timeOut must be "HH:mm".
        bulkMarkLabour: build.mutation({
            query: (body) => ({ url: "attendance/labour/mark-bulk", method: "POST", body }),
            invalidatesTags: ["Labour", "LabourAttendance", "Reports"],
        }),

        // Marking screen: every assigned labour + today's record + state
        // state = "Not Marked" | "Punched In" | "Completed" | "Absent"
        getLabourTodayStatus: build.query({
            query: (projectId) => ({ url: "attendance/labour/today-status", params: { projectId } }),
            providesTags: ["LabourAttendance"],
        }),

        // body: plain object, or FormData when a selfie is attached (field name: "selfie")
        punchInLabour: build.mutation({
            query: (body) => ({ url: "attendance/labour/punch-in", method: "POST", body }),
            invalidatesTags: ["LabourAttendance", "Reports"],
        }),

        // body: { projectId, labourId, checkOutTime?, date? }
        punchOutLabour: build.mutation({
            query: (body) => ({ url: "attendance/labour/punch-out", method: "POST", body }),
            invalidatesTags: ["LabourAttendance", "Reports"],
        }),

        // role scoped: admin = all, manager/supervisor = own projects
        getPendingLabourAttendance: build.query({
            query: (params) => ({ url: "attendance/labour/pending", params }),
            providesTags: ["LabourAttendance"],
        }),

        // history / report: ?projectId&labourId&status&approvalStatus&overtimeStatus&from&to&page&limit
        getLabourAttendanceRecords: build.query({
            query: (params) => ({ url: "attendance/labour/records", params }),
            providesTags: ["LabourAttendance"],
        }),

        // admin only. body: { attendanceId, approveOvertime? }
        approveLabourAttendance: build.mutation({
            query: (data) => ({ url: "attendance/labour/approve", method: "POST", body: data }),
            invalidatesTags: ["Labour", "LabourAttendance", "Reports"],
        }),

        // admin only. body: { attendanceIds: [], approveOvertime? }
        approveBulkLabourAttendance: build.mutation({
            query: (data) => ({ url: "attendance/labour/approve-bulk", method: "POST", body: data }),
            invalidatesTags: ["Labour", "LabourAttendance", "Reports"],
        }),

        // admin only. body: { attendanceId, reason }
        rejectLabourAttendance: build.mutation({
            query: (data) => ({ url: "attendance/labour/reject", method: "POST", body: data }),
            invalidatesTags: ["LabourAttendance", "Reports"],
        }),

        todayReport: build.query({
            query: (arg) => {
                if (typeof arg === "object" && arg !== null) {
                    const { projectId, date } = arg;
                    return `attendance/reports/today/${projectId}${date ? `?date=${date}` : ""}`;
                }
                return `attendance/reports/today/${arg}`;
            },
            providesTags: ["Reports"],
        }),

        summaryReport: build.query({
            query: (arg) => {
                if (typeof arg === "object" && arg !== null) {
                    const { projectId, date } = arg;
                    return `attendance/reports/summary/${projectId}${date ? `?date=${date}` : ""}`;
                }
                return `attendance/reports/summary/${arg}`;
            },
            providesTags: ["Reports"],
        }),

        monthlyReport: build.query({
            query: ({ projectId, month, year }) => `attendance/reports/monthly/${projectId}?month=${month}&year=${year}`,
            providesTags: ["Reports"],
        }),

        /* =====================================================================
           GANTT
           ===================================================================== */
        getProjectTasks: build.query({
            query: (projectId) => `gantt/projects/${projectId}/tasks`,
            providesTags: ["ProjectTasks"],
        }),

        createTask: build.mutation({
            query: ({ projectId, body }) => ({ url: `gantt/projects/${projectId}/tasks`, method: "POST", body }),
            invalidatesTags: ["ProjectTasks"],
        }),

        updateTask: build.mutation({
            query: ({ taskId, data }) => ({ url: `gantt/tasks/${taskId}`, method: "PUT", body: data }),
            invalidatesTags: ["ProjectTasks"],
        }),

        deleteGanttTask: build.mutation({
            query: ({ taskId }) => ({ url: `gantt/tasks/${taskId}`, method: "DELETE" }),
            invalidatesTags: ["ProjectTasks"],
        }),

        sortTasks: build.mutation({
            query: (data) => ({ url: `gantt/tasks/sort-order/bulk`, method: "PUT", body: data }),
            invalidatesTags: ["ProjectTasks"],
        }),

        /* =====================================================================
           TASK MANAGEMENT
           ===================================================================== */
        assignTask: build.mutation({
            query: (data) => ({ url: "task/assign", method: "POST", body: data }),
            invalidatesTags: ["Task"],
        }),

        getTasks: build.query({
            query: () => "task/all",
            providesTags: ["Task"],
        }),

        getTaskById: build.query({
            query: (id) => `task/project/${id}`,
            providesTags: ["Task"],
        }),

        getMyTasks: build.query({
            query: () => "task/my-tasks",
            providesTags: ["Task"],
        }),

        updateTaskStatus: build.mutation({
            query: ({ id, status, remarks }) => ({ url: `task/status/${id}`, method: "PUT", body: { status, remarks } }),
            invalidatesTags: ["Task"],
        }),

        acceptTask: build.mutation({
            query: (id) => ({ url: `task/accept/${id}`, method: "PUT" }),
            invalidatesTags: ["Task"],
        }),

        rejectTask: build.mutation({
            query: ({ id, reason }) => ({ url: `task/reject/${id}`, method: "PUT", body: { reason } }),
            invalidatesTags: ["Task"],
        }),

        updateTaskProgress: build.mutation({
            query: ({ id, progress }) => ({ url: `task/progress/${id}`, method: "PUT", body: { progress } }),
            invalidatesTags: ["Task"],
        }),

        submitTaskCompletion: build.mutation({
            query: (id) => ({ url: `task/submit-completion/${id}`, method: "PUT" }),
            invalidatesTags: ["Task"],
        }),

        approveTask: build.mutation({
            query: (id) => ({ url: `task/approve/${id}`, method: "PUT" }),
            invalidatesTags: ["Task"],
        }),

        addTaskComment: build.mutation({
            query: ({ id, comment }) => ({ url: `task/comment/${id}`, method: "POST", body: { comment } }),
            invalidatesTags: ["TaskActivity"],
        }),

        getTaskActivity: build.query({
            query: (id) => `task/activity/${id}`,
            providesTags: ["TaskActivity"],
        }),

        updateTaskPriority: build.mutation({
            query: ({ id, priority }) => ({ url: `task/priority/${id}`, method: "PUT", body: { priority } }),
            invalidatesTags: ["Task"],
        }),

        updateTaskDependencies: build.mutation({
            query: ({ id, dependencies }) => ({ url: `task/dependencies/${id}`, method: "PUT", body: { dependencies } }),
            invalidatesTags: ["Task"],
        }),

        deleteTask: build.mutation({
            query: (id) => ({ url: `task/${id}`, method: "DELETE" }),
            invalidatesTags: ["Task"],
        }),

        /* =====================================================================
           ASSIGN WORK (generic — kept as-is; verify this backend route exists
           in your deployment, it wasn't present in the reviewed backend source)
           ===================================================================== */
        getAssignedWork: build.query({
            query: () => "assignWork",
            providesTags: ["AssignWork"],
        }),

        getAssignedWorkById: build.query({
            query: (id) => `assignWork/${id}`,
            providesTags: (result, error, id) => [{ type: "AssignWork", id }],
        }),

        createAssignedWork: build.mutation({
            query: (body) => ({ url: "assignWork", method: "POST", body }),
            invalidatesTags: ["AssignWork"],
        }),

        updateAssignedWork: build.mutation({
            query: ({ id, body }) => ({ url: `assignWork/${id}`, method: "PUT", body }),
            invalidatesTags: (result, error, { id }) => ["AssignWork", { type: "AssignWork", id }],
        }),

        deleteAssignedWork: build.mutation({
            query: (id) => ({ url: `assignWork/${id}`, method: "DELETE" }),
            invalidatesTags: ["AssignWork"],
        }),

        /* =====================================================================
           NEW: PURCHASE ORDERS  (/api/purchase-orders/*)
           Backend workflow: DRAFT -> SUBMITTED -> APPROVED -> ORDERED ->
           PARTIALLY_RECEIVED/RECEIVED -> CLOSED, or CANCELLED at most stages.
           Added because the backend module existed with zero frontend wiring.
           ===================================================================== */
        createPurchaseOrder: build.mutation({
            query: (body) => ({ url: "purchase-orders", method: "POST", body }),
            invalidatesTags: ["PurchaseOrder"],
        }),

        getPurchaseOrders: build.query({
            query: (params) => ({ url: "purchase-orders", params }),
            providesTags: ["PurchaseOrder"],
        }),

        getPurchaseOrderById: build.query({
            query: (id) => `purchase-orders/${id}`,
            providesTags: (result, error, id) => [{ type: "PurchaseOrder", id }],
        }),

        updatePurchaseOrder: build.mutation({
            query: ({ id, ...body }) => ({ url: `purchase-orders/${id}`, method: "PATCH", body }),
            invalidatesTags: ["PurchaseOrder"],
        }),

        submitPurchaseOrder: build.mutation({
            query: (id) => ({ url: `purchase-orders/${id}/submit`, method: "PATCH" }),
            invalidatesTags: ["PurchaseOrder"],
        }),

        approvePurchaseOrder: build.mutation({
            query: (id) => ({ url: `purchase-orders/${id}/approve`, method: "PATCH" }),
            invalidatesTags: ["PurchaseOrder"],
        }),

        orderPurchaseOrder: build.mutation({
            query: (id) => ({ url: `purchase-orders/${id}/order`, method: "PATCH" }),
            invalidatesTags: ["PurchaseOrder"],
        }),

        cancelPurchaseOrder: build.mutation({
            query: (id) => ({ url: `purchase-orders/${id}/cancel`, method: "PATCH" }),
            invalidatesTags: ["PurchaseOrder"],
        }),

        closePurchaseOrder: build.mutation({
            query: (id) => ({ url: `purchase-orders/${id}/close`, method: "PATCH" }),
            invalidatesTags: ["PurchaseOrder"],
        }),
    }),
});

export const {
    useRegisterMutation,
    useLoginMutation,
    useCheckLoginQuery,
    useUserDetailQuery,
    useGetUsersQuery,
    useGetUsersByIdQuery,
    useGetRolesQuery,
    useDeleteUserMutation,
    useUpdateRolesMutation,
    useAddRolesMutation,
    useAddUserMutation,

    useAddProjectMutation,
    useGetProjectsQuery,
    useGetProjectByIdQuery,
    useGetProjectsByIdQuery,
    useAssignProjectQuery,
    useGetManagerProjectsQuery,
    useUpdateProjectMutation,
    useDeleteProjectMutation,
    useAssignManagerMutation,
    useAssignSupervisorMutation,

    useGetVendorsQuery,
    useGetVendorByIdQuery,
    useAddVendorMutation,
    useUpdateVendorMutation,
    useAssignItemsToVendorMutation,
    useAssignItemsWithDetailsMutation,

    useAddItemsMutation,
    useGetAllItemsQuery,
    useGetItemByIdQuery,
    useUpdateItemMutation,
    useDeleteItemMutation,

    useGetLabourQuery,
    useGetLabourByIdQuery,
    useAddLabourMutation,
    useUpdateLabourMutation,
    useAssignLabourMutation,
    useUnassignLabourMutation,
    useReassignLabourMutation,
    useGetAssignedLabourQuery,

    useAssignLabourToProjectMutation,
    useTransferLabourMutation,
    useReleaseLabourMutation,
    useGetLabourAssignmentsQuery,
    useGetUnassignedLaboursQuery,
    useGetLabourAssignmentHistoryQuery,
    useGetProjectActiveLabourQuery,
    useGetLabourFullHistoryQuery,
    useRecordLabourWorkingTimeMutation,
    useGetOvertimeRecordsQuery,
    useApproveOvertimeMutation,
    useRejectOvertimeMutation,
    useCorrectOvertimeMutation,
    useGetOvertimeSettingsQuery,
    useUpsertOvertimeSettingsMutation,
    useTriggerAutoAbsentMutation,

    useGetMaterialRequestQuery,
    useGetSingleMRQuery,
    useGetPoRequestQuery,
    useCreateMaterialRequestMutation,
    useGetPendingRequestsQuery,
    useApproveMaterialRequestMutation,
    useRejectMaterialRequestMutation,

    useGetStockProjectBalanceQuery,
    useGetProjectTransactionsQuery,
    useReceiveMaterialMutation,
    useOutStockMutation,
    useTransferMaterialMutation,
    useReturnMaterialMutation,
    useGetItemLedgerByItemQuery,
    useGetProjectIssuesQuery,
    useCreateGRNMutation,
    useGetGRNQuery,
    useGetAllGRNQuery,
    useGetProjectStockQuery,
    useGetItemHistoryQuery,
    useGetItemLedgerQuery,
    useAddConsumptionMutation,
    useGetTodayConsumptionQuery,
    useGetProjectConsumptionQuery,
    useFilterConsumptionQuery,

    useCreateStockRequestMutation,
    useGetStockRequestsQuery,
    useGetStockRequestByIdQuery,
    useReviewStockRequestMutation,
    useCreateStockTransferMutation,
    useGetStockTransfersQuery,
    useConfirmTransferReceiptMutation,
    useCancelStockTransferMutation,
    useCreateProcurementMutation,
    useGetProcurementsQuery,
    useUpdateProcurementStatusMutation,
    useCancelProcurementMutation,
    useCreateStockReceiptMutation,
    useGetStockReceiptsQuery,
    useGetInventoryQuery,
    useGetProjectLedgerQuery,
    useOpeningStockMutation,
    useDamageInventoryMutation,
    useAdjustInventoryMutation,

    useCreateDrawingRequestMutation,
    useGetDrawingRequestsQuery,
    useUpdateDrawingRequestStatusMutation,
    useUploadDrawingVersionMutation,
    useUploadDrawingRevisionMutation,
    useGetDrawingVersionsQuery,

    useAddMachineMutation,
    useGetAllMachinesQuery,
    useGetMachineDetailsQuery,
    useUpdateMachineMutation,
    useDeleteMachineMutation,
    useAddMaintenanceMutation,
    useGetMaintenanceHistoryQuery,
    useAddUsageMutation,
    useGetUsageListQuery,
    useAllocateMachineMutation,
    useReleaseMachineAllocationMutation,
    useGetAllocationsQuery,
    useAddMachineUsageMutation,
    useGetMachineUsageQuery,
    useAssignMachineMutation,
    useReleaseMachineMutation,
    useGetActiveAssignmentsQuery,
    useGetAssignmentHistoryQuery,

    useCreateMachineRequestMutation,
    useGetMachineRequestsQuery,
    useGetMachineRequestHistoryQuery,
    useApproveMachineRequestMutation,
    useRejectMachineRequestMutation,
    useAllocateMachineRequestMutation,
    useDispatchMachineRequestMutation,
    useReceiveMachineAtSiteMutation,
    useReleaseMachineRequestMutation,
    useAddMachineDocumentMutation,
    useGetMachineDocumentsQuery,
    useVerifyMachineDocumentMutation,
    useGetExpiringMachineDocumentsQuery,
    useLogMachineOperatorDayMutation,
    useGetMachineOperatorLogsQuery,
    useApproveOperatorLogMutation,
    useReportMachineMaintenanceMutation,
    useGetFullMaintenanceHistoryQuery,
    useUpdateMaintenanceStatusMutation,
    useGetUpcomingMaintenanceQuery,
    useGetMeterBasedMaintenanceDueQuery,
    useAssignOperatorToMachineMutation,
    useChangeOperatorMutation,
    useRemoveOperatorMutation,
    useGetOperatorAssignmentHistoryQuery,

    useSubmitEODMutation,
    useGetEODReportsQuery,
    useGetEODReportByIdQuery,
    useUpdateEODReportMutation,
    useApproveEODReportMutation,
    useRejectEODReportMutation,

    useGetDelayCategoriesQuery,
    useCreateDelayCategoryMutation,
    useReportDelayMutation,
    useGetProjectDelaysQuery,
    useGetAllDelaysQuery,
    useUpdateDelayMutation,
    useResolveDelayMutation,

    useGetMyNotificationsQuery,
    useMarkNotificationReadMutation,
    useMarkAllNotificationsReadMutation,

    useGetModuleAuditHistoryQuery,
    useGetAuditLogsQuery,

    useGetLabourOvertimeReportQuery,
    useGetStockReportQuery,
    useGetMachineryReportQuery,
    useGetProjectDelaysReportQuery,
    useGetEODReportSummaryQuery,
    useGetProjectDashboardQuery,

    useGetLabourReportQuery,
    useGetMachineReportQuery,
    useGetProjectReportQuery,

    usePunchInMutation,
    usePunchOutMutation,
    useGetEmployeeListQuery,
    useGetAttendanceByDateQuery,
    useGetAttendanceQuery,
    useGetPendingEmployeeAttendanceQuery,
    useApproveEmployeeAttendanceMutation,
    useMarkBulkAttendanceMutation,

    useAttendanceMarkMutation,
    useGetLaboursByProjectQuery,
    useGetTodaysPresentLaboursQuery,
    useBulkMarkLabourMutation,
    useGetPendingLabourAttendanceQuery,
    useApproveLabourAttendanceMutation,
    useApproveBulkLabourAttendanceMutation,
    useRejectLabourAttendanceMutation,
    useGetLabourTodayStatusQuery,
    usePunchInLabourMutation,
    usePunchOutLabourMutation,
    useGetLabourAttendanceRecordsQuery,
    useTodayReportQuery,
    useSummaryReportQuery,
    useMonthlyReportQuery,

    useGetProjectTasksQuery,
    useCreateTaskMutation,
    useUpdateTaskMutation,
    useDeleteGanttTaskMutation,
    useSortTasksMutation,

    useAssignTaskMutation,
    useGetTasksQuery,
    useGetTaskByIdQuery,
    useGetMyTasksQuery,
    useUpdateTaskStatusMutation,
    useAcceptTaskMutation,
    useRejectTaskMutation,
    useUpdateTaskProgressMutation,
    useSubmitTaskCompletionMutation,
    useApproveTaskMutation,
    useAddTaskCommentMutation,
    useGetTaskActivityQuery,
    useUpdateTaskPriorityMutation,
    useUpdateTaskDependenciesMutation,
    useDeleteTaskMutation,

    useGetAssignedWorkQuery,
    useGetAssignedWorkByIdQuery,
    useCreateAssignedWorkMutation,
    useUpdateAssignedWorkMutation,
    useDeleteAssignedWorkMutation,

    useCreatePurchaseOrderMutation,
    useGetPurchaseOrdersQuery,
    useGetPurchaseOrderByIdQuery,
    useUpdatePurchaseOrderMutation,
    useSubmitPurchaseOrderMutation,
    useApprovePurchaseOrderMutation,
    useOrderPurchaseOrderMutation,
    useCancelPurchaseOrderMutation,
    useClosePurchaseOrderMutation,
    useGetAdminLabourAttendanceQuery
} = Api;

export default Api;