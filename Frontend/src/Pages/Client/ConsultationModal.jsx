import React, { useState } from "react";
import { X, Video, MapPin } from "lucide-react";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const times = [
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "2:00 PM",
  "3:00 PM",
  "4:00 PM",
];

const ConsultationModal = ({ isOpen, onClose, lawyer }) => {
const [consultType, setConsultType] = useState("Video");
  const [selectedDay, setSelectedDay] = useState("Mon");
  const [selectedTime, setSelectedTime] = useState("10:00 AM");

  if (!isOpen || !lawyer) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-[#0F1A3D]">
            Book Consultation
          </h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">

          {/* Consultation Fee */}
          <div>
            <p className="text-sm text-gray-500">Consultation Fee</p>
            <h3 className="text-2xl font-bold text-[#0F1A3D]">
              Rs. {(lawyer.consultation_fee || 0).toLocaleString()}
            </h3>

            <span className="inline-block mt-2 px-3 py-1 text-xs rounded-full bg-green-100 text-green-700 font-medium">
              Available
            </span>
          </div>

          {/* Consultation Type */}
          <div>
            <p className="text-sm font-medium text-[#0F1A3D] mb-3">
              Consultation Type
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setConsultType("Video")}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border text-sm font-medium transition
                  ${
                    consultType === "Video"
                      ? "bg-[#0F1A3D] text-white border-[#0F1A3D]"
                      : "bg-gray-50 text-gray-600 border-gray-200"
                  }`}
              >
                <Video size={16} />
                Video
              </button>

              <button
                onClick={() => setConsultType("In-Person")}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border text-sm font-medium transition
                  ${
                    consultType === "In-Person"
                      ? "bg-[#0F1A3D] text-white border-[#0F1A3D]"
                      : "bg-gray-50 text-gray-600 border-gray-200"
                  }`}
              >
                <MapPin size={16} />
                In-Person
              </button>
            </div>
          </div>

          {/* Select Day */}
          <div>
            <p className="text-sm font-medium text-[#0F1A3D] mb-3">
              Select Day
            </p>

            <div className="flex gap-2 flex-wrap">
              {days.map((day) => (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition
                    ${
                      selectedDay === day
                        ? "bg-[#0F1A3D] text-white border-[#0F1A3D]"
                        : "bg-gray-50 text-gray-600 border-gray-200"
                    }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          {/* Available Times */}
          <div>
            <p className="text-sm font-medium text-[#0F1A3D] mb-3">
              Available Times
            </p>

            <div className="grid grid-cols-2 gap-3">
              {times.map((time) => (
                <button
                  key={time}
                  onClick={() => setSelectedTime(time)}
                  className={`py-2 rounded-lg text-sm font-medium border transition
                    ${
                      selectedTime === time
                        ? "bg-[#0F1A3D] text-white border-[#0F1A3D]"
                        : "bg-gray-50 text-gray-600 border-gray-200"
                    }`}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>

          {/* Book Button */}
          <button
            className="w-full py-3 bg-[#0F1A3D] text-white rounded-lg font-semibold hover:bg-[#1a2b5a] transition"
          >
            Book Consultation
          </button>

          <p className="text-xs text-gray-400 text-center">
            Free cancellation up to 24 hours before consultation
          </p>

        </div>
      </div>
    </div>
  );
};
export default ConsultationModal