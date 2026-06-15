import { http } from "./http";

/** Student/Admin/Librarian: create borrow (student => pending) */
export async function apiBorrowBook(bookId) {
  const res = await http.post("/borrow", { book_id: bookId });
  return res.data;
}

/** Student: my borrow history */
export async function apiMyBorrowHistory(params) {
  const res = await http.get("/borrow/my", { params });
  return res.data;
}

/** Librarian/Admin: list all borrow records (can filter by status) */
export async function apiListAllBorrows(params) {
  const res = await http.get("/borrow/all", { params });
  return res.data;
}

/** Librarian/Admin: approve a pending borrow request */
export async function apiApproveBorrow(recordId) {
  const res = await http.post(`/borrow/${recordId}/approve`, {});
  return res.data;
}

/** Librarian/Admin: decline a pending borrow request */
export async function apiDeclineBorrow(recordId, reason = "") {
  const res = await http.post(`/borrow/${recordId}/decline`, { reason });
  return res.data;
}

/** Librarian/Admin (or owner-student): return a borrowed book */
export async function apiReturnBorrow(recordId) {
  const res = await http.post(`/borrow/${recordId}/return`, {});
  return res.data;
}

/** Student: cancel a pending borrow request */
export async function apiCancelBorrow(recordId) {
  const res = await http.post(`/borrow/${recordId}/cancel`, {});
  return res.data;
}
