import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Onboarding() {
  const [step, setStep] = useState(1);
  const [platform, setPlatform] = useState("");

  const navigate = useNavigate();

  const handleContinue = () => {
    if (!platform) {
      return;
    }

    localStorage.setItem(
      "preferredPlatform",
      platform
    );

    localStorage.removeItem("showOnboarding");

    navigate("/proposal-generator", {
      state: {
        platform:
          platform === "Both"
            ? "Upwork"
            : platform,
        fromOnboarding: true,
      },
      replace: true,
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-8 shadow-xl">

        {/* Progress */}
        <div className="mb-8 flex items-center justify-center gap-3">
          <div
            className={`h-3 w-3 rounded-full ${
              step >= 1
                ? "bg-blue-600"
                : "bg-gray-300"
            }`}
          />

          <div
            className={`h-3 w-3 rounded-full ${
              step >= 2
                ? "bg-blue-600"
                : "bg-gray-300"
            }`}
          />
        </div>

        {/* Step 1 */}
        {step === 1 && (
          <div className="text-center">

            <div className="mb-6 text-6xl">
              🚀
            </div>

            <h1 className="mb-4 text-4xl font-bold text-slate-800">
              Welcome to Gigora
            </h1>

            <p className="mb-10 text-lg text-gray-600">
              Your AI-powered assistant for Fiverr and
              Upwork success. Let&apos;s get everything
              ready in less than a minute.
            </p>

            <button
              type="button"
              onClick={() => setStep(2)}
              className="rounded-xl bg-blue-600 px-8 py-3 font-semibold text-white transition hover:bg-blue-700"
            >
              Get Started
            </button>

          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div>

            <div className="mb-10 text-center">
              <h2 className="text-3xl font-bold text-slate-800">
                Choose Your Platform
              </h2>

              <p className="mt-3 text-gray-600">
                Select the platform you mainly work on.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-3">

              {/* Fiverr */}
              <button
                type="button"
                onClick={() => setPlatform("Fiverr")}
                className={`rounded-xl border-2 p-6 text-center transition ${
                  platform === "Fiverr"
                    ? "border-blue-600 bg-blue-50"
                    : "border-gray-200 hover:border-blue-400"
                }`}
              >
                <div className="mb-4 text-5xl">
                  🎯
                </div>

                <h3 className="text-xl font-bold">
                  Fiverr
                </h3>

                <p className="mt-2 text-gray-500">
                  Optimize gigs, profile and proposals.
                </p>
              </button>

              {/* Upwork */}
              <button
                type="button"
                onClick={() => setPlatform("Upwork")}
                className={`rounded-xl border-2 p-6 text-center transition ${
                  platform === "Upwork"
                    ? "border-blue-600 bg-blue-50"
                    : "border-gray-200 hover:border-blue-400"
                }`}
              >
                <div className="mb-4 text-5xl">
                  💼
                </div>

                <h3 className="text-xl font-bold">
                  Upwork
                </h3>

                <p className="mt-2 text-gray-500">
                  Generate winning proposals for clients.
                </p>
              </button>

              {/* Both */}
              <button
                type="button"
                onClick={() => setPlatform("Both")}
                className={`rounded-xl border-2 p-6 text-center transition ${
                  platform === "Both"
                    ? "border-blue-600 bg-blue-50"
                    : "border-gray-200 hover:border-blue-400"
                }`}
              >
                <div className="mb-4 text-5xl">
                  🌍
                </div>

                <h3 className="text-xl font-bold">
                  Both
                </h3>

                <p className="mt-2 text-gray-500">
                  Use Gigora for Fiverr and Upwork.
                </p>
              </button>

            </div>

            <div className="mt-10 flex justify-between">

              <button
                type="button"
                onClick={() => setStep(1)}
                className="rounded-xl border border-gray-300 px-6 py-3 transition hover:bg-gray-100"
              >
                Back
              </button>

              <button
                type="button"
                disabled={!platform}
                onClick={handleContinue}
                className={`rounded-xl px-8 py-3 font-semibold text-white transition ${
                  platform
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "cursor-not-allowed bg-gray-400"
                }`}
              >
                Continue to Proposal Generator
              </button>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}

export default Onboarding;