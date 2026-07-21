import { useState } from "react";
import UpgradeModal from "../components/UpgradeModal";
import { toast } from "react-hot-toast";
import "../App.css";

function GigSEO() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);

  const optimize = async () => {
    try {
      if (!title.trim() || !description.trim() || !category.trim()) {
        toast.error("Please fill in title, category, and description.");
        return;
      }

      setLoading(true);

      const token = localStorage.getItem("gigora_access_token");

      const response = await fetch(
        "http://127.0.0.1:8000/api/seo/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title,
            description,
            category,
          }),
        }
      );

      const data = await response.json();

      // Show upgrade modal if daily limit reached
      if (response.status === 403 || response.status === 429) {
        setShowUpgrade(true);
        return;
      }

      if (!response.ok) {
        throw new Error(data.detail || "Something went wrong.");
      }

      setResult(data.data);
      toast.success("SEO optimized successfully.");
      window.dispatchEvent(new Event("dashboard-update"));
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

 return (
  <>
    <div className="min-h-screen bg-slate-50 px-4 py-10 lg:px-10">
      <div className="mx-auto max-w-5xl rounded-3xl bg-white shadow-xl border border-slate-200">

        {/* Header */}

        <div className="rounded-t-3xl bg-gradient-to-r from-[#1A56DB] to-[#1E3A5F] px-8 py-10 text-white">

          <h1 className="text-4xl font-bold">
            Gig SEO Optimizer
          </h1>

          <p className="mt-3 max-w-2xl text-blue-100">
            Optimize your Fiverr and Upwork gig using AI.
            Generate SEO-friendly titles, descriptions and
            keyword tags to improve visibility.
          </p>

        </div>

        {/* Form */}

        <div className="space-y-8 p-8">

          {/* Title */}

          <div>

            <label className="mb-2 block text-sm font-semibold text-[#1E3A5F]">
              Gig Title
            </label>

            <input
              type="text"
              placeholder="Example: I will design a modern responsive website"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-5 py-4 outline-none transition focus:border-[#1A56DB] focus:ring-4 focus:ring-blue-100"
            />

            <div className="mt-2 flex justify-end">

              <span
                className={`text-sm ${
                  title.length > 80
                    ? "text-red-500"
                    : "text-gray-500"
                }`}
              >
                {title.length}/80
              </span>

            </div>

          </div>

          {/* Category */}

          <div>

            <label className="mb-2 block text-sm font-semibold text-[#1E3A5F]">
              Category
            </label>

            <input
              type="text"
              placeholder="Example: Web Development"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-5 py-4 outline-none transition focus:border-[#1A56DB] focus:ring-4 focus:ring-blue-100"
            />

          </div>

          {/* Description */}

          <div>

            <label className="mb-2 block text-sm font-semibold text-[#1E3A5F]">
              Gig Description
            </label>

            <textarea
              rows={8}
              placeholder="Describe your gig in detail..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-5 py-4 outline-none transition focus:border-[#1A56DB] focus:ring-4 focus:ring-blue-100"
            />

          </div>

          {/* Buttons */}

          <div className="flex flex-col gap-4 sm:flex-row">

            <button
              onClick={optimize}
              disabled={loading}
              className="flex-1 rounded-xl bg-[#1A56DB] px-6 py-4 font-semibold text-white transition hover:bg-[#1E3A5F] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading
                ? "Optimizing..."
                : "Optimize Gig"}
            </button>

            {result && (

              <button
                onClick={optimize}
                disabled={loading}
                className="flex-1 rounded-xl border border-[#1A56DB] bg-white px-6 py-4 font-semibold text-[#1A56DB] transition hover:bg-[#EFF6FF]"
              >
                {loading
                  ? "Regenerating..."
                  : "Regenerate"}
              </button>

            )}

          </div>

          {/* Result */}

          {result && (
  <div className="mt-12 space-y-8">

    {/* Overall Score */}

    <div className="rounded-2xl border border-blue-100 bg-[#EFF6FF] p-8">

      <div className="flex flex-col items-center gap-6 md:flex-row md:justify-between">

        <div>

          <h2 className="text-2xl font-bold text-[#1E3A5F]">
            SEO Analysis Complete
          </h2>

          <p className="mt-2 text-[#6B7280]">
            Here are your AI-optimized SEO suggestions.
          </p>

        </div>

        <div className="flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-r from-[#1A56DB] to-[#1E3A5F] shadow-lg">

          <div className="text-center text-white">

            <h1 className="text-3xl font-bold">
              {result.scores?.overall}
            </h1>

            <p className="text-sm">
              /10
            </p>

          </div>

        </div>

      </div>

    </div>

    {/* Optimized Title */}

    <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">

      <div className="mb-4 flex items-center justify-between">

        <h3 className="text-xl font-bold text-[#1E3A5F]">
          Optimized Title
        </h3>

        <button
          onClick={() => {
            navigator.clipboard.writeText(
              result.optimized_title
            );

            toast.success("Title copied");
          }}
          className="rounded-lg bg-[#1A56DB] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#1E3A5F]"
        >
          Copy
        </button>

      </div>

      <p className="leading-8 text-[#111827]">

        {result.optimized_title}

      </p>

    </div>

    {/* Tags */}

    <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">

      <div className="mb-5 flex items-center justify-between">

        <h3 className="text-xl font-bold text-[#1E3A5F]">
          Recommended Tags
        </h3>

        <button
          onClick={() => {

            navigator.clipboard.writeText(
              result.tags
                ?.map((tag) => tag.text)
                .join(", ")
            );

            toast.success("Tags copied");

          }}
          className="rounded-lg bg-[#1A56DB] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#1E3A5F]"
        >
          Copy
        </button>

      </div>

      <div className="flex flex-wrap gap-3">

        {result.tags?.map((tag, index) => (

          <span
            key={index}
            className={`rounded-full px-5 py-2 text-sm font-semibold

            ${
              tag.valid
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-600"
            }`}
          >

            {tag.text}

            {tag.valid ? " ✓" : " ✕"}

          </span>

        ))}

      </div>

    </div>

    {/* Description */}

    <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">

      <div className="mb-4 flex items-center justify-between">

        <h3 className="text-xl font-bold text-[#1E3A5F]">
          Optimized Description
        </h3>

        <button
          onClick={() => {

            navigator.clipboard.writeText(
              result.optimized_description
            );

            toast.success("Description copied");

          }}
          className="rounded-lg bg-[#1A56DB] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#1E3A5F]"
        >
          Copy
        </button>

      </div>

      <div className="rounded-xl bg-slate-50 p-6">

        <p className="whitespace-pre-line leading-8 text-[#111827]">

          {result.optimized_description}

        </p>

      </div>

    </div>

    {/* PART 3 */}

    <div>

      {/* Score Cards */}

    </div>

  </div>
)}
{/* SEO Scores */}

{result && (

<div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">

  <h3 className="mb-8 text-2xl font-bold text-[#1E3A5F]">
    SEO Performance Breakdown
  </h3>

  {/* Score Cards */}

  <div className="grid gap-6 md:grid-cols-3">

    {/* Title */}

    <div className="rounded-2xl bg-gradient-to-r from-[#1A56DB] to-[#1E3A5F] p-6 text-white shadow-lg">

      <p className="text-blue-100">
        Title Score
      </p>

      <h2 className="mt-3 text-4xl font-bold">
        {result.scores?.title}/10
      </h2>

    </div>

    {/* Tags */}

    <div className="rounded-2xl bg-gradient-to-r from-[#1A56DB] to-[#1E3A5F] p-6 text-white shadow-lg">

      <p className="text-blue-100">
        Tags Score
      </p>

      <h2 className="mt-3 text-4xl font-bold">
        {result.scores?.tags}/10
      </h2>

    </div>

    {/* Description */}

    <div className="rounded-2xl bg-gradient-to-r from-[#1A56DB] to-[#1E3A5F] p-6 text-white shadow-lg">

      <p className="text-blue-100">
        Description Score
      </p>

      <h2 className="mt-3 text-4xl font-bold">
        {result.scores?.description}/10
      </h2>

    </div>

  </div>

  {/* Progress Bars */}

  <div className="mt-10 space-y-8">

    {/* Title */}

    <div>

      <div className="mb-2 flex justify-between">

        <span className="font-semibold text-[#111827]">
          Title Optimization
        </span>

        <span className="font-semibold text-[#1A56DB]">
          {result.scores?.title}/10
        </span>

      </div>

      <div className="h-3 overflow-hidden rounded-full bg-slate-200">

        <div
          className="h-full rounded-full bg-[#1A56DB] transition-all duration-700"
          style={{
            width: `${(result.scores?.title || 0) * 10}%`,
          }}
        />

      </div>

    </div>

    {/* Tags */}

    <div>

      <div className="mb-2 flex justify-between">

        <span className="font-semibold text-[#111827]">
          Keyword Optimization
        </span>

        <span className="font-semibold text-[#1A56DB]">
          {result.scores?.tags}/10
        </span>

      </div>

      <div className="h-3 overflow-hidden rounded-full bg-slate-200">

        <div
          className="h-full rounded-full bg-green-600 transition-all duration-700"
          style={{
            width: `${(result.scores?.tags || 0) * 10}%`,
          }}
        />

      </div>

    </div>

    {/* Description */}

    <div>

      <div className="mb-2 flex justify-between">

        <span className="font-semibold text-[#111827]">
          Description Quality
        </span>

        <span className="font-semibold text-[#1A56DB]">
          {result.scores?.description}/10
        </span>

      </div>

      <div className="h-3 overflow-hidden rounded-full bg-slate-200">

        <div
          className="h-full rounded-full bg-purple-600 transition-all duration-700"
          style={{
            width: `${(result.scores?.description || 0) * 10}%`,
          }}
        />

      </div>

    </div>

  </div>

</div>

)}

        </div>

      </div>
    </div>

    <UpgradeModal
      open={showUpgrade}
      onClose={() => setShowUpgrade(false)}
    />
  </>
);
}

export default GigSEO;
