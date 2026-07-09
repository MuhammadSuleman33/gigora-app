import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function getSavedUser() {
  const savedUser = localStorage.getItem("gigora_user");

  if (!savedUser) {
    return null;
  }

  try {
    return JSON.parse(savedUser);
  } catch {
    localStorage.removeItem("gigora_user");
    return null;
  }
}

function DashboardHome() {
  const navigate = useNavigate();
  const [user, setUser] = useState(getSavedUser);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("gigora_access_token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const response = await api.get("/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        localStorage.setItem("gigora_user", JSON.stringify(response.data.user));
        setUser(response.data.user);
        setError("");
      } catch (err) {
        localStorage.removeItem("gigora_access_token");
        localStorage.removeItem("gigora_user");
        setError("Your session has expired. Please login again.");
        navigate("/login");
      }
    };

    fetchUser();
  }, [navigate]);

  return (
    <div className="home">
      <h1>{user?.name ? `Welcome, ${user.name}` : "Welcome"}</h1>
      {error && <p className="auth-error">{error}</p>}

      <div className="cards">
        <div className="card">
          <h3>Profile Analyzer</h3>
          <p>Analyze your freelancer profile.</p>
        </div>

        <div className="card">
          <h3>Gig SEO</h3>
          <p>Optimize your gig for better ranking.</p>
        </div>

        <div className="card">
          <h3>Proposal Generator</h3>
          <p>Generate winning proposals instantly.</p>
        </div>
      </div>
    </div>
  );
}

export default DashboardHome;
