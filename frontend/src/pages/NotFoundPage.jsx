import React from "react";
import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen grid place-items-center p-6">
      <div className="max-w-md w-full rounded-2xl border border-slate-200 bg-white p-6 a11y-surface a11y-outline">
        <h1 className="text-xl font-semibold">Page not found</h1>
        <p className="mt-2 text-sm text-slate-600 a11y-muted">
          The page you’re looking for doesn’t exist.
        </p>
        <Link
          to="/"
          className="mt-4 inline-block rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          aria-label="Go back to dashboard"
        >
          Go to dashboard
        </Link>
      </div>
    </div>
  );
}