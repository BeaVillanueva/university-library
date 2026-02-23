import { http } from "./http";

export async function apiListBooks(params) {
  const res = await http.get("/books", { params });
  return res.data;
}

export async function apiGetBook(id) {
  const res = await http.get(`/books/${id}`);
  return res.data;
}

export async function apiUpdateBook(id, patch) {
  const res = await http.patch(`/books/${id}`, patch);
  return res.data;
}