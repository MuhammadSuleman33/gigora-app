import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function RecentHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const truncate = (value, max = 120) => {
    if (value === null || value === undefined) {
      return "No preview available.";
    }

    const text =
      typeof value === "string"
        ? value
        : JSON.stringify(value);

    return text.length > max
      ? `${text.slice(0, max)}...`
      : text;
  };

  const parseJsonData = (value) => {
    if (!value) {
      return {};
    }

    if (typeof value === "object") {
      return value;
    }

    if (typeof value === "string") {
      try {
        return JSON.parse(value);
      } catch {
        return {
          text: value,
        };
      }
    }

    return {};
  };

  const getBadgeColor = (tool) => {
    switch ((tool || "").toLowerCase()) {
      case "profile":
        return "bg-green-100 text-green-700";

      case "seo":
        return "bg-blue-100 text-blue-700";

      case "proposal":
        return "bg-purple-100 text-purple-700";

      case "compare":
      case "ai_compare":
        return "bg-orange-100 text-orange-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getPreview = (item) => {
    const outputData = parseJsonData(item.output_data);
    const inputData = parseJsonData(item.input_data);

    return (
      outputData.proposal ||
      outputData.best_proposal ||
      outputData.optimized_title ||
      outputData.summary ||
      outputData.text ||
      inputData.job_post ||
      inputData.description ||
      inputData.profile ||
      inputData.profile_text ||
      inputData.text ||
      "No preview available."
    );
  };

  const loadHistory = useCallback(async () => {
    try {
      setError("");

      const response = await api.get("/api/history");

      const responseData = response.data;

      const records = Array.isArray(responseData)
        ? responseData
        : Array.isArray(responseData?.data)
        ? responseData.data
        : [];

      setHistory(records.slice(0, 3));
    } catch (err) {
      console.error(
        "Recent history error:",
        err.response?.status,
        err.response?.data || err.message
      );

      setHistory([]);

      if (err.response?.status === 401) {
        setError("Please log in again to view your recent activity.");
      } else {
        setError(
          err.response?.data?.detail ||
            "Unable to load recent activity."
        );
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHistory();

    const refresh = () => {
      loadHistory();
    };

    window.addEventListener("dashboard-update", refresh);

    return () => {
      window.removeEventListener(
        "dashboard-update",
        refresh
      );
    };
  }, [loadHistory]);

  if (loading) {
    return (
      <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
        <div className="mb-6 h-6 w-52 animate-pulse rounded bg-gray-200" />

        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="mb-4 rounded-xl border border-gray-200 p-4"
          >
            <div className="mb-3 h-4 w-32 animate-pulse rounded bg-gray-200" />
            <div className="mb-2 h-3 w-full animate-pulse rounded bg-gray-200" />
            <div className="h-3 w-3/4 animate-pulse rounded bg-gray-200" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <section className="mt-10 rounded-2xl bg-white p-6 shadow-sm">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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
          className="inline-flex items-center justify-center rounded-lg bg-[#1A56DB] px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          View All
        </Link>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700">
          {error}
        </div>
      ) : history.length === 0 ? (
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
                  className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold ${getBadgeColor(
                    item.tool_name
                  )}`}
                >
                  {(item.tool_name || "Unknown").toUpperCase()}
                </span>

                <span className="text-sm text-gray-500">
                  {item.created_at
                    ? `${new Date(
                        item.created_at
                      ).toLocaleDateString()} • ${new Date(
                        item.created_at
                      ).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}`
                    : "Date unavailable"}
                </span>
              </div>

              <p className="break-words leading-7 text-gray-700">
                {truncate(getPreview(item))}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default RecentHistory;