import ProfileAnalyzer from "./pages/ProfileAnalyzer";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import ProposalGenerator from "./pages/ProposalGenerator";
import GigSEO from "./pages/GigSEO";
import History from "./pages/History";
import Usage from "./components/Usage";
import Pricing from "./pages/Pricing";
import Profile from "./pages/Profile";
import { Toaster } from "react-hot-toast";
import DashboardLayout from "./layouts/DashboardLayout";


function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile-analyzer" element={<ProfileAnalyzer />} />
        <Route path="/gig-seo" element={<GigSEO />} />
        <Route path="/proposal-generator" element={<ProposalGenerator />} />
        <Route path="/history" element={<History />} />
        <Route path="/usage" element={<Usage />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/profile" element={<Profile />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
