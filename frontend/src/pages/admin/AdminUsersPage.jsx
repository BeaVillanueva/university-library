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
import { useVoiceAnnouncements } from "../../hooks/useVoiceAnnouncements";
import { voiceAccessibility } from "../../utils/voiceAccessibility";
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

// ✅ FIXED: Add /app prefix
function tabFromPath(pathname) {
  if (pathname.startsWith("/app/admin/users/pending")) return "pending";
  if (pathname.startsWith("/app/admin/users/create")) return "create";
  if (pathname.startsWith("/app/admin/users")) return "all";
  return "all";
}

// ✅ FIXED: Add /app prefix
function pathFromTab(tab) {
  if (tab === "pending") return "/app/admin/users/pending";
  if (tab === "create") return "/app/admin/users/create";
  return "/app/admin/users";
}

export default function AdminUsersPage() {
  // ✅ Announce page load
  useVoiceAnnouncements('ADMIN_USERS');

  const loc = useLocation();
  const nav = useNavigate();

  const [tab, setTab] = useState(() => tabFromPath(loc.pathname));

  const [items, setItems] = useState([]);
  const [pending, setPending] = useState([]);
  const [selectedPendingIds, setSelectedPendingIds] = useState(new Set());

  const [q, setQ] = useState("");
  const [pendingSearch, setPendingSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // ✅ removed year_level everywhere
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

  const isStudentForm = form.role === "student";
  const courseOptions = useMemo(() => IMUS_COURSES, []);

  const filteredPending = useMemo(() => {
  const search = pendingSearch.trim().toLowerCase();

    if (!search) return pending;

    return pending.filter((p) =>
      [
        p.name,
        p.email,
        p.student_number,
        p.department,
      ]
        .join(" ")
        .toLowerCase()
        .includes(search)
    );
  }, [pending, pendingSearch]);

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
      setSelectedPendingIds(new Set());
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
      // ✅ removed year_level from payload
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

  async function bulkApprovePending() {
    if (selectedPendingIds.size === 0) {
      alert("No students selected");
      return;
    }

    if (!confirm(`Approve ${selectedPendingIds.size} student(s)?`)) return;

    setLoading(true);
    try {
      for (const id of selectedPendingIds) {
        await apiApproveUser(id);
      }
      setSelectedPendingIds(new Set());
      setNotice(`Successfully approved ${selectedPendingIds.size} student(s)`);
      await loadPending();
    } catch (e) {
      setError(e?.response?.data?.error || e?.message || "Bulk approve failed");
    } finally {
      setLoading(false);
    }
  }

  async function removeUser(id) {
    if (!confirm("Delete this user?")) return;
    setWorkingId(id);
    setError("");
    setNotice("");
    try {
      await apiDeleteUser(id);
      voiceAccessibility.announceSuccess("User deleted successfully.");
      setNotice("User deleted successfully.");
      await loadUsers();
    } catch (e) {
      const errorMsg = e?.response?.data?.error || e?.message || "Delete failed";
      voiceAccessibility.announceError(errorMsg);
      setError(errorMsg);
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
        <>
          <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="w-full sm:max-w-md">
              <label className="text-xs font-semibold text-slate-500">
                Search pending students
              </label>

              <input
                type="text"
                value={pendingSearch}
                onChange={(e) => {
                  setPendingSearch(e.target.value);
                  setSelectedPendingIds(new Set());
                }}
                placeholder="Search name, email, student number, or course..."
                className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>

            <div className="text-sm text-slate-500">
              Showing{" "}
              <span className="font-semibold text-slate-800">
                {filteredPending.length}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-slate-800">
                {pending.length}
              </span>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-slate-200 bg-white shadow-sm a11y-surface a11y-outline">
            <div className="border-b border-slate-200 px-4 py-3 flex items-center justify-between">
              <div className="text-sm font-semibold">
                {selectedPendingIds.size > 0 ? (
                  <span className="text-emerald-600">
                    {selectedPendingIds.size} selected
                  </span>
                ) : (
                  <span>Pending Student Approvals</span>
                )}
              </div>

              <div className="flex gap-2">
                {selectedPendingIds.size > 0 && (
                  <button
                    type="button"
                    className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60 shadow-sm"
                    onClick={bulkApprovePending}
                    disabled={loading}
                  >
                    Approve Selected ({selectedPendingIds.size})
                  </button>
                )}

                <button
                  type="button"
                  className="text-xs rounded-lg border border-slate-200 px-3 py-1 hover:bg-slate-50 shadow-sm"
                  onClick={loadPending}
                >
                  Refresh
                </button>
              </div>
            </div>

            {loading ? (
              <div className="p-4 text-sm text-slate-600 a11y-muted">
                Loading…
              </div>
            ) : filteredPending.length === 0 ? (
              <div className="p-4 text-sm text-slate-600 a11y-muted">
                No pending students.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={
                            selectedPendingIds.size === filteredPending.length &&
                            filteredPending.length > 0
                          }
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedPendingIds(
                                new Set(filteredPending.map((p) => p.id))
                              );
                            } else {
                              setSelectedPendingIds(new Set());
                            }
                          }}
                          aria-label="Select all pending students"
                        />
                      </th>

                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">
                        Name
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">
                        Email
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">
                        Student #
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">
                        Department
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {filteredPending.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={selectedPendingIds.has(p.id)}
                            onChange={(e) => {
                              const newSet = new Set(selectedPendingIds);

                              if (e.target.checked) {
                                newSet.add(p.id);
                              } else {
                                newSet.delete(p.id);
                              }

                              setSelectedPendingIds(newSet);
                            }}
                            aria-label={`Select ${p.name}`}
                          />
                        </td>

                        <td className="px-4 py-3 font-medium">{p.name}</td>
                        <td className="px-4 py-3 text-xs text-slate-600">
                          {p.email}
                        </td>
                        <td className="px-4 py-3 text-xs">
                          {p.student_number || "—"}
                        </td>
                        <td className="px-4 py-3 text-xs">
                          {p.department || "—"}
                        </td>

                        <td className="px-4 py-3">
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
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      ) : null}

      {/* ALL USERS TAB */}
      {tab === "all" ? (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm a11y-surface a11y-outline">
          <div className="flex items-end justify-between gap-3">
            <div>
              <div className="text-sm font-semibold">All Users</div>
              <div className="text-xs text-slate-500 a11y-muted">
                Search by name/email/role.
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
                  {/* ✅ removed Year Level */}
                  <th className="px-3 py-2">Role</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      className="px-3 py-3 text-slate-600 a11y-muted"
                      colSpan={7}
                    >
                      Loading…
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td
                      className="px-3 py-3 text-slate-600 a11y-muted"
                      colSpan={7}
                    >
                      No users.
                    </td>
                  </tr>
                ) : (
                  items.map((u) => {
                    const isStudentRow = u.role === "student";
                    const studentNo = isStudentRow ? (u.student_number || "—") : "—";
                    const dept = isStudentRow ? (u.department || "—") : "—";

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
            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
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
                    onChange={(e) =>
                      setForm({ ...form, student_number: e.target.value })
                    }
                    required
                  />
                </Field>

                <Field label="Department (Course Offered - Imus Campus)">
                  <select
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm a11y-input a11y-outline"
                    value={form.department}
                    onChange={(e) =>
                      setForm({ ...form, department: e.target.value })
                    }
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