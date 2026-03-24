import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './Pages/Public/Home.jsx';
import Login from './Pages/Auth/Login.jsx';
import Register from './Pages/Auth/Register.jsx';
import VerifyOtp from './Pages/Auth/VerifyOtp.jsx';
import ForgotPassword from './Pages/Auth/ForgotPassword.jsx';
import ForgotPasswordOtp from './Pages/Auth/ForgotPasswordOtp.jsx';
import ResetPassword from './Pages/Auth/ResetPassword.jsx';
import { Provider } from 'react-redux';
import {store} from './Pages/store/store.js'
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import ProtectedRoute from './Pages/utils/ProtectedRoute.jsx';
import LawyerReviewGuard from './Pages/utils/LawyerReviewGuard.jsx';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import FindLawyers from './Pages/Public/FindLawyers.jsx';
import IndividualLawyer from './Pages/Public/IndividualLawyer.jsx';
import About from './Pages/Public/About.jsx';
import { SidebarProvider } from './context/SidebarContext.jsx';

import ClientDashboard from './Pages/Client/ClientDashboard.jsx';
import ClientCase from './Pages/Client/ClientCase.jsx';
import ClientAppointment from './Pages/Client/ClientAppointment.jsx';
import ClientMessage from './Pages/Client/ClientMessage.jsx';
import Payment from './Pages/Client/Payment.jsx';
import ClientFindLawyers from './Pages/Client/ClientFindLawyers.jsx';
import ClientCreateCase from './Pages/Client/case/ClientCreateCase.jsx';
import ClientCaseDetail from './Pages/Client/case/ClientCaseDetail.jsx';
import LawyerProposal from './Pages/Client/case/LawyerProposal.jsx';
import ClientConsultation from './Pages/Client/ClientConsultation.jsx';

import LawyerDashboard from './Pages/Lawyer/LawyerDashboard.jsx';
import LawyerMessage from './Pages/Lawyer/LawyerMessage.jsx';
import LawyerAppointment from './Pages/Lawyer/LawyerAppointment.jsx';
import Earning from './Pages/Lawyer/Earning.jsx';
import LawyerCase from './Pages/Lawyer/LawyerCase.jsx';
import LawyerCaseDetail from './Pages/Lawyer/case/LawyerCaseDetail.jsx';
import LawyerFindCases from './Pages/Lawyer/LawyerFindCases.jsx';
import LawyerCaseRequest from './Pages/Lawyer/LawyerCaseRequest.jsx';
import ViewProfile from './Pages/Profile/ViewProfile.jsx';
import EditProfile from './Pages/Profile/EditProfile.jsx';


import AdminDashboard from './Pages/Admin/AdminDashboard.jsx';
import AdminKYCVerification from './Pages/Admin/AdminKYCVerification.jsx';
import AdminRevenue from './Pages/Admin/AdminRevenue.jsx';



import KYC from './Pages/KYC/KYC.jsx';
import EsewaSuccess from './Pages/Payment/EsewaSuccess.jsx';
import EsewaFailure from './Pages/Payment/EsewaFailure.jsx';
import KhaltiSuccess from './Pages/Payment/KhaltiSuccess.jsx';




function App() {


  return (
    <>
    <Provider store={store}>
    <SidebarProvider>
    <BrowserRouter>
      <ToastContainer position="top-center" autoClose={4000} />
      <Routes>
        {/* Public Routes */}
        <Route path='/' element={<Home />} />
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
        <Route path='/verify-otp' element={<VerifyOtp />} />
        <Route path='/forgot-password' element={<ForgotPassword />} />
        <Route path='/forgot-password/verify-otp' element={<ForgotPasswordOtp />} />
        <Route path='/reset-password' element={<ResetPassword />} />
        <Route path='/header' element={<Header />} />
        <Route path='/footer' element={<Footer />} />

        {/* Public Pages - Accessible to all */}
        <Route path='/findlawyers' element={<FindLawyers />} />
        <Route path='/about' element={<About />} />
        <Route path='/lawyer/:id' element={<IndividualLawyer />} />

        {/* Client Routes - Protected */}
        <Route path='/clientdashboard' element={<ProtectedRoute requiredRole="client"><ClientDashboard /></ProtectedRoute>} />
        <Route path='/client/findlawyers' element={<ProtectedRoute requiredRole="client"><ClientFindLawyers /></ProtectedRoute>} />
        <Route path='/clientcase' element={<ProtectedRoute requiredRole="client"><ClientCase /></ProtectedRoute>} />
        <Route path='/client/case/:id' element={<ProtectedRoute requiredRole="client"><ClientCaseDetail /></ProtectedRoute>} />
        <Route path='/client/case/:id/proposals' element={<ProtectedRoute requiredRole="client"><LawyerProposal /></ProtectedRoute>} />
        <Route path='/client/create-case' element={<ProtectedRoute requiredRole="client"><ClientCreateCase /></ProtectedRoute>} />
        <Route path='/client/edit-case/:id' element={<ProtectedRoute requiredRole="client"><ClientCreateCase /></ProtectedRoute>} />
        <Route path='/clientappointment' element={<ProtectedRoute requiredRole="client"><ClientAppointment /></ProtectedRoute>} />
        <Route path='/clientmessage' element={<ProtectedRoute requiredRole="client"><ClientMessage /></ProtectedRoute>} />
        <Route path='/client/consultation' element={<ProtectedRoute requiredRole="client"><ClientConsultation /></ProtectedRoute>} />
        <Route path='/clientpayment' element={<ProtectedRoute requiredRole="client"><Payment /></ProtectedRoute>} />

        {/* Lawyer Routes - Protected */}
        <Route path='/lawyerdashboard' element={<ProtectedRoute requiredRole="lawyer"><LawyerReviewGuard><LawyerDashboard /></LawyerReviewGuard></ProtectedRoute>} />
        <Route path='/lawyerfindcases' element={<ProtectedRoute requiredRole="lawyer"><LawyerReviewGuard><LawyerFindCases /></LawyerReviewGuard></ProtectedRoute>} />
        <Route path='/lawyercaserequest' element={<ProtectedRoute requiredRole="lawyer"><LawyerReviewGuard><LawyerCaseRequest /></LawyerReviewGuard></ProtectedRoute>} />
        <Route path='/lawyercase' element={<ProtectedRoute requiredRole="lawyer"><LawyerReviewGuard><LawyerCase /></LawyerReviewGuard></ProtectedRoute>} />
        <Route path='/lawyercase/:id' element={<ProtectedRoute requiredRole="lawyer"><LawyerReviewGuard><LawyerCaseDetail /></LawyerReviewGuard></ProtectedRoute>} />
        <Route path='/lawyerappointment' element={<ProtectedRoute requiredRole="lawyer"><LawyerReviewGuard><LawyerAppointment /></LawyerReviewGuard></ProtectedRoute>} />
        <Route path='/lawyermessage' element={<ProtectedRoute requiredRole="lawyer"><LawyerReviewGuard><LawyerMessage /></LawyerReviewGuard></ProtectedRoute>} />
        <Route path='/lawyerearning' element={<ProtectedRoute requiredRole="lawyer"><LawyerReviewGuard><Earning /></LawyerReviewGuard></ProtectedRoute>} />

        {/* Profile Routes - Protected */}
        <Route path='/viewprofile' element={<ProtectedRoute><ViewProfile /></ProtectedRoute>} />
        <Route path='/edit-profile' element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />

        {/* Admin Routes - Protected */}
        <Route path='/admindashboard' element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
        <Route path='/admin/verification' element={<ProtectedRoute requiredRole="admin"><AdminKYCVerification /></ProtectedRoute>} />
        <Route path='/admin/revenue' element={<ProtectedRoute requiredRole="admin"><AdminRevenue /></ProtectedRoute>} />

        {/* KYC - Protected */}
        <Route path='/kyc' element={<ProtectedRoute requiredRole="lawyer"><LawyerReviewGuard><KYC /></LawyerReviewGuard></ProtectedRoute>} />

        {/* Payment callback routes */}
        <Route path='/payment/esewa-success' element={<ProtectedRoute requiredRole="client"><EsewaSuccess /></ProtectedRoute>} />
        <Route path='/payment/esewa-failure' element={<ProtectedRoute requiredRole="client"><EsewaFailure /></ProtectedRoute>} />
        <Route path='/payment/khalti-success' element={<ProtectedRoute requiredRole="client"><KhaltiSuccess /></ProtectedRoute>} />  
      </Routes>
    </BrowserRouter>
    </SidebarProvider>
    </Provider>
    </>

  );}

export default App