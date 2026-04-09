import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./state/auth";
import { RoleGuard } from "./components/common/RoleGuard";
import { AppLayout } from "./components/layout/AppLayout";
import { LoginPage } from "./pages/auth/LoginPage";
import { RoleSelectPage } from "./pages/auth/RoleSelectPage";
import { EmployeeChatPage } from "./pages/employee/EmployeeChatPage";
import { EmployeeChecklistPage } from "./pages/employee/EmployeeChecklistPage";
import { EmployeeContactsPage } from "./pages/employee/EmployeeContactsPage";
import { EmployeeDocumentsPage } from "./pages/employee/EmployeeDocumentsPage";
import { EmployeeFaqPage } from "./pages/employee/EmployeeFaqPage";
import { EmployeeHomePage } from "./pages/employee/EmployeeHomePage";
import { EmployeeNotificationsPage } from "./pages/employee/EmployeeNotificationsPage";
import { HrAnalyticsPage } from "./pages/hr/HrAnalyticsPage";
import { HrDashboardPage } from "./pages/hr/HrDashboardPage";
import { HrEmailAutomationPage } from "./pages/hr/HrEmailAutomationPage";
import { HrEmployeesPage } from "./pages/hr/HrEmployeesPage";
import { HrFaqManagerPage } from "./pages/hr/HrFaqManagerPage";
import { HrTemplatesPage } from "./pages/hr/HrTemplatesPage";
import { NotFoundPage } from "./pages/NotFoundPage";

function App() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/select-role" element={user ? <RoleSelectPage /> : <Navigate to="/login" replace />} />

      <Route
        path="/employee"
        element={
          <RoleGuard allow={["employee"]}>
            <AppLayout />
          </RoleGuard>
        }
      >
        <Route index element={<EmployeeHomePage />} />
        <Route path="checklist" element={<EmployeeChecklistPage />} />
        <Route path="documents" element={<EmployeeDocumentsPage />} />
        <Route path="faq" element={<EmployeeFaqPage />} />
        <Route path="chat" element={<EmployeeChatPage />} />
        <Route path="contacts" element={<EmployeeContactsPage />} />
        <Route path="notifications" element={<EmployeeNotificationsPage />} />
      </Route>

      <Route
        path="/hr"
        element={
          <RoleGuard allow={["hr", "admin"]}>
            <AppLayout />
          </RoleGuard>
        }
      >
        <Route index element={<HrDashboardPage />} />
        <Route path="employees" element={<HrEmployeesPage />} />
        <Route path="templates" element={<HrTemplatesPage />} />
        <Route path="faqs" element={<HrFaqManagerPage />} />
        <Route path="email" element={<HrEmailAutomationPage />} />
        <Route path="analytics" element={<HrAnalyticsPage />} />
      </Route>

      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
