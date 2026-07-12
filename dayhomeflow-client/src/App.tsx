import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import DashboardPage from "./pages/DashboardPage";
import AttendancePage from "./pages/AttendancePage";
import InvoicePage from "./pages/InvoicePage";
import ProviderSettingsPage from "./pages/ProviderSettingsPage";
import "./App.css";

function App() {
  const isLoggedIn = !!localStorage.getItem("dayhomeflow_token");

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />

        <Route
          path="/auth"
          element={isLoggedIn ? <Navigate to="/dashboard" /> : <AuthPage />}
        />

        <Route
          path="/dashboard"
          element={isLoggedIn ? <DashboardPage /> : <Navigate to="/auth" />}
        />

        <Route
          path="/attendance"
          element={isLoggedIn ? <AttendancePage /> : <Navigate to="/auth" />}
        />

        <Route
          path="/invoices"
          element={isLoggedIn ? <InvoicePage /> : <Navigate to="/auth" />}
        />

        <Route
          path="/settings"
          element={isLoggedIn ? <ProviderSettingsPage /> : <Navigate to="/auth" />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;