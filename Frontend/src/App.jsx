import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './Pages/Public/Home.jsx';
import Login from './Pages/Auth/Login.jsx';
import Register from './Pages/Auth/Register.jsx';
import VerifyOtp from './Pages/auth/VerifyOtp.jsx';
import { Provider } from 'react-redux';
import {store} from './Pages/store/store.js'
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import Dashboard from './Pages/Client/dashboard.jsx';
import MyCase from './Pages/Client/MyCase.jsx';
import Appointments from './Pages/Client/Appointments.jsx';


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
        <Route path='/header' element={<Header />} />
        <Route path='/footer' element={<Footer />} />
        <Route path='/dashboard' element={<Dashboard />} />
        <Route path='/cases' element={<MyCase />} />
        <Route path='/appointments' element={<Appointments />} />
      </Routes>
    </BrowserRouter>
    </Provider>
    </>

  );}

export default App