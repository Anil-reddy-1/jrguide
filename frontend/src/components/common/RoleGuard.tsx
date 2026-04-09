import { type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth, type AppRole } from "../../state/auth";

type Props = {
  allow: AppRole[];
  children: ReactNode;
};

export const RoleGuard = ({ allow, children }: Props) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-navy-200 border-t-navy-600" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If user has no role yet, send to role selection
  if (!user.role) {
    return <Navigate to="/select-role" replace />;
  }

  if (!allow.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
