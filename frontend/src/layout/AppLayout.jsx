import React, { useEffect, useState } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../state/AuthContext";
import { useUi } from "../state/UiContext";
import { http } from "../api/http";
import { apiListAllBorrows } from "../api/borrow";
import { apiListAnnouncements } from "../api/announcements";
import { useIdleTimer } from "../hooks/useIdleTimer";
import ConfirmModal from "../components/ConfirmModal";
import {
  FiHome,
  FiUsers,
  FiBarChart2,
  FiUpload,
  FiRepeat,
  FiBookOpen,
  FiClock,
  FiSettings,
  FiFileText,
  FiBell,
  FiChevronDown,
  FiChevronUp,
  FiLogOut,
  FiUser,
} from "react-icons/fi";

const LS_SIDEBAR_COLLAPSED = "ulms_sidebar_collapsed";
const ICON_ACCENT = "text-[#d6a436]";

function LinkItem({
  to,
  label,
  icon: Icon,
  onNavigate,
  collapsed,
  end = false,
  badge,
}) {
  const base =
    "group relative flex items-center text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 h-11";

  const normal = "rounded-2xl text-white/85 hover:bg-white/10";
  const active =
    "rounded-l-2xl rounded-r-[26px] bg-[#e9eff0] text-[#2f4f4c] shadow-sm ml-2";

  const layout = collapsed ? "justify-center px-0" : "gap-3 px-4";

  return (
    <NavLink
      to={to}
      end={end}
      onClick={onNavigate}
      className={({ isActive }) =>
        [base, layout, isActive ? active : normal].join(" ")
      }
      aria-label={label}
      title={collapsed ? label : undefined}
    >
      {Icon ? (
        <Icon
          size={18}
          className={[
            "shrink-0 opacity-95 group-hover:opacity-100",
            "group-[[aria-current=page]]:text-[#2f4f4c]",
            ICON_ACCENT,
          ].join(" ")}
          aria-hidden="true"
        />
      ) : null}

      <span className={collapsed ? "hidden" : "truncate"}>{label}</span>

      {!collapsed && badge > 0 ? (
        <span className="ml-auto min-w-[26px] rounded-full bg-[#d6a436] px-2 py-[2px] text-center text-xs font-bold text-[#2f4f4c] shadow-sm">
          {badge}
        </span>
      ) : null}
    </NavLink>
  );
}

function SubLinkItem({ to, label, onNavigate, collapsed, end = false, badge }) {
  const base =
    "group relative flex items-center justify-between gap-3 text-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 h-10";

  const normal = "rounded-2xl text-white/75 hover:bg-white/10";
  const active =
    "rounded-l-2xl rounded-r-[26px] bg-[#e9eff0] text-[#2f4f4c] shadow-sm ml-2";

  const showBadge = !collapsed && badge !== undefined && badge !== null && badge > 0;

  return (
    <NavLink
      to={to}
      end={end}
      onClick={onNavigate}
      className={({ isActive }) =>
        [
          base,
          collapsed ? "px-0 justify-center" : "px-4 pl-12",
          isActive ? active : normal,
        ].join(" ")
      }
      aria-label={label}
      title={collapsed ? label : undefined}
    >
      <span className={collapsed ? "hidden" : "truncate"}>{label}</span>

      {showBadge ? (
        <span className="min-w-[28px] rounded-full bg-[#d6a436] px-2 py-[2px] text-center text-xs font-bold text-[#2f4f4c] shadow-sm ring-1 ring-white/15">
          {badge}
        </span>
      ) : null}
    </NavLink>
  );
}

export default function AppLayout() {
  const { user, logout } = useAuth();
  const { a11yMode } = useUi();

  const nav = useNavigate();
  const loc = useLocation();

  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    const raw = localStorage.getItem(LS_SIDEBAR_COLLAPSED);
    return raw === "1";
  });

  const [announcementCount, setAnnouncementCount] = useState(0);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  const role = user?.role;
  const isAdmin = role === "admin";
  const isLibrarian = role === "librarian";
  const isStudent = role === "student";

  const [usersOpen, setUsersOpen] = useState(() =>
    loc.pathname.startsWith("/app/admin/users")
  );
  const [pendingBorrowsCount, setPendingBorrowsCount] = useState(0);

  const [borrowingOpen, setBorrowingOpen] = useState(() =>
    loc.pathname.startsWith("/app/librarian/borrowing")
  );

  useEffect(() => {
    if (loc.pathname.startsWith("/app/librarian/borrowing")) {
      setBorrowingOpen(true);
    }
  }, [loc.pathname]);

  useEffect(() => {
    localStorage.setItem(LS_SIDEBAR_COLLAPSED, collapsed ? "1" : "0");
  }, [collapsed]);

  useEffect(() => {
    if (loc.pathname.startsWith("/app/admin/users")) {
      setUsersOpen(true);
    }
  }, [loc.pathname]);

  async function handleLogout() {
    setLogoutLoading(true);
    try {
      await http.post("/auth/logout", {});
    } catch {
      // ignore
    } finally {
      setLogoutLoading(false);
      setLogoutOpen(false);
      logout();
      nav("/", { replace: true });
    }
  }

  const handleIdleTimeout = async () => {
    try {
      await http.post("/auth/logout", {});
    } catch {
      // ignore
    } finally {
      logout();
      nav("/login", { replace: true });
    }
  };

  useIdleTimer(handleIdleTimeout, 5 * 60 * 1000);

  function onNavigate() {
    setOpen(false);
  }

  useEffect(() => {
    let cancelled = false;

    async function loadPendingBorrowsCount() {
      if (!isLibrarian) return;

      try {
        const res = await apiListAllBorrows({
          status: "pending",
          page: 1,
          limit: 1,
        });

        const total =
          typeof res?.total === "number"
            ? res.total
            : Array.isArray(res?.items)
              ? res.items.length
              : 0;

        if (!cancelled) setPendingBorrowsCount(total);
      } catch {
        if (!cancelled) setPendingBorrowsCount(0);
      }
    }

    loadPendingBorrowsCount();
    const t = setInterval(loadPendingBorrowsCount, 30000);

    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, [isLibrarian]);

  useEffect(() => {
    let cancelled = false;

    async function loadAnnouncementCount() {
      if (!isStudent) {
        setAnnouncementCount(0);
        return;
      }

      try {
        const res = await apiListAnnouncements();

        const items = Array.isArray(res?.announcements)
          ? res.announcements
          : [];

        const activeItems = items.filter((a) => a.status === "active");

        const lastSeen = localStorage.getItem("last_seen_announcements");

        const newItems = activeItems.filter((a) => {
          const date = a.updated_at || a.created_at;
          return !lastSeen || new Date(date) > new Date(lastSeen);
        });

        if (!cancelled) {
          setAnnouncementCount(newItems.length);
        }
      } catch {
        if (!cancelled) setAnnouncementCount(0);
      }
    }

    loadAnnouncementCount();
    const t = setInterval(loadAnnouncementCount, 30000);

    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, [isStudent]);

  const appBg = a11yMode ? "bg-slate-950" : "bg-[#e9eff0]";

  function onSidebarBackgroundClick(e) {
    const interactive = e.target.closest("a,button,input,select,textarea,label");
    if (interactive) return;
    setCollapsed((v) => !v);
  }

  return (
    <div className={["min-h-screen w-full", appBg].join(" ")}>
      <header className="lg:hidden sticky top-0 z-30 border-b border-black/10 bg-white/90 backdrop-blur">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
            onClick={() => setOpen((s) => !s)}
            aria-label="Toggle navigation menu"
            type="button"
          >
            Menu
          </button>
          <div className="text-sm font-semibold text-slate-800">Menu</div>
          <div className="w-[84px]" aria-hidden="true" />
        </div>
      </header>

      <div className="flex min-h-screen w-full gap-6 p-0">
        <aside
          className={[
            collapsed ? "w-[90px]" : "w-[300px]",
            "shrink-0 h-screen sticky top-0",
            open ? "block" : "hidden lg:block",
          ].join(" ")}
          aria-label="Sidebar navigation"
        >
          <div
            className="h-full bg-[#2f4f4c] p-3 text-white shadow-xl flex flex-col rounded-r-[28px] overflow-x-hidden"
            onClick={onSidebarBackgroundClick}
            role="presentation"
          >
            {collapsed ? (
              <div className="mt-1 flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => nav("/app/settings")}
                  className="h-12 w-12 rounded-full bg-white/15 ring-2 ring-white/20 flex items-center justify-center hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
                  aria-label="Account settings"
                  title="Account"
                >
                  <FiUser size={20} className="text-white/90" />
                </button>
              </div>
            ) : (
              <div className="rounded-3xl bg-white/10 px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-white/20 ring-2 ring-white/20" />
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold leading-tight">
                      {user?.name || "User"}
                    </div>
                    <div className="truncate text-xs text-white/70 leading-tight">
                      {user?.email}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <nav className="mt-3 space-y-1 flex-1 overflow-hidden px-1">
              <LinkItem
                to="/app"
                end
                label="Dashboard"
                icon={FiHome}
                onNavigate={onNavigate}
                collapsed={collapsed}
              />

              {isAdmin && (
                <div>
                  <button
                    type="button"
                    onClick={() => setUsersOpen((v) => !v)}
                    className={[
                      "w-full flex items-center justify-between px-4 py-[10px] text-sm font-semibold transition rounded-2xl h-11",
                      loc.pathname.startsWith("/app/admin/users")
                        ? "bg-[#e9eff0] text-[#2f4f4c] shadow-sm ml-2 rounded-l-2xl rounded-r-[26px]"
                        : "text-white/85 hover:bg-white/10",
                    ].join(" ")}
                  >
                    <span
                      className={[
                        "flex items-center",
                        collapsed ? "justify-center w-full" : "gap-3",
                      ].join(" ")}
                    >
                      <FiUsers size={18} className={ICON_ACCENT} />
                      <span className={collapsed ? "hidden" : "truncate"}>
                        Users
                      </span>
                    </span>

                    {!collapsed &&
                      (usersOpen ? (
                        <FiChevronUp className="h-4 w-4" />
                      ) : (
                        <FiChevronDown className="h-4 w-4" />
                      ))}
                  </button>

                  {usersOpen && !collapsed && (
                    <div className="mt-1 space-y-1">
                      <SubLinkItem
                        to="/app/admin/users"
                        label="All Users"
                        onNavigate={onNavigate}
                        collapsed={collapsed}
                        end
                      />
                      <SubLinkItem
                        to="/app/admin/users/create"
                        label="Create User"
                        onNavigate={onNavigate}
                        collapsed={collapsed}
                        end
                      />
                    </div>
                  )}
                </div>
              )}

              {(isAdmin || isLibrarian) && (
                <LinkItem
                  to="/app/admin/reports"
                  label="Reports"
                  icon={FiBarChart2}
                  onNavigate={onNavigate}
                  collapsed={collapsed}
                />
              )}

              {isLibrarian && (
                <>
                  <LinkItem
                    to="/app/librarian/import"
                    label="Import Books (CSV)"
                    icon={FiUpload}
                    onNavigate={onNavigate}
                    collapsed={collapsed}
                  />

                  <div>
                    <button
                      type="button"
                      onClick={() => setBorrowingOpen((v) => !v)}
                      className={[
                        "w-full flex items-center justify-between px-4 py-[10px] text-sm font-semibold transition rounded-2xl h-11",
                        loc.pathname.startsWith("/app/librarian/borrowing")
                          ? "bg-[#e9eff0] text-[#2f4f4c] shadow-sm ml-2 rounded-l-2xl rounded-r-[26px]"
                          : "text-white/85 hover:bg-white/10",
                      ].join(" ")}
                    >
                      <span
                        className={[
                          "flex items-center",
                          collapsed ? "justify-center w-full" : "gap-3",
                        ].join(" ")}
                      >
                        <FiRepeat size={18} className={ICON_ACCENT} />
                        <span className={collapsed ? "hidden" : "truncate"}>
                          Borrowing
                        </span>
                      </span>

                      {!collapsed &&
                        (borrowingOpen ? (
                          <FiChevronUp className="h-4 w-4" />
                        ) : (
                          <FiChevronDown className="h-4 w-4" />
                        ))}
                    </button>

                    {borrowingOpen && !collapsed && (
                      <div className="mt-1 space-y-1">
                        <SubLinkItem
                          to="/app/librarian/borrowing/pending"
                          label="Pending Approvals"
                          onNavigate={onNavigate}
                          collapsed={collapsed}
                          end
                          badge={pendingBorrowsCount}
                        />
                        <SubLinkItem
                          to="/app/librarian/borrowing/borrowed"
                          label="Borrowed / Return"
                          onNavigate={onNavigate}
                          collapsed={collapsed}
                          end
                        />
                        <SubLinkItem
                          to="/app/librarian/borrowing/overdue"
                          label="Overdue"
                          onNavigate={onNavigate}
                          collapsed={collapsed}
                          end
                        />
                        <SubLinkItem
                          to="/app/librarian/borrowing/history"
                          label="History"
                          onNavigate={onNavigate}
                          collapsed={collapsed}
                          end
                        />
                      </div>
                    )}
                  </div>
                </>
              )}

              <LinkItem
                to="/app/books"
                label="Books"
                icon={FiBookOpen}
                onNavigate={onNavigate}
                collapsed={collapsed}
              />

              <LinkItem
                to="/app/announcements"
                label="Announcements"
                icon={FiBell}
                onNavigate={() => {
                  if (isStudent) {
                    localStorage.setItem(
                      "last_seen_announcements",
                      new Date().toISOString()
                    );
                    setAnnouncementCount(0);
                  }

                  onNavigate();
                }}
                collapsed={collapsed}
                badge={isStudent ? announcementCount : null}
              />

              {isStudent && (
                <LinkItem
                  to="/app/my/borrows"
                  label="My History"
                  icon={FiClock}
                  onNavigate={onNavigate}
                  collapsed={collapsed}
                />
              )}

              <LinkItem
                to="/app/settings"
                label="Settings"
                icon={FiSettings}
                onNavigate={onNavigate}
                collapsed={collapsed}
              />

              {(isAdmin || isLibrarian) && (
                <LinkItem
                  to="/app/activity-logs"
                  label="Activity Logs"
                  icon={FiFileText}
                  onNavigate={onNavigate}
                  collapsed={collapsed}
                />
              )}
            </nav>

            <div className="pt-3 shrink-0 space-y-4">
              <button
                type="button"
                onClick={() => setLogoutOpen(true)}
                className="w-full rounded-2xl bg-[#f7f4ea] px-4 py-3 text-sm font-bold text-[#27553f] shadow-sm hover:bg-[#fff8df]"
              >
                <span className="flex items-center justify-center gap-3">
                  <FiLogOut size={18} />
                  <span className={collapsed ? "hidden" : ""}>Logout</span>
                </span>
              </button>

              {!collapsed && (
                <div className="flex items-center justify-center gap-3 px-3 pb-3">
                  <img
                    src="/cvsulogo.png"
                    alt="Cavite State University Logo"
                    className="h-14 w-14 object-contain"
                  />

                  <div>
                    <div className="font-serif text-lg leading-tight text-[#f7f4ea]">
                      CAVITE STATE
                      <br />
                      UNIVERSITY
                    </div>
                    <div className="mt-1 text-xs font-semibold text-[#d6a436]">
                      Truth. Integrity. Excellence. Service.
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1 p-3 sm:p-4 lg:p-6">
          <div className="rounded-[28px] bg-white p-4 shadow-sm lg:p-6 min-h-[calc(100vh-64px)]">
            <Outlet />
          </div>
        </main>
      </div>
      <ConfirmModal
        open={logoutOpen}
        title="Log out?"
        message="You will be signed out and returned to the landing page."
        confirmText="Log out"
        tone="danger"
        loading={logoutLoading}
        onCancel={() => setLogoutOpen(false)}
        onConfirm={handleLogout}
      />
    </div>
  );
}
