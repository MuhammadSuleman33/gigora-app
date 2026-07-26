import { Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import api from "../services/api";


function DashboardLayout() {

  const [usage, setUsage] = useState({
    requests_used: 0,
    requests_limit: 5,
    remaining: 5,
    plan: "free",
  });


  const loadUsage = async () => {

    try {
      const response = await api.get("/api/usage/");
      const data = response.data;


      console.log(
        "Usage Updated:",
        data
      );


      setUsage(data);


    } catch (error) {

      console.log(
        "Usage Error:",
        error
      );

    }

  };



  useEffect(() => {

    loadUsage();


    const refreshUsage = () => {

      loadUsage();

    };


    window.addEventListener(
      "dashboard-update",
      refreshUsage
    );


    return () => {

      window.removeEventListener(
        "dashboard-update",
        refreshUsage
      );

    };


  }, []);



  return (

    <>

      <Sidebar usage={usage} />

      <Outlet />

    </>

  );

}


export default DashboardLayout;