import React, { useEffect, useMemo, useState, useRef } from "react";
import { useVoiceAnnouncements } from "../hooks/useVoiceAnnouncements";
import { voiceAccessibility } from "../utils/voiceAccessibility";
import { apiListActivityLogs } from "../api/activityLogs";
import Pagination from "../components/Pagination";
import Alert from "../components/Alert";
import { formatDateTime } from "../utils/dateTime";

function formatAction(action) {
  const map = {
    "auth.login_success": "Login successful",
    "auth.login_failed": "Login failed",
    "auth.logout": "Logout successful",

    "borrow.borrow": "Borrowed book",
    "borrow.return": "Returned book",
    "borrow.overdue": "Marked overdue",
    "borrow.overdue_email_sent": "Overdue email sent",
    "borrow.overdue_email_failed": "Overdue email failed",

    "import.books_preview": "Previewed book import",
    "import.books_commit": "Imported books",

    "users.create": "Created user",
    "users.update": "Updated user",
    "users.delete": "Deleted user",

    "categories.create": "Created category",
    "categories.update": "Updated category",
    "categories.delete": "Deleted category",

    "books.update": "Updated book",

    "reports.view": "Viewed reports",
    "reports.export": "Exported report"
  };

  return map[action] || "Activity";
}

function formatYearSuffix(n) {
  if (n === 1) return "1st";
  if (n === 2) return "2nd";
  if (n === 3) return "3rd";
  if (typeof n === "number" && Number.isFinite(n)) return `${n}th`;
  return "";
}

function formatDescription(action, details) {
  if (!details || typeof details !== "object") return "";

  if (action === "auth.login_success") {
    return `Logged in as ${details.role || "user"} (${details.email || "—"})`;
  }
  if (action === "auth.login_failed") {
    return `Failed login (${details.email || "—"}) — ${details.reason || "unknown reason"}`;
  }
  if (action === "auth.logout") {
    return `Logged out (${details.email || "—"})`;
  }

  if (action === "borrow.borrow") {
    const book = details.book_title || details.book_id || "a book";
    const due = details.due_date ? ` (Due: ${details.due_date})` : "";
    const who = details.borrower_name || details.borrower_email;
    return `Borrowed ${book}${due}${who ? ` for ${who}` : ""}`;
  }
  if (action === "borrow.return") {
    const book = details.book_title || details.book_id || "a book";
    const who = details.borrower_name || details.borrower_email;
    return `Returned ${book}${who ? ` from ${who}` : ""}`;
  }
  if (action === "borrow.overdue") {
    const book = details.book_title || details.book_id || "a book";
    const who = details.borrower_name || details.borrower_email;
    const due = details.due_date ? ` due ${details.due_date}` : "";
    return `Marked ${book} as overdue${due}${who ? ` for ${who}` : ""}`;
  }
  if (action === "borrow.overdue_email_sent" || action === "borrow.overdue_email_failed") {
    const book = details.book_title || "a book";
    const email = details.student_email || "student";
    return `${action.endsWith("_sent") ? "Sent" : "Failed to send"} overdue email to ${email} for ${book}`;
  }

  if (action === "users.create" || action === "users.update" || action === "users.delete") {
    const target =
      details.target_name ||
      details.target_email ||
      details.target_student_number ||
      details.target_user_id ||
      "user";

    const role = details.target_role ? ` (${details.target_role})` : "";

    const dept = details.target_department ? `${details.target_department}` : "";
    const y = details.target_year_level ? Number(details.target_year_level) : null;
    const year = y ? `${formatYearSuffix(y)} year` : "";
    const studNo = details.target_student_number ? ` • Student No: ${details.target_student_number}` : "";

    const extraParts = [];
    if (dept) extraParts.push(dept);
    if (year) extraParts.push(year);

    const extra = extraParts.length ? ` — ${extraParts.join(", ")}${studNo}` : studNo;

    const verb =
      action === "users.create"
        ? "User created"
        : action === "users.update"
          ? "User updated"
          : "User deleted";

    return `${verb}: ${target}${role}${extra}`;
  }

  const entries = Object.entries(details)
    .slice(0, 4)
    .map(([k, v]) => `${k}: ${String(v)}`);
  return entries.join(" • ");
}

export default function ActivityLogsPage() {
  // ✅ Announce page load
  useVoiceAnnouncements('ACTIVITY_LOGS');

  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);

  const [q, setQ] = useState("");
  const [action, setAction] = useState("");
  const [entityType, setEntityType] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ✅ Track last search to prevent repeated announcements
  const lastSearchRef = useRef(null);

  const rows = useMemo(() => items || [], [items]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError("");
      
      try {
        const res = await apiListActivityLogs({
          page,
          limit,
          q,
          action,
          entity_type: entityType
        });
        if (!cancelled) {
          setItems(res.items || []);
          setTotalPages(res.total_pages || 1);

          // ✅ Announce search results ONCE per search
          if (q && q !== lastSearchRef.current) {
            lastSearchRef.current = q;
            voiceAccessibility.announceSearch(q, res.items?.length || 0);
          }
        }
      } catch (e) {
        if (!cancelled) setError(e?.response?.data?.error || e?.message || "Failed to load logs");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [page, limit, q, action, entityType]);

  return (
    <div>
      <h1 className="text-2xl font-semibold">Activity Logs</h1>
      <p className="mt-1 text-sm text-slate-600 a11y-muted">Admin/Librarian audit trail.</p>

      <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 a11y-surface a11y-outline">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="text-xs text-slate-500 a11y-muted" htmlFor="search">
              Search
            </label>
            <input
              id="search"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm a11y-input a11y-outline"
              value={q}
              onChange={(e) => {
                setPage(1);
                setQ(e.target.value);
                // ✅ NO announce here - useEffect handles with debounce
              }}
              placeholder="name/email/action"
            />
          </div>

          <div>
            <label className="text-xs text-slate-500 a11y-muted" htmlFor="action-filter">
              Action code (optional filter)
            </label>
            <input
              id="action-filter"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm a11y-input a11y-outline"
              value={action}
              onChange={(e) => {
                setPage(1);
                setAction(e.target.value);
                // ✅ Announce filter
                if (e.target.value) {
                  voiceAccessibility.announceFilter('action', e.target.value);
                }
              }}
              placeholder="e.g. users.create"
            />
          </div>

          <div>
            <label className="text-xs text-slate-500 a11y-muted" htmlFor="type-filter">
              Type (optional filter)
            </label>
            <input
              id="type-filter"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm a11y-input a11y-outline"
              value={entityType}
              onChange={(e) => {
                setPage(1);
                setEntityType(e.target.value);
                // ✅ Announce filter
                if (e.target.value) {
                  voiceAccessibility.announceFilter('entity type', e.target.value);
                }
              }}
              placeholder="e.g. user, borrow, book"
            />
          </div>
        </div>
      </div>

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
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Description</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="px-4 py-4 text-slate-600 a11y-muted" colSpan={5}>
                    Loading…
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td className="px-4 py-4 text-slate-600 a11y-muted" colSpan={5}>
                    No logs.
                  </td>
                </tr>
              ) : (
                rows.map((l) => (
                  <tr key={l.id} className="border-t border-slate-100 align-top">
                    <td className="px-4 py-3 whitespace-nowrap">{formatDateTime(l.created_at, "—")}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{l.actor_name || "—"}</div>
                      <div className="text-xs text-slate-500 a11y-muted">{l.actor_email || ""}</div>
                    </td>
                    <td className="px-4 py-3">{l.actor_role || "—"}</td>
                    <td className="px-4 py-3">{formatAction(l.action)}</td>
                    <td className="px-4 py-3">{formatDescription(l.action, l.details)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-slate-200 px-4 py-3">
          <Pagination 
            page={page} 
            totalPages={totalPages} 
            onPageChange={(newPage) => {
              setPage(newPage);
              // ✅ Announce page change
              voiceAccessibility.announcePage(newPage, totalPages);
            }} 
          />
        </div>
      </div>
    </div>
  );
}
