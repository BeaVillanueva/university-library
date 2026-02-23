import React, { useEffect, useState } from "react";
import { apiListAllBorrows } from "../../api/borrow";
import Pagination from "../../components/Pagination";
import Alert from "../../components/Alert";

export default function OverduePage() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const res = await apiListAllBorrows({ page, limit: 10, status: "overdue" });
        if (!cancelled) {
          setItems(res.items || []);
          setTotalPages(res.total_pages || 1);
        }
      } catch (e) {
        if (!cancelled) setError(e?.response?.data?.error || e?.message || "Failed to load overdue list");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [page]);

  return (
    <div>
      <h1 className="text-2xl font-semibold">Overdue</h1>
      <p className="mt-1 text-sm text-slate-600 a11y-muted">Records where due_date is in the past and not returned.</p>

      {error ? (
        <div className="mt-4">
          <Alert type="error">{error}</Alert>
        </div>
      ) : null}

      <div className="mt-4 rounded-2xl border border-slate-200 bg-white a11y-surface a11y-outline">
        <div className="table-scroll">
          <table className="min-w-full text-sm">
            <thead className="border-b border-slate-200">
              <tr className="text-left text-xs uppercase tracking-wide text-slate-500 a11y-muted">
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Book</th>
                <th className="px-4 py-3">Borrow</th>
                <th className="px-4 py-3">Due</th>
                <th className="px-4 py-3">Days late</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-4 text-slate-600 a11y-muted">
                    Loading…
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-4 text-slate-600 a11y-muted">
                    No overdue records.
                  </td>
                </tr>
              ) : (
                items.map((r) => (
                  <tr key={r.id} className="border-t border-slate-100">
                    <td className="px-4 py-3">
                      <div className="font-medium">{r.user_name}</div>
                      <div className="text-xs text-slate-500 a11y-muted">{r.user_email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{r.title}</div>
                      <div className="text-xs text-slate-500 a11y-muted font-mono">{r.isbn}</div>
                    </td>
                    <td className="px-4 py-3">{r.borrow_date}</td>
                    <td className="px-4 py-3">{r.due_date}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full bg-red-50 px-2 py-1 text-xs font-semibold text-red-700">
                        {daysLate(r.due_date)} days
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="border-t border-slate-200 px-4 py-3">
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      </div>
    </div>
  );
}

function daysLate(dueDate) {
  if (!dueDate) return 0;
  const due = new Date(dueDate + "T00:00:00");
  const now = new Date();
  const ms = now.getTime() - due.getTime();
  return ms > 0 ? Math.floor(ms / (1000 * 60 * 60 * 24)) : 0;
}