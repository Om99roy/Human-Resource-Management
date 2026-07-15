import "./App.css";
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import AdminDashboard from "./pages/AdminDashboard";
import AuthPage from "./pages/AuthPage";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import AdminGuard from "./components/AdminGuard";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "@fontsource/inter/800.css";

const App = () => {
  return (
    <Routes>
      {/* Root redirect */}
      <Route path="/" element={<Navigate to="/home" replace />} />

      {/* Landing page */}
      <Route path="/home" element={<Home />} />

      {/* Employee onboarding / registration */}
      <Route path="/auth/signup" element={<AuthPage />} />

      {/* Admin dashboard — guarded by AdminGuard (checks sessionStorage) */}
      <Route
        path="/admin"
        element={
          <AdminGuard>
            <AdminDashboard />
          </AdminGuard>
        }
      />

      {/* Employee self-service dashboard */}
      <Route path="/employee" element={<EmployeeDashboard />} />

      {/* Catch-all → home */}
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  );
};

export default App;
