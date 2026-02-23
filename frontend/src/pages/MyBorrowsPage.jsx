import React, { useEffect, useState } from "react";
import { apiMyBorrowHistory } from "../api/borrow";
import Pagination from "../components/Pagination";
import Alert from "../components/Alert";

export default function MyBorrowsPage() {
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
        const res = await apiMyBorrowHistory({ page, limit: 10 });
        if (!cancelled) {
          setItems(res.items || []);
          setTotalPages(res.total_pages || 1);
        }
      } catch (e) {
        if (!cancelled) setError(e?.response?.data?.error || e?.message || "Failed to load history");
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
      <h1 className="text-2xl font-semibold">My Borrowing History</h1>
      <p className="mt-1 text-sm text-slate-600 a11y-muted">
        Shows your borrowed, returned, and overdue records.
      </p>

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
                <th className="px-4 py-3">Book</th>
                <th className="px-4 py-3">Borrow</th>
                <th className="px-4 py-3">Due</th>
                <th className="px-4 py-3">Return</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="px-4 py-4 text-slate-600 a11y-muted" colSpan={5}>
                    Loading…
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td className="px-4 py-4 text-slate-600 a11y-muted" colSpan={5}>
                    No records.
                  </td>
                </tr>
              ) : (
                items.map((r) => (
                  <tr key={r.id} className="border-t border-slate-100">
                    <td className="px-4 py-3">
                      <div className="font-medium">{r.title}</div>
                      <div className="text-xs text-slate-500 a11y-muted font-mono">{r.isbn}</div>
                    </td>
                    <td className="px-4 py-3">{r.borrow_date}</td>
                    <td className="px-4 py-3">{r.due_date}</td>
                    <td className="px-4 py-3">{r.return_date || "—"}</td>
                    <td className="px-4 py-3">
                      <StatusPill status={r.status} />
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

function StatusPill({ status }) {
  const cls =
    status === "overdue"
      ? "bg-red-50 text-red-700"
      : status === "returned"
        ? "bg-green-50 text-green-700"
        : "bg-blue-50 text-blue-700";
  return <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${cls}`}>{status}</span>;
}