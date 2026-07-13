import { useState } from "react";
import "../App.css";

function ProposalGenerator() {
  const [jobPost, setJobPost] = useState("");
  const [proposal, setProposal] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const generateProposal = async () => {
    if (!jobPost.trim()) {
      setError("Please paste a job post.");
      return;
    }

    setLoading(true);
    setError("");
    setProposal("");

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/proposal",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            job_post: jobPost,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Something went wrong."
        );
      }

      setProposal(data.proposal);
    } catch (err) {
      setError(err.message);
    }

    setLoading(false);
  };

  const copyProposal = () => {
    navigator.clipboard.writeText(proposal);
    alert("Proposal copied successfully!");
  };

  return (
    <div className="proposal-page">
      <div className="proposal-card">
        <h1>AI Proposal Generator</h1>
        <p>
          Paste a client's job post and generate
          a professional proposal instantly.
        </p>

        <textarea
          placeholder="Paste the client's job post here..."
          value={jobPost}
          onChange={(e) =>
            setJobPost(e.target.value)
          }
        />

        <button
          onClick={generateProposal}
          disabled={loading}
        >
          {loading
            ? "Generating..."
            : "Generate Proposal"}
        </button>

        {error && (
          <div className="proposal-error">
            {error}
          </div>
        )}

        {proposal && (
          <div className="proposal-result">
            <h2>Generated Proposal</h2>

            <textarea
              value={proposal}
              readOnly
            />

            <button
              className="copy-btn"
              onClick={copyProposal}
            >
              Copy Proposal
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProposalGenerator;