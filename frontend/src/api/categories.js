import { http } from "./http";

export async function apiListCategories() {
  const res = await http.get("/categories");
  return res.data;
}

export async function apiCreateCategory(name) {
  const res = await http.post("/categories", { name });
  return res.data;
}

export async function apiUpdateCategory(id, name) {
  const res = await http.patch(`/categories/${id}`, { name });
  return res.data;
}

export async function apiDeleteCategory(id) {
  const res = await http.delete(`/categories/${id}`);
  return res.data;
}