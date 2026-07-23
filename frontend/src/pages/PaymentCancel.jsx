import { Link } from "react-router-dom";
import { XCircle, RotateCcw } from "lucide-react";

function PaymentCancel() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <div className="w-full max-w-xl rounded-3xl bg-white p-10 shadow-xl">

        <div className="flex justify-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-red-100">
            <XCircle
              size={60}
              className="text-red-600"
            />
          </div>
        </div>

        <h1 className="mt-8 text-center text-4xl font-bold text-[#1E3A5F]">
          Payment Cancelled
        </h1>

        <p className="mt-4 text-center text-gray-600">
         Your payment has been cancelled.
No charges were made, and you can upgrade again anytime.
        </p>

        <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-5">
          <h3 className="font-semibold text-red-700">
            You can still upgrade anytime
          </h3>

          <ul className="mt-4 space-y-2 text-gray-700">
            <li>🚀 Unlimited AI Requests</li>
            <li>⚡ Faster AI Responses</li>
            <li>💬 Priority Support</li>
            <li>⭐ Premium Features</li>
          </ul>
        </div>

        <Link
          to="/pricing"
          className="mt-10 flex w-full items-center justify-center gap-2 rounded-xl bg-[#1A56DB] py-4 font-semibold text-white transition hover:bg-[#1E3A5F]"
        >
          <RotateCcw size={20} />
          Try Again
        </Link>

      </div>
    </div>
  );
}

export default PaymentCancel;