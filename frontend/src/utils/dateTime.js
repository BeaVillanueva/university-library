export const PH_TIME_ZONE = "Asia/Manila";

export function formatDate(value, fallback = "-") {
  if (!value) return fallback;
  return String(value).slice(0, 10);
}

export function formatDateTime(value, fallback = "-") {
  if (!value) return fallback;
  const str = String(value).trim();
  const match = str.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})/);
  if (!match) return str;

  const [, year, month, day, hour, minute] = match;
  const dateLabel = new Intl.DateTimeFormat("en-PH", {
    timeZone: PH_TIME_ZONE,
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(new Date(Number(year), Number(month) - 1, Number(day)));

  return `${dateLabel}, ${formatTime(`${hour}:${minute}`, "")}`;
}

export function formatTime(value, fallback = "-") {
  if (!value) return fallback;
  const str = String(value).trim();
  const timePart = str.includes(" ") ? str.split(" ")[1] : str.split("T")[1] || str;
  const hhmm = timePart ? timePart.slice(0, 5) : "";
  if (!hhmm || !hhmm.includes(":")) return fallback;

  let [hh, mm] = hhmm.split(":").map((x) => parseInt(x, 10));
  if (Number.isNaN(hh) || Number.isNaN(mm)) return fallback;

  const ampm = hh >= 12 ? "PM" : "AM";
  hh = hh % 12 || 12;

  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")} ${ampm}`;
}

export function daysUntil(dateValue) {
  if (!dateValue) return null;
  const [year, month, day] = String(dateValue).slice(0, 10).split("-").map(Number);
  if (!year || !month || !day) return null;

  const due = new Date(year, month - 1, day);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  return Math.ceil((due.getTime() - today.getTime()) / 86400000);
}

export function daysLate(dateValue) {
  const days = daysUntil(dateValue);
  return days !== null && days < 0 ? Math.abs(days) : 0;
}
