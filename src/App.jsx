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

/* ================= ROOT REDIRECT ================= */
const RootRedirect = () => {
  const { isAuthenticated, role, loading } = useAuth();

  if (loading) return null;

  if (!isAuthenticated) return <Navigate to="/role-selection" replace />;

  if (role === "administrator") return <Navigate to="/dashboard" replace />;
  if (role === "security") return <Navigate to="/security-dashboard" replace />;
  if (role === "employee") return <Navigate to="/employee-dashboard" replace />;

  return <Navigate to="/role-selection" replace />;
};

/* ================= PROTECTED ROUTE ================= */
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, role, loading } = useAuth();

  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/role-selection" replace />;
  if (!allowedRoles.includes(role)) return <Navigate to="/" replace />;

  return children;
};

/* ================= ROUTES ================= */
const AppRoutes = () => {
  return (
    <Routes>
      {/* ROOT */}
      <Route path="/" element={<RootRedirect />} />

      {/* AUTH */}
      <Route path="/role-selection" element={<RoleSelection />} />
      <Route path="/login" element={<Login />} />
      <Route path="/employee-login" element={<EmployeeLogin />} />

      {/* ADMIN */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={["administrator"]}>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/register-visitor"
        element={
          <ProtectedRoute allowedRoles={["administrator"]}>
            <RegisterVisitor />
          </ProtectedRoute>
        }
      />
      <Route
        path="/active-visitors"
        element={
          <ProtectedRoute allowedRoles={["administrator"]}>
            <ActiveVisitors />
          </ProtectedRoute>
        }
      />
      <Route
        path="/visitor-logs"
        element={
          <ProtectedRoute allowedRoles={["administrator"]}>
            <VisitorLogs />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin-notifications"
        element={
          <ProtectedRoute allowedRoles={["administrator"]}>
            <AdminNotifications />
          </ProtectedRoute>
        }
      />
      <Route
        path="/security-alerts"
        element={
          <ProtectedRoute allowedRoles={["administrator"]}>
            <SecurityAlerts />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute allowedRoles={["administrator"]}>
            <Settings />
          </ProtectedRoute>
        }
      />

      {/* SECURITY */}
      <Route
        path="/security-dashboard"
        element={
          <ProtectedRoute allowedRoles={["security"]}>
            <SecurityDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/security-register-visitor"
        element={
          <ProtectedRoute allowedRoles={["security"]}>
            <SecurityRegisterVisitor />
          </ProtectedRoute>
        }
      />
      <Route
        path="/security-active-visitors"
        element={
          <ProtectedRoute allowedRoles={["security"]}>
            <SecurityActiveVisitors />
          </ProtectedRoute>
        }
      />
      <Route
        path="/security-visitor-logs"
        element={
          <ProtectedRoute allowedRoles={["security"]}>
            <SecurityVisitorLogs />
          </ProtectedRoute>
        }
      />
      <Route
        path="/security-notifications"
        element={
          <ProtectedRoute allowedRoles={["security"]}>
            <SecurityNotifications />
          </ProtectedRoute>
        }
      />
      <Route
        path="/security-settings"
        element={
          <ProtectedRoute allowedRoles={["security"]}>
            <SecuritySettings />
          </ProtectedRoute>
        }
      />

      {/* EMPLOYEE */}
      <Route
        path="/employee-dashboard"
        element={
          <ProtectedRoute allowedRoles={["employee"]}>
            <EmployeeDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/employee-visitor-logs"
        element={
          <ProtectedRoute allowedRoles={["employee"]}>
            <EmployeeLogs />
          </ProtectedRoute>
        }
      />
      <Route
        path="/employee-settings"
        element={
          <ProtectedRoute allowedRoles={["employee"]}>
            <EmployeeSettings />
          </ProtectedRoute>
        }
      />
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
