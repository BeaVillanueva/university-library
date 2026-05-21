import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiListBooks, apiAddBookStock, apiGetBook } from "../api/books";
import { apiListCategories } from "../api/categories";
import { apiBorrowBook, apiCancelBorrow, apiMyBorrowHistory } from "../api/borrow";
import { useAuth } from "../state/AuthContext";
import Pagination from "../components/Pagination";
import Alert from "../components/Alert";
import TextToSpeechButton from "../components/TextToSpeechButton";
import { FiBookOpen, FiCalendar, FiAlertCircle, FiX } from "react-icons/fi";

export default function BooksPage() {
  const { user } = useAuth();

  const role = user?.role || "";
  const isLibrarian = role === "librarian";
  const isStudent = role === "student";

  const canEdit = isLibrarian;
  const canBorrow = isStudent;

  const MAX_ACTIVE = 3;

  // ✅ IMPORTANT:
  // Your API base is usually ".../public/index.php"
  // But static files (covers) are served from ".../public" (WITHOUT index.php)
  // ✅ IMPORTANT: Your API base setup
  const API_BASE =
    localStorage.getItem("ulms_api_base_url") ||
    import.meta.env.VITE_API_BASE_URL ||
    "http://localhost/university-library/backend/public/index.php";

  const PUBLIC_BASE = String(API_BASE).replace(/\/index\.php\/?$/i, "");

  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const [q, setQ] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [availability, setAvailability] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [myBorrows, setMyBorrows] = useState([]);
  const [myBorrowsLoading, setMyBorrowsLoading] = useState(false);
  const [borrowCovers, setBorrowCovers] = useState({}); // ✅ Cache for cover URLs

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

      // ✅ Fetch cover images for borrowed books
      if (res?.items && res.items.length > 0) {
        const newCovers = { ...borrowCovers };
        for (const record of res.items) {
          if (record.book_id && !newCovers[record.book_id]) {
            try {
              const bookRes = await apiGetBook(record.book_id);
              if (bookRes?.book?.cover_image_url) {
                newCovers[record.book_id] = bookRes.book.cover_image_url;
              }
            } catch {
              // ignore
            }
          }
        }
        setBorrowCovers(newCovers);
      }
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

  function coverSrc(b) {
    const u = (b?.cover_image_url || "").trim();
    if (!u) return "";
    // If backend ever returns an absolute URL, keep it
    if (u.startsWith("http://") || u.startsWith("https://")) return u;
    // If it starts with /covers/..., serve from PUBLIC_BASE
    if (u.startsWith("/")) return `${PUBLIC_BASE}${u}`;
    // Otherwise treat as relative path
    return `${PUBLIC_BASE}/${u}`;
  }

  // ✅ Get cover URL for borrowed books
  function getBorrowCoverSrc(bookId, record) {
    const url = borrowCovers[bookId];
    if (!url) return "";
    return coverSrc({ cover_image_url: url });
  }

  function getStatusColor(status) {
    const s = String(status || "").toLowerCase();
    if (s === "overdue") return "bg-red-50 text-red-700 border-red-200";
    if (s === "borrowed") return "bg-green-50 text-green-700 border-green-200";
    if (s === "pending") return "bg-amber-50 text-amber-700 border-amber-200";
    return "bg-green-50 text-green-700 border-green-200"; // returned
  }

  function getDaysLeft(dueDate) {
    if (!dueDate) return null;
    const due = new Date(dueDate);
    const now = new Date();
    const diff = due - now;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Books</h1>
          <p className="mt-1 text-sm text-slate-600 a11y-muted">
            Search by title, author, or ISBN. Filter by category and availability.
          </p>
        </div>
        <TextToSpeechButton text={ttsText} label="Read the list of books aloud" />
      </div>

      {/* ✅ MODERN: Student My Borrowed Books Card Grid */}
      {canBorrow ? (
        <div className="mt-6">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">My Borrowed Books</h2>
              <p className="text-sm text-slate-600 mt-1">
                Active (pending/borrowed/overdue): <span className="font-semibold text-slate-900">{myActive.length}/{MAX_ACTIVE}</span>
              </p>
            </div>
            <button
              type="button"
              className="rounded-lg bg-blue-600 text-white px-4 py-2 text-sm font-semibold hover:bg-blue-700 transition"
              onClick={loadMyBorrows}
              disabled={myBorrowsLoading}
            >
              {myBorrowsLoading ? "Loading…" : "Refresh"}
            </button>
          </div>

          {myBorrowsLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin">
                <FiBookOpen className="text-3xl text-slate-400" />
              </div>
              <p className="mt-2 text-slate-600">Loading your books…</p>
            </div>
          ) : myActive.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-12 text-center">
              <FiBookOpen className="mx-auto text-4xl text-slate-400 mb-3" />
              <p className="text-slate-600 font-medium">No active requests or borrows</p>
              <p className="text-sm text-slate-500 mt-1">Start by borrowing a book below</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {myActive.map((record) => {
                  // ✅ Use cached cover URL
                  const coverUrl = getBorrowCoverSrc(record.book_id, record);
                  const daysLeft = getDaysLeft(record.due_date);
                  const isOverdue = daysLeft !== null && daysLeft < 0;

                  return (
                    <div
                      key={record.id}
                      className="rounded-xl border border-slate-200 bg-white shadow-sm hover:shadow-lg transition overflow-hidden"
                    >
                      {/* Book Cover */}
                      <div className="h-64 bg-slate-100 flex items-center justify-center overflow-hidden">
                        {coverUrl ? (
                          <img
                            src={coverUrl}
                            alt={record.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        ) : (
                          <div className="text-slate-400 text-center">
                            <FiBookOpen className="text-4xl mx-auto" />
                            <p className="text-xs mt-2">No Cover</p>
                          </div>
                        )}
                      </div>

                      {/* Book Info */}
                      <div className="p-4">
                        <h3 className="font-bold text-slate-900 line-clamp-2 text-sm">
                          {record.title || "Book"}
                        </h3>
                        <p className="text-xs text-slate-600 mt-1">{record.author || "Unknown Author"}</p>

                        {/* Status Badge */}
                        <div className="mt-3 mb-3">
                          <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold border ${getStatusColor(record.status)}`}>
                            {String(record.status || "—").toUpperCase()}
                          </span>
                        </div>

                        {/* Dates Info */}
                        <div className="space-y-2 text-xs text-slate-600 mb-4">
                          {record.borrow_date && (
                            <div className="flex items-center gap-2">
                              <FiCalendar className="text-slate-400 flex-shrink-0" />
                              <span>Borrowed: <span className="font-mono text-slate-900">{record.borrow_date}</span></span>
                            </div>
                          )}
                          
                          {record.due_date && record.status !== "returned" && (
                            <div className={`flex items-center gap-2 ${isOverdue ? "text-red-600" : ""}`}>
                              <FiCalendar className={`flex-shrink-0 ${isOverdue ? "text-red-600" : "text-slate-400"}`} />
                              <span className={isOverdue ? "font-semibold" : ""}>
                                Due: <span className="font-mono">{record.due_date}</span>
                              </span>
                              {daysLeft !== null && (
                                <span className={`ml-auto font-bold ${isOverdue ? "text-red-600" : daysLeft <= 3 ? "text-amber-600" : "text-green-600"}`}>
                                  {isOverdue ? `${Math.abs(daysLeft)}d overdue` : `${daysLeft}d left`}
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Action Button */}
                        {String(record.status || "").toLowerCase() === "pending" && (
                          <button
                            type="button"
                            className="w-full rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition flex items-center justify-center gap-2"
                            onClick={() => handleCancelPending(record.id)}
                          >
                            <FiX className="text-sm" />
                            Cancel Request
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {queueFull && (
                <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 flex items-start gap-3">
                  <FiAlertCircle className="text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-amber-900">Maximum borrows reached</p>
                    <p className="text-xs text-amber-700 mt-1">You can only have {MAX_ACTIVE} active requests/borrows. Cancel or return one to borrow another.</p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      ) : null}

      {/* Filters */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 a11y-surface a11y-outline">
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

      {/* ✅ MODERNIZED: Card Grid Layout instead of table */}
      <div className="mt-6">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Browse All Books</h2>
        
        {loading ? (
          <div className="text-center text-slate-600 py-12">
            <div className="inline-block animate-spin">
              <FiBookOpen className="text-3xl" />
            </div>
            <p className="mt-2">Loading books...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center text-slate-600 py-12">
            <FiBookOpen className="text-4xl mx-auto mb-3 text-slate-400" />
            <p>No books found.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {items.map((b) => {
                const src = coverSrc(b);

                return (
                  <div
                    key={b.id}
                    className="rounded-lg border border-slate-200 shadow-sm hover:shadow-lg transition overflow-hidden bg-white a11y-surface a11y-outline"
                  >
                    {/* Book Cover Image */}
                    <div className="h-48 bg-slate-100 flex items-center justify-center overflow-hidden">
                      {src ? (
                        <img
                          src={src}
                          alt={b.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          onError={(e) => {
                            // show fallback if URL is broken
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="text-slate-400 text-center">
                          <div className="text-5xl">📖</div>
                          <p className="text-xs mt-2">No Cover</p>
                        </div>
                      )}
                    </div>

                    {/* Book Info */}
                    <div className="p-4">
                      <h3 className="font-semibold text-sm line-clamp-2 text-slate-900">
                        {b.title}
                      </h3>
                      <p className="text-xs text-slate-600 mt-1">{b.author || "Unknown"}</p>
                      <p className="text-xs text-slate-500 mt-1">{b.category_name || "—"}</p>

                      {/* Availability Badge */}
                      <div className="mt-3 mb-3">
                        <span
                          className={[
                            "inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold",
                            b.copies_available > 0
                              ? "bg-green-50 text-green-700"
                              : "bg-slate-100 text-slate-600"
                          ].join(" ")}
                          aria-label={`Copies available ${b.copies_available}`}
                        >
                          {b.copies_available}/{b.copies_total}
                        </span>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 flex-wrap">
                        {canEdit ? (
                          <>
                            <Link
                              to={`/app/books/${b.id}/edit`}
                              className="flex-1 rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs text-center hover:bg-slate-50 a11y-surface a11y-outline"
                              aria-label={`Edit ${b.title}`}
                            >
                              Edit
                            </Link>

                            <button
                              type="button"
                              className="flex-1 rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs hover:bg-slate-50 a11y-surface a11y-outline"
                              onClick={() => handleAddStock(b.id)}
                              aria-label={`Add stock to ${b.title}`}
                            >
                              Stock
                            </button>
                          </>
                        ) : null}

                        {canBorrow ? (
                          <button
                            className="flex-1 rounded-lg bg-blue-600 px-2 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                            disabled={b.copies_available <= 0 || queueFull}
                            onClick={() => handleBorrow(b.id)}
                            aria-label={`Borrow ${b.title}`}
                            type="button"
                            title={
                              queueFull ? `Max ${MAX_ACTIVE} active requests/borrows reached` : undefined
                            }
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
            <div className="mt-6 flex items-center justify-center gap-3">
              <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
