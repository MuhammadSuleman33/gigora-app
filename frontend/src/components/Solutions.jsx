function Solutions() {
  const solutions = [
    {
      title: "Profile Analyzer",
      description:
        "Analyze your freelancer profile and receive AI-powered suggestions to improve it."
    },
    {
      title: "Gig SEO",
      description:
        "Optimize your gig titles, tags, and descriptions to rank higher in search results."
    },
    {
      title: "Proposal Generator",
      description:
        "Generate professional, personalized proposals that help you win more projects."
    }
  ];

  return (
    <section className="solutions">
      <h2>Our AI Solutions</h2>
      <p className="section-text">
        Powerful AI tools to help freelancers succeed.
      </p>

      <div className="solution-cards">
        {solutions.map((solution, index) => (
          <div className="card" key={index}>
            <h3>{solution.title}</h3>
            <p>{solution.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Solutions;