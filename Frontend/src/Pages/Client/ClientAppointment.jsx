import React, { useState } from "react";
import Sidebar from "./sidebar";
import DashHeader from "./ClientDashHeader";
import { 
  Calendar, 
  Video, 
  Phone, 
  MapPin, 
  Eye, 
  MessageSquare, 
  RotateCw, 
  Clock,
  Play
} from "lucide-react";

const ClientAppointment = () => {
  const [activeTab, setActiveTab] = useState("Upcoming");

  const appointments = [
    {
      id: 1,
      lawyer: {
        name: "Advocate Priya Sharma",
        image: "https://randomuser.me/api/portraits/women/45.jpg"
      },
      caseReference: {
        id: "CASE-2025-001",
        title: "Property Dispute"
      },
      date: "Dec 15, 2025",
      time: "10:00 AM",
      mode: "Video Call",
      status: "Upcoming",
      payment: "Paid"
    },
    {
      id: 2,
      lawyer: {
        name: "Advocate Sita Karki",
        image: "https://randomuser.me/api/portraits/women/32.jpg"
      },
      caseReference: {
        id: "CASE-2025-003",
        title: "Divorce Proceedings"
      },
      date: "Dec 20, 2025",
      time: "11:00 AM",
      mode: "Phone Call",
      status: "Upcoming",
      payment: "Paid"
    },
    {
      id: 3,
      lawyer: {
        name: "Advocate Hari Prasad",
        image: "https://randomuser.me/api/portraits/men/22.jpg"
      },
      caseReference: {
        id: "CASE-2025-007",
        title: "Criminal Defense"
      },
      date: "Dec 25, 2025",
      time: "3:00 PM",
      mode: "In-Person",
      status: "Upcoming",
      payment: "Paid"
    }
  ];

  const completedAppointments = [
    {
      id: 4,
      lawyer: {
        name: "Advocate Rajesh Thapa",
        image: "https://randomuser.me/api/portraits/men/32.jpg"
      },
      caseReference: {
        id: "CASE-2025-002",
        title: "Business Contract"
      },
      date: "Nov 25, 2025",
      time: "3:00 PM",
      mode: "In-Person",
      status: "Completed",
      payment: "Paid"
    }
  ];

  const displayAppointments = activeTab === "Upcoming" ? appointments : completedAppointments;

  const getModeIcon = (mode) => {
    switch (mode) {
      case "Video Call":
        return <Video size={16} className="text-blue-500" />;
      case "Phone Call":
        return <Phone size={16} className="text-teal-500" />;
      case "In-Person":
        return <MapPin size={16} className="text-indigo-500" />;
      default:
        return <Clock size={16} className="text-gray-500" />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-hidden">
        <DashHeader 
          title="Appointments" 
          subtitle="Your confirmed consultation appointments" 
        />

        <div className="flex-1 p-8 overflow-y-auto">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
              <span className="text-4xl font-bold text-emerald-500 mb-1">3</span>
              <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">Upcoming</span>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
              <span className="text-4xl font-bold text-slate-700 mb-1">2</span>
              <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">Completed</span>
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-6">
            <div className="flex bg-slate-100 p-1 rounded-xl w-fit">
              {["Upcoming", "Completed"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-8 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    activeTab === tab
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-200">
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Lawyer</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Case Reference</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date & Time</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Mode</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Payment</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {displayAppointments.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <img 
                            src={item.lawyer.image} 
                            alt={item.lawyer.name} 
                            className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-sm"
                          />
                          <span className="font-semibold text-slate-900 text-sm tracking-tight">{item.lawyer.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-[#0F1A3D]">{item.caseReference.id}</span>
                          <span className="text-xs text-slate-500 font-medium">{item.caseReference.title}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2 text-slate-700">
                            <Calendar size={14} className="text-slate-400" />
                            <span className="text-sm font-medium">{item.date}</span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-500 mt-1">
                            <Clock size={14} className="text-slate-400" />
                            <span className="text-xs">{item.time}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-full w-fit border border-slate-100 shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)]">
                          {getModeIcon(item.mode)}
                          <span className="text-xs font-semibold text-slate-700">{item.mode}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span 
                          className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase border ${
                            item.status === "Upcoming" 
                              ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                              : "bg-slate-100 text-slate-600 border-slate-200"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase">
                          {item.payment}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-end gap-2">
                          <button className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-700 transition-all duration-200">
                            <Eye size={18} />
                          </button>
                          <button className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-700 transition-all duration-200">
                            <MessageSquare size={18} />
                          </button>
                          {item.mode === "Video Call" && activeTab === "Upcoming" && (
                            <button className="flex items-center gap-2 bg-[#0F1A3D] text-white px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-blue-950 transition-all duration-200 shadow-md">
                              <Play size={14} fill="white" />
                              Join
                            </button>
                          )}
                          {activeTab === "Upcoming" && (
                            <button className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-700 transition-all duration-200">
                              <RotateCw size={18} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {displayAppointments.length === 0 && (
                    <tr>
                      <td colSpan="7" className="px-6 py-12 text-center text-slate-500">
                        No {activeTab.toLowerCase()} appointments found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ClientAppointment;
