import { useState, useEffect } from "react";
import { CheckCircle, Crown, Zap, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import api from "../services/api";

function Pricing() {
  const [loading, setLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [plan, setPlan] = useState("free");

  useEffect(() => {
    const savedUser = JSON.parse(
      localStorage.getItem("gigora_user")
    );

    if (savedUser) {
      setPlan(savedUser.plan || "free");
    }
  }, []);

  const handleUpgrade = async () => {
    try {
      setLoading(true);

      const response = await api.post(
        "/api/payment/create-checkout-session"
      );

      window.location.href = response.data.checkout_url;
    } catch (err) {
      console.error(err);

      toast.error(
        err.response?.data?.detail ||
          "Unable to start payment."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    try {
      setCancelLoading(true);

      await api.post(
        "/api/payment/cancel-subscription"
      );

      toast.success(
        "Subscription cancelled successfully."
      );

      const savedUser = JSON.parse(
        localStorage.getItem("gigora_user")
      );

      if (savedUser) {
        savedUser.plan = "free";

        localStorage.setItem(
          "gigora_user",
          JSON.stringify(savedUser)
        );
      }

      setPlan("free");

    } catch (err) {
      toast.error(
        err.response?.data?.detail ||
          "Unable to cancel subscription."
      );
    } finally {
      setCancelLoading(false);
    }
  };

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

<p className="mt-3 text-lg font-semibold text-[#1A56DB]">
  Current Plan:
  <span className="ml-2 uppercase">
    {plan}
  </span>
</p>

<p className="mx-auto mt-4 max-w-2xl text-lg text-[#6B7280]">
            Upgrade to Gigora Pro and unlock unlimited AI-powered tools
            to grow your freelance business faster.
          </p>
        </div>

        {/* Pricing Cards */}

        <div className="mt-16 grid gap-8 lg:grid-cols-2">

          {/* FREE PLAN */}

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
                  className="text-[#059669]"
                  size={20}
                />
                <span>5 AI Requests / Day</span>
              </div>

              <div className="flex items-center gap-3">
                <CheckCircle
                  className="text-[#059669]"
                  size={20}
                />
                <span>Profile Analyzer</span>
              </div>

              <div className="flex items-center gap-3">
                <CheckCircle
                  className="text-[#059669]"
                  size={20}
                />
                <span>Gig SEO Optimizer</span>
              </div>

              <div className="flex items-center gap-3">
                <CheckCircle
                  className="text-[#059669]"
                  size={20}
                />
                <span>Proposal Generator</span>
              </div>
            </div>

            <button
  disabled
  className={`mt-10 w-full rounded-xl py-4 font-semibold ${
    plan === "free"
      ? "cursor-not-allowed bg-slate-200 text-slate-500"
      : "border border-slate-300 bg-white text-slate-700"
  }`}
>
  {plan === "free"
    ? "Current Plan"
    : "Free Plan"}
</button>
          </div>

          {/* PRO PLAN */}

          <div className="relative overflow-hidden rounded-3xl border-2 border-[#1A56DB] bg-white p-10 shadow-xl">

            {/* Badge */}

            <div className="absolute right-6 top-6 rounded-full bg-[#1A56DB] px-4 py-2 text-xs font-bold uppercase tracking-wide text-white">
              Most Popular
            </div>

            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-[#EFF6FF]">
              <Zap
                className="text-[#1A56DB]"
                size={30}
              />
            </div>

            <h2 className="mt-6 text-3xl font-bold text-[#1E3A5F]">
              Pro
            </h2>

            <div className="mt-6 flex items-end gap-2">
              <span className="text-5xl font-bold text-[#111827]">
                $5.0
              </span>

              <span className="mb-1 text-[#6B7280]">
                / Month
              </span>
            </div>

            <div className="mt-10 space-y-5">

              <div className="flex items-center gap-3">
                <CheckCircle
                  className="text-[#059669]"
                  size={20}
                />
                <span>Unlimited AI Requests</span>
              </div>

              <div className="flex items-center gap-3">
                <CheckCircle
                  className="text-[#059669]"
                  size={20}
                />
                <span>Faster AI Responses</span>
              </div>

              <div className="flex items-center gap-3">
                <CheckCircle
                  className="text-[#059669]"
                  size={20}
                />
                <span>Priority Support</span>
              </div>

              <div className="flex items-center gap-3">
                <CheckCircle
                  className="text-[#059669]"
                  size={20}
                />
                <span>Future Premium Features</span>
              </div>

            </div>

            {plan === "pro" ? (
  <button
    onClick={handleCancelSubscription}
    disabled={cancelLoading}
    className="mt-10 flex w-full items-center justify-center gap-2 rounded-xl bg-red-500 py-4 font-semibold text-white transition hover:bg-red-600 disabled:opacity-70"
  >
    {cancelLoading ? (
      <>
        <Loader2 className="h-5 w-5 animate-spin" />
        Cancelling...
      </>
    ) : (
      "Cancel Subscription"
    )}
  </button>
) : (
  <button
    onClick={handleUpgrade}
    disabled={loading}
    className="mt-10 flex w-full items-center justify-center gap-2 rounded-xl bg-[#1A56DB] py-4 font-semibold text-white transition hover:bg-[#1E3A5F] disabled:cursor-not-allowed disabled:opacity-70"
  >
    {loading ? (
      <>
        <Loader2 className="h-5 w-5 animate-spin" />
        Redirecting...
      </>
    ) : (
      <>
        <Crown size={20} />
        Upgrade to Pro
      </>
    )}
  </button>
)}
          </div>

        </div>

      </div>
    </div>
  );
}

export default Pricing;