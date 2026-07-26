import { useContext, useEffect, useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  ChevronRight,
  LogOut,
  Menu,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";

import { AuthContext } from "../context/AuthContext";

function Navbar() {
  const { user, setUser } = useContext(AuthContext);

  const navigate = useNavigate();
  const location = useLocation();

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  useEffect(() => {
    closeMenu();
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen
      ? "hidden"
      : "auto";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isMenuOpen]);

  const handleLogout = () => {
    localStorage.removeItem("gigora_access_token");
    localStorage.removeItem("gigora_user");

    setUser(null);
    closeMenu();
    navigate("/login");
  };

  const scrollToFeatures = () => {
    const section = document.getElementById("solutions");

    if (section) {
      section.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  const handleFeaturesClick = () => {
    closeMenu();

    if (location.pathname === "/") {
      scrollToFeatures();
      return;
    }

    navigate("/");

    setTimeout(() => {
      scrollToFeatures();
    }, 150);
  };

  const displayName =
    user?.username ||
    user?.name ||
    user?.email?.split("@")[0] ||
    "User";

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#1554d1]/95 text-white shadow-lg backdrop-blur-md">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand */}
          <Link
            to="/"
            onClick={closeMenu}
            className="group flex items-center gap-3"
            aria-label="Go to Gigora homepage"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/20 transition group-hover:bg-white/20">
              <Sparkles size={23} />
            </div>

            <div>
              <span className="block text-2xl font-bold tracking-[0.12em]">
                GIGORA
              </span>

              <span className="hidden text-[10px] font-medium uppercase tracking-[0.2em] text-blue-100 sm:block">
                AI tools for freelancers
              </span>
            </div>
          </Link>

          {/* Desktop Center Navigation */}
          <nav className="hidden items-center rounded-2xl bg-white/10 p-1.5 ring-1 ring-white/10 lg:flex">
            <button
              type="button"
              onClick={handleFeaturesClick}
              className="rounded-xl px-5 py-2.5 text-sm font-semibold transition hover:bg-white/15"
            >
              Features
            </button>

            <Link
              to="/pricing"
              className="rounded-xl px-5 py-2.5 text-sm font-semibold transition hover:bg-white/15"
            >
              Pricing
            </Link>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden items-center gap-3 lg:flex">
            {!user ? (
              <>
                <Link
                  to="/login"
                  className="rounded-xl px-4 py-2.5 text-sm font-semibold transition hover:bg-white/10"
                >
                  Log in
                </Link>

                <Link
                  to="/signup"
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-[#1554d1] shadow-md transition hover:-translate-y-0.5 hover:bg-blue-50 hover:shadow-lg"
                >
                  Get Started
                  <ChevronRight size={17} />
                </Link>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => navigate("/profile")}
                  className="flex max-w-56 items-center gap-3 rounded-xl bg-white/10 px-3 py-2 ring-1 ring-white/10 transition hover:bg-white/15"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/15">
                    <UserRound size={18} />
                  </div>

                  <div className="min-w-0 text-left">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-semibold">
                        {displayName}
                      </span>

                      {user.plan === "pro" && (
                        <span className="rounded-full bg-emerald-400 px-2 py-0.5 text-[10px] font-extrabold tracking-wide text-emerald-950">
                          PRO
                        </span>
                      )}
                    </div>

                    <p className="truncate text-xs text-blue-100">
                      View profile
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#103d9c] transition hover:bg-[#0d347f]"
                  aria-label="Log out"
                  title="Log out"
                >
                  <LogOut size={19} />
                </button>
              </>
            )}
          </div>

          {/* Mobile Toggle */}
          <button
            type="button"
            onClick={() =>
              setIsMenuOpen((current) => !current)
            }
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15 transition hover:bg-white/20 lg:hidden"
            aria-label={
              isMenuOpen
                ? "Close navigation menu"
                : "Open navigation menu"
            }
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? (
              <X size={25} />
            ) : (
              <Menu size={25} />
            )}
          </button>
        </div>
      </header>

      {/* Mobile Overlay */}
      <div
        onClick={closeMenu}
        className={`fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          isMenuOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      />

      {/* Mobile Drawer */}
      <aside
        className={`fixed right-0 top-0 z-50 h-full w-[88%] max-w-sm bg-white shadow-2xl transition-transform duration-300 ease-out lg:hidden ${
          isMenuOpen
            ? "translate-x-0"
            : "translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Drawer Header */}
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1554d1] text-white">
                <Sparkles size={21} />
              </div>

              <div>
                <p className="font-bold tracking-[0.1em] text-slate-900">
                  GIGORA
                </p>

                <p className="text-xs text-slate-500">
                  AI tools for freelancers
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={closeMenu}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition hover:bg-slate-200"
              aria-label="Close menu"
            >
              <X size={22} />
            </button>
          </div>

          {/* Drawer Content */}
          <div className="flex-1 overflow-y-auto px-5 py-6">
            {user && (
              <button
                type="button"
                onClick={() => {
                  closeMenu();
                  navigate("/profile");
                }}
                className="mb-6 flex w-full items-center gap-3 rounded-2xl bg-blue-50 p-4 text-left ring-1 ring-blue-100"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#1554d1] text-white">
                  <UserRound size={22} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-bold text-slate-900">
                      {displayName}
                    </p>

                    {user.plan === "pro" && (
                      <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-extrabold text-white">
                        PRO
                      </span>
                    )}
                  </div>

                  <p className="truncate text-sm text-slate-500">
                    {user.email || "Manage your account"}
                  </p>
                </div>

                <ChevronRight
                  size={19}
                  className="text-slate-400"
                />
              </button>
            )}

            <nav className="space-y-2">
              <button
                type="button"
                onClick={handleFeaturesClick}
                className="flex w-full items-center justify-between rounded-xl px-4 py-3.5 text-left font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Features
                <ChevronRight
                  size={18}
                  className="text-slate-400"
                />
              </button>

              <Link
                to="/pricing"
                onClick={closeMenu}
                className="flex items-center justify-between rounded-xl px-4 py-3.5 font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Pricing
                <ChevronRight
                  size={18}
                  className="text-slate-400"
                />
              </Link>
            </nav>

            {!user && (
              <div className="mt-8 space-y-3 border-t border-slate-200 pt-6">
                <Link
                  to="/login"
                  onClick={closeMenu}
                  className="flex w-full items-center justify-center rounded-xl border border-slate-300 px-4 py-3 font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  Log in
                </Link>

                <Link
                  to="/signup"
                  onClick={closeMenu}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1554d1] px-4 py-3 font-bold text-white shadow-md transition hover:bg-[#1046b5]"
                >
                  Create Free Account
                  <ChevronRight size={18} />
                </Link>
              </div>
            )}
          </div>

          {/* Drawer Footer */}
          {user && (
            <div className="border-t border-slate-200 p-5">
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 font-bold text-white transition hover:bg-slate-800"
              >
                <LogOut size={18} />
                Log out
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

export default Navbar;