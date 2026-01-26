import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Sidebar from './Sidebar';
import StatCard from './Statcard.jsx';
import DashHeader from './LawyerDashHeader';
import { Briefcase, DollarSign, Calendar, MessageSquare, Star, Gavel, Trophy, GraduationCap, ArrowRight, AlertCircle, X, Clock, CheckCircle } from 'lucide-react';
import KYC from '../KYC/KYC';
import { fetchUserProfile } from '../slices/profileSlice';
import { fetchKycStatus } from '../slices/kycSlice';

const LawyerDashboard = () => {
  const dispatch = useDispatch();
  const { userProfile } = useSelector((state) => state.profile);
  const { status, statusSuccess } = useSelector((state) => state.kyc);
  const [showKycModal, setShowKycModal] = useState(false);
  const [dismissedApproved, setDismissedApproved] = useState(() => localStorage.getItem('kycApprovedDismissed') === '1');
  const approvedToastShownRef = useRef(false);

  useEffect(() => {
    dispatch(fetchUserProfile());
  }, [dispatch]);

  // Poll KYC status periodically; notify when approved
  useEffect(() => {
    // initial fetch
    dispatch(fetchKycStatus());
    const interval = setInterval(() => {
      dispatch(fetchKycStatus());
    }, 15000); // 15s polling
    return () => clearInterval(interval);
  }, [dispatch]);

  const isVerified = (statusObj) => {
    if (!statusObj) return false;
    return (
      statusObj.is_verified === true ||
      statusObj.is_kyc_verified === true ||
      statusObj.verified === true ||
      statusObj.kyc_verified === true ||
      statusObj.kyc_status === 'verified' ||
      statusObj.kyc_status === 'approved'
    );
  };

  const kycStatusValue = status?.status || status?.kyc_status || status?.state;
  const isKycApproved = isVerified(status) || userProfile?.is_kyc_verified === true || kycStatusValue === 'approved';
  const isKycPending = !isKycApproved && (kycStatusValue === 'pending' || kycStatusValue === 'under_review' || kycStatusValue === 'in_review');
  const isKycNotSubmitted = !isKycApproved && !isKycPending;
  const modalOpen = showKycModal && !isKycApproved;

  useEffect(() => {
    if (statusSuccess && isKycApproved) {
      if (!approvedToastShownRef.current) {
        toast.success('Your KYC has been approved.');
        approvedToastShownRef.current = true;
      }
      // setShowKycModal(false); // Removed to hide modal automatically
      if (!userProfile?.is_kyc_verified) {
        dispatch(fetchUserProfile());
      }
    }
  }, [statusSuccess, isKycApproved, userProfile, dispatch]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (modalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [modalOpen]);

  const getCaseStatusClasses = (status) => {
    switch (status) {
      case 'In Progress':
        return 'bg-blue-100 text-blue-700';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'Closed':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getScheduleStatusClasses = (status) => {
    switch (status) {
      case 'Confirmed':
        return 'bg-emerald-100 text-emerald-700';
      case 'Pending':
        return 'bg-amber-100 text-amber-700';
      case 'Upcoming':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  // Dynamic stat cards from profile
  const statCards = userProfile ? [
    {
      icon: <Briefcase size={20} />,
      title: 'Active Cases',
      value: userProfile.active_cases || '0',
      subtitle: '+0 this month',
    },
    {
      icon: <DollarSign size={20} />,
      title: "This Month's Earnings",
      value: `₹ ${userProfile.monthly_earnings || '0'}`,
      subtitle: '+0% from last month',
    },
    {
      icon: <Calendar size={20} />,
      title: 'Appointments Today',
      value: userProfile.appointments_today || '0',
      subtitle: '0 pending confirmation',
    },
    {
      icon: <MessageSquare size={20} />,
      title: 'Unread Messages',
      value: userProfile.unread_messages || '0',
      subtitle: '0 urgent',
    },
  ] : [];

  // Dynamic recent cases from profile
  const recentCases = userProfile?.cases || [];

  // Dynamic today schedule from profile
  const todaySchedule = userProfile?.appointments || [];

  // Dynamic messages from profile
  const recentMessages = userProfile?.messages || [];

  // Dynamic bottom stats from profile
  const bottomStats = userProfile ? [
    { icon: <Star size={20} />, value: userProfile.client_rating || '0.0', label: 'Client Rating' },
    { icon: <Gavel size={20} />, value: userProfile.cases_handled || '0', label: 'Cases Handled' },
    { icon: <Trophy size={20} />, value: userProfile.success_rate || '0%', label: 'Success Rate' },
    { icon: <GraduationCap size={20} />, value: userProfile.experience || '0', label: 'Years Experience' },
  ] : [];

  return (
    <div className="relative">
      <ToastContainer />
      <div className={`flex min-h-screen bg-gray-100 transition ${modalOpen ? 'filter blur-sm pointer-events-none' : ''}`}>
        <Sidebar />

        <div className="ml-64 flex-1 flex flex-col">
          <div className="sticky top-0 z-30 bg-white">
            <DashHeader
              title={userProfile ? `Welcome back, ${userProfile.name}` : "Welcome back"}
              subtitle="Here's an overview of your practice today"
              notificationCount={3}
            />
          </div>

          {isKycApproved && !dismissedApproved && (
            <div className="px-6 pt-4 pb-2">
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex items-start gap-3">
                <div className="shrink-0 w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700">
                  <CheckCircle size={20} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 flex-wrap mb-1">
                    <p className="text-sm font-semibold text-emerald-900">KYC Approved</p>
                    <span className="inline-flex items-center rounded-full bg-emerald-200 text-emerald-800 px-3 py-1 text-xs font-semibold">Verified</span>
                  </div>
                  <p className="text-xs text-emerald-800">Your identity has been verified. Full platform access is enabled.</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setDismissedApproved(true);
                    localStorage.setItem('kycApprovedDismissed', '1');
                  }}
                  className="text-emerald-700 hover:text-emerald-900"
                  aria-label="Dismiss KYC approved banner"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
          )}

          {isKycPending && (
            <div className="px-6 pt-4 pb-2">
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-4">
                <div className="shrink-0 w-10 h-10 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-700">
                  <Clock size={20} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 flex-wrap mb-1">
                    <p className="text-sm font-semibold text-amber-900">KYC Under Review</p>
                    <span className="inline-flex items-center rounded-full bg-amber-200 text-amber-800 px-3 py-1 text-xs font-semibold">Pending</span>
                  </div>
                  <p className="text-xs sm:text-sm text-amber-800">Your KYC is under review. Some features are temporarily limited. This typically takes 2-3 business days.</p>
                  <div className="mt-3">
                    <p className="text-sm font-semibold text-amber-900">Limited access during review:</p>
                    <ul className="mt-2 space-y-1.5 text-sm text-amber-800 list-disc pl-5">
                      <li>Cannot accept case requests</li>
                      <li>Cannot receive payments</li>
                      <li>Profile not visible in Find Lawyers</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {isKycNotSubmitted && (
            <div className="px-6 pt-4 pb-2">
              <div
                className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center gap-3 cursor-pointer hover:bg-amber-100 transition"
                onClick={() => setShowKycModal(true)}
              >
                <AlertCircle className="text-amber-600 shrink-0" size={20} />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-amber-900">Haven't verified your Lawyer KYC yet?</p>
                  <p className="text-xs text-amber-700">Complete your identity verification to unlock full platform access</p>
                </div>
                <ArrowRight className="text-amber-600 shrink-0" size={20} />
              </div>
            </div>
          )}

          <div className="flex-1 p-6 space-y-5 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {statCards.map((stat, index) => (
                <StatCard key={index} {...stat} />
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white rounded-lg p-6 shadow">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-[#0F1A3D]">Recent Cases</h2>
                  <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-[#0F1A3D] text-sm font-semibold transition hover:bg-yellow-500 ">
                    View All
                    <ArrowRight size={16} />
                  </button>
                </div>
                <div className="space-y-4">
                  {recentCases.map((case_) => (
                    <div key={case_.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:shadow-md transition">
                      <div className="w-12 h-12 rounded-full bg-linear-to-br from-blue-500 to-purple-600 text-white font-bold flex items-center justify-center shrink-0">
                        {case_.avatar}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-base font-semibold text-[#0F1A3D]">{case_.title}</h3>
                        </div>
                        <p className="text-sm text-gray-600">Client: {case_.client}</p>
                        <p className="text-xs text-gray-400 flex items-center gap-2">
                          <span>{case_.caseId}</span>
                          <span className="text-gray-300">•</span>
                          <span>{case_.next}</span>
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCaseStatusClasses(case_.status)}`}>
                          {case_.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-6">
                <div className="bg-white rounded-lg p-6 shadow">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-[#0F1A3D]">Upcoming Appointments</h2>
                    <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[#0F1A3D] text-xs font-semibold transition hover:bg-yellow-500 ">
                      View All
                      <ArrowRight size={14} />
                    </button>
                  </div>
                  <div className="space-y-4">
                    {todaySchedule.map((appointment) => (
                      <div key={appointment.id} className="flex gap-3 items-center">
                        <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-500 to-purple-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                          {appointment.avatar}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-semibold text-[#0F1A3D]">{appointment.name}</h4>
                          <p className="text-xs text-gray-600">{appointment.type}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <p className="text-xs font-semibold text-[#0F1A3D]">{appointment.time}</p>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getScheduleStatusClasses(appointment.status)}`}>
                            {appointment.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-lg p-6 shadow">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-[#0F1A3D]">Recent Messages</h2>
                    <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[#0F1A3D] text-xs font-semibold transition hover:bg-yellow-500 ">
                      View All
                      <ArrowRight size={14} />
                    </button>
                  </div>
                  <div className="space-y-4">
                    {recentMessages.map((msg) => (
                      <div key={msg.id} className="flex gap-3">
                        <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-500 to-purple-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                          {msg.avatar}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-semibold text-[#0F1A3D]">{msg.name}</h4>
                            {msg.unread && <span className="w-2 h-2 bg-blue-600 rounded-full"></span>}
                          </div>
                          <p className="text-xs text-gray-600">{msg.message}</p>
                          <p className="text-xs text-gray-400 mt-1">{msg.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pb-6">
              {bottomStats.map((stat, index) => (
                <div key={index} className="bg-white rounded-lg p-6 shadow flex gap-4 items-center">
                  <div className="w-14 h-14 rounded-lg bg-blue-100 text-blue-900 flex items-center justify-center shrink-0">
                    {stat.icon}
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-[#0F1A3D]">{stat.value}</div>
                    <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 overflow-hidden">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowKycModal(false)} />
          <div className="relative w-full max-w-6xl">
            <button
              type="button"
              onClick={() => setShowKycModal(false)}
              className="absolute -right-3 -top-3 z-10 rounded-full bg-white p-2.5 shadow-lg hover:bg-gray-100 transition"
            >
              <X size={20} />
            </button>
            <div className="h-[88vh] overflow-hidden rounded-2xl shadow-2xl bg-white">
              <KYC onClose={() => setShowKycModal(false)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LawyerDashboard;