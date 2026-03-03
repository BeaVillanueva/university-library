import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../state/AuthContext";
import { useUi } from "../state/UiContext";
import { FiEye, FiEyeOff, FiMail, FiLock } from "react-icons/fi";

export default function LoginPage() {
  const { login, isAuthenticated, user, loading } = useAuth();
  const { a11yMode } = useUi();

  const nav = useNavigate();
  const loc = useLocation();
  const from = useMemo(() => loc.state?.from || "/", [loc.state]);

  const [email, setEmail] = useState("admin@university.test");
  const [password, setPassword] = useState("Password123!");
  const [error, setError] = useState("");
  const [showPw, setShowPw] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      nav(from, { replace: true });
    }
  }, [isAuthenticated, user, nav, from]);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    const res = await login(email, password);
    if (!res.ok) setError(res.error || "Login failed");
  }

  return (
    <div className="min-h-screen w-full">
      <div
        className="min-h-screen w-full bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url(/imus-campus.jpg)" }}
      >
        <div className="min-h-screen w-full bg-black/45">
          <div className="min-h-screen w-full grid place-items-center p-6">
            <div
              className={[
                "w-full max-w-xl rounded-2xl border border-white/25 p-8 shadow-2xl",
                "bg-white/10 backdrop-blur-2xl text-white",
                a11yMode ? "a11y-outline" : ""
              ].join(" ")}
            >
              <div className="text-center">
                <h1 className="text-2xl font-semibold">Cavite State University - Imus Campus</h1>
                <p className="mt-1 text-sm text-white/80">Login to continue.</p>
              </div>

              <form className="mt-7 space-y-5" onSubmit={onSubmit}>
                {/* EMAIL */}
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
                      className="w-full rounded-lg border border-white/25 bg-white/10 py-3 pl-12 pr-4 text-sm text-white placeholder:text-white/60 outline-none focus:border-white/40 focus:ring-2 focus:ring-white/30"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      required
                      aria-label="Email address"
                      placeholder="you@cvsu.edu.ph"
                    />
                  </div>
                </div>

                {/* PASSWORD */}
                <div>
                  <label className="text-sm font-medium text-white/90" htmlFor="password">
                    Password
                  </label>

                  <div className="relative mt-1">
                    <FiLock
                      className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/70"
                      aria-hidden="true"
                    />
                    <input
                      id="password"
                      type={showPw ? "text" : "password"}
                      className="w-full rounded-lg border border-white/25 bg-white/10 py-3 pl-12 pr-12 text-sm text-white placeholder:text-white/60 outline-none focus:border-white/40 focus:ring-2 focus:ring-white/30"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                      required
                      aria-label="Password"
                      placeholder="••••••••"
                    />

                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 flex items-center justify-center px-4 text-white/80 hover:text-white"
                      aria-label="Hold to show password"
                      title="Hold to show password"
                      onMouseDown={() => setShowPw(true)}
                      onMouseUp={() => setShowPw(false)}
                      onMouseLeave={() => setShowPw(false)}
                      onTouchStart={() => setShowPw(true)}
                      onTouchEnd={() => setShowPw(false)}
                      onTouchCancel={() => setShowPw(false)}
                      onKeyDown={(e) => {
                        if (e.key === " " || e.key === "Enter") setShowPw(true);
                      }}
                      onKeyUp={(e) => {
                        if (e.key === " " || e.key === "Enter") setShowPw(false);
                      }}
                    >
                      {showPw ? (
                        <FiEyeOff className="h-5 w-5" aria-hidden="true" />
                      ) : (
                        <FiEye className="h-5 w-5" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                </div>

                {error ? (
                  <div
                    className="rounded-lg border border-red-300/40 bg-red-500/20 px-4 py-3 text-sm text-white"
                    role="alert"
                    aria-live="polite"
                  >
                    {error}
                  </div>
                ) : null}

                <button
                  className="w-full rounded-lg bg-gradient-to-r from-emerald-500 to-green-700 px-4 py-3 text-sm font-semibold text-white shadow-lg hover:from-emerald-400 hover:to-green-600 disabled:opacity-60"
                  disabled={loading}
                  aria-label="Sign in"
                >
                  {loading ? "Signing in…" : "Sign in"}
                </button>

                <div className="flex items-center justify-between text-sm">
                  <Link className="text-white/90 hover:underline" to="/register">
                    Register
                  </Link>
                  <Link className="text-white/90 hover:underline" to="/forgot-password">
                    Forgot password?
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