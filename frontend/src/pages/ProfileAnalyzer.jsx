import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  LayoutDashboard,
  Lightbulb,
  Loader2,
  Search,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { toast } from "react-hot-toast";

import api from "../services/api";

function ProfileAnalyzer() {
  const [profileText, setProfileText] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const analyzeProfile = async () => {
    if (!profileText.trim()) {
      setError("Please enter your profile description.");
      toast.error("Please enter your profile description.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setResult(null);

      const response = await api.post(
        "/api/profile/",
        {
          profile_text: profileText,
        }
      );

      console.log(
        "Profile API Response:",
        response.data
      );

      let formattedResult =
        response.data?.data || response.data;

      // Handle JSON returned as a string
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

      // Handle:
      // { result: "{...JSON...}" }
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

      console.log(
        "Formatted Profile Result:",
        formattedResult
      );

      const normalizedResult = {
        score:
          Number(formattedResult?.score) || 0,

        strengths: Array.isArray(
          formattedResult?.strengths
        )
          ? formattedResult.strengths
          : [],

        weaknesses: Array.isArray(
          formattedResult?.weaknesses
        )
          ? formattedResult.weaknesses
          : [],

        suggestions: Array.isArray(
          formattedResult?.suggestions
        )
          ? formattedResult.suggestions
          : [],
      };

      setResult(normalizedResult);

      toast.success(
        "Profile analyzed successfully."
      );

      window.dispatchEvent(
        new Event("dashboard-update")
      );
    } catch (err) {
      console.error(
        "Profile Analyzer Error:",
        err
      );

      const errorMessage =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        err.message ||
        "Something went wrong.";

      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setProfileText("");
    setResult(null);
    setError("");
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl">
        {/* Header */}

        <header className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700">
              <Sparkles className="h-4 w-4" />
              AI Profile Insights
            </span>

            <h1 className="mt-4 text-3xl font-bold tracking-tight text-[#1E3A5F] sm:text-4xl">
              AI Profile Analyzer
            </h1>

            <p className="mt-3 max-w-3xl text-base leading-7 text-[#6B7280] sm:text-lg">
              Analyze your Fiverr or Upwork profile and
              receive practical AI-powered recommendations
              to improve clarity, credibility, and client
              appeal.
            </p>
          </div>

          <Link
            to="/dashboard"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-blue-200 bg-white px-5 py-3 font-semibold text-[#1A56DB] shadow-sm transition hover:border-blue-300 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
          >
            <ArrowLeft className="h-5 w-5" />
            <LayoutDashboard className="h-5 w-5" />
            Go to Dashboard
          </Link>
        </header>

        {/* Input card */}

        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg">
          <div className="border-b border-slate-200 bg-gradient-to-r from-[#1A56DB] to-[#1E3A5F] px-6 py-7 text-white sm:px-8">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
                <Search className="h-6 w-6" />
              </div>

              <div>
                <h2 className="text-2xl font-bold">
                  Analyze Your Profile
                </h2>

                <p className="mt-1 text-blue-100">
                  Paste your complete freelancer profile
                  description below.
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <label
              htmlFor="profileText"
              className="mb-3 block text-sm font-semibold text-[#1E3A5F]"
            >
              Profile Description
            </label>

            <textarea
              id="profileText"
              placeholder="Example: I am a full-stack developer with experience in React, FastAPI, ASP.NET Core, SQL Server, PostgreSQL, AI integration, REST APIs, and responsive web application development..."
              value={profileText}
              onChange={(e) => {
                setProfileText(e.target.value);

                if (error) {
                  setError("");
                }
              }}
              className="min-h-[240px] w-full resize-y rounded-2xl border border-slate-300 bg-slate-50 px-5 py-4 text-[#111827] outline-none transition placeholder:text-slate-400 focus:border-[#1A56DB] focus:bg-white focus:ring-4 focus:ring-blue-100"
            />

            <div className="mt-2 flex justify-end">
              <span
                className={`text-sm ${
                  profileText.length > 3000
                    ? "text-red-500"
                    : "text-slate-500"
                }`}
              >
                {profileText.length}/3000
              </span>
            </div>

            <div className="mt-7 flex flex-col gap-4 sm:flex-row">
              <button
                type="button"
                onClick={analyzeProfile}
                disabled={
                  loading ||
                  !profileText.trim() ||
                  profileText.length > 3000
                }
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#1A56DB] px-8 py-4 font-semibold text-white shadow-sm transition hover:bg-[#1E3A5F] disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Analyzing Profile...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5" />
                    Analyze Profile
                  </>
                )}
              </button>

              {(profileText || result || error) && (
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={loading}
                  className="rounded-xl border border-slate-300 bg-white px-8 py-4 font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Reset
                </button>
              )}
            </div>

            {error && (
              <div className="mt-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
                <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" />

                <p>{error}</p>
              </div>
            )}
          </div>
        </section>

        {/* Results */}

        {result && (
          <section className="mt-10 space-y-8">
            {/* Score */}

            <div className="overflow-hidden rounded-3xl bg-gradient-to-r from-[#1A56DB] to-[#1E3A5F] p-8 text-white shadow-xl">
              <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
                <div className="text-center md:text-left">
                  <span className="inline-flex rounded-full bg-white/15 px-4 py-2 text-sm font-semibold">
                    Analysis Complete
                  </span>

                  <h2 className="mt-4 text-3xl font-bold">
                    Overall Profile Score
                  </h2>

                  <p className="mt-2 max-w-xl text-blue-100">
                    Your score is based on profile clarity,
                    skill presentation, credibility, and
                    client-focused communication.
                  </p>
                </div>

                <div className="flex h-36 w-36 shrink-0 items-center justify-center rounded-full border-8 border-white/20 bg-white text-[#1A56DB] shadow-xl">
                  <div className="text-center">
                    <p className="text-5xl font-bold">
                      {result.score}
                    </p>

                    <p className="text-sm font-semibold text-slate-500">
                      out of 10
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Result cards */}

            <div className="grid gap-6 lg:grid-cols-3">
              <ResultCard
                title="Strengths"
                items={result.strengths}
                emptyText="No strengths were returned."
                icon={
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                }
                headingClass="text-green-700"
                iconContainerClass="bg-green-100"
                itemIcon="✓"
                itemIconClass="text-green-600"
              />

              <ResultCard
                title="Weaknesses"
                items={result.weaknesses}
                emptyText="No weaknesses were returned."
                icon={
                  <ShieldAlert className="h-6 w-6 text-red-600" />
                }
                headingClass="text-red-700"
                iconContainerClass="bg-red-100"
                itemIcon="×"
                itemIconClass="text-red-600"
              />

              <ResultCard
                title="Suggestions"
                items={result.suggestions}
                emptyText="No suggestions were returned."
                icon={
                  <Lightbulb className="h-6 w-6 text-blue-600" />
                }
                headingClass="text-blue-700"
                iconContainerClass="bg-blue-100"
                itemIcon="→"
                itemIconClass="text-blue-600"
              />
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

function ResultCard({
  title,
  items,
  emptyText,
  icon,
  headingClass,
  iconContainerClass,
  itemIcon,
  itemIconClass,
}) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-2xl ${iconContainerClass}`}
        >
          {icon}
        </div>

        <h3
          className={`text-xl font-bold ${headingClass}`}
        >
          {title}
        </h3>
      </div>

      {items.length > 0 ? (
        <ul className="mt-6 space-y-4">
          {items.map((item, index) => (
            <li
              key={`${title}-${index}`}
              className="flex items-start gap-3 rounded-xl bg-slate-50 p-4 text-slate-700"
            >
              <span
                className={`mt-0.5 font-bold ${itemIconClass}`}
              >
                {itemIcon}
              </span>

              <span className="leading-6">
                {item}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-6 rounded-xl bg-slate-50 p-4 text-slate-500">
          {emptyText}
        </p>
      )}
    </article>
  );
}

export default ProfileAnalyzer;