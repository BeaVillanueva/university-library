import React, { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import { startIdleLogout } from "./utils/idleLogout.js";

import LoginPage from "./pages/LoginPage.jsx";
import RegisterStudentPage from "./pages/RegisterStudentPage.jsx";
import ForgotPasswordPage from "./pages/ForgotPasswordPage.jsx";
import ResetPasswordPage from "./pages/ResetPasswordPage.jsx";

import AppLayout from "./layout/AppLayout.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";
import ProtectedRoute from "./routes/ProtectedRoute.jsx";

import DashboardPage from "./pages/DashboardPage.jsx";
import BooksPage from "./pages/BooksPage.jsx";
import BookEditPage from "./pages/BookEditPage.jsx";
import MyBorrowsPage from "./pages/MyBorrowsPage.jsx";

import ImportBooksPage from "./pages/librarian/ImportBooksPage.jsx";
import BorrowReturnPage from "./pages/librarian/BorrowReturnPage.jsx";
import OverduePage from "./pages/librarian/OverduePage.jsx";

import AdminUsersPage from "./pages/admin/AdminUsersPage.jsx";
import AdminCategoriesPage from "./pages/admin/AdminCategoriesPage.jsx";
import AdminReportsPage from "./pages/admin/AdminReportsPage.jsx";

import SettingsPage from "./pages/SettingsPage.jsx";
import DevInfoPage from "./pages/DevInfoPage.jsx";

import ActivityLogsPage from "./pages/ActivityLogsPage.jsx";

import BorrowPendingPage from "./pages/librarian/BorrowPendingPage.jsx";
import BorrowBorrowedPage from "./pages/librarian/BorrowBorrowedPage.jsx";
import BorrowOverdueListPage from "./pages/librarian/BorrowOverdueListPage.jsx";
import BorrowAllHistoryPage from "./pages/librarian/BorrowAllHistoryPage.jsx";

export default function App() {
  useEffect(() => {
    const stop = startIdleLogout();
    return stop;
  }, []);

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterStudentPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* App routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />

        <Route path="books" element={<BooksPage />} />
        <Route
          path="books/:id/edit"
          element={
            <ProtectedRoute roles={["admin", "librarian"]}>
              <BookEditPage />
            </ProtectedRoute>
          }
        />

        <Route path="my/borrows" element={<MyBorrowsPage />} />

        {/* Librarian-only */}
        <Route
          path="librarian/import"
          element={
            <ProtectedRoute roles={["librarian"]}>
              <ImportBooksPage />
            </ProtectedRoute>
          }
        />

        {/* Backward-compatible redirects */}
        <Route
          path="librarian/borrows"
          element={<Navigate to="/librarian/borrowing/borrowed" replace />}
        />
        <Route
          path="librarian/overdue"
          element={<Navigate to="/librarian/borrowing/overdue" replace />}
        />

        {/* Borrowing submenu pages (Librarian-only) */}
        <Route
          path="librarian/borrowing/pending"
          element={
            <ProtectedRoute roles={["librarian"]}>
              <BorrowPendingPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="librarian/borrowing/borrowed"
          element={
            <ProtectedRoute roles={["librarian"]}>
              <BorrowBorrowedPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="librarian/borrowing/overdue"
          element={
            <ProtectedRoute roles={["librarian"]}>
              <BorrowOverdueListPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="librarian/borrowing/history"
          element={
            <ProtectedRoute roles={["librarian"]}>
              <BorrowAllHistoryPage />
            </ProtectedRoute>
          }
        />

        {/* ADMIN USERS (sub-routes) */}
        <Route
          path="admin/users"
          element={
            <ProtectedRoute roles={["admin"]}>
              <AdminUsersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/users/pending"
          element={
            <ProtectedRoute roles={["admin"]}>
              <AdminUsersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/users/create"
          element={
            <ProtectedRoute roles={["admin"]}>
              <AdminUsersPage />
            </ProtectedRoute>
          }
        />

        {/* Optional: if admin should NOT manage categories, remove this route.
            If admin still manages categories, keep it as-is. */}
        <Route
          path="admin/categories"
          element={
            <ProtectedRoute roles={["admin"]}>
              <AdminCategoriesPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="admin/reports"
          element={
            <ProtectedRoute roles={["admin"]}>
              <AdminReportsPage />
            </ProtectedRoute>
          }
        />

        <Route path="settings" element={<SettingsPage />} />

        {/* Dev page: librarian-only (admin removed) */}
        <Route
          path="dev"
          element={
            <ProtectedRoute roles={["librarian"]}>
              <DevInfoPage />
            </ProtectedRoute>
          }
        />

        {/* Activity logs: admin + librarian (keep both) */}
        <Route
          path="activity-logs"
          element={
            <ProtectedRoute roles={["admin", "librarian"]}>
              <ActivityLogsPage />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="/404" element={<NotFoundPage />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
}