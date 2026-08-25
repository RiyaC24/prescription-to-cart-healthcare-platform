import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "@/app/hooks";
import type { Role } from "@/types/auth";
import { getStoredTokens } from "@/lib/tokenStorage";

interface ProtectedRouteProps {
  allowedRoles?: Role[];
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const user = useAppSelector((state) => state.auth.user);
  const { accessToken } = getStoredTokens();

  if (!user || !accessToken) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}
