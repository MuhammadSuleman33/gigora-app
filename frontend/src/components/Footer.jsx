// import {
//   Mail,
//   ArrowUpRight,
// } from "lucide-react";

function Footer() {
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
                <a
                  href="/dashboard/profile"
                  className="transition hover:text-white"
                >
                  Profile Analyzer
                </a>
              </li>

              <li>
                <a
                  href="/dashboard/seo"
                  className="transition hover:text-white"
                >
                  Gig SEO
                </a>
              </li>

              <li>
                <a
                  href="/dashboard/proposal"
                  className="transition hover:text-white"
                >
                  Proposal Generator
                </a>
              </li>

              <li>
                <a
                  href="/pricing"
                  className="transition hover:text-white"
                >
                  Pricing
                </a>
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
                <a
                  href="/"
                  className="transition hover:text-white"
                >
                  Home
                </a>
              </li>

              <li>
                <a
                  href="#"
                  className="transition hover:text-white"
                >
                  About
                </a>
              </li>

              <li>
                <a
                  href="#"
                  className="transition hover:text-white"
                >
                  Contact
                </a>
              </li>

              <li>
                <a
                  href="#"
                  className="flex items-center gap-1 transition hover:text-white"
                >
                  Documentation

                  {/* <ArrowUpRight size={15} /> */}

                </a>
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
                href="#"
                className="rounded-xl bg-gray-800 p-3 transition hover:bg-[#1A56DB]"
              >
                {/* <Github size={20} /> */}
              </a>

              <a
                href="#"
                className="rounded-xl bg-gray-800 p-3 transition hover:bg-[#1A56DB]"
              >
               {/* <LinkedinIcon size={18} /> */}
              </a>

              <a
                href="#"
                className="rounded-xl bg-gray-800 p-3 transition hover:bg-[#1A56DB]"
              >
                {/* <Mail size={20} /> */}
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

            <a
              href="#"
              className="transition hover:text-white"
            >
              Privacy
            </a>

            <a
              href="#"
              className="transition hover:text-white"
            >
              Terms
            </a>

            <a
              href="#"
              className="transition hover:text-white"
            >
              Cookies
            </a>

          </div>

        </div>

      </div>

    </footer>
  );
}

export default Footer;