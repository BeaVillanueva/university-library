import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { setApiBaseUrl } from "../api/http";

export default function ConfigPage() {
  const nav = useNavigate();
  const [apiUrl, setApiUrl] = useState("");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("ulms_api_base_url");
    if (stored) setApiUrl(stored);
  }, []);

  async function handleSave() {
    if (!apiUrl.trim()) {
      setError("Please enter an API URL");
      return;
    }

    if (!apiUrl.includes("/index.php")) {
      setError("URL should end with /index.php");
      return;
    }

    setLoading(true);
    setError("");
    
    // ✅ Test if backend is reachable
    try {
      const response = await fetch(apiUrl.replace("/index.php", "/health"), { 
        timeout: 5000,
        signal: AbortSignal.timeout(5000)
      });
      if (!response.ok) {
        setError("⚠️ Backend server not responding. Check your URL.");
        setLoading(false);
        return;
      }
    } catch (e) {
      setError("❌ Cannot reach backend. Is the server running?");
      console.error("Backend test failed:", e);
      setLoading(false);
      return;
    }

    setApiBaseUrl(apiUrl.trim());
    setSaved(true);
    setTimeout(() => nav("/login"), 1500);
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#0b1437] via-[#0f2b2a] to-[#1b5e20] flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-white/25 bg-white/15 backdrop-blur-xl p-6 shadow-2xl">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-white">⚙️ API Configuration</h1>
          <p className="text-sm text-white/80 mt-2">Configure your backend server URL</p>
        </div>

        {saved ? (
          <div className="rounded-lg bg-green-500/20 border border-green-300/40 p-4 text-center">
            <p className="text-green-100 font-semibold">✅ Configuration Saved!</p>
            <p className="text-xs text-green-100/70 mt-1">Redirecting to login...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Current URL Display */}
            <div className="rounded-lg bg-white/5 border border-white/10 p-3">
              <p className="text-xs text-white/60 mb-1">Current Configuration:</p>
              <p className="text-xs text-white/90 font-mono break-all">
                {apiUrl || "Not set (using default)"}
              </p>
            </div>

            {/* Input Field */}
            <div>
              <label className="text-xs text-white/90 font-semibold block mb-2">
                Backend API Base URL *
              </label>
              <input
                type="text"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                disabled={loading}
                placeholder="http://192.168.1.X/university-library/backend/public/index.php"
                className="w-full rounded-lg bg-white/10 border border-white/25 px-4 py-3 text-sm text-white placeholder:text-white/50 outline-none focus:border-white/40 focus:ring-2 focus:ring-emerald-400/50 disabled:opacity-50"
              />
              <p className="text-xs text-white/60 mt-2">
                💡 Replace X with your server's IP address
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="rounded-lg bg-red-500/20 border border-red-300/40 p-3">
                <p className="text-xs text-red-100">{error}</p>
              </div>
            )}

            {/* Examples */}
            <div>
              <p className="text-xs text-white/90 font-semibold block mb-2">📌 Examples:</p>
              <div className="text-xs text-white/70 space-y-1.5 bg-white/5 rounded p-3 border border-white/10">
                <div className="flex gap-2">
                  <span className="text-white/50">📱</span>
                  <span><strong>Mobile (same WiFi):</strong><br/><code className="text-white/60">http://192.168.1.10/university-library/backend/public/index.php</code></span>
                </div>
                <div className="flex gap-2">
                  <span className="text-white/50">🖥️</span>
                  <span><strong>Desktop (localhost):</strong><br/><code className="text-white/60">http://localhost/university-library/backend/public/index.php</code></span>
                </div>
                <div className="flex gap-2">
                  <span className="text-white/50">🌐</span>
                  <span><strong>Remote Server:</strong><br/><code className="text-white/60">http://your-domain.com/university-library/backend/public/index.php</code></span>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <button
              onClick={handleSave}
              disabled={loading}
              className="w-full rounded-lg bg-gradient-to-r from-emerald-500 to-green-700 px-4 py-3 text-sm font-semibold text-white hover:from-emerald-400 hover:to-green-600 transition shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "⏳ Testing connection..." : "💾 Save Configuration & Continue"}
            </button>

            {/* Reset Button */}
            <button
              onClick={() => {
                setApiBaseUrl(null);
                setApiUrl("");
                setError("");
              }}
              disabled={loading}
              className="w-full rounded-lg border border-white/25 bg-white/10 px-4 py-3 text-sm font-semibold text-white hover:bg-white/15 transition disabled:opacity-50"
            >
              🔄 Reset to Default
            </button>
          </div>
        )}

        {/* Skip Link */}
        <div className="mt-6 text-center">
          <button
            onClick={() => nav("/login")}
            disabled={loading}
            className="text-xs text-white/70 hover:text-white transition disabled:opacity-50"
          >
            → Skip & Go to Login
          </button>
        </div>

        {/* Help Footer */}
        <div className="mt-6 pt-4 border-t border-white/10">
          <p className="text-xs text-white/50 text-center">
            💡 <strong>Tip:</strong> Run <code className="text-white/70">ipconfig</code> (Windows) or <code className="text-white/70">ifconfig</code> (Mac/Linux) to find your server IP
          </p>
        </div>
      </div>
    </div>
  );
}