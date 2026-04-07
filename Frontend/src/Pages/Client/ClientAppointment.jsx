import React, { useEffect, useMemo, useState } from "react";
import Sidebar from "./sidebar";
import DashHeader from "./ClientDashHeader";
import { useTranslation } from "react-i18next";
import { 
  Calendar, 
  Video, 
  Phone, 
  MapPin, 
  Eye, 
  MessageSquare, 
  RotateCw, 
  Clock,
  Play,
  DollarSign,
  X,
  Star
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMyAppointments } from "../slices/appointmentSlice";
import { initiateEsewaPayment, initiateKhaltiPayment } from "../slices/paymentSlice";
import { redirectToEsewa } from "../../utils/esewaRedirect";
import { fetchCaseAppointments } from "../slices/caseSlice";
import { getImageUrl } from '../../utils/imageUrl';
import Pagination from "../../components/Pagination";
import RatingModal from "../../components/RatingModal";
import { createReview } from "../../axios/reviewAPI";
import { toast } from "react-toastify";

const ClientAppointment = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  
  const [activeTab, setActiveTab] = useState("Upcoming");
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [appointmentToPay, setAppointmentToPay] = useState(null);
  const [paymentError, setPaymentError] = useState("");
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("esewa");
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  // Rating State
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingContext, setRatingContext] = useState(null);

  const { appointments = [], appointmentsLoading, appointmentsError } = useSelector(
    (state) => state.appointment || {} 
  );
  const { caseAppointments = [], caseAppointmentsLoading } = useSelector(
    (state) => state.case || {}
  );
  const { initiating: esewaInitiating } = useSelector(
    (state) => state.payment || {}
  );
  const { khaltiInitiating } = useSelector(
    (state) => state.payment || {}
  );

  useEffect(() => {
    dispatch(fetchMyAppointments());
    dispatch(fetchCaseAppointments());
  }, [dispatch]);

  // Merge consultation appointments and case appointments
  const allAppointments = useMemo(() => {
    const consultationAppts = appointments.map(appt => ({
      ...appt,
      appointmentType: appt?.consultation_details?.case_reference ? 'case' : 'consultation'
    }));
    
    const caseAppts = caseAppointments.map(appt => ({
      ...appt,
      appointmentType: 'case',
      is_rated: appt.is_rated, // Keep is_rated at top level for Star icon
      caseId: appt.case,       // Keep caseId at top level for handleRateClick
      consultation_details: {
        lawyer: {
          id: appt.lawyer,
          name: appt.lawyer_name,
          profile_image: appt.lawyer_profile_image
        },
        case_reference: {
          id: appt.case,
          title: appt.case_title,
          category: appt.case_category
        },
        title: appt.title,
        mode: appt.mode,
        meeting_location: appt.meeting_location,
        phone_number: appt.phone_number,
        meeting_link: appt.meeting_link,
        requested_day: appt.preferred_day,
        requested_time: appt.preferred_time,
      },
      scheduled_date: appt.scheduled_date,
      scheduled_time: appt.scheduled_time,
      payment_status: 'paid'
    }));
    
    return [...consultationAppts, ...caseAppts];
  }, [appointments, caseAppointments]);

  const upcomingAppointments = useMemo(() => {
    return allAppointments.filter((item) => ["pending", "confirmed"].includes(item.status));
  }, [allAppointments]);

  const completedAppointments = useMemo(() => {
    return allAppointments.filter((item) => item.status === "completed");
  }, [allAppointments]);

  const displayAppointments = activeTab === "Upcoming" ? upcomingAppointments : completedAppointments;

  const paginatedAppointments = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return displayAppointments.slice(start, start + itemsPerPage);
  }, [displayAppointments, currentPage]);

  const totalPages = Math.ceil(displayAppointments.length / itemsPerPage);

  const totalCount = allAppointments.length;
  const caseCount = allAppointments.filter(item => item.appointmentType === 'case').length;
  const consultationCount = allAppointments.filter(item => item.appointmentType === 'consultation').length;

  const handleRateClick = (item) => {
    if (item.is_rated) return;
    
    // For appointment ratings, only send appointment_id (not caseId)
    setRatingContext({
      appointmentId: item.appointmentType === 'consultation' ? item.id : null,
      lawyerId: item.consultation_details?.lawyer?.id,
      lawyerName: item.consultation_details?.lawyer?.name,
      caseId: item.appointmentType === 'case' ? item.caseId : null
    });
    setShowRatingModal(true);
  };

  const handleRatingSubmit = async (ratingData) => {
    try {
      await createReview(
        ratingContext.lawyerId,
        ratingData.rating,
        ratingData.comment,
        null, // No Title
        ratingContext.appointmentId,
        ratingContext.caseId
      );
      
      toast.success("Thank you for your rating!");
      setShowRatingModal(false);
      setRatingContext(null);
      
      // Refresh data to update is_rated status
      dispatch(fetchMyAppointments());
      dispatch(fetchCaseAppointments());
    } catch (error) {
      // reviewAPI.js wraps backend errors in new Error(), so use .message
      const errorMessage = error.message || "Failed to submit rating";
      toast.error(errorMessage);
      throw error;
    }
  };

  const getModeIcon = (mode) => {
    switch (mode) {
      case "video": return <Video size={16} className="text-blue-500" />;
      case "phone": return <Phone size={16} className="text-teal-500" />;
      case "in_person": return <MapPin size={16} className="text-indigo-500" />;
      default: return <Clock size={16} className="text-gray-500" />;
    }
  };

  const getModeLabel = (mode) => {
    switch (mode) {
      case "video": return "Video Call";
      case "phone": return "Phone Call";
      case "in_person": return "In-Person";
      default: return "N/A";
    }
  };

  const formatLocalTime = (timeStr) => {
    if (!timeStr) return "N/A";
    try {
      const [hours, minutes] = timeStr.split(':');
      if (hours && minutes) {
        const date = new Date();
        date.setHours(parseInt(hours, 10));
        date.setMinutes(parseInt(minutes, 10));
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
      return timeStr;
    } catch {
      return timeStr;
    }
  };

  const getStatusLabel = (item) => {
    if (item.status === "completed") return "Completed";
    if (item.status === "cancelled") return "Cancelled";
    return "Confirmed";
  };

  const handleOpenPayment = (appointment) => {
    setAppointmentToPay(appointment);
    setPaymentError("");
    setSelectedPaymentMethod("esewa");
    setShowPaymentModal(true);
  };

  const handleJoinMeeting = (meetingLink) => {
    if (!meetingLink) {
      toast.error("Meeting link is not available yet.");
      return;
    }

    try {
      const parsedUrl = new URL(meetingLink);
      window.open(parsedUrl.toString(), "_blank", "noopener,noreferrer");
    } catch {
      toast.error("Invalid meeting link.");
    }
  };

  const getMeetingLink = (appointment) => {
    const rawLink = appointment?.meeting_link || appointment?.consultation_details?.meeting_link || "";
    return typeof rawLink === "string" ? rawLink.trim() : rawLink;
  };

  const normalizePaymentStatus = (status) =>
    typeof status === "string" ? status.trim().toLowerCase() : "";

  const isPaymentPending = (appointment) =>
    appointment?.appointmentType !== "case" &&
    normalizePaymentStatus(appointment?.payment_status) === "pending";

  const isPaymentCompleted = (appointment) =>
    appointment?.appointmentType === "case" || !isPaymentPending(appointment);

  const handleConfirmPayment = () => {
    if (!appointmentToPay?.id) return;
    setPaymentLoading(true);
    
    const action = selectedPaymentMethod === "khalti" ? initiateKhaltiPayment : initiateEsewaPayment;
    
    dispatch(action(appointmentToPay.id)).then((res) => {
      setPaymentLoading(false);
      if (!res?.error) {
        setShowPaymentModal(false);
        if (selectedPaymentMethod === "khalti") {
          window.location.href = res.payload.khalti_payment_url;
        } else {
          redirectToEsewa(res.payload.esewa_url, res.payload.params);
        }
      } else {
        setPaymentError(res?.payload || "Payment initiation failed.");
      }
    });
  };

  const actionButtonBaseClass = "h-9 min-w-[96px] px-3 inline-flex items-center justify-center gap-1.5 rounded-lg text-sm font-semibold transition shadow-sm whitespace-nowrap";

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <DashHeader title="Appointments" subtitle="Your consultation history" />

        <div className="flex-1 p-8 overflow-y-auto">
          {/* Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Total Appointments */}
            <div className="relative overflow-hidden rounded-2xl p-6 text-white shadow-lg bg-linear-to-br from-indigo-500 to-purple-600 ring-1 ring-indigo-500/20">
              <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10" />
              <div className="absolute -right-2 -bottom-6 h-20 w-20 rounded-full bg-white/5" />
              <div className="relative z-10 flex flex-col items-center justify-center text-center">
                <span className="text-4xl font-extrabold mb-1">{totalCount}</span>
                <span className="text-sm font-medium text-white/70 uppercase tracking-wider">Total Appointments</span>
              </div>
            </div>

            {/* Case Related */}
            <div className="relative overflow-hidden rounded-2xl p-6 text-white shadow-lg bg-linear-to-br from-amber-500 to-orange-500 ring-1 ring-amber-500/20">
              <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10" />
              <div className="absolute -right-2 -bottom-6 h-20 w-20 rounded-full bg-white/5" />
              <div className="relative z-10 flex flex-col items-center justify-center text-center">
                <span className="text-4xl font-extrabold mb-1">{caseCount}</span>
                <span className="text-sm font-medium text-white/70 uppercase tracking-wider">Case Related</span>
              </div>
            </div>

            {/* Consultations */}
            <div className="relative overflow-hidden rounded-2xl p-6 text-white shadow-lg bg-linear-to-br from-emerald-500 to-teal-600 ring-1 ring-emerald-500/20">
              <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10" />
              <div className="absolute -right-2 -bottom-6 h-20 w-20 rounded-full bg-white/5" />
              <div className="relative z-10 flex flex-col items-center justify-center text-center">
                <span className="text-4xl font-extrabold mb-1">{consultationCount}</span>
                <span className="text-sm font-medium text-white/70 uppercase tracking-wider">Direct Consults</span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-6 flex bg-slate-100 p-1 rounded-xl w-fit">
            {["Upcoming", "Completed"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-8 py-2 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === tab ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-200">
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Type</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Lawyer</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Topic</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Date/Time</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Mode</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Status</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Payment</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedAppointments.map((item) => {
                    const consultation = item.consultation_details || {};
                    const lawyer = consultation.lawyer || {};
                    const meetingLink = getMeetingLink(item);
                    const paymentLabel = item.appointmentType === "case" || !isPaymentPending(item) ? "Paid" : "Unpaid";
                    const canShowJoinButton =
                      activeTab === "Upcoming" &&
                      consultation.mode === "video" &&
                      item.status === "confirmed" &&
                      isPaymentCompleted(item);
                    return (
                      <tr key={`${item.appointmentType}-${item.id}`} className="hover:bg-slate-50/50">
                        <td className="px-6 py-5">
                          <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase border ${
                            item.appointmentType === 'case' ? "bg-purple-50 text-purple-600 border-purple-100" : "bg-blue-50 text-blue-600 border-blue-100"
                          }`}>
                            {item.appointmentType}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <img src={getImageUrl(lawyer.profile_image, lawyer.name)} className="w-8 h-8 rounded-full object-cover" alt="" />
                            <span className="text-sm font-semibold">{lawyer.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <span className="text-sm font-medium line-clamp-1">{consultation.title}</span>
                        </td>
                        <td className="px-6 py-5">
                          <div className="text-sm font-medium">{item.scheduled_date || consultation.requested_day}</div>
                          <div className="text-xs text-slate-500 font-semibold mt-0.5">{formatLocalTime(item.scheduled_time || consultation.requested_time)}</div>
                        </td>
                        <td className="px-6 py-5">{getModeIcon(consultation.mode)}</td>
                        <td className="px-6 py-5">
                          <span className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase border ${
                            item.status === 'completed'
                              ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                              : item.status === 'confirmed'
                              ? "bg-blue-50 text-blue-600 border-blue-100"
                              : item.status === 'cancelled' || item.status === 'rejected'
                              ? "bg-red-50 text-red-600 border-red-100"
                              : "bg-amber-50 text-amber-600 border-amber-100"
                          }`}>
                            {getStatusLabel(item)}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <span className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase border ${
                            paymentLabel === "Paid"
                              ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                              : "bg-amber-50 text-amber-600 border-amber-100"
                          }`}>
                            {paymentLabel}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center justify-end gap-2">
                            {activeTab === "Completed" && (
                              <button
                                onClick={() => handleRateClick(item)}
                                className={`p-2 rounded-full transition ${
                                  item.is_rated 
                                    ? "text-amber-400 cursor-default" 
                                    : "text-slate-300 hover:text-amber-400 hover:bg-amber-50"
                                }`}
                                title={item.is_rated ? "Rated" : "Rate Lawyer"}
                              >
                                <Star size={20} fill={item.is_rated ? "currentColor" : "none"} />
                              </button>
                            )}
                            <button 
                              onClick={() => setSelectedAppointment(item)} 
                              className={`${actionButtonBaseClass} bg-[#0F1A3D] text-white hover:bg-slate-800`}
                            >
                              View
                            </button>
                            {canShowJoinButton && (
                              <button
                                onClick={() => handleJoinMeeting(meetingLink)}
                                className={`${actionButtonBaseClass} ${
                                  meetingLink
                                    ? "bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 shadow-none"
                                    : "bg-slate-100 text-slate-500 hover:bg-slate-200 border border-slate-200 shadow-none"
                                }`}
                                title={meetingLink ? "Join Meeting" : "Waiting for lawyer meeting link"}
                              >
                                <Play size={14} fill="currentColor" />
                                Join
                              </button>
                            )}
                            {activeTab === "Upcoming" && isPaymentPending(item) && (
                              <button
                                onClick={() => handleOpenPayment(item)}
                                className={`${actionButtonBaseClass} bg-emerald-600 text-white hover:bg-emerald-700`}
                              >
                                Pay
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {displayAppointments.length > 0 && (
              <div className="p-4 border-t border-slate-200">
                <Pagination 
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  itemsPerPage={itemsPerPage}
                  totalItems={displayAppointments.length}
                />
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modals */}
      {selectedAppointment && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden">
             <div className="bg-[#0F1A3D] p-4 text-white flex justify-between items-center">
                <h2 className="font-bold">Appointment Details</h2>
                <button onClick={() => setSelectedAppointment(null)}><X size={20}/></button>
             </div>
             <div className="p-6 space-y-4">
                {selectedAppointment.consultation_details?.mode === "video" &&
                  isPaymentCompleted(selectedAppointment) && (
                  <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                    <p className="text-xs font-bold text-blue-700 uppercase">Meeting Link</p>
                    {!getMeetingLink(selectedAppointment) && (
                      <p className="text-xs text-slate-600 mt-1">Lawyer has not shared the meeting link yet.</p>
                    )}
                    <button
                      onClick={() => handleJoinMeeting(getMeetingLink(selectedAppointment))}
                      className={`mt-2 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition ${
                        getMeetingLink(selectedAppointment)
                          ? "bg-blue-600 text-white hover:bg-blue-700"
                          : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                      }`}
                    >
                      <Play size={16} />
                      Join Meeting
                    </button>
                  </div>
                )}
                <div className="flex items-center gap-4">
                   <img src={getImageUrl(selectedAppointment.consultation_details?.lawyer?.profile_image)} className="w-16 h-16 rounded-full" alt=""/>
                   <div>
                      <h3 className="font-bold text-lg">{selectedAppointment.consultation_details?.lawyer?.name}</h3>
                      <p className="text-slate-500">{selectedAppointment.consultation_details?.title}</p>
                   </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div className="p-3 bg-slate-50 rounded-xl">
                      <p className="text-xs font-bold text-slate-500 uppercase">Date</p>
                      <p className="font-semibold">{selectedAppointment.scheduled_date || selectedAppointment.consultation_details?.requested_day}</p>
                   </div>
                   <div className="p-3 bg-slate-50 rounded-xl">
                      <p className="text-xs font-bold text-slate-500 uppercase">Time</p>
                      <p className="font-semibold">{selectedAppointment.scheduled_time || selectedAppointment.consultation_details?.requested_time}</p>
                   </div>
                </div>
             </div>
             <div className="p-4 bg-slate-50 border-t flex justify-end">
                <button onClick={() => setSelectedAppointment(null)} className="px-6 py-2 bg-slate-900 text-white rounded-lg font-bold text-sm">Close</button>
             </div>
          </div>
        </div>
      )}

      {showRatingModal && ratingContext && (
        <RatingModal
          isOpen={showRatingModal}
          lawyerName={ratingContext.lawyerName}
          lawyerId={ratingContext.lawyerId}
          onClose={() => setShowRatingModal(false)}
          onSubmit={handleRatingSubmit}
        />
      )}

      {showPaymentModal && appointmentToPay && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => {
            if (!paymentLoading) {
              setShowPaymentModal(false);
              setAppointmentToPay(null);
              setPaymentError("");
            }
          }}
        >
          <div className="bg-white rounded-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Confirm Payment</h2>
              <button
                onClick={() => {
                  if (!paymentLoading) {
                    setShowPaymentModal(false);
                    setAppointmentToPay(null);
                    setPaymentError("");
                  }
                }}
                className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition"
                aria-label="Close payment modal"
              >
                <X size={18} />
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between font-medium">
                <span>Consultation Fee</span>
                <span>Rs. {appointmentToPay.consultation_details?.lawyer?.consultation_fee}</span>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => setSelectedPaymentMethod("esewa")}
                  className={`flex-1 p-3 border-2 rounded-xl transition ${selectedPaymentMethod === "esewa" ? "border-green-500 bg-green-50" : "border-slate-100"}`}
                >
                  eSewa
                </button>
                <button 
                  onClick={() => setSelectedPaymentMethod("khalti")}
                  className={`flex-1 p-3 border-2 rounded-xl transition ${selectedPaymentMethod === "khalti" ? "border-purple-500 bg-purple-50" : "border-slate-100"}`}
                >
                  Khalti
                </button>
              </div>
              {paymentError && <p className="text-red-500 text-sm">{paymentError}</p>}
              <button 
                onClick={handleConfirmPayment}
                disabled={paymentLoading}
                className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold disabled:opacity-50"
              >
                {paymentLoading ? "Processing..." : "Confirm Payment"}
              </button>
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setAppointmentToPay(null);
                  setPaymentError("");
                }}
                disabled={paymentLoading}
                className="w-full py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition disabled:opacity-50"
              >
                Back
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientAppointment;
