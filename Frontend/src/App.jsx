import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import Landing from './Pages/Public/Landing.jsx'
import Login from './Pages/Auth/Login.jsx'
import Register from './Pages/Auth/Register.jsx'



function App() {


  return (
    <>
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Landing />} />
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
      </Routes>
    </BrowserRouter>
    </>
  )
}

export default App