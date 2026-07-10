import { Link } from "react-router-dom";

function Sidebar() {
  return (
    <div className="sidebar">
      <h2>Gigora</h2>

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