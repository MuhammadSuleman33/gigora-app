function Problems() {
  const problems = [
    {
      title: "No Clients",
      description: "Struggling to find new clients for your freelance business."
    },
    {
      title: "Gig Not Ranking",
      description: "Your Fiverr or Upwork profile isn't getting enough visibility."
    },
    {
      title: "Proposal Rejected",
      description: "Clients are not responding to your proposals."
    }
  ];

  return (
    <section className="problems">
      <h2>Problems Freelancers Face</h2>
      <p className="section-text">
        Every freelancer faces these common challenges.
      </p>

      <div className="problem-cards">
        {problems.map((problem, index) => (
          <div className="card" key={index}>
            <h3>{problem.title}</h3>
            <p>{problem.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Problems;