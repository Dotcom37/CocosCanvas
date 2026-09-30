import { useLocation, useNavigate } from "react-router";
import { useState } from "react";

const OTP = () => {
  const location = useLocation();
  const {email} = location.state;

  const params = new URLSearchParams(location.search);
  const redirect = params.get("redirect");

  const [otp, setOtp] = useState();
  const navigate = useNavigate()
  const handleOtp = async (e) => {
      e.preventDefault()
      try {
      const userData = { email: email, otp: otp }
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/verify-otp`,
        {
          method: "POST",
          headers: {
            "Content-type": "application/json",
          },
          body: JSON.stringify(userData),
        },
      );

      const result = await response.json();

      if (response.ok) {
        localStorage.setItem("token", result.token)
        localStorage.setItem("email", result.user.email);
        console.log("successfull:", result)
        navigate(redirect || "/");
      }else{
        console.error("server error from otp:", response.statusText)
      }
      
    } catch (error) {
        console.log("network error")
    }
  };
  return (
    <form
      className="fixed inset-0 z-50 flex items-center justify-center"
      onSubmit={handleOtp}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>

      {/* OTP box */}
      <div className="relative z-10 w-[500px] rounded-3xl bg-white p-6 shadow-xl">

        <h1 className="text-2xl font-bold">Verify Email</h1>

        <p className="mt-2 text-gray-500">
          Enter the 6-digit OTP sent to your email.
        </p>

        <div className="mt-6 flex flex-col gap-4">
          <input
            type="text"
            value={otp}
            maxLength={6}
            placeholder="Enter OTP"
            className="rounded p-3 text-center tracking-[0.5em] shadow-inner"
            onChange={(e) => setOtp(e.target.value)}
          />

          <button className="rounded-lg bg-black p-3 text-white hover:bg-gray-800">
            Verify OTP
          </button>

          <p className="text-center text-gray-500">Didn't receive the OTP?</p>

          <button className="rounded-lg border p-3 hover:bg-gray-100">
            Resend OTP
          </button>
        </div>
      </div>
    </form>
  );
};

export default OTP;
