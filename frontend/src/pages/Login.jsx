import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import "../App.css";

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.post("/api/auth/login", formData);

      localStorage.setItem("gigora_access_token", response.data.access_token);
      localStorage.setItem("gigora_user", response.data.user);

      navigate("/");
    } catch (err) {
      setError(err.response?.data?.detail || "Unable to login. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* <div className="auth-left">
        <h1>GIGORA</h1>
        <h2>Win Every Gig with AI</h2>
        <p>
          Find clients faster with AI-powered tools that optimize your profile,
          proposals, and gigs.
        </p>
      </div> */}

      <div className="auth-right">
        <form className="auth-card" onSubmit={handleSubmit}>
          <h2>Welcome Back</h2>
          <p>Login to your Gigora account.</p>

          {error && <p className="auth-error">{error}</p>}

          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <button className="primary-btn" type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>

          <button className="google-btn" type="button" disabled>
            Continue with Google
          </button>

          <p className="bottom-text">
            Don't have an account?
            <Link to="/signup"> Sign Up</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;
