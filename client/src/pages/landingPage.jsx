import React, { useEffect, useState } from "react";
import Navbar from "../components/navbar";
import otherStore from "../store/otherStore";
import Signup from "../components/login/signup";
import { useNavigate } from "react-router";
import NewRoomTitle from "../components/newRoomTitle";
import Logout from "../components/login/logout";
const LandingPage = () => {
  const [openRooms, setOpenRooms] = useState(false);
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [canvasData, setCanvasData] = useState([]);
  const [showLogout, setShowLogout] = useState(false)
  const token = localStorage.getItem("token");
  const open = otherStore((state) => state.openSignUp);
  const navigate = useNavigate();

  useEffect(() => {
    const getRooms = async () => {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/canvas/getRooms`,
        {
          method: "GET",
          headers: {
            "Content-type": "application/json",
            authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();
      setCanvasData(data.rooms);
    };

    getRooms();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar setShowLogout={setShowLogout}/>

      {showCreateRoom && <NewRoomTitle setShowCreateRoom={setShowCreateRoom} />}
      {showLogout && <Logout setshowLogout = {setShowLogout}/>}
      <main className="mx-auto max-w-6xl px-6 py-10">
        {/* Header */}
        <div className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Your Projects</h1>
            <p className="mt-1 text-sm text-gray-500">
              Create and manage your canvases
            </p>
          </div>

          <button
            onClick={() => setShowCreateRoom(true)}
            className="flex items-center gap-2 rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-gray-800"
          >
            <span className="text-lg">+</span>
            New Canvas
          </button>
        </div>

        {/* Projects */}
        {token && (
          <>
            {canvasData.length > 0 ? (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {canvasData.map((room, index) => (
                  <div
                    onClick={(e) => {
                      localStorage.setItem("roomId", room.id);
                      navigate(`/canvas/${room.id}`);
                    }}
                    key={index}
                    className="group cursor-pointer rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                  >
                    {/* Title */}
                    <h2 className="truncate text-base font-semibold text-gray-900">
                      {room.title}
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">Canvas project</p>
                  </div>
                ))}
              </div>
            ) : (
              /* Empty state */
              <div className="flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white">
                

                <h2 className="text-lg font-semibold text-gray-900">
                  No projects yet
                </h2>

                <p className="mt-1 mb-5 text-sm text-gray-500">
                  Create your first canvas to get started.
                </p>

                <button
                  onClick={() => setShowCreateRoom(true)}
                  className="rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
                >
                  Create Canvas
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default LandingPage;
