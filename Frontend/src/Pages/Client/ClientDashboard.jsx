import React from "react";
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
  Bell,
  User,
} from "lucide-react";

const ClientDashboard = () => {
  const recentCases = [
    {
      title: "Property Dispute - Land Registration",
      status: "In Progress",
      date: "Dec 1, 2025",
    },
    {
      title: "Divorce Proceedings",
      status: "Under Review",
      date: "Nov 28, 2025",
    },
    {
      title: "Business Contract Review",
      status: "Completed",
      date: "Nov 15, 2025",
    },
    {
      title: "Family Law - Inheritance Matter",
      status: "Under Review",
      date: "Nov 14, 2025",
    },
  ];

  const notifications = [
    {
      title: "Case Update",
      description: "Adv. Payal Sharma uploaded new documents to Case",
      time: "2 hours ago",
    },
    {
      title: "Appointment Reminder",
      description:
        "Your appointment with Adv. Rajesh Sharma is tomorrow at 10:00 AM [in person]",
      time: "3 hours ago",
    },
    {
      title: "Payment Confirmation",
      description:
        "Your payment with Adv. Prabhat Bohara of Rs.5000 has been successfully completed",
      time: "6 hours ago",
    },
  ];

  const upcomingAppointments = [
    {
      lawyer: "Advocate Bishar Ghilwars",
      type: "Phone Call",
      date: "Dec 5, 2025",
      time: "10:00 AM",
    },
    {
      lawyer: "Advocate Pukar Bohara",
      type: "Phone Call",
      date: "Feb 5, 2025",
      time: "10:00 AM",
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "In Progress":
        return "bg-blue-100 text-blue-700";
      case "Under Review":
        return "bg-amber-100 text-amber-700";
      case "Completed":
        return "bg-emerald-100 text-emerald-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col">
        {/* TOP HEADER - STICKY */}
        <div className="sticky top-0 z-50 bg-white">
          <DashHeader
            title="Welcome back, Karuna!"
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
              value="4"
              subtitle="2 New cases"
            />
            <StatCard
              icon={<Calendar size={24} />}
              title="Appointments"
              value="2"
              subtitle="Upcoming"
            />
            <StatCard
              icon={<MessageSquare size={24} />}
              title="Messages"
              value="12"
              subtitle="3 Unread"
            />
            <StatCard
              icon={<CreditCard size={24} />}
              title="Total Spent"
              value="Rs. 25,000"
              subtitle="This year"
            />
          </div>

          {/* GRID SECTION */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
            {/* RECENT CASES */}
            <div className="xl:col-span-2 bg-white rounded-xl p-6  shadow-md border border-slate-200">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-semibold text-lg text-slate-900">
                  Recent Cases
                </h3>
                <span className="text-sm text-amber-500 cursor-pointer hover:text-amber-600 font-medium">
                  View All
                </span>
              </div>

              <div className="space-y-3">
                {recentCases.map((caseItem, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 hover:shadow-md transition cursor-pointer"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="p-3 bg-blue-100 rounded-lg">
                        <FileText size={20} className="text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {caseItem.title}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          Advocate Name
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
                          {caseItem.status}
                        </span>
                        <p className="text-xs text-slate-500 mt-2">
                          {caseItem.date}
                        </p>
                      </div>
                      <ChevronRight size={18} className="text-slate-400" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* NOTIFICATIONS */}
            <div className="bg-white rounded-2xl p-6  shadow-md border border-slate-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-lg text-slate-900">
                  Notifications
                </h3>
                <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded font-semibold">
                  3 New
                </span>
              </div>

              <div className="space-y-4">
                {notifications.map((notif, i) => (
                  <div
                    key={i}
                    className="pb-4 border-b border-slate-200 last:border-none hover:bg-slate-50 p-2 rounded transition"
                  >
                    <p className="text-sm font-medium text-slate-900">
                      {notif.title}
                    </p>
                    <p className="text-xs text-slate-600 mt-1">
                      {notif.description}
                    </p>
                    <p className="text-xs text-slate-400 mt-2">{notif.time}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* UPCOMING APPOINTMENTS & QUICK ACTIONS */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* UPCOMING APPOINTMENTS */}
            <div className="xl:col-span-2 bg-white rounded-xl p-6  shadow-md border border-slate-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-lg text-slate-900">
                  Upcoming Appointments
                </h3>
                <span className="text-sm text-amber-500 cursor-pointer hover:text-amber-600 font-medium">
                  View All
                </span>
              </div>

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
            </div>

            {/* QUICK ACTIONS */}
            <div className="bg-white rounded-2xl p-6  shadow-md border border-slate-200">
              <h3 className="font-semibold text-lg text-slate-900 mb-4">
                Quick Actions
              </h3>

              <div className="space-y-3">
                <button className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-slate-200 rounded-lg hover:bg-slate-50 hover:shadow-md text-sm font-medium transition">
                  <FileText size={16} />
                  File a Lawyer
                </button>
                <button className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-slate-200 rounded-lg hover:bg-slate-50 hover:shadow-md text-sm font-medium transition">
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
      </main>
    </div>
  );
};

export default ClientDashboard;
