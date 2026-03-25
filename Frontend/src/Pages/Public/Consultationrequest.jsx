import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useFormik } from "formik";
import { useNavigate } from "react-router-dom";
import { AlertCircle, CheckCircle, MapPin, Video, X } from "lucide-react";
import { toast } from "react-toastify";
import AuthGate from "../utils/AuthGate.jsx";
import { createConsultation } from "../slices/consultationSlice.js";
import { getConsultationValidationSchema } from "../utils/consultationValidation.js";

const Consultationrequest = ({ lawyer, user }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { createLoading } = useSelector((state) => state.consultation || {});

  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedConsultationType, setSelectedConsultationType] = useState("Video");
  const [selectedDay, setSelectedDay] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [bookingError, setBookingError] = useState("");

  const currentMode = selectedConsultationType === "In-Person" ? "in_person" : "video";
  const validationSchema = getConsultationValidationSchema(currentMode);

  // Convert various backend error shapes into a friendly string
  const normalizeErrorMessage = (payloadErr) => {
    if (!payloadErr) return null;
    if (typeof payloadErr === "string") return payloadErr;
    const rt = payloadErr.requested_time;
    if (Array.isArray(rt) && rt.length) return rt[0];
    if (typeof rt === "string") return rt;
    if (payloadErr.detail) return payloadErr.detail;
    if (payloadErr.ErrorMessage) {
      if (typeof payloadErr.ErrorMessage === "string") return payloadErr.ErrorMessage;
      if (Array.isArray(payloadErr.ErrorMessage) && payloadErr.ErrorMessage.length) return payloadErr.ErrorMessage[0];
    }
    return null;
  };

  const formik = useFormik({
    initialValues: {
      title: "",
      meetingLocation: "",
      phoneNumber: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      if (!lawyer?.id) return;

      setBookingError("");

      const modeMap = {
        Video: "video",
        "In-Person": "in_person",
      };

      const payload = {
        lawyer_id: lawyer.id,
        mode: modeMap[selectedConsultationType] || "video",
        requested_day: selectedDayEffective,
        requested_time: selectedTimeEffective,
        title: values.title,
        meeting_location: values.meetingLocation,
        phone_number: values.phoneNumber,
      };

      dispatch(createConsultation(payload)).then((res) => {
        if (!res?.error) {
          closeBookingModal();
          const role = (user?.user_type || user?.role || "").toLowerCase();
          if (role === "client") {
            navigate("/client/consultation");
          }
        } else {
          const payloadErr = res?.payload;
          const message = normalizeErrorMessage(payloadErr) || "This time is already requested. Try another slot.";
          setBookingError(message);
          toast.error(message);
        }
      });
    },
    validateOnChange: true,
    validateOnBlur: true,
  });

  const closeBookingModal = () => {
    setShowBookingModal(false);
    setSelectedDay("");
    setSelectedTime("");
    setSelectedConsultationType("Video");
    setBookingError("");
    formik.resetForm();
  };

  useEffect(() => {
    // Clear in-person fields when switching consultation type to avoid stale data
    formik.setFieldValue("meetingLocation", "");
    formik.setFieldValue("phoneNumber", "");
    formik.setFieldTouched("meetingLocation", false);
    formik.setFieldTouched("phoneNumber", false);
    // We intentionally depend only on selectedConsultationType to avoid re-running on every render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedConsultationType]);

  const consultationTypes = [
    { icon: Video, label: "Video", value: "Video" },
    { icon: MapPin, label: "In-Person", value: "In-Person" },
  ];

  // Normalize availability from KYC: days may be full names; map to abbreviations for UI and payload
  const daysFromKyc = Array.isArray(lawyer?.availabilityDays) ? lawyer.availabilityDays : [];
  const availableDays = daysFromKyc.length
    ? daysFromKyc
        .map((d) => (typeof d === "string" && d.length > 2 ? d.slice(0, 3) : d || ""))
        .filter(Boolean)
    : ["Mon", "Tue", "Wed", "Thu", "Fri"];

  const toMinutes = (timeStr) => {
    if (!timeStr) return null;
    const [h, m] = timeStr.split(":").map((v) => parseInt(v, 10));
    if (Number.isNaN(h) || Number.isNaN(m)) return null;
    return h * 60 + m;
  };

  const to12Hour = (minutes) => {
    if (minutes == null) return null;
    const h24 = Math.floor(minutes / 60);
    const m = minutes % 60;
    const suffix = h24 >= 12 ? "PM" : "AM";
    const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
    const mm = m.toString().padStart(2, "0");
    return `${h12}:${mm} ${suffix}`;
  };

  const buildTimeSlots = () => {
    const startMin = toMinutes(lawyer?.availableFrom);
    const endMin = toMinutes(lawyer?.availableUntil);
    if (startMin == null || endMin == null || endMin <= startMin) {
      return ["10:00 AM", "11:00 AM", "12:00 PM", "2:00 PM", "3:00 PM", "4:00 PM"];
    }
    const slots = [];
    // Use 2-hour slots per request
    for (let t = startMin; t <= endMin; t += 120) {
      const label = to12Hour(t);
      if (label) slots.push(label);
    }
    return slots.length ? slots : ["10:00 AM", "11:00 AM", "12:00 PM", "2:00 PM", "3:00 PM", "4:00 PM"];
  };

  const timeSlots = buildTimeSlots();

  const selectedDayEffective = selectedDay || (availableDays[0] || "");
  const selectedTimeEffective = selectedTime || (timeSlots[0] || "");

  if (!lawyer) return null;

  return (
    <>
      <div className="lg:col-span-4">
        <div className="lg:sticky lg:top-24 space-y-6">
          {/* Consultation Booking Card */}
          <div className="bg-white border border-slate-200 rounded-lg p-8">
            <div className="mb-6">
              <p className="text-sm text-slate-600 mb-1">Consultation Fee</p>
              <p className="text-3xl font-bold text-slate-900">
                Rs. {lawyer?.fee?.toLocaleString()}
              </p>
            </div>

            {/* Consultation Type Selection */}
            <div className="mb-6 pb-6 border-b border-slate-200">
              <p className="text-sm font-semibold text-slate-900 mb-3">Consultation Type</p>
              <div className="grid grid-cols-3 gap-3">
                {consultationTypes.map((type) => {
                  const Icon = type.icon;
                  const isSelected = selectedConsultationType === type.value;
                  return (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setSelectedConsultationType(type.value)}
                      className={`flex flex-col items-center gap-2 px-3 py-3 rounded-lg transition border ${
                        isSelected
                          ? "bg-slate-900 text-white border-slate-900"
                          : "border-slate-300 text-slate-600 hover:border-slate-400 hover:bg-slate-50"
                      }`}
                    >
                      <Icon size={18} />
                      <span className="text-xs font-semibold">{type.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Day Selection */}
            <div className="mb-6 pb-6 border-b border-slate-200">
              <p className="text-sm font-semibold text-slate-900 mb-3">Select Day</p>
              <div className="grid grid-cols-5 gap-2">
                {availableDays.map((day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => setSelectedDay(day)}
                    className={`px-2 py-2 rounded-lg text-xs font-semibold transition ${
                      selectedDayEffective === day
                        ? "bg-slate-900 text-white"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>

            {/* Time Slot Selection */}
            <div className="mb-6">
              <p className="text-sm font-semibold text-slate-900 mb-3">Available Times</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-64 overflow-y-auto pr-1">
                {timeSlots.map((time) => (
                  <button
                    key={time}
                    type="button"
                    onClick={() => setSelectedTime(time)}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold transition border text-center ${
                      selectedTimeEffective === time
                        ? "bg-slate-900 text-white border-slate-900"
                        : "border-slate-300 text-slate-600 hover:border-slate-400 hover:bg-slate-50"
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>

            {/* Book Now Button */}
            <AuthGate>
              <button
                type="button"
                onClick={() => setShowBookingModal(true)}
                className="w-full px-4 py-3 rounded-lg text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 transition mb-2"
              >
                Book Consultation
              </button>
            </AuthGate>

            {/* Cancellation Policy */}
            <p className="text-xs text-slate-600 text-center">
              Free cancellation up to 24 hours before consultation
            </p>
          </div>

          {/* Help Card */}
          <div className="bg-white border border-slate-200 rounded-lg p-6">
            <h3 className="font-semibold text-slate-900 mb-2">Need Help?</h3>
            <p className="text-sm text-slate-600 mb-4">
              Send a message to get more information about the lawyer's services.
            </p>
            <AuthGate>
              <button
                type="button"
                className="w-full px-4 py-2 rounded-lg text-sm font-semibold border border-slate-300 text-slate-700 hover:bg-slate-50 transition"
              >
                Send Message
              </button>
            </AuthGate>
          </div>

          {/* Verification Banner */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <CheckCircle size={18} className="text-blue-600 fill-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-blue-900 text-sm mb-1">Verified Lawyer</p>
                <p className="text-xs text-blue-700">
                  All information and credentials have been verified by our team.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            onSubmit={formik.handleSubmit}
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col"
          >
            <div className="bg-[#0F1A3D] px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Confirm Your Booking</h3>
              <button
                type="button"
                onClick={closeBookingModal}
                className="p-1 hover:bg-white/10 rounded-full text-white transition"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              {bookingError && (
                <div className="mb-4 flex items-start gap-3 rounded-lg bg-red-50 p-4 border border-red-200">
                  <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={18} />
                  <p className="text-sm text-red-700">{bookingError}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Lawyer</p>
                  <p className="text-base font-semibold text-slate-900 mt-1">
                    {lawyer?.name}
                  </p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Consultation Type</p>
                  <p className="text-base font-semibold text-slate-900 mt-1">
                    {selectedConsultationType}
                  </p>
                </div>

                <div className="col-span-2 bg-white rounded-xl p-4 border border-slate-200">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide" htmlFor="title">
                    Consultation Topic <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="title"
                    name="title"
                    type="text"
                    value={formik.values.title}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="e.g., Property dispute, Contract review, Divorce case"
                    className={`mt-2 w-full rounded-lg border px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 ${
                      formik.touched.title && formik.errors.title
                        ? "border-red-300 focus:ring-red-500"
                        : "border-slate-200 focus:ring-slate-900"
                    }`}
                  />
                  {formik.touched.title && formik.errors.title && (
                    <p className="mt-1 text-xs text-red-500">{formik.errors.title}</p>
                  )}
                </div>

                {selectedConsultationType === "In-Person" && (
                  <>
                    <div className="bg-white rounded-xl p-4 border border-slate-200">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wide" htmlFor="meetingLocation">
                        Meeting Location <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="meetingLocation"
                        name="meetingLocation"
                        type="text"
                        value={formik.values.meetingLocation}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        placeholder="Enter address or location (e.g., Kathmandu, Nepal)"
                        className={`mt-2 w-full rounded-lg border px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 ${
                          formik.touched.meetingLocation && formik.errors.meetingLocation
                            ? "border-red-300 focus:ring-red-500"
                            : "border-slate-200 focus:ring-slate-900"
                        }`}
                      />
                      {formik.touched.meetingLocation && formik.errors.meetingLocation && (
                        <p className="mt-1 text-xs text-red-500">{formik.errors.meetingLocation}</p>
                      )}
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-slate-200">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wide" htmlFor="phoneNumber">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="phoneNumber"
                        name="phoneNumber"
                        type="tel"
                        value={formik.values.phoneNumber}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        placeholder="Enter your phone number (e.g., +977 9800000000 or 9800000000)"
                        className={`mt-2 w-full rounded-lg border px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 ${
                          formik.touched.phoneNumber && formik.errors.phoneNumber
                            ? "border-red-300 focus:ring-red-500"
                            : "border-slate-200 focus:ring-slate-900"
                        }`}
                      />
                      {formik.touched.phoneNumber && formik.errors.phoneNumber && (
                        <p className="mt-1 text-xs text-red-500">{formik.errors.phoneNumber}</p>
                      )}
                    </div>
                  </>
                )}

                <div className="bg-white rounded-xl p-4 border border-slate-200">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Date & Time</p>
                  <p className="text-base font-semibold text-slate-900 mt-1">
                    {selectedDayEffective}, {selectedTimeEffective}
                  </p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-slate-200">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Fee</p>
                  <p className="text-base font-semibold text-slate-900 mt-1">
                    Rs. {lawyer?.fee?.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex gap-2 justify-end">
              <button
                type="button"
                  onClick={closeBookingModal}
                className="px-6 py-2 rounded-lg text-sm font-semibold border border-slate-300 text-slate-700 hover:bg-slate-100 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createLoading || !formik.isValid}
                className="px-6 py-2 rounded-lg text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {createLoading ? "Submitting..." : "Request Consultation"}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};

export default Consultationrequest;
