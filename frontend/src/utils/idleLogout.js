// File: src/utils/idleLogout.js
const IDLE_MS = 5 * 60 * 1000; // 5 minutes
let timer = null;

function logoutNow() {
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
  // start immediately
  resetTimer();

  const events = ["mousemove", "mousedown", "keydown", "scroll", "touchstart"];
  events.forEach((evt) => window.addEventListener(evt, resetTimer, { passive: true }));

  return () => {
    if (timer) clearTimeout(timer);
    events.forEach((evt) => window.removeEventListener(evt, resetTimer));
  };
}