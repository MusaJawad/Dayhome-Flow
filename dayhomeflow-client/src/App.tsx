import type { ReactElement } from "react";
import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import DashboardPage from "./pages/DashboardPage";
import AttendancePage from "./pages/AttendancePage";
import InvoicePage from "./pages/InvoicePage";
import ProviderSettingsPage from "./pages/ProviderSettingsPage";
import "./App.css";

type ProtectedRouteProps = {
  children: ReactElement;
};

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const token = localStorage.getItem("dayhomeflow_token");

  if (!token) {
    return <Navigate to="/auth" replace />;
  }

  return children;
}

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/attendance"
          element={
            <ProtectedRoute>
              <AttendancePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/invoices"
          element={
            <ProtectedRoute>
              <InvoicePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <ProviderSettingsPage />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}

export default App;