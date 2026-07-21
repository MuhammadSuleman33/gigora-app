import { useNavigate } from "react-router-dom";

function UpgradeModal({ open, onClose }) {
  const navigate = useNavigate();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-[#1E3A5F]">
            Upgrade to Gigora Pro 🚀
          </h2>

          <p className="mt-3 text-gray-600">
            You've reached your daily AI request limit.
          </p>
        </div>

        {/* Plan Card */}
        <div className="mt-8 rounded-xl border border-blue-100 bg-[#EFF6FF] p-6">
          <h3 className="text-xl font-semibold text-[#1E3A5F]">
            Gigora Pro
          </h3>

          <ul className="mt-5 space-y-3 text-gray-700">
            <li>✅ Unlimited AI Requests</li>
            <li>✅ Faster Responses</li>
            <li>✅ Premium Support</li>
            <li>✅ Future Premium Features</li>
          </ul>

          <button
            onClick={() => {
              onClose();
              navigate("/pricing");
            }}
            className="mt-6 w-full rounded-lg bg-[#1A56DB] px-5 py-3 font-semibold text-white transition-all duration-300 hover:bg-blue-700 hover:shadow-lg"
          >
            Upgrade Now
          </button>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="mt-6 w-full rounded-lg border border-gray-300 bg-white px-5 py-3 font-medium text-gray-700 transition-all duration-300 hover:bg-gray-100"
        >
          Close
        </button>
      </div>
    </div>
  );
}

export default UpgradeModal;