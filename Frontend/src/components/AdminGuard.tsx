import { type ReactNode } from "react";
import { Navigate } from "react-router-dom";

/**
 * AdminGuard wraps the /admin route.
 * It checks sessionStorage for the adminToken and adminRole set by AdminLoginModal.
 * If the token or role is missing/invalid, it redirects to /home.
 *
 * This is a client-side guard — the Express API enforces role on every request too.
 */
const AdminGuard = ({ children }: { children: ReactNode }) => {
  const token = sessionStorage.getItem("adminToken");
  const role = sessionStorage.getItem("adminRole");

  const isAuthorised =
    token !== null && (role === "ADMIN" || role === "HR");

  if (!isAuthorised) {
    return <Navigate to="/home" replace />;
  }

  return <>{children}</>;
};

export default AdminGuard;
