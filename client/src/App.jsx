import LandingPage from "./pages/landingPage";
import Login from "./components/login/login";
import Signup from "./components/login/signup";
import OTP from "./components/login/otp";
import CanvasPage from "./pages/CanvasPage";
import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";


function App() {
  
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/otp" element={<OTP/>}/>
        <Route path="/canvas/:roomid" element={<CanvasPage/>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;