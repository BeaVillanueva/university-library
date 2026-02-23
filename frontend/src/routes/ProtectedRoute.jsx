import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../state/AuthContext";

export default function ProtectedRoute({ children, roles }) {
  const { isAuthenticated, user, loading } = useAuth();
  const loc = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center">
        <div className="text-sm text-slate-600 a11y-muted" aria-live="polite">
          Loading…
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: loc.pathname }} />;
  }

  if (roles?.length) {
    const role = user?.role;
    if (!roles.includes(role)) {
      return (
        <div className="min-h-screen grid place-items-center p-6">
          <div className="max-w-md w-full rounded-xl border border-slate-200 bg-white p-6 a11y-surface a11y-outline">
            <h1 className="text-lg font-semibold">Access denied</h1>
            <p className="mt-2 text-sm text-slate-600 a11y-muted">
              Your account does not have permission to view this page.
            </p>
          </div>
        </div>
      );
    }
  }

  return children;
}