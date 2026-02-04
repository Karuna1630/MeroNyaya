import React, { useState } from "react";
import Sidebar from "./Sidebar";
import LawyerDashHeader from "./LawyerDashHeader";
import { 
  Calendar, 
  MapPin, 
  Video, 
  Clock, 
  Eye, 
  ChevronLeft, 
  ChevronRight,
  Filter,
  MoreVertical,
  Calendar as CalIcon
} from "lucide-react";

const LawyerAppointment = () => {
  const [activeTab, setActiveTab] = useState("Upcoming");
  const [selectedDate, setSelectedDate] = useState(4);
  const [currentMonth, setCurrentMonth] = useState({ month: 1, year: 2026 }); // February 2026

  const stats = [
    { value: "2", label: "Upcoming", color: "text-blue-500" },
    { value: "1", label: "Pending", color: "text-amber-500" },
    { value: "1", label: "Completed", color: "text-emerald-500" },
    { value: "1", label: "Cancelled", color: "text-red-500" },
  ];

  const appointments = [
    {
      id: 1,
      client: {
        name: "Bishnu Thapa",
        subtitle: "Land Registration",
        image: "https://randomuser.me/api/portraits/men/32.jpg"
      },
      type: "Case Discussion",
      date: "Dec 15, 2024",
      time: "10:00 AM",
      mode: "In-Person",
      status: "Upcoming",
      tab: "Upcoming"
    },
    {
      id: 2,
      client: {
        name: "Suman Rai",
        subtitle: "Insurance Claim",
        image: "https://randomuser.me/api/portraits/men/44.jpg"
      },
      type: "Initial Consultation",
      date: "Dec 17, 2024",
      time: "2:00 PM",
      mode: "Video Call",
      status: "Upcoming",
      tab: "Upcoming"
    },
    {
      id: 3,
      client: {
        name: "Bishnu Thapa",
        subtitle: "Land Registration",
        image: "https://randomuser.me/api/portraits/men/32.jpg"
      },
      type: "Case Discussion",
      date: "Dec 8, 2024",
      time: "10:00 AM",
      mode: "In-Person",
      status: "Cancelled",
      tab: "Cancelled"
    }
  ];

  const filteredAppointments = appointments.filter(apt => apt.tab === activeTab);

  // Calendar logic
  const daysInMonth = new Date(currentMonth.year, currentMonth.month + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.year, currentMonth.month, 1).getDay();
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  
  const calendarDays = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  const handlePrevMonth = () => {
    setCurrentMonth(prev => ({
      month: prev.month === 0 ? 11 : prev.month - 1,
      year: prev.month === 0 ? prev.year - 1 : prev.year
    }));
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => ({
      month: prev.month === 11 ? 0 : prev.month + 1,
      year: prev.month === 11 ? prev.year + 1 : prev.year
    }));
  };

  const getModeIcon = (mode) => {
    switch (mode) {
      case "Video Call":
        return <Video size={16} className="text-blue-500" />;
      case "In-Person":
        return <MapPin size={16} className="text-slate-400" />;
      default:
        return <Clock size={16} className="text-gray-500" />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50/50">
      <Sidebar />

      <main className="flex-1 ml-64 flex flex-col overflow-hidden">
        <LawyerDashHeader
          title="My Consultations"
          subtitle="Welcome back, Adv. Ram Kumar"
          notificationCount={3}
        />

        <div className="flex-1 p-8 overflow-y-auto">
          {/* Section Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-[#0F1A3D]">My Consultations</h1>
            <p className="text-sm text-slate-500 mt-1">Manage your client consultations</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
                <span className={`text-3xl font-bold ${stat.color} mb-1`}>{stat.value}</span>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">{stat.label}</span>
              </div>
            ))}
          </div>

          {/* Main Body Grid */}
          <div className="grid grid-cols-12 gap-8">
            {/* Calendar Sidebar */}
            <div className="col-span-4 space-y-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold text-[#0F1A3D] mb-6 tracking-tight">Calendar</h3>
                
                <div className="flex items-center justify-between mb-6">
                  <button onClick={handlePrevMonth} className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 border border-slate-100 transition">
                    <ChevronLeft size={18} />
                  </button>
                  <h4 className="font-bold text-[#0F1A3D]">{monthNames[currentMonth.month]} {currentMonth.year}</h4>
                  <button onClick={handleNextMonth} className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 border border-slate-100 transition">
                    <ChevronRight size={18} />
                  </button>
                </div>

                <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
                  {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(d => <div key={d}>{d}</div>)}
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map((day, idx) => (
                    <button
                      key={idx}
                      onClick={() => day && setSelectedDate(day)}
                      disabled={!day}
                      className={`aspect-square flex items-center justify-center text-sm rounded-lg font-semibold transition ${
                        day === selectedDate
                          ? "bg-[#0F1A3D] text-white shadow-lg shadow-blue-900/20"
                          : day
                          ? "hover:bg-slate-50 text-slate-600"
                          : "text-transparent"
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Consultations Table Section */}
            <div className="col-span-8 flex flex-col gap-6">
              {/* Tabs */}
              <div className="bg-slate-100/80 p-1.5 rounded-2xl w-full flex">
                {["Upcoming", "Completed", "Cancelled"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
                      activeTab === tab
                        ? "bg-white text-[#0F1A3D] shadow-sm"
                        : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Table Table */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/50 border-b border-slate-100">
                        <th className="px-6 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Client</th>
                        <th className="px-6 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Type</th>
                        <th className="px-6 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Date & Time</th>
                        <th className="px-6 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Mode</th>
                        <th className="px-6 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                        <th className="px-6 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filteredAppointments.length > 0 ? (
                        filteredAppointments.map((apt) => (
                          <tr key={apt.id} className="hover:bg-slate-50/50 transition-colors group">
                            <td className="px-6 py-5">
                              <div className="flex items-center gap-4">
                                <img 
                                  src={apt.client.image} 
                                  alt={apt.client.name} 
                                  className="w-10 h-10 rounded-full object-cover border-2 border-slate-50 shadow-sm"
                                />
                                <div className="flex flex-col">
                                  <span className="font-bold text-[#0F1A3D] text-sm tracking-tight">{apt.client.name}</span>
                                  <span className="text-[11px] font-semibold text-slate-400">{apt.client.subtitle}</span>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-5">
                              <span className="text-sm font-semibold text-slate-700">{apt.type}</span>
                            </td>
                            <td className="px-6 py-5">
                              <div className="flex flex-col">
                                <div className="flex items-center gap-2 text-slate-700">
                                  <CalIcon size={12} className="text-slate-400" />
                                  <span className="text-xs font-bold">{apt.date}</span>
                                </div>
                                <div className="flex items-center gap-2 text-slate-400 mt-1">
                                  <Clock size={12} />
                                  <span className="text-[11px] font-medium">{apt.time}</span>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-5">
                              <div className="flex items-center gap-2">
                                {getModeIcon(apt.mode)}
                                <span className="text-xs font-semibold text-slate-600">{apt.mode}</span>
                              </div>
                            </td>
                            <td className="px-6 py-5">
                              <span 
                                className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                  apt.status === "Upcoming" 
                                    ? "bg-blue-50 text-blue-600 border border-blue-100" 
                                    : apt.status === "Cancelled"
                                    ? "bg-red-50 text-red-600 border border-red-100"
                                    : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                                }`}
                              >
                                {apt.status}
                              </span>
                            </td>
                            <td className="px-6 py-5 text-right">
                              <button className="p-2.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-[#0F1A3D] transition-all duration-200">
                                <Eye size={20} />
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="px-6 py-16 text-center">
                            <div className="flex flex-col items-center gap-2 opacity-40">
                              <Clock size={40} className="text-slate-400 mb-2" />
                              <p className="text-sm font-bold text-slate-500 tracking-tight">No {activeTab.toLowerCase()} consultations</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LawyerAppointment;
