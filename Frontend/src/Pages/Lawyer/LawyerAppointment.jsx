import React, { useState, useEffect, useMemo, useRef } from "react";
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
  Calendar as CalIcon,
  X,
  Check,
  AlertCircle
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMyConsultations } from "../slices/consultationSlice";
import axiosInstance from "../../axios/axiosinstance";

const LawyerAppointment = () => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("Pending");
  const [selectedDate, setSelectedDate] = useState(5);
  const [currentMonth, setCurrentMonth] = useState({ month: 1, year: 2026 }); // February 2026
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [consultationToReject, setConsultationToReject] = useState(null);
  const [acceptFormData, setAcceptFormData] = useState({
    scheduled_date: "",
    scheduled_time: "",
    meeting_link: ""
  });
  const [processingId, setProcessingId] = useState(null);
  const initialFetchDoneRef = useRef(false);

  const { consultations = [] } = useSelector(
    (state) => state.consultation || {}
  );

  // Fetch consultations on component mount
  useEffect(() => {
    if (!initialFetchDoneRef.current) {
      initialFetchDoneRef.current = true;
      dispatch(fetchMyConsultations());
    }
  }, [dispatch]);

  const stats = useMemo(() => {
    const pending = consultations.filter(c => c.status === "requested").length;
    const accepted = consultations.filter(c => c.status === "accepted").length;
    const rejected = consultations.filter(c => c.status === "rejected").length;
    return [
      { value: pending, label: "Pending", color: "text-amber-500" },
      { value: accepted, label: "Accepted", color: "text-green-500" },
      { value: rejected, label: "Rejected", color: "text-red-500" },
    ];
  }, [consultations]);

  const filteredConsultations = useMemo(() => {
    if (activeTab === "Pending") {
      return consultations.filter(c => c.status === "requested");
    } else if (activeTab === "Accepted") {
      return consultations.filter(c => c.status === "accepted");
    }
    return consultations.filter(c => c.status === "rejected");
  }, [activeTab, consultations]);
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
      case "video":
        return <Video size={16} className="text-blue-500" />;
      case "in_person":
        return <MapPin size={16} className="text-slate-400" />;
      default:
        return <Clock size={16} className="text-gray-500" />;
    }
  };

  const getModeLabel = (mode) => {
    switch (mode) {
      case "video":
        return "Video Call";
      case "in_person":
        return "In-Person";
      default:
        return "N/A";
    }
  };

  const getProfileImageUrl = (profileImage, clientName = "Client") => {
    return profileImage || `https://ui-avatars.com/api/?name=${clientName}&background=0F1A3D&color=fff`;
  };

  const handleAcceptClick = (consultation) => {
    setSelectedConsultation(consultation);
    setAcceptFormData({
      scheduled_date: "",
      scheduled_time: "",
      meeting_link: ""
    });
    setShowAcceptModal(true);
  };

  const handleRejectClick = (consultation) => {
    setConsultationToReject(consultation);
    setShowRejectModal(true);
  };

  const handleConfirmReject = async () => {
    if (!consultationToReject) return;
    
    setProcessingId(consultationToReject.id);
    try {
      await axiosInstance.post(`/consultations/${consultationToReject.id}/reject/`);
      dispatch(fetchMyConsultations());
      setShowRejectModal(false);
      setConsultationToReject(null);
    } catch (error) {
      console.error("Error rejecting consultation:", error);
    } finally {
      setProcessingId(null);
    }
  };

  const handleSubmitAccept = async () => {
    if (!selectedConsultation) return;

    // For video consultations, require all fields
    if (selectedConsultation.mode === "video") {
      if (!acceptFormData.scheduled_date || !acceptFormData.scheduled_time || !acceptFormData.meeting_link) {
        alert("Please fill in all fields for video consultations");
        return;
      }
    }

    setProcessingId(selectedConsultation.id);
    try {
      // For video consultations, update the scheduled details
      if (selectedConsultation.mode === "video") {
        const data = {
          scheduled_date: acceptFormData.scheduled_date,
          scheduled_time: acceptFormData.scheduled_time,
          meeting_link: acceptFormData.meeting_link
        };
        await axiosInstance.patch(`/consultations/${selectedConsultation.id}/`, data);
      }
      
      // Then accept the consultation
      await axiosInstance.post(`/consultations/${selectedConsultation.id}/accept/`);
      dispatch(fetchMyConsultations());
      setShowAcceptModal(false);
      setSelectedConsultation(null);
    } catch (error) {
      console.error("Error accepting consultation:", error.response?.data || error.message);
      alert("Error accepting consultation: " + (error.response?.data?.detail || error.message));
    } finally {
      setProcessingId(null);
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
          <div className="grid grid-cols-3 gap-6 mb-8">
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
                {["Pending", "Accepted", "Rejected"].map((tab) => (
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
                        <th className="px-6 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Topic</th>
                        <th className="px-6 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Requested</th>
                        <th className="px-6 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Mode</th>
                        <th className="px-6 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                        <th className="px-6 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filteredConsultations.length > 0 ? (
                        filteredConsultations.map((consultation) => (
                          <tr key={consultation.id} className="hover:bg-slate-50/50 transition-colors group">
                            <td className="px-6 py-5">
                              <div className="flex items-center gap-3">
                                <img 
                                  src={getProfileImageUrl(consultation.client?.profile_image, consultation.client?.name)} 
                                  alt={consultation.client?.name} 
                                  className="w-10 h-10 rounded-full object-cover border-2 border-slate-50 shadow-sm"
                                  onError={(e) => {
                                    e.target.src = `https://ui-avatars.com/api/?name=${consultation.client?.name || 'Client'}&background=0F1A3D&color=fff`;
                                  }}
                                />
                                <span className="font-bold text-[#0F1A3D] text-sm tracking-tight">{consultation.client?.name || "Client"}</span>
                              </div>
                            </td>
                            <td className="px-6 py-5">
                              <span className="text-sm font-semibold text-slate-700">{consultation.title || "Untitled"}</span>
                            </td>
                            <td className="px-6 py-5">
                              <div className="flex flex-col">
                                <div className="flex items-center gap-2 text-slate-700">
                                  <CalIcon size={12} className="text-slate-400" />
                                  <span className="text-xs font-bold">{consultation.requested_day || "N/A"}</span>
                                </div>
                                <div className="flex items-center gap-2 text-slate-400 mt-1">
                                  <Clock size={12} />
                                  <span className="text-[11px] font-medium">{consultation.requested_time || "N/A"}</span>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-5">
                              <div className="flex items-center gap-2">
                                {getModeIcon(consultation.mode)}
                                <span className="text-xs font-semibold text-slate-600">{getModeLabel(consultation.mode)}</span>
                              </div>
                            </td>
                            <td className="px-6 py-5">
                              <span 
                                className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                  consultation.status === "requested" 
                                    ? "bg-amber-50 text-amber-600 border border-amber-100" 
                                    : consultation.status === "accepted"
                                    ? "bg-green-50 text-green-600 border border-green-100"
                                    : "bg-red-50 text-red-600 border border-red-100"
                                }`}
                              >
                                {consultation.status === "requested" ? "Pending" : consultation.status === "accepted" ? "Accepted" : "Rejected"}
                              </span>
                            </td>
                            <td className="px-6 py-5 text-right">
                              <div className="flex items-center justify-end gap-2">
                                {consultation.status === "requested" && (
                                  <>
                                    <button 
                                      onClick={() => handleAcceptClick(consultation)}
                                      className="p-2.5 hover:bg-green-50 rounded-full text-green-400 hover:text-green-600 transition-all duration-200"
                                    >
                                      <Check size={18} />
                                    </button>
                                    <button 
                                      onClick={() => handleRejectClick(consultation)}
                                      className="p-2.5 hover:bg-red-50 rounded-full text-red-400 hover:text-red-600 transition-all duration-200"
                                    >
                                      <X size={18} />
                                    </button>
                                  </>
                                )}
                                <button 
                                  onClick={() => setSelectedConsultation(consultation)}
                                  className="p-2.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-[#0F1A3D] transition-all duration-200"
                                >
                                  <Eye size={18} />
                                </button>
                              </div>
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

      {/* Accept Modal */}
      {showAcceptModal && selectedConsultation && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 animate-in scale-in-95 duration-300">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Accept Consultation</h2>
              <button
                onClick={() => {
                  setShowAcceptModal(false);
                  setSelectedConsultation(null);
                }}
                className="p-1 hover:bg-slate-200 rounded-full text-slate-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* Client Info */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-2">Client</label>
                <p className="text-sm font-semibold text-slate-800">{selectedConsultation.client?.name || "Client"}</p>
              </div>

              {/* Consultation Topic */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-2">Topic</label>
                <p className="text-sm font-semibold text-slate-800">{selectedConsultation.title}</p>
              </div>

              {/* Mode */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-2">Mode</label>
                <div className="flex items-center gap-2 text-slate-700">
                  {getModeIcon(selectedConsultation.mode)}
                  <span className="text-sm font-semibold">{getModeLabel(selectedConsultation.mode)}</span>
                </div>
              </div>

              {/* Conditional Fields - Only for Video Calls */}
              {selectedConsultation.mode === "video" && (
                <>
                  <div className="border-t border-slate-200 pt-4 mt-4">
                    <p className="text-xs font-semibold text-slate-600 mb-4">Fill in the details for this video consultation:</p>
                    
                    {/* Scheduled Date */}
                    <div className="mb-3">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">Date</label>
                      <input
                        type="date"
                        value={acceptFormData.scheduled_date}
                        onChange={(e) => setAcceptFormData({...acceptFormData, scheduled_date: e.target.value})}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>

                    {/* Scheduled Time */}
                    <div className="mb-3">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">Time</label>
                      <input
                        type="time"
                        value={acceptFormData.scheduled_time}
                        onChange={(e) => setAcceptFormData({...acceptFormData, scheduled_time: e.target.value})}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>

                    {/* Meeting Link */}
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">Meeting Link</label>
                      <input
                        type="url"
                        placeholder="https://meet.google.com/..."
                        value={acceptFormData.meeting_link}
                        onChange={(e) => setAcceptFormData({...acceptFormData, meeting_link: e.target.value})}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Info for In-Person */}
              {selectedConsultation.mode === "in_person" && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-2">
                  <p className="text-xs text-blue-700 font-semibold">This is an in-person consultation. Client will be notified of acceptance.</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex gap-2 justify-end">
              <button
                onClick={() => {
                  setShowAcceptModal(false);
                  setSelectedConsultation(null);
                }}
                className="px-4 py-2 bg-slate-100 text-slate-900 rounded-lg font-semibold text-sm hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitAccept}
                disabled={processingId === selectedConsultation.id}
                className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold text-sm hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {processingId === selectedConsultation.id && (
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                {processingId === selectedConsultation.id ? "Accepting..." : "Accept"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Confirmation Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full border border-slate-200 animate-in scale-in-95 duration-300">
            <div className="p-6">
              <div className="flex items-center justify-center w-10 h-10 mx-auto mb-3 bg-red-100 rounded-full">
                <AlertCircle className="text-red-600" size={20} />
              </div>
              
              <h3 className="text-lg font-bold text-center text-slate-900 mb-2">Reject Consultation?</h3>
              <p className="text-center text-slate-600 text-sm mb-6">
                Are you sure you want to reject this consultation request from <strong>{consultationToReject?.client?.name}</strong>?
              </p>

              <div className="space-y-2">
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setConsultationToReject(null);
                  }}
                  className="w-full px-4 py-2 bg-slate-100 text-slate-900 rounded-lg font-semibold text-sm hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmReject}
                  disabled={processingId === consultationToReject?.id}
                  className="w-full px-4 py-2 bg-red-600 text-white rounded-lg font-semibold text-sm hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {processingId === consultationToReject?.id && (
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}
                  {processingId === consultationToReject?.id ? "Rejecting..." : "Reject"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Details View Modal */}
      {selectedConsultation && !showAcceptModal && !showRejectModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 animate-in scale-in-95 duration-300">
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Consultation Details</h2>
              <button
                onClick={() => setSelectedConsultation(null)}
                className="p-1 hover:bg-slate-200 rounded-full text-slate-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* Client */}
              <div>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Client</h3>
                <div className="flex items-center gap-3">
                  <img 
                    src={getProfileImageUrl(selectedConsultation.client?.profile_image, selectedConsultation.client?.name)} 
                    alt={selectedConsultation.client?.name || "Client"} 
                    className="w-10 h-10 rounded-full object-cover border-2 border-slate-200"
                    onError={(e) => {
                      e.target.src = `https://ui-avatars.com/api/?name=${selectedConsultation.client?.name || 'Client'}&background=0F1A3D&color=fff`;
                    }}
                  />
                  <p className="font-semibold text-slate-900 text-sm">{selectedConsultation.client?.name || "Client"}</p>
                </div>
              </div>

              {/* Topic */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">Topic</label>
                <p className="text-sm text-slate-800 bg-slate-50 p-3 rounded-lg border border-slate-200">{selectedConsultation.title}</p>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">Date</label>
                  <div className="flex items-center gap-2 text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200 text-sm">
                    <Calendar size={14} className="text-indigo-500" />
                    <span className="font-semibold">{selectedConsultation.requested_day || "N/A"}</span>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">Time</label>
                  <div className="flex items-center gap-2 text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200 text-sm">
                    <Clock size={14} className="text-indigo-500" />
                    <span className="font-semibold">{selectedConsultation.requested_time || "N/A"}</span>
                  </div>
                </div>
              </div>

              {/* Mode */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">Mode</label>
                <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200 w-fit text-sm">
                  {getModeIcon(selectedConsultation.mode)}
                  <span className="font-semibold text-slate-700">{getModeLabel(selectedConsultation.mode)}</span>
                </div>
              </div>

              {/* Conditional Fields - Only for In-Person */}
              {selectedConsultation.mode === "in_person" && (
                <>
                  {/* Meeting Location */}
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">Location</label>
                    <div className="flex items-center gap-2 text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200 text-sm">
                      <MapPin size={14} className="text-indigo-500" />
                      <span className="font-semibold">{selectedConsultation.meeting_location || "Not specified"}</span>
                    </div>
                  </div>

                  {/* Contact Phone */}
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">Phone</label>
                    <p className="text-sm text-slate-800 bg-slate-50 p-3 rounded-lg border border-slate-200">{selectedConsultation.phone_number || "Not provided"}</p>
                  </div>
                </>
              )}

              {/* Status */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">Status</label>
                <span 
                  className={`inline-flex px-3 py-1.5 rounded-full text-xs font-bold tracking-wide border ${
                    selectedConsultation.status === "requested" ? "bg-amber-50 text-amber-600 border-amber-200"
                    : selectedConsultation.status === "accepted" ? "bg-green-50 text-green-600 border-green-200"
                    : "bg-red-50 text-red-600 border-red-200"
                  }`}
                >
                  {selectedConsultation.status === "requested" ? "Pending" : selectedConsultation.status === "accepted" ? "Accepted" : "Rejected"}
                </span>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedConsultation(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg font-semibold text-sm hover:bg-slate-800 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LawyerAppointment;
