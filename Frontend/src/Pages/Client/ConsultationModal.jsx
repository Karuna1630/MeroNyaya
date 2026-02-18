import React, { useState } from "react";
import { X, Calendar, Clock, MessageSquare } from "lucide-react";


const ConsultationModal = ({ isOpen, onClose, lawyer }) => {
const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");

  if (!isOpen || !lawyer) return null;

  const handleSubmit = () => {
    console.log({
      lawyerId: lawyer.id,
      date,
      time,
      notes,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-[#0F1A3D]">
            Request Consultation
          </h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">

          {/* Lawyer Info */}
          <div className="flex items-center gap-4">
            <img
              src={lawyer.profile_image}
              alt={lawyer.name}
              className="w-14 h-14 rounded-full object-cover"
            />
            <div>
              <p className="font-semibold text-[#0F1A3D]">{lawyer.name}</p>
              <p className="text-sm text-gray-500">
                Rs. {(lawyer.consultation_fee || 0).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="text-sm font-medium text-[#0F1A3D] flex items-center gap-2 mb-2">
              <Calendar size={16} />
              Select Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0F1A3D]"
            />
          </div>

          {/* Time */}
          <div>
            <label className="text-sm font-medium text-[#0F1A3D] flex items-center gap-2 mb-2">
              <Clock size={16} />
              Select Time
            </label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0F1A3D]"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="text-sm font-medium text-[#0F1A3D] flex items-center gap-2 mb-2">
              <MessageSquare size={16} />
              Additional Notes
            </label>
            <textarea
              rows="3"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Briefly describe your issue..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0F1A3D]"
            />
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            className="w-full py-2.5 bg-[#0F1A3D] text-white rounded-lg font-semibold hover:bg-[#1a2b5a] transition"
          >
            Confirm Consultation
          </button>

        </div>
      </div>
    </div>
  );
};
export default ConsultationModal