import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiListBooks } from "../api/books";
import { apiListCategories } from "../api/categories";
import { apiBorrowBook } from "../api/borrow";
import { useAuth } from "../state/AuthContext";
import Pagination from "../components/Pagination";
import Alert from "../components/Alert";
import TextToSpeechButton from "../components/TextToSpeechButton";

export default function BooksPage() {
  const { user } = useAuth();

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

  const canEdit = user?.role === "admin" || user?.role === "librarian";

  const ttsText = useMemo(() => {
    return items
      .slice(0, 10)
      .map((b) => `${b.title} by ${b.author}. Available copies ${b.copies_available}.`)
      .join(" ");
  }, [items]);

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
    setNotice("");
    setError("");
    try {
      const res = await apiBorrowBook(bookId);
      setNotice(`Borrowed successfully. Due date: ${res.due_date}`);

      const refreshed = await apiListBooks({
        page,
        limit,
        q: q || undefined,
        category_id: categoryId || undefined,
        availability: availability || undefined
      });
      setItems(refreshed.items || []);
      setTotalPages(refreshed.total_pages || 1);
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

  function resetFilters() {
    setPage(1);
    setQ("");
    setCategoryId("");
    setAvailability("");
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

      <div className="mt-4 rounded-2xl border border-slate-200 bg-white a11y-surface a11y-outline">
        <div className="table-scroll">
          <table className="min-w-full text-sm">
            <thead className="border-b border-slate-200">
              <tr className="text-left text-xs uppercase tracking-wide text-slate-500 a11y-muted">
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Author</th>
                <th className="px-4 py-3">ISBN</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Avail</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="px-4 py-4 text-slate-600 a11y-muted" colSpan={6}>
                    Loading…
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td className="px-4 py-4 text-slate-600 a11y-muted" colSpan={6}>
                    No books found.
                  </td>
                </tr>
              ) : (
                items.map((b) => (
                  <tr key={b.id} className="border-t border-slate-100">
                    <td className="px-4 py-3 font-medium">{b.title}</td>
                    <td className="px-4 py-3">{b.author}</td>
                    <td className="px-4 py-3 font-mono text-xs">{b.isbn}</td>
                    <td className="px-4 py-3">{b.category_name || "—"}</td>
                    <td className="px-4 py-3">
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
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 justify-end">
                        {canEdit ? (
                          <Link
                            to={`/books/${b.id}/edit`}
                            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs hover:bg-slate-50 a11y-surface a11y-outline"
                            aria-label={`Edit ${b.title}`}
                          >
                            Edit
                          </Link>
                        ) : null}

                        <button
                          className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                          disabled={b.copies_available <= 0}
                          onClick={() => handleBorrow(b.id)}
                          aria-label={`Borrow ${b.title}`}
                          type="button"
                        >
                          Borrow
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-slate-200 px-4 py-3">
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      </div>
    </div>
  );
}