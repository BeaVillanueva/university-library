import React, { useEffect, useState } from "react";
import { apiCreateUser, apiDeleteUser, apiListUsers, apiUpdateUser } from "../../api/users";
import Pagination from "../../components/Pagination";
import Alert from "../../components/Alert";

export default function AdminUsersPage() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
    // new fields (for students)
    student_number: "",
    department: "",
    year_level: ""
  });

  const [loading, setLoading] = useState(false);
  const [workingId, setWorkingId] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const isStudentForm = form.role === "student";

  async function load() {
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

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, q]);

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
      payload.department = form.department?.trim();
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
      await load();
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
      await load();
    } catch (e) {
      setError(e?.response?.data?.error || e?.message || "Update failed");
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
      await load();
    } catch (e) {
      setError(e?.response?.data?.error || e?.message || "Delete failed");
    } finally {
      setWorkingId(null);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold">Users</h1>
      <p className="mt-1 text-sm text-slate-600 a11y-muted">Admin can manage users (CRUD).</p>

      <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 a11y-surface a11y-outline">
          <div className="text-sm font-semibold">Create User</div>

          <form className="mt-3 space-y-3" onSubmit={createUser}>
            <Field label="Name">
              <input
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm a11y-input a11y-outline"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                aria-label="User name"
              />
            </Field>

            <Field label="Email">
              <input
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm a11y-input a11y-outline"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                aria-label="User email"
              />
            </Field>

            <Field label="Password">
              <input
                type="password"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm a11y-input a11y-outline"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                aria-label="User password"
              />
            </Field>

            <Field label="Role">
              <select
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm a11y-input a11y-outline"
                value={form.role}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    role: e.target.value
                  }))
                }
                aria-label="User role"
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
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm a11y-input a11y-outline"
                    value={form.student_number}
                    onChange={(e) => setForm({ ...form, student_number: e.target.value })}
                    required
                    aria-label="Student number"
                    placeholder="e.g. 2026-00123"
                  />
                </Field>

                <Field label="Department">
                  <input
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm a11y-input a11y-outline"
                    value={form.department}
                    onChange={(e) => setForm({ ...form, department: e.target.value })}
                    required
                    aria-label="Department"
                    placeholder="e.g. BSIT"
                  />
                </Field>

                <Field label="Year Level">
                  <select
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm a11y-input a11y-outline"
                    value={form.year_level}
                    onChange={(e) => setForm({ ...form, year_level: e.target.value })}
                    required
                    aria-label="Year level"
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

            <button
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              aria-label="Create user"
            >
              Create
            </button>
          </form>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 a11y-surface a11y-outline">
          <div className="flex items-end justify-between gap-3">
            <div>
              <div className="text-sm font-semibold">All Users</div>
              <div className="text-xs text-slate-500 a11y-muted">Search by name/email/role.</div>
            </div>
            <div className="w-56">
              <label className="text-xs text-slate-500 a11y-muted">Search</label>
              <input
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm a11y-input a11y-outline"
                value={q}
                onChange={(e) => {
                  setPage(1);
                  setQ(e.target.value);
                }}
                aria-label="Search users"
              />
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

          <div className="mt-3 table-scroll">
            <table className="min-w-full text-sm">
              <thead className="border-b border-slate-200">
                <tr className="text-left text-xs uppercase tracking-wide text-slate-500 a11y-muted">
                  <th className="px-3 py-2">Name</th>
                  <th className="px-3 py-2">Email</th>
                  <th className="px-3 py-2">Role</th>
                  <th className="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td className="px-3 py-3 text-slate-600 a11y-muted" colSpan={4}>
                      Loading…
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td className="px-3 py-3 text-slate-600 a11y-muted" colSpan={4}>
                      No users.
                    </td>
                  </tr>
                ) : (
                  items.map((u) => (
                    <tr key={u.id} className="border-t border-slate-100">
                      <td className="px-3 py-2 font-medium">{u.name}</td>
                      <td className="px-3 py-2 text-xs">{u.email}</td>
                      <td className="px-3 py-2">
                        <select
                          className="rounded-lg border border-slate-300 px-2 py-1 text-xs a11y-input a11y-outline"
                          value={u.role}
                          onChange={(e) => updateRole(u.id, e.target.value)}
                          disabled={workingId === u.id}
                          aria-label={`Change role for ${u.email}`}
                        >
                          <option value="student">student</option>
                          <option value="librarian">librarian</option>
                          <option value="admin">admin</option>
                        </select>
                      </td>
                      <td className="px-3 py-2">
                        <button
                          className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs hover:bg-slate-50 a11y-surface a11y-outline"
                          onClick={() => removeUser(u.id)}
                          disabled={workingId === u.id}
                          aria-label={`Delete ${u.email}`}
                          type="button"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-3">
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        </div>
      </div>
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