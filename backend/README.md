# University Library Backend (PHP 8 + MySQL)

Base URL (example):
- `http://localhost/university-library/backend/public`

## Auth
- `POST /auth/login` JSON `{ "email": "...", "password": "..." }`
- `GET /auth/me` (Bearer token)

## Categories
- `GET /categories` (auth)
- `POST /categories` (admin) JSON `{ "name": "..." }`
- `PATCH /categories/{id}` (admin)
- `DELETE /categories/{id}` (admin)

## Books
- `GET /books?page=1&limit=10&q=&category_id=&availability=available|unavailable` (auth)
- `GET /books/{id}` (auth)
- `PATCH /books/{id}` (admin/librarian)

> Manual add-book is intentionally NOT implemented. Books come from CSV import.

## Import (Books via CSV) - REQUIRED
- `POST /import/books/preview` (admin/librarian) multipart form-data: `file=@books.csv`
- `POST /import/books/commit` (admin/librarian) JSON:
  ```json
  { "rows": [ { "row_number": 2, "data": { ... } } ] }
  ```

Rules:
- Auto-create category if not existing
- If ISBN exists: update book
- On insert: `copies_available = copies_total`
- On update: `copies_available = copies_total - currently_borrowed`

## Borrowing
- `POST /borrow` (auth) JSON `{ "book_id": 123 }`
- `POST /borrow/{recordId}/return` (admin/librarian)
- `GET /borrow/my` (auth)
- `GET /borrow/all` (admin/librarian)

Overdue detection:
- due_date < today AND return_date IS NULL => status becomes `overdue`

## Reports (Admin)
- `GET /reports/summary`
- `GET /reports?type=borrowed|returned|overdue&from=YYYY-MM-DD&to=YYYY-MM-DD`
- `GET /reports/export?type=...&from=...&to=...` downloads CSV