import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { callAPI } from "../api";
import logo from "../assets/logo.png";

export default function Login() {

  const navigate = useNavigate();

  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  const [loading,setLoading] = useState(false)

async function login(){

setLoading(true);

const res = await callAPI("loginUser",{
email,
password
});

  console.log(res);

  if(res.status){

    localStorage.setItem("user",JSON.stringify(res));

 

    if(res.role === "admin"){
      navigate("/admin");
    }else{
      navigate("/employee");
    }

    setLoading(false)

  }else{
    alert("Invalid login");
    setLoading(false)
  }

}

  return(

    <div className="flex items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8">

      <div className="max-w-md w-full space-y-8">

        <div>
          <img src={logo} alt="Logo" className="mx-auto h-40 w-auto" />

          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">

            Sign in to your account

          </h2>

          <p className="mt-2 text-center text-sm text-gray-600">

            Timesheet Manager

          </p>

        </div>

        <form className="mt-8 space-y-6" onSubmit={(e) => { e.preventDefault(); login(); }}>

          <div className="rounded-md shadow-sm -space-y-px">

            <div>

              <label htmlFor="email" className="sr-only">Email address</label>

              <input

                id="email"

                name="email"

                type="email"

                autoComplete="email"

                required

                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"

                placeholder="Email address"

                value={email}

                onChange={e=>setEmail(e.target.value)}

              />

            </div>

            <div>

              <label htmlFor="password" className="sr-only">Password</label>

              <input

                id="password"

                name="password"

                type="password"

                autoComplete="current-password"

                required

                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"

                placeholder="Password"

                value={password}

                onChange={e=>setPassword(e.target.value)}

              />

            </div>

          </div>

          <div>

            <button

              type="submit"

              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out"

            >
            
             {loading ? "SigningIn..." : "Sign in"} 

            </button>

          </div>

        </form>

      </div>

    </div>

  );
}