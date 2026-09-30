import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useLocation } from "react-router-dom";
const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();
  const userData = { email: email, password: password };
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const redirect = params.get("redirect");
  
  const handleSumbit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const result = await response.json();

      if (response.ok) {
        localStorage.setItem("token", result.token);
        localStorage.setItem("email", result.user.email);
        console.log("success:", result);
        navigate(redirect || "/");
      } else {
        console.error("server error:", result.message);
      }
    } catch (error) {
      console.log("network error:", error);
    }
  };
  return (
    <form
      className="fixed inset-0 z-50 flex items-center justify-center"
      onSubmit={handleSumbit}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>

      {/* Login box */}
      <div className="relative z-10 w-[500px] rounded-3xl bg-white p-6 shadow-xl">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="absolute right-4 top-4 text-xl text-gray-500 hover:text-black"
        >
          ✕
        </button>

        <h1 className="text-2xl font-bold">Login</h1>

        <div className="mt-6 flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
            }}
            className="rounded p-3 shadow-inner bg-white"
          />

          <input
            type="password"
            placeholder="Password"
            className="rounded p-3 shadow-inner bg-white"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
            }}
          />

          <button className="rounded-lg bg-black p-3 text-white hover:bg-gray-800">
            Login
          </button>

          <div className="text-center text-sm"> 
            <span className="text-gray-500"> Don't have an account?{" "} </span> 
            <button type="button" onClick={() => navigate(`/signup?redirect=${encodeURIComponent(redirect || "/")}`)} 
              className="font-semibold text-black hover:underline" > 
              Create an account 
            </button> 
          </div>
          
        </div>
      </div>
    </form>
  );
};

export default Login;
