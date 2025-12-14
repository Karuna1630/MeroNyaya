import React from 'react'
import { useNavigate } from "react-router-dom";

const Home = () => {
const navigate = useNavigate();
  return (
    <div>

    <button onClick={() => navigate('/login')} className='bg-blue-500 text-white px-4 py-2 rounded'>Login</button>
    <button onClick={() => navigate('/register')} className='bg-blue-500 text-white px-4 py-2 rounded'>Register</button>

    </div>
  )
}

export default Home
