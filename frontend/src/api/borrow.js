import { http } from "./http";

export async function apiBorrowBook(bookId) {
  const res = await http.post("/borrow", { book_id: bookId });
  return res.data;
}

export async function apiMyBorrowHistory(params) {
  const res = await http.get("/borrow/my", { params });
  return res.data;
}

export async function apiListAllBorrows(params) {
  const res = await http.get("/borrow/all", { params });
  return res.data;
}

export async function apiReturnBorrow(recordId) {
  const res = await http.post(`/borrow/${recordId}/return`);
  return res.data;
}