import React, { useMemo, useState, useEffect } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../state/AuthContext";
import { useUi } from "../state/UiContext";
import {
  FiHome,
  FiUsers,
  FiGrid,
  FiBarChart2,
  FiUpload,
  FiRepeat,
  FiAlertTriangle,
  FiBookOpen,
  FiClock,
  FiSettings,
  FiFileText,
  FiTool,
  FiChevronLeft,
  FiChevronRight,
  FiUser,
  FiLogOut
} from "react-icons/fi";

const LS_SIDEBAR_COLLAPSED = "ulms_sidebar_collapsed";

function LinkItem({ to, label, icon: Icon, onNavigate, collapsed }) {
  return (
    <NavLink
      to={to}
      onClick={onNavigate}
      className={({ isActive }) =>
        [
          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600",
          isActive
            ? "bg-blue-50 text-blue-700 a11y-btn"
            : "text-slate-700 hover:bg-slate-100"
        ].join(" ")
      }
      aria-label={label}
      title={collapsed ? label : undefined}
    >
      {Icon ? <Icon className="h-4 w-4 shrink-0" aria-hidden="true" /> : null}
      <span className={collapsed ? "hidden" : "truncate"}>{label}</span>
    </NavLink>
  );
}

export default function AppLayout() {
  const { user, logout } = useAuth();
  const { a11yMode, toggleA11yMode } = useUi();
  const nav = useNavigate();

  const [open, setOpen] = useState(false); // mobile open/close
  const [collapsed, setCollapsed] = useState(() => {
    const raw = localStorage.getItem(LS_SIDEBAR_COLLAPSED);
    return raw === "1";
  });

  useEffect(() => {
    localStorage.setItem(LS_SIDEBAR_COLLAPSED, collapsed ? "1" : "0");
  }, [collapsed]);

  const links = useMemo(() => {
    const role = user?.role;
    const base = [{ to: "/", label: "Dashboard", icon: FiHome }];

    if (role === "admin") {
      base.push(
        { to: "/admin/users", label: "Users", icon: FiUsers },
        { to: "/admin/categories", label: "Categories", icon: FiGrid },
        { to: "/admin/reports", label: "Reports", icon: FiBarChart2 }
      );
    }

    if (role === "librarian" || role === "admin") {
      base.push(
        { to: "/librarian/import", label: "Import Books (CSV)", icon: FiUpload },
        { to: "/librarian/borrows", label: "Borrow / Return", icon: FiRepeat },
        { to: "/librarian/overdue", label: "Overdue", icon: FiAlertTriangle }
      );
    }

    base.push(
      { to: "/books", label: "Books", icon: FiBookOpen },
      { to: "/my/borrows", label: "My History", icon: FiClock },
      { to: "/settings", label: "Settings", icon: FiSettings }
    );

    if (role === "admin" || role === "librarian") {
      base.push(
        { to: "/activity-logs", label: "Activity Logs", icon: FiFileText },
        { to: "/dev", label: "Dev Info", icon: FiTool }
      );
    }

    return base;
  }, [user]);

  function handleLogout() {
    logout();
    nav("/login", { replace: true });
  }

  function onNavigate() {
    setOpen(false);
  }

  return (
    <div className="min-h-screen w-full">
      {/* Mobile top bar */}
      <header className="lg:hidden sticky top-0 z-30 border-b border-slate-200 bg-white a11y-surface a11y-outline">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm a11y-input a11y-outline"
            onClick={() => setOpen((s) => !s)}
            aria-label="Toggle navigation menu"
            type="button"
          >
            Menu
          </button>
          <div className="text-sm font-semibold">University Library</div>
          <button
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm a11y-input a11y-outline"
            onClick={toggleA11yMode}
            aria-pressed={a11yMode}
            aria-label="Toggle accessibility mode"
            type="button"
          >
            A11y: {a11yMode ? "On" : "Off"}
          </button>
        </div>
      </header>

      <div className="w-full">
        <div className="flex min-h-[calc(100vh-0px)]">
          <aside
            className={[
              collapsed ? "w-[76px]" : "w-[260px]",
              "shrink-0 border-r border-slate-200 bg-white a11y-surface a11y-outline",
              "lg:sticky lg:top-0 lg:h-screen",
              open ? "block" : "hidden lg:block"
            ].join(" ")}
            aria-label="Sidebar navigation"
          >
            <div className="flex h-full flex-col p-4">
              <div>
                {/* Header row (desktop only) */}
                <div className="hidden lg:flex items-center justify-between gap-2">
                  <div className={collapsed ? "hidden" : ""}>
                    <div className="text-sm font-semibold">University Library</div>
                    <div className="text-xs text-slate-500 a11y-muted">
                      Role: {user?.role}
                    </div>
                  </div>

                  <div className="ml-auto flex items-center gap-2">
                    {!collapsed ? (
                      <button
                        className="rounded-lg border border-slate-200 px-2 py-1 text-xs a11y-input a11y-outline"
                        onClick={toggleA11yMode}
                        aria-pressed={a11yMode}
                        aria-label="Toggle accessibility mode"
                        type="button"
                      >
                        A11y
                      </button>
                    ) : null}

                    <button
                      className="rounded-lg border border-slate-200 p-2 text-sm a11y-input a11y-outline"
                      onClick={() => setCollapsed((v) => !v)}
                      aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                      aria-pressed={collapsed}
                      title={collapsed ? "Expand" : "Collapse"}
                      type="button"
                    >
                      {collapsed ? (
                        <FiChevronRight className="h-4 w-4" aria-hidden="true" />
                      ) : (
                        <FiChevronLeft className="h-4 w-4" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                </div>

                <nav className="mt-4 space-y-1">
                  {links.map((l) => (
                    <LinkItem
                      key={l.to}
                      to={l.to}
                      label={l.label}
                      icon={l.icon}
                      onNavigate={onNavigate}
                      collapsed={collapsed}
                    />
                  ))}
                </nav>
              </div>

              {/* Bottom area */}
              <div className="mt-auto pt-6">
                {collapsed ? (
                  <div className="flex flex-col items-center gap-2">
                    {/* Avatar-only (go to settings) */}
                    <button
                      type="button"
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 a11y-outline"
                      title={user?.name ? `Account: ${user.name}` : "Account"}
                      aria-label="Account (opens Settings)"
                      onClick={() => setCollapsed(false)}
                    >
                      <FiUser className="h-5 w-5" aria-hidden="true" />
                    </button>

                    {/* Logout icon */}
                    <button
                      type="button"
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-white hover:bg-slate-800 a11y-btn"
                      onClick={handleLogout}
                      title="Logout"
                      aria-label="Logout"
                    >
                      <FiLogOut className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </div>
                ) : (
                  <div className="rounded-xl border border-slate-200 p-3 a11y-outline">
                    <div className="text-xs text-slate-500 a11y-muted">
                      Signed in as
                    </div>
                    <div className="text-sm font-medium">{user?.name}</div>
                    <div className="text-xs text-slate-600 a11y-muted">
                      {user?.email}
                    </div>

                    <button
                      className="mt-3 w-full rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800 a11y-btn"
                      onClick={handleLogout}
                      aria-label="Logout"
                      type="button"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </aside>

          <main className="flex-1 min-w-0 p-4 lg:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}