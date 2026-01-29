import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './Pages/Public/Home.jsx';
import Login from './Pages/Auth/Login.jsx';
import Register from './Pages/Auth/Register.jsx';
import VerifyOtp from './Pages/auth/VerifyOtp.jsx';
import { Provider } from 'react-redux';
import {store} from './Pages/store/store.js'
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import ProtectedRoute from './Pages/utils/ProtectedRoute.jsx';
import FindLawyers from './Pages/Public/FindLawyers.jsx';
import IndividualLawyer from './Pages/Public/IndividualLawyer.jsx';

import ClientDashboard from './Pages/Client/ClientDashboard.jsx';
import ClientCase from './Pages/Client/ClientCase.jsx';
import ClientAppointment from './Pages/Client/ClientAppointment.jsx';
import ClientMessage from './Pages/Client/ClientMessage.jsx';
import Payment from './Pages/Client/Payment.jsx';
import ClientFindLawyers from './Pages/Client/ClientFindLawyers.jsx';

import LawyerDashboard from './Pages/Lawyer/LawyerDashboard.jsx';
import LawyerMessage from './Pages/Lawyer/LawyerMessage.jsx';
import LawyerAppointment from './Pages/Lawyer/LawyerAppointment.jsx';
import Earning from './Pages/Lawyer/Earning.jsx';
import LawyerCase from './Pages/Lawyer/LawyerCase.jsx';
import ViewProfile from './Pages/Profile/ViewProfile.jsx';
import EditProfile from './Pages/Profile/EditProfile.jsx';


import AdminDashboard from './Pages/Admin/AdminDashboard.jsx';
import AdminKYCVerification from './Pages/Admin/AdminKYCVerification.jsx';



import KYC from './Pages/KYC/KYC.jsx';




function App() {


  return (
    <>
    <Provider store={store}>
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path='/' element={<Home />} />
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
        <Route path='/verify-otp' element={<VerifyOtp />} />
        <Route path='/header' element={<Header />} />
        <Route path='/footer' element={<Footer />} />

        {/* Protected Public Routes */}
        <Route path='/findlawyers' element={<ProtectedRoute allowedRoles={["client", "lawyer"]}><FindLawyers /></ProtectedRoute>} />
        <Route path='/lawyer/:id' element={<ProtectedRoute allowedRoles={["client", "lawyer"]}><IndividualLawyer /></ProtectedRoute>} />

        {/* Client Routes - Protected */}
        <Route path='/clientdashboard' element={<ProtectedRoute requiredRole="client"><ClientDashboard /></ProtectedRoute>} />
        <Route path='/client/findlawyers' element={<ProtectedRoute requiredRole="client"><ClientFindLawyers /></ProtectedRoute>} />
        <Route path='/clientcase' element={<ProtectedRoute requiredRole="client"><ClientCase /></ProtectedRoute>} />
        <Route path='/clientappointment' element={<ProtectedRoute requiredRole="client"><ClientAppointment /></ProtectedRoute>} />
        <Route path='/clientmessage' element={<ProtectedRoute requiredRole="client"><ClientMessage /></ProtectedRoute>} />
        <Route path='/clientpayment' element={<ProtectedRoute requiredRole="client"><Payment /></ProtectedRoute>} />

        {/* Lawyer Routes - Protected */}
        <Route path='/lawyerdashboard' element={<ProtectedRoute requiredRole="lawyer"><LawyerDashboard /></ProtectedRoute>} />
        <Route path='/lawyercase' element={<ProtectedRoute requiredRole="lawyer"><LawyerCase /></ProtectedRoute>} />
        <Route path='/lawyerappointment' element={<ProtectedRoute requiredRole="lawyer"><LawyerAppointment /></ProtectedRoute>} />
        <Route path='/lawyermessage' element={<ProtectedRoute requiredRole="lawyer"><LawyerMessage /></ProtectedRoute>} />
        <Route path='/lawyerearning' element={<ProtectedRoute requiredRole="lawyer"><Earning /></ProtectedRoute>} />

        {/* Profile Routes - Protected */}
        <Route path='/viewprofile' element={<ProtectedRoute><ViewProfile /></ProtectedRoute>} />
        <Route path='/edit-profile' element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />

        {/* Admin Routes - Protected */}
        <Route path='/admindashboard' element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
        <Route path='/admin/verification' element={<ProtectedRoute requiredRole="admin"><AdminKYCVerification /></ProtectedRoute>} />

        {/* KYC - Protected */}
        <Route path='/kyc' element={<ProtectedRoute requiredRole="lawyer"><KYC /></ProtectedRoute>} />  
      </Routes>
    </BrowserRouter>
    </Provider>
    </>

  );}

export default App