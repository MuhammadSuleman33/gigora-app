import { useState } from "react";
import UpgradeModal from "../components/UpgradeModal";
import { toast } from "react-hot-toast";
import "../App.css";

function ProposalGenerator() {
  const [jobPost, setJobPost] = useState("");
  const [proposal, setProposal] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [showUpgrade, setShowUpgrade] = useState(false);

  const [tone, setTone] = useState("professional");
  const [skill, setSkill] = useState("Web Development");
  const [platform, setPlatform] = useState("Upwork");
  const [length, setLength] = useState("medium");
  const [keyPoints, setKeyPoints] = useState([]);

  const generateProposal = async () => {
    if (!jobPost.trim()) {
      setError("Please paste a job post.");
      return;
    }

    setLoading(true);
    setError("");
    setProposal("");
    setKeyPoints([]);

    try {
      const token = localStorage.getItem(
        "gigora_access_token"
      );

      const response = await fetch(
        "http://127.0.0.1:8000/api/proposal",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            job_post: jobPost,
            tone,
            skill,
            platform,
            length,
          }),
        }
      );

      const data = await response.json();

      if (response.status === 403 || response.status === 429) {
        setShowUpgrade(true);
        return;
      }

      if (!response.ok) {
        throw new Error(data.detail || "Something went wrong.");
      }

      setProposal(data.data.proposal);
      setKeyPoints(data.data.key_points || []);
      toast.success("Proposal generated successfully.");

      window.dispatchEvent(new Event("dashboard-update"));
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyProposal = async () => {
    if (!proposal) {
      toast.error("Nothing to copy yet.");
      return;
    }

    await navigator.clipboard.writeText(proposal);
    toast.success("Proposal copied successfully.");
  };

  const downloadProposal = () => {
    const blob = new Blob([proposal], {
      type: "text/plain",
    });

    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `proposal-${Date.now()}.txt`;
    a.click();

    window.URL.revokeObjectURL(url);
  };

  return (
  <div className="min-h-screen bg-slate-50 px-6 py-10">
    <div className="mx-auto max-w-6xl">

      {/* Header */}

      <div className="mb-8">
        <h1 className="text-4xl font-bold text-[#1E3A5F]">
          AI Proposal Generator
        </h1>

        <p className="mt-3 text-lg text-[#6B7280]">
          Generate professional, personalized proposals that help you win
          more freelance projects.
        </p>
      </div>

      {/* Main Card */}

      <div className="rounded-3xl bg-white p-8 shadow-lg">

        {/* Options */}

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">

          <div>
            <label className="mb-2 block text-sm font-semibold text-[#1E3A5F]">
              Tone
            </label>

            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-[#1A56DB] focus:ring-4 focus:ring-blue-100"
            >
              <option value="professional">Professional</option>
              <option value="friendly">Friendly</option>
              <option value="confident">Confident</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-[#1E3A5F]">
              Skill
            </label>

            <select
              value={skill}
              onChange={(e) => setSkill(e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-[#1A56DB] focus:ring-4 focus:ring-blue-100"
            >
              <option>Web Development</option>
              <option>Graphic Design</option>
              <option>Writing</option>
              <option>Marketing</option>
              <option>Mobile Development</option>
              <option>AI/ML</option>
              <option>Other</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-[#1E3A5F]">
              Platform
            </label>

            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-[#1A56DB] focus:ring-4 focus:ring-blue-100"
            >
              <option>Upwork</option>
              <option>Fiverr</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-[#1E3A5F]">
              Length
            </label>

            <select
              value={length}
              onChange={(e) => setLength(e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-[#1A56DB] focus:ring-4 focus:ring-blue-100"
            >
              <option value="short">Short</option>
              <option value="medium">Medium</option>
              <option value="long">Long</option>
            </select>
          </div>

        </div>

        {/* Job Post */}

        <div className="mt-8">

          <label className="mb-3 block text-sm font-semibold text-[#1E3A5F]">
            Job Description
          </label>

          <textarea
            placeholder="Paste the client's job post here..."
            value={jobPost}
            onChange={(e) => setJobPost(e.target.value)}
            className="min-h-[220px] w-full rounded-2xl border border-gray-300 px-5 py-4 outline-none transition focus:border-[#1A56DB] focus:ring-4 focus:ring-blue-100"
          />

        </div>

        {/* Buttons */}

        <div className="mt-8 flex flex-col gap-4 sm:flex-row">

          <button
            onClick={generateProposal}
            disabled={loading}
            className="rounded-xl bg-[#1A56DB] px-8 py-4 font-semibold text-white transition hover:bg-[#1E3A5F] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Generating..." : "Generate Proposal"}
          </button>

          {proposal && (
            <button
              onClick={generateProposal}
              disabled={loading}
              className="rounded-xl border border-[#1A56DB] px-8 py-4 font-semibold text-[#1A56DB] transition hover:bg-[#EFF6FF]"
            >
              {loading ? "Regenerating..." : "Regenerate"}
            </button>
          )}

        </div>

        {/* Error */}

        {error && (

          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-600">
            {error}
          </div>

        )}

        {/* Result */}

        {proposal && (

          <div className="mt-10 space-y-8">

            <div>

              <h2 className="text-2xl font-bold text-[#1E3A5F]">
                Generated Proposal
              </h2>

              <textarea
                value={proposal}
                readOnly
                className="mt-4 min-h-[260px] w-full rounded-2xl border border-gray-300 bg-slate-50 px-5 py-4 outline-none"
              />

            </div>

            {keyPoints.length > 0 && (

              <div>

                <h3 className="mb-4 text-xl font-bold text-[#1E3A5F]">
                  Key Points
                </h3>

                <div className="flex flex-wrap gap-3">

                  {keyPoints.map((point, index) => (

                    <span
                      key={index}
                      className="rounded-full bg-[#EFF6FF] px-4 py-2 text-sm font-semibold text-[#1A56DB]"
                    >
                      {point}
                    </span>

                  ))}

                </div>

              </div>

            )}

            {/* Action Buttons */}

            <div className="flex flex-col gap-4 sm:flex-row">

              <button
                onClick={copyProposal}
                className="rounded-xl bg-[#059669] px-6 py-4 font-semibold text-white transition hover:bg-green-700"
              >
                Copy Proposal
              </button>

              <button
                onClick={downloadProposal}
                className="rounded-xl bg-[#1A56DB] px-6 py-4 font-semibold text-white transition hover:bg-[#1E3A5F]"
              >
                Download Proposal
              </button>

            </div>

          </div>

        )}

      </div>

      <UpgradeModal
        open={showUpgrade}
        onClose={() => setShowUpgrade(false)}
      />

    </div>
  </div>
);
}

export default ProposalGenerator;