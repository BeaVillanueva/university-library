import React, { useState, useEffect } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../state/AuthContext";
import { useUi } from "../state/UiContext";
import { apiListPendingStudents } from "../api/users";
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
  FiChevronDown,
  FiChevronUp,
  FiUser,
  FiLogOut
} from "react-icons/fi";

const LS_SIDEBAR_COLLAPSED = "ulms_sidebar_collapsed";

function LinkItem({
  to,
  label,
  icon: Icon,
  onNavigate,
  collapsed,
  end = false,
  a11yMode
}) {
  const base =
    "nav-item flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium " +
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600";

  const normal = a11yMode
    ? "text-slate-100 hover:bg-slate-800"
    : "text-slate-700 hover:bg-slate-100";

  const active = a11yMode
    ? "bg-slate-800 text-white"
    : "bg-blue-50 text-blue-700 a11y-btn";

  return (
    <NavLink
      to={to}
      end={end}
      onClick={onNavigate}
      className={({ isActive }) => [base, isActive ? active : normal].join(" ")}
      aria-label={label}
      title={collapsed ? label : undefined}
    >
      {Icon ? <Icon className="nav-icon h-4 w-4 shrink-0" aria-hidden="true" /> : null}
      <span className={collapsed ? "hidden" : "truncate"}>{label}</span>
    </NavLink>
  );
}

function SubLinkItem({
  to,
  label,
  onNavigate,
  collapsed,
  end = false,
  a11yMode,
  badge
}) {
  const base =
    "nav-item flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm pl-10 " +
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600";

  const normal = a11yMode
    ? "text-slate-200 hover:bg-slate-800"
    : "text-slate-700 hover:bg-slate-100";

  const active = a11yMode
    ? "bg-slate-800 text-white"
    : "bg-blue-50 text-blue-700 a11y-btn";

  const badgeClass = a11yMode
    ? "bg-slate-700 text-slate-100"
    : "bg-slate-200 text-slate-800";

  const showBadge = !collapsed && badge !== undefined && badge !== null && badge > 0;

  return (
    <NavLink
      to={to}
      end={end}
      onClick={onNavigate}
      className={({ isActive }) => [base, isActive ? active : normal].join(" ")}
      aria-label={label}
      title={collapsed ? label : undefined}
    >
      <span className={collapsed ? "hidden" : "truncate"}>{label}</span>

      {showBadge ? (
        <span
          className={[
            "min-w-[28px] rounded-full px-2 py-[2px] text-center text-xs font-semibold",
            badgeClass
          ].join(" ")}
          aria-label={`${label} count ${badge}`}
        >
          {badge}
        </span>
      ) : null}
    </NavLink>
  );
}

export default function AppLayout() {
  const { user, logout } = useAuth();
  const { a11yMode, toggleA11yMode } = useUi();
  const nav = useNavigate();
  const loc = useLocation();

  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    const raw = localStorage.getItem(LS_SIDEBAR_COLLAPSED);
    return raw === "1";
  });

  const [usersOpen, setUsersOpen] = useState(() => {
    return loc.pathname.startsWith("/admin/users");
  });

  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    localStorage.setItem(LS_SIDEBAR_COLLAPSED, collapsed ? "1" : "0");
  }, [collapsed]);

  useEffect(() => {
    if (loc.pathname.startsWith("/admin/users")) setUsersOpen(true);
  }, [loc.pathname]);

  function handleLogout() {
    logout();
    nav("/login", { replace: true });
  }

  function onNavigate() {
    setOpen(false);
  }

  const role = user?.role;

  // Load pending approvals count (admin only)
  useEffect(() => {
    let cancelled = false;

    async function loadPendingCount() {
      if (role !== "admin") return;
      try {
        const res = await apiListPendingStudents();
        const count = Array.isArray(res?.items) ? res.items.length : 0;
        if (!cancelled) setPendingCount(count);
      } catch {
        if (!cancelled) setPendingCount(0);
      }
    }

    loadPendingCount();
    const t = setInterval(loadPendingCount, 30000);

    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, [role]);

  // THEME classes (light vs dark sidebar)
  const shellBg = a11yMode ? "bg-slate-950" : "bg-white";
  const shellBorder = a11yMode ? "border-slate-800" : "border-slate-200";
  const shellTextMuted = a11yMode ? "text-slate-400" : "text-slate-500";
  const shellShadow = "shadow-md";

  const collapseBtnBg = a11yMode
    ? "bg-slate-900 text-slate-100 border-slate-700 hover:bg-slate-800"
    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50";

  const topBarBg = a11yMode ? "bg-slate-950 text-slate-100" : "bg-white";
  const topBarBorder = a11yMode ? "border-slate-800" : "border-slate-200";

  return (
    <div className="min-h-screen w-full">
      {/* Mobile top bar */}
      <header
        className={[
          "lg:hidden sticky top-0 z-30 border-b a11y-outline",
          topBarBg,
          topBarBorder
        ].join(" ")}
      >
        <div className="flex items-center justify-between px-4 py-3">
          <button
            className={[
              "rounded-lg border px-3 py-2 text-sm a11y-input a11y-outline",
              collapseBtnBg
            ].join(" ")}
            onClick={() => setOpen((s) => !s)}
            aria-label="Toggle navigation menu"
            type="button"
          >
            Menu
          </button>
          <div className="text-sm font-semibold">University Library</div>
          <button
            className={[
              "rounded-lg border px-3 py-2 text-sm a11y-input a11y-outline",
              collapseBtnBg
            ].join(" ")}
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
              "shrink-0 border-r",
              shellBg,
              shellBorder,
              shellShadow,
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
                    <div
                      className={[
                        "text-sm font-semibold",
                        a11yMode ? "text-slate-100" : "text-slate-900"
                      ].join(" ")}
                    >
                      University Library
                    </div>
                    <div className={["text-xs a11y-muted", shellTextMuted].join(" ")}>
                      Role: {user?.role}
                    </div>
                  </div>

                  <div className="ml-auto flex items-center gap-2">
                    {!collapsed ? (
                      <button
                        className={[
                          "rounded-lg border px-2 py-1 text-xs a11y-input a11y-outline",
                          collapseBtnBg
                        ].join(" ")}
                        onClick={toggleA11yMode}
                        aria-pressed={a11yMode}
                        aria-label="Toggle accessibility mode"
                        type="button"
                      >
                        A11y
                      </button>
                    ) : null}

                    <button
                      className={[
                        "rounded-lg border p-2 text-sm a11y-input a11y-outline",
                        collapseBtnBg
                      ].join(" ")}
                      onClick={() => setCollapsed((v) => !v)}
                      aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                      aria-pressed={collapsed}
                      title={collapsed ? "Expand" : "Collapse"}
                      type="button"
                    >
                      {collapsed ? (
                        <FiChevronRight className="h-5 w-5" aria-hidden="true" />
                      ) : (
                        <FiChevronLeft className="h-5 w-5" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                </div>

                <nav className="mt-4 space-y-1">
                  <LinkItem
                    to="/"
                    end
                    label="Dashboard"
                    icon={FiHome}
                    onNavigate={onNavigate}
                    collapsed={collapsed}
                    a11yMode={a11yMode}
                  />

                  {role === "admin" ? (
                    <div>
                      <button
                        type="button"
                        onClick={() => setUsersOpen((v) => !v)}
                        className={[
                          "nav-item w-full flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium",
                          "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600",
                          loc.pathname.startsWith("/admin/users")
                            ? a11yMode
                              ? "bg-slate-800 text-white"
                              : "bg-blue-50 text-blue-700 a11y-btn"
                            : a11yMode
                              ? "text-slate-100 hover:bg-slate-800"
                              : "text-slate-700 hover:bg-slate-100"
                        ].join(" ")}
                        aria-label="Users submenu"
                        aria-expanded={usersOpen}
                        title={collapsed ? "Users" : undefined}
                      >
                        <span className="flex items-center gap-3">
                          <FiUsers
                            className="nav-icon h-4 w-4 shrink-0"
                            aria-hidden="true"
                          />
                          <span className={collapsed ? "hidden" : "truncate"}>Users</span>
                        </span>

                        {collapsed ? null : usersOpen ? (
                          <FiChevronUp className="h-4 w-4" aria-hidden="true" />
                        ) : (
                          <FiChevronDown className="h-4 w-4" aria-hidden="true" />
                        )}
                      </button>

                      {usersOpen && !collapsed ? (
                        <div className="mt-1 space-y-1">
                          <SubLinkItem
                            to="/admin/users/pending"
                            label="Pending Approval"
                            onNavigate={onNavigate}
                            collapsed={collapsed}
                            end
                            a11yMode={a11yMode}
                            badge={pendingCount}
                          />
                          <SubLinkItem
                            to="/admin/users"
                            label="All Users"
                            onNavigate={onNavigate}
                            collapsed={collapsed}
                            end
                            a11yMode={a11yMode}
                          />
                          <SubLinkItem
                            to="/admin/users/create"
                            label="Create User"
                            onNavigate={onNavigate}
                            collapsed={collapsed}
                            end
                            a11yMode={a11yMode}
                          />
                        </div>
                      ) : null}
                    </div>
                  ) : null}

                  {role === "admin" ? (
                    <>
                      <LinkItem
                        to="/admin/categories"
                        label="Categories"
                        icon={FiGrid}
                        onNavigate={onNavigate}
                        collapsed={collapsed}
                        a11yMode={a11yMode}
                      />
                      <LinkItem
                        to="/admin/reports"
                        label="Reports"
                        icon={FiBarChart2}
                        onNavigate={onNavigate}
                        collapsed={collapsed}
                        a11yMode={a11yMode}
                      />
                    </>
                  ) : null}

                  {role === "librarian" || role === "admin" ? (
                    <>
                      <LinkItem
                        to="/librarian/import"
                        label="Import Books (CSV)"
                        icon={FiUpload}
                        onNavigate={onNavigate}
                        collapsed={collapsed}
                        a11yMode={a11yMode}
                      />
                      <LinkItem
                        to="/librarian/borrows"
                        label="Borrow / Return"
                        icon={FiRepeat}
                        onNavigate={onNavigate}
                        collapsed={collapsed}
                        a11yMode={a11yMode}
                      />
                      <LinkItem
                        to="/librarian/overdue"
                        label="Overdue"
                        icon={FiAlertTriangle}
                        onNavigate={onNavigate}
                        collapsed={collapsed}
                        a11yMode={a11yMode}
                      />
                    </>
                  ) : null}

                  <LinkItem
                    to="/books"
                    label="Books"
                    icon={FiBookOpen}
                    onNavigate={onNavigate}
                    collapsed={collapsed}
                    a11yMode={a11yMode}
                  />
                  <LinkItem
                    to="/my/borrows"
                    label="My History"
                    icon={FiClock}
                    onNavigate={onNavigate}
                    collapsed={collapsed}
                    a11yMode={a11yMode}
                  />
                  <LinkItem
                    to="/settings"
                    label="Settings"
                    icon={FiSettings}
                    onNavigate={onNavigate}
                    collapsed={collapsed}
                    a11yMode={a11yMode}
                  />

                  {role === "admin" || role === "librarian" ? (
                    <>
                      <LinkItem
                        to="/activity-logs"
                        label="Activity Logs"
                        icon={FiFileText}
                        onNavigate={onNavigate}
                        collapsed={collapsed}
                        a11yMode={a11yMode}
                      />
                      <LinkItem
                        to="/dev"
                        label="Dev Info"
                        icon={FiTool}
                        onNavigate={onNavigate}
                        collapsed={collapsed}
                        a11yMode={a11yMode}
                      />
                    </>
                  ) : null}
                </nav>
              </div>

              <div className="mt-auto pt-6">
                {collapsed ? (
                  <div className="flex flex-col items-center gap-2">
                    <button
                      type="button"
                      className={[
                        "flex h-10 w-10 items-center justify-center rounded-full border bg-transparent a11y-outline",
                        a11yMode
                          ? "border-slate-700 text-slate-100 hover:bg-slate-900"
                          : "border-slate-200 text-slate-700 hover:bg-slate-50"
                      ].join(" ")}
                      title={user?.name ? `Account: ${user.name}` : "Account"}
                      aria-label="Account (opens Settings)"
                      onClick={() => setCollapsed(false)}
                    >
                      <FiUser className="h-5 w-5" aria-hidden="true" />
                    </button>

                    <button
                      type="button"
                      className={[
                        "flex h-10 w-10 items-center justify-center rounded-full a11y-btn",
                        a11yMode
                          ? "bg-slate-100 text-slate-900 hover:bg-white"
                          : "bg-slate-900 text-white hover:bg-slate-800"
                      ].join(" ")}
                      onClick={handleLogout}
                      title="Logout"
                      aria-label="Logout"
                    >
                      <FiLogOut className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </div>
                ) : (
                  <div
                    className={[
                      "rounded-xl border p-3 a11y-outline",
                      a11yMode
                        ? "border-slate-800 bg-slate-950 text-slate-100"
                        : "border-slate-200 bg-white text-slate-900"
                    ].join(" ")}
                  >
                    <div className={["text-xs a11y-muted", shellTextMuted].join(" ")}>
                      Signed in as
                    </div>
                    <div className="text-sm font-medium">{user?.name}</div>
                    <div
                      className={[
                        "text-xs a11y-muted",
                        a11yMode ? "text-slate-300" : "text-slate-600"
                      ].join(" ")}
                    >
                      {user?.email}
                    </div>

                    <button
                      className={[
                        "mt-3 w-full rounded-lg px-3 py-2 text-sm font-semibold a11y-btn",
                        a11yMode
                          ? "bg-slate-100 text-slate-900 hover:bg-white"
                          : "bg-slate-900 text-white hover:bg-slate-800"
                      ].join(" ")}
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