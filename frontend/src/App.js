import "./App.css";
import ProfileAnalyzer from "./pages/ProfileAnalyzer";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import ProposalGenerator from "./pages/ProposalGenerator";
import GigSEO from "./pages/GigSEO";

function App() {
  return (
    <BrowserRouter>
    <Routes>
  <Route path="/" element={<Home />} />
  <Route path="/login" element={<Login />} />
  <Route path="/signup" element={<Signup />} />
  <Route path="/dashboard" element={<Dashboard />} />
  <Route path="/profile-analyzer" element={<ProfileAnalyzer />} />
  <Route path="/gig-seo" element={<GigSEO />} />
  <Route path="/proposal-generator" element={<ProposalGenerator />} />
</Routes>
    </BrowserRouter>
  );
}

export default App;
