import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  Clipboard,
  Download,
  FileText,
  LayoutDashboard,
  Loader2,
  Sparkles,
} from "lucide-react";
import { toast } from "react-hot-toast";

import UpgradeModal from "../components/UpgradeModal";
import api from "../services/api";

function ProposalGenerator() {
  const navigate = useNavigate();

  const [jobPost, setJobPost] = useState("");
  const [proposal, setProposal] = useState("");
  const [keyPoints, setKeyPoints] = useState([]);

  const [tone, setTone] = useState("professional");
  const [skill, setSkill] = useState(
    "Web Development"
  );
  const [platform, setPlatform] =
    useState("Upwork");
  const [length, setLength] =
    useState("medium");

  const [loading, setLoading] =
    useState(false);
  const [error, setError] = useState("");
  const [showUpgrade, setShowUpgrade] =
    useState(false);

  const generateProposal = async () => {
    if (!jobPost.trim()) {
      const message =
        "Please paste a job description.";

      setError(message);
      toast.error(message);
      return;
    }

    try {
      setLoading(true);
      setError("");
      setProposal("");
      setKeyPoints([]);

      const response = await api.post(
        "/api/proposal",
        {
          job_post: jobPost.trim(),
          tone,
          skill,
          platform,
          length,
        }
      );

      console.log(
        "Proposal API Response:",
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
        typeof formattedResult.result ===
          "string"
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

      const generatedProposal =
        formattedResult?.proposal ||
        formattedResult?.best_proposal ||
        "";

      if (!generatedProposal) {
        throw new Error(
          "No proposal was returned by the AI."
        );
      }

      setProposal(generatedProposal);

      setKeyPoints(
        Array.isArray(
          formattedResult?.key_points
        )
          ? formattedResult.key_points
          : []
      );

      toast.success(
        "Proposal generated successfully."
      );

      window.dispatchEvent(
        new Event("dashboard-update")
      );

      if (
        localStorage.getItem(
          "fromOnboarding"
        ) === "true"
      ) {
        localStorage.removeItem(
          "fromOnboarding"
        );

        setTimeout(() => {
          navigate("/dashboard");
        }, 1500);
      }
    } catch (err) {
      console.error(
        "Proposal Generator Error:",
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

      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const copyProposal = async () => {
    if (!proposal) {
      toast.error("Nothing to copy yet.");
      return;
    }

    try {
      await navigator.clipboard.writeText(
        proposal
      );

      toast.success(
        "Proposal copied successfully."
      );
    } catch (err) {
      console.error(
        "Clipboard Error:",
        err
      );

      toast.error(
        "Unable to copy the proposal."
      );
    }
  };

  const downloadProposal = () => {
    if (!proposal) {
      toast.error(
        "No proposal is available to download."
      );
      return;
    }

    const blob = new Blob([proposal], {
      type: "text/plain;charset=utf-8",
    });

    const url =
      window.URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;
    link.download = `proposal-${Date.now()}.txt`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    window.URL.revokeObjectURL(url);

    toast.success(
      "Proposal downloaded successfully."
    );
  };

  const handleReset = () => {
    setJobPost("");
    setProposal("");
    setKeyPoints([]);
    setError("");
    setTone("professional");
    setSkill("Web Development");
    setPlatform("Upwork");
    setLength("medium");
  };

  return (
    <>
      <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-6xl">
          {/* Header */}

          <header className="mb-8 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700">
                <Sparkles className="h-4 w-4" />
                AI Proposal Writing
              </span>

              <h1 className="mt-4 text-3xl font-bold tracking-tight text-[#1E3A5F] sm:text-4xl">
                AI Proposal Generator
              </h1>

              <p className="mt-3 max-w-3xl text-base leading-7 text-[#6B7280] sm:text-lg">
                Generate professional,
                personalized proposals that help
                you win more freelance projects.
              </p>
            </div>

            <Link
              to="/dashboard"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-blue-200 bg-white px-5 py-3 font-semibold text-[#1A56DB] shadow-sm transition hover:border-blue-300 hover:bg-[#EFF6FF] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
            >
              <ArrowLeft className="h-5 w-5" />
              <LayoutDashboard className="h-5 w-5" />
              Go to Dashboard
            </Link>
          </header>

          {/* Main card */}

          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg">
            <div className="border-b border-slate-200 bg-gradient-to-r from-[#1A56DB] to-[#1E3A5F] px-6 py-7 text-white sm:px-8">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
                  <FileText className="h-6 w-6" />
                </div>

                <div>
                  <h2 className="text-2xl font-bold">
                    Create Your Proposal
                  </h2>

                  <p className="mt-1 text-blue-100">
                    Choose your preferences and
                    paste the client's job
                    description.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-8">
              {/* Options */}

              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
                <SelectField
                  label="Tone"
                  value={tone}
                  onChange={setTone}
                  options={[
                    {
                      value: "professional",
                      label: "Professional",
                    },
                    {
                      value: "friendly",
                      label: "Friendly",
                    },
                    {
                      value: "confident",
                      label: "Confident",
                    },
                  ]}
                />

                <SelectField
                  label="Skill"
                  value={skill}
                  onChange={setSkill}
                  options={[
                    {
                      value: "Web Development",
                      label: "Web Development",
                    },
                    {
                      value: "Graphic Design",
                      label: "Graphic Design",
                    },
                    {
                      value: "Writing",
                      label: "Writing",
                    },
                    {
                      value: "Marketing",
                      label: "Marketing",
                    },
                    {
                      value: "Mobile Development",
                      label: "Mobile Development",
                    },
                    {
                      value: "AI/ML",
                      label: "AI/ML",
                    },
                    {
                      value: "Other",
                      label: "Other",
                    },
                  ]}
                />

                <SelectField
                  label="Platform"
                  value={platform}
                  onChange={setPlatform}
                  options={[
                    {
                      value: "Upwork",
                      label: "Upwork",
                    },
                    {
                      value: "Fiverr",
                      label: "Fiverr",
                    },
                  ]}
                />

                <SelectField
                  label="Length"
                  value={length}
                  onChange={setLength}
                  options={[
                    {
                      value: "short",
                      label: "Short",
                    },
                    {
                      value: "medium",
                      label: "Medium",
                    },
                    {
                      value: "long",
                      label: "Long",
                    },
                  ]}
                />
              </div>

              {/* Job description */}

              <div className="mt-8">
                <label
                  htmlFor="jobPost"
                  className="mb-3 block text-sm font-semibold text-[#1E3A5F]"
                >
                  Job Description
                </label>

                <textarea
                  id="jobPost"
                  placeholder="Paste the client's complete job post here..."
                  value={jobPost}
                  onChange={(e) => {
                    setJobPost(e.target.value);

                    if (error) {
                      setError("");
                    }
                  }}
                  className="min-h-[240px] w-full resize-y rounded-2xl border border-slate-300 bg-slate-50 px-5 py-4 text-[#111827] outline-none transition placeholder:text-slate-400 focus:border-[#1A56DB] focus:bg-white focus:ring-4 focus:ring-blue-100"
                />

                <div className="mt-2 flex justify-end">
                  <span className="text-sm text-slate-500">
                    {jobPost.length} characters
                  </span>
                </div>
              </div>

              {/* Buttons */}

              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <button
                  type="button"
                  onClick={generateProposal}
                  disabled={
                    loading ||
                    !jobPost.trim()
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1A56DB] px-8 py-4 font-semibold text-white shadow-sm transition hover:bg-[#1E3A5F] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5" />
                      Generate Proposal
                    </>
                  )}
                </button>

                {proposal && (
                  <button
                    type="button"
                    onClick={generateProposal}
                    disabled={loading}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#1A56DB] bg-white px-8 py-4 font-semibold text-[#1A56DB] transition hover:bg-[#EFF6FF] disabled:cursor-not-allowed disabled:opacity-60"
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

                {(jobPost ||
                  proposal ||
                  error) && (
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

              {/* Error */}

              {error && (
                <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
                  {error}
                </div>
              )}

              {/* Result */}

              {proposal && (
                <div className="mt-10 space-y-8 border-t border-slate-200 pt-10">
                  <div>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h2 className="text-2xl font-bold text-[#1E3A5F]">
                          Generated Proposal
                        </h2>

                        <p className="mt-1 text-slate-500">
                          Review the proposal before
                          sending it to the client.
                        </p>
                      </div>

                      <span className="inline-flex w-fit items-center gap-2 rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-700">
                        <CheckCircle2 className="h-4 w-4" />
                        Ready to Use
                      </span>
                    </div>

                    <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-6">
                      <p className="whitespace-pre-wrap leading-8 text-slate-700">
                        {proposal}
                      </p>
                    </div>
                  </div>

                  {keyPoints.length > 0 && (
                    <div>
                      <h3 className="mb-4 text-xl font-bold text-[#1E3A5F]">
                        Key Points
                      </h3>

                      <div className="flex flex-wrap gap-3">
                        {keyPoints.map(
                          (point, index) => (
                            <span
                              key={`point-${index}`}
                              className="rounded-full bg-[#EFF6FF] px-4 py-2 text-sm font-semibold text-[#1A56DB]"
                            >
                              {point}
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {/* Action buttons */}

                  <div className="flex flex-col gap-4 sm:flex-row">
                    <button
                      type="button"
                      onClick={copyProposal}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#059669] px-6 py-4 font-semibold text-white transition hover:bg-green-700"
                    >
                      <Clipboard className="h-5 w-5" />
                      Copy Proposal
                    </button>

                    <button
                      type="button"
                      onClick={
                        downloadProposal
                      }
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1A56DB] px-6 py-4 font-semibold text-white transition hover:bg-[#1E3A5F]"
                    >
                      <Download className="h-5 w-5" />
                      Download Proposal
                    </button>
                  </div>
                </div>
              )}
            </div>
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

function SelectField({
  label,
  value,
  onChange,
  options,
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-[#1E3A5F]">
        {label}
      </label>

      <select
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-[#1A56DB] focus:ring-4 focus:ring-blue-100"
      >
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default ProposalGenerator;