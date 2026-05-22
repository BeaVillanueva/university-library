import React, { useEffect, useMemo, useState } from "react";
import {
  DEFAULT_A11Y,
  applyA11yPrefs,
  loadA11yPrefs,
  saveA11yPrefs
} from "../state/a11yPrefs";
import { useAuth } from "../state/AuthContext";
import { voiceReaderService } from "../services/VoiceReaderService";
import { FiVolume2 } from "react-icons/fi";

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

function clampFontSize(current, dir) {
  const order = ["sm", "md", "lg", "xl"];
  const idx = order.indexOf(current);
  const n = Math.max(0, Math.min(order.length - 1, idx + dir));
  return order[n];
}

function getUserKeyFromAuth(auth) {
  const u = auth?.user ?? auth?.currentUser ?? auth?.authUser ?? null;
  return (
    u?.email ||
    u?.username ||
    u?.id ||
    u?.user_id ||
    u?.name ||
    auth?.role ||
    "guest"
  );
}

function isLoggedInFromAuth(auth) {
  return Boolean(auth?.token || auth?.user || auth?.currentUser || auth?.authUser);
}

export default function AccessibilitySettingsPanel() {
  const auth = useAuth();

  const userKey = useMemo(() => getUserKeyFromAuth(auth), [auth]);
  const isLoggedIn = useMemo(() => isLoggedInFromAuth(auth), [auth]);

  const [prefs, setPrefs] = useState(() =>
    isLoggedIn ? loadA11yPrefs(userKey) : DEFAULT_A11Y
  );

  useEffect(() => {
    applyA11yPrefs(prefs);
    if (isLoggedIn) saveA11yPrefs(prefs, userKey);
  }, [prefs, userKey, isLoggedIn]);

  useEffect(() => {
    const next = isLoggedIn ? loadA11yPrefs(userKey) : DEFAULT_A11Y;
    setPrefs(next);
    applyA11yPrefs(next);
  }, [userKey, isLoggedIn]);

  const isDefault = useMemo(
    () => JSON.stringify(prefs) === JSON.stringify(DEFAULT_A11Y),
    [prefs]
  );

  // ✅ IMPROVED: Use service for voice reader toggle
  const handleVoiceReaderToggle = () => {
    const newValue = !prefs.voiceReader;
    
    if (newValue) {
      // Temporarily enable to announce
      voiceReaderService.setEnabled(true);
      voiceReaderService.speak(
        'Voice reader enabled. The system will now read announcements.'
      );
    } else {
      // Announce before disabling
      voiceReaderService.speak('Voice reader disabled.');
      // Then disable after announcement
      setTimeout(() => {
        voiceReaderService.setEnabled(false);
      }, 500);
    }
    
    setPrefs((p) => ({ ...p, voiceReader: newValue }));
  };

  // ✅ Use service for theme change announcement
  const handleThemeChange = (theme) => {
    setPrefs((p) => ({ ...p, theme }));
    voiceReaderService.speak(`Theme changed to ${theme}.`);
  };

  // ✅ Use service for contrast change announcement
  const handleContrastChange = () => {
    const newValue = prefs.contrast === "high" ? "normal" : "high";
    setPrefs((p) => ({ ...p, contrast: newValue }));
    voiceReaderService.speak(
      newValue === "high" ? "High contrast enabled." : "High contrast disabled."
    );
  };

  // ✅ Use service for font size change announcement
  const handleFontSizeDecrease = () => {
    const newSize = clampFontSize(prefs.fontSize, -1);
    setPrefs((p) => ({ ...p, fontSize: newSize }));
    voiceReaderService.speak(`Font size changed to ${newSize.toUpperCase()}.`);
  };

  const handleFontSizeIncrease = () => {
    const newSize = clampFontSize(prefs.fontSize, +1);
    setPrefs((p) => ({ ...p, fontSize: newSize }));
    voiceReaderService.speak(`Font size changed to ${newSize.toUpperCase()}.`);
  };

  // ✅ Use service for reduce motion announcement
  const handleReduceMotion = () => {
    const newValue = !prefs.reduceMotion;
    setPrefs((p) => ({ ...p, reduceMotion: newValue }));
    voiceReaderService.speak(
      newValue ? "Reduce motion enabled." : "Reduce motion disabled."
    );
  };

  // ✅ Use service for dyslexia font announcement
  const handleDyslexiaFont = () => {
    const newValue = !prefs.dyslexiaFont;
    setPrefs((p) => ({ ...p, dyslexiaFont: newValue }));
    voiceReaderService.speak(
      newValue ? "Dyslexia friendly font enabled." : "Dyslexia friendly font disabled."
    );
  };

  return (
    <section
      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm a11y-surface a11y-outline"
      aria-labelledby="a11y-settings-title"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 id="a11y-settings-title" className="text-lg font-semibold text-slate-900">
            Accessibility (PWD)
          </h2>
          <p className="mt-1 text-sm text-slate-600 a11y-muted">
            Adjust fonts, colors, contrast, and motion. Saved on this device.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setPrefs(DEFAULT_A11Y)}
          disabled={isDefault}
          className={cx(
            "rounded-xl px-3 py-2 text-sm font-semibold border",
            "border-slate-200 bg-white hover:bg-slate-50 a11y-surface a11y-outline",
            "disabled:opacity-60 disabled:cursor-not-allowed",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
          )}
          aria-label="Reset accessibility preferences to default"
        >
          Reset
        </button>
      </div>

      <div className="mt-4 grid gap-4">
        {/* Theme */}
        <div className="rounded-xl border border-slate-200 p-3 a11y-outline">
          <div className="text-sm font-semibold text-slate-900">Background / Theme</div>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {["system", "light", "dark"].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => handleThemeChange(t)}
                className={cx(
                  "rounded-lg px-3 py-2 text-sm font-medium border transition",
                  prefs.theme === t
                    ? "border-emerald-500 bg-emerald-500/10"
                    : "border-slate-200 bg-white hover:bg-slate-50",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                )}
                aria-pressed={prefs.theme === t}
                aria-label={`Set theme to ${t}`}
              >
                {t === "system" ? "System" : t === "light" ? "Light" : "Dark"}
              </button>
            ))}
          </div>
        </div>

        {/* High contrast */}
        <div className="rounded-xl border border-slate-200 p-3 a11y-outline flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-slate-900">High contrast</div>
            <div className="text-xs text-slate-600 a11y-muted">
              Improves readability with stronger contrast.
            </div>
          </div>

          <button
            type="button"
            onClick={handleContrastChange}
            className={cx(
              "relative inline-flex h-9 w-14 items-center rounded-full border transition",
              prefs.contrast === "high"
                ? "bg-emerald-600 border-emerald-600"
                : "bg-slate-200 border-slate-200",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
            )}
            role="switch"
            aria-checked={prefs.contrast === "high"}
            aria-label="Toggle high contrast"
          >
            <span
              className={cx(
                "inline-block h-7 w-7 transform rounded-full bg-white shadow transition",
                prefs.contrast === "high" ? "translate-x-6" : "translate-x-1"
              )}
            />
          </button>
        </div>

        {/* Font size */}
        <div className="rounded-xl border border-slate-200 p-3 a11y-outline flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-slate-900">Font size</div>
            <div className="text-xs text-slate-600 a11y-muted">
              Increase/decrease text size.
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleFontSizeDecrease}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 a11y-outline"
              aria-label="Decrease font size"
            >
              A−
            </button>

            <span className="min-w-10 text-center text-sm font-semibold text-slate-900">
              {String(prefs.fontSize).toUpperCase()}
            </span>

            <button
              type="button"
              onClick={handleFontSizeIncrease}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 a11y-outline"
              aria-label="Increase font size"
            >
              A+
            </button>
          </div>
        </div>

        {/* Reduce motion */}
        <div className="rounded-xl border border-slate-200 p-3 a11y-outline flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-slate-900">Reduce motion</div>
            <div className="text-xs text-slate-600 a11y-muted">
              Minimizes animations and transitions.
            </div>
          </div>

          <button
            type="button"
            onClick={handleReduceMotion}
            className={cx(
              "relative inline-flex h-9 w-14 items-center rounded-full border transition",
              prefs.reduceMotion
                ? "bg-emerald-600 border-emerald-600"
                : "bg-slate-200 border-slate-200",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
            )}
            role="switch"
            aria-checked={prefs.reduceMotion}
            aria-label="Toggle reduce motion"
          >
            <span
              className={cx(
                "inline-block h-7 w-7 transform rounded-full bg-white shadow transition",
                prefs.reduceMotion ? "translate-x-6" : "translate-x-1"
              )}
            />
          </button>
        </div>

        {/* Dyslexia font */}
        <div className="rounded-xl border border-slate-200 p-3 a11y-outline flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-slate-900">Dyslexia-friendly font</div>
            <div className="text-xs text-slate-600 a11y-muted">
              Switch to a more readable font style.
            </div>
          </div>

          <button
            type="button"
            onClick={handleDyslexiaFont}
            className={cx(
              "relative inline-flex h-9 w-14 items-center rounded-full border transition",
              prefs.dyslexiaFont
                ? "bg-emerald-600 border-emerald-600"
                : "bg-slate-200 border-slate-200",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
            )}
            role="switch"
            aria-checked={prefs.dyslexiaFont}
            aria-label="Toggle dyslexia-friendly font"
          >
            <span
              className={cx(
                "inline-block h-7 w-7 transform rounded-full bg-white shadow transition",
                prefs.dyslexiaFont ? "translate-x-6" : "translate-x-1"
              )}
            />
          </button>
        </div>

        {/* ✅ Voice Reader */}
        <div className="rounded-xl border border-slate-200 p-3 a11y-outline flex items-center justify-between gap-3 bg-gradient-to-r from-blue-50 to-transparent">
          <div className="flex items-start gap-3">
            <FiVolume2 className="mt-1 text-blue-600 flex-shrink-0" size={20} aria-hidden="true" />
            <div>
              <div className="text-sm font-semibold text-slate-900">Voice Reader</div>
              <div className="text-xs text-slate-600 a11y-muted">
                The voice reader accurately announces the selected dashboard or feature.
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleVoiceReaderToggle}
            className={cx(
              "relative inline-flex h-9 w-14 items-center rounded-full border transition flex-shrink-0",
              prefs.voiceReader
                ? "bg-emerald-600 border-emerald-600"
                : "bg-slate-200 border-slate-200",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
            )}
            role="switch"
            aria-checked={prefs.voiceReader}
            aria-label="Toggle voice reader"
          >
            <span
              className={cx(
                "inline-block h-7 w-7 transform rounded-full bg-white shadow transition",
                prefs.voiceReader ? "translate-x-6" : "translate-x-1"
              )}
            />
          </button>
        </div>
      </div>
    </section>
  );
}
