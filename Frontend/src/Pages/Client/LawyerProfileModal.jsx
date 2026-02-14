import React from "react";
import { X, MapPin, Briefcase, Star, CheckCircle2, Phone, Mail, Building2, Calendar } from "lucide-react";

const formatAvailability = (days) => {
  if (!days) return "N/A";
  if (Array.isArray(days)) return days.join(", ") || "N/A";
  if (typeof days === "string") return days;
  return "N/A";
};

const LawyerProfileModal = ({ isOpen, onClose, lawyer }) => {
  if (!isOpen || !lawyer) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-[#0F1A3D]">Lawyer Profile</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100"
            aria-label="Close profile"
          >
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex flex-col sm:flex-row gap-5">
            <div className="shrink-0">
              <img
                src={lawyer.image}
                alt={lawyer.name}
                className="w-24 h-24 rounded-full object-cover border border-gray-200"
              />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-2xl font-bold text-[#0F1A3D]">{lawyer.name}</h3>
                {lawyer.verified && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-yellow-50 border border-yellow-200 text-yellow-700">
                    <CheckCircle2 size={14} className="text-yellow-600" />
                    Verified
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 mt-1">{lawyer.specialization || "General Practice"}</p>

              <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <MapPin size={14} className="text-gray-400" />
                  {lawyer.location || "N/A"}
                </span>
                <span className="flex items-center gap-1">
                  <Briefcase size={14} className="text-gray-400" />
                  {lawyer.experience} yrs
                </span>
                <span className="flex items-center gap-1">
                  <Star size={14} className={lawyer.rating > 0 ? "text-yellow-400 fill-yellow-400" : "text-gray-300"} />
                  {lawyer.rating > 0 ? lawyer.rating.toFixed(1) : "No reviews"}
                </span>
              </div>
            </div>

            <div className="text-right">
              <div className="text-xs text-gray-400">Consultation Fee</div>
              <div className="text-[#0F1A3D] font-bold text-lg">Rs. {Number(lawyer.fee || 0).toLocaleString()}</div>
            </div>
          </div>

          {lawyer.bio && (
            <div>
              <h4 className="text-sm font-semibold text-[#0F1A3D] mb-2">Bio</h4>
              <p className="text-sm text-gray-600 leading-relaxed">{lawyer.bio}</p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2 text-gray-600">
                <Phone size={14} className="text-gray-400" />
                <span>{lawyer.phone || "N/A"}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Mail size={14} className="text-gray-400" />
                <span>{lawyer.email || "N/A"}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin size={14} className="text-gray-400" />
                <span>{lawyer.district || "N/A"}</span>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2 text-gray-600">
                <Building2 size={14} className="text-gray-400" />
                <span>{lawyer.lawFirm || "N/A"}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Briefcase size={14} className="text-gray-400" />
                <span>Bar Council No: {lawyer.barCouncilNumber || "N/A"}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar size={14} className="text-gray-400" />
                <span>Availability: {formatAvailability(lawyer.availabilityDays)}</span>
              </div>
              <div className="text-gray-600 text-sm">
                Available: {lawyer.availableFrom || "N/A"} - {lawyer.availableUntil || "N/A"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LawyerProfileModal;
