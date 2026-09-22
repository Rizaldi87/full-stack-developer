import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import type { PropsWithChildren } from "react";
import type { Role } from "../types";

interface ProtectedRouteProps extends PropsWithChildren {
  allowed?: Role[];
}

export function ProtectedRoute({ children, allowed }: ProtectedRouteProps) {
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

  return children;
}
