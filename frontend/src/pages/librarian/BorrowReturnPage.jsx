import React, { useEffect, useState } from "react";
import { apiListAllBorrows, apiReturnBorrow } from "../../api/borrow";
import Pagination from "../../components/Pagination";
import Alert from "../../components/Alert";

export default function BorrowReturnPage() {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [loading, setLoading] = useState(false);
  const [workingId, setWorkingId] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await apiListAllBorrows({
        page,
        limit: 10,
        status: status || undefined,
        from: from || undefined,
        to: to || undefined
      });
      setItems(res.items || []);
      setTotalPages(res.total_pages || 1);
    } catch (e) {
      setError(e?.response?.data?.error || e?.message || "Failed to load borrows");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, status, from, to]);

  async function doReturn(id) {
    setWorkingId(id);
    setNotice("");
    setError("");
    try {
      await apiReturnBorrow(id);
      setNotice("Returned.");
      await load();
    } catch (e) {
      setError(e?.response?.data?.error || e?.message || "Return failed");
    } finally {
      setWorkingId(null);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold">Borrow / Return</h1>
      <p className="mt-1 text-sm text-slate-600 a11y-muted">
        View active and historical borrow records. Return books here.
      </p>

      <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 a11y-surface a11y-outline">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label className="text-xs text-slate-500 a11y-muted">Status</label>
            <select
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm a11y-input a11y-outline"
              value={status}
              onChange={(e) => {
                setPage(1);
                setStatus(e.target.value);
              }}
              aria-label="Filter by status"
            >
              <option value="">All</option>
              <option value="borrowed">Borrowed</option>
              <option value="overdue">Overdue</option>
              <option value="returned">Returned</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-500 a11y-muted">From</label>
            <input
              type="date"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm a11y-input a11y-outline"
              value={from}
              onChange={(e) => {
                setPage(1);
                setFrom(e.target.value);
              }}
              aria-label="From date"
            />
          </div>
          <div>
            <label className="text-xs text-slate-500 a11y-muted">To</label>
            <input
              type="date"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm a11y-input a11y-outline"
              value={to}
              onChange={(e) => {
                setPage(1);
                setTo(e.target.value);
              }}
              aria-label="To date"
            />
          </div>
          <div className="flex items-end">
            <button
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm hover:bg-slate-50 a11y-surface a11y-outline"
              onClick={() => {
                setPage(1);
                setStatus("");
                setFrom("");
                setTo("");
              }}
              type="button"
              aria-label="Reset borrow filters"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {notice ? (
        <div className="mt-4">
          <Alert type="success">{notice}</Alert>
        </div>
      ) : null}
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
                <th className="px-4 py-3">Return</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-4 text-slate-600 a11y-muted">
                    Loading…
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-4 text-slate-600 a11y-muted">
                    No records.
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
                    <td className="px-4 py-3">{r.return_date || "—"}</td>
                    <td className="px-4 py-3">
                      <StatusPill status={r.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end">
                        <button
                          className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
                          disabled={!!r.return_date || workingId === r.id}
                          onClick={() => doReturn(r.id)}
                          aria-label={`Return record ${r.id}`}
                          type="button"
                        >
                          {workingId === r.id ? "Returning…" : "Return"}
                        </button>
                      </div>
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