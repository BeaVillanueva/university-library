import React, { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import { startIdleLogout } from "./utils/idleLogout.js";

import LandingPage from "./pages/LandingPage.jsx";
import ConfigPage from "./pages/ConfigPage.jsx";

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
import BookCreatePage from "./pages/BookCreatePage.jsx";
import MyBorrowsPage from "./pages/MyBorrowsPage.jsx";

import ImportBooksPage from "./pages/librarian/ImportBooksPage.jsx";
import BorrowPendingPage from "./pages/librarian/BorrowPendingPage.jsx";
import BorrowBorrowedPage from "./pages/librarian/BorrowBorrowedPage.jsx";
import BorrowOverdueListPage from "./pages/librarian/BorrowOverdueListPage.jsx";
import BorrowAllHistoryPage from "./pages/librarian/BorrowAllHistoryPage.jsx";

import AdminUsersPage from "./pages/admin/AdminUsersPage.jsx";
import AdminCategoriesPage from "./pages/admin/AdminCategoriesPage.jsx";
import AdminReportsPage from "./pages/admin/AdminReportsPage.jsx";

import SettingsPage from "./pages/SettingsPage.jsx";
import DevInfoPage from "./pages/DevInfoPage.jsx";
import ActivityLogsPage from "./pages/ActivityLogsPage.jsx";
import AnnouncementPage from "./pages/AnnouncementPage.jsx";

export default function App() {
  useEffect(() => {
    const stop = startIdleLogout();
    return stop;
  }, []);

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/landing" element={<LandingPage />} />
      <Route path="/config" element={<ConfigPage />} />

      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterStudentPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="books" element={<BooksPage />} />

        <Route
          path="books/create"
          element={
            <ProtectedRoute roles={["admin", "librarian"]}>
              <BookCreatePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="books/:id/edit"
          element={
            <ProtectedRoute roles={["admin", "librarian"]}>
              <BookEditPage />
            </ProtectedRoute>
          }
        />

        <Route path="my/borrows" element={<MyBorrowsPage />} />

        <Route
          path="librarian/import"
          element={
            <ProtectedRoute roles={["librarian"]}>
              <ImportBooksPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="librarian/borrows"
          element={<Navigate to="/app/librarian/borrowing/borrowed" replace />}
        />
        <Route
          path="librarian/overdue"
          element={<Navigate to="/app/librarian/borrowing/overdue" replace />}
        />

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

        <Route
          path="admin/users"
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
        <Route
          path="admin/users/archived"
          element={
            <ProtectedRoute roles={["admin"]}>
              <AdminUsersPage />
            </ProtectedRoute>
          }
        />

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
            <ProtectedRoute roles={["admin", "librarian"]}>
              <AdminReportsPage />
            </ProtectedRoute>
          }
        />

        <Route path="settings" element={<SettingsPage />} />
        <Route path="announcements" element={<AnnouncementPage />} />

        <Route
          path="dev"
          element={
            <ProtectedRoute roles={["librarian"]}>
              <DevInfoPage />
            </ProtectedRoute>
          }
        />

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
