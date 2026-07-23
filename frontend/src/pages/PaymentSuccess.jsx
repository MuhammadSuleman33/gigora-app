import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle, ArrowRight } from "lucide-react";

function PaymentSuccess() {
  const [searchParams] = useSearchParams();

  const sessionId = searchParams.get("session_id");

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <div className="w-full max-w-xl rounded-3xl bg-white p-10 shadow-xl">

        <div className="flex justify-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-green-100">
            <CheckCircle
              size={60}
              className="text-green-600"
            />
          </div>
        </div>

        <h1 className="mt-8 text-center text-4xl font-bold text-[#1E3A5F]">
          Payment Successful 🎉
        </h1>

        <p className="mt-4 text-center text-gray-600">
  Thank you for upgrading to{" "}
  <span className="font-semibold text-[#1A56DB]">
    Gigora Pro
  </span>
  .
</p>

        <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <p className="text-sm text-gray-500">
            Session ID
          </p>

          <p className="mt-2 break-all font-mono text-sm text-gray-700">
            {sessionId || "Not Available"}
          </p>
        </div>

        <div className="mt-8 rounded-2xl border border-green-200 bg-green-50 p-5">
          <h3 className="font-semibold text-green-700">
            Your Pro Plan Includes
          </h3>

          <ul className="mt-4 space-y-2 text-gray-700">
            <li>✅ Unlimited AI Requests</li>
            <li>✅ Faster AI Responses</li>
            <li>✅ Priority Support</li>
            <li>✅ Future Premium Features</li>
          </ul>
        </div>

        <Link
          to="/dashboard"
          className="mt-10 flex w-full items-center justify-center gap-2 rounded-xl bg-[#1A56DB] py-4 font-semibold text-white transition hover:bg-[#1E3A5F]"
        >
          Go to Dashboard

          <ArrowRight size={20} />
        </Link>

      </div>
    </div>
  );
}

export default PaymentSuccess;