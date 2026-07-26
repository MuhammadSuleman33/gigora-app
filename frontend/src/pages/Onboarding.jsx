import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Onboarding() {
  const [step, setStep] = useState(1);
  const [platform, setPlatform] = useState("");
  const navigate = useNavigate();
  const [jobDescription, setJobDescription] = useState("");


const [proposal, setProposal] = useState("");

const [loading, setLoading] = useState(false);

const generateFirstProposal = async () => {
  setLoading(true);

  try {
    const response = await api.post("/api/proposal/", {
      job_post:
        "I need a React developer to build a responsive landing page for my business.",
      tone: "Professional",
      skill: "React Developer",
      platform: platform || "Upwork",
      length: "Medium",
    });

    setProposal(response.data.proposal);

    localStorage.setItem("fromOnboarding", "true");

    navigate("/proposal-generator", {
      state: {
        proposal: response.data.proposal,
      },
    });
  } catch (err) {
    console.error(err);
    alert("Unable to generate proposal.");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-8">

        {/* Progress */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className={`h-3 w-3 rounded-full ${step >= 1 ? "bg-blue-600" : "bg-gray-300"}`} />
          <div className={`h-3 w-3 rounded-full ${step >= 2 ? "bg-blue-600" : "bg-gray-300"}`} />
          <div className={`h-3 w-3 rounded-full ${step >= 3 ? "bg-blue-600" : "bg-gray-300"}`} />
        </div>

        {/* STEP 1 */}
        {step === 1 && (
          <div className="text-center">

            <div className="text-6xl mb-6">
              🚀
            </div>

            <h1 className="text-4xl font-bold text-slate-800 mb-4">
              Welcome to Gigora
            </h1>

            <p className="text-gray-600 text-lg mb-10">
              Your AI-powered assistant for Fiverr and Upwork success.
              Let's get everything ready in less than a minute.
            </p>

            <button
              onClick={() => setStep(2)}
              className="bg-blue-600 hover:bg-blue-700 transition text-white px-8 py-3 rounded-xl font-semibold"
            >
              Get Started
            </button>

          </div>
        )}

        {/* STEP 2 */}
{step === 2 && (
  <div>

    <div className="text-center mb-10">
      <h2 className="text-3xl font-bold text-slate-800">
        Choose Your Platform
      </h2>

      <p className="text-gray-600 mt-3">
        Select the platform you mainly work on.
      </p>
    </div>

    <div className="grid md:grid-cols-3 gap-5">

      {/* Fiverr */}
      <div
        onClick={() => setPlatform("Fiverr")}
        className={`cursor-pointer rounded-xl border-2 p-6 text-center transition
        ${
          platform === "Fiverr"
            ? "border-blue-600 bg-blue-50"
            : "border-gray-200 hover:border-blue-400"
        }`}
      >
        <div className="text-5xl mb-4">🎯</div>

        <h3 className="font-bold text-xl">
          Fiverr
        </h3>

        <p className="text-gray-500 mt-2">
          Optimize gigs, profile and proposals.
        </p>
      </div>

      {/* Upwork */}
      <div
        onClick={() => setPlatform("Upwork")}
        className={`cursor-pointer rounded-xl border-2 p-6 text-center transition
        ${
          platform === "Upwork"
            ? "border-blue-600 bg-blue-50"
            : "border-gray-200 hover:border-blue-400"
        }`}
      >
        <div className="text-5xl mb-4">💼</div>

        <h3 className="font-bold text-xl">
          Upwork
        </h3>

        <p className="text-gray-500 mt-2">
          Generate winning proposals for clients.
        </p>
      </div>

      {/* Both */}
      <div
        onClick={() => setPlatform("Both")}
        className={`cursor-pointer rounded-xl border-2 p-6 text-center transition
        ${
          platform === "Both"
            ? "border-blue-600 bg-blue-50"
            : "border-gray-200 hover:border-blue-400"
        }`}
      >
        <div className="text-5xl mb-4">🌍</div>

        <h3 className="font-bold text-xl">
          Both
        </h3>

        <p className="text-gray-500 mt-2">
          Use Gigora for both Fiverr and Upwork.
        </p>
      </div>

    </div>

    <div className="flex justify-between mt-10">

      <button
        onClick={() => setStep(1)}
        className="px-6 py-3 rounded-xl border border-gray-300 hover:bg-gray-100"
      >
        Back
      </button>

      <button
        disabled={!platform}
        onClick={() => setStep(3)}
        className={`px-8 py-3 rounded-xl text-white font-semibold
        ${
          platform
            ? "bg-blue-600 hover:bg-blue-700"
            : "bg-gray-400 cursor-not-allowed"
        }`}
      >
        Continue
      </button>

    </div>

  </div>
)}

{/* STEP 3 */}
{step === 3 && (
  <div>

    <h2 className="text-3xl font-bold mb-6">
      Generate Your First Proposal
    </h2>

    <textarea
      rows={7}
      value={jobDescription}
      onChange={(e) => setJobDescription(e.target.value)}
      placeholder="Paste a job post..."
      className="w-full border rounded-xl p-4"
    />

    <button
      onClick={generateFirstProposal}
      disabled={loading || !jobDescription}
      className="mt-6 bg-blue-600 text-white px-8 py-3 rounded-xl"
    >
      {loading
        ? "Generating..."
        : "Generate My First Proposal"}
    </button>

    {proposal && (
      <div className="mt-8">

        <h3 className="font-bold text-xl mb-3">
          Your AI Proposal
        </h3>

        <div className="bg-gray-100 rounded-xl p-5 whitespace-pre-wrap">
          {proposal}
        </div>

        <button
          onClick={() => navigate("/dashboard")}
          className="mt-6 bg-green-600 text-white px-8 py-3 rounded-xl"
        >
          Continue to Dashboard
        </button>

      </div>
    )}

  </div>
)}
      </div>
    </div>
  );
}

export default Onboarding;