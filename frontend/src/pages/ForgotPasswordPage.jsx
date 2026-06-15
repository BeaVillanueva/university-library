import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiForgotPassword } from "../api/auth";
import { useUi } from "../state/UiContext";
import { FiMail } from "react-icons/fi";

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

export default function ForgotPasswordPage() {
  const { a11yMode } = useUi();
  const nav = useNavigate();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [successOpen, setSuccessOpen] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [resendSeconds, setResendSeconds] = useState(0);

  useEffect(() => {
    if (resendSeconds <= 0) return undefined;
    const timer = setInterval(() => {
      setResendSeconds((value) => Math.max(0, value - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendSeconds]);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");

    setLoading(true);
    try {
      await apiForgotPassword(email);
      setCodeSent(true);
      setResendSeconds(30);
      setSuccessOpen(true);
    } catch (e2) {
      setError(e2?.response?.data?.error || e2?.message || "Request failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full">
      {successOpen ? (
        <Modal
          title="Reset code sent"
          message="We sent a password reset code/link. Please check your Inbox and Spam/Junk. The code expires in 5 minutes."
          confirmText="OK"
          onConfirm={() => {
            setSuccessOpen(false);
            nav(`/reset-password?email=${encodeURIComponent(email.trim())}`);
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
                <p className="mt-1 text-sm text-white/80">Forgot Password</p>
              </div>

              <form className="mt-6 space-y-4" onSubmit={onSubmit}>
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
                      className="w-full rounded-lg border border-white/25 bg-white/10 py-3 pl-12 pr-4 text-sm text-white placeholder:text-white/60 outline-none focus:border-white/40 focus:ring-2 focus:ring-white/30"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                      placeholder="yourname@cvsu.edu.ph"
                    />
                  </div>
                </div>

                {error ? (
                  <div className="rounded-lg border border-red-300/40 bg-red-500/20 px-3 py-2 text-sm text-white">
                    {error}
                  </div>
                ) : null}

                <button
                  className="w-full rounded-lg bg-gradient-to-r from-emerald-500 to-green-700 px-3 py-2 text-sm font-semibold text-white shadow-lg hover:from-emerald-400 hover:to-green-600 disabled:opacity-60"
                  disabled={loading || (codeSent && resendSeconds > 0)}
                >
                  {loading
                    ? "Submitting..."
                    : codeSent && resendSeconds > 0
                      ? `Resend code in ${resendSeconds}s`
                      : codeSent
                        ? "Resend reset code"
                        : "Send reset code"}
                </button>

                <div className="text-sm text-white/90">
                  Remembered your password?{" "}
                  <Link className="text-white hover:underline" to="/login">
                    Sign in
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
