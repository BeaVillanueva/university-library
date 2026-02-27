import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

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

export default function App() {
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

        <Route
          path="librarian/import"
          element={
            <ProtectedRoute roles={["admin", "librarian"]}>
              <ImportBooksPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="librarian/borrows"
          element={
            <ProtectedRoute roles={["admin", "librarian"]}>
              <BorrowReturnPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="librarian/overdue"
          element={
            <ProtectedRoute roles={["admin", "librarian"]}>
              <OverduePage />
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

        <Route
          path="dev"
          element={
            <ProtectedRoute roles={["admin", "librarian"]}>
              <DevInfoPage />
            </ProtectedRoute>
          }
        />

        {/* NOTE: since this is nested under path="/", do NOT start with "/" */}
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