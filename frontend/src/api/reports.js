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

export async function apiReportsDistribution() {
  const res = await http.get("/reports/distribution");
  return res.data;
}

export async function apiReportsWeeklyBorrows() {
  const res = await http.get("/reports/weekly-borrows");
  return res.data;
}

export async function apiReportsMyWeeklyBorrows() {
  const res = await http.get("/reports/my-weekly-borrows");
  return res.data;
}

export async function apiReportsStudentStats() {
  const res = await http.get("/reports/student-stats");
  return res.data;
}

// Download CSV export (uses Authorization header)
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