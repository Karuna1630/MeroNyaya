import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './Pages/Public/Home.jsx';
import Login from './Pages/Auth/Login.jsx';
import Register from './Pages/Auth/Register.jsx';
import VerifyOtp from './Pages/auth/VerifyOtp.jsx';
import { Provider } from 'react-redux';
import {store} from './Pages/store/store.js'


function App() {


  return (
    <>
    <Provider store={store}>
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
        <Route path='/verify-otp' element={<VerifyOtp />} />
      </Routes>
    </BrowserRouter>
    </Provider>
    </>
  )
}

export default App