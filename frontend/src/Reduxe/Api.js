import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const Api = createApi({
    reducerPath: "erpApi",

    baseQuery: fetchBaseQuery({

        // baseUrl: "https://backendapi.ssconstructionsup.in/api/",
        baseUrl: "http://localhost:5002/api/",
        // baseUrl: "https://backendcreatech.onrender.com/api/",
        // baseUrl: "https://ss-construction-1gf5.onrender.com/api/",

        // https://constraction-erpkjhg.onrender.com/api/auth/register
        // baseUrl: "http://103.120.176.233:5000/api/",
        // baseUrl: "https://contractionerp.onrender.com/api/",
        prepareHeaders: (headers) => {
            const token = localStorage.getItem("token");
            if (token) {
                headers.set("Authorization", `Bearer ${token}`);
            }
            return headers;
        },
    }),

    tagTypes: ["Project", "Roles", "User",
        "Vendor", "Stock", "MaterialRequest",
        "Machine", "Task", "Stock",
        "Transactions", "GRN",
        "Machine", "Maintenance", "Usage", "Assignments",
        "ProjectTasks", "AssignWork"
    ],

    endpoints: (build) => ({
        register: build.mutation({
            query: (body) => ({
                url: "auth/register",
                method: "POST",
                body,
            }),
        }),

        login: build.mutation({
            query: (body) => ({
                url: "auth/login",
                method: "POST",
                body,
            }),
            async onQueryStarted(_, { queryFulfilled }) {
                try {
                    const result = await queryFulfilled;
                    localStorage.setItem("token", result.data.token);
                } catch (err) {
                    console.log("Login error:", err);
                }
            },
        }),

        // ✅ CHECK LOGIN (NEW)
        checkLogin: build.query({
            query: () => ({
                url: "auth/check-login",
                method: "GET",
            }),
        }),

        userDetail: build.query({
            query: () => ({
                url: "auth/me",
                method: "GET",
            }),
        }),

        addProject: build.mutation({
            query: (formData) => ({
                url: "project/create",
                method: "POST",
                body: formData,
            }),
            invalidatesTags: ["Project"],
        }),

        getProjects: build.query({
            query: () => "project",
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

        getProjectById: build.query({
            query: (id) => `project/${id}`,
        }),

        // ✅ UPDATE PROJECT
        updateProject: build.mutation({
            query: ({ id, formData }) => ({
                url: `project/update/${id}`,
                method: "PUT",
                body: formData,
            }),
            invalidatesTags: ["Project"],
        }),

        // ✅ DELETE PROJECT
        deleteProject: build.mutation({
            query: (id) => ({
                url: `projects/delete/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Project"],
        }),

        getRoles: build.query({
            query: () => `auth/managers-supervisors`,
            providesTags: ["Roles"],
        }),

        deleteUser: build.mutation({
            query: (id) => ({
                url: `auth/delete-user/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["User"],
        }),

        updateRoles: build.mutation({
            query: ({ userId, status }) => ({
                url: `auth/update-status`,
                method: "PUT",
                body: {
                    userId,
                    status
                }
            }),
            invalidatesTags: ["Roles"],
        }),


        AddRoles: build.mutation({
            query: (body) => ({
                url: "auth/create-user",
                method: "POST",
                body,
            }),
            invalidatesTags: ["Roles"],
        }),

        getUsers: build.query({
            query: () => `/users`,
            providesTags: ["User"],
        }),


        getUsersById: build.query({
            query: (userId) => `/auth/manager/${userId}`,
        }),



        addUser: build.mutation({
            query: (body) => ({
                url: "auth/create-user",
                method: "POST",
                body
            }),
            invalidatesTags: ["User"]
        }),


        AssignManager: build.mutation({
            query: (body) => ({
                url: "project/assign-manager",
                method: "POST",
                body
            }),
            invalidatesTags: ["Project"]
        }),

        AssignSupervisor: build.mutation({
            query: (body) => ({
                url: "project/assign-supervisor",
                method: "POST",
                body
            }),
            invalidatesTags: ["Project"]
        }),


        getVendors: build.query({
            query: () => `vendor/all`,
            providesTags: ["Vendor"],
        }),

        getVendorById: build.query({
            query: (userId) => `vendor/${userId}`,
        }),



        addVendor: build.mutation({
            query: (body) => ({
                url: "vendor/add",
                method: "POST",
                body
            }),
            invalidatesTags: ["Vendor"]
        }),

        updateVendor: build.mutation({
            query: ({ id, formData }) => ({
                url: `vendor/${id}`,
                method: "PUT",
                body: formData,
            }),
            invalidatesTags: ["Vendor"],
        }),


        getStockById: build.query({
            query: (id) => `stock/${id}`,
            providesTags: ["Stock"],
        }),
        getBalanceOfStock: build.query({
            query: (id) => `stock/balance/${id}`,
            providesTags: ["Stock"],
        }),

        getHistoryOfStockItem: build.query({
            query: ({ projectId, itemName }) =>
                `stock/item/${projectId}/${encodeURIComponent(itemName)}`,
            providesTags: ["Stock"],
        }),


        outStock: build.mutation({
            query: (body) => ({
                url: "stock/issue",
                method: "POST",
                body
            }),
            invalidatesTags: ["Stock"]
        }),

        updateStock: build.mutation({
            query: ({ id, formData }) => ({
                url: `stock/${id}`,
                method: "PUT",
                body: formData,
            }),
            invalidatesTags: ["Stock"],
        }),


        getLabour: build.query({
            query: (id) => `auth/labours`,
            providesTags: ["Stock"],
        }),

        getLabourById: build.query({
            query: (id) => `auth/labours/${id}`,
            providesTags: ["Stock"],
        }),


        addLabour: build.mutation({

            query: (body) => ({
                url: "auth/add-labour",
                method: "POST",
                body
            }),
            invalidatesTags: ["Stock"]
        }),

        updateLabour: build.mutation({
            query: ({ id, formData }) => ({
                url: `labour/update/${id}`,
                method: "PUT",
                body: formData,
            }),
            invalidatesTags: ["Stock"],
        }),

        addItems: build.mutation({
            query: (body) => ({
                url: "item/add",
                method: "POST",
                body
            }),
            invalidatesTags: ["Stock"]
        }),

        getAllItems: build.query({
            query: (id) => `item/all`,
            providesTags: ["Stock"],
        }),


        attendanceMark: build.mutation({
            query: (body) => ({
                url: "attendance/mark",
                method: "POST",
                body
            }),
            invalidatesTags: ["Stock"]
        }),


        assignLabour: build.mutation({
            query: (body) => ({
                url: "assignLabour/assign-labour",
                method: "POST",
                body
            }),
            invalidatesTags: ["Stock"]
        }),

        UnassignLabour: build.mutation({
            query: (body) => ({
                url: "assignLabour/unassign-labour",
                method: "POST",
                body
            }),
            invalidatesTags: ["Stock"]
        }),

        reassignLabour: build.mutation({
            query: (body) => ({
                url: "assignLabour/reassign-labour",
                method: "POST",
                body
            }),
            invalidatesTags: ["Stock"]
        }),





        getMaterialRequest: build.query({
            query: (id) => `mr/all`,
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


        CreateMaterialRequest: build.mutation({
            query: (body) => ({
                url: "mr/add",
                method: "POST",
                body
            }),
            invalidatesTags: ["MaterialRequest"]
        }),


        getPendingRequests: build.query({
            query: (id) => `mr/pending`,
            providesTags: ["MaterialRequest"],
        }),

        // approveMaterialRequest: build.mutation({
        //     query: (id) => ({
        //         url: `mr/approve/${id}`,
        //         method: "PUT",
        //     }),
        //     invalidatesTags: ["MaterialRequest"],
        // }),

        approveMaterialRequest: build.mutation({
            query: ({ id, data }) => ({
                url: `mr/approve/${id}`,
                method: "PUT",
                body: data
            }),
            invalidatesTags: ["MaterialRequest"]
        }),

        rejectMaterialRequest: build.mutation({
            query: ({ id }) => ({
                url: `mr/reject/${id}`,
                method: "PUT",
                // body
            }),
            invalidatesTags: ["MaterialRequest"],
        }),



        getMachines: build.query({
            query: () => "machine/all",
            providesTags: ["Machine"],
        }),

        // ADD machine
        // addMachine: build.mutation({
        //     query: (data) => ({
        //         url: "machine/add",
        //         method: "POST",
        //         body: data,
        //     }),
        //     invalidatesTags: ["Machine"],
        // }),

        // GET machine by id
        getMachineById: build.query({
            query: (id) => `machine/${id}`,
            providesTags: ["Machine"],
        }),

        // UPDATE machine
        updateMachine: build.mutation({
            query: ({ id, ...data }) => ({
                url: `machine/${id}`,
                method: "PUT",
                body: data,
            }),
            invalidatesTags: ["Machine"],
        }),

        // DELETE machine
        deleteMachine: build.mutation({
            query: (id) => ({
                url: `machine/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Machine"],
        }),


        allocateMachine: build.mutation({
            query: (data) => ({
                url: "machine/allocation/allocate",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Machine"],
        }),



        // Get allocation list
        getAllocations: build.query({
            query: () => "machine/allocation/all",
            providesTags: ["Machine"],
        }),


        addMachineUsage: build.mutation({
            query: (data) => ({
                url: "machine/usage/add",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Machine"],
        }),

        // GET usage
        getMachineUsage: build.query({
            query: () => "machine/usage/all",
            providesTags: ["Machine"],
        }),




        // ✔ Mark Single Attendance
        // markAttendance: build.mutation({
        //     query: (body) => ({
        //         url: `/attendance/mark`,
        //         method: "POST",
        //         body,
        //     }),
        // }),

        getAssignedLabour: build.query({
            query: (projectId) => ({
                url: `assignLabour/labour-by-project`,
                params: { projectId },
            }),
            providesTags: ["Labour"],
        }),



        // ✔ Bulk Attendance
        markBulkAttendance: build.mutation({
            query: (body) => ({
                url: `/attendance/mark-bulk`,
                method: "POST",
                body,
            }),
        }),

        // ✔ Pending Approval List
        getPendingAttendance: build.query({
            query: () => `/attendance/employee/pending`,
        }),

        getAllAttendance: build.query({
            query: () => `/attendance/list`,
        }),

        // ✔ Approve Attendance
        approveAttendance: build.mutation({
            query: (payload) => ({
                url: `/attendance/approve`,
                method: "POST",
                body: payload,
            }),
        }),


        // inside api.injectEndpoints or createApi endpoints
        assignTask: build.mutation({
            query: (data) => ({
                url: "/task/assign",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Task"],
        }),


        // 📌 get all tasks (auto role-based filtering from backend)
        getTasks: build.query({
            query: () => "/task/all",
            providesTags: ["Task"],
        }),

        getTaskById: build.query({
            query: (id) => `/task/project/${id}`,
            providesTags: ["Task"],
            // providesTags: (id) => [{ type: "AssignWork", id }],
        }),




        // 📌 get logged-in user's tasks
        getMyTasks: build.query({
            query: () => "/task/my-tasks",
            providesTags: ["Task"],
        }),


        // 📌 generic update status
        updateTaskStatus: build.mutation({
            query: ({ id, status, remarks }) => ({
                url: `/task/status/${id}`,
                method: "PUT",
                body: { status, remarks },
            }),
            invalidatesTags: ["Task"],
        }),


        // 📌 accept task
        acceptTask: build.mutation({
            query: (id) => ({
                url: `/task/accept/${id}`,
                method: "PUT",
            }),
            invalidatesTags: ["Task"],
        }),


        // 📌 reject task
        rejectTask: build.mutation({
            query: ({ id, reason }) => ({
                url: `/task/reject/${id}`,
                method: "PUT",
                body: { reason },
            }),
            invalidatesTags: ["Task"],
        }),


        // 📌 update progress
        updateTaskProgress: build.mutation({
            query: ({ id, progress }) => ({
                url: `/task/progress/${id}`,
                method: "PUT",
                body: { progress },
            }),
            invalidatesTags: ["Task"],
        }),


        // 📌 worker submits work for approval
        submitTaskCompletion: build.mutation({
            query: (id) => ({
                url: `/task/submit-completion/${id}`,
                method: "PUT",
            }),
            invalidatesTags: ["Task"],
        }),


        // 📌 manager approves task
        approveTask: build.mutation({
            query: (id) => ({
                url: `/task/approve/${id}`,
                method: "PUT",
            }),
            invalidatesTags: ["Task"],
        }),


        // 📌 add comment log
        addTaskComment: build.mutation({
            query: ({ id, comment }) => ({
                url: `/task/comment/${id}`,
                method: "POST",
                body: { comment },
            }),
            invalidatesTags: ["TaskActivity"],
        }),


        // 📌 get task activity/logs
        getTaskActivity: build.query({
            query: (id) => `/task/activity/${id}`,
            providesTags: ["TaskActivity"],
        }),


        // 📌 update priority
        updateTaskPriority: build.mutation({
            query: ({ id, priority }) => ({
                url: `/task/priority/${id}`,
                method: "PUT",
                body: { priority },
            }),
            invalidatesTags: ["Task"],
        }),


        // 📌 update dependencies
        updateTaskDependencies: build.mutation({
            query: ({ id, dependencies }) => ({
                url: `/task/dependencies/${id}`,
                method: "PUT",
                body: { dependencies },
            }),
            invalidatesTags: ["Task"],
        }),


        // 📌 delete task (admin/manager only)
        deleteTask: build.mutation({
            query: (id) => ({
                url: `/task/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Task"],
        }),




        getLabourReport: build.query({
            query: () => "/report/labour",
            providesTags: ["Report"],
        }),
        getMachineReport: build.query({
            query: () => "/report/machine",
            providesTags: ["Report"],
        }),
        getProjectReport: build.query({
            query: () => "/report/project-summary",
            providesTags: ["Report"],
        }),


        getMaintenanceList: build.query({
            query: () => "/machine/maintenance",
            providesTags: ["Maintenance"],
        }),
        // addMaintenance: build.mutation({
        //     query: (data) => ({
        //         url: "/machine/maintenance",
        //         method: "POST",
        //         body: data,
        //     }),
        //     invalidatesTags: ["Maintenance"],
        // }),



        // getProjectStock: build.query({
        //     query: (projectId) => `/stock/project/${projectId}`,
        //     providesTags: (result, error, arg) =>
        //         result
        //             ? [
        //                 ...result.map((item) => ({
        //                     type: "Stock",
        //                     id: item._id,
        //                 })),
        //                 { type: "Stock", id: "LIST" },
        //             ]
        //             : [{ type: "Stock", id: "LIST" }],
        // }),

        // Transactions
        getProjectTransactions: build.query({
            query: (projectId) => `/stock/transactions/${projectId}`,
            providesTags: (result, error, arg) => [
                { type: "Transactions", id: arg },
            ],
        }),

        // Receive material
        receiveMaterial: build.mutation({
            query: (body) => ({
                url: "/stock/receive",
                method: "POST",
                body,
            }),
            invalidatesTags: ["Stock", "Transactions"],
        }),

        // Use material
        useMaterial: build.mutation({
            query: (body) => ({
                url: "/stock/use",
                method: "POST",
                body,
            }),
            invalidatesTags: ["Stock", "Transactions"],
        }),

        // Transfer material
        transferMaterial: build.mutation({
            query: (body) => ({
                url: "/stock/transfer",
                method: "POST",
                body,
            }),
            invalidatesTags: ["Stock", "Transactions"],
        }),

        // Return material
        returnMaterial: build.mutation({
            query: (body) => ({
                url: "/stock/return",
                method: "POST",
                body,
            }),
            invalidatesTags: ["Stock", "Transactions"],
        }),




        // 👉 CREATE GRN
        createGRN: build.mutation({
            query: (body) => ({
                url: `/grn/add`,
                method: "POST",
                body,
            }),
            invalidatesTags: ["GRN"],
        }),

        // 👉 GET GRN by ID
        getGRN: build.query({
            query: (id) => `/grn/${id}`,
            providesTags: ["GRN"],
        }),

        // 👉 LIST GRNs
        getAllGRN: build.query({
            query: () => `/grn`,
            providesTags: ["Maintenance"],
        }),


        getProjectStock: build.query({
            query: (projectId) => `/grn/project/${projectId}`,
            providesTags: ["Stock"],
        }),

        // ⭐ 6. ITEM LEDGER HISTORY
        getItemHistory: build.query({
            query: ({ itemId, projectId }) =>
                `/grn/history/${itemId}/${projectId}`,
            providesTags: ["Stock"],
        }),

        // getItemLedger: build.query({
        //     query: (itemId) =>
        //         `/grn/ledger/${itemId}`,
        //     keepUnusedDataFor: 0,
        //     providesTags: ["Stock"],

        // }),

        getItemLedger: build.query({
            query: ({ projectId, itemId }) => `/grn/ledger/${projectId}/${itemId}`,
            providesTags: ["Stock"],
        }),


        addConsumption: build.mutation({
            query: (body) => ({
                url: "consumption/add-multiple",
                method: "POST",
                body
            }),
            invalidatesTags: ["Stock"],
        }),



        punchIn: build.mutation({
            query: (body) => ({
                url: "attendance/employee/mark",
                method: "POST",
                body,
            }),
            invalidatesTags: ["Employee"],
        }),

        // Punch Out
        punchOut: build.mutation({
            query: (body) => ({
                url: "attendance/employee/punch-out",
                method: "POST",
                body,
            }),
            invalidatesTags: ["Employee"],
        }),

        // Employee List
        getEmployeeList: build.query({
            query: () => "attendance/employee/list",
            providesTags: ["Employee"],
        }),

        // Date-wise attendance
        getAttendanceByDate: build.query({
            // query: (date) => `attendance/employee/by-date?date=${date}`,
            query: ({ date }) => `/attendance/employee/by-date?date=${date}`,

            providesTags: ["Employee"],
        }),


        // getAttendance: build.query({

        //     query: ({ date }) => `attendance/employee/my?date=${date}`,

        //     providesTags: ["Employee"],
        // }),

        getAttendance: build.query({
            query: ({ date }) => `attendance/employee/my?date=${date}`,
            providesTags: ["Employee"],
        }),


        // Pending approvals
        getPendingEmployeeAttendance: build.query({
            query: () => "attendance/employee/pending",
            providesTags: ["Employee"],
        }),

        approveEmployeeAttendance: build.mutation({
            query: (attendanceId) => ({
                url: "attendance/employee/approve",
                method: "POST",
                body: { attendanceId },
            }),
            invalidatesTags: ["Employee"],
        }),


        //  Labour Attendance

        getLaboursByProject: build.query({
            query: (projectId) => `attendance/labour/list?projectId=${projectId}`,
            providesTags: ["Labour"],
        }),

        getTodaysPresentLabours: build.query({
            query: (projectId) => `attendance/TodaysPresentLabours/list`,
            providesTags: ["Labour"],
        }),

        bulkMarkLabour: build.mutation({
            query: (body) => ({
                url: "attendance/labour/mark-bulk",
                method: "POST",
                body,
            }),
            invalidatesTags: ["Labour"],
        }),

        getPendingLabourAttendance: build.query({
            query: () => "attendance/labour/pending",
            providesTags: ["Labour"],
        }),

        approveLabourAttendance: build.mutation({
            query: (data) => ({
                url: "attendance/labour/approve",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Labour"],
        }),



        todayReport: build.query({
            query: (projectId) => `attendance/reports/today/${projectId}`,
            providesTags: ["Reports"],
        }),

        summaryReport: build.query({
            query: (projectId) => `attendance/reports/summary/${projectId}`,
            providesTags: ["Reports"],
        }),

        monthlyReport: build.query({
            query: ({ projectId, month, year }) =>
                `attendance/reports/monthly/${projectId}?month=${month}&year=${year}`,
            providesTags: ["Reports"],
        }),


        addMachine: build.mutation({
            query: (formData) => ({
                url: "machines/add",
                method: "POST",
                body: formData,  // must be FormData
            }),
            invalidatesTags: ["Machine", "Assignments"],
        }),

        // ===============================
        // 2️⃣ Get All Machines
        // ===============================
        getAllMachines: build.query({
            query: () => `machines/all`,
            providesTags: ["Machine", "Assignments"],
        }),

        // ===============================
        // 3️⃣ Get Machine Details
        // ===============================
        getMachineDetails: build.query({
            query: (id) => `machines/${id}`,
            providesTags: ["Machine", "Maintenance", "Usage", "Assignments"],
        }),

        // ===============================
        // 4️⃣ Add Maintenance
        // ===============================
        addMaintenance: build.mutation({
            query: (formData) => ({
                url: "machines/maintenance/add",
                method: "POST",
                body: formData, // file upload
            }),
            invalidatesTags: ["Maintenance", "Machine", "Assignments"],
        }),

        // ===============================
        // 5️⃣ Get Maintenance History
        // ===============================
        getMaintenanceHistory: build.query({
            query: (machineId) => `machines/${machineId}/maintenance`,
            providesTags: ["Maintenance", "Assignments"],
        }),

        // ===============================
        // 6️⃣ Add/Update Daily Usage
        // ===============================
        addUsage: build.mutation({
            query: (data) => ({
                url: "machines/usage",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Usage"],
        }),

        // ===============================
        // 7️⃣ Get Daily Usage List
        // ===============================
        getUsageList: build.query({
            query: (params) => ({
                url: "machines/usage",
                params,
            }),
            providesTags: ["Usage"],
        }),



        assignMachine: build.mutation({
            query: (data) => ({
                url: "assignments/assign",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Assignments"],
        }),

        // Release Machine
        releaseMachine: build.mutation({
            query: (data) => ({
                url: "assignments/release",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Assignments"],
        }),

        // Active Assignments
        getActiveAssignments: build.query({
            query: () => "assignments/active",
            providesTags: ["Assignments"],
        }),

        // Assignment History
        getAssignmentHistory: build.query({
            query: (machineId) => `assignments/history/${machineId}`,
            providesTags: ["Assignments"],
        }),



        // 1️⃣ Get project tasks
        getProjectTasks: build.query({
            query: (projectId) => `/gantt/projects/${projectId}/tasks`,
            providesTags: ["ProjectTasks"],
        }),

        // 2️⃣ Create task
        createTask: build.mutation({
            query: ({ projectId, body }) => ({
                url: `/gantt/projects/${projectId}/tasks`,
                method: "POST",
                body
            }),
            invalidatesTags: ["ProjectTasks"],
        }),

        // 3️⃣ Update task
        updateTask: build.mutation({
            query: ({ taskId, data }) => ({
                url: `/gantt/tasks/${taskId}`,
                method: "PUT",
                body: data,
            }),
            invalidatesTags: ["ProjectTasks"],
        }),

        // 4️⃣ Delete task
        deleteTask: build.mutation({
            query: ({ taskId }) => ({
                url: `/gantt/tasks/${taskId}`,
                method: "DELETE",
            }),
            invalidatesTags: ["ProjectTasks"],
        }),

        // 5️⃣ Reorder drag-drop
        sortTasks: build.mutation({
            query: (data) => ({
                url: `/gantt/tasks/sort-order/bulk`,
                method: "PUT",
                body: data, // [{taskId, sortOrder}]
            }),
            invalidatesTags: ["ProjectTasks"],
        }),


        // ASSIGN WORK CRUD
        getAssignedWork: build.query({
            query: () => "/assignWork",
            providesTags: ["AssignWork"],
        }),

        getAssignedWorkById: build.query({
            query: (id) => `/assignWork/${id}`,
            providesTags: (id) => [{ type: "AssignWork", id }],
        }),

        createAssignedWork: build.mutation({
            query: (body) => ({
                url: "/assignWork",
                method: "POST",
                body,
            }),
            invalidatesTags: ["AssignWork"],
        }),

        updateAssignedWork: build.mutation({
            query: ({ id, body }) => ({
                url: `/assignWork/${id}`,
                method: "PUT",
                body,
            }),
            invalidatesTags: (result, error, { id }) => [
                "AssignWork",
                { type: "AssignWork", id },
            ],
        }),

        deleteAssignedWork: build.mutation({
            query: (id) => ({
                url: `/assignWork/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["AssignWork"],
        }),





    }),
});

export const {
    useRegisterMutation,
    useLoginMutation,
    useAddProjectMutation,
    useGetProjectsQuery,
    useGetProjectByIdQuery,
    useCheckLoginQuery,
    useDeleteProjectMutation,
    useUpdateProjectMutation,
    useAddRolesMutation,
    useGetRolesQuery,
    useUpdateRolesMutation,
    useAddUserMutation,
    useGetUsersQuery,
    useGetUsersByIdQuery,
    useAddVendorMutation,
    useGetVendorsQuery,
    useGetVendorByIdQuery,
    useUpdateVendorMutation,
    useGetStockByIdQuery,
    useAddStockMutation,
    useGetBalanceOfStockQuery,
    useAssignManagerMutation,
    useGetHistoryOfStockItemQuery,
    // useAddLabourMutation,

    useGetLabourQuery,
    useGetLabourByIdQuery,
    useAddLabourMutation,
    useUpdateLabourMutation,
    useAddItemsMutation,
    useAttendanceMarkMutation,
    // useGetAhttendanceQuery,
    useAssignProjectQuery,
    useAssignLabourMutation,
    useReassignLabourMutation,
    useUnassignLabourMutation,
    useUserDetailQuery,
    useAssignSupervisorMutation,
    useCreateMaterialRequestMutation,
    useGetMaterialRequestQuery,

    useGetPendingRequestsQuery,
    useApproveMaterialRequestMutation,
    useRejectMaterialRequestMutation,
    // useAssignLabourMutation


    useGetMachinesQuery,
    // useAddMachineMutation,
    useGetMachineByIdQuery,
    useUpdateMachineMutation,
    useDeleteMachineMutation,
    useAllocateMachineMutation,
    // useReleaseMachineMutation,
    useGetAllocationsQuery,

    useAddMachineUsageMutation,
    useGetMachineUsageQuery,

    useGetAssignedLabourQuery,
    useGetUnAssignedLabourQuery,
    // useMarkAttendanceMutation,
    useMarkBulkAttendanceMutation,
    useGetPendingAttendanceQuery,
    useApproveAttendanceMutation,
    useGetAllAttendanceQuery,
    useGetProjectsByIdQuery,

    // assign Task

    // useAssignTaskMutation,
    // useGetTasksQuery,
    // useUpdateTaskStatusMutation,
    // useDeleteTaskMutation,

    useGetLabourReportQuery,
    useGetMachineReportQuery,
    useGetProjectReportQuery,

    useGetMaintenanceListQuery,
    // useAddMaintenanceMutation,


    useGetProjectTransactionsQuery,
    useReceiveMaterialMutation,
    useUseMaterialMutation,
    useTransferMaterialMutation,
    useReturnMaterialMutation,

    useGetAllItemsQuery,

    useGetPoRequestQuery,

    useGetSingleMRQuery,
    useCreateGRNMutation,
    useGetGRNQuery,
    useGetAllGRNQuery,
    useGetItemHistoryQuery,
    useGetProjectStockQuery,
    useGetItemLedgerQuery,

    useOutStockMutation,

    useAddConsumptionMutation,

    usePunchInMutation,
    usePunchOutMutation,
    useGetEmployeeListQuery,
    useGetAttendanceByDateQuery,
    useGetAttendanceQuery,
    useGetPendingEmployeeAttendanceQuery,
    useApproveEmployeeAttendanceMutation,

    useGetLaboursByProjectQuery,
    useBulkMarkLabourMutation,
    useGetPendingLabourAttendanceQuery,
    useApproveLabourAttendanceMutation,


    useTodayReportQuery,
    useSummaryReportQuery,
    useMonthlyReportQuery,


    useAddMachineMutation,
    useGetAllMachinesQuery,
    useGetMachineDetailsQuery,
    useAddMaintenanceMutation,
    useGetMaintenanceHistoryQuery,
    useAddUsageMutation,
    useGetUsageListQuery,

    useAssignMachineMutation,
    useReleaseMachineMutation,
    useGetActiveAssignmentsQuery,
    useGetAssignmentHistoryQuery,


    useGetProjectTasksQuery,
    useCreateTaskMutation,
    useUpdateTaskMutation,
    // useDeleteTaskMutation,
    useSortTasksMutation,

    useGetTodaysPresentLaboursQuery,


    useGetAssignedWorkQuery,
    useGetAssignedWorkByIdQuery,
    useCreateAssignedWorkMutation,
    useUpdateAssignedWorkMutation,
    useDeleteAssignedWorkMutation,


    useAssignTaskMutation,
    useGetTasksQuery,
    useGetTaskByIdQuery,
    useUpdateTaskStatusMutation,
    useGetMyTasksQuery,
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

    useDeleteUserMutation

    // useAddUserMutation,
    // useGetRolesQuery,
    // useAddUserMutation
    // 👈 ye add ho gaya
} = Api;
