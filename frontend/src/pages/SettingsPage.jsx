import React from "react";
import AccessibilitySettingsPanel from "../components/AccessibilitySettingsPanel";

export default function SettingsPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold">Settings</h1>
      <p className="mt-1 text-sm text-slate-600 a11y-muted">
        Manage your accessibility preferences.
      </p>

      {/* ✅ Accessibility (PWD) settings */}
      <div className="mt-4">
        <AccessibilitySettingsPanel />
      </div>
    </div>
  );
}