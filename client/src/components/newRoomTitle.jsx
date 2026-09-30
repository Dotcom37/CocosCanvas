import React from "react";
import { useNavigate } from "react-router";
import { useState } from "react";
const NewRoomTitle = ({setShowCreateRoom}) => {
  const navigate  = useNavigate()
  const [title, setTitle] = useState() 
  const userData = {title: title}
  const token = localStorage.getItem("token") 
  const handleSubmit = async(e) => {
        e.preventDefault()
        
        try{
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/canvas/createRoom`,  {
                method: 'POST',
                headers:{
                  "content-type":"application/json",
                  authorization: `Bearer ${token}`
                },
                body: JSON.stringify(userData)
            })

            if(response.ok){
                const res = await response.json()
                console.log("room creation was successfull: ", res.message)
                localStorage.setItem("email", res.roomData.created_by)
                localStorage.setItem("roomId", res.roomData.id)
                navigate(`/canvas/${res.roomData.id}`)
            }else{
                console.log("server error:", response.statusText)
            }
        }catch(error){
             console.log("network error")
        }
  }

  return (
    <>
      <form className="fixed inset-0 z-50 flex items-center justify-center" onSubmit={handleSubmit}>
        <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>

        <div className="relative z-10 w-[500px] rounded-3xl bg-white p-6 shadow-xl">
          <button
            type="button"
            onClick={() => setShowCreateRoom(false)}
            className="absolute right-4 top-4 text-xl text-gray-500 hover:text-black"
          >
            ✕
          </button>
          <h1 className="text-2xl font-bold">Give a name to your project</h1>
          <div className="mt-6 flex flex-col gap-8">
           <input 
             className="rounded p-3 shadow-inner bg-white"
             type="text" 
             placeholder="canvas Title" 
             value={title} 
             onChange={(e)=>{setTitle(e.target.value)
            }}/>
           <button className="rounded-lg bg-black p-3 text-white hover:bg-gray-800" type="submit">
             create
           </button>
        </div>
        </div>
        
      </form>
    </>
  );
};

export default NewRoomTitle;
