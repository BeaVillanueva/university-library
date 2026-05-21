import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiListBooks, apiAddBookStock } from "../api/books";
import { apiListCategories } from "../api/categories";
import { apiBorrowBook, apiCancelBorrow, apiMyBorrowHistory } from "../api/borrow";
import { useAuth } from "../state/AuthContext";
import Pagination from "../components/Pagination";
import Alert from "../components/Alert";
import TextToSpeechButton from "../components/TextToSpeechButton";

const API_BASE_URL = "http://localhost:8000";

export default function BooksPage() {
  const { user } = useAuth();

  const role = user?.role || "";
  const isLibrarian = role === "librarian";
  const isStudent = role === "student";

  const canEdit = isLibrarian;
  const canBorrow = isStudent;

  const MAX_ACTIVE = 3;

  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [totalPages, setTotalPages] = useState(1);

  const [q, setQ] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [availability, setAvailability] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [myBorrows, setMyBorrows] = useState([]);
  const [myBorrowsLoading, setMyBorrowsLoading] = useState(false);

  const ttsText = useMemo(() => {
    return items
      .slice(0, 10)
      .map((b) => `${b.title} by ${b.author}. Available copies ${b.copies_available}.`)
      .join(" ");
  }, [items]);

  const myActive = useMemo(() => {
    return (myBorrows || []).filter((r) =>
      ["pending", "borrowed", "overdue"].includes(String(r.status || "").toLowerCase())
    );
  }, [myBorrows]);

  const queueFull = canBorrow && myActive.length >= MAX_ACTIVE;

  async function refreshBooks() {
    const res = await apiListBooks({
      page,
      limit,
      q: q || undefined,
      category_id: categoryId || undefined,
      availability: availability || undefined
    });
    setItems(res.items || []);
    setTotalPages(res.total_pages || 1);
  }

  async function loadMyBorrows() {
    if (!canBorrow) return;
    setMyBorrowsLoading(true);
    try {
      const res = await apiMyBorrowHistory({ page: 1, limit: 50 });
      setMyBorrows(res?.items || []);
    } catch {
      setMyBorrows([]);
    } finally {
      setMyBorrowsLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;
    async function loadCats() {
      try {
        const res = await apiListCategories();
        if (!cancelled) setCategories(res.items || []);
      } catch {
        // ignore
      }
    }
    loadCats();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    loadMyBorrows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canBorrow]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError("");
      setNotice("");
      try {
        const res = await apiListBooks({
          page,
          limit,
          q: q || undefined,
          category_id: categoryId || undefined,
          availability: availability || undefined
        });
        if (!cancelled) {
          setItems(res.items || []);
          setTotalPages(res.total_pages || 1);
        }
      } catch (e) {
        if (!cancelled) setError(e?.response?.data?.error || e?.message || "Failed to load books");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [page, limit, q, categoryId, availability]);

  async function handleBorrow(bookId) {
    if (!canBorrow) return;

    if (queueFull) {
      setError(`You can only have up to ${MAX_ACTIVE} active requests/borrows. Remove one first.`);
      return;
    }

    setNotice("");
    setError("");
    try {
      const res = await apiBorrowBook(bookId);

      const msg = res?.message || "Request sent";
      const due = res?.due_date ? ` Due date: ${res.due_date}` : "";
      const status = res?.status ? ` (${String(res.status).toUpperCase()})` : "";

      setNotice(`${msg}${status}.${due}`);

      await refreshBooks();
      await loadMyBorrows();
    } catch (e) {
      const data = e?.response?.data;
      const msg = data?.error || e?.message || "Borrow failed";
      if (msg === "Borrow limit reached") {
        setError(`Borrow limit reached. Maximum active borrows: ${data?.max_active ?? 3}.`);
      } else {
        setError(msg);
      }
    }
  }

  async function handleCancelPending(recordId) {
    if (!confirm("Cancel this pending borrow request?")) return;

    setError("");
    setNotice("");

    try {
      await apiCancelBorrow(recordId);
      setNotice("Pending request cancelled.");
      await loadMyBorrows();
    } catch (e) {
      setError(e?.response?.data?.error || e?.message || "Cancel failed.");
    }
  }

  async function handleAddStock(bookId) {
    const raw = prompt("Add how many copies? (number)");
    if (raw === null) return;

    const qty = Number(raw);
    if (!Number.isFinite(qty) || qty <= 0) {
      setError("Invalid quantity.");
      return;
    }

    setError("");
    setNotice("");
    try {
      await apiAddBookStock(bookId, Math.trunc(qty));
      setNotice("Stock added successfully.");
      await refreshBooks();
    } catch (e) {
      setError(e?.response?.data?.error || e?.message || "Failed to add stock");
    }
  }

  function resetFilters() {
    setPage(1);
    setQ("");
    setCategoryId("");
    setAvailability("");
  }

  function coverSrc(book) {
    if (!book.cover_image_url) return null;
    if (book.cover_image_url.startsWith("http")) return book.cover_image_url;
    return `${API_BASE_URL}${book.cover_image_url}`;
  }

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Browse All Books</h1>
          <p className="mt-1 text-sm text-slate-600 a11y-muted">
            Search by title, author, or ISBN. Filter by category and availability.
          </p>
        </div>
        <TextToSpeechButton text={ttsText} label="Read the list of books aloud" />
      </div>

      {/* Student: My Borrow Queue box */}
      {canBorrow ? (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 a11y-surface a11y-outline">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-slate-800">My Borrow Queue</div>
              <div className="text-xs text-slate-500">
                Active (pending/borrowed/overdue):{" "}
                <span className="font-semibold">
                  {myActive.length}/{MAX_ACTIVE}
                </span>
              </div>
            </div>

            <button
              type="button"
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              onClick={loadMyBorrows}
            >
              Refresh
            </button>
          </div>

          {myBorrowsLoading ? (
            <div className="mt-3 text-sm text-slate-600">Loading…</div>
          ) : myActive.length === 0 ? (
            <div className="mt-3 text-sm text-slate-600">No active requests/borrows.</div>
          ) : (
            <div className="mt-3 grid gap-2">
              {myActive.slice(0, MAX_ACTIVE).map((r) => (
                <div
                  key={r.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-slate-800">
                      {r.title || "Book"}
                    </div>
                    <div className="text-xs text-slate-600">
                      Status: <span className="font-semibold">{String(r.status || "—")}</span>
                      {r.due_date ? ` • Due: ${r.due_date}` : ""}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {String(r.status || "").toLowerCase() === "pending" ? (
                      <button
                        type="button"
                        className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100"
                        onClick={() => handleCancelPending(r.id)}
                      >
                        Cancel
                      </button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}

          {queueFull ? (
            <div className="mt-3 text-xs font-semibold text-rose-700">
              You reached the maximum of {MAX_ACTIVE}. Cancel/return one to borrow another.
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 a11y-surface a11y-outline">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="md:col-span-2">
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
              placeholder="Title / Author / ISBN"
              aria-label="Search books"
            />
          </div>

          <div>
            <label className="text-xs text-slate-500 a11y-muted" htmlFor="cat">
              Category
            </label>
            <select
              id="cat"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm a11y-input a11y-outline"
              value={categoryId}
              onChange={(e) => {
                setPage(1);
                setCategoryId(e.target.value);
              }}
              aria-label="Filter by category"
            >
              <option value="">All</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-slate-500 a11y-muted" htmlFor="avail">
              Availability
            </label>
            <select
              id="avail"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm a11y-input a11y-outline"
              value={availability}
              onChange={(e) => {
                setPage(1);
                setAvailability(e.target.value);
              }}
              aria-label="Filter by availability"
            >
              <option value="">All</option>
              <option value="available">Available</option>
              <option value="unavailable">Unavailable</option>
            </select>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <button
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm hover:bg-slate-50 a11y-surface a11y-outline"
            onClick={resetFilters}
            type="button"
            aria-label="Reset filters"
          >
            Reset
          </button>
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

      {/* Cards Grid View */}
      {loading ? (
        <div className="mt-4 text-sm text-slate-600">Loading…</div>
      ) : items.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center">
          <div className="text-3xl mb-2">📚</div>
          <p className="text-sm font-medium text-slate-700">No books found</p>
          <p className="text-xs text-slate-500">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {items.map((b) => {
              const src = coverSrc(b);

              return (
                <div
                  key={b.id}
                  className="rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg transition overflow-hidden bg-white a11y-surface a11y-outline flex flex-col"
                >
                  {/* Book Cover Image - TALLER */}
                  <div className="h-64 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center overflow-hidden">
                    {src ? (
                      <img
                        src={src}
                        alt={b.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    ) : null}
                    {!src && (
                      <div className="text-slate-400 text-center">
                        <div className="text-4xl">📖</div>
                        <p className="text-xs mt-2">No Cover</p>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="font-semibold text-slate-800 line-clamp-2 text-sm">{b.title}</h3>
                    {b.author && (
                      <p className="text-xs text-slate-500 mt-1">{b.author}</p>
                    )}

                    {b.category_name && (
                      <p className="text-xs text-slate-400 mt-1">{b.category_name}</p>
                    )}

                    {/* Availability Badge */}
                    <div className="mt-3">
                      <span
                        className={[
                          "inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold",
                          b.copies_available > 0 ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-600"
                        ].join(" ")}
                      >
                        {b.copies_available}/{b.copies_total}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="mt-auto pt-4 flex gap-2">
                      {canEdit ? (
                        <>
                          <Link
                            to={`/app/books/${b.id}/edit`}
                            className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-center hover:bg-slate-50 a11y-surface a11y-outline"
                            aria-label={`Edit ${b.title}`}
                          >
                            Edit
                          </Link>
                          <button
                            type="button"
                            className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium hover:bg-slate-50 a11y-surface a11y-outline"
                            onClick={() => handleAddStock(b.id)}
                            aria-label={`Add stock to ${b.title}`}
                          >
                            Add Stock
                          </button>
                        </>
                      ) : null}

                      {canBorrow ? (
                        <button
                          className="flex-1 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                          disabled={b.copies_available <= 0 || queueFull}
                          onClick={() => handleBorrow(b.id)}
                          aria-label={`Borrow ${b.title}`}
                          type="button"
                          title={queueFull ? `Max ${MAX_ACTIVE} active requests/borrows reached` : undefined}
                        >
                          Borrow
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6">
              <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
