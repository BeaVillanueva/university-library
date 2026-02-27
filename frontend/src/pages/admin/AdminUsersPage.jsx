import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  apiCreateUser,
  apiDeleteUser,
  apiListUsers,
  apiUpdateUser,
  apiListPendingStudents,
  apiApproveUser,
  apiDeclineUser
} from "../../api/users";
import Pagination from "../../components/Pagination";
import Alert from "../../components/Alert";

const IMUS_COURSES = [
  "AB Journalism",
  "Bachelor of Elementary Education",
  "Bachelor of Secondary Education",
  "BS Business Management",
  "BS Computer Science",
  "BS Entrepreneurship",
  "BS Hospitality Management (formerly BS Hotel and Restaurant Management)",
  "BS Information Technology",
  "BS Office Administration",
  "BS Psychology",
  "Bachelor Of Early Childhood Education",
  "Teacher Certificate Program"
];

const TABS = {
  pending: "Pending Approval",
  all: "All Users",
  create: "Create"
};

function tabFromPath(pathname) {
  if (pathname.startsWith("/admin/users/pending")) return "pending";
  if (pathname.startsWith("/admin/users/create")) return "create";
  if (pathname.startsWith("/admin/users")) return "all";
  return "all";
}

function pathFromTab(tab) {
  if (tab === "pending") return "/admin/users/pending";
  if (tab === "create") return "/admin/users/create";
  return "/admin/users";
}

export default function AdminUsersPage() {
  const loc = useLocation();
  const nav = useNavigate();

  const [tab, setTab] = useState(() => tabFromPath(loc.pathname));

  const [items, setItems] = useState([]);
  const [pending, setPending] = useState([]);

  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
    student_number: "",
    department: "",
    year_level: ""
  });

  const [loading, setLoading] = useState(false);
  const [workingId, setWorkingId] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const isStudentForm = form.role === "student";
  const courseOptions = useMemo(() => IMUS_COURSES, []);

  useEffect(() => {
    const next = tabFromPath(loc.pathname);
    setTab(next);
    if (next !== "all") {
      setQ("");
      setPage(1);
    }
  }, [loc.pathname]);

  async function loadUsers() {
    setLoading(true);
    setError("");
    try {
      const res = await apiListUsers({ page, limit: 10, q: q || undefined });
      setItems(res.items || []);
      setTotalPages(res.total_pages || 1);
    } catch (e) {
      setError(e?.response?.data?.error || e?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  }

  async function loadPending() {
    setLoading(true);
    setError("");
    try {
      const res = await apiListPendingStudents();
      setPending(res.items || []);
    } catch (e) {
      setError(e?.response?.data?.error || e?.message || "Failed to load pending users");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (tab === "all") loadUsers();
    if (tab === "pending") loadPending();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, page, q]);

  async function createUser(e) {
    e.preventDefault();
    setError("");
    setNotice("");

    const payload = {
      name: form.name,
      email: form.email,
      password: form.password,
      role: form.role
    };

    if (form.role === "student") {
      payload.student_number = form.student_number?.trim();
      payload.department = form.department;
      payload.year_level = Number(form.year_level);
    }

    try {
      await apiCreateUser(payload);
      setNotice("User created.");
      setForm({
        name: "",
        email: "",
        password: "",
        role: "student",
        student_number: "",
        department: "",
        year_level: ""
      });

      nav("/admin/users", { replace: true });
    } catch (e2) {
      setError(e2?.response?.data?.error || e2?.message || "Create failed");
    }
  }

  async function updateRole(id, role) {
    setWorkingId(id);
    setError("");
    setNotice("");
    try {
      await apiUpdateUser(id, { role });
      setNotice("Updated.");
      await loadUsers();
    } catch (e) {
      setError(e?.response?.data?.error || e?.message || "Update failed");
    } finally {
      setWorkingId(null);
    }
  }

  async function approve(id) {
    if (!confirm("Approve this student account?")) return;
    setWorkingId(id);
    setError("");
    setNotice("");
    try {
      await apiApproveUser(id);
      setNotice("Student approved.");
      await loadPending();
    } catch (e) {
      setError(e?.response?.data?.error || e?.message || "Approve failed");
    } finally {
      setWorkingId(null);
    }
  }

  async function decline(id) {
    const reason = prompt("Decline reason (optional):") || "";
    if (!confirm("Decline this student account?")) return;

    setWorkingId(id);
    setError("");
    setNotice("");
    try {
      await apiDeclineUser(id, reason);
      setNotice("Student declined.");
      await loadPending();
    } catch (e) {
      setError(e?.response?.data?.error || e?.message || "Decline failed");
    } finally {
      setWorkingId(null);
    }
  }

  async function removeUser(id) {
    if (!confirm("Delete this user?")) return;
    setWorkingId(id);
    setError("");
    setNotice("");
    try {
      await apiDeleteUser(id);
      setNotice("Deleted.");
      await loadUsers();
    } catch (e) {
      setError(e?.response?.data?.error || e?.message || "Delete failed");
    } finally {
      setWorkingId(null);
    }
  }

  return (
    <div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Users</h1>
          <p className="mt-1 text-sm text-slate-600 a11y-muted">
            Admin can manage users and student approvals.
          </p>
        </div>

        <div className="flex gap-2">
          {Object.entries(TABS).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => {
                setError("");
                setNotice("");
                nav(pathFromTab(key));
              }}
              className={[
                "rounded-lg border px-3 py-2 text-sm shadow-sm",
                tab === key
                  ? "border-blue-600 bg-blue-600 text-white shadow-md"
                  : "border-slate-200 bg-white hover:bg-slate-50"
              ].join(" ")}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {notice ? (
        <div className="mt-3">
          <Alert type="success">{notice}</Alert>
        </div>
      ) : null}
      {error ? (
        <div className="mt-3">
          <Alert type="error">{error}</Alert>
        </div>
      ) : null}

      {/* PENDING TAB */}
      {tab === "pending" ? (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm a11y-surface a11y-outline">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold">Pending Student Approvals</div>
            <button
              type="button"
              className="text-xs rounded-lg border border-slate-200 px-3 py-1 hover:bg-slate-50 shadow-sm"
              onClick={loadPending}
            >
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="mt-3 text-sm text-slate-600 a11y-muted">Loading…</div>
          ) : pending.length === 0 ? (
            <div className="mt-3 text-sm text-slate-600 a11y-muted">
              No pending students.
            </div>
          ) : (
            <div className="mt-3 space-y-2">
              {pending.map((p) => (
                <div
                  key={p.id}
                  className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold">{p.name}</div>
                      <div className="text-xs text-slate-600 a11y-muted">{p.email}</div>
                      <div className="text-xs text-slate-600 a11y-muted">
                        {p.student_number} • {p.department} • Year {p.year_level}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="rounded-lg bg-green-600 px-3 py-1 text-xs font-semibold text-white hover:bg-green-700 disabled:opacity-60 shadow-sm"
                        onClick={() => approve(p.id)}
                        disabled={workingId === p.id}
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        className="rounded-lg bg-red-600 px-3 py-1 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-60 shadow-sm"
                        onClick={() => decline(p.id)}
                        disabled={workingId === p.id}
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : null}

      {/* ALL USERS TAB */}
      {tab === "all" ? (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm a11y-surface a11y-outline">
          <div className="flex items-end justify-between gap-3">
            <div>
              <div className="text-sm font-semibold">All Users</div>
              <div className="text-xs text-slate-500 a11y-muted">Search by name/email/role.</div>
            </div>
            <div className="w-56">
              <label className="text-xs text-slate-500 a11y-muted">Search</label>
              <input
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm a11y-input a11y-outline"
                value={q}
                onChange={(e) => {
                  setPage(1);
                  setQ(e.target.value);
                }}
                aria-label="Search users"
              />
            </div>
          </div>

          <div className="mt-3 table-scroll">
            <table className="min-w-full text-sm">
              <thead className="border-b border-slate-200">
                <tr className="text-left text-xs uppercase tracking-wide text-slate-500 a11y-muted">
                  <th className="px-3 py-2">Name</th>
                  <th className="px-3 py-2">Email</th>
                  <th className="px-3 py-2">Student #</th>
                  <th className="px-3 py-2">Department / Course</th>
                  <th className="px-3 py-2">Year Level</th>
                  <th className="px-3 py-2">Role</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td className="px-3 py-3 text-slate-600 a11y-muted" colSpan={8}>
                      Loading…
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td className="px-3 py-3 text-slate-600 a11y-muted" colSpan={8}>
                      No users.
                    </td>
                  </tr>
                ) : (
                  items.map((u) => {
                    const isStudentRow = u.role === "student";
                    const studentNo = isStudentRow ? (u.student_number || "—") : "—";
                    const dept = isStudentRow ? (u.department || "—") : "—";
                    const year = isStudentRow ? (u.year_level ?? "—") : "—";

                    return (
                      <tr key={u.id} className="border-t border-slate-100">
                        <td className="px-3 py-2 font-medium">{u.name}</td>
                        <td className="px-3 py-2 text-xs">{u.email}</td>
                        <td className="px-3 py-2 text-xs">{studentNo}</td>
                        <td className="px-3 py-2 text-xs">{dept}</td>
                        <td className="px-3 py-2 text-xs">{year}</td>
                        <td className="px-3 py-2">
                          <select
                            className="rounded-lg border border-slate-300 px-2 py-1 text-xs shadow-sm a11y-input a11y-outline"
                            value={u.role}
                            onChange={(e) => updateRole(u.id, e.target.value)}
                            disabled={workingId === u.id}
                          >
                            <option value="student">student</option>
                            <option value="librarian">librarian</option>
                            <option value="admin">admin</option>
                          </select>
                        </td>
                        <td className="px-3 py-2 text-xs">{u.status || "—"}</td>
                        <td className="px-3 py-2">
                          <button
                            className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs hover:bg-slate-50 shadow-sm a11y-surface a11y-outline"
                            onClick={() => removeUser(u.id)}
                            disabled={workingId === u.id}
                            type="button"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-3">
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        </div>
      ) : null}

      {/* CREATE TAB */}
      {tab === "create" ? (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm a11y-surface a11y-outline">
          <div className="text-sm font-semibold">Create User</div>

          <form className="mt-3 space-y-3" onSubmit={createUser}>
            <Field label="Name">
              <input
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm a11y-input a11y-outline"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </Field>

            <Field label="Email">
              <input
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm a11y-input a11y-outline"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </Field>

            <Field label="Password">
              <input
                type="password"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm a11y-input a11y-outline"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </Field>

            <Field label="Role">
              <select
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm a11y-input a11y-outline"
                value={form.role}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    role: e.target.value,
                    ...(e.target.value !== "student"
                      ? { student_number: "", department: "", year_level: "" }
                      : {})
                  }))
                }
              >
                <option value="student">student</option>
                <option value="librarian">librarian</option>
                <option value="admin">admin</option>
              </select>
            </Field>

            {isStudentForm ? (
              <>
                <Field label="Student Number">
                  <input
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm a11y-input a11y-outline"
                    value={form.student_number}
                    onChange={(e) => setForm({ ...form, student_number: e.target.value })}
                    required
                  />
                </Field>

                <Field label="Department (Course Offered - Imus Campus)">
                  <select
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm a11y-input a11y-outline"
                    value={form.department}
                    onChange={(e) => setForm({ ...form, department: e.target.value })}
                    required
                  >
                    <option value="" disabled>
                      Select course
                    </option>
                    {courseOptions.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Year Level">
                  <select
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py--2 text-sm shadow-sm a11y-input a11y-outline"
                    value={form.year_level}
                    onChange={(e) => setForm({ ...form, year_level: e.target.value })}
                    required
                  >
                    <option value="" disabled>
                      Select year level
                    </option>
                    <option value="1">1st</option>
                    <option value="2">2nd</option>
                    <option value="3">3rd</option>
                    <option value="4">4th</option>
                    <option value="5">5th</option>
                    <option value="6">6th</option>
                  </select>
                </Field>
              </>
            ) : null}

            <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 shadow-sm">
              Create
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      {children}
    </div>
  );
}