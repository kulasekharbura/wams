import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";

// --- Page Imports ---
import Login from "./pages/auth/Login";
import DealerDashboard from "./pages/dealer/DealerDashboard";
import InventoryDashboard from "./pages/inventory/InventoryDashboard";
import SupplierDashboard from "./pages/supplier/SupplierDashboard";
import ManagementDashboard from "./pages/management/ManagementDashboard"; // NEW: Real Admin Page

const Unauthorized = () => (
  <div style={{ padding: "2rem", textAlign: "center" }}>
    <h2>403 - Access Denied</h2>
    <p>You do not have permission to view this department's data.</p>
    <button onClick={() => (window.location.href = "/")}>Back to Login</button>
  </div>
);

// --- Route Protection Logic ---
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

// --- Home Route Logic ---
// Redirects logged-in users away from Login page to their specific dashboard
const HomeRoute = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) return <Login />;

  // Logic to send users to the right place if they hit "/" while logged in
  switch (user.role) {
    case "Administrator":
      return <Navigate to="/admin" />;
    case "Dealer":
      return <Navigate to="/dealer" />;
    case "Inventory Manager":
      return <Navigate to="/inventory" />;
    case "Supplier":
      return <Navigate to="/supplier" />;
    default:
      return <Login />;
  }
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomeRoute />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Protected Department Routes */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute allowedRoles={["Administrator"]}>
            <ManagementDashboard /> {/* Updated from dummy to Real Dashboard */}
          </ProtectedRoute>
        }
      />
      <Route
        path="/dealer/*"
        element={
          <ProtectedRoute allowedRoles={["Dealer"]}>
            <DealerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/inventory/*"
        element={
          <ProtectedRoute allowedRoles={["Inventory Manager"]}>
            <InventoryDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/supplier/*"
        element={
          <ProtectedRoute allowedRoles={["Supplier"]}>
            <SupplierDashboard />
          </ProtectedRoute>
        }
      />

      {/* Catch-all: Send unknown URLs to Login */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
