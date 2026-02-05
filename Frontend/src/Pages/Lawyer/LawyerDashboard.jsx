import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Sidebar from './Sidebar';
import StatCard from './Statcard.jsx';
import DashHeader from './LawyerDashHeader';
import { Briefcase, DollarSign, Calendar, MessageSquare, Star, Gavel, Trophy, GraduationCap, ArrowRight, AlertCircle, X, Clock, CheckCircle, AlertTriangle, FileText } from 'lucide-react';
import KYC from '../KYC/KYC';
import { fetchUserProfile } from '../slices/profileSlice';
import { fetchKycStatus } from '../slices/kycSlice';
import { fetchCases } from '../slices/caseSlice';
import { fetchProposals } from '../slices/proposalSlice';

const LawyerDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userProfile } = useSelector((state) => state.profile);
  const authUser = useSelector((state) => state.auth.user);
  const { status } = useSelector((state) => state.kyc);
  const { cases = [], casesLoading } = useSelector((state) => state.case || {});
  const { proposals = [] } = useSelector((state) => state.proposal || {});
  const [showKycModal, setShowKycModal] = useState(false);
  const initialFetchDoneRef = useRef(false);

  const profile = userProfile || authUser;

  /* ===== Initial data fetch ===== */
  useEffect(() => {
    if (!initialFetchDoneRef.current) {
      initialFetchDoneRef.current = true;
      dispatch(fetchUserProfile());
      dispatch(fetchKycStatus());
      dispatch(fetchCases());
      dispatch(fetchProposals());
    }
  }, [dispatch]);

  /* ===== Calculate statistics from real data ===== */
  const activeCases = useMemo(() => {
    return cases.filter(c => ['accepted', 'in_progress'].includes(c.status)).length;
  }, [cases]);

  const pendingProposals = useMemo(() => {
    return proposals.filter(p => p.status === 'pending').length;
  }, [proposals]);

  const acceptedProposals = useMemo(() => {
    return proposals.filter(p => p.status === 'accepted').length;
  }, [proposals]);

  const recentCases = useMemo(() => {
    return [...cases]
      .filter(c => ['accepted', 'in_progress'].includes(c.status))
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5);
  }, [cases]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatStatus = (status) => {
    const map = {
      accepted: "Accepted",
      in_progress: "In Progress",
      completed: "Completed",
      public: "Public",
    };
    return map[status] || status;
  };

  /* ===== KYC Status Helpers ===== */
  const kycStatusValue = status?.status || status?.kyc_status || status?.state;
  
  const isKycApproved = 
    kycStatusValue === 'approved' || userProfile?.is_kyc_verified === true;
  
  const isKycPending = 
    !isKycApproved && 
    ['pending', 'under_review', 'in_review'].includes(kycStatusValue);

  const isKycRejected = kycStatusValue === 'rejected';
  
  const isKycNotSubmitted = !isKycApproved && !isKycPending && !isKycRejected;
  const modalOpen = showKycModal && !isKycApproved;

  /* ===== Poll KYC Status (only until approved) ===== */
  useEffect(() => {
    if (isKycApproved) return;

    const interval = setInterval(() => {
      dispatch(fetchKycStatus());
    }, 15000);

    return () => clearInterval(interval);
  }, [dispatch, isKycApproved]);

  /* ===== Show Toast Once Ever (persists across login/refresh) ===== */
  useEffect(() => {
    if (!isKycApproved) return;
  
    const toastShown = localStorage.getItem('kycApprovedToastShown') === '1';
    
    if (toastShown) return;

    toast.success('Your KYC has been approved.');
    localStorage.setItem('kycApprovedToastShown', '1');
  }, [isKycApproved]);

  /* ===== Lock body scroll when modal is open ===== */
  useEffect(() => {
    document.body.style.overflow = modalOpen ? 'hidden' : 'unset';
    return () => (document.body.style.overflow = 'unset');
  }, [modalOpen]);

  const getCaseStatusClasses = (status) => {
    const statusLower = status?.toLowerCase();
    switch (statusLower) {
      case 'in_progress':
      case 'in progress':
        return 'bg-blue-100 text-blue-700';
      case 'accepted':
        return 'bg-green-100 text-green-700';
      case 'completed':
      case 'closed':
        return 'bg-emerald-100 text-emerald-700';
      case 'pending':
      case 'public':
        return 'bg-yellow-100 text-yellow-700';
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

  // Dynamic stat cards from real data
  const statCards = [
    {
      icon: <Briefcase size={20} />,
      title: 'Active Cases',
      value: activeCases.toString(),
      subtitle: `${acceptedProposals} accepted proposals`,
    },
    {
      icon: <FileText size={20} />,
      title: 'Pending Proposals',
      value: pendingProposals.toString(),
      subtitle: 'Awaiting response',
    },
    {
      icon: <Calendar size={20} />,
      title: 'Appointments',
      value: '0',
      subtitle: 'Coming soon',
    },
    {
      icon: <MessageSquare size={20} />,
      title: 'Messages',
      value: '0',
      subtitle: 'Coming soon',
    },
  ];

  // Remove static data arrays
  const todaySchedule = [];

  return (
    <div className="relative">
      <ToastContainer />
      <div className={`flex min-h-screen bg-gray-100 transition ${modalOpen ? 'filter blur-sm pointer-events-none' : ''}`}>
        <Sidebar />

        <div className="ml-64 flex-1 flex flex-col">
          <div className="sticky top-0 z-30 bg-white">
            <DashHeader
              title={profile ? `Welcome back, ${profile.name?.split(' ')[0]}` : "Welcome back"}
              subtitle="Here's an overview of your practice today"
              notificationCount={0}
            />
          </div>

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

          {isKycRejected && (
            <div className="px-6 pt-4 pb-2">
              <div className="bg-red-50 border border-red-200 rounded-2xl p-5 flex items-start gap-4">
                <div className="shrink-0 w-10 h-10 rounded-xl bg-red-100 border border-red-200 flex items-center justify-center text-red-700">
                  <AlertTriangle size={20} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 flex-wrap mb-1">
                    <p className="text-sm font-semibold text-red-900">KYC Verification Rejected</p>
                    <span className="inline-flex items-center rounded-full bg-red-200 text-red-800 px-3 py-1 text-xs font-semibold">Rejected</span>
                  </div>
                  <p className="text-xs sm:text-sm text-red-800 mb-3">Your KYC verification was not approved. Please review the feedback below and resubmit.</p>
                  
                  {status?.rejection_reason && (
                    <div className="bg-white rounded-xl p-4 border border-red-100 mb-3">
                      <p className="text-xs font-semibold text-red-900 mb-2">Admin Review:</p>
                      <p className="text-sm text-red-800">{status.rejection_reason}</p>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowKycModal(true)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-medium"
                    >
                      Resubmit KYC
                    </button>
                    <p className="text-xs text-red-700">You can resubmit your KYC after making the requested corrections.</p>
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
                  <h2 className="text-lg font-semibold text-[#0F1A3D]">My Active Cases</h2>
                  <button
                    onClick={() => navigate('/lawyercase')}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-[#0F1A3D] text-sm font-semibold transition hover:bg-yellow-500"
                  >
                    View All
                    <ArrowRight size={16} />
                  </button>
                </div>
                
                {casesLoading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-sm text-slate-500 mt-2">Loading cases...</p>
                  </div>
                ) : recentCases.length > 0 ? (
                  <div className="space-y-4">
                    {recentCases.map((caseItem) => (
                      <div
                        key={caseItem.id}
                        onClick={() => navigate(`/lawyercase/${caseItem.id}`)}
                        className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:shadow-md transition cursor-pointer"
                      >
                        {caseItem.client_profile_image ? (
                          <img
                            src={caseItem.client_profile_image}
                            alt={caseItem.client_name}
                            className="w-12 h-12 rounded-full object-cover shrink-0 border-2 border-blue-200"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold flex items-center justify-center shrink-0">
                            {caseItem.client_name?.charAt(0) || 'C'}
                          </div>
                        )}
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-base font-semibold text-[#0F1A3D]">{caseItem.case_title || "Untitled Case"}</h3>
                          </div>
                          <p className="text-sm text-gray-600">Client: {caseItem.client_name || "Unknown"}</p>
                          <p className="text-xs text-gray-400 flex items-center gap-2">
                            <span>{caseItem.case_category || "General"}</span>
                            <span className="text-gray-300">•</span>
                            <span>{formatDate(caseItem.created_at)}</span>
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCaseStatusClasses(caseItem.status)}`}>
                            {formatStatus(caseItem.status)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Briefcase size={48} className="mx-auto text-slate-300 mb-3" />
                    <p className="text-slate-500 mb-2">No active cases yet</p>
                    <button
                      onClick={() => navigate('/lawyerfindcases')}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Find cases to work on
                    </button>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-6">
                <div className="bg-white rounded-lg p-6 shadow">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-[#0F1A3D]">Upcoming Appointments</h2>
                    <button
                      onClick={() => navigate('/lawyerappointment')}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[#0F1A3D] text-xs font-semibold transition hover:bg-yellow-500"
                    >
                      View All
                      <ArrowRight size={14} />
                    </button>
                  </div>
                  
                  {todaySchedule.length > 0 ? (
                    <div className="space-y-4">
                      {todaySchedule.map((appointment) => (
                        <div key={appointment.id} className="flex gap-3 items-center">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
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
                  ) : (
                    <div className="text-center py-8">
                      <Calendar size={40} className="mx-auto text-slate-300 mb-2" />
                      <p className="text-sm text-slate-500">No upcoming appointments</p>
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-lg p-6 shadow">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-[#0F1A3D]">Quick Actions</h2>
                  </div>
                  <div className="space-y-3">
                    <button
                      onClick={() => navigate('/lawyerfindcases')}
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-slate-200 rounded-lg hover:bg-slate-50 hover:shadow-md text-sm font-medium transition"
                    >
                      <Briefcase size={16} />
                      Find Cases
                    </button>
                    <button
                      onClick={() => navigate('/lawyercaserequest')}
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-slate-200 rounded-lg hover:bg-slate-50 hover:shadow-md text-sm font-medium transition"
                    >
                      <FileText size={16} />
                      View Proposals ({pendingProposals})
                    </button>
                  </div>
                </div>
              </div>
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