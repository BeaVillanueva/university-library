import React, { useEffect } from "react";
import { announcePageLoad } from "../hooks/useVoiceGuide";
import AccessibilitySettingsPanel from "../components/AccessibilitySettingsPanel";

export default function SettingsPage() {
  // ✅ Announce page load
  useEffect(() => {
    announcePageLoad("SETTINGS");
  }, []);

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold text-slate-900">Settings</h1>
        <p className="mt-2 text-sm text-slate-600 a11y-muted">
          Manage your account preferences and accessibility settings.
        </p>
      </div>

      {/* ✅ Accessibility (PWD) settings */}
      <div className="mt-6">
        <AccessibilitySettingsPanel />
      </div>

    </div>
  );
}
