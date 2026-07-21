import { Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";


function DashboardLayout() {

  const [usage, setUsage] = useState({
    requests_used: 0,
    requests_limit: 5,
    remaining: 5,
    plan: "free",
  });


  const loadUsage = async () => {

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


      const data = await response.json();


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