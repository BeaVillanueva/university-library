import React, { useEffect, useMemo, useState } from "react";
import Pagination from "../../components/Pagination.jsx";
import { apiListAllBorrows } from "../../api/borrow.js";

function fmt(s) {
  if (!s) return "—";
  return String(s);
}

export default function BorrowOverdueListPage() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const params = useMemo(() => ({ status: "overdue", page, limit: 10 }), [page]);

  async function load() {
    setLoading(true);
    setErr("");
    try {
      const res = await apiListAllBorrows(params);
      setItems(res?.items || []);
      setTotalPages(res?.total_pages || 1);
    } catch (e) {
      setErr(e?.response?.data?.error || e?.message || "Failed to load overdue records.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Overdue</h1>
        </div>
        <button
          type="button"
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
          onClick={load}
        >
          Refresh
        </button>
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
                <th className="px-4 py-3">Book</th>
                <th className="px-4 py-3">Borrow</th>
                <th className="px-4 py-3">Due</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td className="px-4 py-4 text-slate-600" colSpan={5}>
                    Loading…
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td className="px-4 py-4 text-slate-600" colSpan={5}>
                    No overdue records.
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
                      <div className="font-semibold text-slate-800">{fmt(r.title)}</div>
                      <div className="text-xs text-slate-500">{fmt(r.isbn)}</div>
                    </td>
                    <td className="px-4 py-4">{fmt(r.borrow_date)}</td>
                    <td className="px-4 py-4">{fmt(r.due_date)}</td>
                    <td className="px-4 py-4">
                      <span className="rounded-full bg-rose-50 px-2 py-1 text-xs font-semibold text-rose-700">
                        {fmt(r.status)}
                      </span>
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