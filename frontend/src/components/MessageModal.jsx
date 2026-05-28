import React from "react";

export default function MessageModal({
  open,
  title,
  message,
  confirmText = "OK",
  tone = "success",
  onClose,
}) {
  if (!open) return null;

  const buttonClass =
    tone === "danger" || tone === "error"
      ? "bg-red-600 hover:bg-red-700 focus-visible:ring-red-300"
      : "bg-emerald-600 hover:bg-emerald-700 focus-visible:ring-emerald-300";

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-black/60 p-4">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-5 text-slate-900 shadow-2xl dark:border-slate-700 dark:bg-slate-900 dark:text-white">
        <div className="text-lg font-semibold">{title}</div>
        <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
          {message}
        </p>
        <div className="mt-5 flex justify-end">
          <button
            type="button"
            className={`rounded-lg px-4 py-2 text-sm font-semibold text-white focus:outline-none focus-visible:ring-2 ${buttonClass}`}
            onClick={onClose}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
