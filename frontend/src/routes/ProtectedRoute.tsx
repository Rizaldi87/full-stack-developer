import { Navigate, Outlet, useLocation } from "react-router-dom";
import type { PropsWithChildren } from "react";
import type { Role } from "../types";
import { useAuth } from "../auth/AuthContext";

interface ProtectedRouteProps extends PropsWithChildren {
  allowed?: Role[];
}

export function ProtectedRoute({ allowed }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-gray-500">Memuat…</div>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowed && !allowed.includes(user.role)) {
    return <Navigate to={user.role === "COMPANY" ? "/company/jobs" : "/jobs"} replace />;
  }

  return <Outlet />;
}
