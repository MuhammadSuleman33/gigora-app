import { useContext, useEffect, useMemo, useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  BarChart3,
  ChevronRight,
  CreditCard,
  FileText,
  History,
  LayoutDashboard,
  Lock,
  LogOut,
  Menu,
  Search,
  Sparkles,
  User,
  UserCircle,
  X,
} from "lucide-react";

import { AuthContext } from "../context/AuthContext";

function Sidebar({ usage }) {
  const { user, setUser } = useContext(AuthContext);

  const navigate = useNavigate();
  const location = useLocation();

  const [isMobileOpen, setIsMobileOpen] =
    useState(false);

  const currentPlan = (
    usage?.plan ||
    user?.plan ||
    "free"
  ).toLowerCase();

  const isPro = currentPlan === "pro";

  const displayName =
    user?.username ||
    user?.name ||
    user?.email?.split("@")[0] ||
    "User";

  const requestsUsed = Number(
    usage?.requests_used ?? 0
  );

  const requestsLimit = usage?.requests_limit ?? 5;

  const isUnlimited =
    requestsLimit === "Unlimited" ||
    requestsLimit === "unlimited" ||
    requestsLimit === 999;

  const percentage = useMemo(() => {
    if (isUnlimited) {
      return 100;
    }

    const numericLimit = Number(requestsLimit);

    if (!numericLimit || numericLimit <= 0) {
      return 0;
    }

    return Math.min(
      100,
      Math.max(
        0,
        (requestsUsed / numericLimit) * 100
      )
    );
  }, [
    isUnlimited,
    requestsLimit,
    requestsUsed,
  ]);

  const menuItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Profile Analyzer",
      path: "/profile-analyzer",
      icon: User,
    },
    {
      name: "Gig SEO",
      path: "/gig-seo",
      icon: Search,
    },
    {
      name: "Proposal Generator",
      path: "/proposal-generator",
      icon: FileText,
    },
    {
      name: "AI Compare",
      path: "/proposal-compare",
      icon: Sparkles,
      pro: true,
    },
    {
      name: "History",
      path: "/history",
      icon: History,
    },
    {
      name: "Usage",
      path: "/usage",
      icon: BarChart3,
    },
  ];

  const closeMobileMenu = () => {
    setIsMobileOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem(
      "gigora_access_token"
    );
    localStorage.removeItem("gigora_user");

    setUser(null);
    closeMobileMenu();
    navigate("/login");
  };

  useEffect(() => {
    closeMobileMenu();
  }, [location.pathname]);

  useEffect(() => {
    if (!isMobileOpen) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileOpen]);

  const isActivePath = (path) => {
    return location.pathname === path;
  };

  const SidebarContent = () => (
    <div className="flex h-full flex-col bg-white">
      {/* Brand */}
      <div className="flex h-20 items-center justify-between border-b border-slate-200 px-5">
        <Link
          to="/"
          onClick={closeMobileMenu}
          className="group flex items-center gap-3"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#1554D1] text-white shadow-md shadow-blue-200 transition group-hover:scale-105">
            <Sparkles size={22} />
          </div>

          <div>
            <h1 className="text-xl font-extrabold tracking-[0.12em] text-slate-900">
              GIGORA
            </h1>

            <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
              Freelancer Assistant
            </p>
          </div>
        </Link>

        <button
          type="button"
          onClick={closeMobileMenu}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition hover:bg-slate-200 lg:hidden"
          aria-label="Close sidebar"
        >
          <X size={21} />
        </button>
      </div>

      {/* User and usage */}
      {user && (
        <div className="px-4 pt-5">
          <div className="overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-4 shadow-sm">
            <Link
              to="/profile"
              onClick={closeMobileMenu}
              className="group flex items-center gap-3"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#1554D1] text-white shadow-sm">
                <UserCircle size={24} />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="truncate text-sm font-bold text-slate-900">
                    {displayName}
                  </h3>

                  {isPro && (
                    <span className="shrink-0 rounded-full bg-emerald-500 px-2 py-0.5 text-[9px] font-extrabold tracking-wide text-white">
                      PRO
                    </span>
                  )}
                </div>

                <p className="truncate text-xs text-slate-500">
                  {user.email || "View your profile"}
                </p>
              </div>

              <ChevronRight
                size={18}
                className="text-slate-400 transition group-hover:translate-x-0.5"
              />
            </Link>

            <div className="my-4 border-t border-blue-100" />

            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">
                Current plan
              </span>

              <span
                className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
                  isPro
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-blue-100 text-[#1554D1]"
                }`}
              >
                {currentPlan}
              </span>
            </div>

            <div className="mt-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">
                  AI usage
                </span>

                <span className="text-xs font-bold text-slate-700">
                  {requestsUsed}/
                  {isUnlimited
                    ? "∞"
                    : requestsLimit}
                </span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    percentage >= 90 &&
                    !isUnlimited
                      ? "bg-red-500"
                      : percentage >= 70 &&
                          !isUnlimited
                        ? "bg-amber-500"
                        : "bg-[#1554D1]"
                  }`}
                  style={{
                    width: `${percentage}%`,
                  }}
                />
              </div>

              <p className="mt-2 text-[11px] text-slate-400">
                {isUnlimited
                  ? "Unlimited requests available"
                  : `${Math.max(
                      0,
                      Number(requestsLimit) -
                        requestsUsed
                    )} requests remaining`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main navigation */}
      <nav className="flex-1 overflow-y-auto px-4 py-6">
        <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
          Workspace
        </p>

        <ul className="space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const locked = item.pro && !isPro;
            const active = isActivePath(item.path);

            return (
              <li key={item.path}>
                <Link
                  to={
                    locked
                      ? "/pricing"
                      : item.path
                  }
                  onClick={closeMobileMenu}
                  className={`group flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold transition-all ${
                    active
                      ? "bg-[#1554D1] text-white shadow-md shadow-blue-200"
                      : "text-slate-600 hover:bg-blue-50 hover:text-[#1554D1]"
                  }`}
                >
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition ${
                      active
                        ? "bg-white/15"
                        : "bg-slate-100 text-slate-500 group-hover:bg-blue-100 group-hover:text-[#1554D1]"
                    }`}
                  >
                    <Icon size={18} />
                  </span>

                  <span className="min-w-0 flex-1 truncate">
                    {item.name}
                  </span>

                  {locked && (
                    <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-amber-700">
                      <Lock size={11} />
                      Pro
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom navigation */}
      <div className="border-t border-slate-200 p-4">
        <div className="space-y-1.5">
          <Link
            to="/profile"
            onClick={closeMobileMenu}
            className={`flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold transition ${
              isActivePath("/profile")
                ? "bg-blue-50 text-[#1554D1]"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <UserCircle size={19} />
            Profile
          </Link>

          <Link
            to="/pricing"
            onClick={closeMobileMenu}
            className={`flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold transition ${
              isActivePath("/pricing")
                ? "bg-blue-50 text-[#1554D1]"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <CreditCard size={19} />
            Pricing
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600 transition hover:bg-red-500 hover:text-white"
          >
            <LogOut size={18} />
            Log out
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile dashboard bar */}
      <div className="fixed left-0 right-0 top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 shadow-sm backdrop-blur-md lg:hidden">
        <Link
          to="/dashboard"
          className="flex items-center gap-2.5"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1554D1] text-white">
            <Sparkles size={19} />
          </div>

          <span className="text-lg font-extrabold tracking-[0.1em] text-slate-900">
            GIGORA
          </span>
        </Link>

        <button
          type="button"
          onClick={() => setIsMobileOpen(true)}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition hover:bg-slate-200"
          aria-label="Open sidebar"
          aria-expanded={isMobileOpen}
        >
          <Menu size={23} />
        </button>
      </div>

      {/* Mobile overlay */}
      <div
        onClick={closeMobileMenu}
        className={`fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          isMobileOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      />

      {/* Mobile sidebar */}
      <aside
        className={`fixed bottom-0 left-0 top-0 z-50 w-[88%] max-w-[300px] shadow-2xl transition-transform duration-300 ease-out lg:hidden ${
          isMobileOpen
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
      >
        <SidebarContent />
      </aside>

      {/* Desktop sidebar */}
      <aside className="fixed bottom-0 left-0 top-0 z-40 hidden w-72 border-r border-slate-200 bg-white shadow-sm lg:block">
        <SidebarContent />
      </aside>
    </>
  );
}

export default Sidebar;import { useContext, useEffect, useMemo, useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  BarChart3,
  ChevronRight,
  CreditCard,
  FileText,
  History,
  LayoutDashboard,
  Lock,
  LogOut,
  Menu,
  Search,
  Sparkles,
  User,
  UserCircle,
  X,
} from "lucide-react";

import { AuthContext } from "../context/AuthContext";

function Sidebar({ usage }) {
  const { user, setUser } = useContext(AuthContext);

  const navigate = useNavigate();
  const location = useLocation();

  const [isMobileOpen, setIsMobileOpen] =
    useState(false);

  const currentPlan = (
    usage?.plan ||
    user?.plan ||
    "free"
  ).toLowerCase();

  const isPro = currentPlan === "pro";

  const displayName =
    user?.username ||
    user?.name ||
    user?.email?.split("@")[0] ||
    "User";

  const requestsUsed = Number(
    usage?.requests_used ?? 0
  );

  const requestsLimit = usage?.requests_limit ?? 5;

  const isUnlimited =
    requestsLimit === "Unlimited" ||
    requestsLimit === "unlimited" ||
    requestsLimit === 999;

  const percentage = useMemo(() => {
    if (isUnlimited) {
      return 100;
    }

    const numericLimit = Number(requestsLimit);

    if (!numericLimit || numericLimit <= 0) {
      return 0;
    }

    return Math.min(
      100,
      Math.max(
        0,
        (requestsUsed / numericLimit) * 100
      )
    );
  }, [
    isUnlimited,
    requestsLimit,
    requestsUsed,
  ]);

  const menuItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Profile Analyzer",
      path: "/profile-analyzer",
      icon: User,
    },
    {
      name: "Gig SEO",
      path: "/gig-seo",
      icon: Search,
    },
    {
      name: "Proposal Generator",
      path: "/proposal-generator",
      icon: FileText,
    },
    {
      name: "AI Compare",
      path: "/proposal-compare",
      icon: Sparkles,
      pro: true,
    },
    {
      name: "History",
      path: "/history",
      icon: History,
    },
    {
      name: "Usage",
      path: "/usage",
      icon: BarChart3,
    },
  ];

  const closeMobileMenu = () => {
    setIsMobileOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem(
      "gigora_access_token"
    );
    localStorage.removeItem("gigora_user");

    setUser(null);
    closeMobileMenu();
    navigate("/login");
  };

  useEffect(() => {
    closeMobileMenu();
  }, [location.pathname]);

  useEffect(() => {
    if (!isMobileOpen) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileOpen]);

  const isActivePath = (path) => {
    return location.pathname === path;
  };

  const SidebarContent = () => (
    <div className="flex h-full flex-col bg-white">
      {/* Brand */}
      <div className="flex h-20 items-center justify-between border-b border-slate-200 px-5">
        <Link
          to="/"
          onClick={closeMobileMenu}
          className="group flex items-center gap-3"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#1554D1] text-white shadow-md shadow-blue-200 transition group-hover:scale-105">
            <Sparkles size={22} />
          </div>

          <div>
            <h1 className="text-xl font-extrabold tracking-[0.12em] text-slate-900">
              GIGORA
            </h1>

            <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
              Freelancer Assistant
            </p>
          </div>
        </Link>

        <button
          type="button"
          onClick={closeMobileMenu}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition hover:bg-slate-200 lg:hidden"
          aria-label="Close sidebar"
        >
          <X size={21} />
        </button>
      </div>

      {/* User and usage */}
      {user && (
        <div className="px-4 pt-5">
          <div className="overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-4 shadow-sm">
            <Link
              to="/profile"
              onClick={closeMobileMenu}
              className="group flex items-center gap-3"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#1554D1] text-white shadow-sm">
                <UserCircle size={24} />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="truncate text-sm font-bold text-slate-900">
                    {displayName}
                  </h3>

                  {isPro && (
                    <span className="shrink-0 rounded-full bg-emerald-500 px-2 py-0.5 text-[9px] font-extrabold tracking-wide text-white">
                      PRO
                    </span>
                  )}
                </div>

                <p className="truncate text-xs text-slate-500">
                  {user.email || "View your profile"}
                </p>
              </div>

              <ChevronRight
                size={18}
                className="text-slate-400 transition group-hover:translate-x-0.5"
              />
            </Link>

            <div className="my-4 border-t border-blue-100" />

            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">
                Current plan
              </span>

              <span
                className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
                  isPro
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-blue-100 text-[#1554D1]"
                }`}
              >
                {currentPlan}
              </span>
            </div>

            <div className="mt-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">
                  AI usage
                </span>

                <span className="text-xs font-bold text-slate-700">
                  {requestsUsed}/
                  {isUnlimited
                    ? "∞"
                    : requestsLimit}
                </span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    percentage >= 90 &&
                    !isUnlimited
                      ? "bg-red-500"
                      : percentage >= 70 &&
                          !isUnlimited
                        ? "bg-amber-500"
                        : "bg-[#1554D1]"
                  }`}
                  style={{
                    width: `${percentage}%`,
                  }}
                />
              </div>

              <p className="mt-2 text-[11px] text-slate-400">
                {isUnlimited
                  ? "Unlimited requests available"
                  : `${Math.max(
                      0,
                      Number(requestsLimit) -
                        requestsUsed
                    )} requests remaining`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main navigation */}
      <nav className="flex-1 overflow-y-auto px-4 py-6">
        <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
          Workspace
        </p>

        <ul className="space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const locked = item.pro && !isPro;
            const active = isActivePath(item.path);

            return (
              <li key={item.path}>
                <Link
                  to={
                    locked
                      ? "/pricing"
                      : item.path
                  }
                  onClick={closeMobileMenu}
                  className={`group flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold transition-all ${
                    active
                      ? "bg-[#1554D1] text-white shadow-md shadow-blue-200"
                      : "text-slate-600 hover:bg-blue-50 hover:text-[#1554D1]"
                  }`}
                >
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition ${
                      active
                        ? "bg-white/15"
                        : "bg-slate-100 text-slate-500 group-hover:bg-blue-100 group-hover:text-[#1554D1]"
                    }`}
                  >
                    <Icon size={18} />
                  </span>

                  <span className="min-w-0 flex-1 truncate">
                    {item.name}
                  </span>

                  {locked && (
                    <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-amber-700">
                      <Lock size={11} />
                      Pro
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom navigation */}
      <div className="border-t border-slate-200 p-4">
        <div className="space-y-1.5">
          <Link
            to="/profile"
            onClick={closeMobileMenu}
            className={`flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold transition ${
              isActivePath("/profile")
                ? "bg-blue-50 text-[#1554D1]"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <UserCircle size={19} />
            Profile
          </Link>

          <Link
            to="/pricing"
            onClick={closeMobileMenu}
            className={`flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold transition ${
              isActivePath("/pricing")
                ? "bg-blue-50 text-[#1554D1]"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <CreditCard size={19} />
            Pricing
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600 transition hover:bg-red-500 hover:text-white"
          >
            <LogOut size={18} />
            Log out
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile dashboard bar */}
      <div className="fixed left-0 right-0 top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 shadow-sm backdrop-blur-md lg:hidden">
        <Link
          to="/dashboard"
          className="flex items-center gap-2.5"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1554D1] text-white">
            <Sparkles size={19} />
          </div>

          <span className="text-lg font-extrabold tracking-[0.1em] text-slate-900">
            GIGORA
          </span>
        </Link>

        <button
          type="button"
          onClick={() => setIsMobileOpen(true)}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition hover:bg-slate-200"
          aria-label="Open sidebar"
          aria-expanded={isMobileOpen}
        >
          <Menu size={23} />
        </button>
      </div>

      {/* Mobile overlay */}
      <div
        onClick={closeMobileMenu}
        className={`fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          isMobileOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      />

      {/* Mobile sidebar */}
      <aside
        className={`fixed bottom-0 left-0 top-0 z-50 w-[88%] max-w-[300px] shadow-2xl transition-transform duration-300 ease-out lg:hidden ${
          isMobileOpen
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
      >
        <SidebarContent />
      </aside>

      {/* Desktop sidebar */}
      <aside className="fixed bottom-0 left-0 top-0 z-40 hidden w-72 border-r border-slate-200 bg-white shadow-sm lg:block">
        <SidebarContent />
      </aside>
    </>
  );
}

export default Sidebar;