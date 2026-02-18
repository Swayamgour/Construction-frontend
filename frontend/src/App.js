import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "./pages/login/Login";
import SignUp from "./pages/Signup/SingUp";
import Dashboard from "./pages/dashboard/Dashboard";
import Layout from "./components/Layout";
import AddProject from "./pages/AddProject";
import AddMember from "./pages/AddMember";
import UserRolesAndPermissions from "./pages/UserRolesAndPermissions";
import RolePermissionsPage from "./pages/permissionsData";
import VendorManagementDashboard from "./pages/VendorManagementDashboard";
import CreateNewVendorForm from "./pages/CreateNewVendorForm";
import ProjectInventoryDashboard from "./pages/ProjectInventoryDashboard";
import TaskManagement from "./pages/TaskManagement";
import DashboardProject from "./pages/DashboardProject";
import BillofQuantities from "./pages/BillofQuantities";
import VendorPaymentDashboard from "./pages/VendorPaymentDashboard";
import PayablesDashboard from "./pages/PayablesDashboard";
import CreateWorkOrder from "./pages/CreateWorkOrder";
import SCPayableDashboard from "./pages/SCPayableDashboard";
import PaymentHistory from "./components/PaymentHistory";
// import MainDashBoad from "./pages/MainDashBoad";
import EditProjectPage from "./pages/EditProjectPage";
import ProfilePage from "./pages/ProfilePage";
import VendorDetailsPage from "./pages/VendorDetailsPage";
import WorkOrderForm from "./pages/WorkOrderForm";
import Setting from "./pages/Setting";
import ApprovalSettings from "./pages/ApprovalSettings";
import IndentPage from "./pages/IndentPage";
import PurchaseOrder from "./pages/PurchaseOrder";
import WorkDashboard from "./pages/WorkDashboard";
import ProjectDetail from "./pages/ProjectDetail";
// import WorkManagement from "./pages/WorkManagement";
// import LabourDashboard from "./pages/LabourDashboard";
import AddNewLabour from "./pages/AddNewLabour";
// import LabourDetailPage from "./pages/LabourDetailPage";
import ReportsPage from "./pages/ReportsPage";
import MachineManageMent from "./pages/MachineManageMent";
import MachineDetailPage from "./pages/MachineDetailPage";
import DashboardVendor from "./pages/DashboardVendor";
import VendorDetails from "./pages/VendorDetails";
import Notification from "./pages/Notification";
import ProjectTasks from "./pages/ProjectTasks";
import AddTask from "./pages/AddTask";
import AddDailyUpdate from "./pages/AddDailyUpdate";
import BudgetDashboard from "./pages/BudgetDashboard";
import AddBOQItem from "./pages/AddBOQItem";
import ExploreDetailedBOQ from "./pages/ExploreDetailedBOQ";
import AddNewProject from "./pages/AddNewProject";
import AddNewMachine from "./pages/AddNewMachine";
import AssignTask from "./pages/AssignTask/AssignTask";
import TaskView from "./pages/TaskView";
import TaskList from "./pages/TaskList";

import { Toaster } from "react-hot-toast";
import CreateUserRoleForm from "./pages/User/CreateUserRoleForm";
import ViewUser from "./pages/User/ViewUser";
import UserDetails from "./pages/User/UserDetails";
import StockOverview from "./pages/inventory/StockOverview";
import StockInCreate from "./pages/inventory/StockInCreate";
import StockOutCreate from "./pages/stock/StockOutCreate";
import LabourDashboard from "./pages/labour/LabourDashboard";
import LabourDetail from "./pages/labour/LabourDetail";
import StockItemHistory from "./pages/inventory/StockItemHistory";
import LabourForm from "./pages/labour/LabourForm";
import PMDashboard from "./pages/projectManager/PMDashboard";
import DailyWorkReport from "./pages/projectManager/DailyWorkReport";
import TaskAssignment from "./pages/projectManager/TaskAssignment";
import Allocation from "./pages/projectManager/Allocation";
import MarkAttendance from "./pages/Attendence/MarkAttendance";
import AssignLabour from "./pages/AssignLabour";
import ProtectedRoute from "./components/ProtectedRoute";
import AssignProject from "./pages/dashboard/AssignProject";
import { CheckRole } from "./helper/CheckRole";
import MaterialRequest from "./pages/mr/MaterialRequest";
import MaterialApproval from "./pages/mr/MaterialApproval";
import MachineList from "./pages/Machines/MachineList";
import AddEditMachine from "./pages/Machines/AddEditMachine";
import MachineAllocation from "./pages/Machines/MachineAllocation";
import MachineUsage from "./pages/Machines/MachineUsage";
import ProjectAttendancePage from "./pages/Attendence/ProjectAttendancePage";
import PendingAttendancePage from "./pages/Attendence/PendingAttendancePage";
import AttendanceLabour from "./pages/AttendanceLabour";
import Tasks from "./pages/AssignTask/Task";
import MyTasks from "./pages/AssignTask/MyTasks";
import ReportsDashboard from "./pages/reports/ReportsDashboard";
import ProjectStockPage from "./pages/stock/ProjectStockPage";
import TransactionsPage from "./pages/stock/TransactionsPage";
import POView from "./pages/mr/POView";
import GRNCreate from "./pages/mr/GRNCreate";
import StockPage from "./pages/stock/StockPage";
import StockHistory from "./pages/stock/StockHistory";
import StockConsumption from "./pages/StockConsumption/StockConsumption";
import PunchIn from "./pages/employee/PunchIn";
import PunchOut from "./pages/employee/PunchOut";
import AttendanceByDate from "./pages/employee/AttendanceByDate";
import EmployeePending from "./pages/employee/EmployeePending";
import EmployeeList from "./pages/employee/EmployeeList";
import BulkAttendance from "./pages/labour/BulkAttendance";
// import SingleMark from "./pages/labour/SingleMark";
import PendingApprovals from "./pages/labour/PendingApprovals";
import LabourList from "./pages/labour/LabourList";
import TodayReport from "./pages/report/TodayReport";
import MonthlyReport from "./pages/report/MonthlyReport";
import AddMachine from "./pages/Machines/AddMachine";
import MachineDetails from "./pages/Machines/MachineDetails";
import AddMaintenance from "./pages/Machines/AddMaintenance";
import AssignMachine from "./pages/Assignment/AssignMachine";
import ActiveAssignments from "./pages/Assignment/ActiveAssignments";
import AssignmentHistory from "./pages/Assignment/AssignmentHistory";
import GanttCustom from "./GanttCustom";
import GanttChart from "./pages/Gantt/GanttChart";
import TaskFrom from "./pages/Gantt/TaskFrom";
import DailyWorkReportForm from "./pages/workReport/DailyWorkReportForm";
// import './App.css'
// import ProjectPage from "./pages/Gantt/ProjectPage";
// import GanttPage from "./pages/Gantt/GanttPage";
// import MaterialRequestApproval from "./pages/mr/MaterialRequestApproval";


function App() {

  const { role } = CheckRole()
  // console.log(role)


  return (
    <>
      {/* // <BrowserRouter> */}

      <Toaster
        position="top-center"
        reverseOrder={false}
      />
      <Routes>


        {/* Public routes */}
        <Route path="/login" element={
          // <ProtectedRoute>
          <Login />
          // </ProtectedRoute>
        } />
        <Route path="/signup" element={
          // <ProtectedRoute>
          <SignUp />
          // </ProtectedRoute>

        } />

        {/* Protected / Dashboard routes with Layout */}
        <Route
          path="/"
          element={
            <Layout>
              {role === 'manager' ? <PMDashboard /> : <Dashboard />}
            </Layout>
          }
        />
        <Route
          path="/dashboard"
          element={
            <Layout>
              {/* <Dashboard /> */}
              {role === 'manager' ? <PMDashboard /> : <Dashboard />}
            </Layout>
          }
        />
        <Route
          path="/WorkManagement"
          element={
            <Layout>
              <WorkDashboard />
            </Layout>
          }
        />
        {/* <Route
          path="/LabourDashboard"
          element={
            <Layout>
              <LabourDashboard />
            </Layout>
          }
        /> */}
        <Route
          path="/ProjectDetail"
          element={
            <Layout>
              <ProjectDetail />
            </Layout>
          }
        />
        <Route
          path="/Product"
          element={
            <Layout>
              <Dashboard />
            </Layout>
          }
        />
        <Route
          path="/AddProject"
          element={
            <Layout>
              <AddProject />
            </Layout>
          }
        />
        <Route
          path="/AddMember"
          element={
            <Layout>
              <AddMember />
            </Layout>
          }
        />
        <Route
          path="/UserRolesAndPermissions"
          element={
            <Layout>
              <UserRolesAndPermissions />
            </Layout>
          }
        />
        <Route
          path="/RolePermissionsPage"
          element={
            <Layout>
              <RolePermissionsPage />
            </Layout>
          }
        />
        <Route
          path="/VendorManagementDashboard"
          element={
            <Layout>
              <VendorManagementDashboard />
            </Layout>
          }
        />

        <Route
          path="/ProjectInventoryDashboard"
          element={
            <Layout>
              <ProjectInventoryDashboard />
            </Layout>
          }
        />
        <Route
          path="/TaskManagement"
          element={
            <Layout>
              <TaskManagement />
            </Layout>
          }
        />
        <Route
          path="/DashboardProject"
          element={
            <Layout>
              <DashboardProject />
            </Layout>
          }
        />
        <Route
          path="/BillofQuantities"
          element={
            <Layout>
              <BillofQuantities />
            </Layout>
          }
        />
        <Route
          path="/VendorPaymentDashboard"
          element={
            <Layout>
              <VendorPaymentDashboard />
            </Layout>
          }
        />
        <Route
          path="/PayablesDashboard"
          element={
            <Layout>
              <PayablesDashboard />
            </Layout>
          }
        />
        <Route
          path="/CreateWorkOrder"
          element={
            <Layout>
              <CreateWorkOrder />
            </Layout>
          }
        />
        <Route
          path="/SCPayableDashboard"
          element={
            <Layout>
              <SCPayableDashboard />
            </Layout>
          }
        />
        <Route
          path="/PaymentHistory"
          element={
            <Layout>
              <PaymentHistory />
            </Layout>
          }
        />
        <Route
          path="/EditProjectPage"
          element={
            <Layout>
              <EditProjectPage />
            </Layout>
          }
        />
        <Route
          path="/Profile"
          element={
            <Layout>
              <ProfilePage />
            </Layout>
          }
        />
        <Route
          path="/VendorDetailsPage"
          element={
            <Layout>
              <VendorDetailsPage />
            </Layout>
          }
        />
        <Route
          path="/WorkOrderForm"
          element={
            <Layout>
              < WorkOrderForm />
            </Layout>
          }
        />
        <Route
          path="/Setting"
          element={
            <Layout>
              <Setting />
            </Layout>
          }
        />
        <Route
          path="/ApprovalSettings"
          element={
            <Layout>
              <ApprovalSettings />
            </Layout>
          }
        />
        <Route
          path="/IndentPage"
          element={
            <Layout>
              <IndentPage />
            </Layout>
          }
        />
        <Route
          path="/PurchaseOrder"
          element={
            <Layout>
              <PurchaseOrder />
            </Layout>
          }
        />
        <Route
          path="/AddNewLabour"
          element={
            <Layout>
              <AddNewLabour />
            </Layout>
          }
        />

        <Route
          path="/ReportsPage"
          element={
            <Layout>
              {/* <ReportsDashboard /> */}
            </Layout>
          }
        />
        <Route
          path="/MachineManageMent"
          element={
            <Layout>
              <MachineManageMent />
            </Layout>
          }
        />
        <Route
          path="/MachineDetailPage"
          element={
            <Layout>
              <MachineDetailPage />
            </Layout>
          }
        />
        <Route
          path="/VendorManagement"
          element={
            <Layout>
              <DashboardVendor />
            </Layout>
          }
        />
        <Route
          path="/VendorDetails/:id"
          element={
            <Layout>
              <VendorDetails />
            </Layout>
          }
        />
        <Route
          path="/CreateNewVendorForm"
          element={
            <Layout>
              <CreateNewVendorForm />
            </Layout>
          }
        />
        <Route
          path="/EditVendorForm"
          element={
            <Layout>
              <CreateNewVendorForm />
            </Layout>
          }
        />
        <Route
          path="/Notification"
          element={
            <Layout>
              <Notification />
            </Layout>
          }
        />
        <Route
          path="/ProjectTasks"
          element={
            <Layout>
              <ProjectTasks />
            </Layout>
          }
        />
        <Route
          path="/AddTask"
          element={
            <Layout>
              <AddTask />
            </Layout>
          }
        />
        <Route
          path="/AddDailyUpdate"
          element={
            <Layout>
              <AddDailyUpdate />
            </Layout>
          }
        />

        <Route
          path="/BudgetDashboard"
          element={
            <Layout>
              <BudgetDashboard />
            </Layout>
          }
        />

        <Route
          path="/AddBOQItem"
          element={
            <Layout>
              <AddBOQItem />
            </Layout>
          }
        />
        <Route
          path="/ExploreDetailedBOQ"
          element={
            <Layout>
              <ExploreDetailedBOQ />
            </Layout>
          }
        />
        <Route
          path="/AddNewProject"
          element={
            <Layout>
              <AddNewProject />
            </Layout>
          }
        />
        <Route
          path="/EditProject"
          element={
            <Layout>
              <AddNewProject />
            </Layout>
          }
        />
        <Route
          path="/AddNewMachine"
          element={
            <Layout>
              <AddNewMachine />
            </Layout>
          }
        />
        {/* <Route
          path="/AssignTask"
          element={
            <Layout>
              <AssignTask />
            </Layout>
          }
        /> */}
        <Route
          path="/TaskView"
          element={
            <Layout>
              <TaskView />
            </Layout>
          }
        />
        <Route
          path="/TaskList"
          element={
            <Layout>
              <Tasks />
            </Layout>
          }
        />
        <Route
          path="/AssignTask"
          element={
            <Layout>
              <AssignTask />
            </Layout>
          }
        />

        <Route
          path="/MyTasks/:id"
          element={
            <Layout>
              <MyTasks />
            </Layout>
          }
        />
        <Route
          path="/CreateUserRoleForm"
          element={
            <Layout>
              <CreateUserRoleForm />
            </Layout>
          }
        />
        <Route
          path="/ViewUser"
          element={
            <Layout>
              <ViewUser />
            </Layout>
          }
        />
        <Route
          path="/UserDetails"
          element={
            <Layout>
              <UserDetails />
            </Layout>
          }
        />
        <Route
          path="/StockOverView"
          element={
            <Layout>
              <StockOverview />
            </Layout>
          }
        />
        <Route
          path="/StockInCreate"
          element={
            <Layout>
              <StockInCreate />
            </Layout>
          }
        />

        <Route
          path="/StockItemHistory/:projectId/:itemName"
          element={
            <Layout>
              <StockItemHistory />
            </Layout>
          }
        />

        <Route
          path="/LabourDashboard"
          element={
            <Layout>
              <LabourDashboard />
            </Layout>
          }
        />
        <Route
          path="/LabourDetail/:id"
          element={
            <Layout>
              <LabourDetail />
            </Layout>
          }
        />
        <Route
          path="/LabourForm"
          element={
            <Layout>
              <LabourForm />
            </Layout>
          }
        />

        <Route path="/pm/dashboard" element={<Layout >
          <PMDashboard />
        </Layout>
        } />
        <Route path="/work/daily" element={<Layout >
          <DailyWorkReport />
        </Layout>
        } />
        <Route path="/tasks" element={<Layout >
          <TaskAssignment />
        </Layout>
        } />
        <Route path="/tasks/create" element={<Layout >
          <TaskAssignment />
        </Layout>
        } />
        <Route path="/allocation" element={<Layout >
          <Allocation />
        </Layout>
        } />
        <Route path="/MarkAttendance" element={<Layout >
          <MarkAttendance />
        </Layout>
        } />

        <Route path="/AssignLabour" element={
          <Layout >
            <AssignLabour />
          </Layout>
        }
        />

        <Route path="/AssignLabour" element={
          <Layout >
            <AssignLabour />
          </Layout>
        }
        />


        <Route path="/AssignProject" element={
          <Layout >
            <AssignProject />
          </Layout>
        }
        />

        <Route path="/MaterialRequest" element={
          <Layout >
            <MaterialRequest />
          </Layout>
        }
        />

        <Route path="/MaterialApproval" element={
          <Layout >
            <MaterialApproval />
          </Layout>
        }
        />


        {/* <Route path="/machines" element={<Layout>
          <MachineList />
        </Layout>

        } /> */}
        <Route path="/machines/add" element={<Layout>
          <AddEditMachine />
        </Layout>

        } />
        <Route path="/machines/edit/:id" element={<Layout>
          <AddEditMachine />
        </Layout>

        } />

        <Route path="/machine-allocation" element={<Layout>
          <MachineAllocation />
        </Layout>

        } />

        <Route path="/machine-usage" element={<Layout>
          <MachineUsage />
        </Layout>



        } />



        <Route
          path="/projects/:projectId/attendance"
          element={
            <Layout>
              <ProjectAttendancePage />
            </Layout>
          }
        />

        <Route
          path="/attendance/pending"
          element={
            <Layout>
              <PendingAttendancePage />
            </Layout>
          }
        />

        <Route
          path="/AttendanceLabour"
          element={
            <Layout>
              <AttendanceLabour />
            </Layout>
          }
        />

        <Route
          path="/POView/:id"
          element={
            <Layout>
              <POView />
            </Layout>
          }
        />

        <Route
          path="/GRNCreate/:id"
          element={
            <Layout>
              <GRNCreate />
            </Layout>
          }
        />

        <Route
          path="/StockPage"
          element={
            <Layout>
              <StockPage />
            </Layout>
          }
        />
        <Route
          path="StockHistory/:projectId/:itemId"
          element={
            <Layout>
              <StockHistory />
            </Layout>
          }
        />

        <Route
          path="/consumption"
          element={
            <Layout>
              <StockConsumption />
            </Layout>
          }
        />
        <Route
          path="/StockOut/:id"
          element={
            <Layout>
              <StockOutCreate />
            </Layout>
          }
        />

        {/* <Route
          path="/"
          element={<Navigate to="/stock/project/PROJECT_ID_HERE" />}
        /> */}
        <Route
          path="/stock/project/:projectId"
          element={<ProjectStockPage />}
        />
        <Route
          path="/stock/transactions/:projectId"
          element={<TransactionsPage />}
        />




        <Route path="/employee/punch-in" element={<Layout>

          <PunchIn />
        </Layout>

        } />
        <Route path="/employee/punch-out" element={<Layout>

          <PunchOut />
        </Layout>

        } />
        <Route path="/employee/attendance-by-date" element={
          <Layout>
            <AttendanceByDate />
          </Layout>

        } />
        <Route path="/employee/pending" element={<Layout>

          <EmployeePending />
        </Layout>

        } />
        <Route path="/employee/list" element={<Layout>

          <EmployeeList />
        </Layout>

        } />


        <Route path="/labour/bulk" element={<Layout>

          <BulkAttendance />
        </Layout>

        } />
        <Route path="/labour/pending" element={<Layout>

          <PendingApprovals />
        </Layout>

        } />
        <Route path="/labour/list" element={<Layout>
          <LabourList />
        </Layout>

        } />


        <Route path="/reports/today" element={<Layout>

          <TodayReport />
        </Layout>

        } />
        <Route path="/reports/monthly" element={<Layout>

          <MonthlyReport />
        </Layout>

        } />


        <Route path="/machine/list" element={<Layout>
          <MachineList />
        </Layout>
        } />
        <Route path="/machine/add" element={<Layout>
          <AddMachine />
        </Layout>
        } />
        <Route path="/machine/:id" element={<Layout>
          <MachineDetails />
        </Layout>
        } />
        <Route path="/machine/:id/maintenance/add" element={<Layout>
          <AddMaintenance />
        </Layout>
        } />

        {/* <Route path="/usage/add" element={<DailyUsageAdd />} />
        <Route path="/usage/list" element={<DailyUsageList />} /> */}

        <Route path="/assign" element={<Layout>
          <AssignMachine />
        </Layout>
        } />
        <Route path="/assign/active" element={<Layout>
          <ActiveAssignments />
        </Layout>
        } />
        <Route path="/assign/history/:machineId" element={
          <Layout>
            <AssignmentHistory />
          </Layout>
        } />


        <Route path="/GanttChart/:id" element={
          <Layout>
            <GanttChart />
          </Layout>
        } />

        <Route path="/AddGanttTask" element={
          <Layout>
            <TaskFrom />
          </Layout>
        } />

        <Route path="/DailyWorkReportForm" element={
          <Layout>
            <DailyWorkReportForm />
          </Layout>
        } />





        {/* <Route path="/GanttPage" element={
          <Layout>
            <ProjectPage />
          </Layout>
        } /> */}



        {/* </Layout> */}
      </Routes >
      {/* // </BrowserRouter> */}
    </>
  );
}

export default App;


