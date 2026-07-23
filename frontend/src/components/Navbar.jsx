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

  return (
    <nav className="bg-[#1A56DB] h-20 px-16 flex items-center justify-between">

      {/* Logo */}
      <h2 className="text-white text-3xl font-light tracking-wide">
        GIGORA
      </h2>

      {/* Navigation */}
      <ul className="flex items-center gap-12">
        <li className="text-white text-lg font-semibold cursor-pointer hover:opacity-80 transition">
          Features
        </li>

        <li className="text-white text-lg font-semibold cursor-pointer hover:opacity-80 transition">
          Pricing
        </li>
      </ul>

      {/* Right Side */}
      <div className="flex items-center gap-6">

        {!user ? (
          <>
            <Link to="/Home">
              <button className="text-white font-semibold px-4 py-2 rounded-lg hover:bg-[#1E3A5F] transition">
                Get Started
              </button>
            </Link>

            <Link to="/login">
              <button className="text-white font-semibold px-4 py-2 rounded-lg hover:bg-[#1E3A5F] transition">
                Login
              </button>
            </Link>

            <Link to="/signup">
              <button className="text-white font-semibold px-4 py-2 rounded-lg hover:bg-[#1E3A5F] transition">
                Sign Up
              </button>
            </Link>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2">

  <span className="text-white font-semibold">
    {user.username}
  </span>

  {user.plan === "pro" && (
    <span
      className="
      rounded-full
      bg-green-500
      px-2
      py-1
      text-xs
      font-bold
      text-white
      "
    >
      PRO
    </span>
  )}

</div>

            <button
              onClick={handleLogout}
              className="bg-[#1E3A5F] text-white px-5 py-2 rounded-lg font-semibold hover:bg-slate-600 transition"
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