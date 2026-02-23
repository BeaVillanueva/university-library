import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../state/AuthContext";
import { apiReportsSummary, apiReportsMySummary } from "../api/reports";
import Alert from "../components/Alert";

export default function DashboardPage() {
  const { user } = useAuth();
  const [kpis, setKpis] = useState(null);
  const [error, setError] = useState("");

  const role = user?.role || "";
  const isStudent = useMemo(() => role === "student", [role]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setError("");
      try {
        // Admin/Librarian: global KPIs (/reports/summary)
        // Student: personal KPIs (/reports/my-summary)
        const res = isStudent ? await apiReportsMySummary() : await apiReportsSummary();
        if (!cancelled) setKpis(res.kpis);
      } catch (e) {
        if (!cancelled) {
          setKpis(null);
          const msg = e?.response?.data?.error || "Failed to load dashboard";
          setError(msg);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [isStudent]);

  return (
    <div>
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p className="mt-2 text-sm text-slate-600 a11y-muted">
        Welcome, <span className="font-medium">{user?.name}</span>.
      </p>

      {error ? (
        <div className="mt-4">
          <Alert type="error">{error}</Alert>
        </div>
      ) : null}

      {isStudent ? (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <KpiCard title="Total borrowed" value={kpis?.my_total_borrowed ?? "—"} />
          <KpiCard title="Borrowed (active)" value={kpis?.my_borrowed_active ?? "—"} />
          <KpiCard title="Overdue (active)" value={kpis?.my_overdue_active ?? "—"} />
          <KpiCard title="Returned (total)" value={kpis?.my_returned_total ?? "—"} />
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <KpiCard title="Total books" value={kpis?.total_books ?? "—"} />
          <KpiCard title="Available copies" value={kpis?.available_copies ?? "—"} />
          <KpiCard title="Borrowed (active)" value={kpis?.borrowed_active ?? "—"} />
          <KpiCard title="Overdue (active)" value={kpis?.overdue_active ?? "—"} />
        </div>
      )}

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 a11y-surface a11y-outline">
        <div className="text-sm font-semibold">Notes</div>
        <ul className="mt-2 list-disc pl-5 text-sm text-slate-600 a11y-muted">
          <li>Books are imported via CSV (no manual add-book form).</li>
          <li>Overdue is auto-detected when due_date &lt; today and not returned.</li>
        </ul>
      </div>
    </div>
  );
}

function KpiCard({ title, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 a11y-surface a11y-outline">
      <div className="text-xs uppercase tracking-wide text-slate-500 a11y-muted">{title}</div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
    </div>
  );
}