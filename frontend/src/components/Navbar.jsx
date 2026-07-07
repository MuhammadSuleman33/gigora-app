function Navbar() {
  return (
    <nav className="navbar">
      {/* Logo */}
      <h2>GIGORA</h2>

      {/* Navigation Links */}
      <ul className="nav-links">
        <li>Features</li>
        <li>Pricing</li>
        <li>Login</li>
      </ul>

      {/* Button */}
      <button className="navbar-button">Get Started</button>
    </nav>
  );
}

export default Navbar;