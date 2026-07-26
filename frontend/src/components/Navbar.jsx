import { Link, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

function Navbar() {
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("gigora_access_token");
    localStorage.removeItem("gigora_user");

    setUser(null);

    navigate("/login");
  };

  const handleFeaturesClick = () => {
    navigate("/");

    setTimeout(() => {
      const section = document.getElementById("solutions");

      if (section) {
        section.scrollIntoView({
          behavior: "smooth",
        });
      }
    }, 100);
  };

  return (
    <nav className="bg-[#1A56DB] h-20 px-16 flex items-center justify-between">

      {/* Logo */}
      <Link to="/">
        <h2 className="text-white text-3xl font-light tracking-wide cursor-pointer">
          GIGORA
        </h2>
      </Link>

      {/* Navigation */}
      <ul className="flex items-center gap-6">

        <li>
          <button
            onClick={handleFeaturesClick}
            className="rounded-lg px-4 py-2 text-white font-semibold transition hover:bg-[#1E3A5F]"
          >
            Features
          </button>
        </li>

        <li>
          <Link to="/pricing">
            <button className="rounded-lg px-4 py-2 text-white font-semibold transition hover:bg-[#1E3A5F]">
              Pricing
            </button>
          </Link>
        </li>

      </ul>

      {/* Right Side */}
      <div className="flex items-center gap-6">

        {!user ? (
          <>
            <Link to="/">
              <button className="rounded-lg px-4 py-2 font-semibold text-white transition hover:bg-[#1E3A5F]">
                Get Started
              </button>
            </Link>

            <Link to="/login">
              <button className="rounded-lg px-4 py-2 font-semibold text-white transition hover:bg-[#1E3A5F]">
                Login
              </button>
            </Link>

            <Link to="/signup">
              <button className="rounded-lg px-4 py-2 font-semibold text-white transition hover:bg-[#1E3A5F]">
                Sign Up
              </button>
            </Link>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white">
                {user.username}
              </span>

              {user.plan === "pro" && (
                <span className="rounded-full bg-green-500 px-2 py-1 text-xs font-bold text-white">
                  PRO
                </span>
              )}
            </div>

            <button
              onClick={handleLogout}
              className="rounded-lg bg-[#1E3A5F] px-5 py-2 font-semibold text-white transition hover:bg-slate-600"
            >
              Logout
            </button>
          </>
        )}

      </div>

    </nav>
  );
}

export default Navbar; 