import React, { useEffect, useMemo, useState } from "react";
import Pagination from "../../components/Pagination.jsx";
import {
  apiApproveBorrow,
  apiDeclineBorrow,
  apiListAllBorrows,
} from "../../api/borrow.js";
import { useVoiceAnnouncements } from "../../hooks/useVoiceAnnouncements";
import { voiceAccessibility } from "../../utils/voiceAccessibility";

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

export default function BorrowPendingPage() {
  useVoiceAnnouncements("BORROW_PENDING");

  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const params = useMemo(() => ({ status: "pending", page, limit: 10 }), [page]);

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
      setSelectedIds(new Set());
    } catch (e) {
      setErr(
        e?.response?.data?.error ||
          e?.message ||
          "Failed to load pending approvals."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  async function onApprove(id) {
    if (!confirm("Approve this borrow request?")) return;

    try {
      await apiApproveBorrow(id);
      voiceAccessibility.announceSuccess("Borrow request approved.");
      await load();
    } catch (e) {
      const msg = e?.response?.data?.error || e?.message || "Approve failed.";
      voiceAccessibility.announceError(msg);
      alert(msg);
    }
  }

  async function onDecline(id) {
    const reason = prompt("Reason (optional):") || "";
    if (!confirm("Decline this borrow request?")) return;

    try {
      await apiDeclineBorrow(id, reason);
      voiceAccessibility.announceSuccess("Borrow request declined.");
      await load();
    } catch (e) {
      const msg = e?.response?.data?.error || e?.message || "Decline failed.";
      voiceAccessibility.announceError(msg);
      alert(msg);
    }
  }

  async function bulkApprove() {
    if (selectedIds.size === 0) {
      alert("No requests selected");
      return;
    }

    if (!confirm(`Approve ${selectedIds.size} borrow request(s)?`)) return;

    setLoading(true);

    try {
      for (const id of selectedIds) {
        await apiApproveBorrow(id);
      }

      voiceAccessibility.announceSuccess(
        `${selectedIds.size} borrow request(s) approved.`
      );

      setSelectedIds(new Set());
      await load();
    } catch (e) {
      const msg = e?.response?.data?.error || e?.message || "Bulk approve failed";
      voiceAccessibility.announceError(msg);
      setErr(msg);
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-xl font-semibold">Pending Approvals</h1>
          <p className="mt-1 text-sm text-slate-600 a11y-muted">
            Approve or decline student borrow requests.
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
            Search requests
          </label>
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSelectedIds(new Set());
            }}
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
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3">
          <div className="text-sm font-semibold">
            {selectedIds.size > 0 && (
              <span className="text-emerald-600">
                {selectedIds.size} selected
              </span>
            )}
          </div>

          {selectedIds.size > 0 && (
            <button
              type="button"
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
              onClick={bulkApprove}
              disabled={loading}
            >
              Approve Selected ({selectedIds.size})
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-white text-slate-600">
              <tr>
                <th className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={
                      filteredItems.length > 0 &&
                      selectedIds.size === filteredItems.length
                    }
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedIds(new Set(filteredItems.map((i) => i.id)));
                      } else {
                        setSelectedIds(new Set());
                      }
                    }}
                    aria-label="Select all pending requests"
                  />
                </th>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Student No.</th>
                <th className="px-4 py-3">Book</th>
                <th className="px-4 py-3">Borrow</th>
                <th className="px-4 py-3">Due</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td className="px-4 py-4 text-slate-600" colSpan={7}>
                    Loading…
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td className="px-4 py-4 text-slate-600" colSpan={7}>
                    No pending requests found.
                  </td>
                </tr>
              ) : (
                filteredItems.map((r) => (
                  <tr key={r.id} className="bg-white hover:bg-slate-50">
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(r.id)}
                        onChange={(e) => {
                          const newSet = new Set(selectedIds);

                          if (e.target.checked) {
                            newSet.add(r.id);
                          } else {
                            newSet.delete(r.id);
                          }

                          setSelectedIds(newSet);
                        }}
                        aria-label={`Select ${r.title}`}
                      />
                    </td>

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
                      <div className="text-xs text-slate-500">{fmt(r.isbn)}</div>
                    </td>

                    <td className="px-4 py-4">{fmt(r.borrow_date)}</td>
                    <td className="px-4 py-4">{fmt(r.due_date)}</td>

                    <td className="px-4 py-4">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          className="rounded-lg bg-green-600 px-3 py-1 text-xs font-semibold text-white hover:bg-green-700 disabled:opacity-60"
                          onClick={() => onApprove(r.id)}
                        >
                          Approve
                        </button>

                        <button
                          type="button"
                          className="rounded-lg bg-red-600 px-3 py-1 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-60"
                          onClick={() => onDecline(r.id)}
                        >
                          Decline
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