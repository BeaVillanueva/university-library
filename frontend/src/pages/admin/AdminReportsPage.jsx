import React, { useEffect, useMemo, useState } from "react";
import { apiExportReportCsv, apiReportList } from "../../api/reports";
import { useAuth } from "../../state/AuthContext";
import Alert from "../../components/Alert";
import { useVoiceAnnouncements } from "../../hooks/useVoiceAnnouncements";
import { voiceAccessibility } from "../../utils/voiceAccessibility";

export default function AdminReportsPage() {
  // ✅ Announce page load
  useVoiceAnnouncements('ADMIN_REPORTS');

  const { token } = useAuth();

  const [type, setType] = useState("borrowed");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const params = useMemo(
    () => ({
      type,
      from: from || undefined,
      to: to || undefined
    }),
    [type, from, to]
  );

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await apiReportList(params);
      setItems(res.items || []);
    } catch (e) {
      setError(e?.response?.data?.error || e?.message || "Failed to load report");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.type, params.from, params.to]);

  async function exportCsv() {
    setError("");
    setNotice("");
    try {
      const blob = await apiExportReportCsv(params, token);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `report_${type}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setNotice("CSV exported.");
      
      voiceAccessibility.announceSuccess("CSV report exported successfully.");
    
    } catch (e) {
      const msg = e?.message || "Export failed";
      voiceAccessibility.announceError(msg);
      setError(msg);
    }
  }

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Reports</h1>
          <p className="mt-1 text-sm text-slate-600 a11y-muted">Filter by date and export CSV.</p>
        </div>
        <button
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          onClick={exportCsv}
          type="button"
          aria-label="Export report CSV"
        >
          Export CSV
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

      <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 a11y-surface a11y-outline">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="text-xs text-slate-500 a11y-muted">Type</label>
            <select
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm a11y-input a11y-outline"
              value={type}
              onChange={(e) => setType(e.target.value)}
              aria-label="Report type"
            >
              <option value="borrowed">Borrowed</option>
              <option value="returned">Returned</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-500 a11y-muted">From</label>
            <input
              type="date"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm a11y-input a11y-outline"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              aria-label="From date"
            />
          </div>
          <div>
            <label className="text-xs text-slate-500 a11y-muted">To</label>
            <input
              type="date"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm a11y-input a11y-outline"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              aria-label="To date"
            />
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-slate-200 bg-white a11y-surface a11y-outline">
        <div className="table-scroll">
          <table className="min-w-full text-sm">
            <thead className="border-b border-slate-200">
              <tr className="text-left text-xs uppercase tracking-wide text-slate-500 a11y-muted">
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Book</th>
                <th className="px-4 py-3">Borrow</th>
                <th className="px-4 py-3">Due</th>
                <th className="px-4 py-3">Return</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-4 text-slate-600 a11y-muted">
                    Loading…
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-4 text-slate-600 a11y-muted">
                    No results.
                  </td>
                </tr>
              ) : (
                items.map((r) => (
                  <tr key={r.id} className="border-t border-slate-100">
                    <td className="px-4 py-3">
                      <div className="font-medium">{r.user_name}</div>
                      <div className="text-xs text-slate-500 a11y-muted">{r.user_email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{r.book_title}</div>
                      <div className="text-xs text-slate-500 a11y-muted font-mono">{r.isbn}</div>
                    </td>
                    <td className="px-4 py-3">{r.borrow_date}</td>
                    <td className="px-4 py-3">{r.due_date}</td>
                    <td className="px-4 py-3">{r.return_date || "—"}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}