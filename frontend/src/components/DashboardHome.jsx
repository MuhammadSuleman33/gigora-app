import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  FileText,
  Search,
  Sparkles,
  User,
  Zap,
} from "lucide-react";

import api from "../services/api";
import RecentHistory from "./RecentHistory";

function getSavedUser() {
  const savedUser = localStorage.getItem("gigora_user");

  if (!savedUser) return null;

  try {
    return JSON.parse(savedUser);
  } catch {
    localStorage.removeItem("gigora_user");
    return null;
  }
}

function DashboardHome() {
  const navigate = useNavigate();

  const [user, setUser] = useState(getSavedUser);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [stats, setStats] = useState({
    profile: 0,
    proposal: 0,
    seo: 0,
  });

  const [usage, setUsage] = useState({
    requests_used: 0,
    requests_limit: 5,
    remaining: 5,
    plan: "free",
  });

  const displayName =
    user?.name ||
    user?.username ||
    user?.email?.split("@")[0] ||
    "Freelancer";

  const currentPlan = String(
    usage?.plan || user?.plan || "free"
  ).toLowerCase();

  const isPro = currentPlan === "pro";

  const requestsUsed = Number(usage?.requests_used ?? 0);
  const requestsLimit = usage?.requests_limit ?? 5;

  const isUnlimited =
    String(requestsLimit).toLowerCase() === "unlimited" ||
    Number(requestsLimit) === 999;

  const remainingRequests = isUnlimited
    ? "∞"
    : Number(
        usage?.remaining ??
          Math.max(0, Number(requestsLimit) - requestsUsed)
      );

  const usagePercentage = useMemo(() => {
    if (isUnlimited) return 100;

    const limit = Number(requestsLimit);

    if (!limit || limit <= 0) return 0;

    return Math.min(
      100,
      Math.max(0, (requestsUsed / limit) * 100)
    );
  }, [isUnlimited, requestsLimit, requestsUsed]);

  const fetchUser = useCallback(async () => {
    const token = localStorage.getItem("gigora_access_token");

    if (!token) {
      navigate("/login");
      return false;
    }

    try {
      const response = await api.get("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const fetchedUser = response.data.user;

      localStorage.setItem(
        "gigora_user",
        JSON.stringify(fetchedUser)
      );

      setUser(fetchedUser);
      return true;
    } catch {
      localStorage.removeItem("gigora_access_token");
      localStorage.removeItem("gigora_user");

      navigate("/login");
      return false;
    }
  }, [navigate]);

  const loadDashboard = useCallback(async () => {
    try {
      const [statsResponse, usageResponse] = await Promise.all([
        api.get("/api/history/stats"),
        api.get("/api/usage/"),
      ]);

      setStats({
        profile: statsResponse.data?.profile ?? 0,
        proposal: statsResponse.data?.proposal ?? 0,
        seo: statsResponse.data?.seo ?? 0,
      });

      setUsage((previous) => ({
        ...previous,
        ...usageResponse.data,
      }));

      setError("");
    } catch (err) {
      console.error("Dashboard error:", err);

      setError(
        "Dashboard information could not be loaded. Please refresh the page."
      );
    }
  }, []);

  useEffect(() => {
    const initializeDashboard = async () => {
      setLoading(true);

      const authenticated = await fetchUser();

      if (authenticated) {
        await loadDashboard();
      }

      setLoading(false);
    };

    initializeDashboard();
  }, [fetchUser, loadDashboard]);

  useEffect(() => {
    const refreshDashboard = () => {
      loadDashboard();
    };

    window.addEventListener("dashboard-update", refreshDashboard);

    return () => {
      window.removeEventListener("dashboard-update", refreshDashboard);
    };
  }, [loadDashboard]);

  const statCards = [
    {
      title: "Profile Analyses",
      value: stats.profile || 0,
      icon: User,
      path: "/profile-analyzer",
    },
    {
      title: "Proposals Generated",
      value: stats.proposal || 0,
      icon: FileText,
      path: "/proposal-generator",
    },
    {
      title: "SEO Optimizations",
      value: stats.seo || 0,
      icon: Search,
      path: "/gig-seo",
    },
  ];

  const quickActions = [
    {
      title: "Profile Analyzer",
      description:
        "Analyze your freelancer profile and receive practical AI recommendations.",
      action: "Analyze Profile",
      path: "/profile-analyzer",
      icon: User,
    },
    {
      title: "Gig SEO",
      description:
        "Improve your title, tags, and description for better visibility.",
      action: "Optimize Gig",
      path: "/gig-seo",
      icon: Search,
    },
    {
      title: "Proposal Generator",
      description:
        "Create a professional proposal for your next freelance opportunity.",
      action: "Create Proposal",
      path: "/proposal-generator",
      icon: FileText,
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-slate-50 px-4 py-5">
        <div className="mx-auto w-full max-w-7xl animate-pulse space-y-4">
          <div className="h-52 w-full rounded-2xl bg-slate-200" />

          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-32 w-full rounded-2xl bg-white"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-slate-50">
      <div className="mx-auto w-full max-w-7xl px-3 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        {/* Welcome */}
        <section className="relative w-full overflow-hidden rounded-2xl bg-gradient-to-br from-[#1554D1] via-[#174DB7] to-[#102F78] px-4 py-11 text-white shadow-lg sm:rounded-3xl sm:p-8">
          <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-white/10" />
          <div className="absolute -bottom-16 -left-10 h-36 w-36 rounded-full bg-white/5" />

          <div className="relative">
            <div className="inline-flex max-w-full items-center gap-2 rounded-full bg-white/15 px-3 py-2.5 text-[11px] font-semibold ring-1 ring-white/20 sm:text-xs">
              <Sparkles size={14} className="shrink-0" />
              <span className="truncate">AI Freelancer Workspace</span>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <h1 className="min-w-0 break-words text-2xl font-bold leading-tight sm:text-3xl lg:text-4xl">
                Welcome, {displayName}
              </h1>

              {isPro && (
                <span className="shrink-0 rounded-full bg-emerald-400 px-3 py-1 text-[10px] font-extrabold text-emerald-950">
                  PRO
                </span>
              )}
            </div>

            <p className="mt-3 max-w-xl text-sm leading-6 text-blue-100 sm:text-base">
              Improve your profile, optimize your gigs, and create stronger
              proposals with AI-powered tools.
            </p>

            <button
              type="button"
              onClick={() => navigate("/proposal-generator")}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-[#1554D1] shadow-md transition active:scale-[0.98] sm:w-auto sm:px-6"
            >
              <Zap size={18} />
              Create Proposal
            </button>
          </div>
        </section>

        {error && (
          <div className="mt-4 w-full rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Usage */}
        <section className="mt-4 w-full">
          <article className="w-full rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-500">
                  Requests Remaining
                </p>

                <p className="mt-1 text-3xl font-extrabold text-slate-900">
                  {remainingRequests}
                </p>
              </div>

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#1554D1]">
                <BarChart3 size={21} />
              </div>
            </div>

            <div className="mt-4">
              <div className="mb-2 flex items-center justify-between text-xs">
                <span className="text-slate-500">Daily usage</span>

                <span className="font-bold text-slate-700">
                  {requestsUsed}/{isUnlimited ? "∞" : requestsLimit}
                </span>
              </div>

              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-[#1554D1] transition-all duration-500"
                  style={{ width: `${usagePercentage}%` }}
                />
              </div>

              <p className="mt-2 text-xs text-slate-500">
                {isUnlimited
                  ? "Unlimited requests available"
                  : `${requestsUsed} requests used today`}
              </p>
            </div>
          </article>
        </section>

        {/* Statistics */}
        <section className="mt-4 grid w-full grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {statCards.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.title}
                type="button"
                onClick={() => navigate(item.path)}
                className="flex w-full min-w-0 items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition active:scale-[0.98] sm:block sm:p-5"
              >
                <div className="min-w-0">
                  <p className="break-words text-sm font-medium text-slate-500">
                    {item.title}
                  </p>

                  <p className="mt-1 text-3xl font-extrabold text-slate-900">
                    {item.value}
                  </p>
                </div>

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#1554D1] sm:mt-4">
                  <Icon size={21} />
                </div>
              </button>
            );
          })}
        </section>

        {/* Quick Actions */}
        <section className="mt-8 w-full">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#1554D1]">
            AI Tools
          </p>

          <h2 className="mt-1 text-xl font-bold text-slate-900 sm:text-2xl">
            Quick Actions
          </h2>

          <div className="mt-4 grid w-full grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {quickActions.map((item) => {
              const Icon = item.icon;

              return (
                <button
                  key={item.title}
                  type="button"
                  onClick={() => navigate(item.path)}
                  className="w-full min-w-0 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition active:scale-[0.99] sm:p-6"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#1554D1]">
                      <Icon size={21} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="break-words text-base font-bold text-slate-900 sm:text-lg">
                        {item.title}
                      </h3>

                      <p className="mt-1 break-words text-sm leading-5 text-slate-600 sm:mt-2 sm:leading-6">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-2 text-sm font-bold text-[#1554D1]">
                    {item.action}
                    <ArrowRight size={17} />
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Recent History */}
        <section className="mt-8 w-full min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="mb-5">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#1554D1]">
              Activity
            </p>

            <div className="mt-1 flex items-center justify-between gap-3">
              <h2 className="min-w-0 text-xl font-bold text-slate-900 sm:text-2xl">
                Recent History
              </h2>

              <button
                type="button"
                onClick={() => navigate("/history")}
                className="shrink-0 rounded-lg bg-blue-50 px-3 py-2 text-xs font-bold text-[#1554D1] sm:text-sm"
              >
                View All
              </button>
            </div>
          </div>

          <div className="w-full min-w-0 overflow-x-auto">
            <RecentHistory />
          </div>
        </section>
      </div>
    </div>
  );
}

export default DashboardHome;