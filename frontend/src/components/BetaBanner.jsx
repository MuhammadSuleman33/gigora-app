import { useContext } from "react";
import { useNavigate } from "react-router-dom";

import { AuthContext } from "../context/AuthContext";

function BetaBanner() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const handleJoinBeta = () => {
    const token = localStorage.getItem(
      "gigora_access_token"
    );

    console.log("Beta authentication check:", {
      token,
      user,
      currentOrigin: window.location.origin,
    });

    if (token) {
      localStorage.setItem(
        "showOnboarding",
        "true"
      );

      navigate("/onboarding", {
        replace: false,
      });

      return;
    }

    navigate("/signup");
  };

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 to-blue-700 p-8 shadow-2xl sm:p-10">

        <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-white/10" />
        <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white/10" />

        <div className="relative flex flex-col items-center justify-between gap-8 lg:flex-row">

          <div className="max-w-2xl text-center lg:text-left">
            <span className="inline-flex items-center rounded-full bg-white/20 px-4 py-1 text-sm font-semibold text-white">
              🚀 Limited Beta Access
            </span>

            <h2 className="mt-5 text-3xl font-bold text-white sm:text-4xl">
              Gigora is currently in Beta
            </h2>

            <p className="mt-4 text-base leading-7 text-blue-100 sm:text-lg">
              Help us build the best AI assistant for freelancers.
              Join our beta program today and receive
              <span className="font-semibold text-white">
                {" "}
                FREE Pro access{" "}
              </span>
              in exchange for your valuable feedback.
            </p>

            <div className="mt-6 flex flex-wrap justify-center gap-3 lg:justify-start">
              <span className="rounded-full bg-white/20 px-4 py-2 text-sm text-white">
                ✅ Free Pro Access
              </span>

              <span className="rounded-full bg-white/20 px-4 py-2 text-sm text-white">
                💬 Early Features
              </span>

              <span className="rounded-full bg-white/20 px-4 py-2 text-sm text-white">
                ⭐ Shape Gigora
              </span>
            </div>
          </div>

          <div className="flex flex-col items-center gap-4">
            <button
              type="button"
              onClick={handleJoinBeta}
              className="rounded-xl bg-white px-8 py-4 text-lg font-semibold text-blue-700 shadow-lg transition duration-300 hover:-translate-y-1 hover:bg-blue-50"
            >
              Join Beta
            </button>

            <p className="text-center text-sm text-blue-100">
              Takes less than a minute to join.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}

export default BetaBanner;