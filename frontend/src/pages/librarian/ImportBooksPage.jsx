import React, { useMemo, useState } from "react";
import { apiCommitBooksImport, apiPreviewBooksCsv } from "../../api/importBooks";
import Alert from "../../components/Alert";

export default function ImportBooksPage() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState([]);
  const [requiredCols, setRequiredCols] = useState([]);

  const [loadingPreview, setLoadingPreview] = useState(false);
  const [loadingCommit, setLoadingCommit] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [summary, setSummary] = useState(null);

  const validRows = useMemo(() => {
    return preview.filter((r) => (r.errors || []).length === 0);
  }, [preview]);

  const invalidRows = useMemo(() => {
    return preview.filter((r) => (r.errors || []).length > 0);
  }, [preview]);

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
      setPreview(res.preview || []);
      setNotice("Preview generated. Review errors before saving.");
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
      setError("No valid rows to import. Fix CSV errors first.");
      return;
    }

    setLoadingCommit(true);
    try {
      const res = await apiCommitBooksImport(validRows);
      setSummary(res.summary);
      setNotice("Import finished.");
    } catch (e2) {
      setError(e2?.response?.data?.error || e2?.message || "Import failed");
    } finally {
      setLoadingCommit(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold">Import Books (CSV)</h1>
      <p className="mt-1 text-sm text-slate-600 a11y-muted">
        Upload a CSV file → preview → then save. No manual add-book form is provided initially.
      </p>

      <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 a11y-surface a11y-outline">
        <form onSubmit={handlePreview} className="flex flex-col md:flex-row md:items-end gap-3">
          <div className="flex-1">
            <label className="text-sm font-medium">CSV File</label>
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
                    <tr key={r.row_number} className={`border-t border-slate-100 ${hasErr ? "bg-red-50/50" : ""}`}>
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