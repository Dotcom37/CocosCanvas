import React from "react";
import { useNavigate } from "react-router";
import { useState } from "react";
const Logout = ({setshowLogout}) => {
  
    const handleLogout =  () => {

        localStorage.removeItem("token")
        localStorage.removeItem("email")

        window.location.href = "/";
    }

  return (
    <>
      <form className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>

        <div className="relative z-10 w-[500px] rounded-3xl bg-white p-6 shadow-xl">
          <button
            type="button"
            onClick={() => setshowLogout(false)}
            className="absolute right-4 top-4 text-xl text-gray-500 hover:text-black"
          >
            ✕
          </button>
          <h1 className="text-2xl font-bold">Are you sure you <br /> want to Logout?</h1>
          <div className="mt-6 flex gap-8">
           <button className="rounded-lg bg-gray-300 p-3 text-white hover:bg-gray-800" type="button"
            onClick={() => setshowLogout(false)} 
           >
             cancel
           </button>
           <button className="rounded-lg bg-black p-3 text-white hover:bg-gray-800" type="button" onClick={handleLogout()}>
             Logout
           </button>
        </div>
        </div>
        
      </form>
    </>
  );
};

export default Logout;
