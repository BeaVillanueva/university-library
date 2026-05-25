import React, { useEffect, useMemo, useState } from "react";
import { useVoiceAnnouncements } from "../../hooks/useVoiceAnnouncements";
import Pagination from "../../components/Pagination.jsx";
import { apiListAllBorrows } from "../../api/borrow.js";

function fmt(s) {
  if (!s) return "—";
  return String(s);
}

function getStudentNumber(r) {
  return (
    r.student_number ||
    r.user_student_number ||
    r.student_id_number ||
    r.school_id ||
    r.user_number ||
    "—"
  );
}

export default function BorrowOverdueListPage() {
  useVoiceAnnouncements("BORROW_OVERDUE");

  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const params = useMemo(() => ({ status: "overdue", page, limit: 10 }), [page]);

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;

    return items.filter((r) => {
      const text = [
        r.user_name,
        r.user_email,
        getStudentNumber(r),
        r.title,
        r.isbn,
        r.borrow_date,
        r.due_date,
        r.status,
      ]
        .join(" ")
        .toLowerCase();

      return text.includes(q);
    });
  }, [items, search]);

  async function load() {
    setLoading(true);
    setErr("");

    try {
      const res = await apiListAllBorrows(params);
      setItems(res?.items || []);
      setTotalPages(res?.total_pages || 1);
    } catch (e) {
      setErr(
        e?.response?.data?.error ||
          e?.message ||
          "Failed to load overdue records."
      );
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
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-xl font-semibold">Overdue</h1>
          <p className="mt-1 text-sm text-slate-600 a11y-muted">
            View students with overdue borrowed books.
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

      <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="w-full sm:max-w-md">
          <label className="text-xs font-semibold text-slate-500">
            Search overdue records
          </label>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search student, student number, book, ISBN..."
            className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-400"
          />
        </div>

        <div className="text-sm text-slate-500">
          Showing{" "}
          <span className="font-semibold text-slate-800">
            {filteredItems.length}
          </span>{" "}
          of{" "}
          <span className="font-semibold text-slate-800">{items.length}</span>
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
                <th className="px-4 py-3">Student No.</th>
                <th className="px-4 py-3">Book</th>
                <th className="px-4 py-3">Borrow</th>
                <th className="px-4 py-3">Due</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td className="px-4 py-4 text-slate-600" colSpan={6}>
                    Loading…
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td className="px-4 py-4 text-slate-600" colSpan={6}>
                    No overdue records found.
                  </td>
                </tr>
              ) : (
                filteredItems.map((r) => (
                  <tr key={r.id} className="bg-white hover:bg-slate-50">
                    <td className="px-4 py-4">
                      <div className="font-semibold text-slate-800">
                        {fmt(r.user_name)}
                      </div>
                      <div className="text-xs text-slate-500">
                        {fmt(r.user_email)}
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <div className="font-mono text-sm font-semibold text-slate-800">
                        {fmt(getStudentNumber(r))}
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <div className="font-semibold text-slate-800">
                        {fmt(r.title)}
                      </div>
                      <div className="text-xs text-slate-500">
                        {fmt(r.isbn)}
                      </div>
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