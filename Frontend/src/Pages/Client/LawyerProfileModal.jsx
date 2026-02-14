import React from "react";
import { X, MapPin, Briefcase, Star, CheckCircle2 } from "lucide-react";

const formatAvailability = (days) => {
  if (!days) return "N/A";
  if (Array.isArray(days)) return days.join(", ") || "N/A";
  if (typeof days === "string") return days;
  return "N/A";
};

const getCategories = (specialization) => {
  if (!specialization) return [];
  if (Array.isArray(specialization)) return specialization.filter(Boolean);
  if (typeof specialization === "string") {
    return specialization
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
};

const LawyerProfileModal = ({ isOpen, onClose, lawyer }) => {
  if (!isOpen || !lawyer) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white w-full max-w-3xl min-h-100 rounded-2xl shadow-2xl overflow-hidden">
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
          <div className="flex flex-col lg:flex-row lg:items-start gap-6">
            <div className="flex items-start gap-5 flex-1">
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
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs bg-[#0F1A3D] text-white">
                      <CheckCircle2 size={14} className="text-white" />
                      Verified
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <Briefcase size={14} className="text-gray-400" />
                    {lawyer.experience} years
                  </span>
                  <span className="flex items-center gap-1">
                    <Star size={14} className={lawyer.rating > 0 ? "text-yellow-400 fill-yellow-400" : "text-gray-300"} />
                    {lawyer.rating > 0 ? lawyer.rating.toFixed(1) : "No reviews"}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin size={14} className="text-gray-400" />
                    {lawyer.location || "N/A"}
                  </span>
                </div>
              </div>
            </div>

            <div className="lg:text-right">
              <div className="text-[#0F1A3D] font-bold text-2xl">Rs. {Number(lawyer.fee || 0).toLocaleString()}</div>
              <div className="text-sm text-gray-500">per consultation</div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-[#0F1A3D]">About</h4>
            <p className="text-sm text-[#0F1A3D] leading-relaxed">
              {lawyer.bio || "No bio available yet."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-[#0F1A3D]">Case Categories</h4>
              <div className="flex flex-wrap gap-2">
                {getCategories(lawyer.specialization).length > 0 ? (
                  getCategories(lawyer.specialization).map((item) => (
                    <span
                      key={item}
                      className="px-3 py-1 rounded-full text-xs bg-[#0F1A3D] text-white"
                    >
                      {item}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-[#0F1A3D]">General Practice</span>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-[#0F1A3D]">Availability</h4>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-full text-xs border border-[#0F1A3D] text-[#0F1A3D]">
                  {formatAvailability(lawyer.availabilityDays)}
                </span>
                <span className="px-3 py-1 rounded-full text-xs border border-[#0F1A3D] text-[#0F1A3D]">
                  {lawyer.availableFrom || "N/A"} - {lawyer.availableUntil || "N/A"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LawyerProfileModal;
