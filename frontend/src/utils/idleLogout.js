// File: src/utils/idleLogout.js
// Get timeout from environment variable, default to 30 minutes
const IDLE_MS = parseInt(import.meta.env.VITE_IDLE_TIMEOUT_MS || "180000", 10);
let timer = null;

function logoutNow() {
  console.log("[idleLogout] User inactive for 30+ minutes. Logging out...");
  localStorage.removeItem("ulms_token");
  localStorage.removeItem("ulms_user");
  if (!window.location.pathname.startsWith("/login")) {
    window.location.href = "/login";
  }
}

function resetTimer() {
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => {
    // logout only if logged in (token exists)
    const token = localStorage.getItem("ulms_token");
    if (token) logoutNow();
  }, IDLE_MS);
}

export function startIdleLogout() {
  console.log(`[idleLogout] Started. User will be logged out after ${IDLE_MS / 60000} minutes of inactivity.`);
  
  // start immediately
  resetTimer();

  const events = ["mousemove", "mousedown", "keydown", "scroll", "touchstart"];
  events.forEach((evt) => window.addEventListener(evt, resetTimer, { passive: true }));

  return () => {
    if (timer) clearTimeout(timer);
    events.forEach((evt) => window.removeEventListener(evt, resetTimer));
  };
}
