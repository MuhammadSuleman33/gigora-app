import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import {
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Trophy,
  ArrowLeft,
LayoutDashboard,
  Clock3,
  AlertCircle,
} from "lucide-react";

function ProposalCompare() {
  const [formData, setFormData] = useState({
    job_post: "",
    tone: "professional",
    skill: "",
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const [showAll, setShowAll] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleCompare = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const response = await api.post(
        "/api/proposal/compare",
        formData
      );

      console.log("Compare Response:", response.data);

      setResult(response.data);

      // Collapse proposals whenever a new comparison runs
      setShowAll(false);
      setCopiedIndex(null);

    } catch (err) {
      console.error(err);

      alert(
        err.response?.data?.detail ||
        "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  };

  const copyProposal = async (text, index) => {
    try {
      await navigator.clipboard.writeText(text);

      setCopiedIndex(index);

      setTimeout(() => {
        setCopiedIndex(null);
      }, 2000);

    } catch (err) {
      console.error(err);
    }
  };

  // ----------------------------------------
  // Data Preparation
  // ----------------------------------------

  const compareData = result?.data;

  const successfulModels =
    compareData?.all_results
      ? [...compareData.all_results].sort(
          (a, b) => b.score - a.score
        )
      : [];

  const failedModels =
    compareData?.failed_models || [];

  const totalModels =
    successfulModels.length +
    failedModels.length;

  // Medal helper

  const getRank = (index) => {
    switch (index) {
      case 0:
        return {
          icon: "🥇",
          color:
            "bg-yellow-100 text-yellow-700 border-yellow-300",
          label: "1st",
        };

      case 1:
        return {
          icon: "🥈",
          color:
            "bg-gray-100 text-gray-700 border-gray-300",
          label: "2nd",
        };

      case 2:
        return {
          icon: "🥉",
          color:
            "bg-orange-100 text-orange-700 border-orange-300",
          label: "3rd",
        };

      default:
        return {
          icon: "🏅",
          color:
            "bg-blue-100 text-blue-700 border-blue-300",
          label: `${index + 1}th`,
        };
    }
  };
 return (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">

    {/* Header */}

    <div className="border-b border-slate-200 bg-white/80 backdrop-blur sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

          <div>

            <span className="inline-flex items-center rounded-full bg-blue-100 text-blue-700 px-3 py-1 text-sm font-semibold">
              AI Comparison Engine
            </span>

            <h1 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900">
              AI Proposal Comparison
            </h1>

            <p className="mt-3 max-w-3xl text-slate-600 text-base sm:text-lg leading-8">
              Generate proposals from multiple AI models, compare quality,
              rank them automatically, and choose the strongest proposal in seconds.
            </p>

          </div>

       <div className="flex w-full flex-col gap-4 sm:flex-row lg:w-auto lg:flex-col xl:flex-row xl:items-center">

  <Link
    to="/dashboard"
    className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-5 py-3 font-semibold text-blue-700 transition hover:bg-blue-100"
  >
    <ArrowLeft size={20} />
    <LayoutDashboard size={20} />
    Go to Dashboard
  </Link>

  {compareData && (
    <div className="grid grid-cols-2 gap-4">

      <div className="rounded-2xl border border-slate-200 bg-white px-6 py-5 text-center shadow-sm">
        <p className="text-sm text-slate-500">
          AI Models
        </p>

        <h3 className="mt-1 text-3xl font-bold text-blue-600">
          {totalModels}
        </h3>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white px-6 py-5 text-center shadow-sm">
        <p className="text-sm text-slate-500">
          Best Score
        </p>

        <h3 className="mt-1 text-3xl font-bold text-green-600">
          {compareData.best_score}
        </h3>
      </div>

    </div>
  )}

</div>

        </div>

      </div>
    </div>

    {/* Content */}

    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* LEFT SIDEBAR */}

        <div className="lg:col-span-4">

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm lg:sticky lg:top-28">

            <div className="border-b border-slate-200 px-7 py-6">

              <h2 className="text-2xl font-bold text-slate-900">
                Generate Proposal
              </h2>

              <p className="text-slate-500 mt-2">
                Paste a job post and compare responses from multiple AI models.
              </p>

            </div>

            <form
              onSubmit={handleCompare}
              className="p-7 space-y-6"
            >

              {/* Job */}

              <div>

                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Job Post
                </label>

                <textarea
                  rows={10}
                  name="job_post"
                  value={formData.job_post}
                  onChange={handleChange}
                  placeholder="Paste the client's complete job description..."
                  className="w-full rounded-2xl border border-slate-300 bg-slate-50 focus:bg-white p-4 outline-none focus:ring-2 focus:ring-blue-500 transition resize-none"
                />

              </div>

              {/* Skill */}

              <div>

                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Skill
                </label>

                <input
                  type="text"
                  name="skill"
                  value={formData.skill}
                  onChange={handleChange}
                  placeholder="React Developer"
                  className="w-full rounded-2xl border border-slate-300 bg-slate-50 focus:bg-white p-4 outline-none focus:ring-2 focus:ring-blue-500 transition"
                />

              </div>

              {/* Tone */}

              <div>

                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Tone
                </label>

                <select
                  name="tone"
                  value={formData.tone}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-300 bg-slate-50 p-4 outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="professional">
                    Professional
                  </option>

                  <option value="friendly">
                    Friendly
                  </option>

                  <option value="confident">
                    Confident
                  </option>

                </select>

              </div>

              <button
                disabled={loading}
                className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-4 font-semibold shadow-lg transition disabled:opacity-60"
              >

                {loading
                  ? "Comparing AI Models..."
                  : "Compare Proposals"}

              </button>

            </form>

          </div>

        </div>

        {/* RIGHT CONTENT */}

        <div className="lg:col-span-8">

          {!compareData ? (

            <div className="bg-white rounded-3xl border shadow-sm min-h-[600px] flex items-center justify-center">

              <div className="text-center px-8">

                <div className="text-7xl mb-6">
                  🤖
                </div>

                <h2 className="text-3xl font-bold text-slate-800">
                  Ready to Compare
                </h2>

                <p className="text-slate-500 mt-4 max-w-lg">
                  Generate proposals using multiple AI models, compare
                  scores, response speed, and quality, then copy the best one instantly.
                </p>

              </div>

            </div>

          ) : (

            <div className="space-y-8">
              {/* =========================
      BEST PROPOSAL
========================= */}

<div className="overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 shadow-2xl">

  <div className="p-8 sm:p-10">

    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">

      <div>

        <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold">

          <Trophy size={18} />

          Best AI Proposal

        </div>

        <h2 className="mt-5 text-3xl font-bold text-white">

          {compareData.best_model}

        </h2>

        <p className="mt-2 text-blue-100">

          Highest ranked proposal selected automatically.

        </p>

      </div>

      <div className="flex flex-row lg:flex-col gap-4">

        <div className="rounded-2xl bg-white px-6 py-4 text-center shadow">

          <p className="text-xs uppercase tracking-wide text-slate-500">

            Score

          </p>

          <h3 className="text-3xl font-bold text-green-600">

            {compareData.best_score}

          </h3>

        </div>

        <div className="rounded-2xl bg-white px-6 py-4 text-center shadow">

          <p className="text-xs uppercase tracking-wide text-slate-500">

            Winner

          </p>

          <h3 className="font-bold text-blue-600">

            #1

          </h3>

        </div>

      </div>

    </div>

    <div className="mt-8 rounded-2xl border border-white/20 bg-white/10 p-6">

      <p className="whitespace-pre-wrap leading-8 text-white">

        {compareData.best_proposal}

      </p>

    </div>

  </div>

</div>

{/* =========================
      AI PERFORMANCE
========================= */}

<div className="rounded-3xl border border-slate-200 bg-white shadow-sm">

  <div className="border-b border-slate-200 px-8 py-6">

    <div className="flex items-center justify-between">

      <div>

        <h2 className="text-2xl font-bold">

          AI Performance Ranking

        </h2>

        <p className="text-slate-500 mt-1">

          Ranked by proposal quality score.

        </p>

      </div>

      <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600">

        {successfulModels.length} Successful

      </span>

    </div>

  </div>

  <div className="p-6 space-y-5">

    {successfulModels.map((item, index) => {

      const rank = getRank(index);

      return (

        <div
          key={index}
          className={`rounded-2xl border transition-all duration-300 hover:shadow-lg hover:-translate-y-1
          ${
            index === 0
              ? "border-green-400 bg-green-50"
              : "border-slate-200 bg-white"
          }`}
        >

          <div className="p-6">

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

              {/* Left */}

              <div className="flex items-center gap-5">

                <div
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl border ${rank.color}`}
                >

                  {rank.icon}

                </div>

                <div>

                  <h3 className="text-xl font-bold text-slate-800">

                    {item.model}

                  </h3>

                  <p className="text-slate-500">

                    {rank.label} Position

                  </p>

                </div>

              </div>

              {/* Right */}

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">

                <div className="rounded-xl bg-slate-50 px-6 py-4 text-center">

                  <p className="text-xs uppercase text-slate-500">

                    Score

                  </p>

                  <h3 className="text-2xl font-bold text-blue-600">

                    {item.score}

                  </h3>

                </div>

                <div className="rounded-xl bg-slate-50 px-6 py-4 text-center">

                  <p className="text-xs uppercase text-slate-500">

                    Speed

                  </p>

                  <h3 className="text-lg font-bold flex justify-center items-center gap-1">

                    <Clock3 size={16} />

                    {item.speed_ms}ms

                  </h3>

                </div>

                <div
                  className={`rounded-xl px-6 py-4 text-center
                  ${
                    index === 0
                      ? "bg-green-600 text-white"
                      : "bg-slate-100"
                  }`}
                >

                  <p className="text-xs uppercase">

                    Status

                  </p>

                  <h3 className="font-bold">

                    {index === 0 ? "Winner" : "Ranked"}

                  </h3>

                </div>

              </div>

            </div>

          </div>

        </div>

      );

    })}

  </div>

</div>
{/* =======================================
        ALL PROPOSALS
======================================= */}

<div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">

  <button
    onClick={() => setShowAll(!showAll)}
    className="w-full px-8 py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:bg-slate-50 transition"
  >

    <div className="text-left">

      <h2 className="text-2xl font-bold text-slate-900">

        All AI Proposals

      </h2>

      <p className="text-slate-500 mt-1">

        Ranked automatically from highest score to lowest score.

      </p>

    </div>

    <div className="flex items-center gap-3">

      <span className="bg-blue-100 text-blue-700 font-semibold px-4 py-2 rounded-full">

        {successfulModels.length} Results

      </span>

      {showAll ? (
        <ChevronUp size={26} />
      ) : (
        <ChevronDown size={26} />
      )}

    </div>

  </button>

  {showAll && (

    <div className="border-t border-slate-200 p-6 sm:p-8 space-y-6">

      {successfulModels.map((proposal, index) => {

        const rank = getRank(index);

        return (

          <div
            key={index}
            className={`rounded-3xl border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden

            ${
              index === 0
                ? "border-green-400 bg-gradient-to-r from-green-50 to-white"
                : "border-slate-200 bg-white"
            }`}
          >

            {/* Header */}

            <div className="px-6 py-5 border-b border-slate-200 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

              <div className="flex items-center gap-4">

                <div
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl border ${rank.color}`}
                >

                  {rank.icon}

                </div>

                <div>

                  <h3 className="text-xl font-bold text-slate-900">

                    {proposal.model}

                  </h3>

                  <div className="flex flex-wrap items-center gap-2 mt-2">

                    <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-sm">

                      {rank.label} Position

                    </span>

                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">

                      Score {proposal.score}/100

                    </span>

                    <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm">

                      {proposal.speed_ms} ms

                    </span>

                  </div>

                </div>

              </div>

              <button
                onClick={() => copyProposal(proposal.text, index)}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 transition font-medium"
              >

                {copiedIndex === index ? (
                  <>
                    <Check size={18} />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy size={18} />
                    Copy Proposal
                  </>
                )}

              </button>

            </div>

            {/* Proposal */}

            <div className="p-6">

              <div className="rounded-2xl bg-slate-50 border border-slate-200 p-6">

                <p className="leading-8 whitespace-pre-wrap text-slate-700">

                  {proposal.text}

                </p>

              </div>

            </div>

          </div>

        );

      })}

    </div>

  )}

</div>

{/* =======================================
        FAILED MODELS
======================================= */}

{failedModels.length > 0 && (

  <div className="rounded-3xl border border-red-200 bg-white shadow-sm overflow-hidden">

    <div className="px-8 py-6 border-b border-red-100 bg-red-50">

      <div className="flex items-center gap-3">

        <AlertCircle
          size={26}
          className="text-red-600"
        />

        <div>

          <h2 className="text-2xl font-bold text-red-700">

            Failed Models

          </h2>

          <p className="text-red-500 mt-1">

            These AI services couldn't generate a proposal during this request.

          </p>

        </div>

      </div>

    </div>

    <div className="p-6 space-y-5">

      {failedModels.map((item, index) => (

        <div
          key={index}
          className="rounded-2xl border border-red-200 bg-red-50 p-6"
        >

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

            <div>

              <h3 className="font-bold text-lg text-red-700">

                {item.model}

              </h3>

              <p className="text-red-600 mt-2 whitespace-pre-wrap">

                {item.error}

              </p>

            </div>

            <span className="inline-flex items-center justify-center rounded-full bg-red-600 text-white px-4 py-2 font-semibold">

              Failed

            </span>

          </div>

        </div>

      ))}

    </div>

  </div>

)}

          </div>

        )}

      </div>

    </div>

  </div>

</div>
);
}

export default ProposalCompare;