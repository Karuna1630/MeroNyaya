import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Sidebar from "./sidebar";
import StatCard from "./statcard";
import DashHeader from "./ClientDashHeader";
import {
  Briefcase,
  Calendar,
  MessageSquare,
  CreditCard,
  ChevronRight,
  FileText,
  Clock,
} from "lucide-react";
import { fetchCases } from "../slices/caseSlice";
import { fetchMyConsultations } from "../slices/consultationSlice";
import { getConversations } from "../../axios/chatAPI";

const ClientDashboard = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { user } = useSelector((state) => state.auth);
  const { cases = [], casesLoading } = useSelector((state) => state.case || {});
  const { consultations = [] } = useSelector((state) => state.consultation || {});
  const [messageStats, setMessageStats] = useState({ recentCount: 0, unreadCount: 0 });
  
  useEffect(() => {
    dispatch(fetchCases());
    dispatch(fetchMyConsultations());
  }, [dispatch]);

  useEffect(() => {
    let isMounted = true;

    const loadConversationStats = async () => {
      try {
        const response = await getConversations();
        const conversations = Array.isArray(response.data) ? response.data : [];

        if (!isMounted) return;

        const recentCount = conversations.filter((item) => item?.last_message).length;
        const unreadCount = conversations.reduce(
          (sum, item) => sum + (Number(item?.unread_count) || 0),
          0
        );

        setMessageStats({ recentCount, unreadCount });
      } catch {
        if (!isMounted) return;
        setMessageStats({ recentCount: 0, unreadCount: 0 });
      }
    };

    loadConversationStats();

    return () => {
      isMounted = false;
    };
  }, []);

  // Calculate statistics
  const activeCases = useMemo(() => {
    return cases.filter(c => ['public', 'proposals_received', 'accepted', 'in_progress'].includes(c.status)).length;
  }, [cases]);
  // Calculate new cases in the last 7 days for the subtitle of the Active Cases stat card
  const newCases = useMemo(() => {
    const recentDate = new Date();
    recentDate.setDate(recentDate.getDate() - 7);
    return cases.filter(c => new Date(c.created_at) > recentDate).length;
  }, [cases]);

  // Recent cases (last 4)
  const recentCases = useMemo(() => {
    return [...cases]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 4);
  }, [cases]);

  // Upcoming appointments from real upcoming data (uncapped for stat card)
  const upcomingAppointmentsAll = useMemo(() => {
    const now = new Date();

    const toAppointmentDateTime = (appointment) => {
      const aptDate = appointment.scheduled_date || appointment.requested_day;
      const aptTime = appointment.scheduled_time || appointment.requested_time;

      if (!aptDate || !aptTime) return null;

      const parsed = new Date(`${aptDate} ${aptTime}`);
      return Number.isNaN(parsed.getTime()) ? null : parsed;
    };

    return consultations
      .filter((apt) => ["accepted", "confirmed", "pending"].includes((apt.status || "").toLowerCase()))
      .filter((apt) => {
        const appointmentDateTime = toAppointmentDateTime(apt);
        if (!appointmentDateTime) return true;
        return appointmentDateTime >= now;
      })
      .sort((a, b) => {
        const dateA = toAppointmentDateTime(a);
        const dateB = toAppointmentDateTime(b);

        if (dateA && dateB) return dateA - dateB;
        if (dateA) return -1;
        if (dateB) return 1;
        return 0;
      })
      .map((apt) => {
        let reminder = null;
        const aptDate = apt.scheduled_date || apt.requested_day;
        const aptTime = apt.scheduled_time || apt.requested_time;
        
        if (aptDate && aptTime) {
          const appointmentDateTime = new Date(`${aptDate} ${aptTime}`);
          if (!isNaN(appointmentDateTime.getTime())) {
            const diffInMs = appointmentDateTime - now;
            
            if (diffInMs > 0 && diffInMs <= 24 * 60 * 60 * 1000) {
              const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
              const diffInMinutes = Math.floor((diffInMs % (1000 * 60 * 60)) / (1000 * 60));
              if (diffInHours > 0) {
                reminder = `In ${diffInHours} hour${diffInHours > 1 ? 's' : ''}`;
              } else if (diffInMinutes > 0) {
                reminder = `In ${diffInMinutes} min${diffInMinutes !== 1 ? 's' : ''}`;
              } else {
                reminder = `Now`;
              }
            }
          }
        }

        return {
          id: apt.id,
          lawyer: apt.lawyer?.name || "Lawyer",
          type: apt.mode === "in_person" ? "In-Person" : "Video Call",
          date: aptDate,
          time: aptTime,
          status: apt.status,
          reminder: reminder,
        };
      });
  }, [consultations]);

  const upcomingAppointments = useMemo(
    () => upcomingAppointmentsAll.slice(0, 4),
    [upcomingAppointmentsAll]
  );

  const formatStatus = (status) => {
    const map = {
      draft: t('cases.draft'),
      public: t('cases.public'),
      proposals_received: t('cases.proposalsReceived'),
      accepted: t('cases.accepted'),
      in_progress: t('cases.inProgress'),
      completed: t('cases.completed'),
      cancelled: t('cases.cancelled'),
    };
    return map[status] || status;
  };

  const getStatusColor = (status) => {
    const statusLower = status?.toLowerCase();
    switch (statusLower) {
      case "in_progress":
      case "in progress":
        return "bg-blue-100 text-blue-700";
      case "proposals_received":
      case "proposals received":
      case "public":
        return "bg-amber-100 text-amber-700";
      case "completed":
        return "bg-emerald-100 text-emerald-700";
      case "accepted":
        return "bg-green-100 text-green-700";
      case "draft":
        return "bg-gray-100 text-gray-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // Function to format dates in a user-friendly way for display in the recent cases list
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col">
        {/* TOP HEADER - STICKY */}
        <div className="sticky top-0 z-50 bg-white">
          <DashHeader
            title={`${t('dashboard.welcomeBack')}, ${user?.name?.split(' ')[0] || 'User'}!`}
            subtitle={t('dashboard.overviewSubtitle')}
          />
        </div>

        {/* MAIN BODY CONTENT - SCROLLABLE */}
        <div className="flex-1 p-8 overflow-y-auto">
          {/* STATS */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
            <StatCard
              icon={<Briefcase size={24} />}
              title={t('dashboard.activeCases')}
              value={activeCases}
              subtitle={`${newCases} ${t('dashboard.newCases')}`}
              color="blue"
            />
            <StatCard
              icon={<Calendar size={24} />}
              title={t('dashboard.appointments')}
              value={upcomingAppointmentsAll.length}
              subtitle={t('dashboard.upcomingCount')}
              color="violet"
            />
            <StatCard
              icon={<MessageSquare size={24} />}
              title={t('dashboard.messagesCard')}
              value={messageStats.recentCount}
              subtitle={
                messageStats.unreadCount > 0
                  ? `${messageStats.unreadCount} ${t('dashboard.unread')}`
                  : t('dashboard.recentMessages')
              }
              color="cyan"
            />
            <StatCard
              icon={<CreditCard size={24} />}
              title={t('dashboard.totalCases')}
              value={cases.length}
              subtitle={t('dashboard.allTime')}
              color="emerald"
            />
          </div>

          {/* SINGLE COLUMN LAYOUT - Recent Cases Full Width */}
          <div className="space-y-6">
            {/* RECENT CASES */}
            <div className="bg-white rounded-xl p-6 shadow-md border border-slate-200">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-semibold text-lg text-slate-900">
                  {t('dashboard.recentCases')}
                </h3>
                <button
                  onClick={() => navigate('/clientcase')}
                  className="text-sm text-amber-500 cursor-pointer hover:text-amber-600 font-medium"
                >
                  {t('dashboard.viewAll')}
                </button>
              </div>

              {casesLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-sm text-slate-500 mt-2">{t('dashboard.loadingCases')}</p>
                </div>
              ) : recentCases.length > 0 ? (
                <div className="space-y-3">
                  {recentCases.map((caseItem) => (
                    <div
                      key={caseItem.id}
                      onClick={() => navigate(`/client/case/${caseItem.id}`)}
                      className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 hover:shadow-md transition cursor-pointer"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="p-3 bg-blue-100 rounded-lg">
                          <FileText size={20} className="text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {caseItem.case_title || t('dashboard.untitledCase')}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            {caseItem.lawyer_name || t('dashboard.noLawyerAssigned')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span
                            className={`text-xs font-semibold px-3 py-1.5 rounded-full block ${getStatusColor(
                              caseItem.status
                            )}`}
                          >
                            {formatStatus(caseItem.status)}
                          </span>
                          <p className="text-xs text-slate-500 mt-2">
                            {formatDate(caseItem.created_at)}
                          </p>
                        </div>
                        <ChevronRight size={18} className="text-slate-400" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText size={48} className="mx-auto text-slate-300 mb-3" />
                  <p className="text-slate-500 mb-2">{t('dashboard.noCasesYet')}</p>
                  <button
                    onClick={() => navigate('/client/create-case')}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    {t('dashboard.createFirstCase')}
                  </button>
                </div>
              )}
            </div>
            {/* UPCOMING APPOINTMENTS & QUICK ACTIONS */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* UPCOMING APPOINTMENTS */}
              <div className="bg-white rounded-xl p-6 shadow-md border border-slate-200">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-lg text-slate-900">
                    {t('dashboard.upcomingAppointments')}
                  </h3>
                  <button
                    onClick={() => navigate('/clientappointment')}
                    className="text-sm text-amber-500 cursor-pointer hover:text-amber-600 font-medium"
                  >
                    {t('dashboard.viewAll')}
                  </button>
                </div>

                {upcomingAppointments.length > 0 ? (
                  <div className="space-y-3">
                    {upcomingAppointments.map((apt, i) => (
                      <div
                        key={apt.id || i}
                        onClick={() => navigate('/clientappointment')}
                        className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 hover:shadow-md cursor-pointer transition"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-3 rounded-lg ${apt.status === 'accepted' ? 'bg-green-100' : 'bg-blue-100'}`}>
                            <Clock size={20} className={apt.status === 'accepted' ? 'text-green-600' : 'text-blue-600'} />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-900">
                              {apt.lawyer}
                            </p>
                            <p className="text-xs text-slate-500">
                              {apt.type === 'In-Person API' ? 'In-Person' : apt.type} 
                              <span className={`ml-2 px-1.5 py-0.5 rounded text-[10px] font-medium uppercase ${apt.status === 'accepted' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                {apt.status}
                              </span>
                            </p>
                            <p className="text-xs text-slate-500 mt-1 flex items-center">
                              {apt.date} at {apt.time}
                              {apt.reminder && (
                                <span className="ml-2 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold animate-pulse flex items-center gap-1">
                                  <Clock size={10} />
                                  {apt.reminder}
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                        <ChevronRight size={18} className="text-slate-400" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Calendar size={48} className="mx-auto text-slate-300 mb-3" />
                    <p className="text-slate-500">No upcoming appointments</p>
                  </div>
                )}
              </div>

              {/* QUICK ACTIONS */}
              <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-200">
                <h3 className="font-semibold text-lg text-slate-900 mb-4">
                  Quick Actions
                </h3>

                <div className="space-y-3">
                  <button
                    onClick={() => navigate('/client/create-case')}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-slate-200 rounded-lg hover:bg-slate-50 hover:shadow-md text-sm font-medium transition"
                  >
                    <FileText size={16} />
                    Create New Case
                  </button>
                  <button
                    onClick={() => navigate('/client/findlawyers')}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-slate-200 rounded-lg hover:bg-slate-50 hover:shadow-md text-sm font-medium transition"
                  >
                    <Briefcase size={16} />
                    Find Lawyers
                  </button>
                </div>

                {/* PLATFORM TIP */}
                <div className="mt-6 p-4 rounded-xl border border-amber-200 bg-linear-to-br from-amber-50 to-amber-100 shadow-sm">
                  <p className="text-xs font-semibold text-amber-900 mb-2">
                    💡 Platform tip
                  </p>
                  <p className="text-xs text-amber-800">
                    Keep your case documents organized by uploading them
                    regularly. This helps your lawyer provide better service.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ClientDashboard;
