import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import "../App.css";

function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
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
    setSuccess("");
    setLoading(true);

    try {
      const response = await api.post("/api/auth/signup", formData);
      setSuccess(response.data.message || "Account created successfully.");

      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.detail || "Unable to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* <div className="auth-left">
        <h1>GIGORA</h1>
        <h2>Start Winning More Clients</h2>
        <p>
          Create your account and unlock AI tools built for freelancers.
        </p>
      </div> */}

      <div className="auth-right">
        <form className="auth-card" onSubmit={handleSubmit}>
          <h2>Create Account</h2>
          <p>Join Gigora today.</p>

          {error && <p className="auth-error">{error}</p>}
          {success && <p className="auth-success">{success}</p>}

          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            required
          />
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
            {loading ? "Creating account..." : "Sign Up"}
          </button>

          <button className="google-btn" type="button" disabled>
            Continue with Google
          </button>

          <p className="bottom-text">
            Already have an account?
            <Link to="/login"> Login</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Signup;
