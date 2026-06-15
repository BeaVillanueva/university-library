import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import { FaUniversalAccess } from "react-icons/fa";
import {
  DEFAULT_A11Y,
  applyA11yPrefs,
  loadA11yPrefs,
  saveA11yPrefs
} from "../state/a11yPrefs";

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

function clampFontSize(current, dir) {
  const order = ["sm", "md", "lg", "xl"];
  const idx = order.indexOf(current);
  const n = Math.max(0, Math.min(order.length - 1, idx + dir));
  return order[n];
}

export default function A11ySettingsButton({ className = "" }) {
  const titleId = useId();
  const descId = useId();

  const [open, setOpen] = useState(false);
  const [prefs, setPrefs] = useState(() => loadA11yPrefs());

  const btnRef = useRef(null);
  const panelRef = useRef(null);

  useEffect(() => {
    applyA11yPrefs(prefs);
    saveA11yPrefs(prefs);
  }, [prefs]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
        queueMicrotask(() => btnRef.current?.focus());
      }

      if (e.key === "Tab") {
        const el = panelRef.current;
        if (!el) return;

        const focusables = el.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusables.length) return;

        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const active = document.activeElement;

        if (e.shiftKey && active === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && active === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const el = panelRef.current;
    if (!el) return;
    const first = el.querySelector("button, input, [tabindex]:not([tabindex='-1'])");
    first?.focus();
  }, [open]);

  const isEnabled = useMemo(() => {
    return JSON.stringify(prefs) !== JSON.stringify(DEFAULT_A11Y);
  }, [prefs]);

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen(true)}
        className={cx(
          "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold",
          "bg-white text-slate-700 border-slate-200 shadow-sm hover:bg-slate-50",
          "focus:outline-none focus:ring-2 focus:ring-emerald-500/60 focus:ring-offset-2",
          "active:scale-[0.98] transition",
          "dark:bg-slate-900/70 dark:text-white dark:border-white/10 dark:hover:bg-slate-900",
          "reduce-motion:transition-none",
          isEnabled && "ring-1 ring-emerald-500/30",
          className
        )}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls="a11y-settings-dialog"
        aria-label="Open accessibility settings"
        title="Accessibility settings"
      >
        <FaUniversalAccess className="h-5 w-5" aria-hidden="true" />
        <span className="hidden sm:inline">A11y</span>
        <span className="text-xs font-medium opacity-80">{isEnabled ? "On" : "Off"}</span>
      </button>

      <div
        className={cx("fixed inset-0 z-50", open ? "pointer-events-auto" : "pointer-events-none")}
        aria-hidden={!open}
      >
        <div
          className={cx(
            "absolute inset-0 bg-black/40 backdrop-blur-[2px]",
            open ? "opacity-100" : "opacity-0",
            "transition-opacity duration-200",
            "reduce-motion:transition-none"
          )}
          onMouseDown={() => {
            setOpen(false);
            queueMicrotask(() => btnRef.current?.focus());
          }}
        />

        <div className="absolute inset-0 flex items-end sm:items-center justify-center p-3 sm:p-6">
          <div
            id="a11y-settings-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={descId}
            ref={panelRef}
            className={cx(
              "w-full sm:max-w-lg rounded-2xl border bg-white text-slate-900 shadow-2xl p-4 sm:p-5",
              "dark:bg-slate-950 dark:text-white dark:border-white/10",
              open ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
              "transition-all duration-200",
              "reduce-motion:transition-none"
            )}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id={titleId} className="text-lg font-semibold">
                  Accessibility settings
                </h2>
                <p id={descId} className="mt-1 text-sm text-slate-600 dark:text-white/70">
                  Changes are saved on this device. Press Esc to close.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  queueMicrotask(() => btnRef.current?.focus());
                }}
                className={cx(
                  "rounded-lg px-3 py-2 text-sm font-semibold",
                  "bg-slate-100 hover:bg-slate-200",
                  "dark:bg-white/10 dark:hover:bg-white/15",
                  "focus:outline-none focus:ring-2 focus:ring-emerald-500/60 focus:ring-offset-2",
                  "dark:focus:ring-offset-slate-950"
                )}
                aria-label="Close accessibility settings"
              >
                Close
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <section className="rounded-xl border border-slate-200 dark:border-white/10 p-3">
                <h3 className="text-sm font-semibold">Theme</h3>

                <div className="mt-2 grid grid-cols-3 gap-2">
                  {["system", "light", "dark"].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setPrefs((p) => ({ ...p, theme: t }))}
                      className={cx(
                        "rounded-lg px-3 py-2 text-sm font-medium border",
                        prefs.theme === t
                          ? "border-emerald-500 bg-emerald-500/10"
                          : "border-slate-200 bg-white hover:bg-slate-50",
                        "dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10",
                        "focus:outline-none focus:ring-2 focus:ring-emerald-500/60"
                      )}
                      aria-pressed={prefs.theme === t}
                    >
                      {t === "system" ? "System" : t === "light" ? "Light" : "Dark"}
                    </button>
                  ))}
                </div>

                <div className="mt-3 flex items-center justify-between gap-3">
                  <div className="text-sm">
                    <div className="font-medium">High contrast</div>
                    <div className="text-xs text-slate-600 dark:text-white/70">
                      Improves contrast for readability.
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setPrefs((p) => ({
                        ...p,
                        contrast: p.contrast === "high" ? "normal" : "high"
                      }))
                    }
                    className={cx(
                      "relative inline-flex h-9 w-14 items-center rounded-full border transition",
                      prefs.contrast === "high"
                        ? "bg-emerald-600 border-emerald-600"
                        : "bg-slate-200 border-slate-200",
                      "dark:border-white/10 dark:bg-white/10",
                      "focus:outline-none focus:ring-2 focus:ring-emerald-500/60"
                    )}
                    role="switch"
                    aria-checked={prefs.contrast === "high"}
                    aria-label="Toggle high contrast mode"
                  >
                    <span
                      className={cx(
                        "inline-block h-7 w-7 transform rounded-full bg-white shadow transition",
                        prefs.contrast === "high" ? "translate-x-6" : "translate-x-1"
                      )}
                    />
                  </button>
                </div>
              </section>

              <section className="rounded-xl border border-slate-200 dark:border-white/10 p-3">
                <h3 className="text-sm font-semibold">Text</h3>

                <div className="mt-2 flex items-center justify-between gap-3">
                  <div className="text-sm">
                    <div className="font-medium">Font size</div>
                    <div className="text-xs text-slate-600 dark:text-white/70">
                      Adjust overall interface font size.
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setPrefs((p) => ({ ...p, fontSize: clampFontSize(p.fontSize, -1) }))
                      }
                      className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-emerald-500/60"
                      aria-label="Decrease font size"
                    >
                      A−
                    </button>
                    <span className="min-w-10 text-center text-sm font-semibold">
                      {String(prefs.fontSize).toUpperCase()}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setPrefs((p) => ({ ...p, fontSize: clampFontSize(p.fontSize, +1) }))
                      }
                      className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-emerald-500/60"
                      aria-label="Increase font size"
                    >
                      A+
                    </button>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between gap-3">
                  <div className="text-sm">
                    <div className="font-medium">Dyslexia-friendly font</div>
                    <div className="text-xs text-slate-600 dark:text-white/70">
                      Switch to a more readable font style.
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setPrefs((p) => ({ ...p, dyslexiaFont: !p.dyslexiaFont }))}
                    className={cx(
                      "relative inline-flex h-9 w-14 items-center rounded-full border transition",
                      prefs.dyslexiaFont
                        ? "bg-emerald-600 border-emerald-600"
                        : "bg-slate-200 border-slate-200",
                      "dark:border-white/10 dark:bg-white/10",
                      "focus:outline-none focus:ring-2 focus:ring-emerald-500/60"
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
              </section>

              <section className="rounded-xl border border-slate-200 dark:border-white/10 p-3">
                <h3 className="text-sm font-semibold">Motion</h3>

                <div className="mt-2 flex items-center justify-between gap-3">
                  <div className="text-sm">
                    <div className="font-medium">Reduce motion</div>
                    <div className="text-xs text-slate-600 dark:text-white/70">
                      Minimizes animations and transitions.
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setPrefs((p) => ({ ...p, reduceMotion: !p.reduceMotion }))}
                    className={cx(
                      "relative inline-flex h-9 w-14 items-center rounded-full border transition",
                      prefs.reduceMotion
                        ? "bg-emerald-600 border-emerald-600"
                        : "bg-slate-200 border-slate-200",
                      "dark:border-white/10 dark:bg-white/10",
                      "focus:outline-none focus:ring-2 focus:ring-emerald-500/60"
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
              </section>

              <section className="rounded-xl border border-slate-200 dark:border-white/10 p-3">
                <h3 className="text-sm font-semibold">Help</h3>
                <ul className="mt-2 space-y-2 text-sm text-slate-700 dark:text-white/80">
                  <li>
                    <span className="font-semibold">Keyboard:</span> Tab to move, Enter to activate,
                    Esc to close.
                  </li>
                  <li>
                    <span className="font-semibold">Screen reader:</span> Proper ARIA labels and dialog
                    semantics are used.
                  </li>
                </ul>
              </section>

              <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
                <button
                  type="button"
                  onClick={() => setPrefs(DEFAULT_A11Y)}
                  className={cx(
                    "rounded-lg px-4 py-2 text-sm font-semibold",
                    "border border-slate-200 bg-white hover:bg-slate-50",
                    "dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10",
                    "focus:outline-none focus:ring-2 focus:ring-emerald-500/60"
                  )}
                  aria-label="Reset accessibility settings to default"
                >
                  Reset to default
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    queueMicrotask(() => btnRef.current?.focus());
                  }}
                  className={cx(
                    "rounded-lg px-4 py-2 text-sm font-semibold text-white",
                    "bg-emerald-600 hover:bg-emerald-500",
                    "focus:outline-none focus:ring-2 focus:ring-emerald-500/60 focus:ring-offset-2",
                    "dark:focus:ring-offset-slate-950"
                  )}
                  aria-label="Done"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}