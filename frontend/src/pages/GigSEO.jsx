import { useState } from "react";
import "../App.css";

function GigSEO() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const optimize = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        "http://127.0.0.1:8000/api/seo",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title,
            description,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Something went wrong."
        );
      }

      setResult(data.optimized_gig);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="seo-page">
      <div className="seo-card">
        <h1>Gig SEO Optimizer</h1>
        <p>
          Optimize your Fiverr or Upwork gig with AI-powered SEO suggestions.
        </p>

        <div className="form-group">
          <label>Gig Title</label>
          <input
            type="text"
            placeholder="Enter your gig title..."
            value={title}
            onChange={(e) =>
              setTitle(e.target.value)
            }
          />
        </div>

        <div className="form-group">
          <label>Gig Description</label>
          <textarea
            placeholder="Enter your gig description..."
            value={description}
            onChange={(e) =>
              setDescription(e.target.value)
            }
          />
        </div>

        <button
          onClick={optimize}
          disabled={loading}
        >
          {loading
            ? "Optimizing..."
            : "Optimize Gig"}
        </button>

        {result && (
          <div className="result-box">
            <h3>Optimized Result</h3>

            <pre>{result}</pre>
          </div>
        )}
      </div>
    </div>
  );
}

export default GigSEO;