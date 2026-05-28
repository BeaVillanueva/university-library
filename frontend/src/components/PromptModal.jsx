import React, { useEffect, useState } from "react";

export default function PromptModal({
  open,
  title,
  message,
  label,
  placeholder = "",
  defaultValue = "",
  inputMode,
  confirmText = "Continue",
  cancelText = "Cancel",
  tone = "primary",
  loading = false,
  onConfirm,
  onCancel,
}) {
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    if (open) setValue(defaultValue);
  }, [defaultValue, open]);

  if (!open) return null;

  const confirmClass =
    tone === "danger"
      ? "bg-red-600 hover:bg-red-700 focus-visible:ring-red-300"
      : "bg-emerald-600 hover:bg-emerald-700 focus-visible:ring-emerald-300";

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-black/60 p-4">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-5 text-slate-900 shadow-2xl dark:border-slate-700 dark:bg-slate-900 dark:text-white">
        <div className="text-lg font-semibold">{title}</div>
        {message ? (
          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
            {message}
          </p>
        ) : null}
        <label className="mt-4 block text-sm font-medium">
          {label}
          <input
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none focus:ring-2 focus:ring-emerald-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={placeholder}
            inputMode={inputMode}
            autoFocus
          />
        </label>
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
            onClick={onCancel}
            disabled={loading}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className={`rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-60 focus:outline-none focus-visible:ring-2 ${confirmClass}`}
            onClick={() => onConfirm?.(value)}
            disabled={loading}
          >
            {loading ? "Working..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
