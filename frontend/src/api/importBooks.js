import { http } from "./http";

export async function apiPreviewBooksCsv(file) {
  const form = new FormData();
  form.append("file", file);
  const res = await http.post("/import/books/preview", form, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return res.data;
}

export async function apiCommitBooksImport(rows) {
  const res = await http.post("/import/books/commit", { rows });
  return res.data;
}