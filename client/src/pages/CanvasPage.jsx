import React from 'react'
import {useEffect, useState} from 'react'
import Canvas from '../canvasComponents/Canvas'
import Toolbar from '../canvasComponents/Toolbar'
import Navbar from '../components/navbar'
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcut'
import {useParams, useNavigate} from 'react-router-dom'

const CanvasPage = () => {
  useKeyboardShortcuts();
  
  const {roomid} = useParams()

  const navigate = useNavigate()

  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  useEffect(() => {
  const checkAuth = async () => {
    const token = localStorage.getItem("token");

    const response = await fetch(
      "http://localhost:3000/api/auth/is-authenticated",
      {
        headers: {
          authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      navigate(`/login?redirect=/canvas/${roomid}`);
      return;
    }

    setAuthenticated(true);
    setLoading(false);
  };

  checkAuth();
}, [roomid]);
  if (loading) return <div>Loading...</div>;
  if (!authenticated) return null;
  return (
    <>
       <div className='flex'>
          <Toolbar/>
          <Canvas/>
       </div>
    </>
  )
}

export default CanvasPage
