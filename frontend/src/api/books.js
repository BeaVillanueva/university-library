import { http } from "./http";

// ...existing exports like apiListBooks...

export async function apiAddBookStock(bookId, qty) {
  const res = await http.post(`/books/${bookId}/stock`, { qty });
  return res.data;
}

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