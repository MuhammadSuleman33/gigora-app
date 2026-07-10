import Sidebar from "../components/Sidebar";
import DashboardHome from "../components/DashboardHome";



function Dashboard() {
  return (
    <div className="dashboard">
      <Sidebar />
      <DashboardHome />
    </div>
  );
}

export default Dashboard;