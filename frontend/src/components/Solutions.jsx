import {
  UserCheck,
  SearchCheck,
  FilePenLine,
  ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import toast from "react-hot-toast";

function Solutions() {
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

  const solutions = [
    {
      title: "Profile Analyzer",
      description:
        "Receive AI-powered insights to strengthen your freelancer profile and attract more clients.",
      icon: UserCheck,
      path: "/profile-analyzer",
    },
    {
      title: "Gig SEO",
      description:
        "Optimize your gig title, keywords, tags, and description to improve search rankings.",
      icon: SearchCheck,
      path: "/gig-seo",
    },
    {
      title: "Proposal Generator",
      description:
        "Generate personalized, high-converting proposals in seconds using AI.",
      icon: FilePenLine,
      path: "/proposal-generator",
    },
  ];

  return (
    <section
      id="solutions"
      className="bg-[#EFF6FF] py-24"
    >
      <div className="mx-auto max-w-7xl px-6">

        {/* Heading */}

        <div className="mx-auto max-w-3xl text-center">

          <span className="inline-flex rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-[#1A56DB]">
            AI Features
          </span>

          <h2 className="mt-5 text-4xl font-bold text-[#111827] md:text-5xl">
            Everything You Need to Win More Projects
          </h2>

          <p className="mt-5 text-lg leading-8 text-[#6B7280]">
            Gigora provides powerful AI tools that help freelancers save time,
            improve quality, and win more clients.
          </p>

        </div>

        {/* Cards */}

        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">

          {solutions.map((solution, index) => {
            const Icon = solution.icon;

            return (
              <div
                key={index}
                onClick={() => handleNavigation(solution.path)}
                className="group cursor-pointer rounded-3xl bg-white p-8 shadow-md transition-all duration-300 hover:-translate-y-3 hover:shadow-2xl"
              >
                {/* Icon */}

                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#1A56DB] transition-all duration-300 group-hover:scale-110">

                  <Icon
                    size={30}
                    className="text-white"
                  />

                </div>

                {/* Title */}

                <h3 className="mt-6 text-2xl font-bold text-[#111827]">
                  {solution.title}
                </h3>

                {/* Description */}

                <p className="mt-4 leading-7 text-[#6B7280]">
                  {solution.description}
                </p>

                {/* Learn More */}

                <button
                  className="mt-8 flex items-center gap-2 font-semibold text-[#1A56DB] transition-all duration-300 hover:gap-3"
                >
                  Learn More
                  <ArrowRight size={18} />
                </button>

              </div>
            );
          })}

        </div>

      </div>
    </section>
  );
}

export default Solutions;