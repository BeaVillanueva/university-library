import { voiceReaderService } from '../services/VoiceReaderService';

export const DEFAULT_A11Y = {
  theme: "system", // system | light | dark
  contrast: "normal", // normal | high
  fontSize: "md", // sm | md | lg | xl
  reduceMotion: false,
  dyslexiaFont: false,
  voiceReader: false // ✅ Voice Reader feature
};

// NOTE: per-user key: ulms_a11y_prefs_v1::<userKey>
const BASE_KEY = "ulms_a11y_prefs_v1";

function normalizeUserKey(userKey) {
  const k = String(userKey || "guest").trim();
  return k ? k.toLowerCase() : "guest";
}

export function makeA11yStorageKey(userKey) {
  return `${BASE_KEY}::${normalizeUserKey(userKey)}`;
}

export function loadA11yPrefs(userKey) {
  try {
    const raw = localStorage.getItem(makeA11yStorageKey(userKey));
    if (!raw) return DEFAULT_A11Y;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_A11Y, ...(parsed || {}) };
  } catch {
    return DEFAULT_A11Y;
  }
}

export function saveA11yPrefs(prefs, userKey) {
  localStorage.setItem(makeA11yStorageKey(userKey), JSON.stringify(prefs));
}

function systemPrefersDark() {
  return window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ?? false;
}

export function applyA11yPrefs(prefs) {
  const root = document.documentElement;

  const wantsDark =
    prefs.theme === "dark" || (prefs.theme === "system" && systemPrefersDark());
  root.classList.toggle("dark", wantsDark);

  root.classList.toggle("hc", prefs.contrast === "high");

  const sizeMap = { sm: "14px", md: "16px", lg: "18px", xl: "20px" };
  root.style.setProperty("--app-font-size", sizeMap[prefs.fontSize] || "16px");

  root.classList.toggle("reduce-motion", Boolean(prefs.reduceMotion));
  root.classList.toggle("dyslexia-font", Boolean(prefs.dyslexiaFont));
  
  // ✅ IMPROVED: Sync with service AND global flag
  const voiceEnabled = Boolean(prefs.voiceReader);
  window.__voiceReaderEnabled = voiceEnabled;
  voiceReaderService.setEnabled(voiceEnabled);
}

export function resetA11yPrefs() {
  applyA11yPrefs(DEFAULT_A11Y);
}
