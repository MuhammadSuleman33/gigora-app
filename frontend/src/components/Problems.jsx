import {
  Users,
  TrendingDown,
  FileX,
} from "lucide-react";

function Problems() {
  const problems = [
    {
      title: "No Clients",
      description:
        "Finding new clients consistently is one of the biggest challenges for freelancers.",
      icon: Users,
    },
    {
      title: "Gig Not Ranking",
      description:
        "Poor SEO and optimization prevent your Fiverr or Upwork gigs from reaching potential clients.",
      icon: TrendingDown,
    },
    {
      title: "Proposal Rejected",
      description:
        "Generic proposals often fail to grab clients' attention and reduce your chances of getting hired.",
      icon: FileX,
    },
  ];

  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-6">

        {/* Heading */}

        <div className="mx-auto max-w-3xl text-center">

          <span className="inline-flex rounded-full bg-[#EFF6FF] px-4 py-2 text-sm font-semibold text-[#1A56DB]">
            Common Challenges
          </span>

          <h2 className="mt-5 text-4xl font-bold text-[#111827] md:text-5xl">
            Problems Freelancers Face
          </h2>

          <p className="mt-5 text-lg leading-8 text-[#6B7280]">
            Every freelancer faces obstacles that make it harder to win clients,
            rank gigs, and grow consistently.
          </p>

        </div>

        {/* Cards */}

        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">

          {problems.map((problem, index) => {
            const Icon = problem.icon;

            return (
              <div
                key={index}
                className="group rounded-3xl border border-gray-100 bg-white p-8 shadow-md transition-all duration-300 hover:-translate-y-3 hover:shadow-2xl"
              >
                {/* Icon */}

                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#EFF6FF] transition-all duration-300 group-hover:bg-[#1A56DB]">

                  <Icon
                    size={30}
                    className="text-[#1A56DB] transition-colors duration-300 group-hover:text-white"
                  />

                </div>

                {/* Title */}

                <h3 className="mt-6 text-2xl font-bold text-[#111827]">
                  {problem.title}
                </h3>

                {/* Description */}

                <p className="mt-4 leading-7 text-[#6B7280]">
                  {problem.description}
                </p>
              </div>
            );
          })}

        </div>

      </div>
    </section>
  );
}

export default Problems;