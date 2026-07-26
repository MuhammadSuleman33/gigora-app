import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function RecentHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const truncate = (text, max = 120) => {
    if (!text) return "No preview available.";
    return text.length > max ? text.slice(0, max) + "..." : text;
  };

  const getBadgeColor = (tool) => {
    switch ((tool || "").toLowerCase()) {
      case "profile":
        return "bg-green-100 text-green-700";
      case "seo":
        return "bg-blue-100 text-blue-700";
      case "proposal":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const loadHistory = async () => {
    try {
      const response = await api.get("/api/history/");
      const data = response.data;

      const historyData = Array.isArray(data)
        ? data
        : data.data || [];

      setHistory(historyData.slice(0, 3));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();

    const refresh = () => loadHistory();

    window.addEventListener("dashboard-update", refresh);

    return () =>
      window.removeEventListener("dashboard-update", refresh);
  }, []);

  if (loading) {
    return (
      <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
        <div className="h-6 w-52 animate-pulse rounded bg-gray-200 mb-6"></div>

        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="mb-4 rounded-xl border border-gray-200 p-4"
          >
            <div className="mb-3 h-4 w-32 animate-pulse rounded bg-gray-200"></div>
            <div className="mb-2 h-3 w-full animate-pulse rounded bg-gray-200"></div>
            <div className="h-3 w-3/4 animate-pulse rounded bg-gray-200"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <section className="mt-10 rounded-2xl bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#1E3A5F]">
            Recent Activity
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Your latest AI-generated work.
          </p>
        </div>

        <Link
          to="/history"
          className="rounded-lg bg-[#1A56DB] px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          View All
        </Link>
      </div>

      {history.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 py-12 text-center">
          <div className="text-5xl">📝</div>
          <h3 className="mt-4 text-lg font-semibold text-[#1E3A5F]">
            No Recent Activity
          </h3>
          <p className="mt-2 text-gray-500">
            Start using AI tools to see your activity here.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {history.map((item) => (
            <div
              key={item.id}
              className="rounded-xl border border-gray-200 bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:border-[#1A56DB] hover:shadow-lg"
            >
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getBadgeColor(
                    item.tool_name
                  )}`}
                >
                  {(item.tool_name || "Unknown").toUpperCase()}
                </span>

                <span className="text-sm text-gray-500">
                  {new Date(item.created_at).toLocaleDateString()} •{" "}
                  {new Date(item.created_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>

              <p className="leading-7 text-gray-700">
                {truncate(
                  item.output_data?.proposal ||
                    item.output_data?.optimized_title ||
                    item.output_data?.summary ||
                    item.input_data?.job_post ||
                    item.input_data?.description ||
                    item.input_data?.profile
                )}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default RecentHistory;