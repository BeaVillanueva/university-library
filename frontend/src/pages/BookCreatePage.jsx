import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiCreateBook, apiUploadBookCover } from "../api/books";
import { apiListCategories } from "../api/categories";
import Alert from "../components/Alert";



export default function BookCreatePage() {
  const nav = useNavigate();

  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    title: "",
    author: "",
    isbn: "",
    category_id: "",
    year: "",
    description: "",
    copies_total: 1,
    shelf_location: ""
  });

  const [coverFile, setCoverFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

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

  async function onSave(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");

    try {
      const res = await apiCreateBook({
        title: form.title,
        author: form.author,
        isbn: form.isbn,
        category_id: form.category_id === "" ? null : Number(form.category_id),
        year: form.year === "" ? null : Number(form.year),
        description: form.description,
        copies_total: Number(form.copies_total),
        shelf_location: form.shelf_location
      });

      const bookId = res.book_id;
      setNotice("Book created!");

      // ✅ Upload cover if selected
      if (coverFile) {
        setUploading(true);
        try {
          await apiUploadBookCover(bookId, coverFile);
          setNotice("Book created with cover!");
        } catch (err) {
          setNotice("Book created but cover upload failed.");
          console.error(err);
        } finally {
          setUploading(false);
        }
      }

      setTimeout(() => nav("/books"), 1500);
    } catch (e) {
      setError(e?.response?.data?.error || e?.message || "Failed to create book");
    } finally {
      setSaving(false);
    }
  }

  const handleCoverSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png"].includes(file.type)) {
      setError("Only JPG/PNG files are allowed.");
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setError("File size must be less than 5MB.");
      return;
    }

    setCoverFile(file);
    setError("");
  };

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Add New Book</h1>
          <p className="mt-1 text-sm text-slate-600 a11y-muted">
            Create a new book entry with optional cover image.
          </p>
        </div>
        <button
          type="button"
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold hover:bg-slate-50"
          onClick={() => nav("/books")}
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
        {/* Left: Book Cover Upload */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 a11y-surface a11y-outline">
          <h2 className="text-lg font-semibold mb-4">Book Cover</h2>

          {/* Cover Preview */}
          <div className="mb-4 h-64 w-full bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden">
            {coverFile ? (
              <img
                src={URL.createObjectURL(coverFile)}
                alt="Cover preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-slate-400 text-center">
                <div className="text-5xl">📖</div>
                <p className="text-sm mt-2">No Cover Selected</p>
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
              onChange={handleCoverSelect}
              disabled={uploading}
              className="w-full text-sm a11y-input a11y-outline"
              aria-label="Upload book cover"
            />
            {uploading && <p className="text-xs text-slate-600 mt-2">Uploading...</p>}
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
                  min="1"
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
                disabled={saving || uploading}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
              >
                {saving || uploading ? "Creating..." : "Create Book"}
              </button>
              <button
                type="button"
                onClick={() => nav("/books")}
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