import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, LayoutDashboard } from "lucide-react";

import HistoryModal from "../components/HistoryModal";
import api from "../services/api";

function History() {
  const [history, setHistory] = useState([]);
  const [selectedHistory, setSelectedHistory] =
    useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    api.get("/api/history")
      .then((response) => {
        const data = response.data;
        console.log("History API Response:", data);

        const historyData = Array.isArray(data)
          ? data
          : Array.isArray(data.data)
          ? data.data
          : Array.isArray(data.history)
          ? data.history
          : [];

        setHistory(historyData);
      })
      .catch((error) => {
        console.error("History fetch error:", error);
        setHistory([]);
      });
  }, []);

  const viewHistory = (item) => {
    setSelectedHistory(item);
    setShowModal(true);
  };

  const deleteHistory = async (id) => {
    try {
      await api.delete(`/api/history/${id}`);

      window.dispatchEvent(
        new Event("dashboard-update")
      );

      setHistory((previousHistory) =>
        previousHistory.filter(
          (historyItem) => historyItem.id !== id
        )
      );
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
      <div className="mx-auto max-w-7xl">
        {/* Header */}

        <header className="mb-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
                Generation activity
              </span>

              <h1 className="mt-4 text-3xl font-bold tracking-tight text-[#1E3A5F] sm:text-4xl">
                History
              </h1>

              <p className="mt-2 text-[#6B7280]">
                View and manage your previous AI
                generations.
              </p>
            </div>

            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1A56DB] px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-[#1E3A5F] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <ArrowLeft
                className="h-5 w-5"
                aria-hidden="true"
              />

              <LayoutDashboard
                className="h-5 w-5"
                aria-hidden="true"
              />

              Go to Dashboard
            </Link>
          </div>
        </header>

        {/* Empty state */}

        {history.length === 0 ? (
          <section className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm sm:p-16">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#EFF6FF]">
              <span
                className="text-4xl"
                role="img"
                aria-label="Empty folder"
              >
                📂
              </span>
            </div>

            <h2 className="text-2xl font-bold text-[#1E3A5F]">
              No History Yet
            </h2>

            <p className="mx-auto mt-3 max-w-xl text-[#6B7280]">
              Your generated profile analyses, SEO
              results, and proposals will appear here.
            </p>

            <Link
              to="/dashboard"
              className="mt-7 inline-flex items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-5 py-3 font-semibold text-blue-700 transition hover:bg-blue-100"
            >
              <LayoutDashboard
                className="h-5 w-5"
                aria-hidden="true"
              />
              Explore Dashboard
            </Link>
          </section>
        ) : (
          <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {history.map((item) => (
              <article
                key={item.id}
                className="flex flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="mb-5 flex items-center justify-between gap-3">
                  <span className="rounded-full bg-[#EFF6FF] px-4 py-2 text-sm font-semibold text-[#1A56DB]">
                    {item.tool_name}
                  </span>

                  <span className="text-sm text-slate-500">
                    {new Date(
                      item.created_at
                    ).toLocaleDateString()}
                  </span>
                </div>

                <p className="mb-8 text-sm text-[#6B7280]">
                  {new Date(
                    item.created_at
                  ).toLocaleString()}
                </p>

                <div className="mt-auto flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => viewHistory(item)}
                    className="flex-1 rounded-xl bg-[#1A56DB] px-4 py-3 font-semibold text-white transition hover:bg-[#1E3A5F] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    View
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      deleteHistory(item.id)
                    }
                    className="flex-1 rounded-xl bg-red-500 px-4 py-3 font-semibold text-white transition hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </section>
        )}

        <HistoryModal
          open={showModal}
          history={selectedHistory}
          onClose={() => {
            setShowModal(false);
            setSelectedHistory(null);
          }}
        />
      </div>
    </main>
  );
}

export default History;