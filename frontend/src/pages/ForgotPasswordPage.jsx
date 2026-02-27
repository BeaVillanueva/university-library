import React, { useState } from "react";
import { Link } from "react-router-dom";
import { apiForgotPassword } from "../api/auth";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [token, setToken] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setNotice("");
    setToken("");

    setLoading(true);
    try {
      const res = await apiForgotPassword(email);
      setNotice(res?.message || "If that email exists, a reset token was generated.");
      if (res?.reset_token) setToken(res.reset_token); // demo
    } catch (e2) {
      setError(e2?.response?.data?.error || e2?.message || "Request failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid place-items-center p-6 bg-slate-50">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6">
        <h1 className="text-xl font-semibold">Forgot Password</h1>
        <p className="mt-1 text-sm text-slate-600">
          Enter your email. For demo, a reset token will be shown.
        </p>

        <form className="mt-5 space-y-3" onSubmit={onSubmit}>
          <div>
            <label className="text-sm font-medium">Email</label>
            <input
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {notice ? <div className="rounded-lg bg-green-50 p-3 text-sm text-green-700">{notice}</div> : null}
          {error ? <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div> : null}

          {token ? (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm">
              <div className="font-semibold">Demo reset token:</div>
              <div className="mt-1 font-mono break-all">{token}</div>
              <div className="mt-2">
                Go to{" "}
                <Link className="text-blue-700 hover:underline" to="/reset-password">
                  Reset Password
                </Link>
              </div>
            </div>
          ) : null}

          <button
            className="w-full rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
            disabled={loading}
          >
            {loading ? "Submitting…" : "Send reset"}
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