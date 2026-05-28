import React, { useEffect, useMemo, useState } from "react";
import { useVoiceAnnouncements } from "../../hooks/useVoiceAnnouncements";
import { voiceAccessibility } from "../../utils/voiceAccessibility";
import Pagination from "../../components/Pagination.jsx";
import ConfirmModal from "../../components/ConfirmModal.jsx";
import MessageModal from "../../components/MessageModal.jsx";
import { apiListAllBorrows, apiReturnBorrow } from "../../api/borrow.js";

function fmt(s) {
  if (!s) return "—";
  return String(s);
}

// ✅ NEW: format "YYYY-MM-DD HH:MM:SS" -> "HH:MM"
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

export default function BorrowBorrowedPage() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [q, setQ] = useState("");

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState("");

  // Bulk selection state
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [isReturning, setIsReturning] = useState(false);
  const [returnTarget, setReturnTarget] = useState(null);
  const [message, setMessage] = useState(null);

  // ✅ status=active => borrowed + overdue (return_date IS NULL)
  const params = useMemo(
    () => ({
      status: "active",
      page,
      limit: 10,
      q: q.trim() || undefined
    }),
    [page, q]
  );

  useVoiceAnnouncements("BORROW_BORROWED");

  async function load() {
    setLoading(true);
    setErr("");
    setSuccess("");
    try {
      const res = await apiListAllBorrows(params);
      setItems(res?.items || []);
      setTotalPages(res?.total_pages || 1);
      setSelectedIds(new Set()); // Clear selection on reload
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

  // Toggle single item
  function toggleItem(id) {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  }

  // Toggle all items on current page
  function toggleAll() {
    if (selectedIds.size === items.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(items.map((item) => item.id)));
  }

  function showMessage(title, body, tone = "success") {
    setMessage({ title, body, tone });
  }

  async function returnOne(id) {
    setIsReturning(true);
    try {
      await apiReturnBorrow(id);
      setSuccess("Book returned successfully.");
      voiceAccessibility.announceSuccess("Book returned successfully.");
      showMessage("Book returned", "The book was marked as returned.");
      await load();
    } catch (e) {
      const msg = e?.response?.data?.error || e?.message || "Return failed.";
      setErr(msg);
      showMessage("Return failed", msg, "error");
    } finally {
      setIsReturning(false);
      setReturnTarget(null);
    }
  }

  function onReturn(id) {
    setReturnTarget({ type: "single", id, count: 1 });
  }

  // Bulk return selected books
  async function onBulkReturn() {
    if (selectedIds.size === 0) {
      setErr("Please select at least one book to return.");
      showMessage("No books selected", "Please select at least one book to return.", "error");
      return;
    }

    setReturnTarget({ type: "bulk", count: selectedIds.size });
  }

  async function bulkReturnSelected() {
    setIsReturning(true);
    setErr("");
    setSuccess("");

    let successCount = 0;
    let failCount = 0;
    const failed = [];

    for (const id of selectedIds) {
      try {
        await apiReturnBorrow(id);
        successCount++;
      } catch (e) {
        failCount++;
        failed.push(e?.response?.data?.error || e?.message || `ID: ${id}`);
      }
    }

    setIsReturning(false);

    if (failCount === 0) {
      setSuccess(`All ${successCount} book(s) returned successfully!`);
      showMessage("Books returned", `All ${successCount} book(s) returned successfully.`);
      setSelectedIds(new Set());
      await load();
    } else {
      const msg =
        successCount > 0
          ? `${successCount} returned, ${failCount} failed: ${failed.slice(0, 2).join("; ")}`
          : `Failed to return: ${failed.slice(0, 2).join("; ")}`;
      setErr(msg);
      showMessage("Some returns failed", msg, "error");
      await load();
    }
    setReturnTarget(null);
  }

  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Borrowed / Return</h1>
          <p className="mt-1 text-sm text-slate-600 a11y-muted">
            Active borrowed records. Select books and use Bulk Return to process multiple returns at once.
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

      {/* Bulk action toolbar */}
      {items.length > 0 && (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-blue-50 p-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="selectAll"
                className="w-5 h-5 rounded cursor-pointer"
                checked={selectedIds.size === items.length && items.length > 0}
                onChange={toggleAll}
                aria-label="Select all books on this page"
              />
              <label htmlFor="selectAll" className="text-sm font-semibold text-slate-700 cursor-pointer">
                Select All ({selectedIds.size}/{items.length})
              </label>
            </div>

            {selectedIds.size > 0 && (
              <button
                type="button"
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed"
                onClick={onBulkReturn}
                disabled={isReturning}
                aria-label={`Return ${selectedIds.size} selected book(s)`}
              >
                {isReturning ? "Returning…" : `Return Selected (${selectedIds.size})`}
              </button>
            )}
          </div>
        </div>
      )}

      {err ? (
        <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          {err}
        </div>
      ) : null}

      {success ? (
        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
          {success}
        </div>
      ) : null}

      <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 w-12">
                  <input
                    type="checkbox"
                    className="w-5 h-5 rounded cursor-pointer"
                    checked={selectedIds.size === items.length && items.length > 0}
                    onChange={toggleAll}
                    aria-label="Select all books"
                  />
                </th>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Student No</th>
                <th className="px-4 py-3">Book</th>
                <th className="px-4 py-3">Borrow</th>
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3">Due</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td className="px-4 py-4 text-slate-600" colSpan={8}>
                    Loading…
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td className="px-4 py-4 text-slate-600" colSpan={8}>
                    No borrowed books.
                  </td>
                </tr>
              ) : (
                items.map((r) => (
                  <tr
                    key={r.id}
                    className={`transition-colors ${selectedIds.has(r.id) ? "bg-blue-50" : "bg-white"}`}
                  >
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        className="w-5 h-5 rounded cursor-pointer"
                        checked={selectedIds.has(r.id)}
                        onChange={() => toggleItem(r.id)}
                        aria-label={`Select ${fmt(r.title)}`}
                      />
                    </td>

                    <td className="px-4 py-4">
                      <div className="font-semibold text-slate-800">{fmt(r.user_name)}</div>
                      <div className="text-xs text-slate-500">{fmt(r.user_email)}</div>
                    </td>

                    <td className="px-4 py-4">
                      <div className="font-mono text-xs text-slate-800">{fmt(r.user_student_number)}</div>
                    </td>

                    <td className="px-4 py-4">
                      <div className="font-semibold text-slate-800">{fmt(r.title)}</div>
                      <div className="text-xs text-slate-500">{fmt(r.isbn)}</div>
                    </td>

                    <td className="px-4 py-4">{fmt(r.borrow_date)}</td>

                    {/* ✅ NEW: Borrow time from created_at (needs DB column created_at) */}
                    <td className="px-4 py-4">
                      <div className="text-slate-800">
                        {r.created_at ? fmtTimeFromTimestamp(r.created_at) : "—"}
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <span>{fmt(r.due_date)}</span>
                        {String(r.status || "").toLowerCase() === "overdue" ? (
                          <span className="inline-flex items-center rounded-full bg-rose-50 px-2 py-1 text-[11px] font-semibold text-rose-700">
                            OVERDUE
                          </span>
                        ) : null}
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          className="rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800"
                          onClick={() => onReturn(r.id)}
                          type="button"
                          aria-label={`Return ${fmt(r.title)}`}
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
      <ConfirmModal
        open={Boolean(returnTarget)}
        title={returnTarget?.type === "bulk" ? "Return selected books?" : "Return book?"}
        message={
          returnTarget?.type === "bulk"
            ? `Return ${returnTarget?.count || 0} book(s)? This action cannot be undone.`
            : "Mark this book as returned?"
        }
        confirmText="Return"
        tone="primary"
        loading={isReturning}
        onCancel={() => setReturnTarget(null)}
        onConfirm={() =>
          returnTarget?.type === "bulk"
            ? bulkReturnSelected()
            : returnOne(returnTarget.id)
        }
      />
      <MessageModal
        open={Boolean(message)}
        title={message?.title || ""}
        message={message?.body || ""}
        tone={message?.tone || "success"}
        onClose={() => setMessage(null)}
      />
    </div>
  );
}
