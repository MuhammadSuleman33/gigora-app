import { Link } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

function Sidebar() {
  const { user } = useContext(AuthContext);
  return (
    <div className="sidebar">
  <h2>Gigora</h2>

  {user && (
    <p className="user-name">
      Welcome, {user.name}
    </p>
  )}


      <ul>
        <li>
          <Link to="/profile-analyzer">Profile Analyzer</Link>
        </li>

        <li>
          <Link to="/gig-seo">Gig SEO</Link>
        </li>

        <li>
          <Link to="/proposal-generator">Proposal Generator</Link>
        </li>
      </ul>
    </div>
  );
}

export default Sidebar;