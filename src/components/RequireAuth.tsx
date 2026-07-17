import { Navigate, useLocation } from "react-router";
import { useAuth } from "@/contexts/AuthContext";
import type { ReactNode } from "react";

export default function RequireAuth({ children }: { children: ReactNode }) {
  const { isLoggedIn } = useAuth();
  const location = useLocation();
  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  return <>{children}</>;
}
