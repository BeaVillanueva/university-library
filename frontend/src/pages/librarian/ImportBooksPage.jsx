import React, { useEffect, useMemo, useState } from "react";
import { useVoiceAnnouncements } from "../../hooks/useVoiceAnnouncements";
import { voiceAccessibility } from "../../utils/voiceAccessibility";
import { apiCommitBooksImport, apiCreateBookManual, apiPreviewBooksCsv } from "../../api/importBooks";
import { apiUploadBookCover } from "../../api/books";
import { apiListCategories } from "../../api/categories";
import Alert from "../../components/Alert";

const EMPTY_BOOK = {
  title: "",
  author: "",
  isbn: "",
  category_id: "",
  year: "",
  description: "",
  copies_total: "1",
  shelf_location: ""
};

function toIntOrNull(v) {
  const s = String(v ?? "").trim();
  if (s === "") return null;
  const n = Number(s);
  if (!Number.isFinite(n)) return null;
  return Math.trunc(n);
}

function toStrOrNull(v) {
  const s = String(v ?? "").trim();
  return s === "" ? null : s;
}

function hasExistingIsbnError(row) {
  const errs = row?.errors || [];
  return errs.some((e) => String(e || "").toLowerCase().includes("isbn already exists"));
}

export default function ImportBooksPage() {
    useVoiceAnnouncements('IMPORT_BOOKS');

  // ===== bulk import state =====
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState([]);
  const [requiredCols, setRequiredCols] = useState([]);

  const [loadingPreview, setLoadingPreview] = useState(false);
  const [loadingCommit, setLoadingCommit] = useState(false);

  // ===== manual add state =====
  const [showManual, setShowManual] = useState(true);
  const [book, setBook] = useState(EMPTY_BOOK);
  const [loadingManual, setLoadingManual] = useState(false);

  // cover upload state (manual add)
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState("");
  const [uploadingCover, setUploadingCover] = useState(false);

  // categories for dropdown
  const [categories, setCategories] = useState([]);

  // ===== shared state =====
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [summary, setSummary] = useState(null);

  const validRows = useMemo(() => preview.filter((r) => (r.errors || []).length === 0), [preview]);
  const invalidRows = useMemo(() => preview.filter((r) => (r.errors || []).length > 0), [preview]);

  const existingIsbnCount = useMemo(() => {
    return preview.reduce((acc, r) => acc + (hasExistingIsbnError(r) ? 1 : 0), 0);
  }, [preview]);

  // load categories once
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

  async function handlePreview(e) {
    e.preventDefault();
    setError("");
    setNotice("");
    setSummary(null);
    setPreview([]);
    setRequiredCols([]);

    if (!file) {
      setError("Please choose a CSV file.");
      return;
    }

    setLoadingPreview(true);
    try {
      const res = await apiPreviewBooksCsv(file);
      setRequiredCols(res.required_columns || []);
      const p = res.preview || [];
      setPreview(p);

      if (p.length === 0) {
        setNotice("No rows found in CSV.");
      } else {
        setNotice("Preview generated. Review errors before saving.");
      }

      const existsCount = p.reduce((acc, r) => acc + (hasExistingIsbnError(r) ? 1 : 0), 0);
      if (existsCount > 0) {
        setError(
          `${existsCount} row(s) have an ISBN that already exists in the book list. ` +
            `Those rows cannot be saved. Please use "Add Stock" from the Books page instead.`
        );
      }
    } catch (e2) {
      setError(e2?.response?.data?.error || e2?.message || "Preview failed");
    } finally {
      setLoadingPreview(false);
    }
  }

  async function handleCommit() {
    setError("");
    setNotice("");
    setSummary(null);

    if (!preview.length) {
      setError("No preview rows. Upload and preview first.");
      return;
    }

    if (validRows.length === 0) {
      setError(
        'No valid rows to import. Some rows may have existing ISBNs. ' +
          'Fix CSV errors or use "Add Stock" instead.'
      );
      return;
    }

    setLoadingCommit(true);
    try {
      const res = await apiCommitBooksImport(validRows);
      setSummary(res.summary);
      setNotice("Import finished.");

      if (existingIsbnCount > 0) {
        setError(
          `${existingIsbnCount} row(s) were blocked because ISBN already exists. ` +
            `Use "Add Stock" for those books.`
        );
      }
    } catch (e2) {
      setError(e2?.response?.data?.error || e2?.message || "Import failed");
    } finally {
      setLoadingCommit(false);
    }
  }

  function resetManual() {
    setBook(EMPTY_BOOK);
    setCoverFile(null);
    if (coverPreview) URL.revokeObjectURL(coverPreview);
    setCoverPreview("");
  }

  async function handleCoverPick(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png"].includes(file.type)) {
      setError("Only JPG/PNG files are allowed.");
      e.target.value = "";
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setError("File size must be less than 5MB.");
      e.target.value = "";
      return;
    }

    setError("");
    setNotice("");

    // preview
    if (coverPreview) URL.revokeObjectURL(coverPreview);
    const previewUrl = URL.createObjectURL(file);
    setCoverPreview(previewUrl);
    setCoverFile(file);

    // reset input value so same file can be picked again
    e.target.value = "";
  }

  async function handleManualSubmit(e) {
    e.preventDefault();
    setError("");
    setNotice("");
    setSummary(null);

    const payload = {
      title: String(book.title || "").trim(),
      author: toStrOrNull(book.author),
      isbn: toStrOrNull(book.isbn),
      category_id: book.category_id === "" ? null : Number(book.category_id),
      year: toIntOrNull(book.year),
      description: toStrOrNull(book.description),
      copies_total: toIntOrNull(book.copies_total) ?? 1,
      shelf_location: toStrOrNull(book.shelf_location)
    };

    if (!payload.title) {
      setError("Title is required.");
      return;
    }
    if (payload.copies_total !== null && payload.copies_total < 0) {
      setError("Copies must be 0 or more.");
      return;
    }

    setLoadingManual(true);
    try {
      // 1) create book
      const created = await apiCreateBookManual(payload);

      // IMPORTANT:
      // this must return { book_id: number } or { id: number }
      const newId =
        Number(created?.book_id) ||
        Number(created?.id) ||
        Number(created?.data?.book_id);

      if (!Number.isFinite(newId) || newId <= 0) {
        // book was created but we can't upload cover without id
        setNotice("Book added successfully. (Cover upload skipped: missing book_id in response)");
        voiceAccessibility.announceSuccess("Books imported successfully.");
        resetManual();
        return;
      }

      // 2) upload cover if selected
      if (coverFile) {
        setUploadingCover(true);
        try {
          await apiUploadBookCover(newId, coverFile);
        } finally {
          setUploadingCover(false);
        }
      }

      setNotice("Book added successfully.");
      resetManual();
    } catch (e2) {
      const msg = e2?.response?.data?.error || e2?.message || "Failed to add book";
      if (e2?.response?.status === 409) {
        setError(`${msg} Please use "Add Stock" from the Books page instead.`);
      } else {
        setError(msg);
      }
    } finally {
      setLoadingManual(false);
    }
  }

  const manualBusy = loadingManual || uploadingCover;

  return (
    <div>
      <h1 className="text-2xl font-semibold">Import Books (CSV)</h1>
      <p className="mt-1 text-sm text-slate-600 a11y-muted">
        Upload a CSV file → preview → then save. You can also add books manually.
      </p>

      {/* Manual Add */}
      <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 a11y-surface a11y-outline">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold">Manual Add (Single Book)</div>
            <div className="text-xs text-slate-500 a11y-muted">
              Adds one book directly (keeps bulk import available below).
            </div>
          </div>

          <button
            type="button"
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold hover:bg-slate-50 disabled:opacity-60 a11y-surface a11y-outline"
            onClick={() => setShowManual((s) => !s)}
          >
            {showManual ? "Hide" : "Show"}
          </button>
        </div>

        {showManual ? (
          <form onSubmit={handleManualSubmit} className="mt-4 grid gap-6 lg:grid-cols-3">
            {/* Left: Cover */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 a11y-surface a11y-outline">
              <h2 className="text-lg font-semibold mb-4">Book Cover</h2>

              <div className="mb-4 h-64 w-full bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden">
                {coverPreview ? (
                  <img
                    src={coverPreview}
                    alt="Cover preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-slate-400 text-center">
                    <div className="text-5xl">📖</div>
                    <p className="text-sm mt-2">No Cover</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs text-slate-500 a11y-muted mb-2">
                  Upload Cover (JPG/PNG, max 5MB)
                </label>
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png"
                  onChange={handleCoverPick}
                  disabled={manualBusy}
                  className="w-full text-sm a11y-input a11y-outline"
                  aria-label="Upload book cover"
                />
                {uploadingCover ? (
                  <p className="text-xs text-slate-600 mt-2">Uploading cover...</p>
                ) : null}
              </div>
            </div>

            {/* Right: Details */}
            <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 a11y-surface a11y-outline">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-slate-500 a11y-muted">Title *</label>
                  <input
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm a11y-input a11y-outline"
                    value={book.title}
                    onChange={(e) => setBook({ ...book, title: e.target.value })}
                    placeholder="e.g. Clean Code"
                    required
                    disabled={manualBusy}
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-500 a11y-muted">Author</label>
                  <input
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm a11y-input a11y-outline"
                    value={book.author}
                    onChange={(e) => setBook({ ...book, author: e.target.value })}
                    placeholder="e.g. Robert C. Martin"
                    disabled={manualBusy}
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-500 a11y-muted">ISBN</label>
                  <input
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm a11y-input a11y-outline"
                    value={book.isbn}
                    onChange={(e) => setBook({ ...book, isbn: e.target.value })}
                    placeholder="e.g. 9780132350884"
                    disabled={manualBusy}
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-500 a11y-muted">Category</label>
                  <select
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm a11y-input a11y-outline"
                    value={book.category_id}
                    onChange={(e) => setBook({ ...book, category_id: e.target.value })}
                    disabled={manualBusy}
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
                    <label className="block text-xs text-slate-500 a11y-muted">Year</label>
                    <input
                      type="number"
                      min={0}
                      className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm a11y-input a11y-outline"
                      value={book.year}
                      onChange={(e) => setBook({ ...book, year: e.target.value })}
                      placeholder="e.g. 2026"
                      disabled={manualBusy}
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-500 a11y-muted">Copies Total</label>
                    <input
                      type="number"
                      min={0}
                      className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm a11y-input a11y-outline"
                      value={book.copies_total}
                      onChange={(e) => setBook({ ...book, copies_total: e.target.value })}
                      disabled={manualBusy}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-slate-500 a11y-muted">Shelf Location</label>
                  <input
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm a11y-input a11y-outline"
                    value={book.shelf_location}
                    onChange={(e) => setBook({ ...book, shelf_location: e.target.value })}
                    placeholder="e.g. A1-CS"
                    disabled={manualBusy}
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-500 a11y-muted">Description</label>
                  <textarea
                    rows={4}
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm a11y-input a11y-outline"
                    value={book.description}
                    onChange={(e) => setBook({ ...book, description: e.target.value })}
                    placeholder="Optional notes/description"
                    disabled={manualBusy}
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="submit"
                    className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                    disabled={manualBusy}
                  >
                    {loadingManual ? "Adding…" : uploadingCover ? "Uploading Cover…" : "Add Book"}
                  </button>

                  <button
                    type="button"
                    className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50 disabled:opacity-60 a11y-surface a11y-outline"
                    onClick={resetManual}
                    disabled={manualBusy}
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>
          </form>
        ) : null}
      </div>

      {/* Bulk Import */}
      <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 a11y-surface a11y-outline">
        <form onSubmit={handlePreview} className="flex flex-col md:flex-row md:items-end gap-3">
          <div className="flex-1">
            <label className="text-sm font-medium">Bulk Import Books</label>
            <input
              type="file"
              accept=".csv,text/csv"
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm a11y-input a11y-outline"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              aria-label="Choose CSV file"
              required
            />
            {requiredCols.length ? (
              <div className="mt-2 text-xs text-slate-500 a11y-muted">
                Required columns: <span className="font-mono">{requiredCols.join(", ")}</span>
              </div>
            ) : null}
          </div>

          <button
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
            disabled={loadingPreview}
            aria-label="Generate preview"
          >
            {loadingPreview ? "Previewing…" : "Preview"}
          </button>

          <button
            type="button"
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50 disabled:opacity-60 a11y-surface a11y-outline"
            onClick={handleCommit}
            disabled={loadingCommit || validRows.length === 0}
            aria-label="Save import"
            title={validRows.length === 0 ? 'No valid rows (existing ISBNs or other errors).' : undefined}
          >
            {loadingCommit ? "Saving…" : `Save (${validRows.length} valid)`}
          </button>
        </form>
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

      {summary ? (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 a11y-surface a11y-outline">
          <div className="text-sm font-semibold">Import Summary</div>
          <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <SummaryCard label="Inserted" value={summary.inserted} />
            <SummaryCard label="Updated" value={summary.updated} />
            <SummaryCard label="Skipped" value={summary.skipped} />
            <SummaryCard label="Submitted" value={summary.total_submitted} />
          </div>
        </div>
      ) : null}

      {preview.length ? (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white a11y-surface a11y-outline">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
            <div>
              <div className="text-sm font-semibold">Preview</div>
              <div className="text-xs text-slate-500 a11y-muted">
                Valid: {validRows.length} • Invalid: {invalidRows.length}
              </div>
            </div>
          </div>

          <div className="table-scroll">
            <table className="min-w-full text-sm">
              <thead className="border-b border-slate-200">
                <tr className="text-left text-xs uppercase tracking-wide text-slate-500 a11y-muted">
                  <th className="px-4 py-3">Row</th>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Author</th>
                  <th className="px-4 py-3">ISBN</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Year</th>
                  <th className="px-4 py-3">Copies</th>
                  <th className="px-4 py-3">Shelf</th>
                  <th className="px-4 py-3">Errors</th>
                </tr>
              </thead>
              <tbody>
                {preview.map((r) => {
                  const d = r.data || {};
                  const hasErr = (r.errors || []).length > 0;
                  return (
                    <tr
                      key={r.row_number}
                      className={`border-t border-slate-100 ${hasErr ? "bg-red-50/50" : ""}`}
                    >
                      <td className="px-4 py-3 font-mono text-xs">{r.row_number}</td>
                      <td className="px-4 py-3">{d.title}</td>
                      <td className="px-4 py-3">{d.author}</td>
                      <td className="px-4 py-3 font-mono text-xs">{d.isbn}</td>
                      <td className="px-4 py-3">{d.category || "—"}</td>
                      <td className="px-4 py-3">{d.year ?? "—"}</td>
                      <td className="px-4 py-3">{d.copies_total}</td>
                      <td className="px-4 py-3">{d.shelf_location || "—"}</td>
                      <td className="px-4 py-3">
                        {hasErr ? (
                          <ul className="list-disc pl-5 text-xs text-red-700">
                            {r.errors.map((e, idx) => (
                              <li key={idx}>{e}</li>
                            ))}
                          </ul>
                        ) : (
                          <span className="text-xs text-slate-500 a11y-muted">OK</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function SummaryCard({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 a11y-surface a11y-outline">
      <div className="text-xs text-slate-500 a11y-muted">{label}</div>
      <div className="mt-1 text-xl font-semibold">{value}</div>
    </div>
  );
}