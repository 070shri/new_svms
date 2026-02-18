import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";

/* ================= AUTH ================= */
import RoleSelection from "./pages/RoleSelection";
import Login from "./pages/Login";
import EmployeeLogin from "./pages/EmployeeLogin";
import SecurityLogin from "./pages/SecurityLogin";

/* ================= ADMIN ================= */
import Dashboard from "./pages/Dashboard";
import RegisterVisitor from "./pages/RegisterVisitor";
import ActiveVisitors from "./pages/ActiveVisitors";
import VisitorLogs from "./pages/VisitorLogs";
import SecurityAlerts from "./pages/SecurityAlerts";
import Settings from "./pages/Settings";
import AdminNotifications from "./pages/AdminNotifications";

/* ================= SECURITY ================= */
import SecurityDashboard from "./pages/SecurityDashboard";
import SecurityRegisterVisitor from "./pages/SecurityRegisterVisitor";
import SecurityActiveVisitors from "./pages/SecurityActiveVisitors";
import SecurityVisitorLogs from "./pages/SecurityVisitorLogs";
import SecurityNotifications from "./pages/SecurityNotifications";
import SecuritySettings from "./pages/SecuritySettings";

/* ================= EMPLOYEE ================= */
import EmployeeDashboard from "./pages/EmployeeDashboard";
import EmployeeLogs from "./pages/EmployeeLogs";
import EmployeeSettings from "./pages/EmployeeSettings";
import EmployeeNotifications from "./pages/EmployeeNotification";


/* ================= ROOT REDIRECT ================= */
const RootRedirect = () => {
  const { isAuthenticated, role, loading } = useAuth();

  // Prevent redirect logic during initial auth load
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>
  );

  if (!isAuthenticated) return <Navigate to="/role-selection" replace />;

  // Roles must match Backend casing (Admin, Security, Employee)
  switch (role) {
    case "Admin": return <Navigate to="/dashboard" replace />;
    case "Security": return <Navigate to="/security-dashboard" replace />;
    case "Employee": return <Navigate to="/employee-dashboard" replace />;
    default: return <Navigate to="/role-selection" replace />;
  }
};

/* ================= PROTECTED ROUTE ================= */
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, role, loading } = useAuth();

  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/role-selection" replace />;
  
  // Use .includes to check if the current user role is authorized
  if (!allowedRoles.includes(role)) {
    return <Navigate to="/role-selection" replace />;
  }

  return children;
};

/* ================= ROUTES ================= */
const AppRoutes = () => {
  return (
    <Routes>
      {/* PUBLIC AUTH ROUTES */}
      <Route path="/" element={<RootRedirect />} />
      <Route path="/role-selection" element={<RoleSelection />} />
      <Route path="/login" element={<Login />} />
      <Route path="/security-login" element={<SecurityLogin />} />
      <Route path="/employee-login" element={<EmployeeLogin />} />

      {/* ADMIN DASHBOARD - Protected by "Admin" */}
      <Route path="/dashboard" element={
          <ProtectedRoute allowedRoles={["Admin"]}>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route path="/register-visitor" element={
          <ProtectedRoute allowedRoles={["Admin"]}>
            <RegisterVisitor />
          </ProtectedRoute>
        }
      />
      <Route path="/active-visitors" element={
          <ProtectedRoute allowedRoles={["Admin"]}>
            <ActiveVisitors />
          </ProtectedRoute>
        }
      />
      <Route path="/visitor-logs" element={
          <ProtectedRoute allowedRoles={["Admin"]}>
            <VisitorLogs />
          </ProtectedRoute>
        }
      />
      <Route path="/admin-notifications" element={
          <ProtectedRoute allowedRoles={["Admin"]}>
            <AdminNotifications />
          </ProtectedRoute>
        }
      />
      <Route path="/security-alerts" element={
          <ProtectedRoute allowedRoles={["Admin"]}>
            <SecurityAlerts />
          </ProtectedRoute>
        }
      />
      <Route path="/settings" element={
          <ProtectedRoute allowedRoles={["Admin"]}>
            <Settings />
          </ProtectedRoute>
        }
      />

      {/* SECURITY DASHBOARD - Protected by "Security" */}
      <Route path="/security-dashboard" element={
          <ProtectedRoute allowedRoles={["Security"]}>
            <SecurityDashboard />
          </ProtectedRoute>
        }
      />
      <Route path="/security-register-visitor" element={
          <ProtectedRoute allowedRoles={["Security"]}>
            <SecurityRegisterVisitor />
          </ProtectedRoute>
        }
      />
      <Route path="/security-active-visitors" element={
          <ProtectedRoute allowedRoles={["Security"]}>
            <SecurityActiveVisitors />
          </ProtectedRoute>
        }
      />
      <Route path="/security-visitor-logs" element={
          <ProtectedRoute allowedRoles={["Security"]}>
            <SecurityVisitorLogs />
          </ProtectedRoute>
        }
      />
      <Route path="/security-notifications" element={
          <ProtectedRoute allowedRoles={["Security"]}>
            <SecurityNotifications />
          </ProtectedRoute>
        }
      />
      <Route path="/security-settings" element={
          <ProtectedRoute allowedRoles={["Security"]}>
            <SecuritySettings />
          </ProtectedRoute>
        }
      />

      {/* EMPLOYEE DASHBOARD - Protected by "Employee" */}
      <Route path="/employee-dashboard" element={
          <ProtectedRoute allowedRoles={["Employee"]}>
            <EmployeeDashboard />
          </ProtectedRoute>
        }
      />
      <Route
  path="/employee-notifications"
  element={<EmployeeNotifications />}
/>

      <Route path="/employee-visitor-logs" element={
          <ProtectedRoute allowedRoles={["Employee"]}>
            <EmployeeLogs />
          </ProtectedRoute>
        }
      />
      <Route path="/employee-settings" element={
          <ProtectedRoute allowedRoles={["Employee"]}>
            <EmployeeSettings />
          </ProtectedRoute>
        }
      />

      {/* FALLBACK */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

/* ================= APP ================= */
export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}