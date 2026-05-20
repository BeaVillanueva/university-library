import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiGetBook, apiUpdateBook, apiUploadBookCover } from "../api/books";
import { apiListCategories } from "../api/categories";
import Alert from "../components/Alert";

export default function BookEditPage() {
  const { id } = useParams();
  const bookId = Number(id);
  const nav = useNavigate();

  // ✅ Same fix as BooksPage: API base may end with /index.php, but covers are served from /public
  const API_BASE = useMemo(() => {
    return (
      localStorage.getItem("ulms_api_base_url") ||
      import.meta.env.VITE_API_BASE_URL ||
      "http://localhost/university-library/backend/public/index.php"
    );
  }, []);

  const PUBLIC_BASE = useMemo(() => {
    return String(API_BASE).replace(/\/index\.php\/?$/i, "");
  }, [API_BASE]);

  function toCoverSrc(url) {
    const u = String(url || "").trim();
    if (!u) return "";
    if (u.startsWith("http://") || u.startsWith("https://")) return u;
    if (u.startsWith("/")) return `${PUBLIC_BASE}${u}`;
    return `${PUBLIC_BASE}/${u}`;
  }

  const [categories, setCategories] = useState([]);
  const [book, setBook] = useState(null);
  const [form, setForm] = useState(null);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  // local preview (instant preview while uploading)
  const [localCoverPreview, setLocalCoverPreview] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const [bRes, cRes] = await Promise.all([apiGetBook(bookId), apiListCategories()]);
        if (cancelled) return;

        setBook(bRes.book);
        setCategories(cRes.items || []);
        setForm({
          title: bRes.book.title || "",
          author: bRes.book.author || "",
          isbn: bRes.book.isbn || "",
          category_id: bRes.book.category_id || "",
          year: bRes.book.year || "",
          description: bRes.book.description || "",
          copies_total: bRes.book.copies_total ?? 0,
          shelf_location: bRes.book.shelf_location || ""
        });

        // reset preview when loading a different book
        setLocalCoverPreview("");
      } catch (e) {
        if (!cancelled) setError(e?.response?.data?.error || e?.message || "Failed to load book");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    if (Number.isFinite(bookId) && bookId > 0) load();
    return () => {
      cancelled = true;
    };
  }, [bookId]);

  async function onSave(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const patch = {
        title: form.title,
        author: form.author,
        isbn: form.isbn,
        category_id: form.category_id === "" ? null : Number(form.category_id),
        year: form.year === "" ? null : Number(form.year),
        description: form.description,
        copies_total: Number(form.copies_total),
        shelf_location: form.shelf_location
      };

      await apiUpdateBook(bookId, patch);

      // ✅ redirect back to books list after saving
      nav("/app/books", { replace: true });
    } catch (e2) {
      setError(e2?.response?.data?.error || e2?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  // ✅ Handle book cover upload
  async function handleCoverUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!["image/jpeg", "image/png"].includes(file.type)) {
      setError("Only JPG/PNG files are allowed.");
      e.target.value = "";
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setError("File size must be less than 5MB.");
      e.target.value = "";
      return;
    }

    // ✅ instant preview (local blob) while uploading
    const previewUrl = URL.createObjectURL(file);
    setLocalCoverPreview(previewUrl);

    setUploading(true);
    setError("");
    setNotice("");
    try {
      await apiUploadBookCover(bookId, file);

      // refresh book to get new cover_image_url from backend
      const refreshed = await apiGetBook(bookId);
      setBook(refreshed.book);

      // clear local preview so we show the real served image
      URL.revokeObjectURL(previewUrl);
      setLocalCoverPreview("");

      setNotice("Cover uploaded successfully!");
    } catch (err) {
      // keep local preview but show error
      setError(err?.response?.data?.error || err?.message || "Failed to upload cover");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  if (loading) {
    return <div className="text-sm text-slate-600 a11y-muted">Loading…</div>;
  }
  if (error && !notice && !book) {
    return <Alert type="error">{error}</Alert>;
  }
  if (!book || !form) return null;

  const coverSrc = localCoverPreview || toCoverSrc(book.cover_image_url);

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Edit Book</h1>
        </div>

        <button
          type="button"
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold hover:bg-slate-50"
          onClick={() => nav("/app/books")}
        >
          Back
        </button>
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

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Left: Book Cover Preview & Upload */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 a11y-surface a11y-outline">
          <h2 className="text-lg font-semibold mb-4">Book Cover</h2>

          {/* Cover Preview */}
          <div className="mb-4 h-64 w-full bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden">
            {coverSrc ? (
              <img
                src={coverSrc}
                alt={book.title}
                className="w-full h-full object-cover"
                loading="lazy"
                onError={(e) => {
                  // If served image breaks, fall back to no cover UI
                  e.currentTarget.style.display = "none";
                }}
              />
            ) : (
              <div className="text-slate-400 text-center">
                <div className="text-5xl">📖</div>
                <p className="text-sm mt-2">No Cover</p>
              </div>
            )}
          </div>

          {/* Upload Button */}
          <div>
            <label className="block text-xs text-slate-500 a11y-muted mb-2">
              Upload Cover (JPG/PNG, max 5MB)
            </label>
            <input
              type="file"
              accept=".jpg,.jpeg,.png"
              onChange={handleCoverUpload}
              disabled={uploading}
              className="w-full text-sm a11y-input a11y-outline"
              aria-label="Upload book cover"
            />
            {uploading ? <p className="text-xs text-slate-600 mt-2">Uploading...</p> : null}
          </div>
        </div>

        {/* Right: Book Details Form */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 a11y-surface a11y-outline">
          <form onSubmit={onSave} className="space-y-4">
            <div>
              <label className="block text-xs text-slate-500 a11y-muted" htmlFor="title">
                Title *
              </label>
              <input
                id="title"
                type="text"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm a11y-input a11y-outline"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-xs text-slate-500 a11y-muted" htmlFor="author">
                Author *
              </label>
              <input
                id="author"
                type="text"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm a11y-input a11y-outline"
                value={form.author}
                onChange={(e) => setForm({ ...form, author: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-xs text-slate-500 a11y-muted" htmlFor="isbn">
                ISBN
              </label>
              <input
                id="isbn"
                type="text"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm a11y-input a11y-outline"
                value={form.isbn}
                onChange={(e) => setForm({ ...form, isbn: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs text-slate-500 a11y-muted" htmlFor="category">
                Category
              </label>
              <select
                id="category"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm a11y-input a11y-outline"
                value={form.category_id}
                onChange={(e) => setForm({ ...form, category_id: e.target.value })}
              >
                <option value="">None</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-500 a11y-muted" htmlFor="year">
                  Year
                </label>
                <input
                  id="year"
                  type="number"
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm a11y-input a11y-outline"
                  value={form.year}
                  onChange={(e) => setForm({ ...form, year: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs text-slate-500 a11y-muted" htmlFor="copies">
                  Total Copies *
                </label>
                <input
                  id="copies"
                  type="number"
                  min="0"
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm a11y-input a11y-outline"
                  value={form.copies_total}
                  onChange={(e) => setForm({ ...form, copies_total: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-500 a11y-muted" htmlFor="location">
                Shelf Location
              </label>
              <input
                id="location"
                type="text"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm a11y-input a11y-outline"
                value={form.shelf_location}
                onChange={(e) => setForm({ ...form, shelf_location: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs text-slate-500 a11y-muted" htmlFor="description">
                Description
              </label>
              <textarea
                id="description"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm a11y-input a11y-outline"
                rows="4"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>

              <button
                type="button"
                onClick={() => nav("/app/books")}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}