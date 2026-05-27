import { http } from "./http";

export async function apiLogin(email, password) {
  const res = await http.post("/auth/login", { email, password });
  return res.data;
}

export async function apiMe() {
  const res = await http.get("/auth/me");
  return res.data;
}

export async function apiRegisterStudent(payload) {
  const res = await http.post("/auth/register", payload);
  return res.data;
}

export async function apiRequestRegistrationOtp(payload) {
  const res = await http.post("/auth/register/request-otp", payload);
  return res.data;
}

export async function apiForgotPassword(email) {
  const res = await http.post("/auth/forgot-password", { email });
  return res.data;
}

export async function apiResetPassword(payload) {
  const res = await http.post("/auth/reset-password", payload);
  return res.data;
}
