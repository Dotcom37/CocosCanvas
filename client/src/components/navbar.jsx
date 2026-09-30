import React from "react";
import otherStore from "../store/otherStore";

import { useNavigate } from "react-router";

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
const Navbar = ({setShowLogout}) => {
  const [name, setName] = useState();
  const token = localStorage.getItem("token") 
  const [auth, setAuth] = useState(false)
  
  useEffect(() => {
    const handleRes = async (e) => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/me`, {
          method: "GET",
          headers:{
            "content-type": "application/json",
            authorization: `Bearer ${token}`,
          }
        });
        if (response.ok) {
          const result = await response.json();
          setName(result.user.name);
          console.log("successfull:", result);
          setAuth(true)
        } else {
          console.error("server error:", response.statusText);
        }
      } catch (error) {
        console.log("network error");
      }
    };
    handleRes();
  },[]);
  return (
    <nav className="relative z-100 flex items-center justify-between px-8 py-4 bg-white shadow-sm">
      {/* Logo */}
      <div className="flex gap-4">
        <h1 className="text-2xl font-bold">CocosCanvas</h1>
        <h1 className="text-2xl font-bold">{name}</h1>
      </div>
      {/* Right side */}
      {!auth? <div className="flex items-center gap-4">
        <Link className="px-4 py-2 text-gray-700 hover:text-black" to="/login">
          Login
        </Link>
        <Link
          to="/signup"
          className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
        >
          Signup
        </Link>
      </div>: <div className="flex items-center gap-4">
            <button onClick={()=>setShowLogout(true)}
              className="px-4 py-2 text-gray-700 hover:text-black"
              >Logout
            </button>
      </div>
      }
    </nav>
  );
};

export default Navbar;
