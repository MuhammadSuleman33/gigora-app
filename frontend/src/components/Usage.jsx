import { useEffect, useState } from "react";
import api from "../services/api";

function Usage() {
  const [stats, setStats] = useState({
    profile: 0,
    seo: 0,
    proposal: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("gigora_access_token");

        const response = await api.get("/api/history/stats", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setStats(response.data);

        window.dispatchEvent(new Event("dashboard-update"));
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#1A56DB] border-t-transparent"></div>
      </div>
    );
  }

  const total =
    (stats.profile || 0) +
    (stats.seo || 0) +
    (stats.proposal || 0);

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#1E3A5F]">
          Usage Statistics
        </h1>

        <p className="mt-2 text-gray-600">
          Track your AI tool usage and monitor your productivity.
        </p>
      </div>

      {/* Summary Card */}
      <div className="mb-8 rounded-2xl bg-gradient-to-r from-[#1A56DB] to-[#2563EB] p-8 text-white shadow-lg">
        <p className="text-lg opacity-90">
          Total AI Requests
        </p>

        <h2 className="mt-2 text-5xl font-bold">
          {total}
        </h2>

        <p className="mt-2 text-sm opacity-80">
          Total requests across all Gigora AI tools.
        </p>
      </div>

      {/* Usage Cards */}
      <div className="grid gap-6 md:grid-cols-3">

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-2 hover:shadow-xl">
          <div className="mb-4 text-4xl">👤</div>

          <h3 className="text-lg font-semibold text-[#1E3A5F]">
            Profile Analyzer
          </h3>

          <p className="mt-2 text-gray-500">
            AI profile reviews completed
          </p>

          <h2 className="mt-6 text-5xl font-bold text-[#1A56DB]">
            {stats.profile || 0}
          </h2>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-2 hover:shadow-xl">
          <div className="mb-4 text-4xl">🚀</div>

          <h3 className="text-lg font-semibold text-[#1E3A5F]">
            Gig SEO
          </h3>

          <p className="mt-2 text-gray-500">
            SEO optimizations generated
          </p>

          <h2 className="mt-6 text-5xl font-bold text-[#1A56DB]">
            {stats.seo || 0}
          </h2>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-2 hover:shadow-xl">
          <div className="mb-4 text-4xl">✍️</div>

          <h3 className="text-lg font-semibold text-[#1E3A5F]">
            Proposal Generator
          </h3>

          <p className="mt-2 text-gray-500">
            AI proposals created
          </p>

          <h2 className="mt-6 text-5xl font-bold text-[#1A56DB]">
            {stats.proposal || 0}
          </h2>
        </div>

      </div>

      {/* Insights */}
      <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
        <h2 className="mb-6 text-2xl font-bold text-[#1E3A5F]">
          Usage Overview
        </h2>

        <div className="space-y-5">

          <div>
            <div className="mb-2 flex justify-between text-sm">
              <span>Profile Analyzer</span>
              <span>{stats.profile}</span>
            </div>

            <div className="h-2 rounded-full bg-gray-200">
              <div
                className="h-2 rounded-full bg-[#1A56DB]"
                style={{
                  width: `${total ? (stats.profile / total) * 100 : 0}%`,
                }}
              />
            </div>
          </div>

          <div>
            <div className="mb-2 flex justify-between text-sm">
              <span>Gig SEO</span>
              <span>{stats.seo}</span>
            </div>

            <div className="h-2 rounded-full bg-gray-200">
              <div
                className="h-2 rounded-full bg-emerald-500"
                style={{
                  width: `${total ? (stats.seo / total) * 100 : 0}%`,
                }}
              />
            </div>
          </div>

          <div>
            <div className="mb-2 flex justify-between text-sm">
              <span>Proposal Generator</span>
              <span>{stats.proposal}</span>
            </div>

            <div className="h-2 rounded-full bg-gray-200">
              <div
                className="h-2 rounded-full bg-amber-500"
                style={{
                  width: `${total ? (stats.proposal / total) * 100 : 0}%`,
                }}
              />
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}

export default Usage;