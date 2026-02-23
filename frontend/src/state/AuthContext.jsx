import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiLogin, apiMe } from "../api/auth";

const AuthContext = createContext(null);

const LS_TOKEN = "ulms_token";
const LS_USER = "ulms_user";

function safeJsonParse(raw, fallback = null) {
  if (raw === null || raw === undefined) return fallback;
  if (raw === "" || raw === "undefined" || raw === "null") return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function safeSetItem(key, value) {
  // Prevent writing "undefined" into localStorage
  if (value === undefined) {
    localStorage.removeItem(key);
    return;
  }
  if (value === null) {
    localStorage.removeItem(key);
    return;
  }
  localStorage.setItem(key, value);
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    const t = localStorage.getItem(LS_TOKEN);
    if (t === "undefined" || t === "null") return "";
    return t || "";
  });

  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem(LS_USER);
    return safeJsonParse(raw, null);
  });

  const [loading, setLoading] = useState(false);

  // If token exists but user missing (or stale), fetch /auth/me
  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      if (!token) return;
      if (user) return;

      try {
        setLoading(true);
        const res = await apiMe();
        if (!cancelled) {
          const nextUser = res?.user ?? null;
          setUser(nextUser);
          if (nextUser) {
            safeSetItem(LS_USER, JSON.stringify(nextUser));
          } else {
            localStorage.removeItem(LS_USER);
          }
        }
      } catch (e) {
        if (!cancelled) {
          // token likely invalid
          logout();
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    hydrate();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function login(email, password) {
    setLoading(true);
    try {
      const res = await apiLogin(email, password);

      const nextToken = res?.token || "";
      const nextUser = res?.user ?? null;

      setToken(nextToken);
      setUser(nextUser);

      if (nextToken) safeSetItem(LS_TOKEN, nextToken);
      else localStorage.removeItem(LS_TOKEN);

      if (nextUser) safeSetItem(LS_USER, JSON.stringify(nextUser));
      else localStorage.removeItem(LS_USER);

      return { ok: true };
    } catch (e) {
      const msg = e?.response?.data?.error || e?.message || "Login failed";
      return { ok: false, error: msg };
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    setToken("");
    setUser(null);
    localStorage.removeItem(LS_TOKEN);
    localStorage.removeItem(LS_USER);
  }

  const value = useMemo(
    () => ({
      token,
      user,
      loading,
      isAuthenticated: Boolean(token),
      login,
      logout
    }),
    [token, user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}