import React, { useState } from "react";
import { Calendar, MapPin, Video, Clock, Check, X, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import Sidebar from "./Sidebar";
import LawyerDashHeader from "./LawyerDashHeader";

const LawyerAppointment = () => {
  const [activeTab, setActiveTab] = useState("Upcoming");
  const [selectedDate, setSelectedDate] = useState(4);
  const [currentMonth, setCurrentMonth] = useState({ month: 0, year: 2026 }); // January 2026

  const stats = [
    { value: "4", label: "Upcoming" },
    { value: "1", label: "Pending" },
    { value: "2", label: "Today" },
    { value: "1", label: "Completed" },
  ];

  const tabs = ["Upcoming", "Pending", "Past"];

  const appointments = [
    {
      id: 1,
      clientName: "Sita Sharma",
      status: "confirmed",
      type: "Case Discussion",
      date: "Dec 15, 2024",
      time: "10:00 AM",
      duration: "45 min",
      location: "Office - Babar Mahal",
      locationType: "office",
      caseRef: "Property Dispute (CASE-2024-001)",
      avatar: "",
      tab: "Upcoming",
    },
    {
      id: 2,
      clientName: "New Client",
      status: "pending",
      type: "Initial Consultation",
      date: "Dec 15, 2024",
      time: "2:00 PM",
      duration: "30 min",
      location: "Video Call",
      locationType: "video",
      caseRef: null,
      avatar: "NC",
      tab: "Upcoming",
    },
    {
      id: 3,
      clientName: "Hari Prasad",
      status: "confirmed",
      type: "Document Review",
      date: "Dec 16, 2024",
      time: "11:00 AM",
      duration: "1 hour",
      location: "Office - Babar Mahal",
      locationType: "office",
      caseRef: "Contract Breach (CASE-2024-002)",
      avatar: "",
      tab: "Upcoming",
    },
  ];

  const filteredAppointments = appointments.filter(apt => apt.tab === activeTab);

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

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

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 ml-64">
        <LawyerDashHeader
          title="Appointments"
          subtitle="Welcome back, Adv. Ram Kumar"
          notificationCount={3}
        />

        <div className="p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-xl font-bold text-[#0F1A3D]">Appointments</h3>
              <p className="text-sm text-gray-500">Manage your client consultations</p>
            </div>
           
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white rounded-xl p-5 shadow-md text-center">
                <h4 className="text-4xl font-bold text-[#0F1A3D] mb-1">{stat.value}</h4>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-3 gap-6">
            {/* Calendar Section */}
            <div className="col-span-1 bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-[#0F1A3D] mb-4">Calendar</h3>
              
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-4">
                <button onClick={handlePrevMonth} className="p-1 hover:bg-gray-100 rounded">
                  <ChevronLeft size={20} />
                </button>
                <h4 className="font-semibold">{monthNames[currentMonth.month]} {currentMonth.year}</h4>
                <button onClick={handleNextMonth} className="p-1 hover:bg-gray-100 rounded">
                  <ChevronRight size={20} />
                </button>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-2 mb-2">
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                  <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                    {day}
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-7 gap-2">
                {calendarDays.map((day, index) => (
                  <button
                    key={index}
                    onClick={() => day && setSelectedDate(day)}
                    disabled={!day}
                    className={`aspect-square flex items-center justify-center text-sm rounded-lg transition ${
                      day === selectedDate
                        ? "bg-[#0F1A3D] text-white font-semibold"
                        : day
                        ? "hover:bg-gray-100 text-gray-700"
                        : "text-gray-300"
                    }`}
                  >
                    {day || ""}
                  </button>
                ))}
              </div>


            </div>

            {/* Right Section - Status and Appointments */}
            <div className="col-span-2 space-y-6">
              {/* Status Section */}
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="flex border-b border-gray-200">
                  {tabs.map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`flex-1 py-4 text-center font-medium text-sm transition ${
                        activeTab === tab
                          ? "border-b-2 border-[#0F1A3D] text-[#0F1A3D] -mb-0.5"
                          : "text-gray-600 hover:text-gray-900 bg-gray-50"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* Appointments Details Section */}
              <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
                {filteredAppointments.map((appointment) => (
                  <div key={appointment.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                    <div className="flex gap-4">
                      {/* Avatar */}
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center font-bold flex-shrink-0">
                        {appointment.avatar || appointment.clientName.charAt(0)}
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-[#0F1A3D]">{appointment.clientName}</h4>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(appointment.status)}`}>
                              {appointment.status}
                            </span>
                          </div>
                          {appointment.status === "pending" && (
                            <div className="flex gap-2">
                              <button className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center hover:bg-green-600 transition">
                                <Check size={16} />
                              </button>
                              <button className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition">
                                <X size={16} />
                              </button>
                            </div>
                          )}
                        </div>

                        <p className="font-medium text-gray-900 mb-2">{appointment.type}</p>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-2">
                          <div className="flex items-center gap-1">
                            <Calendar size={14} />
                            <span>{appointment.date}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock size={14} />
                            <span>{appointment.time} ({appointment.duration})</span>
                          </div>
                          <div className="flex items-center gap-1">
                            {appointment.locationType === "video" ? (
                              <Video size={14} />
                            ) : (
                              <MapPin size={14} />
                            )}
                            <span>{appointment.location}</span>
                          </div>
                        </div>

                        {appointment.caseRef && (
                          <p className="text-xs text-gray-500">Case: {appointment.caseRef}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LawyerAppointment;