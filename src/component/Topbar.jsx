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
        <div className="flex items-center">
          <img src={logo} alt="Logo" className="h-10 w-auto mr-2" />
          {/* <span className="text-xl font-bold text-blue-600">PayrollApp</span> */}
        </div>

        {/* Dashboard Title */}
        <div className="text-lg font-semibold">
          {name}
        </div>

        {/* User Info */}
        <div className="flex items-center gap-4">

          <span className="text-gray-600 font-medium">
            {user?.name}
          </span>

          <button
            onClick={logout}
            className="bg-red-800 text-white text-sm px-2 py-2 rounded hover:bg-red-600"
          >
            Logout
          </button>

        </div>

      </div>

    </div>

  );
}