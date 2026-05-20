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

export async function apiAddBookStock(bookId, qty) {
  const res = await http.post(`/books/${bookId}/stock`, { qty });
  return res.data;
}

// ✅ NEW: Upload book cover
export async function apiUploadBookCover(bookId, file) {
  const formData = new FormData();
  formData.append("cover", file);
  const res = await http.post(`/books/${bookId}/cover`, formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return res.data;
}

export async function apiCreateBook(data) {
  const res = await http.post("/books", data);
  return res.data;
}