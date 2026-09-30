import { useNavigate, useLocation} from "react-router";
import { useState } from "react";
const Signup = () => {
  
  const [Name, setname] = useState()
  const [email, setEmail] = useState()
  const [Password, setPassword] = useState()

  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const redirect = params.get("redirect");

  const navigate = useNavigate()
  const handleSubmit = async(e) =>{
      e.preventDefault()
      
      const userData = {name:Name, email:email, password: Password} 
      console.log("here we go")
      try{
          const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/signup`,{
                method:'POST',
                headers:{
                  "content-type":"application/json"
                },
                body: JSON.stringify(userData)
          })
          
          if (response.ok){
            const result  = await response.json() 
            console.log("successfull registration:", result.message)
            navigate(`/otp?redirect=${encodeURIComponent(redirect || "/")}`, { state: { email }})
          }
          else{
            console.error("server error:", response.statusText)
          }
      }catch(err){
          console.log("network error")
      } 

  }
  return (
    
    <form className="fixed inset-0 z-50 flex items-center justify-center" onSubmit={handleSubmit}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>

      {/* Signup box */}
      <div className="relative z-10 w-[500px] rounded-3xl bg-white p-6 shadow-xl">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="absolute right-4 top-4 text-xl text-gray-500 hover:text-black"
        >
          ✕
        </button>
        <h1 className="text-2xl font-bold">Signup</h1>

        <div className="mt-6 flex flex-col gap-4">
          <input
            type="text"
            value={Name}
            placeholder="Name"
            className="rounded p-3 shadow-inner"
            onChange={(e) => setname(e.target.value)}
          />

          <input
            type="email"
            value = {email}
            placeholder="Email"
            className="rounded p-3 shadow-inner bg-white"
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            value = {Password}
            placeholder="Password"
            className="rounded p-3 shadow-inner bg-white"
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className="rounded-lg border p-3 hover:bg-gray-100" type="submit">
            Register
          </button>
          <div className="gap-3 flex">
            <p className="text-gray-500">Already a member?</p>
            <p onClick={() => navigate('/login')}>Login</p>
          </div>
          <p className="text-center text-gray-500">
            or login using Google
          </p>
          <button className="rounded-lg border p-3 hover:bg-gray-100">
            Continue with Google
          </button>
        </div>
      </div>
    </form>
  );
};

export default Signup