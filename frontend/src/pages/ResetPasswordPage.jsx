import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiResetPassword } from "../api/auth";

export default function ResetPasswordPage() {
  const nav = useNavigate();

  const [form, setForm] = useState({
    email: "",
    token: "",
    new_password: ""
  });

  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setNotice("");

    setLoading(true);
    try {
      const res = await apiResetPassword(form);
      setNotice(res?.message || "Password reset successful.");
      setTimeout(() => nav("/login"), 1000);
    } catch (e2) {
      setError(e2?.response?.data?.error || e2?.message || "Reset failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid place-items-center p-6 bg-slate-50">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6">
        <h1 className="text-xl font-semibold">Reset Password</h1>
        <p className="mt-1 text-sm text-slate-600">
          Paste the demo token from Forgot Password, then set a new password.
        </p>

        <form className="mt-5 space-y-3" onSubmit={onSubmit}>
          <Field label="Email">
            <input
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </Field>

          <Field label="Reset token">
            <input
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono"
              value={form.token}
              onChange={(e) => setForm({ ...form, token: e.target.value })}
              required
            />
          </Field>

          <Field label="New password">
            <input
              type="password"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              value={form.new_password}
              onChange={(e) => setForm({ ...form, new_password: e.target.value })}
              required
            />
          </Field>

          {notice ? <div className="rounded-lg bg-green-50 p-3 text-sm text-green-700">{notice}</div> : null}
          {error ? <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div> : null}

          <button
            className="w-full rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
            disabled={loading}
          >
            {loading ? "Resetting…" : "Reset password"}
          </button>

          <div className="text-sm text-slate-600">
            Back to{" "}
            <Link className="text-blue-700 hover:underline" to="/login">
              Sign in
            </Link>
          </div>
        </form>
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