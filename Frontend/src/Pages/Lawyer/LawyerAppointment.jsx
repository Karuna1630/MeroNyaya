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
  AlertCircle,
  CheckCircle
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMyConsultations } from "../slices/consultationSlice";
import { fetchCaseAppointments, fetchCases } from "../slices/caseSlice";
import axiosInstance from "../../axios/axiosinstance";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { acceptConsultationSchema } from "../utils/consultationValidation";

const LawyerAppointment = () => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("Pending");
  const [selectedDate, setSelectedDate] = useState(5);
  const [currentMonth, setCurrentMonth] = useState({ month: 2, year: 2026 }); // February 2026
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [consultationToReject, setConsultationToReject] = useState(null);
  const [consultationToComplete, setConsultationToComplete] = useState(null);
  const [processingId, setProcessingId] = useState(null);
  const [selectedCaseAppointment, setSelectedCaseAppointment] = useState(null);
  const [showCaseAcceptModal, setShowCaseAcceptModal] = useState(false);
  const [showCaseRejectModal, setShowCaseRejectModal] = useState(false);
  const [caseAppointmentToReject, setCaseAppointmentToReject] = useState(null);
  const [caseAppointmentToComplete, setCaseAppointmentToComplete] = useState(null);
  const [showCaseCompleteModal, setShowCaseCompleteModal] = useState(false);
  const [selectedCaseAppointmentView, setSelectedCaseAppointmentView] = useState(null);
  const [caseAppointmentProcessingId, setCaseAppointmentProcessingId] = useState(null);
  const initialFetchDoneRef = useRef(false);

  // Select necessary state from Redux store
  const { consultations = [] } = useSelector(
    (state) => state.consultation || {}
  );
  // slect case appoinments from both case details and case appoinments
  const { caseAppointments = [], caseAppointmentsLoading, cases = [] } = useSelector(
    (state) => state.case || {}
  );

  // Fetch consultations on component mount
  useEffect(() => {
    if (!initialFetchDoneRef.current) {
      initialFetchDoneRef.current = true;
      dispatch(fetchMyConsultations());
      dispatch(fetchCaseAppointments());
      dispatch(fetchCases());
    }
  }, [dispatch]);

  // Combine case appointments from both case details and case appointments slice
  const caseAppointmentsFromCases = useMemo(() => {
    return (cases || []).flatMap((item) => item.appointments || []);
  }, [cases]);

  // Merge case appointments from both case details and case appointments slice, removing duplicates based on appointment ID
  const mergedCaseAppointments = useMemo(() => {
    const map = new Map();
    // Use a Map to ensure uniqueness of appointments based on their ID
    [...caseAppointmentsFromCases, ...caseAppointments].forEach((appointment) => {
      if (appointment?.id !== undefined && appointment?.id !== null) {
        map.set(appointment.id, appointment);
      }
    });
    // Return the unique appointments as an array
    return Array.from(map.values());
  }, [caseAppointmentsFromCases, caseAppointments]);

  // Calculate statistics for the dashboard based on consultations
  const stats = useMemo(() => {
    const pending = consultations.filter(c => c.status === "requested").length;
    const accepted = consultations.filter(c => c.status === "accepted").length;
    const completed = consultations.filter(c => c.status === "completed").length;
    // retuning an arrray of objects with value, label and color for each stats
    return [
      { value: pending, label: "Pending", color: "text-amber-500" },
      { value: accepted, label: "Accepted", color: "text-green-500" },
      { value: completed, label: "Completed", color: "text-blue-500" },
    ];
  }, [consultations]);

  // Filter consultations based on active tab selection
  const filteredConsultations = useMemo(() => {
    if (activeTab === "Pending") {
      return consultations.filter(c => c.status === "requested");
    } else if (activeTab === "Accepted") {
      return consultations.filter(c => c.status === "accepted");
    } else if (activeTab === "Completed") {
      return consultations.filter(c => c.status === "completed");
    }
    return consultations.filter(c => c.status === "rejected");
  }, [activeTab, consultations]);
  const daysInMonth = new Date(currentMonth.year, currentMonth.month + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.year, currentMonth.month, 1).getDay();
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  
  // Handle file input changes for document uploads in case appointments
  const calendarDays = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null);
  }
  // Fill the calendar days for the current month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }
  // Function to handle month navigation in the calendar sidebar
  const handlePrevMonth = () => {
    setCurrentMonth(prev => ({
      month: prev.month === 0 ? 11 : prev.month - 1,
      year: prev.month === 0 ? prev.year - 1 : prev.year
    }));
  };

  // Function to handle month navigation in the calendar sidebar
  const handleNextMonth = () => {
    setCurrentMonth(prev => ({
      month: prev.month === 11 ? 0 : prev.month + 1,
      year: prev.month === 11 ? prev.year + 1 : prev.year
    }));
  };

  // Helper function to get the appropriate icon for the consultation mode (video, in-person, or default)
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

  // Helper function to format time strings into a more readable format for display in the consultations table
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

  // Handle file input changes for document uploads in case appointments
  const getProfileImageUrl = (profileImage, clientName = "Client") => {
    return profileImage || `https://ui-avatars.com/api/?name=${clientName}&background=0F1A3D&color=fff`;
  };

  const handleAcceptClick = (consultation) => {
    setSelectedConsultation(consultation);
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

  const handleCompleteClick = (consultation) => {
    setConsultationToComplete(consultation);
    setShowCompleteModal(true);
  };

  const handleCaseAcceptClick = (appointment) => {
    setSelectedCaseAppointment(appointment);
    setShowCaseAcceptModal(true);
  };

  const handleCaseRejectClick = (appointment) => {
    setCaseAppointmentToReject(appointment);
    setShowCaseRejectModal(true);
  };

  const handleCaseCompleteClick = (appointment) => {
    setCaseAppointmentToComplete(appointment);
    setShowCaseCompleteModal(true);
  };

  const handleConfirmComplete = async () => {
    if (!consultationToComplete) return;
    
    setProcessingId(consultationToComplete.id);
    try {
      await axiosInstance.post(`/consultations/${consultationToComplete.id}/complete/`);
      dispatch(fetchMyConsultations());
      setShowCompleteModal(false);
      setConsultationToComplete(null);
    } catch (error) {
      console.error("Error completing consultation:", error);
      alert("Error completing consultation: " + (error.response?.data?.detail || error.message));
    } finally {
      setProcessingId(null);
    }
  };

  
  const handleConfirmCaseReject = async () => {
    if (!caseAppointmentToReject) return;

    setCaseAppointmentProcessingId(caseAppointmentToReject.id);
    try {
      await axiosInstance.post(`/cases/appointments/${caseAppointmentToReject.id}/reject/`);
      dispatch(fetchCaseAppointments());
      dispatch(fetchCases());
      setShowCaseRejectModal(false);
      setCaseAppointmentToReject(null);
    } catch (error) {
      console.error("Error rejecting case appointment:", error);
    } finally {
      setCaseAppointmentProcessingId(null);
    }
  };

  const handleConfirmCaseComplete = async () => {
    if (!caseAppointmentToComplete) return;

    setCaseAppointmentProcessingId(caseAppointmentToComplete.id);
    try {
      await axiosInstance.post(`/cases/appointments/${caseAppointmentToComplete.id}/complete/`);
      dispatch(fetchCaseAppointments());
      dispatch(fetchCases());
      setShowCaseCompleteModal(false);
      setCaseAppointmentToComplete(null);
    } catch (error) {
      console.error("Error completing case appointment:", error);
      alert("Error completing appointment: " + (error.response?.data?.error || error.message));
    } finally {
      setCaseAppointmentProcessingId(null);
    }
  };

  const handleSubmitCaseAccept = async (values) => {
    if (!selectedCaseAppointment) return;

    setCaseAppointmentProcessingId(selectedCaseAppointment.id);
    try {
      const data = {
        scheduled_date: values.scheduled_date,
        scheduled_time: values.scheduled_time,
      };

      if (selectedCaseAppointment.mode === "video") {
        data.meeting_link = values.meeting_link;
      }

      await axiosInstance.post(`/cases/appointments/${selectedCaseAppointment.id}/confirm/`, data);
      dispatch(fetchCaseAppointments());
      dispatch(fetchCases());
      setShowCaseAcceptModal(false);
      setSelectedCaseAppointment(null);
    } catch (error) {
      console.error("Error confirming case appointment:", error.response?.data || error.message);
      alert("Error: " + (error.response?.data?.error || error.message));
    } finally {
      setCaseAppointmentProcessingId(null);
    }
  };

  const handleSubmitAccept = async (values) => {
    if (!selectedConsultation) return;

    setProcessingId(selectedConsultation.id);
    try {
      // Update the scheduled details - include all required fields from existing consultation
      const data = {
        title: selectedConsultation.title,
        lawyer_id: selectedConsultation.lawyer?.id,
        mode: selectedConsultation.mode,
        meeting_location: selectedConsultation.meeting_location || "",
        phone_number: selectedConsultation.phone_number || "",
        requested_day: selectedConsultation.requested_day,
        requested_time: selectedConsultation.requested_time,
        scheduled_date: values.scheduled_date,
        scheduled_time: values.scheduled_time,
      };

      // Add case_id if exists
      if (selectedConsultation.case?.id) {
        data.case_id = selectedConsultation.case.id;
      }

      // Add meeting link only for video consultations
      if (selectedConsultation.mode === "video") {
        data.meeting_link = values.meeting_link;
      }

      console.log("Data being sent to backend:", data);
      await axiosInstance.patch(`/consultations/${selectedConsultation.id}/`, data);
      
      // Then accept the consultation
      await axiosInstance.post(`/consultations/${selectedConsultation.id}/accept/`);
      dispatch(fetchMyConsultations());
      setShowAcceptModal(false);
      setSelectedConsultation(null);
    } catch (error) {
      console.error("Error accepting consultation:", error.response?.data || error.message);
      console.error("Full error details:", error.response?.data?.ErrorMessage || error.response?.data);
      alert("Error: " + JSON.stringify(error.response?.data?.ErrorMessage || error.response?.data || error.message));
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50/50">
      <Sidebar />

      <main className="flex-1 ml-64 flex flex-col overflow-hidden">
        <LawyerDashHeader
          title="Consultations & Appointments"
          subtitle="Manage your client consultations and appointments"
          notificationCount={3}
        />

        <div className="flex-1 p-8 overflow-y-auto">
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
                {["Pending", "Accepted", "Rejected", "Completed"].map((tab) => (
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
                                    : consultation.status === "completed"
                                    ? "bg-blue-50 text-blue-600 border border-blue-100"
                                    : "bg-red-50 text-red-600 border border-red-100"
                                }`}
                              >
                                {consultation.status === "requested" ? "Pending" : consultation.status === "accepted" ? "Accepted" : consultation.status === "completed" ? "Completed" : "Rejected"}
                              </span>
                            </td>
                            <td className="px-6 py-5 text-right">
                              <div className="flex items-center justify-end gap-2">
                                {consultation.status === "requested" && (
                                  <>
                                    <button 
                                      onClick={() => handleAcceptClick(consultation)}
                                      className="p-2.5 hover:bg-green-50 rounded-full text-green-400 hover:text-green-600 transition-all duration-200"
                                      title="Accept"
                                    >
                                      <Check size={18} />
                                    </button>
                                    <button 
                                      onClick={() => handleRejectClick(consultation)}
                                      className="p-2.5 hover:bg-red-50 rounded-full text-red-400 hover:text-red-600 transition-all duration-200"
                                      title="Reject"
                                    >
                                      <X size={18} />
                                    </button>
                                  </>
                                )}
                                {consultation.status === "accepted" && (
                                  <button 
                                    onClick={() => handleCompleteClick(consultation)}
                                    disabled={processingId === consultation.id}
                                    className="p-2.5 hover:bg-blue-50 rounded-full text-blue-400 hover:text-blue-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="Mark as Complete"
                                  >
                                    <CheckCircle size={18} />
                                  </button>
                                )}
                                <button 
                                  onClick={() => setSelectedConsultation(consultation)}
                                  className="p-2.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-[#0F1A3D] transition-all duration-200"
                                  title="View Details"
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

              {/* Case Appointments */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-[#0F1A3D]">Case Appointments</h3>
                    <p className="text-xs text-slate-500">Appointments scheduled from cases (no payment)</p>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/50 border-b border-slate-100">
                        <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Client</th>
                        <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Case</th>
                        <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Preferred</th>
                        <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Mode</th>
                        <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                        <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {mergedCaseAppointments.length > 0 ? (
                        mergedCaseAppointments.map((appointment) => (
                          <tr key={appointment.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <img
                                  src={getProfileImageUrl(appointment.client_profile_image, appointment.client_name)}
                                  alt={appointment.client_name}
                                  className="w-9 h-9 rounded-full object-cover border-2 border-slate-50 shadow-sm"
                                  onError={(e) => {
                                    e.target.src = `https://ui-avatars.com/api/?name=${appointment.client_name || 'Client'}&background=0F1A3D&color=fff`;
                                  }}
                                />
                                <span className="font-semibold text-slate-900 text-sm">{appointment.client_name || "Client"}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-col">
                                <span className="text-sm font-semibold text-slate-700">{appointment.case_title || "Case"}</span>
                                <span className="text-xs text-slate-500">{appointment.case_category || ""}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-col">
                                <div className="flex items-center gap-2 text-slate-700">
                                  <CalIcon size={12} className="text-slate-400" />
                                  <span className="text-xs font-bold">{appointment.preferred_day || "N/A"}</span>
                                </div>
                                <div className="flex items-center gap-2 text-slate-400 mt-1">
                                  <Clock size={12} />
                                  <span className="text-[11px] font-medium">{appointment.preferred_time || "N/A"}</span>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                {getModeIcon(appointment.mode)}
                                <span className="text-xs font-semibold text-slate-600">{getModeLabel(appointment.mode)}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                                  appointment.status === "pending"
                                    ? "bg-amber-50 text-amber-600 border-amber-100"
                                    : appointment.status === "confirmed"
                                    ? "bg-green-50 text-green-600 border-green-100"
                                    : appointment.status === "completed"
                                    ? "bg-blue-50 text-blue-600 border-blue-100"
                                    : appointment.status === "rescheduled"
                                    ? "bg-purple-50 text-purple-600 border-purple-100"
                                    : "bg-red-50 text-red-600 border-red-100"
                                }`}
                              >
                                {(appointment.status || "pending").replace(/_/g, " ")}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                {appointment.status === "pending" && (
                                  <>
                                    <button
                                      onClick={() => handleCaseAcceptClick(appointment)}
                                      className="p-2.5 hover:bg-green-50 rounded-full text-green-400 hover:text-green-600 transition-all duration-200"
                                      title="Confirm"
                                    >
                                      <Check size={18} />
                                    </button>
                                    <button
                                      onClick={() => handleCaseRejectClick(appointment)}
                                      className="p-2.5 hover:bg-red-50 rounded-full text-red-400 hover:text-red-600 transition-all duration-200"
                                      title="Reject"
                                    >
                                      <X size={18} />
                                    </button>
                                  </>
                                )}
                                {appointment.status === "confirmed" && (
                                  <button
                                    onClick={() => handleCaseCompleteClick(appointment)}
                                    disabled={caseAppointmentProcessingId === appointment.id}
                                    className="p-2.5 hover:bg-blue-50 rounded-full text-blue-400 hover:text-blue-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="Mark as Complete"
                                  >
                                    <CheckCircle size={18} />
                                  </button>
                                )}
                                <button
                                  onClick={() => setSelectedCaseAppointmentView(appointment)}
                                  className="p-2.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-[#0F1A3D] transition-all duration-200"
                                  title="View Details"
                                >
                                  <Eye size={18} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="px-6 py-12 text-center">
                            <div className="flex flex-col items-center gap-2 opacity-40">
                              <Clock size={36} className="text-slate-400 mb-2" />
                              <p className="text-sm font-bold text-slate-500 tracking-tight">
                                {caseAppointmentsLoading ? "Loading case appointments..." : "No case appointments yet"}
                              </p>
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Formik
            initialValues={{
              scheduled_date: "",
              scheduled_time: "",
              meeting_link: ""
            }}
            validationSchema={acceptConsultationSchema}
            context={{ mode: selectedConsultation.mode }}
            onSubmit={handleSubmitAccept}
          >
            {({ errors, touched, isSubmitting }) => (
              <Form className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-100 max-h-[85vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="bg-[#0F1A3D] px-6 py-4 flex items-center justify-between">
                  <h2 className="text-lg font-bold text-white">Accept Consultation</h2>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAcceptModal(false);
                      setSelectedConsultation(null);
                    }}
                    className="p-1 hover:bg-white/10 rounded-full text-white transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Content - Scrollable */}
                <div className="p-6 overflow-y-auto flex-1">
                  <div className="grid grid-cols-2 gap-4">
                    {/* Client Info - Full Width */}
                    <div className="col-span-2 bg-slate-50 rounded-xl p-4 border border-slate-200">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-3">Client</label>
                      <div className="flex items-center gap-3">
                        <img 
                          src={getProfileImageUrl(selectedConsultation.client?.profile_image, selectedConsultation.client?.name)}
                          alt={selectedConsultation.client?.name || "Client"}
                          className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md"
                        />
                        <div>
                          <p className="font-bold text-slate-900">{selectedConsultation.client?.name || "Client"}</p>
                          <p className="text-xs text-slate-500 font-medium">{selectedConsultation.title}</p>
                        </div>
                      </div>
                    </div>

                    {/* Mode */}
                    <div className="col-span-2 bg-white rounded-xl p-4 border border-slate-200">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-2">Mode</label>
                      <div className="flex items-center gap-2">
                        {getModeIcon(selectedConsultation.mode)}
                        <span className="font-semibold text-sm text-slate-700">{getModeLabel(selectedConsultation.mode)}</span>
                      </div>
                    </div>

                    {/* Scheduled Date */}
                    <div className="bg-white rounded-xl p-4 border border-slate-200">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-2">
                        Date <span className="text-red-500">*</span>
                      </label>
                      <Field
                        type="date"
                        name="scheduled_date"
                        className={`w-full px-3 py-2 border rounded-lg text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-green-500 ${
                          errors.scheduled_date && touched.scheduled_date
                            ? "border-red-500"
                            : "border-slate-200"
                        }`}
                      />
                      <ErrorMessage
                        name="scheduled_date"
                        component="div"
                        className="text-red-500 text-xs mt-1 font-medium"
                      />
                    </div>

                    {/* Scheduled Time */}
                    <div className="bg-white rounded-xl p-4 border border-slate-200">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-2">
                        Time <span className="text-red-500">*</span>
                      </label>
                      <Field
                        type="time"
                        name="scheduled_time"
                        className={`w-full px-3 py-2 border rounded-lg text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-green-500 ${
                          errors.scheduled_time && touched.scheduled_time
                            ? "border-red-500"
                            : "border-slate-200"
                        }`}
                      />
                      <ErrorMessage
                        name="scheduled_time"
                        component="div"
                        className="text-red-500 text-xs mt-1 font-medium"
                      />
                    </div>

                    {/* Meeting Link - Only for Video */}
                    {selectedConsultation.mode === "video" && (
                      <div className="col-span-2 bg-green-50 rounded-xl p-4 border border-green-200">
                        <label className="text-xs font-bold text-green-700 uppercase tracking-wide block mb-2">
                          Meeting Link <span className="text-red-500">*</span>
                        </label>
                        <Field
                          type="url"
                          name="meeting_link"
                          placeholder="https://meet.google.com/..."
                          className={`w-full px-3 py-2 border rounded-lg text-sm font-medium text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 ${
                            errors.meeting_link && touched.meeting_link
                              ? "border-red-500"
                              : "border-green-300"
                          }`}
                        />
                        <ErrorMessage
                          name="meeting_link"
                          component="div"
                          className="text-red-500 text-xs mt-1 font-medium"
                        />
                      </div>
                    )}

                    {/* Info message based on mode */}
                    {selectedConsultation.mode === "in_person" && (
                      <div className="col-span-2 bg-blue-50 rounded-xl p-3 border border-blue-200">
                        <p className="text-xs text-blue-700 font-semibold">Client will visit you in person at the scheduled time.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAcceptModal(false);
                      setSelectedConsultation(null);
                    }}
                    className="px-6 py-2 bg-slate-100 text-slate-900 rounded-lg font-semibold text-sm hover:bg-slate-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={processingId === selectedConsultation.id || isSubmitting}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg font-semibold text-sm hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-md"
                  >
                    {(processingId === selectedConsultation.id || isSubmitting) && (
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    )}
                    {(processingId === selectedConsultation.id || isSubmitting) ? "Accepting..." : "Accept"}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
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
                    : selectedConsultation.status === "completed" ? "bg-blue-50 text-blue-600 border-blue-200"
                    : "bg-red-50 text-red-600 border-red-200"
                  }`}
                >
                  {selectedConsultation.status === "requested" ? "Pending" : selectedConsultation.status === "accepted" ? "Accepted" : selectedConsultation.status === "completed" ? "Completed" : "Rejected"}
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

      {/* Complete Confirmation Modal */}
      {showCompleteModal && consultationToComplete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-100">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-lg font-bold text-slate-900">Complete Consultation</h2>
              <button
                onClick={() => {
                  setShowCompleteModal(false);
                  setConsultationToComplete(null);
                }}
                className="p-1 hover:bg-green-100 rounded-full text-slate-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full">
                <CheckCircle className="text-green-600" size={32} />
              </div>
              
              <h3 className="text-xl font-bold text-center text-[#0F1A3D] mb-3">Mark as Complete?</h3>
              <p className="text-center text-slate-600 text-sm leading-relaxed mb-6">
                You are about to mark the consultation with <span className="font-bold text-slate-900">{consultationToComplete?.client?.name}</span> as completed. This action will update the appointment status.
              </p>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowCompleteModal(false);
                    setConsultationToComplete(null);
                  }}
                  className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-900 rounded-xl font-semibold text-sm hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmComplete}
                  disabled={processingId === consultationToComplete?.id}
                  className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-xl font-semibold text-sm hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md"
                >
                  {processingId === consultationToComplete?.id && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}
                  {processingId === consultationToComplete?.id ? "Processing..." : "Complete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Case Appointment Details Modal */}
      {selectedCaseAppointmentView && !showCaseAcceptModal && !showCaseRejectModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 animate-in scale-in-95 duration-300">
            <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Case Appointment Details</h2>
              <button
                onClick={() => setSelectedCaseAppointmentView(null)}
                className="p-1 hover:bg-slate-200 rounded-full text-slate-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Client</h3>
                <div className="flex items-center gap-3">
                  <img
                    src={getProfileImageUrl(selectedCaseAppointmentView.client_profile_image, selectedCaseAppointmentView.client_name)}
                    alt={selectedCaseAppointmentView.client_name || "Client"}
                    className="w-10 h-10 rounded-full object-cover border-2 border-slate-200"
                    onError={(e) => {
                      e.target.src = `https://ui-avatars.com/api/?name=${selectedCaseAppointmentView.client_name || 'Client'}&background=0F1A3D&color=fff`;
                    }}
                  />
                  <p className="font-semibold text-slate-900 text-sm">{selectedCaseAppointmentView.client_name || "Client"}</p>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">Case</label>
                <p className="text-sm text-slate-800 bg-slate-50 p-3 rounded-lg border border-slate-200">
                  {selectedCaseAppointmentView.case_title || "Case"}
                </p>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">Topic</label>
                <p className="text-sm text-slate-800 bg-slate-50 p-3 rounded-lg border border-slate-200">
                  {selectedCaseAppointmentView.title || "Appointment"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">Preferred Day</label>
                  <div className="flex items-center gap-2 text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200 text-sm">
                    <CalIcon size={14} className="text-indigo-500" />
                    <span className="font-semibold">{selectedCaseAppointmentView.preferred_day || "N/A"}</span>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">Preferred Time</label>
                  <div className="flex items-center gap-2 text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200 text-sm">
                    <Clock size={14} className="text-indigo-500" />
                    <span className="font-semibold">{selectedCaseAppointmentView.preferred_time || "N/A"}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">Mode</label>
                <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200 w-fit text-sm">
                  {getModeIcon(selectedCaseAppointmentView.mode)}
                  <span className="font-semibold text-slate-700">{getModeLabel(selectedCaseAppointmentView.mode)}</span>
                </div>
              </div>

              {selectedCaseAppointmentView.mode === "in_person" && (
                <>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">Location</label>
                    <p className="text-sm text-slate-800 bg-slate-50 p-3 rounded-lg border border-slate-200">
                      {selectedCaseAppointmentView.meeting_location || "Not specified"}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">Phone</label>
                    <p className="text-sm text-slate-800 bg-slate-50 p-3 rounded-lg border border-slate-200">
                      {selectedCaseAppointmentView.phone_number || "Not provided"}
                    </p>
                  </div>
                </>
              )}

              {selectedCaseAppointmentView.mode === "video" && selectedCaseAppointmentView.meeting_link && (
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">Meeting Link</label>
                  <a
                    href={selectedCaseAppointmentView.meeting_link}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-indigo-600 underline break-all"
                  >
                    {selectedCaseAppointmentView.meeting_link}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Case Complete Confirmation Modal */}
      {showCaseCompleteModal && caseAppointmentToComplete && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full border border-slate-200 animate-in scale-in-95 duration-300">
            <div className="p-6">
              <div className="flex items-center justify-center w-10 h-10 mx-auto mb-3 bg-blue-100 rounded-full">
                <CheckCircle className="text-blue-600" size={20} />
              </div>

              <h3 className="text-lg font-bold text-center text-slate-900 mb-2">Complete Appointment?</h3>
              <p className="text-center text-slate-600 text-sm mb-6">
                Mark the appointment for <strong>{caseAppointmentToComplete?.client_name}</strong> as completed.
              </p>

              <div className="space-y-2">
                <button
                  onClick={() => {
                    setShowCaseCompleteModal(false);
                    setCaseAppointmentToComplete(null);
                  }}
                  className="w-full px-4 py-2 bg-slate-100 text-slate-900 rounded-lg font-semibold text-sm hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmCaseComplete}
                  disabled={caseAppointmentProcessingId === caseAppointmentToComplete?.id}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {caseAppointmentProcessingId === caseAppointmentToComplete?.id && (
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}
                  {caseAppointmentProcessingId === caseAppointmentToComplete?.id ? "Processing..." : "Complete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Case Appointment Confirm Modal */}
      {showCaseAcceptModal && selectedCaseAppointment && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Formik
            initialValues={{
              scheduled_date: "",
              scheduled_time: "",
              meeting_link: "",
            }}
            validationSchema={acceptConsultationSchema}
            context={{ mode: selectedCaseAppointment.mode }}
            onSubmit={handleSubmitCaseAccept}
          >
            {({ errors, touched, isSubmitting }) => (
              <Form className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-100 max-h-[85vh] overflow-hidden flex flex-col">
                <div className="bg-[#0F1A3D] px-6 py-4 flex items-center justify-between">
                  <h2 className="text-lg font-bold text-white">Confirm Case Appointment</h2>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCaseAcceptModal(false);
                      setSelectedCaseAppointment(null);
                    }}
                    className="p-1 hover:bg-white/10 rounded-full text-white transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 bg-slate-50 rounded-xl p-4 border border-slate-200">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-3">Client</label>
                      <div className="flex items-center gap-3">
                        <img
                          src={getProfileImageUrl(selectedCaseAppointment.client_profile_image, selectedCaseAppointment.client_name)}
                          alt={selectedCaseAppointment.client_name || "Client"}
                          className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md"
                        />
                        <div>
                          <p className="font-bold text-slate-900">{selectedCaseAppointment.client_name || "Client"}</p>
                          <p className="text-xs text-slate-500 font-medium">{selectedCaseAppointment.title}</p>
                        </div>
                      </div>
                    </div>

                    <div className="col-span-2 bg-white rounded-xl p-4 border border-slate-200">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-2">Mode</label>
                      <div className="flex items-center gap-2">
                        {getModeIcon(selectedCaseAppointment.mode)}
                        <span className="font-semibold text-sm text-slate-700">{getModeLabel(selectedCaseAppointment.mode)}</span>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl p-4 border border-slate-200">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-2">
                        Date <span className="text-red-500">*</span>
                      </label>
                      <Field
                        type="date"
                        name="scheduled_date"
                        className={`w-full px-3 py-2 border rounded-lg text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-green-500 ${
                          errors.scheduled_date && touched.scheduled_date
                            ? "border-red-500"
                            : "border-slate-200"
                        }`}
                      />
                      <ErrorMessage
                        name="scheduled_date"
                        component="div"
                        className="text-red-500 text-xs mt-1 font-medium"
                      />
                    </div>

                    <div className="bg-white rounded-xl p-4 border border-slate-200">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-2">
                        Time <span className="text-red-500">*</span>
                      </label>
                      <Field
                        type="time"
                        name="scheduled_time"
                        className={`w-full px-3 py-2 border rounded-lg text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-green-500 ${
                          errors.scheduled_time && touched.scheduled_time
                            ? "border-red-500"
                            : "border-slate-200"
                        }`}
                      />
                      <ErrorMessage
                        name="scheduled_time"
                        component="div"
                        className="text-red-500 text-xs mt-1 font-medium"
                      />
                    </div>

                    {selectedCaseAppointment.mode === "video" && (
                      <div className="col-span-2 bg-green-50 rounded-xl p-4 border border-green-200">
                        <label className="text-xs font-bold text-green-700 uppercase tracking-wide block mb-2">
                          Meeting Link <span className="text-red-500">*</span>
                        </label>
                        <Field
                          type="url"
                          name="meeting_link"
                          placeholder="https://meet.google.com/..."
                          className={`w-full px-3 py-2 border rounded-lg text-sm font-medium text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 ${
                            errors.meeting_link && touched.meeting_link
                              ? "border-red-500"
                              : "border-green-300"
                          }`}
                        />
                        <ErrorMessage
                          name="meeting_link"
                          component="div"
                          className="text-red-500 text-xs mt-1 font-medium"
                        />
                      </div>
                    )}

                    {selectedCaseAppointment.mode === "in_person" && (
                      <div className="col-span-2 bg-blue-50 rounded-xl p-3 border border-blue-200">
                        <p className="text-xs text-blue-700 font-semibold">Client will visit you in person at the scheduled time.</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCaseAcceptModal(false);
                      setSelectedCaseAppointment(null);
                    }}
                    className="px-6 py-2 bg-slate-100 text-slate-900 rounded-lg font-semibold text-sm hover:bg-slate-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={caseAppointmentProcessingId === selectedCaseAppointment.id || isSubmitting}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg font-semibold text-sm hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-md"
                  >
                    {(caseAppointmentProcessingId === selectedCaseAppointment.id || isSubmitting) && (
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    )}
                    {(caseAppointmentProcessingId === selectedCaseAppointment.id || isSubmitting) ? "Confirming..." : "Confirm"}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      )}

      {/* Case Appointment Reject Modal */}
      {showCaseRejectModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full border border-slate-200 animate-in scale-in-95 duration-300">
            <div className="p-6">
              <div className="flex items-center justify-center w-10 h-10 mx-auto mb-3 bg-red-100 rounded-full">
                <AlertCircle className="text-red-600" size={20} />
              </div>

              <h3 className="text-lg font-bold text-center text-slate-900 mb-2">Reject Case Appointment?</h3>
              <p className="text-center text-slate-600 text-sm mb-6">
                Are you sure you want to reject this case appointment request from <strong>{caseAppointmentToReject?.client_name}</strong>?
              </p>

              <div className="space-y-2">
                <button
                  onClick={() => {
                    setShowCaseRejectModal(false);
                    setCaseAppointmentToReject(null);
                  }}
                  className="w-full px-4 py-2 bg-slate-100 text-slate-900 rounded-lg font-semibold text-sm hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmCaseReject}
                  disabled={caseAppointmentProcessingId === caseAppointmentToReject?.id}
                  className="w-full px-4 py-2 bg-red-600 text-white rounded-lg font-semibold text-sm hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {caseAppointmentProcessingId === caseAppointmentToReject?.id && (
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}
                  {caseAppointmentProcessingId === caseAppointmentToReject?.id ? "Rejecting..." : "Reject"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LawyerAppointment;
