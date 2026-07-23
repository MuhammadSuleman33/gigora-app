import { Link, useNavigate, useLocation } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

import {
  User,
  Search,
  FileText,
  History,
  BarChart3,
  CreditCard,
  LogOut,
  UserCircle,
  Lock,
} from "lucide-react";


function Sidebar({ usage }) {

  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();


  const handleLogout = () => {

    localStorage.removeItem("gigora_access_token");
    localStorage.removeItem("gigora_user");

    setUser(null);
    navigate("/login");

  };


const percentage =
usage?.requests_limit === "Unlimited"
  ? 100
  : ((usage?.requests_used ?? 0) /
      (usage?.requests_limit ?? 5)) * 100;



  const menuItems = [
  {
    name: "Profile Analyzer",
    path: "/profile-analyzer",
    icon: <User size={20} />,
  },

  {
    name: "Gig SEO",
    path: "/gig-seo",
    icon: <Search size={20} />,
  },

  {
    name: "Proposal Generator",
    path: "/proposal-generator",
    icon: <FileText size={20} />,
  },

  {
    name: "AI Compare",
    path: "/proposal-compare",
    icon: <FileText size={20} />,
    pro: true,
  },

  {
    name: "History",
    path: "/history",
    icon: <History size={20} />,
  },

  {
    name: "Usage",
    path: "/usage",
    icon: <BarChart3 size={20} />,
  },
];



  return (

<aside
className="
fixed
left-0
top-0
h-screen
w-72
overflow-y-auto
border-r
border-gray-200
bg-white
shadow-xl
z-40
flex
flex-col
"
>


{/* Logo */}

<div className="border-b px-8 py-7">

<h1 className="text-3xl font-bold text-[#1E3A5F]">
Gigora
</h1>


<p className="text-sm text-gray-500 mt-1">
AI Freelancer Assistant
</p>


</div>




{/* User Card */}

{
user &&

<div className="mx-5 mt-6 rounded-2xl bg-[#EFF6FF] p-5">


<div className="flex items-center gap-3">


<div
className="
flex
h-12
w-12
items-center
justify-center
rounded-full
bg-[#1A56DB]
text-white
"
>

<User size={22}/>

</div>


<div>

<h3 className="font-semibold text-[#1E3A5F]">

{user.name}

</h3>


<p className="text-sm text-gray-500">
Welcome Back
</p>


</div>


</div>




<div className="mt-5 flex justify-between">


<span className="text-sm text-gray-600">
Current Plan
</span>


<span
className={`
rounded-full
px-3
py-1
text-xs
font-semibold

${
  (usage?.plan || "free") === "pro"
    ? "bg-green-100 text-green-700"
    : "bg-blue-100 text-[#1A56DB]"
}
`}
>

{(usage?.plan || "free").toUpperCase()}


</span>


</div>




<div className="mt-5">


<div className="mb-2 flex justify-between text-sm">


<span className="text-gray-600">
AI Usage
</span>


<span className="font-semibold text-[#1E3A5F]">

{usage?.requests_used ?? 0}/
{usage?.requests_limit === "Unlimited"
  ? "∞"
  : usage?.requests_limit ?? 5}

</span>


</div>



<div className="h-2 rounded-full bg-gray-200 overflow-hidden">

<div
className="h-full bg-[#1A56DB]"
style={{
width:`${percentage}%`
}}
/>

</div>


</div>



</div>

}





{/* Navigation */}

<nav className="flex-1 px-5 mt-8">


<ul className="space-y-2">


{
menuItems.map((item)=>(

<li key={item.path}>


<Link
to={
  item.pro && user?.plan !== "pro"
    ? "/pricing"
    : item.path
}

className={`
flex
items-center
gap-3
rounded-xl
px-4
py-3
font-medium
transition

${
location.pathname === item.path

?
"bg-[#1A56DB] text-white shadow"

:

"text-gray-700 hover:bg-[#EFF6FF] hover:text-[#1A56DB]"

}

`}

>


{item.icon}

<div className="flex items-center justify-between w-full">

  <span>{item.name}</span>

  {item.pro && user?.plan !== "pro" && (
    <Lock
      size={16}
      className="text-yellow-500"
    />
  )}

</div>


</Link>


</li>


))

}



</ul>


</nav>






{/* Bottom Section */}

<div className="border-t p-5 space-y-3">


<Link

to="/profile"

className={`
flex
items-center
gap-3
rounded-xl
px-4
py-3
font-medium

${
location.pathname === "/profile"

?
"bg-[#1A56DB] text-white"

:

"text-gray-700 hover:bg-[#EFF6FF] hover:text-[#1A56DB]"

}

`}

>

<UserCircle size={20}/>

Profile


</Link>




<Link

to="/pricing"

className="
flex
items-center
gap-3
rounded-xl
px-4
py-3
font-medium
text-gray-700
hover:bg-[#EFF6FF]
hover:text-[#1A56DB]
"

>

<CreditCard size={20}/>

Pricing


</Link>




<button

onClick={handleLogout}

className="
flex
w-full
items-center
justify-center
gap-2
rounded-xl
bg-red-500
px-3
py-2
font-semibold
text-white
hover:bg-red-600
"

>

<LogOut size={18}/>

Logout


</button>



</div>



</aside>


  );

}


export default Sidebar;