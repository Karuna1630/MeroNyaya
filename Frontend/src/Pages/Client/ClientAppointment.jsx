import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Phone, Video, Clock, Calendar as CalIcon } from "lucide-react";
import Sidebar from "./sidebar";
import DashHeader from "./ClientDashHeader";
import lawyerPic from "../../assets/lawyerpic.jpg";

const ClientAppointment = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date(2025, 11)); // December 2025
  const [activeTab, setActiveTab] = useState("Upcoming");

  // Sample appointment data (add more as needed)
  const appointments = [
    {
      id: 1,
      lawyer: "Advocate Priya Sharma",
      type: "Video Call",
      date: "Dec 10, 2025",
      time: "10:00 AM - 10:30 AM",
      caseTitle: "Property Dispute - Land Registration",
      status: "Scheduled",
      avatar: lawyerPic, // use local asset
    },
    {
      id: 2,
      lawyer: "Advocate Rajesh Thapa",
      type: "Phone Call",
      date: "Nov 25, 2025",
      time: "3:00 PM - 3:30 PM",
      caseTitle: "Business Contract Review",
      status: "Completed",
      avatar: lawyerPic, // use local asset
    },
    {
      id: 3,
      lawyer: "Advocate Priya Sharma",
      type: "Video Call",
      date: "Dec 1, 2025",
      time: "10:00 AM - 10:30 AM",
      caseTitle: "Property Dispute - Land Registration",
      status: "Completed",
      avatar: lawyerPic, // use local asset
    },
    {
      id: 4,
      lawyer: "Advocate Sunita Karki",
      type: "Video Call",
      date: "Dec 12, 2025",
      time: "11:00 AM - 11:30 AM",
      caseTitle: "Family Law - Custody",
      status: "Cancelled",
      avatar: lawyerPic, // use local asset
    },
  ];

  const tabFilters = {
    Upcoming: (apt) => apt.status === "Scheduled",
    Past: (apt) => apt.status === "Completed",
    Cancelled: (apt) => apt.status === "Cancelled",
  };

  const filtered = appointments.filter(tabFilters[activeTab]);

  // Calendar helpers
  const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);
  const days = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  const monthName = currentMonth.toLocaleString("default", { month: "long", year: "numeric" });

  const handlePrevMonth = () =>
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  const handleNextMonth = () =>
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 flex flex-col">
        <div className="sticky top-0 z-50 bg-white">
          <DashHeader title="Appointments" subtitle="Manage your consultation schedule" />
        </div>

        <div className="flex-1 p-8 overflow-y-auto">
          <div className="grid grid-cols-1 xl:grid-cols-[420px_1fr] gap-6">
            {/* Calendar card */}
            <div className="bg-white rounded-3xl shadow-[0_10px_40px_rgba(15,26,61,0.08)] p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-[#0F1A3D]">{monthName}</h3>
                <div className="flex items-center gap-3">
                  <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-gray-100 transition">
                    <ChevronLeft size={18} className="text-gray-600" />
                  </button>
                  <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-gray-100 transition">
                    <ChevronRight size={18} className="text-gray-600" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-2 text-center text-sm text-gray-600 mb-3 font-semibold">
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                  <div key={d} className="py-2">
                    {d}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-2 text-center">
                {days.map((day, idx) => {
                  const isSelected = day === 1; // highlight 1st as in reference
                  return (
                    <div
                      key={idx}
                      className={`py-2 rounded-lg text-sm transition ${
                        day === null
                          ? ""
                          : isSelected
                          ? "bg-[#0F1A3D] text-white font-semibold"
                          : "hover:bg-gray-100 text-[#0F1A3D]"
                      }`}
                    >
                      {day}
                    </div>
                  );
                })}
              </div>

              <button className="mt-8 w-full bg-[#0F1A3D] text-white py-3 rounded-xl font-semibold hover:bg-blue-950 transition flex items-center justify-center gap-2">
                <span className="text-lg">+</span> Book New Appointment
              </button>
            </div>

            {/* Appointments list */}
            <div className="space-y-4">
              {/* Tabs */}
              <div className="flex flex-wrap gap-3 mb-4">
                {["Upcoming", "Past", "Cancelled"].map((tab) => {
                  const count = appointments.filter(tabFilters[tab]).length;
                  const active = activeTab === tab;
                  return (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-4 py-2 rounded-xl font-semibold transition ${
                        active
                          ? "bg-[#0F1A3D] text-white shadow-md"
                          : "bg-gray-100 text-[#0F1A3D] hover:bg-gray-200"
                      }`}
                    >
                      {tab} ({count})
                    </button>
                  );
                })}
              </div>

              {/* Cards */}
              <div className="space-y-4">
                {filtered.map((apt) => (
                  <div
                    key={apt.id}
                    className="bg-white rounded-3xl shadow-[0_12px_40px_rgba(15,26,61,0.08)] p-6 flex flex-col gap-4"
                  >
                    <div className="flex flex-wrap items-center gap-4">
                      <img
                        src={apt.avatar}
                        alt={apt.lawyer}
                        className="w-14 h-14 rounded-full object-cover shrink-0"
                      />
                      <div className="min-w-50">
                        <p className="text-sm text-gray-500">Advocate</p>
                        <h3 className="text-lg font-semibold text-[#0F1A3D]">{apt.lawyer}</h3>
                        <p className="text-sm text-gray-700">{apt.caseTitle}</p>
                      </div>

                      <div className="flex items-center gap-2 text-[#0F1A3D] font-medium">
                        {apt.type === "Video Call" ? (
                          <Video size={18} className="text-[#0F1A3D]" />
                        ) : (
                          <Phone size={18} className="text-[#0F1A3D]" />
                        )}
                        <span>{apt.type}</span>
                      </div>

                      <div className="flex items-center gap-2 text-[#0F1A3D] font-medium">
                        <CalIcon size={18} className="text-[#0F1A3D]" />
                        <span>{apt.date}</span>
                      </div>

                      <div className="flex items-center gap-2 text-[#0F1A3D] font-medium">
                        <Clock size={18} className="text-[#0F1A3D]" />
                        <span>{apt.time}</span>
                      </div>

                      <div className="ml-auto">
                        <span
                          className={`px-4 py-2 rounded-full text-sm font-semibold ${
                            apt.status === "Scheduled"
                              ? "bg-blue-100 text-[#0F1A3D]"
                              : apt.status === "Completed"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-600"
                          }`}
                        >
                          {apt.status}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      {apt.status === "Scheduled" && (
                        <>
                          <button className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[#0F1A3D] hover:bg-blue-950 transition">
                            Reschedule
                          </button>
                          <button className="px-4 py-2 rounded-lg text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition">
                            Cancel
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}

                {filtered.length === 0 && (
                  <div className="text-center text-gray-500 py-10 bg-white rounded-2xl shadow-sm">
                    No appointments in this tab.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ClientAppointment;