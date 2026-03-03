import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { apiResetPassword } from "../api/auth";
import { useUi } from "../state/UiContext";
import { FiEye, FiEyeOff, FiKey, FiMail } from "react-icons/fi";

const FORBIDDEN_PATTERNS = [/'/, /"/, /;/, /--/, /</, />/];

function hasForbiddenChars(value) {
  const v = String(value || "");
  return FORBIDDEN_PATTERNS.some((re) => re.test(v));
}

function sanitizeNoForbidden(value) {
  let v = String(value || "");
  v = v.replace(/['";<>]/g, "");
  v = v.replace(/--/g, "");
  return v;
}

function Modal({ title, message, confirmText = "OK", onConfirm }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-6">
      <div className="w-full max-w-sm rounded-2xl border border-white/15 bg-slate-950/80 p-5 text-white shadow-2xl backdrop-blur-xl">
        <div className="text-base font-semibold">{title}</div>
        <div className="mt-2 text-sm text-white/85">{message}</div>
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  const { a11yMode } = useUi();
  const nav = useNavigate();
  const [searchParams] = useSearchParams();

  const initialEmail = useMemo(() => searchParams.get("email") || "", [searchParams]);
  const initialToken = useMemo(() => searchParams.get("token") || "", [searchParams]);
  const emailLocked = useMemo(
    () => Boolean(initialEmail && initialToken),
    [initialEmail, initialToken]
  );

  const [form, setForm] = useState({
    email: "",
    token: "",
    new_password: "",
    confirm_password: ""
  });

  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ✅ modal states
  const [successOpen, setSuccessOpen] = useState(false);

  useEffect(() => {
    if (initialEmail || initialToken) {
      setForm((prev) => ({
        ...prev,
        email: initialEmail || prev.email,
        token: initialToken || prev.token
      }));
    }
  }, [initialEmail, initialToken]);

  function validate() {
    if (!form.email.trim()) return "Email is required.";
    if (!form.token) return "Reset link is missing or invalid. Please request a new reset link.";
    if (!form.new_password) return "New password is required.";
    if (form.new_password.length < 8) return "Password must be at least 8 characters.";
    if (hasForbiddenChars(form.new_password))
      return "Password contains forbidden characters: ' \" ; -- < >";
    if (form.confirm_password !== form.new_password) return "Passwords do not match.";
    return "";
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError("");

    const msg = validate();
    if (msg) {
      setError(msg);
      return;
    }

    setLoading(true);
    try {
      await apiResetPassword({
        email: form.email.trim(),
        token: form.token,
        new_password: form.new_password
      });

      // ✅ show modal instead of inline notice
      setSuccessOpen(true);
    } catch (e2) {
      setError(e2?.response?.data?.error || e2?.message || "Reset failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full">
      {successOpen ? (
        <Modal
          title="Password reset successful"
          message="Your password has been updated. Click OK to go back to Sign in."
          confirmText="OK"
          onConfirm={() => {
            setSuccessOpen(false);
            nav("/login");
          }}
        />
      ) : null}

      <div
        className="min-h-screen w-full bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url(/imus-campus.jpg)" }}
      >
        <div className="min-h-screen w-full bg-black/45">
          <div className="min-h-screen w-full grid place-items-center p-6">
            <div
              className={[
                "w-full max-w-md rounded-2xl border border-white/25 p-6 shadow-2xl",
                "bg-white/15 backdrop-blur-xl text-white",
                a11yMode ? "a11y-outline" : ""
              ].join(" ")}
            >
              <div className="text-center">
                <h1 className="text-xl font-semibold">Cavite State University - Imus Campus</h1>
                <p className="mt-1 text-sm text-white/80">Reset Password</p>
              </div>

              <form className="mt-6 space-y-4" onSubmit={onSubmit}>
                {/* Email */}
                <div>
                  <label className="text-sm font-medium text-white/90" htmlFor="email">
                    Email
                  </label>
                  <div className="relative mt-1">
                    <FiMail
                      className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/70"
                      aria-hidden="true"
                    />
                    <input
                      id="email"
                      type="email"
                      className={[
                        "w-full rounded-lg border border-white/25 py-3 pl-12 pr-4 text-sm text-white placeholder:text-white/60 outline-none focus:border-white/40 focus:ring-2 focus:ring-white/30",
                        emailLocked ? "bg-white/5 text-white/80 cursor-not-allowed" : "bg-white/10"
                      ].join(" ")}
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      required
                      autoComplete="email"
                      placeholder="yourname@cvsu.edu.ph"
                      disabled={emailLocked}
                      readOnly={emailLocked}
                    />
                  </div>
                </div>

                {/* New password */}
                <div>
                  <label className="text-sm font-medium text-white/90" htmlFor="new_password">
                    New password
                  </label>
                  <div className="relative mt-1">
                    <FiKey
                      className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/70"
                      aria-hidden="true"
                    />
                    <input
                      id="new_password"
                      type={showNew ? "text" : "password"}
                      className="w-full rounded-lg border border-white/25 bg-white/10 py-3 pl-12 pr-12 text-sm text-white placeholder:text-white/60 outline-none focus:border-white/40 focus:ring-2 focus:ring-white/30"
                      value={form.new_password}
                      onChange={(e) =>
                        setForm({ ...form, new_password: sanitizeNoForbidden(e.target.value) })
                      }
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 flex items-center justify-center px-4 text-white/80 hover:text-white"
                      aria-label="Hold to show password"
                      title="Hold to show password"
                      onMouseDown={() => setShowNew(true)}
                      onMouseUp={() => setShowNew(false)}
                      onMouseLeave={() => setShowNew(false)}
                      onTouchStart={() => setShowNew(true)}
                      onTouchEnd={() => setShowNew(false)}
                      onTouchCancel={() => setShowNew(false)}
                    >
                      {showNew ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
                    </button>
                  </div>
                  <div className="mt-1 text-xs text-white/70">
                    Forbidden: <span className="font-mono">' " ; -- &lt; &gt;</span>
                  </div>
                </div>

                {/* Confirm password */}
                <div>
                  <label className="text-sm font-medium text-white/90" htmlFor="confirm_password">
                    Confirm password
                  </label>
                  <div className="relative mt-1">
                    <FiKey
                      className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/70"
                      aria-hidden="true"
                    />
                    <input
                      id="confirm_password"
                      type={showConfirm ? "text" : "password"}
                      className="w-full rounded-lg border border-white/25 bg-white/10 py-3 pl-12 pr-12 text-sm text-white placeholder:text-white/60 outline-none focus:border-white/40 focus:ring-2 focus:ring-white/30"
                      value={form.confirm_password}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          confirm_password: sanitizeNoForbidden(e.target.value)
                        })
                      }
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 flex items-center justify-center px-4 text-white/80 hover:text-white"
                      aria-label="Hold to show confirm password"
                      title="Hold to show password"
                      onMouseDown={() => setShowConfirm(true)}
                      onMouseUp={() => setShowConfirm(false)}
                      onMouseLeave={() => setShowConfirm(false)}
                      onTouchStart={() => setShowConfirm(true)}
                      onTouchEnd={() => setShowConfirm(false)}
                      onTouchCancel={() => setShowConfirm(false)}
                    >
                      {showConfirm ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {error ? (
                  <div className="rounded-lg border border-red-300/40 bg-red-500/20 px-3 py-2 text-sm text-white">
                    {error}
                  </div>
                ) : null}

                <button
                  className="w-full rounded-lg bg-gradient-to-r from-emerald-500 to-green-700 px-3 py-2 text-sm font-semibold text-white shadow-lg hover:from-emerald-400 hover:to-green-600 disabled:opacity-60"
                  disabled={loading}
                >
                  {loading ? "Resetting…" : "Reset password"}
                </button>

                <div className="text-sm text-white/90">
                  Back to{" "}
                  <Link className="text-white hover:underline" to="/login">
                    Sign in
                  </Link>
                </div>
              </form>
            </div>

            <div className="mt-6 text-center text-xs text-white/70">
              © Cavite State University – Imus Campus
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}