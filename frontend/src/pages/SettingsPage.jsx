import React, { useMemo, useState } from "react";
import Alert from "../components/Alert";
import AccessibilitySettingsPanel from "../components/AccessibilitySettingsPanel";
import { setApiBaseUrl, http } from "../api/http";
import { useAuth } from "../state/AuthContext";

const LS_API_BASE = "ulms_api_base_url";

export default function SettingsPage() {
  const { logout } = useAuth();

  const current = useMemo(() => {
    return localStorage.getItem(LS_API_BASE) || http.defaults.baseURL;
  }, []);

  const [apiBaseUrl, setApiBaseUrlState] = useState(current);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  function save() {
    setNotice("");
    setError("");

    const v = apiBaseUrl.trim();
    if (!v.startsWith("http")) {
      setError("API Base URL must start with http:// or https://");
      return;
    }

    setApiBaseUrl(v);
    // Also update axios instance in-memory for this session
    http.defaults.baseURL = v;
    setNotice("Saved API Base URL. If you experience issues, log out and back in.");
  }

  function reset() {
    setNotice("");
    setError("");
    setApiBaseUrlState("http://localhost/university-library/backend/public");
    setApiBaseUrl("http://localhost/university-library/backend/public");
    http.defaults.baseURL = "http://localhost/university-library/backend/public";
    setNotice("Reset to default.");
  }

  function clearAuth() {
    logout();
    setNotice("Token cleared. Please log in again.");
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold">Settings</h1>
      <p className="mt-1 text-sm text-slate-600 a11y-muted">
        Configure API connection and troubleshoot authentication.
      </p>

      {notice ? (
        <div className="mt-4">
          <Alert type="success">{notice}</Alert>
        </div>
      ) : null}
      {error ? (
        <div className="mt-4">
          <Alert type="error">{error}</Alert>
        </div>
      ) : null}

      {/* ✅ NEW: Accessibility (PWD) settings */}
      <div className="mt-4">
        <AccessibilitySettingsPanel />
      </div>

      {/* Existing API Base URL settings */}
      <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 a11y-surface a11y-outline">
        <div className="text-sm font-semibold">API Base URL</div>
        <div className="mt-2 text-xs text-slate-500 a11y-muted">
          Current: <span className="font-mono">{http.defaults.baseURL}</span>
        </div>

        <label className="mt-3 block text-sm font-medium">Set API Base URL</label>
        <input
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm a11y-input a11y-outline"
          value={apiBaseUrl}
          onChange={(e) => setApiBaseUrlState(e.target.value)}
          placeholder="http://localhost/university-library/backend/public"
          aria-label="API Base URL"
        />

        <div className="mt-3 flex flex-wrap gap-2">
          <button
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            onClick={save}
            type="button"
            aria-label="Save API Base URL"
          >
            Save
          </button>
          <button
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50 a11y-surface a11y-outline"
            onClick={reset}
            type="button"
            aria-label="Reset API Base URL"
          >
            Reset
          </button>
          <button
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50 a11y-surface a11y-outline"
            onClick={clearAuth}
            type="button"
            aria-label="Clear saved login token"
          >
            Clear token
          </button>
        </div>

        <div className="mt-3 text-xs text-slate-500 a11y-muted">
          Tip: If you change backend path/port, update this value. CORS must allow your frontend origin.
        </div>
      </div>
    </div>
  );
}