import React, { useEffect, useMemo, useState } from "react";
import { useVoiceAnnouncements } from "../../hooks/useVoiceAnnouncements";
import Pagination from "../../components/Pagination.jsx";
import { apiListAllBorrows } from "../../api/borrow.js";

function fmt(s) {
  if (!s) return "—";
  return String(s);
}

function fmtTimeFromTimestamp(ts) {
  if (!ts) return "—";
  const str = String(ts);
  const timePart = str.includes(" ") ? str.split(" ")[1] : str; // "HH:MM:SS"
  const hhmm = timePart ? timePart.slice(0, 5) : "";
  if (!hhmm || !hhmm.includes(":")) return "—";

  let [hh, mm] = hhmm.split(":").map((x) => parseInt(x, 10));
  if (Number.isNaN(hh) || Number.isNaN(mm)) return "—";

  const ampm = hh >= 12 ? "PM" : "AM";
  hh = hh % 12;
  if (hh === 0) hh = 12;

  const hhStr = String(hh).padStart(2, "0");
  const mmStr = String(mm).padStart(2, "0");
  return `${hhStr}:${mmStr} ${ampm}`;
}

export default function BorrowAllHistoryPage() {
  useVoiceAnnouncements("BORROW_ALL_HISTORY");

  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // ✅ NEW: search query
  const [q, setQ] = useState("");

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // status: '' => no filter (server returns all)
  const params = useMemo(
    () => ({
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
      setErr(e?.response?.data?.error || e?.message || "Failed to load history.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, q]);

  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">History</h1>
          <p className="mt-1 text-sm text-slate-600 a11y-muted">
            All borrow records (pending, borrowed, returned, overdue, declined).
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

      {/* ✅ NEW: Search bar */}
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
              aria-label="Search history"
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
                <th className="px-4 py-3">Borrowed</th>
                <th className="px-4 py-3">Due</th>
                <th className="px-4 py-3">Returned</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td className="px-4 py-4 text-slate-600" colSpan={7}>
                    Loading…
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td className="px-4 py-4 text-slate-600" colSpan={7}>
                    No records found.
                  </td>
                </tr>
              ) : (
                items.map((r) => {
                  const status = String(r.status || "").toLowerCase();
                  // ✅ We can show return time using updated_at when status is returned
                  const returnTime =
                    status === "returned" && r.updated_at ? fmtTimeFromTimestamp(r.updated_at) : "—";

                  return (
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

                      {/* Borrow time not available (DATE only) */}
                      <td className="px-4 py-4">
                        <div className="flex flex-col">
                          <span>{fmt(r.borrow_date)}</span>
                          <span className="text-xs text-slate-500 a11y-muted">
                            {r.created_at ? fmtTimeFromTimestamp(r.created_at) : "—"}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-4">{fmt(r.due_date)}</td>

                      {/* Return date + time (best possible using updated_at) */}
                      <td className="px-4 py-4">
                        <div className="flex flex-col">
                          <span>{fmt(r.return_date)}</span>
                          <span className="text-xs text-slate-500 a11y-muted">{returnTime}</span>
                        </div>
                      </td>

                      <td className="px-4 py-4">{fmt(r.status)}</td>
                    </tr>
                  );
                })
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