import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="navbar">
      {/* Logo */}
      <h2>GIGORA</h2>

      {/* Navigation Links */}
      <ul className="nav-links">
        <li>Features</li>
        <li>Pricing</li>
      </ul>

      {/* Authentication Buttons */}
      <Link to="/Home">
          <button className="get-started-btn">
            Get Started
          </button>
        </Link>
      
      
      
      
      
      <div className="auth-buttons">
        <Link to="/login">
          <button className="login-btn">
            Login
          </button>
        </Link>



        <Link to="/signup">
          <button className="signup-btn">
            Sign Up
          </button>
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;