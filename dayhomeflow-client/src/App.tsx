import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AuthPage from "./pages/Authpage.tsx";
import DashboardPage from "./pages/DashboardPage";
import AttendancePage from "./pages/AttendancePage";
import InvoicePage from "./pages/InvoicePage.tsx";
import "./App.css";

function App() {
  const isLoggedIn = !!localStorage.getItem("dayhomeflow_token");

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={isLoggedIn ? <Navigate to="/dashboard" /> : <Navigate to="/auth" />}
        />

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
      </Routes>
    </BrowserRouter>
  );
}

export default App;