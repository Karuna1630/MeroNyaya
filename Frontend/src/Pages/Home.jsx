import React from 'react'
import { useNavigate } from "react-router-dom";

const Home = () => {
const navigate = useNavigate();
  return (
    <div>
      <p className='text-5xl'>Karunagigiiiiii</p>
    <button onClick={() => navigate('/login')} className='bg-blue-500 text-white px-4 py-2 rounded'>Login</button>
    </div>
  )
}

export default Home
