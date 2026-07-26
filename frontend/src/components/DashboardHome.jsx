import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import RecentHistory from "../components/RecentHistory";


function getSavedUser() {
  const savedUser = localStorage.getItem("gigora_user");

  if (!savedUser) {
    return null;
  }

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
  const [error, setError] = useState("");
  const [stats, setStats] = useState({});
  
 const [usage, setUsage] = useState({
  requests_used: 0,
  requests_limit: 5,
  remaining: 5,
  plan: "free",
});

useEffect(() => {
  api.get("/api/history/stats")
    .then((res) => setStats(res.data))
    .catch(() => {});

  api.get("/api/usage/")
    .then((res) => {
      console.log("Usage API:", res.data);
      setUsage(res.data);
    })
    .catch(() => {});
}, []);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("gigora_access_token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const response = await api.get("/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        localStorage.setItem("gigora_user", JSON.stringify(response.data.user));
        setUser(response.data.user);
        setError("");
      } catch (err) {
        localStorage.removeItem("gigora_access_token");
        localStorage.removeItem("gigora_user");
        setError("Your session has expired. Please login again.");
        navigate("/login");
      }
    };

    fetchUser();
  }, [navigate]);
  const loadDashboard = async () => {
  try {
    const [statsRes, usageRes] = await Promise.all([
      api.get("/api/history/stats"),
      api.get("/api/usage/"),
    ]);

    setStats(statsRes.data);
    setUsage(usageRes.data);
  } catch (err) {
    console.error(err);
  }
};
useEffect(() => {
  loadDashboard();

  const refresh = () => {
    loadDashboard();
  };

  window.addEventListener("dashboard-update", refresh);

  return () => {
    window.removeEventListener("dashboard-update", refresh);
  };
}, []);
return (
  <div className="ml-72 min-h-screen bg-slate-50 p-6 md:p-10">
    {/* Welcome Section */}
    <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-3xl font-bold text-[#1E3A5F] flex items-center gap-3">
          {user?.name ? `Welcome, ${user.name}` : "Welcome"}

          {usage?.plan === "pro" && (
            <span className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white">
              PRO
            </span>
          )}
        </h1>

        <p className="mt-2 text-gray-600">
          Manage your freelance business using AI-powered tools.
        </p>
      </div>

      <div className="rounded-xl bg-white p-5 shadow-md border border-gray-100 w-full md:w-72">
        <h3 className="text-sm font-semibold text-gray-500">
          Requests Remaining
        </h3>

        <p className="mt-2 text-3xl font-bold text-[#1A56DB]">
          {usage.remaining}/{usage.requests_limit}
        </p>

        <div className="mt-4 h-2 overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full rounded-full bg-[#1A56DB]"
            style={{
              width: `${
                (usage.requests_used / usage.requests_limit) * 100
              }%`,
            }}
          ></div>
        </div>

        <p className="mt-2 text-sm text-gray-500">
          {usage.requests_used} requests used today
        </p>
      </div>
    </div>

    {error && (
      <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-600">
        {error}
      </div>
    )}

    {/* Statistics */}
    <div className="grid gap-6 md:grid-cols-3">
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
        <p className="text-sm text-gray-500">
          Profile Analyses
        </p>

        <h2 className="mt-3 text-4xl font-bold text-[#1A56DB]">
          {stats.profile || 0}
        </h2>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
        <p className="text-sm text-gray-500">
          Proposals Generated
        </p>

        <h2 className="mt-3 text-4xl font-bold text-[#1A56DB]">
          {stats.proposal || 0}
        </h2>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
        <p className="text-sm text-gray-500">
          SEO Optimizations
        </p>

        <h2 className="mt-3 text-4xl font-bold text-[#1A56DB]">
          {stats.seo || 0}
        </h2>
      </div>
    </div>

    {/* Quick Actions */}
    <div className="mt-10">
      <h2 className="mb-6 text-2xl font-bold text-[#1E3A5F]">
        Quick Actions
      </h2>

      <div className="grid gap-6 md:grid-cols-3">

        <div
          onClick={() => navigate("/profile-analyzer")}
          className="cursor-pointer rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-2 hover:border-[#1A56DB] hover:shadow-xl"
        >
          <div className="mb-4 text-4xl">👤</div>

          <h3 className="text-xl font-semibold text-[#1E3A5F]">
            Profile Analyzer
          </h3>

          <p className="mt-2 text-gray-600">
            Analyze your freelancer profile and receive AI-powered recommendations.
          </p>

          <div className="mt-6 font-medium text-[#1A56DB]">
            Start Analysis →
          </div>
        </div>

        <div
          onClick={() => navigate("/gig-seo")}
          className="cursor-pointer rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-2 hover:border-[#1A56DB] hover:shadow-xl"
        >
          <div className="mb-4 text-4xl">🚀</div>

          <h3 className="text-xl font-semibold text-[#1E3A5F]">
            Gig SEO
          </h3>

          <p className="mt-2 text-gray-600">
            Optimize your Fiverr or Upwork gig for maximum visibility.
          </p>

          <div className="mt-6 font-medium text-[#1A56DB]">
            Optimize Gig →
          </div>
        </div>

        <div
          onClick={() => navigate("/proposal-generator")}
          className="cursor-pointer rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-2 hover:border-[#1A56DB] hover:shadow-xl"
        >
          <div className="mb-4 text-4xl">✍️</div>

          <h3 className="text-xl font-semibold text-[#1E3A5F]">
            Proposal Generator
          </h3>

          <p className="mt-2 text-gray-600">
            Create professional AI proposals that help you win more projects.
          </p>

          <div className="mt-6 font-medium text-[#1A56DB]">
            Generate Proposal →
          </div>
        </div>

      </div>
    </div>

    {/* Recent History */}
    <div className="mt-10 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <h2 className="mb-6 text-2xl font-bold text-[#1E3A5F]">
        Recent Activity
      </h2>

      <RecentHistory />
    </div>
  </div>
);
}

export default DashboardHome;