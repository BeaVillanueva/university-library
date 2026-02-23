import { http } from "./http";

export async function apiLogin(email, password) {
  const res = await http.post("/auth/login", { email, password });
  return res.data;
}

export async function apiMe() {
  const res = await http.get("/auth/me");
  return res.data;
}