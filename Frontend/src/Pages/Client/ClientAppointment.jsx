import React, { useEffect, useMemo, useState } from "react";
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
  Play,
  DollarSign,
  X
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMyAppointments, payAppointment } from "../slices/appointmentSlice";
import { fetchCaseAppointments } from "../slices/caseSlice";

const ClientAppointment = () => {
  const [activeTab, setActiveTab] = useState("Upcoming");
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [appointmentToPay, setAppointmentToPay] = useState(null);
  const [paymentError, setPaymentError] = useState("");
  const [paymentLoading, setPaymentLoading] = useState(false);
  const dispatch = useDispatch();
  const { appointments = [], appointmentsLoading, appointmentsError } = useSelector(
    (state) => state.appointment || {} 
  );
  const { caseAppointments = [], caseAppointmentsLoading } = useSelector(
    (state) => state.case || {}
  );

  useEffect(() => {
    dispatch(fetchMyAppointments());
    dispatch(fetchCaseAppointments());
  }, [dispatch]);

  // Merge consultation appointments and case appointments
  const allAppointments = useMemo(() => {
    const consultationAppts = appointments.map(appt => ({
      ...appt,
      appointmentType: 'consultation'
    }));
    const caseAppts = caseAppointments.map(appt => ({
      ...appt,
      appointmentType: 'case',
      // Transform case appointment structure to match consultation structure
      consultation_details: {
        lawyer: {
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
        requested_time: appt.preferred_time
      },
      scheduled_date: appt.scheduled_date,
      scheduled_time: appt.scheduled_time,
      payment_status: 'paid' // Case appointments don't require payment
    }));
    return [...consultationAppts, ...caseAppts];
  }, [appointments, caseAppointments]);

  const upcomingAppointments = useMemo(() => {
    return allAppointments.filter((item) => ["pending", "confirmed", "rescheduled"].includes(item.status));
  }, [allAppointments]);

  const completedAppointments = useMemo(() => {
    return allAppointments.filter((item) => item.status === "completed");
  }, [allAppointments]);

  const displayAppointments = activeTab === "Upcoming" ? upcomingAppointments : completedAppointments;

  const getModeIcon = (mode) => {
    switch (mode) {
      case "video":
        return <Video size={16} className="text-blue-500" />;
      case "phone":
        return <Phone size={16} className="text-teal-500" />;
      case "in_person":
        return <MapPin size={16} className="text-indigo-500" />;
      default:
        return <Clock size={16} className="text-gray-500" />;
    }
  };

  const getModeLabel = (mode) => {
    switch (mode) {
      case "video":
        return "Video Call";
      case "phone":
        return "Phone Call";
      case "in_person":
        return "In-Person";
      default:
        return "N/A";
    }
  };

  const getProfileImageUrl = (profileImage, lawyerName = "Lawyer") => {
    return profileImage || `https://ui-avatars.com/api/?name=${lawyerName}&background=0F1A3D&color=fff`;
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "pending":
        return "Upcoming";
      case "confirmed":
        return "Confirmed";
      case "rescheduled":
        return "Rescheduled";
      case "completed":
        return "Completed";
      case "cancelled":
        return "Cancelled";
      default:
        return "Upcoming";
    }
  };

  const handleOpenPayment = (appointment) => {
    setAppointmentToPay(appointment);
    setPaymentError("");
    setShowPaymentModal(true);
  };

  const handleConfirmPayment = () => {
    if (!appointmentToPay?.id) return;
    setPaymentLoading(true);
    setPaymentError("");
    dispatch(payAppointment(appointmentToPay.id)).then((res) => {
      setPaymentLoading(false);
      if (!res?.error) {
        setShowPaymentModal(false);
        setAppointmentToPay(null);
        dispatch(fetchMyAppointments());
      } else {
        setPaymentError(res?.payload || "Payment failed. Please try again.");
      }
    });
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
              <span className="text-4xl font-bold text-emerald-500 mb-1">{upcomingAppointments.length}</span>
              <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">Upcoming</span>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
              <span className="text-4xl font-bold text-slate-700 mb-1">{completedAppointments.length}</span>
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
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Lawyer</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Case/Title</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date & Time</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Mode</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Payment</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(appointmentsLoading || caseAppointmentsLoading) && (
                    <tr>
                      <td colSpan="8" className="px-6 py-12 text-center text-slate-500">
                        Loading appointments...
                      </td>
                    </tr>
                  )}
                  {!appointmentsLoading && !caseAppointmentsLoading && appointmentsError && (
                    <tr>
                      <td colSpan="8" className="px-6 py-12 text-center text-red-500">
                        {appointmentsError}
                      </td>
                    </tr>
                  )}
                  {!appointmentsLoading && !caseAppointmentsLoading && !appointmentsError && displayAppointments.map((item) => {
                    const consultation = item.consultation_details || {};
                    const lawyer = consultation.lawyer || {};
                    const caseRef = consultation.case_reference || {};
                    const dateValue = item.scheduled_date || consultation.requested_day;
                    const timeValue = item.scheduled_time || consultation.requested_time;
                    const modeValue = consultation.mode;
                    const meetingLink = consultation.meeting_link;
                    const isConfirmed = item.status === 'confirmed';
                    const isCaseAppointment = item.appointmentType === 'case';
                    return (
                      <tr key={`${item.appointmentType}-${item.id}`} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-5">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase border ${
                          isCaseAppointment
                            ? "bg-purple-50 text-purple-600 border-purple-100"
                            : "bg-blue-50 text-blue-600 border-blue-100"
                        }`}>
                          {isCaseAppointment ? "Case" : "Consult"}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <img 
                              src={getProfileImageUrl(lawyer.profile_image, lawyer.name)} 
                              alt={lawyer.name || "Lawyer"} 
                            className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-sm"
                          />
                            <span className="font-semibold text-slate-900 text-sm tracking-tight">{lawyer.name || "Lawyer"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-[#0F1A3D]">{isCaseAppointment ? (caseRef.category || consultation.title) : (consultation.title || "Appointment")}</span>
                            <span className="text-xs text-slate-500 font-medium">{isCaseAppointment ? caseRef.title : consultation.title}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2 text-slate-700">
                            <Calendar size={14} className="text-slate-400" />
                              <span className="text-sm font-medium">{dateValue || "N/A"}</span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-500 mt-1">
                            <Clock size={14} className="text-slate-400" />
                              <span className="text-xs">{timeValue || "N/A"}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-full w-fit border border-slate-100 shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)]">
                            {getModeIcon(modeValue)}
                            <span className="text-xs font-semibold text-slate-700">{getModeLabel(modeValue)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span 
                          className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase border ${
                              item.status === "pending" || item.status === "confirmed" || item.status === "rescheduled"
                              ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                              : "bg-slate-100 text-slate-600 border-slate-200"
                          }`}
                        >
                            {getStatusLabel(item.status)}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        {modeValue === "in_person" ? (
                          <span className="bg-amber-50 text-amber-600 border border-amber-100 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase">
                            In Hand
                          </span>
                        ) : item.payment_status === "paid" ? (
                          <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase">
                            Paid
                          </span>
                        ) : (
                          <span className="bg-rose-50 text-rose-600 border border-rose-100 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase">
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => setSelectedAppointment(item)}
                            className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-700 transition-all duration-200"
                            title="View Details"
                          >
                            <Eye size={18} />
                          </button>
                            {modeValue === "video" && meetingLink && activeTab === "Upcoming" && isConfirmed && (
                              <a
                                href={meetingLink}
                                target="_blank"
                                rel="noreferrer"
                                className="p-2 bg-[#0F1A3D] text-white rounded-full hover:bg-blue-950 transition-all duration-200 shadow-md"
                                title="Join meeting"
                              >
                                <Play size={16} fill="white" />
                              </a>
                            )}
                            {modeValue === "video" && activeTab === "Upcoming" && !isCaseAppointment && item.payment_status !== "paid" && (
                              <button
                                type="button"
                                onClick={() => handleOpenPayment(item)}
                                className="p-2 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 transition-all duration-200 shadow-md"
                                title="Pay now"
                              >
                                <DollarSign size={16} />
                              </button>
                            )}
                        </div>
                      </td>
                    </tr>
                  );
                  })}
                  {!appointmentsLoading && !caseAppointmentsLoading && !appointmentsError && displayAppointments.length === 0 && (
                    <tr>
                      <td colSpan="8" className="px-6 py-12 text-center text-slate-500">
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

      {/* Appointment Details Modal */}
      {selectedAppointment && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-100 max-h-[85vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="bg-[#0F1A3D] px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Appointment Details</h2>
              <button
                onClick={() => setSelectedAppointment(null)}
                className="p-1 hover:bg-white/10 rounded-full text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content - Scrollable */}
            <div className="p-6 overflow-y-auto flex-1">
              <div className="grid grid-cols-2 gap-4">
                {/* Appointment Type Badge */}
                <div className="col-span-2">
                  <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold uppercase ${
                    selectedAppointment.appointmentType === 'case'
                      ? "bg-purple-50 text-purple-600 border border-purple-200"
                      : "bg-blue-50 text-blue-600 border border-blue-200"
                  }`}>
                    {selectedAppointment.appointmentType === 'case' ? 'Case Appointment' : 'Consultation Appointment'}
                  </span>
                </div>

                {/* Lawyer Info - Full Width */}
                <div className="col-span-2 bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-3">Lawyer</label>
                  <div className="flex items-center gap-3">
                    <img 
                      src={getProfileImageUrl(selectedAppointment.consultation_details?.lawyer?.profile_image, selectedAppointment.consultation_details?.lawyer?.name)} 
                      alt={selectedAppointment.consultation_details?.lawyer?.name || "Lawyer"} 
                      className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md"
                    />
                    <div>
                      <p className="font-bold text-slate-900">{selectedAppointment.consultation_details?.lawyer?.name || "Lawyer"}</p>
                      <p className="text-xs text-slate-500 font-medium">{selectedAppointment.consultation_details?.title || "Consultation"}</p>
                    </div>
                  </div>
                </div>

                {/* Date */}
                <div className="bg-white rounded-xl p-4 border border-slate-200">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-2">Date</label>
                  <div className="flex items-center gap-2 text-slate-700">
                    <Calendar size={16} className="text-[#0F1A3D]" />
                    <span className="font-semibold text-sm">
                      {selectedAppointment.scheduled_date || selectedAppointment.consultation_details?.requested_day || "N/A"}
                    </span>
                  </div>
                </div>

                {/* Time */}
                <div className="bg-white rounded-xl p-4 border border-slate-200">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-2">Time</label>
                  <div className="flex items-center gap-2 text-slate-700">
                    <Clock size={16} className="text-[#0F1A3D]" />
                    <span className="font-semibold text-sm">
                      {selectedAppointment.scheduled_time || selectedAppointment.consultation_details?.requested_time || "N/A"}
                    </span>
                  </div>
                </div>

                {/* Mode */}
                <div className="bg-white rounded-xl p-4 border border-slate-200">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-2">Mode</label>
                  <div className="flex items-center gap-2">
                    {getModeIcon(selectedAppointment.consultation_details?.mode)}
                    <span className="font-semibold text-sm text-slate-700">{getModeLabel(selectedAppointment.consultation_details?.mode)}</span>
                  </div>
                </div>

                {/* Payment Status */}
                <div className="bg-white rounded-xl p-4 border border-slate-200">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-2">Payment</label>
                  {selectedAppointment.appointmentType === 'case' ? (
                    <span className="inline-flex px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-600 border border-purple-200">
                      No Payment
                    </span>
                  ) : selectedAppointment.consultation_details?.mode === "in_person" ? (
                    <span className="inline-flex px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-600 border border-amber-200">
                      In Hand
                    </span>
                  ) : selectedAppointment.payment_status === "paid" ? (
                    <span className="inline-flex px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
                      Paid
                    </span>
                  ) : (
                    <span className="inline-flex px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-600 border border-rose-200">
                      Pending
                    </span>
                  )}
                </div>

                {/* Meeting Location - Only for In-Person */}
                {selectedAppointment.consultation_details?.mode === "in_person" && (
                  <div className="col-span-2 bg-blue-50 rounded-xl p-4 border border-blue-200">
                    <label className="text-xs font-bold text-blue-700 uppercase tracking-wide block mb-2">Meeting Location</label>
                    <div className="flex items-center gap-2 text-blue-900">
                      <MapPin size={16} className="text-blue-600" />
                      <span className="font-semibold text-sm">
                        {selectedAppointment.consultation_details?.meeting_location || "Not specified"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-blue-900 mt-2">
                      <Phone size={16} className="text-blue-600" />
                      <span className="font-semibold text-sm">
                        {selectedAppointment.consultation_details?.phone_number || "Not provided"}
                      </span>
                    </div>
                  </div>
                )}

                {/* Meeting Link for confirmed appointments */}
                {selectedAppointment.status === 'confirmed' && 
                 selectedAppointment.consultation_details?.mode === 'video' && 
                 selectedAppointment.consultation_details?.meeting_link && (
                  <div className="col-span-2 bg-emerald-50 rounded-xl p-4 border border-emerald-200">
                    <label className="text-xs font-bold text-emerald-700 uppercase tracking-wide block mb-2">Meeting Link</label>
                    <a
                      href={selectedAppointment.consultation_details.meeting_link}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm font-semibold text-emerald-700 hover:text-emerald-900 underline break-all"
                    >
                      {selectedAppointment.consultation_details.meeting_link}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-end gap-2">
              {selectedAppointment.status === 'confirmed' && 
               selectedAppointment.consultation_details?.mode === 'video' && 
               selectedAppointment.consultation_details?.meeting_link && (
                <a
                  href={selectedAppointment.consultation_details.meeting_link}
                  target="_blank"
                  rel="noreferrer"
                  className="px-6 py-2 bg-[#0F1A3D] text-white rounded-lg font-semibold text-sm hover:bg-blue-950 transition-colors shadow-md flex items-center gap-2"
                >
                  <Play size={16} fill="white" />
                  Join Meeting
                </a>
              )}
              <button
                onClick={() => setSelectedAppointment(null)}
                className="px-6 py-2 bg-slate-900 text-white rounded-lg font-semibold text-sm hover:bg-slate-800 transition-colors shadow-md"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Confirmation Modal */}
      {showPaymentModal && appointmentToPay && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-100 overflow-hidden flex flex-col">
            <div className="bg-[#0F1A3D] px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Confirm Payment</h2>
              <button
                type="button"
                onClick={() => {
                  setShowPaymentModal(false);
                  setAppointmentToPay(null);
                  setPaymentError("");
                }}
                className="p-1 hover:bg-white/10 rounded-full text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              {paymentError && (
                <div className="mb-4 flex items-start gap-3 rounded-lg bg-red-50 p-4 border border-red-200">
                  <span className="text-sm text-red-700 font-semibold">{paymentError}</span>
                </div>
              )}

              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Lawyer</p>
                <p className="text-base font-semibold text-slate-900 mt-1">
                  {appointmentToPay.consultation_details?.lawyer?.name || "Lawyer"}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {appointmentToPay.consultation_details?.title || "Consultation"}
                </p>
              </div>
              <div className="mt-4 bg-white rounded-xl p-4 border border-slate-200">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Amount</p>
                <p className="text-lg font-bold text-slate-900 mt-1">
                  Rs. {appointmentToPay.consultation_details?.lawyer?.consultation_fee?.toLocaleString() || "0"}
                </p>
              </div>
            </div>

            <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowPaymentModal(false);
                  setAppointmentToPay(null);
                  setPaymentError("");
                }}
                className="px-6 py-2 bg-slate-100 text-slate-900 rounded-lg font-semibold text-sm hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmPayment}
                disabled={paymentLoading}
                className="px-6 py-2 bg-emerald-600 text-white rounded-lg font-semibold text-sm hover:bg-emerald-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {paymentLoading ? "Processing..." : "Confirm Payment"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientAppointment;
