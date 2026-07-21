import { CheckCircle, Crown, Zap } from "lucide-react";

function Pricing() {
  return (
    <div className="min-h-screen bg-slate-50 px-6 py-16">

      <div className="mx-auto max-w-7xl">

        {/* Header */}

        <div className="text-center">

          <span className="inline-flex items-center gap-2 rounded-full bg-[#EFF6FF] px-5 py-2 text-sm font-semibold text-[#1A56DB]">
            <Crown size={16} />
            Pricing Plans
          </span>

          <h1 className="mt-6 text-4xl font-bold text-[#1E3A5F] lg:text-5xl">
            Choose Your Plan
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-lg text-[#6B7280]">
            Upgrade to Gigora Pro and unlock unlimited AI-powered tools
            to grow your freelance business faster.
          </p>

        </div>

        {/* Cards */}

        <div className="mt-16 grid gap-8 lg:grid-cols-2">

          {/* FREE */}

          <div className="rounded-3xl border border-slate-200 bg-white p-10 shadow-sm transition hover:-translate-y-2 hover:shadow-xl">

            <h2 className="text-2xl font-bold text-[#1E3A5F]">
              Free
            </h2>

            <div className="mt-6 flex items-end gap-2">

              <span className="text-5xl font-bold text-[#111827]">
                $0
              </span>

              <span className="mb-1 text-[#6B7280]">
                / Forever
              </span>

            </div>

            <div className="mt-10 space-y-5">

              <div className="flex items-center gap-3">
                <CheckCircle
                  size={20}
                  className="text-[#059669]"
                />
                <span>5 AI Requests / Day</span>
              </div>

              <div className="flex items-center gap-3">
                <CheckCircle
                  size={20}
                  className="text-[#059669]"
                />
                <span>Profile Analyzer</span>
              </div>

              <div className="flex items-center gap-3">
                <CheckCircle
                  size={20}
                  className="text-[#059669]"
                />
                <span>Gig SEO Optimizer</span>
              </div>

              <div className="flex items-center gap-3">
                <CheckCircle
                  size={20}
                  className="text-[#059669]"
                />
                <span>Proposal Generator</span>
              </div>

            </div>

            <button
              disabled
              className="mt-10 w-full cursor-not-allowed rounded-xl bg-slate-200 py-4 font-semibold text-slate-500"
            >
              Current Plan
            </button>

          </div>

          {/* PRO */}

          <div className="relative overflow-hidden rounded-3xl border-2 border-[#1A56DB] bg-white p-10 shadow-xl">

            {/* Badge */}

            <div className="absolute right-6 top-6 rounded-full bg-[#1A56DB] px-4 py-2 text-xs font-bold uppercase tracking-wide text-white">

              Most Popular

            </div>

            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-[#EFF6FF]">

              <Zap
                size={30}
                className="text-[#1A56DB]"
              />

            </div>

            <h2 className="mt-6 text-3xl font-bold text-[#1E3A5F]">
              Pro
            </h2>

            <div className="mt-6 flex items-end gap-2">

              <span className="text-5xl font-bold text-[#111827]">
                $9.99
              </span>

              <span className="mb-1 text-[#6B7280]">
                / Month
              </span>

            </div>

            <div className="mt-10 space-y-5">

              <div className="flex items-center gap-3">
                <CheckCircle
                  size={20}
                  className="text-[#059669]"
                />
                <span>Unlimited AI Requests</span>
              </div>

              <div className="flex items-center gap-3">
                <CheckCircle
                  size={20}
                  className="text-[#059669]"
                />
                <span>Faster AI Responses</span>
              </div>

              <div className="flex items-center gap-3">
                <CheckCircle
                  size={20}
                  className="text-[#059669]"
                />
                <span>Priority Support</span>
              </div>

              <div className="flex items-center gap-3">
                <CheckCircle
                  size={20}
                  className="text-[#059669]"
                />
                <span>Future Premium Features</span>
              </div>

            </div>

            <button
              className="mt-10 w-full rounded-xl bg-[#1A56DB] py-4 font-semibold text-white transition hover:bg-[#1E3A5F]"
            >
              Upgrade Now
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Pricing;