import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

export default function Topbar({name}) {

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  function logout(){
    localStorage.removeItem("user");
    navigate("/");
  }

  return (

    <div className="w-full bg-white shadow-md">

      <div className="max-w-6xl mx-auto flex justify-between items-center px-6 py-4">

        {/* Logo */}
        <div className="flex items-center w-1/3">
          <img src={logo} alt="Logo" className="h-10 w-auto mr-2" />
          {/* <span className="text-xl font-bold text-blue-600">PayrollApp</span> */}
        </div>

        {/* Dashboard Title */}
        <div className="md:text-lg text-sm font-bold text-center">
          {name}
          <br/>
           <span className="text-gray-600 font-medium text-sm md:hidden block">
            {user?.name}
          </span>
        </div>

        {/* User Info */}
        <div className="flex flex-row justify-end items-center gap-4 w-1/3">

          <span className="text-gray-600 font-medium text-sm md:block hidden">
            {user?.name}
          </span>

          <button
            onClick={logout}
            className="bg-red-800 text-white text-xs px-2 py-1 rounded hover:bg-red-600"
          >
            Logout
          </button>

        </div>

      </div>

    </div>

  );
}