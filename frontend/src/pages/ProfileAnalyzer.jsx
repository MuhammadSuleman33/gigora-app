import { useState } from "react";
import "../App.css";

function ProfileAnalyzer() {
  const [profileText, setProfileText] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const analyzeProfile = async () => {
    if (!profileText.trim()) {
      setError("Please enter your profile.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/profile",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            profile_text: profileText,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Something went wrong.");
      }

      setResult(data);
    } catch (err) {
      setError(err.message);
    }

    setLoading(false);
  };

  return (
    <div className="profile-container">
      <h1>Profile Analyzer</h1>

      <textarea
        placeholder="Paste your Fiverr or Upwork profile..."
        value={profileText}
        onChange={(e) => setProfileText(e.target.value)}
      />

      <button onClick={analyzeProfile}>
        Analyze Profile
      </button>

      {loading && (
        <div className="loading">
          Analyzing profile...
        </div>
      )}

      {error && (
        <p className="error">{error}</p>
      )}

      {result && (
        <div className="result-box">
          <div className="score-card">
            <h2>Score</h2>
            <h1>{result.score}/10</h1>
          </div>

          <div className="card">
            <h3>Strengths</h3>
            <ul>
              {result.strengths?.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="card">
            <h3>Weaknesses</h3>
            <ul>
              {result.weaknesses?.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="card">
            <h3>Suggestions</h3>
            <ul>
              {result.suggestions?.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfileAnalyzer;