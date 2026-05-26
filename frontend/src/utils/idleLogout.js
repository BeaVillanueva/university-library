const IDLE_MS = parseInt(import.meta.env.VITE_IDLE_TIMEOUT_MS || "180000", 10);

let timer = null;

function logoutNow() {
  console.log("[idleLogout] User inactive. Logging out...");

  localStorage.removeItem("ulms_token");
  localStorage.removeItem("ulms_user");

  window.location.replace("/");
}

function resetTimer() {
  if (timer) clearTimeout(timer);

  timer = setTimeout(() => {
    const token = localStorage.getItem("ulms_token");
    if (token) logoutNow();
  }, IDLE_MS);
}

export function startIdleLogout() {
  console.log(
    `[idleLogout] Started. User will be logged out after ${IDLE_MS / 60000} minutes of inactivity.`
  );

  resetTimer();

  const events = ["mousemove", "mousedown", "keydown", "scroll", "touchstart"];

  events.forEach((evt) =>
    window.addEventListener(evt, resetTimer, { passive: true })
  );

  return () => {
    if (timer) clearTimeout(timer);

    events.forEach((evt) =>
      window.removeEventListener(evt, resetTimer)
    );
  };
}