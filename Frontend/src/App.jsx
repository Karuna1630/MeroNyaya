import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './Pages/Public/Home.jsx';
import Login from './Pages/Auth/Login.jsx';
import Register from './Pages/Auth/Register.jsx';
import VerifyOtp from './Pages/auth/VerifyOtp.jsx';
import { Provider } from 'react-redux';
import {store} from './Pages/store/store.js'
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import FindLawyers from './Pages/Public/FindLawyers.jsx';
import IndividualLawyer from './Pages/Public/IndividualLawyer.jsx';

import ClientDashboard from './Pages/Client/ClientDashboard.jsx';
import ClientCase from './Pages/Client/ClientCase.jsx';
import ClientAppointment from './Pages/Client/ClientAppointment.jsx';
import ClientMessage from './Pages/Client/ClientMessage.jsx';
import Payment from './Pages/Client/Payment.jsx';

import LawyerDashboard from './Pages/Lawyer/LawyerDashboard.jsx';
import LawyerMessage from './Pages/Lawyer/LawyerMessage.jsx';
import LawyerAppointment from './Pages/Lawyer/LawyerAppointment.jsx';
import Earning from './Pages/Lawyer/Earning.jsx';
import LawyerCase from './Pages/Lawyer/LawyerCase.jsx';
import ViewProfile from './Pages/Profile/ViewProfile.jsx';


import KYCHeader from './Pages/KYC/KYCHeader.jsx';
import KYCTabs from './Pages/KYC/KYCtabs.jsx';
import PersonalInfo from './Pages/KYC/PersonalInfo.jsx';
import KYC from './Pages/KYC/KYC.jsx';




function App() {


  return (
    <>
    <Provider store={store}>
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/findlawyers' element={<FindLawyers />} />
        <Route path='/lawyer/:id' element={<IndividualLawyer />} />
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
        <Route path='/verify-otp' element={<VerifyOtp />} />
        <Route path='/header' element={<Header />} />

        {/*  Client Routes */}
        <Route path='/footer' element={<Footer />} />
        <Route path='/clientdashboard' element={<ClientDashboard />} />
        <Route path='/clientcase' element={<ClientCase />} />
        <Route path='/clientappointment' element={<ClientAppointment />} />
        <Route path='/clientmessage' element={<ClientMessage />} />
        <Route path='/clientpayment' element={<Payment />} />

        {/*  Lawyer Routes */}
        <Route path='/lawyerdashboard' element={<LawyerDashboard />} />
        <Route path='/lawyercase' element={<LawyerCase />} />
        <Route path='/lawyerappointment' element={<LawyerAppointment />} />
        <Route path='/lawyermessage' element={<LawyerMessage />} />
        <Route path='/lawyerearning' element={<Earning />} />

         <Route path='/viewprofile' element={<ViewProfile />} />



         {/* KYC */}
         <Route path='/kyc' element={<KYC/>} />
         <Route path='/kycheader' element={<KYCHeader />} />
         <Route path='/kyctabs' element={<KYCtabs />} />
         <Route path='/personalinfo' element={<PersonalInfo />} />
      </Routes>
    </BrowserRouter>
    </Provider>
    </>

  );}

export default App