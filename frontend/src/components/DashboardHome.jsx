import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  Crown,
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

  const requestsUsed = Number(
    usage?.requests_used ?? 0
  );

  const requestsLimit =
    usage?.requests_limit ?? 5;

  const isUnlimited =
    String(requestsLimit).toLowerCase() ===
      "unlimited" ||
    Number(requestsLimit) === 999;

  const remainingRequests = isUnlimited
    ? "∞"
    : Number(
        usage?.remaining ??
          Math.max(
            0,
            Number(requestsLimit) - requestsUsed
          )
      );

  const usagePercentage = useMemo(() => {
    if (isUnlimited) return 100;

    const limit = Number(requestsLimit);

    if (!limit || limit <= 0) return 0;

    return Math.min(
      100,
      Math.max(
        0,
        (requestsUsed / limit) * 100
      )
    );
  }, [
    isUnlimited,
    requestsLimit,
    requestsUsed,
  ]);

  const fetchUser = useCallback(async () => {
    const token = localStorage.getItem(
      "gigora_access_token"
    );

    if (!token) {
      navigate("/login");
      return false;
    }

    try {
      const response = await api.get(
        "/api/auth/me",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const fetchedUser = response.data.user;

      localStorage.setItem(
        "gigora_user",
        JSON.stringify(fetchedUser)
      );

      setUser(fetchedUser);

      return true;
    } catch (err) {
      console.error("Authentication error:", err);

      localStorage.removeItem(
        "gigora_access_token"
      );
      localStorage.removeItem("gigora_user");

      navigate("/login");

      return false;
    }
  }, [navigate]);

  const loadDashboard = useCallback(async () => {
    try {
      const [
        statsResponse,
        usageResponse,
      ] = await Promise.all([
        api.get("/api/history/stats"),
        api.get("/api/usage"),
      ]);

      setStats({
        profile:
          statsResponse.data?.profile ?? 0,
        proposal:
          statsResponse.data?.proposal ?? 0,
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
        err.response?.data?.detail ||
          "Dashboard information could not be loaded. Please refresh the page."
      );
    }
  }, []);

  useEffect(() => {
    const initializeDashboard = async () => {
      setLoading(true);

      const authenticated =
        await fetchUser();

      if (authenticated) {
        await loadDashboard();
      }

      setLoading(false);
    };

    initializeDashboard();
  }, [fetchUser, loadDashboard]);

  useEffect(() => {
    const refreshDashboard = () => {
      fetchUser();
      loadDashboard();
    };

    window.addEventListener(
      "dashboard-update",
      refreshDashboard
    );

    return () => {
      window.removeEventListener(
        "dashboard-update",
        refreshDashboard
      );
    };
  }, [fetchUser, loadDashboard]);

  const statCards = [
    {
      title: "Profile Analyses",
      value: stats.profile || 0,
      description:
        "Freelancer profiles reviewed",
      icon: User,
      path: "/profile-analyzer",
    },
    {
      title: "Proposals Generated",
      value: stats.proposal || 0,
      description:
        "Professional proposals created",
      icon: FileText,
      path: "/proposal-generator",
    },
    {
      title: "SEO Optimizations",
      value: stats.seo || 0,
      description:
        "Freelance gigs optimized",
      icon: Search,
      path: "/gig-seo",
    },
  ];

  const quickActions = [
    {
      title: "Profile Analyzer",
      description:
        "Review your freelancer profile and receive actionable recommendations to improve your visibility.",
      action: "Analyze profile",
      path: "/profile-analyzer",
      icon: User,
    },
    {
      title: "Gig SEO Optimizer",
      description:
        "Improve your gig title, description, and tags to attract more potential clients.",
      action: "Optimize gig",
      path: "/gig-seo",
      icon: Search,
    },
    {
      title: "Proposal Generator",
      description:
        "Create a personalized and professional proposal for your next freelance opportunity.",
      action: "Create proposal",
      path: "/proposal-generator",
      icon: FileText,
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-slate-50">
        <div className="mx-auto w-full max-w-[1500px] animate-pulse space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="h-72 rounded-3xl bg-slate-200" />

          <div className="grid gap-5 md:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-40 rounded-2xl bg-white"
              />
            ))}
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-64 rounded-2xl bg-white"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-slate-50">
      <div className="mx-auto w-full max-w-[1500px] px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
        {/* Hero and usage */}
        <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          {/* Welcome card */}
          <article className="relative min-h-[300px] overflow-hidden rounded-3xl bg-gradient-to-br from-[#1554D1] via-[#174DB7] to-[#102F78] p-6 text-white shadow-xl shadow-blue-900/10 sm:p-8 lg:p-10">
            <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-white/10" />
            <div className="absolute right-28 top-8 h-20 w-20 rounded-full bg-white/5" />
            <div className="absolute -bottom-28 left-1/3 h-60 w-60 rounded-full bg-blue-300/10" />

            <div className="relative z-10 flex h-full flex-col justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold backdrop-blur-sm">
                  <Sparkles size={15} />
                  AI Freelancer Workspace
                </div>

                <div className="mt-7 flex flex-wrap items-center gap-3">
                  <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
                    Welcome, {displayName}
                  </h1>

                  {isPro && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400 px-3 py-1.5 text-xs font-extrabold text-emerald-950 shadow-sm">
                      <Crown size={14} />
                      PRO
                    </span>
                  )}
                </div>

                <p className="mt-4 max-w-2xl text-sm leading-7 text-blue-100 sm:text-base lg:text-lg">
                  Improve your freelancer profile,
                  optimize your gigs, and generate
                  stronger proposals using Gigora's
                  AI-powered tools.
                </p>
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      "/proposal-generator"
                    )
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-[#1554D1] shadow-lg transition duration-200 hover:-translate-y-0.5 hover:bg-blue-50 hover:shadow-xl active:scale-[0.98]"
                >
                  <Zap size={18} />
                  Create Proposal
                </button>

                <button
                  type="button"
                  onClick={() =>
                    navigate("/ai-compare")
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/10 px-6 py-3.5 text-sm font-bold text-white backdrop-blur-sm transition duration-200 hover:bg-white/20 active:scale-[0.98]"
                >
                  <Sparkles size={18} />
                  Compare with AI
                </button>
              </div>
            </div>
          </article>

          {/* Usage card */}
          <article className="flex min-h-[300px] flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:p-7">
            <div>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-500">
                    Current usage
                  </p>

                  <div className="mt-2 flex items-center gap-2">
                    <h2 className="text-2xl font-extrabold text-slate-900">
                      {isPro
                        ? "Pro plan"
                        : "Free plan"}
                    </h2>

                    <span
                      className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide ${
                        isPro
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {currentPlan}
                    </span>
                  </div>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-[#1554D1]">
                  <BarChart3 size={23} />
                </div>
              </div>

              <div className="mt-8">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                  Requests remaining
                </p>

                <div className="mt-2 flex items-end gap-2">
                  <p className="text-5xl font-extrabold tracking-tight text-slate-900">
                    {remainingRequests}
                  </p>

                  {!isUnlimited && (
                    <span className="pb-1.5 text-sm font-medium text-slate-400">
                      today
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-8">
              <div className="mb-2 flex items-center justify-between text-xs">
                <span className="font-medium text-slate-500">
                  Daily usage
                </span>

                <span className="font-bold text-slate-700">
                  {requestsUsed}/
                  {isUnlimited
                    ? "∞"
                    : requestsLimit}
                </span>
              </div>

              <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-[#1554D1] transition-all duration-500"
                  style={{
                    width: `${usagePercentage}%`,
                  }}
                />
              </div>

              <p className="mt-3 text-xs leading-5 text-slate-500">
                {isUnlimited
                  ? "You have unlimited AI requests with your Pro plan."
                  : `${requestsUsed} requests used today.`}
              </p>
            </div>
          </article>
        </section>

        {error && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {/* Statistics */}
        <section className="mt-7">
          <div className="mb-4 flex items-end justify-between">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#1554D1]">
                Overview
              </p>

              <h2 className="mt-1 text-2xl font-extrabold text-slate-900">
                Your activity
              </h2>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {statCards.map((item) => {
              const Icon = item.icon;

              return (
                <button
                  key={item.title}
                  type="button"
                  onClick={() =>
                    navigate(item.path)
                  }
                  className="group rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm transition duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-500">
                        {item.title}
                      </p>

                      <p className="mt-2 text-4xl font-extrabold tracking-tight text-slate-900">
                        {item.value}
                      </p>
                    </div>

                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-[#1554D1] transition duration-200 group-hover:bg-[#1554D1] group-hover:text-white">
                      <Icon size={22} />
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
                    <p className="text-xs font-medium text-slate-500">
                      {item.description}
                    </p>

                    <ArrowRight
                      size={17}
                      className="shrink-0 text-slate-400 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-[#1554D1]"
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Quick actions */}
        <section className="mt-10">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#1554D1]">
              AI tools
            </p>

            <h2 className="mt-1 text-2xl font-extrabold text-slate-900">
              Quick actions
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Choose a tool to improve your
              freelancer profile, gigs, or job
              proposals.
            </p>
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-3">
            {quickActions.map((item) => {
              const Icon = item.icon;

              return (
                <button
                  key={item.title}
                  type="button"
                  onClick={() =>
                    navigate(item.path)
                  }
                  className="group flex min-h-[250px] flex-col rounded-3xl border border-slate-200 bg-white p-6 text-left shadow-sm transition duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl"
                >
                  <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-blue-50 p-3.5 text-[#1554D1] transition duration-200 group-hover:bg-[#1554D1] group-hover:text-white">
                    <Icon size={24} />
                  </div>

                  <h3 className="mt-6 text-xl font-extrabold text-slate-900">
                    {item.title}
                  </h3>

                  <p className="mt-3 flex-1 text-sm leading-6 text-slate-600">
                    {item.description}
                  </p>

                  <div className="mt-6 flex items-center gap-2 text-sm font-bold text-[#1554D1]">
                    {item.action}

                    <ArrowRight
                      size={17}
                      className="transition-transform duration-200 group-hover:translate-x-1"
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Recent history */}
        <section className="mt-10">
          <RecentHistory />
        </section>
      </div>
    </main>
  );
}

export default DashboardHome;