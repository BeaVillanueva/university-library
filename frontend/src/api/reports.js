import { http } from "./http";

export async function apiReportsSummary() {
  const res = await http.get("/reports/summary");
  return res.data;
}

export async function apiReportsMySummary() {
  const res = await http.get("/reports/my-summary");
  return res.data;
}

export async function apiReportList(params) {
  const res = await http.get("/reports", { params });
  return res.data;
}

// For export, easiest is open a new tab with the URL including token? But token is header.
// We'll download using fetch with Authorization and create a blob.
export async function apiExportReportCsv(params, token) {
  const url = new URL(http.defaults.baseURL + "/reports/export");
  Object.entries(params || {}).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, v);
  });

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(txt || "Export failed");
  }

  const blob = await res.blob();
  return blob;
}