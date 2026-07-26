import { ArrowRight, PlayCircle, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

function Hero() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const handleGetStarted = () => {
    if (user) {
      navigate("/dashboard");
    } else {
      navigate("/signup");
    }
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#EFF6FF] via-white to-[#EFF6FF]">
      {/* Background Blur */}
      <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-blue-200/30 blur-3xl"></div>
      <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-indigo-200/30 blur-3xl"></div>

      <div className="relative mx-auto max-w-7xl px-6 py-24 lg:py-32">

        {/* Badge */}

        <div className="flex justify-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-5 py-2 shadow-sm">
            <Sparkles size={18} className="text-[#1A56DB]" />
            <span className="text-sm font-semibold text-[#1A56DB]">
              AI-Powered Freelancing Platform
            </span>
          </div>
        </div>

        {/* Heading */}

        <h1 className="mx-auto mt-8 max-w-5xl text-center text-5xl font-extrabold leading-tight text-[#111827] md:text-6xl lg:text-7xl">
          Win More Freelance
          <span className="block text-[#1A56DB]">
            Projects with AI
          </span>
        </h1>

        {/* Paragraph */}

        <p className="mx-auto mt-8 max-w-3xl text-center text-lg leading-8 text-[#6B7280]">
          Analyze your freelancer profile, optimize gig SEO, and generate
          high-converting proposals with powerful AI tools designed for
          freelancers.
        </p>

        {/* Buttons */}

        <div className="mt-12 flex flex-col items-center justify-center gap-5 sm:flex-row">

          <button
            onClick={handleGetStarted}
            className="group flex items-center gap-2 rounded-xl bg-[#1A56DB] px-8 py-4 font-semibold text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:bg-[#1E3A5F]"
          >
            {user ? "Go to Dashboard" : "Get Started Free"}

            <ArrowRight
              size={18}
              className="transition-transform group-hover:translate-x-1"
            />
          </button>

          <button className="flex items-center gap-2 rounded-xl border-2 border-[#1A56DB] px-8 py-4 font-semibold text-[#1A56DB] transition-all duration-300 hover:bg-[#1A56DB] hover:text-white">

            <PlayCircle size={20} />

            Watch Demo

          </button>

        </div>

        {/* Stats */}

        <div className="mt-20 grid gap-6 md:grid-cols-3">

          <div className="rounded-2xl bg-white p-8 shadow-lg">
            <h2 className="text-4xl font-bold text-[#1A56DB]">
              10K+
            </h2>

            <p className="mt-2 text-[#6B7280]">
              Freelancers Supported
            </p>
          </div>

          <div className="rounded-2xl bg-white p-8 shadow-lg">
            <h2 className="text-4xl font-bold text-[#1A56DB]">
              95%
            </h2>

            <p className="mt-2 text-[#6B7280]">
              Proposal Success Rate
            </p>
          </div>

          <div className="rounded-2xl bg-white p-8 shadow-lg">
            <h2 className="text-4xl font-bold text-[#1A56DB]">
              24/7
            </h2>

            <p className="mt-2 text-[#6B7280]">
              AI Assistance
            </p>
          </div>

        </div>

      </div>
    </section>
  );
}

export default Hero;