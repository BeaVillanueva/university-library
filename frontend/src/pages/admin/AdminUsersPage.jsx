import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  apiCreateUser,
  apiArchiveUser,
  apiListUsers,
  apiPermanentDeleteUser,
  apiUpdateUser
} from "../../api/users";
import Alert from "../../components/Alert";
import ConfirmModal from "../../components/ConfirmModal";
import Pagination from "../../components/Pagination";
import { useVoiceAnnouncements } from "../../hooks/useVoiceAnnouncements";
import { voiceAccessibility } from "../../utils/voiceAccessibility";

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
  active: "Active",
  archived: "Archived",
  create: "Create"
};

function tabFromPath(pathname) {
  if (pathname.startsWith("/app/admin/users/create")) return "create";
  if (pathname.startsWith("/app/admin/users/archived")) return "archived";
  return "active";
}

function pathFromTab(tab) {
  if (tab === "create") return "/app/admin/users/create";
  if (tab === "archived") return "/app/admin/users/archived";
  return "/app/admin/users";
}

export default function AdminUsersPage() {
  useVoiceAnnouncements("ADMIN_USERS");

  const loc = useLocation();
  const nav = useNavigate();
  const [tab, setTab] = useState(() => tabFromPath(loc.pathname));

  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
    student_number: "",
    department: ""
  });

  const [loading, setLoading] = useState(false);
  const [workingId, setWorkingId] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [archiveTarget, setArchiveTarget] = useState(null);
  const [restoreTarget, setRestoreTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const isStudentForm = form.role === "student";
  const courseOptions = useMemo(() => IMUS_COURSES, []);

  useEffect(() => {
    const next = tabFromPath(loc.pathname);
    setTab(next);
    if (next === "create") {
      setQ("");
      setPage(1);
    }
  }, [loc.pathname]);

  async function loadUsers() {
    setLoading(true);
    setError("");
    try {
      const res = await apiListUsers({
        page,
        limit: 10,
        q: q || undefined,
        status: tab === "archived" ? "archived" : "active"
      });
      setItems(res.items || []);
      setTotalPages(res.total_pages || 1);
    } catch (e) {
      setError(e?.response?.data?.error || e?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (tab === "active" || tab === "archived") loadUsers();
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
    }

    try {
      await apiCreateUser(payload);
      voiceAccessibility.announceSuccess(`User ${form.email} created successfully.`);
      setNotice("User created.");
      setForm({
        name: "",
        email: "",
        password: "",
        role: "student",
        student_number: "",
        department: ""
      });
      nav("/app/admin/users", { replace: true });
    } catch (e2) {
      const msg = e2?.response?.data?.error || e2?.message || "Create failed";
      voiceAccessibility.announceError(msg);
      setError(msg);
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

  async function archiveUser(id) {
    setWorkingId(id);
    setError("");
    setNotice("");
    try {
      await apiArchiveUser(id);
      voiceAccessibility.announceSuccess("User archived successfully.");
      setNotice("User archived successfully.");
      await loadUsers();
    } catch (e) {
      const errorMsg = e?.response?.data?.error || e?.message || "Archive failed";
      voiceAccessibility.announceError(errorMsg);
      setError(errorMsg);
    } finally {
      setWorkingId(null);
      setArchiveTarget(null);
    }
  }

  async function restoreUser(id) {
    setWorkingId(id);
    setError("");
    setNotice("");
    try {
      await apiUpdateUser(id, { status: "approved" });
      voiceAccessibility.announceSuccess("User restored successfully.");
      setNotice("User restored successfully.");
      await loadUsers();
    } catch (e) {
      const errorMsg = e?.response?.data?.error || e?.message || "Restore failed";
      voiceAccessibility.announceError(errorMsg);
      setError(errorMsg);
    } finally {
      setWorkingId(null);
      setRestoreTarget(null);
    }
  }

  async function permanentlyDeleteUser(id) {
    setWorkingId(id);
    setError("");
    setNotice("");
    try {
      await apiPermanentDeleteUser(id);
      voiceAccessibility.announceSuccess("User permanently deleted.");
      setNotice("User permanently deleted.");
      await loadUsers();
    } catch (e) {
      const errorMsg =
        e?.response?.data?.error || e?.message || "Permanent delete failed";
      voiceAccessibility.announceError(errorMsg);
      setError(errorMsg);
    } finally {
      setWorkingId(null);
      setDeleteTarget(null);
    }
  }

  return (
    <div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Users</h1>
          <p className="mt-1 text-sm text-slate-600 a11y-muted">
            Admin can manage users. Student registration is verified by email authentication code.
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
                  : "border-slate-200 bg-white hover:bg-slate-50 a11y-surface a11y-outline"
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

      {tab === "active" || tab === "archived" ? (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm a11y-surface a11y-outline">
          <div className="flex items-end justify-between gap-3">
            <div>
              <div className="text-sm font-semibold">
                {tab === "archived" ? "Archived Users" : "Active Users"}
              </div>
              <div className="text-xs text-slate-500 a11y-muted">
                Search by name, email, or role.
              </div>
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
                  <th className="px-3 py-2">Role</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td className="px-3 py-3 text-slate-600 a11y-muted" colSpan={7}>
                      Loading...
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td className="px-3 py-3 text-slate-600 a11y-muted" colSpan={7}>
                      No users.
                    </td>
                  </tr>
                ) : (
                  items.map((u) => {
                    const isStudentRow = u.role === "student";
                    const studentNo = isStudentRow ? u.student_number || "-" : "-";
                    const dept = isStudentRow ? u.department || "-" : "-";

                    return (
                      <tr key={u.id} className="border-t border-slate-100">
                        <td className="px-3 py-2 font-medium">{u.name}</td>
                        <td className="px-3 py-2 text-xs">{u.email}</td>
                        <td className="px-3 py-2 text-xs">{studentNo}</td>
                        <td className="px-3 py-2 text-xs">{dept}</td>
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
                        <td className="px-3 py-2 text-xs">{u.status || "-"}</td>
                        <td className="px-3 py-2">
                          {tab === "archived" ? (
                            <div className="flex flex-wrap gap-2">
                              <button
                                className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 shadow-sm hover:bg-emerald-100 disabled:opacity-60"
                                onClick={() => setRestoreTarget(u)}
                                disabled={workingId === u.id}
                                type="button"
                              >
                                Restore
                              </button>
                              <button
                                className="rounded-lg border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 shadow-sm hover:bg-red-100 disabled:opacity-60"
                                onClick={() => setDeleteTarget(u)}
                                disabled={workingId === u.id}
                                type="button"
                              >
                                Delete Permanently
                              </button>
                            </div>
                          ) : (
                            <button
                              className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 hover:bg-amber-100 shadow-sm"
                              onClick={() => setArchiveTarget(u)}
                              disabled={workingId === u.id}
                              type="button"
                            >
                              Archive
                            </button>
                          )}
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
                      ? { student_number: "", department: "" }
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
              </>
            ) : null}

            <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 shadow-sm">
              Create
            </button>
          </form>
        </div>
      ) : null}

      <ConfirmModal
        open={Boolean(archiveTarget)}
        title="Archive user?"
        message={`Archive ${archiveTarget?.name || "this user"}? They will no longer appear in the active users list and cannot log in while archived.`}
        confirmText="Archive"
        tone="danger"
        loading={workingId === archiveTarget?.id}
        onCancel={() => setArchiveTarget(null)}
        onConfirm={() => archiveTarget && archiveUser(archiveTarget.id)}
      />
      <ConfirmModal
        open={Boolean(restoreTarget)}
        title="Restore user?"
        message={`Restore ${restoreTarget?.name || "this user"} to active status?`}
        confirmText="Restore"
        tone="primary"
        loading={workingId === restoreTarget?.id}
        onCancel={() => setRestoreTarget(null)}
        onConfirm={() => restoreTarget && restoreUser(restoreTarget.id)}
      />
      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Delete permanently?"
        message={`This action cannot be undone. Permanently delete ${deleteTarget?.name || "this user"}?`}
        confirmText="Delete Permanently"
        tone="danger"
        loading={workingId === deleteTarget?.id}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && permanentlyDeleteUser(deleteTarget.id)}
      />
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
