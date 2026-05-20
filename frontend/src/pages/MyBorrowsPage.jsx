import React, { useEffect, useMemo, useState } from "react";
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
        const res = await apiMyBorrowHistory({ page, limit: 12 });
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

  // Separate active and returned
  const activeBorrows = useMemo(
    () => items.filter((r) => ["pending", "borrowed", "overdue"].includes(String(r.status || "").toLowerCase())),
    [items]
  );

  const returnedBorrows = useMemo(
    () => items.filter((r) => String(r.status || "").toLowerCase() === "returned"),
    [items]
  );

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">My Borrowing History</h1>
          <p className="mt-1 text-sm text-slate-600 a11y-muted">
            View your borrowed, returned, and overdue books.
          </p>
        </div>
      </div>

      {error ? (
        <div className="mt-4">
          <Alert type="error">{error}</Alert>
        </div>
      ) : null}

      {/* Active Borrows Section */}
      {loading ? (
        <div className="mt-6 text-sm text-slate-600 a11y-muted">Loading…</div>
      ) : (
        <>
          {activeBorrows.length > 0 ? (
            <div className="mt-6">
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-slate-800">Active Borrows</h2>
                <p className="text-xs text-slate-500 a11y-muted">
                  {activeBorrows.length} book{activeBorrows.length !== 1 ? "s" : ""}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {activeBorrows.map((r) => (
                  <BorrowCard key={r.id} record={r} isActive />
                ))}
              </div>
            </div>
          ) : null}

          {returnedBorrows.length > 0 ? (
            <div className="mt-8">
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-slate-800">Returned Books</h2>
                <p className="text-xs text-slate-500 a11y-muted">
                  {returnedBorrows.length} book{returnedBorrows.length !== 1 ? "s" : ""}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {returnedBorrows.map((r) => (
                  <BorrowCard key={r.id} record={r} isActive={false} />
                ))}
              </div>
            </div>
          ) : null}

          {items.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center">
              <div className="text-3xl mb-2">📚</div>
              <p className="text-sm font-medium text-slate-700">No borrow history yet</p>
              <p className="text-xs text-slate-500 a11y-muted">Start borrowing books to see them here!</p>
            </div>
          ) : null}
        </>
      )}

      {/* Pagination */}
      {totalPages > 1 ? (
        <div className="mt-6">
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      ) : null}
    </div>
  );
}

function BorrowCard({ record, isActive }) {
  const statusColor =
    record.status === "overdue"
      ? "bg-red-50 text-red-700 border-red-200"
      : record.status === "borrowed"
        ? "bg-blue-50 text-blue-700 border-blue-200"
        : record.status === "pending"
          ? "bg-amber-50 text-amber-700 border-amber-200"
          : "bg-green-50 text-green-700 border-green-200";

  const daysLeft = record.due_date
    ? Math.ceil((new Date(record.due_date) - new Date()) / (1000 * 60 * 60 * 24))
    : null;

  const isOverdue = daysLeft !== null && daysLeft < 0;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
      {/* Cover Image */}
      <div className="mb-3 aspect-[3/4] w-full overflow-hidden rounded-xl bg-slate-100 flex items-center justify-center">
        {record.cover_image_url ? (
          <img
            src={record.cover_image_url}
            alt={record.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-400">
            <span className="text-3xl">📖</span>
            <span className="text-xs mt-1">No Cover</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="space-y-2">
        <div>
          <h3 className="font-semibold text-slate-800 line-clamp-2">{record.title}</h3>
          {record.author && (
            <p className="text-xs text-slate-500">{record.author}</p>
          )}
        </div>

        {/* Status */}
        <div className="flex gap-2 items-center">
          <span
            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold border ${statusColor}`}
          >
            {String(record.status || "—").toUpperCase()}
          </span>
        </div>

        {/* Dates */}
        <div className="space-y-1 text-xs text-slate-600">
          {record.borrow_date && (
            <div className="flex justify-between">
              <span className="text-slate-500">Borrowed:</span>
              <span className="font-mono">{record.borrow_date}</span>
            </div>
          )}

          {record.due_date && record.status !== "returned" && (
            <div className={`flex justify-between ${isOverdue ? "text-red-600" : ""}`}>
              <span className="text-slate-500">Due:</span>
              <span className={`font-mono ${isOverdue ? "font-semibold" : ""}`}>
                {record.due_date}
                {isOverdue && daysLeft !== null && ` (${Math.abs(daysLeft)}d overdue)`}
              </span>
            </div>
          )}

          {record.return_date && (
            <div className="flex justify-between">
              <span className="text-slate-500">Returned:</span>
              <span className="font-mono">{record.return_date}</span>
            </div>
          )}
        </div>

        {/* ISBN */}
        {record.isbn && (
          <div className="pt-2 border-t border-slate-100">
            <p className="text-xs text-slate-500">
              ISBN: <span className="font-mono">{record.isbn}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
