import React, { useEffect, useMemo, useState } from "react";
import Pagination from "../../components/Pagination.jsx";
import { apiListAllBorrows, apiReturnBorrow } from "../../api/borrow.js";

function fmt(s) {
  if (!s) return "—";
  return String(s);
}

export default function BorrowBorrowedPage() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [q, setQ] = useState("");

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const params = useMemo(
    () => ({
      status: "borrowed",
      page,
      limit: 10,
      q: q.trim() || undefined
    }),
    [page, q]
  );

  async function load() {
    setLoading(true);
    setErr("");
    try {
      const res = await apiListAllBorrows(params);
      setItems(res?.items || []);
      setTotalPages(res?.total_pages || 1);
    } catch (e) {
      setErr(e?.response?.data?.error || e?.message || "Failed to load borrowed records.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, q]);

  async function onReturn(id) {
    if (!confirm("Mark this book as returned?")) return;
    try {
      await apiReturnBorrow(id);
      await load();
    } catch (e) {
      alert(e?.response?.data?.error || e?.message || "Return failed.");
    }
  }

  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Borrowed / Return</h1>
          <p className="mt-1 text-sm text-slate-600 a11y-muted">
            Active borrowed records. Use Return when the student returns the book.
          </p>
        </div>
        <button
          type="button"
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
          onClick={load}
        >
          Refresh
        </button>
      </div>

      {/* Search bar */}
      <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-2 items-end">
          <div>
            <label className="text-xs text-slate-500 a11y-muted" htmlFor="q">
              Search
            </label>
            <input
              id="q"
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm a11y-input a11y-outline"
              value={q}
              onChange={(e) => {
                setPage(1);
                setQ(e.target.value);
              }}
              placeholder="Search name, email, student number, title, ISBN…"
              aria-label="Search borrowed records"
            />
          </div>

          <button
            type="button"
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50"
            onClick={() => {
              setPage(1);
              load();
            }}
          >
            Search
          </button>

          <button
            type="button"
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50"
            onClick={() => {
              setPage(1);
              setQ("");
            }}
            disabled={!q}
          >
            Reset
          </button>
        </div>
      </div>

      {err ? (
        <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          {err}
        </div>
      ) : null}

      <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Student No</th>
                <th className="px-4 py-3">Book</th>
                <th className="px-4 py-3">Borrow</th>
                <th className="px-4 py-3">Due</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td className="px-4 py-4 text-slate-600" colSpan={6}>
                    Loading…
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td className="px-4 py-4 text-slate-600" colSpan={6}>
                    No borrowed books.
                  </td>
                </tr>
              ) : (
                items.map((r) => (
                  <tr key={r.id} className="bg-white">
                    <td className="px-4 py-4">
                      <div className="font-semibold text-slate-800">{fmt(r.user_name)}</div>
                      <div className="text-xs text-slate-500">{fmt(r.user_email)}</div>
                    </td>

                    <td className="px-4 py-4">
                      <div className="font-mono text-xs text-slate-800">
                        {fmt(r.user_student_number)}
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <div className="font-semibold text-slate-800">{fmt(r.title)}</div>
                      <div className="text-xs text-slate-500">{fmt(r.isbn)}</div>
                    </td>

                    <td className="px-4 py-4">{fmt(r.borrow_date)}</td>
                    <td className="px-4 py-4">{fmt(r.due_date)}</td>

                    <td className="px-4 py-4">
                      <div className="flex justify-end">
                        <button
                          className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
                          onClick={() => onReturn(r.id)}
                          type="button"
                        >
                          Return
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4">
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </div>
  );
}