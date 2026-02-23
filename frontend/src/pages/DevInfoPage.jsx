import React from "react";
import { useAuth } from "../state/AuthContext";
import Alert from "../components/Alert";
import { http } from "../api/http";

export default function DevInfoPage() {
  const { user, token } = useAuth();

  return (
    <div>
      <h1 className="text-2xl font-semibold">Dev Info</h1>
      <p className="mt-1 text-sm text-slate-600 a11y-muted">Helpful info while testing locally.</p>

      <div className="mt-4">
        <Alert>
          API Base URL: <span className="font-mono">{http.defaults.baseURL}</span>
        </Alert>
      </div>

      <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card title="User object">
          <pre className="text-xs whitespace-pre-wrap break-words">{JSON.stringify(user, null, 2)}</pre>
        </Card>
        <Card title="JWT token (stored in localStorage)">
          <pre className="text-xs whitespace-pre-wrap break-words">{token || "—"}</pre>
        </Card>
      </div>
    </div>
  );
}

function Card({ title, children }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 a11y-surface a11y-outline">
      <div className="text-sm font-semibold">{title}</div>
      <div className="mt-2 rounded-lg border border-slate-200 bg-slate-50 p-3 a11y-outline">{children}</div>
    </div>
  );
}