import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiGetBook, apiUpdateBook } from "../api/books";
import { apiListCategories } from "../api/categories";
import Alert from "../components/Alert";

export default function BookEditPage() {
  const { id } = useParams();
  const bookId = Number(id);
  const nav = useNavigate();

  const [categories, setCategories] = useState([]);
  const [book, setBook] = useState(null);
  const [form, setForm] = useState(null);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

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
      setNotice("Saved.");
      const refreshed = await apiGetBook(bookId);
      setBook(refreshed.book);
    } catch (e2) {
      setError(e2?.response?.data?.error || e2?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="text-sm text-slate-600 a11y-muted">Loading…</div>;
  }
  if (error) {
    return <Alert type="error">{error}</Alert>;
  }
  if (!book || !form) return null;

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Edit Book</h1>
          <p className="mt-1 text-sm text-slate-600 a11y-muted">
            Updating copies_total will recompute copies_available using: copies_total - currently_borrowed.
          </p>
        </div>
        <button
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm hover:bg-slate-50 a11y-surface a11y-outline"
          onClick={() => nav(-1)}
          type="button"
          aria-label="Go back"
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

      <form onSubmit={onSave} className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 a11y-surface a11y-outline">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Title">
            <input
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm a11y-input a11y-outline"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
              aria-label="Title"
            />
          </Field>
          <Field label="Author">
            <input
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm a11y-input a11y-outline"
              value={form.author}
              onChange={(e) => setForm({ ...form, author: e.target.value })}
              required
              aria-label="Author"
            />
          </Field>

          <Field label="ISBN">
            <input
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono a11y-input a11y-outline"
              value={form.isbn}
              onChange={(e) => setForm({ ...form, isbn: e.target.value })}
              required
              aria-label="ISBN"
            />
          </Field>

          <Field label="Category">
            <select
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm a11y-input a11y-outline"
              value={form.category_id ?? ""}
              onChange={(e) => setForm({ ...form, category_id: e.target.value })}
              aria-label="Category"
            >
              <option value="">None</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Year">
            <input
              type="number"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm a11y-input a11y-outline"
              value={form.year}
              onChange={(e) => setForm({ ...form, year: e.target.value })}
              aria-label="Year"
            />
          </Field>

          <Field label="Shelf location">
            <input
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm a11y-input a11y-outline"
              value={form.shelf_location}
              onChange={(e) => setForm({ ...form, shelf_location: e.target.value })}
              aria-label="Shelf location"
            />
          </Field>

          <Field label="Copies total">
            <input
              type="number"
              min="0"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm a11y-input a11y-outline"
              value={form.copies_total}
              onChange={(e) => setForm({ ...form, copies_total: e.target.value })}
              aria-label="Copies total"
            />
            <div className="mt-1 text-xs text-slate-500 a11y-muted">
              Current available: <span className="font-medium">{book.copies_available}</span>
            </div>
          </Field>

          <Field label="Description" className="md:col-span-2">
            <textarea
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm a11y-input a11y-outline"
              rows={4}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              aria-label="Description"
            />
          </Field>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
            disabled={saving}
            aria-label="Save book"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, children, className = "" }) {
  return (
    <div className={className}>
      <label className="text-sm font-medium">{label}</label>
      {children}
    </div>
  );
}