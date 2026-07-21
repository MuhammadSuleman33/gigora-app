import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import DashboardHome from "../components/DashboardHome";


function Dashboard() {

  const [usage, setUsage] = useState({
    requests_used: 0,
    requests_limit: 5,
    remaining: 5,
    plan: "free",
  });



  const loadDashboard = async () => {

    try {

      const token =
        localStorage.getItem(
          "gigora_access_token"
        );


      const response = await fetch(
        "http://127.0.0.1:8000/api/usage/",
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );


      const data =
        await response.json();


      console.log(
        "Updated Usage:",
        data
      );


      setUsage(data);


    } catch(error) {

      console.error(
        "Usage Fetch Error:",
        error
      );

    }

  };



  useEffect(() => {

    // Load usage when dashboard opens

    loadDashboard();


    // Listen for AI request completion

    const refresh = () => {

      console.log(
        "Refreshing usage..."
      );

      loadDashboard();

    };


    window.addEventListener(
      "dashboard-update",
      refresh
    );


    return () => {

      window.removeEventListener(
        "dashboard-update",
        refresh
      );

    };


  }, []);



  return (

    <div className="dashboard">

      <Sidebar 
        usage={usage}
      />


      <DashboardHome 
        usage={usage}
      />

    </div>

  );

}


export default Dashboard;