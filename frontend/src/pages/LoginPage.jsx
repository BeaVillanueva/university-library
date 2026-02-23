import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../state/AuthContext";
import { useUi } from "../state/UiContext";
import { FiEye, FiEyeOff } from "react-icons/fi";

export default function LoginPage() {
  const { login, isAuthenticated, user, loading } = useAuth();
  const { a11yMode } = useUi(); // kept for compatibility if other parts rely on UiContext

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
                "w-full max-w-md rounded-2xl border border-white/25 p-6 shadow-2xl",
                "bg-white/15 backdrop-blur-xl",
                "text-white",
                a11yMode ? "a11y-outline" : ""
              ].join(" ")}
            >
              <div className="text-center">
                <h1 className="text-xl font-semibold">Welcome Back</h1>
                <p className="mt-1 text-sm text-white/80">Login to continue.</p>
              </div>

              <form className="mt-6 space-y-4" onSubmit={onSubmit}>
                <div>
                  <label className="text-sm font-medium text-white/90" htmlFor="email">
                    Email
                  </label>
                  <input
                    id="email"
                    className="mt-1 w-full rounded-lg border border-white/25 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/60 outline-none focus:border-white/40 focus:ring-2 focus:ring-white/30"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                    aria-label="Email address"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-white/90" htmlFor="password">
                    Password
                  </label>

                  <div className="relative mt-1">
                    <input
                      id="password"
                      type={showPw ? "text" : "password"}
                      className="w-full rounded-lg border border-white/25 bg-white/10 px-3 py-2 pr-11 text-sm text-white placeholder:text-white/60 outline-none focus:border-white/40 focus:ring-2 focus:ring-white/30"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                      required
                      aria-label="Password"
                    />

                    {/* Hold-to-show button */}
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 flex items-center justify-center px-3 text-white/80 hover:text-white"
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
                    className="rounded-lg border border-red-300/40 bg-red-500/20 px-3 py-2 text-sm text-white"
                    role="alert"
                    aria-live="polite"
                  >
                    {error}
                  </div>
                ) : null}

                <button
                  className="w-full rounded-lg bg-white/20 px-3 py-2 text-sm font-semibold text-white hover:bg-white/30 disabled:opacity-60"
                  disabled={loading}
                  aria-label="Sign in"
                >
                  {loading ? "Signing in…" : "Sign in"}
                </button>

                <div className="text-xs text-white/80">
                  Demo accounts (from seeded DB):
                  <ul className="mt-1 list-disc pl-5">
                    <li>admin@university.test</li>
                    <li>librarian@university.test</li>
                    <li>student@university.test</li>
                  </ul>
                  Password: <span className="font-mono">Password123!</span>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}