import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
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

const ClientDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { user } = useSelector((state) => state.auth);
  const { cases = [], casesLoading } = useSelector((state) => state.case || {});
  
  useEffect(() => {
    dispatch(fetchCases());
  }, [dispatch]);

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

  // Upcoming appointments - placeholder for now
  const upcomingAppointments = [];

  const formatStatus = (status) => {
    const map = {
      draft: "Draft",
      public: "Public",
      proposals_received: "Proposals Received",
      accepted: "Accepted",
      in_progress: "In Progress",
      completed: "Completed",
      cancelled: "Cancelled",
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
            title={`Welcome back, ${user?.name?.split(' ')[0] || 'User'}!`}
            subtitle="Here's an overview of your legal matters and upcoming appointments"
          />
        </div>

        {/* MAIN BODY CONTENT - SCROLLABLE */}
        <div className="flex-1 p-8 overflow-y-auto">
          {/* STATS */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
            <StatCard
              icon={<Briefcase size={24} />}
              title="Active Cases"
              value={activeCases}
              subtitle={`${newCases} New cases`}
            />
            <StatCard
              icon={<Calendar size={24} />}
              title="Appointments"
              value={upcomingAppointments.length}
              subtitle="Upcoming"
            />
            <StatCard
              icon={<MessageSquare size={24} />}
              title="Messages"
              value="0"
              subtitle="Coming soon"
            />
            <StatCard
              icon={<CreditCard size={24} />}
              title="Total Cases"
              value={cases.length}
              subtitle="All time"
            />
          </div>

          {/* SINGLE COLUMN LAYOUT - Recent Cases Full Width */}
          <div className="space-y-6">
            {/* RECENT CASES */}
            <div className="bg-white rounded-xl p-6 shadow-md border border-slate-200">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-semibold text-lg text-slate-900">
                  Recent Cases
                </h3>
                <button
                  onClick={() => navigate('/clientcase')}
                  className="text-sm text-amber-500 cursor-pointer hover:text-amber-600 font-medium"
                >
                  View All
                </button>
              </div>

              {casesLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-sm text-slate-500 mt-2">Loading cases...</p>
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
                            {caseItem.case_title || "Untitled Case"}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            {caseItem.lawyer_name || "No lawyer assigned"}
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
                  <p className="text-slate-500 mb-2">No cases yet</p>
                  <button
                    onClick={() => navigate('/client/create-case')}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Create your first case
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
                    Upcoming Appointments
                  </h3>
                  <button
                    onClick={() => navigate('/clientappointment')}
                    className="text-sm text-amber-500 cursor-pointer hover:text-amber-600 font-medium"
                  >
                    View All
                  </button>
                </div>

                {upcomingAppointments.length > 0 ? (
                  <div className="space-y-3">
                    {upcomingAppointments.map((apt, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 hover:shadow-md cursor-pointer transition"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-3 bg-blue-100 rounded-lg">
                            <Clock size={20} className="text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-900">
                              {apt.lawyer}
                            </p>
                            <p className="text-xs text-slate-500">{apt.type}</p>
                            <p className="text-xs text-slate-500 mt-1">
                              {apt.date} at {apt.time}
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
                  <button
                    onClick={() => navigate('/clientappointment')}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-slate-200 rounded-lg hover:bg-slate-50 hover:shadow-md text-sm font-medium transition"
                  >
                    <Calendar size={16} />
                    Book Appointments
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
