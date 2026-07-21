import { X, CalendarDays } from "lucide-react";

function HistoryModal({ open, history, onClose }) {
  if (!open || !history) return null;

  const formatDate = (date) => {
    return new Date(date).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const textareaStyle =
    "w-full mt-2 rounded-xl border border-gray-300 bg-gray-50 p-4 text-sm text-gray-700 focus:outline-none resize-none";

  const inputStyle =
    "mt-1 w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-gray-700";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">

      <div className="relative w-full max-w-6xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white shadow-2xl">

        {/* Header */}

        <div className="sticky top-0 z-20 flex items-center justify-between border-b bg-white px-8 py-6">

          <div>

            <span className="inline-block rounded-full bg-blue-100 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-[#1A56DB]">
              {history.tool_name}
            </span>

            <h2 className="mt-3 text-3xl font-bold text-[#1E3A5F]">
              History Details
            </h2>

            <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
              <CalendarDays size={16} />
              {formatDate(history.created_at)}
            </div>

          </div>

          <button onClick={onClose}
            className="rounded-full p-3 transition hover:bg-red-50 hover:text-red-600"
          >
            <X size={24} />
          </button>

        </div>

        {/* Body */}

        <div className="grid gap-8 p-8 lg:grid-cols-2">

          {/* ================= INPUT ================= */}

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

            <h3 className="mb-6 text-2xl font-bold text-[#1E3A5F]">
              Input Information
            </h3>

            {/* Proposal */}

            {history.tool_name === "proposal" && (
              <>

                <div className="grid gap-5 sm:grid-cols-2">

                  <div>
                    <label className="text-sm font-semibold text-gray-600">
                      Platform
                    </label>

                    <input
                      readOnly
                      className={inputStyle}
                      value={history.input_data?.platform || "-"}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-600">
                      Skill
                    </label>

                    <input
                      readOnly
                      className={inputStyle}
                      value={history.input_data?.skill || "-"}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-600">
                      Tone
                    </label>

                    <input
                      readOnly
                      className={inputStyle}
                      value={history.input_data?.tone || "-"}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-600">
                      Length
                    </label>

                    <input
                      readOnly
                      className={inputStyle}
                      value={history.input_data?.length || "-"}
                    />
                  </div>

                </div>

                <div className="mt-6">

                  <label className="text-sm font-semibold text-gray-600">
                    Job Post
                  </label>

                  <textarea
                    rows={10}
                    readOnly
                    className={textareaStyle}
                    value={history.input_data?.job_post || ""}
                  />

                </div>

              </>
            )}

            {/* SEO */}

            {history.tool_name === "seo" && (
              <>

                <div className="space-y-5">

                  <div>

                    <label className="text-sm font-semibold text-gray-600">
                      Title
                    </label>

                    <input
                      readOnly
                      className={inputStyle}
                      value={history.input_data?.title || ""}
                    />

                  </div>

                  <div>

                    <label className="text-sm font-semibold text-gray-600">
                      Category
                    </label>

                    <input
                      readOnly
                      className={inputStyle}
                      value={history.input_data?.category || ""}
                    />

                  </div>

                  <div>

                    <label className="text-sm font-semibold text-gray-600">
                      Description
                    </label>

                    <textarea
                      rows={10}
                      readOnly
                      className={textareaStyle}
                      value={history.input_data?.description || ""}
                    />

                  </div>

                </div>

              </>
            )}

            {/* Profile */}

            {history.tool_name === "profile" && (
              <>

                <label className="text-sm font-semibold text-gray-600">
                  Freelancer Profile
                </label>

                <textarea
                  rows={16}
                  readOnly
                  className={textareaStyle}
                  value={history.input_data?.profile || ""}
                />

              </>
            )}

          </div>
<div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

  <h3 className="mb-6 text-2xl font-bold text-[#1E3A5F]">
    AI Generated Output
  </h3>

  {/* ================= PROPOSAL ================= */}

  {history.tool_name === "proposal" && (
    <>

      <label className="text-sm font-semibold text-gray-600">
        Generated Proposal
      </label>

      <textarea
        rows={14}
        readOnly
        className={textareaStyle}
        value={history.output_data?.proposal || ""}
      />

      {history.output_data?.key_points?.length > 0 && (
        <div className="mt-6">

          <h4 className="mb-3 text-lg font-semibold text-[#1E3A5F]">
            Key Points
          </h4>

          <div className="flex flex-wrap gap-2">

            {history.output_data.key_points.map((point, index) => (
              <span
                key={index}
                className="rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-[#1A56DB]"
              >
                {point}
              </span>
            ))}

          </div>

        </div>
      )}

      <div className="mt-6 rounded-xl bg-green-50 p-4">

        <p className="text-sm text-green-700">
          <strong>Word Count:</strong>{" "}
          {history.output_data?.word_count || 0}
        </p>

      </div>

    </>
  )}

  {/* ================= SEO ================= */}

  {history.tool_name === "seo" && (
    <>

      <div className="space-y-6">

        <div>

          <label className="text-sm font-semibold text-gray-600">
            Optimized Title
          </label>

          <textarea
            rows={3}
            readOnly
            className={textareaStyle}
            value={
              history.output_data?.optimized_title ||
              history.output_data?.title ||
              ""
            }
          />

        </div>

        <div>

          <label className="text-sm font-semibold text-gray-600">
            Category
          </label>

          <input
            readOnly
            className={inputStyle}
            value={history.output_data?.category || ""}
          />

        </div>

        <div>

          <label className="text-sm font-semibold text-gray-600">
            Optimized Description
          </label>

          <textarea
            rows={10}
            readOnly
            className={textareaStyle}
            value={
              history.output_data?.optimized_description ||
              history.output_data?.description ||
              ""
            }
          />

        </div>

        {history.output_data?.scores && (

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">

            <div className="rounded-xl bg-blue-50 p-4 text-center">
              <p className="text-sm text-gray-500">Overall</p>
              <h4 className="mt-2 text-2xl font-bold text-[#1A56DB]">
                {history.output_data.scores.overall}/10
              </h4>
            </div>

            <div className="rounded-xl bg-blue-50 p-4 text-center">
              <p className="text-sm text-gray-500">Title</p>
              <h4 className="mt-2 text-2xl font-bold text-[#1A56DB]">
                {history.output_data.scores.title}/10
              </h4>
            </div>

            <div className="rounded-xl bg-blue-50 p-4 text-center">
              <p className="text-sm text-gray-500">Tags</p>
              <h4 className="mt-2 text-2xl font-bold text-[#1A56DB]">
                {history.output_data.scores.tags}/10
              </h4>
            </div>

            <div className="rounded-xl bg-blue-50 p-4 text-center">
              <p className="text-sm text-gray-500">Description</p>
              <h4 className="mt-2 text-2xl font-bold text-[#1A56DB]">
                {history.output_data.scores.description}/10
              </h4>
            </div>

          </div>

        )}

      </div>

    </>
  )}

  {/* ================= PROFILE ================= */}

  {history.tool_name === "profile" && (
    <>

      <div className="mb-6 rounded-xl bg-blue-50 p-6 text-center">

        <p className="text-sm text-gray-500">
          Overall Score
        </p>

        <h2 className="mt-2 text-5xl font-bold text-[#1A56DB]">
          {history.output_data?.score}/10
        </h2>

      </div>

      <div className="space-y-6">

        <div>

          <h4 className="mb-3 text-lg font-semibold text-green-700">
            Strengths
          </h4>

          <ul className="space-y-2">

            {(history.output_data?.strengths || []).map((item, index) => (
              <li
                key={index}
                className="rounded-lg bg-green-50 p-3 text-green-800"
              >
                ✓ {item}
              </li>
            ))}

          </ul>

        </div>

        <div>

          <h4 className="mb-3 text-lg font-semibold text-red-700">
            Weaknesses
          </h4>

          <ul className="space-y-2">

            {(history.output_data?.weaknesses || []).map((item, index) => (
              <li
                key={index}
                className="rounded-lg bg-red-50 p-3 text-red-700"
              >
                • {item}
              </li>
            ))}

          </ul>

        </div>

        <div>

          <h4 className="mb-3 text-lg font-semibold text-[#1E3A5F]">
            Suggestions
          </h4>

          <ul className="space-y-2">

            {(history.output_data?.suggestions || []).map((item, index) => (
              <li
                key={index}
                className="rounded-lg bg-blue-50 p-3 text-[#1A56DB]"
              >
                💡 {item}
              </li>
            ))}

          </ul>

        </div>

      </div>

    </>
  )}

</div>

</div>

</div>

</div>
  );
}

export default HistoryModal;
          