import React, { useEffect, useMemo, useState } from "react";
import Pagination from "../../components/Pagination.jsx";
import { apiApproveBorrow, apiDeclineBorrow, apiListAllBorrows } from "../../api/borrow.js";

function fmt(s) {
  if (!s) return "—";
  return String(s);
}

export default function BorrowPendingPage() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedIds, setSelectedIds] = useState(new Set());

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const params = useMemo(() => ({ status: "pending", page, limit: 10 }), [page]);

  async function load() {
    setLoading(true);
    setErr("");
    try {
      const res = await apiListAllBorrows(params);
      setItems(res?.items || []);
      setTotalPages(res?.total_pages || 1);
      setSelectedIds(new Set()); // Clear selection on reload
    } catch (e) {
      setErr(e?.response?.data?.error || e?.message || "Failed to load pending approvals.");
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
      await load();
    } catch (e) {
      alert(e?.response?.data?.error || e?.message || "Approve failed.");
    }
  }

  async function onDecline(id) {
    const reason = prompt("Reason (optional):") || "";
    if (!confirm("Decline this borrow request?")) return;
    try {
      await apiDeclineBorrow(id, reason);
      await load();
    } catch (e) {
      alert(e?.response?.data?.error || e?.message || "Decline failed.");
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
      setSelectedIds(new Set());
      await load();
    } catch (e) {
      setErr(e?.response?.data?.error || e?.message || "Bulk approve failed");
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="flex items-start justify-between gap-3">
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

      {err ? (
        <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          {err}
        </div>
      ) : null}

      <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200">
        <div className="bg-slate-50 px-4 py-3 flex items-center justify-between border-b border-slate-200">
          <div className="text-sm font-semibold">
            {selectedIds.size > 0 && (
              <span className="text-emerald-600">{selectedIds.size} selected</span>
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
            <thead className="bg-white text-slate-600 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === items.length && items.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedIds(new Set(items.map(i => i.id)));
                      } else {
                        setSelectedIds(new Set());
                      }
                    }}
                    aria-label="Select all pending requests"
                  />
                </th>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Book</th>
                <th className="px-4 py-3">Borrow</th>
                <th className="px-4 py-3">Due</th>
                <th className="px-4 py-3">Actions</th>
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
                    No pending requests.
                  </td>
                </tr>
              ) : (
                items.map((r) => (
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