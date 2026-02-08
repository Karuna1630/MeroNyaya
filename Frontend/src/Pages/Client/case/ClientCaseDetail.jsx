import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Sidebar from "../sidebar";
import DashHeader from "../ClientDashHeader";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  FileText,
  MessageSquare,
  Calendar,
  ChevronLeft,
  MapPin,
  User,
  Clock,
  Video,
  X,
  AlertCircle,
} from "lucide-react";
import { fetchCases, scheduleCaseAppointment } from "../../slices/caseSlice";
import ClientCaseTimelineCard from "./ClientCaseTimelineCard";
import ClientCaseDocumentCard from "./ClientCaseDocumentCard";
import ClientCaseDetailCard from "./ClientCaseDetailCard";

const ClientCaseDetail = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("Timeline");
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedMeetingType, setSelectedMeetingType] = useState("Video");
  const [selectedDay, setSelectedDay] = useState("Mon");
  const [selectedTime, setSelectedTime] = useState("10:00 AM");
  const [scheduleError, setScheduleError] = useState("");
  const [meetingForm, setMeetingForm] = useState({
    title: "",
    meetingLocation: "",
    phoneNumber: "",
  });

  const { cases, scheduleCaseAppointmentLoading } = useSelector((state) => state.case);
  const caseData = cases?.find((c) => c.id === parseInt(id));
  const hasAssignedLawyer = Boolean(caseData?.lawyer_name || caseData?.lawyer_id || caseData?.lawyer);
  const canScheduleCaseMeeting =
    (caseData?.status === "accepted" || caseData?.status === "in_progress") &&
    hasAssignedLawyer;

    // Fetch case details on component mount
  useEffect(() => {
    dispatch(fetchCases());
  }, [dispatch]);

  // Reset schedule form when case data changes (e.g., when loading new case details)
  const availableDays = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  const timeSlots = ["10:00 AM", "11:00 AM", "12:00 PM", "2:00 PM", "3:00 PM", "4:00 PM"];

  // Function to reset the schedule meeting form to its initial state
  const resetScheduleForm = () => {
    setSelectedMeetingType("Video");
    setSelectedDay("Mon");
    setSelectedTime("10:00 AM");
    setMeetingForm({ title: "", meetingLocation: "", phoneNumber: "" });
    setScheduleError("");
  };

  // Handle changes in the schedule meeting form inputs and update state accordingly
  const handleScheduleChange = (e) => {
    const { name, value } = e.target;
    setMeetingForm((prev) => ({ ...prev, [name]: value }));
    if (scheduleError) {
      setScheduleError("");
    }
  };

  // Function to validate the schedule meeting form inputs before submission
  const validateScheduleForm = () => {
    if (!meetingForm.title.trim()) {
      return "Meeting title is required.";
    }
    if (selectedMeetingType === "In-Person") {
      if (!meetingForm.meetingLocation.trim()) {
        return "Meeting location is required for in-person meetings.";
      }
      if (!meetingForm.phoneNumber.trim()) {
        return "Phone number is required for in-person meetings.";
      }
    }
    return "";
  };
// Handle form submission for scheduling a case meeting, including validation and dispatching the scheduleCaseAppointment action
  const handleScheduleMeeting = async (e) => {
    e.preventDefault();
    if (!caseData?.id) {
      setScheduleError("Case details are not available yet.");
      return;
    }
    if (!canScheduleCaseMeeting) {
      toast.error("Only accepted cases with an assigned lawyer can request appointments.");
      return;
    }
    const error = validateScheduleForm();
    if (error) {
      setScheduleError(error);
      return;
    }

    // Dispatch the scheduleCaseAppointment action with the form data and handle success/error cases
    try {
      await dispatch(
        scheduleCaseAppointment({
          caseId: caseData.id,
          data: {
            title: meetingForm.title.trim(),
            mode: selectedMeetingType === "In-Person" ? "in_person" : "video",
            preferred_day: selectedDay,
            preferred_time: selectedTime,
            meeting_location: meetingForm.meetingLocation,
            phone_number: meetingForm.phoneNumber,
          },
        })
      ).unwrap();

      setShowScheduleModal(false);
      resetScheduleForm();
      setActiveTab("Timeline");
      dispatch(fetchCases());
    } catch (err) {
      setScheduleError("Failed to schedule the meeting. Please try again.");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <DashHeader 
            title="Case Details" 
            subtitle={`CASE-${id}`}
          />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          {/* Back Button */}
          <button 
            onClick={() => navigate('/clientcase')}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors mb-6 text-sm font-medium"
          >
            <ChevronLeft size={18} />
            Back to Cases
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column (Main Content) */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Case Header Card */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <FileText size={24} className="text-slate-700" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider">{`CASE-${id}`}</span>
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase ${
                          caseData?.status === 'completed' ? 'bg-green-50 text-green-600' :
                          caseData?.status === 'in_progress' ? 'bg-blue-50 text-blue-600' :
                          caseData?.status === 'accepted' ? 'bg-amber-50 text-amber-600' :
                          'bg-gray-50 text-gray-600'
                        }`}>{caseData?.status?.replace(/_/g, ' ') || 'Pending'}</span>
                      </div>
                      <h1 className="text-xl font-semibold text-slate-900 leading-tight mb-1">{caseData?.case_title || 'Case Title'}</h1>
                      <p className="text-sm text-slate-500 font-medium">{caseData?.case_category || 'Category'}</p>
                    </div>
                  </div>
                  <button className="flex items-center justify-center gap-2 px-6 py-2.5 bg-[#0f172a] text-white rounded-lg hover:bg-slate-800 transition-all font-medium text-sm shadow-sm group">
                    <MessageSquare size={16} className="group-hover:scale-110 transition-transform" />
                    Message Lawyer
                  </button>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { 
                    label: "Created Date", 
                    value: caseData?.created_at ? new Date(caseData.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A',
                    icon: Calendar, 
                    color: "text-blue-500", 
                    bg: "bg-blue-50" 
                  },
                  { 
                    label: "Next Hearing", 
                    value: caseData?.next_hearing_date ? new Date(caseData.next_hearing_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Not scheduled',
                    icon: Clock, 
                    color: "text-amber-500", 
                    bg: "bg-amber-50" 
                  },
                  { 
                    label: "Documents", 
                    value: `${caseData?.documents?.length || 0} Files`,
                    icon: FileText, 
                    color: "text-slate-500", 
                    bg: "bg-slate-50" 
                  },
                  { 
                    label: "Court", 
                    value: caseData?.court_name || 'Not assigned',
                    icon: MapPin, 
                    color: "text-emerald-500", 
                    bg: "bg-emerald-50" 
                  }
                ].map((stat, i) => (
                  <div key={i} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-3">
                    <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center`}>
                      <stat.icon size={20} className={stat.color} />
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">{stat.label}</p>
                      <p className="text-sm font-semibold text-slate-800 wrap-break-word">{stat.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Tabs & Content */}
              <div className="space-y-6">
                <div className="bg-slate-100/50 p-1 rounded-xl flex gap-1 w-fit">
                  {["Timeline", `Documents (${caseData?.documents?.length || 0})`, "Details"].map((tab) => (
                    <button 
                      key={tab}
                      onClick={() => setActiveTab(tab.includes('Documents') ? 'Documents' : tab)}
                      className={`px-8 py-2 text-sm font-semibold rounded-lg transition-all ${
                        (activeTab === 'Documents' && tab.includes('Documents')) || activeTab === tab ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* Timeline Tab */}
                {activeTab === "Timeline" && (
                  <ClientCaseTimelineCard timeline={caseData?.timeline || []} />
                )}

                {/* Documents Tab */}
                {activeTab === "Documents" && (
                  <ClientCaseDocumentCard 
                    caseId={parseInt(id)} 
                    documents={caseData?.documents || []} 
                  />
                )}

                {/* Details Tab */}
                {activeTab === "Details" && (
                  <ClientCaseDetailCard caseData={caseData} />
                )}
              </div>
            </div>

            {/* Right Column (Sidebar) */}
            <div className="space-y-8">
              
              {/* Lawyer Card */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <User size={18} className="text-blue-600" />
                  Your Lawyer
                </h3>
                
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative">
                    {caseData?.lawyer_name ? (
                      <div className="w-14 h-14 rounded-full bg-slate-100 overflow-hidden border-2 border-white shadow-md">
                        {caseData?.lawyer_profile_image ? (
                          <img src={caseData.lawyer_profile_image} alt={caseData.lawyer_name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-700 font-bold text-lg">
                            {caseData.lawyer_name.charAt(0)}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center border-2 border-white shadow-md">
                        <User size={24} className="text-gray-400" />
                      </div>
                    )}
                    {caseData?.lawyer_name && <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>}
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900">{caseData?.lawyer_name || 'No lawyer assigned yet'}</h4>
                    <p className="text-xs font-medium text-slate-500">{caseData?.case_category || ''}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <button className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-slate-200 rounded-xl hover:bg-slate-50 hover:shadow-md transition-all text-sm font-semibold text-slate-700">
                    <MessageSquare size={16} />
                    Send Message
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!canScheduleCaseMeeting) {
                        toast.error("Only accepted cases with an assigned lawyer can request appointments.");
                        return;
                      }
                      setShowScheduleModal(true);
                      setScheduleError("");
                    }}
                    className={`w-full flex items-center justify-center gap-2 py-3 px-4 border rounded-xl transition-all text-sm font-semibold ${
                      canScheduleCaseMeeting
                        ? "border-slate-200 text-slate-700 hover:bg-slate-50 hover:shadow-md"
                        : "border-slate-200 text-slate-400 cursor-not-allowed bg-slate-50"
                    }`}
                    disabled={!canScheduleCaseMeeting}
                  >
                    <Calendar size={16} />
                    Schedule Meeting
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>

      {showScheduleModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleScheduleMeeting}
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col"
          >
            <div className="bg-[#0F1A3D] px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Schedule Case Meeting</h3>
              <button
                type="button"
                onClick={() => {
                  setShowScheduleModal(false);
                  resetScheduleForm();
                }}
                className="p-1 hover:bg-white/10 rounded-full text-white transition"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              {scheduleError && (
                <div className="mb-4 flex items-start gap-3 rounded-lg bg-red-50 p-4 border border-red-200">
                  <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={18} />
                  <p className="text-sm text-red-700">{scheduleError}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Case</p>
                  <p className="text-base font-semibold text-slate-900 mt-1">
                    {caseData?.case_title || `CASE-${id}`}
                  </p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Meeting Type</p>
                  <p className="text-base font-semibold text-slate-900 mt-1">{selectedMeetingType}</p>
                </div>

                <div className="col-span-2 bg-white rounded-xl p-4 border border-slate-200">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide" htmlFor="title">
                    Meeting Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="title"
                    name="title"
                    type="text"
                    value={meetingForm.title}
                    onChange={handleScheduleChange}
                    placeholder="e.g., Case strategy discussion"
                    className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                <div className="col-span-2">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Meeting Mode</p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { icon: Video, label: "Video", value: "Video" },
                      { icon: MapPin, label: "In-Person", value: "In-Person" },
                    ].map((type) => {
                      const Icon = type.icon;
                      const isSelected = selectedMeetingType === type.value;
                      return (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() => setSelectedMeetingType(type.value)}
                          className={`flex items-center justify-center gap-2 px-3 py-3 rounded-lg transition border text-sm font-semibold ${
                            isSelected
                              ? "bg-slate-900 text-white border-slate-900"
                              : "border-slate-300 text-slate-600 hover:border-slate-400 hover:bg-slate-50"
                          }`}
                        >
                          <Icon size={16} />
                          {type.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {selectedMeetingType === "In-Person" && (
                  <>
                    <div className="bg-white rounded-xl p-4 border border-slate-200">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wide" htmlFor="meetingLocation">
                        Meeting Location <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="meetingLocation"
                        name="meetingLocation"
                        type="text"
                        value={meetingForm.meetingLocation}
                        onChange={handleScheduleChange}
                        placeholder="Enter address or location"
                        className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                      />
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-slate-200">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wide" htmlFor="phoneNumber">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="phoneNumber"
                        name="phoneNumber"
                        type="tel"
                        value={meetingForm.phoneNumber}
                        onChange={handleScheduleChange}
                        placeholder="Enter your phone number"
                        className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                      />
                    </div>
                  </>
                )}

                <div className="col-span-2">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Select Day</p>
                  <div className="grid grid-cols-5 gap-2">
                    {availableDays.map((day) => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => setSelectedDay(day)}
                        className={`px-2 py-2 rounded-lg text-xs font-semibold transition ${
                          selectedDay === day
                            ? "bg-slate-900 text-white"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="col-span-2">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Preferred Time</p>
                  <div className="grid grid-cols-2 gap-2">
                    {timeSlots.map((time) => (
                      <button
                        key={time}
                        type="button"
                        onClick={() => setSelectedTime(time)}
                        className={`px-3 py-2 rounded-lg text-xs font-semibold transition border ${
                          selectedTime === time
                            ? "bg-slate-900 text-white border-slate-900"
                            : "border-slate-300 text-slate-600 hover:border-slate-400 hover:bg-slate-50"
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowScheduleModal(false);
                  resetScheduleForm();
                }}
                className="px-6 py-2 rounded-lg text-sm font-semibold border border-slate-300 text-slate-700 hover:bg-slate-100 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={scheduleCaseAppointmentLoading}
                className="px-6 py-2 rounded-lg text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {scheduleCaseAppointmentLoading ? "Scheduling..." : "Schedule Meeting"}
              </button>
            </div>
          </form>
        </div>
      )}
      <ToastContainer />
    </div>
  );
};

export default ClientCaseDetail;
