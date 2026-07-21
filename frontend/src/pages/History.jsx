import { useEffect, useState } from "react";
import HistoryModal from "../components/HistoryModal";


function History() {
  const [history, setHistory] = useState([]);
  const [selectedHistory, setSelectedHistory] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("gigora_access_token");

    fetch("http://127.0.0.1:8000/api/history", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
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
      const token = localStorage.getItem(
        "gigora_access_token"
      );

      await fetch(
        `http://127.0.0.1:8000/api/history/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
window.dispatchEvent(new Event("dashboard-update"));
      setHistory((prev) =>
        prev.filter((h) => h.id !== id)
      );
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

 return (
  <div className="min-h-screen bg-slate-50 p-6 lg:p-10">
    <div className="mx-auto max-w-7xl">

      {/* Header */}

      <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">

        <div>
          <h1 className="text-4xl font-bold text-[#1E3A5F]">
            History
          </h1>

          <p className="mt-2 text-[#6B7280]">
            View all of your previous AI generations.
          </p>
        </div>

      </div>

      {/* Empty State */}

      {history.length === 0 ? (

        <div className="rounded-3xl bg-white p-16 text-center shadow">

          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#EFF6FF]">

            <span className="text-4xl">
              📂
            </span>

          </div>

          <h2 className="text-2xl font-bold text-[#1E3A5F]">
            No History Yet
          </h2>

          <p className="mt-3 text-[#6B7280]">
            Your generated Profile Analysis, SEO results,
            and Proposals will appear here.
          </p>

        </div>

      ) : (

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">

          {history.map((item) => (

            <div
              key={item.id}
              className="rounded-3xl bg-white p-6 shadow transition duration-300 hover:-translate-y-1 hover:shadow-xl"
            >

              {/* Top */}

              <div className="mb-5 flex items-center justify-between">

                <span className="rounded-full bg-[#EFF6FF] px-4 py-2 text-sm font-semibold text-[#1A56DB]">

                  {item.tool_name}

                </span>

                <span className="text-sm text-gray-500">

                  {new Date(
                    item.created_at
                  ).toLocaleDateString()}

                </span>

              </div>

              {/* Date */}

              <p className="mb-8 text-sm text-[#6B7280]">

                {new Date(
                  item.created_at
                ).toLocaleString()}

              </p>

              {/* Buttons */}

              <div className="flex gap-3">

                <button
                  onClick={() => viewHistory(item)}
                  className="flex-1 rounded-xl bg-[#1A56DB] px-4 py-3 font-semibold text-white transition hover:bg-[#1E3A5F]"
                >
                  View
                </button>

                <button
                  onClick={() => deleteHistory(item.id)}
                  className="flex-1 rounded-xl bg-red-500 px-4 py-3 font-semibold text-white transition hover:bg-red-600"
                >
                  Delete
                </button>

              </div>

            </div>

          ))}

        </div>

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
  </div>
);
}

export default History;