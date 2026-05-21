import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../state/AuthContext";
import { useUi } from "../state/UiContext";
import { getDefaultRoute } from "../state/AuthContext";
import { FiEye, FiEyeOff, FiMail, FiLock } from "react-icons/fi";



function formatSeconds(sec) {
  const s = Math.max(0, Math.floor(sec));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, "0")}`;
}

export default function LoginPage() {
  const { login, isAuthenticated, user, loading } = useAuth();
  const { a11yMode } = useUi();

  const nav = useNavigate();
  const loc = useLocation();

  // ✅ FIX: Determine redirect route based on role
  const from = useMemo(() => {
    // If user just logged in and has a role, use role-based default
    if (isAuthenticated && user) {
      return getDefaultRoute(user);
    }

    // Otherwise, check if there's a "from" location stored
    const f = loc.state?.from;
    // Support either string "/app/..." or location object { pathname: "/app/..." }
    if (typeof f === "string") return f;
    if (f && typeof f === "object" && typeof f.pathname === "string") return f.pathname;
    
    // Fallback to dashboard
    return "/app";
  }, [isAuthenticated, user, loc.state]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPw, setShowPw] = useState(false);

  // lockout state (persisted, does NOT depend on error string)
  const [lockedUntilMs, setLockedUntilMs] = useState(null);
  const [nowMs, setNowMs] = useState(Date.now());

  const isLocked = Boolean(lockedUntilMs && lockedUntilMs > nowMs);
  const secondsLeft = isLocked ? Math.ceil((lockedUntilMs - nowMs) / 1000) : 0;

  useEffect(() => {
    if (isAuthenticated && user) {
      nav(from, { replace: true });
    }
  }, [isAuthenticated, user, nav, from]);

  // countdown ticker
  useEffect(() => {
    if (!isLocked) return;
    const t = setInterval(() => setNowMs(Date.now()), 500);
    return () => clearInterval(t);
  }, [isLocked]);

  async function handleSubmit(e) {
    e.preventDefault();

    // ✅ HARD BLOCK: never submit when locked
    if (isLocked) {
      setError(`Too many login attempts. Please wait ${formatSeconds(secondsLeft)}.`);
      return;
    }

    setError("");

    const res = await login(email, password);

    if (!res.ok) {
      const msg = String(res.error || "Login failed").trim();

      // treat as locked if status=429 OR message contains the lock text
      const looksLocked =
        res.status === 429 ||
        msg.toLowerCase().includes("too many login attempts") ||
        msg.toLowerCase().includes("try again in about");

      if (looksLocked) {
        // best: use backend locked_until if present
        const lockedUntilStr = res?.data?.locked_until;
        const minutesLeft = res?.data?.minutes_left;

        let until = null;
        if (lockedUntilStr) {
          const parsed = Date.parse(lockedUntilStr);
          if (!Number.isNaN(parsed)) until = parsed;
        }

        // fallback: lock for 10 minutes (or backend minutes_left)
        if (!until) {
          const mins = Number.isFinite(Number(minutesLeft)) ? Number(minutesLeft) : 10;
          until = Date.now() + mins * 60 * 1000;
        }

        setLockedUntilMs(until);
        setNowMs(Date.now());
        setError(msg || "Too many login attempts. Please try again later.");
        return;
      }

      setError(msg);
      return;
    }

    // success: clear lock state
    setLockedUntilMs(null);
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
                <h1 className="text-2xl font-semibold">
                  Cavite State University - Imus Campus
                </h1>
                <p className="mt-1 text-sm text-white/80">Login to continue.</p>
              </div>

              <form
                className="mt-7 space-y-5"
                onSubmit={handleSubmit}
                // ✅ also block Enter key submit when locked
                onKeyDown={(e) => {
                  if (e.key === "Enter" && isLocked) {
                    e.preventDefault();
                    setError(
                      `Too many login attempts. Please wait ${formatSeconds(secondsLeft)}.`
                    );
                  }
                }}
              >
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
                      className="w-full rounded-lg border border-white/25 bg-white/10 py-3 pl-12 pr-4 text-sm text-white placeholder:text-white/60 outline-none focus:border-white/40 focus:ring-2 focus:ring-emerald-400/50 transition"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      required
                      aria-label="Email address"
                      placeholder="you@cvsu.edu.ph"
                      disabled={loading}
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
                      className="w-full rounded-lg border border-white/25 bg-white/10 py-3 pl-12 pr-12 text-sm text-white placeholder:text-white/60 outline-none focus:border-white/40 focus:ring-2 focus:ring-emerald-400/50 transition"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                      required
                      aria-label="Password"
                      placeholder="••••••••"
                      disabled={loading}
                    />

                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 flex items-center justify-center px-4 text-white/80 hover:text-white disabled:opacity-60"
                      aria-label="Hold to show password"
                      title="Hold to show password"
                      disabled={loading}
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

                {/* LOCK BANNER */}
                {lockedUntilMs && isLocked ? (
                  <div
                    className="rounded-lg border border-yellow-300/40 bg-yellow-500/20 px-4 py-3 text-sm text-white"
                    role="alert"
                    aria-live="polite"
                  >
                    Too many login attempts. Please wait{" "}
                    <b>{formatSeconds(secondsLeft)}</b> before trying again.
                  </div>
                ) : null}

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
                  type="submit"
                  className={[
                    "w-full rounded-lg bg-gradient-to-r from-emerald-500 to-green-700 px-4 py-3 text-sm font-semibold text-white shadow-lg hover:from-emerald-400 hover:to-green-600 disabled:opacity-60 transition",
                    isLocked ? "pointer-events-none cursor-not-allowed" : ""
                  ].join(" ")}
                  disabled={loading || isLocked}
                  aria-label="Sign in"
                  title={isLocked ? `Locked. Try again in ${formatSeconds(secondsLeft)}.` : undefined}
                >
                  {loading
                    ? "Signing in…"
                    : isLocked
                      ? `Locked (${formatSeconds(secondsLeft)})`
                      : "Sign in"}
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
