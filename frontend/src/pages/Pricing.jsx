import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle,
  Crown,
  LayoutDashboard,
  Loader2,
  Zap,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../services/api";

function Pricing() {
  const [loading, setLoading] = useState(false);
  const [cancelLoading, setCancelLoading] =
    useState(false);
  const [plan, setPlan] = useState("free");

  useEffect(() => {
    try {
      const savedUser = JSON.parse(
        localStorage.getItem("gigora_user")
      );

      if (savedUser) {
        setPlan(savedUser.plan || "free");
      }
    } catch (error) {
      console.error(
        "Unable to read saved user:",
        error
      );
    }
  }, []);

  const handleUpgrade = async () => {
    try {
      setLoading(true);

      const response = await api.post(
        "/api/payment/create-checkout-session"
      );

      window.location.href =
        response.data.checkout_url;
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

      window.dispatchEvent(
        new Event("dashboard-update")
      );
    } catch (err) {
      console.error(err);

      toast.error(
        err.response?.data?.detail ||
          "Unable to cancel subscription."
      );
    } finally {
      setCancelLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
      <div className="mx-auto max-w-7xl">
        {/* Dashboard button */}

        <div className="mb-8 flex justify-end">
          <Link
            to="/dashboard"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-blue-200 bg-white px-5 py-3 font-semibold text-[#1A56DB] shadow-sm transition hover:border-blue-300 hover:bg-[#EFF6FF] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
          >
            <ArrowLeft
              className="h-5 w-5"
              aria-hidden="true"
            />

            <LayoutDashboard
              className="h-5 w-5"
              aria-hidden="true"
            />

            Go to Dashboard
          </Link>
        </div>

        {/* Header */}

        <header className="text-center">
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
            Upgrade to Gigora Pro and unlock
            unlimited AI-powered tools to grow your
            freelance business faster.
          </p>
        </header>

        {/* Pricing cards */}

        <section className="mt-16 grid gap-8 lg:grid-cols-2">
          {/* Free plan */}

          <article className="flex flex-col rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition duration-300 hover:-translate-y-2 hover:shadow-xl sm:p-10">
            <div>
              <span className="inline-flex rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600">
                Starter Plan
              </span>

              <h2 className="mt-5 text-2xl font-bold text-[#1E3A5F]">
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

              <p className="mt-4 text-[#6B7280]">
                Essential AI tools for getting started
                with Gigora.
              </p>
            </div>

            <div className="mt-10 space-y-5">
              <FeatureItem text="5 AI Requests / Day" />
              <FeatureItem text="Profile Analyzer" />
              <FeatureItem text="Gig SEO Optimizer" />
              <FeatureItem text="Proposal Generator" />
            </div>

            <button
              type="button"
              disabled
              className={`mt-auto w-full rounded-xl py-4 font-semibold ${
                plan === "free"
                  ? "cursor-not-allowed bg-slate-200 text-slate-500"
                  : "cursor-not-allowed border border-slate-300 bg-white text-slate-500"
              }`}
            >
              {plan === "free"
                ? "Current Plan"
                : "Free Plan"}
            </button>
          </article>

          {/* Pro plan */}

          <article className="relative flex flex-col overflow-hidden rounded-3xl border-2 border-[#1A56DB] bg-white p-8 shadow-xl sm:p-10">
            <div className="absolute right-4 top-4 rounded-full bg-[#1A56DB] px-4 py-2 text-xs font-bold uppercase tracking-wide text-white sm:right-6 sm:top-6">
              Most Popular
            </div>

            <div>
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
                  $5.00
                </span>

                <span className="mb-1 text-[#6B7280]">
                  / Month
                </span>
              </div>

              <p className="mt-4 text-[#6B7280]">
                Advanced AI tools and unlimited access
                for serious freelancers.
              </p>
            </div>

            <div className="mt-10 space-y-5">
              <FeatureItem text="Unlimited AI Requests" />
              <FeatureItem text="Faster AI Responses" />
              <FeatureItem text="Priority Support" />
              <FeatureItem text="Future Premium Features" />
            </div>

            {plan === "pro" ? (
              <button
                type="button"
                onClick={handleCancelSubscription}
                disabled={cancelLoading}
                className="mt-auto flex w-full items-center justify-center gap-2 rounded-xl bg-red-500 py-4 font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-70"
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
                type="button"
                onClick={handleUpgrade}
                disabled={loading}
                className="mt-auto flex w-full items-center justify-center gap-2 rounded-xl bg-[#1A56DB] py-4 font-semibold text-white transition hover:bg-[#1E3A5F] disabled:cursor-not-allowed disabled:opacity-70"
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
          </article>
        </section>
      </div>
    </main>
  );
}

function FeatureItem({ text }) {
  return (
    <div className="flex items-center gap-3">
      <CheckCircle
        className="shrink-0 text-[#059669]"
        size={20}
        aria-hidden="true"
      />

      <span className="text-slate-700">
        {text}
      </span>
    </div>
  );
}

export default Pricing;