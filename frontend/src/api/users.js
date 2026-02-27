import { http } from "./http";

export async function apiListUsers(params) {
  const res = await http.get("/users", { params });
  return res.data;
}

export async function apiCreateUser(payload) {
  const res = await http.post("/users", payload);
  return res.data;
}

export async function apiUpdateUser(id, patch) {
  const res = await http.patch(`/users/${id}`, patch);
  return res.data;
}

export async function apiDeleteUser(id) {
  const res = await http.delete(`/users/${id}`);
  return res.data;
}

/** NEW: list pending student registrations (admin only) */
export async function apiListPendingStudents() {
  const res = await http.get("/users/pending");
  return res.data;
}

/** NEW: approve a user (admin only) */
export async function apiApproveUser(id) {
  const res = await http.post(`/users/${id}/approve`, {});
  return res.data;
}

export async function apiDeclineUser(id, reason) {
  const res = await http.post(`/users/${id}/decline`, { reason: reason || "" });
  return res.data;
}