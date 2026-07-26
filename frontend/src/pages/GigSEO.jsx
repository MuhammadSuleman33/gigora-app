import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  Copy,
  LayoutDashboard,
  Loader2,
  Search,
  Sparkles,
  Tag,
} from "lucide-react";
import { toast } from "react-hot-toast";

import UpgradeModal from "../components/UpgradeModal";
import api from "../services/api";

function GigSEO() {
  const [title, setTitle] = useState("");
  const [description, setDescription] =
    useState("");
  const [category, setCategory] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showUpgrade, setShowUpgrade] =
    useState(false);

  const optimize = async () => {
    if (
      !title.trim() ||
      !description.trim() ||
      !category.trim()
    ) {
      toast.error(
        "Please fill in the title, category, and description."
      );
      return;
    }

    if (title.length > 80) {
      toast.error(
        "The gig title must not exceed 80 characters."
      );
      return;
    }

    try {
      setLoading(true);

      const response = await api.post(
        "/api/seo/",
        {
          title: title.trim(),
          description: description.trim(),
          category: category.trim(),
        }
      );

      console.log(
        "Gig SEO API response:",
        response.data
      );

      let formattedResult =
        response.data?.data || response.data;

      if (typeof formattedResult === "string") {
        try {
          formattedResult =
            JSON.parse(formattedResult);
        } catch {
          throw new Error(
            "The AI returned an invalid response."
          );
        }
      }

      if (
        formattedResult?.result &&
        typeof formattedResult.result === "string"
      ) {
        try {
          formattedResult = JSON.parse(
            formattedResult.result
          );
        } catch {
          throw new Error(
            "Unable to process the AI response."
          );
        }
      }

      setResult({
        optimized_title:
          formattedResult?.optimized_title || "",

        optimized_description:
          formattedResult?.optimized_description ||
          "",

        tags: Array.isArray(formattedResult?.tags)
          ? formattedResult.tags
          : [],

        scores: {
          title:
            Number(
              formattedResult?.scores?.title
            ) || 0,

          tags:
            Number(
              formattedResult?.scores?.tags
            ) || 0,

          description:
            Number(
              formattedResult?.scores
                ?.description
            ) || 0,

          overall:
            Number(
              formattedResult?.scores?.overall
            ) || 0,
        },

        tips: Array.isArray(
          formattedResult?.tips
        )
          ? formattedResult.tips
          : [],
      });

      toast.success(
        "SEO optimized successfully."
      );

      window.dispatchEvent(
        new Event("dashboard-update")
      );
    } catch (err) {
      console.error(
        "Gig SEO Error:",
        err
      );

      const status = err.response?.status;

      if (status === 403 || status === 429) {
        setShowUpgrade(true);
        return;
      }

      const errorMessage =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        err.message ||
        "Something went wrong.";

      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const copyText = async (
    text,
    successMessage
  ) => {
    if (!text) {
      toast.error("Nothing to copy.");
      return;
    }

    try {
      await navigator.clipboard.writeText(
        text
      );

      toast.success(successMessage);
    } catch (err) {
      console.error(
        "Clipboard Error:",
        err
      );

      toast.error("Unable to copy the text.");
    }
  };

  const copyTags = async () => {
    const tagsText = result?.tags
      ?.map((tag) =>
        typeof tag === "string"
          ? tag
          : tag.text
      )
      .filter(Boolean)
      .join(", ");

    await copyText(
      tagsText,
      "Tags copied successfully."
    );
  };

  return (
    <>
      <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
        <div className="mx-auto max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
          {/* Header */}

          <header className="bg-gradient-to-r from-[#1A56DB] to-[#1E3A5F] px-6 py-8 text-white sm:px-8 sm:py-10">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold">
                  <Sparkles className="h-4 w-4" />
                  AI Gig Optimization
                </span>

                <h1 className="mt-4 text-3xl font-bold sm:text-4xl">
                  Gig SEO Optimizer
                </h1>

                <p className="mt-3 max-w-2xl leading-7 text-blue-100">
                  Optimize your Fiverr or Upwork gig
                  using AI. Generate SEO-friendly
                  titles, descriptions, and keyword
                  tags to improve your visibility.
                </p>
              </div>

              <Link
                to="/dashboard"
                className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-xl border border-white/30 bg-white px-5 py-3 font-semibold text-[#1A56DB] shadow-sm transition hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#1A56DB] md:w-auto"
              >
                <ArrowLeft className="h-5 w-5" />
                <LayoutDashboard className="h-5 w-5" />
                Go to Dashboard
              </Link>
            </div>
          </header>

          {/* Form */}

          <section className="space-y-8 p-6 sm:p-8">
            {/* Title */}

            <div>
              <label
                htmlFor="gigTitle"
                className="mb-2 block text-sm font-semibold text-[#1E3A5F]"
              >
                Gig Title
              </label>

              <input
                id="gigTitle"
                type="text"
                placeholder="Example: I will design a modern responsive website"
                value={title}
                onChange={(e) =>
                  setTitle(e.target.value)
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-5 py-4 outline-none transition focus:border-[#1A56DB] focus:ring-4 focus:ring-blue-100"
              />

              <div className="mt-2 flex justify-end">
                <span
                  className={`text-sm ${
                    title.length > 80
                      ? "font-semibold text-red-500"
                      : "text-slate-500"
                  }`}
                >
                  {title.length}/80
                </span>
              </div>
            </div>

            {/* Category */}

            <div>
              <label
                htmlFor="gigCategory"
                className="mb-2 block text-sm font-semibold text-[#1E3A5F]"
              >
                Category
              </label>

              <input
                id="gigCategory"
                type="text"
                placeholder="Example: Web Development"
                value={category}
                onChange={(e) =>
                  setCategory(e.target.value)
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-5 py-4 outline-none transition focus:border-[#1A56DB] focus:ring-4 focus:ring-blue-100"
              />
            </div>

            {/* Description */}

            <div>
              <label
                htmlFor="gigDescription"
                className="mb-2 block text-sm font-semibold text-[#1E3A5F]"
              >
                Gig Description
              </label>

              <textarea
                id="gigDescription"
                rows={8}
                placeholder="Describe your gig, experience, services, and client benefits..."
                value={description}
                onChange={(e) =>
                  setDescription(e.target.value)
                }
                className="w-full resize-y rounded-xl border border-slate-300 bg-white px-5 py-4 outline-none transition focus:border-[#1A56DB] focus:ring-4 focus:ring-blue-100"
              />
            </div>

            {/* Buttons */}

            <div className="flex flex-col gap-4 sm:flex-row">
              <button
                type="button"
                onClick={optimize}
                disabled={loading}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#1A56DB] px-6 py-4 font-semibold text-white transition hover:bg-[#1E3A5F] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Optimizing...
                  </>
                ) : (
                  <>
                    <Search className="h-5 w-5" />
                    Optimize Gig
                  </>
                )}
              </button>

              {result && (
                <button
                  type="button"
                  onClick={optimize}
                  disabled={loading}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#1A56DB] bg-white px-6 py-4 font-semibold text-[#1A56DB] transition hover:bg-[#EFF6FF] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Regenerating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5" />
                      Regenerate
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Results */}

            {result && (
              <div className="space-y-8 pt-4">
                {/* Overall score */}

                <div className="rounded-2xl border border-blue-100 bg-[#EFF6FF] p-6 sm:p-8">
                  <div className="flex flex-col items-center gap-6 text-center md:flex-row md:justify-between md:text-left">
                    <div>
                      <h2 className="text-2xl font-bold text-[#1E3A5F]">
                        SEO Analysis Complete
                      </h2>

                      <p className="mt-2 text-[#6B7280]">
                        Here are your AI-optimized
                        SEO suggestions.
                      </p>
                    </div>

                    <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-[#1A56DB] to-[#1E3A5F] shadow-lg">
                      <div className="text-center text-white">
                        <p className="text-3xl font-bold">
                          {
                            result.scores
                              ?.overall
                          }
                        </p>

                        <p className="text-sm">
                          out of 10
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Optimized title */}

                <ResultSection
                  title="Optimized Title"
                  icon={
                    <Search className="h-5 w-5" />
                  }
                  onCopy={() =>
                    copyText(
                      result.optimized_title,
                      "Title copied successfully."
                    )
                  }
                >
                  <p className="leading-8 text-[#111827]">
                    {result.optimized_title}
                  </p>
                </ResultSection>

                {/* Tags */}

                <ResultSection
                  title="Recommended Tags"
                  icon={
                    <Tag className="h-5 w-5" />
                  }
                  onCopy={copyTags}
                >
                  {result.tags.length > 0 ? (
                    <div className="flex flex-wrap gap-3">
                      {result.tags.map(
                        (tag, index) => {
                          const tagText =
                            typeof tag ===
                            "string"
                              ? tag
                              : tag.text;

                          const isValid =
                            typeof tag ===
                            "string"
                              ? true
                              : tag.valid !==
                                false;

                          return (
                            <span
                              key={`${tagText}-${index}`}
                              className={`inline-flex items-center gap-1 rounded-full px-5 py-2 text-sm font-semibold ${
                                isValid
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-600"
                              }`}
                            >
                              {tagText}

                              {isValid ? (
                                <Check className="h-4 w-4" />
                              ) : (
                                "✕"
                              )}
                            </span>
                          );
                        }
                      )}
                    </div>
                  ) : (
                    <p className="text-slate-500">
                      No tags were returned.
                    </p>
                  )}
                </ResultSection>

                {/* Description */}

                <ResultSection
                  title="Optimized Description"
                  icon={
                    <Sparkles className="h-5 w-5" />
                  }
                  onCopy={() =>
                    copyText(
                      result.optimized_description,
                      "Description copied successfully."
                    )
                  }
                >
                  <div className="rounded-xl bg-slate-50 p-6">
                    <p className="whitespace-pre-line leading-8 text-[#111827]">
                      {
                        result.optimized_description
                      }
                    </p>
                  </div>
                </ResultSection>

                {/* SEO scores */}

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                  <h3 className="text-2xl font-bold text-[#1E3A5F]">
                    SEO Performance Breakdown
                  </h3>

                  <div className="mt-8 grid gap-6 md:grid-cols-3">
                    <ScoreCard
                      label="Title Score"
                      score={
                        result.scores?.title
                      }
                    />

                    <ScoreCard
                      label="Tags Score"
                      score={
                        result.scores?.tags
                      }
                    />

                    <ScoreCard
                      label="Description Score"
                      score={
                        result.scores
                          ?.description
                      }
                    />
                  </div>

                  <div className="mt-10 space-y-8">
                    <ProgressBar
                      label="Title Optimization"
                      score={
                        result.scores?.title
                      }
                    />

                    <ProgressBar
                      label="Keyword Optimization"
                      score={
                        result.scores?.tags
                      }
                    />

                    <ProgressBar
                      label="Description Quality"
                      score={
                        result.scores
                          ?.description
                      }
                    />
                  </div>
                </div>

                {/* Tips */}

                {result.tips.length > 0 && (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 sm:p-8">
                    <h3 className="text-xl font-bold text-amber-800">
                      Additional SEO Tips
                    </h3>

                    <ul className="mt-5 space-y-3">
                      {result.tips.map(
                        (tip, index) => (
                          <li
                            key={`tip-${index}`}
                            className="flex items-start gap-3 text-amber-900"
                          >
                            <span className="font-bold">
                              →
                            </span>

                            <span>{tip}</span>
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      </main>

      <UpgradeModal
        open={showUpgrade}
        onClose={() =>
          setShowUpgrade(false)
        }
      />
    </>
  );
}

function ResultSection({
  title,
  icon,
  onCopy,
  children,
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="flex items-center gap-2 text-xl font-bold text-[#1E3A5F]">
          {icon}
          {title}
        </h3>

        <button
          type="button"
          onClick={onCopy}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#1A56DB] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#1E3A5F]"
        >
          <Copy className="h-4 w-4" />
          Copy
        </button>
      </div>

      {children}
    </section>
  );
}

function ScoreCard({ label, score }) {
  return (
    <div className="rounded-2xl bg-gradient-to-r from-[#1A56DB] to-[#1E3A5F] p-6 text-white shadow-lg">
      <p className="text-blue-100">
        {label}
      </p>

      <p className="mt-3 text-4xl font-bold">
        {score || 0}/10
      </p>
    </div>
  );
}

function ProgressBar({ label, score }) {
  const normalizedScore = Math.min(
    Math.max(Number(score) || 0, 0),
    10
  );

  return (
    <div>
      <div className="mb-2 flex justify-between gap-4">
        <span className="font-semibold text-[#111827]">
          {label}
        </span>

        <span className="font-semibold text-[#1A56DB]">
          {normalizedScore}/10
        </span>
      </div>

      <div className="h-3 overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-[#1A56DB] transition-all duration-700"
          style={{
            width: `${normalizedScore * 10}%`,
          }}
        />
      </div>
    </div>
  );
}

export default GigSEO;