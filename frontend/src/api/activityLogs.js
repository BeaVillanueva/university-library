import { http } from "./http";

export async function apiListActivityLogs(params) {
  const res = await http.get("/activity-logs", { params });
  return res.data;
}