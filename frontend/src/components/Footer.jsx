import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import toast from "react-hot-toast";

function Footer() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const handleNavigation = (path) => {
    if (!user) {
      toast.error("Please login first.");
      navigate("/login");
      return;
    }

    navigate(path);
  };

  return (
    <footer className="bg-[#111827] text-white">
      <div className="mx-auto max-w-7xl px-6 py-16">

        <div className="grid gap-12 lg:grid-cols-4">

          {/* Brand */}

          <div>

            <h2 className="text-3xl font-bold tracking-wide">
              GIGORA
            </h2>

            <p className="mt-5 leading-8 text-gray-400">
              AI-powered tools designed to help freelancers optimize
              profiles, improve gig rankings, and generate winning
              proposals effortlessly.
            </p>

          </div>

          {/* Product */}

          <div>

            <h3 className="mb-5 text-lg font-semibold">
              Product
            </h3>

            <ul className="space-y-4 text-gray-400">

              <li>
                <button
                  onClick={() => handleNavigation("/profile-analyzer")}
                  className="transition hover:text-white"
                >
                  Profile Analyzer
                </button>
              </li>

              <li>
                <button
                  onClick={() => handleNavigation("/gig-seo")}
                  className="transition hover:text-white"
                >
                  Gig SEO
                </button>
              </li>

              <li>
                <button
                  onClick={() => handleNavigation("/proposal-generator")}
                  className="transition hover:text-white"
                >
                  Proposal Generator
                </button>
              </li>

              <li>
                <button
                  onClick={() => navigate("/pricing")}
                  className="transition hover:text-white"
                >
                  Pricing
                </button>
              </li>

            </ul>

          </div>

          {/* Company */}

          <div>

            <h3 className="mb-5 text-lg font-semibold">
              Company
            </h3>

            <ul className="space-y-4 text-gray-400">

              <li>
                <button
                  onClick={() => navigate("/")}
                  className="transition hover:text-white"
                >
                  Home
                </button>
              </li>

              <li>
                <button className="transition hover:text-white">
                  About
                </button>
              </li>

              <li>
                <button className="transition hover:text-white">
                  Contact
                </button>
              </li>

              <li>
                <button className="transition hover:text-white">
                  Documentation
                </button>
              </li>

            </ul>

          </div>

        {/* Connect */}

<div>
  <h3 className="mb-5 text-lg font-semibold">
    Connect
  </h3>

  <div className="flex gap-4">
    <a
      href="https://github.com/MuhammadSuleman33/gigora-app"
      target="_blank"
      rel="noreferrer"
      aria-label="Open Gigora GitHub repository"
      className="rounded-xl bg-gray-800 p-3 transition hover:bg-[#1A56DB]"
    >
      GitHub
    </a>

    <a
      href="https://www.linkedin.com"
      target="_blank"
      rel="noreferrer"
      aria-label="Open LinkedIn"
      className="rounded-xl bg-gray-800 p-3 transition hover:bg-[#1A56DB]"
    >
      LinkedIn
    </a>

    <a
      href="mailto:contact@mufasadevelopers.com"
      aria-label="Email Mufasa Developers"
      className="rounded-xl bg-gray-800 p-3 transition hover:bg-[#1A56DB]"
    >
      Email
    </a>
  </div>

  <p className="mt-6 text-sm text-gray-500">
    Empowering freelancers with AI.
  </p>
</div>
        </div>

        {/* Bottom */}

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-gray-800 pt-8 text-sm text-gray-500 md:flex-row">

          <p>
            © 2026 Gigora by Mufasa Developers.
            All Rights Reserved.
          </p>

          <div className="flex gap-6">

            <button className="transition hover:text-white">
              Privacy
            </button>

            <button className="transition hover:text-white">
              Terms
            </button>

            <button className="transition hover:text-white">
              Cookies
            </button>

          </div>

        </div>

      </div>
    </footer>
  );
}

export default Footer;